import { JWSHeaderParameters, JWTPayload } from 'jose';

if (!process.env.SERVICE_NAME) {
  throw new Error('The "SERVICE_NAME" environment variable must be set');
}

/**
 * A utility function used to base64 encode a token component (body or header)
 * @param component an object representing the contents of the component
 */
export function encodeTokenComponent(component: JWSHeaderParameters | JWTPayload): string {
  return Buffer.from(JSON.stringify(component), 'utf-8').toString('base64').replace(/=/g, '');
}

/**
 * Creates a JWT without a valid signature
 * @param body an object representing the contents of the body
 * @param header an object representing the contents of the header
 */
export function createUnsignedToken(body: JWTPayload, header: JWSHeaderParameters = {}): string {
  const components = [
    encodeTokenComponent(header),
    encodeTokenComponent(body),
    encodeTokenComponent({}),
  ];
  return components.join('.');
}

const SERVICE_TOKEN: string = createUnsignedToken({
  client_id: 'auth', // Hard code to 'auth' so we can create users without changing the DA
  scopes: ['service'],
});

/**
 * Returns the service token used for authorization of requests made to other services
 */
export function getServiceToken(): string {
  return SERVICE_TOKEN;
}
