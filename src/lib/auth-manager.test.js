const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const AuthManager = require('./auth-manager');
const InMemoryCache = require('./in-memory-cache');

describe('auth-manager', () => {
  beforeEach(() => {});

  afterEach(() => {
    sinon.restore();
  });

  const createNewManager = (overrides) => {
    const defaults = {
      cache: new InMemoryCache(),
      identityUrl: 'http://127.0.0.1:8080',
      userId: 'testUser',
      password: 'testPassword',
      account: 'testAccount',
      allowSelfSignCert: true,
    };
    return new AuthManager(_.merge({}, defaults, overrides));
  };

  describe('getAuthenticationToken', () => {
    it('Parameter-less call twice calls service once and returns same token', async () => {
      // Arrange
      const expectedToken = 'AwesomeTestToken';
      const manager = createNewManager();

      const postStub = sinon.stub(axios, 'post');
      postStub.resolves({
        status: 200,
        data: { token: expectedToken },
      });

      sinon.stub(jwt, 'decode').returns({
        exp: Math.floor(new Date().getTime() / 1000.0) + 300,
      });

      // Act
      const token = await manager.getAuthenticationToken();
      const token2 = await manager.getAuthenticationToken();

      // Assert
      chai.expect(token).to.equal(expectedToken);
      chai.expect(token2).to.equal(expectedToken);

      const postCalls = postStub.getCalls();
      chai.expect(postCalls.length).to.be.equal(1);
      chai
        .expect(postCalls[0].args[0])
        .to.be.equal('http://127.0.0.1:8080/v1/authenticate');
    });

    it('Expired cache key removed on subsequent calls', async () => {
      // Arrange
      const expectedToken = 'AwesomeTestToken';
      const cache = {
        get: sinon.stub().returns({
          exp: Math.floor(new Date().getTime() / 1000.0) - 300,
        }),
        remove: sinon.stub(),
        set: sinon.stub(),
      };
      const manager = createNewManager({ cache });

      const postStub = sinon.stub(axios, 'post');
      postStub.resolves({
        status: 200,
        data: { token: expectedToken },
      });

      // sinon.stub(jwt, 'decode').returns();

      // Act
      const token = await manager.getAuthenticationToken();

      // Assert
      chai.expect(token).to.equal(expectedToken);

      const postCalls = postStub.getCalls();
      chai.expect(postCalls.length).to.be.equal(1);
      chai
        .expect(postCalls[0].args[0])
        .to.be.equal('http://127.0.0.1:8080/v1/authenticate');
      chai.expect(cache.remove.getCalls().length).to.be.equal(1);
    });

    it('Parameter-less call raises error when non-200 response received.', () => {
      // Arrange
      const manager = createNewManager({ allowSelfSignCert: false });

      const postStub = sinon.stub(axios, 'post');
      postStub.resolves({
        status: 500,
        data: 'test error',
      });

      // Act
      return manager.getAuthenticationToken().catch((err) => {
        // Assert
        const postCalls = postStub.getCalls();
        chai.expect(postCalls.length).to.be.equal(1);
        chai
          .expect(postCalls[0].args[0])
          .to.be.equal('http://127.0.0.1:8080/v1/authenticate');
        chai
          .expect(err.message)
          .to.be.equal('An error occurred while authenticating.');
      });
    });
  });
});
