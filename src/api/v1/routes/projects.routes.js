// src/api/v1/routes/projects.routes.js — Project routes
'use strict';

const { Router } = require('express');
const projectsController = require('../../../controllers/projects.controller');
const { authenticate, optionalAuthenticate } = require('../../../middlewares/auth.middleware');
const { checkProjectLimit, attachEntitlements } = require('../../../middlewares/entitlements.middleware');
const validate = require('../../../middlewares/validate.middleware');
const {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  listPublicProjectsQuerySchema,
  projectIdParamSchema,
} = require('../../../validators/projects.validator');

const router = Router();

// Public explore gallery — optional auth for personalisation
router.get('/explore',
  optionalAuthenticate,
  validate({ query: listPublicProjectsQuerySchema }),
  projectsController.listPublicProjects
);

// All routes below require authentication & live entitlements
router.use(authenticate, attachEntitlements);

router.get('/',
  validate({ query: listProjectsQuerySchema }),
  projectsController.listMyProjects
);

router.post('/',
  checkProjectLimit(),
  validate({ body: createProjectSchema }),
  projectsController.createProject
);

router.get('/:projectId',
  validate({ params: projectIdParamSchema }),
  projectsController.getProject
);

router.patch('/:projectId',
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  projectsController.updateProject
);

router.delete('/:projectId',
  validate({ params: projectIdParamSchema }),
  projectsController.deleteProject
);

router.post('/:projectId/duplicate',
  checkProjectLimit(),
  validate({ params: projectIdParamSchema }),
  projectsController.duplicateProject
);

module.exports = router;
