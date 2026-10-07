// src/api/v1/routes/mockups.routes.js — Mockups API routes
'use strict';

const { Router } = require('express');
const db = require('../../../database/knex');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = Router();

// GET /api/v1/mockups/categories
router.get('/categories', async (_req, res, next) => {
  try {
    const rows = await db('mockups')
      .distinct('category')
      .orderBy('category');
    const categories = rows.map((r) => r.category).filter(Boolean);
    return res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/mockups
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const query = db('mockups');
    if (req.query.category) {
      query.where({ category: req.query.category });
    }

    const countRes = await query.clone().count('id as count').first();
    const total = parseInt(countRes?.count || '0', 10);

    const mockups = await query
      .limit(limit)
      .offset(offset)
      .orderBy('name', 'asc');

    return res.status(200).json({
      success: true,
      data: mockups,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/mockups (Protected)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const [mockup] = await db('mockups').insert({
      ...req.body,
      user_id: req.user.id,
    }).returning('*');
    return res.status(201).json({
      success: true,
      data: mockup,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
