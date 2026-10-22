import { useState, type ReactElement } from 'react';
import { Browser, FigmaLogo, GithubLogo, FileText, Globe } from '@phosphor-icons/react';
import { isExtension } from '../adapters/chrome';
import { faviconUrl } from '../domain/favicon';
import css from './SiteIcon.module.css';

function CachedIcon({ source, size, fallback }: { source: string; size: number; fallback: ReactElement }) {
  const [failed, setFailed] = useState(false);
  return failed ? fallback : <img className={css.icon} src={source} width={size} height={size} alt="" aria-hidden="true" data-site-icon="image" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}

export function SiteIcon({ url, favIconUrl, size = 21 }: { url: string; favIconUrl?: string; size?: number }) {
  let endpoint: string | null = null;
  try { if (isExtension) endpoint = chrome.runtime.getURL('/_favicon/'); } catch { /* Keep the bundled fallback when the extension context is unavailable. */ }
  const source = faviconUrl(url, endpoint, favIconUrl);
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch { /* Internal and unavailable URLs use the browser icon. */ }
  const Icon = hostname === 'github.com' ? GithubLogo : hostname === 'figma.com' || hostname.endsWith('.figma.com') ? FigmaLogo : hostname === 'developer.mozilla.org' || hostname === 'developer.chrome.com' ? FileText : hostname ? Globe : Browser;
  const fallback = <Icon size={size} aria-hidden="true" data-site-icon="fallback" />;
  // A keyed component retries every source transition, including returning to a previously failed URL.
  return source ? <CachedIcon key={source} source={source} size={size} fallback={fallback} /> : fallback;
}
