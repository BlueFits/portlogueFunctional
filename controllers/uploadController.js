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

  gfs.files.findOne({ filename: `${req.params.email}:avatar` }, function(err, results) {
    if (err) throw `uploadController publicAvtr`;

    if (!results) {
      res.send(`CANNOT FIND AVATAR`);
      return;
    }

    const readstream = gfs.createReadStream(results.filename);
    readstream.pipe(res);

  });

};

/*

gfs.files.find().toArray(function(err, files) {
    if (!files || files.length === 0) {
        return res.status(404).json({err: `NO files exist`});
    }
    res.render(`firstSetup/setupAvatar`, { errors:[], User: req.user, avatar: `/assets/avatars/placeholder`});

*/