/* ============================================================
   maintenance.js — Arizona Faraway — 26
   Читает статус сайта с Worker'а (/api/site).
   Fallback: data/status.json, если Worker недоступен.
   ============================================================ */
(function () {
  'use strict';

  var SESSION_KEY = 'azfw26_admin_session';
  var STATUS_API = '/api/site';
  var STATUS_FALLBACK = 'data/status.json';
  var CACHE_TTL = 30 * 1000;

  var _cache = null;
  var _cacheAt = 0;

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) {
        // сессия админа из admin.html (JWT) тоже считается
        if (localStorage.getItem('azfw26_admin_token')) return { via: 'jwt' };
        return null;
      }
      var s = JSON.parse(raw);
      if (!s || !s.expires) return null;
      if (s.expires < Date.now()) {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
        return null;
      }
      return s;
    } catch (e) { return null; }
  }

  function isAdmin() {
    if (getSession()) return true;
    // если есть JWT-токен из новой админки — считаем админом
    try { if (localStorage.getItem('azfw26_admin_token')) return true; } catch (e) {}
    return false;
  }

  function isMaintenancePage() {
    var p = location.pathname;
    return /maintenance\.html?$/.test(p) || /\/maintenance\/?$/.test(p);
  }
  function isAdminPage() {
    var p = location.pathname;
    return /admin\.html?$/.test(p) || /\/admin\/?$/.test(p);
  }

  function showAdminBar(reason) {
    if (document.getElementById('azfw-admin-bar')) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', function () { showAdminBar(reason); });
      return;
    }
    var bar = document.createElement('div');
    bar.id = 'azfw-admin-bar';
    bar.className = 'azfw-admin-bar';
    bar.innerHTML =
      '<span class="azfw-admin-bar-ico">⚠️</span>' +
      '<span class="azfw-admin-bar-txt"><b>Тех. обслуживание включено.</b> ' +
      (reason ? escapeHtml(reason) + ' ' : '') +
      'Ты видишь сайт как администратор.</span>' +
      '<a class="azfw-admin-bar-btn" href="admin.html">Управление</a>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.style.scrollPaddingTop = '60px';
    if (!document.getElementById('azfw-admin-bar-style')) {
      var style = document.createElement('style');
      style.id = 'azfw-admin-bar-style';
      style.textContent =
        '.azfw-admin-bar{position:fixed;top:0;left:0;right:0;z-index:9000;' +
        'display:flex;align-items:center;gap:12px;padding:10px 20px;' +
        'background:linear-gradient(90deg,rgba(251,191,36,.22),rgba(248,113,113,.22));' +
        'border-bottom:1px solid rgba(251,191,36,.5);color:#fbbf24;' +
        'font-size:13px;font-weight:600;backdrop-filter:blur(12px);' +
        'font-family:Inter,system-ui,sans-serif;' +
        'box-shadow:0 4px 20px rgba(0,0,0,.4);}' +
        '.azfw-admin-bar-ico{font-size:16px;}' +
        '.azfw-admin-bar-txt{flex:1;line-height:1.4;}' +
        '.azfw-admin-bar-btn{background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.5);' +
        'color:#fbbf24;padding:5px 14px;border-radius:8px;font-size:12px;font-weight:700;' +
        'text-decoration:none;transition:.2s;white-space:nowrap;}' +
        '.azfw-admin-bar-btn:hover{background:rgba(251,191,36,.3);}';
      document.head.appendChild(style);
    }
  }

  function hideAdminBar() {
    var b = document.getElementById('azfw-admin-bar');
    if (b) b.remove();
    document.documentElement.style.scrollPaddingTop = '';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function parseState(state) {
    var maintenance = false;
    var info = {};
    if (!state) return { maintenance: false, info: {} };
    if (state.maintenance === true) { maintenance = true; info = state; }
    else if (state.maintenance && typeof state.maintenance === 'object') {
      maintenance = !!state.maintenance.enabled;
      info = state.maintenance;
    }
    return { maintenance: maintenance, info: info };
  }

  function apply(state) {
    var parsed = parseState(state);
    var isAdminUser = isAdmin();
    var onMaint = isMaintenancePage();
    var onAdmin = isAdminPage();

    if (onAdmin) {
      if (parsed.maintenance && isAdminUser) showAdminBar(parsed.info.message);
      return;
    }

    if (parsed.maintenance && !onMaint && !isAdminUser) {
      try { sessionStorage.setItem('azfw26_maint_from', location.pathname); } catch (e) {}
      location.replace('maintenance.html');
      return;
    }

    if (!parsed.maintenance && onMaint && !isAdminUser) {
      location.replace('index.html');
      return;
    }

    if (parsed.maintenance && isAdminUser && !onMaint) {
      showAdminBar(parsed.info.message);
    } else {
      hideAdminBar();
    }
  }

  function fetchState() {
    var now = Date.now();
    if (_cache && now - _cacheAt < CACHE_TTL) return Promise.resolve(_cache);

    return fetch(STATUS_API + '?t=' + now, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data) {
          _cache = data; _cacheAt = now;
          return data;
        }
        return fetch(STATUS_FALLBACK + '?t=' + now, { cache: 'no-cache' })
          .then(function (r2) { return r2.ok ? r2.json() : null; })
          .catch(function () { return null; });
      })
      .catch(function () {
        return fetch(STATUS_FALLBACK + '?t=' + now, { cache: 'no-cache' })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      });
  }

  function check() {
    fetchState().then(apply).catch(function () { apply(null); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }

  /* Раз в минуту перепроверяем статус, если вкладка открыта */
  setInterval(function () { _cacheAt = 0; check(); }, 60000);

  window.AZFWMaintenance = {
    refresh: function () { _cacheAt = 0; return check(); },
    get: function () { return _cache; }
  };
})();