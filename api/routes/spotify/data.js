'use strict'

const request = require('request');

module.exports = function(router) {
  
  router.get('/profile', function(req, res) {
    var auth = res.locals.auth;
    
    request.get({
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        res.send({
          success: true,
          data: body
        })
      } else {
        res.send({
          success: false,
          message: 'error_retrieving_user'
        });
      }
    });
  });

  router.get('/playlist', function(req, res) {
    var auth = res.locals.auth;

    request.get({
      url: 'https://api.spotify.com/v1/me/playlists',
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
          message: 'error_retrieving_user_playlists'
        });
      }
    });
  });
}
