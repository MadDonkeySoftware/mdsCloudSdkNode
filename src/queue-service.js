const got = require('got');
const urlJoin = require('url-join');
const { VError } = require('verror');
const _ = require('lodash');

/**
 * Initializes a new instance of the Queue Service client.
 *
 * @param {String} serviceUrl The url base that this client should use for service communication.
 */
function Client(serviceUrl) {
  this.serviceUrl = serviceUrl;
}

/**
 * @typedef {Object} CreateOptions
 * @property {String} resource the resource to invoke upon queueing a message to this queue.
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
Client.prototype.createQueue = function createQueue(name, { resource } = {}) {
  const url = urlJoin(this.serviceUrl, 'queue');
  const body = {
    name,
  };

  if (resource) {
    body.resource = resource;
  }

  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
    body: JSON.stringify(body),
  };

  return got.post(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 201:
          return { status: 'created' };
        case 204:
          return { status: 'exists' };
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while creating the queue.');
      }
    });
};

/**
 * Removes a message from the queue service queue.
 * @param {String} name the name of the queue
 * @param {String} id the unique identifier of the message to remove.
 * @returns {Promise<void|VError>}
 */
Client.prototype.deleteMessage = function deleteMessage(name, id) {
  const url = urlJoin(this.serviceUrl, 'queue', name, 'message', id);
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
  };

  return got.delete(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return Promise.resolve();
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while deleting the message.');
      }
    });
};

/**
 * Removes the specified queue from the queue service.
 * @param {String} name the name of the queue
 * @returns {Promise<void|VError>}
 */
Client.prototype.deleteQueue = function deleteQueue(name) {
  const url = urlJoin(this.serviceUrl, 'queue', name);
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
  };

  return got.delete(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 204:
          return Promise.resolve();
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while deleting the queue.');
      }
    });
};

/**
 * Removes a message from the queue service queue.
 * @param {String} name the name of the queue
 * @param {any} message the message body.
 * @returns {Promise<void|VError>}
 */
Client.prototype.enqueueMessage = function enqueueMessage(name, message) {
  const stringifyMessage = (msg) => {
    switch (typeof msg) {
      case 'object':
        return JSON.stringify(msg);
      default:
        return msg.toString();
    }
  };
  const url = urlJoin(this.serviceUrl, 'queue', name, 'message');
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
    body: stringifyMessage(message),
  };

  return got.post(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return Promise.resolve();
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while enqueueing the message.');
      }
    });
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
 * @param {String} name the name of the queue
 * @returns {Promise<void|MessageResponse|VError>}
 */
Client.prototype.fetchMessage = function fetchMessage(name) {
  const url = urlJoin(this.serviceUrl, 'queue', name, 'message');
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
  };

  return got.get(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 200: {
          const parsedBody = JSON.parse(resp.body);
          return parsedBody.id ? parsedBody : Promise.resolve();
        }
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while fetching a message.');
      }
    });
};

/**
 * @typedef {Object} QueueDetails
 * @property {String} resource the resource to invoke upon queueing a message to this queue.
 */

/**
 * Get details about a specific queue
 * @param {String} name the name of the queue
 * @returns {Promise<QueueDetails|VError>}
 */
Client.prototype.getQueueDetails = function getQueueDetails(name) {
  const url = urlJoin(this.serviceUrl, 'queue', name, 'details');
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
  };

  return got.get(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return _.merge({
            resource: undefined,
          }, JSON.parse(resp.body));
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while obtaining the details of the queue.');
      }
    });
};

/**
 * @typedef {Object} QueueLength
 * @property {String} size the number of messages in the queue
 */

/**
 * Get the number of messages in the queue
 * @param {String} name the name of the queue
 * @returns {Promise<QueueLength|VError>}
 */
Client.prototype.getQueueLength = function getQueueLength(name) {
  const url = urlJoin(this.serviceUrl, 'queue', name, 'length');
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
  };

  return got.get(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return JSON.parse(resp.body);
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while obtaining the size of the queue.');
      }
    });
};

/**
 * Get a list of queue names available on the queue service
 * @returns {Promise<String[]|VError>}
 */
Client.prototype.listQueues = function listQueues() {
  const url = urlJoin(this.serviceUrl, 'queues');
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
  };

  return got.get(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return JSON.parse(resp.body);
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while listing the available queues.');
      }
    });
};

/**
 * @typedef {Object} UpdateOptions
 * @property {String} resource the resource to invoke upon queueing a message to this queue.
 */

/**
 * Updates the specified queue with the provided options
 * @param {String} name the name of the queue
 * @param {UpdateOptions} options
 * @returns {Promise<void|VError>}
 */
Client.prototype.updateQueue = function updateQueue(name, { resource } = {}) {
  const url = urlJoin(this.serviceUrl, 'queue', name);
  const body = {};
  let skipPost = true;

  if (resource) {
    body.resource = resource.toUpperCase() === 'NULL' ? null : resource;
    skipPost = false;
  }

  if (skipPost) {
    return Promise.reject(
      new VError({
        name: 'NoActionAvailable',
      },
      'No update actions specified. Please update at least one option.'),
    );
  }

  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    throwHttpErrors: false,
    body: JSON.stringify(body),
  };

  return got.post(url, options)
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return Promise.resolve();
        default:
          throw new VError({
            info: {
              statusCode: resp.statusCode,
              body: resp.body,
            },
          },
          'An error occurred while updating the queue.');
      }
    });
};

module.exports = Client;
