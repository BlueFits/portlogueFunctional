const multer = require(`multer`);
const GridFsStorage = require('multer-gridfs-storage');

// Mongo URI

const storage = new GridFsStorage({
    url:require(`./config`).devLogin,
    file: (req, file) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === `image/png`) {
          return {
            filename:`${req.user.email}:${file.fieldname}`,
            bucketName: 'uploads'
          };
        } else {
          return null;
        }
      }
  });
  
//Export Storage
exports.upload = multer({ storage });