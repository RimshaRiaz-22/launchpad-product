// src/api/v1/routes/templates.routes.js — Template routes
"use strict";

const { Router } = require("express");
const templatesController = require("../../../controllers/templates.controller");
const { authenticate, optionalAuthenticate } = require("../../../middlewares/auth.middleware");
const { authorize } = require("../../../middlewares/rbac.middleware");
const validate = require("../../../middlewares/validate.middleware");
const {
  createTemplateSchema,
  updateTemplateSchema,
  listTemplatesQuerySchema,
  templateIdParamSchema,
  moveCategorySchema,
} = require("../../../validators/templates.validator");

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.get("/", optionalAuthenticate, validate({ query: listTemplatesQuerySchema }), templatesController.listTemplates);
router.get("/categories", templatesController.getCategories);
router.get("/:templateId", optionalAuthenticate, validate({ params: templateIdParamSchema }), templatesController.getTemplate);
router.post("/:templateId/use", optionalAuthenticate, validate({ params: templateIdParamSchema }), templatesController.recordTemplateUse);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.use(authenticate, authorize("admin"));

router.get("/admin/all", validate({ query: listTemplatesQuerySchema }), templatesController.adminListTemplates);
router.get("/:templateId/admin", validate({ params: templateIdParamSchema }), templatesController.getTemplateAdmin);

router.post("/bulk-delete", templatesController.bulkDeleteTemplates);
router.delete("/bulk", templatesController.bulkDeleteTemplates);

router.post("/", validate({ body: createTemplateSchema }), templatesController.createTemplate);
router.patch("/:templateId", validate({ params: templateIdParamSchema, body: updateTemplateSchema }), templatesController.updateTemplate);
router.delete("/:templateId", validate({ params: templateIdParamSchema }), templatesController.deleteTemplate);

router.post("/:templateId/promote", validate({ params: templateIdParamSchema }), templatesController.promoteTemplate);
router.patch("/:templateId/category", validate({ params: templateIdParamSchema, body: moveCategorySchema }), templatesController.moveTemplateCategory);

module.exports = router;
