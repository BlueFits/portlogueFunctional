var express = require('express');
var router = express.Router();

const { ensureAuth } = require(`../config/authenticate`);


/* GET home page. */
router.get('/', ensureAuth, function(req, res, next) {
  res.render(`dashboard`, {User: req.user});
});

module.exports = router;
