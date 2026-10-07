// src/utils/memoryCache.js — High-performance in-memory TTL cache
'use strict';

/**
 * Lightweight, thread-safe (single-process) in-memory cache with TTL.
 * Avoids repeated cross-continental DB queries for static/semi-static data.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Retrieve cached value if present and not expired.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Store a value with a time-to-live in seconds.
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds Default: 300 seconds (5 minutes)
   */
  set(key, value, ttlSeconds = 300) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a specific cache key.
   * @param {string} key
   */
  del(key) {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix (e.g. 'settings:', 'categories:').
   * @param {string} prefix
   */
  delPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Helper: wrap an async function call.
   * Returns cached value if available; otherwise executes fn, stores result, and returns.
   * @param {string} key
   * @param {number} ttlSeconds
   * @param {Function} fetchFn
   * @returns {Promise<any>}
   */
  async wrap(key, ttlSeconds, fetchFn) {
    const cached = this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const fresh = await fetchFn();
    if (fresh !== undefined) {
      this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  /**
   * Clear all entries.
   */
  clear() {
    this.store.clear();
  }
}

// Export singleton instance
module.exports = new MemoryCache();
