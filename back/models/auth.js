const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");


const userModels = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userModels.plugin(uniqueValidator);
const Model = mongoose.model("User", userModels);
module.exports = Model;

// const doc = new Model({});
// 
// // Top-level error is a ValidationError, **not** a ValidatorError
// const err = doc.validateSync();
// err instanceof mongoose.Error.ValidationError; // true
// 
// // A ValidationError `err` has 0 or more ValidatorErrors keyed by the
// // path in the `err.errors` property.
// err.errors['email'] instanceof mongoose.Error.ValidatorError;
// err.errors['email'].path; // 'name'
// err.errors['email'].value; // undefined
// err.errors['password'] instanceof mongoose.Error.ValidatorError;
// err.errors['password'].path; // 'name'
// err.errors['password'].value; // undefined