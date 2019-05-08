'use strict'

const querystring = require('querystring');
const request = require('request');

function fetchPagingObj(auth, url, obj) {
  return new Promise((resolve, reject) => {
    request.get({
      url: url,
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        obj = obj.concat(body.items);
        resolve({data: obj, next: body.next});
      } else {
        resolve({data: obj, next: null});
      }
    });
  });
}

function recursiveFetchPagedItems(auth, url, obj) {
  return fetchPagingObj(auth, url, obj).then((res) => {
    if (res.next == null) {
      return res.data;
    } else {
      return recursiveFetchPagedItems(auth, res.next, res.data);
    }
  })
}

module.exports = function(router) {
  
  router.get('/profile', function(req, res) {
    var auth = res.locals.auth;
    
    request.get({
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        res.send({
          success: true,
          data: body
        })
      } else {
        res.send({
          success: false,
          message: 'error_retrieving_user_profile'
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
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        res.send({
          success: true,
          data: body
        })
      } else {
        res.send({
          success: false,
          message: 'error_retrieving_user_playlists'
        });
      }
    });
  });

  router.get('/playlist/:id', function(req, res) {
    var auth = res.locals.auth;

    request.get({
      url: 'https://api.spotify.com/v1/playlists/' + req.params.id,
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        var tracks = body.tracks.items;
        recursiveFetchPagedItems(auth, body.tracks.next, tracks).then((result) => {
          body.tracks.items = result;
          res.send({
            success: true,
            data: body
          });
        });

      } else {
        res.send({
          success: false,
          message: 'error_retrieving_requested_playlist'
        });
      }
    });
  });

  router.get('/track-features', function(req, res) {
    var auth = res.locals.auth;

    var query = Object.assign({}, req.query, {
      ids: req.query.ids.join(',')
    });
    
    request.get({
      url: 'https://api.spotify.com/v1/audio-features/?' + querystring.stringify(query),
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        // flatten out the data
        let flattened_data = {};
        for (var i = 0; i < body.audio_features.length; ++i) {
          for (var feature in body.audio_features[i]) {
            if (body.audio_features[i].hasOwnProperty(feature) && flattened_data.hasOwnProperty(feature)) {
              flattened_data[feature].push(body.audio_features[i][feature]);
            } else {
              flattened_data[feature] = [body.audio_features[i][feature]];
            }
          }
        }

        res.send({
          success: true,
          data: flattened_data
        })
      } else {
        res.send({
          success: false,
          message: 'error_retrieving_track_features_for_ids'
        });
      }
    });    
  });

  router.get('/top/artists', function(req, res) {
    var auth = res.locals.auth;

    request.get({
      url: 'https://api.spotify.com/v1/me/top/artists' + querystring.stringify(req.query),
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        body.items.map((artist) => {
          artist.image = artist.images[0];
          delete artist['images'];
          return artist;
        });

        res.send({
          success: true,
          data: { artists: body.items, next: body.next }
        })
      } else {
        res.send({
          success: false,
          message: 'error_retrieving_user_top_artists'
        });
      }
    });
  });

  router.get('/top/tracks', function(req, res) {
    var auth = res.locals.auth;

    request.get({
      url: 'https://api.spotify.com/v1/me/top/tracks' + querystring.stringify(req.query),
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        res.send({
          success: true,
          data: { tracks: body.items, next: body.next }
        })
      } else {
        res.send({
          success: false,
          message: 'error_retrieving_user_top_tracks'
        });
      }
    });
  });
}
