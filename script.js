/* ================================================
   NAVIGATION ENTRE SCREENS
================================================ */
function showScreen(screenId) {
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

  if (!overlay) {
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
   GALERIE JEUX (game-gallery)
================================================ */
function slideGallery(galleryId, dir) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.gallery-slide');
  const dots   = gallery.querySelectorAll('.gallery-dot');
  let idx = Array.from(slides).findIndex(s => s.classList.contains('active'));
  if (idx < 0) idx = 0;

  slides[idx]?.classList.remove('active');
  dots[idx]?.classList.remove('active');

  idx = (idx + dir + slides.length) % slides.length;

  slides[idx]?.classList.add('active');
  dots[idx]?.classList.add('active');
}

function goGallery(galleryId, idx) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.gallery-slide');
  const dots   = gallery.querySelectorAll('.gallery-dot');

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d   => d.classList.remove('active'));

  slides[idx]?.classList.add('active');
  dots[idx]?.classList.add('active');
}

/* ================================================
   GALERIE QUÊTES (quest-gallery)
================================================ */
function slideQGallery(galleryId, dir) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.quest-slide');
  const dots   = gallery.querySelectorAll('.qgallery-dot');
  let idx = Array.from(slides).findIndex(s => s.classList.contains('active'));
  if (idx < 0) idx = 0;

  slides[idx]?.classList.remove('active');
  dots[idx]?.classList.remove('active');

  idx = (idx + dir + slides.length) % slides.length;

  slides[idx]?.classList.add('active');
  dots[idx]?.classList.add('active');
}

function goQGallery(galleryId, idx) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.quest-slide');
  const dots   = gallery.querySelectorAll('.qgallery-dot');

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d   => d.classList.remove('active'));

  slides[idx]?.classList.add('active');
  dots[idx]?.classList.add('active');
}

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
    slideGallery(
      gameNavBtn.getAttribute('data-gallery'),
      parseInt(gameNavBtn.getAttribute('data-dir'), 10)
    );
    return;
  }

  // 3. Galerie JEUX — dots
  const gameDot = e.target.closest('.game-gallery [data-gallery][data-idx]');
  if (gameDot) {
    e.preventDefault();
    goGallery(
      gameDot.getAttribute('data-gallery'),
      parseInt(gameDot.getAttribute('data-idx'), 10)
    );
    return;
  }

  // 4. Galerie QUÊTES — prev/next
  const qNavBtn = e.target.closest('[data-qgallery][data-dir]');
  if (qNavBtn) {
    e.preventDefault();
    slideQGallery(
      qNavBtn.getAttribute('data-qgallery'),
      parseInt(qNavBtn.getAttribute('data-dir'), 10)
    );
    return;
  }

  // 5. Galerie QUÊTES — dots
  const qDot = e.target.closest('[data-qgallery][data-idx]');
  if (qDot) {
    e.preventDefault();
    goQGallery(
      qDot.getAttribute('data-qgallery'),
      parseInt(qDot.getAttribute('data-idx'), 10)
    );
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
    showScreen(hash);
  } else {
    showScreen('hub');
  }
});