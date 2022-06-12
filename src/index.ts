import { mapValues, merge, omit } from 'lodash';
import {
  FileServiceClient,
  IdentityServiceClient,
  NotificationServiceClient,
  QueueServiceClient,
  ServerlessFunctionsClient,
  StateMachineServiceClient,
} from './clients';
import { AuthManager, DiscCache } from './lib';
import {
  EnvironmentConfig,
  getConfigurationUrls,
  getDefaultEnv,
  getEnvConfig,
  verboseWrite,
} from './lib/utils';

export interface SdkInitializeOptions {
  /**
   * The queue service url.
   */
  qsUrl?: string;
  /**
   * The state machine service url.
   */
  smUrl?: string;
  /**
   * The file service url.
   */
  fsUrl?: string;
  /**
   * The notification service url
   */
  nsUrl?: string;
  /**
   * The serverless functions url.
   */
  sfUrl?: string;
  /**
   * The identity service url
   */
  identityUrl?: string;
  /**
   * The account to authenticate against
   */
  account?: string;
  /**
   * The userId to use during authentication
   */
  userId?: string;
  /**
   * The password to use during authentication
   */
  password?: string;
  /**
   * Allow self signed certificates when communicating with identity
   */
  allowSelfSignCert?: boolean;
  /**
   * If identityUrl and token are available via params or the system cache, pre-seeds the auth manager with the token.
   */
  token?: string;
}

export class MdsSdk {
  private static instance: MdsSdk;
  private static authManager: AuthManager;

  private qsUrl: string;
  private smUrl: string;
  private fsUrl: string;
  private nsUrl: string;
  private sfUrl: string;
  private identityUrl: string;
  private account: string;
  private userId: string;
  private password: string;
  private allowSelfSignCert: boolean;

  private constructor({
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
  }: {
    qsUrl?: string;
    smUrl?: string;
    fsUrl?: string;
    nsUrl?: string;
    sfUrl?: string;
    identityUrl?: string;
    account?: string;
    userId?: string;
    password?: string;
    allowSelfSignCert?: boolean;
  }) {
    this.qsUrl = qsUrl;
    this.smUrl = smUrl;
    this.fsUrl = fsUrl;
    this.nsUrl = nsUrl;
    this.sfUrl = sfUrl;
    this.identityUrl = identityUrl;
    this.account = account;
    this.userId = userId;
    this.password = password;
    this.allowSelfSignCert = allowSelfSignCert;
  }

  private static getSettings() {
    return mapValues(this.instance, (v) => v);
  }

  /**
   * Gets the configuration for the default or specified environment
   * @param environment The environment to get configuration urls from
   */
  private static async getUrls(
    environment?: string,
  ): Promise<EnvironmentConfig> {
    const env = environment || (await getDefaultEnv());
    return (await getEnvConfig(env)) || ({} as EnvironmentConfig);
  }

  private static async getAuthManager(
    environment?: string,
  ): Promise<AuthManager> {
    // TODO: Expand to take overridable values

    /* istanbul ignore if */
    if (!this.authManager) {
      const urls = await MdsSdk.getUrls(environment);
      this.authManager = new AuthManager({
        cache: new DiscCache(),
        ...urls,
      });
    }
    return this.authManager;
  }

  public static async initialize(data?: SdkInitializeOptions | string) {
    this.authManager = null;
    const oldConfig = this.instance ? MdsSdk.getSettings() : {};
    let configData: SdkInitializeOptions;

    if (typeof data === 'object') {
      const autoConfig = await getConfigurationUrls(data.identityUrl);
      configData = merge({}, oldConfig, autoConfig, data);
    } else if (
      typeof data === 'string' ||
      data === undefined ||
      data === null
    ) {
      const envData = await this.getUrls(data);
      const autoConfig = await getConfigurationUrls(envData.identityUrl);
      configData = merge(
        {},
        oldConfig,
        autoConfig,
        envData,
      ) as SdkInitializeOptions;
    } else {
      throw new Error(
        `Initialization of MDS SDK failed. Type '${typeof data}' not supported.`,
      );
    }

    verboseWrite('Config Data:');
    verboseWrite(JSON.stringify(omit(configData, ['password']), null, 2));

    this.instance = new MdsSdk(configData);
    this.authManager = new AuthManager({
      cache: new DiscCache(),
      identityUrl: configData.identityUrl,
      userId: configData.userId,
      password: configData.password,
      account: configData.account,
      allowSelfSignCert: configData.allowSelfSignCert,
    });

    // TODO: Restructure so that auth manager can be stubbed for tests
    /* istanbul ignore if */
    if (configData.token) {
      await this.authManager.setAuthenticationToken(configData.token);
    }
  }

  /**
   * Creates a new file service client
   */
  public static async getFileServiceClient() {
    return new FileServiceClient(
      this.instance.fsUrl,
      await this.getAuthManager(),
    );
  }

  /**
   * Creates a new queue service client
   */
  public static async getQueueServiceClient() {
    return new QueueServiceClient(
      this.instance.qsUrl,
      await this.getAuthManager(),
    );
  }

  /**
   *
   * @returns Creates a new state machine client
   */
  public static async getStateMachineServiceClient() {
    return new StateMachineServiceClient(
      this.instance.smUrl,
      await this.getAuthManager(),
    );
  }

  /**
   * Creates a new notification service client
   */
  public static async getNotificationServiceClient() {
    return new NotificationServiceClient(
      this.instance.nsUrl,
      await this.getAuthManager(),
    );
  }

  /**
   * Creates a new serverless function client
   */
  public static async getServerlessFunctionsClient() {
    return new ServerlessFunctionsClient(
      this.instance.sfUrl,
      await this.getAuthManager(),
    );
  }

  /**
   * Creates a new identity client
   */
  public static async getIdentityServiceClient() {
    return new IdentityServiceClient(
      this.instance.identityUrl,
      await this.getAuthManager(),
      this.instance.allowSelfSignCert,
    );
  }
}
