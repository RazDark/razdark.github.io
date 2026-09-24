/* ==========================================================================
   MERWANE SLIFI — PORTFOLIO
   script.js — navigation par hash, galeries, copie d'email.
   Aucune dépendance. Compatible navigateurs modernes (ES2018+).
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. ROUTEUR — les 6 destinations
     Le hash de l'URL est la seule source de vérité : clics, boutons, saisie
     d'URL, précédent/suivant et actualisation passent tous par lui.
     ------------------------------------------------------------------------ */
  var SCREENS = ['accueil', 'apropos', 'competences', 'creation', 'quetes', 'invocation'];
  var DEFAULT_SCREEN = 'accueil';
  var SITE_TITLE = 'Merwane Slifi — Portfolio';
  var TITLES = {
    accueil: SITE_TITLE,
    apropos: 'À Propos — ' + SITE_TITLE,
    competences: 'Compétences — ' + SITE_TITLE,
    creation: 'Créations — ' + SITE_TITLE,
    quetes: 'Quêtes — ' + SITE_TITLE,
    invocation: 'Invoquez-moi — ' + SITE_TITLE
  };
  var TRANSITION_MS = 260;

  var overlay = document.querySelector('.transition-overlay');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = null;
  var transitioning = false;
  var pending = null;

  // Le navigateur ne doit pas restaurer une ancienne position de scroll :
  // c'est la cause classique du « grand vide noir » au-dessus du contenu.
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  function screenFromHash(hash) {
    var id = String(hash || '').replace(/^#\/?/, '').toLowerCase();
    return SCREENS.indexOf(id) !== -1 ? id : null;
  }

  function scrollTop() {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
    catch (e) { window.scrollTo(0, 0); }
    // Sécurité : certains navigateurs mobiles appliquent le scroll d'ancre
    // une frame plus tard ; on ré-impose 0 une fois le rendu passé.
    window.requestAnimationFrame(function () { window.scrollTo(0, 0); });
  }

  function render(id) {
    var i, s, screens = document.querySelectorAll('.screen');
    for (i = 0; i < screens.length; i++) {
      s = screens[i];
      var isTarget = s.id === id;
      s.classList.toggle('active', isTarget);
      s.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
    }

    // Liens de navigation rapide : état « page courante »
    var links = document.querySelectorAll('.page-nav a');
    for (i = 0; i < links.length; i++) {
      var target = screenFromHash(links[i].getAttribute('href'));
      if (target === id) links[i].setAttribute('aria-current', 'page');
      else links[i].removeAttribute('aria-current');
    }

    document.title = TITLES[id] || SITE_TITLE;
    current = id;
    scrollTop();

    // Focus sur le titre de la section (lecteurs d'écran, clavier), sans
    // provoquer de scroll.
    var section = document.getElementById(id);
    var heading = section && (section.querySelector('.page-title') || section.querySelector('.hub-title'));
    if (heading) {
      try { heading.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }

    // Recentre la navigation rapide sur l'onglet courant (mobile)
    var currentLink = section && section.querySelector('.page-nav a[aria-current="page"]');
    if (currentLink && typeof currentLink.scrollIntoView === 'function') {
      try { currentLink.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }); }
      catch (e) { /* ignore */ }
    }
  }

  // Affiche la section demandée avec le voile de braises. Le hash a déjà été
  // modifié par le navigateur (clic sur un lien, précédent/suivant, saisie
  // d'URL) : ici on ne fait que refléter l'état de l'URL.
  function show(id) {
    if (SCREENS.indexOf(id) === -1) id = DEFAULT_SCREEN;

    if (id === current) { scrollTop(); return; }   // onglet courant recliqué
    if (transitioning) { pending = id; return; }

    if (reduceMotion || !overlay || current === null) { render(id); return; }

    transitioning = true;
    overlay.classList.add('active');
    window.setTimeout(function () {
      render(id);
      window.requestAnimationFrame(function () {
        overlay.classList.remove('active');
        transitioning = false;
        if (pending) { var next = pending; pending = null; show(next); }
      });
    }, TRANSITION_MS);
  }

  // Un hash inconnu (ou vide) est ramené à #accueil sans polluer l'historique
  function syncFromLocation() {
    var id = screenFromHash(window.location.hash);
    if (!id) {
      try { window.history.replaceState(null, '', '#' + DEFAULT_SCREEN); }
      catch (e) { window.location.replace('#' + DEFAULT_SCREEN); return; }
      id = DEFAULT_SCREEN;
    }
    show(id);
  }
  window.addEventListener('hashchange', syncFromLocation);

  // Clic sur un lien de section : on laisse le navigateur changer le hash
  // (déclenche hashchange). On ne bloque que le saut natif vers l'ancre
  // lorsqu'on reclique l'onglet courant, pour garder un simple retour en haut.
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = screenFromHash(a.getAttribute('href'));
    if (id && id === current) { e.preventDefault(); scrollTop(); }
  });

  // Chargement direct / actualisation
  function boot() {
    var id = screenFromHash(window.location.hash);
    if (!id) {
      id = DEFAULT_SCREEN;
      try { window.history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
    }
    render(id);
    // Si le navigateur applique le saut d'ancre après coup, on reste en haut.
    window.addEventListener('load', scrollTop);
  }

  /* ------------------------------------------------------------------------
     2. GALERIES — un composant pour les jeux et les quêtes
     Défilement automatique toutes les 5 s ; flèches, points, clavier (← →)
     et glissement tactile. Toute action manuelle relance le délai de 5 s.
     ------------------------------------------------------------------------ */
  var AUTOPLAY_MS = 5000;

  function initGallery(gallery) {
    var slides = gallery.querySelectorAll('.gallery-slide');
    var dots = gallery.querySelectorAll('.gallery-dot');
    var status = gallery.querySelector('.gallery-status');
    var total = slides.length;
    var index = 0;
    var i;

    if (total < 2) {
      var navs = gallery.querySelectorAll('.gallery-nav, .gallery-dots');
      for (i = 0; i < navs.length; i++) navs[i].hidden = true;
      return;
    }

    for (i = 0; i < slides.length; i++) {
      if (slides[i].classList.contains('active')) index = i;
    }

    function show(n) {
      index = (n + total) % total;
      var k;
      for (k = 0; k < total; k++) {
        slides[k].classList.toggle('active', k === index);
        slides[k].setAttribute('aria-hidden', k === index ? 'false' : 'true');
      }
      for (k = 0; k < dots.length; k++) {
        var on = k === index;
        dots[k].classList.toggle('active', on);
        dots[k].setAttribute('aria-selected', on ? 'true' : 'false');
        dots[k].setAttribute('role', 'tab');
      }
      if (status) status.textContent = 'Image ' + (index + 1) + ' sur ' + total;
    }

    // ---- Défilement automatique -------------------------------------------
    var timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function tick() {
      // N'avance que si l'onglet est visible, la section affichée et
      // qu'aucun glissement n'est en cours
      var visible = document.visibilityState !== 'hidden' && gallery.closest('.screen.active');
      if (visible && !tracking) show(index + 1);
    }
    function stopAuto() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function startAuto() {
      if (reduce) return;
      stopAuto();
      timer = window.setInterval(tick, AUTOPLAY_MS);
    }
    // Interaction manuelle : on affiche, puis on repart pour 5 s complètes
    function manual(n) { show(n); startAuto(); }

    gallery.addEventListener('click', function (e) {
      var nav = e.target.closest ? e.target.closest('.gallery-nav') : null;
      if (nav) { manual(index + (parseInt(nav.getAttribute('data-dir'), 10) || 1)); return; }
      var dot = e.target.closest ? e.target.closest('.gallery-dot') : null;
      if (dot) { manual(parseInt(dot.getAttribute('data-idx'), 10) || 0); }
    });

    gallery.setAttribute('tabindex', '0');
    gallery.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); manual(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); manual(index + 1); }
    });

    // Glissement tactile (pointer events → souris, stylet, doigt)
    var startX = 0, startY = 0, tracking = false;
    gallery.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest && e.target.closest('button')) return;
      startX = e.clientX; startY = e.clientY; tracking = true;
    });
    gallery.addEventListener('pointerup', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        manual(dx < 0 ? index + 1 : index - 1);
      }
    });
    gallery.addEventListener('pointercancel', function () { tracking = false; });

    show(index);
    startAuto();
  }

  /* ------------------------------------------------------------------------
     3. COPIE DE L'EMAIL
     ------------------------------------------------------------------------ */
  function initCopyEmail() {
    var btn = document.getElementById('copy-email-btn');
    if (!btn) return;
    var label = btn.querySelector('.copy-label');
    var statusEl = btn.parentNode.parentNode.querySelector('.copy-status');
    var email = btn.getAttribute('data-copy') || (document.getElementById('email-display') || {}).textContent || '';
    var timer = null;

    function feedback(ok) {
      if (label) label.textContent = ok ? 'Copié !' : 'Copier';
      if (statusEl) statusEl.textContent = ok ? 'Adresse copiée dans le presse-papiers.' : 'Copie impossible : sélectionnez l\'adresse manuellement.';
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        if (label) label.textContent = 'Copier';
        if (statusEl) statusEl.textContent = '';
      }, 2500);
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    btn.addEventListener('click', function () {
      email = email.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () { feedback(true); },
          function () { feedback(fallbackCopy(email)); });
      } else {
        feedback(fallbackCopy(email));
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. DÉMARRAGE
     ------------------------------------------------------------------------ */
  function init() {
    var galleries = document.querySelectorAll('[data-gallery]');
    for (var i = 0; i < galleries.length; i++) initGallery(galleries[i]);
    initCopyEmail();
    boot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
