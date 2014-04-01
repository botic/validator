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

var strings = require("ringo/utils/strings");

var Validator = exports.Validator = function(objectToValidate) {
   this.obj = objectToValidate;
   this.validations = {};
};

Validator.prototype.addValidation = function(name, value) {
   return this.validations[name] = {
      "name": name,
      "value": value,
      "isValid": true,
      "messages": []
   };
};

/**
 * Main validation entry point. The result of this method contains
 * various validation methods that can be chained. Note that this
 * validation object stops validating at the first fail.
 * @param {String} name The name of the value
 * @returns {Validation} A Validation instance
 * @see Validator.prototype.validateAll
 */
Validator.prototype.validate = function(key) {
   return new Validation(this.addValidation(key, this.obj[key]), true);
};

/**
 * Main validation entry point. The result of this method contains
 * various validation methods that can be chained. Note that this
 * validation object does not stop at the first fail but continues
 * to validate all validation methods.
 * @param {String} name The name of the value
 * @param {Object} value The value to validate
 * @returns {Validation} A Validation instance
 * @see Validator.prototype.validate
 */
Validator.prototype.validateAll = function(key) {
   return new Validation(this.addValidation(key, this.obj[key]), false);
};

/**
 * Returns true if any of the validations of this validator failed
 * @param {String} name Optional name of a single value to check
 * @returns {Boolean} True if any (or the specified value) validation failed
 */
Validator.prototype.hasErrors = function(name) {
    if (name != undefined) {
        return !this.validations.hasOwnProperty(name) || !this.validations[name].isValid;
    }
    return true !== Object.keys(this.validations).every(function(key) {
        return this[key].isValid;
    }, this.validations);
};

Validator.prototype.errorMessages = function(name) {
   if (name != undefined) {
      return this.hasErrors(name) ? this.validations[name].messages : [];
   }

   var messages = [];
   for each (let validation in this.validations) {
      if (!validation.isValid) {
         messages = messages.concat(validation.messages);
      }
   }
   return messages;
};

/**
 * Returns an object suitable for use as template rendering context.
 * This object contains all values stored by their name, an
 * object named `errors` containing the validation failure messages
 * by value name, and a boolean `hasErrors`.
 * @returns {Object} The template context object
 */
Validator.prototype.getTemplateContext = function() {
    var result = {
        "hasErrors": this.hasErrors(),
        "errors": {}
    };
    for each (let validation in this.validations) {
        result[validation.name] = validation.value;
        if (!validation.isValid) {
            result.errors[validation.name] = validation.messages;
        }
    }
    return result;
};

var Validation = function(validation, stopOnFail) {
   Object.defineProperties(this, {
      "validation": {"value": validation},
      "value": {"value": validation.value, writable: true},
      "stopOnFail": {"value": stopOnFail === true},
      "isValid": {
         "get": function() {
            return this.validation.isValid === true;
         }
      }
   });

   return this;
};

var VoidValidation = function(value) {
   this.value = value;
};

Validation.prototype.checkResult = function(passes, message) {
   if (!passes) {
      this.validation.isValid = false;
      this.validation.messages.push(message);

      if (this.stopOnFail === true) {
         return new VoidValidation(this.value);
      }
   }

   return this;
};

Validation.prototype.isAlpha = function(message) {
   return this.checkResult(strings.isAlpha(this.value), message);
};

Validation.prototype.isAlphanumeric = function(message) {
   return this.checkResult(strings.isAlphanumeric(this.value), message);
};

Validation.prototype.isDateFormat = function(message) {
   return this.checkResult(strings.isDateFormat(this.value), message);
};

Validation.prototype.isUrl = function(message) {
   return this.checkResult(strings.isUrl(this.value), message);
};

Validation.prototype.isEmail = function(message) {
   return this.checkResult(strings.isEmail(this.value), message);
};

Validation.prototype.isFileName = function(message) {
   return this.checkResult(strings.isFileName(this.value), message);
};

Validation.prototype.isHexColor = function(message) {
   return this.checkResult(strings.isHexColor(this.value), message);
};

Validation.prototype.isNumeric = function(message) {
   return this.checkResult(strings.isNumeric(this.value), message);
};

Validation.prototype.isInt = function(message) {
   return this.checkResult(strings.isInt(this.value), message);
};

Validation.prototype.isFloat = function(message) {
   return this.checkResult(strings.isFloat(this.value), message);
};

Validation.prototype.isNumber = function(message) {
   return this.checkResult((strings.isFloat(this.value) || strings.isInt(this.value)), message);
};

Validation.prototype.minLength = function(min, message) {
   return this.checkResult((this.value.length >= min), message);
};

Validation.prototype.maxLength = function(max, message) {
   return this.checkResult((this.value.length <= max), message);
};

Validation.prototype.lengthBetween = function(min, max, message) {
   return this.checkResult((this.value.length >= min && this.value.length <= max), message);
};

Validation.prototype.hasLength = function(len, message) {
   return this.checkResult((this.value.length === len), message);
};

Validation.prototype.equal = function(obj, message) {
   return this.checkResult((this.value == obj), message);
};

Validation.prototype.strictEqual = function(obj, message) {
   return this.checkResult((this.value === obj), message);
};

Validation.prototype.isTrue = function(message) {
   return this.checkResult(this.value, message);
};

Validation.prototype.isFalse = function(message) {
   return this.checkResult(!this.value, message);
};

Validation.prototype.isDefined = function(message) {
   return this.checkResult(this.value !== undefined, message);
};

Validation.prototype.notNull = function(message) {
   return this.checkResult(this.value != null, message);
};

Validation.prototype.strictNotNull = function(message) {
   return this.checkResult(this.value !== null, message);
};

Validation.prototype.matches = function(regex, message) {
   return this.checkResult(regex.test(this.value), message);
};

Validation.prototype.passes = function(func, message) {
   if (typeof func !== "function") {
      throw "Validator function argument is not a function!";
   }

   return this.checkResult(func(this.value) === true, message);
};

/*** Sanitizers ***/
Validation.prototype.toDate = function() {
   var date = Date.parse(this.value);
   this.value = !isNaN(date) ? new Date(date) : null;
   return this.value;
};

Validation.prototype.toFloat = function () {
   this.value = parseFloat(this.value);
   return this.value;
};

Validation.prototype.toInt = function(radix) {
   this.value = parseInt(this.value, radix || 10);
   return this.value;
};

Validation.prototype.toBoolean = function(strictTrue) {
   if (strictTrue) {
      this.value = this.value === "1" || this.value === "true";
   } else {
      this.value = this.value !== "0" && this.value !== "false" && this.value !== "";
   }

   return this.value;
};

// Add functions to the VoidValidation
for (var fn in Validation.prototype) {
   VoidValidation.prototype[fn] = function() { return this; };
}