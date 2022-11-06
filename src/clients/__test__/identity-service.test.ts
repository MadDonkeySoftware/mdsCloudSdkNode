import axios from 'axios';
import { AuthManager } from '../../lib';
import { IdentityServiceClient } from '../identity-service';

describe('identity-service', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('returns a resolved promise with registration data when successful', () => {
      // Arrange
      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockImplementation(() =>
        Promise.resolve({
          status: 200,
          data: { status: 'Success', accountId: 123 },
        }),
      );
      const client = new IdentityServiceClient('http://127.0.0.1:8080');

      // Act
      const payload = {
        userId: 'testUserId',
        email: 'test@email.foo',
        password: 'testPassword',
        friendlyName: 'testName',
        accountName: 'testAccount',
      };
      return client.register(payload).then((data) => {
        // Assert
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/register',
        );
        expect(data).toStrictEqual({ status: 'Success', accountId: 123 });
      });
    });

    it('returns a rejected promise when an error occurs', () => {
      // Arrange
      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockImplementation(() =>
        Promise.resolve({
          status: 500,
        }),
      );
      const client = new IdentityServiceClient('http://127.0.0.1:8080');

      // Act
      const payload = {
        userId: 'testUserId',
        email: 'test@email.foo',
        password: 'testPassword',
        friendlyName: 'testName',
        accountName: 'testAccount',
      };
      return expect(() => client.register(payload))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while registering a new account.',
          }),
        )
        .then(() => {
          // Assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/register',
          );
        });
    });
  });

  describe('authenticate', () => {
    it('Calls through to AuthManager getAuthenticationToken', () => {
      // Arrange
      const mockGetAuthenticatonToken = jest
        .fn()
        .mockResolvedValue('testToken');
      const authManager = {
        getAuthenticationToken: mockGetAuthenticatonToken,
      } as unknown as AuthManager;
      const client = new IdentityServiceClient('', authManager);

      // Act
      const payload = {
        accountId: '123',
        userId: 'testUser',
        password: 'testPassword',
      };
      return client.authenticate(payload).then((token) => {
        // Assert
        expect(mockGetAuthenticatonToken).toHaveBeenCalledTimes(1);
        expect(mockGetAuthenticatonToken.mock.calls[0][0]).toStrictEqual(
          payload,
        );
        expect(token).toBe('testToken');
      });
    });
  });

  describe('updateUser', () => {
    it('returns a resolved promise with update data when successful', async () => {
      // Arrange
      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockResolvedValue({
        status: 200,
        data: {},
      });
      const client = new IdentityServiceClient('http://127.0.0.1:8080');

      // Act
      const payload = {
        email: 'test@email.foo',
        oldPassword: 'testPassword',
        newPassword: 'testPassword',
        friendlyName: 'testName',
      };
      await client.updateUser(payload);

      // Assert
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy.mock.calls[0][0]).toBe(
        'http://127.0.0.1:8080/v1/updateUser',
      );
    });

    it('returns a rejected promise when an error occurs', () => {
      // Arrange
      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockResolvedValue({
        status: 500,
      });
      const client = new IdentityServiceClient('http://127.0.0.1:8080');

      // Act
      const payload = {
        email: 'test@email.foo',
        password: 'testPassword',
        friendlyName: 'testName',
        accountName: 'testAccount',
      };
      return expect(() => client.updateUser(payload))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while updating the user.',
          }),
        )
        .then(() => {
          // Assert
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/updateUser',
          );
        });
    });
  });

  describe('getPublicSignature', () => {
    it('returns a resolved promise with signature data when successful', () => {
      // Arrange
      const getSpy = jest.spyOn(axios, 'get');
      getSpy.mockResolvedValue({
        status: 200,
        data: { signature: 'public signature' },
      });
      const client = new IdentityServiceClient('http://127.0.0.1:8080');

      // Act
      return client.getPublicSignature().then((data) => {
        // Assert
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/publicSignature',
        );
        expect(data).toStrictEqual({ signature: 'public signature' });
      });
    });

    it('returns a rejected promise when an error occurs', () => {
      // Arrange
      const getSpy = jest.spyOn(axios, 'get');
      getSpy.mockResolvedValue({
        status: 500,
      });
      const client = new IdentityServiceClient('http://127.0.0.1:8080');

      // Act & Assert
      return expect(() => client.getPublicSignature())
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while acquiring the public signature.',
          }),
        )
        .then(() => {
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/publicSignature',
          );
        });
    });
  });

  describe('impersonateUser', () => {
    it('returns a resolved promise with signature data when successful', () => {
      // Arrange
      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockResolvedValue({
        status: 200,
        data: { token: 'impersonation token' },
      });
      const client = new IdentityServiceClient('http://127.0.0.1:8080');

      // Act
      const payload = {
        accountId: '123',
        userId: 'someUser',
      };
      return client.impersonateUser(payload).then((data) => {
        // Assert
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy.mock.calls[0][0]).toBe(
          'http://127.0.0.1:8080/v1/impersonate',
        );
        expect(data).toStrictEqual({ token: 'impersonation token' });
      });
    });

    it('returns a rejected promise when an error occurs', () => {
      // Arrange
      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockResolvedValue({
        status: 500,
      });
      const client = new IdentityServiceClient('http://127.0.0.1:8080');

      // Act
      const payload = {
        accountId: '123',
        userId: 'someUser',
      };
      return expect(() => client.impersonateUser(payload))
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while obtaining impersonation token.',
          }),
        )
        .then(() => {
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/impersonate',
          );
        });
    });
  });
});
