const express = require('express');
const ehbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const Users = require('./models/users');
const http = require('http');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
const socketIO = require('socket.io');
//const flash = require('connect-flash');
//const session = require('express-session');
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
      if(err) {
        return console.log('Unable to connect to database');
      }
        db.collection('users').findOne({email: obj.email}).then((user) => {
        if(user){
          socket.emit('eValidateMessage', {message: true});
          /////////////////////////////////// code for email validation ///////////////////////////////////////////////

        } else {
          socket.emit('eValidateMessage', {message: false});
          console.log('Email not found...');
        }
      }, (err) => {
        console.log('Error while query for email');
      });
    });
  });

  socket.on('uCheck', (obj) => {
    MongoClient.connect('mongodb://localhost:27017/CreatorSpace', (err, db) => {
      if(err) {
        return console.log('Unable to connect to database');
      }
      db.collection('users').findOne({username: obj.username}).then((user) => {
        if(user){
          socket.emit('uValidateMessage', {message: true});
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

app.use(express.static(__dirname,'/public'));
// app.set('view engine', 'hbs');


// hbs.registerPartials(__dirname + '/views/partials');
// ehbs.registerHelper('getCurrentYear', function() {
//   return new Date().getFullYear();
// });

app.set('views', path.join(__dirname + '/views'));
app.engine('handlebars', ehbs({defaultLayout: 'main', partialsDir: path.join(__dirname, "views/partials"),
helpers: {
  getCurrentYear: function() {
    return new Date().getFullYear();
  }
}
}));
// app.engine('handlebars', ehbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }));

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

app.get('/portfolio',(req, res) => {
  res.render('portfolio');
});

app.get('/companyinformation',(req, res) =>
{
  res.render('companyinformation');
});

app.route('/forgotPass').get(async (req, res) => {
  res.render('forgotPass');
}).post(async (req, res) => {
  console.log(req.body);
  res.render('forgotPass');
});

app.route('/').get(async (req, res) => {
    res.render('index');
}).post(async (req, res) => {
    var newuser = new Users({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });
      bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(newuser.password, salt, (err, hash) => {
          if(err){
            console.log('Error in hash Generation');
          } else {
            newuser.password = hash;
            newuser.save((err) => {
              if(err) {
                console.log('Error occured while saving user');
                res.render('index');
              } else {
                console.log('User successfully saved');
                res.render('index');
              }
            });
          }
        });
      });
});

app.route('*').get(async (req, res) => {
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


// Express Message Middleware
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//   res.locals.message = require('express-message')(req, res);
//   next();
// })
// =========================================================================================================================
