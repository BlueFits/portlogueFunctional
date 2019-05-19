var express = require('express');
var router = express.Router();

const routeController = require(`../controllers/routeController`);
const userController = require(`../controllers/userController`);
const passportController = require(`../controllers/passportController`);
const uploadController = require(`../controllers/uploadController`);

//Multer upload property
const { upload } = require(`../config/multerConfig`);

//Protect Routes
const { ensureAuth } = require(`../config/authenticate`);



//Report route
router.get(`/report/:username`, ensureAuth, (req, res, next)=> {
    res.send(`NOT IMPLEMENTED`);
});

//User profile route
router.get(`/profile/:username`, ensureAuth, routeController.GET_profile);

//Redirect Email 
router.get(`/profile/:email`, ensureAuth, routeController.redirectEmail);

//Send Message
router.post(`/send_message/:username`, ensureAuth, userController.POST_send_message);

router.get(`/send_message/:username`, ensureAuth, routeController.GET_send_message);


/* Login Routes */

router.post(`/login`, passportController.loginUser);

router.get('/login', routeController.renderLogin);

/* Register Routes */
router.post(`/register`, userController.create_User);

router.get(`/register`, routeController.renderRegister);

/* Logout Route */

router.get(`/logout`, passportController.logoutUser);

/* Initial Setup */

/* POST request to initial setup COUNTRY & POSTAL*/
router.post(`/first_time_setup`, ensureAuth, userController.POST_first_Setup_CountryandPostal);

/* GET request to initial setup COUNTRY & POSTAL */
router.get(`/first_time_setup`, ensureAuth, routeController.GET_first_Setup_CountryandPostal);

/* POST request to intitial setup PROFILE SETUP */
router.post(`/first_time_setup_profile`, ensureAuth, userController.POST_first_Setup_Profile);

/* GET request to initial setup PROFILE SETUP*/
router.get(`/first_time_setup_profile`, ensureAuth, routeController.GET_first_Setup_Profile);

/* POST request to initial setup AVATAR */
router.post(`/first_time_setup_avatar`, ensureAuth, upload.single(`avatar`), userController.POST_first_Setup_Avatar);

/* GET request to initial setup AVATAR */
router.get(`/first_time_setup_avatar`, ensureAuth, uploadController.GET_first_Setup_Avatar);

/* POST request to initial setup website link*/
router.post(`/first_time_setup_link`, ensureAuth, userController.POST_first_Setup_Link);

/* GET request to initial setup Portfolio Link */
router.get(`/first_time_setup_link`, ensureAuth, routeController.GET_first_Setup_Link);

module.exports = router;