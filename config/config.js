require('dotenv').config();

exports.CLIENT_ORIGIN = 'https://simplyplanned.netlify.com';
exports.PORT = process.env.PORT || 3000;
//exports.DATABASE_URL = process.env.DATABASE_URL;
exports.DATABASE_URL = 'mongodb://localhost/test-simply-planned';

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
