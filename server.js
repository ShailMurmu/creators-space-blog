const express = require('express');
const ehbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const { MongoClient, ObjectId } = require('mongodb');
const {Users, Feedbacks} = require('./models/users');
const http = require('http');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {
  JWT_SECRET,MAILER_USER,MAILER_PASS,MY_IP
} = require('./config');
const passport = require('passport');
require('./passport');
const mailer = require('./misc/mailer');
passport.authenticate();
var app = express();


// const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
// const session = require('express-session');
//const expressValidator = require('express-validator');


// =========================================================================================================================
// Cookies parser
app.use(cookieParser());
//
// // Express Session Middleware
// app.use(session({
//   secret: 'Secret keyword here',
//   resave: true,
//   saveUninitialized: true
// }));
//
// app.use(passport.initialize());
// app.use(passport.session());

// // Express Message Middleware
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//   res.locals.message = require('express-message')(req, res);
//   next();
// });
// =========================================================================================================================



mongoose.Promise = global.Promise;

var server = http.createServer(app).listen(3000, () => {
  console.log('Server started and io listening on port 3000');
});


// ================================================================================================
// DATABASE SETTINGS

mongoose.connect(`mongodb://${MY_IP}:27017/CreatorSpace`, {
  useMongoClient: true
}).then((result) => {
  console.log('database connection established ');
}, (err) => {
  console.log('Unable to connect database ', err);
});


/* =================================================================================================
                IO COMMUNICATION
*/
var io = socketIO.listen(server);

io.sockets.on('connection', (socket) => {
  console.log('New IO connection established');

  socket.on('eCheck', (obj) => {
    MongoClient.connect(`mongodb://${MY_IP}:27017/CreatorSpace`, (err, db) => {
      if (err) {
        return console.log('Unable to connect to database');
      }
      db.collection('users').findOne({
        email: obj.email
      }).then((user) => {
        if (user) {
          socket.emit('eValidateMessage', {
            message: true
          });
        } else {
          socket.emit('eValidateMessage', {
            message: false
          });
          console.log('Email not found...');
        }
      }, (err) => {
        console.log('Error while query for email');
      });
    });
  });

  socket.on('uCheck', (obj) => {
    MongoClient.connect(`mongodb://${MY_IP}:27017/CreatorSpace`, (err, db) => {
      if (err) {
        return console.log('Unable to connect to database');
      }
      db.collection('users').findOne({
        username: obj.username
      }).then((user) => {
        if (user) {
          socket.emit('uValidateMessage', {
            message: true
          });
        } else {
          socket.emit('uValidateMessage', {
            message: false
          });
          console.log('Username not found...');
        }
      }, (err) => {
        console.log('Error while query for username');
      });
    });
  });

  socket.on('loginCheck', (obj) => {
    MongoClient.connect(`mongodb://${MY_IP}:27017/CreatorSpace`, (err, db) => {
      if (err) {
        return console.log('Unable to connect to database');
      }
      db.collection('users').findOne({
        username: obj.username
      }).then((user) => {
        if (user) {
          if(user.active) {
            bcryptjs.compare(obj.password, user.password, (err, isMatched) => {
              if(err) {console.log("err in login/active/password");} else {
                if(isMatched){
                  socket.emit('loginCheck', {path: true, message: "Valiation Success"});
                } else {
                  socket.emit('loginCheck', {path: false, message: "Either username or password!! is incorrect"});
                }
              }
          });
          } else {
            socket.emit('loginCheck', {path: false, message: "Please check your registered email to activate your account"});
          }
        } else {
          socket.emit('loginCheck', {path: false, message: "Either username!! or password is incorrect"});
        }
      }, (err) => {
        console.log('Error while query for username');
      });
    });
});

socket.on('disconnect', () => {
  console.log("Client Disconnected");
});

});

/*=================================================================================================================================================*/
// CONFIGURATION

app.use(express.static(__dirname, '/public'));
// app.set('view engine', 'hbs');

// hbs.registerPartials(__dirname + '/views/partials');
// ehbs.registerHelper('getCurrentYear', function() {
//   return new Date().getFullYear();
// });



app.set('views', path.join(__dirname + '/views'));
app.engine('handlebars', ehbs({
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, "views/partials"),
  helpers: {
    getCurrentYear: function() {
      return new Date().getFullYear();
    },
    if: function(conditional, options) {
          if(conditional) {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        },
      ip: function() {
        return MY_IP;
      }
  }
  }));
// app.engine('handlebars', ehbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(passport.initialize());

// ====================================================================================================================================================
// UTILITY FUNCTION
const isAuthenticated = (req, res, next) => {
  if (req.cookies.token) {
    next();
  } else {
    console.log('UnAuthorized');
    res.redirect('/');
  }
}

// ==================================================================================================================================================
// ROUTES

app.route('/forgotPass').get(async(req, res) => {
  res.render('forgotPass');
}).post(async(req, res) => {
  // console.log(req.body.email);

  MongoClient.connect(`mongodb://${MY_IP}:27017/CreatorSpace`, (err, db) => {
    if (err) {
      return console.log('Unable to connect to database');
    }
    db.collection('users').findOne({
      email: req.body.email
    }).then((user) => {
        if(user)
        {
            // var jkl = user._id;
            var forgotpasstoken = jwt.sign({
             iss: 'Creators Space',
             sub: {
               id: user._id,
               usr: user.username,
             },
             iat: new Date().getTime()
           }, JWT_SECRET);


           // MAILING SEQUENCE
           let transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 25,
                auth: {
                  user: MAILER_USER,
                  pass: MAILER_PASS
                },
                tls: {
                  rejectUnauthorized: false
                }
              });

               var url = `http://${MY_IP}:3000/mail/${forgotpasstoken}`;
              let HelperOptions = {
                from: '"CreatorSpace" <no-reply@gmail.com>',
                to: req.body.email,
                subject: 'Reset Password',
                html: `Reset your password clicking on the following link<br><br><a href="${url}">${forgotpasstoken}</a>
                <br> Thanks!!`
              };
              transporter.sendMail(HelperOptions, (error, info) => {
                if (error) {
                  return console.log(error);
                }
                console.log("Message sent!");
              });

        }
        else {
          console.log('error in finding email');
        }
    });
  });
  res.redirect('/');
});


app.route('/mail/:forgotpasstoken').get(async (req,res) => {
    try {
      const { sub } = jwt.verify(req.params.forgotpasstoken, JWT_SECRET);
      // console.log(sub);
      res.render('confirmnewpass',{
        id: sub.id
      });
    } catch (err) {
      console.log("error in sending token",err);
    }
});

app.route('/newpasspost/:id').post(async (req ,res) => {

  MongoClient.connect(`mongodb://${MY_IP}:27017/CreatorSpace`, (err, db) => {
    if(err)
    {
      return console.log('Unable to connect to database');
    }
    // console.log(req.body);
    // console.log(req.params.id);
    // const { sub } = req.params.id;

    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(req.body.password, salt, (err, hash) => {
        if (err) {
          console.log('Error in hash Generation');
        } else {
                  try {
                    db.collection('users').update({ _id: new ObjectId(req.params.id)}, { $set: { password: hash } } );
                  } catch (err) {
                    console.log("llll",err);
                  }
        }
      });

    });
});

  res.redirect('/');
});


app.get('/test0', (req, res) => {
  res.render('test0');
});

app.route('/test1').get((req, res) => {
  res.sendFile(path.join(__dirname, '/public/test.html'));
}).post((req, res) => {
  console.log(req.body);
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

app.route('/portfolio').get(isAuthenticated, async(req, res) => {
  try{
    var info = jwt.verify(req.cookies.token, JWT_SECRET);
  } catch(err) {
    console.log("Token decode err");
  }
  res.render('portfolio',{
    firstName: info.firstName,
    lastName: info.lastName,
    username: info.username,
    email: info.email,
    token: req.cookies.token
  });
});

app.get('/companyinformation', (req, res) => {
  res.render('companyinformation',{
    token: req.cookies.token
  });
});

app.route('/').get( async (req, res) => {
  res.render('index',{
    token: req.cookies.token,
    ip: MY_IP
  });
}).post(async (req, res) => {
  var newuser = new Users({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });
  bcryptjs.genSalt(10, (err, salt) => {
    bcryptjs.hash(newuser.password, salt, (err, hash) => {
      if (err) {
        console.log('Error in hash Generation');
      } else {
        newuser.password = hash;
        newuser.save((err, result) => {
          if (err) {
            console.log('Error occured while saving user');
            res.render('index');
          } else {
            console.log('User successfully saved');
            res.render('index');
            try {
             result.token.activeToken = jwt.sign({
               iss: 'Creators Space',
               sub: {
                 id: result._id,
                 usr: result.username
               },
               iat: new Date().getTime()
             }, JWT_SECRET);
             result.save();

             // MAILING SEQUENCE
             let transporter = nodemailer.createTransport({
                  service: 'gmail',
                  secure: false,
                  port: 25,
                  auth: {
                    user: MAILER_USER,
                    pass: MAILER_PASS
                  },
                  tls: {
                    rejectUnauthorized: false
                  }
                });

               let url = `http://${MY_IP}:3000/activate/${newuser.token.activeToken}`;

                let HelperOptions = {
                  from: '"CreatorSpace" <no-reply@gmail.com>',
                  to: newuser.email,
                  subject: 'Please verify your email',
                  html: `Please verify your Email by clicking on the following link<br><br><a href="${url}">${newuser.token.activeToken}</a>
                  <br> Thanks!!`
                };
                transporter.sendMail(HelperOptions, (error, info) => {
                  if (error) {
                    return console.log(error);
                  }
                  console.log("Message sent!");
                  // console.log(info);
                });

           } catch (e) {
              console.log('Error in token gen :', e);
          }
        }
        });
      }
    });
  });
});


app.route('/activate/:activeToken').get(async (req, res) => {
  MongoClient.connect(`mongodb://${MY_IP}:27017/CreatorSpace`, (err, db) => {
    if (err) {
      return console.log('Unable to connect to database');
    }
    try {
          const { sub } = jwt.verify(req.params.activeToken, JWT_SECRET);
          db.collection('users').update({_id: new ObjectId(sub.id)}, {$set: {active: true}});
          console.log("activating account");
          res.redirect('/');
      } catch(err) {
          console.log("Error in verifying token",err);
    }
  });
});


app.route('/login').post(passport.authenticate('local', {session: false}), async (req, res) => {

      var token = jwt.sign({
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          username: req.user.username,
          email: req.user.email,
          createdAt: new Date().getTime()
        }, JWT_SECRET);

        res.cookie('token', token, {
          maxAge: 120000
        });

        res.redirect('/portfolio');
});

app.use(async (req, res, next) => {
     try {
              const token = req.headers.authorization || req.cookies.token ;
                jwt.verify(token, JWT_SECRET, function(err, token_data) {
                if (err) {
                    console.log("errrrrr in token");
                    res.clearCookie('token');
                    return next();
                  } else {
                      return next();
                    }
                  });
     } catch (e) {
       console.log("errrrrrr in catch");
         return req.next();
     }
 });


app.route('/logout').post(async (req, res) => {
   res.clearCookie('token');
   res.redirect(req.headers.referer);
});


app.route('/feedback').post(async (req,res) => {
  console.log(req.body);
   MongoClient.connect(`mongodb://${MY_IP}:27017/CreatorSpace`, (err, db) => {
      if(err)
      {
        return console.log('Unable to connect to database');
      }
    var feedin = new Feedbacks({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    feedback: req.body.feedback,
  });
  feedin.save((err, result) => {
    if (err) {
      console.log('Error occured while saving feedback');
      res.redirect('/');
    } else {
      console.log('feedback successfully saved');
      res.redirect('/')
          }
  });
 });
});


app.route('/activity').get(async (req,res) => {
  res.render('activity');
});
// passport.authenticate('local', {
//   successRedirect: '/portfolio',
//   failureFlash: false,
//   session: false
// })

app.route('*').get(async(req, res) => {
  res.render('notFound');
});
// ===================================================================================================================================================
//5a635961b172df0b78b3a237
