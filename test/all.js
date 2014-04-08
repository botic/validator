// Import all tests
exports.testValidator = require("./test-validator");
exports.testMiddleware = require("./test-middleware");

// Run the tests
if (require.main == module.id) {
   require("system").exit(require('test').run(exports));
}