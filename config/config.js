require('dotenv').config();

module.exports = {
  development: {
    username: "auralcordadmin",
    password: "auralcord",
    database: "auralcord_dev",
    host: "127.0.0.1",
    dialect: "postgres"
  },
  test: {
    username: "auralcordadmin",
    password: "auralcord",
    database: "auralcord_test",
    host: "127.0.0.1",
    dialect: "postgres"
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres"
  }
}
