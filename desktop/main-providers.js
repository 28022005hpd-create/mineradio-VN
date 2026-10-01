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

// Order matters: OAuth must wrap createServer before the broader /api/spotify
// bridge so /api/spotify/oauth/start is handled by the PKCE callback bridge.
require('../spotify-oauth-bridge-api').installSpotifyOAuthBridge();
require('../western-providers-api').installHttpProviderBridge();
module.exports = require('./main-localized');
