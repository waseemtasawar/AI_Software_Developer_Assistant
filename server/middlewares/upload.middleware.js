const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/appError");

// Upload directory
const uploadDirectory = path.join(__dirname, "../uploads");

// Create uploads folder automatically if it does not exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure file storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename(req, file, cb) {
    const safeFileName = file.originalname.replace(/\s+/g, "-");

    const uniqueFileName = `${Date.now()}-${safeFileName}`;

    cb(null, uniqueFileName);
  },
});

// Currently, the project extraction service uses AdmZip.
// Therefore, accept ZIP files only.
const allowedExtensions = [".zip"];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(
      new AppError("Only ZIP project files are allowed", 400),
      false
    );
  }

  cb(null, true);
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 250 * 1024 * 1024, // 250 MB
    files: 1,
  },
});

module.exports = upload;