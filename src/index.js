const FileService = require('./file-service');
const QueueService = require('./queue-service');
const StateMachineService = require('./state-machine-service');
const NotificationService = require('./notification-service');

let SINGLETON;

/**
 * Creates a new factory for providing configured clients.
 *
 * @param {*} { qsUrl, smUrl, fsUrl } The default URIs utilized by child clients.
 */
function Sdk({
  qsUrl, smUrl, fsUrl, nsUrl,
}) {
  this.qsUrl = qsUrl;
  this.smUrl = smUrl;
  this.fsUrl = fsUrl;
  this.nsUrl = nsUrl;
}

/**
 * Initializes the global set of service endpoints clients will use.
 * @param {Object} obj Object containing service endpoint urls.
 */
const initialize = ({
  qsUrl, smUrl, fsUrl, nsUrl,
} = {}) => {
  SINGLETON = new Sdk({
    qsUrl, smUrl, fsUrl, nsUrl,
  });
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

module.exports = {
  initialize,
  getQueueServiceClient,
  getFileServiceClient,
  getStateMachineServiceClient,
  getNotificationServiceClient,
};
