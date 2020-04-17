const _ = require('lodash');
const chai = require('chai');
const axios = require('axios');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const verror = require('verror');

describe('notification-service', () => {
  beforeEach(() => {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    this.sandbox.restore();
  });

  const getClient = (options) => {
    const defaults = {
      socketClient: () => {},
    };
    const opts = _.merge(defaults, options);
    const NotificationService = proxyquire('./notification-service', {
      'socket.io-client': opts.socketClient,
    });

    return new NotificationService('http://127.0.0.1:8080');
  };

  describe('emit', () => {
    describe('returns successful promise when underlying service returns success', () => {
      it('message is string', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        postStub.returns(Promise.resolve({
          status: 200,
        }));
        const client = getClient();

        // Act
        return client.emit('test-topic', 'some message').then(() => {
          // assert
          const axiosPostCalls = postStub.getCalls();
          chai.expect(axiosPostCalls.length).to.be.eql(1);
          chai.expect(axiosPostCalls[0].args[0]).to.be.eql('http://127.0.0.1:8080/emit/test-topic');
          chai.expect(axiosPostCalls[0].args[1]).to.be.eql('some message');
        });
      });

      it('message is object', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        postStub.returns(Promise.resolve({
          status: 200,
        }));
        const client = getClient();

        // Act
        const msg = { f1: 'v1', f2: 'v2' };
        return client.emit('test-topic', msg).then(() => {
          // assert
          const axiosPostCalls = postStub.getCalls();
          chai.expect(axiosPostCalls.length).to.be.eql(1);
          chai.expect(axiosPostCalls[0].args[0]).to.be.eql('http://127.0.0.1:8080/emit/test-topic');
          chai.expect(axiosPostCalls[0].args[1]).to.be.eql(msg);
        });
      });
    });

    it('return rejected promise when underlying service returns non 200', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 400,
        data: 'some response',
      }));
      const client = getClient();

      // Act
      return client.emit('test-topic', 'some message').catch((err) => {
        // assert
        const axiosPostCalls = postStub.getCalls();
        chai.expect(axiosPostCalls.length).to.be.eql(1);
        chai.expect(axiosPostCalls[0].args[0]).to.be.eql('http://127.0.0.1:8080/emit/test-topic');
        chai.expect(axiosPostCalls[0].args[1]).to.be.eql('some message');
        chai.expect(verror.info(err)).to.be.eql({
          status: 400,
          body: 'some response',
        });
      });
    });
  });

  describe('on', () => {
    it('wires event handler to base socket', () => {
      // Arrange
      const handler = () => {};
      const socketStub = { on: sinon.stub() };

      const client = getClient({
        socketClient: () => socketStub,
      });

      // Act
      client.on('topic', handler);

      // Assert
      const onCalls = socketStub.on.getCalls();
      chai.expect(onCalls.length).to.be.eql(1);
      chai.expect(onCalls[0].args[0]).to.be.eql('topic');
      chai.expect(onCalls[0].args[1]).to.be.eql(handler);
    });
  });

  describe('off', () => {
    it('un-wires event handler on base socket', () => {
      // Arrange
      const handler = () => {};
      const socketStub = { off: sinon.stub() };

      const client = getClient({
        socketClient: () => socketStub,
      });

      // Act
      client.off('topic', handler);

      // Assert
      const onCalls = socketStub.off.getCalls();
      chai.expect(onCalls.length).to.be.eql(1);
      chai.expect(onCalls[0].args[0]).to.be.eql('topic');
      chai.expect(onCalls[0].args[1]).to.be.eql(handler);
    });
  });

  describe('close', () => {
    it('closes the base socket', () => {
      // Arrange
      const socketStub = { close: sinon.stub() };

      const client = getClient({
        socketClient: () => socketStub,
      });

      // Act
      client.close();

      // Assert
      const onCalls = socketStub.close.getCalls();
      chai.expect(onCalls.length).to.be.eql(1);
    });
  });
});
