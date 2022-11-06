import axios from 'axios';
import { StateMachineListItem } from '../../types/state-machine-service';
import { StateMachineServiceClient } from '../state-machine-service';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../lib/utils', () => ({
  ...jest.requireActual('../../lib/utils'),
  getRequestOptions: jest.fn(),
}));

describe('state-machine-service', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createStateMachine', () => {
    describe('returns status created when new container is created', () => {
      it('definition is object', () => {
        // Arrange
        const postSpy = mockAxios.post;
        const definition = { a: 'a', b: 'b' };
        postSpy.mockResolvedValue({
          status: 200,
          data: { orid: 'orid:1:mdsCloud:::1:sm:abcde12345' },
        });
        const client = new StateMachineServiceClient('http://127.0.0.1:8080');

        // Act
        return client.createStateMachine(definition).then((data) => {
          // Assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/machine',
          );
          expect(postSpy.mock.calls[0][1]).toBe(definition);
          expect(data).toStrictEqual({
            orid: 'orid:1:mdsCloud:::1:sm:abcde12345',
          });
        });
      });

      it('definition is string', () => {
        // Arrange
        const postSpy = mockAxios.post;
        const definition = { a: 'a', b: 'b' };
        postSpy.mockResolvedValue({
          status: 200,
          data: { orid: 'orid:1:mdsCloud:::1:sm:abcde12345' },
        });
        const client = new StateMachineServiceClient('http://127.0.0.1:8080');

        // Act
        return client
          .createStateMachine(JSON.stringify(definition))
          .then((data) => {
            // Assert
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy.mock.calls[0][0]).toBe(
              'http://127.0.0.1:8080/v1/machine',
            );
            expect(postSpy.mock.calls[0][1]).toBe(JSON.stringify(definition));
            expect(data).toStrictEqual({
              orid: 'orid:1:mdsCloud:::1:sm:abcde12345',
            });
          });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postSpy = mockAxios.post;
      postSpy.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      expect.assertions(1);
      return expect(
        client.createStateMachine({ test: 'test' }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while creating the state machine.',
        }),
      );
    });
  });

  describe('getDetailsForExecution', () => {
    it('returns execution details when execution id is found.', () => {
      // Arrange
      const getSpy = mockAxios.get;
      const definition = { a: 'a', b: 'b' };
      getSpy.mockResolvedValue({
        status: 200,
        data: definition,
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      return client
        .getDetailsForExecution('orid:1:mdsCloud:::1:sm:test-123')
        .then((data) => {
          // Assert
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/execution/orid:1:mdsCloud:::1:sm:test-123',
          );
          expect(data).toStrictEqual(definition);
        });
    });

    it('returns undefined when execution id is not found', () => {
      // Arrange
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 404,
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      return client
        .getDetailsForExecution('orid:1:mdsCloud:::1:sm:test-123')
        .then((data) => {
          // Assert
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/execution/orid:1:mdsCloud:::1:sm:test-123',
          );
          expect(data).toBe(undefined);
        });
    });

    it('errors when status is not known', () => {
      // Arrange
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      expect.assertions(1);
      return expect(client.getDetailsForExecution('test-123')).rejects.toEqual(
        expect.objectContaining({
          message:
            'An error occurred while obtaining details of the execution.',
        }),
      );
    });
  });

  describe('getStateMachine', () => {
    it('returns active machine definition when machine id is found.', () => {
      // Arrange
      const getSpy = mockAxios.get;
      const definition = { a: 'a', b: 'b' };
      getSpy.mockResolvedValue({
        status: 200,
        data: definition,
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      return client
        .getStateMachine('orid:1:mdsCloud:::1:sm:test-123')
        .then((data) => {
          // Assert
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/machine/orid:1:mdsCloud:::1:sm:test-123',
          );
          expect(data).toBe(definition);
        });
    });

    it('returns undefinied when machine id is not found', () => {
      // Arrange
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 404,
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      return client
        .getStateMachine('orid:1:mdsCloud:::1:sm:test-123')
        .then((data) => {
          // Assert
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/machine/orid:1:mdsCloud:::1:sm:test-123',
          );
          expect(data).toBe(undefined);
        });
    });

    it('errors when status is not known', () => {
      // Arrange
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      expect.assertions(1);
      return expect(client.getStateMachine('test-123')).rejects.toEqual(
        expect.objectContaining({
          message:
            'An error occurred while obtaining details of the state machine.',
        }),
      );
    });
  });

  describe('invokeStateMachine', () => {
    describe('returns status invoked when invocation successful', () => {
      it('data is object', () => {
        // Arrange
        const postSpy = mockAxios.post;
        const argData = { a: 'a', b: 'b' };
        postSpy.mockResolvedValue({
          status: 200,
          data: { orid: 'orid:1:mdsCloud:::1:sm:test-123/abcde12345' },
        });
        const client = new StateMachineServiceClient('http://127.0.0.1:8080');

        // Act
        return client
          .invokeStateMachine('orid:1:mdsCloud:::1:sm:test-123', argData)
          .then((data) => {
            // Assert
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy.mock.calls[0][0]).toBe(
              'http://127.0.0.1:8080/v1/machine/orid:1:mdsCloud:::1:sm:test-123/invoke',
            );
            expect(postSpy.mock.calls[0][1]).toBe(argData);
            expect(data).toStrictEqual({
              orid: 'orid:1:mdsCloud:::1:sm:test-123/abcde12345',
            });
          });
      });

      it('data is string', () => {
        // Arrange
        const postSpy = mockAxios.post;
        const argData = { a: 'a', b: 'b' };
        postSpy.mockResolvedValue({
          status: 200,
          data: { orid: 'orid:1:mdsCloud:::1:sm:test-123/abcde12345' },
        });
        const client = new StateMachineServiceClient('http://127.0.0.1:8080');

        // Act
        return client
          .invokeStateMachine(
            'orid:1:mdsCloud:::1:sm:test-123',
            JSON.stringify(argData),
          )
          .then((data) => {
            // Assert
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy.mock.calls[0][0]).toBe(
              'http://127.0.0.1:8080/v1/machine/orid:1:mdsCloud:::1:sm:test-123/invoke',
            );
            expect(postSpy.mock.calls[0][1]).toBe(JSON.stringify(argData));
            expect(data).toStrictEqual({
              orid: 'orid:1:mdsCloud:::1:sm:test-123/abcde12345',
            });
          });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postSpy = mockAxios.post;
      postSpy.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      expect.assertions(1);
      return expect(client.invokeStateMachine('test-123', {})).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while invoking the state machine.',
        }),
      );
    });
  });

  describe('listStateMachines', () => {
    it('returns a list of state machines when called.', () => {
      // Arrange
      const getSpy = mockAxios.get;
      const results: StateMachineListItem[] = [];
      getSpy.mockResolvedValue({
        status: 200,
        data: results,
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      return client.listStateMachines().then((data) => {
        // Assert
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/machines',
        );
        expect(data).toBe(results);
      });
    });

    it('errors when status is not known', () => {
      // Arrange
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      expect.assertions(1);
      return expect(client.listStateMachines()).rejects.toEqual(
        expect.objectContaining({
          message:
            'An error occurred while listing the available state machines.',
        }),
      );
    });
  });

  describe('updateStateMachine', () => {
    describe('returns status updated when machine found', () => {
      it('definition is object', () => {
        // Arrange
        const postSpy = mockAxios.post;
        const definition = { a: 'a', b: 'b' };
        postSpy.mockResolvedValue({
          status: 200,
          data: { orid: 'orid:1:mdsCloud:::1:sm:abcde12345' },
        });
        const client = new StateMachineServiceClient('http://127.0.0.1:8080');

        // Act
        return client
          .updateStateMachine('orid:1:mdsCloud:::1:sm:abcde12345', definition)
          .then((data) => {
            // Assert
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy.mock.calls[0][0]).toBe(
              'http://127.0.0.1:8080/v1/machine/orid:1:mdsCloud:::1:sm:abcde12345',
            );
            expect(postSpy.mock.calls[0][1]).toBe(definition);
            expect(data).toStrictEqual({
              orid: 'orid:1:mdsCloud:::1:sm:abcde12345',
            });
          });
      });

      it('definition is string', () => {
        // Arrange
        const postSpy = mockAxios.post;
        const definition = { a: 'a', b: 'b' };
        postSpy.mockResolvedValue({
          status: 200,
          data: { orid: 'orid:1:mdsCloud:::1:sm:abcde12345' },
        });
        const client = new StateMachineServiceClient('http://127.0.0.1:8080');

        // Act
        return client
          .updateStateMachine(
            'orid:1:mdsCloud:::1:sm:abcde12345',
            JSON.stringify(definition),
          )
          .then((data) => {
            // Assert
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy.mock.calls[0][0]).toBe(
              'http://127.0.0.1:8080/v1/machine/orid:1:mdsCloud:::1:sm:abcde12345',
            );
            expect(postSpy.mock.calls[0][1]).toBe(JSON.stringify(definition));
            expect(data).toStrictEqual({
              orid: 'orid:1:mdsCloud:::1:sm:abcde12345',
            });
          });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const postSpy = mockAxios.post;
      postSpy.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      expect.assertions(1);
      return expect(
        client.updateStateMachine('abcde12345', {}),
      ).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while updating the state machine.',
        }),
      );
    });
  });

  describe('deleteFunction', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const deleteSpy = mockAxios.delete;
      deleteSpy.mockResolvedValue({
        status: 200,
        data: {
          orid: 'test',
        },
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      return client.deleteStateMachine('test').then((data) => {
        // Assert
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/machine/test',
        );
        expect(data).toStrictEqual({ orid: 'test' });
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const deleteSpy = mockAxios.delete;
      deleteSpy.mockResolvedValue({
        status: 500,
      });
      const client = new StateMachineServiceClient('http://127.0.0.1:8080');

      // Act
      expect.assertions(3);
      return expect(client.deleteStateMachine('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while deleting the state machine.',
          }),
        )
        .then(() => {
          expect(deleteSpy).toHaveBeenCalledTimes(1);
          expect(deleteSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/machine/test',
          );
        });
    });
  });
});
