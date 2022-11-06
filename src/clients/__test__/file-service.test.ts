import axios from 'axios';
import { FileServiceClient } from '../file-service';
import { AuthManager } from '../../lib';
import * as utils from '../../lib/utils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../lib/utils', () => ({
  urlJoin: jest.requireActual('../../lib/utils').urlJoin,
  getRequestOptions: jest.fn(),
  download: jest.fn(),
}));
const mockUtils = utils as jest.Mocked<typeof utils>;

const fakeAuthManager = {
  getAuthenticationToken: jest.fn(),
  setAuthenticationToken: jest.fn(),
} as any as AuthManager;

describe('file-service', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('listContainers', () => {
    it('returns a list of containers when underlying call succeeds', () => {
      // Arrange
      const expectedResult = ['test', 'test2'];
      const getSpy = mockedAxios.get;
      getSpy.mockResolvedValue({
        status: 200,
        data: expectedResult,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return client.listContainers().then((containers) => {
        // Assert
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/containers',
        );
        expect(containers).toBe(expectedResult);
      });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const getSpy = mockedAxios.get;
      getSpy.mockResolvedValue({
        status: 500,
        data: 'Test error',
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act & Assert
      return expect(client.listContainers()).rejects.toEqual(
        expect.objectContaining({
          message:
            'An error occurred while obtaining the list of available containers.',
        }),
      );
    });
  });

  describe('createContainer', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const postSpy = mockedAxios.post;
      postSpy.mockResolvedValue({
        status: 201,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return client.createContainer('test').then((data) => {
        // Assert
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/createContainer/test',
        );
        expect(data).toBe(undefined);
      });
    });

    it('returns a rejected promise when container already exists', () => {
      // Arrange
      const postSpy = mockedAxios.post;
      postSpy.mockResolvedValue({
        status: 409,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      expect.assertions(3);
      return expect(client.createContainer('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'Container with the name "test" already exists.',
          }),
        )
        .then(() => {
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/createContainer/test',
          );
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const postSpy = mockedAxios.post;
      postSpy.mockResolvedValue({
        status: 500,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return expect(() => client.createContainer('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while creating the container.',
          }),
        )
        .then(() => {
          // Assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/createContainer/test',
          );
        });
    });
  });

  describe('createContainerPath', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const orid = 'orid:1:mdsCloud:::1:fs:test';
      const path = 'foo/bar';
      const postSpy = mockedAxios.post;
      postSpy.mockResolvedValue({
        status: 201,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return client.createContainerPath(orid, path).then((data) => {
        // Assert
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy.mock.calls[0][0]).toBe(
          `http://127.0.0.1:8080/v1/create/${orid}/${path}`,
        );
        expect(data).toBe(undefined);
      });
    });

    it('returns a rejected promise when container already exists', () => {
      // Arrange
      const orid = 'orid:1:mdsCloud:::1:fs:test';
      const path = 'foo/bar';
      const postSpy = mockedAxios.post;
      postSpy.mockResolvedValue({
        status: 409,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return expect(() => client.createContainerPath(orid, path))
        .rejects.toEqual(
          expect.objectContaining({
            message: `Container path "${path}" already exists in container "${orid}".`,
          }),
        )
        .then(() => {
          // Assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            `http://127.0.0.1:8080/v1/create/${orid}/${path}`,
          );
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const orid = 'orid:1:mdsCloud:::1:fs:test';
      const path = 'foo/bar';
      const postSpy = mockedAxios.post;
      postSpy.mockResolvedValue({
        status: 500,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return expect(() => client.createContainerPath(orid, path))
        .rejects.toEqual(
          expect.objectContaining({
            message:
              'An error occurred while creating the path in the container.',
          }),
        )
        .then(() => {
          // Assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            `http://127.0.0.1:8080/v1/create/${orid}/${path}`,
          );
        });
    });
  });

  describe('deleteContainerOrPath', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const deleteSpy = mockedAxios.delete;
      deleteSpy.mockResolvedValue({
        status: 204,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return client.deleteContainerOrPath('test').then((data) => {
        // Assert
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/test',
        );
        expect(data).toBe(undefined);
      });
    });

    it('returns a rejected promise when container already exists', () => {
      // Arrange
      const deleteSpy = mockedAxios.delete;
      deleteSpy.mockResolvedValue({
        status: 409,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return expect(() => client.deleteContainerOrPath('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while removing the container or path.',
          }),
        )
        .then(() => {
          // Assert
          expect(deleteSpy).toHaveBeenCalledTimes(1);
          expect(deleteSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/test',
          );
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const deleteSpy = mockedAxios.delete;
      deleteSpy.mockResolvedValue({
        status: 500,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return expect(() => client.deleteContainerOrPath('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while removing the container or path.',
          }),
        )
        .then(() => {
          // Assert
          expect(deleteSpy).toHaveBeenCalledTimes(1);
          expect(deleteSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/test',
          );
        });
    });
  });

  describe('downloadFile', () => {
    it('returns result of download file', async () => {
      // Arrange
      const fakeBuffer = {};
      mockUtils.download.mockResolvedValue(fakeBuffer);
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      const buff = await client.downloadFile('test/foo');

      // Assert
      expect(buff).toBe(fakeBuffer);
    });
  });

  describe('listContainerContents', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const expectedResult = {
        directories: [] as string[],
        files: ['file1', 'file2'],
      };
      const getSpy = mockedAxios.get;
      getSpy.mockResolvedValue({
        status: 200,
        data: expectedResult,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return client.listContainerContents('test').then((data) => {
        // Assert
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/list/test',
        );
        expect(data).toBe(expectedResult);
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const getSpy = mockedAxios.get;
      getSpy.mockResolvedValue({
        status: 500,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return expect(() => client.listContainerContents('test'))
        .rejects.toEqual(
          expect.objectContaining({
            message:
              'An error occurred while obtaining the content list of a container.',
          }),
        )
        .then(() => {
          // Assert
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/list/test',
          );
        });
    });
  });

  describe('uploadFile', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const postSpy = mockedAxios.post;
      postSpy.mockResolvedValue({
        status: 200,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return client.uploadFile('test', './foo').then((data) => {
        // Assert
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/upload/test',
        );
        expect(data).toBe(undefined);
      });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({
        status: 500,
      });
      const client = new FileServiceClient(
        'http://127.0.0.1:8080',
        fakeAuthManager,
      );

      // Act
      return expect(() => client.uploadFile('test', './foo'))
        .rejects.toEqual(
          expect.objectContaining({
            message:
              'An error occurred while uploading the file to the container.',
          }),
        )
        .then(() => {
          // Assert
          expect(mockedAxios.post).toHaveBeenCalledTimes(1);
          expect(mockedAxios.post.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/upload/test',
          );
        });
    });
  });
});
