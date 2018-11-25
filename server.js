const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config/config');

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());

// Routes
const spotifyEndpoint = require('./api/routes/spotify');

spotifyEndpoint(app);

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
