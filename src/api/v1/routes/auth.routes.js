// src/api/v1/routes/auth.routes.js — Authentication routes
'use strict';

const { Router } = require('express');
const authController = require('../../../controllers/auth.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const validate = require('../../../middlewares/validate.middleware');
const { authLimiter } = require('../../../middlewares/rateLimiter.middleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailQuerySchema,
  resendVerificationSchema,
} = require('../../../validators/auth.validator');

const router = Router();

// Public routes (with auth rate limiter)
router.post('/register',             authLimiter, validate({ body: registerSchema }),          authController.register);
router.post('/login',                authLimiter, validate({ body: loginSchema }),             authController.login);
router.post('/refresh',              authLimiter, validate({ body: refreshTokenSchema }),      authController.refresh);
router.post('/forgot-password',      authLimiter, validate({ body: forgotPasswordSchema }),    authController.forgotPassword);
router.post('/reset-password',       authLimiter, validate({ body: resetPasswordSchema }),     authController.resetPassword);
router.get('/verify-email',          validate({ query: verifyEmailQuerySchema }),              authController.verifyEmail);
router.post('/resend-verification',  authLimiter, validate({ body: resendVerificationSchema }), authController.resendVerification);

// Protected routes
router.get('/me',                authenticate,                                         authController.getMe);
router.post('/logout',           authenticate,                                         authController.logout);
router.post('/logout-all',       authenticate,                                         authController.logoutAll);
router.post('/change-password',  authenticate, validate({ body: changePasswordSchema }), authController.changePassword);

module.exports = router;
