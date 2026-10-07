// src/middlewares/validate.middleware.js — Joi schema validation middleware
'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Middleware factory: validates req against a Joi schema.
 * Supports validating body, query, params, or any combination.
 *
 * Usage:
 *   router.post('/register', validate({ body: registerSchema }), handler)
 *
 * @param {{ body?: Joi.Schema, query?: Joi.Schema, params?: Joi.Schema }} schemas
 * @returns {import('express').RequestHandler}
 */
const validate = (schemas) => (req, _res, next) => {
  const errors = [];

  for (const [key, schema] of Object.entries(schemas)) {
    const { error, value } = schema.validate(req[key], {
      abortEarly: false,    // collect ALL errors, not just first
      allowUnknown: false,  // reject unknown keys
      stripUnknown: true,   // strip keys not in schema (sanitize)
      convert: true,        // coerce types (string -> number etc.)
    });

    if (error) {
      const fieldErrors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      errors.push(...fieldErrors);
    } else {
      // Replace req[key] with the sanitized/coerced value
      req[key] = value;
    }
  }

  if (errors.length > 0) {
    return next(
      ApiError.unprocessable('Validation failed', 'VALIDATION_ERROR', errors)
    );
  }

  return next();
};

module.exports = validate;
