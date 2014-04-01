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
   assert.strictEqual(validator.errorMessages()[0], "error msg");
   assert.strictEqual(validator.errorMessages()[1], "error msg 2");
};


exports.testComplexValidObject = function() {
   var obj = {
      "isAlpha": "asdfASDF",
      "isAlphanumeric": "asdfASDF12345",
      "isDateFormat": "dd-MM-yyyy",
      "isUrl": "http://ringojs.org",
      "isEmail": "test@example.com",
      "isFileName": "test.jpg",
      "isHexColor": "#123456",
      "isNumeric": "123456",
      "isInt": "123456",
      "isFloat": "123.456",
      "isNumber": "123.456",
      "minLength": "string",
      "maxLength": "string",
      "lengthBetween": "string",
      "hasLength": "string",
      "equal": "true",
      "strictEqual": true,
      "isTrue": true,
      "isFalse": false,
      "isDefined": "defined",
      "notNull": "notNull",
      "strictNotNull": undefined,
      "matches": "abcd",
      "passes": "abcd"
   };

   var validator = new Validator(obj);

   validator.validate("isAlpha").isAlpha("error msg isAlpha");
   validator.validate("isAlphanumeric").isAlphanumeric("error msg isAlphanumeric");
   validator.validate("isDateFormat").isDateFormat("error msg isDateFormat");
   validator.validate("isUrl").isUrl("error msg isUrl");
   validator.validate("isEmail").isEmail("error msg isEmail");
   validator.validate("isFileName").isFileName("error msg isFileName");
   validator.validate("isHexColor").isHexColor("error msg isHexColor");
   validator.validate("isNumeric").isNumeric("error msg isNumeric");
   validator.validate("isInt").isInt("error msg isInt");
   validator.validate("isFloat").isFloat("error msg isFloat");
   validator.validate("isNumber").isNumber("error msg isNumber");
   validator.validate("minLength").minLength(6, "error msg minLength");
   validator.validate("maxLength").maxLength(6, "error msg maxLength");
   validator.validate("lengthBetween").lengthBetween(5, 7, "error msg lengthBetween");
   validator.validate("hasLength").hasLength(6, "error msg hasLength");
   validator.validate("equal").equal("true", "error msg equal");
   validator.validate("strictEqual").strictEqual(true, "error msg strictEqual");
   validator.validate("isTrue").isTrue("error msg isTrue");
   validator.validate("isFalse").isFalse("error msg isFalse");
   validator.validate("isDefined").isDefined("error msg isDefined");
   validator.validate("notNull").notNull("error msg notNull");
   validator.validate("strictNotNull").strictNotNull("error msg strictNotNull");
   validator.validate("matches").matches(/abcd/, "error msg matches");
   validator.validate("passes").passes(function(value) { return value === "abcd"; }, "error msg passes");

   assert.isFalse(validator.hasErrors());

};

exports.testComplexInvalidObject = function() {
   var obj = {
      "isAlpha": "asdfASDF1",
      "isAlphanumeric": "asdfASDF12345#",
      "isDateFormat": "dd-MM-yyyy NOTADATEFORMAT",
      "isUrl": "invalid",
      "isEmail": "invalid@",
      "isFileName": "/asdf/asdf/asdf/",
      "isHexColor": "#1234567",
      "isNumeric": "123456asdf",
      "isInt": "123456.456",
      "isFloat": "123",
      "isNumber": "123.456asdf",
      "minLength": "",
      "maxLength": "string+1",
      "lengthBetween": "string+1",
      "hasLength": "string+1",
      "equal": "false",
      "strictEqual": false,
      "isTrue": false,
      "isFalse": true,
      "isDefined": undefined,
      "notNull": undefined,
      "strictNotNull": null,
      "matches": "abcd",
      "passes": "abcd"
   };

   var validator = new Validator(obj);

   validator.validate("isAlpha").isAlpha("error msg isAlpha");
   validator.validate("isAlphanumeric").isAlphanumeric("error msg isAlphanumeric");
   validator.validate("isDateFormat").isDateFormat("error msg isDateFormat");
   validator.validate("isUrl").isUrl("error msg isUrl");
   validator.validate("isEmail").isEmail("error msg isEmail");
   validator.validate("isFileName").isFileName("error msg isFileName");
   validator.validate("isHexColor").isHexColor("error msg isHexColor");
   validator.validate("isNumeric").isNumeric("error msg isNumeric");
   validator.validate("isInt").isInt("error msg isInt");
   validator.validate("isFloat").isFloat("error msg isFloat");
   validator.validate("isNumber").isNumber("error msg isNumber");
   validator.validate("minLength").minLength(6, "error msg minLength");
   validator.validate("maxLength").maxLength(6, "error msg maxLength");
   validator.validate("lengthBetween").lengthBetween(5, 7, "error msg lengthBetween");
   validator.validate("hasLength").hasLength(6, "error msg hasLength");
   validator.validate("equal").equal("true", "error msg equal");
   validator.validate("strictEqual").strictEqual(true, "error msg strictEqual");
   validator.validate("isTrue").isTrue("error msg isTrue");
   validator.validate("isFalse").isFalse("error msg isFalse");
   validator.validate("isDefined").isDefined("error msg isDefined");
   validator.validate("notNull").notNull("error msg notNull");
   validator.validate("strictNotNull").strictNotNull("error msg strictNotNull");
   validator.validate("matches").matches(/12345/, "error msg matches");
   validator.validate("passes").passes(function(value) { return value !== "abcd"; }, "error msg passes");

   assert.isTrue(validator.hasErrors());
   assert.strictEqual(validator.errorMessages().length, 24);

};

exports.testSanitizers = function() {
   var obj = {
      "date": "Thu Jan 01 1970 00:00:00 GMT-00:00",
      "float": "123.456",
      "int": "123456",
      "boolean": "asdf",
      "booleanStrict": "1"
   };

   var validator = new Validator(obj);

   assert.strictEqual((validator.validate("date").toDate()).getTime(), 0);
   assert.strictEqual(validator.validate("float").toFloat(), 123.456);
   assert.strictEqual(validator.validate("int").toInt(), 123456);
   assert.strictEqual(validator.validate("boolean").toBoolean(), true);
   assert.strictEqual(validator.validate("booleanStrict").toBoolean(true), true);

};

// Run the tests
if (require.main == module.id) {
   system.exit(require('test').run(exports));
}