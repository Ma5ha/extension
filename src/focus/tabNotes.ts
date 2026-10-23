import { bookmarkHref } from '../bookmarks/model';
export interface TabNote { url: string; title: string; text: string; updated: number; }
export const tabNotesPrefix = 'tabora.tab-note.v1.';
export function parseTabNote(raw: unknown): TabNote | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as TabNote;
  return typeof v.url === 'string' && bookmarkHref(v.url) && typeof v.title === 'string' && typeof v.text === 'string' && Number.isFinite(v.updated) && v.updated >= 0 && v.updated <= 8_640_000_000_000_000 ? { url: v.url, title: v.title.slice(0, 500), text: v.text.slice(0, 20000), updated: v.updated } : null;
}
