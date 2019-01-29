require('dotenv').config();

const Config = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_KEY,
  SPOTIFY_SECRET: process.env.SPOTIFY_SECRET,
  SPOTIFY_REDIRECT_URI: 'http://localhost:5000/spotify/signin/callback',
  SPOTIFY_SCOPES: 'user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative',
  AURALCORD_CLIENT: 'http://localhost:8080'
}
global.gConfig = Config;

module.exports.sessionConf = {
  key: 'user_sid',
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false
}
