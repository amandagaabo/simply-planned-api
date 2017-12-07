const express = require('express');
const router = express.Router();

const sessions = require('./sessions')
const meals = require('./meals')
const groceries = require('./groceries')

// session routes
router.get('/', sessions.landingPage);
router.post('/sign-up', sessions.signUpSubmit);
router.get('/login', sessions.loginPage);
router.post('/login', sessions.loginSubmit);
router.get('/logout', sessions.logout);

// meal routes
router.get('/meals', meals.mealsPage);
router.post('/meals', meals.update);

// grocery routes
router.get('/groceries', groceries.list);
router.post('/groceries/add', groceries.create);
router.post('/groceries/:item/delete', groceries.delete);

// catch-all endpoint if client makes request to non-existent endpoint
router.get('*', function (req, res) {
  res.status(404).json({message: 'Not Found'})
});

module.exports = router;
