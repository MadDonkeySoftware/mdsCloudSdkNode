import { AuthManager } from '../../auth-manager';
import { getRequestOptions } from '../get-request-options';
import * as utils from '..';

jest.mock('..');
const mockedUtils = utils as jest.Mocked<typeof utils>;

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('getRequestOptions', () => {
    it('Resolves default options when no options are provided', () => {
      // Arrange

      // Act
      return getRequestOptions().then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;
        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;

        expect(validationStatusFunc()).toBe(true);
        expect(options).toStrictEqual({
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });
    });

    it('Resolves proper options when headers are provided', () => {
      // Arrange
      const args = {
        headers: { foo: 'bar' },
      };

      // Act
      return getRequestOptions(args).then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;

        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;

        expect(validationStatusFunc()).toBe(true);
        expect(options).toStrictEqual({
          headers: {
            'Content-Type': 'application/json',
            foo: 'bar',
          },
        });
      });
    });

    it('Resolves proper options when allowSelfSignCert is provided and true', () => {
      // Arrange
      const args = {
        allowSelfSignCert: true,
      };

      // Act
      return getRequestOptions(args).then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;
        const httpsAgentAssignment = options.httpsAgent;

        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;
        // eslint-disable-next-line no-param-reassign
        delete options.httpsAgent;

        expect(validationStatusFunc()).toBe(true);
        expect(httpsAgentAssignment).not.toBe(null);
        expect(options).toStrictEqual({
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });
    });

    it('Resolves proper options when authManager is provided and token is resolved', () => {
      // Arrange
      const authManager = {
        getAuthenticationToken: jest.fn().mockResolvedValue('testAuthToken'),
      } as unknown as AuthManager;

      // Act
      return getRequestOptions({
        authManager,
      }).then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;

        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;

        expect(validationStatusFunc()).toBe(true);
        expect(options).toStrictEqual({
          headers: {
            'Content-Type': 'application/json',
            Token: 'testAuthToken',
          },
        });
      });
    });

    it('Resolves proper options when authManager and environment is provided and token is resolved', () => {
      // Arrange
      const getAuthenticationTokenFn = jest
        .fn()
        .mockResolvedValue('testAuthToken');
      const authManager = {
        getAuthenticationToken: getAuthenticationTokenFn,
      } as unknown as AuthManager;
      const args = {
        authManager,
        envName: 'test',
      };

      mockedUtils.getEnvConfig.mockResolvedValue({
        account: 'testAccount',
        userId: 'testUserId',
        password: 'testPassword',
      } as utils.EnvironmentConfig);

      // Act
      return getRequestOptions(args).then((options) => {
        // Assert
        const validationStatusFunc = options.validateStatus;

        // eslint-disable-next-line no-param-reassign
        delete options.validateStatus;

        expect(validationStatusFunc()).toBe(true);
        expect(options).toStrictEqual({
          headers: {
            'Content-Type': 'application/json',
            Token: 'testAuthToken',
          },
        });
        expect(getAuthenticationTokenFn.mock.calls[0][0]).toStrictEqual({
          accountId: 'testAccount',
          userId: 'testUserId',
          password: 'testPassword',
        });
      });
    });
  });
});
