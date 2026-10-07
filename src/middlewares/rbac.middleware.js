// src/middlewares/rbac.middleware.js — Role-Based Access Control
"use strict";

const ApiError = require("../utils/ApiError");

/**
 * 2 system roles:
 * - 'user': standard creator
 * - 'admin': product owner & super-admin with complete administrative privileges
 */
const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

/**
 * Middleware factory: restrict access to users with specific roles.
 *
 * Usage:
 *   router.delete('/user/:id', authenticate, authorize('admin'), handler)
 *
 * @param {...string} roles - Allowed roles ('user', 'admin')
 * @returns {import('express').RequestHandler}
 */
const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(
        ApiError.unauthorized("Authentication required", "UNAUTHENTICATED"),
      );
    }

    const userRole = String(req.user.role || '').toLowerCase();
    const allowed = roles.map((r) => String(r).toLowerCase());

    if (!allowed.includes(userRole)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized for this action`,
          "INSUFFICIENT_ROLE",
        ),
      );
    }

    return next();
  };

/**
 * Middleware: ensure the authenticated user is acting on their own resource
 * OR is an admin (product owner). The route must expose the target user ID as req.params.userId.
 */
const authorizeOwnerOrAdmin = (req, _res, next) => {
  if (!req.user) {
    return next(
      ApiError.unauthorized("Authentication required", "UNAUTHENTICATED"),
    );
  }

  const isOwner = req.user.id === req.params.userId;
  const userRole = String(req.user.role || '').toLowerCase();
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    return next(
      ApiError.forbidden(
        "You do not have permission to access this resource",
        "FORBIDDEN",
      ),
    );
  }

  return next();
};

module.exports = { authorize, authorizeOwnerOrAdmin, ROLES };
