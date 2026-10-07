// src/database/seeds/001_seed.js — Development seed data
'use strict';

const { hashPassword } = require('../../utils/hash.utils');

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async (knex) => {
  // ── Clear tables in dependency order ──────────────────────
  await knex('audit_logs').del();
  await knex('subscriptions').del();
  await knex('assets').where({ is_builtin: false }).del();
  await knex('projects').del();
  await knex('templates').del();
  await knex('refresh_tokens').del();
  await knex('users').del();

  // ── Ensure System Roles ─────────────────────────────────
  let adminRole = await knex('roles').whereRaw('LOWER(name) = ?', ['admin']).first();
  if (!adminRole) {
    const [inserted] = await knex('roles').insert({ name: 'admin', description: 'Administrator' }).returning('*');
    adminRole = inserted;
  }
  let userRole = await knex('roles').whereRaw('LOWER(name) = ?', ['user']).first();
  if (!userRole) {
    const [inserted] = await knex('roles').insert({ name: 'user', description: 'Standard User' }).returning('*');
    userRole = inserted;
  }

  // ── Seed Users ─────────────────────────────────────────────
  const passwordHash = await hashPassword('Password123!');

  const [adminUser] = await knex('users')
    .insert({
      email: 'admin@launchpad.dev',
      password_hash: passwordHash,
      name: 'Admin User',
      role: 'admin',
      role_id: adminRole?.id || null,
      plan: 'enterprise',
      subscription_plan_id: 'enterprise',
      is_verified: true,
      is_active: true,
    })
    .returning('*');

  const [demoUser] = await knex('users')
    .insert({
      email: 'demo@launchpad.dev',
      password_hash: passwordHash,
      name: 'Demo User',
      role: 'user',
      role_id: userRole?.id || null,
      plan: 'pro',
      subscription_plan_id: 'pro',
      is_verified: true,
      is_active: true,
    })
    .returning('*');

  // ── Seed Stock Assets from Unsplash ─────────────────────────
  const stockAssets = [
    {
      user_id: demoUser.id,
      name: 'Modern Fitness & Athletic Motivation',
      type: 'image',
      file_path: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
      file_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
      file_size: 245000,
      mime_type: 'image/jpeg',
      width: 1200,
      height: 800,
      metadata: JSON.stringify({ source: 'unsplash', category: 'fitness' }),
    },
    {
      user_id: demoUser.id,
      name: 'Urban Architecture & Glass Façade',
      type: 'image',
      file_path: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      file_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      file_size: 312000,
      mime_type: 'image/jpeg',
      width: 1200,
      height: 800,
      metadata: JSON.stringify({ source: 'unsplash', category: 'architecture' }),
    },
    {
      user_id: demoUser.id,
      name: 'Dynamic Team Collaboration & Studio',
      type: 'image',
      file_path: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      file_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      file_size: 280000,
      mime_type: 'image/jpeg',
      width: 1200,
      height: 800,
      metadata: JSON.stringify({ source: 'unsplash', category: 'team' }),
    },
  ];
  await knex('assets').insert(stockAssets);

  // ── Seed a Demo Project ────────────────────────────────────
  await knex('projects').insert({
    user_id: demoUser.id,
    name: 'My First Design',
    description: 'A sample project created during onboarding',
    canvas_data: JSON.stringify({ version: '5.3.0', objects: [], background: '#ffffff' }),
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    width: 1920,
    height: 1080,
    status: 'draft',
    is_public: false,
  });

  // ── Seed Subscriptions ─────────────────────────────────────
  await knex('subscriptions').insert([
    {
      user_id: adminUser.id,
      plan: 'enterprise',
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      user_id: demoUser.id,
      plan: 'pro',
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ]);

  // ── Ensure Store Badges, Modern Vector Icons, Precision Shapes, Stickers, Images & Google Fonts ──
  try {
    const { seed: seedBadges } = require('./seed_store_badges');
    await seedBadges();
    const { seed: seedIcons } = require('./seed_icons');
    await seedIcons();
    const { seed: seedShapes } = require('./seed_shapes');
    await seedShapes();
    const { seed: seedStickers } = require('./seed_stickers');
    await seedStickers();
    const { seed: seedImages } = require('./seed_images');
    await seedImages();
    const { seed: seedFonts } = require('./seed_fonts');
    await seedFonts();
    const { seedMockups } = require('./seed_mockups');
    await seedMockups(knex);
  } catch (err) {
    console.warn('Notice seeding badges/icons/shapes/stickers/images/fonts/mockups in 001_seed:', err.message);
  }

  console.log('✅  Seed data inserted successfully');
  console.log('   Admin: admin@launchpad.dev / Password123!');
  console.log('   Demo:  demo@launchpad.dev  / Password123!');
};
