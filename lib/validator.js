/* The MIT License (MIT)
 *
 * Copyright (c) 2014 Philipp Naderer
 * Copyright (c) 2014 Robert Gaggl
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
 * @fileOverview A module to validate and sanitize an object’s properties in RingoJS.
 * It depends on Ringo’s `ringo/utils/strings` module for string validation.
 *
 * @example
 * let validator = new Validator({
 *   "email": "foo.bar@example.com"
 * });
 *
 * // validate a value
 * validator.validate("email").
 *          isDefined("Email address is missing!").
 *          isEmail("Invalid email address provided");
 *
 * // returns true if a validation failed
 * validator.hasFailures();
 *
 * // returns an object with all failure messages
 * validator.getMessages();
 */

const dates = require("ringo/utils/dates");
const strings = require("ringo/utils/strings");

/**
 * Creates a new Validator instance. Validator instances provide the functionality to
 * validate values and collect messages explaining eventually occurred failures.
 * @class
 * @param {Object} objectToValidate the object to validate
 * @returns {Validator} A newly created validator instance
 * @example let validator = new Validator({
 *   "email": "foo.bar@example.com"
 * });
 *
 * // validate a value
 * validator.validate("email").
 *          isDefined("Email address is missing!").
 *          isEmail("Invalid email address provided");
 *
 * // returns true if a validation failed
 * validator.hasFailures();
 *
 * // returns an object with all failure messages
 * validator.getMessages();
 *
 */
const Validator = exports.Validator = function(objectToValidate) {
   /* The object to validate */
   /** @ignore */
   this.obj = objectToValidate;

   /** @ignore */
   this.validations = {};

   /** @ignore */
   this.addValidation = function(key, stopOnFail, trim) {
      let value = this.obj.hasOwnProperty(key) ? this.obj[key] : undefined;

      if (typeof value === "string" && trim === true) {
         value = value.trim();
      }

      return (this.validations[key] = new Validation(key, value, stopOnFail));
   };
};

/**
 * Main validation entry point. The result of this method contains
 * various validation functions that can be chained. Note that this
 * validation object stops validating at the first fail.
 * @param {String} key The property's key of the value
 * @param {boolean} trim Optional, trim the value if it's a string
 * @returns {Validation} A Validation instance
 * @see #Validator.prototype.validateAll
 */
Validator.prototype.validate = function(key, trim) {
   return this.addValidation(key, true, trim === true);
};

/**
 * Checks if all properties of the given object have been validated.
 * @return {boolean} true, if all properties had a validation; false otherwise
 * @example  let validator = new Validator({
 *   "email": "foo.bar@example.com",
 *   "additional_key": "value"
 * });
 *
 * // validate a value
 * validator.validate("email").
 *          isDefined("Email address is missing!").
 *          isEmail("Invalid email address provided");
 *
 * // returns false, since the email is valid
 * validator.hasFailures();
 *
 * // but: returns true since additional_key has no validation
 * validator.hasUnvalidatedProperties();
 */
Validator.prototype.hasUnvalidatedProperties = function() {
   let validationKeys = Object.keys(this.validations);
   let objectKeys = Object.keys(this.obj);

   // primitive pre-check before sorting
   if (validationKeys.length < objectKeys.length) {
      return true;
   }

   return objectKeys.some(function(key) {
      return validationKeys.indexOf(key) === -1;
   });
};

/**
 * Main validation entry point. The result of this method contains
 * various validation functions that can be chained. Note that this
 * validation object does not stop at the first fail but continues
 * to validate all validation functions.
 * @param {String} key The property's key of the value
 * @param {boolean} trim Optional, trim the value if it's a string
 * @returns {Validation} A Validation instance
 * @see #Validator.prototype.validate
 */
Validator.prototype.validateAll = function(key, trim) {
   return this.addValidation(key, false, trim === true);
};

/**
 * Returns true if any of the validations of this validator failed
 * @param {String} name optional name of a single value to check
 * @returns {boolean} True if any (or the specified value) validation failed
 */
Validator.prototype.hasFailures = function(name) {
    if (name !== undefined) {
        return !this.validations.hasOwnProperty(name) || !this.validations[name].isValid;
    }
    return true !== Object.keys(this.validations).every(function(key) {
        return this[key].isValid;
    }, this.validations);
};

/**
 * Returns either an array with the messages for a given key,
 * or an object with the validation names as keys and the
 * according message array as value.
 * @param {String} key Optional key to limit the failure messages to a single validation
 * @returns {Array|Object} The messages
 */
Validator.prototype.getMessages = function(key) {
   if (key !== undefined) {
      return this.hasFailures(key) ? this.validations[key].messages : [];
   }

   const messages = {};
   let iterator = Iterator(this.validations);
   for (let [key, validation] in iterator) {
      messages[key] = validation.messages.slice();
   }
   return messages;
};

/**
 * Returns the value for a validation.
 * @param {String} key The key of the validation
 * @returns The correspondending value for a validation
 */
Validator.prototype.getValue = function(key) {
   if (key === undefined) {
      return undefined;
   }

   return this.validations[key].getValue();
};

/**
 * Returns the values of all validations
 * @returns {Object} An object containing all validation values
 */
Validator.prototype.getValues = function() {
   const values = {};

   let iterator = Iterator(this.validations);
   for (let [key, validation] in iterator) {
      values[key] = validation.getValue();
   }

   return values;
};

const VoidValidation = function(value) {
   this.value = value;
};


/**
 * @class Instances of this class represent a single validation
 * and provide various methods for validating its value.
 * @param {Object} validation An object containing the name of the property,
 *        the value, a validity state and an array of messages.
 * @param {boolean} stopOnFail If false the all validation
 * method calls in a chain will be executed (optional, defaults to true)
 * @returns {Validation} A newly created validation instance
 * @constructor
 */
const Validation = exports.Validation = function(key, value, stopOnFail) {

   Object.defineProperties(this, {
      /** @ignore */
      "key": { "value": key },
      /** @ignore */
      "value": { "value": value , writable: true },
      /** @ignore */
      "stopOnFail": { "value": stopOnFail === true },
      /** @ignore */
      "isValid": { "value": true, writable: true },
      /** @ignore */
      "messages": { "value": [], writable: true }
   });

   return this;
};

/** @ignore */
const checkResult = function(validationObj, passes, message) {
   if (!passes) {
      validationObj.isValid = false;
      validationObj.messages.push(message);

      if (validationObj.stopOnFail === true) {
         return new VoidValidation(validationObj.value);
      }
   }

   return validationObj;
};


/**
 * Passes if the value has the given length.
 * @param {Number} length The required length of value
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.hasLength = function(length, message) {
   return checkResult(this, (typeof this.value === "string" &&
      this.value.length === length), message);
};

/**
 * Passes if the value's length is between the minLength and maxLength.
 * @param {Number} minLength The minimal length of value
 * @param {Number} maxLength The maximum length of value
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.hasLengthBetween = function(minLength, maxLength, message) {
   return checkResult(this, (typeof this.value === "string" &&
         this.value.length >= minLength && this.value.length <= maxLength), message);
};

/**
 * Passes if the value's length is not longer than maxLength.
 * @param {Number} maxLength The maximum length of value
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.hasMaxLength = function(maxLength, message) {
   return checkResult(this, (typeof this.value === "string" &&
      this.value.length <= maxLength), message);
};

/**
 * Passes if the value's length is not shorter than minLength.
 * @param {Number} minLength The minimal length of value
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.hasMinLength = function(minLength, message) {
   return checkResult(this, (typeof this.value === "string" &&
      this.value.length >= minLength), message);
};

/**
 * Passes if the value is not undefined, not null or the not empty string.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.hasValue = function(message) {
   return checkResult(this, this.value != null &&
      (typeof this.value !== "string" || this.value.length > 0), message);
};

/**
 * Passes if the value is alphabetic.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isAlpha = function(message) {
   return checkResult(this, typeof this.value === "string" && strings.isAlpha(this.value), message);
};

/**
 * Passes if the value contains only letters of the alphabet and numbers.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isAlphanumeric = function(message) {
   return checkResult(this, typeof this.value === "string" && strings.isAlphanumeric(this.value), message);
};

/**
 * Passes if the value is a valid date format pattern.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isDateFormat = function(message) {
   return checkResult(this, typeof this.value === "string" && strings.isDateFormat(this.value), message);
};

/**
 * Passes if the value is not undefined.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isDefined = function(message) {
   return checkResult(this, this.value !== undefined, message);
};

/**
 * Passes if the value is a valid email address.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isEmail = function(message) {
   return checkResult(this, typeof this.value === "string" && strings.isEmail(this.value), message);
};

/**
 * Passes if the value is equal to the given object.
 * @param {Object} obj The object to compare
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isEqual = function(obj, message) {
   return checkResult(this, (this.value == obj), message);
};

/**
 * Passes if the value is false.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isFalse = function(message) {
   return checkResult(this, this.value === false, message);
};

/**
 * Passes if the value contains no characters
 * that are forbidden in file names.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isFileName = function(message) {
   return checkResult(this, typeof this.value === "string" && strings.isFileName(this.value), message);
};

/**
 * Passes if the value is a valid floating point string literal or of type `Number` with a remainder.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isFloat = function(message) {
   return checkResult(this, (typeof this.value === "string" && strings.isFloat(this.value)) || (typeof this.value === "number" && (this.value % 1 !== 0)), message);
};

/**
 * Passes if the value is greater than the given number: <code>value > right</code>
 * @param {Number} right The right number of the numeric comparison.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isGreaterThan = function(right, message) {
   return checkResult(this, this.value > right, message);
};

/**
 * Passes if the value is a valid color value in hexadecimal format.
 * It may also contain # as first character.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isHexColor = function(message) {
   return checkResult(this, typeof this.value === "string" && strings.isHexColor(this.value), message);
};

/**
 * Passes if the value is a valid integer string literal or `Number.isSafeInteger(value)` returns true.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isInt = function(message) {
   return checkResult(this, (typeof this.value === "string" && strings.isInt(this.value)) || Number.isSafeInteger(this.value), message);
};

/**
 * Passes if the value is less than the given number: <code>value < right</code>
 * @param {Number} right The right number of the numeric comparison.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isLessThan = function(right, message) {
   return checkResult(this, this.value < right, message);
};

/**
 * Passes if the value is NaN.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isNaN = function(message) {
   return checkResult(this, Number.isNaN(this.value), message);
};

/**
 * Passes if the value is not NaN.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isNotNaN = function(message) {
   return checkResult(this, !Number.isNaN(this.value), message);
};

/**
 * Passes if the value is null.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isNull = function(message) {
   return checkResult(this, this.value == null, message);
};

/**
 * Passes if the value is not null.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isNotNull = function(message) {
   return checkResult(this, this.value != null, message);
};

/**
 * Passes if the value contains only the characters [0-9] or is of type number.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isNumeric = function(message) {
   return checkResult(this, typeof this.value === "number" || (typeof this.value === "string" && strings.isNumeric(this.value)), message);
};

/**
 * Passes if the value is a valid floating point or integer string literal.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isNumber = function(message) {
   return checkResult(this, typeof this.value === "number" || (typeof this.value === "string" && (strings.isFloat(this.value) || strings.isInt(this.value))), message);
};

/**
 * Passes if the value is strict equal to the given object.
 * @param {Object} obj The object to compare
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isStrictEqual = function(obj, message) {
   return checkResult(this, (this.value === obj), message);
};

/**
 * Passes if the value is strict not null.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isStrictNotNull = function(message) {
   return checkResult(this, this.value !== null, message);
};

/**
 * Passes if the value is strict null.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isStrictNull = function(message) {
   return checkResult(this, this.value === null, message);
};

/**
 * Passes if the value is a string.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isString = function(message) {
   return checkResult(this, typeof this.value === "string", message);
};

/**
 * Passes if the value is true.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isTrue = function(message) {
   return checkResult(this, this.value === true, message);
};

/**
 * Passes if the value is a valid URL.
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.isUrl = function(message) {
   return checkResult(this, typeof this.value === "string" && strings.isUrl(this.value), message);
};

/**
 * Passes if the value matched the given regular expression.
 * @param {RegExp} regex The regular expression to match
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.matches = function(regex, message) {
   return checkResult(this, regex.test(this.value), message);
};

/**
 * Marks the validation of a key as optional. If provided and if a key is not defined or its value is falsy,
 * the validation's value will be replaced with the `defaultValue`.
 * @param {*} defaultValue an optional default value for the given validation
 * @param {boolean} strict if true, the key's value must be `undefined` to apply the default value,
 *                         otherwise a falsy value will be sufficient to fall back.
 * @returns {Validation} This validation instance
 */
Validation.prototype.optional = function(defaultValue, strict) {
   if ((strict === true && this.value === undefined) || (strict !== true && !this.value)) {
      this.value = defaultValue;
      return new VoidValidation(defaultValue);
   }

   return this;
};

/**
 * Passes if the given function returns true.
 * The function receives the value as first argument.
 * @param {Function} func The validation function
 * @param {String} message The failure message
 * @returns {Validation} This validation instance
 */
Validation.prototype.passes = function(func, message) {
   if (typeof func !== "function") {
      throw new Error("Validator function argument is not a function!");
   }

   return checkResult(this, func(this.value) === true, message);
};

/**
 * Converts the value to a boolean.
 * @param {boolean} strictTrue only return true if value is strict "true" or "1"
 * @returns {Validation} This validation instance
 */
Validation.prototype.toBoolean = function(strictTrue) {
   if (strictTrue) {
      this.value = this.value === "1" || this.value === "true";
   } else {
      this.value = this.value !== null && this.value !== undefined &&
         this.value !== "0" && this.value !== "false" && this.value !== "";
   }

   return this;
};

/**
 * Converts the value to a Date object or NaN if parsing failed.
 * @param {String} format (optional) a specific format pattern for the parser
 * @param {String|java.util.Locale} locale (optional) the locale as <code>java.util.Locale</code> object or
 *        an ISO-639 alpha-2 code (e.g. "en", "de") as string
 * @param {String|java.util.TimeZone} timezone (optional) the timezone as java TimeZone
 *        object or  an abbreviation such as "PST", a full name such as "America/Los_Angeles",
 *        or a custom ID such as "GMT-8:00". If the id is not provided, the default timezone is used.
 *        If the timezone id is provided but cannot be understood, the "GMT" timezone is used.
 * @param {boolean} lenient (optional) disables lenient parsing if set to false.
 * @returns {Validation} This validation instance
 */
Validation.prototype.toDate = function(format, locale, timezone, lenient) {
   this.value = dates.parse(this.value, format, locale, timezone, lenient);
   return this;
};

/**
 * Converts the value to a floating point number or NaN if if parsing failed.
 * @returns {Validation} This validation instance
 */
Validation.prototype.toFloat = function () {
   if (typeof this.value === "string" && !strings.isFloat(this.value)) {
      this.value = NaN;
   }

   this.value = parseFloat(this.value);

   return this;
};

/**
 * Converts the value to an integer number or NaN if if parsing failed.
 * @returns {Validation} This validation instance
 */
Validation.prototype.toInt = function(radix) {
   if (typeof this.value === "string" && !strings.isInt(this.value)) {
      this.value = NaN;
   }

   this.value = parseInt(this.value, radix || 10);

   return this;
};

/**
 * Converts the value with the given function.
 * @param {Function} converter The function to apply on the current value
 * @returns {Validation} This validation instance
 */
Validation.prototype.toValue = function(converter) {
   if (typeof converter !== "function") {
      throw new Error("Validator function argument is not a function!");
   }

   this.value = converter(this.value);

   return this;
};

/**
 * Returns the value of the validation.
 * @returns Current value of the validation
 */
Validation.prototype.getValue = function() {
   return this.value;
};

const voidCheck = function() {
   return this;
};

// Add functions to the VoidValidation
for (let fn in Validation.prototype) {
   // Ignore sanitizers and getValue
   VoidValidation.prototype[fn] = (fn === "getValue" ? Validation.prototype.getValue : voidCheck);
}


/**
 * Middleware to validate requests.
 * Depending on the request method it automatically decides if it
 * uses `req.queryParams` (default) or `req.postParams` (only for POST and PUT).
 * The validator requires the `params` middleware to be configured.
 *
 * @param {Function} next the wrapped middleware chain
 * @param {Object} app the Stick Application object
 * @returns {Function} a JSGI middleware function
 *
 * @example
 * app.configure("params", require("validator"), "route");
 *
 * app.get("/", function(req) {
 *
 *   req.validate("countryCode", true)
 *      .hasLength(3, "Invalid country code!");
 *
 *   req.validate("email")
 *      .isDefined("Email missing!")
 *      .isEmail("Invalid email!");
 *
 *   if (req.hasFailures()) {
 *     return response.html(req.failureMessages().join("&lt;br&gt;"));
 *   }
 *
 *   return response.html("Ok");
 * });
 */
exports.middleware = function(next, app) {
   return function validator(req) {
      const validator = new Validator(
         req.method === "POST" || req.method === "PUT" ? req.postParams : req.queryParams
      );

      /**
       * The Validator instance.
       * @name JSGIRequest.validator
       * @see #Validator
       * @example
       * req.validator.getValue("email");
       */
      Object.defineProperty(req, "validator", {
         get: function() {
            return validator;
         }
      });

      /**
       * The returned `Validation` instance contains
       * various validation functions that can be chained. Note that this
       * validation object stops validating at the first fail.
       * @function
       * @name JSGIRequest.validate
       * @param {String} name The name of the request parameter
       * @param {boolean} trim Optional, trim the value of the parameter
       * @returns {Validation} A Validation instance
       * @see #Validator.prototype.validate
       * @example
       * req.validate("pinCode", true).hasLength(4, "Invalid PIN!");
       */
      Object.defineProperty(req, "validate", {
         get: function() {
            return function(name, trim) {
               return validator.validate(name, trim === true);
            }
         }
      });

      /**
       * The returned `Validation` instance contains
       * various validation functions that can be chained.
       * @function
       * @name JSGIRequest.validateAll
       * @param {String} name The name of the request parameter
       * @param {boolean} trim Optional, trim the value of the parameter
       * @returns {Validation} A Validation instance
       * @see #Validator.prototype.validateAll
       * @example
       * req.validateAll("pinCode", true)
       *   .hasLength(4, "Invalid length!")
       *   .isNumeric("Only numeric PINs allowed!");
       */
      Object.defineProperty(req, "validateAll", {
         get: function() {
            return function(name, trim) {
               return validator.validateAll(name, trim === true);
            }
         }
      });

      /**
       * Returns true if any of the validations of this validator failed.
       * @function
       * @name JSGIRequest.hasFailures
       * @param {String} name Optional, name of a single parameter to check
       * @returns {boolean} True if any (or the specified parameter) validation failed
       * @see #Validator.prototype.hasFailures
       */
      Object.defineProperty(req, "hasFailures", {
         get: function() {
            return function() {
               return validator.hasFailures();
            }
         }
      });

      /**
       * Returns the validation failure messages.
       * @function
       * @name JSGIRequest.failureMessages
       * @param {String} name Optional, name to limit the messages to a single parameter
       * @returns {Array} An array containing all failure messages
       * @see #Validator.prototype.failureMessages
       */
      Object.defineProperty(req, "failureMessages", {
         get: function() {
            return function(name) {
               return validator.getMessages(name);
            }
         }
      });

      return next(req);
   };
};