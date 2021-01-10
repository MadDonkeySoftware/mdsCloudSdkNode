const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');


const IdentityService = require('./identity-service');

describe('identity-service', () => {
  beforeEach(() => {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    this.sandbox.restore();
  });

  describe('getRequestOptions', () => {

  });

  describe('register', () => {
    it('returns a resolved promise with registration data when successful', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 200,
        data: { status: 'Success', accountId: 123 },
      }));
      const client = new IdentityService('http://127.0.0.1:8080');

      // Act
      const payload = {
        email: 'test@email.foo',
        password: 'testPassword',
        friendlyName: 'testName',
        accountName: 'testAccount',
      };
      return client.register(payload)
        .then((data) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/register');
          chai.expect(data).to.deep.equal({ status: 'Success', accountId: 123 });
        });
    });

    it('returns a rejected promise when an error occurs', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new IdentityService('http://127.0.0.1:8080');

      // Act
      const payload = {
        email: 'test@email.foo',
        password: 'testPassword',
        friendlyName: 'testName',
        accountName: 'testAccount',
      };
      return client.register(payload)
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/register');
          chai.expect(err.message).to.be.equal('An error occurred while registering a new account.');
        });
    });
  });

  describe('authenticate', () => {
    it('Calls through to AuthManager getAuthenticationToken', () => {
      // Arrange
      const authManager = {
        getAuthenticationToken: sinon.stub().resolves('testToken'),
      };
      const client = new IdentityService('', authManager);

      // Act
      const payload = {
        accountId: '123',
        userId: 'testUser',
        password: 'testPassword',
      };
      return client.authenticate(payload)
        .then((token) => {
          // Assert
          const getCalls = authManager.getAuthenticationToken.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.equal(payload);
          chai.expect(token).to.be.equal('testToken');
        });
    });
  });

  describe('updateUser', () => {
    it('returns a resolved promise with update data when successful', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 200,
        data: {},
      }));
      const client = new IdentityService('http://127.0.0.1:8080');

      // Act
      const payload = {
        email: 'test@email.foo',
        oldPassword: 'testPassword',
        newPassword: 'testPassword',
        friendlyName: 'testName',
      };
      return client.updateUser(payload)
        .then((data) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/updateUser');
          chai.expect(data).to.deep.equal({});
        });
    });

    it('returns a rejected promise when an error occurs', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new IdentityService('http://127.0.0.1:8080');

      // Act
      const payload = {
        email: 'test@email.foo',
        password: 'testPassword',
        friendlyName: 'testName',
        accountName: 'testAccount',
      };
      return client.updateUser(payload)
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/updateUser');
          chai.expect(err.message).to.be.equal('An error occurred while updating the user.');
        });
    });
  });

  describe('getPublicSignature', () => {
    it('returns a resolved promise with signature data when successful', () => {
      // Arrange
      const getStub = this.sandbox.stub(axios, 'get');
      getStub.returns(Promise.resolve({
        status: 200,
        data: { signature: 'public signature' },
      }));
      const client = new IdentityService('http://127.0.0.1:8080');

      // Act
      return client.getPublicSignature()
        .then((data) => {
          // Assert
          const getCalls = getStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/publicSignature');
          chai.expect(data).to.deep.equal({ signature: 'public signature' });
        });
    });

    it('returns a rejected promise when an error occurs', () => {
      // Arrange
      const getStub = this.sandbox.stub(axios, 'get');
      getStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new IdentityService('http://127.0.0.1:8080');

      // Act
      return client.getPublicSignature()
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = getStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/publicSignature');
          chai.expect(err.message).to.be.equal('An error occurred while acquiring the public signature.');
        });
    });
  });

  describe('impersonateUser', () => {
    it('returns a resolved promise with signature data when successful', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 200,
        data: { token: 'impersonation token' },
      }));
      const client = new IdentityService('http://127.0.0.1:8080');

      // Act
      const payload = {
        accountId: '123',
        userId: 'someUser',
      };
      return client.impersonateUser(payload)
        .then((data) => {
          // Assert
          const postCalls = postStub.getCalls();
          chai.expect(postCalls.length).to.be.equal(1);
          chai.expect(postCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/impersonate');
          chai.expect(data).to.deep.equal({ token: 'impersonation token' });
        });
    });

    it('returns a rejected promise when an error occurs', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new IdentityService('http://127.0.0.1:8080');

      // Act
      const payload = {
        accountId: '123',
        userId: 'someUser',
      };
      return client.impersonateUser(payload)
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const postCalls = postStub.getCalls();
          chai.expect(postCalls.length).to.be.equal(1);
          chai.expect(postCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/impersonate');
          chai.expect(err.message).to.be.equal('An error occurred while obtaining impersonation token.');
        });
    });
  });
});
