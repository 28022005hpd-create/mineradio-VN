'use strict';

// Official-provider bridge for Spotify, SoundCloud and YouTube Music.
// It is installed before server.js creates the local HTTP server, so these
// provider routes can evolve independently without disturbing the legacy
// NetEase/QQ/Kugou/Qishui server implementation.
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL, URLSearchParams } = require('url');
const spotify = require('./spotify-api');

const CONFIG_ROOT = process.env.MINERADIO_PROVIDER_CONFIG_DIR || path.join(process.env.APPDATA || __dirname, 'Mineradio');
const SOUNDCLOUD_CONFIG_FILE = path.join(CONFIG_ROOT, 'soundcloud-credentials.json');
const YOUTUBE_CONFIG_FILE = path.join(CONFIG_ROOT, 'youtube-music-credentials.json');
const SOUNDCLOUD_API = 'https://api.soundcloud.com';
const SOUNDCLOUD_AUTH = 'https://secure.soundcloud.com';
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
let soundcloudClientToken = { value: '', expiresAt: 0, inflight: null };

function text(value) { return String(value == null ? '' : value).trim(); }
function ensureDir(file) { fs.mkdirSync(path.dirname(file), { recursive: true }); }
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return {}; }
}
function writeJson(file, value) {
  ensureDir(file);
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
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
      try { resolve(JSON.parse(raw)); } catch (error) { reject(Object.assign(new Error('INVALID_JSON'), { statusCode: 400 })); }
    });
    req.on('error', reject);
  });
}
function requestJson(target, options, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(target);
    const request = https.request({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: options && options.method || 'GET',
      headers: Object.assign({
        'Accept': 'application/json',
        'User-Agent': 'Mineradio/2.2.0 (official provider bridge)'
      }, options && options.headers || {}),
      timeout: options && options.timeout || 12000
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = raw ? JSON.parse(raw) : {}; } catch (_) { json = { raw }; }
        if (response.statusCode >= 200 && response.statusCode < 300) return resolve(json);
        const err = new Error((json && (json.error_description || json.message || (json.error && json.error.message) || json.error)) || ('HTTP_' + response.statusCode));
        err.statusCode = response.statusCode;
        err.payload = json;
        reject(err);
      });
    });
    request.on('timeout', () => request.destroy(new Error('REQUEST_TIMEOUT')));
    request.on('error', reject);
    if (body) request.write(body);
    request.end();
  });
}

// ---------------- Spotify ----------------
async function handleSpotify(req, res, url) {
  const p = url.pathname;
  if (p === '/api/spotify/status') return sendJson(res, await spotify.handleSpotifyStatus());
  if (p === '/api/spotify/setup/diagnostics') return sendJson(res, await spotify.handleSpotifySetupDiagnostics());
  if (p === '/api/spotify/config') {
    if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
    const saved = spotify.saveSpotifyConfig(await readBody(req));
    const status = await spotify.handleSpotifyStatus();
    return sendJson(res, Object.assign({ ok: true }, status, saved));
  }
  if (p === '/api/spotify/logout') return sendJson(res, spotify.clearSpotifyToken());
  if (p === '/api/spotify/search') return sendJson(res, await spotify.handleSpotifySearch(url.searchParams.get('keywords') || '', Math.max(1, Math.min(20, Number(url.searchParams.get('limit')) || 10)), Math.max(0, Number(url.searchParams.get('offset')) || 0)));
  if (p === '/api/spotify/recommendations') return sendJson(res, await spotify.handleSpotifyRecommendations(Math.max(1, Math.min(10, Number(url.searchParams.get('limit')) || 10))));
  if (p === '/api/spotify/user/playlists') return sendJson(res, await spotify.handleSpotifyUserPlaylists({ limit: Math.max(1, Math.min(500, Number(url.searchParams.get('limit')) || 300)), offset: Math.max(0, Number(url.searchParams.get('offset')) || 0) }));
  if (p === '/api/spotify/playlist/tracks') return sendJson(res, await spotify.handleSpotifyPlaylistTracks(url.searchParams.get('id') || url.searchParams.get('playlistId') || '', { limit: Math.max(1, Math.min(100, Number(url.searchParams.get('limit')) || 48)), offset: Math.max(0, Number(url.searchParams.get('offset')) || 0), market: url.searchParams.get('market') || '' }));
  if (p === '/api/spotify/album/detail') return sendJson(res, await spotify.handleSpotifyAlbumDetail(url.searchParams.get('id') || url.searchParams.get('albumId') || '', { limit: Math.max(1, Math.min(100, Number(url.searchParams.get('limit')) || 80)), market: url.searchParams.get('market') || '' }));
  if (p === '/api/spotify/song/url') return sendJson(res, await spotify.handleSpotifySongUrl({ id: url.searchParams.get('id') || '', providerSongId: url.searchParams.get('providerSongId') || '', spotifyId: url.searchParams.get('spotifyId') || '', uri: url.searchParams.get('uri') || '' }));
  if (p === '/api/spotify/lyric') return sendJson(res, await spotify.handleSpotifyLyric(url.searchParams.get('id') || ''));
  if (p === '/api/spotify/song/like/check') {
    const ids = text(url.searchParams.get('ids') || url.searchParams.get('id')).split(',').filter(Boolean);
    return sendJson(res, await spotify.handleSpotifyLibraryCheck('track', ids));
  }
  if (p === '/api/spotify/album/like/check') {
    const ids = text(url.searchParams.get('ids') || url.searchParams.get('id')).split(',').filter(Boolean);
    return sendJson(res, await spotify.handleSpotifyLibraryCheck('album', ids));
  }
  if (p === '/api/spotify/song/like' || p === '/api/spotify/album/like' || p === '/api/spotify/playlist/collect') {
    const body = req.method === 'POST' ? await readBody(req) : {};
    const type = p.indexOf('/album/') >= 0 ? 'album' : (p.indexOf('/playlist/') >= 0 ? 'playlist' : 'track');
    const liked = String(body.like != null ? body.like : body.collected != null ? body.collected : 'true') !== 'false';
    return sendJson(res, await spotify.handleSpotifyLibrarySet(type, body.song || body.album || body.playlist || body, liked));
  }
  if (p === '/api/spotify/playlist/add-song') {
    const body = await readBody(req);
    return sendJson(res, await spotify.handleSpotifyPlaylistAddSong(body.pid || body.playlistId || '', body.song || body));
  }
  if (p === '/api/spotify/playlist/create') {
    const body = await readBody(req);
    return sendJson(res, await spotify.handleSpotifyCreatePlaylist(body.name || '', { public: body.public === true, description: body.description || '' }));
  }
  return sendJson(res, { provider: 'spotify', ok: false, error: 'NOT_FOUND' }, 404);
}

// ---------------- SoundCloud ----------------
function soundcloudConfig() {
  const raw = readJson(SOUNDCLOUD_CONFIG_FILE);
  const clientId = text(process.env.SOUNDCLOUD_CLIENT_ID || raw.clientId || raw.client_id);
  const clientSecret = text(process.env.SOUNDCLOUD_CLIENT_SECRET || raw.clientSecret || raw.client_secret);
  return {
    provider: 'soundcloud',
    configured: !!(clientId && clientSecret),
    loggedIn: false,
    clientId,
    hasClientSecret: !!clientSecret,
    capabilities: { search: !!(clientId && clientSecret), metadata: !!(clientId && clientSecret), externalPlayback: true, playableUrl: false },
    message: clientId && clientSecret ? 'SoundCloud API is configured.' : 'Add a SoundCloud Client ID and Client Secret to enable official API search.'
  };
}
function saveSoundcloudConfig(input) {
  const clientId = text(input && (input.clientId || input.client_id));
  const clientSecret = text(input && (input.clientSecret || input.client_secret));
  if (!clientId || !clientSecret) throw Object.assign(new Error('SOUNDCLOUD_CREDENTIALS_REQUIRED'), { statusCode: 400 });
  writeJson(SOUNDCLOUD_CONFIG_FILE, { clientId, clientSecret });
  soundcloudClientToken = { value: '', expiresAt: 0, inflight: null };
  return soundcloudConfig();
}
async function soundcloudToken() {
  if (soundcloudClientToken.value && Date.now() < soundcloudClientToken.expiresAt - 30000) return soundcloudClientToken.value;
  if (soundcloudClientToken.inflight) return soundcloudClientToken.inflight;
  const raw = readJson(SOUNDCLOUD_CONFIG_FILE);
  const clientId = text(process.env.SOUNDCLOUD_CLIENT_ID || raw.clientId);
  const clientSecret = text(process.env.SOUNDCLOUD_CLIENT_SECRET || raw.clientSecret);
  if (!clientId || !clientSecret) throw Object.assign(new Error('SOUNDCLOUD_NOT_CONFIGURED'), { statusCode: 400 });
  const form = new URLSearchParams({ grant_type: 'client_credentials' }).toString();
  soundcloudClientToken.inflight = requestJson(SOUNDCLOUD_AUTH + '/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(form)
    }
  }, form).then(json => {
    const token = text(json && json.access_token);
    if (!token) throw new Error('SOUNDCLOUD_TOKEN_MISSING');
    soundcloudClientToken.value = token;
    soundcloudClientToken.expiresAt = Date.now() + Math.max(60, Number(json.expires_in) || 3600) * 1000;
    return token;
  }).finally(() => { soundcloudClientToken.inflight = null; });
  return soundcloudClientToken.inflight;
}
function soundcloudCover(track) {
  return text(track && (track.artwork_url || track.artworkUrl || (track.user && track.user.avatar_url)));
}
function normalizeSoundcloudTrack(track) {
  const id = text(track && (track.urn || track.id));
  return {
    id,
    providerSongId: id,
    provider: 'soundcloud',
    name: text(track && track.title),
    artist: text(track && track.user && (track.user.username || track.user.full_name)),
    album: 'SoundCloud',
    cover: soundcloudCover(track),
    picUrl: soundcloudCover(track),
    duration: Number(track && track.duration) || 0,
    externalUrl: text(track && track.permalink_url),
    permalinkUrl: text(track && track.permalink_url),
    playable: false,
    playbackMode: 'external-official'
  };
}
async function soundcloudSearch(query, limit, offset) {
  const token = await soundcloudToken();
  const target = new URL(SOUNDCLOUD_API + '/tracks');
  target.searchParams.set('q', text(query));
  target.searchParams.set('limit', String(Math.max(1, Math.min(50, limit || 12))));
  target.searchParams.set('offset', String(Math.max(0, offset || 0)));
  target.searchParams.set('linked_partitioning', '1');
  const json = await requestJson(target.toString(), { headers: { Authorization: 'OAuth ' + token } });
  const items = Array.isArray(json) ? json : (json.collection || []);
  return { provider: 'soundcloud', songs: items.map(normalizeSoundcloudTrack), hasMore: !!(json && json.next_href), nextHref: json && json.next_href || '' };
}
async function handleSoundcloud(req, res, url) {
  const p = url.pathname;
  if (p === '/api/soundcloud/status') return sendJson(res, soundcloudConfig());
  if (p === '/api/soundcloud/config') {
    if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
    return sendJson(res, Object.assign({ ok: true }, saveSoundcloudConfig(await readBody(req))));
  }
  if (p === '/api/soundcloud/logout') {
    try { if (fs.existsSync(SOUNDCLOUD_CONFIG_FILE)) fs.unlinkSync(SOUNDCLOUD_CONFIG_FILE); } catch (_) {}
    soundcloudClientToken = { value: '', expiresAt: 0, inflight: null };
    return sendJson(res, { provider: 'soundcloud', configured: false, loggedIn: false, ok: true });
  }
  if (p === '/api/soundcloud/search') return sendJson(res, await soundcloudSearch(url.searchParams.get('keywords') || '', Number(url.searchParams.get('limit')) || 12, Number(url.searchParams.get('offset')) || 0));
  return sendJson(res, { provider: 'soundcloud', ok: false, error: 'NOT_FOUND' }, 404);
}

// ---------------- YouTube Music via official YouTube Data API ----------------
function youtubeConfig() {
  const raw = readJson(YOUTUBE_CONFIG_FILE);
  const apiKey = text(process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_MUSIC_API_KEY || raw.apiKey || raw.api_key);
  return {
    provider: 'youtube',
    configured: !!apiKey,
    loggedIn: false,
    hasApiKey: !!apiKey,
    capabilities: { search: !!apiKey, metadata: !!apiKey, externalPlayback: true, playableUrl: false },
    message: apiKey ? 'YouTube Data API is configured for YouTube Music search.' : 'Add a YouTube Data API key to enable YouTube Music search.'
  };
}
function saveYoutubeConfig(input) {
  const apiKey = text(input && (input.apiKey || input.api_key || input.key));
  if (!apiKey) throw Object.assign(new Error('YOUTUBE_API_KEY_REQUIRED'), { statusCode: 400 });
  writeJson(YOUTUBE_CONFIG_FILE, { apiKey });
  return youtubeConfig();
}
function youtubeThumb(item) {
  const thumbs = item && item.snippet && item.snippet.thumbnails || {};
  return text((thumbs.maxres || thumbs.high || thumbs.medium || thumbs.default || {}).url);
}
function decodeBasicEntities(value) {
  return String(value || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function normalizeYoutubeTrack(item) {
  const videoId = text(item && item.id && (item.id.videoId || item.id));
  return {
    id: videoId,
    providerSongId: videoId,
    youtubeVideoId: videoId,
    provider: 'youtube',
    name: decodeBasicEntities(item && item.snippet && item.snippet.title),
    artist: decodeBasicEntities(item && item.snippet && item.snippet.channelTitle),
    album: 'YouTube Music',
    cover: youtubeThumb(item),
    picUrl: youtubeThumb(item),
    externalUrl: videoId ? 'https://music.youtube.com/watch?v=' + encodeURIComponent(videoId) : '',
    youtubeMusicUrl: videoId ? 'https://music.youtube.com/watch?v=' + encodeURIComponent(videoId) : '',
    playable: false,
    playbackMode: 'external-official'
  };
}
async function youtubeSearch(query, limit, pageToken) {
  const raw = readJson(YOUTUBE_CONFIG_FILE);
  const key = text(process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_MUSIC_API_KEY || raw.apiKey);
  if (!key) throw Object.assign(new Error('YOUTUBE_NOT_CONFIGURED'), { statusCode: 400 });
  const target = new URL(YOUTUBE_API + '/search');
  target.searchParams.set('part', 'snippet');
  target.searchParams.set('type', 'video');
  target.searchParams.set('videoCategoryId', '10');
  target.searchParams.set('maxResults', String(Math.max(1, Math.min(25, limit || 12))));
  target.searchParams.set('q', text(query));
  target.searchParams.set('key', key);
  if (pageToken) target.searchParams.set('pageToken', pageToken);
  const json = await requestJson(target.toString());
  return { provider: 'youtube', songs: (json.items || []).map(normalizeYoutubeTrack), nextPageToken: json.nextPageToken || '', hasMore: !!json.nextPageToken };
}
async function handleYoutube(req, res, url) {
  const p = url.pathname;
  if (p === '/api/youtube-music/status') return sendJson(res, youtubeConfig());
  if (p === '/api/youtube-music/config') {
    if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
    return sendJson(res, Object.assign({ ok: true }, saveYoutubeConfig(await readBody(req))));
  }
  if (p === '/api/youtube-music/logout') {
    try { if (fs.existsSync(YOUTUBE_CONFIG_FILE)) fs.unlinkSync(YOUTUBE_CONFIG_FILE); } catch (_) {}
    return sendJson(res, { provider: 'youtube', configured: false, loggedIn: false, ok: true });
  }
  if (p === '/api/youtube-music/search') return sendJson(res, await youtubeSearch(url.searchParams.get('keywords') || '', Number(url.searchParams.get('limit')) || 12, url.searchParams.get('pageToken') || ''));
  return sendJson(res, { provider: 'youtube', ok: false, error: 'NOT_FOUND' }, 404);
}

function isWesternProviderPath(pathname) {
  return pathname === '/api/spotify' || pathname.startsWith('/api/spotify/') || pathname === '/api/soundcloud' || pathname.startsWith('/api/soundcloud/') || pathname === '/api/youtube-music' || pathname.startsWith('/api/youtube-music/');
}
async function dispatch(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  try {
    if (url.pathname === '/api/spotify' || url.pathname.startsWith('/api/spotify/')) return await handleSpotify(req, res, url);
    if (url.pathname === '/api/soundcloud' || url.pathname.startsWith('/api/soundcloud/')) return await handleSoundcloud(req, res, url);
    if (url.pathname === '/api/youtube-music' || url.pathname.startsWith('/api/youtube-music/')) return await handleYoutube(req, res, url);
  } catch (error) {
    console.error('[WesternProviders]', url.pathname, error);
    return sendJson(res, { ok: false, provider: url.pathname.split('/')[2] || '', error: error.code || error.message || 'PROVIDER_ERROR', message: error.message || 'Provider request failed' }, Number(error.statusCode) || 500);
  }
}

function installHttpProviderBridge() {
  if (http.__mineradioWesternProviderBridgeInstalled) return;
  http.__mineradioWesternProviderBridgeInstalled = true;
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
      if (isWesternProviderPath(pathname)) {
        Promise.resolve(dispatch(req, res)).catch(error => {
          if (!res.headersSent) sendJson(res, { ok: false, error: error.message || 'PROVIDER_ERROR' }, 500);
          else try { res.end(); } catch (_) {}
        });
        return;
      }
      return listener(req, res);
    };
    return opts === undefined ? originalCreateServer.call(http, wrapped) : originalCreateServer.call(http, opts, wrapped);
  };
}

module.exports = {
  installHttpProviderBridge,
  soundcloudConfig,
  youtubeConfig,
  _test: { normalizeSoundcloudTrack, normalizeYoutubeTrack, isWesternProviderPath }
};
