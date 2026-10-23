import type { DuplicateGroup } from '../domain/duplicates';
export async function closeDuplicates(groups: DuplicateGroup[], selected: Set<number>) {
  let closed = 0, skipped = 0, failed = 0;
  for (const group of groups) for (const approved of group.tabs) {
    if (!selected.has(approved.id)) continue;
    try {
      const current = await chrome.tabs.query({ windowId: approved.windowId });
      const target = current.find(t => t.id === approved.id);
      const keeper = current.find(t => t.id !== approved.id && (t.pendingUrl || t.url) === group.url && !selected.has(t.id ?? -1));
      if (!target || (target.pendingUrl || target.url) !== group.url || target.pinned || target.active || !keeper) { skipped++; continue; }
      await chrome.tabs.remove(approved.id); closed++;
    } catch { failed++; }
  }
  return { closed, skipped, failed };
}
