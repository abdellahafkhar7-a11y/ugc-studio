/**
 * Prep Dist — UGC Studio
 *
 * Assembles the deployable static site into /dist for Cloudflare
 * Workers Static Assets. Wrangler deploys exactly this directory
 * (see wrangler.jsonc), so node_modules and other development /
 * build tooling are never uploaded as website assets.
 *
 * The prerender build must run first — wrangler.jsonc wires the
 * full sequence via assets.build.command:
 *   npm run build && node prep-dist.mjs && npx wrangler deploy
 *
 * Run:    node prep-dist.mjs   (normally invoked by wrangler deploy)
 * Output: /dist — the complete static website
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');

// Root-level files that are dev/build tooling, not website content.
const SKIP_FILES = new Set([
  'package.json',
  'package-lock.json',
  'build.mjs',
  'prep-dist.mjs',
  'wrangler.jsonc',
  'wrangler.toml',
  'CODELY.md',
  'Thumbs.db',
]);

// Directories that never belong in the deployed site.
const SKIP_DIRS = new Set(['node_modules', 'dist']);

function countFiles(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += countFiles(full);
    else total++;
  }
  return total;
}

function prepare() {
  if (!fs.existsSync(path.join(__dirname, 'index.html'))) {
    console.error('✘ index.html not found — run "npm run build" before "node prep-dist.mjs".');
    process.exit(1);
  }

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST);

  let items = 0;
  for (const entry of fs.readdirSync(__dirname, { withFileTypes: true })) {
    const name = entry.name;
    // Skip hidden entries (.git, .env, .codely-cli, …), build tooling
    // dirs and non-website files so only the site lands in /dist.
    if (name.startsWith('.') || SKIP_DIRS.has(name)) continue;
    if (entry.isFile() && (SKIP_FILES.has(name) || /\.(log|tmp|bak|swp)$/i.test(name))) continue;

    fs.cpSync(path.join(__dirname, name), path.join(DIST, name), {
      recursive: true,
      filter: (src) => !/(Thumbs\.db|\.DS_Store)$/i.test(path.basename(src)),
    });
    items++;
  }

  console.log(`━━━ Prep Dist ━━━`);
  console.log(`  ✓ dist/ assembled — ${countFiles(DIST)} files from ${items} top-level items`);
}

prepare();
