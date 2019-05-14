const mongoose = require(`mongoose`);
const Grid = require('gridfs-stream');


//Needed for image queries
const conn = mongoose.createConnection(require(`../config/config`).devLogin, {useNewUrlParser: true});
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});
//

/* 
.once is asyncronous therefore gfs will only work if above exported 
properties 
*/

exports.userAvatar = function(req, res, next) {
  gfs.files.findOne({ filename: `${req.user.email}:avatar` }, function(err, results) {
    if (!results) {
      res.send(`Avatar has not been set`);
    }
    else {
      const readstream = gfs.createReadStream(results.filename);
      readstream.pipe(res);
    }
});
}