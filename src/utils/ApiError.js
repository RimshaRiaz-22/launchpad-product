// src/utils/ApiError.js — Custom operational error class
'use strict';

/**
 * Represents a known, operational API error (not a programmer error).
 * Thrown from services/controllers to be caught by the global error handler.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404)
   * @param {string} message - Human-readable error message
   * @param {string} [code] - Machine-readable error code (e.g. 'USER_NOT_FOUND')
   * @param {Array}  [errors] - Array of validation errors or sub-errors
   * @param {string} [stack] - Optional manual stack override
   */
  constructor(statusCode, message, code = null, errors = [], stack = '') {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || `HTTP_${statusCode}`;
    this.errors = errors;
    this.isOperational = true; // Distinguishes from programmer errors

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Factory helpers ─────────────────────────────────────────

  static badRequest(message = 'Bad Request', code, errors) {
    return new ApiError(400, message, code || 'BAD_REQUEST', errors);
  }

  static unauthorized(message = 'Unauthorized', code) {
    return new ApiError(401, message, code || 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden', code) {
    return new ApiError(403, message, code || 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found', code) {
    return new ApiError(404, message, code || 'NOT_FOUND');
  }

  static conflict(message = 'Conflict', code) {
    return new ApiError(409, message, code || 'CONFLICT');
  }

  static unprocessable(message = 'Unprocessable Entity', code, errors) {
    return new ApiError(422, message, code || 'UNPROCESSABLE_ENTITY', errors);
  }

  static tooManyRequests(message = 'Too Many Requests', code) {
    return new ApiError(429, message, code || 'RATE_LIMIT_EXCEEDED');
  }

  static internal(message = 'Internal Server Error', code) {
    return new ApiError(500, message, code || 'INTERNAL_SERVER_ERROR');
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      errors: this.errors,
    };
  }
}

module.exports = ApiError;
