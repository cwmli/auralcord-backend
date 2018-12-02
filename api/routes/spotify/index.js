'use strict'

const express = require('express');
const request = require('request');
var router = express.Router();

const constants = require('./helper.js');
const profileRoutes = require('./data.js');
const authRoutes = require('./auth.js');

authRoutes(router)

// perform an authentication check for routes that need it
router.use(function authCheck(req, res, next) {
  new Promise(function(resolve, reject) {
    var auth = req.cookies ? req.cookies[constants.auth_token] : null;

    if (auth == null) {
      request.get({
        url: 'http://localhost:5000/spotify/signinrefresh',
        headers: req.headers,
        json: true
      }, function(err, response, body) {
        if (!err && response.statusCode == 200 && body.success) {
          var access_expires = +body.access_expires_in;
          auth = body.access_token;

          res.cookie(constants.auth_token, auth, {
            maxAge: access_expires * 1000
          });
          
        }

        resolve(auth)
      });
    } else {
      resolve(auth)
    }
  }).then(function(auth) {
    res.locals.auth = auth;
    next();
  });
})

profileRoutes(router);

module.exports = router;
