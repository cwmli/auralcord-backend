'use strict'

const express = require('express');

var router = express.Router();
const profileRoutes = require('./data.js');
const authRoutes = require('./auth.js');
const refreshChecker = require('./refresh.js');

authRoutes(router)

// perform an refresh check for routes that need it
router.use(refreshChecker);

profileRoutes(router);

module.exports = router;
