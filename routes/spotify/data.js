'use strict'

/*
  General endpoints to query non-personalized information such as playlist, 
  tracks, and track features
 */

const querystring = require('querystring');
const request = require('request');

const CHUNK_SIZE = 100;

function fetchAllPagedItems(auth, url, obj) {
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
  }).then((res) => {
    if (res.next == null) {
      return res.data;
    } else {
      return fetchAllPagedItems(auth, res.next, res.data);
    }
  })
}

function fetchAllUnpagedItems(url, auth, chunks, obj, callback) {
  return new Promise((resolve, reject) => {

    var chunk = chunks.shift();

    if (chunk == null) {
      resolve({data: obj, next: null})
    }

    request.get({
      url: url + querystring.stringify({ids: chunk.join(',')}),
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        callback(err, response, body, obj);
        resolve({data: obj, next: chunks})
      } else {
        resolve({data: null, next: null})
      }
    });
  }).then((res) => {
    if (res.next == null) {
      return res.data;
    } else {
      return fetchAllUnpagedItems(url, auth, res.next, res.data, callback);
    }
  });
}

module.exports = function(router) {

  router.get('/recommendations', function(req, res) {
    var auth = res.locals.auth;

    request.get({
      url: 'https://api.spotify.com/v1/recommendations' + req.query,
      headers: { 'Authorization': 'Bearer ' + auth },
      json: true
    }, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        console.log(body);
      } else {
        res.send({
          success: false,
          message: 'error_retrieving_recommendations'
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
        fetchAllPagedItems(auth, body.tracks.next, tracks).then((result) => {
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

    var chunkedIds = [];
    // remove duplicates
    var uIds = [...new Set(req.query.ids)];
    var i, l = uIds.length;
    for (i = 0; i < l; i += CHUNK_SIZE) {
      chunkedIds.push(uIds.slice(i, i + CHUNK_SIZE))
    }
    var trackFeatureData = {};

    fetchAllUnpagedItems(
      'https://api.spotify.com/v1/audio-features/?',
      auth,
      chunkedIds,
      trackFeatureData,
      (_err, _response, body, obj) => {
        // flatten out the data
        for (var i = 0; i < body.audio_features.length; ++i) {
          for (var feature in body.audio_features[i]) {
            if (body.audio_features[i].hasOwnProperty(feature) && obj.hasOwnProperty(feature)) {
              obj[feature].push(body.audio_features[i][feature]);
            } else {
              obj[feature] = [body.audio_features[i][feature]];
            }
          }
        }
      }
    ).then((result) => {
      if (result == null) {
        res.send({
          success: false,
          message: 'error_retrieving_track_features_for_ids'
        })
      } else {
        res.send({
          success: true,
          data: result
        })
      }
    });
  });
}
