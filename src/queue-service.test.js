const chai = require('chai');
const got = require('got');
const sinon = require('sinon');


const QueueService = require('./queue-service');

describe('queue-service', () => {
  beforeEach(() => {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    this.sandbox.restore();
  });

  describe('createQueue', () => {
    it('returns status created when new container is created', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 201,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.createQueue('test-queue')
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue');
          chai.expect(calls[0].args[1].body).to.be.equal(JSON.stringify({ name: 'test-queue' }));
          chai.expect(data).to.be.eql({ status: 'created' });
        });
    });

    it('returns status created when new container is created', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 201,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.createQueue('test-queue', { resource: 'http://127.0.0.1:8888/invoke' })
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue');
          chai.expect(calls[0].args[1].body).to.be.equal(JSON.stringify({ name: 'test-queue', resource: 'http://127.0.0.1:8888/invoke' }));
          chai.expect(data).to.be.eql({ status: 'created' });
        });
    });

    it('returns status exists when container already exists.', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 204,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.createQueue('test-queue')
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue');
          chai.expect(calls[0].args[1].body).to.be.equal(JSON.stringify({ name: 'test-queue' }));
          chai.expect(data).to.be.eql({ status: 'exists' });
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 500,
        body: 'Test error',
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.createQueue('test-queue')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while creating the queue.');
        });
    });
  });

  describe('deleteMessage', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(got, 'delete');
      deleteStub.returns(Promise.resolve({
        statusCode: 200,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.deleteMessage('test-queue', '12345')
        .then((data) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/message/12345');
          chai.expect(data).to.be.equal(undefined);
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(got, 'delete');
      deleteStub.returns(Promise.resolve({
        statusCode: 500,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.deleteMessage('test-queue', '12345')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/message/12345');
          chai.expect(err.message).to.be.equal('An error occurred while deleting the message.');
        });
    });
  });

  describe('deleteQueue', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(got, 'delete');
      deleteStub.returns(Promise.resolve({
        statusCode: 204,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.deleteQueue('test-queue')
        .then((data) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue');
          chai.expect(data).to.be.equal(undefined);
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(got, 'delete');
      deleteStub.returns(Promise.resolve({
        statusCode: 500,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.deleteQueue('test-queue')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue');
          chai.expect(err.message).to.be.equal('An error occurred while deleting the queue.');
        });
    });
  });

  describe('enqueueMessage', () => {
    describe('returns a resolved promise when successful', () => {
      it('object', () => {
        // Arrange
        const message = { a: '1', b: '2' };
        const postStub = this.sandbox.stub(got, 'post');
        postStub.returns(Promise.resolve({
          statusCode: 200,
        }));
        const client = new QueueService('http://127.0.0.1:8080');

        // Act
        return client.enqueueMessage('test-queue', message)
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/message');
            chai.expect(calls[0].args[1].body).to.be.equal(JSON.stringify(message));
            chai.expect(data).to.be.eql(undefined);
          });
      });

      it('string', () => {
        // Arrange
        const message = 'test message';
        const postStub = this.sandbox.stub(got, 'post');
        postStub.returns(Promise.resolve({
          statusCode: 200,
        }));
        const client = new QueueService('http://127.0.0.1:8080');

        // Act
        return client.enqueueMessage('test-queue', message)
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/message');
            chai.expect(calls[0].args[1].body).to.be.equal(message);
            chai.expect(data).to.be.eql(undefined);
          });
      });

      it('number', () => {
        // Arrange
        const message = 12.34;
        const postStub = this.sandbox.stub(got, 'post');
        postStub.returns(Promise.resolve({
          statusCode: 200,
        }));
        const client = new QueueService('http://127.0.0.1:8080');

        // Act
        return client.enqueueMessage('test-queue', message)
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/message');
            chai.expect(calls[0].args[1].body).to.be.equal(message.toString());
            chai.expect(data).to.be.eql(undefined);
          });
      });

      it('boolean', () => {
        // Arrange
        const message = true;
        const postStub = this.sandbox.stub(got, 'post');
        postStub.returns(Promise.resolve({
          statusCode: 200,
        }));
        const client = new QueueService('http://127.0.0.1:8080');

        // Act
        return client.enqueueMessage('test-queue', message)
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/message');
            chai.expect(calls[0].args[1].body).to.be.equal(message.toString());
            chai.expect(data).to.be.eql(undefined);
          });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 500,
        body: 'Test error',
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.enqueueMessage('test-queue', 'test message')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while enqueueing the message.');
        });
    });
  });

  describe('fetchMessage', () => {
    it('returns a message object when successful and message exists', () => {
      // Arrange
      const message = {
        id: '1234',
        fr: 123456.78,
        message: 'test message',
        rc: 1,
        sent: 123457.89,
      };
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(message),
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.fetchMessage('test-queue')
        .then((data) => {
          // Assert
          const calls = getStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/message');
          chai.expect(data).to.be.eql(message);
        });
    });

    it('resolves a empty promise when successful and no message exists', () => {
      // Arrange
      const message = {};
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(message),
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.fetchMessage('test-queue')
        .then((data) => {
          // Assert
          const calls = getStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/message');
          chai.expect(data).to.be.eql(undefined);
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 500,
        body: 'Test error',
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.fetchMessage('test-queue')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while fetching a message.');
        });
    });
  });

  describe('getQueueDetails', () => {
    it('returns a object when successful and resource exists', () => {
      // Arrange
      const message = {
        resource: 'asdf',
      };
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(message),
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.getQueueDetails('test-queue')
        .then((data) => {
          // Assert
          const calls = getStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/details');
          chai.expect(data).to.be.eql(message);
        });
    });

    it('resolves a empty promise when successful and no resource exists', () => {
      // Arrange
      const message = {};
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(message),
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.getQueueDetails('test-queue')
        .then((data) => {
          // Assert
          const calls = getStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/details');
          chai.expect(data).to.be.eql({ resource: undefined });
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 500,
        body: 'Test error',
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.getQueueDetails('test-queue')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while obtaining the details of the queue.');
        });
    });
  });

  describe('getQueueLength', () => {
    it('returns a object with the size when successful', () => {
      // Arrange
      const message = {
        size: 0,
      };
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(message),
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.getQueueLength('test-queue')
        .then((data) => {
          // Assert
          const calls = getStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue/length');
          chai.expect(data).to.be.eql(message);
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 500,
        body: 'Test error',
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.getQueueLength('test-queue')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while obtaining the size of the queue.');
        });
    });
  });

  describe('listQueues', () => {
    it('returns a list of queue names when successful', () => {
      // Arrange
      const message = [
        'test1',
        'test2',
      ];
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(message),
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.listQueues()
        .then((data) => {
          // Assert
          const calls = getStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queues');
          chai.expect(data).to.be.eql(message);
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 500,
        body: 'Test error',
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.listQueues()
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while listing the available queues.');
        });
    });
  });

  describe('updateQueue', () => {
    it('resolves a empty promise when resource is updated and result is successful', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 200,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.updateQueue('test-queue', { resource: 'NULL' })
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/queue/test-queue');
          chai.expect(data).to.be.eql(undefined);
        });
    });

    it('errors when no update actions are provided', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 500,
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.updateQueue('test-queue')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(0);
          chai.expect(err.message).to.be.equal('No update actions specified. Please update at least one option.');
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 500,
        body: 'Test error',
      }));
      const client = new QueueService('http://127.0.0.1:8080');

      // Act
      return client.updateQueue('test-queue', { resource: 'test' })
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while updating the queue.');
        });
    });
  });
});
