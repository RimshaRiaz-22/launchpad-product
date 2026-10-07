// src/api/v1/routes/templateCategories.routes.js — Template category management routes
"use strict";

const { Router } = require("express");
const categoriesController = require("../../../controllers/templateCategories.controller");
const { authenticate } = require("../../../middlewares/auth.middleware");
const { authorize } = require("../../../middlewares/rbac.middleware");
const validate = require("../../../middlewares/validate.middleware");
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  deleteCategorySchema,
  reorderCategorySchema,
} = require("../../../validators/templates.validator");

const { httpCache } = require("../../../middlewares/httpCache.middleware");

const router = Router();

// Public: list active categories (used by template picker, editor, etc., cached 60s)
router.get("/", httpCache(60, 180), categoriesController.listCategories);

// Admin-only CRUD
router.use(authenticate, authorize("admin"));

router.post("/", validate({ body: createCategorySchema }), categoriesController.createCategory);
router.patch("/:categoryId", validate({ params: categoryIdParamSchema, body: updateCategorySchema }), categoriesController.updateCategory);
router.delete("/:categoryId", validate({ params: categoryIdParamSchema, body: deleteCategorySchema }), categoriesController.deleteCategory);
router.post("/:categoryId/reorder", validate({ params: categoryIdParamSchema, body: reorderCategorySchema }), categoriesController.reorderCategory);

module.exports = router;
