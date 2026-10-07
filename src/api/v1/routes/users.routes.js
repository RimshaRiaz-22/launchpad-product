// src/api/v1/routes/users.routes.js — User management routes
'use strict';

const { Router } = require('express');
const usersController = require('../../../controllers/users.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const validate = require('../../../middlewares/validate.middleware');
const {
  updateProfileSchema,
  updateUserRoleSchema,
  updateUserPlanSchema,
  updateUserStatusSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} = require('../../../validators/users.validator');

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Own profile
router.patch('/me',               validate({ body: updateProfileSchema }),              usersController.updateProfile);
router.delete('/me',                                                                    usersController.deleteAccount);

// Admin-only routes (Admin performs Super-Admin duties as product owner)
router.get('/stats',              authorize('admin'),                                   usersController.getUsersStats);

router.get('/',                   authorize('admin'),
                                  validate({ query: listUsersQuerySchema }),            usersController.listUsers);

router.get('/:userId',            validate({ params: userIdParamSchema }),              usersController.getUserById);

router.patch('/:userId/role',     authorize('admin'),
                                  validate({ params: userIdParamSchema, body: updateUserRoleSchema }), usersController.updateUserRole);

router.patch('/:userId/plan',     authorize('admin'),
                                  validate({ params: userIdParamSchema, body: updateUserPlanSchema }), usersController.updateUserPlan);

router.patch('/:userId/status',   authorize('admin'),
                                  validate({ params: userIdParamSchema, body: updateUserStatusSchema }), usersController.updateUserStatus);

router.post('/:userId/reset-password', authorize('admin'),
                                  validate({ params: userIdParamSchema }),              usersController.sendPasswordReset);

router.delete('/:userId/permanent', authorize('admin'),
                                  validate({ params: userIdParamSchema }),              usersController.deleteUserPermanently);

router.delete('/:userId',         authorize('admin'),
                                  validate({ params: userIdParamSchema }),              usersController.deactivateUser);

module.exports = router;
