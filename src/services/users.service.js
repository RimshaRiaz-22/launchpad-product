// src/services/users.service.js — User management business logic
"use strict";

const usersRepo = require("../repositories/users.repository");
const billingRepo = require("../repositories/billing.repository");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../utils/pagination.utils");
const ApiError = require("../utils/ApiError");
const auditLogsService = require("./auditLogs.service");

/**
 * Get a user by ID (public profile).
 */
const getUserById = async (id) => {
  const user = await usersRepo.findById(id);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");
  return user;
};

/**
 * Update the authenticated user's own profile.
 */
const updateProfile = async (userId, data) => {
  const user = await usersRepo.findById(userId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const updated = await usersRepo.update(userId, data);

  auditLogsService
    .logEvent({
      user_id: userId,
      action: "user.profile_update",
      resource_type: "user",
      resource_id: userId,
      severity: "info",
      metadata: { updatedFields: Object.keys(data) },
    })
    .catch(() => {});

  return updated;
};

/**
 * List all users — admin only.
 */
const listUsers = async (query) => {
  const result = await usersRepo.findMany(query);
  return {
    users: result.data,
    pagination: result.meta,
  };
};

/**
 * Update a user's role — Admin (product owner / super-admin) only.
 * Protects against accidental self-demotion so the owner retains admin privileges.
 */
const updateUserRole = async (targetUserId, roleOrData, requesterId) => {
  const roleInput =
    typeof roleOrData === "object" ? roleOrData.role : roleOrData;
  const roleIdInput =
    typeof roleOrData === "object" ? roleOrData.role_id : undefined;

  const roleRecord = await usersRepo.resolveRole({
    role: roleInput,
    role_id: roleIdInput,
  });
  if (!roleRecord) {
    throw ApiError.badRequest(
      `Role '${roleInput || roleIdInput}' is not recognized in system roles`,
      "INVALID_ROLE",
    );
  }

  const normalizedRoleName = roleRecord.name.toLowerCase();

  if (
    requesterId &&
    targetUserId === requesterId &&
    normalizedRoleName !== "admin"
  ) {
    throw ApiError.badRequest(
      "You cannot remove your own admin status",
      "SELF_ROLE_DEMOTE",
    );
  }

  const user = await usersRepo.findById(targetUserId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const updated = await usersRepo.update(targetUserId, {
    role: normalizedRoleName,
    role_id: roleRecord.id,
  });

  auditLogsService
    .logEvent({
      user_id: requesterId || targetUserId,
      action: "user.role_change",
      resource_type: "user",
      resource_id: targetUserId,
      severity: "warning",
      metadata: {
        previousRole: user.role,
        previousRoleId: user.role_id,
        newRole: normalizedRoleName,
        newRoleId: roleRecord.id,
        roleName: roleRecord.name,
        updatedBy: requesterId,
      },
    })
    .catch(() => {});

  return updated;
};

/**
 * Update a user's plan — Admin only.
 */
const updateUserPlan = async (targetUserId, plan, requesterId) => {
  const user = await usersRepo.findById(targetUserId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const updated = await usersRepo.update(targetUserId, { plan });
  await billingRepo.upsertByUserId(targetUserId, { plan, status: "active" });

  auditLogsService
    .logEvent({
      user_id: requesterId || targetUserId,
      action: "user.plan_change",
      resource_type: "user",
      resource_id: targetUserId,
      severity: "info",
      metadata: {
        previousPlan: user.plan,
        newPlan: plan,
        updatedBy: requesterId,
      },
    })
    .catch(() => {});

  return updated;
};

/**
 * Get summary stats across all platform users.
 */
const getUsersStats = async () => {
  return usersRepo.getSummaryStats();
};

/**
 * Update user active status (activate / suspend) — admin only.
 */
const updateUserStatus = async (targetUserId, isActive, requesterId) => {
  if (requesterId && targetUserId === requesterId && !isActive) {
    throw ApiError.badRequest(
      "You cannot suspend your own account",
      "SELF_SUSPEND",
    );
  }

  const user = await usersRepo.findById(targetUserId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  if (
    String(user.role).toLowerCase() === "admin" &&
    user.email === "owner@launchpad.dev" &&
    !isActive
  ) {
    throw ApiError.badRequest(
      "You cannot suspend the product owner account",
      "OWNER_PROTECTED",
    );
  }

  const updated = await usersRepo.setStatus(targetUserId, isActive);

  auditLogsService
    .logEvent({
      user_id: requesterId || targetUserId,
      action: isActive ? "user.reactivate" : "user.suspend",
      resource_type: "user",
      resource_id: targetUserId,
      severity: isActive ? "info" : "warning",
      metadata: {
        previousStatus: user.is_active,
        newStatus: isActive,
        updatedBy: requesterId,
      },
    })
    .catch(() => {});

  return updated;
};

/**
 * Deactivate a user account — admin only.
 */
const deactivateUser = async (targetUserId, requesterId) => {
  if (targetUserId === requesterId) {
    throw ApiError.badRequest(
      "You cannot deactivate your own account",
      "SELF_DEACTIVATE",
    );
  }

  const user = await usersRepo.findById(targetUserId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  if (
    String(user.role).toLowerCase() === "admin" &&
    user.email === "owner@launchpad.dev"
  ) {
    throw ApiError.badRequest(
      "You cannot deactivate the primary owner account",
      "OWNER_PROTECTED",
    );
  }

  await usersRepo.deactivate(targetUserId);

  auditLogsService
    .logEvent({
      user_id: requesterId,
      action: "user.deactivate",
      resource_type: "user",
      resource_id: targetUserId,
      severity: "critical",
      metadata: { deactivatedUserId: targetUserId },
    })
    .catch(() => {});
};

/**
 * Permanently delete a user account — admin only.
 */
const deleteUserPermanently = async (targetUserId, requesterId) => {
  if (requesterId && targetUserId === requesterId) {
    throw ApiError.badRequest(
      "You cannot delete your own account",
      "SELF_DELETE",
    );
  }

  const user = await usersRepo.findById(targetUserId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  if (
    String(user.role).toLowerCase() === "admin" &&
    user.email === "owner@launchpad.dev"
  ) {
    throw ApiError.badRequest(
      "You cannot delete the product owner account",
      "OWNER_PROTECTED",
    );
  }

  await usersRepo.deletePermanently(targetUserId);

  auditLogsService
    .logEvent({
      user_id: requesterId,
      action: "user.permanent_delete",
      resource_type: "user",
      resource_id: targetUserId,
      severity: "critical",
      metadata: { deletedUserEmail: user.email, deletedUserName: user.name },
    })
    .catch(() => {});
};

/**
 * Dispatch password reset for a user — admin initiated.
 */
const sendPasswordReset = async (targetUserId, requesterId) => {
  const user = await usersRepo.findById(targetUserId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await usersRepo.setPasswordResetToken(targetUserId, token, expiresAt);

  auditLogsService
    .logEvent({
      user_id: requesterId || targetUserId,
      action: "user.password_reset_dispatched",
      resource_type: "user",
      resource_id: targetUserId,
      severity: "info",
      metadata: { targetEmail: user.email },
    })
    .catch(() => {});

  return { email: user.email, message: "Password reset link dispatched" };
};

/**
 * Delete own account (soft delete for now).
 */
const deleteAccount = async (userId) => {
  const user = await usersRepo.findById(userId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  await usersRepo.deactivate(userId);

  auditLogsService
    .logEvent({
      user_id: userId,
      action: "user.delete_account",
      resource_type: "user",
      resource_id: userId,
      severity: "warning",
    })
    .catch(() => {});
};

module.exports = {
  getUserById,
  updateProfile,
  listUsers,
  getUsersStats,
  updateUserRole,
  updateUserPlan,
  updateUserStatus,
  deactivateUser,
  deleteUserPermanently,
  sendPasswordReset,
  deleteAccount,
};
