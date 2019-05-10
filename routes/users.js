var express = require('express');
var router = express.Router();

const routeController = require(`../controllers/routeController`);
const userController = require(`../controllers/userController`);

/* Login Routes */

router.get('/login', routeController.renderLogin);

/* Register Routes */
router.post(`/register`, userController.create_User);

router.get(`/register`, routeController.renderRegister);


module.exports = router;
