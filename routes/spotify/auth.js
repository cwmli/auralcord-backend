'use strict'

const querystring = require('querystring');
const request = require('request');

const constants = require('./helper.js');

const User = require('../../../models').User;

module.exports = function(router) {
  
  router.get('/signin', function(req, res) {

    var state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    req.session.auth_state = state;

    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        client_id: global.gConfig.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: global.gConfig.SPOTIFY_REDIRECT_URI,
        state: state,
        scope: global.gConfig.SPOTIFY_SCOPES
      }));
  });

  router.get('/signin/callback', function(req, res) {

    var code        = req.query.code || null;
    var state       = req.query.state || null;
    var ogState = req.session.auth_state ? req.session.auth_state : null;

    if (state == null || state !== ogState) {
      res.redirect('http://localhost:8080/?' +
        querystring.stringify({
          success: false,
          message: 'invalid_spotify_auth_state'
        }));
    } else {
      req.session.auth_state = null;

      request.post({
        url: 'https://accounts.spotify.com/api/token',
        form: {
          client_id: global.gConfig.SPOTIFY_CLIENT_ID,
          client_secret: global.gConfig.SPOTIFY_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: global.gConfig.SPOTIFY_REDIRECT_URI
        },
        json: true
      }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
          var access_token   = body.access_token;
          var refresh_token  = body.refresh_token;
          var access_expires = +body.expires_in;

          res.cookie(constants.auth_token, access_token, {
            maxAge: access_expires
          });

          request.get({
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          }, (err, response, body) => {
            if (!err && response.statusCode == 200) {

              User.findOrCreate({
                where: {spotifyId: body.id}, 
                defaults: {
                  displayName: body.display_name,
                  refreshToken: refresh_token
                }
              });
              
              res.redirect('http://localhost:8080/dashboard');
            } else {
              res.redirect('http://localhost:8080/?' +
              querystring.stringify({
                success: false,
                message: ''
              }));
            }
          });
        } else {
          res.redirect('http://localhost:8080/?' +
            querystring.stringify({
              success: false,
              message: 'invalid_spotify_token'
            }));
        }
      });
    }
  });

  router.get('/signin/refresh', function(req, res) {

    var refresh_token = req.cookies ? req.cookies[constants.ref_token] : null;

    if (refresh_token != null) {

      request.post({
        url: 'https://accounts.spotify.com/api/token',
        form: {
          client_id: global.gConfig.SPOTIFY_CLIENT_ID,
          client_secret: global.gConfig.SPOTIFY_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        },
        json: true
      }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
          var access_token   = body.access_token;
          var access_expires = body.expires_in;

          res.send({
            success: true,
            access_token: access_token,
            access_expires_in: access_expires
          })
        } else {
          res.status(401).send({
            success: false,
            message: 'invalid_spotify_refresh_token'
          })
        }
      });
    } else {
      res.status(400).send({
        success: false,
        message: 'missing_spotify_refresh_token'
      })
    }
  })
}
