const auralcordConf = require('./config/auralcord');

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const redisClient = redis.createClient();
const port = process.env.PORT || 5000;

/* CORS Setup*/
const corsOptions = {
  origin: global.gConfig.AURALCORD_CLIENT,
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

/* Session Setup */
app.use(
  session(Object.assign(auralcordConf.sessionConf, 
    { store: new RedisStore({client: redisClient}) }
  )));

app.use(cookieParser());
app.use(function(req, res, next) {
  console.log('%s %s', req.method, req.url);
  next();
});
app.options('/*', cors(corsOptions));

// Main Routes
const spotifyEndpoints = require('./routes/spotify');

app.use('/spotify', spotifyEndpoints);

app.listen(port, () => console.log(`Listening on port ${port}`));
