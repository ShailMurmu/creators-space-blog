const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const JWTStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('./config');
const {Users} = require('./models/users');

// passport.serializeUser(function(user, done) {
//   done(null, user._id);
// });
//
// passport.deserializeUser(function(id, done) {
//   try {
//     const user = Users.findById(id);
//     done(null, user);
//   } catch (e) {
//     done(e, null);
//   }
// });


// ========================================================================
// JWT STRATEGY
passport.use('jwt', new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: JWT_SECRET
}, async (payload, done) => {
  try {
    const user = Users.findById(payload.sub.id);
    if(!user)
    return done(null, false);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}));


// ===========================================================================
// LOCAL STRATEGY
passport.use('local', new LocalStrategy({
  usernameField: 'username1',
  passwordField: 'password1',
  passReqToCallback: false
}, async (username, password, next) => {
  try {
    process.nextTick(function(){
      Users.findOne({ username }).then((user) => {
        if(!user)
        {console.log('User not found');return next(null, false, { message: 'Unknown user'});}
        bcryptjs.compare(password, user.password, (err, isMatched) => {
          if(!err){
            if(!isMatched){
              console.log('Password is incorrect');
              return next(null, false, { message: 'Incorrect password'});
            }
            return next(null, user);
          } else {
            console.log('Errror while comparing password');
          }
        });
      }, (err) => {
        console.log('Error while user searching..');
      });
    });
  } catch (err) {
    console.log('Error in login Auth..',err);
  }
}));
