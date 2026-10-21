import { dayRange, parseEvents, type Agenda } from './model';

export const calendarScope = 'https://www.googleapis.com/auth/calendar.events.owned.readonly';
const access: chrome.permissions.Permissions = { permissions: ['identity'], origins: ['https://www.googleapis.com/*'] };
export const connectionKey = 'tabora.calendar.enabled';
export type CalendarFailure = 'denied' | 'expired' | 'offline' | 'forbidden' | 'rate' | 'error';
export class CalendarError extends Error {
  constructor(public kind: CalendarFailure) { super(kind); }
}
export function calendarAvailable() {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.id && !!chrome.runtime.getManifest().oauth2?.client_id;
}
export async function isConnected() {
  return calendarAvailable() && (await chrome.storage.local.get(connectionKey))[connectionKey] === true;
}
export async function connectCalendar() {
  // Called directly from the button so the permission request retains its user gesture.
  if (!await chrome.permissions.request(access)) throw new CalendarError('denied');
  const token = await authToken(true);
  if (!token) throw new CalendarError('denied');
  await chrome.storage.local.set({ [connectionKey]: true });
}
async function authToken(interactive: boolean): Promise<string> {
  try {
    const result = await chrome.identity.getAuthToken({ interactive, scopes: [calendarScope], enableGranularPermissions: true });
    if (!result.token || (result.grantedScopes && !result.grantedScopes.includes(calendarScope))) throw new Error('scope');
    return result.token;
  } catch { throw new CalendarError(interactive ? 'denied' : 'expired'); }
}
export async function disconnectCalendar() {
  // Disable first: other open Tabora tabs clear their agenda immediately.
  await chrome.storage.local.set({ [connectionKey]: false });
  if (await chrome.permissions.contains({ permissions: ['identity'] })) {
    await chrome.identity.clearAllCachedAuthTokens();
  }
  // Do not remove a shared host grant used by the optional media module.
}
export async function loadAgenda(now = new Date(), signal?: AbortSignal): Promise<Agenda> {
  if (!await isConnected() || !await chrome.permissions.contains(access)) throw new CalendarError('expired');
  if (typeof navigator !== 'undefined' && !navigator.onLine) throw new CalendarError('offline');
  const range = dayRange(now), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.search = new URLSearchParams({ timeMin: range.start, timeMax: range.end, singleEvents: 'true', orderBy: 'startTime', maxResults: '250', timeZone, fields: 'items(id,status,summary,start,end,htmlLink,hangoutLink),nextPageToken' }).toString();
  const requestSignal = AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(20_000)]);
  let token = await authToken(false);
  const events: Agenda['events'] = [];
  const seenPages = new Set<string>();
  for (;;) {
    let response: Response;
    try {
      response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: requestSignal, cache: 'no-store', credentials: 'omit', redirect: 'error' });
      if (response.status === 401) {
        await chrome.identity.removeCachedAuthToken({ token });
        token = await authToken(false);
        response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: requestSignal, cache: 'no-store', credentials: 'omit', redirect: 'error' });
      }
    } catch (error) {
      if (signal?.aborted || error instanceof CalendarError) throw error;
      throw new CalendarError('offline');
    }
    if (!response.ok) throw new CalendarError(response.status === 401 ? 'expired' : response.status === 403 ? 'forbidden' : response.status === 429 ? 'rate' : 'error');
    const body: unknown = await response.json();
    if (!body || typeof body !== 'object') throw new CalendarError('error');
    const page = body as { items?: unknown; nextPageToken?: unknown };
    events.push(...parseEvents(page.items ?? []));
    if (!page.nextPageToken) break;
    if (typeof page.nextPageToken !== 'string' || seenPages.has(page.nextPageToken) || seenPages.size >= 100) throw new CalendarError('error');
    seenPages.add(page.nextPageToken); url.searchParams.set('pageToken', page.nextPageToken);
  }
  return { events, timeZone, updated: Date.now() };
}
