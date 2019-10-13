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

//Render website hover with req.user and Comments POST request
router.get("/website_hover/:id", ensureAuth, routeController.GET_websiteHover);

router.post("/website_hover/:id", ensureAuth, userController.POST_comment);

//POST request to change url
router.post("/change_web_url", ensureAuth, userController.POST_changeWebUrl);

//POST reqest to change password
router.post("/change_password", ensureAuth, userController.POST_changePassword);

//POST request to change acc email
router.post("/change_acc_email", ensureAuth, userController.POST_changeAccEmail);

//POST request to change about you
router.post(`/change_aboutYou`, ensureAuth, userController.POST_aboutYou);

//POST request to change personal info
router.post(`/change_personalInfo`, ensureAuth, userController.POST_personalInfo);

//Account Settings
router.get(`/settings`, ensureAuth, routeController.GET_settings);

//Report route
router.get(`/report/:username`, ensureAuth, (req, res, next)=> {
    res.send(`NOT IMPLEMENTED`);
});

//User profile route
router.get(`/profile/:username`, ensureAuth, routeController.GET_profile);

router.get(`/profile/redirect/:id`, ensureAuth, routeController.GET_id_redirect);

//Liking Profile
router.post(`/like_website`, ensureAuth, userController.POST_likeSite);

//Redirect Email 
router.get(`/profile/:email`, ensureAuth, routeController.redirectEmail);

//Send Message
router.post(`/send_message/:username`, ensureAuth, userController.POST_send_message);

router.get(`/send_message/:username`, ensureAuth, routeController.GET_send_message);

//Add friend
router.post(`/confirm_friend`, ensureAuth, userController.POST_confirmFriend);

router.post(`/add_friend`, ensureAuth, userController.POST_addFriend);


//Friend Confirm Panel

router.get(`/notifications/:id`, ensureAuth, (req, res, next)=> {
    res.send(`NOT IMPLEMENTED`);
});


/* Login Routes */

router.post(`/login`, passportController.loginUser);

router.get('/login', routeController.renderLogin);

/* Register Routes */
router.post(`/register`, userController.create_User);

router.get(`/register`, routeController.renderRegister);

/* Verification Route */

/*router.post(`/resend`, userController.resendTokenPOST); */


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

/* POST request to update avatar */
router.post(`/change_avatar`, ensureAuth, uploadController.POST_changeAvatar, upload.single(`avatar`), userController.POST_changeAvatar);

/* POST request to initial setup AVATAR */
router.post(`/first_time_setup_avatar`, ensureAuth, upload.single(`avatar`), userController.POST_first_Setup_Avatar);

/* GET request to initial setup AVATAR */
router.get(`/first_time_setup_avatar`, ensureAuth, uploadController.GET_first_Setup_Avatar);

/* POST request to initial setup website link*/
router.post(`/first_time_setup_link`, ensureAuth, userController.POST_first_Setup_Link);

/* GET request to initial setup Portfolio Link */
router.get(`/first_time_setup_link`, ensureAuth, routeController.GET_first_Setup_Link);

module.exports = router;