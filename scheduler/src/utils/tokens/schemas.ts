import { z } from 'zod';

export const rsa256_private_jwk_schema = z.object({
  alg: z.literal('RS256'),
  kid: z.string(),
  kty: z.literal('RSA'),
  n: z.string(),
  e: z.string(),
  d: z.string(),
  p: z.string(),
  q: z.string(),
  dp: z.string(),
  dq: z.string(),
  qi: z.string(),
});

export const rsa256_public_jwk_schema = z.object({
  alg: z.literal('RS256'),
  kid: z.string(),
  kty: z.literal('RSA'),
  n: z.string(),
  e: z.string(),
});

export type Rsa256PrivateJwk = z.infer<typeof rsa256_private_jwk_schema>;
export type Rsa256PublicJwk = z.infer<typeof rsa256_public_jwk_schema>;

export const jwt_payload_schema = z.object({
  scopes: z.string().array(),
  client_id: z.string(),
  // Optional, since refresh tokens don't have csrf tokens embedded
  csrf: z.string().optional(),
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  iss: z.string(),
  sub: z.string().uuid(),
});

export const jwt_header_schema = z.object({
  alg: z.literal('RS256'),
  kid: z.string(),
  typ: z.literal('JWT'),
});

export type JwtPayload = z.infer<typeof jwt_payload_schema>;
export type JwtHeader = z.infer<typeof jwt_header_schema>;

export const token_set_schema = z.object({
  jwt: z.string(),
  csrf: z.string(),
});

export type TokenSet = z.infer<typeof token_set_schema>;

export const jwt_content_schema = z.object({
  header: jwt_header_schema,
  payload: jwt_payload_schema,
});

export type JwtContent = z.infer<typeof jwt_content_schema>;
