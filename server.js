require('dotenv').config();
// setup app
const express = require('express');
const app = express();

// setup mongoose
const mongoose = require('mongoose');
// make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

const {CLIENT_ORIGIN, PORT} = require('./config/config');

// log the http layer middleware
const morgan = require('morgan');
app.use(morgan('common'));

// use body parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// use cors middleware
const cors = require('cors');
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/*', (req, res) => {
 res.json({ok: true});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};
