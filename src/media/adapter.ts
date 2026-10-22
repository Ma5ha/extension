import { mediaDOM } from './dom';
import { sitePattern, validCommand, MediaActionError, type MediaCommand, type Source } from './model';

export async function inspectSource(tab: chrome.tabs.Tab): Promise<Source> {
  const base: Source = { tab, items: [], status: 'permission', frames: 0 };
  if (tab.discarded) return { ...base, status: 'discarded' };
  const pattern = sitePattern(tab.url);
  if (!pattern) return { ...base, status: 'unavailable' };
  if (!await chrome.permissions.contains({ permissions: ['scripting'], origins: [pattern] })) return base;
  try {
    const results = await chrome.scripting.executeScript({ target: { tabId: tab.id!, allFrames: true }, func: mediaDOM });
    return { ...base, status: 'ready', frames: results.reduce((n, r) => n + (r.result?.frames ?? 0), 0), items: results.flatMap(r => (r.result?.items ?? []).map(item => ({ ...item, frameId: r.frameId, documentId: r.documentId! }))) };
  } catch { return { ...base, status: 'unavailable' }; }
}
export function allowSite(url?: string) {
  const pattern = sitePattern(url);
  return pattern ? chrome.permissions.request({ permissions: ['scripting'], origins: [pattern] }) : Promise.resolve(false);
}
export async function control(source: Source, item: Source['items'][number], command: MediaCommand) {
  if (!validCommand(command)) throw new Error('command');
  // Pin the document and inject before the first await for gesture-gated PiP.
  // Chrome rejects a closed/discarded tab or a document replaced by navigation.
  if (command.type !== 'pip-enter' && command.type !== 'pip-exit') {
    const current = await chrome.tabs.get(source.tab.id!);
    if (current.url !== source.tab.url || current.discarded) throw new Error('changed');
  }
  const result = await chrome.scripting.executeScript({ target: { tabId: source.tab.id!, documentIds: [item.documentId] }, func: mediaDOM, args: [item.id, command] });
  if (result[0]?.result?.errorCode) throw new MediaActionError(result[0].result.errorCode);
  if (!result[0]?.result || result[0].result.error) throw new Error('unavailable');
}
export async function openSource(id: number) {
  const tab = await chrome.tabs.get(id);
  await chrome.tabs.update(id, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true });
}
