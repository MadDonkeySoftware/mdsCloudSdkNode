const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');

const DEFAULT_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't reject on any request
};

/**
 * Initializes a new instance of the Queue Service client
 *
 * @param {String} serviceUrl The url base that this client should use for service communication
 */
function Client(serviceUrl) {
  this.serviceUrl = serviceUrl;
}

/**
 * @typedef {Object} CreateStateMachineResponse
 * @property {String} uuid The unique identifier of the newly created state machine
 */

/**
 * Create a new state machine
 * @param {String} definition The state machine definition
 * @returns {Promise<CreateStateMachineResponse|VError>}
 */
Client.prototype.createStateMachine = function createStateMachine(definition) {
  const url = urlJoin(this.serviceUrl, 'machine');

  const options = DEFAULT_OPTIONS;

  return axios.post(url, definition, options)
    .then((resp) => {
      switch (resp.status) {
        case 200: {
          const parsedBody = resp.data;
          return { status: 'created', uuid: parsedBody.uuid };
        }
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while creating the state machine.');
      }
    });
};

/**
 * @typedef {Object} OperationDetail
 * @property {String} id The unique identifier of the operation
 * @property {String} created The ISO timestamp when the operation was created
 * @property {String} status The status of this operation
 * @property {String} stateKey The user defined key for this operation
 * @property {Object} input A JSON formatted object for the input
 * @property {Object} output A JSON formatted object for the output
 */

/**
 * @typedef {Object} ExecutionDetailsResponse
 * @property {String} id The id of the state machine execution
 * @property {String} status The status of the execution at the time of the request
 * @property {Array.<OperationDetail>} operations Operations that are associated with this execution
 */

/**
 * Get the details of an execution
 * @param {String} id The id of the state machine execution
 * @returns {Promise<ExecutionDetailsResponse|null|VError>}
 */
Client.prototype.getDetailsForExecution = function getDetailsForExecution(id) {
  const url = urlJoin(this.serviceUrl, 'execution', id);

  const options = DEFAULT_OPTIONS;

  return axios.get(url, options)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          return resp.data;
        case 404:
          return undefined;
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while obtaining details of the execution.');
      }
    });
};

/**
 * @typedef {Object} StateMachineDetails
 * @property {String} id The id of the state machine execution
 * @property {String} name The friendly name for this state machine
 * @property {Object} definition The definition for this state machine
 */

/**
 * Get the details of a state machine
 * @param {String} id The id of the state machine
 * @returns {Promise<StateMachineDetails|null|VError>}
 */
Client.prototype.getStateMachine = function getStateMachine(id) {
  const url = urlJoin(this.serviceUrl, 'machine', id);

  const options = DEFAULT_OPTIONS;

  return axios.get(url, options)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          return resp.data;
        case 404:
          return undefined;
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while obtaining details of the state machine.');
      }
    });
};

/**
 * @typedef {Object} ExecutionDetails
 * @property {String} id The id of the state machine execution
 */

/**
 * Invoke a new execution of the state machine
 * @param {String} id The id of the state machine
 * @param {Object} data The input data for the state machine
 * @returns {Promise<ExecutionDetails|null|VError>}
 */
Client.prototype.invokeStateMachine = function invokeStateMachine(id, data) {
  const url = urlJoin(this.serviceUrl, 'machine', id, 'invoke');

  const options = DEFAULT_OPTIONS;

  return axios.post(url, data, options)
    .then((resp) => {
      switch (resp.status) {
        case 200: {
          const parsedBody = resp.data;
          return { status: 'invoked', id: parsedBody.id };
        }
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while invoking the state machine.');
      }
    });
};

/**
 * @typedef {Object} StateMachineListItem
 * @property {String} id The id of the state machine
 * @property {String} name The friendly name of the state machine
 * @property {String} activeVersion The currently active definition for this state machine
 */

/**
 * Invoke a new execution of the state machine.
 * @returns {Promise<Array.<StateMachineListItem>|null|VError>}
 */
Client.prototype.listStateMachines = function listStateMachines() {
  const url = urlJoin(this.serviceUrl, 'machines');

  const options = DEFAULT_OPTIONS;

  return axios.get(url, options)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          return resp.data;
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while listing the available state machines.');
      }
    });
};

/**
 * @typedef {Object} UpdateStateMachineResponse
 * @property {String} uuid The unique identifier of the newly created state machine
 */

/**
 * Create a new state machine
 * @param {String} id The id of the state machine
 * @param {String} definition The state machine definition
 * @returns {Promise<UpdateStateMachineResponse|VError>}
 */
Client.prototype.updateStateMachine = function updateStateMachine(id, definition) {
  const url = urlJoin(this.serviceUrl, 'machine', id);

  const options = DEFAULT_OPTIONS;

  return axios.post(url, definition, options)
    .then((resp) => {
      switch (resp.status) {
        case 200: {
          const parsedBody = resp.data;
          return { status: 'updated', uuid: parsedBody.uuid };
        }
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while updating the state machine.');
      }
    });
};

module.exports = Client;
