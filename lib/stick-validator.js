/* The MIT License (MIT)
 *
 * Copyright (c) 2014 Philipp Naderer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @fileOverview Middleware to validate requests.
 * Depending on the request method it automatically decides if it
 * uses `req.queryParams` (default) or `req.postParams` (only for POST and PUT).
 * The validator requires the `params` middleware to be configured.
 *
 * @example
 * app.configure("params", require("stick-validator"), "route");
 *
 * app.get("/", function(req) {
 *   req.validate("countryCode", true).hasLength(3, "Invalid country code!");
 *   req.validate("email").isDefined("Email missing!").isEmail("Invalid email!");
 *
 *   if (req.hasFailures()) {
 *     return response.html(req.failureMessages().join("&lt;br&gt;"));
 *   }
 *
 *   return response.html("Ok");
 * });
 */

var {Validator} = require("./validator");

/**
 * @param {Function} next the wrapped middleware chain
 * @param {Object} app the Stick Application object
 * @returns {Function} a JSGI middleware function
 */
exports.middleware = function validator(next, app) {
   return function validator(req) {
      var validator = new Validator(
         req.method === "POST" || req.method === "PUT" ? req.postParams : req.queryParams
      );

      /**
       * The returned `Validation` instance contains
       * various validation functions that can be chained. Note that this
       * validation object stops validating at the first fail.
       * @function
       * @name request.validate
       * @param {String} name The name of the request parameter
       * @param {Boolean} trim Optional, trim the value of the parameter
       * @returns {Validation} A Validation instance
       */
      req.validate = function(name, trim) {
         return validator.validate(name, trim === true);
      };

      /**
       * The returned `Validation` instance contains
       * various validation functions that can be chained.
       * @function
       * @name request.validateAll
       * @param {String} name The name of the request parameter
       * @param {Boolean} trim Optional, trim the value of the parameter
       * @returns {Validation} A Validation instance
       */
      req.validateAll = function(name, trim) {
         return validator.validateAll(name, trim === true);
      };

      /**
       * Returns true if any of the validations of this validator failed.
       * @function
       * @name request.hasFailures
       * @param {String} name Optional, name of a single parameter to check
       * @returns {Boolean} True if any (or the specified parameter) validation failed
       */
      req.hasFailures = function() {
         return validator.hasFailures();
      };

      /**
       * Returns the validation failure messages.
       * @function
       * @name request.failureMessages
       * @param {String} name Optional, name to limit the messages to a single parameter
       * @returns {Array} An array containing all failure messages
       */
      req.failureMessages = function(name) {
         return validator.getMessages(name);
      };

      return next(req);
   };
};