var assert = require("assert");
var system = require("system");

var {Validator} = require("../lib/validator.js");

exports.testSimpleObject = function() {
   var obj = {
      "foo": "bar"
   };

   var validator = new Validator(obj);

   validator.validate("foo").hasLength(3, "error msg");
   assert.isFalse(validator.hasErrors());
   assert.strictEqual(validator.errorMessages().length, 0);

   validator.validate("foo").hasLength(4, "error msg").hasLength(5, "error msg 2");
   assert.isTrue(validator.hasErrors());
   assert.strictEqual(validator.errorMessages().length, 1);

   validator.validateAll("foo").hasLength(4, "error msg").hasLength(5, "error msg 2");
   assert.isTrue(validator.hasErrors());
   assert.strictEqual(validator.errorMessages().length, 2);
   assert.strictEqual(validator.errorMessages("foo")[0], "error msg");
   assert.strictEqual(validator.errorMessages("foo")[1], "error msg 2");
};

// Run the tests
if (require.main == module.id) {
   system.exit(require('test').run(exports));
}