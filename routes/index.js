const express = require('express');
const passport = require('passport');
const sessions = require('./sessions');
const meals = require('./meals');
const groceries = require('./groceries');

const router = express.Router();
const localAuth = passport.authenticate('local', { session: false });
const jwtAuth = passport.authenticate('jwt', { session: false });

// session routes
router.post('/sign-up', sessions.signUpSubmit);
router.post('/login', localAuth, sessions.loginSubmit);
router.post('/refresh', jwtAuth, sessions.refreshToken);

// meal routes
router.get('/meals', jwtAuth, meals.mealsPage);
router.post('/meals/update', jwtAuth, meals.update);

// grocery routes
router.get('/groceries', jwtAuth, groceries.list);
router.post('/groceries/add', jwtAuth, groceries.create);
router.post('/groceries/update', jwtAuth, groceries.update);
router.post('/groceries/delete', jwtAuth, groceries.delete);
router.post('/groceries/delete/:itemID', jwtAuth, groceries.deleteItem);

// catch-all endpoint if client makes request to non-existent endpoint
router.get('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = router;
