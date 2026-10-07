// src/services/cloudinary.service.js — Cloudinary upload, delete, and signature utilities
'use strict';

const stream = require('stream');
const { cloudinary, isCloudinaryConfigured, isDummy } = require('../config/cloudinary.config');
const config = require('../config/app.config');
const logger = require('../config/logger.config');

/**
 * Upload a local file path to Cloudinary.
 * @param {string} filePath - Absolute or relative path to the local file
 * @param {Object} options - Upload options (folder, tags, public_id, etc.)
 * @returns {Promise<Object>} Cloudinary upload response
 */
const uploadFile = async (filePath, options = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured or disabled');
  }

  const folder = options.folder || config.cloudinary.folder || 'launchpad';
  const uploadOptions = {
    folder,
    resource_type: options.resource_type || 'auto',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    ...options,
  };

  try {
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    logger.info('File uploaded to Cloudinary successfully', {
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      secure_url: result.secure_url,
    });

    return {
      url: result.secure_url || result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width || null,
      height: result.height || null,
      resource_type: result.resource_type,
      created_at: result.created_at,
    };
  } catch (error) {
    logger.error('Cloudinary file upload failed', { error: error.message, filePath });
    throw error;
  }
};

/**
 * Upload a buffer or stream to Cloudinary directly.
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>}
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary is not configured or disabled'));
    }

    const folder = options.folder || config.cloudinary.folder || 'launchpad';
    const uploadOptions = {
      folder,
      resource_type: options.resource_type || 'auto',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary stream upload failed', { error: error.message });
        return reject(error);
      }
      resolve({
        url: result.secure_url || result.url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width || null,
        height: result.height || null,
        resource_type: result.resource_type,
      });
    });

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId - The public ID of the resource
 * @param {Object} options - Deletion options (resource_type: 'image' | 'video' | 'raw')
 */
const deleteFile = async (publicId, options = {}) => {
  if (!isCloudinaryConfigured() || !publicId) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: options.resource_type || 'image',
      invalidate: true,
      ...options,
    });
    logger.info('Deleted asset from Cloudinary', { publicId, result });
    return result;
  } catch (error) {
    logger.warn('Failed to delete asset from Cloudinary', { publicId, error: error.message });
    return null;
  }
};

/**
 * Generate a signed upload signature for direct browser uploads.
 * @param {Object} paramsToSign - Parameters to include in the signature
 */
const generateSignature = (paramsToSign = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder: config.cloudinary.folder || 'launchpad',
    ...paramsToSign,
  };

  const signature = cloudinary.utils.api_sign_request(params, config.cloudinary.apiSecret);

  return {
    signature,
    timestamp,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
    folder: params.folder,
  };
};

/**
 * Upload any media source (Multer in-memory file object, Buffer, or file path) directly to Cloudinary.
 * @param {Object|Buffer|string} file - Multer file object, Buffer, or path string
 * @param {Object} options - Upload options (folder, tags, public_id, etc.)
 * @returns {Promise<Object>}
 */
const uploadMedia = async (file, options = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured or disabled');
  }

  // Multer in-memory file object (from multer.memoryStorage)
  if (file && Buffer.isBuffer(file.buffer)) {
    const uploadOptions = {
      resource_type: options.resource_type || 'auto',
      ...options,
    };
    return uploadBuffer(file.buffer, uploadOptions);
  }

  // Raw Buffer
  if (Buffer.isBuffer(file)) {
    return uploadBuffer(file, options);
  }

  // String file path
  if (typeof file === 'string') {
    return uploadFile(file, options);
  }

  // Object with path property
  if (file && file.path) {
    return uploadFile(file.path, options);
  }

  throw new Error('Invalid file provided for Cloudinary upload');
};

/**
 * Get safe client-facing Cloudinary configuration (no secrets exposed).
 */
const getClientConfig = () => {
  const ready = isCloudinaryConfigured();
  return {
    enabled: ready,
    cloudName: ready ? config.cloudinary.cloudName : (isDummy(config.cloudinary.cloudName) ? '' : config.cloudinary.cloudName),
    folder: config.cloudinary.folder || 'launchpad',
    uploadPreset: config.cloudinary.uploadPreset || '',
  };
};

module.exports = {
  uploadFile,
  uploadBuffer,
  uploadMedia,
  deleteFile,
  generateSignature,
  getClientConfig,
  isCloudinaryConfigured,
};

