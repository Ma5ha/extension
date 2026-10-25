import { parseMail, type Inbox } from './model';
export const gmailScope = 'https://www.googleapis.com/auth/gmail.metadata';
export const connectionKey = 'tabora.gmail.enabled';
const access: chrome.permissions.Permissions = { permissions: ['identity'], origins: ['https://gmail.googleapis.com/*'] };
export type GmailFailure = 'denied' | 'expired' | 'offline' | 'forbidden' | 'rate' | 'error';
export class GmailError extends Error { constructor(public kind: GmailFailure) { super(kind); } }
export function gmailAvailable() { return typeof chrome !== 'undefined' && !!chrome.runtime?.id && !!chrome.runtime.getManifest().oauth2?.client_id; }
export async function isConnected() { return gmailAvailable() && (await chrome.storage.local.get(connectionKey))[connectionKey] === true; }
async function authToken(interactive: boolean) {
  try {
    const result = await chrome.identity.getAuthToken({ interactive, scopes: [gmailScope], enableGranularPermissions: true });
    if (!result.token || (result.grantedScopes && !result.grantedScopes.includes(gmailScope))) throw new Error('scope');
    return result.token;
  } catch { throw new GmailError(interactive ? 'denied' : 'expired'); }
}
export async function connectGmail() {
  if (!await chrome.permissions.request(access)) throw new GmailError('denied');
  await authToken(true);
  await chrome.storage.local.set({ [connectionKey]: true });
}
export async function disconnectGmail() {
  await chrome.storage.local.set({ [connectionKey]: false });
  // Remove only this scope's cached token; Calendar retains its own authorization.
  if (await chrome.permissions.contains({ permissions: ['identity'] })) {
    const token = await authToken(false).catch(() => null);
    if (token) await chrome.identity.removeCachedAuthToken({ token });
  }
}
export async function loadInbox(unread: boolean, signal: AbortSignal): Promise<Inbox> {
  if (!await isConnected() || !await chrome.permissions.contains(access)) throw new GmailError('expired');
  if (!navigator.onLine) throw new GmailError('offline');
  const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(20_000)]);
  const request = async (path: string): Promise<Record<string, unknown>> => {
    let token = await authToken(false);
    const send = () => fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, { headers: { Authorization: `Bearer ${token}` }, signal: requestSignal, cache: 'no-store', credentials: 'omit', redirect: 'error' });
    let response: Response;
    try {
      response = await send();
      if (response.status === 401) { await chrome.identity.removeCachedAuthToken({ token }); token = await authToken(false); response = await send(); }
    } catch (e) { if (e instanceof GmailError || requestSignal.aborted) throw e; throw new GmailError('offline'); }
    if (!response.ok) throw new GmailError(response.status === 401 ? 'expired' : response.status === 403 ? 'forbidden' : response.status === 429 ? 'rate' : 'error');
    const body: unknown = await response.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new GmailError('error');
    return body as Record<string, unknown>;
  };
  const params = new URLSearchParams({ maxResults: '10', labelIds: 'INBOX' });
  if (unread) params.append('labelIds', 'UNREAD');
  const profile = await request('profile?fields=emailAddress');
  if (typeof profile.emailAddress !== 'string') throw new GmailError('error');
  const list = await request(`messages?${params}`);
  if (list.messages !== undefined && !Array.isArray(list.messages)) throw new GmailError('error');
  const messages: Inbox['messages'] = [];
  // Bounded, sequential requests avoid a burst against the mailbox quota.
  for (const item of (list.messages ?? []) as { id?: unknown }[]) {
    if (!item || typeof item.id !== 'string' || !/^[a-f0-9]+$/i.test(item.id)) throw new GmailError('error');
    const query = new URLSearchParams({ format: 'metadata', fields: 'id,threadId,labelIds,internalDate,payload/headers' });
    query.append('metadataHeaders', 'Subject'); query.append('metadataHeaders', 'From');
    const mail = parseMail(await request(`messages/${item.id}?${query}`));
    if (!mail) throw new GmailError('error');
    messages.push(mail);
  }
  return { messages, email: profile.emailAddress, updated: Date.now(), more: typeof list.nextPageToken === 'string' };
}
