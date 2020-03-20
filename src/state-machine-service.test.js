const chai = require('chai');
const axios = require('axios');
const sinon = require('sinon');

const StateMachineService = require('./state-machine-service');

describe('state-machine-service', () => {
  beforeEach(() => {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    this.sandbox.restore();
  });

  describe('createStateMachine', () => {
    describe('returns status created when new container is created', () => {
      it('definition is object', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        const definition = { a: 'a', b: 'b' };
        postStub.returns(Promise.resolve({
          status: 200,
          data: { uuid: 'abcde12345' },
        }));
        const client = new StateMachineService('http://127.0.0.1:8080');

        // Act
        return client.createStateMachine(definition)
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machine');
            chai.expect(calls[0].args[1]).to.be.eql(definition);
            chai.expect(data).to.be.eql({ status: 'created', uuid: 'abcde12345' });
          });
      });

      it('definition is string', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        const definition = { a: 'a', b: 'b' };
        postStub.returns(Promise.resolve({
          status: 200,
          data: { uuid: 'abcde12345' },
        }));
        const client = new StateMachineService('http://127.0.0.1:8080');

        // Act
        return client.createStateMachine(JSON.stringify(definition))
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machine');
            chai.expect(calls[0].args[1]).to.be.equal(JSON.stringify(definition));
            chai.expect(data).to.be.eql({ status: 'created', uuid: 'abcde12345' });
          });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
        data: 'Test error',
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.createStateMachine({ test: 'test' })
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while creating the state machine.');
        });
    });
  });

  describe('getDetailsForExecution', () => {
    it('returns execution details when execution id is found.', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'get');
      const definition = { a: 'a', b: 'b' };
      postStub.returns(Promise.resolve({
        status: 200,
        data: definition,
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.getDetailsForExecution('test-123')
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/execution/test-123');
          chai.expect(data).to.be.eql(definition);
        });
    });

    it('returns undefinied when execution id is not found', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'get');
      postStub.returns(Promise.resolve({
        status: 404,
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.getDetailsForExecution('test-123')
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/execution/test-123');
          chai.expect(data).to.be.eql(undefined);
        });
    });

    it('errors when status is not known', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'get');
      postStub.returns(Promise.resolve({
        status: 500,
        data: 'Test error',
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.getDetailsForExecution('test-123')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while obtaining details of the execution.');
        });
    });
  });

  describe('getStateMachine', () => {
    it('returns active machine definition when machine id is found.', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'get');
      const definition = { a: 'a', b: 'b' };
      postStub.returns(Promise.resolve({
        status: 200,
        data: definition,
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.getStateMachine('test-123')
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machine/test-123');
          chai.expect(data).to.be.eql(definition);
        });
    });

    it('returns undefinied when machine id is not found', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'get');
      postStub.returns(Promise.resolve({
        status: 404,
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.getStateMachine('test-123')
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machine/test-123');
          chai.expect(data).to.be.eql(undefined);
        });
    });

    it('errors when status is not known', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'get');
      postStub.returns(Promise.resolve({
        status: 500,
        data: 'Test error',
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.getStateMachine('test-123')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while obtaining details of the state machine.');
        });
    });
  });

  describe('invokeStateMachine', () => {
    describe('returns status invoked when invocation successful', () => {
      it('data is object', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        const argData = { a: 'a', b: 'b' };
        postStub.returns(Promise.resolve({
          status: 200,
          data: { id: 'abcde12345' },
        }));
        const client = new StateMachineService('http://127.0.0.1:8080');

        // Act
        return client.invokeStateMachine('test-123', argData)
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machine/test-123/invoke');
            chai.expect(calls[0].args[1]).to.be.eql(argData);
            chai.expect(data).to.be.eql({ status: 'invoked', id: 'abcde12345' });
          });
      });

      it('data is string', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        const argData = { a: 'a', b: 'b' };
        postStub.returns(Promise.resolve({
          status: 200,
          data: { id: 'abcde12345' },
        }));
        const client = new StateMachineService('http://127.0.0.1:8080');

        // Act
        return client.invokeStateMachine('test-123', JSON.stringify(argData))
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machine/test-123/invoke');
            chai.expect(calls[0].args[1]).to.be.equal(JSON.stringify(argData));
            chai.expect(data).to.be.eql({ status: 'invoked', id: 'abcde12345' });
          });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
        data: 'Test error',
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.invokeStateMachine('test-123', {})
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while invoking the state machine.');
        });
    });
  });

  describe('listStateMachines', () => {
    it('returns a list of state machines when called.', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'get');
      const results = [];
      postStub.returns(Promise.resolve({
        status: 200,
        data: results,
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.listStateMachines()
        .then((data) => {
          // Assert
          const calls = postStub.getCalls();
          chai.expect(calls.length).to.be.equal(1);
          chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machines');
          chai.expect(data).to.be.eql(results);
        });
    });

    it('errors when status is not known', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'get');
      postStub.returns(Promise.resolve({
        status: 500,
        data: 'Test error',
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.listStateMachines()
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while listing the available state machines.');
        });
    });
  });

  describe('updateStateMachine', () => {
    describe('returns status updated when machine found', () => {
      it('definition is object', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        const definition = { a: 'a', b: 'b' };
        postStub.returns(Promise.resolve({
          status: 200,
          data: { uuid: 'abcde12345' },
        }));
        const client = new StateMachineService('http://127.0.0.1:8080');

        // Act
        return client.updateStateMachine('abcde12345', definition)
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machine/abcde12345');
            chai.expect(calls[0].args[1]).to.be.eql(definition);
            chai.expect(data).to.be.eql({ status: 'updated', uuid: 'abcde12345' });
          });
      });

      it('definition is string', () => {
        // Arrange
        const postStub = this.sandbox.stub(axios, 'post');
        const definition = { a: 'a', b: 'b' };
        postStub.returns(Promise.resolve({
          status: 200,
          data: { uuid: 'abcde12345' },
        }));
        const client = new StateMachineService('http://127.0.0.1:8080');

        // Act
        return client.updateStateMachine('abcde12345', JSON.stringify(definition))
          .then((data) => {
            // Assert
            const calls = postStub.getCalls();
            chai.expect(calls.length).to.be.equal(1);
            chai.expect(calls[0].args[0]).to.be.equal('http://127.0.0.1:8080/machine/abcde12345');
            chai.expect(calls[0].args[1]).to.be.equal(JSON.stringify(definition));
            chai.expect(data).to.be.eql({ status: 'updated', uuid: 'abcde12345' });
          });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postStub = this.sandbox.stub(axios, 'post');
      postStub.returns(Promise.resolve({
        status: 500,
        data: 'Test error',
      }));
      const client = new StateMachineService('http://127.0.0.1:8080');

      // Act
      return client.updateStateMachine('abcde12345', {})
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while updating the state machine.');
        });
    });
  });
});
