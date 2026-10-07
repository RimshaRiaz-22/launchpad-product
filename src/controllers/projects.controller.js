// src/controllers/projects.controller.js — Project request handlers
'use strict';

const projectsService = require('../services/projects.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/v1/projects — Create a new project */
const createProject = asyncHandler(async (req, res) => {
  const project = await projectsService.createProject(req.user.id, req.body);
  return ApiResponse.created(res, { project }, 'Project created successfully');
});

/** GET /api/v1/projects — List authenticated user's projects */
const listMyProjects = asyncHandler(async (req, res) => {
  const result = await projectsService.listMyProjects(req.user.id, req.query);
  return ApiResponse.paginated(res, result.projects, result.pagination, 'Projects retrieved successfully');
});

/** GET /api/v1/projects/explore — List public projects (gallery) */
const listPublicProjects = asyncHandler(async (req, res) => {
  const result = await projectsService.listPublicProjects(req.query);
  return ApiResponse.paginated(res, result.projects, result.pagination, 'Public projects retrieved successfully');
});

/** GET /api/v1/projects/:projectId — Get a single project */
const getProject = asyncHandler(async (req, res) => {
  const project = await projectsService.getProject(req.params.projectId, req.user?.id);
  return ApiResponse.success(res, { project }, 'Project retrieved successfully');
});

/** PATCH /api/v1/projects/:projectId — Update a project */
const updateProject = asyncHandler(async (req, res) => {
  const project = await projectsService.updateProject(req.params.projectId, req.user.id, req.body);
  return ApiResponse.success(res, { project }, 'Project updated successfully');
});

/** DELETE /api/v1/projects/:projectId — Delete a project */
const deleteProject = asyncHandler(async (req, res) => {
  await projectsService.deleteProject(req.params.projectId, req.user.id);
  return ApiResponse.noContent(res);
});

/** POST /api/v1/projects/:projectId/duplicate — Duplicate a project */
const duplicateProject = asyncHandler(async (req, res) => {
  const project = await projectsService.duplicateProject(req.params.projectId, req.user.id);
  return ApiResponse.created(res, { project }, 'Project duplicated successfully');
});

module.exports = {
  createProject,
  listMyProjects,
  listPublicProjects,
  getProject,
  updateProject,
  deleteProject,
  duplicateProject,
};
