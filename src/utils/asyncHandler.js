// src/utils/asyncHandler.js — Async route wrapper
'use strict';

/**
 * Wraps an async Express route handler and forwards any rejected
 * promise to next() so the global error handler picks it up.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} fn - Async express handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
