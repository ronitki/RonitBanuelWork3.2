//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var url = require('url');
app.use(cors());
var DButilsAzure = require('./DButils');
var morgan=require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var Users = require('./server_modules/Users'); // get our users model
//var poi = require('./server_modules/POI');
var Guests = require('./server_modules/Guests');
var authentication = require('./server_modules/TokenAuthentication');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/tokenAuthentication', authentication);
app.use('/tokenAuthentication/users', Users);
app.use('/guests', Guests);
var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
    app.emit("Hi");
});
//-------------------------------------------------------------------------------------------------------------------