// src/utils/jwt.utils.js — JWT token helpers
'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/app.config');
const ApiError = require('./ApiError');

/**
 * Generate a signed access token (short-lived).
 *
 * @param {object} payload - Data to embed { id, email, role }
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.role ? String(payload.role).toLowerCase() : 'user',
      role_id: payload.role_id || null,
      type: 'access',
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn,
      issuer: config.app.name,
      audience: config.app.apiUrl,
    }
  );
};

/**
 * Generate a signed refresh token (long-lived).
 *
 * @param {object} payload - Data to embed { id }
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      sub: payload.id,
      type: 'refresh',
      jti: crypto.randomUUID(), // unique token ID for revocation
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: config.app.name,
      audience: config.app.apiUrl,
    }
  );
};

/**
 * Verify and decode an access token.
 *
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {ApiError} 401 if invalid or expired
 */
const verifyAccessToken = (token, options = {}) => {
  try {
    const validAudiences = [
      config.app.apiUrl,
      'http://127.0.0.1:4000',
      'http://localhost:4000',
      options?.audience,
    ].filter(Boolean);

    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      issuer: config.app.name,
      audience: validAudiences,
    });

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired', 'TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid access token', 'TOKEN_INVALID');
  }
};

/**
 * Verify and decode a refresh token.
 *
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {ApiError} 401 if invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: config.app.name,
      audience: config.app.apiUrl,
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid refresh token', 'REFRESH_TOKEN_INVALID');
  }
};

/**
 * Hash a token for safe storage in DB (prevents token-from-DB attacks).
 *
 * @param {string} token - Raw token string
 * @returns {string} SHA-256 hex hash
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Decode a JWT without verification (used for reading expiry, etc.)
 *
 * @param {string} token
 * @returns {object|null}
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  decodeToken,
};
