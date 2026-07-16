const express = require('express');
const { getProjectFiles, GetSingleFile } = require('../controllers/file.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();


router.get('/:projectId', protect, getProjectFiles);
router.get('/single/:fileId', protect, GetSingleFile);

module.exports = router;