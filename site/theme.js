/* ============================================================
   theme.js — Arizona Faraway — 26
   26 базовых тем + 12 доп. + своё оформление.
   Исправлено: полный сброс inline-переменных, color-scheme и
   корректная подсветка активного пресета.
   ============================================================ */
(function () {
  'use strict';

  var THEMES = [
    { id:'ocean',    name:'Океан',      c1:'#3b82f6', c2:'#a78bfa' },
    { id:'midnight', name:'Полночь',    c1:'#0d0d0d', c2:'#6b6b6b' },
    { id:'crimson',  name:'Багровая',   c1:'#ef4444', c2:'#7a2038' },
    { id:'emerald',  name:'Изумруд',    c1:'#10b981', c2:'#1d7a52' },
    { id:'violet',   name:'Аметист',    c1:'#8b5cf6', c2:'#2a0e48' },
    { id:'sunset',   name:'Закат',      c1:'#f59e0b', c2:'#8a2a48' },
    { id:'light',    name:'Светлая',    c1:'#2563eb', c2:'#f5f7fb' },
    { id:'nord',     name:'Норд',       c1:'#88c0d0', c2:'#2e3a48' },
    { id:'cyber',    name:'Кибер',      c1:'#00e5ff', c2:'#c026ff' },
    { id:'forest',   name:'Лес',        c1:'#84cc16', c2:'#22381c' },
    { id:'rose',     name:'Роза',       c1:'#f43f5e', c2:'#3f1836' },
    { id:'amber',    name:'Янтарь',     c1:'#f59e0b', c2:'#3a2415' },
    { id:'sakura',   name:'Сакура',     c1:'#f9a8d4', c2:'#3d2040' },
    { id:'mono',     name:'Моно',       c1:'#e5e5e5', c2:'#1c1c1c' },
    { id:'arctic',   name:'Арктика',    c1:'#0ea5e9', c2:'#e0f2fe' },
    { id:'coffee',   name:'Кофе',       c1:'#d97706', c2:'#2a231c' },
    { id:'matrix',   name:'Матрица',    c1:'#00ff41', c2:'#0d1c0d' },
    { id:'aurora',   name:'Аврора',     c1:'#67e8f9', c2:'#a78bfa' },
    { id:'galaxy',   name:'Галактика',  c1:'#a855f7', c2:'#0891b2' },
    { id:'nebula',   name:'Небула',     c1:'#22d3ee', c2:'#c084fc' },
    { id:'neon',     name:'Неон',       c1:'#ff10f0', c2:'#39ff14' },
    { id:'lavender', name:'Лаванда',    c1:'#7c3aed', c2:'#e9deff' },
    { id:'peach',    name:'Персик',     c1:'#f97316', c2:'#ffe0c8' },
    { id:'bloodmoon',name:'Кроволуние', c1:'#dc2626', c2:'#450a0a' },
    { id:'tropical', name:'Тропики',    c1:'#14b8a6', c2:'#ea580c' },
    { id:'vintage',  name:'Винтаж',     c1:'#92400e', c2:'#f5efe0' }
  ];

  var EXTRA_THEMES = [
    { id:'obsidian', name:'Обсидиан', c1:'#1a1a2e', c2:'#8b5cf6', css:{
      '--bg-0':'#07070c','--bg-1':'#0e0e18','--bg-2':'#16162a',
      '--card':'#1a1a2e','--card-2':'#242440',
      '--border':'#2a2a4a','--border-2':'#3a3a5e',
      '--accent':'#8b5cf6','--accent-2':'#a78bfa','--accent-3':'#c4b5fd',
      '--glow':'rgba(139,92,246,.45)',
      '--text':'#ebebf7','--text-2':'#b0b0cc','--dim':'#7a7aa0',
      '--green':'#34d399','--red':'#f87171','--yellow':'#fbbf24','--violet':'#c4b5fd',
      '--tg':'#229ED9','--gold':'#fbbf24','--gold-2':'#f59e0b',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#2a2a4a 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#1a1a2e 0%,transparent 60%),#07070c',
      '--grid-line':'rgba(139,92,246,.05)'
    }},
    { id:'mint', name:'Мята', c1:'#10b981', c2:'#ecfdf5', css:{
      'color-scheme':'light',
      '--bg-0':'#f0fdf9','--bg-1':'#dcfce7','--bg-2':'#bbf7d0',
      '--card':'#ffffff','--card-2':'#f0fdf4',
      '--border':'#a7f3d0','--border-2':'#6ee7b7',
      '--accent':'#059669','--accent-2':'#10b981','--accent-3':'#34d399',
      '--glow':'rgba(5,150,105,.3)',
      '--text':'#022c22','--text-2':'#065f46','--dim':'#6b8f80',
      '--green':'#059669','--red':'#dc2626','--yellow':'#d97706','--violet':'#7c3aed',
      '--tg':'#229ED9','--gold':'#d97706','--gold-2':'#b45309',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#bbf7d0 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#dcfce7 0%,transparent 60%),#f0fdf9',
      '--grid-line':'rgba(5,150,105,.06)'
    }},
    { id:'royal', name:'Роял', c1:'#1e3a8a', c2:'#fbbf24', css:{
      '--bg-0':'#050818','--bg-1':'#0a1028','--bg-2':'#0f1738',
      '--card':'#141d44','--card-2':'#1c2858',
      '--border':'#2a3a78','--border-2':'#3a4e96',
      '--accent':'#3b82f6','--accent-2':'#fbbf24','--accent-3':'#fcd34d',
      '--glow':'rgba(251,191,36,.35)',
      '--text':'#eaf0ff','--text-2':'#b0b8d8','--dim':'#7888a8',
      '--green':'#34d399','--red':'#f87171','--yellow':'#fbbf24','--violet':'#a78bfa',
      '--tg':'#229ED9','--gold':'#fbbf24','--gold-2':'#f59e0b',
      '--bg-image':'radial-gradient(1300px 700px at 50% -10%,#1e3a8a 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#0f1738 0%,transparent 60%),#050818',
      '--grid-line':'rgba(251,191,36,.05)'
    }},
    { id:'coral', name:'Коралл', c1:'#fb7185', c2:'#fff1f2', css:{
      'color-scheme':'light',
      '--bg-0':'#fff5f6','--bg-1':'#ffe4e6','--bg-2':'#fecdd3',
      '--card':'#ffffff','--card-2':'#fff1f2',
      '--border':'#fecdd3','--border-2':'#fda4af',
      '--accent':'#e11d48','--accent-2':'#fb7185','--accent-3':'#fda4af',
      '--glow':'rgba(225,29,72,.25)',
      '--text':'#4c0519','--text-2':'#881337','--dim':'#9f7480',
      '--green':'#059669','--red':'#dc2626','--yellow':'#d97706','--violet':'#7c3aed',
      '--tg':'#229ED9','--gold':'#d97706','--gold-2':'#b45309',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#fecdd3 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#ffe4e6 0%,transparent 60%),#fff5f6',
      '--grid-line':'rgba(225,29,72,.06)'
    }},
    { id:'sky', name:'Небо', c1:'#0ea5e9', c2:'#f0f9ff', css:{
      'color-scheme':'light',
      '--bg-0':'#f0f9ff','--bg-1':'#e0f2fe','--bg-2':'#bae6fd',
      '--card':'#ffffff','--card-2':'#f0f9ff',
      '--border':'#bae6fd','--border-2':'#7dd3fc',
      '--accent':'#0284c7','--accent-2':'#0ea5e9','--accent-3':'#38bdf8',
      '--glow':'rgba(2,132,199,.3)',
      '--text':'#082f49','--text-2':'#0c4a6e','--dim':'#5c7a8f',
      '--green':'#059669','--red':'#dc2626','--yellow':'#d97706','--violet':'#7c3aed',
      '--tg':'#229ED9','--gold':'#d97706','--gold-2':'#b45309',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#bae6fd 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#e0f2fe 0%,transparent 60%),#f0f9ff',
      '--grid-line':'rgba(2,132,199,.06)'
    }},
    { id:'lava', name:'Лава', c1:'#dc2626', c2:'#f59e0b', css:{
      '--bg-0':'#0f0403','--bg-1':'#1a0a06','--bg-2':'#260f08',
      '--card':'#2a1208','--card-2':'#3a1a0e',
      '--border':'#5c2414','--border-2':'#7d321c',
      '--accent':'#dc2626','--accent-2':'#f59e0b','--accent-3':'#fbbf24',
      '--glow':'rgba(220,38,38,.5)',
      '--text':'#fff2e6','--text-2':'#dbb8a0','--dim':'#9a7060',
      '--green':'#84cc16','--red':'#f87171','--yellow':'#fbbf24','--violet':'#a855f7',
      '--tg':'#229ED9','--gold':'#fbbf24','--gold-2':'#f59e0b',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#5c2414 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#7d321c 0%,transparent 60%),#0f0403',
      '--grid-line':'rgba(220,38,38,.06)'
    }},
    { id:'cherry', name:'Вишня', c1:'#e11d48', c2:'#fecdd3', css:{
      'color-scheme':'light',
      '--bg-0':'#fff1f3','--bg-1':'#ffe4e6','--bg-2':'#fecdd3',
      '--card':'#ffffff','--card-2':'#fff1f3',
      '--border':'#fecdd3','--border-2':'#fda4af',
      '--accent':'#be123c','--accent-2':'#e11d48','--accent-3':'#fb7185',
      '--glow':'rgba(190,18,60,.3)',
      '--text':'#3f0713','--text-2':'#7f1d3a','--dim':'#8f5c68',
      '--green':'#059669','--red':'#dc2626','--yellow':'#d97706','--violet':'#7c3aed',
      '--tg':'#229ED9','--gold':'#d97706','--gold-2':'#b45309',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#fecdd3 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#ffe4e6 0%,transparent 60%),#fff1f3',
      '--grid-line':'rgba(190,18,60,.06)'
    }},
    { id:'eggplant', name:'Баклажан', c1:'#7e22ce', c2:'#1e1b4b', css:{
      '--bg-0':'#0a0514','--bg-1':'#120a20','--bg-2':'#1c0e2f',
      '--card':'#1e1038','--card-2':'#281448',
      '--border':'#3a1e5e','--border-2':'#4e2880',
      '--accent':'#a855f7','--accent-2':'#c084fc','--accent-3':'#e879f9',
      '--glow':'rgba(168,85,247,.5)',
      '--text':'#f4ecff','--text-2':'#c4b0dd','--dim':'#8a78a0',
      '--green':'#34d399','--red':'#fb7185','--yellow':'#fde68a','--violet':'#e879f9',
      '--tg':'#229ED9','--gold':'#fde68a','--gold-2':'#f59e0b',
      '--bg-image':'radial-gradient(1300px 700px at 20% -10%,#7e22ce 0%,transparent 55%),radial-gradient(900px 500px at 90% 40%,#4c1d95 0%,transparent 55%),#0a0514',
      '--grid-line':'rgba(168,85,247,.06)'
    }},
    { id:'aqua', name:'Аквамарин', c1:'#06b6d4', c2:'#a5f3fc', css:{
      '--bg-0':'#041418','--bg-1':'#062028','--bg-2':'#082a36',
      '--card':'#0a303e','--card-2':'#0e3e50',
      '--border':'#155a70','--border-2':'#1e7a94',
      '--accent':'#06b6d4','--accent-2':'#22d3ee','--accent-3':'#67e8f9',
      '--glow':'rgba(6,182,212,.5)',
      '--text':'#e0f9ff','--text-2':'#a8d8e0','--dim':'#6b9aa4',
      '--green':'#34d399','--red':'#f87171','--yellow':'#fbbf24','--violet':'#a78bfa',
      '--tg':'#229ED9','--gold':'#fbbf24','--gold-2':'#f59e0b',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#0e7490 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#082a36 0%,transparent 60%),#041418',
      '--grid-line':'rgba(6,182,212,.06)'
    }},
    { id:'raspberry', name:'Малина', c1:'#db2777', c2:'#fbcfe8', css:{
      'color-scheme':'light',
      '--bg-0':'#fdf2f8','--bg-1':'#fce7f3','--bg-2':'#fbcfe8',
      '--card':'#ffffff','--card-2':'#fdf2f8',
      '--border':'#fbcfe8','--border-2':'#f9a8d4',
      '--accent':'#db2777','--accent-2':'#ec4899','--accent-3':'#f472b6',
      '--glow':'rgba(219,39,119,.3)',
      '--text':'#500724','--text-2':'#831843','--dim':'#9a6a80',
      '--green':'#059669','--red':'#dc2626','--yellow':'#d97706','--violet':'#7c3aed',
      '--tg':'#229ED9','--gold':'#d97706','--gold-2':'#b45309',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#fbcfe8 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#fce7f3 0%,transparent 60%),#fdf2f8',
      '--grid-line':'rgba(219,39,119,.06)'
    }},
    { id:'deepsea', name:'Глубина', c1:'#0c4a6e', c2:'#06b6d4', css:{
      '--bg-0':'#020d16','--bg-1':'#041824','--bg-2':'#062334',
      '--card':'#082a40','--card-2':'#0c3a54',
      '--border':'#125878','--border-2':'#1a789c',
      '--accent':'#06b6d4','--accent-2':'#22d3ee','--accent-3':'#67e8f9',
      '--glow':'rgba(6,182,212,.4)',
      '--text':'#dff4ff','--text-2':'#a8ccdc','--dim':'#6b8c9e',
      '--green':'#34d399','--red':'#f87171','--yellow':'#fbbf24','--violet':'#a78bfa',
      '--tg':'#229ED9','--gold':'#fbbf24','--gold-2':'#f59e0b',
      '--bg-image':'radial-gradient(1300px 700px at 50% -10%,#0c4a6e 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#062334 0%,transparent 60%),#020d16',
      '--grid-line':'rgba(6,182,212,.05)'
    }},
    { id:'safari', name:'Сафари', c1:'#a16207', c2:'#fef3c7', css:{
      'color-scheme':'light',
      '--bg-0':'#fdf9ee','--bg-1':'#fef3c7','--bg-2':'#fde68a',
      '--card':'#ffffff','--card-2':'#fffbeb',
      '--border':'#fde68a','--border-2':'#fcd34d',
      '--accent':'#a16207','--accent-2':'#ca8a04','--accent-3':'#eab308',
      '--glow':'rgba(161,98,7,.25)',
      '--text':'#422006','--text-2':'#713f12','--dim':'#8f7a4c',
      '--green':'#4d7c0f','--red':'#b91c1c','--yellow':'#a16207','--violet':'#7c3aed',
      '--tg':'#229ED9','--gold':'#a16207','--gold-2':'#854d0e',
      '--bg-image':'radial-gradient(1200px 600px at 50% -10%,#fde68a 0%,transparent 55%),radial-gradient(900px 500px at 90% 100%,#fef3c7 0%,transparent 60%),#fdf9ee',
      '--grid-line':'rgba(161,98,7,.06)'
    }}
  ];

  var KEY = 'azfw26_theme';
  var CUSTOM_KEY = 'azfw26_custom_theme';
  var DEFAULT = 'ocean';

  var ALL_THEMES = THEMES.concat(EXTRA_THEMES.map(function (t) {
    return { id: t.id, name: t.name, c1: t.c1, c2: t.c2 };
  }));

  (function injectExtraThemes() {
    if (document.getElementById('azfw-extra-themes')) return;
    var cssText = EXTRA_THEMES.map(function (t) {
      var rules = Object.keys(t.css).map(function (k) { return k + ':' + t.css[k]; }).join(';');
      return '[data-theme="' + t.id + '"]{' + rules + '}';
    }).join('\n');
    var st = document.createElement('style');
    st.id = 'azfw-extra-themes';
    st.textContent = cssText;
    (document.head || document.documentElement).appendChild(st);
  })();

  function hexToRgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (x) {
      x = Math.max(0, Math.min(255, Math.round(x)));
      return x.toString(16).padStart(2, '0');
    }).join('');
  }
  function mix(c1, c2, t) {
    var a = hexToRgb(c1), b = hexToRgb(c2);
    return rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
  }
  function lighten(c, t) { return mix(c, '#ffffff', t); }
  function rgba(hex, a) {
    var c = hexToRgb(hex);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }
  function lum(hex) {
    var c = hexToRgb(hex);
    return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
  }

  var CUSTOM_VARS = [
    '--bg-0','--bg-1','--bg-2','--card','--card-2','--border','--border-2',
    '--accent','--accent-2','--accent-3','--glow','--text','--text-2','--dim',
    '--bg-image','--grid-line'
  ];

  // ПОЛНЫЙ сброс inline-стилей с <html>. Раньше часть переменных
  // (--accent-2, --accent-3, --glow, --text-2, --dim) могла
  // остаться после переключения custom→пресет и ломать кнопку «Сброс».
  function purgeInlineVars() {
    var root = document.documentElement;
    CUSTOM_VARS.forEach(function (p) { root.style.removeProperty(p); });
    root.style.removeProperty('color-scheme');
    try { root.style.colorScheme = ''; } catch (e) {}
    // На всякий: удаляем любые наши inline-переменные, даже если CUSTOM_VARS
    // когда-то расширят, а они остались.
    for (var i = root.style.length - 1; i >= 0; i--) {
      var prop = root.style[i];
      if (prop.indexOf('--') === 0) root.style.removeProperty(prop);
    }
  }

  function apply(theme) {
    purgeInlineVars();
    if (!ALL_THEMES.some(function (t) { return t.id === theme; }) && theme !== 'custom') {
      theme = DEFAULT;
    }
    document.documentElement.setAttribute('data-theme', theme);
  }

  function applyCustom(cfg) {
    purgeInlineVars();
    var root = document.documentElement;
    root.setAttribute('data-theme', 'custom');

    var bg     = cfg.bg     || '#03060f';
    var card   = cfg.card   || '#0b1e3d';
    var accent = cfg.accent || '#3b82f6';
    var text   = cfg.text   || '#e8effa';
    var isDark = lum(bg) < 0.5;
    var border  = mix(card, accent, 0.28);
    var border2 = mix(card, accent, 0.5);

    root.style.setProperty('--bg-0', bg);
    root.style.setProperty('--bg-1', mix(bg, card, 0.35));
    root.style.setProperty('--bg-2', mix(bg, card, 0.6));
    root.style.setProperty('--card', card);
    root.style.setProperty('--card-2', lighten(card, isDark ? 0.08 : 0.02));
    root.style.setProperty('--border', border);
    root.style.setProperty('--border-2', border2);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-2', lighten(accent, 0.18));
    root.style.setProperty('--accent-3', lighten(accent, 0.38));
    root.style.setProperty('--glow', rgba(accent, 0.45));
    root.style.setProperty('--text', text);
    root.style.setProperty('--text-2', mix(text, bg, 0.35));
    root.style.setProperty('--dim', mix(text, bg, 0.6));
    root.style.setProperty('--bg-image',
      'radial-gradient(1200px 600px at 50% -10%,' + rgba(accent, 0.10) + ' 0%,transparent 55%),' +
      'radial-gradient(900px 500px at 90% 100%,' + rgba(accent, 0.06) + ' 0%,transparent 60%),' + bg
    );
    root.style.setProperty('--grid-line', rgba(accent, 0.05));
    try { root.style.colorScheme = isDark ? 'dark' : 'light'; } catch (e) {}
  }

  // Старт
  var savedId = DEFAULT;
  try { savedId = localStorage.getItem(KEY) || DEFAULT; } catch (e) {}
  if (savedId === 'custom') {
    try {
      var cc = JSON.parse(localStorage.getItem(CUSTOM_KEY) || 'null');
      if (cc) applyCustom(cc); else apply(DEFAULT);
    } catch (e) { apply(DEFAULT); }
  } else {
    apply(savedId);
  }

  function build() {
    if (document.querySelector('.theme-fab')) return;

    var fab = document.createElement('button');
    fab.className = 'theme-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Выбрать тему');
    fab.title = 'Тема оформления';
    fab.innerHTML = '🎨';

    var panel = document.createElement('div');
    panel.className = 'theme-panel';

    var customCfg = { bg: '#03060f', card: '#0b1e3d', accent: '#3b82f6', text: '#e8effa' };
    try {
      var cc = JSON.parse(localStorage.getItem(CUSTOM_KEY) || 'null');
      if (cc) customCfg = Object.assign(customCfg, cc);
    } catch (e) {}

    var themesHTML = ALL_THEMES.map(function (t) {
      return '<button type="button" class="tp-item" data-theme="' + t.id + '">' +
        '<span class="tp-swatch" style="background:linear-gradient(135deg,' + t.c1 + ',' + t.c2 + ')"></span>' +
        '<span class="tp-name">' + t.name + '</span>' +
      '</button>';
    }).join('');

    panel.innerHTML =
      '<div class="tp-head"><span>🎨 Тема оформления</span><span class="tp-count">' + ALL_THEMES.length + '</span></div>' +
      '<div class="tp-grid">' + themesHTML + '</div>' +
      '<div class="tp-divider"></div>' +
      '<div class="tp-section">Своё оформление</div>' +
      '<div class="tp-field"><label>Фон</label><input type="color" id="custBg" value="' + customCfg.bg + '"></div>' +
      '<div class="tp-field"><label>Карточки</label><input type="color" id="custCard" value="' + customCfg.card + '"></div>' +
      '<div class="tp-field"><label>Акцент</label><input type="color" id="custAccent" value="' + customCfg.accent + '"></div>' +
      '<div class="tp-field"><label>Текст</label><input type="color" id="custText" value="' + customCfg.text + '"></div>' +
      '<div class="tp-custom-actions">' +
        '<button type="button" class="btn btn-primary" id="applyCustomBtn">Применить</button>' +
        '<button type="button" class="btn btn-ghost" id="resetCustomBtn">Сброс</button>' +
      '</div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    function highlightActive() {
      var cur = document.documentElement.getAttribute('data-theme');
      panel.querySelectorAll('.tp-item').forEach(function (b) {
        b.classList.toggle('active', b.dataset.theme === cur);
      });
    }
    highlightActive();

    panel.querySelectorAll('.tp-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.theme;
        apply(id);
        try { localStorage.setItem(KEY, id); } catch (e) {}
        highlightActive();
        setTimeout(function () { panel.classList.remove('open'); }, 220);
      });
    });

    document.getElementById('applyCustomBtn').addEventListener('click', function () {
      var cfg = {
        bg: document.getElementById('custBg').value,
        card: document.getElementById('custCard').value,
        accent: document.getElementById('custAccent').value,
        text: document.getElementById('custText').value
      };
      try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(cfg)); } catch (e) {}
      try { localStorage.setItem(KEY, 'custom'); } catch (e) {}
      applyCustom(cfg);
      highlightActive();
      if (window.AZFW && window.AZFW.toast) window.AZFW.toast('✓ Своя тема применена');
    });

    document.getElementById('resetCustomBtn').addEventListener('click', function () {
      var def = { bg: '#03060f', card: '#0b1e3d', accent: '#3b82f6', text: '#e8effa' };
      document.getElementById('custBg').value = def.bg;
      document.getElementById('custCard').value = def.card;
      document.getElementById('custAccent').value = def.accent;
      document.getElementById('custText').value = def.text;

      // 1) вычищаем кастом полностью
      try { localStorage.removeItem(CUSTOM_KEY); } catch (e) {}
      // 2) сбрасываем тему к дефолту
      try { localStorage.setItem(KEY, DEFAULT); } catch (e) {}
      apply(DEFAULT);
      highlightActive();

      if (window.AZFW && window.AZFW.toast) window.AZFW.toast('Сброшено к «Океан»');
    });

    ['custBg','custCard','custAccent','custText'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        var cfg = {
          bg: document.getElementById('custBg').value,
          card: document.getElementById('custCard').value,
          accent: document.getElementById('custAccent').value,
          text: document.getElementById('custText').value
        };
        applyCustom(cfg);
      });
    });

    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== fab) panel.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') panel.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
  document.addEventListener('page:loaded', function () {
    if (!document.querySelector('.theme-fab')) build();
  });

  window.AZFWTheme = {
    apply: apply,
    applyCustom: applyCustom,
    reset: function () {
      try { localStorage.removeItem(CUSTOM_KEY); } catch (e) {}
      try { localStorage.setItem(KEY, DEFAULT); } catch (e) {}
      apply(DEFAULT);
    },
    list: function () { return ALL_THEMES.slice(); },
    current: function () { return document.documentElement.getAttribute('data-theme'); }
  };
})();