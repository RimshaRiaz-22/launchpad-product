'use strict';

// seed_mockups.js — 25 device mockups, all inline SVG (zero external deps)
async function seedMockups(knex) {
  console.log('🖼️  Seeding 25 device mockups...');
  await knex('mockups').where({ is_builtin: true }).del();
  const mockups = [
  {
    "id": "iphone-15-pro",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "category": "Phones",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20393%20852%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22ti%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%238E8E93%22%2F%3E%3Cstop%20offset%3D%2240%25%22%20style%3D%22stop-color%3A%23AEAEB2%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23636366%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm1%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2254%22%20ry%3D%2254%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22373%22%20height%3D%22832%22%20rx%3D%2246%22%20ry%3D%2246%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2254%22%20ry%3D%2254%22%20fill%3D%22url(%23ti)%22%20mask%3D%22url(%23sm1)%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22373%22%20height%3D%22832%22%20rx%3D%2246%22%20ry%3D%2246%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%22142%22%20y%3D%2218%22%20width%3D%22109%22%20height%3D%2230%22%20rx%3D%2215%22%20fill%3D%22%23000%22%2F%3E%3Crect%20x%3D%22-3%22%20y%3D%22160%22%20width%3D%225%22%20height%3D%2236%22%20rx%3D%222.5%22%20fill%3D%22url(%23ti)%22%2F%3E%3Crect%20x%3D%22391%22%20y%3D%22200%22%20width%3D%225%22%20height%3D%2290%22%20rx%3D%222.5%22%20fill%3D%22url(%23ti)%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    "natural_width": 393,
    "natural_height": 852,
    "screen_slot": "{\"x\":10,\"y\":10,\"width\":373,\"height\":832,\"rx\":46,\"ry\":46}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":393,\"height\":852},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":32,\"offsetY\":16,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":10,\"y\":10,\"width\":373,\"height\":832,\"rx\":46,\"ry\":46}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "iphone",
      "pro",
      "titanium",
      "dynamic-island",
      "ios"
    ]
  },
  {
    "id": "iphone-15",
    "name": "iPhone 15",
    "slug": "iphone-15",
    "category": "Phones",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20393%20852%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22al%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23E8E8E8%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23A0A0A0%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm2%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2250%22%20ry%3D%2250%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22373%22%20height%3D%22832%22%20rx%3D%2242%22%20ry%3D%2242%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2250%22%20ry%3D%2250%22%20fill%3D%22url(%23al)%22%20mask%3D%22url(%23sm2)%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22373%22%20height%3D%22832%22%20rx%3D%2242%22%20ry%3D%2242%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%22148%22%20y%3D%2218%22%20width%3D%2297%22%20height%3D%2228%22%20rx%3D%2214%22%20fill%3D%22%23000%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
    "natural_width": 393,
    "natural_height": 852,
    "screen_slot": "{\"x\":10,\"y\":10,\"width\":373,\"height\":832,\"rx\":42,\"ry\":42}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":393,\"height\":852},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":28,\"offsetY\":14,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":10,\"y\":10,\"width\":373,\"height\":832,\"rx\":42,\"ry\":42}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "iphone",
      "aluminum",
      "dynamic-island",
      "ios"
    ]
  },
  {
    "id": "iphone-se",
    "name": "iPhone SE",
    "slug": "iphone-se",
    "category": "Phones",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20375%20667%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22se%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23E0E0E0%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23B0B0B0%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm3%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22375%22%20height%3D%22667%22%20rx%3D%2244%22%20ry%3D%2244%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2216%22%20y%3D%2216%22%20width%3D%22343%22%20height%3D%22635%22%20rx%3D%226%22%20ry%3D%226%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22375%22%20height%3D%22667%22%20rx%3D%2244%22%20ry%3D%2244%22%20fill%3D%22url(%23se)%22%20mask%3D%22url(%23sm3)%22%2F%3E%3Crect%20x%3D%2216%22%20y%3D%2216%22%20width%3D%22343%22%20height%3D%22635%22%20rx%3D%226%22%20ry%3D%226%22%20fill%3D%22%230a0a0a%22%2F%3E%3Ccircle%20cx%3D%22187.5%22%20cy%3D%22640%22%20r%3D%2222%22%20fill%3D%22%231C1C1E%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    "natural_width": 375,
    "natural_height": 667,
    "screen_slot": "{\"x\":16,\"y\":16,\"width\":343,\"height\":635,\"rx\":6,\"ry\":6}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":375,\"height\":667},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":18,\"offsetY\":8,\"color\":\"rgba(0,0,0,0.28)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":16,\"y\":16,\"width\":343,\"height\":635,\"rx\":6,\"ry\":6}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "iphone",
      "se",
      "home-button",
      "compact",
      "ios"
    ]
  },
  {
    "id": "android-pixel",
    "name": "Google Pixel 8",
    "slug": "android-pixel",
    "category": "Phones",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20412%20915%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22px%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%233C4043%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23202124%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm4%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22412%22%20height%3D%22915%22%20rx%3D%2244%22%20ry%3D%2244%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%22388%22%20height%3D%22891%22%20rx%3D%2236%22%20ry%3D%2236%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22412%22%20height%3D%22915%22%20rx%3D%2244%22%20ry%3D%2244%22%20fill%3D%22url(%23px)%22%20mask%3D%22url(%23sm4)%22%2F%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%22388%22%20height%3D%22891%22%20rx%3D%2236%22%20ry%3D%2236%22%20fill%3D%22%230a0a0a%22%2F%3E%3Ccircle%20cx%3D%22206%22%20cy%3D%2245%22%20r%3D%2211%22%20fill%3D%22%231C1C1E%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1598327105854-c8674faddf79?auto=format&fit=crop&w=800&q=80",
    "natural_width": 412,
    "natural_height": 915,
    "screen_slot": "{\"x\":12,\"y\":12,\"width\":388,\"height\":891,\"rx\":36,\"ry\":36}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":412,\"height\":915},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":30,\"offsetY\":15,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":12,\"y\":12,\"width\":388,\"height\":891,\"rx\":36,\"ry\":36}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "android",
      "pixel",
      "google"
    ]
  },
  {
    "id": "samsung-s24",
    "name": "Samsung Galaxy S24",
    "slug": "samsung-s24",
    "category": "Phones",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20393%20851%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22ss%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%232A2A2A%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%231A1A1A%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm5%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22851%22%20rx%3D%2248%22%20ry%3D%2248%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%229%22%20y%3D%229%22%20width%3D%22375%22%20height%3D%22833%22%20rx%3D%2240%22%20ry%3D%2240%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22851%22%20rx%3D%2248%22%20ry%3D%2248%22%20fill%3D%22url(%23ss)%22%20mask%3D%22url(%23sm5)%22%2F%3E%3Crect%20x%3D%229%22%20y%3D%229%22%20width%3D%22375%22%20height%3D%22833%22%20rx%3D%2240%22%20ry%3D%2240%22%20fill%3D%22%230a0a0a%22%2F%3E%3Ccircle%20cx%3D%22196.5%22%20cy%3D%2240%22%20r%3D%2210%22%20fill%3D%22%231A1A1A%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=800&q=80",
    "natural_width": 393,
    "natural_height": 851,
    "screen_slot": "{\"x\":9,\"y\":9,\"width\":375,\"height\":833,\"rx\":40,\"ry\":40}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":393,\"height\":851},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":28,\"offsetY\":14,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":9,\"y\":9,\"width\":375,\"height\":833,\"rx\":40,\"ry\":40}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "android",
      "samsung",
      "galaxy"
    ]
  },
  {
    "id": "android-fold",
    "name": "Galaxy Z Fold",
    "slug": "android-fold",
    "category": "Phones",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20768%20852%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cmask%20id%3D%22sm6%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22768%22%20height%3D%22852%22%20rx%3D%2230%22%20ry%3D%2230%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22748%22%20height%3D%22832%22%20rx%3D%2222%22%20ry%3D%2222%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22768%22%20height%3D%22852%22%20rx%3D%2230%22%20ry%3D%2230%22%20fill%3D%22%231C1C1E%22%20mask%3D%22url(%23sm6)%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22748%22%20height%3D%22832%22%20rx%3D%2222%22%20ry%3D%2222%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%22381%22%20y%3D%2210%22%20width%3D%226%22%20height%3D%22832%22%20fill%3D%22%23111%22%20opacity%3D%220.8%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    "natural_width": 768,
    "natural_height": 852,
    "screen_slot": "{\"x\":10,\"y\":10,\"width\":748,\"height\":832,\"rx\":22,\"ry\":22}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":768,\"height\":852},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":36,\"offsetY\":18,\"color\":\"rgba(0,0,0,0.45)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":10,\"y\":10,\"width\":748,\"height\":832,\"rx\":22,\"ry\":22}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "android",
      "foldable",
      "samsung"
    ]
  },
  {
    "id": "iphone-clay",
    "name": "iPhone Clay White",
    "slug": "iphone-clay",
    "category": "Phones",
    "style": "clay",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20393%20852%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22cy%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23ECEAF0%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23D8D5E0%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm7%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2260%22%20ry%3D%2260%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2214%22%20y%3D%2214%22%20width%3D%22365%22%20height%3D%22824%22%20rx%3D%2248%22%20ry%3D%2248%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2260%22%20ry%3D%2260%22%20fill%3D%22url(%23cy)%22%20mask%3D%22url(%23sm7)%22%2F%3E%3Crect%20x%3D%2214%22%20y%3D%2214%22%20width%3D%22365%22%20height%3D%22824%22%20rx%3D%2248%22%20ry%3D%2248%22%20fill%3D%22%23F2F0F7%22%2F%3E%3Crect%20x%3D%22145%22%20y%3D%2222%22%20width%3D%22103%22%20height%3D%2228%22%20rx%3D%2214%22%20fill%3D%22%23D8D5E0%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "natural_width": 393,
    "natural_height": 852,
    "screen_slot": "{\"x\":14,\"y\":14,\"width\":365,\"height\":824,\"rx\":48,\"ry\":48}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":393,\"height\":852},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":40,\"offsetY\":20,\"color\":\"rgba(0,0,0,0.2)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":14,\"y\":14,\"width\":365,\"height\":824,\"rx\":48,\"ry\":48}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "clay",
      "white",
      "iphone",
      "minimal"
    ]
  },
  {
    "id": "phone-minimal",
    "name": "Phone Minimal Outline",
    "slug": "phone-minimal",
    "category": "Phones",
    "style": "minimal",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20390%20844%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22390%22%20height%3D%22844%22%20rx%3D%2248%22%20ry%3D%2248%22%20fill%3D%22none%22%20stroke%3D%22%23D1D1D6%22%20stroke-width%3D%222%22%2F%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%22366%22%20height%3D%22820%22%20rx%3D%2240%22%20ry%3D%2240%22%20fill%3D%22%23F2F2F7%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1519558260268-cde7e03a0152?auto=format&fit=crop&w=800&q=80",
    "natural_width": 390,
    "natural_height": 844,
    "screen_slot": "{\"x\":12,\"y\":12,\"width\":366,\"height\":820,\"rx\":40,\"ry\":40}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":390,\"height\":844},\"layers\":[{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":12,\"y\":12,\"width\":366,\"height\":820,\"rx\":40,\"ry\":40}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "minimal",
      "outline",
      "wireframe"
    ]
  },
  {
    "id": "phone-landscape",
    "name": "Phone Landscape",
    "slug": "phone-landscape",
    "category": "Phones",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20852%20393%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cmask%20id%3D%22sm8%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22852%22%20height%3D%22393%22%20rx%3D%2250%22%20ry%3D%2250%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22832%22%20height%3D%22373%22%20rx%3D%2242%22%20ry%3D%2242%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22852%22%20height%3D%22393%22%20rx%3D%2250%22%20ry%3D%2250%22%20fill%3D%22%231C1C1E%22%20mask%3D%22url(%23sm8)%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22832%22%20height%3D%22373%22%20rx%3D%2242%22%20ry%3D%2242%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%22390%22%20y%3D%2218%22%20width%3D%2272%22%20height%3D%2222%22%20rx%3D%2211%22%20fill%3D%22%23000%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    "natural_width": 852,
    "natural_height": 393,
    "screen_slot": "{\"x\":10,\"y\":10,\"width\":832,\"height\":373,\"rx\":42,\"ry\":42}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":852,\"height\":393},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":28,\"offsetY\":12,\"color\":\"rgba(0,0,0,0.38)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":10,\"y\":10,\"width\":832,\"height\":373,\"rx\":42,\"ry\":42}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "landscape",
      "horizontal",
      "iphone"
    ]
  },
  {
    "id": "ipad-pro",
    "name": "iPad Pro 12.9",
    "slug": "ipad-pro",
    "category": "Tablets",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20834%201194%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22ip%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23C8C8C8%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23A8A8A8%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm9%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22834%22%20height%3D%221194%22%20rx%3D%2224%22%20ry%3D%2224%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22794%22%20height%3D%221154%22%20rx%3D%2210%22%20ry%3D%2210%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22834%22%20height%3D%221194%22%20rx%3D%2224%22%20ry%3D%2224%22%20fill%3D%22url(%23ip)%22%20mask%3D%22url(%23sm9)%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22794%22%20height%3D%221154%22%20rx%3D%2210%22%20ry%3D%2210%22%20fill%3D%22%230a0a0a%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    "natural_width": 834,
    "natural_height": 1194,
    "screen_slot": "{\"x\":20,\"y\":20,\"width\":794,\"height\":1154,\"rx\":10,\"ry\":10}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":834,\"height\":1194},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":40,\"offsetY\":20,\"color\":\"rgba(0,0,0,0.45)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":20,\"y\":20,\"width\":794,\"height\":1154,\"rx\":10,\"ry\":10}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "ipad",
      "pro",
      "tablet",
      "apple"
    ]
  },
  {
    "id": "ipad-air",
    "name": "iPad Air Blue",
    "slug": "ipad-air",
    "category": "Tablets",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20820%201180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22ia%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23C0D8F8%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%2390B8E8%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm10%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22820%22%20height%3D%221180%22%20rx%3D%2222%22%20ry%3D%2222%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22780%22%20height%3D%221140%22%20rx%3D%228%22%20ry%3D%228%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22820%22%20height%3D%221180%22%20rx%3D%2222%22%20ry%3D%2222%22%20fill%3D%22url(%23ia)%22%20mask%3D%22url(%23sm10)%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22780%22%20height%3D%221140%22%20rx%3D%228%22%20ry%3D%228%22%20fill%3D%22%230a0a0a%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=800&q=80",
    "natural_width": 820,
    "natural_height": 1180,
    "screen_slot": "{\"x\":20,\"y\":20,\"width\":780,\"height\":1140,\"rx\":8,\"ry\":8}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":820,\"height\":1180},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":36,\"offsetY\":18,\"color\":\"rgba(0,0,0,0.35)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":20,\"y\":20,\"width\":780,\"height\":1140,\"rx\":8,\"ry\":8}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "ipad",
      "air",
      "blue",
      "tablet"
    ]
  },
  {
    "id": "ipad-mini",
    "name": "iPad Mini",
    "slug": "ipad-mini",
    "category": "Tablets",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20744%201133%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22im%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23D0D0D0%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23B0B0B0%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22sm11%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22744%22%20height%3D%221133%22%20rx%3D%2222%22%20ry%3D%2222%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2218%22%20y%3D%2218%22%20width%3D%22708%22%20height%3D%221097%22%20rx%3D%228%22%20ry%3D%228%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22744%22%20height%3D%221133%22%20rx%3D%2222%22%20ry%3D%2222%22%20fill%3D%22url(%23im)%22%20mask%3D%22url(%23sm11)%22%2F%3E%3Crect%20x%3D%2218%22%20y%3D%2218%22%20width%3D%22708%22%20height%3D%221097%22%20rx%3D%228%22%20ry%3D%228%22%20fill%3D%22%230a0a0a%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    "natural_width": 744,
    "natural_height": 1133,
    "screen_slot": "{\"x\":18,\"y\":18,\"width\":708,\"height\":1097,\"rx\":8,\"ry\":8}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":744,\"height\":1133},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":30,\"offsetY\":16,\"color\":\"rgba(0,0,0,0.35)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":18,\"y\":18,\"width\":708,\"height\":1097,\"rx\":8,\"ry\":8}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "ipad",
      "mini",
      "compact",
      "tablet"
    ]
  },
  {
    "id": "android-tablet",
    "name": "Android Tablet",
    "slug": "android-tablet",
    "category": "Tablets",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20800%201280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cmask%20id%3D%22sm12%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22800%22%20height%3D%221280%22%20rx%3D%2220%22%20ry%3D%2220%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2216%22%20y%3D%2216%22%20width%3D%22768%22%20height%3D%221248%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22800%22%20height%3D%221280%22%20rx%3D%2220%22%20ry%3D%2220%22%20fill%3D%22%23202020%22%20mask%3D%22url(%23sm12)%22%2F%3E%3Crect%20x%3D%2216%22%20y%3D%2216%22%20width%3D%22768%22%20height%3D%221248%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%230a0a0a%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80",
    "natural_width": 800,
    "natural_height": 1280,
    "screen_slot": "{\"x\":16,\"y\":16,\"width\":768,\"height\":1248,\"rx\":12,\"ry\":12}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":800,\"height\":1280},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":28,\"offsetY\":14,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":16,\"y\":16,\"width\":768,\"height\":1248,\"rx\":12,\"ry\":12}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "android",
      "tablet",
      "google"
    ]
  },
  {
    "id": "macbook-pro",
    "name": "MacBook Pro",
    "slug": "macbook-pro",
    "category": "Desktops",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%201512%20982%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22mb%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%232C2C2E%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%231C1C1E%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221512%22%20height%3D%22920%22%20rx%3D%2214%22%20ry%3D%2214%22%20fill%3D%22url(%23mb)%22%2F%3E%3Crect%20x%3D%2216%22%20y%3D%2214%22%20width%3D%221480%22%20height%3D%22892%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%22668%22%20y%3D%220%22%20width%3D%22176%22%20height%3D%2228%22%20fill%3D%22url(%23mb)%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%22920%22%20width%3D%221512%22%20height%3D%2262%22%20fill%3D%22%233A3A3C%22%2F%3E%3Crect%20x%3D%22580%22%20y%3D%22930%22%20width%3D%22352%22%20height%3D%2240%22%20rx%3D%228%22%20fill%3D%22%232C2C2E%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    "natural_width": 1512,
    "natural_height": 982,
    "screen_slot": "{\"x\":16,\"y\":14,\"width\":1480,\"height\":892,\"rx\":12,\"ry\":12}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":1512,\"height\":982},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":50,\"offsetY\":24,\"color\":\"rgba(0,0,0,0.45)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":16,\"y\":14,\"width\":1480,\"height\":892,\"rx\":12,\"ry\":12}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "macbook",
      "pro",
      "laptop",
      "apple"
    ]
  },
  {
    "id": "macbook-air",
    "name": "MacBook Air Gold",
    "slug": "macbook-air",
    "category": "Desktops",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%201440%20920%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22mba%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23F5E6C8%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23E0C88A%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221440%22%20height%3D%22870%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22url(%23mba)%22%2F%3E%3Crect%20x%3D%2218%22%20y%3D%2214%22%20width%3D%221404%22%20height%3D%22842%22%20rx%3D%228%22%20ry%3D%228%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%22870%22%20width%3D%221440%22%20height%3D%2250%22%20fill%3D%22%23E8D0A0%22%2F%3E%3Crect%20x%3D%22540%22%20y%3D%22878%22%20width%3D%22360%22%20height%3D%2234%22%20rx%3D%226%22%20fill%3D%22%23C8A870%22%20opacity%3D%220.6%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    "natural_width": 1440,
    "natural_height": 920,
    "screen_slot": "{\"x\":18,\"y\":14,\"width\":1404,\"height\":842,\"rx\":8,\"ry\":8}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":1440,\"height\":920},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":44,\"offsetY\":22,\"color\":\"rgba(0,0,0,0.38)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":18,\"y\":14,\"width\":1404,\"height\":842,\"rx\":8,\"ry\":8}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "macbook",
      "air",
      "gold",
      "laptop"
    ]
  },
  {
    "id": "macbook-dark",
    "name": "MacBook Space Black",
    "slug": "macbook-dark",
    "category": "Desktops",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%201512%20982%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22mbd%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%231A1A1C%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%230C0C0E%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221512%22%20height%3D%22920%22%20rx%3D%2214%22%20ry%3D%2214%22%20fill%3D%22url(%23mbd)%22%2F%3E%3Crect%20x%3D%2216%22%20y%3D%2214%22%20width%3D%221480%22%20height%3D%22892%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%23050507%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%22920%22%20width%3D%221512%22%20height%3D%2262%22%20fill%3D%22%23141416%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1607290786-4786e74daa81?auto=format&fit=crop&w=800&q=80",
    "natural_width": 1512,
    "natural_height": 982,
    "screen_slot": "{\"x\":16,\"y\":14,\"width\":1480,\"height\":892,\"rx\":12,\"ry\":12}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":1512,\"height\":982},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":50,\"offsetY\":24,\"color\":\"rgba(0,0,0,0.55)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":16,\"y\":14,\"width\":1480,\"height\":892,\"rx\":12,\"ry\":12}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "macbook",
      "dark",
      "laptop"
    ]
  },
  {
    "id": "imac",
    "name": "iMac 27",
    "slug": "imac",
    "category": "Desktops",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%202560%201700%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22imc%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23F0F0F0%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23D0D0D0%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%222560%22%20height%3D%221440%22%20rx%3D%2220%22%20ry%3D%2220%22%20fill%3D%22url(%23imc)%22%2F%3E%3Crect%20x%3D%2218%22%20y%3D%2214%22%20width%3D%222524%22%20height%3D%221412%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%221376%22%20width%3D%222560%22%20height%3D%2264%22%20fill%3D%22url(%23imc)%22%2F%3E%3Crect%20x%3D%221140%22%20y%3D%221440%22%20width%3D%22280%22%20height%3D%22180%22%20rx%3D%228%22%20fill%3D%22url(%23imc)%22%2F%3E%3Crect%20x%3D%22960%22%20y%3D%221610%22%20width%3D%22640%22%20height%3D%2230%22%20rx%3D%2215%22%20fill%3D%22url(%23imc)%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1623282033815-40b05d96c903?auto=format&fit=crop&w=800&q=80",
    "natural_width": 2560,
    "natural_height": 1700,
    "screen_slot": "{\"x\":18,\"y\":14,\"width\":2524,\"height\":1412,\"rx\":12,\"ry\":12}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":2560,\"height\":1700},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":60,\"offsetY\":30,\"color\":\"rgba(0,0,0,0.3)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":18,\"y\":14,\"width\":2524,\"height\":1412,\"rx\":12,\"ry\":12}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "imac",
      "desktop",
      "apple"
    ]
  },
  {
    "id": "monitor-4k",
    "name": "4K Monitor",
    "slug": "monitor-4k",
    "category": "Desktops",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%202560%201560%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22mon%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%232A2A2A%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%231A1A1A%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%222560%22%20height%3D%221440%22%20rx%3D%2216%22%20ry%3D%2216%22%20fill%3D%22url(%23mon)%22%2F%3E%3Crect%20x%3D%2214%22%20y%3D%2212%22%20width%3D%222532%22%20height%3D%221416%22%20rx%3D%228%22%20ry%3D%228%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%221200%22%20y%3D%221450%22%20width%3D%22160%22%20height%3D%2280%22%20rx%3D%224%22%20fill%3D%22%232A2A2A%22%2F%3E%3Crect%20x%3D%221050%22%20y%3D%221524%22%20width%3D%22460%22%20height%3D%2220%22%20rx%3D%2210%22%20fill%3D%22%232A2A2A%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80",
    "natural_width": 2560,
    "natural_height": 1560,
    "screen_slot": "{\"x\":14,\"y\":12,\"width\":2532,\"height\":1416,\"rx\":8,\"ry\":8}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":2560,\"height\":1560},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":56,\"offsetY\":28,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":14,\"y\":12,\"width\":2532,\"height\":1416,\"rx\":8,\"ry\":8}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "monitor",
      "4k",
      "desktop"
    ]
  },
  {
    "id": "browser-chrome",
    "name": "Browser Chrome Light",
    "slug": "browser-chrome",
    "category": "Browsers",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%201440%20960%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221440%22%20height%3D%22960%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%23F5F5F7%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221440%22%20height%3D%2252%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%23E8E8EA%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2240%22%20width%3D%221440%22%20height%3D%2212%22%20fill%3D%22%23E8E8EA%22%2F%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2226%22%20r%3D%227%22%20fill%3D%22%23FF5F57%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2226%22%20r%3D%227%22%20fill%3D%22%23FEBC2E%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2226%22%20r%3D%227%22%20fill%3D%22%2328C840%22%2F%3E%3Crect%20x%3D%2290%22%20y%3D%2210%22%20width%3D%22220%22%20height%3D%2232%22%20rx%3D%228%22%20fill%3D%22%23F5F5F7%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2252%22%20width%3D%221440%22%20height%3D%2244%22%20fill%3D%22%23F0F0F2%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%2260%22%20width%3D%221200%22%20height%3D%2228%22%20rx%3D%2214%22%20fill%3D%22%23FAFAFA%22%20stroke%3D%22%23D0D0D0%22%20stroke-width%3D%221%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2296%22%20width%3D%221440%22%20height%3D%22864%22%20fill%3D%22%23FFFFFF%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
    "natural_width": 1440,
    "natural_height": 960,
    "screen_slot": "{\"x\":0,\"y\":96,\"width\":1440,\"height\":864,\"rx\":0,\"ry\":0}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":1440,\"height\":960},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":40,\"offsetY\":20,\"color\":\"rgba(0,0,0,0.3)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":0,\"y\":96,\"width\":1440,\"height\":864,\"rx\":0,\"ry\":0}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "browser",
      "chrome",
      "web",
      "light"
    ]
  },
  {
    "id": "browser-dark",
    "name": "Browser Dark Mode",
    "slug": "browser-dark",
    "category": "Browsers",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%201440%20960%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221440%22%20height%3D%22960%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%231C1C1E%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221440%22%20height%3D%2252%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%232C2C2E%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2240%22%20width%3D%221440%22%20height%3D%2212%22%20fill%3D%22%232C2C2E%22%2F%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2226%22%20r%3D%227%22%20fill%3D%22%23FF5F57%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2226%22%20r%3D%227%22%20fill%3D%22%23FEBC2E%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2226%22%20r%3D%227%22%20fill%3D%22%2328C840%22%2F%3E%3Crect%20x%3D%2290%22%20y%3D%2210%22%20width%3D%22220%22%20height%3D%2232%22%20rx%3D%228%22%20fill%3D%22%233A3A3C%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2252%22%20width%3D%221440%22%20height%3D%2244%22%20fill%3D%22%23252527%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%2260%22%20width%3D%221200%22%20height%3D%2228%22%20rx%3D%2214%22%20fill%3D%22%233A3A3C%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2296%22%20width%3D%221440%22%20height%3D%22864%22%20fill%3D%22%231A1A1C%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1555066931-4365d14f3027?auto=format&fit=crop&w=800&q=80",
    "natural_width": 1440,
    "natural_height": 960,
    "screen_slot": "{\"x\":0,\"y\":96,\"width\":1440,\"height\":864,\"rx\":0,\"ry\":0}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":1440,\"height\":960},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":40,\"offsetY\":20,\"color\":\"rgba(0,0,0,0.5)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":0,\"y\":96,\"width\":1440,\"height\":864,\"rx\":0,\"ry\":0}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "browser",
      "dark",
      "web"
    ]
  },
  {
    "id": "browser-safari",
    "name": "Browser Safari",
    "slug": "browser-safari",
    "category": "Browsers",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%201440%20960%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221440%22%20height%3D%22960%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%23FAFAFA%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221440%22%20height%3D%2272%22%20rx%3D%2212%22%20ry%3D%2212%22%20fill%3D%22%23ECECEE%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2260%22%20width%3D%221440%22%20height%3D%2212%22%20fill%3D%22%23ECECEE%22%2F%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2236%22%20r%3D%227%22%20fill%3D%22%23FF5F57%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2236%22%20r%3D%227%22%20fill%3D%22%23FEBC2E%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2236%22%20r%3D%227%22%20fill%3D%22%2328C840%22%2F%3E%3Crect%20x%3D%22440%22%20y%3D%2218%22%20width%3D%22560%22%20height%3D%2236%22%20rx%3D%2218%22%20fill%3D%22%23FFFFFF%22%20stroke%3D%22%23D0D0D0%22%20stroke-width%3D%221%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2272%22%20width%3D%221440%22%20height%3D%221%22%20fill%3D%22%23D0D0D0%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%2273%22%20width%3D%221440%22%20height%3D%22887%22%20fill%3D%22%23FFFFFF%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80",
    "natural_width": 1440,
    "natural_height": 960,
    "screen_slot": "{\"x\":0,\"y\":73,\"width\":1440,\"height\":887,\"rx\":0,\"ry\":0}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":1440,\"height\":960},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":36,\"offsetY\":18,\"color\":\"rgba(0,0,0,0.25)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":0,\"y\":73,\"width\":1440,\"height\":887,\"rx\":0,\"ry\":0}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "browser",
      "safari",
      "apple"
    ]
  },
  {
    "id": "apple-watch-45",
    "name": "Apple Watch 45mm",
    "slug": "apple-watch-45",
    "category": "Wearables",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20198%20242%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22aw%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23C8C8CA%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%238E8E93%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22awm%22%3E%3Crect%20x%3D%2214%22%20y%3D%2230%22%20width%3D%22170%22%20height%3D%22182%22%20rx%3D%2244%22%20ry%3D%2244%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2222%22%20y%3D%2238%22%20width%3D%22154%22%20height%3D%22166%22%20rx%3D%2238%22%20ry%3D%2238%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%2246%22%20y%3D%220%22%20width%3D%22106%22%20height%3D%2246%22%20rx%3D%2214%22%20fill%3D%22%232C2C2E%22%2F%3E%3Crect%20x%3D%2246%22%20y%3D%22196%22%20width%3D%22106%22%20height%3D%2246%22%20rx%3D%2214%22%20fill%3D%22%232C2C2E%22%2F%3E%3Crect%20x%3D%2214%22%20y%3D%2230%22%20width%3D%22170%22%20height%3D%22182%22%20rx%3D%2244%22%20ry%3D%2244%22%20fill%3D%22url(%23aw)%22%20mask%3D%22url(%23awm)%22%2F%3E%3Crect%20x%3D%2222%22%20y%3D%2238%22%20width%3D%22154%22%20height%3D%22166%22%20rx%3D%2238%22%20ry%3D%2238%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%22184%22%20y%3D%2288%22%20width%3D%2214%22%20height%3D%2236%22%20rx%3D%227%22%20fill%3D%22url(%23aw)%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?auto=format&fit=crop&w=800&q=80",
    "natural_width": 198,
    "natural_height": 242,
    "screen_slot": "{\"x\":22,\"y\":38,\"width\":154,\"height\":166,\"rx\":38,\"ry\":38}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":198,\"height\":242},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":20,\"offsetY\":10,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":22,\"y\":38,\"width\":154,\"height\":166,\"rx\":38,\"ry\":38}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "apple",
      "watch",
      "wearable"
    ]
  },
  {
    "id": "apple-watch-clay",
    "name": "Apple Watch Clay",
    "slug": "apple-watch-clay",
    "category": "Wearables",
    "style": "clay",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20198%20242%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22awc%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23EAE8F0%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23D0CDE0%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22awcm%22%3E%3Crect%20x%3D%2214%22%20y%3D%2230%22%20width%3D%22170%22%20height%3D%22182%22%20rx%3D%2244%22%20ry%3D%2244%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2222%22%20y%3D%2238%22%20width%3D%22154%22%20height%3D%22166%22%20rx%3D%2238%22%20ry%3D%2238%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%2248%22%20y%3D%220%22%20width%3D%22102%22%20height%3D%2246%22%20rx%3D%2214%22%20fill%3D%22%23D0CDE0%22%2F%3E%3Crect%20x%3D%2248%22%20y%3D%22196%22%20width%3D%22102%22%20height%3D%2246%22%20rx%3D%2214%22%20fill%3D%22%23D0CDE0%22%2F%3E%3Crect%20x%3D%2214%22%20y%3D%2230%22%20width%3D%22170%22%20height%3D%22182%22%20rx%3D%2244%22%20ry%3D%2244%22%20fill%3D%22url(%23awc)%22%20mask%3D%22url(%23awcm)%22%2F%3E%3Crect%20x%3D%2222%22%20y%3D%2238%22%20width%3D%22154%22%20height%3D%22166%22%20rx%3D%2238%22%20ry%3D%2238%22%20fill%3D%22%23F0EEF8%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1555375771-14b2a63968a4?auto=format&fit=crop&w=800&q=80",
    "natural_width": 198,
    "natural_height": 242,
    "screen_slot": "{\"x\":22,\"y\":38,\"width\":154,\"height\":166,\"rx\":38,\"ry\":38}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":198,\"height\":242},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":24,\"offsetY\":12,\"color\":\"rgba(0,0,0,0.22)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":22,\"y\":38,\"width\":154,\"height\":166,\"rx\":38,\"ry\":38}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "apple",
      "watch",
      "clay"
    ]
  },
  {
    "id": "galaxy-watch",
    "name": "Samsung Galaxy Watch",
    "slug": "galaxy-watch",
    "category": "Wearables",
    "style": "realistic",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20220%20260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22gw%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%232A2A2A%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%231A1A1A%22%2F%3E%3C%2FlinearGradient%3E%3Cmask%20id%3D%22gwm%22%3E%3Crect%20x%3D%2210%22%20y%3D%2228%22%20width%3D%22200%22%20height%3D%22204%22%20rx%3D%2296%22%20ry%3D%2296%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2238%22%20width%3D%22180%22%20height%3D%22184%22%20rx%3D%2286%22%20ry%3D%2286%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%2275%22%20y%3D%220%22%20width%3D%2270%22%20height%3D%2244%22%20rx%3D%2212%22%20fill%3D%22%232A2A2A%22%2F%3E%3Crect%20x%3D%2275%22%20y%3D%22216%22%20width%3D%2270%22%20height%3D%2244%22%20rx%3D%2212%22%20fill%3D%22%232A2A2A%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2228%22%20width%3D%22200%22%20height%3D%22204%22%20rx%3D%2296%22%20ry%3D%2296%22%20fill%3D%22url(%23gw)%22%20mask%3D%22url(%23gwm)%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2238%22%20width%3D%22180%22%20height%3D%22184%22%20rx%3D%2286%22%20ry%3D%2286%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2228%22%20width%3D%22200%22%20height%3D%22204%22%20rx%3D%2296%22%20ry%3D%2296%22%20fill%3D%22none%22%20stroke%3D%22%233A3A3C%22%20stroke-width%3D%224%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1523475496153-3206d98d07ca?auto=format&fit=crop&w=800&q=80",
    "natural_width": 220,
    "natural_height": 260,
    "screen_slot": "{\"x\":20,\"y\":38,\"width\":180,\"height\":184,\"rx\":86,\"ry\":86}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":220,\"height\":260},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":20,\"offsetY\":10,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":20,\"y\":38,\"width\":180,\"height\":184,\"rx\":86,\"ry\":86}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "samsung",
      "galaxy",
      "watch",
      "round"
    ]
  },
  {
    "id": "dual-phone",
    "name": "Dual Phone Showcase",
    "slug": "dual-phone",
    "category": "Scenes",
    "style": "scene",
    "image_url": "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20860%20852%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cmask%20id%3D%22dpm1%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2254%22%20ry%3D%2254%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22373%22%20height%3D%22832%22%20rx%3D%2246%22%20ry%3D%2246%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3Cmask%20id%3D%22dpm2%22%3E%3Crect%20x%3D%22467%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2254%22%20ry%3D%2254%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%22477%22%20y%3D%2210%22%20width%3D%22373%22%20height%3D%22832%22%20rx%3D%2246%22%20ry%3D%2246%22%20fill%3D%22%23000%22%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2254%22%20ry%3D%2254%22%20fill%3D%22%231C1C1E%22%20mask%3D%22url(%23dpm1)%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22373%22%20height%3D%22832%22%20rx%3D%2246%22%20ry%3D%2246%22%20fill%3D%22%230a0a0a%22%2F%3E%3Crect%20x%3D%22143%22%20y%3D%2218%22%20width%3D%22107%22%20height%3D%2228%22%20rx%3D%2214%22%20fill%3D%22%23000%22%2F%3E%3Crect%20x%3D%22467%22%20y%3D%220%22%20width%3D%22393%22%20height%3D%22852%22%20rx%3D%2254%22%20ry%3D%2254%22%20fill%3D%22%23E8E8EA%22%20mask%3D%22url(%23dpm2)%22%2F%3E%3Crect%20x%3D%22477%22%20y%3D%2210%22%20width%3D%22373%22%20height%3D%22832%22%20rx%3D%2246%22%20ry%3D%2246%22%20fill%3D%22%23FAFAFA%22%2F%3E%3Crect%20x%3D%22610%22%20y%3D%2218%22%20width%3D%22107%22%20height%3D%2228%22%20rx%3D%2214%22%20fill%3D%22%23E0E0E2%22%2F%3E%3C%2Fsvg%3E",
    "featured_image": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    "natural_width": 860,
    "natural_height": 852,
    "screen_slot": "{\"x\":10,\"y\":10,\"width\":373,\"height\":832,\"rx\":46,\"ry\":46}",
    "spec": "{\"version\":\"1.0\",\"type\":\"smartMockup\",\"layout\":{\"width\":860,\"height\":852},\"layers\":[{\"id\":\"shadow\",\"type\":\"shadow\",\"blur\":36,\"offsetY\":18,\"color\":\"rgba(0,0,0,0.4)\"},{\"id\":\"slot\",\"type\":\"screenSlot\",\"x\":10,\"y\":10,\"width\":373,\"height\":832,\"rx\":46,\"ry\":46}]}",
    "is_builtin": true,
    "is_premium": false,
    "tags": [
      "dual",
      "phones",
      "showcase"
    ]
  }
];
  const CHUNK = 10;
  for (let i = 0; i < mockups.length; i += CHUNK) {
    await knex('mockups').insert(mockups.slice(i, i + CHUNK));
  }
  console.log('✅ Seeded ' + mockups.length + ' device mockups (Phones/Tablets/Desktops/Browsers/Wearables/Scenes)');
}

module.exports = { seedMockups };