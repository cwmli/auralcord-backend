'use strict'

const profileRoutes = require('./data.js');
const authRoutes = require('./auth.js');

module.exports = function(app) {

  profileRoutes(app);
  authRoutes(app);
}
