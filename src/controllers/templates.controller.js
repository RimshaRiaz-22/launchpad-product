// src/controllers/templates.controller.js — Template request handlers
"use strict";

const templatesService = require("../services/templates.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/** GET /api/v1/templates — List public templates */
const listTemplates = asyncHandler(async (req, res) => {
  const result = await templatesService.listTemplates(req.query, req.user?.id);
  return ApiResponse.paginated(res, result.templates, result.pagination, "Templates retrieved successfully");
});

/** GET /api/v1/templates/admin/all — Admin: list ALL templates (all statuses, sources) */
const adminListTemplates = asyncHandler(async (req, res) => {
  const result = await templatesService.adminListTemplates(req.query);
  return ApiResponse.paginated(res, result.templates, result.pagination, "All templates retrieved successfully");
});

/** GET /api/v1/templates/categories — Distinct categories of public templates */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await templatesService.getCategories();
  return ApiResponse.success(res, { categories }, "Template categories retrieved successfully");
});

/** GET /api/v1/templates/:templateId — Get a single public template */
const getTemplate = asyncHandler(async (req, res) => {
  const template = await templatesService.getTemplate(req.params.templateId);
  return ApiResponse.success(res, { template }, "Template retrieved successfully");
});

/** GET /api/v1/templates/:templateId/admin — Admin: get template regardless of visibility */
const getTemplateAdmin = asyncHandler(async (req, res) => {
  const template = await templatesService.getTemplateAdmin(req.params.templateId);
  return ApiResponse.success(res, { template }, "Template retrieved successfully");
});

/** POST /api/v1/templates — Admin: create a template */
const createTemplate = asyncHandler(async (req, res) => {
  const template = await templatesService.createTemplate(req.user.id, req.body);
  return ApiResponse.created(res, { template }, "Template created successfully");
});

/** PATCH /api/v1/templates/:templateId — Admin: update a template */
const updateTemplate = asyncHandler(async (req, res) => {
  const template = await templatesService.updateTemplate(req.params.templateId, req.body, req.user?.id);
  return ApiResponse.success(res, { template }, "Template updated successfully");
});

/** DELETE /api/v1/templates/:templateId — Admin: delete a template */
const deleteTemplate = asyncHandler(async (req, res) => {
  await templatesService.deleteTemplate(req.params.templateId, req.user?.id);
  return ApiResponse.noContent(res);
});

/** POST /api/v1/templates/bulk-delete — Admin: bulk delete templates */
const bulkDeleteTemplates = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const result = await templatesService.bulkDeleteTemplates(ids, req.user?.id);
  return ApiResponse.success(res, result, "Templates deleted successfully");
});

/** POST /api/v1/templates/:templateId/promote — Admin: promote user template to global */
const promoteTemplate = asyncHandler(async (req, res) => {
  const template = await templatesService.promoteTemplate(req.params.templateId, req.user?.id);
  return ApiResponse.success(res, { template }, "Template promoted to global successfully");
});

/** PATCH /api/v1/templates/:templateId/category — Admin: move template to different category */
const moveTemplateCategory = asyncHandler(async (req, res) => {
  const template = await templatesService.moveTemplateCategory(req.params.templateId, req.body.category, req.user?.id);
  return ApiResponse.success(res, { template }, "Template category updated successfully");
});

/** POST /api/v1/templates/:templateId/use — Record usage/application of a template */
const recordTemplateUse = asyncHandler(async (req, res) => {
  const count = await templatesService.recordTemplateUse(req.params.templateId);
  return ApiResponse.success(res, { use_count: count }, "Template usage recorded successfully");
});

module.exports = {
  listTemplates,
  adminListTemplates,
  getCategories,
  getTemplate,
  getTemplateAdmin,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  bulkDeleteTemplates,
  promoteTemplate,
  moveTemplateCategory,
  recordTemplateUse,
};
