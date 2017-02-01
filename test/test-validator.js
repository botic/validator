var assert = require("assert");
var system = require("system");

var {Validator} = require("../lib/validator.js");

exports.testSimpleObject = function() {
   var obj = {
      "foo": "bar"
   };

   var validator = new Validator(obj);

   validator.validate("foo").hasLength(3, "error msg");
   assert.isFalse(validator.hasFailures());
   assert.strictEqual(validator.getMessages("foo").length, 0);

   validator.validate("foo").hasLength(4, "error msg").hasLength(5, "error msg 2");
   assert.isTrue(validator.hasFailures());
   assert.strictEqual(validator.getMessages("foo").length, 1);

   validator.validateAll("foo").hasLength(4, "error msg").hasLength(5, "error msg 2");
   assert.isTrue(validator.hasFailures());
   assert.strictEqual(validator.getMessages("foo").length, 2);
   assert.strictEqual(validator.getMessages(undefined).foo.length, 2);
   assert.strictEqual(validator.getMessages("foo")[0], "error msg");
   assert.strictEqual(validator.getMessages("foo")[1], "error msg 2");
   assert.strictEqual(validator.getMessages().foo[0], "error msg");
   assert.strictEqual(validator.getMessages().foo[1], "error msg 2");
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
      "isNull": undefined,
      "strictIsNull": null,
      "greaterThan": "123456",
      "lessThan": "123456",
      "isNaN": "123456-4578",
      "isNotNaN": "123456",
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
   validator.validate("isNull").isNull("error msg isNull");
   validator.validate("strictIsNull").strictIsNull("error msg strictIsNull");
   validator.validate("greaterThan").toInt().greaterThan(123455, "not greater than");
   validator.validate("lessThan").toInt().lessThan(123457, "not less than");
   validator.validate("isNaN").toInt().isNaN("isNaN");
   validator.validate("isNotNaN").toInt().isNotNaN("isNotNaN");
   validator.validate("matches").matches(/abcd/, "error msg matches");
   validator.validate("passes").passes(function(value) { return value === "abcd"; }, "error msg passes");

   assert.isFalse(validator.hasFailures());

   assert.throws(function() { validator.validate("passes").passes(); });
   assert.throws(function() { validator.validate("passes").passes("asdf"); });
   assert.throws(function() { validator.validate("passes").passes(123456); });
};

exports.testComplexInvalidObject = function() {
   var obj = {
      "isAlpha": "asdfASDF1",
      "isAlphanumeric": "asdfASDF12345#",
      "isDateFormat": "dd-MM-yyyy NOTADATEFORMAT",
      "isUrl": "invalid",
      "isUrl2": 1,
      "isUrl3": {},
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
      "isNull": "",
      "strictIsNull": undefined,
      "notNull": undefined,
      "strictNotNull": null,
      "greaterThan": "123456",
      "lessThan": "123456",
      "isNaN": "123456",
      "isNotNaN": "123456-4578",
      "matches": "abcd",
      "passes": "abcd"
   };

   var validator = new Validator(obj);

   validator.validate("isAlpha").isAlpha("error msg isAlpha");
   validator.validate("isAlphanumeric").isAlphanumeric("error msg isAlphanumeric");
   validator.validate("isDateFormat").isDateFormat("error msg isDateFormat");
   validator.validate("isUrl").isUrl("error msg isUrl");
   validator.validate("isUrl2").isUrl("error msg isUrl");
   validator.validate("isUrl3").isUrl("error msg isUrl");
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
   validator.validate("isNull").isNull("error msg isNull");
   validator.validate("strictIsNull").strictIsNull("error msg strictIsNull");
   validator.validate("notNull").notNull("error msg notNull");
   validator.validate("strictNotNull").strictNotNull("error msg strictNotNull");
   validator.validate("greaterThan").toInt().greaterThan(123457, "not greater than");
   validator.validate("lessThan").toInt().lessThan(123455, "not less than");
   validator.validate("isNaN").toInt().isNaN("isNaN");
   validator.validate("isNotNaN").toInt().isNotNaN("isNotNaN");
   validator.validate("matches").matches(/12345/, "error msg matches");
   validator.validate("passes").passes(function(value) { return value !== "abcd"; }, "error msg passes");

   assert.isTrue(validator.hasFailures());
   var messages = [];
   for each (let arr in validator.getMessages()) {
      messages = messages.concat(arr);
   }
   assert.strictEqual(messages.length, 32);

};

exports.testTrim = function() {
   var obj = {
      "foo": "   bar       ",
      "empty": "           "
   };

   var validator = new Validator(obj);

   validator.validate("foo").hasLength(13, "error msg");
   assert.isFalse(validator.hasFailures());
   assert.strictEqual(validator.getMessages("foo").length, 0);

   validator.validate("foo", true).hasLength(3, "error msg");
   assert.isFalse(validator.hasFailures());
   assert.strictEqual(validator.getMessages("foo").length, 0);

   validator.validate("empty", true).strictEqual("", "error msg 1").hasLength(0, "error msg 2");
   assert.isFalse(validator.hasFailures());
   assert.strictEqual(validator.getMessages("empty").length, 0);
};

exports.testSanitizers = function() {
   var obj = {
      "date": "Thu Jan 01 1970 00:00:00 GMT-00:00",
      "dateEvil": "asdfsdfasdf",
      "float": "123.456",
      "floatEvil": "123456",
      "int": "123456",
      "intEvil": "0123456",
      "boolean": "asdf",
      "booleanStrict": "1",
      "booleanTrueString": "true",
      "undefined": undefined,
      "null": null,
      "zero": "0",
      "false": "false",
      "emptyString": ""
   };

   var validator = new Validator(obj);

   assert.strictEqual(((validator.validate("date").toDate()).getValue()).getTime(), 0);
   assert.isNaN((validator.validate("dateEvil").toDate()).getValue());
   assert.strictEqual(validator.validate("float").toFloat().getValue(), 123.456);
   assert.isNaN(validator.validate("floatEvil").toFloat().getValue());
   assert.strictEqual(validator.validate("int").toInt().getValue(), 123456);
   assert.isNaN(validator.validate("intEvil").toInt().getValue());
   assert.isTrue(validator.validate("boolean").toBoolean().getValue());
   assert.isTrue(validator.validate("booleanStrict").toBoolean(true).getValue());
   assert.isFalse(validator.validate("undefined").toBoolean().getValue());
   assert.isFalse(validator.validate("null").toBoolean().getValue());
   assert.isFalse(validator.validate("zero").toBoolean().getValue());
   assert.isFalse(validator.validate("false").toBoolean().getValue());
   assert.isFalse(validator.validate("emptyString").toBoolean().getValue());

   // more strict tests for booleans
   assert.isTrue(validator.validate("booleanTrueString").toBoolean(true).getValue());
   assert.isTrue(validator.validate("booleanStrict").toBoolean(true).getValue());
   assert.isFalse(validator.validate("boolean").toBoolean(true).getValue());
   assert.isFalse(validator.validate("undefined").toBoolean(true).getValue());
   assert.isFalse(validator.validate("null").toBoolean(true).getValue());
   assert.isFalse(validator.validate("zero").toBoolean(true).getValue());
   assert.isFalse(validator.validate("false").toBoolean(true).getValue());
   assert.isFalse(validator.validate("emptyString").toBoolean(true).getValue());
};

exports.testGetValue = function() {
   var obj = {
      "email": "asdf@example.com",
      "noemail": "foo.bar@baz@boo.com",
      "trimmed": "   12345           ",
      "username": "                  "
   };

   var validator = new Validator(obj);

   assert.strictEqual(validator.validate("email").isEmail("Error Message").getValue(), "asdf@example.com");
   assert.strictEqual(validator.validate("noemail").isEmail("Error Message").hasLength(1, "Error Message").getValue(), "foo.bar@baz@boo.com");
   assert.strictEqual(validator.validateAll("email").isEmail("Error Message").getValue(), "asdf@example.com");
   assert.strictEqual(validator.validateAll("noemail").isEmail("Error Message").hasLength(1, "Error Message").getValue(), "foo.bar@baz@boo.com");

   assert.strictEqual(validator.getValue("email"), "asdf@example.com");
   assert.strictEqual(validator.getValue("noemail"), "foo.bar@baz@boo.com");

   // Trimmed values
   assert.isNaN(validator.validate("trimmed").toInt().getValue());
   assert.isNaN(validator.validate("trimmed", false).toInt().getValue());
   assert.strictEqual(validator.validate("trimmed", true).toInt().getValue(), 12345);
   assert.strictEqual(validator.validate("username").getValue(), "                  ");
   assert.strictEqual(validator.validate("username", true).getValue(), "");
};

exports.testGetValues = function() {
   var obj = {
      "one": "one",
      "two": 2
   };
   var validator = new Validator(obj);
   Object.keys(obj).forEach(validator.validate, validator);
   assert.deepEqual(obj, validator.getValues());
};

exports.testHasValue = function() {
   var invalid = [null, undefined, ""];
   var params = {};
   for each (let value in invalid) {
      params.test = value;
      let validator = new Validator(params);
      validator.validate("test").hasValue("message");
      assert.isTrue(validator.hasFailures("test"));
   }
};

exports.testLengthValidations = function() {
   var invalid = [null, undefined, "", "abcd"];
   var params = {};
   for each (let value in invalid) {
      params.test = value;
      let asString = String(value);
      let validator = new Validator(params);
      validator.validate("test").minLength(asString.length + 1);
      assert.isTrue(validator.hasFailures("test"));
      validator = new Validator(params);
      validator.validate("test").maxLength(asString.length - 1);
      assert.isTrue(validator.hasFailures("test"));
      validator = new Validator(params);
      validator.validate("test").lengthBetween(asString.length + 1, asString.length -1);
      assert.isTrue(validator.hasFailures("test"));
      validator = new Validator(params);
      validator.validate("test").hasLength(asString.length - 1);
      assert.isTrue(validator.hasFailures("test"));
   }
};

exports.testToValue = function() {
   var obj = {
      "a": 1,
      "b": "foo.bar@baz@boo.com",
      "c": "   12345           "
   };

   var validator = new Validator(obj);

   assert.strictEqual(validator.validate("a").toValue(function(val) { return 5 + val; }).getValue(), 6);
   assert.strictEqual(validator.validate("b").toValue(function(val) { return val.replace(/\@/g, ""); }).getValue(), "foo.barbazboo.com");
   assert.strictEqual(validator.validate("c").toValue(function(val) { return parseInt(val.trim()); }).getValue(), 12345);

   assert.throws(function() { validator.validate("a").toValue(); });
   assert.throws(function() { validator.validate("a").toValue("abc"); });
   assert.throws(function() { validator.validate("a").toValue(12345); });
};

exports.testHashIsNotAnObject = function() {
   var obj = {
      "a": 1,
      "b": "foo.bar@baz@boo.com",
      "c": "   12345           "
   };

   var validator = new Validator(obj);

   //assert.strictEqual(validator.validate("hasOwnProperty"));
   validator.validate("hasOwnProperty").toValue(function(val) {
      assert.isFalse(typeof val === "function");
      return val;
   });
};

exports.testOptional = function() {
   var obj = {
      "a": "1",
      "b": "c"
   };

   var validator = new Validator(obj);

   validator.validate("a").optional().isInt().toInt();
   assert.isFalse(validator.hasFailures("a"));
   assert.strictEqual(validator.getValue("a"), 1);

   validator.validate("b").optional().isAlpha();
   assert.isFalse(validator.hasFailures("b"));
   assert.strictEqual(validator.getValue("b"), "c");

   validator.validate("d").optional().isAlpha();
   assert.isFalse(validator.hasFailures("d"));
   assert.strictEqual(validator.getValue("d"), undefined);

   validator.validate("e").optional("12345").isInt().toInt();
   assert.isFalse(validator.hasFailures("e"));
   assert.strictEqual(validator.getValue("e"), 12345);

   validator.validate("e").optional().isInt().toInt();
   assert.isFalse(validator.hasFailures("e"));

   validator.validate("f").optional("");
   assert.isFalse(validator.hasFailures("f"));
   assert.strictEqual(validator.getValue("f"), "");
};

// Run the tests
if (require.main == module.id) {
   system.exit(require('test').run(exports));
}