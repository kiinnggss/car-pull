import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');

function walkFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (/\.(ts|tsx|css|sql|json)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA, hexB) {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 1. Repo cleanup checks
assert.equal(
  fs.existsSync(path.join(ROOT, '26401340.jpg')),
  false,
  'Unused 2.9MB 26401340.jpg must be removed from repo root'
);

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
assert.equal(pkg.dependencies?.['canvas-confetti'], undefined, 'canvas-confetti must not be in dependencies');
assert.equal(pkg.dependencies?.['@types/canvas-confetti'], undefined, '@types/canvas-confetti must not be in dependencies');
assert.ok(pkg.dependencies?.['@supabase/supabase-js'], '@supabase/supabase-js must be listed in dependencies');

// 2. Scan src/ for banned tokens and confetti remnants
const srcFiles = walkFiles(SRC_DIR);
const bannedTokens = ['#C8FF00', '#D4FF33', '#B5EB00', 'canvas-confetti'];
for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const token of bannedTokens) {
    assert.equal(
      content.toLowerCase().includes(token.toLowerCase()),
      false,
      `Banned token "${token}" found in ${path.relative(ROOT, file)}`
    );
  }
}

// 3. Automated WCAG contrast checks across every theme in src/lib/themes.ts
const themesSource = fs.readFileSync(path.join(SRC_DIR, 'lib/themes.ts'), 'utf8');
const themeBlocks = [...themesSource.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?previewSidebar:\s*'[^']+',\s*\}/g)];
assert.ok(themeBlocks.length >= 6, `Expected at least 6 themes, found ${themeBlocks.length}`);

function extractHexField(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*'(#(?:[0-9A-Fa-f]{6}))'`));
  assert.ok(m, `Missing hex field "${field}" in theme block`);
  return m[1];
}

for (const match of themeBlocks) {
  const [block, id] = match;
  const bgCanvas = extractHexField(block, 'bgCanvas');
  const bgSheet = extractHexField(block, 'bgSheet');
  const textPrimary = extractHexField(block, 'textPrimary');
  const accentPrimary = extractHexField(block, 'accentPrimary');
  const accentPrimaryFg = extractHexField(block, 'accentPrimaryFg');

  const canvasRatio = contrastRatio(textPrimary, bgCanvas);
  const sheetRatio = contrastRatio(textPrimary, bgSheet);
  const accentRatio = contrastRatio(accentPrimaryFg, accentPrimary);

  assert.ok(
    canvasRatio >= 4.5,
    `Theme "${id}" textPrimary on bgCanvas contrast too low: ${canvasRatio.toFixed(2)}:1`
  );
  assert.ok(
    sheetRatio >= 4.5,
    `Theme "${id}" textPrimary on bgSheet contrast too low: ${sheetRatio.toFixed(2)}:1`
  );
  assert.ok(
    accentRatio >= 3.5,
    `Theme "${id}" accentPrimaryFg on accentPrimary contrast too low: ${accentRatio.toFixed(2)}:1`
  );
}

// 4. Schema & realtime checks
const schemaSql = fs.readFileSync(path.join(SRC_DIR, 'lib/db/schema.sql'), 'utf8');
assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS commute_matches'), 'schema.sql must define commute_matches');
assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS chat_messages'), 'schema.sql must define chat_messages');
assert.ok(schemaSql.includes('supabase_realtime'), 'schema.sql must configure supabase_realtime publication');

// 5. Live tracking & WhatsApp share presence checks
const liveTrackingSrc = fs.readFileSync(path.join(SRC_DIR, 'lib/liveTracking.ts'), 'utf8');
assert.ok(liveTrackingSrc.includes('interpolateAlongPolyline'), 'liveTracking.ts must export interpolateAlongPolyline');
assert.ok(liveTrackingSrc.includes('openWhatsAppTripShare'), 'liveTracking.ts must export openWhatsAppTripShare');

console.log(
  `Smoke checks passed: ${themeBlocks.length} themes verified for contrast, ${srcFiles.length} source files clean, Supabase schema & live tracking verified.`
);
