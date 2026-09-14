

## Codely Structured Memories

### User

### Feedback

### Project
- [2026-08-06 16:21:49] Photography Pixel — creative media showcase. Vanilla JS SPA router + prerendered HTML pages (build.mjs). R2 bucket used as video CDN (live URLs in data/ugc.txt). CSP is strict (style-src 'self', script-src 'self' 'unsafe-inline'). No frameworks, no build tools beyond a custom Node.js prerender script. **build.mjs requires data/config.json to exist** (can be empty stub `{ "categories": {}, "_static_pages": {} }`) — script.js also fetches it at runtime via fetch(). Home page is UGC-only: loads videos exclusively from data/ugc.txt, no other TXT files. Theme: black/gold/white luxury (Deep Black #0a0a0a bg, Metallic Gold #D4AF37 accent, White #fff text). Deployed at ugc-studio-3.vercel.app.**Continuous product decisions:** Fixed top nav/header COMPLETELY REMOVED — no logo/name/hamburger bar; page starts at very top, no header padding reserved (user removed it in prior session). Home uses a custom in-page video player: no autoplay (manual play only), exclusive playback (only one video at a time via pauseOtherReels), mute state persisted to localStorage, lazy-loaded via video.src + data-video-src (no <source> elements — using them caused a race-condition error overlay earlier).





### Reference

