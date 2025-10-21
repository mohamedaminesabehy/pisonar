const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendVerificationOTP);
router.post('/verify-otp', authController.verifyOTP);

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp-password-reset', authController.verifyOTPForPasswordReset);
router.post('/reset-password', authController.resetPassword);

router.post('/logout', authController.logout);

module.exports = router;