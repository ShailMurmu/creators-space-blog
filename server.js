const express = require('express');
const ehbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const { MongoClient, ObjectId } = require('mongodb');
const Users = require('./models/users');
const http = require('http');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {
  JWT_SECRET,MAILER_USER,MAILER_PASS
} = require('./config');
const passport = require('passport');
require('./passport');
const mailer = require('./misc/mailer');
passport.authenticate();
// const flash = require('connect-flash');
// const session = require('express-session');
//const expressValidator = require('express-validator');


mongoose.Promise = global.Promise;
var app = express();
var server = http.createServer(app).listen(3000, () => {
  console.log('Server started and io listening on port 3000');
});

// ================================================================================================
// DATABASE SETTINGS

mongoose.connect('mongodb://localhost:27017/CreatorSpace', {
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
    MongoClient.connect('mongodb://localhost:27017/CreatorSpace', (err, db) => {
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
          /////////////////////////////////// code for email validation ///////////////////////////////////////////////
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
    MongoClient.connect('mongodb://localhost:27017/CreatorSpace', (err, db) => {
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
        }
      }, (err) => {
        console.log('Error while query for username');
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
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
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log('UnAuthorized');
    res.redirect('/');
  }
}

// ==================================================================================================================================================
// ROUTES

app.get('/companyinformation', (req, res) => {
  res.render('companyinformation');
});

app.get('/test0', (req, res) => {
  res.render('test0');
});

app.get('/test1', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

app.route('/portfolio').get(async(req, res) => {
  res.render('portfolio');
});

app.get('/companyinformation', (req, res) => {
  res.render('companyinformation');
});

app.route('/forgotPass').get(async(req, res) => {
  res.render('forgotPass');
}).post(async(req, res) => {
  console.log(req.body);
  res.render('forgotPass');
});

app.route('/').get(async(req, res) => {
  res.render('index');
}).post(async(req, res) => {
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
             result.token.auth = jwt.sign({
               iss: 'Creators Space',
               sub: {
                 id: result._id,
                 usr: result.username,
                 pwd: hash
               },
               iat: new Date().getTime()
             }, JWT_SECRET);
             result.token.activeToken = jwt.sign({
               iss: 'Creators Space',
               sub: {
                 id: result._id,
                 usr: result.username,
                 pwd: hash
               },
               iat: new Date().getTime(),
               exp: new Date().setDate(new Date().getDate() + 2)
             }, JWT_SECRET);
             result.save();
           } catch (e) {
              console.log('Error in token gen :', e);
           }


            // MAILING SEQUENCE
            // let transporter = nodemailer.createTransport({
            //      service: 'gmail',
            //      secure: false,
            //      port: 25,
            //      auth: {
            //        user: MAILER_USER,
            //        pass: MAILER_PASS
            //      },
            //      tls: {
            //        rejectUnauthorized: false
            //      }
            //    });
            //    let HelperOptions = {
            //      from: '"CreatorSpace" <no-reply@gmail.com',
            //      to: newuser.email,
            //      subject: 'Please verify your email',
            //      html: `Please verify your Email by clicking on the following link<br><br><a href="#">${newuser.token.activeToken}</a>
            //      <br> Thanks!!`
            //    };
            //    transporter.sendMail(HelperOptions, (error, info) => {
            //      if (error) {
            //        return console.log(error);
            //      }
            //      console.log("The message was sent!");
            //      // console.log(info);
            //    });

          }
        });
      }
    });
  });
});


app.route('/login').post(passport.authenticate('local', {
  successRedirect: '/portfolio',
  failureFlash: false,
  session: false
}));

app.route('*').get(async(req, res) => {
  res.render('notFound');
});
// ===================================================================================================================================================


// =========================================================================================================================
// Express Session Middleware
// app.use(session({
//   secret: 'Secret keyword here',
//   resave: true,
//   saveUninitialized: true
// }));
//
//
// // Express Message Middleware
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//   res.locals.message = require('express-message')(req, res);
//   next();
// });
// =========================================================================================================================
