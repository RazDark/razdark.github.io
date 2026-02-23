/* ================================================
   NAVIGATION ENTRE SCREENS
================================================ */
function showScreen(screenId, useTransition = true) {
  const overlay = document.querySelector('.transition-overlay');
  const allScreens = document.querySelectorAll('.screen');
  const targetScreen = document.getElementById(screenId);
  if (!targetScreen) return;

  const switchScreen = () => {
    allScreens.forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
    window.location.hash = screenId === 'hub' ? '' : screenId;
    window.scrollTo(0, 0);

    if (screenId === 'experience') {
      document.querySelectorAll('.quest-entry').forEach((el, i) => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = `questSlideIn 0.6s ease ${0.2 + i * 0.2}s forwards`;
      });
    }

    if (screenId === 'hub') {
      document.querySelectorAll('.menu-node').forEach((el, i) => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = `nodeAppear 0.6s ease ${0.3 + i * 0.2}s forwards`;
      });
    }
  };

  if (!overlay || !useTransition) {
    switchScreen();
    return;
  }

  overlay.classList.add('active');
  setTimeout(() => {
    switchScreen();
    setTimeout(() => overlay.classList.remove('active'), 120);
  }, 400);
}

/* ================================================
   FONCTION CENTRALE D'ANIMATION SLIDE (partagée)
================================================ */
function _animateSlide(slidesContainer, slides, dots, currentIdx, nextIdx, dir) {
  if (nextIdx === currentIdx) return;

  const current = slides[currentIdx];
  const next    = slides[nextIdx];

  const fromX  = dir >= 0 ? '100%' : '-100%';
  const toX    = dir >= 0 ? '-100%' : '100%';
  const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const duration = '0.45s';

  next.style.cssText = `opacity:1; transform:translateX(${fromX}); transition:none;`;
  next.classList.add('active');

  void next.offsetHeight;

  const tr = `transform ${duration} ${easing}, opacity ${duration} ease`;
  next.style.cssText    = `opacity:1; transform:translateX(0); transition:${tr};`;
  current.style.cssText = `opacity:0; transform:translateX(${toX}); transition:${tr};`;

  setTimeout(() => {
    current.classList.remove('active');
    current.style.cssText = '';
    next.style.cssText    = '';
  }, 450);

  dots[currentIdx]?.classList.remove('active');
  dots[nextIdx]?.classList.add('active');
}

/* ================================================
   GALERIE JEUX (game-gallery)
================================================ */
function slideGallery(galleryId, dir) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.gallery-slide');
  const dots   = gallery.querySelectorAll('.gallery-dot');
  let currentIdx = Array.from(slides).findIndex(s => s.classList.contains('active'));
  if (currentIdx < 0) currentIdx = 0;

  const nextIdx = (currentIdx + dir + slides.length) % slides.length;
  _animateSlide(gallery, slides, dots, currentIdx, nextIdx, dir);
}

function goGallery(galleryId, targetIdx) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.gallery-slide');
  const dots   = gallery.querySelectorAll('.gallery-dot');
  const currentIdx = Array.from(slides).findIndex(s => s.classList.contains('active'));
  if (currentIdx < 0 || currentIdx === targetIdx) return;

  const dir = targetIdx > currentIdx ? 1 : -1;
  _animateSlide(gallery, slides, dots, currentIdx, targetIdx, dir);
}

/* ================================================
   GALERIE QUÊTES (quest-gallery) — alignée sur le même système
================================================ */
function slideQGallery(galleryId, dir) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.quest-slide');
  const dots   = gallery.querySelectorAll('.qgallery-dot');
  let currentIdx = Array.from(slides).findIndex(s => s.classList.contains('active'));
  if (currentIdx < 0) currentIdx = 0;

  const nextIdx = (currentIdx + dir + slides.length) % slides.length;
  _animateSlide(gallery, slides, dots, currentIdx, nextIdx, dir);
}

function goQGallery(galleryId, targetIdx) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.quest-slide');
  const dots   = gallery.querySelectorAll('.qgallery-dot');
  const currentIdx = Array.from(slides).findIndex(s => s.classList.contains('active'));
  if (currentIdx < 0 || currentIdx === targetIdx) return;

  const dir = targetIdx > currentIdx ? 1 : -1;
  _animateSlide(gallery, slides, dots, currentIdx, targetIdx, dir);
}

/* ================================================
   AUTOPLAY (Créations + Quêtes)
================================================ */
const autoplay = {
  timers: {},

  start(galleryId, interval = 3000) {
    this.stop(galleryId);
    this.timers[galleryId] = setInterval(() => {
      if (!document.hidden) {
        // Détecte si c'est une galerie Quêtes ou Créations
        if (galleryId.startsWith('qgallery-')) {
          slideQGallery(galleryId, 1);
        } else {
          slideGallery(galleryId, 1);
        }
      }
    }, interval);
  },

  stop(galleryId) {
    if (this.timers[galleryId]) {
      clearInterval(this.timers[galleryId]);
      delete this.timers[galleryId];
    }
  },

  reset(galleryId, interval = 3000) {
    this.start(galleryId, interval);
  }
};

function initAutoplay() {
  // Créations
  autoplay.start('gallery-mad');
  autoplay.start('gallery-sky');
  // Quêtes
  autoplay.start('qgallery-cruk');
  autoplay.start('qgallery-telethon');
}

// Pause/reprise selon visibilité de la page
document.addEventListener('visibilitychange', () => {
  const allGalleries = ['gallery-mad', 'gallery-sky', 'qgallery-cruk', 'qgallery-telethon'];
  if (document.hidden) {
    allGalleries.forEach(id => autoplay.stop(id));
  } else {
    allGalleries.forEach(id => autoplay.start(id));
  }
});

/* ================================================
   COPIER EMAIL DANS LE PRESSE-PAPIERS
================================================ */
function copyEmail(btn) {
  const email = document.getElementById('email-display')?.textContent?.trim();
  if (!email) return;

  navigator.clipboard.writeText(email).then(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Copié ✅';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i> Copier';
      btn.classList.remove('copied');
    }, 1500);
  }).catch(() => {
    const el = document.createElement('textarea');
    el.value = email;
    el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    btn.innerHTML = '<i class="fas fa-check"></i> Copié ✅';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i> Copier';
      btn.classList.remove('copied');
    }, 1500);
  });
}

/* ================================================
   DÉLÉGATION DE CLICS GLOBALE
================================================ */
document.addEventListener('click', e => {

  // 1. Navigation vers un screen
  const nav = e.target.closest('[data-screen]');
  if (nav) {
    e.preventDefault();
    showScreen(nav.getAttribute('data-screen'));
    return;
  }

  // 2. Galerie JEUX — prev/next
  const gameNavBtn = e.target.closest('.game-gallery [data-gallery][data-dir]');
  if (gameNavBtn) {
    e.preventDefault();
    const gid = gameNavBtn.getAttribute('data-gallery');
    slideGallery(gid, parseInt(gameNavBtn.getAttribute('data-dir'), 10));
    autoplay.reset(gid);
    return;
  }

  // 3. Galerie JEUX — dots
  const gameDot = e.target.closest('.game-gallery [data-gallery][data-idx]');
  if (gameDot) {
    e.preventDefault();
    const gid = gameDot.getAttribute('data-gallery');
    goGallery(gid, parseInt(gameDot.getAttribute('data-idx'), 10));
    autoplay.reset(gid);
    return;
  }

  // 4. Galerie QUÊTES — prev/next
  const qNavBtn = e.target.closest('[data-qgallery][data-dir]');
  if (qNavBtn) {
    e.preventDefault();
    const gid = qNavBtn.getAttribute('data-qgallery');
    slideQGallery(gid, parseInt(qNavBtn.getAttribute('data-dir'), 10));
    autoplay.reset(gid);
    return;
  }

  // 5. Galerie QUÊTES — dots
  const qDot = e.target.closest('[data-qgallery][data-idx]');
  if (qDot) {
    e.preventDefault();
    const gid = qDot.getAttribute('data-qgallery');
    goQGallery(gid, parseInt(qDot.getAttribute('data-idx'), 10));
    autoplay.reset(gid);
    return;
  }
});

/* ================================================
   TOUCHE ECHAP → RETOUR HUB
================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') showScreen('hub');
});

/* ================================================
   CHARGEMENT INITIAL
================================================ */
window.addEventListener('load', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    showScreen(hash, false);
  } else {
    showScreen('hub', false);
  }

  initAutoplay();
});
