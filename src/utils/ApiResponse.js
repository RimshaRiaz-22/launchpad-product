// src/utils/ApiResponse.js — Standardised API response envelope
'use strict';

/**
 * Sends a consistent JSON response shape across all endpoints.
 *
 * Success:  { success: true,  data: {...}, meta: {...}, message: "..." }
 * Error:    { success: false, code: "...", message: "...", errors: [] }
 */
class ApiResponse {
  /**
   * Send a successful response.
   *
   * @param {import('express').Response} res
   * @param {*}      data       - Response payload
   * @param {string} [message]  - Human-readable success message
   * @param {number} [statusCode=200] - HTTP status
   * @param {object} [meta]     - Pagination / extra metadata
   */
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    const body = {
      success: true,
      message,
      data,
    };

    if (meta) body.meta = meta;

    return res.status(statusCode).json(body);
  }

  /**
   * Send a created (201) response.
   */
  static created(res, data = null, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Send a no-content (204) response.
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Send a paginated list response.
   *
   * @param {import('express').Response} res
   * @param {Array}  items         - Array of records
   * @param {object} pagination    - { page, limit, total, totalPages }
   * @param {string} [message]
   */
  static paginated(res, items, pagination, message = 'Success') {
    return ApiResponse.success(res, items, message, 200, {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1,
        ...(pagination.severityCounts ? { severityCounts: pagination.severityCounts } : {}),
      },
    });
  }

  /**
   * Send an error response (used by errorHandler middleware).
   *
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {string} [code]
   * @param {Array}  [errors]
   */
  static error(res, statusCode = 500, message = 'Internal Server Error', code = null, errors = []) {
    return res.status(statusCode).json({
      success: false,
      code: code || `HTTP_${statusCode}`,
      message,
      errors,
    });
  }
}

module.exports = ApiResponse;
