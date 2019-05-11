var express = require('express');
var router = express.Router();

const { ensureAuthHome } = require(`../config/authenticate`);
const routeController = require(`../controllers/routeController`);

/* GET home page. */
router.get('/', ensureAuthHome, routeController.renderHome);

module.exports = router;