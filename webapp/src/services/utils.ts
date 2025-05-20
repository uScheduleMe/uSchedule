import { ApiVersion } from '@services/types';

/**
 * Replace parameterized pieces in an API path with their values.
 * i.e. Replace `/courses/{id}` with `/courses/5294`
 * @param endpoint The endpoint string to replace the parameters within
 * @param params the map of parameter names to their values
 * @throws an Error if a parameter key is not found in the params map
 * @returns the endpoint string with the parameter keys replaced with their values
 */
const interpolateEndpointParams = (
  endpoint: string,
  params: Record<string, string | number> = {},
): string =>
  endpoint.replace(/\{([^}]*)\}/gi, (_, key) => {
    const param_value = params[key].toString();
    if (!param_value) {
      throw new Error('Missing parameter value');
    }
    return param_value;
  });

/**
 * Join the paths for a URL and ensure there is a leading and trailing slash '/'
 */
const joinPath = (...paths: string[]) => {
  const joint = paths
    .flatMap((p) => p.split('/'))
    .filter(Boolean) // Remove empty segments caused be double separators '//'
    .join('/');
  return `/${joint}/`;
};

export const expandEndpoint = (
  endpoint: string,
  ep_params: Record<string, string | number> = {},
  apiVersion: ApiVersion = ApiVersion.V3,
) => interpolateEndpointParams(joinPath(apiVersion, endpoint), ep_params);

/** @deprecated use expandEndpoint for new routes with the v3 pattern */
export const legacyExpandEndpoint = (
  api_root: string,
  endpoint: string,
  apiVersion: ApiVersion,
  ep_params: Record<string, string | number> = {},
): string => interpolateEndpointParams(joinPath(api_root, apiVersion, endpoint), ep_params);
