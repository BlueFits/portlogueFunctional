const mongoose = require(`mongoose`);
const Grid = require('gridfs-stream');

//
const conn = mongoose.createConnection(require(`../config/config`).devLogin, {useNewUrlParser: true});
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});
//



//GET user public avatar
exports.GET_publicAvtr = function(req, res, next) {

  gfs.files.findOne({ filename: `${req.params.email}-avatar` }, function(err, results) {
    if (err) throw `uploadController > publicAvtr`;

    if (!results) {
      res.send(`CANNOT FIND AVATAR`);//toFix
      return;
    }

    const readstream = gfs.createReadStream(results.filename);
    readstream.pipe(res);

  });

};



//GET function for rendering first setup avatar
exports.GET_first_Setup_Avatar = function(req, res, next) {
  
  gfs.files.findOne({ filename: `${req.user.email}-avatar` }, (err, result) => {
    if (err) {return next(err);}

    if (!result) {
      res.render(`firstSetup/setupAvatar`, { errors:[], User: req.user, avatar: `/assets/avatars/placeholder.png`});
      return;
    }
    else {
      res.redirect(`/users/first_time_setup_link`);
    }
  });
};