const express = require('express');
const router = express.Router();
const {uploadProject, getProjects, getSingleProject, deleteProject} = require('../controllers/project.controller');

const { protect } = require('../middlewares/auth.middleware');

const upload = require('../middlewares/upload.middleware');

router.post('/upload', protect, upload.single('project'), uploadProject);
router.get('/', protect, getProjects);
router.get('/:projectId', protect, getSingleProject);
router.delete('/:projectId', protect, deleteProject);


module.exports = router;