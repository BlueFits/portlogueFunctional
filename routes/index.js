var express = require('express');
var router = express.Router();

const { ensureAuthHome, ensureAuth } = require(`../config/authenticate`);
const routeController = require(`../controllers/routeController`);


/* GET home page. */
router.get('/', ensureAuthHome, routeController.renderHome);

/*How to display User Thumbnail

router.get(`/stream`, ensureAuth, (req, res, next) => {
    //Remember To require User model
    User.findOne({ "email" : req.user.email}).exec(function(err, results) {
        if (err) {return next(err);}

        res.contentType(results.portfolioImg.contentType);
        res.send(results.portfolioImg.data);
    });;
});

*/

module.exports = router;