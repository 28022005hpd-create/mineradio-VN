'use strict';

// Playback-only bridge for official Western providers.
// Installed before the broader provider bridge so these exact routes are
// handled first while every legacy Mineradio endpoint remains untouched.
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL, URLSearchParams } = require('url');
const spotify = require('./spotify-api');

const CONFIG_ROOT = process.env.MINERADIO_PROVIDER_CONFIG_DIR || path.join(process.env.APPDATA || __dirname, 'Mineradio');
const SOUNDCLOUD_CONFIG_FILE = path.join(CONFIG_ROOT, 'soundcloud-credentials.json');
const SOUNDCLOUD_API = 'https://api.soundcloud.com';
const SOUNDCLOUD_AUTH = 'https://secure.soundcloud.com';
const SPOTIFY_PLAYBACK_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
];

let soundcloudTokenCache = { value: '', refreshToken: '', expiresAt: 0, inflight: null };

function text(value) { return String(value == null ? '' : value).trim(); }
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return {}; }
}
function sendJson(res, value, status) {
  const body = JSON.stringify(value == null ? {} : value);
  res.statusCode = Number(status) || 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > 1024 * 1024) {
        reject(Object.assign(new Error('REQUEST_TOO_LARGE'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch (_) { reject(Object.assign(new Error('INVALID_JSON'), { statusCode: 400 })); }
    });
    req.on('error', reject);
  });
}
function requestJson(target, options, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(target);
    const req = https.request({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: options && options.method || 'GET',
      headers: Object.assign({
        Accept: 'application/json',
        'User-Agent': 'Mineradio/2.2.0 (official playback bridge)',
      }, options && options.headers || {}),
      timeout: options && options.timeout || 12000,
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let json = {};
        try { json = raw ? JSON.parse(raw) : {}; } catch (_) { json = { raw }; }
        if (response.statusCode >= 200 && response.statusCode < 300) return resolve(json);
        const error = new Error(
          text(json && (json.error_description || json.message || (json.error && json.error.message) || json.error)) ||
          ('HTTP_' + response.statusCode)
        );
        error.statusCode = Number(response.statusCode) || 500;
        error.payload = json;
        reject(error);
      });
    });
    req.on('timeout', () => req.destroy(new Error('REQUEST_TIMEOUT')));
    req.on('error', reject);
    if (body != null) req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// SoundCloud official streaming
// ---------------------------------------------------------------------------
function soundcloudCredentials() {
  const raw = readJson(SOUNDCLOUD_CONFIG_FILE);
  return {
    clientId: text(process.env.SOUNDCLOUD_CLIENT_ID || raw.clientId || raw.client_id),
    clientSecret: text(process.env.SOUNDCLOUD_CLIENT_SECRET || raw.clientSecret || raw.client_secret),
  };
}
async function soundcloudAccessToken() {
  if (soundcloudTokenCache.value && Date.now() < soundcloudTokenCache.expiresAt - 30000) {
    return soundcloudTokenCache.value;
  }
  if (soundcloudTokenCache.inflight) return soundcloudTokenCache.inflight;
  const credentials = soundcloudCredentials();
  if (!credentials.clientId || !credentials.clientSecret) {
    throw Object.assign(new Error('SOUNDCLOUD_NOT_CONFIGURED'), { statusCode: 400 });
  }
  const form = new URLSearchParams({ grant_type: 'client_credentials' }).toString();
  soundcloudTokenCache.inflight = requestJson(SOUNDCLOUD_AUTH + '/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(credentials.clientId + ':' + credentials.clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(form),
    },
  }, form).then(json => {
    const token = text(json && json.access_token);
    if (!token) throw new Error('SOUNDCLOUD_TOKEN_MISSING');
    soundcloudTokenCache.value = token;
    soundcloudTokenCache.refreshToken = text(json && json.refresh_token);
    soundcloudTokenCache.expiresAt = Date.now() + Math.max(60, Number(json && json.expires_in) || 3600) * 1000;
    return token;
  }).finally(() => { soundcloudTokenCache.inflight = null; });
  return soundcloudTokenCache.inflight;
}
function soundcloudStreamCandidates(streams) {
  streams = streams && typeof streams === 'object' ? streams : {};
  const explicit = [
    ['http_aac_160_url', 130, 'progressive-aac', 160000],
    ['http_mp3_128_url', 125, 'progressive-mp3', 128000],
    ['http_aac_96_url', 120, 'progressive-aac', 96000],
    ['hls_aac_160_url', 110, 'hls-aac', 160000],
    ['hls_aac_96_url', 100, 'hls-aac', 96000],
    ['hls_mp3_128_url', 90, 'hls-mp3', 128000],
    ['hls_opus_64_url', 80, 'hls-opus', 64000],
  ];
  const seen = new Set();
  const out = [];
  explicit.forEach(([key, score, format, bitrate]) => {
    const url = text(streams[key]);
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ key, url, score, format, bitrate, delivery: key.indexOf('hls_') === 0 ? 'hls' : 'progressive' });
  });
  Object.keys(streams).forEach(key => {
    const url = text(streams[key]);
    if (!/_url$/i.test(key) || !/^https?:\/\//i.test(url) || seen.has(url)) return;
    seen.add(url);
    const isHls = /^hls_/i.test(key) || /\.m3u8(?:[?#]|$)/i.test(url);
    out.push({
      key,
      url,
      score: isHls ? 50 : 70,
      format: (isHls ? 'hls-' : 'progressive-') + (/aac/i.test(key) ? 'aac' : (/mp3/i.test(key) ? 'mp3' : 'audio')),
      bitrate: /160/.test(key) ? 160000 : (/128/.test(key) ? 128000 : (/96/.test(key) ? 96000 : (/64/.test(key) ? 64000 : 0))),
      delivery: isHls ? 'hls' : 'progressive',
    });
  });
  return out.sort((a, b) => b.score - a.score);
}
async function soundcloudStreamInfo(trackId) {
  const id = text(trackId);
  if (!id) throw Object.assign(new Error('SOUNDCLOUD_TRACK_ID_REQUIRED'), { statusCode: 400 });
  const token = await soundcloudAccessToken();
  const target = SOUNDCLOUD_API + '/tracks/' + encodeURIComponent(id) + '/streams';
  const streams = await requestJson(target, { headers: { Authorization: 'OAuth ' + token } });
  const candidates = soundcloudStreamCandidates(streams);
  if (!candidates.length) {
    throw Object.assign(new Error('SOUNDCLOUD_STREAM_UNAVAILABLE'), { statusCode: 404 });
  }
  const best = candidates[0];
  return {
    ok: true,
    provider: 'soundcloud',
    id,
    url: best.url,
    format: best.format,
    delivery: best.delivery,
    br: best.bitrate,
    candidates: candidates.slice(0, 5).map(item => ({
      format: item.format,
      delivery: item.delivery,
      br: item.bitrate,
      url: item.url,
    })),
    official: true,
    attributionRequired: true,
  };
}

// ---------------------------------------------------------------------------
// Spotify official Playback SDK / Connect control
// ---------------------------------------------------------------------------
function spotifyStoredScopes() {
  const token = spotify._test && spotify._test.readStoredSpotifyToken
    ? spotify._test.readStoredSpotifyToken()
    : {};
  return String(token && token.scope || '').split(/[\s,;]+/).map(text).filter(Boolean);
}
function requireSpotifyPlaybackScopes() {
  const scopes = spotifyStoredScopes();
  const missing = SPOTIFY_PLAYBACK_SCOPES.filter(scope => scopes.indexOf(scope) < 0);
  if (missing.length) {
    const error = new Error('SPOTIFY_PLAYBACK_REAUTHORIZE_REQUIRED');
    error.code = 'SPOTIFY_PLAYBACK_REAUTHORIZE_REQUIRED';
    error.statusCode = 409;
    error.missingScopes = missing;
    throw error;
  }
  return scopes;
}
async function spotifyPlaybackToken() {
  const status = await spotify.handleSpotifyStatus();
  if (!status || !status.loggedIn) {
    throw Object.assign(new Error('SPOTIFY_LOGIN_REQUIRED'), { statusCode: 401, code: 'SPOTIFY_LOGIN_REQUIRED' });
  }
  if (String(status.product || '').toLowerCase() !== 'premium') {
    throw Object.assign(new Error('SPOTIFY_PREMIUM_REQUIRED'), { statusCode: 403, code: 'SPOTIFY_PREMIUM_REQUIRED' });
  }
  const scopes = requireSpotifyPlaybackScopes();
  const getToken = spotify._test && spotify._test.getSpotifyUserAccessToken;
  if (typeof getToken !== 'function') throw new Error('SPOTIFY_TOKEN_BRIDGE_UNAVAILABLE');
  const accessToken = await getToken();
  const stored = spotify._test.readStoredSpotifyToken();
  return {
    ok: true,
    provider: 'spotify',
    accessToken,
    expiresAt: Number(stored && stored.expiresAt) || 0,
    scopes,
    product: status.product,
    nickname: status.nickname || '',
  };
}
function spotifyDeviceParams(deviceId) {
  const value = text(deviceId);
  return value ? { device_id: value } : {};
}
function spotifyTrackUri(input) {
  const uri = text(input && (input.uri || input.spotifyUri));
  if (/^spotify:track:[A-Za-z0-9]+$/i.test(uri)) return uri;
  const id = text(input && (input.spotifyId || input.providerSongId || input.id));
  return id ? 'spotify:track:' + id : '';
}
async function spotifyPlaybackAction(action, input) {
  await spotifyPlaybackToken();
  const userRequest = spotify._test && spotify._test.spotifyUserRequest;
  const userGet = spotify._test && spotify._test.spotifyUserGet;
  if (typeof userRequest !== 'function') throw new Error('SPOTIFY_PLAYBACK_REQUEST_UNAVAILABLE');
  input = input || {};
  const deviceId = text(input.deviceId || input.device_id);
  const params = spotifyDeviceParams(deviceId);

  if (action === 'state') {
    if (typeof userGet !== 'function') throw new Error('SPOTIFY_PLAYBACK_STATE_UNAVAILABLE');
    const state = await userGet('/me/player', {}, { timeoutMs: 9000 });
    return { ok: true, provider: 'spotify', state: state || null };
  }
  if (action === 'start') {
    const uri = spotifyTrackUri(input);
    if (!uri) throw Object.assign(new Error('SPOTIFY_TRACK_ID_REQUIRED'), { statusCode: 400 });
    if (deviceId) {
      try {
        await userRequest('/me/player', 'PUT', {}, { device_ids: [deviceId], play: false }, { timeoutMs: 9000 });
      } catch (error) {
        // A freshly connected SDK device can already be active; start playback
        // below even if the explicit transfer races with Spotify Connect.
        if (Number(error && error.statusCode) !== 404) throw error;
      }
    }
    const positionMs = Math.max(0, Number(input.positionMs || input.position_ms) || 0);
    await userRequest('/me/player/play', 'PUT', params, { uris: [uri], position_ms: positionMs }, { timeoutMs: 10000 });
    return { ok: true, provider: 'spotify', uri, deviceId, positionMs };
  }
  if (action === 'resume') {
    await userRequest('/me/player/play', 'PUT', params, null, { timeoutMs: 9000 });
    return { ok: true, provider: 'spotify', deviceId };
  }
  if (action === 'pause') {
    await userRequest('/me/player/pause', 'PUT', params, null, { timeoutMs: 9000 });
    return { ok: true, provider: 'spotify', deviceId };
  }
  if (action === 'seek') {
    const positionMs = Math.max(0, Math.round(Number(input.positionMs || input.position_ms) || 0));
    await userRequest('/me/player/seek', 'PUT', Object.assign({}, params, { position_ms: positionMs }), null, { timeoutMs: 9000 });
    return { ok: true, provider: 'spotify', deviceId, positionMs };
  }
  if (action === 'volume') {
    const volumePercent = Math.max(0, Math.min(100, Math.round(Number(input.volumePercent != null ? input.volumePercent : input.volume_percent) || 0)));
    await userRequest('/me/player/volume', 'PUT', Object.assign({}, params, { volume_percent: volumePercent }), null, { timeoutMs: 9000 });
    return { ok: true, provider: 'spotify', deviceId, volumePercent };
  }
  throw Object.assign(new Error('SPOTIFY_PLAYBACK_ACTION_UNKNOWN'), { statusCode: 404 });
}

function isPlaybackBridgePath(pathname) {
  return pathname === '/api/soundcloud/song/url' ||
    pathname === '/api/spotify/playback/token' ||
    pathname === '/api/spotify/playback/start' ||
    pathname === '/api/spotify/playback/resume' ||
    pathname === '/api/spotify/playback/pause' ||
    pathname === '/api/spotify/playback/seek' ||
    pathname === '/api/spotify/playback/volume' ||
    pathname === '/api/spotify/playback/state';
}
async function dispatch(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  try {
    if (url.pathname === '/api/soundcloud/song/url') {
      return sendJson(res, await soundcloudStreamInfo(url.searchParams.get('id') || url.searchParams.get('urn') || ''));
    }
    if (url.pathname === '/api/spotify/playback/token') {
      return sendJson(res, await spotifyPlaybackToken());
    }
    if (url.pathname.indexOf('/api/spotify/playback/') === 0) {
      const action = url.pathname.slice('/api/spotify/playback/'.length);
      const input = req.method === 'POST' ? await readBody(req) : Object.fromEntries(url.searchParams.entries());
      return sendJson(res, await spotifyPlaybackAction(action, input));
    }
  } catch (error) {
    const payload = {
      ok: false,
      provider: url.pathname.indexOf('soundcloud') >= 0 ? 'soundcloud' : 'spotify',
      error: error.code || error.message || 'PLAYBACK_PROVIDER_ERROR',
      message: error.message || 'Playback provider request failed',
    };
    if (error.missingScopes) payload.missingScopes = error.missingScopes;
    return sendJson(res, payload, Number(error.statusCode) || 500);
  }
}

function installWesternPlaybackBridge() {
  if (http.__mineradioWesternPlaybackBridgeInstalled) return;
  http.__mineradioWesternPlaybackBridgeInstalled = true;
  const originalCreateServer = http.createServer;
  http.createServer = function patchedCreateServer(options, requestListener) {
    let opts = options;
    let listener = requestListener;
    if (typeof options === 'function') {
      listener = options;
      opts = undefined;
    }
    if (typeof listener !== 'function') return originalCreateServer.apply(http, arguments);
    const wrapped = function(req, res) {
      let pathname = '';
      try { pathname = new URL(req.url, 'http://127.0.0.1').pathname; } catch (_) {}
      if (isPlaybackBridgePath(pathname)) {
        Promise.resolve(dispatch(req, res)).catch(error => {
          if (!res.headersSent) sendJson(res, { ok: false, error: error.message || 'PLAYBACK_PROVIDER_ERROR' }, 500);
          else try { res.end(); } catch (_) {}
        });
        return;
      }
      return listener(req, res);
    };
    return opts === undefined
      ? originalCreateServer.call(http, wrapped)
      : originalCreateServer.call(http, opts, wrapped);
  };
}

module.exports = {
  installWesternPlaybackBridge,
  soundcloudStreamInfo,
  spotifyPlaybackToken,
  spotifyPlaybackAction,
  _test: { soundcloudStreamCandidates, isPlaybackBridgePath, spotifyTrackUri },
};
