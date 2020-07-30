const utils = require('./lib/utils');
const FileService = require('./file-service');
const QueueService = require('./queue-service');
const StateMachineService = require('./state-machine-service');
const NotificationService = require('./notification-service');
const ServerlessFunctions = require('./serverless-functions');

let SINGLETON;

/**
 * Creates a new factory for providing configured clients.
 *
 * @param {Object} data Object containing service endpoint urls.
 * @param {string} [data.qsUrl] The queue service url.
 * @param {string} [data.smUrl] The state machine service url.
 * @param {string} [data.fsUrl] The file service url.
 * @param {string} [data.nsUrl] The notification service url.
 * @param {string} [data.sfUrl] The serverless functions url.
 */
function Sdk({
  qsUrl, smUrl, fsUrl, nsUrl, sfUrl,
}) {
  this.qsUrl = qsUrl;
  this.smUrl = smUrl;
  this.fsUrl = fsUrl;
  this.nsUrl = nsUrl;
  this.sfUrl = sfUrl;
}

/**
 * Initializes the global set of service endpoints clients will use.
 *
 * @param {*} [data] Object containing service endpoint urls. String to specify environment configure or undefined to use the configured default settings.
 * @param {string} [data.qsUrl] The queue service url.
 * @param {string} [data.smUrl] The state machine service url.
 * @param {string} [data.fsUrl] The file service url.
 * @param {string} [data.nsUrl] The notification service url.
 * @param {string} [data.sfUrl] The serverless functions url.
 */
const initialize = (data) => {
  if (typeof data === 'object') {
    SINGLETON = new Sdk(data);
  } else if (typeof data === 'string' || data === undefined) {
    const env = data || utils.getDefaultEnv();
    SINGLETON = new Sdk(utils.getEnvConfig(env));
  } else {
    throw new Error(`Initialization of MDS SDK failed. Type '${typeof data}' not supported.`);
  }
};

/**
 * Creates a new file service client
 * @param {String} [fsUrl] Override for the file service endpoint.
 */
const getFileServiceClient = (fsUrl) => new FileService(fsUrl || SINGLETON.fsUrl);

/**
 * Creates a new queue service client
 * @param {String} [qsUrl] Override for the queue service endpoint.
 */
const getQueueServiceClient = (qsUrl) => new QueueService(qsUrl || SINGLETON.qsUrl);

/**
 * Creates a new state machine client
 * @param {String} [smUrl] Override for the state machine service endpoint.
 */
const getStateMachineServiceClient = (smUrl) => new StateMachineService(smUrl || SINGLETON.smUrl);

/**
 * Creates a new notification service client
 * @param {String} [nsUrl] Override for the notification service endpoint.
 */
const getNotificationServiceClient = (nsUrl) => new NotificationService(nsUrl || SINGLETON.nsUrl);

/**
 * Creates a new serverless function client
 * @param {String} [sfUrl] Override for the serverless functions endpoint.
 * @param {String} [defaultAccount] Override for the account number to use for requests.
 */
const getServerlessFunctionsClient = (sfUrl, defaultAccount) => new ServerlessFunctions(
  sfUrl || SINGLETON.sfUrl,
  defaultAccount,
);

module.exports = {
  initialize,
  getQueueServiceClient,
  getFileServiceClient,
  getStateMachineServiceClient,
  getNotificationServiceClient,
  getServerlessFunctionsClient,
};
