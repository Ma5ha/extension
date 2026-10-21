import { getTabs, isExtension } from '../adapters/chrome';
import { deleteLocal, listLocal, subscribeLocal, writeLocal } from '../local/store';
import { parseSession, snapshotTabs, type SavedSession } from './model';
const prefix = 'tabora.session.v1.';
export async function loadSessions() {
  return (await listLocal(prefix)).flatMap(raw => { const value = parseSession(raw); return value ? [value] : []; }).sort((a, b) => b.created - a.created);
}
export async function saveSession(name: string) {
  const current = await getTabs();
  const tabs = snapshotTabs(current.tabs);
  const session = parseSession({ id: crypto.randomUUID(), name: name.trim(), created: Date.now(), tabs });
  if (!session) throw new Error('session');
  await writeLocal(prefix + session.id, session);
  return { saved: tabs.length, skipped: current.tabs.length - tabs.length };
}
export async function removeSession(session: SavedSession) { await deleteLocal(prefix + session.id); }
export const subscribeSessions = (refresh: () => void) => subscribeLocal(prefix, refresh);
export async function restoreSession(session: SavedSession) {
  if (!isExtension) throw new Error('extension');
  const valid = parseSession(session); if (!valid) throw new Error('session');
  const current = await getTabs(); const existing = new Set(current.tabs.map(t => t.url));
  let opened = 0, skipped = 0, failed = 0;
  for (const tab of valid.tabs) {
    if (existing.has(tab.url)) { skipped++; continue; }
    try { await chrome.tabs.create({ windowId: current.windowId, url: tab.url, pinned: tab.pinned, active: false }); existing.add(tab.url); opened++; }
    catch { failed++; }
  }
  return { opened, skipped, failed };
}
