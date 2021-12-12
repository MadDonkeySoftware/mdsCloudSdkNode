const _ = require('lodash');
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

/**
 * Gets the configuration for the default or specified environment
 * @param {string} [environment] The environment to get configuration urls from
 * @returns {Promise<object>}
 */
const getUrls = async (environment) => {
  const env = environment || (await utils.getDefaultEnv());
  return (await utils.getEnvConfig(env)) || {};
};

// TODO: Expand to take overridable values
const getAuthManager = async (environment) => {
  /* istanbul ignore if */
  if (!AUTH_MANAGER) {
    const urls = await getUrls(environment);
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

Sdk.prototype.getSettings = function getSettings() {
  return _.mapValues(this, (v) => v);
};

/**
 * Initializes the global set of service endpoints clients will use.
 *
 * NOTE: Having the environment variable MDS_SDK_VERBOSE set will cause extra logging to be emit.
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
 * @param {string} [data.token] If identityUrl and token are available via params or the system cache, pre-seeds the auth manager with the token.
 */
const initialize = async (data) => {
  AUTH_MANAGER = null;
  const oldConfig = SINGLETON ? SINGLETON.getSettings() : {};
  let configData = {};

  /* istanbul ignore if */
  if (process.env.MDS_SDK_VERBOSE) {
    utils._verboseEnabled = true;
  }

  if (typeof data === 'object') {
    const autoConfig = await utils.getConfigurationUrls(data.identityUrl);
    configData = _.merge({}, oldConfig, autoConfig, data);
  } else if (typeof data === 'string' || data === undefined || data === null) {
    const envData = await getUrls(data);
    const autoConfig = await utils.getConfigurationUrls(envData.identityUrl);
    configData = _.merge({}, oldConfig, autoConfig, envData);
  } else {
    throw new Error(
      `Initialization of MDS SDK failed. Type '${typeof data}' not supported.`,
    );
  }

  utils.verboseWrite('Config Data:');
  utils.verboseWrite(JSON.stringify(_.omit(configData, ['password']), null, 2));

  SINGLETON = new Sdk(configData);
  AUTH_MANAGER = new AuthManager({
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
    await AUTH_MANAGER.setAuthenticationToken({
      token: configData.token,
    });
  }
};

/**
 * Creates a new file service client
 */
const getFileServiceClient = async () =>
  new FileService(SINGLETON.fsUrl, await getAuthManager());

/**
 * Creates a new queue service client
 */
const getQueueServiceClient = async () =>
  new QueueService(SINGLETON.qsUrl, await getAuthManager());

/**
 * Creates a new state machine client
 * @param {String} [smUrl] Override for the state machine service endpoint.
 */
const getStateMachineServiceClient = async () =>
  new StateMachineService(SINGLETON.smUrl, await getAuthManager());

/**
 * Creates a new notification service client
 */
const getNotificationServiceClient = async () =>
  new NotificationService(SINGLETON.nsUrl, await getAuthManager());

/**
 * Creates a new serverless function client
 */
const getServerlessFunctionsClient = async () =>
  new ServerlessFunctions(SINGLETON.sfUrl, await getAuthManager());

/**
 * Creates a new identity client
 */
const getIdentityServiceClient = async () =>
  new IdentityService(
    SINGLETON.identityUrl,
    await getAuthManager(),
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
