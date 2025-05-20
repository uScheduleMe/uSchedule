process.env.SERVICE_NAME = 'test';
import { expect } from 'chai';
import { createUnsignedToken, encodeTokenComponent, getServiceToken } from './utils';

describe('tokens/utils', () => {
  const token_head = {
    alg: 'RSA256',
  };
  const token_head_base_64 = 'eyJhbGciOiJSU0EyNTYifQ';
  const token_body = {
    sub: 'FEED-DEAD-BEEF',
    scopes: ['profile'],
  };
  const token_body_base_64 = 'eyJzdWIiOiJGRUVELURFQUQtQkVFRiIsInNjb3BlcyI6WyJwcm9maWxlIl19';
  const empty_token_component_base_64 = 'e30'; // Empty token component base64 encoded: {}
  const unsigned_token = `${token_head_base_64}.${token_body_base_64}.${empty_token_component_base_64}`;

  const service_token_body = {
    client_id: 'test',
    scopes: ['service'],
  };
  const service_token_body_base_64 = 'eyJjbGllbnRfaWQiOiJ0ZXN0Iiwic2NvcGVzIjpbInNlcnZpY2UiXX0';

  describe('encodeTokenComponent()', () => {
    it('should properly base64 encode javascript objects converted to json', () => {
      expect(encodeTokenComponent(token_head)).to.equal(token_head_base_64);
      expect(encodeTokenComponent(token_body)).to.equal(token_body_base_64);
      expect(encodeTokenComponent(service_token_body)).to.equal(service_token_body_base_64);
    });
  });

  describe('createUnsignedToken()', () => {
    it('should properly assemble the token with a fake signature', () => {
      expect(createUnsignedToken(token_body, token_head)).to.equal(unsigned_token);
    });
  });

  describe('getServiceToken()', () => {
    it('should generate and return the proper service token', () => {
      expect(getServiceToken()).to.equal(
        'e30.eyJjbGllbnRfaWQiOiJhdXRoIiwic2NvcGVzIjpbInNlcnZpY2UiXX0.e30',
      );
    });
  });
});
