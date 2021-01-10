function InMemoryCache() {
  this.data = {};
}

InMemoryCache.prototype.set = function set(key, value) {
  this.data[key] = value;
};

InMemoryCache.prototype.get = function set(key) {
  return this.data[key];
};

InMemoryCache.prototype.remove = function set(key) {
  delete this.data[key];
};

InMemoryCache.prototype.removeAll = function removeAll() {
  this.data = {};
};

module.exports = InMemoryCache;
