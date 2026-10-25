export interface Article { image?: string; url: string; title: string; summary: string; date: number | null; source: string }
export interface Feed { id: string; url: string; title: string; articles: Article[]; updated: number }
export function safeUrl(raw: string, base?: string): string | null {
  try { const u = new URL(raw, base); if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) return null; u.hash = ''; return u.href; } catch { return null; }
}
export function feedUrl(raw: string) {
  const url = safeUrl(raw.trim());
  if (!url || new URL(url).protocol !== 'https:' || url.length > 2000) throw new Error('Use a valid HTTPS RSS or Atom URL.');
  return url;
}
const plain = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code: string) => { const point = code[0]?.toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code); return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : ''; }).replace(/\s+/g, ' ').trim();
const children = (node: Element, name: string) => Array.from(node.children).filter(c => c.localName === name);
const text = (node: Element, name: string) => children(node, name)[0]?.textContent ?? '';
export function imageUrl(raw: string, base?: string): string | null {
  const url = safeUrl(raw, base);
  return url && url.startsWith('https://') && url.length <= 4000 ? url : null;
}
function feedImage(item: Element, base: string): string | undefined {
  const media = Array.from(item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', '*'));
  const candidates = [
    ...media.filter(node => node.localName === 'thumbnail').map(node => node.getAttribute('url')),
    ...media.filter(node => node.localName === 'content' && (node.getAttribute('medium') === 'image' || node.getAttribute('type')?.startsWith('image/') || /\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(node.getAttribute('url') ?? ''))).map(node => node.getAttribute('url')),
    ...children(item, 'enclosure').filter(node => node.getAttribute('type')?.startsWith('image/')).map(node => node.getAttribute('url')),
    ...children(item, 'link').filter(node => node.getAttribute('rel') === 'enclosure' && node.getAttribute('type')?.startsWith('image/')).map(node => node.getAttribute('href')),
  ];
  // Inspect only a URL string from feed HTML; never mount or execute that markup.
  for (const name of ['description', 'summary', 'encoded', 'content']) {
    const embedded = /<img\b[^>]*?\bsrc\s*=\s*(["'])(.*?)\1/i.exec(text(item, name))?.[2];
    if (embedded) candidates.push(embedded);
  }
  candidates.push(...Array.from(item.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'img')).map(node => node.getAttribute('src')));
  for (const candidate of candidates) { const url = candidate ? imageUrl(plain(candidate), base) : null; if (url) return url; }
  return undefined;
}
export function parseFeed(xml: string, url: string): Pick<Feed, 'title' | 'articles'> {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('This feed uses an unsupported XML declaration.');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('The address did not return valid RSS or Atom XML.');
  const root = doc.documentElement;
  const atom = root.localName === 'feed';
  const channel = atom ? root : children(root, 'channel')[0];
  if (!channel || (!atom && root.localName !== 'rss')) throw new Error('Use an RSS 2.0 or Atom feed URL, rather than a website page.');
  const title = plain(text(channel, 'title')).slice(0, 160) || new URL(url).hostname;
  const seen = new Set<string>();
  const articles = children(channel, atom ? 'entry' : 'item').flatMap(item => {
    const link = atom ? children(item, 'link').find(l => !l.getAttribute('rel') || l.getAttribute('rel') === 'alternate')?.getAttribute('href') : text(item, 'link');
    const articleUrl = link ? safeUrl(link.trim(), item.baseURI && /^https?:/.test(item.baseURI) ? item.baseURI : url) : null;
    if (!articleUrl || seen.has(articleUrl)) return [];
    seen.add(articleUrl);
    const date = Date.parse(text(item, atom ? 'published' : 'pubDate') || text(item, 'updated'));
    return [{ image: feedImage(item, url), url: articleUrl, title: plain(text(item, 'title')).slice(0, 300) || 'Untitled article', summary: plain(text(item, atom ? 'summary' : 'description')).slice(0, 400), date: Number.isFinite(date) ? date : null, source: title }];
  }).sort((a, b) => (b.date ?? 0) - (a.date ?? 0)).slice(0, 20);
  return { title, articles };
}
export function parseArticle(raw: unknown): Article | null {
  if (!raw || typeof raw !== 'object') return null;
  const a = raw as Partial<Article>;
  const url = typeof a.url === 'string' ? safeUrl(a.url) : null;
  if (!url || typeof a.title !== 'string' || typeof a.source !== 'string') return null;
  return { ...(typeof a.image === 'string' && imageUrl(a.image) ? { image: imageUrl(a.image)! } : {}), url, title: plain(a.title).slice(0, 300), source: plain(a.source).slice(0, 160), summary: typeof a.summary === 'string' ? plain(a.summary).slice(0, 400) : '', date: typeof a.date === 'number' && Number.isFinite(a.date) && Math.abs(a.date) < 8.64e15 ? a.date : null };
}
export function parseStoredFeed(raw: unknown): Feed | null {
  if (!raw || typeof raw !== 'object') return null;
  const f = raw as Partial<Feed>;
  if (typeof f.id !== 'string' || !/^[a-z0-9-]{1,100}$/i.test(f.id) || typeof f.url !== 'string' || !safeUrl(f.url) || !f.url.startsWith('https://')) return null;
  return { id: f.id, url: f.url, title: typeof f.title === 'string' ? f.title.slice(0, 160) : new URL(f.url).hostname, updated: typeof f.updated === 'number' && Number.isFinite(f.updated) && f.updated >= 0 && f.updated < 8.64e15 ? f.updated : 0, articles: Array.isArray(f.articles) ? f.articles.map(parseArticle).filter((a): a is Article => !!a).slice(0, 20) : [] };
}
