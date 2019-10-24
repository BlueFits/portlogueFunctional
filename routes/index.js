var express = require('express');
var router = express.Router();

const { ensureAuthHome, ensureAuth } = require(`../config/authenticate`);
const routeController = require(`../controllers/routeController`);
const uploadController = require(`../controllers/uploadController`);

const guestGenerate = require("../controllers/functionsContoller").guestGenerate;

/* Under Construction */

//Render About Page
router.get("/about", routeController.GET_visitorAbout, ensureAuth, routeController.GET_about);

/* Quick Fixes */

//Add to featured user THIS IS A GET BE CAREFUL
router.get("/feature_add/:webId", routeController.featureAdd);

//Will be implemented
router.get(`/willBeImplemented`, (req, res, next)=> {
    res.send(`Hazah`);
});

/* Site asset Renders */

//GET user website thumbnail
router.get(`/webThumb/:id`, routeController.GET_webthumb);

//GET user avatar 
router.get(`/publicAvatar/:email`, uploadController.GET_publicAvtr);

router.get(`/publicAvatar/redirect/:id`, routeController.idRedirect);

/* Site functionalities */

//Send feedback
router.post("/submit_feedback", routeController.POST_sendFeedback);

//User token confirmation
router.get(`/confirm/:userToken`, routeController.GET_confirmation);

/* GET home page. */

//Home page
router.get('/', guestGenerate, routeController.checkHome, ensureAuthHome, routeController.renderHome);

//Get new
router.get(`/discover/new`, routeController.GET_visitorNew, ensureAuth, routeController.GET_discover_new);

//GET discover highest rated
router.get(`/discover/highest_rated`, routeController.GET_visitorHighestRated, ensureAuth, routeController.GET_discover_highestRated);

//GET  discover most viewed
router.get(`/discover/most_viewed`, routeController.GET_visitorMostViewed, ensureAuth, routeController.GET_discover_mostViewed);

//GET favorites
router.get("/discover/favorites", ensureAuth, routeController.GET_favorites);

/* Pagination */
router.post(`/newQryNext`, ensureAuth, routeController.POST_newQryNext);

router.post(`/newQryPrev`, ensureAuth, routeController.POST_newQryPrev);

/* Search Page */
router.get(`/search`, routeController.GET_visitorSearch, ensureAuth, routeController.GET_search_home);


/* Export Router */
module.exports = router;