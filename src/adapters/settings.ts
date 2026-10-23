import { workspaceKey, type WorkspaceId } from '../workspace/WorkspaceContext';
import { defaultLayout, parseLayout, type Layout } from '../workspace/layout';
import { isExtension } from './chrome';

export const fontSizePresets = [
  { value: 'tiny', label: 'Tiny', pixels: 10 },
  { value: 'compact', label: 'Compact', pixels: 11 },
  { value: 'cozy', label: 'Cozy', pixels: 12 },
  { value: 'default', label: 'Default', pixels: 14 },
  { value: 'large', label: 'Large', pixels: 16 },
] as const;

export interface Settings {
  version: 1;
  theme: 'light' | 'dark' | 'system';
  fontSize: typeof fontSizePresets[number]['value'];
  backgroundMotion: boolean;
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
export const defaults: Settings = { version: 1, theme: 'light', fontSize: 'compact', backgroundMotion: true, glass: 55, blur: 12, layoutMode: 'console', agenda: true, gmail: true, music: true, bookmarks: true, sessions: true, focus: true, clock: true, layout: defaultLayout };
const key = 'tabora.settings.v1';
const fields = ['version', 'theme', 'fontSize', 'backgroundMotion', 'glass', 'blur', 'layoutMode', 'agenda', 'gmail', 'music', 'bookmarks', 'sessions', 'focus', 'clock', 'layout'] as const;
export function parseSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') return defaults;
  const s = raw as Partial<Settings>;
  if (s.version !== undefined && s.version !== 1) return defaults;
  return {
    version: 1,
    theme: s.theme === 'dark' || s.theme === 'system' ? s.theme : 'light',
    fontSize: fontSizePresets.find(preset => preset.value === s.fontSize)?.value ?? 'compact',
    backgroundMotion: typeof s.backgroundMotion === 'boolean' ? s.backgroundMotion : true,
    glass: typeof s.glass === 'number' && Number.isFinite(s.glass) ? Math.min(70, Math.max(0, s.glass)) : defaults.glass,
    blur: typeof s.blur === 'number' && Number.isFinite(s.blur) ? Math.min(32, Math.max(0, s.blur)) : defaults.blur,
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
const scoped = new Set<string>(['layout', 'layoutMode', 'agenda', 'gmail', 'music', 'bookmarks', 'sessions', 'focus', 'clock']);
const fieldKey = (field: string, workspace: WorkspaceId) => scoped.has(field) ? workspaceKey(`${key}.${field}`, workspace) : `${key}.${field}`;
export async function loadSettings(workspace: WorkspaceId = 'work'): Promise<Settings> {
  const keys = fields.map(field => fieldKey(field, workspace));
  if (isExtension) {
    const stored = await chrome.storage.local.get(keys);
    return parseSettings(Object.fromEntries(fields.map(field => [field, stored[fieldKey(field, workspace)]])));
  }
  return parseSettings(Object.fromEntries(fields.map(field => {
    const value = localStorage.getItem(fieldKey(field, workspace));
    return [field, value === null ? undefined : JSON.parse(value)];
  })));
}
// Each field has its own key: parallel tabs cannot overwrite unrelated preferences.
export async function saveSettings(patch: Partial<Settings>, workspace: WorkspaceId = 'work') {
  const valid = parseSettings({ ...defaults, ...patch });
  const entries = fields.filter(field => Object.hasOwn(patch, field)).map(field => [fieldKey(field, workspace), valid[field]] as const);
  if (isExtension) await chrome.storage.local.set(Object.fromEntries(entries));
  else for (const [field, value] of entries) localStorage.setItem(field, JSON.stringify(value));
  return loadSettings(workspace);
}
export function subscribeSettings(update: (s: Settings) => void, workspace: WorkspaceId = 'work') {
  if (isExtension) {
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && Object.keys(changes).some(field => fields.some(f => field === fieldKey(f, workspace)))) void loadSettings(workspace).then(update).catch(() => { /* Retain last valid settings. */ });
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
  const listener = (event: StorageEvent) => {
    if (fields.some(f => event.key === fieldKey(f, workspace))) void loadSettings(workspace).then(update).catch(() => { /* Retain last valid settings. */ });
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
