// src/api/v1/routes/fonts.routes.js — Font endpoints
'use strict';

const express = require('express');
const router = express.Router();
const fontsController = require('../../../controllers/fonts.controller');
const { authenticate, optionalAuthenticate } = require('../../../middlewares/auth.middleware');

router.get('/', optionalAuthenticate, fontsController.listFonts);
router.get('/categories', fontsController.getCategories);
router.get('/:fontId', fontsController.getFont);

router.post('/', authenticate, fontsController.createFont);
router.delete('/:fontId', authenticate, fontsController.deleteFont);

module.exports = router;
