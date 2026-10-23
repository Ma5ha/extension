export interface AgendaEvent {
  id: string; title: string; start: string; end: string; allDay: boolean;
  url?: string; meeting?: string;
}
export interface Agenda { events: AgendaEvent[]; timeZone: string; updated: number; }
export function safeLink(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : undefined; } catch { return; }
}
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
}
export function parseEvents(items: unknown): AgendaEvent[] {
  if (!Array.isArray(items)) throw new Error('response');
  return items.flatMap(raw => {
    const e = record(raw), start = record(e.start), end = record(e.end);
    const allDay = typeof start.date === 'string';
    const from = allDay ? start.date : start.dateTime, to = allDay ? end.date : end.dateTime;
    if (e.status === 'cancelled' || typeof e.id !== 'string' || typeof from !== 'string' || typeof to !== 'string') return [];
    if (allDay ? !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) : !Number.isFinite(Date.parse(from)) || !Number.isFinite(Date.parse(to))) return [];
    return [{ id: e.id, title: typeof e.summary === 'string' && e.summary.trim() ? e.summary : 'Untitled', start: from, end: to, allDay, url: safeLink(e.htmlLink), meeting: safeLink(e.hangoutLink) }];
  });
}
export function dayRange(now: Date) {
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}
export function nextEvent(events: AgendaEvent[], now: number) {
  return events.find(e => !e.allDay && Date.parse(e.start) >= now);
}
export function eventTime(event: AgendaEvent, timeZone: string) {
  if (event.allDay) return 'All day';
  const format = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
  return `${format.format(new Date(event.start))}–${format.format(new Date(event.end))}`;
}
