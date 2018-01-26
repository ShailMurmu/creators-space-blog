const mongoose = require('mongoose');
const validator = require('validator');
// const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./../config');

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
    activeToken: {
      type: String,
      default: null
    }
  },
  active: {
    type: Boolean,
    default: false
  }
});

var feedSchema = mongoose.Schema({
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
  feedback: {
    type: String,
    required: true,
    minlength: 1
  }
});

// var tokenSchema = mongoose.Schema({
//   value: {
//     type: String
//   },
//   usr: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Users'
//   },
//   createdAt: {
//     type: Date,
//     expires: 120,
//     default: Date.now
//   }
// });

// userSchema.methods.generateToken = function(){
//   var token = new Tokens();
//   token.value = jwt.sign({
//     usr: this._id,
//     iat: new Date().getTime()
//   }, JWT_SECRET);
//   token.usr = this._id;
//   this.token.authToken = token._id;
//   this.save((err) => {
//     if(err)
//      console.log("err in saving user while tokenGen");
//     token.save((err) => {
//       if(err)
//       console.log("err in saving token while tokenGen");
//     });
//   });
// };


var Users = mongoose.model('Users', userSchema);
var Feedbacks = mongoose.model('Feedbacks', feedSchema);


// var Tokens = mongoose.model('Tokens', tokenSchema);

module.exports = {
  Users, Feedbacks
}
