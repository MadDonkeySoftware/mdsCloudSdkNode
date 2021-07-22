const _ = require('lodash');
const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');

const utils = require('./lib/utils');

/**
 * Initializes a new instance of the Queue Service client.
 *
 * @param {String} serviceUrl The url base that this client should use for service communication.
 */
function Client(serviceUrl, authManager) {
  this.serviceUrl = serviceUrl;
  this.authManager = authManager;
}

/**
 * @typedef {Object} CreateOptions
 * @property {String} resource the resource to invoke upon queueing a message to this queue.
 * @property {String} dlq the dlq to place messages in when the resource fails to invoke properly.
 */

/**
 * @typedef {Object} CreateResult
 * @property {String} status "created" or "exists" based on the pre-existence of the queue.
 */

/**
 * Creates a new queue with the provided options
 * @param {String} name the name of the queue
 * @param {CreateOptions} options the options with which to create the queue
 * @returns {Promise<CreateResult|VError>}
 */
Client.prototype.createQueue = async function createQueue(name, { resource, dlq } = {}) {
  const url = urlJoin(this.serviceUrl, 'v1', 'queue');
  const body = {
    name,
  };

  if (resource) {
    body.resource = resource;
  }

  if (dlq) {
    body.dlq = dlq;
  }

  const options = await utils.getRequestOptions({ authManager: this.authManager });
  const resp = await axios.post(url, body, options);

  switch (resp.status) {
    case 201:
      return { status: 'created', ...resp.data };
    case 200:
      return { status: 'exists', ...resp.data };
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while creating the queue.',
      );
  }
};

/**
 * Removes a message from the queue service queue.
 * @param {String} orid the orid of the queue
 * @param {String} id the unique identifier of the message to remove.
 * @returns {Promise<void|VError>}
 */
Client.prototype.deleteMessage = async function deleteMessage(orid, id) {
  const url = urlJoin(this.serviceUrl, 'v1', 'message', orid, id);
  const options = await utils.getRequestOptions({ authManager: this.authManager });

  const resp = await axios.delete(url, options);
  switch (resp.status) {
    case 200:
      return Promise.resolve();
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while deleting the message.',
      );
  }
};

/**
 * Removes the specified queue from the queue service.
 * @param {String} orid the orid of the queue
 * @returns {Promise<void|VError>}
 */
Client.prototype.deleteQueue = async function deleteQueue(orid) {
  const url = urlJoin(this.serviceUrl, 'v1', 'queue', orid);
  const options = await utils.getRequestOptions({ authManager: this.authManager });

  const resp = await axios.delete(url, options);
  switch (resp.status) {
    case 204:
      return Promise.resolve();
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while deleting the queue.',
      );
  }
};

/**
 * Removes a message from the queue service queue.
 * @param {String} orid the orid of the queue
 * @param {any} message the message body.
 * @returns {Promise<void|VError>}
 */
Client.prototype.enqueueMessage = async function enqueueMessage(orid, message) {
  const url = urlJoin(this.serviceUrl, 'v1', 'message', orid);

  const options = await utils.getRequestOptions({ authManager: this.authManager });
  const resp = await axios.post(url, message, options);
  switch (resp.status) {
    case 200:
      return Promise.resolve();
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while enqueueing the message.',
      );
  }
};

/**
 * @typedef {Object} MessageResponse
 * @property {Number} fr the timestamp of when this message was first received
 * @property {String} id the message unique identifier
 * @property {String} message the body of the message
 * @property {Number} rc the number of times this message was received
 * @property {Number} sent the timestamp of when this message was sent / created.
 */

/**
 * Fetches a message from the queue service if one is available
 * @param {String} orid the orid of the queue
 * @returns {Promise<void|MessageResponse|VError>}
 */
Client.prototype.fetchMessage = async function fetchMessage(orid) {
  const url = urlJoin(this.serviceUrl, 'v1', 'message', orid);
  const options = await utils.getRequestOptions({ authManager: this.authManager });

  const resp = await axios.get(url, options);
  switch (resp.status) {
    case 200: {
      const parsedBody = resp.data;
      return parsedBody.id ? parsedBody : Promise.resolve();
    }
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while fetching a message.',
      );
  }
};

/**
 * @typedef {Object} QueueDetails
 * @property {String} resource the resource to invoke upon queueing a message to this queue.
 * @property {String} dlq the dlq to place messages in when the resource fails to invoke properly.
 */

/**
 * Get details about a specific queue
 * @param {String} orid the orid of the queue
 * @returns {Promise<QueueDetails|VError>}
 */
Client.prototype.getQueueDetails = async function getQueueDetails(orid) {
  const url = urlJoin(this.serviceUrl, 'v1', 'queue', orid, 'details');
  const options = await utils.getRequestOptions({ authManager: this.authManager });

  const resp = await axios.get(url, options);
  switch (resp.status) {
    case 200:
      return _.merge({
        resource: undefined,
        dlq: undefined,
      }, resp.data);
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while obtaining the details of the queue.',
      );
  }
};

/**
 * @typedef {Object} QueueLength
 * @property {String} size the number of messages in the queue
 */

/**
 * Get the number of messages in the queue
 * @param {String} orid the orid of the queue
 * @returns {Promise<QueueLength|VError>}
 */
Client.prototype.getQueueLength = async function getQueueLength(orid) {
  const url = urlJoin(this.serviceUrl, 'v1', 'queue', orid, 'length');
  const options = await utils.getRequestOptions({ authManager: this.authManager });

  const resp = await axios.get(url, options);
  switch (resp.status) {
    case 200:
      return resp.data;
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while obtaining the size of the queue.',
      );
  }
};

/**
 * Get a list of queue names available on the queue service
 * @returns {Promise<String[]|VError>}
 */
Client.prototype.listQueues = async function listQueues() {
  const url = urlJoin(this.serviceUrl, 'v1', 'queues');
  const options = await utils.getRequestOptions({ authManager: this.authManager });

  const resp = await axios.get(url, options);
  switch (resp.status) {
    case 200:
      return resp.data;
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while listing the available queues.',
      );
  }
};

/**
 * @typedef {Object} UpdateOptions
 * @property {String} resource the resource to invoke upon queueing a message to this queue.
 * @property {String} dlq the dlq to place messages in when the resource fails to invoke properly.
 */

/**
 * Updates the specified queue with the provided options
 * @param {String} orid the orid of the queue
 * @param {UpdateOptions} options
 * @returns {Promise<void|VError>}
 */
Client.prototype.updateQueue = async function updateQueue(orid, { resource, dlq } = {}) {
  const url = urlJoin(this.serviceUrl, 'v1', 'queue', orid);
  const body = {};
  let skipPost = true;

  if (resource) {
    body.resource = resource.toUpperCase() === 'NULL' ? null : resource;
    skipPost = false;
  }

  if (dlq) {
    body.dlq = dlq.toUpperCase() === 'NULL' ? null : dlq;
    skipPost = false;
  }

  if (skipPost) {
    return Promise.reject(
      new VError(
        { name: 'NoActionAvailable' },
        'No update actions specified. Please update at least one option.',
      ),
    );
  }

  const options = await utils.getRequestOptions({ authManager: this.authManager });

  const resp = await axios.post(url, body, options);
  switch (resp.status) {
    case 200:
      return undefined;
    default:
      throw new VError(
        {
          info: {
            status: resp.status,
            body: resp.data,
          },
        },
        'An error occurred while updating the queue.',
      );
  }
};

module.exports = Client;
