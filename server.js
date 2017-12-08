require('dotenv').config();
// setup app
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes/index');

// make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

const {CLIENT_ORIGIN, PORT, DATABASE_URL} = require('./config/config');

// log the http layer middleware
app.use(morgan('common'));

// use body parser middleware
app.use(bodyParser.json());

// use cors middleware
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// setup routes
app.use(router);


// setup server
let server;

// this function connects to the database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useMongoClient: true}, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server and returns a promise
// used for integration tests
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
         if (err) {
            return reject(err);
         }
         resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block runs
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
