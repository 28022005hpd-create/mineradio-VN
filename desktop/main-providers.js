'use strict';

// Install official Western provider routes before desktop/main.js requires
// server.js. This keeps the legacy provider server untouched.
const path = require('path');
const { app } = require('electron');

if (!process.env.MINERADIO_PROVIDER_CONFIG_DIR) {
  try {
    process.env.MINERADIO_PROVIDER_CONFIG_DIR = path.join(app.getPath('appData'), 'Mineradio', 'providers');
  } catch (_) {
    process.env.MINERADIO_PROVIDER_CONFIG_DIR = path.join(__dirname, '..', '.provider-config');
  }
}
const providerRoot = process.env.MINERADIO_PROVIDER_CONFIG_DIR;
if (!process.env.SPOTIFY_CONFIG_FILE) process.env.SPOTIFY_CONFIG_FILE = path.join(providerRoot, 'spotify-credentials.json');
if (!process.env.SPOTIFY_TOKEN_FILE) process.env.SPOTIFY_TOKEN_FILE = path.join(providerRoot, 'spotify-token.json');

// The Web Playback SDK / Spotify Connect control needs these official scopes.
// Merge instead of replace so users with custom scopes keep them.
const playbackScopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
];
const configuredScopes = String(process.env.MINERADIO_SPOTIFY_SCOPES || process.env.SPOTIFY_SCOPES || '')
  .split(/[\s,;]+/)
  .filter(Boolean);
process.env.MINERADIO_SPOTIFY_SCOPES = Array.from(new Set(playbackScopes.concat(configuredScopes))).join(' ');

// Request order matters. The first installed wrapper receives requests first,
// so exact playback routes must precede OAuth, then the broad provider bridge.
require('../western-playback-api').installWesternPlaybackBridge();
require('../spotify-oauth-bridge-api').installSpotifyOAuthBridge();
require('../western-providers-api').installHttpProviderBridge();
module.exports = require('./main-localized');
