// src/middlewares/httpCache.middleware.js — HTTP browser cache headers
'use strict';

/**
 * Middleware to attach Cache-Control headers to public read-only catalog routes.
 * Enables browser and edge caching so repeated requests are served in 0ms.
 *
 * @param {number} maxAgeSeconds Cache TTL in seconds (default 60s)
 * @param {number} swrSeconds Stale-while-revalidate window (default 120s)
 */
const httpCache = (maxAgeSeconds = 60, swrSeconds = 120) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${swrSeconds}`);
    }
    next();
  };
};

module.exports = { httpCache };
