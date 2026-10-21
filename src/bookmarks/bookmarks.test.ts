import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('../adapters/chrome', () => ({ isExtension: true }));
import { moveBookmark, openBookmarkGroup, loadBookmarks, removeBookmark, requestBookmarks, saveBookmark, subscribeBookmarks } from './adapter';
import { bookmarkHref, flattenBookmarks, flattenFolders, normalizeUrl } from './model';
afterEach(() => vi.unstubAllGlobals());
function mock() {
  const event = () => ({ addListener: vi.fn(), removeListener: vi.fn() });
  const bookmarks = { getTree: vi.fn().mockResolvedValue([{ id: '0', title: '', children: [{ id: '1', title: 'Bar', children: [{ id: '2', title: 'Example', url: 'https://example.com', dateAdded: 1 }] }] }]), create: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), move: vi.fn().mockResolvedValue({}), get: vi.fn().mockResolvedValue([{ id: '2', title: 'Example', url: 'https://example.com' }]), remove: vi.fn().mockResolvedValue(undefined), onCreated: event(), onChanged: event(), onRemoved: event(), onMoved: event(), onChildrenReordered: event(), onImportEnded: event() };
  const permissions = { contains: vi.fn().mockResolvedValue(true), request: vi.fn().mockResolvedValue(true), onAdded: event(), onRemoved: event() };
  vi.stubGlobal('chrome', { bookmarks, permissions }); return { bookmarks, permissions };
}
describe('Chrome bookmark integration', () => {
  it('rejects unsafe navigation but preserves all Chrome records, folder paths and managed state', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/');
    expect(bookmarkHref('javascript:alert(1)')).toBeUndefined();
    expect(bookmarkHref('https://user:pass@example.com')).toBeUndefined();
    const result = flattenBookmarks([{ id: '9', syncing: false, title: 'Managed', unmodifiable: 'managed', children: [{ id: '10', syncing: false, title: 'Script', url: 'javascript:alert(1)' }] }]);
    expect(result[0]).toMatchObject({ id: '10', folder: 'Managed', editable: false });
  });
  it('loads the existing Chrome tree without a local copy', async () => {
    const { bookmarks } = mock(); expect(await loadBookmarks()).toEqual([{ id: '2', title: 'Example', url: 'https://example.com', created: 1, parentId: undefined, folder: 'Bar', editable: true }]); expect(bookmarks.getTree).toHaveBeenCalledOnce();
  });
  it('requests optional permission and never reads the tree after rejection', async () => {
    const { permissions, bookmarks } = mock(); permissions.contains.mockResolvedValue(false); permissions.request.mockResolvedValue(false);
    expect(await requestBookmarks()).toBe(false); await expect(loadBookmarks()).rejects.toThrow(); expect(bookmarks.getTree).not.toHaveBeenCalled();
  });
  it('creates directly in Chrome default folder and updates the original node ID', async () => {
    const { bookmarks } = mock(); await saveBookmark('New', 'example.com');
    expect(bookmarks.create).toHaveBeenCalledWith({ title: 'New', url: 'https://example.com/' });
    await saveBookmark('Edited', 'example.com/new', { id: '2', title: 'Old', url: 'https://example.com', created: 1 });
    expect(bookmarks.update).toHaveBeenCalledWith('2', { title: 'Edited', url: 'https://example.com/new' });
  });
  it('removes only the selected real bookmark and refuses folders or managed nodes', async () => {
    const { bookmarks } = mock(); const b = { id: '2', title: 'Example', url: 'https://example.com', created: 1 };
    await removeBookmark(b); expect(bookmarks.remove).toHaveBeenCalledExactlyOnceWith('2'); bookmarks.remove.mockClear();
    bookmarks.get.mockResolvedValueOnce([{ id: '2', title: 'Folder' }]); await expect(removeBookmark(b)).rejects.toThrow();
    bookmarks.get.mockResolvedValueOnce([{ id: '2', title: 'Managed', url: b.url, unmodifiable: 'managed' }]); await expect(removeBookmark(b)).rejects.toThrow(); expect(bookmarks.remove).not.toHaveBeenCalled();
  });
  it('listens to Chrome edits, moves, removals and imports and cleans up', () => {
    const { bookmarks, permissions } = mock(); const refresh = vi.fn(); const stop = subscribeBookmarks(refresh);
    expect(bookmarks.onChanged.addListener).toHaveBeenCalledWith(refresh); expect(bookmarks.onMoved.addListener).toHaveBeenCalledWith(refresh);
    stop(); expect(bookmarks.onRemoved.removeListener).toHaveBeenCalledWith(refresh); expect(permissions.onAdded.removeListener).toHaveBeenCalledOnce();
  });
  it('keeps empty folders selectable and propagates managed ancestors', () => {
    const folders = flattenFolders([{ id: '0', title: '', syncing: false, children: [{ id: '1', parentId: '0', title: 'Locked', syncing: false, unmodifiable: 'managed', children: [{ id: '2', parentId: '1', title: 'Empty', syncing: false }] }] }]);
    expect(folders).toHaveLength(2); expect(folders[1]).toMatchObject({ id: '2', path: 'Locked / Empty', editable: false, ancestors: ['0', '1'] });
  });
  it('moves original bookmark into a real editable folder and rejects root', async () => {
    const { bookmarks } = mock(); const b = { id: '2', title: 'A', url: 'https://a.test', created: 1 };
    bookmarks.get.mockResolvedValue([{ id: '7', parentId: '1', title: 'Project' }]);
    await moveBookmark(b, '7'); expect(bookmarks.move).toHaveBeenCalledWith('2', { parentId: '7' });
    await expect(moveBookmark(b, '0')).rejects.toThrow();
  });
  it('opens only safe unique folder links and reports partial failures', async () => {
    mock(); const create = vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('closed'));
    Object.assign(chrome, { windows: { getCurrent: async () => ({ id: 7 }) }, tabs: { create } });
    const b = { id: '2', title: 'A', url: 'https://a.test', created: 1 };
    expect(await openBookmarkGroup([b, b, { ...b, url: 'javascript:alert(1)' }, { ...b, url: 'https://b.test' }])).toEqual({ opened: 1, skipped: 2, failed: 1 });
    expect(create).toHaveBeenCalledWith({ windowId: 7, url: 'https://a.test/', active: false });
  });

});
