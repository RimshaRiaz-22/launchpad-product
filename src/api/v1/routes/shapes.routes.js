// src/api/v1/routes/shapes.routes.js — Shapes API routes
'use strict';

const { Router } = require('express');
const db = require('../../../database/knex');

const router = Router();

// GET /api/v1/shapes/groups
router.get('/groups', async (_req, res, next) => {
  try {
    const shapes = await db('shapes').select('*').orderBy('group_id', 'asc');
    const groupMap = {};
    shapes.forEach((s) => {
      const gid = s.group_id || 'basic';
      if (!groupMap[gid]) {
        groupMap[gid] = {
          id: gid,
          label: s.group_label || gid,
          shapes: [],
        };
      }
      groupMap[gid].shapes.push(s);
    });

    return res.status(200).json({
      success: true,
      data: {
        groups: Object.values(groupMap),
      },
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/shapes
router.get('/', async (req, res, next) => {
  try {
    const query = db('shapes');
    if (req.query.group_id) {
      query.where({ group_id: req.query.group_id });
    }
    const shapes = await query.orderBy('name', 'asc');
    return res.status(200).json({
      success: true,
      data: {
        shapes,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
