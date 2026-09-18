// ============================================
// SCROLL RESTORATION
// Prevent browser from restoring scroll position on reload
// ============================================
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ============================================
// DOM REFERENCES
// ============================================
const year = document.querySelector('#year');
const mediaOpeners = document.querySelectorAll('[data-lightbox-src]');
const imageModal = document.querySelector('#image-modal');
const modalImage = imageModal ? imageModal.querySelector('img') : null;
const modalClose = imageModal ? imageModal.querySelector('.modal-close') : null;
const menuPanel = document.querySelector('#menu-panel');
const menuClose = document.querySelector('#menu-close');
const menuItems = document.querySelectorAll('.menu-item');
let navItems = Array.from(document.querySelectorAll('[data-nav]'));

// ============================================
// UTILITIES
// ============================================
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function pauseAllVideos() {
  document.querySelectorAll('video').forEach(video => {
    if (!video.paused) video.pause();
    var card = video.closest('.reel-card');
    if (card) {
      card.classList.remove('is-playing');
      card.classList.add('is-paused');
      updatePlayIcon(card, false);
    }
  });
}

// Attach loading-state event handlers to a reel card's video element
function initVideoLoadingHandlers(card, video) {
  if (!card || !video) return;

  video.addEventListener('loadstart', () => card.classList.add('loading'));
  video.addEventListener('loadedmetadata', () => card.classList.remove('loading'));
  video.addEventListener('loadeddata', () => card.classList.remove('loading'));
  video.addEventListener('canplay', () => card.classList.remove('loading'));
  video.addEventListener('canplaythrough', () => card.classList.remove('loading'));
  video.addEventListener('waiting', () => card.classList.add('loading'));
  video.addEventListener('playing', () => card.classList.remove('loading'));

  // Fallback: remove loading state after 8s (generous for slow networks)
  setTimeout(() => card.classList.remove('loading'), 8000);
}

// Disable context menu on all videos (download protection)
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'VIDEO') e.preventDefault();
});

// ============================================
// VIDEO CATEGORIES — TXT File System
// ============================================

const CATEGORIES = [
  { slug: 'ugc',      label: 'UGC',       txt: 'ugc.txt',     route: 'ugc',      icon: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>' }
];

// Build categoryLabels from CATEGORIES
const categoryLabels = {};
CATEGORIES.forEach(c => { categoryLabels[c.slug] = c.label; });

// Static nav items rendered in the expanded section (no TXT data files)
const EXPANDED_NAV_ITEMS = [
  { label: 'Model',       nav: 'models',      href: '/model',       icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
  { label: 'Media Buyer', nav: 'media-buyer', href: '/media-buyer', icon: '<path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>' },
  { label: 'Voice Over',  nav: 'voiceover',   href: '/voice-over',  icon: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>' }
];

// ============================================
// CENTRAL CONFIG — Loaded from data/config.json
// All editable content (titles, descriptions, SEO, etc.) is stored
// in data/config.json. Edit that single file to customize the site.
// ============================================
let siteConfig = null;

async function loadSiteConfig() {
  try {
    const response = await fetch('data/config.json');
    if (!response.ok) return;
    siteConfig = await response.json();
  } catch {
    siteConfig = null;
  }
}

// Get a config value for a category slug, with fallback
function getConfig(slug, key, fallback) {
  if (!siteConfig || !siteConfig.categories || !siteConfig.categories[slug]) return fallback;
  const val = siteConfig.categories[slug][key];
  return (val !== undefined && val !== '') ? val : fallback;
}

// Build pageMeta from config (replaces hardcoded pageMeta object)
// Fallback values ensure the site works even if config.json hasn't loaded yet.
function buildPageMeta() {
  const meta = {};

  // Static pages — from config or hardcoded fallbacks
  const sp = (siteConfig && siteConfig._static_pages) ? siteConfig._static_pages : {};
  meta['home'] = {
    title: sp.home ? sp.home.seoTitle : DEFAULT_TITLE,
    desc: sp.home ? sp.home.seoDescription : DEFAULT_DESC,
    crumb: sp.home ? sp.home.crumb : 'Home'
  };
  meta['home-portfolio'] = {
    title: (sp['home-portfolio'] && sp['home-portfolio'].seoTitle) || 'Portfolio | UGC Studio',
    desc: (sp['home-portfolio'] && sp['home-portfolio'].seoDescription) || 'استعرض أحدث أعمالنا الإبداعية: فيديوهات UGC، تصوير، محلات تجارية، أعراس وخدمات احترافية في أيت ملول - أكادير.',
    crumb: (sp['home-portfolio'] && sp['home-portfolio'].crumb) || 'Portfolio'
  };
  meta['home-contact'] = {
    title: (sp['home-contact'] && sp['home-contact'].seoTitle) || 'Contact | UGC Studio',
    desc: (sp['home-contact'] && sp['home-contact'].seoDescription) || 'تواصل مع وكالة UGC Studio لخدمات التصوير والتسويق الرقمي في أيت ملول - أكادير. واتساب، إنستغرام، بريد إلكتروني.',
    crumb: (sp['home-contact'] && sp['home-contact'].crumb) || 'Contact'
  };
  meta['equipment'] = {
    title: (sp.equipment && sp.equipment.seoTitle) || 'Equipment | UGC Studio',
    desc: (sp.equipment && sp.equipment.seoDescription) || 'تعرف على معدات الاستوديو الاحترافية المستخدمة في وكالة UGC Studio.',
    crumb: (sp.equipment && sp.equipment.crumb) || 'Equipment'
  };

  // Category pages (cat-{slug})
  CATEGORIES.forEach(cat => {
    const pageKey = 'cat-' + cat.slug;
    meta[pageKey] = {
      title: getConfig(cat.slug, 'seoTitle', cat.label + ' | UGC Studio'),
      desc: getConfig(cat.slug, 'seoDescription', ''),
      crumb: getConfig(cat.slug, 'label', cat.label)
    };
  });

  // Expanded nav items (models, media-buyer, voiceover)
  EXPANDED_NAV_ITEMS.forEach(item => {
    meta[item.nav] = {
      title: getConfig(item.nav, 'seoTitle', item.label + ' | UGC Studio'),
      desc: getConfig(item.nav, 'seoDescription', ''),
      crumb: getConfig(item.nav, 'label', item.label)
    };
  });

  return meta;
}

// Apply config values to static HTML pages (models, media-buyer, voiceover)
function applyConfigToStaticPages() {
  if (!siteConfig) return;

  const pageMap = {
    'page-models': 'models',
    'page-media-buyer': 'media-buyer',
    'page-voiceover': 'voiceover',
    'page-equipment': 'equipment'
  };

  for (const [pageId, slug] of Object.entries(pageMap)) {
    const page = document.getElementById(pageId);
    if (!page) continue;
    const catConfig = siteConfig.categories && siteConfig.categories[slug];
    if (!catConfig) continue;

    const heading = page.querySelector('.sub-page-heading');
    if (heading && catConfig.title) heading.textContent = catConfig.title;

    const subtitle = page.querySelector('.sub-page-subtitle');
    if (subtitle && catConfig.subtitle) subtitle.textContent = catConfig.subtitle;
  }
}

// Cache for fetched category URLs — avoids duplicate network requests
// when getSearchIndex() re-reads the same TXT files after loadVideoCategories()
const categoryUrlCache = {};

// Fetch a TXT file and return an array of validated, deduplicated URLs
async function fetchCategoryUrls(txtFile) {
  if (categoryUrlCache[txtFile]) return categoryUrlCache[txtFile];

  try {
    const response = await fetch('data/' + txtFile);
    if (!response.ok) return [];
    const text = await response.text();

    // Remove UTF-8 BOM if present
    const cleaned = text.replace(/^\uFEFF/, '');

    const seen = new Set();
    const urls = [];

    for (const line of cleaned.split(/\r?\n/)) {
      const url = line.trim();
      if (!url) continue;
      if (!/^https:\/\//.test(url)) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }

    categoryUrlCache[txtFile] = urls;
    return urls;
  } catch {
    return [];
  }
}

function createReelCard(url) {
var card = document.createElement('article');
card.className = 'reel-card is-paused';
card.setAttribute('data-url', url);

card.innerHTML =
'<div class="reel-media">' +
'<video data-video-src="' + url + '" muted loop playsinline webkit-playsinline preload="none" disablePictureInPicture controlsList="nodownload noplaybackrate" oncontextmenu="return false">' +
'</video>' +
'<div class="reel-error" hidden>' +
'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
'<polyline points="17 8 12 3 7 8"/>' +
'<line x1="12" y1="3" x2="12" y2="15"/>' +
'</svg>' +
'<span>Unable to load video</span>' +
'</div>' +
'</div>' +

'<button class="reel-center-play" type="button" aria-label="Play">' +
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">' +
    '<path d="M8 5v14l11-7z"/>' +
  '</svg>' +
'</button>' +

'<div class="reel-controls">' +
  '<div class="reel-progress" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">' +
    '<div class="reel-progress-buffer"></div>' +
    '<div class="reel-progress-fill"></div>' +
  '</div>' +

  '<div class="reel-ctrl-row">' +

    '<button class="reel-btn reel-play" type="button" aria-label="Play">' +
      '<svg class="ic-play" viewBox="0 0 24 24" fill="currentColor">' +
        '<path d="M8 5v14l11-7z"/>' +
      '</svg>' +
      '<svg class="ic-pause" viewBox="0 0 24 24" fill="currentColor">' +
        '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' +
      '</svg>' +
    '</button>' +

    '<button class="reel-btn reel-mute" type="button" aria-label="Unmute">' +
      '<svg class="ic-vol-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 11 5" fill="currentColor"/>' +
        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
      '</svg>' +
      '<svg class="ic-vol-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 11 5" fill="currentColor"/>' +
        '<line x1="23" y1="9" x2="17" y2="15"/>' +
        '<line x1="17" y1="9" x2="23" y2="15"/>' +
      '</svg>' +
    '</button>' +

    '<span class="reel-time">' +
      '<span class="reel-cur">0:00</span>' +
      '<span class="reel-sep">/</span>' +
      '<span class="reel-dur">0:00</span>' +
'</span>' +

'<button class="reel-btn reel-fs" type="button" aria-label="Enter fullscreen">' +
  '<svg class="ic-fs-enter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M8 3H5a2 2 0 0 0-2 2v3"/>' +
    '<path d="M21 8V5a2 2 0 0 0-2-2h-3"/>' +
    '<path d="M3 16v3a2 2 0 0 0 2 2h3"/>' +
    '<path d="M16 21h3a2 2 0 0 0 2-2v-3"/>' +
  '</svg>' +
  '<svg class="ic-fs-exit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M8 3v3a2 2 0 0 1-2 2H3"/>' +
    '<path d="M21 8h-3a2 2 0 0 1-2-2V3"/>' +
    '<path d="M3 16h3a2 2 0 0 1 2 2v3"/>' +
    '<path d="M16 21v-3a2 2 0 0 1 2-2h3"/>' +
  '</svg>' +
'</button>' +

'</div>' +
'</div>';

return card;
}


// Lazy-load video sources via IntersectionObserver
// Sets video.src directly (no <source> child) then calls load()
const lazyVideoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      var card = entry.target;
      var video = card.querySelector('video');
      if (!video) return;
      var url = video.getAttribute('data-video-src');
      if (url) {
        video.removeAttribute('data-video-src');
        video.src = url;
        video.load();
        console.log('[Reel] Source assigned:', url);
      }
      lazyVideoObserver.unobserve(card);
    }
  });
}, { rootMargin: '400px 0px', threshold: 0.01 });

// ============================================
// CUSTOM VIDEO PLAYER
// Single-active playback · mute persistence · controls auto-hide
// ============================================
const MUTE_KEY = 'ugc3-muted';
let prefersMuted = true;
try { prefersMuted = localStorage.getItem(MUTE_KEY) !== 'false'; } catch (e) {}

function formatTime(sec) {
  if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function pauseOtherReels(activeVideo) {
  document.querySelectorAll('.reel-card video').forEach(function(v) {
    if (v !== activeVideo && !v.paused) {
      v.pause();
      var card = v.closest('.reel-card');
      if (card) {
        card.classList.remove('is-playing');
        card.classList.add('is-paused');
        updatePlayIcon(card, false);
      }
    }
  });
}

function updatePlayIcon(card, playing) {
  var btn = card.querySelector('.reel-play');
  var center = card.querySelector('.reel-center-play');
  if (playing) {
    card.classList.add('is-playing');
    card.classList.remove('is-paused');
    if (btn) btn.setAttribute('aria-label', 'Pause');
    if (center) center.setAttribute('aria-hidden', 'true');
  } else {
    card.classList.remove('is-playing');
    card.classList.add('is-paused');
    if (btn) btn.setAttribute('aria-label', 'Play');
    if (center) center.setAttribute('aria-hidden', 'false');
  }
}

function updateMuteIcon(card, muted) {
  var btn = card.querySelector('.reel-mute');
  if (!btn) return;
  if (muted) {
    btn.setAttribute('aria-label', 'Unmute');
    btn.classList.add('is-muted');
  } else {
    btn.setAttribute('aria-label', 'Mute');
    btn.classList.remove('is-muted');
  }
}

function updateProgress(card, video) {
  var fill = card.querySelector('.reel-progress-fill');
  var buffer = card.querySelector('.reel-progress-buffer');
  var cur = card.querySelector('.reel-cur');
  var dur = card.querySelector('.reel-dur');
  var slider = card.querySelector('.reel-progress');
  var pct = 0, bufPct = 0;
  if (video.duration && isFinite(video.duration)) {
    pct = (video.currentTime / video.duration) * 100;
    if (video.buffered.length > 0) {
      bufPct = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
    }
  }
  if (fill) fill.style.width = pct + '%';
  if (buffer) buffer.style.width = bufPct + '%';
  if (cur) cur.textContent = formatTime(video.currentTime);
  if (dur) dur.textContent = formatTime(video.duration);
  if (slider) slider.setAttribute('aria-valuenow', Math.round(pct));
}

function showControls(card) {
  card.classList.add('show-controls');
  clearTimeout(card._hideTimer);
}

function scheduleHideControls(card, video) {
  clearTimeout(card._hideTimer);
  if (video && !video.paused) {
    card._hideTimer = setTimeout(function() {
      card.classList.remove('show-controls');
    }, 2800);
  }
}

function seekToRatio(video, ratio) {
  if (!video.duration || !isFinite(video.duration)) return;
  ratio = Math.max(0, Math.min(1, ratio));
  video.currentTime = ratio * video.duration;
}

function toggleFullscreen(card, video) {
  var el = card.querySelector('.reel-media') || card;
  if (document.fullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen();
  } else if (el.requestFullscreen) {
    el.requestFullscreen().catch(function() {});
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (video.webkitEnterFullscreen) {
    video.webkitEnterFullscreen();
  }
}

function initCustomPlayer(card, video) {
  var url = card.getAttribute('data-url') || '';

  // Apply remembered mute preference
  video.muted = prefersMuted;
  updateMuteIcon(card, video.muted);

  // Loading skeleton handlers
  video.addEventListener('loadstart', function() {
    card.classList.add('loading');
    console.log('[Reel] loadstart:', url);
  });
  video.addEventListener('loadedmetadata', function() {
    card.classList.remove('loading');
    updateProgress(card, video);
    console.log('[Reel] loadedmetadata:', url, 'duration:', video.duration);
  });
  video.addEventListener('loadeddata', function() {
    card.classList.remove('loading');
    console.log('[Reel] loadeddata:', url);
  });
  video.addEventListener('canplay', function() {
    card.classList.remove('loading');
    console.log('[Reel] canplay:', url);
  });
  video.addEventListener('canplaythrough', function() {
    console.log('[Reel] canplaythrough:', url);
  });
  video.addEventListener('waiting', function() { card.classList.add('loading'); });
  video.addEventListener('playing', function() {
    card.classList.remove('loading');
    console.log('[Reel] playing:', url);
  });
  video.addEventListener('play', function() { console.log('[Reel] play event:', url); });
  video.addEventListener('timeupdate', function() { updateProgress(card, video); });
  video.addEventListener('progress', function() { updateProgress(card, video); });
  video.addEventListener('ended', function() { updatePlayIcon(card, false); });

  // Error handling — only fire when video.error is non-null AND src is set
  video.addEventListener('error', function() {
    var err = video.error;
    console.error('[Reel] error:', url, 'code:', err && err.code, 'networkState:', video.networkState, 'readyState:', video.readyState);
    // Ignore spurious errors when no source has been assigned yet
    if (!err) return;
    if (!video.src || video.src === '') return;
    card.classList.remove('loading');
    card.classList.add('is-error');
    var errEl = card.querySelector('.reel-error');
    if (errEl) errEl.hidden = false;
    var ctrls = card.querySelector('.reel-controls');
    if (ctrls) ctrls.style.display = 'none';
    var cp = card.querySelector('.reel-center-play');
    if (cp) cp.style.display = 'none';
  });

  // Play / pause
  video.addEventListener('play', function() {
    pauseOtherReels(video);
    updatePlayIcon(card, true);
    scheduleHideControls(card, video);
  });
  video.addEventListener('pause', function() {
    updatePlayIcon(card, false);
    showControls(card);
  });

  // Center play / card click
  var centerBtn = card.querySelector('.reel-center-play');
  if (centerBtn) {
    centerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      togglePlay(card, video);
    });
  }
  var media = card.querySelector('.reel-media');
  if (media) {
    media.addEventListener('click', function(e) {
      if (e.target.closest('.reel-controls') || e.target.closest('.reel-error')) return;
      togglePlay(card, video);
    });
  }

  // Controls bar buttons
  var playBtn = card.querySelector('.reel-play');
  if (playBtn) {
    playBtn.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(card, video); });
  }
  var muteBtn = card.querySelector('.reel-mute');
  if (muteBtn) {
    muteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      video.muted = !video.muted;
      prefersMuted = video.muted;
      try { localStorage.setItem(MUTE_KEY, String(!prefersMuted)); } catch (e2) {}
      updateMuteIcon(card, video.muted);
      // Apply to all other reels
      document.querySelectorAll('.reel-card video').forEach(function(v) {
        if (v !== video) { v.muted = prefersMuted; updateMuteIcon(v.closest('.reel-card'), prefersMuted); }
      });
    });
  }
  var fsBtn = card.querySelector('.reel-fs');
  if (fsBtn) {
    fsBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleFullscreen(card, video); });
  }

  // Progress bar interaction
  var progress = card.querySelector('.reel-progress');
  if (progress) {
    var dragging = false;
    function progressPos(clientX) {
      var rect = progress.getBoundingClientRect();
      seekToRatio(video, (clientX - rect.left) / rect.width);
      updateProgress(card, video);
    }
    progress.addEventListener('pointerdown', function(e) {
      dragging = true; progress.setPointerCapture(e.pointerId); progressPos(e.clientX);
    });
    progress.addEventListener('pointermove', function(e) { if (dragging) progressPos(e.clientX); });
    progress.addEventListener('pointerup', function(e) { dragging = false; });
    progress.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); }
      if (e.key === 'ArrowRight') { e.preventDefault(); video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); }
    });
  }

  // Controls auto-hide on activity
  card.addEventListener('pointermove', function() { showControls(card); scheduleHideControls(card, video); });
  card.addEventListener('pointerleave', function() { scheduleHideControls(card, video); });
  card.addEventListener('touchstart', function() { showControls(card); scheduleHideControls(card, video); }, { passive: true });

  // Fullscreen state sync
  document.addEventListener('fullscreenchange', function() {
    var fsBtn2 = card.querySelector('.reel-fs');
    if (fsBtn2) {
      var isFs = document.fullscreenElement === (card.querySelector('.reel-media') || card);
      fsBtn2.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Enter fullscreen');
      card.classList.toggle('is-fullscreen', isFs);
    }
  });
}

function togglePlay(card, video) {
  if (video.paused) {
    video.muted = prefersMuted;
    video.play().catch(function() {
      // Autoplay with sound may be blocked — retry muted
      video.muted = true;
      prefersMuted = true;
      updateMuteIcon(card, true);
      video.play().catch(function() {});
    });
  } else {
    video.pause();
  }
}

// Autoplay disabled — videos play only on user interaction (click/Play button).
// Exclusive playback is enforced via the 'play' event listener in initCustomPlayer.

function registerReelVideo(card, video) {
  initVideoLoadingHandlers(card, video);
  initCustomPlayer(card, video);
  lazyVideoObserver.observe(card);
}

function renderVideoCards(urls, containerId, slug, limit) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  const list = limit ? urls.slice(0, limit) : urls;
  const fragment = document.createDocumentFragment();

  list.forEach(url => {
    const card = createReelCard(url);
    fragment.appendChild(card);

    const video = card.querySelector('video');
    registerReelVideo(card, video);

    card.classList.add('reveal-scale');
    const delay = Math.min(Math.floor(fragment.children.length / 3), 5);
    card.classList.add('reveal-delay-' + (delay + 1));
    revealObserver.observe(card);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);

  forceActivateRevealCards(grid);
}

// Force-activate reveal cards already in viewport (iOS Safari fix)
function forceActivateRevealCards(grid) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      grid.querySelectorAll('.reveal-scale:not(.active), .reveal:not(.active), .reveal-fade:not(.active)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          el.classList.add('active');
        }
      });
    });
  });
}

function ensureCategoryContainers() {
  if (CATEGORIES.length === 0) return;

  const servicesNavMain = document.getElementById('services-nav-main');
  const servicesNavExpanded = document.getElementById('services-nav-expanded');
  const portfolioShell = document.querySelector('.portfolio-shell');
  const mainEl = document.querySelector('main.page');
  if (!portfolioShell) return;

  function createCircleElement(label, nav, href, icon) {
    const circle = document.createElement('a');
    circle.href = href;
    circle.className = 'service-circle';
    circle.setAttribute('data-nav', nav);
    circle.innerHTML =
      '<div class="service-circle-icon">' +
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          icon +
        '</svg>' +
      '</div>' +
      '<span class="service-circle-label">' + label + '</span>';
    return circle;
  }

  CATEGORIES.forEach(cat => {
    const slug = cat.slug;

    // Service circle in nav — main or expanded section
    const navTarget = cat.expanded ? servicesNavExpanded : servicesNavMain;
    const navAttr = 'cat-' + slug;
    if (navTarget && !navTarget.querySelector('[data-nav="' + navAttr + '"]')) {
      navTarget.appendChild(createCircleElement(getConfig(slug, 'label', cat.label), navAttr, '/' + cat.route, cat.icon));
    }

    // Category page-view
    if (!document.getElementById('page-cat-' + slug)) {
      const pageView = document.createElement('div');
      pageView.className = 'page-view';
      pageView.id = 'page-cat-' + slug;
      pageView.setAttribute('data-page', 'cat-' + slug);
      pageView.innerHTML =
        '<section class="sub-page-section reveal">' +
          '<h2 class="sub-page-heading">' + getConfig(slug, 'title', cat.label) + '</h2>' +
          '<p class="sub-page-subtitle">' + getConfig(slug, 'subtitle', cat.label + ' Videos') + '</p>' +
          '<div class="video-grid" data-panel="' + slug + '-full" id="grid-cat-' + slug + '"></div>' +
        '</section>';
      if (mainEl) mainEl.appendChild(pageView);
    }
  });

  // Render static expanded nav items (Model, Media Buyer, Voice Over)
  if (servicesNavExpanded) {
    EXPANDED_NAV_ITEMS.forEach(item => {
      if (!servicesNavExpanded.querySelector('[data-nav="' + item.nav + '"]')) {
        servicesNavExpanded.appendChild(createCircleElement(getConfig(item.nav, 'label', item.label), item.nav, item.href, item.icon));
      }
    });
  }

  // Initialize toggle button
  const toggleBtn = document.getElementById('categories-toggle');
  if (toggleBtn && !toggleBtn._toggleBound) {
    toggleBtn._toggleBound = true;
    toggleBtn.addEventListener('click', function() {
      const isOpen = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!isOpen));
      if (servicesNavExpanded) {
        servicesNavExpanded.setAttribute('aria-hidden', String(isOpen));
        servicesNavExpanded.classList.toggle('open');
      }
    });
  }

  // Refresh navItems collection
  navItems = Array.from(document.querySelectorAll('[data-nav]'));
  navItems.forEach(item => {
    if (item.id === 'menu-btn') return;
    if (item._routerBound) return;
    item._routerBound = true;
    item.addEventListener('click', function(e) {
      const nav = this.dataset.nav;
      if (!nav) return;
      e.preventDefault();
      navigateTo(nav);
      if (menuPanel && menuPanel.classList.contains('active')) closeMenu();
    });
  });
}

async function loadVideoCategories() {
  await loadSiteConfig();
  pageMeta = buildPageMeta();
  applyConfigToStaticPages();
  ensureCategoryContainers();
  handleRoute();

  const urls = await fetchCategoryUrls('ugc.txt');
  if (urls.length > 0) {
    renderVideoCards(urls, 'ugc-video-grid', 'ugc');
    console.log('[UGC Feed] ugc.txt loaded —', urls.length, 'videos detected,', urls.length, 'rendered.');
  } else {
    showUgcEmptyState();
    console.warn('[UGC Feed] ugc.txt is empty or failed to load.');
  }

  await Promise.all(CATEGORIES.map(async cat => {
    const catUrls = await fetchCategoryUrls(cat.txt-induced);
    if (catUrls.length === 0) {
      return;
    }

    renderVideoCards(catUrls, 'grid-cat-' + cat.slug, cat.slug);
  }));

  const searchInput = document.getElementById('video-search-input');
  if (searchInput) initVideoSearch();
}

function showUgcEmptyState() {
  const grid = document.getElementById('ugc-video-grid');
  if (!grid) return;
  grid.innerHTML =
    '<div class="ugc-empty">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>' +
      '</svg>' +
      '<p>No videos available yet.</p>' +
    '</div>';
}

// ============================================
// YEAR
// ============================================
if (year) {
  year.textContent = new Date().getFullYear();
}

// ============================================
// IMAGE PREVIEW / LIGHTBOX
// ============================================
let imageModalLastFocused = null;

function openImagePreview(opener) {
  if (!imageModal || !modalImage) return;

  imageModalLastFocused = opener;
  modalImage.src = opener.dataset.lightboxSrc;
  modalImage.alt = opener.dataset.lightboxAlt || '';
  imageModal.classList.add('active');
  imageModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setTimeout(() => { if (modalClose) modalClose.focus(); }, 100);
}

function closeImagePreview() {
  if (!imageModal || !modalImage) return;

  imageModal.classList.remove('active');
  imageModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  modalImage.removeAttribute('src');
  modalImage.alt = '';
  if (imageModalLastFocused) imageModalLastFocused.focus();
}

mediaOpeners.forEach(opener => {
  opener.addEventListener('click', () => openImagePreview(opener));
});

if (modalClose) {
  modalClose.addEventListener('click', closeImagePreview);
}

if (imageModal) {
  imageModal.addEventListener('click', event => {
    if (event.target === imageModal) closeImagePreview();
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeImagePreview();
  if (event.key === 'Tab' && imageModal && imageModal.classList.contains('active')) {
    const focusable = Array.prototype.slice.call(imageModal.querySelectorAll(
      'button:not([hidden]):not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
});

// ============================================
// VIDEO SEARCH
// ============================================
let searchIndex = null;

async function getSearchIndex() {
  if (searchIndex) return searchIndex;

  searchIndex = [];

  const results = await Promise.all(
    CATEGORIES.map(async cat => {
      const urls = await fetchCategoryUrls(cat.txt);
      return urls.map(url => ({
        title: decodeURIComponent(url.split('/').pop() || '') || url,
        video: url,
        category: cat.slug
      }));
    })
  );

  searchIndex = results.flat();
  return searchIndex;
}

function renderSearchResults(query) {
  const resultsContainer = document.getElementById('video-search-results');
  const grid = document.getElementById('search-results-grid');
  const countEl = document.getElementById('search-results-count');
  const noResultsEl = document.getElementById('search-no-results');
  const featuredPreviews = document.querySelectorAll('.featured-preview');

  if (!resultsContainer || !grid) return;

  if (!query || query.trim() === '') {
    resultsContainer.hidden = true;
    if (noResultsEl) noResultsEl.hidden = true;
    featuredPreviews.forEach(el => el.style.display = '');
    return;
  }

  const q = query.toLowerCase().trim();
  const results = searchIndex.filter(item =>
    (item.title || '').toLowerCase().includes(q)
  );

  featuredPreviews.forEach(el => el.style.display = 'none');
  resultsContainer.hidden = false;

  if (countEl) {
    countEl.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + query.trim() + '"';
  }

  grid.innerHTML = '';

  if (results.length === 0) {
    if (noResultsEl) noResultsEl.hidden = false;
    return;
  }

  if (noResultsEl) noResultsEl.hidden = true;

  const fragment = document.createDocumentFragment();

  results.forEach(item => {
    const card = createReelCard(item.video);
    fragment.appendChild(card);

    const video = card.querySelector('video');
    registerReelVideo(card, video);

    card.classList.add('reveal-scale');
    const delay = Math.min(Math.floor(fragment.children.length / 3), 5);
    card.classList.add('reveal-delay-' + (delay + 1));
    revealObserver.observe(card);
  });

  grid.appendChild(fragment);
  forceActivateRevealCards(grid);
}

function initVideoSearch() {
  const input = document.getElementById('video-search-input');
  if (!input) return;

  const debouncedSearch = debounce(async function() {
    await getSearchIndex();
    renderSearchResults(input.value);
  }, 200);

  input.addEventListener('input', debouncedSearch);
}

// ============================================
// MENU PANEL — Close handlers
// ============================================
let menuLastFocused = null;

function closeMenu() {
  if (!menuPanel) return;
  menuPanel.classList.remove('active');
  menuPanel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
  document.body.style.overscrollBehavior = '';
  if (menuLastFocused) menuLastFocused.focus();
}

if (menuClose) {
  menuClose.addEventListener('click', closeMenu);
}

function openMenu() {
  if (!menuPanel) return;
  menuPanel.classList.add('active');
  menuPanel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none';
  document.body.style.overscrollBehavior = 'none';
  const menuToggleBtn = document.querySelector('#menu-btn');
  if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'true');
  if (menuClose) setTimeout(() => menuClose.focus(), 100);
}

const menuToggleBtn = document.querySelector('#menu-btn');
if (menuToggleBtn) {
  menuToggleBtn.addEventListener('click', function() {
    if (menuPanel && menuPanel.classList.contains('active')) {
      closeMenu();
      menuToggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      openMenu();
    }
  });
}

menuItems.forEach(item => {
  item.addEventListener('click', closeMenu);
});

if (menuPanel) {
  menuPanel.addEventListener('click', e => {
    if (e.target === menuPanel) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuPanel.classList.contains('active')) {
      closeMenu();
    }
    if (e.key === 'Tab' && menuPanel.classList.contains('active')) {
      const focusable = Array.prototype.slice.call(menuPanel.querySelectorAll(
        'button:not([hidden]):not([disabled]), a[href]:not([hidden]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
}

// ============================================
// SPA ROUTER — Clean URL Routing
// ============================================

// Route map: URL path → page name
const ROUTES = {
  'ugc': 'cat-ugc',
  'portfolio': 'home-portfolio',
  'voice-over': 'voiceover',
  'media-buyer': 'media-buyer',
  'model': 'models',
  'contact': 'home-contact',
  'equipment': 'equipment'
};

// Reverse map: page name → URL path
const PAGE_TO_ROUTE = {};
for (const [path, page] of Object.entries(ROUTES)) {
  PAGE_TO_ROUTE[page] = path;
}
PAGE_TO_ROUTE['home'] = '';

// Detect base path once at load time (handles root and subdirectory deployments)
const BASE_PATH = (function() {
  const segments = window.location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return '';

  // If first segment is a known route, we're at root
  if (ROUTES[segments[0]]) return '';

  // If second segment is a known route, first segment is the base
  if (segments.length > 1 && ROUTES[segments[1]]) return '/' + segments[0];

  // No route in URL — entire path (minus filename) is the base
  return window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
})();

function buildUrl(route) {
  return route ? BASE_PATH + '/' + route : BASE_PATH + '/';
}

function getCurrentRoute() {
  let path = window.location.pathname;
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length);
  }
  return path.replace(/^\//, '').replace(/\/$/, '');
}

function navigateTo(pageName) {
  const route = PAGE_TO_ROUTE[pageName] ?? '';
  const currentRoute = getCurrentRoute();

  // Don't push duplicate history entries
  if (route === currentRoute) {
    showPage(pageName);
    return;
  }

  history.pushState({ page: pageName }, '', buildUrl(route));
  showPage(pageName);
}

function handleRoute() {
  const route = getCurrentRoute();
  const pageName = ROUTES[route] || 'home';
  showPage(pageName);
}

window.addEventListener('popstate', handleRoute);

// ============================================
// DYNAMIC SEO META UPDATES
// ============================================
const BASE_URL = 'https://ugc-studio-3.vercel.app';
const DEFAULT_TITLE = 'UGC Studio | وكالة إنتاج محتوى UGC وتصوير وتسويق رقمي في أيت ملول - أكادير';
const DEFAULT_DESC = 'UGC Studio: وكالة إنتاج محتوى UGC وتصوير وتسويق رقمي متخصصة في صناعة المحتوى، تصوير المنتجات، المحلات التجارية، فيديوهات UGC والأعراس في أيت ملول - أكادير.';

// pageMeta is now built dynamically from data/config.json via buildPageMeta().
// Fallback values ensure the site works even if config.json fails to load.
let pageMeta = buildPageMeta();

function updatePageMeta(pageName) {
  const meta = pageMeta[pageName] || pageMeta['home'];

  // Title
  document.title = meta.title;

  // Description
  setMetaContent('meta[name="description"]', meta.desc);

  // Canonical
  const route = PAGE_TO_ROUTE[pageName] ?? '';
  const canonical = BASE_URL + '/' + route;
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) canonicalEl.setAttribute('href', canonical);

  // Open Graph
  setMetaContent('meta[property="og:title"]', meta.title);
  setMetaContent('meta[property="og:description"]', meta.desc);
  setMetaContent('meta[property="og:url"]', canonical);

  // Twitter
  setMetaContent('meta[name="twitter:title"]', meta.title);
  setMetaContent('meta[name="twitter:description"]', meta.desc);

  // BreadcrumbList JSON-LD
  const breadcrumbScripts = document.querySelectorAll('script[type="application/ld+json"]');
  breadcrumbScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'BreadcrumbList') {
        data.itemListElement = [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL + '/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: meta.crumb,
            item: canonical
          }
        ];
        script.textContent = JSON.stringify(data, null, 2);
      }
    } catch (e) { /* skip non-JSON blocks */ }
  });
}

function setMetaContent(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', content);
}

// ============================================
// SPA PAGE NAVIGATION SYSTEM
// ============================================
function showPage(pageName) {
  pauseAllVideos();

  updatePageMeta(pageName);

  // Re-query page views to include dynamically created pages
  const allPageViews = document.querySelectorAll('.page-view');
  allPageViews.forEach(pv => pv.classList.remove('active'));

  const targetPage = document.getElementById('page-' + pageName);
  if (targetPage) {
    targetPage.classList.add('active');
  } else if (pageName.indexOf('home') === 0) {
    const homePage = document.getElementById('page-home');
    if (homePage) homePage.classList.add('active');
  }

  // Update category card active states
  document.querySelectorAll('.services-nav .service-circle, .services-nav-expanded .service-circle').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.nav === pageName) {
      item.classList.add('active');
    }
  });

  // Handle scroll targets for home page
  if (pageName === 'home' || pageName.indexOf('home') === 0) {
    if (pageName === 'home-portfolio') {
      setTimeout(() => {
        const portfolio = document.getElementById('portfolio');
        if (portfolio) portfolio.scrollIntoView(true);
      }, 50);
    } else if (pageName === 'home-contact') {
      setTimeout(() => {
        const contact = document.getElementById('contact');
        if (contact) contact.scrollIntoView(true);
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  } else {
    window.scrollTo(0, 0);
  }

  // Toggle SEO content sections (portfolio/contact unique content)
  document.querySelectorAll('.seo-content-section').forEach(el => {
    el.classList.remove('active');
  });
  if (pageName === 'home-portfolio') {
    const seoSection = document.getElementById('portfolio-intro');
    if (seoSection) seoSection.classList.add('active');
  } else if (pageName === 'home-contact') {
    const seoSection = document.getElementById('contact-info');
    if (seoSection) seoSection.classList.add('active');
  }

  // Trigger reveal observer for newly visible elements
  let revealContainer = targetPage;
  if (!revealContainer && pageName.indexOf('home') === 0) {
    revealContainer = document.getElementById('page-home');
  }
  if (revealContainer) {
    revealContainer.querySelectorAll('.reveal, .reveal-fade, .reveal-scale').forEach(el => {
      if (!el.classList.contains('active')) {
        revealObserver.observe(el);
      }
    });

    // Force-activate reveal elements already in viewport
    forceActivateRevealCards(revealContainer);
  }
}

// Bind static nav items immediately (dynamic items bound in ensureCategoryContainers)
navItems.forEach(item => {
  if (item.id === 'menu-btn') return;
  if (item._routerBound) return;
  item._routerBound = true;
  item.addEventListener('click', function(e) {
    const nav = this.dataset.nav;
    if (!nav) return;
    e.preventDefault();
    navigateTo(nav);
    if (menuPanel && menuPanel.classList.contains('active')) closeMenu();
  });
});

// ============================================
// MODEL BOOKING - WHATSAPP MESSAGE
// Event delegation for dynamic cards
// ============================================
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.model-book-btn');
  if (!btn) return;

  e.preventDefault();

  const card = btn.closest('.model-card');
  if (!card) return;

  const name = card.dataset.modelName || '—';
  const city = card.dataset.modelCity || '—';
  const photo = card.dataset.modelPhoto || '';

  let msg = 'السلام عليكم،\n\n';
  msg += 'أرغب في حجز هذا المودل.\n\n';
  msg += 'الاسم: ' + name + '\n';
  msg += 'المدينة: ' + city + '\n';
  msg += 'نوع المشروع: \n';
  msg += 'تاريخ التصوير: \n';
  if (photo) {
    msg += '\nصورة المودل: ' + photo + '\n';
  }
  msg += '\nشكراً.';

  const waUrl = 'https://wa.me/212670429493?text=' + encodeURIComponent(msg);
  window.open(waUrl, '_blank', 'noopener');
});

// ============================================
// DYNAMIC MODELS LOADER
// ============================================
function createModelCard(model) {
  const card = document.createElement('article');
  card.className = 'model-card reveal-scale';
  card.dataset.modelName = model.name;
  card.dataset.modelCity = model.city;
  card.dataset.modelPhoto = model.photo;

  const availClass = model.available ? 'available' : 'unavailable';
  const availText = model.available ? 'متاح' : 'غير متاح';

  card.innerHTML = `
    <div class="model-photo">
      <img src="${model.photo}" alt="${model.name}" loading="lazy">
    </div>
    <div class="model-body">
      <h3 class="model-name">${model.name}</h3>
      <div class="model-availability ${availClass}">${availText}</div>
      <div class="model-attributes">
        <span class="model-attr"><span class="model-attr-label">العمر</span><span class="model-attr-value">${model.age}</span></span>
        <span class="model-attr"><span class="model-attr-label">الطول</span><span class="model-attr-value">${model.height}</span></span>
        <span class="model-attr"><span class="model-attr-label">المدينة</span><span class="model-attr-value">${model.city}</span></span>
        <span class="model-attr"><span class="model-attr-label">الفئات</span><span class="model-attr-value">${model.category}</span></span>
        <span class="model-attr"><span class="model-attr-label">الخبرة</span><span class="model-attr-value">${model.experience}</span></span>
      </div>
      <p class="model-desc">${model.description}</p>
      <a href="#" class="button primary model-book-btn">${getConfig('models', 'ctaText', 'احجز هذا المودل')}</a>
    </div>
  `;

  return card;
}

async function loadModels() {
  const grid = document.getElementById('models-grid');
  if (!grid) return;

  try {
    const response = await fetch('data/models.json');
    const models = await response.json();

    grid.innerHTML = '';

    models.forEach(model => {
      const card = createModelCard(model);
      grid.appendChild(card);
      revealObserver.observe(card);
    });
  } catch (error) {
    // Failed to load models — grid stays empty
  }
}

// ============================================
// DYNAMIC MEDIA BUYER LOADER
// ============================================
function createBuyerCard(campaign) {
  const card = document.createElement('article');
  card.className = 'buyer-card reveal-scale';

  card.innerHTML = `
    <div class="buyer-screenshot">
      <img src="${campaign.screenshot}" alt="${campaign.campaign}" loading="lazy">
    </div>
    <div class="buyer-body">
      <h3 class="buyer-campaign">${campaign.campaign}</h3>
      <div class="buyer-meta">
        <span class="buyer-platform">${campaign.platform}</span>
        <span class="buyer-objective">${campaign.objective}</span>
        <span class="buyer-messages">${campaign.messages}</span>
      </div>
      <div class="buyer-result">${campaign.result}</div>
      <p class="buyer-desc">${campaign.description}</p>
    </div>
  `;

  return card;
}

async function loadMediaBuyer() {
  const grid = document.getElementById('buyer-grid');
  if (!grid) return;

  try {
    const response = await fetch('data/media-buyer.json');
    const campaigns = await response.json();

    grid.innerHTML = '';

    campaigns.forEach(campaign => {
      const card = createBuyerCard(campaign);
      grid.appendChild(card);
      revealObserver.observe(card);
    });
  } catch (error) {
    // Failed to load media buyer campaigns — grid stays empty
  }
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -100px 0px',
  threshold: 0.1
};

const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
};

const revealObserver = new IntersectionObserver(revealCallback, observerOptions);

// ============================================
// DOM CONTENT LOADED
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  // loadVideoCategories() calls handleRoute() after dynamic pages are created.
  // Calling handleRoute() here would race — category page-views don't exist yet.

  // Critical path: load UGC videos
  loadVideoCategories();

  // Defer non-critical loaders to idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => { loadModels(); loadMediaBuyer(); });
  } else {
    setTimeout(() => { loadModels(); loadMediaBuyer(); }, 200);
  }

  // Add reveal classes to key elements (single query batch)
  const revealAdditions = [
    ['.profile-card', 'reveal'],
    ['.ugc-feed', 'reveal reveal-delay-2'],
    ['.footer', 'reveal reveal-delay-3'],
    ['.avatar-ring', 'reveal-scale'],
    ['.profile-info', 'reveal reveal-delay-1'],
    ['.profile-line', 'reveal reveal-delay-2'],
    ['.bio', 'reveal-fade reveal-delay-2']
  ];

  revealAdditions.forEach(([sel, cls]) => {
    const el = document.querySelector(sel);
    if (el) {
      el.classList.add(...cls.split(' '));
    }
  });

  // Observe all reveal elements in a single pass
  document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  // Page transition
  document.body.classList.add('page-transition');
  setTimeout(() => {
    document.body.classList.remove('page-transition');
  }, 600);

  // Force-activate reveal elements already in viewport (single layout pass)
  forceActivateRevealCards(document);
});

// Ensure we're at the top after everything loads
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// Navbar scroll state
const siteNav = document.querySelector('.site-nav');
if (siteNav) {
  const updateNavState = () => siteNav.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', updateNavState, { passive: true });
  updateNavState();
}

// ============================================
// VOICE OVER SECTION
// ============================================
(function() {
  'use strict';

  const voGrid = document.getElementById('voiceover-grid');
  const voEmpty = document.getElementById('voiceover-empty');
  const voModal = document.getElementById('vo-modal');

  if (!voModal) return;

  // Modal elements
  const voOverlay = voModal.querySelector('.vo-modal-overlay');
  const voCloseBtn = voModal.querySelector('.vo-modal-close');
  const voCoverImg = voModal.querySelector('.vo-cover');
  const voTitle = voModal.querySelector('.vo-title');
  const voCategory = voModal.querySelector('.vo-category');
  const voDuration = voModal.querySelector('.vo-duration');
  const voDesc = voModal.querySelector('.vo-description');
  const voCanvas = document.getElementById('vo-waveform');
  const voCtx = voCanvas.getContext('2d');
  const voLoading = document.getElementById('vo-loading');
  const voPlayPauseBtn = voModal.querySelector('.vo-play-pause');
  const voPlayIcon = voModal.querySelector('.vo-icon-play');
  const voPauseIcon = voModal.querySelector('.vo-icon-pause');
  const voSkipBackBtn = voModal.querySelector('.vo-skip-back');
  const voSkipFwdBtn = voModal.querySelector('.vo-skip-forward');
  const voCurrentTime = voModal.querySelector('.vo-current-time');
  const voTotalTime = voModal.querySelector('.vo-total-time');
  const voVolumeSlider = voModal.querySelector('.vo-volume-slider');
  const voSpeedBtn = voModal.querySelector('.vo-speed-btn');
  const voSpeedMenu = voModal.querySelector('.vo-speed-menu');

  // State
  let audio = null;
  let audioCtx = null;
  let audioBlobUrl = null;
  let waveformBars = [];
  let rafId = null;
  let lastFocused = null;
  let isDragging = false;

  // ============================================
  // Helpers
  // ============================================
  function formatTime(sec) {
    if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function showPlayIcon() {
    voPlayIcon.style.display = 'inline';
    voPauseIcon.style.display = 'none';
    voPlayPauseBtn.setAttribute('aria-label', 'Play');
  }

  function showPauseIcon() {
    voPlayIcon.style.display = 'none';
    voPauseIcon.style.display = 'inline';
    voPlayPauseBtn.setAttribute('aria-label', 'Pause');
  }

  function showLoading(show) {
    voLoading.hidden = !show;
  }

  // Safari-compatible decode wrapper (callback-based API)
  function decodeAudioData(ctx, buffer) {
    return new Promise((resolve, reject) => {
      try {
        ctx.decodeAudioData(buffer, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  // ============================================
  // Card Creation
  // ============================================
  function createVoiceOverCard(item, index) {
    const card = document.createElement('article');
    card.className = 'vo-card reveal-scale';
    card.style.transitionDelay = (Math.min(index, 5) * 0.1) + 's';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Play voice over: ' + (item.title || ''));
    card.dataset.audio = item.audio || '';
    card.dataset.cover = item.cover || '';
    card.dataset.title = item.title || '';
    card.dataset.category = item.category || '';
    card.dataset.description = item.description || '';
    card.dataset.duration = item.duration || '';

    card.innerHTML = `
      <div class="vo-card-cover">
        <img src="${item.cover || ''}" alt="${item.title || ''}" loading="lazy">
        <div class="vo-card-overlay">
          <span class="vo-card-play">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </span>
        </div>
      </div>
      <div class="vo-card-body">
        <h3 class="vo-card-title">${item.title || ''}</h3>
        <div class="vo-card-meta">
          <span class="vo-card-category">${item.category || ''}</span>
          <span class="vo-card-duration">${item.duration || ''}</span>
        </div>
        <p class="vo-card-desc">${item.description || ''}</p>
      </div>
    `;

    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });

    return card;
  }

  // ============================================
  // Load Voice Overs
  // ============================================
  async function loadVoiceOvers() {
    if (!voGrid) return;

    try {
      const response = await fetch('data/voiceover.json');
      const items = await response.json();

      voGrid.innerHTML = '';

      if (!items || items.length === 0) {
        voGrid.hidden = true;
        voEmpty.hidden = false;
        if (typeof revealObserver !== 'undefined') {
          revealObserver.observe(voEmpty);
        } else {
          voEmpty.classList.add('active');
        }
        return;
      }

      voEmpty.hidden = true;
      voGrid.hidden = false;

      items.forEach((item, index) => {
        const card = createVoiceOverCard(item, index);
        voGrid.appendChild(card);
        if (typeof revealObserver !== 'undefined') {
          revealObserver.observe(card);
        }
      });
    } catch (err) {
      // Failed to load voice overs
      voGrid.hidden = true;
      voEmpty.hidden = false;
      if (typeof revealObserver !== 'undefined') {
        revealObserver.observe(voEmpty);
      }
    }
  }

  // ============================================
  // Modal
  // ============================================
  function openModal(card) {
    lastFocused = card;

    voCoverImg.src = card.dataset.cover || '';
    voCoverImg.alt = card.dataset.title || '';
    voTitle.textContent = card.dataset.title || '';
    voCategory.textContent = card.dataset.category || '';
    voDuration.textContent = card.dataset.duration || '';
    voDesc.textContent = card.dataset.description || '';

    showPlayIcon();
    voCurrentTime.textContent = '0:00';
    voTotalTime.textContent = card.dataset.duration || '0:00';
    voVolumeSlider.value = 1;

    waveformBars = [];
    canvasWidth = 0;
    canvasHeight = 0;
    voCtx.clearRect(0, 0, voCanvas.width, voCanvas.height);

    voModal.classList.add('active');
    voModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    loadAudio(card.dataset.audio);

    setTimeout(() => voPlayPauseBtn.focus(), 100);
  }

  function closeModal(restoreFocus) {
    if (restoreFocus === undefined) restoreFocus = true;

    voModal.classList.remove('active');
    voModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      audioBlobUrl = null;
    }

    voSpeedMenu.hidden = true;
    voSpeedBtn.setAttribute('aria-expanded', 'false');

    showPlayIcon();

    if (restoreFocus && lastFocused) {
      lastFocused.focus();
    }
  }

  // ============================================
  // Audio Loading & Waveform
  // ============================================
  async function loadAudio(url) {
    if (!url) {
      // No audio URL provided
      showLoading(false);
      return;
    }

    showLoading(true);

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
      audioBlobUrl = URL.createObjectURL(new Blob([arrayBuffer]));

      if (!audio) {
        audio = new Audio();
        audio.controlsList = 'nodownload';
        audio.preload = 'auto';
        audio.volume = 1;

        audio.addEventListener('loadedmetadata', () => {
          if (isFinite(audio.duration) && !isNaN(audio.duration)) {
            voTotalTime.textContent = formatTime(audio.duration);
          }
        });

        audio.addEventListener('ended', () => {
          showPlayIcon();
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          drawWaveform();
        });

        audio.addEventListener('canplay', () => showLoading(false));
        audio.addEventListener('waiting', () => showLoading(true));
        audio.addEventListener('playing', () => showLoading(false));
        audio.addEventListener('error', () => {
          showLoading(false);
          // Audio playback error
        });

        audio.addEventListener('contextmenu', e => e.preventDefault());
      }

      audio.src = audioBlobUrl;

      // Decode for waveform using Web Audio API
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Safari suspends AudioContext until a user gesture
        if (audioCtx.state === 'suspended') audioCtx.resume();

        // slice(0) creates a copy since decodeAudioData may detach the buffer
        const audioBuffer = await decodeAudioData(audioCtx, arrayBuffer.slice(0));
        generateWaveform(audioBuffer);
      } catch (decodeErr) {
        // Waveform decode failed, using fallback
        generatePseudoWaveform();
      }

    } catch (err) {
      // Failed to load audio
      showLoading(false);
    }
  }

  function generateWaveform(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    const samples = 180;
    const blockSize = Math.floor(channelData.length / samples);
    const bars = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < blockSize; j++) {
        const idx = i * blockSize + j;
        if (idx < channelData.length) {
          sum += Math.abs(channelData[idx]);
          count++;
        }
      }
      bars.push(count > 0 ? sum / count : 0);
    }

    // Normalize
    let max = 0;
    for (let k = 0; k < bars.length; k++) {
      if (bars[k] > max) max = bars[k];
    }

    waveformBars = max > 0
      ? bars.map(v => v / max)
      : bars.map(() => 0.5);

    drawWaveform();
  }

  function generatePseudoWaveform() {
    const samples = 180;
    waveformBars = [];
    for (let i = 0; i < samples; i++) {
      const val = 0.3 + 0.3 * Math.sin(i * 0.1) + 0.2 * Math.sin(i * 0.3) + 0.1 * Math.random();
      waveformBars.push(Math.max(0.1, Math.min(1, val)));
    }
    drawWaveform();
  }

  let canvasWidth = 0;
  let canvasHeight = 0;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = voCanvas.getBoundingClientRect();

    if (rect.width === 0) return false;

    voCanvas.width = rect.width * dpr;
    voCanvas.height = rect.height * dpr;
    voCtx.setTransform(1, 0, 0, 1, 0, 0);
    voCtx.scale(dpr, dpr);

    canvasWidth = rect.width;
    canvasHeight = rect.height;
    return true;
  }

  function drawWaveform() {
    if (canvasWidth === 0) { if (!resizeCanvas()) return; }

    const width = canvasWidth;
    const height = canvasHeight;
    const barCount = waveformBars.length;

    if (barCount === 0) return;

    const barWidth = width / barCount;
    const progress = (audio && audio.duration && isFinite(audio.duration))
      ? audio.currentTime / audio.duration
      : 0;

    voCtx.clearRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      const barHeight = Math.max(2, waveformBars[i] * height * 0.9);
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      if (i / barCount <= progress) {
        voCtx.fillStyle = '#2F7BFF';
      } else {
        voCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      }

      voCtx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }
  }

  // ============================================
  // Player Controls
  // ============================================
  function togglePlay() {
    if (!audio || !audio.src) return;

    if (audio.paused) {
      audio.play().then(() => {
        showPauseIcon();
        startProgressLoop();
      }).catch(err => {
        // Play failed
      });
    } else {
      audio.pause();
      showPlayIcon();
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  }

  function startProgressLoop() {
    if (rafId) cancelAnimationFrame(rafId);

    function loop() {
      if (audio && !audio.paused) {
        drawWaveform();
        voCurrentTime.textContent = formatTime(audio.currentTime);
        rafId = requestAnimationFrame(loop);
      }
    }
    rafId = requestAnimationFrame(loop);
  }

  function seekToPosition(clientX) {
    if (!audio || !audio.duration || !isFinite(audio.duration)) return;

    const rect = voCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = ratio * audio.duration;

    drawWaveform();
    voCurrentTime.textContent = formatTime(audio.currentTime);
    voCanvas.setAttribute('aria-valuenow', Math.round(ratio * 100));
  }

  function skip(seconds) {
    if (!audio) return;
    const newTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
    audio.currentTime = newTime;
    drawWaveform();
    voCurrentTime.textContent = formatTime(newTime);
  }

  function setVolume(value) {
    if (audio) audio.volume = parseFloat(value);
  }

  function setSpeed(speed) {
    if (audio) audio.playbackRate = parseFloat(speed);
    voSpeedBtn.textContent = speed + 'x';
    voSpeedMenu.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speed === speed);
    });
  }

  // ============================================
  // Focus Trap
  // ============================================
  function getFocusableElements() {
    return Array.prototype.slice.call(voModal.querySelectorAll(
      'button:not([hidden]):not([disabled]), input:not([hidden]):not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // ============================================
  // Event Listeners
  // ============================================
  voPlayPauseBtn.addEventListener('click', togglePlay);
  voSkipBackBtn.addEventListener('click', () => skip(-10));
  voSkipFwdBtn.addEventListener('click', () => skip(10));
  voVolumeSlider.addEventListener('input', e => setVolume(e.target.value));

  // Speed control
  voSpeedBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isExpanded = voSpeedBtn.getAttribute('aria-expanded') === 'true';
    voSpeedMenu.hidden = isExpanded;
    voSpeedBtn.setAttribute('aria-expanded', String(!isExpanded));
  });

  voSpeedMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      setSpeed(btn.dataset.speed);
      voSpeedMenu.hidden = true;
      voSpeedBtn.setAttribute('aria-expanded', 'false');
      voSpeedBtn.focus();
    });
  });

  // Close speed menu on outside click
  document.addEventListener('click', e => {
    if (!voSpeedMenu.hidden && !voSpeedBtn.contains(e.target) && !voSpeedMenu.contains(e.target)) {
      voSpeedMenu.hidden = true;
      voSpeedBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Modal close
  voCloseBtn.addEventListener('click', () => closeModal(true));
  voOverlay.addEventListener('click', () => closeModal(true));

  // Waveform interaction (mouse)
  voCanvas.addEventListener('mousedown', e => {
    isDragging = true;
    seekToPosition(e.clientX);
  });

  document.addEventListener('mousemove', e => {
    if (isDragging) seekToPosition(e.clientX);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Waveform interaction (touch)
  voCanvas.addEventListener('touchstart', e => {
    if (e.touches.length > 0) seekToPosition(e.touches[0].clientX);
  }, { passive: true });

  voCanvas.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      e.preventDefault();
      seekToPosition(e.touches[0].clientX);
    }
  }, { passive: false });

  // Keyboard support
  voModal.addEventListener('keydown', e => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeModal(true);
        break;
      case ' ':
        if (document.activeElement !== voVolumeSlider) {
          e.preventDefault();
          togglePlay();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        skip(-10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        skip(10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (audio) {
          audio.volume = Math.min(1, audio.volume + 0.1);
          voVolumeSlider.value = audio.volume;
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (audio) {
          audio.volume = Math.max(0, audio.volume - 0.1);
          voVolumeSlider.value = audio.volume;
        }
        break;
      case 'Tab':
        trapFocus(e);
        break;
    }
  });

  // Redraw waveform on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (voModal.classList.contains('active')) {
        resizeCanvas();
        drawWaveform();
      }
    }, 250);
  });

  // Stop audio when navigating away via [data-nav]
  document.addEventListener('click', e => {
    const navItem = e.target.closest('[data-nav]');
    if (navItem && navItem.dataset.nav !== 'voiceover') {
      if (voModal.classList.contains('active')) {
        closeModal(false);
      } else if (audio) {
        audio.pause();
        showPlayIcon();
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    }
  }, true); // capture phase — runs before existing nav handlers

  // Pause audio when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && audio && !audio.paused) {
      audio.pause();
      showPlayIcon();
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  });

  // Initialize
  document.addEventListener('DOMContentLoaded', loadVoiceOvers);
})();

// ============================================
// PREMIUM IMAGE FADE-IN
// Fades in images smoothly after load (no layout shift)
// Handles existing + dynamically created images via MutationObserver
// ============================================
(function() {
  function fadeIn(img) {
    if (!img.src || img.src === '') return;
    if (img.hasAttribute('fetchpriority')) return;
    if (img.classList.contains('pp-img-fade')) return;

    img.classList.add('pp-img-fade');

    if (img.complete && img.naturalWidth > 0) {
      requestAnimationFrame(() => img.classList.add('pp-img-loaded'));
    } else {
      img.addEventListener('load', () => img.classList.add('pp-img-loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('pp-img-loaded'), { once: true });
    }
  }

  function processImages(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('img').forEach(fadeIn);
  }

  // Process existing images
  processImages(document);

  // Watch for dynamically added images (model cards, buyer cards, VO cards)
  const imgObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'IMG') {
          fadeIn(node);
        } else if (node.querySelectorAll) {
          processImages(node);
        }
      });
    });
  });

  imgObserver.observe(document.body, { childList: true, subtree: true });
})();
