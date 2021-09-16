const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');

const utils = require('./lib/utils');
// eslint-disable-next-line no-unused-vars
const AuthManager = require('./lib/auth-manager');

/**
 * Initializes a new instance of the Queue Service client.
 *
 * @param {String} serviceUrl The url base that this client should use for service communication.
 * @param {AuthManager} authManager The authentication manager to use for certain requests.
 * @param {Boolean} allowSelfSignCert Allows this client to accept self signed certificates.
 */
function Client(serviceUrl, authManager, allowSelfSignCert) {
  this.serviceUrl = serviceUrl;
  this.authManager = authManager;
  this.allowSelfSignCert = allowSelfSignCert;
}

/**
 * @typedef {Object} CreateResult
 * @property {String} status "Success" or "Failed"
 * @property {number} [accountId] When successful the uniquely identifying account id
 */

/**
 * Creates a new account and user with the provided details
 * @param {object} meta the registration details
 * @param {string} meta.email the email address that uniquely identifies the user
 * @param {string} meta.password the password for the user
 * @param {string} meta.friendlyName the friendly name the user wishes to be addressed by
 * @param {string} meta.accountName the friendly name to identify the account by
 * @returns {Promise<RegisterResult|VError>}
 */
Client.prototype.register = async function register(meta) {
  const url = urlJoin(this.serviceUrl, 'v1', 'register');
  const body = {
    userId: meta.userId,
    email: meta.email,
    password: meta.password,
    friendlyName: meta.friendlyName,
    accountName: meta.accountName,
  };

  const options = await utils.getRequestOptions({
    allowSelfSignCert: this.allowSelfSignCert,
  });

  return axios.post(url, body, options).then((resp) => {
    switch (resp.status) {
      case 200:
        return { ...resp.data };
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while registering a new account.',
        );
    }
  });
};

/**
 * Get authentication token for the given credentials
 * @param {object} meta The authentication credentials
 * @param {string} meta.accountId The account to authenticate to
 * @param {string} meta.userId The user to authenticate with
 * @param {string} meta.password The password to authenticate with
 * @returns {Promise<String>|VError}
 */
Client.prototype.authenticate = async function authenticate(meta) {
  return this.authManager.getAuthenticationToken(meta);
};

/**
 * Update details of the user
 * @param {object} meta The authentication credentials
 * @param {string} [meta.email] The new account recovery email address
 * @param {string} [meta.oldPassword] The old password for this user for validation during update
 * @param {string} [meta.newPassword] The new password for this user
 * @param {string} [meta.friendlyName] The new friendly name for the user
 * @returns {Promise<String>|VError}
 */
Client.prototype.updateUser = async function updateUser(meta) {
  const url = urlJoin(this.serviceUrl, 'v1', 'updateUser');
  const body = {
    email: meta.email,
    oldPassword: meta.password,
    newPassword: meta.password,
    friendlyName: meta.friendlyName,
  };

  const options = await utils.getRequestOptions({
    allowSelfSignCert: this.allowSelfSignCert,
    authManager: this.authManager,
  });

  return axios.post(url, body, options).then((resp) => {
    switch (resp.status) {
      case 200:
        return { ...resp.data };
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while updating the user.',
        );
    }
  });
};

/**
 * Gets the public signature all tokens are signed with by the identity endpoint
 */
Client.prototype.getPublicSignature = async function getPublicSignature() {
  const url = urlJoin(this.serviceUrl, 'v1', 'publicSignature');

  const options = await utils.getRequestOptions({
    allowSelfSignCert: this.allowSelfSignCert,
  });

  return axios.get(url, options).then((resp) => {
    switch (resp.status) {
      case 200:
        return { ...resp.data };
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while acquiring the public signature.',
        );
    }
  });
};

/**
 * Get impersonation token for a user on a given account
 * @param {object} meta The authentication credentials
 * @param {string} meta.accountId The account to impersonate a user under
 * @param {string} [meta.userId] If provided the specific user to impersonate, else the root user.
 * @returns {Promise<String>|VError}
 */
Client.prototype.impersonateUser = async function impersonateUser(meta) {
  const url = urlJoin(this.serviceUrl, 'v1', 'impersonate');
  const body = {
    accountId: meta.accountId,
    userId: meta.userId,
  };

  const options = await utils.getRequestOptions({
    allowSelfSignCert: this.allowSelfSignCert,
    authManager: this.authManager,
  });

  return axios.post(url, body, options).then((resp) => {
    switch (resp.status) {
      case 200:
        return { ...resp.data };
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while obtaining impersonation token.',
        );
    }
  });
};

module.exports = Client;
