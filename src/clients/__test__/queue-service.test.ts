import axios from 'axios';
import { QueueServiceClient } from '../queue-service';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe(__filename, () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createQueue', () => {
    it('returns status created when new container is created without metadata', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 201,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.createQueue('test-queue').then((data) => {
        // Assert
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
        expect(mockAxios.post.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/queue',
        );
        expect(mockAxios.post.mock.calls[0][1]).toStrictEqual({
          name: 'test-queue',
        });
        expect(data).toStrictEqual({ status: 'created' });
      });
    });

    it('returns status created when new container is created with resource metadata', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 201,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client
        .createQueue('test-queue', { resource: 'someResource' })
        .then((data) => {
          // Assert
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/queue',
          );
          expect(mockAxios.post.mock.calls[0][1]).toStrictEqual({
            name: 'test-queue',
            resource: 'someResource',
          });
          expect(data).toStrictEqual({ status: 'created' });
        });
    });

    it('returns status created when new container is created with dlq metadata', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 201,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client
        .createQueue('test-queue', { dlq: 'someDlq' })
        .then((data) => {
          // Assert
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/queue',
          );
          expect(mockAxios.post.mock.calls[0][1]).toStrictEqual({
            name: 'test-queue',
            dlq: 'someDlq',
          });
          expect(data).toStrictEqual({ status: 'created' });
        });
    });

    it('returns status exists when container already exists.', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 200,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.createQueue('test-queue').then((data) => {
        // Assert
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
        expect(mockAxios.post.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/queue',
        );
        expect(mockAxios.post.mock.calls[0][1]).toStrictEqual({
          name: 'test-queue',
        });
        expect(data).toStrictEqual({ status: 'exists' });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.createQueue('test-queue')).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while creating the queue.',
        }),
      );
    });
  });

  describe('deleteMessage', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({
        status: 200,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.deleteMessage('test-queue', '12345').then((data) => {
        // Assert
        expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockAxios.delete.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/message/test-queue/12345',
        );
        expect(data).toBe(undefined);
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({
        status: 500,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.deleteMessage('test-queue', '12345'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while deleting the message.',
          }),
        )
        .then(() => {
          expect(mockAxios.delete).toHaveBeenCalledTimes(1);
          expect(mockAxios.delete.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/message/test-queue/12345',
          );
        });
    });
  });

  describe('deleteQueue', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({
        status: 204,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.deleteQueue('test-queue').then((data) => {
        // Assert
        expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockAxios.delete.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/queue/test-queue',
        );
        expect(data).toBe(undefined);
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({
        status: 500,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.deleteQueue('test-queue'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while deleting the queue.',
          }),
        )
        .then(() => {
          expect(mockAxios.delete).toHaveBeenCalledTimes(1);
          expect(mockAxios.delete.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/queue/test-queue',
          );
        });
    });
  });

  describe('enqueueMessage', () => {
    describe('returns a resolved promise when successful', () => {
      it('object', () => {
        // Arrange
        const message = { a: '1', b: '2' };
        mockAxios.post.mockResolvedValue({
          status: 200,
        });
        const client = new QueueServiceClient('http://127.0.0.1:8080');

        // Act
        return client.enqueueMessage('test-queue', message).then((data) => {
          // Assert
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/message/test-queue',
          );
          expect(mockAxios.post.mock.calls[0][1]).toBe(message);
          expect(data).toBe(undefined);
        });
      });

      it('string', () => {
        // Arrange
        const message = 'test message';
        mockAxios.post.mockResolvedValue({
          status: 200,
        });
        const client = new QueueServiceClient('http://127.0.0.1:8080');

        // Act
        return client.enqueueMessage('test-queue', message).then((data) => {
          // Assert
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/message/test-queue',
          );
          expect(mockAxios.post.mock.calls[0][1]).toBe(message);
          expect(data).toBe(undefined);
        });
      });

      it('number', () => {
        // Arrange
        const message = 12.34;
        mockAxios.post.mockResolvedValue({
          status: 200,
        });
        const client = new QueueServiceClient('http://127.0.0.1:8080');

        // Act
        return client.enqueueMessage('test-queue', message).then((data) => {
          // Assert
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/message/test-queue',
          );
          expect(mockAxios.post.mock.calls[0][1]).toBe(message);
          expect(data).toBe(undefined);
        });
      });

      it('boolean', () => {
        // Arrange
        const message = true;
        mockAxios.post.mockResolvedValue({
          status: 200,
        });
        const client = new QueueServiceClient('http://127.0.0.1:8080');

        // Act
        return client.enqueueMessage('test-queue', message).then((data) => {
          // Assert
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/message/test-queue',
          );
          expect(mockAxios.post.mock.calls[0][1]).toBe(message);
          expect(data).toBe(undefined);
        });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return expect(() =>
        client.enqueueMessage('test-queue', 'test message'),
      ).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while enqueueing the message.',
        }),
      );
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
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: message,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.fetchMessage('test-queue').then((data) => {
        // Assert
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/message/test-queue',
        );
        expect(data).toBe(message);
      });
    });

    it('resolves a empty promise when successful and no message exists', () => {
      // Arrange
      const message = {};
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: message,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.fetchMessage('test-queue').then((data) => {
        // Assert
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/message/test-queue',
        );
        expect(data).toBe(undefined);
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act & Assert
      return expect(() => client.fetchMessage('test-queue')).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while fetching a message.',
        }),
      );
    });
  });

  describe('getQueueDetails', () => {
    it('returns a object when successful and resource exists', () => {
      // Arrange
      const message = {
        resource: 'asdf',
        dlq: 'asdf-dlq',
      };
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: message,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.getQueueDetails('test-queue').then((data) => {
        // Assert
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/queue/test-queue/details',
        );
        expect(data).toStrictEqual(message);
      });
    });

    it('resolves a empty promise when successful and no resource exists', () => {
      // Arrange
      const message = {};
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: message,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.getQueueDetails('test-queue').then((data) => {
        // Assert
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/queue/test-queue/details',
        );
        expect(data).toStrictEqual({ resource: undefined, dlq: undefined });
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act & Assert
      return expect(() => client.getQueueDetails('test-queue')).rejects.toEqual(
        expect.objectContaining({
          message:
            'An error occurred while obtaining the details of the queue.',
        }),
      );
    });
  });

  describe('getQueueLength', () => {
    it('returns a object with the size when successful', () => {
      // Arrange
      const message = {
        size: 0,
      };
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: message,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.getQueueLength('test-queue').then((data) => {
        // Assert
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/queue/test-queue/length',
        );
        expect(data).toStrictEqual(message);
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act & Assert
      return expect(() => client.getQueueLength('test-queue')).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while obtaining the size of the queue.',
        }),
      );
    });
  });

  describe('listQueues', () => {
    it('returns a list of queue names when successful', () => {
      // Arrange
      const message = ['test1', 'test2'];
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: message,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.listQueues().then((data) => {
        // Assert
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/queues',
        );
        expect(data).toStrictEqual(message);
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act & Assert
      return expect(() => client.listQueues()).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while listing the available queues.',
        }),
      );
    });
  });

  describe('updateQueue', () => {
    it('resolves a empty promise when resource is updated and result is successful', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 200,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client
        .updateQueue('test-queue', { resource: 'NULL' })
        .then((data) => {
          // Assert
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/queue/test-queue',
          );
          expect(data).toBe(undefined);
        });
    });

    it('resolves a empty promise when dlq is updated to null and result is successful', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 200,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client.updateQueue('test-queue', { dlq: 'NULL' }).then((data) => {
        // Assert
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
        expect(mockAxios.post.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/queue/test-queue',
        );
        expect(data).toBe(undefined);
      });
    });

    it('resolves a empty promise when dlq is updated and result is successful', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 200,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return client
        .updateQueue('test-queue', { dlq: 'someDlqResource' })
        .then((data) => {
          // Assert
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/queue/test-queue',
          );
          expect(data).toBe(undefined);
        });
    });

    it('errors when no update actions are provided', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 500,
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.updateQueue('test-queue'))
        .rejects.toEqual(
          expect.objectContaining({
            message:
              'No update actions specified. Please update at least one option.',
          }),
        )
        .then(() => {
          expect(mockAxios.post).toHaveBeenCalledTimes(0);
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new QueueServiceClient('http://127.0.0.1:8080');

      // Act & Assert
      return expect(() =>
        client.updateQueue('test-queue', { resource: 'test' }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: 'An error occurred while updating the queue.',
        }),
      );
    });
  });
});
