const _ = require('lodash');
const urlJoin = require('url-join');
const { VError } = require('verror');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const https = require('https');
const utils = require('./utils');

const getNewToken = async ({
  identityUrl,
  accountId,
  userId,
  password,
  allowSelfSignCert,
}) => {
  const url = urlJoin(identityUrl, 'v1', 'authenticate');
  const body = {
    accountId,
    userId,
    password,
  };

  const options = await utils.getRequestOptions();

  if (allowSelfSignCert) {
    options.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
  }

  return axios.post(url, body, options).then((resp) => {
    switch (resp.status) {
      case 200:
        return resp.data.token;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while authenticating.',
        );
    }
  });
};

/**
 * Creates a new authentication manager
 * @param {object} obj The object containing settings and defaults
 */
function AuthManager({
  cache,
  identityUrl,
  userId,
  password,
  account,
  allowSelfSignCert,
} = {}) {
  this.cache = cache;
  this.identityUrl = identityUrl;
  this.userId = userId;
  this.password = password;
  this.account = account;
  this.allowSelfSignCert = allowSelfSignCert;
}

/**
 * Gets a valid token for the given account
 * @param {object} meta The login details
 * @param {number} meta.accountId The account to authenticate with
 * @param {string} meta.userId The email/userId to authenticate with
 * @param {string} meta.password The password to authenticate with
 */
AuthManager.prototype.getAuthenticationToken =
  async function getAuthenticationToken(meta) {
    const account = _.get(meta, ['accountId'], this.account);
    const user = _.get(meta, ['userId'], this.userId);
    const password = _.get(meta, ['password'], this.password);

    const cacheKey = `${this.identityUrl}|${account}|${user}`;
    const existingToken = this.cache.get(cacheKey);
    if (existingToken) {
      const payload = jwt.decode(existingToken);

      // TODO: Validate token
      // NOTE: Add a 60 second buffer to ensure calls will succeed.
      const nowSec = Math.floor(new Date().getTime() / 1000.0) + 60;
      if (payload && payload.exp && nowSec < payload.exp) {
        return existingToken;
      }
      this.cache.remove(cacheKey);
    }

    const token = await getNewToken({
      identityUrl: this.identityUrl,
      accountId: account,
      userId: user,
      password,
      allowSelfSignCert: this.allowSelfSignCert,
    });
    this.cache.set(cacheKey, token);
    return token;
  };

module.exports = AuthManager;
