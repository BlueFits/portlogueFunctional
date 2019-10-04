var express = require('express');
var router = express.Router();

const { ensureAuthHome, ensureAuth } = require(`../config/authenticate`);
const routeController = require(`../controllers/routeController`);
const uploadController = require(`../controllers/uploadController`);

//About page
router.get("/about", routeController.GET_aboutPage);

//User token confirmation
router.get(`/confirm/:userToken`, routeController.GET_confirmation);

//Will be implemenged
router.get(`/willBeImplemented`, (req, res, next)=> {
    res.send(`Hazah`);
});

//GET user website thumbnail
router.get(`/userWebThumb/:id`, routeController.GET_webthumb);

//GET user avatar 
router.get(`/publicAvatar/:email`, uploadController.GET_publicAvtr);

router.get(`/publicAvatar/redirect/:id`, routeController.idRedirect);


/* GET home page. */
router.get('/', ensureAuthHome, routeController.renderHome);

//GET home page discover new

router.post(`/newQryNext`, ensureAuth, routeController.POST_newQryNext);

router.post(`/newQryPrev`, ensureAuth, routeController.POST_newQryPrev);

router.get(`/discover/new`, ensureAuth, routeController.GET_discover_new);

//GET home page disocver highest rated
router.get(`/discover/highest_rated`, ensureAuth, routeController.GET_discover_highestRated);

//GET home page disocver most viewed
router.get(`/discover/most_viewed`, ensureAuth, routeController.GET_discover_mostViewed);

//GET home page disocver suggestions
//router.get(`/discover/suggestions`, ensureAuth, routeController.GET_discover_suggestions);

//GET home page disocver history

router.post("/friendsQryNext", ensureAuth, routeController.POST_friendsQryNext);

router.post("/friendsQryPrev", ensureAuth, routeController.POST_friendsQryPrev);

router.get(`/discover/friends`, ensureAuth, routeController.GET_discover_friends);



//GET home search
router.get(`/search`, ensureAuth, routeController.GET_search_home);

module.exports = router;