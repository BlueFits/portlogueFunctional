var express = require('express');
var router = express.Router();

const { ensureAuthHome, ensureAuth } = require(`../config/authenticate`);
const routeController = require(`../controllers/routeController`);
const uploadController = require(`../controllers/uploadController`);

//GET user website thumbnail
router.get(`/userWebThumb/:email`, routeController.GET_webthumb);

//GET user avatar 
router.get(`/publicAvatar/:email`, uploadController.GET_publicAvtr);

/* GET home page. */
router.get('/', ensureAuthHome, routeController.renderHome);

//GET home page discover new
router.get(`/discover/new`, ensureAuth, routeController.GET_discover_new);

//GET home page disocver highest rated
router.get(`/discover/highest_rated`, ensureAuth, routeController.GET_discover_highestRated);

module.exports = router;