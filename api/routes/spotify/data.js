'use strict'

var constants = require('./helper.js');

const querystring = require('querystring');
const request = require('request');

function authCheck(req, res) {

  return new Promise(function(resolve, reject) {
    var auth = req.cookies ? req.cookies[constants.auth_token] : null;

    if (auth == null) {
      request.get({
        url: 'http://localhost:5000/signinrefresh',
        headers: req.headers,
        json: true
      }, function(err, response, body) {
        if (!err && response.statusCode == 200 && body.success) {
          var access_token   = body.access_token;
          var access_expires = +body.access_expires_in;

          res.cookie(constants.auth_token, access_token, {
            maxAge: access_expires * 1000
          });

          resolve(access_token)
        }
      });
    } else {
      resolve(auth)
    }
  });
}

module.exports = function(app) {
  
  app.get('/spotify/profile', function(req, res) {

    authCheck(req, res).then(function(auth) {
      request.get({
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + auth },
        json: true
      }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
          res.send({
            success: true
            // some other payload here
          })
        } else {
          res.send({
            success: false,
            message: 'error_retrieving_user'
          });
        }
      });
    });
  });
}
