require('dotenv').config();

const Config = {
  SPOTIFY_CLIENT_ID: 'aa71a911355b47dcb387ba6f4abcd08d',
  SPOTIFY_SECRET: '316fd25189aa4e038b7efd33c43a9f2f',
  SPOTIFY_REDIRECT_URI: 'http://localhost:5000/spotify/signin/callback',
  SPOTIFY_SCOPES: 'user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative',
  AURALCORD_CLIENT: 'http://localhost:8080'
}
global.gConfig = Config;

module.exports.sessionConf = {
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false
}
