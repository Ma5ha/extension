import { isExtension } from '../adapters/chrome';
export async function readLocal(key: string): Promise<unknown> {
  if (isExtension) return (await chrome.storage.local.get(key))[key];
  const raw = localStorage.getItem(key); return raw === null ? undefined : JSON.parse(raw);
}
export async function writeLocal(key: string, value: unknown) {
  if (isExtension) await chrome.storage.local.set({ [key]: value }); else { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new CustomEvent('tabora-local', { detail: key })); }
}
export async function deleteLocal(key: string) {
  if (isExtension) await chrome.storage.local.remove(key); else { localStorage.removeItem(key); window.dispatchEvent(new CustomEvent('tabora-local', { detail: key })); }
}
export async function listLocal(prefix: string): Promise<unknown[]> {
  if (isExtension) return Object.entries(await chrome.storage.local.get(null)).filter(([k]) => k.startsWith(prefix)).map(([, v]) => v);
  return Object.keys(localStorage).filter(k => k.startsWith(prefix)).flatMap(k => { try { return [JSON.parse(localStorage.getItem(k) ?? 'null')]; } catch { return []; } });
}
export function subscribeLocal(prefix: string, refresh: () => void) {
  if (isExtension) {
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => { if (area === 'local' && Object.keys(changes).some(k => k.startsWith(prefix))) refresh(); };
    chrome.storage.onChanged.addListener(listener); return () => chrome.storage.onChanged.removeListener(listener);
  }
  const listener = (event: StorageEvent) => { if (event.key === null || event.key.startsWith(prefix)) refresh(); };
  const samePage = (event: Event) => { if ((event as CustomEvent<string>).detail.startsWith(prefix)) refresh(); };
  window.addEventListener('storage', listener); window.addEventListener('tabora-local', samePage);
  return () => { window.removeEventListener('storage', listener); window.removeEventListener('tabora-local', samePage); };
}
