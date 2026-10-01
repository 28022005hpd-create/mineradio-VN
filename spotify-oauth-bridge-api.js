'use strict';

const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');
const { shell } = require('electron');
const spotify = require('./spotify-api');

function base64Url(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function sendJson(res, value, status) {
  const body = JSON.stringify(value == null ? {} : value);
  res.statusCode = Number(status) || 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}
function resultHtml(ok, message) {
  const escaped = String(message || '').replace(/[<>&"]/g, ch => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' }[ch]));
  return '<!doctype html><meta charset="utf-8"><title>Spotify · Mineradio</title><style>html,body{height:100%;margin:0;background:#07110a;color:#eefdf2;font-family:system-ui}body{display:grid;place-items:center}main{max-width:560px;padding:32px;text-align:center}.brand{color:#1ed760;font-weight:900;letter-spacing:.22em;font-size:12px}h1{font-size:25px}</style><main><div class="brand">SPOTIFY · MINERADIO</div><h1>' + (ok ? 'Connected' : 'Connection failed') + '</h1><p>' + escaped + '</p><p>You may close this tab and return to Mineradio.</p></main>';
}

function createCallbackServer(redirectUri, state, codeVerifier) {
  const redirect = new URL(redirectUri);
  let settled = false;
  let resolveResult;
  let rejectResult;
  let resolveReady;
  let rejectReady;
  const result = new Promise((resolve, reject) => { resolveResult = resolve; rejectResult = reject; });
  const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });

  const server = http.createServer(async (req, res) => {
    let incoming;
    try { incoming = new URL(req.url, redirect.origin); } catch (_) { incoming = null; }
    if (!incoming || incoming.pathname !== redirect.pathname) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    if (settled) {
      res.statusCode = 409;
      res.end('Already handled');
      return;
    }
    settled = true;
    const returnedState = incoming.searchParams.get('state') || '';
    const oauthError = incoming.searchParams.get('error') || '';
    const code = incoming.searchParams.get('code') || '';

    if (returnedState !== state) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(resultHtml(false, 'OAuth state mismatch.'));
      server.close();
      rejectResult(Object.assign(new Error('SPOTIFY_OAUTH_STATE_MISMATCH'), { code: 'SPOTIFY_OAUTH_STATE_MISMATCH' }));
      return;
    }
    if (oauthError || !code) {
      const message = incoming.searchParams.get('error_description') || oauthError || 'SPOTIFY_OAUTH_CODE_MISSING';
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(resultHtml(false, message));
      server.close();
      rejectResult(Object.assign(new Error(message), { code: oauthError || 'SPOTIFY_OAUTH_CODE_MISSING' }));
      return;
    }

    try {
      const info = await spotify.exchangeSpotifyOAuthCode({ code, codeVerifier, redirectUri });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(resultHtml(true, 'Spotify authorization completed.'));
      server.close();
      resolveResult(info || {});
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(resultHtml(false, error.message));
      server.close();
      rejectResult(error);
    }
  });

  server.once('error', error => {
    if (!server.listening) rejectReady(error);
    if (!settled) {
      settled = true;
      rejectResult(error);
    }
  });
  const port = Number(redirect.port) || 80;
  server.listen(port, redirect.hostname, () => resolveReady(server));
  return { server, ready, result };
}

async function startSpotifyOAuth() {
  const config = spotify.getSpotifyOAuthConfig();
  if (!config || !config.configured) {
    const error = new Error(!config || !config.clientId ? 'SPOTIFY_CLIENT_ID_REQUIRED' : 'SPOTIFY_OAUTH_NOT_CONFIGURED');
    error.statusCode = 400;
    throw error;
  }
  const state = crypto.randomBytes(18).toString('hex');
  const codeVerifier = base64Url(crypto.randomBytes(48));
  const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest());
  const authUrl = spotify.buildSpotifyOAuthAuthorizeUrl({ state, codeChallenge, redirectUri: config.redirectUri, scope: config.scope });
  const callback = createCallbackServer(config.redirectUri, state, codeVerifier);

  let timeout = null;
  await callback.ready;
  const timeoutPromise = new Promise((_resolve, reject) => {
    timeout = setTimeout(() => {
      try { callback.server.close(); } catch (_) {}
      reject(Object.assign(new Error('SPOTIFY_OAUTH_TIMEOUT'), { code: 'SPOTIFY_OAUTH_TIMEOUT', statusCode: 408 }));
    }, 3 * 60 * 1000);
  });

  try {
    await shell.openExternal(authUrl);
    const info = await Promise.race([callback.result, timeoutPromise]);
    return Object.assign({ ok: true, provider: 'spotify' }, info || {}, await spotify.handleSpotifyStatus());
  } finally {
    if (timeout) clearTimeout(timeout);
    try { if (callback.server.listening) callback.server.close(); } catch (_) {}
  }
}

function installSpotifyOAuthBridge() {
  if (http.__mineradioSpotifyOAuthBridgeInstalled) return;
  http.__mineradioSpotifyOAuthBridgeInstalled = true;
  const originalCreateServer = http.createServer;
  http.createServer = function patchedCreateServer(options, requestListener) {
    let opts = options;
    let listener = requestListener;
    if (typeof options === 'function') { listener = options; opts = undefined; }
    if (typeof listener !== 'function') return originalCreateServer.apply(http, arguments);
    const wrapped = function(req, res) {
      let pathname = '';
      try { pathname = new URL(req.url, 'http://127.0.0.1').pathname; } catch (_) {}
      if (pathname === '/api/spotify/oauth/start') {
        if (req.method !== 'POST') return sendJson(res, { ok:false, error:'METHOD_NOT_ALLOWED' }, 405);
        Promise.resolve(startSpotifyOAuth()).then(value => sendJson(res, value)).catch(error => sendJson(res, {
          ok:false,
          provider:'spotify',
          error:error.code || error.message,
          message:error.message
        }, Number(error.statusCode) || 500));
        return;
      }
      return listener(req, res);
    };
    return opts === undefined ? originalCreateServer.call(http, wrapped) : originalCreateServer.call(http, opts, wrapped);
  };
}

module.exports = { installSpotifyOAuthBridge, startSpotifyOAuth, _test: { createCallbackServer } };
