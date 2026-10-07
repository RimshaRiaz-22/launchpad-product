// src/services/templates.service.js — Templates business logic
"use strict";

const templatesRepo = require("../repositories/templates.repository");
const ApiError = require("../utils/ApiError");
const auditLogsService = require("./auditLogs.service");

/**
 * List public templates (used by both public API and admin with different filters).
 */
const listTemplates = async (query, _userId) => {
  const result = await templatesRepo.findMany(query, false);
  return { templates: result.data, pagination: result.meta };
};

/**
 * Admin: list ALL templates (including drafts, user-created) with full filter support.
 */
const adminListTemplates = async (query) => {
  const result = await templatesRepo.findMany(query, true);
  return { templates: result.data, pagination: result.meta };
};

const getTemplate = async (templateId) => {
  const template = await templatesRepo.findById(templateId);
  if (!template) throw ApiError.notFound("Template not found", "TEMPLATE_NOT_FOUND");
  if (!template.is_public) throw ApiError.forbidden("Template is not public", "TEMPLATE_FORBIDDEN");
  return template;
};

/** Admin: get template regardless of is_public status */
const getTemplateAdmin = async (templateId) => {
  const template = await templatesRepo.findByIdAdmin(templateId);
  if (!template) throw ApiError.notFound("Template not found", "TEMPLATE_NOT_FOUND");
  return template;
};

const createTemplate = async (creatorId, data) => {
  const created = await templatesRepo.create({
    creator_id: creatorId,
    source: data.source || "admin",
    ...data,
    canvas_data: JSON.stringify(data.canvas_data || {}),
  });

  auditLogsService.logEvent({
    user_id: creatorId,
    action: "template.create",
    resource_type: "template",
    resource_id: created.id,
    severity: "info",
    metadata: {
      name: created.name,
      category: created.category,
      source: created.source,
      is_public: created.is_public,
      is_pro: created.is_pro,
      dimensions: { width: created.width, height: created.height },
    },
  }).catch(() => {});

  return created;
};

const updateTemplate = async (templateId, data, userId = null) => {
  const template = await templatesRepo.findByIdAdmin(templateId);
  if (!template) throw ApiError.notFound("Template not found", "TEMPLATE_NOT_FOUND");
  const updateData = { ...data };
  if (updateData.canvas_data) updateData.canvas_data = JSON.stringify(updateData.canvas_data);
  const updated = await templatesRepo.update(templateId, updateData);

  auditLogsService.logEvent({
    user_id: userId,
    action: "template.update",
    resource_type: "template",
    resource_id: templateId,
    severity: "info",
    metadata: {
      name: updated.name,
      updated_fields: Object.keys(data).filter((k) => k !== "canvas_data"),
      is_public: updated.is_public,
      is_pro: updated.is_pro,
      category: updated.category,
    },
  }).catch(() => {});

  return updated;
};

const deleteTemplate = async (templateId, userId = null) => {
  const template = await templatesRepo.findByIdAdmin(templateId);
  if (!template) throw ApiError.notFound("Template not found", "TEMPLATE_NOT_FOUND");
  await templatesRepo.remove(templateId);

  auditLogsService.logEvent({
    user_id: userId,
    action: "template.delete",
    resource_type: "template",
    resource_id: templateId,
    severity: "warning",
    metadata: {
      name: template.name,
      category: template.category,
      source: template.source,
    },
  }).catch(() => {});
};

const bulkDeleteTemplates = async (ids, userId = null) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw ApiError.badRequest("ids array is required", "IDS_REQUIRED");
  }
  const count = await templatesRepo.bulkRemove(ids);

  auditLogsService.logEvent({
    user_id: userId,
    action: "template.bulk_delete",
    resource_type: "template",
    resource_id: "bulk",
    severity: "warning",
    metadata: {
      count,
      ids,
    },
  }).catch(() => {});

  return { count };
};

const getCategories = async () => templatesRepo.getCategories();

/** Promote user-created template to global admin template */
const promoteTemplate = async (templateId, userId = null) => {
  const template = await templatesRepo.findByIdAdmin(templateId);
  if (!template) throw ApiError.notFound("Template not found", "TEMPLATE_NOT_FOUND");
  if (template.source === "admin") throw ApiError.badRequest("Template is already a global admin template", "ALREADY_PROMOTED");
  const promoted = await templatesRepo.promoteToGlobal(templateId);

  auditLogsService.logEvent({
    user_id: userId,
    action: "template.promote",
    resource_type: "template",
    resource_id: templateId,
    severity: "info",
    metadata: {
      name: template.name,
      previous_source: template.source,
      new_source: "admin",
    },
  }).catch(() => {});

  return promoted;
};

/** Move template to a different category */
const moveTemplateCategory = async (templateId, category, userId = null) => {
  const template = await templatesRepo.findByIdAdmin(templateId);
  if (!template) throw ApiError.notFound("Template not found", "TEMPLATE_NOT_FOUND");
  if (!category || typeof category !== "string") throw ApiError.badRequest("Invalid category", "INVALID_CATEGORY");
  const moved = await templatesRepo.moveCategory(templateId, category.trim());

  auditLogsService.logEvent({
    user_id: userId,
    action: "template.move_category",
    resource_type: "template",
    resource_id: templateId,
    severity: "info",
    metadata: {
      name: template.name,
      previous_category: template.category,
      new_category: category.trim(),
    },
  }).catch(() => {});

  return moved;
};

/** Record a usage (load, clone, apply) of a template */
const recordTemplateUse = async (templateId) => {
  return templatesRepo.incrementUseCount(templateId);
};

module.exports = {
  listTemplates,
  adminListTemplates,
  getTemplate,
  getTemplateAdmin,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  bulkDeleteTemplates,
  getCategories,
  promoteTemplate,
  moveTemplateCategory,
  recordTemplateUse,
};
