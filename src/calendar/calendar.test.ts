import { afterEach, describe, expect, it, vi } from 'vitest';
import { dayRange, eventTime, nextEvent, parseEvents, safeLink } from './model';
import { calendarScope, connectCalendar, disconnectCalendar, loadAgenda } from './adapter';
const raw = { id: 'event', summary: 'Sastanak', start: { dateTime: '2026-10-21T09:00:00+02:00' }, end: { dateTime: '2026-10-21T10:00:00+02:00' } };
afterEach(() => vi.unstubAllGlobals());
function mockChrome(connected = true) {
  const identity = { getAuthToken: vi.fn().mockResolvedValue({ token: 'test-token', grantedScopes: [calendarScope] }), removeCachedAuthToken: vi.fn().mockResolvedValue(undefined), clearAllCachedAuthTokens: vi.fn().mockResolvedValue(undefined) };
  const permissions = { request: vi.fn().mockResolvedValue(true), contains: vi.fn().mockResolvedValue(true) };
  const local = { get: vi.fn().mockResolvedValue({ 'tabora.calendar.enabled': connected }), set: vi.fn().mockResolvedValue(undefined) };
  vi.stubGlobal('chrome', { runtime: { id: 'test', getManifest: () => ({ oauth2: { client_id: 'client' } }) }, identity, permissions, storage: { local } });
  vi.stubGlobal('navigator', { onLine: true });
  return { identity, permissions, local };
}
describe('Calendar event boundaries', () => {
  it('renders literal titles, filters cancelled and malformed events, removes unsafe links', () => {
    const events = parseEvents([{ ...raw, summary: '<script>test</script>', htmlLink: 'javascript:alert(1)', hangoutLink: 'https://meet.google.com/test' }, { ...raw, status: 'cancelled' }, { ...raw, start: {} }]);
    expect(events).toHaveLength(1); expect(events[0]?.title).toBe('<script>test</script>'); expect(events[0]?.url).toBeUndefined(); expect(events[0]?.meeting).toBe('https://meet.google.com/test');
    expect(safeLink('https://user:pass@example.com')).toBeUndefined();
  });
  it('keeps all-day dates without converting them through UTC', () => {
    const e = parseEvents([{ id: 'day', start: { date: '2026-10-21' }, end: { date: '2026-10-22' } }])[0]!;
    expect(e.start).toBe('2026-10-21'); expect(eventTime(e, 'Europe/Belgrade')).toBe('Cijeli dan');
    expect(nextEvent([e, ...parseEvents([raw])], Date.parse('2026-10-21T06:00:00Z'))?.id).toBe('event');
    expect(nextEvent(parseEvents([raw]), Date.parse('2026-10-21T08:30:00Z'))).toBeUndefined();
  });
  it('uses consecutive local midnights, including daylight-saving transitions', () => {
    const now = new Date(2026, 9, 25, 12); const range = dayRange(now);
    expect(new Date(range.start).getHours()).toBe(0); expect(new Date(range.end).getHours()).toBe(0);
    expect(new Date(range.end).getDate()).toBe(26);
  });
});
describe('Calendar integration boundary', () => {
  it('does not fetch or authorize a disconnected calendar', async () => {
    const { identity } = mockChrome(false); const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    await expect(loadAgenda()).rejects.toMatchObject({ kind: 'expired' });
    expect(identity.getAuthToken).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not authorize or store connected state after denied host permission', async () => {
    const { permissions, identity, local } = mockChrome(); permissions.request.mockResolvedValue(false);
    await expect(connectCalendar()).rejects.toMatchObject({ kind: 'denied' });
    expect(identity.getAuthToken).not.toHaveBeenCalled(); expect(local.set).not.toHaveBeenCalled();
  });
  it('rejects a missing scope even when Google returns a token', async () => {
    const { identity, local } = mockChrome(); identity.getAuthToken.mockResolvedValue({ token: 'test-token', grantedScopes: [] });
    await expect(connectCalendar()).rejects.toMatchObject({ kind: 'denied' }); expect(local.set).not.toHaveBeenCalled();
  });
  it('retries one expired token and retrieves all event pages', async () => {
    const { identity } = mockChrome();
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 401 })).mockResolvedValueOnce(Response.json({ items: [raw], nextPageToken: 'page2' })).mockResolvedValueOnce(Response.json({ items: [{ ...raw, id: 'event2' }] }));
    vi.stubGlobal('fetch', fetcher);
    const agenda = await loadAgenda(new Date('2026-10-21T06:00:00Z'));
    expect(agenda.events).toHaveLength(2); expect(identity.removeCachedAuthToken).toHaveBeenCalledWith({ token: 'test-token' });
    expect(identity.getAuthToken).toHaveBeenCalledTimes(2);
    const url = fetcher.mock.calls[2]![0] as URL;
    expect(url.searchParams.get('pageToken')).toBe('page2'); expect(url.pathname).toContain('/primary/events');
    expect(url.searchParams.get('singleEvents')).toBe('true'); expect(url.href).not.toContain('test-token');
    expect(identity.getAuthToken).toHaveBeenCalledWith(expect.objectContaining({ interactive: false }));
  });
  it('distinguishes offline, forbidden and rate-limited results', async () => {
    mockChrome(); const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    vi.stubGlobal('navigator', { onLine: false }); await expect(loadAgenda()).rejects.toMatchObject({ kind: 'offline' }); expect(fetcher).not.toHaveBeenCalled();
    vi.stubGlobal('navigator', { onLine: true }); fetcher.mockResolvedValue(new Response('', { status: 403 })); await expect(loadAgenda()).rejects.toMatchObject({ kind: 'forbidden' });
    fetcher.mockResolvedValue(new Response('', { status: 429 })); await expect(loadAgenda()).rejects.toMatchObject({ kind: 'rate' });
  });
  it('disables the calendar before clearing authorization and never persists tokens/events', async () => {
    const { local, identity } = mockChrome(); await disconnectCalendar();
    expect(local.set).toHaveBeenCalledExactlyOnceWith({ 'tabora.calendar.enabled': false });
    expect(local.set.mock.invocationCallOrder[0]).toBeLessThan(identity.clearAllCachedAuthTokens.mock.invocationCallOrder[0]!);
  });
});
