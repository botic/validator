validator
=========

Validator is a lightweight validation and sanitization library for RingoJS.
It’s using the `ringo/utils/strings` module for string validation.

## Example

In a Web application you can use the validator to validate the submitted data:

```javascript
var validator = new Validator(req.postParams);

validator.validate("username", true) // true --> trim the value
   .isDefined("Username is missing!")
   .hasMinLength(3, "Username is too short!")
   .hasMaxLength(255, "Username is too long!");

validator.validate("email")
   .isDefined("Email address is missing!")
   .isEmail("Invalid email address!");

validator.validate("age")
   .isInt("Invalid age!")
   .toInt().isGreaterThan(17, "You need to be 18 years old!");
   
// Retrieve a single value
log.debug("Age: " +  validator.getValue("age"));

if (validator.hasFailures()) {
   // Display errors
   return respone.html(
      // returns an object with grouped error messages
      // e.g. { "age": ["Invalid age!"], "email": […] }
      validator.getMessages()
   );
}
```

## API Reference

* [Release 2.1.0](https://github.com/botic/validator/wiki/API-Reference-Release-2.1.0)
* [Release 2.0.0](https://github.com/botic/validator/wiki/API-Reference-Release-2.0.0)

## Changelog

* **Release 2.1.0**
  * adds `hasUnvalidatedProperties()` to check if the validated object has no additional properties defined
* **Release 2.0.0**
  * all validating functions are now prefixed with `is` or `has` e.g. `minLength()` changed to `hasMinLength()` 
  * Changed the semantics of `.optional()`, which will no longer execute
    subsequent validation functions or converts.
  * The default value provided in `.optional()` will be returned by `validator.getValue()`now 

[ ![Codeship Status for botic/validator](https://codeship.com/projects/b77d7cf0-9c82-0131-4c86-5af6bd151f39/status?branch=master)](https://codeship.com/projects/17769)
