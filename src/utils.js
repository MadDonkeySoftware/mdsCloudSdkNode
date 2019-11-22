/** @module A simple module to house common functionality and provide a module shim
 * for libraries that export a function directly that cannot be mocked by default.
 */

const download = require('download');

module.exports = {
  download,
};
