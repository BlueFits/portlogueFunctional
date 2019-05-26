var express = require('express');
var router = express.Router();

const { ensureAuthHome, ensureAuth } = require(`../config/authenticate`);
const routeController = require(`../controllers/routeController`);
const uploadController = require(`../controllers/uploadController`);

//Will be implemenged
router.get(`/willBeImplemented`, (req, res, next)=> {
    res.send(`Hazah`);
});

//GET user website thumbnail
router.get(`/userWebThumb/:email`, routeController.GET_webthumb);

//GET user avatar 
router.get(`/publicAvatar/:email`, uploadController.GET_publicAvtr);

router.get(`/publicAvatar/redirect/:id`, routeController.idRedirect);


/* GET home page. */
router.get('/', ensureAuthHome, routeController.renderHome);

//GET home page discover new
router.get(`/discover/new`, ensureAuth, routeController.GET_discover_new);

//GET home page disocver highest rated
router.get(`/discover/highest_rated`, ensureAuth, routeController.GET_discover_highestRated);

//GET home page disocver most viewed
router.get(`/discover/most_viewed`, ensureAuth, routeController.GET_discover_mostViewed);

//GET home page disocver suggestions
router.get(`/discover/suggestions`, ensureAuth, routeController.GET_discover_suggestions);

//GET home page disocver history
router.get(`/discover/friends`, ensureAuth, routeController.GET_discover_friends);



//GET home search
router.get(`/search`, ensureAuth, routeController.GET_search_home);

module.exports = router;