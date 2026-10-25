import { isExtension } from '../adapters/chrome';
import { parseFeed } from './model';
export const sourcePrefix = 'tabora.news.source.';
export const savedPrefix = 'tabora.news.saved.';
const permission = (url: string) => ({ origins: [`https://${new URL(url).hostname}/*`] });
export async function allowFeed(url: string) {
  if (isExtension && !await chrome.permissions.request(permission(url))) throw new Error('Site access was not approved. You can try again.');
}
export async function fetchFeed(url: string, signal: AbortSignal) {
  if (!navigator.onLine) throw new Error('You are offline. Showing the last saved headlines.');
  if (isExtension && !await chrome.permissions.contains(permission(url))) throw new Error('Site access is missing. Use Allow access to reconnect this source.');
  const timeout = AbortSignal.any([signal, AbortSignal.timeout(20_000)]);
  let response: Response;
  try { response = await fetch(url, { signal: timeout, credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error', cache: 'no-store' }); }
  catch { if (signal.aborted) throw new Error('Request cancelled.'); throw new Error('Could not fetch this feed. Check the URL and connection; redirected URLs need their final feed address.'); }
  if (!response.ok) throw new Error(response.status === 429 ? 'The source is limiting requests. Try again later.' : 'The source could not be loaded. Check its feed address and try again.');
  if (Number(response.headers.get('content-length')) > 2_000_000) throw new Error('This feed is too large (maximum 2 MB).');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('The source returned no feed.');
  const decoder = new TextDecoder(); let size = 0, xml = '';
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 2_000_000) { await reader.cancel(); throw new Error('This feed is too large (maximum 2 MB).'); } xml += decoder.decode(value, { stream: true }); }
  } catch (error) {
    if (timeout.aborted) throw new Error('The source took too long to respond. Try again.');
    if (error instanceof Error && error.message.includes('too large')) throw error;
    throw new Error('The feed download was interrupted. Try again.');
  } finally { reader.releaseLock(); }
  return parseFeed(xml + decoder.decode(), url);
}
