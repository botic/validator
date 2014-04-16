var assert = require("assert");
var system = require("system");

var {Application} = require("stick");

exports.testMiddleware = function() {
   var app = new Application();
   app.configure("params", require("../lib/validator"), "route");

   app.get("/", function(req) {
      req.validate("foo").hasLength(3, "not bar");
      req.validate("fooTrim").hasLength(3, "not bar trim");
      req.validate("int").isInt("not an int");

      assert.isFalse(req.hasFailures(), "Expected no failures");
      for each (let key in Object.keys(req.validator.getValues())) {
         assert.strictEqual(0, req.failureMessages(key).length, "Expected no failure messages");
      }
   });

   app.del("/", function(req) {
      req.validate("foo").hasLength(3, "not bar");
      req.validate("fooTrim").hasLength(3, "not bar trim");
      req.validate("int").isInt("not an int");

      assert.isFalse(req.hasFailures(), "Expected no failures");
      for each (let key in Object.keys(req.validator.getValues())) {
        assert.strictEqual(0, req.failureMessages(key).length, "Expected no failure messages");
      }
   });

   app.post("/", function(req) {
      req.validate("foo").hasLength(3, "not bar");
      req.validate("fooTrim", true).hasLength(3, "not bar trim");
      req.validate("int").isInt("not an int");

      assert.strictEqual("12345", req.validator.getValue("int"));
      assert.isFalse(req.hasFailures(), "Expected no failures");
      for each (let key in Object.keys(req.validator.getValues())) {
        assert.strictEqual(0, req.failureMessages(key).length, "Expected no failure messages");
      }
   });

   app.put("/", function(req) {
      req.validate("foo").hasLength(3, "not bar");
      req.validate("fooTrim", true).hasLength(3, "not bar trim");
      req.validate("int").isInt("not an int");

      assert.isFalse(req.hasFailures(), "Expected no failures");
      for each (let key in Object.keys(req.validator.getValues())) {
        assert.strictEqual(0, req.failureMessages(key).length, "Expected no failure messages");
      }
   });


   var envMock = {
      servletRequest: {
         getCharacterEncoding: function() { return "utf8"; }
      }
   };

   app({
      method: "GET",
      headers: { host: "example.com" },
      env: envMock,
      pathInfo: "/",
      queryString: "foo=bar&fooTrim=bar&int=12345"
   });

   app({
      method: "POST",
      headers: {
         "host": "example.com",
         "content-type": "application/json"
      },
      input: {
         read: function() {
            return {
               decodeToString: function() {
                  return "{\"foo\": \"bar\", \"fooTrim\": \"   bar  \", \"int\": \"12345\"}";
               }
            }
         }
      },
      env: envMock,
      pathInfo: "/",
      queryString: ""
   });

};

// Run the tests
if (require.main == module.id) {
   system.exit(require('test').run(exports));
}