/* =========================
   HELPERS
========================= */
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

/* =========================
   NAVIGATION ENTRE SCREENS
========================= */
function showScreen(screenId) {
  const overlay = $('.transition-overlay');
  const allScreens = $all('.screen');
  const targetScreen = document.getElementById(screenId);
  if (!targetScreen) return;

  const switchScreen = () => {
    allScreens.forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');

    // hash
    window.location.hash = (screenId === 'hub') ? '' : screenId;
    window.scrollTo(0, 0);

    // relance animations
    if (screenId === 'experience') {
      $all('.quest-entry').forEach((el, i) => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = `questSlideIn 0.6s ease ${0.2 + i * 0.2}s forwards`;
      });
    }

    if (screenId === 'hub') {
      $all('.menu-node').forEach((el, i) => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = `nodeAppear 0.6s ease ${0.3 + i * 0.2}s forwards`;
      });
    }
  };

  if (!overlay) return switchScreen();

  overlay.classList.add('active');
  setTimeout(() => {
    switchScreen();
    setTimeout(() => overlay.classList.remove('active'), 120);
  }, 400);
}

/* =========================
   GALERIE (GENERIC)
   - slideClass: "gallery-slide" ou "quest-slide"
   - dotClass  : "gallery-dot"   ou "qgallery-dot"
========================= */
function slideGeneric(galleryId, dir, slideClass, dotClass) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = $all(`.${slideClass}`, gallery);
  const dots = $all(`.${dotClass}`, gallery);
  if (!slides.length) return;

  let idx = slides.findIndex(s => s.classList.contains('active'));
  if (idx < 0) idx = 0;

  slides[idx]?.classList.remove('active');
  dots[idx]?.classList.remove('active');

  idx = (idx + dir + slides.length) % slides.length;

  slides[idx]?.classList.add('active');
  dots[idx]?.classList.add('active');
}

function goGeneric(galleryId, idx, slideClass, dotClass) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = $all(`.${slideClass}`, gallery);
  const dots = $all(`.${dotClass}`, gallery);
  if (!slides.length) return;

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  slides[idx]?.classList.add('active');
  dots[idx]?.classList.add('active');
}

/* =========================
   GALERIE JEUX
========================= */
function slideGallery(galleryId, dir) {
  slideGeneric(galleryId, dir, 'gallery-slide', 'gallery-dot');
}
function goGallery(galleryId, idx) {
  goGeneric(galleryId, idx, 'gallery-slide', 'gallery-dot');
}

/* =========================
   GALERIE QUÊTES
========================= */
function slideQGallery(galleryId, dir) {
  slideGeneric(galleryId, dir, 'quest-slide', 'qgallery-dot');
}
function goQGallery(galleryId, idx) {
  goGeneric(galleryId, idx, 'quest-slide', 'qgallery-dot');
}

/* =========================
   COPIER EMAIL
========================= */
function copyEmail(btn) {
  const email = $('#email-display')?.textContent?.trim();
  if (!email) return;

  const done = () => {
    btn.innerHTML = '<i class="fas fa-check"></i> Copié ✅';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i> Copier';
      btn.classList.remove('copied');
    }, 1500);
  };

  navigator.clipboard.writeText(email).then(done).catch(() => {
    const el = document.createElement('textarea');
    el.value = email;
    el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    done();
  });
}

/* =========================
   CLICS (ROBUSTE)
========================= */
document.addEventListener('click', (e) => {
  const t = e.target;

  // Screens
  const nav = t.closest('[data-screen]');
  if (nav) {
    e.preventDefault();
    showScreen(nav.getAttribute('data-screen'));
    return;
  }

  // Jeux prev/next
  const gameNav = t.closest('[data-gallery][data-dir]');
  if (gameNav) {
    e.preventDefault();
    slideGallery(gameNav.getAttribute('data-gallery'), Number(gameNav.getAttribute('data-dir')));
    return;
  }

  // Jeux dots
  const gameDot = t.closest('[data-gallery][data-idx]');
  if (gameDot) {
    e.preventDefault();
    goGallery(gameDot.getAttribute('data-gallery'), Number(gameDot.getAttribute('data-idx')));
    return;
  }

  // Quêtes prev/next
  const qNav = t.closest('[data-qgallery][data-dir]');
  if (qNav) {
    e.preventDefault();
    slideQGallery(qNav.getAttribute('data-qgallery'), Number(qNav.getAttribute('data-dir')));
    return;
  }

  // Quêtes dots
  const qDot = t.closest('[data-qgallery][data-idx]');
  if (qDot) {
    e.preventDefault();
    goQGallery(qDot.getAttribute('data-qgallery'), Number(qDot.getAttribute('data-idx')));
    return;
  }
});

/* =========================
   ECHAP => HUB
========================= */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') showScreen('hub');
});

/* =========================
   INIT
========================= */
window.addEventListener('load', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) showScreen(hash);
  else showScreen('hub');
});
