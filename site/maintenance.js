(function(){
  'use strict';

  var SESSION_KEY = 'azfw26_admin_session';
  var STATUS_URL = 'data/status.json';

  function getSession(){
    try{
      var raw = localStorage.getItem(SESSION_KEY);
      if(!raw) return null;
      var s = JSON.parse(raw);
      if(!s || !s.expires) return null;
      if(s.expires < Date.now()){
        try{ localStorage.removeItem(SESSION_KEY); }catch(e){}
        return null;
      }
      return s;
    }catch(e){ return null; }
  }

  function isMaintenancePage(){
    var p = location.pathname;
    return /maintenance\.html?$/.test(p) || /\/maintenance\/?$/.test(p);
  }
  function isAdminPage(){
    var p = location.pathname;
    return /admin\.html?$/.test(p) || /\/admin\/?$/.test(p);
  }

  function showAdminBar(){
    if(document.getElementById('azfw-admin-bar')) return;
    if(!document.body){
      document.addEventListener('DOMContentLoaded', showAdminBar);
      return;
    }
    var bar = document.createElement('div');
    bar.id = 'azfw-admin-bar';
    bar.className = 'azfw-admin-bar';
    bar.innerHTML =
      '<span class="azfw-admin-bar-ico">⚠️</span>' +
      '<span class="azfw-admin-bar-txt"><b>Тех. обслуживание включено.</b> ' +
      'Ты видишь сайт как администратор. Посетители видят заглушку.</span>' +
      '<a class="azfw-admin-bar-btn" href="admin.html">Управление</a>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.style.scrollPaddingTop = '60px';
    var style = document.createElement('style');
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

  function apply(state){
    var isAdmin = !!getSession();
    var onMaint = isMaintenancePage();
    var onAdmin = isAdminPage();
    var maintenance = false;
    var info = {};

    if(state){
      if(state.maintenance === true){ maintenance = true; info = state; }
      else if(state.maintenance && typeof state.maintenance === 'object'){
        maintenance = !!state.maintenance.enabled;
        info = state.maintenance;
      }
    }

    if(onAdmin){
      if(maintenance && isAdmin) showAdminBar();
      return;
    }
    if(maintenance && !onMaint && !isAdmin){
      location.replace('maintenance.html');
      return;
    }
    if(!maintenance && onMaint && !isAdmin){
      location.replace('index.html');
      return;
    }
    if(maintenance && isAdmin && !onMaint){
      showAdminBar();
    }
  }

  function check(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', STATUS_URL + '?t=' + Date.now(), true);
    xhr.onload = function(){
      var data = null;
      if(xhr.status >= 200 && xhr.status < 300){
        try{ data = JSON.parse(xhr.responseText); }catch(e){ data = null; }
      }
      apply(data);
    };
    xhr.onerror = function(){ apply(null); };
    try{ xhr.send(); }catch(e){ apply(null); }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }
})();