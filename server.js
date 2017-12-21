const express = require('express');
const hbs = require('hbs');
const path = require('path');
const mongoose = require('mongoose');
const Users = require('./models/users');
const http = require('http');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
// const form = require('express-form');

var server = express();
var root = path.join(__dirname);

mongoose.connect('mongodb://localhost/CreatorSpace');
var db = mongoose.connection;

// Check database connection
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Check for DB Error
db.on('error', (err) => {
  console.log('Error happened in database :',err);
});





server.use(express.static(__dirname));
server.set('view engine', 'hbs');
server.use(bodyParser.urlencoded({ extended: false }));

// server.get('/', (req, res) => {
//   res.sendFile(path.join(root, 'index.html'));
// });

server.get('/test1', (req, res) => {
  res.sendFile(path.join(root, '/public/test.html'));
});

server.post('/test1', (req, res) => {
  console.log(req.body);
  res.redirect('/test1');
});

server.get('/test2', (req, res) => {
  res.render('test.hbs');
});

server.post('/userRegister', (req, res) => {
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
            return;
          } else {
            newuser.password = hash;
            newuser.save((err) => {
              if(err) {
                console.log('Error occured while saving user');
              } else {
                console.log('User successfully saved');
                res.redirect('/');
              }
            });
          }
        });
      });
});

server.listen(3000, () => {
  console.log('server started on port 3000');
});
