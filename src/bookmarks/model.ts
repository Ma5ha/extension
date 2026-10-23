export interface Bookmark { id: string; title: string; url: string; created: number; folder?: string; editable?: boolean; parentId?: string; }
export function normalizeUrl(input: string): string {
  const text = input.trim();
  if (!text || text.length > 8192 || /\s/.test(text)) throw new Error('Enter a valid web address.');
  const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname) throw new Error('Use an HTTP or HTTPS address without credentials.');
  return url.href;
}
export function bookmarkHref(value: string): string | undefined {
  try { return normalizeUrl(value); } catch { return undefined; }
}
export function flattenBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[], path: string[] = [], managed = false): Bookmark[] {
  return nodes.flatMap(node => {
    const locked = managed || node.unmodifiable === 'managed';
    if (node.url) return [{ id: node.id, title: node.title || node.url, url: node.url, created: node.dateAdded ?? 0, parentId: node.parentId, folder: path.join(' / '), editable: !locked }];
    return flattenBookmarks(node.children ?? [], node.title ? [...path, node.title] : path, locked);
  });
}

export interface BookmarkFolder { id: string; title: string; path: string; ancestors: string[]; editable: boolean; }
export function flattenFolders(nodes: chrome.bookmarks.BookmarkTreeNode[], ancestors: string[] = [], path: string[] = [], managed = false): BookmarkFolder[] {
  return nodes.flatMap(node => {
    if (node.url) return [];
    const locked = managed || node.unmodifiable === 'managed';
    const nextPath = node.title ? [...path, node.title] : path;
    const self = node.parentId !== undefined ? [{ id: node.id, title: node.title || 'Untitled folder', path: nextPath.join(' / '), ancestors, editable: !locked }] : [];
    return [...self, ...flattenFolders(node.children ?? [], [...ancestors, node.id], nextPath, locked)];
  });
}
