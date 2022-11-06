import * as utils from '../lib/utils';
import { MdsSdk } from '../index';

jest.mock('../lib/utils');
const mockUtils = utils as jest.Mocked<typeof utils>;

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('initialize', () => {
    it('with object provides clients configured urls', async () => {
      // Arrange
      const qsUrl = 'http://127.0.0.1:80';
      const smUrl = 'http://127.0.0.1:81';
      const fsUrl = 'http://127.0.0.1:82';
      const nsUrl = 'http://127.0.0.1:83';
      const sfUrl = 'http://127.0.0.1:84';
      const identityUrl = 'http://127.0.0.1:85';
      const account = 'testAccount';
      const userId = 'testUser';
      const password = 'testPassword';
      const allowSelfSignCert = true;

      // Act
      await MdsSdk.initialize({
        qsUrl,
        smUrl,
        fsUrl,
        nsUrl,
        sfUrl,
        identityUrl,
        account,
        userId,
        password,
        allowSelfSignCert,
      });

      // Assert
      const qsClient = await MdsSdk.getQueueServiceClient();
      const smClient = await MdsSdk.getStateMachineServiceClient();
      const fsClient = await MdsSdk.getFileServiceClient();
      const nsClient = await MdsSdk.getNotificationServiceClient();
      const sfClient = await MdsSdk.getServerlessFunctionsClient();
      const identityClient = await MdsSdk.getIdentityServiceClient();

      expect(qsClient.serviceUrl).toBe(qsUrl);
      expect(smClient.serviceUrl).toBe(smUrl);
      expect(fsClient.serviceUrl).toBe(fsUrl);
      expect(nsClient.serviceUrl).toBe(nsUrl);
      expect(sfClient.serviceUrl).toBe(sfUrl);
      expect(identityClient.serviceUrl).toBe(identityUrl);
    });

    it('with string provides clients configured urls', async () => {
      // Arrange
      const qsUrl = 'http://127.0.0.1:80';
      const smUrl = 'http://127.0.0.1:81';
      const fsUrl = 'http://127.0.0.1:82';
      const nsUrl = 'http://127.0.0.1:83';
      const sfUrl = 'http://127.0.0.1:84';
      const identityUrl = 'http://127.0.0.1:85';
      const account = 'testAccount';
      const userId = 'testUser';
      const password = 'testPassword';
      const allowSelfSignCert = true;

      mockUtils.getEnvConfig.mockResolvedValue({
        qsUrl,
        smUrl,
        fsUrl,
        nsUrl,
        sfUrl,
        identityUrl,
        account,
        userId,
        password,
        allowSelfSignCert,
      });

      // Act
      await MdsSdk.initialize('testEnv');

      // Assert
      const qsClient = await MdsSdk.getQueueServiceClient();
      const smClient = await MdsSdk.getStateMachineServiceClient();
      const fsClient = await MdsSdk.getFileServiceClient();
      const nsClient = await MdsSdk.getNotificationServiceClient();
      const sfClient = await MdsSdk.getServerlessFunctionsClient();
      const identityClient = await MdsSdk.getIdentityServiceClient();

      expect(mockUtils.getEnvConfig).toHaveBeenCalledTimes(1);
      expect(mockUtils.getEnvConfig.mock.calls[0][0]).toBe('testEnv');
      expect(qsClient.serviceUrl).toBe(qsUrl);
      expect(smClient.serviceUrl).toBe(smUrl);
      expect(fsClient.serviceUrl).toBe(fsUrl);
      expect(nsClient.serviceUrl).toBe(nsUrl);
      expect(sfClient.serviceUrl).toBe(sfUrl);
      expect(identityClient.serviceUrl).toBe(identityUrl);
    });

    it('with undefined provides clients environment configured urls', async () => {
      // Arrange
      const qsUrl = 'http://127.0.0.1:80';
      const smUrl = 'http://127.0.0.1:81';
      const fsUrl = 'http://127.0.0.1:82';
      const nsUrl = 'http://127.0.0.1:83';
      const sfUrl = 'http://127.0.0.1:84';
      const identityUrl = 'http://127.0.0.1:85';
      const account = 'testAccount';
      const userId = 'testUser';
      const password = 'testPassword';
      const allowSelfSignCert = true;

      mockUtils.getDefaultEnv.mockResolvedValue('defaultEnv');
      mockUtils.getEnvConfig.mockResolvedValue({
        qsUrl,
        smUrl,
        fsUrl,
        nsUrl,
        sfUrl,
        identityUrl,
        account,
        userId,
        password,
        allowSelfSignCert,
      });

      // Act
      await MdsSdk.initialize();

      // Assert
      const qsClient = await MdsSdk.getQueueServiceClient();
      const smClient = await MdsSdk.getStateMachineServiceClient();
      const fsClient = await MdsSdk.getFileServiceClient();
      const nsClient = await MdsSdk.getNotificationServiceClient();
      const sfClient = await MdsSdk.getServerlessFunctionsClient();
      const identityClient = await MdsSdk.getIdentityServiceClient();

      expect(mockUtils.getEnvConfig).toHaveBeenCalledTimes(1);
      expect(mockUtils.getEnvConfig.mock.calls[0][0]).toBe('defaultEnv');
      expect(qsClient.serviceUrl).toBe(qsUrl);
      expect(smClient.serviceUrl).toBe(smUrl);
      expect(fsClient.serviceUrl).toBe(fsUrl);
      expect(nsClient.serviceUrl).toBe(nsUrl);
      expect(sfClient.serviceUrl).toBe(sfUrl);
      expect(identityClient.serviceUrl).toBe(identityUrl);
    });

    it('with undefined and missing default env provides clients environment configured urls', async () => {
      // Arrange
      const qsUrl = 'http://127.0.0.1:80';
      const smUrl = 'http://127.0.0.1:81';
      const fsUrl = 'http://127.0.0.1:82';
      const nsUrl = 'http://127.0.0.1:83';
      const sfUrl = 'http://127.0.0.1:84';
      const identityUrl = 'http://127.0.0.1:85';

      mockUtils.getDefaultEnv.mockResolvedValue(undefined);
      mockUtils.getEnvConfig.mockResolvedValue(null);

      // Act
      await MdsSdk.initialize();

      // Assert
      const qsClient = await MdsSdk.getQueueServiceClient();
      const smClient = await MdsSdk.getStateMachineServiceClient();
      const fsClient = await MdsSdk.getFileServiceClient();
      const nsClient = await MdsSdk.getNotificationServiceClient();
      const sfClient = await MdsSdk.getServerlessFunctionsClient();
      const identityClient = await MdsSdk.getIdentityServiceClient();

      // NOTE: the URLs are still set here given that previous tests have set them.
      expect(mockUtils.getEnvConfig).toHaveBeenCalledTimes(1);
      expect(mockUtils.getEnvConfig.mock.calls[0][0]).toBe(undefined);
      expect(qsClient.serviceUrl).toBe(qsUrl);
      expect(smClient.serviceUrl).toBe(smUrl);
      expect(fsClient.serviceUrl).toBe(fsUrl);
      expect(nsClient.serviceUrl).toBe(nsUrl);
      expect(sfClient.serviceUrl).toBe(sfUrl);
      expect(identityClient.serviceUrl).toBe(identityUrl);
    });
  });

  it('throws error when initialized with invalid parameter type', () => {
    // Act & Assert
    return expect(() => MdsSdk.initialize(1 as any as string)).rejects.toEqual(
      expect.objectContaining({
        message:
          "Initialization of MDS SDK failed. Type 'number' not supported.",
      }),
    );
  });
});
