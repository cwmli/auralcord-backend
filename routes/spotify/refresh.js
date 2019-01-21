const request = require('request');
const constants = require('./constants.js');

module.exports = (req, res, next) => {

  if (req.session.user_id && req.cookies.user_sid) {
    new Promise(function(resolve, reject) {
      var auth = req.cookies ? req.cookies[constants.auth_token] : null;

      if (auth == null) {
        request.get({
          url: 'http://localhost:5000/spotify/signin/refresh',
          headers: req.headers,
          json: true
        }, function(err, response, body) {
          if (!err && response.statusCode == 200 && body.success) {
            var access_expires = +body.access_expires_in;
            auth = body.access_token;

            res.cookie(constants.auth_token, auth, {
              maxAge: access_expires
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
  } else {
    res.status(403).send({
      success: false,
      message: 'unauthenticated'
    })
  }
}
