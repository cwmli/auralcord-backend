const request = require('request');
const constants = require('./constants.js');

const User = require('../../models').User;

module.exports = (req, res, next) => {

  if (req.session.user_id && req.cookies.user_sid) {
    var auth = req.cookies ? req.cookies[constants.auth_token] : null;

    if (auth == null) {

      getAccessToken(req.session.user_id).then(function(token) {
        var access_expires = +token.access_expires_in;
        auth = token.access_token;
        res.locals.auth = auth;

        // probably want to do something else with this
        res.setHeader('Set-Cookie', 
          constants.auth_token + '=' + auth + 
          '; Max-Age=' + access_expires +
          '; Path=/');

        next();
      }).catch(function(reject) {
        res.status(401).send({
          success: false,
          message: reject.error
        });
      });
    } else {
      res.locals.auth = auth;
      next();
    }
  } else {
    res.status(403).send({
      success: false,
      message: 'unauthenticated'
    });
  }
}

function getAccessToken(spotifyId) {
  return new Promise(function(resolve, reject) {
    User.findOne({
      where: {spotifyId: spotifyId},
      attributes: ['id', 'refreshToken']
    }).then((user) => {
      request.post({
        url: 'https://accounts.spotify.com/api/token',
        form: {
          client_id: global.gConfig.SPOTIFY_CLIENT_ID,
          client_secret: global.gConfig.SPOTIFY_SECRET,
          grant_type: 'refresh_token',
          refresh_token: user.getDataValue('refreshToken')
        },
        json: true
      }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
          var access_token   = body.access_token;
          var access_expires = body.expires_in;

          resolve({
            access_token: access_token,
            access_expires_in: access_expires
          });
        } else {
          user.update({refreshToken: null});

          reject({
            error: 'invalid_spotify_refresh_token'
          });
        }
      });
    });
  });
}
