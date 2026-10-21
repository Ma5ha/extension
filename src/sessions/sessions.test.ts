import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('../adapters/chrome', () => ({ isExtension: true, getTabs: async () => ({ windowId: 7, tabs: [{ id: 1, windowId: 7, title: 'Existing', url: 'https://a.test/', pinned: false, groupId: -1, active: false }] }) }));
import { parseSession, snapshotTabs, type SavedSession } from './model';
import { restoreSession, saveSession, loadSessions } from './adapter';
afterEach(() => vi.unstubAllGlobals());
const session: SavedSession = { id: 's', name: 'Project', created: 1, tabs: [{ title: 'A', url: 'https://a.test/', pinned: false }, { title: 'B', url: 'https://b.test/', pinned: true }, { title: 'C', url: 'https://c.test/', pinned: false }] };
describe('Session boundaries', () => {
  it('rejects executable stored URLs and filters internal or credentialed tabs', () => {
    expect(parseSession({ ...session, tabs: [{ title: 'Bad', url: 'javascript:alert(1)' }] })).toBeNull();
    expect(parseSession({ ...session, name: '' })).toBeNull();
    const tabs = ['https://example.com', 'chrome://newtab', 'https://user:pass@example.com'].map((url, id) => ({ id, windowId: 1, title: 'T', url, pinned: true, groupId: -1, active: false }));
    expect(snapshotTabs(tabs)).toEqual([{ title: 'T', url: 'https://example.com/', pinned: true }]);
  });
  it('skips existing URLs, restores pinning, and continues after a failed tab', async () => {
    const create = vi.fn().mockRejectedValueOnce(new Error('closed')).mockResolvedValue({}); vi.stubGlobal('chrome', { tabs: { create } });
    expect(await restoreSession(session)).toEqual({ opened: 1, skipped: 1, failed: 1 });
    expect(create.mock.calls[0]?.[0]).toEqual({ windowId: 7, url: 'https://b.test/', pinned: true, active: false });
    expect(create).toHaveBeenCalledTimes(2);
  });
  it('persists separate sessions without overwriting existing saved work', async () => {
    const values: Record<string, unknown> = {};
    vi.stubGlobal('chrome', { storage: { local: { set: async (data: object) => Object.assign(values, data), get: async () => values } } });
    await Promise.all([saveSession('First'), saveSession('Second')]);
    expect(await loadSessions()).toHaveLength(2);
  });
});
