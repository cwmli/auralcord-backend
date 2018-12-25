const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/config');

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: config.AURALCORD_CLIENT,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cookieParser());
app.use(cors());
app.use(function(req, res, next) {
  console.log('%s %s', req.method, req.url);
  next();
});
app.options('*', cors());
// Main Routes
const spotifyEndpoints = require('./api/routes/spotify');

app.use('/spotify', spotifyEndpoints);

app.listen(port, () => console.log(`Listening on port ${port}`));
