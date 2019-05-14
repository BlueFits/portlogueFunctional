var express = require('express');
var router = express.Router();

const { ensureAuthHome, ensureAuth } = require(`../config/authenticate`);
const routeController = require(`../controllers/routeController`);
const uploadController = require(`../controllers/uploadController`);


/* GET home page. */
router.get('/', ensureAuthHome, routeController.renderHome);


//GET user website thumbnail
router.get(`/userWebThumb/:email`, routeController.GET_webthumb);

//GET user avatar 
router.get(`/publicAvatar/:email`, uploadController.GET_publicAvtr);


module.exports = router;