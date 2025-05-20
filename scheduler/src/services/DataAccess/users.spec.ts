process.env.SERVICE_NAME = 'test';
import { expect } from 'chai';
import { Profile } from 'passport';
import { SinonSandbox, createSandbox } from 'sinon';
import { UserAccount } from '@services/DataAccess';
import fetch_json, { ExtendedResponse } from '@services/fetch_json';
import DataAccess, { Endpoint } from '.';
import { expandPath } from './main';
import { getServiceToken } from '@utils/tokens';
import ApiError from '@utils/errors/ApiError';

describe('DataAccess', () => {
  let access_token: string;
  const uuid = '17c34fbf-6340-4aa3-9d4d-2be25e4afb22';

  const user = {
    uuid,
    given_name: 'John',
    family_name: 'Smith',
    disp_name: 'John Smith',
    providers: [
      {
        provider: 'google',
        provider_uid: '123123123123123',
      },
    ],
    emails: [
      {
        email_address: 'test@example.com',
      },
    ],
  };

  const response = { body_obj: { messages: [], data: null } } as unknown as ExtendedResponse;

  let sandbox: SinonSandbox;

  before(() => {
    access_token = getServiceToken();
    sandbox = createSandbox();
  });

  beforeEach(() => {
    response.body_obj = { messages: [], data: null };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('.getUserByUuid', () => {
    it('should call endpoint and return data property', async () => {
      response.body_obj = { messages: [], data: user };
      const stub = sandbox.stub(fetch_json, 'get').returns(Promise.resolve(response));
      const res = await DataAccess.getUserByUuid(uuid, access_token);

      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.be.equal(expandPath(Endpoint.USER, { uuid }));
      expect(stub.getCall(0).args[1]).to.deep.equal({ access_token });

      expect(res).to.deep.equal(user);
    });
  });

  describe('.getAccountByProviderId', () => {
    it('should get user by provider and provider ID', async () => {
      response.body_obj = { messages: [], data: [user] };
      const stub = sandbox.stub(fetch_json, 'get').returns(Promise.resolve(response));
      const res = await DataAccess.getAccountByProviderId(
        user.providers[0].provider,
        user.providers[0].provider_uid,
        access_token,
      );
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.be.equal(expandPath(Endpoint.USERS));
      expect(stub.getCall(0).args[1]).to.deep.equal({
        query: { ...user.providers[0] },
        access_token,
      });
      expect(res).to.deep.equal(user);
    });

    it('should return null if no matching providers', async () => {
      response.body_obj = { messages: [], data: [] };
      sandbox.stub(fetch_json, 'get').returns(Promise.resolve(response));
      const res = await DataAccess.getAccountByProviderId(
        user.providers[0].provider,
        user.providers[0].provider_uid,
        access_token,
      );
      expect(res).to.equals(null);
    });

    // Note this shouldn't come up in practice unless we have major DA problems
    // but this makes sure that if that happens we don't log anyone into the wrong account
    it('should throw an error if more than one is returned', async () => {
      response.body_obj = { messages: [], data: [user, user] };
      sandbox.stub(fetch_json, 'get').returns(Promise.resolve(response));
      await expect(
        DataAccess.getAccountByProviderId(
          user.providers[0].provider,
          user.providers[0].provider_uid,
          access_token,
        ),
      ).to.be.rejectedWith(ApiError, 'requested data is malformed');
    });
  });

  describe('.getAccountByEmails', () => {
    it('should get user by provider and provider ID with string input', async () => {
      response.body_obj = { messages: [], data: [user] };
      const stub = sandbox.stub(fetch_json, 'get').returns(Promise.resolve(response));
      const res = await DataAccess.getAccountByEmails(user.emails[0].email_address, access_token);
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.be.equal(expandPath(Endpoint.USERS));
      expect(stub.getCall(0).args[1]).to.deep.equal({
        query: { email: user.emails[0].email_address },
        access_token,
      });
      expect(res).to.deep.equal(user);
    });

    it('should get user by provider and provider ID with array input', async () => {
      response.body_obj = { messages: [], data: [user] };
      const stub = sandbox.stub(fetch_json, 'get').returns(Promise.resolve(response));
      const res = await DataAccess.getAccountByEmails(
        user.emails.flatMap((e) => e.email_address),
        access_token,
      );
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.be.equal(expandPath(Endpoint.USERS));
      expect(stub.getCall(0).args[1]).to.deep.equal({
        query: { email: user.emails[0].email_address },
        access_token,
      });
      expect(res).to.deep.equal(user);
    });

    it('should return null if no matching providers', async () => {
      response.body_obj = { messages: [], data: [] };
      sandbox.stub(fetch_json, 'get').returns(Promise.resolve(response));
      const res = await DataAccess.getAccountByEmails(user.emails[0].email_address, access_token);
      expect(res).to.equals(null);
    });

    it('should throw an error if more than one is returned', async () => {
      response.body_obj = { messages: [], data: [user, user] };
      sandbox.stub(fetch_json, 'get').returns(Promise.resolve(response));
      await expect(
        DataAccess.getAccountByEmails(user.emails[0].email_address, access_token),
      ).to.be.rejectedWith(ApiError, 'requested data is malformed');
    });
  });

  describe('.createAccount', () => {
    const formatProfile = (account: UserAccount): Profile => {
      return {
        id: account.providers[0].provider_uid,
        provider: account.providers[0].provider,
        displayName: account.disp_name,
        name: {
          givenName: account.given_name,
          familyName: account.family_name,
        },
        emails: account.emails.map((e) => ({ value: e.email_address })),
      };
    };

    it('should create and return a user', async () => {
      response.body_obj = { messages: [], data: user };
      const stub = sandbox.stub(fetch_json, 'post').returns(Promise.resolve(response));
      const res = await DataAccess.createAccount(formatProfile(user), access_token);
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.be.equal(expandPath(Endpoint.USERS));
      const { uuid: _, ...body } = user;
      expect(stub.getCall(0).args[1]).to.deep.equal({
        body,
        access_token,
      });
      expect(res).to.deep.equal(user);
    });

    it('should create and return a user with no email addresses', async () => {
      const test_user = formatProfile(user);
      test_user.emails = undefined;
      const result_user = { ...user, emails: [] };

      response.body_obj = { messages: [], data: result_user };
      const stub = sandbox.stub(fetch_json, 'post').returns(Promise.resolve(response));
      const res = await DataAccess.createAccount(test_user, access_token);
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.be.equal(expandPath(Endpoint.USERS));
      const { uuid: _, ...body } = result_user;
      expect(stub.getCall(0).args[1]).to.deep.equal({
        body,
        access_token,
      });
      expect(res).to.deep.equal(result_user);
    });

    it('should create and return a user with a fallback name', async () => {
      const test_user = formatProfile(user);
      test_user.name = undefined;
      const result_user = { ...user, given_name: '', family_name: '' };

      response.body_obj = { messages: [], data: result_user };
      const stub = sandbox.stub(fetch_json, 'post').returns(Promise.resolve(response));
      const res = await DataAccess.createAccount(test_user, access_token);
      expect(stub.calledOnce).to.be.true;
      expect(stub.getCall(0).args[0]).to.be.equal(expandPath(Endpoint.USERS));
      const { uuid: _, ...body } = result_user;
      expect(stub.getCall(0).args[1]).to.deep.equal({
        body,
        access_token,
      });
      expect(res).to.deep.equal(result_user);
    });
  });
});
