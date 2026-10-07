// src/middlewares/auth.middleware.js — JWT authentication middleware
"use strict";

const { verifyAccessToken } = require("../utils/jwt.utils");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Middleware: verify the Authorization Bearer token and attach
 * the decoded user payload to req.user.
 *
 * @throws {ApiError} 401 if no token or invalid
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("No authentication token provided", "NO_TOKEN");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw ApiError.unauthorized(
      "Malformed Authorization header",
      "MALFORMED_TOKEN",
    );
  }

  // verifyAccessToken throws ApiError on failure
  const decoded = verifyAccessToken(token);

  // Attach to request for downstream use
  req.user = {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role ? String(decoded.role).toLowerCase() : 'user',
    role_id: decoded.role_id || null,
  };

  next();
});

/**
 * Optional authentication — attaches req.user if token present, but
 * does NOT throw if missing. Useful for public routes with optional
 * personalisation.
 */
const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role ? String(decoded.role).toLowerCase() : 'user',
        role_id: decoded.role_id || null,
      };
    } catch {
      // Silently ignore — optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
});

module.exports = { authenticate, optionalAuthenticate };
