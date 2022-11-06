import axios from 'axios';
import fs from 'fs';

import { ServerlessFunctionsClient } from '../serverless-functions';
import * as utils from '../../lib/utils';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));
const mockFs = fs as jest.Mocked<typeof fs>;

jest.mock('../../lib/utils', () => ({
  ...jest.requireActual('../../lib/utils'),
  getRequestOptions: jest.fn(),
  createArchiveFromDirectory: jest.fn(),
}));
const mockUtils = utils as jest.Mocked<typeof utils>;

describe(__filename, () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createFunction', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const postSpy = mockAxios.post;
      postSpy.mockResolvedValue({
        status: 201,
        data: {
          id: 'test-id',
        },
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return client.createFunction('test').then((data) => {
        // Assert
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/create',
        );
        expect(postSpy.mock.calls[0][1]).toStrictEqual({ name: 'test' });
        expect(data).toStrictEqual({ id: 'test-id', status: 'created' });
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const postSpy = mockAxios.post;
      postSpy.mockResolvedValue({
        status: 500,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.createFunction('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message:
              'An error occurred while creating the serverless function.',
          }),
        )
        .then(() => {
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/create',
          );
          expect(postSpy.mock.calls[0][1]).toStrictEqual({ name: 'test' });
        });
    });
  });

  describe('listFunctions', () => {
    it('returns a list of containers when underlying call succeeds', () => {
      // Arrange
      const expectedResult = [{ id: 'test' }, { id: 'test2' }];
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 200,
        data: expectedResult,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return client.listFunctions().then((functions) => {
        // Assert
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy.mock.calls[0][0]).toBe('http://127.0.0.1:8080/v1/list');
        expect(functions).toStrictEqual(expectedResult);
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.listFunctions()).rejects.toEqual(
        expect.objectContaining({
          message:
            'An error occurred while listing available serverless functions.',
        }),
      );
    });
  });

  describe('deleteFunction', () => {
    it('returns a resolved promise when successful', async () => {
      // Arrange
      const deleteSpy = mockAxios.delete;
      deleteSpy.mockResolvedValue({
        status: 204,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      await client.deleteFunction('test');

      // Assert
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy.mock.calls[0][0]).toBe('http://127.0.0.1:8080/v1/test');
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const deleteSpy = mockAxios.delete;
      deleteSpy.mockResolvedValue({
        status: 500,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.deleteFunction('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while deleting the function.',
          }),
        )
        .then(() => {
          expect(deleteSpy).toHaveBeenCalledTimes(1);
          expect(deleteSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/test',
          );
        });
    });
  });

  describe('invokeFunction', () => {
    it('when successful returns result of function', () => {
      // Arrange
      const postSpy = mockAxios.post;
      postSpy.mockResolvedValue({
        status: 200,
        data: {
          foo: 'bar',
          one: 1,
        },
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return client.invokeFunction('test', { foo: 'bar' }).then((result) => {
        // Assert
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/invoke/test',
        );
        expect(result).toStrictEqual({ foo: 'bar', one: 1 });
      });
    });

    it('when asynchronously invoked returns HTTP 202 with no content', () => {
      // Arrange
      const postSpy = mockAxios.post;
      postSpy.mockResolvedValue({
        status: 202,
        data: undefined,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return client
        .invokeFunction('test', { foo: 'bar' }, true)
        .then((result) => {
          // Assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/invoke/test?async=true',
          );
          expect(result).toBe(undefined);
        });
    });

    it('when failure returns rejected promise', () => {
      // Arrange
      const postSpy = mockAxios.post;
      postSpy.mockResolvedValue({
        status: 500,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.invokeFunction('test', { foo: 'bar' }))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while invoking the function.',
          }),
        )
        .then(() => {
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/invoke/test',
          );
        });
    });
  });

  describe('getFunctionDetails', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const expectedResult = {
        id: 'testFunc',
      };
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 200,
        data: expectedResult,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return client.getFunctionDetails('test').then((data) => {
        // Assert
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/inspect/test',
        );
        expect(data).toStrictEqual(expectedResult);
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const getSpy = mockAxios.get;
      getSpy.mockResolvedValue({
        status: 500,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return expect(() => client.getFunctionDetails('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while fetching function details.',
          }),
        )
        .then(() => {
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/inspect/test',
          );
        });
    });
  });

  describe('updateFunctionCode', () => {
    describe('returns a resolved promise', () => {
      it('when user provided zip file', () => {
        // Arrange
        const postSpy = mockAxios.post;
        postSpy.mockResolvedValue({
          status: 201,
          data: { foo: 'bar' },
        });
        const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

        // Act
        return client
          .updateFunctionCode('test', 'node', 'foo/bar:main', '/tmp/foo.zip')
          .then((data) => {
            // Assert
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy.mock.calls[0][0]).toBe(
              'http://127.0.0.1:8080/v1/uploadCode/test',
            );
            expect(data).toStrictEqual({ foo: 'bar' });
          });
      });

      it('when user provided folder', () => {
        // Arrange
        const postSpy = mockAxios.post;
        postSpy.mockResolvedValue({
          status: 201,
          data: { foo: 'bar' },
        });
        const createArchiveSpy = mockUtils.createArchiveFromDirectory;
        createArchiveSpy.mockResolvedValue({
          userSupplied: false,
          filePath: '/tmp/foo.zip',
        });
        const existsSyncSpy = mockFs.existsSync;
        existsSyncSpy.mockReturnValue(true);
        const unlinkSyncSpy = mockFs.unlinkSync;
        unlinkSyncSpy.mockImplementation(jest.fn);
        const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

        // Act
        return client
          .updateFunctionCode('test', 'node', 'foo/bar:main', '/tmp/foo')
          .then((data) => {
            // Assert
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy.mock.calls[0][0]).toBe(
              'http://127.0.0.1:8080/v1/uploadCode/test',
            );
            expect(data).toStrictEqual({ foo: 'bar' });

            expect(unlinkSyncSpy).toHaveBeenCalledTimes(1);
            expect(unlinkSyncSpy.mock.calls[0][0]).toBe('/tmp/foo.zip');
          });
      });

      it('when user provided zip file with context', () => {
        // Arrange
        const postSpy = mockAxios.post;
        postSpy.mockResolvedValue({
          status: 201,
          data: { foo: 'bar' },
        });
        const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

        // Act
        return client
          .updateFunctionCode(
            'test',
            'node',
            'foo/bar:main',
            '/tmp/foo.zip',
            'someContext',
          )
          .then((data) => {
            // Assert
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy.mock.calls[0][0]).toBe(
              'http://127.0.0.1:8080/v1/uploadCode/test',
            );
            expect(data).toStrictEqual({ foo: 'bar' });
          });
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        status: 500,
      });
      const client = new ServerlessFunctionsClient('http://127.0.0.1:8080');

      // Act
      return expect(() =>
        client.updateFunctionCode(
          'test',
          'node',
          'boo/bar:main',
          './tmp/foo.zip',
        ),
      )
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while updating the function.',
          }),
        )
        .then(() => {
          expect(mockAxios.post).toHaveBeenCalledTimes(1);
          expect(mockAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/uploadCode/test',
          );
        });
    });
  });
});
