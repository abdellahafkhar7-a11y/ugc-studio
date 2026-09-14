

## Codely Structured Memories

### User

### Feedback
- [2026-09-14 13:53:25] Before any commit: run git status and stage files explicitly — never `git add .` / `-A` in this repo. The user edits the project (styles.css, images) concurrently while I work. **Why:** 2026-09-14 deploy-fix session hit surprise mid-task working-tree diffs that were the user's own in-progress redesign (avatar-ring 510px, swapped images), not my changes. **How to apply:** every commit here — stage intended files only, leave unrelated modified files uncommitted.

### Project
- [2026-09-14 13:52:55] Photography Pixel — creative media showcase. Vanilla JS SPA router + prerendered HTML pages (build.mjs). R2 bucket used as video CDN (live URLs in data/ugc.txt). CSP is strict (style-src 'self', script-src 'self' 'unsafe-inline'). No frameworks, no build tools beyond a custom Node.js prerender script. **build.mjs requires data/config.json to exist** (can be empty stub `{ "categories": {}, "_static_pages": {} }`) — script.js also fetches it at runtime via fetch(). Home page is UGC-only: loads videos exclusively from data/ugc.txt, no other TXT files. Theme since 2026-09-14 rebrand: blue/white/black professional (Deep Black #0a0a0a bg, Electric Blue #2F7BFF accent, Light Blue #8FB8FF secondary, White #fff text) — old black/gold palette fully removed. Deployed at ugc-studio-3.vercel.app (Vercel, URLs kept intentionally) and on Cloudflare Workers (worker poromo-photography-pixel, GitHub auto-deploy).**Continuous product decisions:** Fixed top nav/header COMPLETELY REMOVED — no logo/name/hamburger bar; page starts at very top, no header padding reserved (user removed it in prior session). Home uses a custom in-page video player: no autoplay (manual play only), exclusive playback (only one video at a time via pauseOtherReels), mute state persisted to localStorage, lazy-loaded via video.src + data-video-src (no <source> elements — using them caused a race-condition error overlay earlier).
- [2026-09-14 13:53:25] Cloudflare Workers deploy (added 2026-09-14): wrangler.jsonc sets assets.directory=./dist; wrangler's build.command runs `npm run build && node prep-dist.mjs`, which copies only website files (pages, assets/, data/, css/js, manifest, robots, sitemap, _headers, _redirects) into dist/. **Why:** wrangler 4.x has NO assets.exclude support (schema rejects it, verified empirically) and the old auto-generated config used directory "." so deploys failed with "Asset too large — node_modules/workerd 148 MiB" (25 MiB asset limit). **How to apply:** deploy command stays plain `npx wrangler deploy`; to change what ships, edit prep-dist.mjs; never point assets.directory at the repo root. Git safe.directory exception was added for this repo on 2026-09-14.

### Reference

