/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const fs = require('fs');
const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const proxyquire = require('proxyquire');

const utils = require('./utils');

describe(__filename, () => {
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
      return utils.download(url, dest).then(() => {
        // Assert
        const stubCreateWriteStreamCalls = stubCreateWriteStream.getCalls();
        chai.expect(stubCreateWriteStreamCalls.length).to.be.equal(1);
        chai
          .expect(stubCreateWriteStreamCalls[0].args[0])
          .to.be.equal('/foo/baz/bar.txt');

        const pipeCalls = fakeResponse.data.pipe.getCalls();
        chai.expect(pipeCalls.length).to.be.equal(1);
        chai.expect(pipeCalls[0].args[0]).to.be.equal(fakeWriter);
      });
    });
  });

  describe('getEnvConfig', () => {
    const testSet = [
      ['empty string', '', null],
      ['undefined', undefined, null],
      ['null', null, null],
    ];
    _.map(testSet, ([desc, key, expected]) => {
      it(`when ${desc} provided`, async () => {
        // Act
        const result = await utils.getEnvConfig(key);

        // Assert
        chai.expect(result).to.equal(expected);
      });
    });

    it('when cache hits returns cache value', async () => {
      // Arrange
      utils._IN_PROC_CACHE = {
        'getEnvConfig-testKey': { a: 'a' },
      };

      // Act
      const result = await utils.getEnvConfig('testKey');

      // Assert
      chai.expect(result).to.deep.equal({ a: 'a' });
    });

    it('when cache not hit and env does not exists returns null', async () => {
      // Arrange
      utils._IN_PROC_CACHE = {};
      this.sandbox.stub(utils, '_fsExists').resolves(false);
      this.sandbox
        .stub(utils, '_fsReadFile')
        .rejects(new Error('Test Issue: Error should not be thrown'));

      // Act
      const result = await utils.getEnvConfig('testKey');

      // Assert
      chai.expect(result).to.deep.equal(null);
      chai.expect(utils._IN_PROC_CACHE).to.deep.equal({});
    });

    it('when cache not hit and env exists returns value and loads cache', async () => {
      // Arrange
      utils._IN_PROC_CACHE = {};
      this.sandbox.stub(utils, '_fsExists').resolves(true);
      this.sandbox.stub(utils, '_fsReadFile').resolves('{"a":"a"}');

      // Act
      const result = await utils.getEnvConfig('testKey');

      // Assert
      chai.expect(result).to.deep.equal({ a: 'a' });
      chai
        .expect(utils._IN_PROC_CACHE['getEnvConfig-testKey'])
        .to.deep.equal({ a: 'a' });
    });

    it('when cache not hit and error occurs loading env returns null', async () => {
      // Arrange
      utils._IN_PROC_CACHE = {};
      this.sandbox.stub(utils, '_fsExists').resolves(true);
      this.sandbox.stub(utils, '_fsReadFile').resolves('{badJson}');

      // Act
      const result = await utils.getEnvConfig('testKey');

      // Assert
      chai.expect(result).to.deep.equal(null);
    });
  });

  describe('getDefaultEnv', () => {
    it('when file does not exists returns a default', async () => {
      // Arrange
      utils._IN_PROC_CACHE = {};
      this.sandbox.stub(utils, '_fsExists').resolves(false);
      this.sandbox
        .stub(utils, '_fsReadFile')
        .rejects('Test Failure: Should never be thrown');

      // Act
      const result = await utils.getDefaultEnv();

      // Assert
      chai.expect(result).to.equal('default');
      chai.expect(utils._IN_PROC_CACHE.getDefaultEnv).to.equal(undefined);
    });

    it('when file exists but has no data returns a default', async () => {
      // Arrange
      utils._IN_PROC_CACHE = {};
      this.sandbox.stub(utils, '_fsExists').resolves(true);
      this.sandbox.stub(utils, '_fsReadFile').resolves('');

      // Act
      const result = await utils.getDefaultEnv();

      // Assert
      chai.expect(result).to.equal('default');
      chai.expect(utils._IN_PROC_CACHE.getDefaultEnv).to.equal(undefined);
    });

    it('when file exists returns the default configured environment', async () => {
      // Arrange
      utils._IN_PROC_CACHE = {};
      this.sandbox.stub(utils, '_fsExists').resolves(true);
      this.sandbox.stub(utils, '_fsReadFile').resolves('testDefault');

      // Act
      const result = await utils.getDefaultEnv();

      // Assert
      chai.expect(result).to.equal('testDefault');
      chai.expect(utils._IN_PROC_CACHE.getDefaultEnv).to.equal('testDefault');
    });

    it('when called multiple times uses cache value', async () => {
      // Arrange
      utils._IN_PROC_CACHE = {};
      this.sandbox.stub(utils, '_fsExists').resolves(true);
      this.sandbox.stub(utils, '_fsReadFile').resolves('testDefault');

      // Act
      const result = await utils.getDefaultEnv();
      const result2 = await utils.getDefaultEnv();

      // Assert
      chai.expect(result2).to.equal(result);
      chai.expect(utils._IN_PROC_CACHE.getDefaultEnv).to.equal(result);
      chai.expect(utils._fsExists.callCount).to.equal(1);
    });
  });

  describe('getRequestOptions', () => {
    it('Resolves default options when no options are provided', () =>
      utils.getRequestOptions().then((options) => {
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
        chai
          .expect(authManager.getAuthenticationToken.getCall(0).args[0])
          .to.deep.equal({
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
        call: (event, data) =>
          event === 'close' ? onCloseCb(data) : onErrorCb(data),
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
      proxiedUtils.createArchiveFromDirectory('/tmp/foo').then((meta) => {
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
        call: (event, data) =>
          event === 'close' ? onCloseCb(data) : onErrorCb(data),
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
      proxiedUtils
        .createArchiveFromDirectory('/tmp/foo')
        .then(() => {
          throw new Error('Test passed when it should have failed');
        })
        .catch((err) => {
          chai.expect(err.message).to.be.equal('test error');
        });
    });
  });

  describe('getConfigurationUrls', () => {
    it('No url provided yields empty object', async () => {
      // Act
      const result = await utils.getConfigurationUrls();

      // Assert
      chai.expect(result).to.deep.equal({});
    });

    it('Valid url and response yields configured object', async () => {
      // Arrange
      this.sandbox.stub(axios, 'get').resolves({
        status: 200,
        data: {
          foo: '1',
        },
      });

      // Act
      const result = await utils.getConfigurationUrls('http://test-url');

      // Assert
      chai.expect(result).to.deep.equal({ foo: '1' });
    });

    it('Valid url and invalid response yields error', async () => {
      // Arrange
      this.sandbox.stub(axios, 'get').resolves({
        status: 400,
        data: '400 from test',
      });

      // Act
      const result = await utils.getConfigurationUrls('http://test-url');
      chai.expect(result).to.deep.equal({});
    });
  });
});
