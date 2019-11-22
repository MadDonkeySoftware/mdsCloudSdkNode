const FileService = require('./file-service');
const QueueService = require('./queue-service');
const StateMachineService = require('./state-machine-service');

let SINGLETON;

/**
 * Creates a new factory for providing configured clients.
 *
 * @param {*} { qsUrl, smUrl, fsUrl } The default URIs utilized by child clients.
 */
function Sdk({ qsUrl, smUrl, fsUrl }) {
  this.qsUrl = qsUrl;
  this.smUrl = smUrl;
  this.fsUrl = fsUrl;
}

/**
 * Initializes the global set of service endpoints clients will use.
 * @param {Object} obj Object containing service endpoint urls.
 */
const initialize = ({ qsUrl, smUrl, fsUrl } = {}) => {
  SINGLETON = new Sdk({ qsUrl, smUrl, fsUrl });
};

/**
 * Creates a new file service client
 * @param {String} fsUrl Optional - override for the file service endpoint.
 */
const getFileServiceClient = (fsUrl) => new FileService(fsUrl || SINGLETON.fsUrl);

/**
 * Creates a new queue service client
 * @param {String} qsUrl Optional - override for the queue service endpoint.
 */
const getQueueServiceClient = (qsUrl) => new QueueService(qsUrl || SINGLETON.qsUrl);

/**
 * Creates a new state machine client
 * @param {String} smUrl Optional - override for the state machine service endpoint.
 */
const getStateMachineServiceClient = (smUrl) => new StateMachineService(smUrl || SINGLETON.smUrl);

module.exports = {
  initialize,
  getQueueServiceClient,
  getFileServiceClient,
  getStateMachineServiceClient,
};
