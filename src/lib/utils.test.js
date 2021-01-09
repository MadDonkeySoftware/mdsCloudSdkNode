/* eslint-disable no-unused-expressions */
const fs = require('fs');
const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const proxyquire = require('proxyquire');

const utils = require('./utils');

describe('utils', () => {
  beforeEach(() => {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    this.sandbox.restore();
  });

  // https://www.chaijs.com/plugins/chai-as-promised/
  describe('download', () => {
    it('Resolves promise on successful download', () => {
      // Arrange
      const url = 'http://127.0.0.1:8000/download/foo/bar.txt';
      const dest = '/foo/baz';
      const stubCreateWriteStream = this.sandbox.stub(fs, 'createWriteStream');
      const stubAxiosGet = this.sandbox.stub(axios, 'get');
      const fakeWriter = {
        on: (event, listener) => {
          if (event === 'finish') {
            setTimeout(listener, 1);
          }
        },
      };
      const fakeResponse = {
        data: {
          pipe: this.sandbox.stub(),
        },
      };

      stubCreateWriteStream.returns(fakeWriter);
      stubAxiosGet.resolves(fakeResponse);

      // Act
      return utils.download(url, dest)
        .then(() => {
          // Assert
          const stubCreateWriteStreamCalls = stubCreateWriteStream.getCalls();
          chai.expect(stubCreateWriteStreamCalls.length).to.be.equal(1);
          chai.expect(stubCreateWriteStreamCalls[0].args[0]).to.be.equal('/foo/baz/bar.txt');

          const pipeCalls = fakeResponse.data.pipe.getCalls();
          chai.expect(pipeCalls.length).to.be.equal(1);
          chai.expect(pipeCalls[0].args[0]).to.be.equal(fakeWriter);
        });
    });
  });

  describe('getEnvConfig', () => {
    // TODO: test this
  });

  describe('getDefaultEnv', () => {
    // TODO: test this
  });

  describe('getRequestOptions', () => {
    it('Resolves default options when no options are provided', () => utils.getRequestOptions().then((options) => {
      // Assert
      const validationStatusFunc = options.validateStatus;
      // eslint-disable-next-line no-param-reassign
      delete options.validateStatus;

      chai.expect(validationStatusFunc()).to.equal(true);
      chai.expect(options).to.deep.equal({
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }));

    it('Resolves proper options when headers are provided', () => {
      // Arrange
      const args = {
        headers: { foo: 'bar' },
      };

      // Act
      return utils.getRequestOptions(args).then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;

        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;

        chai.expect(validationStatusFunc()).to.equal(true);
        chai.expect(options).to.deep.equal({
          headers: {
            'Content-Type': 'application/json',
            foo: 'bar',
          },
        });
      });
    });

    it('Resolves proper options when allowSelfSignCert is provided and true', () => {
      // Arrange
      const args = {
        allowSelfSignCert: true,
      };

      // Act
      return utils.getRequestOptions(args).then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;
        const httpsAgentAssignment = options.httpsAgent;

        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;
        // eslint-disable-next-line no-param-reassign
        delete options.httpsAgent;

        chai.expect(validationStatusFunc()).to.equal(true);
        chai.expect(httpsAgentAssignment).is.not.null;
        chai.expect(options).to.deep.equal({
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });
    });

    it('Resolves proper options when authManager is provided and token is resolved', () => {
      // Arrange
      const authManager = {
        getAuthenticationToken: sinon.stub().resolves('testAuthToken'),
      };
      const args = {
        authManager,
      };

      // Act
      return utils.getRequestOptions(args).then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;

        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;

        chai.expect(validationStatusFunc()).to.equal(true);
        chai.expect(options).to.deep.equal({
          headers: {
            'Content-Type': 'application/json',
            Token: 'testAuthToken',
          },
        });
      });
    });

    it('Resolves proper options when authManager and environment is provided and token is resolved', () => {
      // Arrange
      const authManager = {
        getAuthenticationToken: sinon.stub().resolves('testAuthToken'),
      };
      const args = {
        authManager,
        envName: 'test',
      };

      sinon.stub(utils, 'getEnvConfig').returns({
        account: 'testAccount',
        userId: 'testUserId',
        password: 'testPassword',
      });

      // Act
      return utils.getRequestOptions(args).then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;

        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;

        chai.expect(validationStatusFunc()).to.equal(true);
        chai.expect(options).to.deep.equal({
          headers: {
            'Content-Type': 'application/json',
            Token: 'testAuthToken',
          },
        });
        chai.expect(authManager.getAuthenticationToken.getCall(0).args[0]).to.deep.equal({
          accountId: 'testAccount',
          userId: 'testUserId',
          password: 'testPassword',
        });
      });
    });
  });

  describe('createArchiveFromDirectory', () => {
    it('Archival successful', () => {
      // Arrange
      let onCloseCb;
      let onErrorCb;
      const outFileStub = {
        on: (event, cb) => {
          if (event === 'close') onCloseCb = cb;
          if (event === 'error') onErrorCb = cb;
        },
        call: (event, data) => (event === 'close' ? onCloseCb(data) : onErrorCb(data)),
      };
      const archiveStub = {
        finalize: () => outFileStub.call('close'),
        directory: this.sandbox.stub(),
        pipe: this.sandbox.stub(),
      };
      const proxiedUtils = proxyquire('./utils', {
        archiver: () => archiveStub,
      });
      this.sandbox.stub(fs, 'createWriteStream').returns(outFileStub);

      // Act
      proxiedUtils.createArchiveFromDirectory('/tmp/foo')
        .then((meta) => {
          // Assert
          chai.expect(meta.filePath).to.be.equal('/tmp/foo.zip');
          chai.expect(meta.userSupplied).to.be.equal(false);
        });
    });

    it('Archival failure', () => {
      // Arrange
      let onCloseCb;
      let onErrorCb;
      const outFileStub = {
        on: (event, cb) => {
          if (event === 'close') onCloseCb = cb;
          if (event === 'error') onErrorCb = cb;
        },
        call: (event, data) => (event === 'close' ? onCloseCb(data) : onErrorCb(data)),
      };
      const archiveStub = {
        finalize: () => outFileStub.call('error', new Error('test error')),
        directory: this.sandbox.stub(),
        pipe: this.sandbox.stub(),
      };
      const proxiedUtils = proxyquire('./utils', {
        archiver: () => archiveStub,
      });
      this.sandbox.stub(fs, 'createWriteStream').returns(outFileStub);

      // Act
      proxiedUtils.createArchiveFromDirectory('/tmp/foo')
        .then(() => {
          throw new Error('Test passed when it should have failed');
        })
        .catch((err) => {
          chai.expect(err.message).to.be.equal('test error');
        });
    });
  });
});
