const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const utils = require('./lib/utils');

/**
 * Initializes a new instance of the Serverless Functions client
 *
 * @param {String} serviceUrl The url base that this client should use for service communication
 */
function Client(serviceUrl, defaultAccount) {
  this.serviceUrl = serviceUrl;
  this.defaultAccount = defaultAccount;
}

/**
 * @typedef {Object} CreateFunctionResponse
 * @property {String} id The identifier of the newly created function
 * @property {String} status The status of the entity.
 */

/**
 * Create a new function
 * @param {String} name The function name
 * @returns {Promise<CreateFunctionResponse|VError>}
 */
Client.prototype.createFunction = function createStateMachine(name) {
  const url = urlJoin(this.serviceUrl, 'v1', 'create');

  const options = utils.getRequestOptions(undefined, { headers: { Account: this.defaultAccount } });

  return axios.post(url, { name }, options)
    .then((resp) => {
      switch (resp.status) {
        case 201: {
          const parsedBody = resp.data;
          return { status: 'created', id: parsedBody.orid || parsedBody.id };
        }
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while creating the serverless function.');
      }
    });
};

/**
 * @typedef {Object} FunctionListItem
 * @property {String} id The id of the state machine
 * @property {String} name The friendly name of the state machine
 */

/**
 * Lists all serverless functions
 * @returns {Promise<Array.<FunctionListItem>|null|VError>}
 */
Client.prototype.listFunctions = function createStateMachine() {
  const url = urlJoin(this.serviceUrl, 'v1', 'list');

  const options = utils.getRequestOptions(undefined, { headers: { Account: this.defaultAccount } });

  return axios.get(url, options)
    .then((resp) => {
      switch (resp.status) {
        case 200: {
          return resp.data;
        }
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while listing available serverless functions.');
      }
    });
};

/**
 * @typedef {Object} DeleteFunctionResponse
 * @property {String} id The identifier of the newly created function
 * @property {String} status The status of the entity.
 */

/**
 * Deletes a serverless function
 * @property {String} id The id of the state machine
 * @returns {Promise<DeleteFunctionResponse|VError>}
 */
Client.prototype.deleteFunction = function deleteFunction(id) {
  const url = urlJoin(this.serviceUrl, 'v1', id);

  const options = utils.getRequestOptions(undefined, { headers: { Account: this.defaultAccount } });

  return axios.delete(url, options)
    .then((resp) => {
      switch (resp.status) {
        case 204: {
          return { status: 'deleted', id };
        }
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while deleting the function.');
      }
    });
};

/**
 * @typedef {*} InvokeFunctionResponse
 */

/**
 * Invoke a function
 * @param {String} id The identifier of the function to invoke
 * @param {*} payload The input supplied to the function. Suggested practice is to use an object.
 * @param {boolean} [isAsync] True to invoke the function and not wait for the result.
 * @returns {Promise<InvokeFunctionResponse|VError>}
 */
Client.prototype.invokeFunction = function invokeFunction(id, payload, isAsync) {
  const url = `${urlJoin(this.serviceUrl, 'v1', 'invoke', id)}${isAsync ? '?async=true' : ''}`;

  const options = utils.getRequestOptions(undefined, { headers: { Account: this.defaultAccount } });

  return axios.post(url, payload, options)
    .then((resp) => {
      switch (resp.status) {
        case 200: {
          return resp.data;
        }
        case 202: {
          return undefined;
        }
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while invoking the function.');
      }
    });
};

/**
 * @typedef {Object} FunctionDetails
 * @property {String} id The id of the function
 * @property {String} name The friendly name of the function
 * @property {String} version The current version of the function
 * @property {String} runtime The current runtime specified for the function
 * @property {String} entryPoint The specified entry point for the current version of the function
 * @property {String} created ISO formatted timestamp for when this function was created
 * @property {String} lastUpdate ISO formatted timestamp for when this function was last updated
 * @property {String} lastInvoke ISO formatted timestamp for when this function was last invoked
 */

/**
 * Gets the details of a function
 * @param {String} id The identifier of the function to invoke
 * @returns {Promise<FunctionDetails|VError>}
 */
Client.prototype.getFunctionDetails = function getFunctionDetails(id) {
  const url = urlJoin(this.serviceUrl, 'v1', 'inspect', id);

  const options = utils.getRequestOptions(undefined, { headers: { Account: this.defaultAccount } });

  return axios.get(url, options)
    .then((resp) => {
      switch (resp.status) {
        case 200: {
          return resp.data;
        }
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while fetching function details.');
      }
    });
};

const getArchivePath = (sourcePathOrFile) => (sourcePathOrFile.endsWith('.zip')
  ? Promise.resolve({ filePath: sourcePathOrFile, userSupplied: true })
  : utils.createArchiveFromDirectory(sourcePathOrFile)
);

/**
 * @typedef {Object} UpdateFunctionResponse
 * @property {String} id The id of the function
 * @property {String} status The build status for the function
 * @property {String} [invokeUrl] The url used to invoke this function
 */

/**
 * Gets the details of a function
 * @param {String} id The identifier of the function to update
 * @param {String} runtime The runtime to utilize for the function
 * @param {String} entryPoint The entry point to use for the function
 * @param {String} sourcePathOrFile A path to the source directory or a zip file to upload
 * @returns {Promise<UpdateFunctionResponse|VError>}
 */
Client.prototype.updateFunctionCode = function updateFunctionCode(
  id,
  runtime,
  entryPoint,
  sourcePathOrFile,
) {
  return getArchivePath(sourcePathOrFile)
    .then((pathMeta) => {
      const form = new FormData();
      form.append('sourceArchive', fs.createReadStream(pathMeta.filePath));
      form.append('runtime', runtime);
      form.append('entryPoint', entryPoint);
      return [pathMeta, form];
    }).then(([pathMeta, form]) => {
      const url = urlJoin(this.serviceUrl, 'v1', 'uploadCode', id);
      const options = utils.getRequestOptions(
        undefined,
        {
          headers: {
            Account: this.defaultAccount,
            ...form.getHeaders(),
          },
        },
      );

      return axios.post(url, form, options)
        .then((resp) => {
          if (!pathMeta.userSupplied && fs.existsSync(pathMeta.filePath)) {
            fs.unlinkSync(pathMeta.filePath);
          }

          switch (resp.status) {
            case 201: {
              return resp.data;
            }
            default:
              throw new VError({
                info: {
                  status: resp.status,
                  body: resp.data,
                },
              },
              'An error occurred while invoking the function.');
          }
        });
    });
};

module.exports = Client;
