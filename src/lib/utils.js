const _ = require('lodash');
const os = require('os');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const archiver = require('archiver');
const https = require('https');
const util = require('util');
const urlJoin = require('url-join');
const { VError } = require('verror');

const envFileName = 'selectedEnv';

const self = {
  _verboseEnabled: false,

  _fsExists: util.promisify(fs.exists),

  _fsReadFile: util.promisify(fs.readFile),

  _DEFAULT_OPTIONS: {
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true, // Don't reject on any request
  },

  _SETTING_DIR: path.join(os.homedir(), '.mds'),

  _IN_PROC_CACHE: {},

  /**
   * Gets the configuration for the specified environment
   * @param {string} name The environment configuration to load
   * @returns {Promise<object>}
   */
  getEnvConfig: async (name) => {
    if (!name) return null;

    try {
      const cacheKey = `getEnvConfig-${name}`;
      const cacheVal = self._IN_PROC_CACHE[cacheKey];
      if (cacheVal) {
        return cacheVal;
      }

      const file = path.join(self._SETTING_DIR, `${name}.json`);
      const fileExists = await self._fsExists(file);
      if (fileExists) {
        const body = await self._fsReadFile(file);
        self._IN_PROC_CACHE[cacheKey] = JSON.parse(body);
        return self._IN_PROC_CACHE[cacheKey];
      }
    } catch (err) /* istanbul ignore next */ {
      self.verboseWrite(
        `Attempting to load configuration ${name} from ${self._SETTING_DIR} failed.`,
      );
      self.verboseWrite(err);
    }
    return null;
  },

  /**
   * Gets the configured default environment name for the system.
   * @returns {Promise<string>}
   */
  getDefaultEnv: async () => {
    const cacheKey = 'getDefaultEnv';
    const cacheVal = self._IN_PROC_CACHE[cacheKey];
    if (cacheVal) {
      return cacheVal;
    }

    const file = path.join(self._SETTING_DIR, envFileName);
    if (await self._fsExists(file)) {
      const data = await self._fsReadFile(file);
      if (data) {
        // Trim just in case the file was edited by the user.
        self._IN_PROC_CACHE[cacheKey] = data.toString().trim();
        return self._IN_PROC_CACHE[cacheKey];
      }
    }

    return 'default';
  },

  /**
   *
   * @param {Object} obj Object to capture overridable portions of the request options
   * @param {String} [obj.envName] Environment to act against
   * @param {Object} [obj.headers] Object to capture various request headers and value
   * @param {Object} [obj.authManager] TODO
   * @param {Object} [obj.allowSelfSignCert] Allows communication with services using self signed certs
   */
  getRequestOptions: async ({
    envName,
    headers,
    authManager,
    allowSelfSignCert,
  } = {}) => {
    const preBaked = { headers: {} };

    if (authManager) {
      let token;
      if (envName) {
        const conf = module.exports.getEnvConfig(envName);
        token = await authManager.getAuthenticationToken({
          accountId: conf.account,
          userId: conf.userId,
          password: conf.password,
        });
      } else {
        token = await authManager.getAuthenticationToken();
      }
      preBaked.headers.Token = token;
    }

    if (allowSelfSignCert) {
      preBaked.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    }

    return _.merge({}, self._DEFAULT_OPTIONS, preBaked, { headers });
  },

  download: async (url, destination, authManager) => {
    const parts = url.split('/');
    const fullDestination = path.join(destination, parts[parts.length - 1]);
    const writer = fs.createWriteStream(fullDestination);

    const options = await self.getRequestOptions({ authManager });
    const resp = await axios.get(url, { responseType: 'stream', ...options });
    resp.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  },

  createArchiveFromDirectory: (folderPath) =>
    new Promise((resolve, reject) => {
      const pathParts = folderPath.split(`${path.sep}`);
      const tempFilePath = `${os.tmpdir()}${path.sep}${
        pathParts[pathParts.length - 1]
      }.zip`;
      const outputFile = fs.createWriteStream(tempFilePath);

      const archive = archiver('zip');
      outputFile.on('close', () => {
        resolve({ filePath: tempFilePath, userSupplied: false });
      });

      outputFile.on('error', (err) => {
        reject(err);
      });

      archive.pipe(outputFile);
      archive.directory(folderPath, false);
      archive.finalize();
    }),

  /**
   * @typedef {Object} GetConfigurationResult
   * @property {string} [identityUrl] The url of the identity service
   * @property {string} [nsUrl] The url of the notification service
   * @property {string} [qsUrl] The url of the queue service
   * @property {string} [fsUrl] The url of the file service
   * @property {string} [sfUrl] The url of the serverless functions service
   * @property {string} [smUrl] The url of the state machine service
   * @property {bool} [allowSelfSignCert] True to allow consumption of self signed SSL certs; False to deny.
   */

  /**
   * Gets the auto-configurable URLs for the mdsCloud system.
   * @param {string} identityUrl The url of the identity service
   * @param {boolean} [allowSelfSignCert] True to allow consumption of self signed SSL certs; False to deny.
   * @returns {Promise<GetConfigurationResult|VError>}
   */
  getConfigurationUrls: async function getConfigurationUrls(
    identityUrl,
    allowSelfSignCert = true,
  ) {
    if (!identityUrl) return {};

    const url = urlJoin(identityUrl, 'v1', 'configuration');

    const options = await self.getRequestOptions({
      allowSelfSignCert,
    });

    try {
      const resp = await axios.get(url, options);
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
            'An error occurred while acquiring the configuration.',
          );
      }
    } catch (err) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'test') {
        self.verboseWrite('=====');
        self.verboseWrite(
          'WARNING: Encountered error while fetching configuration URLs',
        );
        self.verboseWrite(err.stack);
        self.verboseWrite('=====');
      }
      return {};
    }
  },

  verboseWrite: (message) => {
    if (self._verboseEnabled) {
      process.stdout.write(`${message}${os.EOL}`);
    }
  },
};

module.exports = self;
