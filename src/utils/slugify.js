// src/utils/slugify.js — Convert a string to a URL-safe slug
'use strict';

/**
 * Converts a display name into a lowercase, hyphen-separated URL slug.
 * e.g. "Phone – Notch" → "phone-notch"
 * @param {string} str
 * @returns {string}
 */
const slugify = (str) =>
  String(str)
    .toLowerCase()
    .normalize('NFD')                    // decompose accents
    .replace(/[\u0300-\u036f]/g, '')     // strip combining marks
    .replace(/[^a-z0-9]+/g, '-')        // replace non-alphanumeric runs with dash
    .replace(/^-+|-+$/g, '');           // trim leading/trailing dashes

module.exports = slugify;
