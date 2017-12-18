const express = require('express');
const hbs = require('hbs');
const path = require('path');

var server = express();
var root = path.join(__dirname);

server.use(express.static(__dirname));
server.set('view engine', 'hbs');

server.get('/test1',(req, res) => {
    res.sendFile(path.join(root,'/public/test.html'));
});

server.get('/test2', (req, res) => {
    res.render('test.hbs');
});

server.listen(3000, () => {
    console.log('server started on port 3000');
});