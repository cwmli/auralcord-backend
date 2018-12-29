const Config = {
  SPOTIFY_CLIENT_ID: 'aa71a911355b47dcb387ba6f4abcd08d',
  SPOTIFY_SECRET: '9aa021bb9fbe4efa9ff99fa098ed122d',
  SPOTIFY_REDIRECT_URI: 'http://localhost:5000/spotify/signincallback',
  SPOTIFY_SCOPES: 'user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative',
  AURALCORD_CLIENT: 'http://localhost:8080'
}

global.gConfig = Config;
