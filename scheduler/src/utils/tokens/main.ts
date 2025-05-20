import {
  JWTPayload,
  KeyLike,
  ProtectedHeaderParameters,
  SignJWT,
  decodeProtectedHeader,
  importJWK,
  jwtVerify,
} from 'jose';
import crypto from 'crypto';
import { SECRET_DEF, SecretService } from '@services/Secret';
import ApiError from '@utils/errors/ApiError';
import StatusCodes from '@utils/StatusCodes';
import { CookieOptions } from 'express';
import {
  ACCESS_TOKEN_LIFESPAN,
  ALG,
  AUD,
  CSRF_MAX_CHECK_VALUES,
  CSRF_SIZE_BYTES,
  ISS,
  REFRESH_TOKEN_LIFESPAN,
  TYP,
} from './constants';
import {
  JwtContent,
  Rsa256PrivateJwk,
  Rsa256PublicJwk,
  TokenSet,
  jwt_header_schema,
  jwt_payload_schema,
  rsa256_private_jwk_schema,
  rsa256_public_jwk_schema,
} from './schemas';
import { ZodError, z } from 'zod';
import { COMMON_1100, COMMON_1101, COMMON_1102, HTTP_500 } from '@utils/api_responses';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

/**
 * The private key, in the JWK format, used to sign tokens
 */
let private_key_jwk: Rsa256PrivateJwk | null = null;

/**
 * A list of public keys, in the JWK format, used to verify tokens
 */
let public_keys_jwk: Rsa256PublicJwk[] | null = null;

/**
 * A utility function used to remove the existing private key so that it can be replaced
 */
export const clearPrivateKeys = (): void => {
  private_key_jwk = null;
};

/**
 * A utility function used to remove the existing public key so that it can be replaced
 */
export const clearPublicKeys = (): void => {
  public_keys_jwk = null;
};

/**
 * The default options for the cookie used to send the access token
 */
export const ACCESS_COOKIE_CONFIG: CookieOptions = {
  httpOnly: true, // to disable accessing cookie via client side js
  secure: process.env.USE_SECURE_TOKEN_COOKIES === 'true', // to force https or not
  maxAge: 31536000000, // ttl in milliseconds for one year (remove this option and cookie will die when browser is closed)
  signed: false,
  path: process.env.TOKEN_COOKIE_SCOPE ?? '/',
  sameSite: 'lax',
};

/**
 * The default options for the cookie used to send the refresh token
 */
export const REFRESH_COOKIE_CONFIG = {
  ...ACCESS_COOKIE_CONFIG,
  path: process.env.REFRESH_COOKIE_SCOPE ?? '/',
};

/**
 * The default options for the cookie used to send the csrf token
 */
export const CSRF_COOKIE_CONFIG = { ...ACCESS_COOKIE_CONFIG, httpOnly: false, path: '/' };

/**
 * Returns the private key, in JWK format, which is Lazy-loaded from the AWS Parameter Store
 * @throws an error if the key was not able to be retrieved or parsed successfully
 */
export function getPrivateJwk(): Rsa256PrivateJwk {
  if (!private_key_jwk) {
    const jwk_str = SecretService.getSecret(SECRET_DEF.TOKEN_PRIVATE_KEY);

    if (jwk_str) {
      try {
        private_key_jwk = rsa256_private_jwk_schema.parse(JSON.parse(jwk_str));
      } catch (error: unknown) {
        logger.debug('An error occurred while parsing the private key', { error });
      }
    }
  }

  if (!private_key_jwk) {
    logger.error('An error occurred while retrieving the private key');
    throw new ApiError(HTTP_500, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return private_key_jwk;
}

/**
 * Returns the public key list, in JWK format, which is Lazy-loaded from the AWS Parameter Store
 * @throws an error if the keys were not able to be retrieved or parsed successfully
 */
export function getPublicJwks(): Rsa256PublicJwk[] {
  if (!public_keys_jwk) {
    const jwks_str = SecretService.getSecret(SECRET_DEF.TOKEN_PUBLIC_KEYS);

    if (jwks_str) {
      try {
        public_keys_jwk = rsa256_public_jwk_schema.array().parse(JSON.parse(jwks_str));
      } catch (error: unknown) {
        logger.debug('An error occurred while parsing the public keys', { error });
      }
    }
  }

  if (!public_keys_jwk) {
    logger.error('An error occurred while retrieving the public keys');
    throw new ApiError(HTTP_500, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return public_keys_jwk;
}

/**
 * Gets a public from the list, looking up the key by the key id
 * @throws a key error if the key is not in the list
 * @param kid the ID of the key to be returned
 */
export function getPublicJwk(kid: string): Rsa256PublicJwk {
  const keys = getPublicJwks();
  const key = keys.find((k) => k.kid === kid);
  if (!key) {
    throw new ApiError(
      { ...COMMON_1102, message: 'Invalid Key ID used to sign the token' },
      StatusCodes.UNAUTHORIZED,
    );
  }
  return key;
}

/**
 * Creates a CSRF token and converts it into a string using hexadecimal encoding
 * @param size the size of the csrf token in bytes
 */
export const generateCsrfToken = (size: number = CSRF_SIZE_BYTES): string =>
  crypto.randomBytes(size).toString('hex');

/**
 * Creates and signs a Jason Web Token and, optionally, embeds and returns a corresponding csrf token
 * @throws a Missing sub error if the sub is an empty string
 * @param sub the subject of the token (i.e. user id)
 * @param scopes the scopes of the token (i.e. permission roles)
 * @param lifespan the life span of the token, used to calculate the expiration time (i.e. 1h or 14d)
 * @param should_generate_csrf whether or not to generate and embed a csrf token
 */
export async function createToken(
  sub: string,
  scopes: string[],
  lifespan: string,
  should_generate_csrf: true,
): Promise<TokenSet>;
export async function createToken(
  sub: string,
  scopes: string[],
  lifespan: string,
  should_generate_csrf: false,
): Promise<string>;
export async function createToken(
  sub: string,
  scopes: string[],
  lifespan: string = '1h',
  should_generate_csrf: boolean = true,
): Promise<TokenSet | string> {
  if (!sub) {
    throw new ApiError(
      { ...COMMON_1100, message: 'A user ID is required to generate a sign-in token' },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
  const private_jwk = getPrivateJwk();
  const private_key = await importJWK(private_jwk, private_jwk.alg);

  const payload: JWTPayload = {
    scopes,
    client_id: 'webapp',
  };

  let csrf = '';
  if (should_generate_csrf) {
    payload.csrf = csrf = generateCsrfToken();
  }

  const header = {
    alg: private_jwk.alg,
    kid: private_jwk.kid,
    typ: TYP,
  };

  const jwt = await new SignJWT(payload)
    .setAudience(AUD)
    .setExpirationTime(lifespan)
    .setIssuedAt()
    .setIssuer(ISS)
    .setProtectedHeader(header)
    .setSubject(sub)
    .sign(private_key);

  return should_generate_csrf ? { jwt, csrf } : jwt;
}

/**
 * Creates a token configured to be used as an access token, including a csrf token
 * @param sub the subject of the token (i.e. user id)
 * @param scopes the scopes of the token (i.e. permission roles)
 */
export async function createAccessToken(
  sub: string,
  scopes: string[] = ['profile'],
): Promise<TokenSet> {
  return await createToken(sub, scopes, ACCESS_TOKEN_LIFESPAN, true);
}

/**
 * Creates a token configured to be used as a refresh token
 * @param sub the subject of the token (i.e. user id)
 * @param scopes the scopes of the token (i.e. permission roles)
 */
export async function createRefreshToken(
  sub: string,
  scopes: string[] = ['refresh'],
): Promise<string> {
  return await createToken(sub, scopes, REFRESH_TOKEN_LIFESPAN, false);
}

/**
 * Verifies a jwt, specifically verifying the signature, scopes, algorithms, type, issuer, audience and, if provided, a csrf token
 * @throws a Token Error if the token is missing or invalid
 * @throws a Key Error if the public key cannot be found using the kid in the token
 * @throws a CSRF Error if there is a csrf token provided that is invalid
 * @throws a Scope Error if the token does not contain the provided scopes
 * @param jwt the token to verify
 * @param csrf a csrf token to verify that it matches the csrf in the jwt.  If csrf check is not required, set this value to `null`
 * @param required_scopes a list of scopes to verify exist in the token
 */
export async function verify(
  jwt: string,
  csrf: string[] | string | null,
  required_scopes: string[] = [],
): Promise<JwtContent> {
  let unverified_header: ProtectedHeaderParameters, public_key: KeyLike | Uint8Array;

  try {
    unverified_header = decodeProtectedHeader(jwt);
  } catch (e: unknown) {
    throw new ApiError(
      { ...COMMON_1100, message: 'Invalid or Missing token' },
      StatusCodes.UNAUTHORIZED,
      e,
    );
  }

  const public_jwk = getPublicJwk(unverified_header.kid ?? '');

  try {
    public_key = await importJWK(public_jwk);
  } catch (e: unknown) {
    throw new ApiError(
      { ...COMMON_1102, message: 'Invalid public key' },
      StatusCodes.UNAUTHORIZED,
      e,
    );
  }

  try {
    const jwd_data = await jwtVerify(jwt, public_key, {
      algorithms: [ALG],
      typ: TYP,
      issuer: ISS,
      audience: AUD,
    });

    const payload = jwt_payload_schema.parse(jwd_data.payload);
    const header = jwt_header_schema.parse(jwd_data.protectedHeader);

    // If the csrf is not null, make sure the token's csrf claim matches it
    if (csrf !== null) {
      try {
        z.union([z.array(z.string().min(1)).min(1), z.string().min(1)]).parse(csrf);
      } catch (e: unknown) {
        throw new ApiError(
          { ...COMMON_1101, message: 'CSRF Token is Missing' },
          StatusCodes.UNAUTHORIZED,
          e,
        );
      }

      const is_array = Array.isArray(csrf);
      if (is_array && csrf.length > CSRF_MAX_CHECK_VALUES) {
        throw new ApiError(
          { ...COMMON_1101, message: 'CSRF Token Limit Exceeded' },
          StatusCodes.UNAUTHORIZED,
        );
      }

      const is_csrf_mismatched =
        !payload.csrf ||
        (is_array && !csrf.includes(payload.csrf)) ||
        (!is_array && csrf !== payload.csrf);

      if (is_csrf_mismatched) {
        throw new ApiError(
          { ...COMMON_1101, message: 'CSRF Token Mismatch' },
          StatusCodes.UNAUTHORIZED,
        );
      }
    }

    if (
      required_scopes.length &&
      (!payload.scopes.length || !required_scopes.every((s: string) => payload.scopes.includes(s)))
    ) {
      throw new ApiError(
        { ...COMMON_1100, message: 'The token does not have a valid scope for this action' },
        StatusCodes.UNAUTHORIZED,
      );
    }

    return { payload, header };
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      throw new ApiError(
        { ...COMMON_1100, message: 'The Token Header or Body is malformed' },
        StatusCodes.UNAUTHORIZED,
      );
    } else if (e instanceof Error) {
      throw new ApiError(
        { ...COMMON_1100, title: e.name, message: e.message },
        StatusCodes.UNAUTHORIZED,
        e,
      );
    }
    logger.error('An unexpected error occurred while validating a token.');
    throw new Error('An unexpected error has occurred');
  }
}
