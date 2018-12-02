const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config/config');

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());

app.use(function(req, res, next) {
  console.log('%s %s', req.method, req.url);
  next();
});
// Main Routes
const spotifyEndpoints = require('./api/routes/spotify');

app.use('/spotify', spotifyEndpoints);

app.listen(port, () => console.log(`Listening on port ${port}`));
