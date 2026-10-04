/* ============================================================
   Cloudflare Worker — Arizona Faraway — 26
   Разворачивается в дашборде Cloudflare Workers.
   Требует:
     - KV namespace  -> переменная окружения  AZFW_KV
     - Secret        -> BOT_TOKEN     (токен бота от @BotFather)
     - Secret        -> JWT_SECRET    (любая случайная строка 32+ символов)
     - Secret        -> ADMIN_PASSWORD (если хочешь fallback-пароль)
     - KV-ключ "admins" в namespace AZFW_KV  -> JSON-массив Telegram ID
       Пример: [123456789, 987654321]
   ============================================================ */

const SESSION_TTL_SEC = 12 * 60 * 60;
const CODE_TTL_SEC = 10 * 60;
const TEMP_TTL_SEC = 10 * 60;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = corsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (path === '/api/auth/tg-verify' && request.method === 'POST') return await tgVerify(request, env, cors);
      if (path === '/api/auth/tg-confirm' && request.method === 'POST') return await tgConfirm(request, env, cors);
      if (path === '/api/auth/logout' && request.method === 'POST') return await logout(request, env, cors);
      if (path === '/api/admin/me' && request.method === 'GET') return await adminMe(request, env, cors);
      if (path === '/api/admin/updates' && request.method === 'GET') return await getUpdates(request, env, cors);
      if (path === '/api/admin/site' && request.method === 'GET') return await getSite(request, env, cors);
      if (path === '/api/admin/site' && request.method === 'POST') return await setSite(request, env, cors);
      if (path === '/api/admin/posts' && request.method === 'GET') return await adminPostsList(request, env, cors);
      if (path.startsWith('/api/admin/posts/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        return await adminPostDelete(request, env, cors, id);
      }
      if (path === '/api/posts' && request.method === 'GET') return await postsList(env, cors);
      if (path === '/api/posts' && request.method === 'POST') return await postCreate(request, env, cors);
      if (path === '/api/site' && request.method === 'GET') return await getSitePublic(env, cors);

      if (path === '/api/auth/google-url' && request.method === 'GET') return await googleUrl(env, cors);
      if (path === '/api/auth/google-callback' && request.method === 'POST') return await googleCallback(request, env, cors);
      if (path === '/api/auth/google-link' && request.method === 'POST') return await googleLink(request, env, cors);

      if (path === '/api/tg/webhook' && request.method === 'POST') return await tgWebhook(request, env, cors);

      return json({ error: 'Not found: ' + path }, 404, cors);
    } catch (e) {
      return json({ error: e.message || 'Server error' }, 500, cors);
    }
  }
};

/* ============================================================
   CORS
   ============================================================ */
function corsHeaders(req){
  const origin = req.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
}
function json(obj, status, cors){
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json' }, cors || {})
  });
}

/* ============================================================
   TELEGRAM HASH VERIFY
   ============================================================ */
async function verifyTelegramHash(data, botToken){
  const { hash, ...rest } = data;
  if(!hash) return false;
  const dataCheckString = Object.keys(rest).sort().map(k => k + '=' + rest[k]).join('\n');
  const enc = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw', enc.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const secret = await crypto.subtle.sign('HMAC', secretKey, enc.encode(botToken));
  const hmacKey = await crypto.subtle.importKey(
    'raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', hmacKey, enc.encode(dataCheckString));
  const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === hash;
}

async function tgVerify(request, env, cors){
  const body = await request.json();
  let tgUser = null;

  if(body.initData){
    const params = new URLSearchParams(body.initData);
    const obj = {};
    for(const [k, v] of params) obj[k] = v;
    if(!await verifyTelegramHash(obj, env.BOT_TOKEN)) return json({ error: 'TG hash invalid' }, 401, cors);
    tgUser = JSON.parse(obj.user || '{}');
  } else if(body.user){
    if(!body.user.hash) return json({ error: 'No hash' }, 400, cors);
    if(!await verifyTelegramHash(body.user, env.BOT_TOKEN)) return json({ error: 'TG hash invalid' }, 401, cors);
    tgUser = body.user;
  } else {
    return json({ error: 'No TG data' }, 400, cors);
  }

  const admins = await getAdmins(env);
  if(!admins.includes(Number(tgUser.id))){
    return json({ error: 'Ты не в списке администраторов' }, 403, cors);
  }

  if (body.password) {
    if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
      return json({ error: 'Неверный пароль' }, 401, cors);
    }
  } else if (env.ADMIN_PASSWORD) {
    return json({ error: 'Требуется админ-пароль' }, 401, cors);
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const tempToken = crypto.randomUUID();
  await env.AZFW_KV.put('temp:' + tempToken, JSON.stringify({
    tg: tgUser,
    code,
    created_at: Date.now()
  }), { expirationTtl: TEMP_TTL_SEC });

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  await sendTelegramMessage(env, tgUser.id,
    `🔐 <b>Arizona Faraway — 26</b>\n\nКод для входа в админ-панель:\n\n<code>${code}</code>\n\nIP: <code>${ip}</code>\n\nКод действует 10 минут.`);

  return json({ status: 'code_sent', temp_token: tempToken }, 200, cors);
}

async function tgConfirm(request, env, cors){
  const { temp_token, code } = await request.json();
  if(!temp_token || !code) return json({ error: 'No data' }, 400, cors);

  const raw = await env.AZFW_KV.get('temp:' + temp_token);
  if(!raw) return json({ error: 'Код истёк, запроси новый' }, 400, cors);
  const session = JSON.parse(raw);
  if(session.code !== String(code)) return json({ error: 'Неверный код' }, 401, cors);

  await env.AZFW_KV.delete('temp:' + temp_token);

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const token = await signJwt({
    sub: session.tg.id,
    username: session.tg.username || ('id' + session.tg.id),
    name: session.tg.first_name || '',
    ip,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC
  }, env.JWT_SECRET);

  return json({ status: 'ok', token, username: session.tg.username || ('id' + session.tg.id) }, 200, cors);
}

async function logout(request, env, cors){
  return json({ ok: true }, 200, cors);
}

/* ============================================================
   ADMIN AUTH MIDDLEWARE
   ============================================================ */
async function requireAdmin(request, env, cors){
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if(!token) throw { status: 401, message: 'No token' };
  const payload = await verifyJwt(token, env.JWT_SECRET);
  if(!payload) throw { status: 401, message: 'Token invalid/expired' };

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  if(payload.ip && payload.ip !== ip){
    await sendTelegramMessage(env, payload.sub,
      `⚠️ IP изменился!\nБыло: ${payload.ip}\nСтало: ${ip}\n\nВойди в админку заново.`);
    throw { status: 401, message: 'IP changed — re-login required' };
  }
  return payload;
}

async function adminMe(request, env, cors){
  try {
    const payload = await requireAdmin(request, env, cors);
    return json({ username: payload.username, id: payload.sub }, 200, cors);
  } catch(e){
    return json({ error: e.message }, e.status || 401, cors);
  }
}

async function getUpdates(request, env, cors){
  try {
    await requireAdmin(request, env, cors);
    const raw = await env.AZFW_KV.get('updates:latest');
    return json(raw ? JSON.parse(raw) : { items: [] }, 200, cors);
  } catch(e){
    return json({ error: e.message }, e.status || 500, cors);
  }
}

async function getSite(request, env, cors){
  const raw = await env.AZFW_KV.get('site:status');
  return json(raw ? JSON.parse(raw) : { maintenance: false }, 200, cors);
}
async function getSitePublic(env, cors){
  const raw = await env.AZFW_KV.get('site:status');
  return json(raw ? JSON.parse(raw) : { maintenance: false }, 200, cors);
}
async function setSite(request, env, cors){
  try {
    await requireAdmin(request, env, cors);
    const body = await request.json();
    await env.AZFW_KV.put('site:status', JSON.stringify(body));
    return json({ ok: true }, 200, cors);
  } catch(e){
    return json({ error: e.message }, e.status || 500, cors);
  }
}

/* ============================================================
   POSTS (community)
   ============================================================ */
async function postsList(env, cors){
  const raw = await env.AZFW_KV.get('posts:all');
  const posts = raw ? JSON.parse(raw) : [];
  return json({ posts: posts.slice(-100).reverse() }, 200, cors);
}

async function postCreate(request, env, cors){
  const body = await request.json();
  const text = String(body.text || '').trim();
  const user = body.user || {};
  if(text.length < 2) return json({ error: 'Too short' }, 400, cors);
  if(text.length > 2000) return json({ error: 'Too long' }, 400, cors);
  if(!user.id) return json({ error: 'No user' }, 400, cors);

  const raw = await env.AZFW_KV.get('posts:all');
  const posts = raw ? JSON.parse(raw) : [];
  const post = {
    id: Date.now(),
    user_id: user.id,
    username: user.username || ('id' + user.id),
    name: (user.first_name || '') + (user.last_name ? ' ' + user.last_name : ''),
    photo_url: user.photo_url || '',
    text,
    created_at: Date.now(),
    likes: 0, comments: 0
  };
  posts.push(post);
  // храним последние 500
  const trimmed = posts.slice(-500);
  await env.AZFW_KV.put('posts:all', JSON.stringify(trimmed));
  return json({ ok: true, post }, 200, cors);
}

async function adminPostsList(request, env, cors){
  try {
    await requireAdmin(request, env, cors);
    const raw = await env.AZFW_KV.get('posts:all');
    const posts = raw ? JSON.parse(raw) : [];
    return json({ posts: posts.slice(-100).reverse() }, 200, cors);
  } catch(e){
    return json({ error: e.message }, e.status || 500, cors);
  }
}
async function adminPostDelete(request, env, cors, id){
  try {
    await requireAdmin(request, env, cors);
    const raw = await env.AZFW_KV.get('posts:all');
    let posts = raw ? JSON.parse(raw) : [];
    posts = posts.filter(p => String(p.id) !== String(id));
    await env.AZFW_KV.put('posts:all', JSON.stringify(posts));
    return json({ ok: true }, 200, cors);
  } catch(e){
    return json({ error: e.message }, e.status || 500, cors);
  }
}

/* ============================================================
   JWT (HS256, без библиотек)
   ============================================================ */
async function signJwt(payload, secret){
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64 = obj => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const data = b64(header) + '.' + b64(payload);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return data + '.' + sigB64;
}
async function verifyJwt(token, secret){
  try {
    const [h, p, s] = token.split('.');
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBin = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const ok = await crypto.subtle.verify('HMAC', key, sigBin, enc.encode(h + '.' + p));
    if(!ok) return null;
    const payload = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    if(payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch(e){ return null; }
}

/* ============================================================
   TELEGRAM SEND
   ============================================================ */
async function sendTelegramMessage(env, chatId, text){
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
  });
  if(!r.ok){
    const err = await r.text();
    console.error('TG send failed:', err);
  }
}

/* ============================================================
   ADMINS LIST
   ============================================================ */
async function getAdmins(env){
  const raw = await env.AZFW_KV.get('admins');
  if(!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return arr.map(Number).filter(n => !isNaN(n));
  } catch(e){ return []; }
}

async function googleUrl(env, cors) {
  if (!env.GOOGLE_CLIENT_ID) return json({ error: 'Google OAuth не настроен' }, 500, cors);
  const redirectUri = env.GOOGLE_REDIRECT_URI || '';
  if (!redirectUri) return json({ error: 'Нет GOOGLE_REDIRECT_URI' }, 500, cors);
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account'
  });
  return json({ url: 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString() }, 200, cors);
}

async function googleCallback(request, env, cors) {
  const { code, redirect_uri } = await request.json();
  if (!code) return json({ error: 'No code' }, 400, cors);
  const ru = redirect_uri || env.GOOGLE_REDIRECT_URI;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: ru,
      grant_type: 'authorization_code'
    })
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.id_token) {
    return json({ error: 'Google token error: ' + (tokens.error || 'unknown') }, 401, cors);
  }

  const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: 'Bearer ' + tokens.access_token }
  });
  const info = await infoRes.json();
  if (!info.email) return json({ error: 'Google userinfo error' }, 401, cors);

  // Google-пользователь хранится в KV: google:<email> -> { tg_id } (после привязки)
  const link = await env.AZFW_KV.get('google:' + info.email);
  if (link) {
    // Уже привязан к TG — выдаём JWT сразу
    const tgUser = JSON.parse(link);
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const token = await signJwt({
      sub: tgUser.id,
      username: tgUser.username || ('g:' + info.email),
      name: tgUser.first_name || info.name || '',
      ip,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC
    }, env.JWT_SECRET);
    return json({ status: 'ok', token, username: tgUser.username || info.email }, 200, cors);
  }

  // Не привязан — выдаём ссылку на бота + код привязки
  const linkCode = String(Math.floor(100000 + Math.random() * 900000));
  const linkToken = crypto.randomUUID();
  await env.AZFW_KV.put('g-link:' + linkToken, JSON.stringify({
    email: info.email,
    name: info.name || '',
    code: linkCode,
    created_at: Date.now()
  }), { expirationTtl: 15 * 60 });

  // Сообщим привязать через бота. Указываем юзеру короткий код.
  return json({
    status: 'link_required',
    link_token: linkToken,
    link_code: linkCode,
    email: info.email,
    bot_username: env.BOT_USERNAME || 'arizona_faraway26_bot',
    message: 'Отправь этот код боту в ЛС, чтобы привязать Google-аккаунт.'
  }, 200, cors);
}

async function googleLink(request, env, cors) {
  // Этот эндпоинт вызывается ботом (см. вебхук ниже) или из админки вручную:
  // { link_token, tg_user: { id, username, first_name } }
  // Проверяем связь: link_token валиден, привязываем google:<email> -> tg_user
  const body = await request.json();
  const { link_token, tg_user } = body;
  if (!link_token || !tg_user || !tg_user.id) return json({ error: 'No data' }, 400, cors);

  const raw = await env.AZFW_KV.get('g-link:' + link_token);
  if (!raw) return json({ error: 'Ссылка истекла' }, 400, cors);
  const info = JSON.parse(raw);
  await env.AZFW_KV.delete('g-link:' + link_token);

  await env.AZFW_KV.put('google:' + info.email, JSON.stringify({
    id: tg_user.id,
    username: tg_user.username || ('id' + tg_user.id),
    first_name: tg_user.first_name || info.name || ''
  }));

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const token = await signJwt({
    sub: tg_user.id,
    username: tg_user.username || ('id' + tg_user.id),
    name: tg_user.first_name || info.name || '',
    ip,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC
  }, env.JWT_SECRET);

  return json({ status: 'ok', token, username: tg_user.username || ('id' + tg_user.id) }, 200, cors);
}

/* ============================================================
   Вебхук Telegram (для команды /start <код> от Google-привязки)
   Разворачивается отдельно, ставится через setWebhook:
     https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<URL_ВОРКЕРА>/api/tg/webhook
   ============================================================ */
async function tgWebhook(request, env, cors) {
  const update = await request.json().catch(() => null);
  if (!update || !update.message) return json({ ok: true }, 200, cors);

  const msg = update.message;
  const text = (msg.text || '').trim();
  const chatId = msg.chat.id;
  const from = msg.from || {};

  // /start <code>
  const m = text.match(/^\/start\s+(\d{6})$/);
  if (!m) {
    if (text === '/start') {
      await sendTelegramMessage(env, chatId,
        'Привет! Я — бот сайта <b>Arizona Faraway — 26</b>.\n\n' +
        'Если ты привязываешь Google-аккаунт, отправь мне код из браузера.');
    }
    return json({ ok: true }, 200, cors);
  }

  const code = m[1];
  // Найдём pending-link по коду
  const list = await env.AZFW_KV.list({ prefix: 'g-link:' });
  for (const k of list.keys) {
    const raw = await env.AZFW_KV.get(k.name);
    if (!raw) continue;
    const info = JSON.parse(raw);
    if (String(info.code) === code) {
      await env.AZFW_KV.delete(k.name);
      await env.AZFW_KV.put('google:' + info.email, JSON.stringify({
        id: from.id,
        username: from.username || ('id' + from.id),
        first_name: from.first_name || info.name || ''
      }));
      await sendTelegramMessage(env, chatId,
        '✅ Google-аккаунт <b>' + info.email + '</b> привязан. Можешь вернуться на сайт.');
      return json({ ok: true }, 200, cors);
    }
  }
  await sendTelegramMessage(env, chatId, '❌ Код не найден или истёк. Попробуй ещё раз с сайта.');
  return json({ ok: true }, 200, cors);
}