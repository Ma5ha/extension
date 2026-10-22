import { describe, expect, it } from 'vitest';
import { faviconUrl } from './favicon';
const endpoint = 'chrome-extension://tabora/_favicon/';
describe('local favicon boundary', () => {
  it('encodes the full page URL only into the extension-owned endpoint', () => {
    const page = 'https://example.com/app?next=a&view=2#section';
    const result = new URL(faviconUrl(page, endpoint)!);
    expect(result.protocol).toBe('chrome-extension:');
    expect(result.hostname).toBe('tabora');
    expect(result.searchParams.get('pageUrl')).toBe(page);
    expect(result.searchParams.get('size')).toBe('64');
  });
  it('falls back without a runtime or for protected, malformed and credential URLs', () => {
    expect(faviconUrl('https://example.com', null)).toBeNull();
    for (const url of ['not a url', 'chrome://newtab/', 'file:///private/file', 'javascript:alert(1)', 'data:text/html,test', 'https://user:password@example.com']) expect(faviconUrl(url, endpoint)).toBeNull();
    expect(faviconUrl('https://example.com', 'invalid')).toBeNull();
  });
  it('uses a new local image source when the tab icon changes without fetching the remote icon', () => {
    const first = faviconUrl('https://example.com', endpoint, 'https://cdn.example.test/first.png')!;
    const second = faviconUrl('https://example.com', endpoint, 'https://cdn.example.test/second.png')!;
    expect(first).not.toEqual(second);
    expect(first).toBe(faviconUrl('https://example.com', endpoint, 'https://cdn.example.test/first.png'));
    expect(new URL(first).hostname).toBe('tabora');
    expect(first).not.toContain('cdn.example');
  });
});
