const mongoose = require('mongoose');
const validator = require('validator');

var userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    unique: true,
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: '{VALUE} is not valid email'
    }
  },
  username: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  token: {
    auth: {
      type: String
    },
    activeToken: {
      type: String
    }
  },
  active: {
    type: Boolean,
    default: false
  }
});

var Users =module.exports = mongoose.model('Users', userSchema);
