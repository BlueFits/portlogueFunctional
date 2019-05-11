var express = require('express');
var router = express.Router();

const routeController = require(`../controllers/routeController`);
const userController = require(`../controllers/userController`);
const passportController = require(`../controllers/passportController`);

//Protect Routes
const { ensureAuth } = require(`../config/authenticate`);

/* Login Routes */

router.post(`/login`, passportController.loginUser);

router.get('/login', routeController.renderLogin);

/* Register Routes */
router.post(`/register`, userController.create_User);

router.get(`/register`, routeController.renderRegister);

/* Logout Route */

router.get(`/logout`, passportController.logoutUser);

/* Initial Setup */

/* GET request to initial setup COUNTRY & POSTAL */
router.get(`/first_time_setup`, ensureAuth, routeController.GET_first_Setup_CountryandPostal);

/* POST request to initial setup COUNTRY & POSTAL*/
router.post(`/first_time_setup`, ensureAuth, userController.POST_first_Setup_CountryandPostal);

module.exports = router;