/* ============================================================
   app.js — Arizona Faraway — 26
   PJAX-навигация + UI-хелперы + статус тех.режима.
   Авторизация TG теперь живёт в index.html/community.html.
   ============================================================ */
(function () {
  'use strict';

  var SITE_KEY = 'azfw26_site_cache';
  var TOKEN_KEY = 'azfw26_admin_token';

  /* ====== TOAST ====== */
  var toastEl = null, toastTimer = null;
  function ensureToast() {
    if (toastEl) return;
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  function toast(text, kind) {
    ensureToast();
    toastEl.textContent = text;
    toastEl.classList.remove('err', 'warn');
    if (kind === 'err') toastEl.classList.add('err');
    if (kind === 'warn') toastEl.classList.add('warn');
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ====== LOADER ====== */
  var loaderEl = null;
  function ensureLoader() {
    if (loaderEl) return;
    loaderEl = document.createElement('div');
    loaderEl.id = 'pageLoader';
    loaderEl.innerHTML = '<div class="pl-box"><div class="pl-logo">⚡</div><div class="pl-text">Загрузка</div></div>';
    document.body.appendChild(loaderEl);
  }
  function showLoader() { ensureLoader(); loaderEl.classList.add('show'); }
  function hideLoader() { if (loaderEl) loaderEl.classList.remove('show'); }

  /* ====== ADMIN FLAG ====== */
  function isAdmin() {
    try { if (localStorage.getItem(TOKEN_KEY)) return true; } catch (e) {}
    return false;
  }
  function adminName() {
    try {
      var tg = JSON.parse(localStorage.getItem('azfw26_tg_user') || 'null');
      if (tg && tg.username) return '@' + tg.username;
    } catch (e) {}
    return 'админ';
  }

  /* ====== SITE STATUS ====== */
  var SITE_CACHE = null;
  function cachedSite() {
    try { var raw = localStorage.getItem(SITE_KEY); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function saveSite(site) {
    SITE_CACHE = site;
    try { localStorage.setItem(SITE_KEY, JSON.stringify(site)); } catch (e) {}
  }
  function isMaintenanceOn() {
    var s = SITE_CACHE || cachedSite();
    if (!s) return false;
    if (s.maintenance === true) return true;
    if (s.maintenance && s.maintenance.enabled) return true;
    return false;
  }
  function checkMaintenance() {
    if (!isMaintenanceOn()) { hideMaintBanner(); return; }
    if (isAdmin()) { showMaintBanner(); return; }
    if (document.documentElement.getAttribute('data-page') === 'maintenance') return;
    location.replace('maintenance.html');
  }
  function showMaintBanner() {
    var b = document.getElementById('maintBanner');
    if (!b) {
      b = document.createElement('div');
      b.id = 'maintBanner';
      b.innerHTML = '⚠️ Сайт на тех. обслуживании. Посетители видят заглушку. ' +
        '<a href="admin.html" class="btn btn-ghost btn-sm">Управление</a>';
      document.body.appendChild(b);
    }
    b.classList.add('show');
    document.body.style.paddingTop = '44px';
  }
  function hideMaintBanner() {
    var b = document.getElementById('maintBanner');
    if (b) { b.classList.remove('show'); document.body.style.paddingTop = ''; }
  }

  /* ====== PJAX ====== */
  function sameOrigin(url) {
    try { var u = new URL(url, location.href); return u.origin === location.origin; }
    catch (e) { return false; }
  }
  function isHtmlLink(a) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    var href = a.getAttribute('href') || '';
    if (href.startsWith('#')) return false;
    if (href.startsWith('mailto:')) return false;
    if (href.startsWith('tel:')) return false;
    if (a.getAttribute('data-no-pjax') !== null) return false;
    if (!sameOrigin(a.href)) return false;
    var path = a.pathname || '';
    return path.endsWith('.html') || path.endsWith('/');
  }

  async function navigate(url, push) {
    if (push === undefined) push = true;
    showLoader();
    try {
      var resp = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var html = await resp.text();
      var doc = new DOMParser().parseFromString(html, 'text/html');

      var newRoot = doc.querySelector('#page-root') || doc.querySelector('.wrap');
      var oldRoot = document.querySelector('#page-root') || document.querySelector('.wrap');
      if (!newRoot || !oldRoot) { location.href = url; return; }

      var scripts = [];
      newRoot.querySelectorAll('script').forEach(function (s) {
        scripts.push({ src: s.src || null, text: s.textContent || '' });
        s.remove();
      });

      oldRoot.replaceWith(document.importNode(newRoot, true));

      var newTitle = doc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;
      var pageId = doc.body.getAttribute('data-page');
      if (pageId) document.documentElement.setAttribute('data-page', pageId);

      for (var i = 0; i < scripts.length; i++) {
        var sc = document.createElement('script');
        if (scripts[i].src) { sc.src = scripts[i].src; sc.async = false; }
        else { sc.textContent = scripts[i].text; }
        document.body.appendChild(sc);
      }

      if (push) history.pushState({ pjax: true }, '', url);
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.dispatchEvent(new CustomEvent('page:loaded', { detail: { url: url } }));

      updateNavActive(url);
      checkMaintenance();
    } catch (err) {
      console.warn('[pjax] fallback:', err);
      location.href = url;
    } finally { hideLoader(); }
  }

  function updateNavActive(url) {
    try {
      var file = (new URL(url, location.href)).pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-links a').forEach(function (a) {
        var href = a.getAttribute('href') || '';
        if (href.indexOf('.html') === -1 && href.indexOf('/') === -1) return;
        var hrefFile = href.split('#')[0];
        a.classList.toggle('active', hrefFile === file);
      });
    } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a');
    if (!a) return;
    if (!isHtmlLink(a)) return;
    e.preventDefault();
    var url = a.href;
    if (url === location.href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(url, true);
  });

  window.addEventListener('popstate', function () {
    navigate(location.href, false);
  });

  /* ====== SITE FETCH ====== */
  async function loadSite() {
    try {
      var r = await fetch('/api/site?t=' + Date.now(), { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var j = await r.json();
      saveSite(j);
      checkMaintenance();
    } catch (e) {
      try {
        var r2 = await fetch('data/status.json?t=' + Date.now(), { cache: 'no-cache' });
        if (r2.ok) {
          var j2 = await r2.json();
          saveSite(j2);
        }
      } catch (_) {}
      checkMaintenance();
    }
  }

  /* ====== UI BINDINGS ====== */
  function ensureToTop() {
    if (document.getElementById('toTop')) return;
    var b = document.createElement('button');
    b.id = 'toTop';
    b.title = 'Наверх';
    b.textContent = '↑';
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(b);
    window.addEventListener('scroll', function () {
      b.classList.toggle('show', window.scrollY > 500);
    });
  }

  function bindBurger() {
    var burger = document.getElementById('burger');
    var navLinks = document.getElementById('navLinks');
    if (!burger || !navLinks) return;
    if (burger.dataset.bound === '1') return;
    burger.dataset.bound = '1';
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      navLinks.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && e.target !== burger) navLinks.classList.remove('open');
    });
  }

  function bindReveal() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.animation = 'fadeUp .55s ease forwards';
          io.unobserve(e.target);
        }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.dataset.revealed === '1') return;
      el.dataset.revealed = '1';
      el.style.opacity = '0';
      io.observe(el);
    });
  }

  if (!document.getElementById('azfw-anim-style')) {
    var st = document.createElement('style');
    st.id = 'azfw-anim-style';
    st.textContent = '@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(st);
  }

  function addAdminBadge() {
    if (!isAdmin()) return;
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    if (navLinks.querySelector('.nav-admin-badge')) return;
    var badge = document.createElement('span');
    badge.className = 'nav-admin-badge';
    badge.textContent = '⚙ ' + adminName();
    navLinks.appendChild(badge);
  }

  function init() {
    ensureToast();
    ensureToTop();
    bindBurger();
    bindReveal();
    checkMaintenance();
    updateNavActive(location.href);
    addAdminBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  document.addEventListener('page:loaded', function () {
    bindBurger();
    bindReveal();
    addAdminBadge();
  });

  setTimeout(loadSite, 60);

  window.AZFW = {
    toast: toast,
    navigate: navigate,
    showLoader: showLoader,
    hideLoader: hideLoader,
    isAdmin: isAdmin,
    adminName: adminName,
    getSite: function () { return SITE_CACHE || cachedSite(); },
    saveSite: saveSite,
    refreshSite: loadSite
  };
})();