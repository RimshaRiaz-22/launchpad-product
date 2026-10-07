// backend/src/database/seeds/build_font_dataset.js
// Fetches official Google Fonts dataset, applies curation & quality scoring,
// and saves 562 modern web fonts to google_fonts_562.json.
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_URL = 'https://raw.githubusercontent.com/jonathantneal/google-fonts-complete/master/google-fonts.json';
const OUTPUT_FILE = path.join(__dirname, 'data', 'google_fonts_562.json');

console.log('🌐 Fetching Google Fonts dataset from GitHub...');

https.get(DATA_URL, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed to download font data. HTTP Status:', res.statusCode);
    process.exit(1);
  }

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      console.log('⚙️ Parsing and curating Google Fonts dataset...');
      const raw = JSON.parse(data);

      const curated = {
        'sans-serif': [],
        'serif': [],
        'display': [],
        'handwriting': [],
        'monospace': []
      };

      // Comprehensive curated list of world-class modern fonts
      const priorityList = new Set([
        'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins', 'Outfit',
        'Plus Jakarta Sans', 'Urbanist', 'Sora', 'DM Sans', 'Work Sans', 'Manrope',
        'Lexend', 'Figtree', 'Nunito', 'Space Grotesk', 'Syne', 'Instrument Sans',
        'Onest', 'Rubik', 'Raleway', 'Nunito Sans', 'Quicksand', 'Barlow', 'PT Sans',
        'Ubuntu', 'Mukta', 'Kanit', 'Heebo', 'Prompt', 'Overpass', 'Titillium Web',
        'Assistant', 'Mulish', 'Jost', 'Cabin', 'Karla', 'Chivo', 'Albert Sans',
        'Red Hat Display', 'Bricolage Grotesque', 'Archivo', 'Epilogue', 'Be Vietnam Pro',
        'Public Sans', 'Exo 2', 'Hind', 'Catamaran', 'Signika', 'Asap', 'Dosis',
        'Maven Pro', 'Noto Sans', 'Fira Sans', 'Oxygen', 'Varela Round', 'Questrial',
        'Playfair Display', 'Merriweather', 'Lora', 'Cinzel', 'Cormorant Garamond',
        'EB Garamond', 'Bodoni Moda', 'Fraunces', 'Spectral', 'Newsreader',
        'DM Serif Display', 'Libre Baskerville', 'Prata', 'Marcellus', 'PT Serif',
        'Crimson Text', 'Bitter', 'Arvo', 'Castoro', 'Cormorant', 'Noto Serif',
        'Bree Serif', 'Zilla Slab', 'Rokkitt', 'Domine', 'Faustina', 'Besley',
        'Vollkorn', 'Cardo', 'Frank Ruhl Libre', 'Alice', 'Cinzel Decorative',
        'Bebas Neue', 'Anton', 'Righteous', 'Oswald', 'Titan One', 'Cabinet Grotesk',
        'Dela Gothic One', 'Black Han Sans', 'Archivo Black', 'Paytone One', 'Abril Fatface',
        'Bangers', 'Bungee', 'Shrikhand', 'Ultra', 'Faster One', 'Monoton', 'Megrim',
        'Rye', 'Press Start 2P', 'Creepster', 'Special Elite', 'Comfortaa', 'Lobster',
        'Fredoka', 'Passion One', 'Changa One', 'Sigmar One', 'Fugaz One', 'Luckiest Guy',
        'JetBrains Mono', 'Fira Code', 'Space Mono', 'Roboto Mono', 'Inconsolata',
        'Source Code Pro', 'IBM Plex Mono', 'Red Hat Mono', 'Major Mono Display',
        'Share Tech Mono', 'Nova Mono', 'Courier Prime', 'Cutive Mono', 'Anonymous Pro',
        'VT323', 'Ubuntu Mono', 'Overpass Mono', 'Nanum Gothic Coding', 'Syne Mono',
        'DM Mono', 'Azeret Mono', 'Caveat', 'Dancing Script', 'Pacifico', 'Great Vibes',
        'Satisfy', 'Sacramento', 'Alex Brush', 'Kalam', 'Shadows Into Light',
        'Permanent Marker', 'Yellowtail', 'Marck Script', 'Allura', 'Tangerine',
        'Parisienne', 'Cookie', 'Kaushan Script', 'Bad Script', 'Covered By Your Grace',
        'Gloria Hallelujah', 'Homemade Apple', 'Nothing You Could Do', 'Reenie Beanie',
        'Rochester', 'Damion', 'Gochi Hand', 'Indie Flower', 'Just Another Hand',
        'Patrick Hand', 'Rock Salt', 'Walter Turncoat', 'Zeyada'
      ]);

      for (const [name, meta] of Object.entries(raw)) {
        if (!meta.subsets || (!meta.subsets.includes('latin') && !meta.subsets.includes('latin-ext'))) continue;
        const cat = meta.category;
        if (!curated.hasOwnProperty(cat)) continue;

        const normalVariants = meta.variants?.normal || {};
        const weights = Object.keys(normalVariants)
          .map(w => parseInt(w, 10))
          .filter(w => !isNaN(w) && w >= 100 && w <= 900)
          .sort((a, b) => a - b);
        if (weights.length === 0) continue;

        let score = (priorityList.has(name) ? 2000 : 0) + weights.length * 20;
        if (weights.includes(400)) score += 15;
        if (weights.includes(700)) score += 15;
        if (weights.includes(600)) score += 10;
        if (weights.includes(500)) score += 10;
        if (meta.variants?.italic) score += Object.keys(meta.variants.italic).length * 5;

        curated[cat].push({ name, category: cat, weights, score });
      }

      for (const cat of Object.keys(curated)) {
        curated[cat].sort((a, b) => b.score - a.score);
      }

      const limits = {
        'sans-serif': 220,
        'serif': 130,
        'display': 110,
        'monospace': 42,
        'handwriting': 60
      };

      const slugify = (str) =>
        str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const fallbackMap = {
        'sans-serif': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'serif': 'Georgia, Cambria, "Times New Roman", Times, serif',
        'display': 'system-ui, -apple-system, sans-serif',
        'monospace': 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
        'handwriting': '"Brush Script MT", cursive, sans-serif',
      };

      const finalFonts = [];

      for (const [cat, limit] of Object.entries(limits)) {
        const selected = curated[cat].slice(0, limit);
        for (const item of selected) {
          const id = slugify(item.name);
          const nameParam = encodeURIComponent(item.name).replace(/%20/g, '+');
          const weightsStr = item.weights.join(';');
          const fontUrl = item.weights.length > 0
            ? `https://fonts.googleapis.com/css2?family=${nameParam}:wght@${weightsStr}&display=swap`
            : `https://fonts.googleapis.com/css2?family=${nameParam}&display=swap`;

          const fallback = fallbackMap[item.category] || 'sans-serif';
          const family = `"${item.name}", ${fallback}`;

          finalFonts.push({
            id,
            name: item.name,
            family,
            category: item.category,
            font_url: fontUrl,
            weights: item.weights,
            is_builtin: true,
          });
        }
      }

      fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalFonts, null, 2), 'utf8');
      console.log(`✅ Success! Saved ${finalFonts.length} curated Google Fonts to ${OUTPUT_FILE}`);
    } catch (err) {
      console.error('Error processing font data:', err);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('HTTPS request error:', err.message);
  process.exit(1);
});
