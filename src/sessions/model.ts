import { bookmarkHref } from '../bookmarks/model';
import type { Tab } from '../domain/tabs';
export interface SavedTab { title: string; url: string; pinned: boolean; }
export interface SavedSession { id: string; name: string; created: number; tabs: SavedTab[]; }
export function snapshotTabs(tabs: Tab[]): SavedTab[] {
  return tabs.flatMap(tab => { const url = bookmarkHref(tab.url); return url ? [{ title: tab.title.slice(0, 500), url, pinned: tab.pinned }] : []; });
}
export function parseSession(raw: unknown): SavedSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<SavedSession>;
  if (typeof s.id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(s.id) || typeof s.name !== 'string' || !s.name.trim() || s.name.length > 100 || typeof s.created !== 'number' || !Number.isFinite(s.created) || !Array.isArray(s.tabs) || s.tabs.length > 500) return null;
  const tabs = s.tabs.flatMap(t => {
    if (!t || typeof t !== 'object' || typeof t.url !== 'string' || typeof t.title !== 'string') return [];
    const url = bookmarkHref(t.url); return url ? [{ title: t.title.slice(0, 500), url, pinned: t.pinned === true }] : [];
  });
  return tabs.length ? { id: s.id, name: s.name.trim(), created: s.created, tabs } : null;
}
