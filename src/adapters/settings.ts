import { defaultLayout, parseLayout, type Layout } from '../workspace/layout';
import { isExtension } from './chrome';

export interface Settings {
  version: 1;
  theme: 'light' | 'dark' | 'system';
  glass: number;
  blur: number;
  layoutMode: 'console' | 'custom';
  agenda: boolean;
  gmail: boolean;
  music: boolean;
  bookmarks: boolean;
  sessions: boolean;
  focus: boolean;
  clock: boolean;
  layout: Layout;
}
export const defaults: Settings = { version: 1, theme: 'light', glass: 0, blur: 0, layoutMode: 'console', agenda: true, gmail: true, music: true, bookmarks: true, sessions: true, focus: true, clock: true, layout: defaultLayout };
const key = 'tabora.settings.v1';
const fields = ['version', 'theme', 'glass', 'blur', 'layoutMode', 'agenda', 'gmail', 'music', 'bookmarks', 'sessions', 'focus', 'clock', 'layout'] as const;
export function parseSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') return defaults;
  const s = raw as Partial<Settings>;
  if (s.version !== undefined && s.version !== 1) return defaults;
  return {
    version: 1,
    theme: s.theme === 'dark' || s.theme === 'system' ? s.theme : 'light',
    glass: typeof s.glass === 'number' && Number.isFinite(s.glass) ? Math.min(70, Math.max(0, s.glass)) : 0,
    blur: typeof s.blur === 'number' && Number.isFinite(s.blur) ? Math.min(32, Math.max(0, s.blur)) : 0,
    layoutMode: s.layoutMode === 'custom' ? 'custom' : 'console',
    agenda: typeof s.agenda === 'boolean' ? s.agenda : true,
    gmail: typeof s.gmail === 'boolean' ? s.gmail : true,
    music: typeof s.music === 'boolean' ? s.music : true,
    bookmarks: typeof s.bookmarks === 'boolean' ? s.bookmarks : true,
    sessions: typeof s.sessions === 'boolean' ? s.sessions : true,
    focus: typeof s.focus === 'boolean' ? s.focus : true,
    clock: typeof s.clock === 'boolean' ? s.clock : true,
    layout: parseLayout(s.layout),
  };
}
export async function loadSettings(): Promise<Settings> {
  const keys = fields.map(field => `${key}.${field}`);
  if (isExtension) {
    const stored = await chrome.storage.local.get(keys);
    return parseSettings(Object.fromEntries(fields.map(field => [field, stored[`${key}.${field}`]])));
  }
  return parseSettings(Object.fromEntries(fields.map(field => {
    const value = localStorage.getItem(`${key}.${field}`);
    return [field, value === null ? undefined : JSON.parse(value)];
  })));
}
// Each field has its own key: parallel tabs cannot overwrite unrelated preferences.
export async function saveSettings(patch: Partial<Settings>) {
  const valid = parseSettings({ ...defaults, ...patch });
  const entries = fields.filter(field => Object.hasOwn(patch, field)).map(field => [`${key}.${field}`, valid[field]] as const);
  if (isExtension) await chrome.storage.local.set(Object.fromEntries(entries));
  else for (const [field, value] of entries) localStorage.setItem(field, JSON.stringify(value));
  return loadSettings();
}
export function subscribeSettings(update: (s: Settings) => void) {
  if (isExtension) {
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && Object.keys(changes).some(field => field.startsWith(`${key}.`))) void loadSettings().then(update).catch(() => { /* Retain last valid settings. */ });
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
  const listener = (event: StorageEvent) => {
    if (event.key?.startsWith(`${key}.`)) void loadSettings().then(update).catch(() => { /* Retain last valid settings. */ });
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
