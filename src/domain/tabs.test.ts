import { describe, expect, it } from 'vitest';
import { byOrigin, planGroups, rank, revalidatePlan, webOrigin, type Tab } from './tabs';

const tab = (id: number, url: string, patch: Partial<Tab> = {}): Tab => ({ id, url, title: `Tab ${id}`, windowId: 1, active: false, pinned: false, groupId: -1, ...patch });
describe('origin rules', () => {
  it('keeps protocol, subdomain and non-default port distinct', () => {
    expect(webOrigin('https://mail.google.com/a')).toBe('https://mail.google.com');
    expect(webOrigin('https://example.com:8443/a')).toBe('https://example.com:8443');
    expect(byOrigin([tab(1, 'http://example.com'), tab(2, 'https://example.com'), tab(3, 'https://example.com:8443')])).toHaveLength(3);
    for (const url of ['chrome://newtab', 'file:///tmp/a', 'javascript:alert(1)', 'not a url', 'chrome-extension://id/newtab.html']) expect(webOrigin(url)).toBeNull();
  });
  it('skips pinned, grouped, internal, single and other-window tabs without mutation', () => {
    const input = [tab(1, 'https://a.test/1'), tab(2, 'https://a.test/2'), tab(3, 'https://a.test', { pinned: true }), tab(4, 'https://a.test', { groupId: 7 }), tab(5, 'chrome://newtab'), tab(6, 'https://b.test'), tab(7, 'https://a.test', { windowId: 2 })];
    const before = structuredClone(input);
    const plan = planGroups(input, 1);
    expect(plan.groups.map(g => g.tabs.map(t => t.id))).toEqual([[1, 2]]);
    expect(plan.skipped).toEqual({ pinned: 1, grouped: 1, unsupported: 1, single: 1 });
    expect(input).toEqual(before);
  });
  it('does not absorb new tabs or navigated tabs while preview is open', () => {
    const initial = [tab(1, 'https://a.test/1'), tab(2, 'https://a.test/2'), tab(3, 'https://a.test/3')];
    const plan = planGroups(initial, 1);
    expect(revalidatePlan(plan, [initial[0]!, initial[1]!, tab(3, 'https://b.test'), tab(4, 'https://a.test')]).groups[0]?.tabs.map(t => t.id)).toEqual([1, 2]);
    expect(revalidatePlan(plan, [initial[0]!, tab(2, 'https://a.test', { pinned: true }), tab(3, 'https://a.test', { windowId: 2 })]).groups).toEqual([]);
  });
  it.each([0, 5, 50, 200])('handles %i tabs', count => {
    const input = Array.from({ length: count }, (_, i) => tab(i, `https://site-${i % 5}.test/${i}`));
    expect(byOrigin(input).flatMap(g => g.tabs)).toHaveLength(count);
  });
});
describe('local search', () => {
  it('ranks title prefix, title match and URL match in stable order', () => {
    const input = [{ title: 'Other', url: 'https://tabora.test' }, { title: 'My Tabora', url: 'https://a.test' }, { title: 'Tabora', url: 'https://b.test' }];
    expect(rank(input, 'TABORA').map(i => i.title)).toEqual(['Tabora', 'My Tabora', 'Other']);
    expect(rank(input, 'missing')).toEqual([]);
    expect(rank(input, '  ')).toEqual(input);
  });
});
