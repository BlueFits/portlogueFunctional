var express = require('express');
var router = express.Router();

const routeController = require(`../controllers/routeController`);
const userController = require(`../controllers/userController`);
const passportController = require(`../controllers/passportController`);

/* Login Routes */

router.post(`/login`, passportController.loginUser);

router.get('/login', routeController.renderLogin);

/* Register Routes */
router.post(`/register`, userController.create_User);

router.get(`/register`, routeController.renderRegister);

/* Logout Route */

router.get(`/logout`, passportController.logoutUser);


module.exports = router;
