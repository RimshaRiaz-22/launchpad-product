// src/services/projects.service.js — Project business logic
'use strict';

const projectsRepo = require('../repositories/projects.repository');
const templatesRepo = require('../repositories/templates.repository');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.utils');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger.config');
const auditLogsService = require('./auditLogs.service');

/**
 * Create a new project (optionally from a template).
 */
const createProject = async (userId, data) => {
  const { template_id, ...projectData } = data;

  let canvasData = projectData.canvas_data || null;

  // If creating from template, copy its canvas data
  if (template_id) {
    const template = await templatesRepo.findById(template_id);
    if (!template) throw ApiError.notFound('Template not found', 'TEMPLATE_NOT_FOUND');
    if (template.is_premium) {
      // TODO: Check user plan — for now allow all
    }
    canvasData = template.canvas_data;
    projectData.width = template.width;
    projectData.height = template.height;

    // Increment template use count asynchronously
    templatesRepo.incrementUseCount(template_id).catch(() => {});
  }

  const project = await projectsRepo.create({
    user_id: userId,
    ...projectData,
    canvas_data: canvasData ? JSON.stringify(canvasData) : null,
  });

  logger.info('Project created', { projectId: project.id, userId });

  auditLogsService.logEvent({
    user_id: userId,
    action: 'project.create',
    resource_type: 'project',
    resource_id: project.id,
    metadata: { name: project.name, width: project.width, height: project.height },
  }).catch(() => {});

  return project;
};

/**
 * Get a single project (owned or public).
 */
const getProject = async (projectId, userId) => {
  const project = await projectsRepo.findById(projectId);
  if (!project) throw ApiError.notFound('Project not found', 'PROJECT_NOT_FOUND');

  // Allow if owner OR project is public
  const isOwner = project.user_id === userId;
  const isPublic = project.is_public && project.status === 'published';

  if (!isOwner && !isPublic) {
    throw ApiError.forbidden('You do not have access to this project', 'PROJECT_FORBIDDEN');
  }

  return project;
};

/**
 * Update a project (owner only).
 */
const updateProject = async (projectId, userId, data) => {
  const project = await projectsRepo.findByIdAndUser(projectId, userId);
  if (!project) throw ApiError.notFound('Project not found', 'PROJECT_NOT_FOUND');

  // Stringify canvas_data if provided
  const updateData = { ...data };
  if (updateData.canvas_data) {
    updateData.canvas_data = JSON.stringify(updateData.canvas_data);
  }

  const updated = await projectsRepo.update(projectId, userId, updateData);

  const changedKeys = Object.keys(data).filter((k) => k !== 'canvas_data');
  auditLogsService.logEvent({
    user_id: userId,
    action: 'project.update',
    resource_type: 'project',
    resource_id: projectId,
    severity: 'info',
    metadata: {
      name: updated?.name || project.name,
      updated_fields: changedKeys,
      has_canvas_update: !!data.canvas_data,
      is_public: updated?.is_public,
      status: updated?.status,
    },
  }).catch(() => {});

  return updated;
};

/**
 * Delete a project (owner only).
 */
const deleteProject = async (projectId, userId) => {
  const project = await projectsRepo.findByIdAndUser(projectId, userId);
  if (!project) throw ApiError.notFound('Project not found', 'PROJECT_NOT_FOUND');

  await projectsRepo.remove(projectId, userId);
  logger.info('Project deleted', { projectId, userId });

  auditLogsService.logEvent({
    user_id: userId,
    action: 'project.delete',
    resource_type: 'project',
    resource_id: projectId,
    severity: 'warning',
    metadata: { name: project.name },
  }).catch(() => {});
};

/**
 * List projects owned by the authenticated user with rich filtering.
 */
const listMyProjects = async (userId, query) => {
  const result = await projectsRepo.findManyByUser(userId, query);
  return {
    projects: result.data,
    pagination: result.meta,
  };
};

/**
 * List public projects for the explore gallery with date ranges, search and sorting.
 */
const listPublicProjects = async (query) => {
  const result = await projectsRepo.findPublic(query);
  return {
    projects: result.data,
    pagination: result.meta,
  };
};

/**
 * Duplicate a project.
 */
const duplicateProject = async (projectId, userId) => {
  const source = await projectsRepo.findByIdAndUser(projectId, userId);
  if (!source) throw ApiError.notFound('Project not found', 'PROJECT_NOT_FOUND');

  const duplicate = await projectsRepo.create({
    user_id: userId,
    name: `${source.name} (Copy)`,
    description: source.description,
    canvas_data: source.canvas_data
      ? (typeof source.canvas_data === 'string' ? source.canvas_data : JSON.stringify(source.canvas_data))
      : null,
    width: source.width,
    height: source.height,
    is_public: false,
    status: 'draft',
    tags: source.tags,
  });

  logger.info('Project duplicated', { sourceId: projectId, newId: duplicate.id, userId });

  auditLogsService.logEvent({
    user_id: userId,
    action: 'project.duplicate',
    resource_type: 'project',
    resource_id: duplicate.id,
    metadata: { sourceId: projectId, name: duplicate.name },
  }).catch(() => {});

  return duplicate;
};

module.exports = {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listMyProjects,
  listPublicProjects,
  duplicateProject,
};
