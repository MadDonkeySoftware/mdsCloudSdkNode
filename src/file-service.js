const _ = require('lodash');
const FormData = require('form-data');
const fs = require('fs');
const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');
const utils = require('./lib/utils');

/**
 * Initializes a new instance of the File Service client.
 *
 * @param {String} serviceUrl The url base that this client should use for service communication.
 */
function Client(serviceUrl, authManager) {
  this.serviceUrl = serviceUrl;
  this.authManager = authManager;
}

/**
 * List the available containers from the container service
 * @returns {Promise<String[]|VError>} The list of available containers.
 */
Client.prototype.listContainers = async function listContainers() {
  const url = urlJoin(this.serviceUrl, 'v1', 'containers');
  const options = await utils.getRequestOptions({ authManager: this.authManager });

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
Client.prototype.createContainer = async function createContainer(name) {
  const url = urlJoin(this.serviceUrl, 'v1', 'createContainer', name);
  const options = await utils.getRequestOptions({ authManager: this.authManager });

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
 * Creates a new container with the specified name
 * @param {String} orid The orid of the container to create the path in
 * @param {String} newPath the new path to create in the container, using / for separators.
 * @returns {Promise<void|VError>}
 */
Client.prototype.createContainerPath = async function createContainerPath(orid, newPath) {
  const url = urlJoin(this.serviceUrl, 'v1', 'create', orid, newPath);
  const options = await utils.getRequestOptions({ authManager: this.authManager });

  return axios.post(url, {}, options)
    .then((resp) => {
      switch (resp.status) {
        case 201:
          return Promise.resolve();
        case 409:
          throw new VError({
            name: 'AlreadyExistsError',
            info: {
              orid,
              newPath,
            },
          },
          'Container path "%s" already exists in container "%s".',
          newPath,
          orid);
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
Client.prototype.deleteContainerOrPath = async function deleteContainerOrPath(containerOrPath) {
  const url = urlJoin(this.serviceUrl, 'v1', containerOrPath);
  const options = await utils.getRequestOptions({ authManager: this.authManager });

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
  const url = urlJoin(this.serviceUrl, 'v1', 'download', containerPath);

  return utils.download(url, destination, this.authManager);
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
Client.prototype.listContainerContents = async function listContainerContents(containerOrPath) {
  const url = urlJoin(this.serviceUrl, 'v1', 'list', containerOrPath);
  const options = await utils.getRequestOptions({ authManager: this.authManager });

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
Client.prototype.uploadFile = async function uploadFile(containerPath, filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const url = urlJoin(this.serviceUrl, 'v1', 'upload', containerPath);
  const options = await utils.getRequestOptions({
    authManager: this.authManager,
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
