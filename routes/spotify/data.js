'use strict'

/*
  General endpoints to query non-personalized information such as playlist, 
  tracks, and track features
 */

const querystring = require('querystring');
const request = require('request');

const CHUNK_SIZE = 100;

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

    var chunkedIds = []
    var i, l = req.query.ids.length;
    for (i = 0; i < l; i += CHUNK_SIZE) {
      chunkedIds.push(req.query.ids.slice(i, i + CHUNK_SIZE))
    }
    var trackFeatureData = {};

    // TODO: Probably want to clean this up later, but for now it will do
    function fetchPagedTrackFeatures(auth, chunks, obj) {
      return new Promise((resolve, reject) => {

        var chunkIds = chunks.shift();

        if (chunkIds == null) {
          resolve({data: obj, next: null})
        }

        var query = Object.assign({}, {
          ids: chunkIds.join(',')
        });

        request.get({
          url: 'https://api.spotify.com/v1/audio-features/?' + querystring.stringify(query),
          headers: { 'Authorization': 'Bearer ' + auth },
          json: true
        }, (err, response, body) => {
          if (!err && response.statusCode == 200) {
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

            resolve({data: obj, next: chunks})
          } else {
            resolve({data: null, next: null})
          }
        });
      }); 
    }

    function recursiveFetchPagedTrackFeatures(auth, chunks, obj) {
      return fetchPagedTrackFeatures(auth, chunks, obj).then((res) => {
        if (res.next == null) {
          return res.data;
        } else {
          return recursiveFetchPagedTrackFeatures(auth, res.next, res.data);
        }
      });
    }

    recursiveFetchPagedTrackFeatures(auth, chunkedIds, trackFeatureData).then((result) => {

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
