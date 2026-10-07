// src/middlewares/upload.middleware.js — Multer file upload middleware (in-memory, direct to Cloudinary)
'use strict';

const multer = require('multer');
const config = require('../config/app.config');
const ApiError = require('../utils/ApiError');

// ─────────────────────────────────────────────────────────────
// Storage engine — Memory storage (zero disk usage, 100% Cloudinary)
// ─────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();

// ─────────────────────────────────────────────────────────────
// File filter — MIME type whitelist
// ─────────────────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  if (config.upload.allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `File type '${file.mimetype}' is not allowed`,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

// ─────────────────────────────────────────────────────────────
// Multer instance
// ─────────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMb * 1024 * 1024, // bytes
    files: 100, // allow up to 100 for bulk upload
  },
});

// ─────────────────────────────────────────────────────────────
// Pre-built middleware helpers
// ─────────────────────────────────────────────────────────────

/** Single file upload under field name 'file' */
const uploadSingle = (fieldName = 'file') => upload.single(fieldName);

/** Multiple files under field name 'files' */
const uploadMultiple = (fieldName = 'files', maxCount = 100) =>
  upload.array(fieldName, maxCount);

/** Mixed fields */
const uploadFields = (fields) => upload.fields(fields);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
};
