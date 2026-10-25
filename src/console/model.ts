export interface ConsoleEntry { id: number; level: 'log' | 'info' | 'warning' | 'error' | 'debug'; text: string; location: string; time: number }
export interface ConsoleState { connected: boolean; tabId: number | null; title: string; entries: ConsoleEntry[]; error: string }
export const emptyConsole: ConsoleState = { connected: false, tabId: null, title: '', entries: [], error: '' };
export function allowedConsoleUrl(url: string) { return /^https?:\/\//i.test(url) && !/^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)(\/|$)/i.test(url); }
function objectText(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const value = raw as Record<string, unknown>;
  if (['string', 'number', 'boolean'].includes(typeof value.value) || value.value === null) return String(value.value).slice(0, 2000);
  return String(value.unserializableValue ?? value.description ?? value.type ?? '[object]').slice(0, 2000);
}
export function consoleEntry(method: string, raw: unknown, id: number, time: number): ConsoleEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  let level: ConsoleEntry['level'] = 'log', text = '', location = '';
  if (method === 'Runtime.consoleAPICalled') {
    if (p.type === 'clear') return { id, level: 'info', text: 'Page console cleared', location: '', time };
    level = p.type === 'error' || p.type === 'assert' ? 'error' : p.type === 'warning' ? 'warning' : p.type === 'debug' ? 'debug' : p.type === 'info' ? 'info' : 'log';
    text = Array.isArray(p.args) ? p.args.slice(0, 20).map(objectText).join(' ') : '';
    const stack = p.stackTrace as { callFrames?: { url?: string; lineNumber?: number }[] } | undefined;
    const frame = stack?.callFrames?.[0];
    if (frame?.url) location = `${frame.url}:${(frame.lineNumber ?? 0) + 1}`;
  } else if (method === 'Runtime.exceptionThrown') {
    const detail = p.exceptionDetails as { text?: string; exception?: unknown; url?: string; lineNumber?: number } | undefined;
    level = 'error'; text = objectText(detail?.exception) || detail?.text || 'Unhandled JavaScript error';
    if (detail?.url) location = `${detail.url}:${(detail.lineNumber ?? 0) + 1}`;
  } else if (method === 'Log.entryAdded') {
    const entry = p.entry as { text?: string; level?: string; url?: string } | undefined;
    if (!entry || entry.level === 'verbose') return null;
    level = entry.level === 'error' ? 'error' : entry.level === 'warning' ? 'warning' : 'info'; text = entry.text ?? ''; location = entry.url ?? '';
  } else return null;
  return { id, level, text: text.slice(0, 4000), location: location.slice(0, 1000), time };
}
