import * as _ from 'lodash';
import axios from 'axios';
import jwt from 'jsonwebtoken';

import { AuthManager } from '../auth-manager';
import { InMemoryCache } from '../in-memory-cache';

describe(__filename, () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const createNewManager = (overrides: Record<string, unknown>) => {
    const defaults = {
      cache: new InMemoryCache(),
      identityUrl: 'http://127.0.0.1:8080',
      userId: 'testUser',
      password: 'testPassword',
      account: 'testAccount',
      allowSelfSignCert: true,
    };
    return new AuthManager(_.merge({}, defaults, overrides));
  };

  describe('getAuthenticationToken', () => {
    it('Parameter-less call twice calls service once and returns same token', async () => {
      // Arrange
      const expectedToken = 'AwesomeTestToken';
      const manager = createNewManager(null);

      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockResolvedValue({
        status: 200,
        data: { token: expectedToken },
      });

      jest.spyOn(jwt, 'decode').mockReturnValue({
        accountId: 'testAccount',
        userId: 'testUser',
        exp: Math.floor(new Date().getTime() / 1000.0) + 300,
      });

      // Act
      const token = await manager.getAuthenticationToken();
      const token2 = await manager.getAuthenticationToken();

      // Assert
      expect(token).toBe(expectedToken);
      expect(token2).toBe(expectedToken);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy.mock.calls[0][0]).toBe(
        'http://127.0.0.1:8080/v1/authenticate',
      );
    });

    it('Expired cache key removed on subsequent calls', async () => {
      // Arrange
      const expectedToken = jwt.sign(
        {
          accountId: 'testAccount',
          userId: 'testUser',
        },
        'testKey',
      );
      const cache = {
        get: jest.fn().mockReturnValue({
          exp: Math.floor(new Date().getTime() / 1000.0) - 300,
        }),
        remove: jest.fn(),
        set: jest.fn(),
      };
      const manager = createNewManager({ cache });

      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockResolvedValue({
        status: 200,
        data: { token: expectedToken },
      });

      // Act
      const token = await manager.getAuthenticationToken();

      // Assert
      expect(token).toStrictEqual(expectedToken);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy.mock.calls[0][0]).toBe(
        'http://127.0.0.1:8080/v1/authenticate',
      );
      expect(cache.remove).toHaveBeenCalledTimes(1);
    });

    it('Parameter-less call raises error when non-200 response received.', () => {
      // Arrange
      const manager = createNewManager({ allowSelfSignCert: false });

      const postSpy = jest.spyOn(axios, 'post');
      postSpy.mockResolvedValue({
        status: 500,
        data: 'test error',
      });

      // Act
      return expect(() => manager.getAuthenticationToken())
        .rejects.toEqual(
          expect.objectContaining({
            message: 'An error occurred while authenticating.',
          }),
        )
        .then(() => {
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy.mock.calls[0][0]).toBe(
            'http://127.0.0.1:8080/v1/authenticate',
          );
        });
    });
  });
});
