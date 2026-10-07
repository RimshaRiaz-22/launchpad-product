// src/repositories/notifications.repository.js — Data access for notifications, user inboxes, and FCM tokens
'use strict';

const db = require('../database/knex');

const TABLE = 'notifications';
const USER_NOTIFS_TABLE = 'user_notifications';
const FCM_TOKENS_TABLE = 'fcm_device_tokens';

const SELECT_COLUMNS = [
  `${TABLE}.id`,
  `${TABLE}.title`,
  `${TABLE}.body`,
  `${TABLE}.type`,
  `${TABLE}.audience`,
  `${TABLE}.action_url`,
  `${TABLE}.channel`,
  `${TABLE}.status`,
  `${TABLE}.sent_by`,
  `${TABLE}.fcm_message_id`,
  `${TABLE}.metadata`,
  `${TABLE}.created_at`,
  'users.name as sent_by_name',
  'users.email as sent_by_email',
];

/**
 * List broadcast notifications with optional filtering and pagination.
 */
const list = async ({ limit = 50, offset = 0, audience = null, type = null, search = null } = {}) => {
  let query = db(TABLE)
    .leftJoin('users', `${TABLE}.sent_by`, 'users.id')
    .select(SELECT_COLUMNS)
    .orderBy(`${TABLE}.created_at`, 'desc');

  if (audience && audience !== 'all') {
    query = query.where(`${TABLE}.audience`, audience);
  }
  if (type && type !== 'all') {
    query = query.where(`${TABLE}.type`, type);
  }
  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    query = query.where(function () {
      this.whereRaw(`LOWER(${TABLE}.title) LIKE ?`, [term])
        .orWhereRaw(`LOWER(${TABLE}.body) LIKE ?`, [term])
        .orWhereRaw(`LOWER(COALESCE(${TABLE}.fcm_message_id, '')) LIKE ?`, [term]);
    });
  }

  const [countResult, rows] = await Promise.all([
    query.clone().clearSelect().clearOrder().count(`${TABLE}.id as count`).first(),
    query.limit(limit).offset(offset),
  ]);

  const total = parseInt(countResult?.count || '0', 10);
  return {
    notifications: rows,
    total,
    limit,
    offset,
  };
};

/**
 * Get a notification by ID.
 */
const getById = async (id) => {
  return await db(TABLE)
    .leftJoin('users', `${TABLE}.sent_by`, 'users.id')
    .select(SELECT_COLUMNS)
    .where(`${TABLE}.id`, id)
    .first();
};

/**
 * Insert a new broadcast notification record.
 */
const create = async (data) => {
  const [record] = await db(TABLE)
    .insert({
      title: data.title,
      body: data.body,
      type: data.type || 'info',
      audience: data.audience || 'all',
      action_url: data.action_url || null,
      channel: data.channel || 'push_and_inapp',
      status: data.status || 'sent',
      sent_by: data.sent_by || null,
      fcm_message_id: data.fcm_message_id || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    })
    .returning(['id', 'title', 'body', 'type', 'audience', 'action_url', 'channel', 'status', 'created_at']);
  return record;
};

/**
 * Distribute notification to target users' in-app inbox (user_notifications table).
 */
const linkNotificationToUsers = async ({ notificationId, audience = 'all', userIds = [] }) => {
  try {
    let targetUsers = [];
    if (Array.isArray(userIds) && userIds.length > 0) {
      targetUsers = userIds.map((id) => ({ id }));
    } else if (audience === 'all') {
      targetUsers = await db('users').select('id');
    } else if (audience === 'admin') {
      targetUsers = await db('users').whereRaw('LOWER(role) = ?', ['admin']).select('id');
    } else if (audience === 'pro' || audience === 'premium') {
      targetUsers = await db('users').whereRaw('LOWER(role) = ?', ['user']).select('id');
    } else {
      targetUsers = await db('users').select('id');
    }

    if (targetUsers.length > 0) {
      const inserts = targetUsers.map((u) => ({
        user_id: u.id,
        notification_id: notificationId,
        is_read: false,
        created_at: db.fn.now(),
      }));

      // Batch insert in chunks of 100 for safety
      const chunkSize = 100;
      for (let i = 0; i < inserts.length; i += chunkSize) {
        await db(USER_NOTIFS_TABLE).insert(inserts.slice(i, i + chunkSize));
      }
    }
  } catch (err) {
    console.error('Failed linking notification to user inboxes:', err.message);
  }
};

/**
 * Get current user's in-app inbox items with unread count.
 */
const getUserInbox = async ({ userId, limit = 20, offset = 0, unreadOnly = false }) => {
  let query = db(USER_NOTIFS_TABLE)
    .join(TABLE, `${USER_NOTIFS_TABLE}.notification_id`, `${TABLE}.id`)
    .where(`${USER_NOTIFS_TABLE}.user_id`, userId)
    .select(
      `${USER_NOTIFS_TABLE}.id as inbox_id`,
      `${USER_NOTIFS_TABLE}.is_read`,
      `${USER_NOTIFS_TABLE}.read_at`,
      `${USER_NOTIFS_TABLE}.created_at as received_at`,
      `${TABLE}.id as notification_id`,
      `${TABLE}.title`,
      `${TABLE}.body`,
      `${TABLE}.type`,
      `${TABLE}.action_url`,
      `${TABLE}.channel`,
      `${TABLE}.metadata`
    )
    .orderBy(`${USER_NOTIFS_TABLE}.created_at`, 'desc');

  if (unreadOnly) {
    query = query.where(`${USER_NOTIFS_TABLE}.is_read`, false);
  }

  const [countResult, unreadCountResult, rows] = await Promise.all([
    query.clone().clearSelect().clearOrder().count(`${USER_NOTIFS_TABLE}.id as count`).first(),
    db(USER_NOTIFS_TABLE)
      .where({ user_id: userId, is_read: false })
      .count('id as unread_count')
      .first(),
    query.limit(limit).offset(offset),
  ]);

  const total = parseInt(countResult?.count || '0', 10);
  const unreadCount = parseInt(unreadCountResult?.unread_count || '0', 10);

  return {
    notifications: rows,
    unreadCount,
    total,
    limit,
    offset,
  };
};

/**
 * Mark a single in-app notification as read.
 */
const markAsRead = async ({ userId, userNotificationId }) => {
  const updated = await db(USER_NOTIFS_TABLE)
    .where({ user_id: userId })
    .andWhere(function () {
      this.where('id', userNotificationId).orWhere('notification_id', userNotificationId);
    })
    .update({
      is_read: true,
      read_at: db.fn.now(),
    })
    .returning(['id', 'is_read', 'read_at']);

  return updated[0] || null;
};

/**
 * Mark all notifications as read for a user.
 */
const markAllAsRead = async ({ userId }) => {
  const count = await db(USER_NOTIFS_TABLE)
    .where({ user_id: userId, is_read: false })
    .update({
      is_read: true,
      read_at: db.fn.now(),
    });

  return { markedCount: count };
};

/**
 * Upsert FCM device token for push notification targeting.
 */
const registerDeviceToken = async ({ userId, token, deviceType = 'web' }) => {
  const existing = await db(FCM_TOKENS_TABLE).where({ token }).first();

  if (existing) {
    const [updated] = await db(FCM_TOKENS_TABLE)
      .where({ id: existing.id })
      .update({
        user_id: userId,
        device_type: deviceType,
        last_used_at: db.fn.now(),
      })
      .returning(['id', 'user_id', 'token', 'device_type', 'last_used_at']);
    return updated;
  }

  const [created] = await db(FCM_TOKENS_TABLE)
    .insert({
      user_id: userId,
      token,
      device_type: deviceType,
      last_used_at: db.fn.now(),
      created_at: db.fn.now(),
    })
    .returning(['id', 'user_id', 'token', 'device_type', 'last_used_at']);

  return created;
};

/**
 * Get device tokens for push notifications dispatch.
 */
const getDeviceTokens = async ({ audience = 'all', userIds = [] } = {}) => {
  let query = db(FCM_TOKENS_TABLE)
    .join('users', `${FCM_TOKENS_TABLE}.user_id`, 'users.id')
    .select(
      `${FCM_TOKENS_TABLE}.token`,
      `${FCM_TOKENS_TABLE}.device_type`,
      `${FCM_TOKENS_TABLE}.user_id`,
      'users.role'
    );

  if (Array.isArray(userIds) && userIds.length > 0) {
    query = query.whereIn(`${FCM_TOKENS_TABLE}.user_id`, userIds);
  } else if (audience === 'admin') {
    query = query.whereRaw('LOWER(users.role) = ?', ['admin']);
  }

  return await query;
};

/**
 * Get device stats for admin dashboard telemetry.
 */
const getDeviceStats = async () => {
  const [totalRes, webRes, iosRes, androidRes, recentTokens] = await Promise.all([
    db(FCM_TOKENS_TABLE).count('id as count').first(),
    db(FCM_TOKENS_TABLE).where({ device_type: 'web' }).count('id as count').first(),
    db(FCM_TOKENS_TABLE).where({ device_type: 'ios' }).count('id as count').first(),
    db(FCM_TOKENS_TABLE).where({ device_type: 'android' }).count('id as count').first(),
    db(FCM_TOKENS_TABLE)
      .join('users', `${FCM_TOKENS_TABLE}.user_id`, 'users.id')
      .select(
        `${FCM_TOKENS_TABLE}.id`,
        `${FCM_TOKENS_TABLE}.device_type`,
        `${FCM_TOKENS_TABLE}.last_used_at`,
        `${FCM_TOKENS_TABLE}.created_at`,
        'users.name as user_name',
        'users.email as user_email'
      )
      .orderBy(`${FCM_TOKENS_TABLE}.last_used_at`, 'desc')
      .limit(10),
  ]);

  return {
    totalDevices: parseInt(totalRes?.count || '0', 10),
    webDevices: parseInt(webRes?.count || '0', 10),
    iosDevices: parseInt(iosRes?.count || '0', 10),
    androidDevices: parseInt(androidRes?.count || '0', 10),
    recentTokens,
  };
};

/**
 * Delete one or more device tokens (e.g. when FCM reports token unregistered/expired).
 */
const deleteDeviceTokens = async (tokens = []) => {
  if (!Array.isArray(tokens) || tokens.length === 0) return 0;
  return await db(FCM_TOKENS_TABLE).whereIn('token', tokens).del();
};

/**
 * Delete a notification by ID.
 */
const deleteById = async (id) => {
  return await db(TABLE).where({ id }).del();
};

module.exports = {
  list,
  getById,
  create,
  deleteById,
  linkNotificationToUsers,
  getUserInbox,
  markAsRead,
  markAllAsRead,
  registerDeviceToken,
  getDeviceTokens,
  getDeviceStats,
  deleteDeviceTokens,
};

