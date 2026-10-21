import { isExtension } from '../adapters/chrome';
import { bookmarkHref, normalizeUrl, flattenBookmarks, flattenFolders, type Bookmark } from './model';
export class BookmarkAccessError extends Error {}
export async function requestBookmarks() {
  if (!isExtension) return false;
  return chrome.permissions.request({ permissions: ['bookmarks'] });
}
export async function loadBookmarkData() {
  if (!isExtension || !await chrome.permissions.contains({ permissions: ['bookmarks'] })) throw new BookmarkAccessError();
  const tree = await chrome.bookmarks.getTree();
  return { bookmarks: flattenBookmarks(tree), folders: flattenFolders(tree) };
}
export async function loadBookmarks(): Promise<Bookmark[]> { return (await loadBookmarkData()).bookmarks; }
export async function saveBookmark(title: string, input: string, previous?: Bookmark, parentId?: string): Promise<void> {
  const url = normalizeUrl(input);
  const changes = { title: title.trim() || new URL(url).hostname, url };
  if (previous) {
    if (previous.editable === false) throw new Error('managed');
    await chrome.bookmarks.update(previous.id, changes);
    if (parentId && parentId !== previous.parentId) await moveBookmark(previous, parentId);
  } else await chrome.bookmarks.create(parentId ? { ...changes, parentId } : changes);
}
export async function removeBookmark(bookmark: Bookmark) {
  const [live] = await chrome.bookmarks.get(bookmark.id);
  if (!live?.url || live.unmodifiable) throw new Error('Bookmark više nije dostupan ili se ne može mijenjati.');
  await chrome.bookmarks.remove(bookmark.id);
}
export function subscribeBookmarks(refresh: () => void) {
  if (!isExtension) return () => {};
  let detach = () => {};
  function attach() {
    detach();
    if (chrome.bookmarks) {
      const events = [chrome.bookmarks.onCreated, chrome.bookmarks.onChanged, chrome.bookmarks.onRemoved, chrome.bookmarks.onMoved, chrome.bookmarks.onChildrenReordered, chrome.bookmarks.onImportEnded];
      events.forEach(e => e.addListener(refresh));
      detach = () => events.forEach(e => e.removeListener(refresh));
    }
  }
  function permissionChanged() { attach(); refresh(); }
  attach();
  chrome.permissions.onAdded.addListener(permissionChanged);
  chrome.permissions.onRemoved.addListener(permissionChanged);
  return () => { detach(); chrome.permissions.onAdded.removeListener(permissionChanged); chrome.permissions.onRemoved.removeListener(permissionChanged); };
}

export async function moveBookmark(bookmark: Bookmark, parentId: string) {
  if (bookmark.editable === false || parentId === '0') throw new Error('managed');
  const [folder] = await chrome.bookmarks.get(parentId);
  if (!folder || folder.url || folder.unmodifiable || folder.parentId === undefined) throw new Error('folder');
  await chrome.bookmarks.move(bookmark.id, { parentId });
}
export async function openBookmarkGroup(bookmarks: Bookmark[]) {
  const current = await chrome.windows.getCurrent();
  if (current.id === undefined) throw new Error('window');
  let opened = 0, skipped = 0, failed = 0;
  const seen = new Set<string>();
  for (const bookmark of bookmarks) {
    const url = bookmarkHref(bookmark.url);
    if (!url || seen.has(url)) { skipped++; continue; }
    seen.add(url);
    try { await chrome.tabs.create({ windowId: current.id, url, active: false }); opened++; } catch { failed++; }
  }
  return { opened, skipped, failed };
}
