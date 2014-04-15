validator
=========

Validator is a lightweight validation and sanitization library for RingoJS. It’s using the `ringo/utils/strings` module for string validation.

## Example

In a Web application you can use the validator to validate the submitted data:

```javascript
var validator = new Validator(req.postParams);

validator.validate("username")
   .isDefined("Username is missing!")
   .minLength(3, "Username is too short!"),
   .maxLength(255, "Username is too long!");

validator.validate("email")
   .isDefined("Email address is missing!")
   .isEmail("Invalid email address!");

validator.validate("age")
   .isInt("Invalid age!")
   .toInt().greaterThan(17, "You need to be 18 years old!");

if (validator.hasFailures()) {
   // Display errors
   return respone.html(
      validator.getMessages().join("<br>")
   );
}
```


![Codeship Status](https://www.codeship.io/projects/b77d7cf0-9c82-0131-4c86-5af6bd151f39/status)
