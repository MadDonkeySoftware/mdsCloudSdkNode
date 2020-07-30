const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const fs = require('fs');


const ServerlessFunctions = require('./serverless-functions');
const utils = require('./lib/utils');

describe('serverless-functions', () => {
  beforeEach(() => {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    this.sandbox.restore();
  });

  describe('createFunction', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 201,
        data: {
          id: 'test-id',
        },
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.createFunction('test')
        .then((data) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/create');
          chai.expect(getCalls[0].args[1]).to.deep.equal({ name: 'test' });
          chai.expect(data).to.deep.equal({ id: 'test-id', status: 'created' });
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.createFunction('test')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/create');
          chai.expect(getCalls[0].args[1]).to.deep.equal({ name: 'test' });
          chai.expect(err.message).to.be.equal('An error occurred while creating the serverless function.');
        });
    });
  });

  describe('listFunctions', () => {
    it('returns a list of containers when underlying call succeeds', () => {
      // Arrange
      const expectedResult = [{ id: 'test' }, { id: 'test2' }];
      const getStub = this.sandbox.stub(axios, 'get');
      getStub.returns(Promise.resolve({
        status: 200,
        data: expectedResult,
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.listFunctions()
        .then((functions) => {
          // Assert
          const getCalls = getStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/list');
          chai.expect(functions).to.deep.eql(expectedResult);
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const getStub = this.sandbox.stub(axios, 'get');
      getStub.returns(Promise.resolve({
        status: 500,
        data: 'Test error',
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.listFunctions()
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while listing available serverless functions.');
        });
    });
  });

  describe('deleteFunction', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(axios, 'delete');
      deleteStub.returns(Promise.resolve({
        status: 204,
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.deleteFunction('test')
        .then((data) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/test');
          chai.expect(data).to.deep.equal({ status: 'deleted', id: 'test' });
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(axios, 'delete');
      deleteStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.deleteFunction('test')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/test');
          chai.expect(err.message).to.be.equal('An error occurred while deleting the function.');
        });
    });
  });

  describe('invokeFunction', () => {
    it('when successful returns result of function', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 200,
        data: {
          foo: 'bar',
          one: 1,
        },
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.invokeFunction('test', { foo: 'bar' })
        .then((result) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/invoke/test');
          chai.expect(result).to.deep.equal({ foo: 'bar', one: 1 });
        });
    });

    it('when failure returns rejected promise', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.invokeFunction('test', { foo: 'bar' })
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/invoke/test');
          chai.expect(err.message).to.be.equal('An error occurred while invoking the function.');
        });
    });
  });

  describe('getFunctionDetails', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const expectedResult = {
        id: 'testFunc',
      };
      const getStub = this.sandbox.stub(axios, 'get');
      getStub.returns(Promise.resolve({
        status: 200,
        data: expectedResult,
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.getFunctionDetails('test')
        .then((data) => {
          // Assert
          const getCalls = getStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/inspect/test');
          chai.expect(data).to.deep.eql(expectedResult);
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const getStub = this.sandbox.stub(axios, 'get');
      getStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.getFunctionDetails('test')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = getStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/inspect/test');
          chai.expect(err.message).to.be.equal('An error occurred while fetching function details.');
        });
    });
  });

  describe('updateFunctionCode', () => {
    describe('returns a resolved promise', () => {
      it('when user provided zip file', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        postStub.returns(Promise.resolve({
          status: 201,
          data: { foo: 'bar' },
        }));
        const client = new ServerlessFunctions('http://127.0.0.1:8080');

        // Act
        return client.updateFunctionCode('test', 'node', 'foo/bar:main', '/tmp/foo.zip')
          .then((data) => {
            // Assert
            const getCalls = postStub.getCalls();
            chai.expect(getCalls.length).to.be.equal(1);
            chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/uploadCode/test');
            chai.expect(data).to.deep.eql({ foo: 'bar' });
          });
      });

      it('when user provided folder', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        postStub.resolves({
          status: 201,
          data: { foo: 'bar' },
        });
        const createArchiveStub = this.sandbox.stub(utils, 'createArchiveFromDirectory');
        createArchiveStub.resolves({
          userSupplied: false,
          filePath: '/tmp/foo.zip',
        });
        const existsSyncStub = this.sandbox.stub(fs, 'existsSync');
        existsSyncStub.returns(true);
        const unlinkSyncStub = this.sandbox.stub(fs, 'unlinkSync');
        const client = new ServerlessFunctions('http://127.0.0.1:8080');

        // Act
        return client.updateFunctionCode('test', 'node', 'foo/bar:main', '/tmp/foo')
          .then((data) => {
            // Assert
            const getCalls = postStub.getCalls();
            chai.expect(getCalls.length).to.be.equal(1);
            chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/uploadCode/test');
            chai.expect(data).to.deep.eql({ foo: 'bar' });
            const unlinkSyncCalls = unlinkSyncStub.getCalls();
            chai.expect(unlinkSyncCalls.length).to.be.equal(1);
            chai.expect(unlinkSyncCalls[0].args[0]).to.be.equal('/tmp/foo.zip');
          });
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
      }));
      const client = new ServerlessFunctions('http://127.0.0.1:8080');

      // Act
      return client.updateFunctionCode('test', 'node', 'boo/bar:main', './tmp/foo.zip')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/v1/uploadCode/test');
          chai.expect(err.message).to.be.equal('An error occurred while invoking the function.');
        });
    });
  });
});
