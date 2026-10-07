// src/repositories/templates.repository.js — Data access for templates table
"use strict";

const db = require("../database/knex");
const { applyDateRange, applySearch, normalizePaginationAndSort } = require("../utils/filterHelper");

const TABLE = "templates";

const mapProjectToTemplate = (project) => {
  let canvasData = project.canvas_data;
  if (typeof canvasData === "string") {
    try {
      canvasData = JSON.parse(canvasData);
    } catch {
      canvasData = {};
    }
  }
  if (!canvasData || typeof canvasData !== "object") {
    canvasData = {};
  }

  return {
    id: project.id,
    creator_id: project.user_id,
    name: project.name || "Untitled Project",
    description: project.description || "",
    category: "User Designs",
    canvas_data: canvasData,
    thumbnail_url: project.thumbnail_url || null,
    is_public: false,
    is_premium: false,
    is_featured: false,
    use_count: 0,
    tags: [],
    source: "user",
    promoted_at: null,
    created_at: project.created_at,
    updated_at: project.updated_at,
  };
};

const findById = async (id) => {
  const decoded = decodeURIComponent(String(id || "").trim());
  const slugHyphen = decoded.replace(/[\s_]+/g, "-").toLowerCase();
  const slugUnderscore = decoded.replace(/[\s-]+/g, "_").toLowerCase();
  const slugSpace = decoded.replace(/[-_]+/g, " ").toLowerCase();
  return db(TABLE)
    .where(function () {
      this.where({ id })
        .orWhere({ id: decoded })
        .orWhere({ id: slugHyphen })
        .orWhere({ id: slugUnderscore })
        .orWhereRaw("LOWER(name) = LOWER(?)", [decoded])
        .orWhereRaw("LOWER(name) = LOWER(?)", [slugSpace]);
    })
    .first();
};

/** Admin-only: findById without is_public restriction */
const findByIdAdmin = async (id) => {
  const decoded = decodeURIComponent(String(id || "").trim());
  const slugHyphen = decoded.replace(/[\s_]+/g, "-").toLowerCase();
  const slugUnderscore = decoded.replace(/[\s-]+/g, "_").toLowerCase();
  const slugSpace = decoded.replace(/[-_]+/g, " ").toLowerCase();
  const template = await db(TABLE)
    .where(function () {
      this.where({ id })
        .orWhere({ id: decoded })
        .orWhere({ id: slugHyphen })
        .orWhere({ id: slugUnderscore })
        .orWhereRaw("LOWER(name) = LOWER(?)", [decoded])
        .orWhereRaw("LOWER(name) = LOWER(?)", [slugSpace]);
    })
    .first();

  if (template) return template;

  // Fallback to user saved projects
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const project = await db("projects")
    .where(function () {
      if (isUuid.test(id)) this.where({ id });
      else if (isUuid.test(decoded)) this.where({ id: decoded });
      else this.whereRaw("1 = 0");
      this.orWhereRaw("LOWER(name) = LOWER(?)", [decoded]);
    })
    .first();

  return project ? mapProjectToTemplate(project) : null;
};

const create = async (data) => {
  const [template] = await db(TABLE).insert(data).returning("*");
  return template;
};

const update = async (id, data) => {
  const existing = await db(TABLE).where({ id }).first();
  if (existing) {
    const [template] = await db(TABLE)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");
    return template;
  }
  const project = await db("projects").where({ id }).first();
  if (project) {
    const projectUpdates = {};
    if (data.name) projectUpdates.name = data.name;
    if (data.description !== undefined) projectUpdates.description = data.description;
    if (data.canvas_data) projectUpdates.canvas_data = data.canvas_data;
    if (data.thumbnail_url !== undefined) projectUpdates.thumbnail_url = data.thumbnail_url;
    projectUpdates.updated_at = db.fn.now();

    const [updatedProj] = await db("projects")
      .where({ id })
      .update(projectUpdates)
      .returning("*");
    return mapProjectToTemplate(updatedProj);
  }
  return null;
};

const remove = async (id) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const count = await db(TABLE).where({ id }).delete();
  if (!count && isUuid.test(id)) {
    await db("projects").where({ id }).delete();
  }
  return true;
};

const bulkRemove = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const count = await db(TABLE).whereIn("id", ids).delete();
  const uuidIds = ids.filter((id) => isUuid.test(id));
  if (uuidIds.length > 0) {
    await db("projects").whereIn("id", uuidIds).delete();
  }
  return count;
};

/** Promote user-created template or saved project to global admin template */
const promoteToGlobal = async (id) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const existing = await db(TABLE).where({ id }).first();
  if (existing) {
    const [template] = await db(TABLE)
      .where({ id })
      .update({ source: "admin", is_public: true, promoted_at: db.fn.now(), updated_at: db.fn.now() })
      .returning("*");
    return template;
  }

  // Check user saved projects
  if (isUuid.test(id)) {
    const project = await db("projects").where({ id }).first();
    if (project) {
      let canvasData = project.canvas_data;
      if (typeof canvasData === "string") {
        try { canvasData = JSON.parse(canvasData); } catch {}
      }
      let defaultCategory = "Productivity";
      try {
        const firstCat = await db("template_categories").where("is_active", true).orderBy("sort_order", "asc").first();
        if (firstCat?.name) defaultCategory = firstCat.name;
      } catch {}

      const [newTemplate] = await db(TABLE)
        .insert({
          id: project.id,
          creator_id: project.user_id,
          name: project.name,
          description: project.description || "",
          category: defaultCategory,
          canvas_data: JSON.stringify(canvasData || {}),
          thumbnail_url: project.thumbnail_url || null,
          is_public: true,
          is_premium: false,
          source: "admin",
          promoted_at: db.fn.now(),
          created_at: project.created_at,
          updated_at: db.fn.now(),
        })
        .onConflict("id")
        .merge()
        .returning("*");
      return newTemplate;
    }
  }

  return null;
};

/** Move template to a different category */
const moveCategory = async (id, category) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const existing = await db(TABLE).where({ id }).first();
  if (existing) {
    const [template] = await db(TABLE)
      .where({ id })
      .update({ category, updated_at: db.fn.now() })
      .returning("*");
    return template;
  }

  // Check user saved projects
  if (isUuid.test(id)) {
    const project = await db("projects").where({ id }).first();
    if (project) {
      let canvasData = project.canvas_data;
      if (typeof canvasData === "string") {
      try { canvasData = JSON.parse(canvasData); } catch {}
    }
    const [template] = await db(TABLE)
      .insert({
        id: project.id,
        creator_id: project.user_id,
        name: project.name,
        description: project.description || "",
        category,
        canvas_data: JSON.stringify(canvasData || {}),
        thumbnail_url: project.thumbnail_url || null,
        is_public: true,
        source: "admin",
        promoted_at: db.fn.now(),
        created_at: project.created_at,
        updated_at: db.fn.now(),
      })
      .onConflict("id")
      .merge()
      .returning("*");
    return template;
    }
  }

  return null;
};

/**
 * Filtered list of templates.
 * Supports: startDate, endDate, category, is_public, is_premium, source, is_featured, search, tag, sorting, pagination.
 * Admin mode: includes user-created saved projects when source='user' or source='all'.
 */
const findMany = async (filters = {}, adminMode = false) => {
  const allowedSortFields = ["created_at", "updated_at", "use_count", "name", "category"];
  const { page, limit, offset, sortBy, sortOrder } = normalizePaginationAndSort(
    filters,
    allowedSortFields,
    "use_count",
    "desc"
  );

  const query = db(TABLE);

  if (filters.category && filters.category !== "All Categories") {
    query.where("category", filters.category);
  }
  if (!adminMode && filters.is_public !== undefined) query.where("is_public", filters.is_public);
  if (filters.is_public !== undefined && adminMode) query.where("is_public", filters.is_public);
  if (filters.is_premium !== undefined) query.where("is_premium", filters.is_premium);
  if (filters.is_featured !== undefined) query.where("is_featured", filters.is_featured);
  if (filters.source && filters.source !== "all") {
    if (filters.source === "admin") {
      query.where(function() {
        this.where("source", "admin").orWhereNull("source");
      });
    } else if (filters.source === "user") {
      query.where("source", "user");
    }
  }

  // Date range filters
  const startDate = filters.startDate || filters.start_date;
  const endDate = filters.endDate || filters.end_date;
  applyDateRange(query, "created_at", startDate, endDate);

  // Search filter across name and description
  const search = filters.search || filters.q;
  applySearch(query, ["name", "description", "category"], search);

  // Tag filter
  if (filters.tag) {
    query.whereRaw("? = ANY(tags)", [filters.tag]);
  }

  // Screen count filter (stored in canvas_data->screens array length)
  if (filters.min_screens) {
    query.whereRaw("jsonb_array_length(canvas_data->'screens') >= ?", [Number(filters.min_screens)]);
  }
  if (filters.max_screens) {
    query.whereRaw("jsonb_array_length(canvas_data->'screens') <= ?", [Number(filters.max_screens)]);
  }

  const TEMPLATE_LIST_COLUMNS = [
    "id",
    "creator_id",
    "name",
    "description",
    "category",
    "thumbnail_url",
    "is_public",
    "is_premium",
    "is_featured",
    "source",
    "promoted_at",
    "width",
    "height",
    "tags",
    "use_count",
    "created_at",
    "updated_at",
  ];

  let [countResult, templateData] = await Promise.all([
    query.clone().clearSelect().count("id as count").first(),
    query
      .clone()
      .select(filters.include_canvas ? "*" : TEMPLATE_LIST_COLUMNS)
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset),
  ]);

  let data = [...templateData];

  // In admin mode, include user saved projects when source is 'user' or 'all'
  if (adminMode && (!filters.source || filters.source === "user" || filters.source === "all")) {
    const shouldFetchProjects =
      !filters.category ||
      filters.category === "All Categories" ||
      filters.category === "User Designs";

    if (shouldFetchProjects) {
      const projectsQuery = db("projects");
      if (search) {
        applySearch(projectsQuery, ["name", "description"], search);
      }
      applyDateRange(projectsQuery, "created_at", startDate, endDate);
      const userProjects = await projectsQuery
        .select([
          "id",
          "user_id",
          "name",
          "description",
          "thumbnail_url",
          "width",
          "height",
          "is_public",
          "status",
          "tags",
          "created_at",
          "updated_at",
        ])
        .orderBy("created_at", "desc")
        .limit(50);
      const mappedProjects = userProjects.map(mapProjectToTemplate);

      // Exclude projects that have already been promoted into templates
      const existingIds = new Set(data.map((t) => t.id));
      const newProjects = mappedProjects.filter((p) => !existingIds.has(p.id));

      if (filters.source === "user") {
        data = [...data.filter((t) => t.source === "user"), ...newProjects];
      } else {
        data = [...data, ...newProjects];
      }
    } else if (filters.source === "user") {
      data = data.filter((t) => t.source === "user");
    }
  }

  const total = data.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

const incrementUseCount = async (id) => {
  const template = (await findByIdAdmin(id)) || (await findById(id));
  if (template) {
    const existsInTemplates = await db(TABLE).where({ id: template.id }).first();
    if (existsInTemplates) {
      await db(TABLE).where({ id: template.id }).increment("use_count", 1);
      const updated = await db(TABLE).select("use_count").where({ id: template.id }).first();
      return updated ? Number(updated.use_count) : (template.use_count || 0) + 1;
    }
  }
  return 0;
};

const getCategories = async () => {
  const rows = await db(TABLE)
    .distinct("category")
    .whereNotNull("category")
    .where({ is_public: true })
    .orderBy("category", "asc");
  return rows.map((r) => r.category);
};

module.exports = {
  findById,
  findByIdAdmin,
  create,
  update,
  remove,
  bulkRemove,
  findMany,
  incrementUseCount,
  getCategories,
  promoteToGlobal,
  moveCategory,
};
