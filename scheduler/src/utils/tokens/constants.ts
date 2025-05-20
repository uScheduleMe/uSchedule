/**
 * The issuer value to use when creating tokens
 */
export const ISS = process.env.ISSUER ?? 'uschedule.me';

/**
 * The algorithm value to use when creating tokens
 */
export const ALG = 'RS256';

/**
 * The audience value to use when creating tokens
 */
export const AUD = process.env.ENV ?? 'dev';

/**
 * The type value to use when creating tokens
 */
export const TYP = 'JWT';

/**
 * The lifespan of an access token
 */
export const ACCESS_TOKEN_LIFESPAN = process.env.ACCESS_TOKEN_LIFESPAN ?? '1h';

/**
 * The lifespan of a refresh token
 */
export const REFRESH_TOKEN_LIFESPAN = process.env.REFRESH_TOKEN_LIFESPAN ?? '14d';

/**
 * The size, in bytes, of the CSRF token
 */
export const CSRF_SIZE_BYTES = 16;

/**
 * The maximum number of CSRF tokens that can be checked in one verify request
 */
export const CSRF_MAX_CHECK_VALUES = 1;
