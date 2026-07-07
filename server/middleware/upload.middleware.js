const multer = require('multer');
const path = require('path');
const apperror = require('../utils/appError');

// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb){
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

// Set up file filter

const fileFilter = (req, file, cb) =>{
    const extension =  path.extname(file.originalname).toLowerCase();

    if(extension === '.zip' || extension === '.tar' || extension === '.gz'){
    return cb(new apperror("Only .zip, .tar, and .gz files are allowed", 400), false);
    };
    cb(null, true);

};

// Set up multer middleware
const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 10 * 1024 * 1024} // 10MB limit
});

module.exports = upload;