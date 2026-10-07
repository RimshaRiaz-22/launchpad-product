// src/middlewares/errorHandler.middleware.js — Global error handler
'use strict';

const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../config/logger.config');

/**
 * 404 — Not Found handler.
 * Must be placed AFTER all routes.
 */
const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
};

/**
 * Global error handler.
 * Must have 4 params (err, req, res, next) for Express to treat it as error middleware.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next  eslint-disable-line no-unused-vars
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // ── Multer errors ────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiResponse.error(
      res, 413, 'File size exceeds the allowed limit', 'FILE_TOO_LARGE'
    );
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return ApiResponse.error(res, 413, 'Too many files uploaded', 'TOO_MANY_FILES');
  }

  // ── Joi / Knex constraint errors ─────────────────────────
  if (err.code === '23505') { // PostgreSQL unique violation
    return ApiResponse.error(
      res, 409, 'A resource with this value already exists', 'DUPLICATE_ENTRY'
    );
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    return ApiResponse.error(
      res, 400, 'Referenced resource does not exist', 'FOREIGN_KEY_VIOLATION'
    );
  }

  // ── Operational errors (ApiError) ────────────────────────
  if (err.isOperational) {
    // Log at warn level — these are expected
    logger.warn('Operational error', {
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
    });

    return ApiResponse.error(
      res,
      err.statusCode,
      err.message,
      err.code,
      err.errors
    );
  }

  // ── Unknown / programmer errors ──────────────────────────
  // Log full error with stack — these are bugs
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    body: req.body,
  });

  // Don't leak internals in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  return ApiResponse.error(res, 500, message, 'INTERNAL_SERVER_ERROR');
};

module.exports = { notFoundHandler, errorHandler };
