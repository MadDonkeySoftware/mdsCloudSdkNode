import axios from 'axios';
import { VError } from 'verror';
import { AuthManager } from '../../lib';
import * as getSocketClientModule from '../../wrappers/get-socket-client';
import { NotificationServiceClient } from '../notification-service';

jest.mock('../../wrappers/get-socket-client');
const mockGetSocketClient = (
  getSocketClientModule as jest.Mocked<typeof getSocketClientModule>
).getSocketClient;

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

  describe('emit', () => {
    describe('returns successful promise when underlying service returns success', () => {
      it('message is string', () => {
        // Arrange
        const postSpy = jest.spyOn(axios, 'post');
        postSpy.mockResolvedValue({
          status: 200,
        });
        // const getSocketClientSpy = mockGetSocketClient.mo;
        mockGetSocketClient.mockReturnValue({} as any);
        const client = new NotificationServiceClient('http://127.0.0.1:8080');

        // Act
        return client.emit('test-topic', 'some message').then(() => {
          // assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/emit/test-topic',
          );
          expect(postSpy.mock.calls[0][1]).toBe('some message');
        });
      });

      it('message is object', () => {
        // Arrange
        const postSpy = jest.spyOn(axios, 'post');
        postSpy.mockResolvedValue({
          status: 200,
        });
        mockGetSocketClient.mockReturnValue({} as any);
        const client = new NotificationServiceClient('http://127.0.0.1:8080');

        // Act
        const msg = { f1: 'v1', f2: 'v2' };
        return client.emit('test-topic', msg).then(() => {
          // assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/emit/test-topic',
          );
          expect(postSpy.mock.calls[0][1]).toBe(msg);
        });
      });
    });

    it('socket client auth gets token from auth manager', () => {
      // Arrange
      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockResolvedValue({
        status: 200,
      });

      const fakeAuthManager = {
        getAuthenticationToken: jest.fn().mockResolvedValue('test token'),
      } as any as AuthManager;

      let authUnderTest: (cb: (data: object) => void) => void;
      mockGetSocketClient.mockImplementation((_, opts) => {
        authUnderTest = opts.auth as any;
        return {} as any;
      });
      new NotificationServiceClient('http://127.0.0.1:8080', fakeAuthManager);

      // Act
      return new Promise((done) => {
        expect.assertions(1);
        authUnderTest((data) => {
          expect(data).toStrictEqual({ token: 'test token' });
          done(null);
        });
      });
    });

    it('return rejected promise when underlying service returns non 200', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 400,
        data: 'some response',
      });
      mockGetSocketClient.mockReturnValue({} as any);
      const client = new NotificationServiceClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.emit('test-topic', 'some message'))
        .rejects.toStrictEqual(
          new VError(
            'An error occurred while attempting to emit the message.',
            {
              status: 400,
              data: 'some response',
            },
          ),
        )
        .then(() => {
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/emit/test-topic',
          );
          expect(mockAxios.post.mock.calls[0][1]).toBe('some message');
        });
    });
  });

  describe('on', () => {
    it('wires event handler to base socket', () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const handler = () => {};
      const socketStub = { on: jest.fn() };
      mockGetSocketClient.mockReturnValue(socketStub as any);

      const client = new NotificationServiceClient('http://127.0.0.1:8080');

      // Act
      client.on('topic', handler);

      // Assert
      expect(socketStub.on).toHaveBeenCalledTimes(1);
      const onCalls = socketStub.on.mock.calls;
      expect(onCalls[0][0]).toBe('topic');
      expect(onCalls[0][1]).toBe(handler);
    });
  });

  describe('off', () => {
    it('un-wires event handler on base socket', () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const handler = () => {};
      const socketStub = { off: jest.fn() };
      mockGetSocketClient.mockReturnValue(socketStub as any);

      const client = new NotificationServiceClient('http://127.0.0.1:8080');

      // Act
      client.off('topic', handler);

      // Assert
      expect(socketStub.off).toHaveBeenCalledTimes(1);
      const offCalls = socketStub.off.mock.calls;
      expect(offCalls[0][0]).toBe('topic');
      expect(offCalls[0][1]).toBe(handler);
    });
  });

  describe('close', () => {
    it('closes the base socket', () => {
      // Arrange
      const socketStub = { disconnect: jest.fn() };
      mockGetSocketClient.mockReturnValue(socketStub as any);

      const client = new NotificationServiceClient('http://127.0.0.1:8080');

      // Act
      client.close();

      // Assert
      expect(socketStub.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
