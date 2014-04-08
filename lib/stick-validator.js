var strings = require("ringo/utils/strings");
var {Validator} = require("./validator");

exports.middleware = function validator(next, app) {
   return function validator(req) {
      var validator = new Validator(
         req.method === "POST" || req.method === "PUT" ? req.postParams : req.queryParams
      );

      req.validate = function(key, trim) {
         return validator.validate(key, trim === true);
      };

      req.validateAll = function(key, trim) {
         return validator.validateAll(key, trim === true);
      };

      req.hasFailures = function() {
         return validator.hasFailures();
      };

      req.failureMessages = function(key) {
         return validator.getMessages(key);
      };

      return next(req);
   };
};