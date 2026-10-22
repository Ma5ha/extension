// The endpoint is supplied by chrome.runtime.getURL, never by a website.
export function faviconUrl(pageUrl: string, endpoint: string | null, revision = ''): string | null {
  if (!endpoint) return null;
  try {
    const page = new URL(pageUrl);
    if (!['https:', 'http:'].includes(page.protocol) || page.username || page.password) return null;
    const icon = new URL(endpoint);
    icon.searchParams.set('pageUrl', page.href);
    icon.searchParams.set('size', '64');
    // Refresh the local cached image if Chrome reports a different tab favicon.
    if (revision) {
      let version = 0;
      for (const char of revision.slice(0, 8192)) version = (Math.imul(version, 31) + char.charCodeAt(0)) >>> 0;
      icon.searchParams.set('v', version.toString(36));
    }
    return icon.href;
  } catch { return null; }
}
