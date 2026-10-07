// src/repositories/users.repository.js — Data access for users table
"use strict";

const db = require("../database/knex");
const {
  applyDateRange,
  applySearch,
  normalizePaginationAndSort,
} = require("../utils/filterHelper");

const TABLE = "users";

// Columns to select by default (exclude password_hash)
const PUBLIC_COLUMNS = [
  "users.id",
  "users.email",
  "users.name",
  "users.avatar_url",
  "users.role_id",
  "users.subscription_plan_id",
  db.raw("LOWER(COALESCE(roles.name, users.role, 'user')) as role"),
  db.raw("COALESCE(roles.name, users.role, 'user') as role_name"),
  "users.plan",
  "subscription_plans.name as plan_name",
  "users.is_verified",
  "users.is_active",
  "users.last_login_at",
  "users.created_at",
  "users.updated_at",
];

/**
 * Resolve a role record from the database.
 * Supports:
 * - { role_id } (UUID)
 * - { role } ('admin', 'ADMIN', 'user', 'USER', etc.)
 *
 * Matching Strategy:
 * 1. If role_id provided, look up by id.
 * 2. If role provided, try exact match on name first (supports distinct 'ADMIN' / 'admin' if both exist).
 * 3. Fallback to case-insensitive match LOWER(name) = LOWER(role) (so 'admin' matches 'ADMIN' and vice versa).
 *
 * @param {{ role?: string, role_id?: string }} criteria
 * @returns {Promise<object|null>}
 */
const resolveRole = async ({ role, role_id } = {}) => {
  if (role_id) {
    const byId = await db("roles").where({ id: role_id }).first();
    if (byId) return byId;
  }
  if (role) {
    const clean = String(role).trim();
    if (clean) {
      // 1. Exact match first
      const exact = await db("roles").where({ name: clean }).first();
      if (exact) return exact;

      // 2. Case-insensitive match
      const caseInsensitive = await db("roles")
        .whereRaw("LOWER(name) = ?", [clean.toLowerCase()])
        .first();
      if (caseInsensitive) return caseInsensitive;
    }
  }
  return null;
};

/**
 * Find a user by their primary key.
 * @param {string} id - UUID
 * @returns {Promise<object|undefined>}
 */
const findById = async (id) => {
  return db(TABLE)
    .leftJoin("roles", "roles.id", `${TABLE}.role_id`)
    .leftJoin(
      "subscription_plans",
      "subscription_plans.id",
      `${TABLE}.subscription_plan_id`,
    )
    .where(`${TABLE}.id`, id)
    .select(PUBLIC_COLUMNS)
    .first();
};

/**
 * Find a user by email (includes password_hash for auth).
 * @param {string} email
 * @returns {Promise<object|undefined>}
 */
const findByEmail = async (email) => {
  return db(TABLE)
    .leftJoin("roles", "roles.id", `${TABLE}.role_id`)
    .leftJoin(
      "subscription_plans",
      "subscription_plans.id",
      `${TABLE}.subscription_plan_id`,
    )
    .where(`${TABLE}.email`, email.toLowerCase())
    .select(
      `${TABLE}.*`,
      "roles.name as role_name",
      "subscription_plans.name as plan_name",
      db.raw("LOWER(COALESCE(roles.name, users.role, 'user')) as role"),
    )
    .first();
};

/**
 * Find a user by their verification token.
 */
const findByVerificationToken = async (token) => {
  return db(TABLE).where({ verification_token: token }).first();
};

/**
 * Find a user by password reset token.
 */
const findByResetToken = async (token) => {
  return db(TABLE)
    .where({ password_reset_token: token })
    .where("password_reset_expires", ">", new Date())
    .first();
};

/**
 * Create a new user record.
 * @param {object} data
 * @returns {Promise<object>} Created user (public columns)
 */
const create = async (data) => {
  const payload = {
    ...data,
    email: data.email.toLowerCase(),
  };

  const roleRecord = await resolveRole({
    role: payload.role,
    role_id: payload.role_id,
  });
  if (roleRecord) {
    payload.role_id = roleRecord.id;
    payload.role = roleRecord.name.toLowerCase();
  } else if (!payload.role_id) {
    const defaultRole = await resolveRole({ role: "user" });
    if (defaultRole) {
      payload.role_id = defaultRole.id;
      payload.role = defaultRole.name.toLowerCase();
    } else {
      payload.role = (payload.role || "user").toLowerCase();
    }
  }

  if (payload.plan && !payload.subscription_plan_id) {
    payload.subscription_plan_id = payload.plan;
  }

  const [inserted] = await db(TABLE).insert(payload).returning(["id"]);

  return findById(inserted.id);
};

/**
 * Update a user by ID.
 * @param {string} id
 * @param {object} data - Partial update fields
 * @returns {Promise<object>} Updated user (public columns)
 */
const update = async (id, data) => {
  const payload = { ...data };

  if (payload.role !== undefined || payload.role_id !== undefined) {
    const roleRecord = await resolveRole({
      role: payload.role,
      role_id: payload.role_id,
    });
    if (roleRecord) {
      payload.role_id = roleRecord.id;
      payload.role = roleRecord.name.toLowerCase();
    } else if (payload.role) {
      payload.role = String(payload.role).toLowerCase();
    }
  }

  if (payload.plan) {
    payload.subscription_plan_id = payload.plan;
  }

  await db(TABLE)
    .where({ id })
    .update({ ...payload, updated_at: db.fn.now() });

  return findById(id);
};

/**
 * Soft-delete a user (set is_active = false).
 * @param {string} id
 */
const deactivate = async (id) => {
  return db(TABLE)
    .where({ id })
    .update({ is_active: false, updated_at: db.fn.now() });
};

/**
 * Set password reset token and expiration for a user.
 */
const setPasswordResetToken = async (userId, token, expiresAt) => {
  return db(TABLE).where({ id: userId }).update({
    password_reset_token: token,
    password_reset_expires: expiresAt,
    updated_at: db.fn.now(),
  });
};

/**
 * Clear reset token and update password hash.
 */
const resetPasswordWithToken = async (userId, passwordHash) => {
  return db(TABLE).where({ id: userId }).update({
    password_hash: passwordHash,
    password_reset_token: null,
    password_reset_expires: null,
    updated_at: db.fn.now(),
  });
};

/**
 * Update verification token for a user.
 */
const setVerificationToken = async (userId, token) => {
  return db(TABLE).where({ id: userId }).update({
    verification_token: token,
    updated_at: db.fn.now(),
  });
};

/**
 * Mark a user as email verified and clear verification token.
 */
const markEmailVerified = async (userId) => {
  await db(TABLE).where({ id: userId }).update({
    is_verified: true,
    verification_token: null,
    updated_at: db.fn.now(),
  });
  return findById(userId);
};

/**
 * Paginated and filtered list of users.
 * Supports: startDate, endDate (registration), lastLoginStartDate, lastLoginEndDate,
 * dateRange, role, role_id, plan, is_active, status, is_verified, search, dynamic sorting, pagination.
 */
const findMany = async (filters = {}) => {
  const allowedSortFields = [
    "created_at",
    "updated_at",
    "last_login_at",
    "name",
    "email",
    "role",
    "plan",
    "projects_count",
    "storage_used_mb",
  ];
  const { page, limit, offset, sortBy, sortOrder } = normalizePaginationAndSort(
    filters,
    allowedSortFields,
    "created_at",
    "desc",
  );

  const query = db(TABLE)
    .leftJoin("roles", "roles.id", `${TABLE}.role_id`)
    .leftJoin(
      "subscription_plans",
      "subscription_plans.id",
      `${TABLE}.subscription_plan_id`,
    )
    .select([
      ...PUBLIC_COLUMNS,
      db.raw(
        "(SELECT COUNT(*)::int FROM projects WHERE projects.user_id = users.id) as projects_count",
      ),
      db.raw(
        "(SELECT COALESCE(ROUND(SUM(file_size) / 1048576.0, 2), 0) FROM assets WHERE assets.user_id = users.id) as storage_used_mb",
      ),
      db.raw(
        "CASE WHEN users.is_active = TRUE THEN 'active' ELSE 'suspended' END as status",
      ),
      db.raw(
        "CASE WHEN LOWER(COALESCE(roles.name, users.role)) = 'admin' AND users.email = 'owner@launchpad.dev' THEN TRUE ELSE FALSE END as is_owner",
      ),
    ]);

  if (filters.role_id && filters.role_id !== "all") {
    query.where(`${TABLE}.role_id`, filters.role_id);
  }
  if (filters.role && filters.role !== "all") {
    const cleanRole = String(filters.role).trim().toLowerCase();
    query.where((builder) => {
      builder
        .whereRaw(`LOWER(${TABLE}.role) = ?`, [cleanRole])
        .orWhereRaw(`LOWER(roles.name) = ?`, [cleanRole]);
    });
  }
  if (filters.plan && filters.plan !== "all")
    query.where(`${TABLE}.plan`, filters.plan);

  // Status filtering (accepts is_active boolean or status string 'active'/'suspended')
  if (filters.status && filters.status !== "all") {
    if (filters.status === "active") query.where(`${TABLE}.is_active`, true);
    if (filters.status === "suspended")
      query.where(`${TABLE}.is_active`, false);
  } else if (filters.is_active !== undefined) {
    query.where(`${TABLE}.is_active`, filters.is_active);
  }

  if (filters.is_verified !== undefined && filters.is_verified !== "all") {
    const isVer =
      filters.is_verified === true || filters.is_verified === "true";
    query.where(`${TABLE}.is_verified`, isVer);
  }

  // Preset Date Range shortcuts (7d, 30d, 90d, 12m)
  const range = filters.dateRange || filters.date_range;
  if (range && range !== "all") {
    const intervals = {
      "7d": "7 days",
      "30d": "30 days",
      "90d": "90 days",
      "12m": "12 months",
      "1y": "1 year",
    };
    if (intervals[range]) {
      query.whereRaw(
        `${TABLE}.created_at >= NOW() - INTERVAL '${intervals[range]}'`,
      );
    }
  } else {
    // Explicit Registration date range
    const startDate = filters.startDate || filters.start_date;
    const endDate = filters.endDate || filters.end_date;
    applyDateRange(query, `${TABLE}.created_at`, startDate, endDate);
  }

  // Last login date range
  const lastLoginStartDate =
    filters.lastLoginStartDate || filters.last_login_start_date;
  const lastLoginEndDate =
    filters.lastLoginEndDate || filters.last_login_end_date;
  applyDateRange(
    query,
    `${TABLE}.last_login_at`,
    lastLoginStartDate,
    lastLoginEndDate,
  );

  // Search across name, email, and user UUID
  const search = filters.search || filters.q;
  if (search && search.trim()) {
    const s = search.trim();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        s,
      );
    query.where((builder) => {
      builder
        .whereRaw(`LOWER(${TABLE}.name) LIKE ?`, [`%${s.toLowerCase()}%`])
        .orWhereRaw(`LOWER(${TABLE}.email) LIKE ?`, [`%${s.toLowerCase()}%`]);
      if (isUuid) {
        builder.orWhere(`${TABLE}.id`, s);
      }
    });
  }

  const countQuery = query
    .clone()
    .clearSelect()
    .clearOrder()
    .count(`${TABLE}.id as count`)
    .first();

  // Handle ordering by subquery alias or direct column
  const orderExpr =
    sortBy === "projects_count" || sortBy === "storage_used_mb"
      ? sortBy
      : `${TABLE}.${sortBy}`;

  const [{ count }, data] = await Promise.all([
    countQuery,
    query.limit(limit).offset(offset).orderBy(orderExpr, sortOrder),
  ]);

  const total = parseInt(count || 0, 10);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Set user active status (activate / suspend).
 * @param {string} id
 * @param {boolean} isActive
 */
const setStatus = async (id, isActive) => {
  await db(TABLE)
    .where({ id })
    .update({ is_active: isActive, updated_at: db.fn.now() });
  return findById(id);
};

/**
 * Permanently delete user record and cascade cleanup.
 * @param {string} id
 */
const deletePermanently = async (id) => {
  return db(TABLE).where({ id }).del();
};

/**
 * Get comprehensive summary telemetry across all platform creators.
 */
const getSummaryStats = async () => {
  const counts = await db(TABLE)
    .leftJoin("roles", "roles.id", `${TABLE}.role_id`)
    .select(
      db.raw("COUNT(*)::int as total_users"),
      db.raw(
        "COUNT(*) FILTER (WHERE users.is_active = TRUE)::int as active_users",
      ),
      db.raw(
        "COUNT(*) FILTER (WHERE users.is_active = FALSE)::int as suspended_users",
      ),
      db.raw(
        "COUNT(*) FILTER (WHERE users.is_verified = TRUE)::int as verified_users",
      ),
      db.raw("COUNT(*) FILTER (WHERE users.plan = 'free')::int as free_users"),
      db.raw("COUNT(*) FILTER (WHERE users.plan = 'pro')::int as pro_users"),
      db.raw("COUNT(*) FILTER (WHERE users.plan = 'team')::int as team_users"),
      db.raw(
        "COUNT(*) FILTER (WHERE users.plan = 'enterprise')::int as enterprise_users",
      ),
      db.raw(
        "COUNT(*) FILTER (WHERE LOWER(COALESCE(roles.name, users.role)) = 'admin')::int as admin_users",
      ),
      db.raw(
        "COUNT(*) FILTER (WHERE LOWER(COALESCE(roles.name, users.role)) = 'user')::int as standard_users",
      ),
    )
    .first()
    .catch(() => ({}));

  let totalProjects = 0;
  let creatorsWithProjects = 0;
  try {
    const pAgg = await db("projects").count("id as total").first();
    totalProjects = Number(pAgg?.total || 0);
    const cpAgg = await db("projects").countDistinct("user_id as total").first();
    creatorsWithProjects = Number(cpAgg?.total || 0);
  } catch (_e) {
    // fallback if table does not exist
  }

  let totalBytes = 0;
  try {
    const aAgg = await db("assets").sum("file_size as total").first();
    totalBytes = Number(aAgg?.total || 0);
  } catch (_e) {
    // fallback if table does not exist
  }

  const totalStorageMb = Number((totalBytes / (1024 * 1024)).toFixed(2));
  const totalStorageGb = Number((totalBytes / (1024 * 1024 * 1024)).toFixed(2));

  const totalUsers = Number(counts?.total_users || 0);
  const activeUsers = Number(counts?.active_users || 0);
  const suspendedUsers = Number(counts?.suspended_users || 0);
  const verifiedUsers = Number(counts?.verified_users || 0);
  const freeUsers = Number(counts?.free_users || 0);
  const proUsers = Number(counts?.pro_users || 0);
  const teamUsers = Number(counts?.team_users || 0);
  const enterpriseUsers = Number(counts?.enterprise_users || 0);
  const paidUsers = proUsers + teamUsers + enterpriseUsers;
  const adminUsers = Number(counts?.admin_users || 0);
  const standardUsers = Number(counts?.standard_users || 0);

  return {
    // Snake_case keys for direct frontend KPI usage
    total_users: totalUsers,
    active_users: activeUsers,
    suspended_users: suspendedUsers,
    verified_users: verifiedUsers,
    free_users: freeUsers,
    paid_users: paidUsers,
    total_projects: totalProjects,
    creators_with_projects: creatorsWithProjects,
    total_storage_mb: totalStorageMb,
    total_storage_gb: totalStorageGb,

    // CamelCase / structured keys for backward-compatibility
    total: totalUsers,
    active: activeUsers,
    suspended: suspendedUsers,
    verified: verifiedUsers,
    creatorsWithProjects,
    plans: {
      free: freeUsers,
      pro: proUsers,
      team: teamUsers,
      enterprise: enterpriseUsers,
    },
    roles: {
      admin: adminUsers,
      user: standardUsers,
    },
    totalProjects,
    totalStorageGb,
  };
};

/**
 * Check if an email is already registered.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const emailExists = async (email) => {
  const row = await db(TABLE)
    .where({ email: email.toLowerCase() })
    .select("id")
    .first();
  return Boolean(row);
};

module.exports = {
  findById,
  findByEmail,
  findByVerificationToken,
  findByResetToken,
  create,
  update,
  deactivate,
  setStatus,
  deletePermanently,
  getSummaryStats,
  setPasswordResetToken,
  resetPasswordWithToken,
  setVerificationToken,
  markEmailVerified,
  findMany,
  emailExists,
  resolveRole,
};
