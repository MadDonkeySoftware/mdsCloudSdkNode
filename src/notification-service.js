
const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');
const SocketClient = require('socket.io-client');

const utils = require('./lib/utils');

/**
 * Initializes a new instance of the File Service client.
 *
 * @param {String} serviceUrl The url base that this client should use for service communication.
 */
function Client(serviceUrl, authManager) {
  this.serviceUrl = serviceUrl;
  this.authManager = authManager;

  this._socket = SocketClient(serviceUrl);
}

/**
 * Emits a new message on the provided topic
 * @param {String} topicOrid The ORID of the topic to emit the message to
 * @param {Any} message The message to emit
 * @returns {Promise<void|VError>}
 */
Client.prototype.emit = async function emit(topicOrid, message) {
  const url = urlJoin(this.serviceUrl, 'v1', 'emit', topicOrid);
  const isObject = typeof message === 'object';

  const options = await utils.getRequestOptions({
    authManager: this.authManager,
    headers: {
      'Content-Type': isObject ? 'application/json' : 'text/plain',
    },
  });

  return axios.post(url, message, options)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          return Promise.resolve();
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while attempting to emit the message.');
      }
    });
};

/**
 * Wire an event handler for a given topic
 * @param {String} topic The topic to subscribe to
 * @param {Function} handler The function that will handle events
 */
Client.prototype.on = function on(topic, handler) {
  this._socket.on(topic, handler);
};

/**
 * Remove an event handler form a given topic
 * @param {String} topic The topic to subscribe to
 * @param {Function} [handler] The function to unsubscribe. All if omitted.
 */
Client.prototype.off = function off(topic, handler) {
  this._socket.off(topic, handler);
};

/**
 * Closes the underlying socket
 */
Client.prototype.close = function close() {
  this._socket.close();
};

module.exports = Client;
