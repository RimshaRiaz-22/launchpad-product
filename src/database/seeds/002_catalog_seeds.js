// src/database/seeds/002_catalog_seeds.js — Seed mockups, fonts, color_palettes, and shapes
"use strict";

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async (knex) => {
  // Clear catalog tables (delete-only, non-destructive to users/projects)
  await knex("shapes").del();
  await knex("fonts").del();
  await knex("mockups").where({ is_builtin: true }).del();

  // ── 1. SEED MOCKUPS (Vector blueprints with specs stored 100% in database) ──
  const SVG_PHONE_NOTCH =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg viewBox="0 0 375 812" xmlns="http://www.w3.org/2000/svg"><defs><mask id="screen-hole"><rect x="0" y="0" width="375" height="812" rx="55" ry="55" fill="#fff"/><rect x="14" y="14" width="347" height="784" rx="41" ry="41" fill="#000"/></mask></defs><rect x="0" y="0" width="375" height="812" rx="55" ry="55" fill="#181A1B" mask="url(#screen-hole)"/><rect x="112.5" y="0" width="150" height="28" rx="14" ry="14" fill="#181A1B"/></svg>',
    );
  const SVG_PHONE_ISLAND =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg viewBox="0 0 393 852" xmlns="http://www.w3.org/2000/svg"><defs><mask id="screen-hole"><rect x="0" y="0" width="393" height="852" rx="62" ry="62" fill="#fff"/><rect x="11" y="11" width="371" height="830" rx="51" ry="51" fill="#000"/></mask></defs><rect x="0" y="0" width="393" height="852" rx="62" ry="62" fill="#181A1B" mask="url(#screen-hole)"/><rect x="137.5" y="18" width="118" height="34" rx="17" ry="17" fill="#181A1B"/></svg>',
    );
  const SVG_PHONE_PLAIN =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg viewBox="0 0 375 812" xmlns="http://www.w3.org/2000/svg"><defs><mask id="screen-hole"><rect x="0" y="0" width="375" height="812" rx="48" ry="48" fill="#fff"/><rect x="10" y="10" width="355" height="792" rx="38" ry="38" fill="#000"/></mask></defs><rect x="0" y="0" width="375" height="812" rx="48" ry="48" fill="#181A1B" mask="url(#screen-hole)"/></svg>',
    );
  const SVG_TABLET =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg viewBox="0 0 834 1194" xmlns="http://www.w3.org/2000/svg"><defs><mask id="screen-hole"><rect x="0" y="0" width="834" height="1194" rx="42" ry="42" fill="#fff"/><rect x="26" y="26" width="782" height="1142" rx="16" ry="16" fill="#000"/></mask></defs><rect x="0" y="0" width="834" height="1194" rx="42" ry="42" fill="#181A1B" mask="url(#screen-hole)"/><circle cx="417" cy="14" r="5" fill="#181A1B"/></svg>',
    );

  const mockups = [
    {
      id: "phone-notch",
      name: "Phone – Notch",
      slug: "phone-notch",
      category: "Phones",
      style: "realistic",
      image_url: SVG_PHONE_NOTCH,
      featured_image:
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
      natural_width: 375,
      natural_height: 812,
      screen_slot: JSON.stringify({
        x: 14,
        y: 14,
        width: 347,
        height: 784,
        rx: 41,
        ry: 41,
      }),
      spec: JSON.stringify({
        version: "1.0",
        type: "smartMockup",
        layout: { width: 375, height: 812 },
        layers: [
          {
            id: "shadow",
            type: "shadow",
            blur: 24,
            offsetY: 12,
            color: "rgba(0,0,0,0.35)",
          },
          {
            id: "chassis",
            type: "body",
            src: SVG_PHONE_NOTCH,
            naturalWidth: 375,
            naturalHeight: 812,
          },
          {
            id: "slot",
            type: "screenSlot",
            x: 14,
            y: 14,
            width: 347,
            height: 784,
            rx: 41,
            ry: 41,
          },
          {
            id: "glare",
            type: "reflection",
            opacity: 0.15,
            blendMode: "screen",
            gradient: {
              angle: 120,
              stops: [
                { offset: 0, color: "rgba(255,255,255,0.4)" },
                { offset: 0.4, color: "transparent" },
              ],
            },
          },
        ],
      }),
      is_builtin: true,
      is_premium: false,
      tags: ["phone", "iphone", "notch", "mobile", "ios"],
    },
    {
      id: "phone-island",
      name: "Phone – Dynamic Island",
      slug: "phone-island",
      category: "Phones",
      style: "realistic",
      image_url: SVG_PHONE_ISLAND,
      featured_image:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
      natural_width: 393,
      natural_height: 852,
      screen_slot: JSON.stringify({
        x: 11,
        y: 11,
        width: 371,
        height: 830,
        rx: 51,
        ry: 51,
      }),
      spec: JSON.stringify({
        version: "1.0",
        type: "smartMockup",
        layout: { width: 393, height: 852 },
        layers: [
          {
            id: "shadow",
            type: "shadow",
            blur: 28,
            offsetY: 14,
            color: "rgba(0,0,0,0.4)",
          },
          {
            id: "chassis",
            type: "body",
            src: SVG_PHONE_ISLAND,
            naturalWidth: 393,
            naturalHeight: 852,
          },
          {
            id: "slot",
            type: "screenSlot",
            x: 11,
            y: 11,
            width: 371,
            height: 830,
            rx: 51,
            ry: 51,
          },
          {
            id: "hardware-island",
            type: "hardwareOverlay",
            x: 147,
            y: 22,
            width: 99,
            height: 26,
            rx: 13,
            color: "#000000",
          },
          {
            id: "glare",
            type: "reflection",
            opacity: 0.12,
            blendMode: "screen",
          },
        ],
      }),
      is_builtin: true,
      is_premium: false,
      tags: ["phone", "iphone", "dynamic-island", "pro", "mobile", "ios"],
    },
    {
      id: "phone-plain",
      name: "Phone – Bezel-less",
      slug: "phone-plain",
      category: "Phones",
      style: "minimal",
      image_url: SVG_PHONE_PLAIN,
      featured_image:
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
      natural_width: 375,
      natural_height: 812,
      screen_slot: JSON.stringify({
        x: 10,
        y: 10,
        width: 355,
        height: 792,
        rx: 38,
        ry: 38,
      }),
      spec: JSON.stringify({
        version: "1.0",
        type: "smartMockup",
        layout: { width: 375, height: 812 },
        layers: [
          {
            id: "shadow",
            type: "shadow",
            blur: 20,
            offsetY: 10,
            color: "rgba(0,0,0,0.3)",
          },
          {
            id: "chassis",
            type: "body",
            src: SVG_PHONE_PLAIN,
            naturalWidth: 375,
            naturalHeight: 812,
          },
          {
            id: "slot",
            type: "screenSlot",
            x: 10,
            y: 10,
            width: 355,
            height: 792,
            rx: 38,
            ry: 38,
          },
        ],
      }),
      is_builtin: true,
      is_premium: false,
      tags: ["phone", "android", "bezel-less", "clean", "minimal"],
    },
    {
      id: "tablet",
      name: "Tablet – Studio Pro",
      slug: "tablet-studio-pro",
      category: "Tablets",
      style: "realistic",
      image_url: SVG_TABLET,
      featured_image:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
      natural_width: 834,
      natural_height: 1194,
      screen_slot: JSON.stringify({
        x: 26,
        y: 26,
        width: 782,
        height: 1142,
        rx: 16,
        ry: 16,
      }),
      spec: JSON.stringify({
        version: "1.0",
        type: "smartMockup",
        layout: { width: 834, height: 1194 },
        layers: [
          {
            id: "shadow",
            type: "shadow",
            blur: 32,
            offsetY: 16,
            color: "rgba(0,0,0,0.45)",
          },
          {
            id: "chassis",
            type: "body",
            src: SVG_TABLET,
            naturalWidth: 834,
            naturalHeight: 1194,
          },
          {
            id: "slot",
            type: "screenSlot",
            x: 26,
            y: 26,
            width: 782,
            height: 1142,
            rx: 16,
            ry: 16,
          },
        ],
      }),
      is_builtin: true,
      is_premium: false,
      tags: ["tablet", "ipad", "large", "display", "screen"],
    },
  ];

  await knex("mockups").insert(mockups);

  // ── 2. SEED FONTS ────────────────────────────────────────────
  const fonts = [
    {
      id: "inter",
      name: "Inter",
      family: "Inter Variable, Inter, sans-serif",
      category: "sans-serif",
      weights: JSON.stringify([100, 300, 400, 500, 600, 700, 800, 900]),
      is_builtin: true,
    },
    {
      id: "plus-jakarta-sans",
      name: "Plus Jakarta Sans",
      family: '"Plus Jakarta Sans", "Inter Variable", sans-serif',
      category: "sans-serif",
      weights: JSON.stringify([300, 400, 500, 600, 700, 800]),
      is_builtin: true,
    },
    {
      id: "playfair-display",
      name: "Playfair Display",
      family: '"Playfair Display", Georgia, serif',
      category: "serif",
      weights: JSON.stringify([400, 500, 600, 700, 800, 900]),
      is_builtin: true,
    },
    {
      id: "caveat",
      name: "Caveat",
      family: '"Caveat", cursive',
      category: "handwriting",
      weights: JSON.stringify([400, 500, 600, 700]),
      is_builtin: true,
    },
    {
      id: "georgia",
      name: "Georgia",
      family: "Georgia, serif",
      category: "serif",
      weights: JSON.stringify([400, 700]),
      is_builtin: true,
    },
    {
      id: "jetbrains-mono",
      name: "JetBrains Mono",
      family: "JetBrains Mono Variable, JetBrains Mono, monospace",
      category: "monospace",
      weights: JSON.stringify([300, 400, 500, 600, 700, 800]),
      is_builtin: true,
    },
    {
      id: "arial",
      name: "Arial",
      family: "Arial, Helvetica, sans-serif",
      category: "sans-serif",
      weights: JSON.stringify([400, 700]),
      is_builtin: true,
    },
  ];

  await knex("fonts").insert(fonts);

  // ── 4. SEED SHAPES & VECTOR ELEMENTS ─────────────────────────
  const shapes = [
    // Basic
    {
      id: "rect",
      name: "Rectangle",
      group_id: "basic",
      group_label: "Basic",
      preview_type: "rect",
      preview_data: JSON.stringify({ w: 40, h: 28, radius: 0 }),
      fabric_type: "Rect",
      default_props: JSON.stringify({
        width: 400,
        height: 320,
        fill: "#297F76",
      }),
    },
    {
      id: "rounded-rect",
      name: "Rounded Rect",
      group_id: "basic",
      group_label: "Basic",
      preview_type: "rect",
      preview_data: JSON.stringify({ w: 40, h: 28, radius: 8 }),
      fabric_type: "Rect",
      default_props: JSON.stringify({
        width: 400,
        height: 320,
        rx: 32,
        ry: 32,
        fill: "#297F76",
      }),
    },
    {
      id: "square",
      name: "Square",
      group_id: "basic",
      group_label: "Basic",
      preview_type: "rect",
      preview_data: JSON.stringify({ w: 32, h: 32, radius: 0 }),
      fabric_type: "Rect",
      default_props: JSON.stringify({
        width: 360,
        height: 360,
        fill: "#297F76",
      }),
    },
    {
      id: "circle",
      name: "Circle",
      group_id: "basic",
      group_label: "Basic",
      preview_type: "rect",
      preview_data: JSON.stringify({ w: 32, h: 32, radius: 16 }),
      fabric_type: "Circle",
      default_props: JSON.stringify({ radius: 220, fill: "#297F76" }),
    },
    {
      id: "ellipse",
      name: "Ellipse",
      group_id: "basic",
      group_label: "Basic",
      preview_type: "rect",
      preview_data: JSON.stringify({ w: 42, h: 26, radius: 13 }),
      fabric_type: "Ellipse",
      default_props: JSON.stringify({ rx: 220, ry: 150, fill: "#297F76" }),
    },
    {
      id: "triangle",
      name: "Triangle",
      group_id: "basic",
      group_label: "Basic",
      preview_type: "svg",
      preview_data: JSON.stringify({ d: "M50,4 L96,92 L4,92 Z" }),
      fabric_type: "Triangle",
      default_props: JSON.stringify({
        width: 380,
        height: 340,
        fill: "#297F76",
      }),
    },
    // Polygons
    {
      id: "diamond",
      name: "Diamond",
      group_id: "polygons",
      group_label: "Polygons",
      preview_type: "svg",
      preview_data: JSON.stringify({ d: "M50,0 L100,50 L50,100 L0,50 Z" }),
      svg_path: "M50,0 L100,50 L50,100 L0,50 Z",
      fabric_type: "Path",
      default_props: JSON.stringify({ fill: "#297F76" }),
    },
    {
      id: "hexagon",
      name: "Hexagon",
      group_id: "polygons",
      group_label: "Polygons",
      preview_type: "svg",
      preview_data: JSON.stringify({
        d: "M25,0 L75,0 L100,50 L75,100 L25,100 L0,50 Z",
      }),
      svg_path: "M25,0 L75,0 L100,50 L75,100 L25,100 L0,50 Z",
      fabric_type: "Path",
      default_props: JSON.stringify({ fill: "#297F76" }),
    },
    {
      id: "octagon",
      name: "Octagon",
      group_id: "polygons",
      group_label: "Polygons",
      preview_type: "svg",
      preview_data: JSON.stringify({
        d: "M30,0 L70,0 L100,30 L100,70 L70,100 L30,100 L0,70 L0,30 Z",
      }),
      svg_path: "M30,0 L70,0 L100,30 L100,70 L70,100 L30,100 L0,70 L0,30 Z",
      fabric_type: "Path",
      default_props: JSON.stringify({ fill: "#297F76" }),
    },
    // Symbols & Badges
    {
      id: "star5",
      name: "Star (5-Point)",
      group_id: "symbols",
      group_label: "Symbols & Badges",
      preview_type: "svg",
      preview_data: JSON.stringify({
        d: "M50,0 L61.23,34.55 L97.55,34.55 L68.16,55.9 L79.39,90.45 L50,69.1 L20.61,90.45 L31.84,55.9 L2.45,34.55 L38.77,34.55 Z",
      }),
      svg_path:
        "M50,0 L61.23,34.55 L97.55,34.55 L68.16,55.9 L79.39,90.45 L50,69.1 L20.61,90.45 L31.84,55.9 L2.45,34.55 L38.77,34.55 Z",
      fabric_type: "Path",
      default_props: JSON.stringify({ fill: "#297F76" }),
    },
    {
      id: "arrow",
      name: "Arrow Right",
      group_id: "symbols",
      group_label: "Symbols & Badges",
      preview_type: "svg",
      preview_data: JSON.stringify({
        d: "M0,30 L60,30 L60,10 L100,50 L60,90 L60,70 L0,70 Z",
      }),
      svg_path: "M0,30 L60,30 L60,10 L100,50 L60,90 L60,70 L0,70 Z",
      fabric_type: "Path",
      default_props: JSON.stringify({ fill: "#297F76" }),
    },
    {
      id: "heart",
      name: "Heart",
      group_id: "symbols",
      group_label: "Symbols & Badges",
      preview_type: "svg",
      preview_data: JSON.stringify({
        d: "M50,88 C15,65 0,45 0,28 C0,12 12,0 28,0 C38,0 47,6 50,15 C53,6 62,0 72,0 C88,0 100,12 100,28 C100,45 85,65 50,88 Z",
      }),
      svg_path:
        "M50,88 C15,65 0,45 0,28 C0,12 12,0 28,0 C38,0 47,6 50,15 C53,6 62,0 72,0 C88,0 100,12 100,28 C100,45 85,65 50,88 Z",
      fabric_type: "Path",
      default_props: JSON.stringify({ fill: "#297F76" }),
    },
    {
      id: "speech-bubble",
      name: "Speech Bubble",
      group_id: "symbols",
      group_label: "Symbols & Badges",
      preview_type: "svg",
      preview_data: JSON.stringify({
        d: "M12,0 L88,0 Q100,0 100,12 L100,55 Q100,67 88,67 L35,67 L28,88 L18,67 L12,67 Q0,67 0,55 L0,12 Q0,0 12,0 Z",
      }),
      svg_path:
        "M12,0 L88,0 Q100,0 100,12 L100,55 Q100,67 88,67 L35,67 L28,88 L18,67 L12,67 Q0,67 0,55 L0,12 Q0,0 12,0 Z",
      fabric_type: "Path",
      default_props: JSON.stringify({ fill: "#297F76" }),
    },
  ];

  await knex("shapes").insert(shapes);
};
