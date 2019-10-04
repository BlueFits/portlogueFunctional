const mongoose = require(`mongoose`);
const Grid = require('gridfs-stream');
const fs = require("fs");
const path = require("path");

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

  gfs.collection("uploads").findOne({ filename: `${req.params.email}-avatar` }, function(err, results) {
    if (err) throw `uploadController > publicAvtr`;

    if (!results) {
      const noAvatarStream = fs.readFileSync(path.join(__dirname, `../public/assets/avatars/placeholder.png`));
      res.contentType(`image/png`);
      res.send(noAvatarStream);
      return;
    }

    else {
      const readstream = gfs.createReadStream(results.filename);
      readstream.pipe(res);
    }

  });

};


//GET function for rendering first setup avatar
exports.GET_first_Setup_Avatar = function(req, res, next) {
  
  gfs.files.findOne({ filename: `${req.user.email}-avatar` }, (err, result) => {
    if (err) {return next(err);}

    if (!result) {
      res.render(`firstSetup/setupAvatar`, { errors:[], User: req.user});
      return;
    }
    else {
      res.redirect(`/users/first_time_setup_link`);
    }
  });
};

//Change avatar first chain
exports.POST_changeAvatar = function(req, res, next) {
  //Remove Current user avatar
  gfs.collection('uploads').remove({ filename: `${req.user.email}-avatar` }, (err, result)=> {
    if (err) {console.log(`Change avatar error`);}

    if (!result) {
      res.sendStatus(404 + " Error at POST_changeAvatar ");
    }

    else {
      next();
    }
  });
}

//Email change chain
exports.email_change_handler = function(oldEmail, newEmail) {

  let gfsUpdate = { $set: { filename: `${newEmail}-avatar` } };

  gfs.collection("uploads").update({filename: `${oldEmail}-avatar`}, gfsUpdate, (err, updateRes)=> {
    if (err) {return next(err);}
    console.log(`Changed gfs name`);
  });

}