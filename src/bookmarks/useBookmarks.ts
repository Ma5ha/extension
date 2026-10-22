import { useCallback, useEffect, useRef, useState } from 'react';
import { BookmarkAccessError, loadBookmarkData, moveBookmark, openBookmarkGroup, removeBookmark, requestBookmarks, saveBookmark, subscribeBookmarks } from './adapter';
import type { Bookmark, BookmarkFolder } from './model';
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'denied'>('loading');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false), generation = useRef(0);
  const refresh = useCallback(async () => {
    const run = ++generation.current;
    try { const result = await loadBookmarkData(); if (run === generation.current) { setBookmarks(result.bookmarks); setFolders(result.folders); setStatus('ready'); setError(''); } }
    catch (e) { if (run === generation.current) { setBookmarks([]); setFolders([]); setStatus(e instanceof BookmarkAccessError ? 'denied' : 'error'); setError(e instanceof BookmarkAccessError ? '' : 'Could not load Chrome bookmarks. Try again.'); } }
  }, []);
  useEffect(() => {
    const version = generation;
    const unsubscribe = subscribeBookmarks(() => void refresh()); void refresh();
    return () => { ++version.current; unsubscribe(); };
  }, [refresh]);
  async function save(title: string, url: string, previous?: Bookmark, parentId?: string) {
    if (lock.current) return false; lock.current = true; setBusy(true); setError('');
    try { await saveBookmark(title, url, previous, parentId); await refresh(); return true; }
    catch { await refresh(); setError('The change did not finish. Check the name and folder before trying again.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  async function remove(bookmark: Bookmark) {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    try { await removeBookmark(bookmark); await refresh(); }
    catch { setError('Could not remove the bookmark. Try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function enable() {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    try { if (await requestBookmarks()) await refresh(); else setStatus('denied'); }
    catch { setError('Chrome bookmark access was not granted. Try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function move(bookmark: Bookmark, parentId: string) {
    if (lock.current) return; lock.current = true; setBusy(true);
    try { await moveBookmark(bookmark, parentId); await refresh(); } catch { await refresh(); setError('Could not move the bookmark. Check the destination folder.'); } finally { lock.current = false; setBusy(false); }
  }
  async function openGroup(items: Bookmark[]) {
    if (lock.current) return ''; lock.current = true; setBusy(true);
    try { const r = await openBookmarkGroup(items); return `Opened: ${r.opened}. Skipped: ${r.skipped}. Failed: ${r.failed}.`; }
    catch { return 'Could not finish opening the folder. Some tabs may already be open.'; }
    finally { lock.current = false; setBusy(false); }
  }
  return { bookmarks, folders, status, error, busy, refresh, save, remove, enable, move, openGroup };
}
