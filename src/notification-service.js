
const _ = require('lodash');
const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');
const SocketClient = require('socket.io-client');

/* istanbul ignore next: not concerned with test here */
const DEFAULT_OPTIONS = {
  validateStatus: () => true, // Don't reject on any request
};

/**
 * Initializes a new instance of the File Service client.
 *
 * @param {String} serviceUrl The url base that this client should use for service communication.
 */
function Client(serviceUrl) {
  this.serviceUrl = serviceUrl;
  this._socket = SocketClient(serviceUrl);
}

/**
 * Emits a new message on the provided topic
 * @param {String} topic The name of the topic to emit the message to
 * @param {Any} message The message to emit
 * @returns {Promise<void|VError>}
 */
Client.prototype.emit = function emit(topic, message) {
  const url = urlJoin(this.serviceUrl, 'emit', topic);
  const isObject = typeof message === 'object';
  const options = _.merge({}, DEFAULT_OPTIONS, {
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
          'An error occurred while creating the container.');
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
