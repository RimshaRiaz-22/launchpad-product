// src/utils/hash.utils.js — Password hashing helpers
'use strict';

const bcrypt = require('bcryptjs');
const config = require('../config/app.config');

/**
 * Hash a plain-text password using bcrypt.
 *
 * @param {string} plainPassword
 * @returns {Promise<string>} bcrypt hash
 */
const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
  return bcrypt.hash(plainPassword, salt);
};

/**
 * Compare a plain password against a stored bcrypt hash.
 *
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
