const utils = require('./lib/utils');
const AuthManager = require('./lib/auth-manager');
const DiscCache = require('./lib/disc-cache');
const FileService = require('./file-service');
const QueueService = require('./queue-service');
const StateMachineService = require('./state-machine-service');
const NotificationService = require('./notification-service');
const ServerlessFunctions = require('./serverless-functions');
const IdentityService = require('./identity-service');

let SINGLETON;
let AUTH_MANAGER;

const getUrls = (environment) => {
  const env = environment || utils.getDefaultEnv();
  return utils.getEnvConfig(env);
};

// TODO: Expand to take overridable values
const getAuthManager = (environment) => {
  /* istanbul ignore if */
  if (!AUTH_MANAGER) {
    const urls = getUrls(environment);
    AUTH_MANAGER = new AuthManager(new DiscCache(), urls.identityUrl);
  }
  return AUTH_MANAGER;
};

/**
 * Creates a new factory for providing configured clients.
 *
 * @param {Object} data Object containing service endpoint urls.
 * @param {string} [data.qsUrl] The queue service url.
 * @param {string} [data.smUrl] The state machine service url.
 * @param {string} [data.fsUrl] The file service url.
 * @param {string} [data.nsUrl] The notification service url.
 * @param {string} [data.sfUrl] The serverless functions url.
 * @param {string} [data.identityUrl] The identity service url.
 * @param {string} [data.account] The account to authenticate against.
 * @param {string} [data.userId] The userId to use during authentication.
 * @param {string} [data.password] The password to use during authentication.
 * @param {string} [data.allowSelfSignCert] Allow self signed certificates when communicating with identity.
 */
function Sdk({
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

/**
 * Initializes the global set of service endpoints clients will use.
 *
 * @param {object|string} [data] Object containing service endpoint urls. String to specify environment configure or undefined to use the configured default settings.
 * @param {string} [data.qsUrl] The queue service url.
 * @param {string} [data.smUrl] The state machine service url.
 * @param {string} [data.fsUrl] The file service url.
 * @param {string} [data.nsUrl] The notification service url.
 * @param {string} [data.sfUrl] The serverless functions url.
 * @param {string} [data.identityUrl] The identity service url.
 * @param {string} [data.account] The account to authenticate against.
 * @param {string} [data.userId] The userId to use during authentication.
 * @param {string} [data.password] The password to use during authentication.
 * @param {string} [data.allowSelfSignCert] Allow self signed certificates when communicating with identity.
 */
const initialize = (data) => {
  AUTH_MANAGER = null;
  if (typeof data === 'object') {
    SINGLETON = new Sdk(data);
    AUTH_MANAGER = new AuthManager({
      cache: new DiscCache(),
      identityUrl: data.identityUrl,
      userId: data.userId,
      password: data.password,
      account: data.account,
      allowSelfSignCert: data.allowSelfSignCert,
    });
  } else if (typeof data === 'string' || data === undefined) {
    const envData = getUrls(data);
    SINGLETON = new Sdk(envData);
    AUTH_MANAGER = new AuthManager({
      cache: new DiscCache(),
      identityUrl: envData.identityUrl,
      userId: envData.userId,
      password: envData.password,
      account: envData.account,
      allowSelfSignCert: envData.allowSelfSignCert,
    });
  } else {
    throw new Error(
      `Initialization of MDS SDK failed. Type '${typeof data}' not supported.`,
    );
  }
};

/**
 * Creates a new file service client
 */
const getFileServiceClient = () =>
  new FileService(SINGLETON.fsUrl, getAuthManager());

/**
 * Creates a new queue service client
 */
const getQueueServiceClient = () =>
  new QueueService(SINGLETON.qsUrl, getAuthManager());

/**
 * Creates a new state machine client
 * @param {String} [smUrl] Override for the state machine service endpoint.
 */
const getStateMachineServiceClient = () =>
  new StateMachineService(SINGLETON.smUrl, getAuthManager());

/**
 * Creates a new notification service client
 */
const getNotificationServiceClient = () =>
  new NotificationService(SINGLETON.nsUrl, getAuthManager());

/**
 * Creates a new serverless function client
 */
const getServerlessFunctionsClient = () =>
  new ServerlessFunctions(SINGLETON.sfUrl, getAuthManager());

/**
 * Creates a new identity client
 */
const getIdentityServiceClient = () =>
  new IdentityService(
    SINGLETON.identityUrl,
    getAuthManager(),
    SINGLETON.allowSelfSignCert,
  );

module.exports = {
  initialize,
  getQueueServiceClient,
  getFileServiceClient,
  getStateMachineServiceClient,
  getNotificationServiceClient,
  getServerlessFunctionsClient,
  getIdentityServiceClient,
};
