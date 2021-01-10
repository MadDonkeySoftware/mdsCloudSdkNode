const os = require('os');
const path = require('path');
const fs = require('fs');

const settingDir = path.join(os.homedir(), '.mds');
const CACHE_FILE_NAME = 'cache';

function DiscCache() {
  this.data = {};
}


const writeCache = (data) => {
  const cacheFile = path.join(settingDir, CACHE_FILE_NAME);
  if (!fs.existsSync(settingDir)) fs.mkdirSync(settingDir);
  fs.writeFileSync(cacheFile, JSON.stringify(data));
};

DiscCache.prototype.set = function set(key, value) {
  this.data[key] = value;
  writeCache(this.data);
};

DiscCache.prototype.get = function set(key) {
  const cacheFile = path.join(settingDir, CACHE_FILE_NAME);
  if (!this.data[key] && fs.existsSync(cacheFile)) {
    const data = fs.readFileSync(cacheFile);
    this.data = data ? JSON.parse(data) : {};
  }

  return this.data[key];
};

DiscCache.prototype.remove = function set(key) {
  delete this.data[key];
  writeCache(this.data);
};

DiscCache.prototype.removeAll = function removeAll() {
  this.data = {};
  writeCache(this.data);
};

module.exports = DiscCache;
