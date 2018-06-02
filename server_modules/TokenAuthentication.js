var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var DButilsAzure = require('../DButils');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const superSecret = "eeeee"; // secret variable

router.use('/',function(req,res,next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
        // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, superSecret, function (err, decoded) {
        if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
            } 
        else {
            // if everything is good, save to request for use in other routes
            // get the decoded payload and header
            var decoded = jwt.decode(token, {complete: true});
            req.decoded= decoded; // decoded.payload , decoded.header
            next();
            }
        });
    }
    else{
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})
module.exports = router;