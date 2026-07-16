const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;
