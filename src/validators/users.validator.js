// src/validators/users.validator.js — Joi schemas for user routes
"use strict";

const Joi = require("joi");

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  avatar_url: Joi.string().allow(null, ""),
}).min(1);

const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid("user", "admin", "USER", "ADMIN"),
  role_id: Joi.string().uuid(),
}).or("role", "role_id");

const updateUserPlanSchema = Joi.object({
  plan: Joi.string().required(),
});

const updateUserStatusSchema = Joi.object({
  is_active: Joi.boolean().required(),
});

const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
  role: Joi.string().valid("all", "user", "admin", "USER", "ADMIN"),
  role_id: Joi.alternatives().try(
    Joi.string().uuid(),
    Joi.string().valid("all"),
  ),
  plan: Joi.string().valid("all", "free", "pro", "team", "enterprise"),
  status: Joi.string().valid("all", "active", "suspended"),
  search: Joi.string().max(100).allow("").trim(),
  q: Joi.string().max(100).allow("").trim(),
  is_active: Joi.boolean(),
  is_verified: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid("all", "true", "false"),
  ),
  dateRange: Joi.string().valid("all", "7d", "30d", "90d", "12m", "1y"),
  date_range: Joi.string().valid("all", "7d", "30d", "90d", "12m", "1y"),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  lastLoginStartDate: Joi.date().iso(),
  lastLoginEndDate: Joi.date().iso(),
  sort_by: Joi.string()
    .valid(
      "created_at",
      "updated_at",
      "last_login_at",
      "name",
      "email",
      "role",
      "plan",
      "projects_count",
      "storage_used_mb",
    )
    .default("created_at"),
  sortBy: Joi.string().valid(
    "created_at",
    "updated_at",
    "last_login_at",
    "name",
    "email",
    "role",
    "plan",
    "projects_count",
    "storage_used_mb",
  ),
  sort_order: Joi.string().valid("asc", "desc").default("desc"),
  sortOrder: Joi.string().valid("asc", "desc"),
});

const userIdParamSchema = Joi.object({
  userId: Joi.string().uuid().required(),
});

module.exports = {
  updateProfileSchema,
  updateUserRoleSchema,
  updateUserPlanSchema,
  updateUserStatusSchema,
  listUsersQuerySchema,
  userIdParamSchema,
};
