import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeGroups } from './chrome';
import { planGroups, type Tab } from '../domain/tabs';

const tab = (id: number, host = 'a', patch: Partial<Tab> = {}): Tab => ({ id, title: `Tab ${id}`, url: `https://${host}.test/${id}`, windowId: 1, pinned: false, groupId: -1, active: false, ...patch });
afterEach(() => vi.unstubAllGlobals());
describe('Chrome grouping boundary', () => {
  it('mutates only approved eligible IDs and reports group-title failure separately', async () => {
    const approved = planGroups([tab(1), tab(2), tab(3)], 1);
    const live = [tab(1), tab(2), tab(3, 'elsewhere'), tab(4)];
    const group = vi.fn().mockResolvedValue(9);
    const update = vi.fn().mockRejectedValue(new Error('permission lost'));
    vi.stubGlobal('chrome', { tabs: { query: vi.fn().mockResolvedValue(live), group }, tabGroups: { update } });
    const result = await executeGroups(approved);
    expect(group).toHaveBeenCalledExactlyOnceWith({ tabIds: [1, 2], createProperties: { windowId: 1 } });
    expect(result).toEqual({ grouped: 2, groups: 1, failed: 0, changed: 1, unnamed: 1 });
  });
  it('continues after a group fails and accurately reports partial success', async () => {
    const live = [tab(1), tab(2), tab(3, 'b'), tab(4, 'b')];
    const group = vi.fn().mockRejectedValueOnce(new Error('tab closed')).mockResolvedValueOnce(10);
    vi.stubGlobal('chrome', { tabs: { query: vi.fn().mockResolvedValue(live), group }, tabGroups: { update: vi.fn().mockResolvedValue({}) } });
    expect(await executeGroups(planGroups(live, 1))).toEqual({ grouped: 2, groups: 1, failed: 2, changed: 0, unnamed: 0 });
  });
  it('skips tabs pinned between the preview and the final per-group check', async () => {
    const live = [tab(1), tab(2)];
    const query = vi.fn().mockResolvedValueOnce(live).mockResolvedValueOnce([tab(1, 'a', { pinned: true }), tab(2)]);
    const group = vi.fn();
    vi.stubGlobal('chrome', { tabs: { query, group } });
    expect(await executeGroups(planGroups(live, 1))).toEqual({ grouped: 0, groups: 0, failed: 0, changed: 2, unnamed: 0 });
    expect(group).not.toHaveBeenCalled();
  });
});
