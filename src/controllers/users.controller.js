// src/controllers/users.controller.js — User management request handlers
'use strict';

const usersService = require('../services/users.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/v1/users — Admin: list all users */
const listUsers = asyncHandler(async (req, res) => {
  const result = await usersService.listUsers(req.query);
  return ApiResponse.paginated(res, result.users, result.pagination, 'Users retrieved successfully');
});

/** GET /api/v1/users/:userId — Get a user's public profile */
const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.userId);
  return ApiResponse.success(res, { user }, 'User retrieved successfully');
});

/** PATCH /api/v1/users/me — Update own profile */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await usersService.updateProfile(req.user.id, req.body);
  return ApiResponse.success(res, { user }, 'Profile updated successfully');
});

/** PATCH /api/v1/users/:userId/role — Admin: update user role */
const updateUserRole = asyncHandler(async (req, res) => {
  const rolePayload = req.body.role_id ? { role: req.body.role, role_id: req.body.role_id } : (req.body.role || req.body);
  const user = await usersService.updateUserRole(req.params.userId, rolePayload, req.user.id);
  return ApiResponse.success(res, { user }, 'User role updated successfully');
});

/** PATCH /api/v1/users/:userId/plan — Admin: update user plan */
const updateUserPlan = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserPlan(req.params.userId, req.body.plan, req.user.id);
  return ApiResponse.success(res, { user }, 'User plan updated successfully');
});

/** DELETE /api/v1/users/:userId — Admin: deactivate user */
const deactivateUser = asyncHandler(async (req, res) => {
  await usersService.deactivateUser(req.params.userId, req.user.id);
  return ApiResponse.noContent(res);
});

/** DELETE /api/v1/users/me — Delete own account */
const deleteAccount = asyncHandler(async (req, res) => {
  await usersService.deleteAccount(req.user.id);
  return ApiResponse.noContent(res);
});

/** GET /api/v1/users/stats — Admin: get overall creator summary statistics */
const getUsersStats = asyncHandler(async (_req, res) => {
  const stats = await usersService.getUsersStats();
  return ApiResponse.success(res, { stats }, 'User statistics retrieved successfully');
});

/** PATCH /api/v1/users/:userId/status — Admin: update user active status (suspend/reactivate) */
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserStatus(req.params.userId, req.body.is_active, req.user.id);
  return ApiResponse.success(res, { user }, 'User status updated successfully');
});

/** DELETE /api/v1/users/:userId/permanent — Admin: permanently delete a user */
const deleteUserPermanently = asyncHandler(async (req, res) => {
  await usersService.deleteUserPermanently(req.params.userId, req.user.id);
  return ApiResponse.noContent(res);
});

/** POST /api/v1/users/:userId/reset-password — Admin: dispatch password reset */
const sendPasswordReset = asyncHandler(async (req, res) => {
  const result = await usersService.sendPasswordReset(req.params.userId, req.user.id);
  return ApiResponse.success(res, result, 'Password reset email queued successfully');
});

module.exports = {
  listUsers,
  getUsersStats,
  getUserById,
  updateProfile,
  updateUserRole,
  updateUserPlan,
  updateUserStatus,
  deactivateUser,
  deleteUserPermanently,
  sendPasswordReset,
  deleteAccount,
};
