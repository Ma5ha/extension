import { Browser, FigmaLogo, GithubLogo, FileText, Globe } from '@phosphor-icons/react';

// Bundled icons avoid requests to favicon services or the sites in a private tab list.
export function SiteIcon({ url, size = 21 }: { url: string; size?: number }) {
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch { /* Internal and unavailable URLs use the browser icon. */ }
  const Icon = hostname === 'github.com' ? GithubLogo : hostname === 'figma.com' || hostname.endsWith('.figma.com') ? FigmaLogo : hostname === 'developer.mozilla.org' || hostname === 'developer.chrome.com' ? FileText : hostname ? Globe : Browser;
  return <Icon size={size} aria-hidden="true" />;
}
