import { defineConfig } from 'wxt';
import { env } from 'node:process';

const clientId = env.TABORA_GOOGLE_CLIENT_ID?.trim();
if (clientId && !/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/.test(clientId)) throw new Error('Neispravan Google OAuth client ID.');

export default defineConfig({
  outDir: 'build',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Tabora',
    description: 'Tvoj prostor, svaki novi tab. Pregled i organizacija tabova.',
    minimum_chrome_version: '120',
    permissions: ['storage', 'sidePanel'],
    action: { default_title: 'Otvori Taboru u bočnom panelu' },
    optional_host_permissions: ['https://*/*', 'http://*/*'],
    optional_permissions: ['tabs', 'tabGroups', 'scripting', 'identity', 'bookmarks'],
    ...(clientId ? { oauth2: { client_id: clientId, scopes: ['https://www.googleapis.com/auth/calendar.events.owned.readonly'] } } : {}),
    ...(env.TABORA_EXTENSION_KEY ? { key: env.TABORA_EXTENSION_KEY } : {}),
  },
});
