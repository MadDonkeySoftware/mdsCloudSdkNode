const _ = require('lodash');
const os = require('os');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const archiver = require('archiver');

const envFileName = 'selectedEnv';

const inProcCache = {};

const settingDir = path.join(os.homedir(), '.mds');

const DEFAULT_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't reject on any request
};

const getEnvConfig = (name) => {
  try {
    const cacheKey = `getEnvConfig-${name}`;
    const cacheVal = inProcCache[cacheKey];
    if (cacheVal) {
      return cacheVal;
    }

    const file = path.join(settingDir, `${name}.json`);
    if (name && fs.existsSync(file)) {
      const body = fs.readFileSync(file);
      inProcCache[cacheKey] = JSON.parse(body);
      return inProcCache[cacheKey];
    }
  } catch (err) {
    process.stdout.write(`Attempting to load configuration ${name} from ${settingDir} failed.${os.EOL}`);
    process.stderr.write(`${err}`);
  }
  return null;
};

const getDefaultEnv = () => {
  const cacheKey = 'getDefaultEnv';
  const cacheVal = inProcCache[cacheKey];
  if (cacheVal) {
    return cacheVal;
  }

  const file = path.join(settingDir, envFileName);
  if (fs.existsSync(file)) {
    const data = fs.readFileSync(file);
    if (data) {
      // Trim just in case the file was edited by the user.
      inProcCache[cacheKey] = data.toString().trim();
      return inProcCache[cacheKey];
    }
  }

  return 'default';
};

/**
 *
 * @param {Object} obj Object to capture overridable portions of the request options
 * @param {String} [obj.envName] Environment to act against
 * @param {Object} [obj.headers] Object to capture various request headers and value
 * @param {Object} [obj.authManager] TODO
 */
const getRequestOptions = async ({ envName, headers, authManager } = {}) => {
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
    if (token) {
      preBaked.headers.Token = token;
    }
  }

  return _.merge({},
    DEFAULT_OPTIONS,
    preBaked,
    { headers });
};

const download = (url, destination, authManager) => {
  const parts = url.split('/');
  const fullDestination = path.join(destination, parts[parts.length - 1]);
  const writer = fs.createWriteStream(fullDestination);

  return module.exports.getRequestOptions({
    authManager,
  })
    .then((options) => axios.get(url, { responseType: 'stream', ...options })
      .then((resp) => {
        resp.data.pipe(writer);
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
      }));
};

const createArchiveFromDirectory = (folderPath) => new Promise((resolve, reject) => {
  const pathParts = folderPath.split(`${path.sep}`);
  const tempFilePath = `${os.tmpdir()}${path.sep}${pathParts[pathParts.length - 1]}.zip`;
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
});

module.exports = {
  getEnvConfig,
  getDefaultEnv,
  getRequestOptions,
  download,
  createArchiveFromDirectory,
};
