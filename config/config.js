require('dotenv').config();

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.PORT = process.env.PORT || 8080;
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/test-simply-planned';
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
