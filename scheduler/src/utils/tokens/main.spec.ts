process.env.SERVICE_NAME = 'test';
import { expect } from 'chai';
import { SinonSandbox, createSandbox } from 'sinon';
import { SECRET_DEF, SecretService } from '@services/Secret';
import ApiError from '@utils/errors/ApiError';
import { CSRF_MAX_CHECK_VALUES, CSRF_SIZE_BYTES } from './constants';
import {
  clearPrivateKeys,
  clearPublicKeys,
  createAccessToken,
  createRefreshToken,
  createToken,
  generateCsrfToken,
  getPrivateJwk,
  getPublicJwk,
  getPublicJwks,
  verify,
} from './main';
import { Rsa256PublicJwk, rsa256_public_jwk_schema } from './schemas';
import { HTTP_500 } from '@utils/api_responses';

describe('tokens/main', () => {
  const KEY_ID = 'FeG3YEAq_vNDYaBcNSwDrzMUccY-ZDC1kSMJha9f_mI';
  const PRIVATE_JWK_SECRET =
    '{"alg":"RS256","kid":"FeG3YEAq_vNDYaBcNSwDrzMUccY-ZDC1kSMJha9f_mI","kty":"RSA","n":"xyqlNdeJIuWBzBFX_1SUI75PiRjaA9y3UIEeJx2SnAMH7X2fG-YPm59hY8ShsCw9QKfeTHoZ6zzSiQS6i3Z9Fe2XmgG-kH141zQ2hAT_7tzZT9UICIiKUN8BPbzV875d9O3SHwINVaSCUC0x97boGwg46LyRwWI6gAas0Ck75oaWiCvHojiEoNHDRow6o7jpC0a3yiss1IC7ymQR3MzDSb5xwb_-_Gb5dDMiec2xOQuTC0OTOC8NvBhMZ_1PL6FpfAiRjC61xsLDe8NzDbcG8keVta7d5MwSF0BanF_CrNohs0t8CSjmMo3qVKe_vWWdQBiwCDIbliTO93pPjOdlYQ","e":"AQAB","d":"olx_hh8JKquSXnudEwcuJN1WFVtvD0r1HenEXPrcs9Y8tjx8Ys_v1VveluiLLwVBgd3XeNzpGD3jG9QBBwQ3AJNJzUCyyzOeOUHVV1aEFYNwnIX8IIi-ySKi7mNsv2FnUu41JxYTLMgJe7b8TwaKvM69Je3jnJSpQAkxBBk5Pbj1g1X21Ovzw-GyQwdDY3bt_UP8WwtwLkHBqqFU-v7C_BLt19hPEv1v4mZBYLm685RIiH7h64L3D_rypDozAaQYZmyaapNDYOmA1a4JZZNfgmMZk6RWijGoMBXs9--z3KHM37p9KodZr8z4g-4Sm7CoOmJ2-1SBQ5bZtQ2cts3P6Q","p":"7difrZwQma-dHUZidyxDDO86p8_tQAkD-VE193rhmCt2S3DLokLYr95wr1iKlVcNiDxP2AfzrB-QyknSF6RqmK2a57T4hSs0hKHjExuup5UpBtbsALmfLXxw0oumAQyKTJoNHB19dxWrPPzwooLg1ei6cQlAl4-WPzC2I-kuA7M","q":"1l4-oQoji2C6y6P7scNA6hc6EHYZHAXoYYum6aFj8BmbBuEPAlQVuYdkucObvL4bO4k3gyIts_6178ZELPlhB7T16lwWGuQUBUwicmK6rNO9OF4HScYx1g711zcCBAmHb_fAvgYxo2JtvVU6-n12PbqenGL3oIaqonbkcE_UOJs","dp":"UClaZ-DZl3KguWUnepLoZkuasURa6eIf_L9qOOapcef0DqkNeLqe3WdTA0YMLxkP7oKlRmIntjNNUWBf9qfrZVndg4py2C8fnDQTnDUQQFr9YNi-4d-tzl7Kh6uZX3Eii37APGGUD7a15_A4Cg2iSXYOoFpF8s7qDJIWUTQd1hE","dq":"gG42V4UbhoWNZDP6t6WjXpxLzVDz-jYP42EnvxFSLqcomhZ8R4jY-y6CykjHJW1AI4syFv6DIzOXDPBcKBXAbD2el6pUFAhRdlsGyEEeVi0FUKAE_c4gTX7pCueJ7aFH420rrK1JT_nIhYZqr2g7TwBfxpIEicgksvFIK4GoQ8E","qi":"QK3B5lKPy6wIGEGOWswBytrkPOiCI98EKSbnxscKckittz4F8yl6CJaHt_WMOv-wkEx_SjnjTUCCbARWoEY2-PawFZIEFpBss619wcH2g0gDREgQZh9d0y3s_jc12t1RVBOKipcJPROd4aDCJLVb-bJe4h14Y26D9MPpYfPEQ3g"}';
  let PRIVATE_JWK_SECRET_PARSED: unknown;
  const PUBLIC_JWKS_SECRET =
    '[{"alg":"RS256","kid":"FeG3YEAq_vNDYaBcNSwDrzMUccY-ZDC1kSMJha9f_mI","kty":"RSA","n":"xyqlNdeJIuWBzBFX_1SUI75PiRjaA9y3UIEeJx2SnAMH7X2fG-YPm59hY8ShsCw9QKfeTHoZ6zzSiQS6i3Z9Fe2XmgG-kH141zQ2hAT_7tzZT9UICIiKUN8BPbzV875d9O3SHwINVaSCUC0x97boGwg46LyRwWI6gAas0Ck75oaWiCvHojiEoNHDRow6o7jpC0a3yiss1IC7ymQR3MzDSb5xwb_-_Gb5dDMiec2xOQuTC0OTOC8NvBhMZ_1PL6FpfAiRjC61xsLDe8NzDbcG8keVta7d5MwSF0BanF_CrNohs0t8CSjmMo3qVKe_vWWdQBiwCDIbliTO93pPjOdlYQ","e":"AQAB"}]';
  let PUBLIC_JWKS_SECRET_PARSED: Rsa256PublicJwk[];

  const PUBLIC_JWKS_SECRET_BAD =
    '[{"alg":"RS256","kid":"FeG3YEAq_vNDYaBcNSwDrzMUccY-ZDC1kSMJha9f_mI","kty":"not-real-type","n":"xyqlNdeJIuWBzBFX_1SUI75PiRjaA9y3UIEeJx2SnAMH7X2fG-YPm59hY8ShsCw9QKfeTHoZ6zzSiQS6i3Z9Fe2XmgG-kH141zQ2hAT_7tzZT9UICIiKUN8BPbzV875d9O3SHwINVaSCUC0x97boGwg46LyRwWI6gAas0Ck75oaWiCvHojiEoNHDRow6o7jpC0a3yiss1IC7ymQR3MzDSb5xwb_-_Gb5dDMiec2xOQuTC0OTOC8NvBhMZ_1PL6FpfAiRjC61xsLDe8NzDbcG8keVta7d5MwSF0BanF_CrNohs0t8CSjmMo3qVKe_vWWdQBiwCDIbliTO93pPjOdlYQ","e":"AQAB"}]';

  const PUBLIC_JWKS_SECRET_2 =
    '[{"alg":"RS256","kid":"lrn3y3QN1cLIIafzYNoPRzAvAu31qpXwjHaCcTxHH0I","kty":"RSA","n":"01rK6WOdza8tUdNz6lw7QLnY4e1AVvLiUnIsk4K62XT0s9yf9r1eDhDh5f9dFhnl6y_Y1tb0xUh6KSGLTAMkfxg4e0a_2LXJhIiNpcFx_J1brE3z9QShgQ-YM5lOCDGEYtkB7axwOzdHw8nvnJZuddXSNQNzoisVm3RihRWXf84355tGQBWQNEtgMgCMZaE6o-dIjLxQdtiGcKYvn097dG3eo8jZKCJxSy5aGp840k4wQdFRXFlg9MsUJiNZniJakrVlImulWkeM_wjPuqZJARsYHEhtSV_br3oRnExZHRc5wfiXN5eBukxLcLhPfQnw6zYxCI2feJ7CFwa5uEJpYQ","e":"AQAB"}]';

  const SUB = '74dc22d5-fc72-4e9e-8a02-a7e1948490ac';

  let sandbox: SinonSandbox;

  before(() => {
    PRIVATE_JWK_SECRET_PARSED = JSON.parse(PRIVATE_JWK_SECRET);
    PUBLIC_JWKS_SECRET_PARSED = rsa256_public_jwk_schema
      .array()
      .parse(JSON.parse(PUBLIC_JWKS_SECRET));
    sandbox = createSandbox();
  });

  beforeEach(() => {
    // This avoid state leaks between tests
    clearPrivateKeys();
    clearPublicKeys();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getPrivateJWK()', () => {
    it('should throw an error if the key cannot be retrieved from AWS', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(undefined);
      expect(() => getPrivateJwk()).to.throw(HTTP_500.message);
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.equal(SECRET_DEF.TOKEN_PRIVATE_KEY);
    });

    it('should call the AWS service to get and parse the secret', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const private_key_jwk = getPrivateJwk();

      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.equal(SECRET_DEF.TOKEN_PRIVATE_KEY);

      expect(private_key_jwk).to.deep.equal(PRIVATE_JWK_SECRET_PARSED);
    });
  });

  describe('getPublicJWKs()', () => {
    it('should throw an error if the key cannot be retrieved from AWS', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(undefined);

      expect(() => getPublicJwks()).to.throw(HTTP_500.message);

      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.equal(SECRET_DEF.TOKEN_PUBLIC_KEYS);
    });

    it('should call the AWS service to get and parse the secret', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const public_key_jwks = getPublicJwks();

      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.equal(SECRET_DEF.TOKEN_PUBLIC_KEYS);

      expect(public_key_jwks).to.deep.equal(PUBLIC_JWKS_SECRET_PARSED);
    });
  });

  describe('getPublicJWK()', () => {
    it('should throw an error if the key is not in the list', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);

      expect(() => getPublicJwk('bad key')).to.throw('Invalid Key ID used to sign the token');
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.equal(SECRET_DEF.TOKEN_PUBLIC_KEYS);
    });

    it('should return the matching key for a valid key id', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const public_key_jwk = getPublicJwk(KEY_ID);
      expect(public_key_jwk).to.deep.equal(PUBLIC_JWKS_SECRET_PARSED[0]);
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.equal(SECRET_DEF.TOKEN_PUBLIC_KEYS);
    });
  });

  describe('generateCsrfToken()', () => {
    const BITS_PER_BYTE = 8;
    const BITS_PER_HEX_CHAR = 4;

    it('should generate a key with the default number of bytes', async () => {
      const token = generateCsrfToken();
      const TOKEN_STRING_LENGTH = (CSRF_SIZE_BYTES * BITS_PER_BYTE) / BITS_PER_HEX_CHAR;
      expect(token.length).to.equal(TOKEN_STRING_LENGTH);
    });

    it('should generate a key with the a parameterized number of bytes', async () => {
      const NUM_BYTES = 8;
      const token = generateCsrfToken(NUM_BYTES);
      const TOKEN_STRING_LENGTH = (NUM_BYTES * BITS_PER_BYTE) / BITS_PER_HEX_CHAR;
      expect(token.length).to.equal(TOKEN_STRING_LENGTH);
    });
  });

  describe('createToken()', () => {
    it('should throw an error if the sub is empty', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      await expect(createToken('', [], '1h', true)).to.be.rejectedWith(
        ApiError,
        'A user ID is required to generate a sign-in token',
      );
    });

    it('should return a string csrf token when the option is set to true', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const TOKEN_SET = await createToken(SUB, [], '1h', true);
      expect(TOKEN_SET.csrf).to.be.a('string').that.is.not.empty;
    });

    it('should return a string when the option is set to false', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const JWT = await createToken(SUB, [], '1h', false);
      expect(JWT).to.be.a('string').that.is.not.empty;
    });

    it('should return jwt with a matching csrf token', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const TOKEN_SET = await createToken(SUB, [], '1h', true);
      stub.restore();
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const TOKEN = await verify(TOKEN_SET.jwt, null);
      expect(TOKEN.payload.csrf).to.equal(TOKEN_SET.csrf);
    });

    it('should return jwt with the requested scopes', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const TOKEN_SET = await createToken(SUB, ['test'], '1h', true);
      stub.restore();
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const TOKEN = await verify(TOKEN_SET.jwt, null);
      expect(TOKEN.payload.scopes).to.be.an('array').with.length(1).that.contain('test');
      const TOKEN_SET_2 = await createToken(SUB, [], '1h', true);
      const TOKEN_2 = await verify(TOKEN_SET_2.jwt, null);
      expect(TOKEN_2.payload.scopes).to.be.an('array').that.is.empty;
    });
  });

  describe('createAccessToken()', () => {
    it('should throw an error if the sub is empty', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      await expect(createAccessToken('', [])).to.be.rejectedWith(
        ApiError,
        'A user ID is required to generate a sign-in token',
      );
    });

    it('should return jwt with a matching csrf token', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const TOKEN_SET = await createAccessToken(SUB, []);
      stub.restore();
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const TOKEN = await verify(TOKEN_SET.jwt, null);
      expect(TOKEN.payload.csrf).to.equal(TOKEN_SET.csrf);
    });

    it('should return jwt with the requested scopes', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const TOKEN_SET = await createAccessToken(SUB, ['test']);
      const TOKEN_SET_2 = await createAccessToken(SUB);
      stub.restore();
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const TOKEN = await verify(TOKEN_SET.jwt, null);
      expect(TOKEN.payload.scopes).to.be.an('array').with.length(1).that.contain('test');
      const TOKEN_2 = await verify(TOKEN_SET_2.jwt, null);
      expect(TOKEN_2.payload.scopes).to.be.an('array').with.length(1).that.contain('profile');
    });
  });

  describe('createRefreshToken()', () => {
    it('should throw an error if the sub is empty', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      await expect(createRefreshToken('', [])).to.be.rejectedWith(
        ApiError,
        'A user ID is required to generate a sign-in token',
      );
    });

    it('should return jwt with the requested scopes', async () => {
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const TOKEN_STRING = await createRefreshToken(SUB, ['test']);
      const TOKEN_STRING_2 = await createRefreshToken(SUB);
      stub.restore();
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const TOKEN = await verify(TOKEN_STRING, null);
      expect(TOKEN.payload.scopes).to.be.an('array').with.length(1).that.contain('test');
      const TOKEN_2 = await verify(TOKEN_STRING_2, null);
      expect(TOKEN_2.payload.scopes).to.be.an('array').with.length(1).that.contain('refresh');
    });
  });

  describe('verify()', () => {
    let TOKEN: string,
      CSRF: string,
      TOKEN_PAYLOAD: string,
      TOKEN_SIGNATURE: string,
      TOKEN_BAD_SUB: string,
      REFRESH_TOKEN: string;
    const TOKEN_HEADER_NO_KID = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';

    before(async () => {
      // A fresh token is needed, otherwise the token won't pass the expiry tests
      clearPrivateKeys();
      const stub = sandbox.stub(SecretService, 'getSecret').returns(PRIVATE_JWK_SECRET);
      const { jwt, csrf } = await createAccessToken(SUB);
      TOKEN = jwt;
      CSRF = csrf;
      const TOKEN_PARTS = TOKEN.split('.');
      TOKEN_PAYLOAD = TOKEN_PARTS[1];
      TOKEN_SIGNATURE = TOKEN_PARTS[2];
      // Create a refresh token to make sure it can be validated
      REFRESH_TOKEN = await createRefreshToken(SUB);
      // Create a token which will not pass a schema check for the uuid format
      TOKEN_BAD_SUB = await createRefreshToken('1234test5678');
      stub.restore();
    });

    it('should not throw errors for valid tokens with a matching CSRF token', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      await expect(verify(TOKEN, null)).to.not.be.rejected;
      await expect(verify(TOKEN, CSRF)).to.not.be.rejected;
      await expect(verify(REFRESH_TOKEN, null)).to.not.be.rejected;
    });

    it('should throw an error if the header is invalid', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      await expect(verify(`abc.${TOKEN_PAYLOAD}.${TOKEN_SIGNATURE}`, null)).to.be.rejectedWith(
        ApiError,
        'Invalid or Missing token',
      );
    });

    it('should throw an error if public key id is not provided', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      await expect(
        verify(`${TOKEN_HEADER_NO_KID}.${TOKEN_PAYLOAD}.${TOKEN_SIGNATURE}`, null),
      ).to.be.rejectedWith(ApiError, 'Invalid Key ID used to sign the token');
    });

    it('should throw an error if public key is not in the list', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET_2);
      await expect(verify(TOKEN, null)).to.be.rejectedWith(
        ApiError,
        'Invalid Key ID used to sign the token',
      );
    });

    it('should throw an error if the jwk containing the public key is invalid', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET_BAD);
      // expect(verify(TOKEN, null)).to.throw(HTTP_500.message);
      await expect(verify(TOKEN, null)).to.be.rejectedWith(ApiError, HTTP_500.message);
    });

    it('should throw an error if the csrf value is invalid', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const ERROR = 'CSRF Token is Missing';
      /* Note: csrf types do not allow undefined, but the request.headers is not properly typed in express,
        therefore it is necessary to test the undefined case, which is handled properly by zod */

      await expect(verify(TOKEN, undefined as unknown as string)).to.be.rejectedWith(
        ApiError,
        ERROR,
      );
      await expect(verify(TOKEN, '')).to.be.rejectedWith(ApiError, ERROR);
      await expect(verify(TOKEN, [])).to.be.rejectedWith(ApiError, ERROR);
      await expect(verify(TOKEN, [''])).to.be.rejectedWith(ApiError, ERROR);
      await expect(verify(TOKEN, ['', ''])).to.be.rejectedWith(ApiError, ERROR);
    });

    it('should throw an error if the csrf array length is greater than the limit', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      await expect(
        verify(TOKEN, new Array(CSRF_MAX_CHECK_VALUES + 1).fill('test')),
      ).to.be.rejectedWith(ApiError, 'CSRF Token Limit Exceeded');
    });

    it('should throw an error if the csrf value does not match the one in the token', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const ERROR = 'CSRF Token Mismatch';
      await expect(verify(TOKEN, 'test_csrf')).to.be.rejectedWith(ApiError, ERROR);
      await expect(verify(TOKEN, ['test_csrf'])).to.be.rejectedWith(ApiError, ERROR);
    });

    it('should properly validate the required scopes in the token', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const ERROR = 'The token does not have a valid scope for this action';
      await expect(verify(TOKEN, null, ['test'])).to.be.rejectedWith(ApiError, ERROR);
      await expect(verify(TOKEN, null, ['test', 'profile'])).to.be.rejectedWith(ApiError, ERROR);
      await expect(verify(TOKEN, null, [])).to.not.be.rejected;
      await expect(verify(TOKEN, null, ['profile'])).to.not.be.rejected;
    });

    it('should throw an error if the token does not pass the schema check', async () => {
      sandbox.stub(SecretService, 'getSecret').returns(PUBLIC_JWKS_SECRET);
      const ERROR = 'The Token Header or Body is malformed';
      await expect(verify(TOKEN_BAD_SUB, null)).to.be.rejectedWith(ApiError, ERROR);
    });
  });
});
