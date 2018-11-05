'use strict'

const querystring = require('querystring');
const request = require('request');

const auth_key = 'spotify_auth_state';
const auth_token = 'spotify_access_token';
const ref_token = 'spotify_refresh_token';

module.exports = function(app) {
  app.get('/signin', function(req, res) {

    var state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    res.cookie(auth_key, state);

    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        client_id: global.gConfig.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: global.gConfig.SPOTIFY_REDIRECT_URI,
        state: state,
        scope: global.gConfig.SPOTIFY_SCOPES
      }));
  });

  app.get('/signincallback', function(req, res) {

    var code        = req.query.code || null;
    var state       = req.query.state || null;
    var cookieState = req.cookies ? req.cookies[auth_key] : null;

    if (state == null || state !== cookieState) {
      res.redirect('http://localhost:8080/?' +
        querystring.stringify({
          success: false,
          message: 'invalid_spotify_auth_state'
        }));
    } else {
      res.clearCookie(auth_key);

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

          res.cookie(auth_token, access_token, {
            maxAge: access_expires * 1000
          });
          res.cookie(ref_token, refresh_token, {
            maxAge: 2147483647000
          });

          res.redirect('http://localhost:8080/');
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

  app.get('/signinrefresh', function(req, res) {

    var refresh_token = req.cookies ? req.cookies[ref_token] : null;

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
          res.send({
            success: false,
            message: 'invalid_spotify_refresh_token'
          })
        }
      });
    } else {
      res.send({
        success: false,
        message: 'missing_spotify_refresh_token'
      })
    }
  })
}
