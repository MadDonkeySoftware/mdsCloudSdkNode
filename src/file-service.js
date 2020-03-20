const _ = require('lodash');
const FormData = require('form-data');
const fs = require('fs');
const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');
const utils = require('./utils');

const DEFAULT_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't reject on any request
};

/**
 * Initializes a new instance of the File Service client.
 *
 * @param {String} serviceUrl The url base that this client should use for service communication.
 */
function Client(serviceUrl) {
  this.serviceUrl = serviceUrl;
}

/**
 * List the available containers from the container service
 * @returns {Promise<String[]|VError>} The list of available containers.
 */
Client.prototype.listContainers = function listContainers() {
  const url = urlJoin(this.serviceUrl, 'containers');
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
          'An error occurred while obtaining the list of available containers.');
      }
    });
};

/**
 * Creates a new container with the specified name
 * @param {String} name The name of the container to create
 * @returns {Promise<void|VError>}
 */
Client.prototype.createContainer = function createContainer(name) {
  const url = urlJoin(this.serviceUrl, 'create', name);
  const options = DEFAULT_OPTIONS;

  return axios.post(url, {}, options)
    .then((resp) => {
      switch (resp.status) {
        case 201:
          return Promise.resolve();
        case 409:
          throw new VError({
            name: 'AlreadyExistsError',
            info: {
              name,
            },
          },
          'Container with the name "%s" already exists.',
          name);
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
 * Deletes a container or path within a container.
 *
 * Ex. container/foo/bar where bar can be a file or folder. If bar is a folder the delete
 * is recursive.
 * @param {String} containerOrPath The container name or path to an item in the container.
 * @returns {Promise<void|VError>}
 */
Client.prototype.deleteContainerOrPath = function deleteContainerOrPath(containerOrPath) {
  const url = urlJoin(this.serviceUrl, containerOrPath);
  const options = DEFAULT_OPTIONS;

  return axios.delete(url, options)
    .then((resp) => {
      switch (resp.status) {
        case 204:
          return Promise.resolve();
        case 409:
          throw new VError({
            name: 'DoesNotExistError',
            info: {
              containerOrPath,
            },
          },
          'An error occurred while removing the container or path.');
        default:
          throw new VError({
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while removing the container or path.');
      }
    });
};

/**
 * Saves a file to the provided destination
 *
 * @param {String} containerPath Path to the file to download
 * @param {String} destination Path to where your file will be written
 * @returns {Promise<Buffer>}
 */
Client.prototype.downloadFile = function downloadFile(containerPath, destination) {
  const url = urlJoin(this.serviceUrl, 'download', containerPath);

  return utils.download(url, destination);
};

/**
 * @typedef {Object} DirectoryContents
 * @property {String[]} DirectoryContents.directories The sub directories of the container or path
 * @property {String[]} DirectoryContents.files The files residing in the container or path
 */

/**
 * Gets a object containing lists for the directories and files contained in the supplied path
 *
 * @param {String} containerOrPath
 * @returns {Promise<DirectoryContents|VError>} Object containing two properties
 */
Client.prototype.listContainerContents = function listContainerContents(containerOrPath) {
  const url = urlJoin(this.serviceUrl, 'list', containerOrPath);
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
          'An error occurred while obtaining the content list of a container.');
      }
    });
};

/**
 * @param {String} containerPath The container name and optional path where to upload the file.
 * @param {String} filePath The path to the file on the local system to upload
 * @returns {Promise<void|VError>}
 */
Client.prototype.uploadFile = function uploadFile(containerPath, filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const url = urlJoin(this.serviceUrl, 'upload', containerPath);
  const options = _.merge({}, DEFAULT_OPTIONS, {
    headers: form.getHeaders(),
  });

  return axios.post(url, form, options)
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
          'An error occurred while uploading the file to the container.');
      }
    });
};

module.exports = Client;
