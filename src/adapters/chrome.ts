import { planGroups, revalidatePlan, type GroupPlan, type Tab } from '../domain/tabs';

export const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime?.id;
export type Access = 'tabs' | 'tabGroups';

export async function hasAccess(permission: Access): Promise<boolean> {
  return isExtension && chrome.permissions.contains({ permissions: [permission] });
}

export async function requestAccess(permissions: Access[]): Promise<boolean> {
  return isExtension && chrome.permissions.request({ permissions });
}

export async function getTabs(): Promise<{ tabs: Tab[]; windowId: number }> {
  const window = await chrome.windows.getCurrent();
  if (window.id === undefined) throw new Error('window');
  const tabs = await chrome.tabs.query({ windowId: window.id });
  return {
    windowId: window.id,
    tabs: tabs.filter(t => t.id !== undefined).map(t => ({
      id: t.id!, windowId: t.windowId, title: t.title || 'Bez naslova',
      url: t.pendingUrl || t.url || '', pinned: t.pinned, groupId: t.groupId, active: t.active,
    })),
  };
}

export async function activateTab(tab: Tab) {
  const current = await chrome.tabs.get(tab.id);
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(current.windowId, { focused: true });
}

export function subscribeTabs(refresh: () => void) {
  chrome.tabs.onCreated.addListener(refresh);
  chrome.tabs.onRemoved.addListener(refresh);
  chrome.tabs.onUpdated.addListener(refresh);
  chrome.tabs.onMoved.addListener(refresh);
  chrome.tabs.onAttached.addListener(refresh);
  chrome.tabs.onDetached.addListener(refresh);
  chrome.tabs.onActivated.addListener(refresh);
  chrome.permissions.onAdded.addListener(refresh);
  chrome.permissions.onRemoved.addListener(refresh);
  return () => {
    chrome.tabs.onCreated.removeListener(refresh);
    chrome.tabs.onRemoved.removeListener(refresh);
    chrome.tabs.onUpdated.removeListener(refresh);
    chrome.tabs.onMoved.removeListener(refresh);
    chrome.tabs.onAttached.removeListener(refresh);
    chrome.tabs.onDetached.removeListener(refresh);
    chrome.tabs.onActivated.removeListener(refresh);
    chrome.permissions.onAdded.removeListener(refresh);
    chrome.permissions.onRemoved.removeListener(refresh);
  };
}

export interface GroupResult { grouped: number; groups: number; failed: number; changed: number; unnamed: number }
export async function executeGroups(approved: GroupPlan): Promise<GroupResult> {
  const result: GroupResult = { grouped: 0, groups: 0, failed: 0, changed: 0, unnamed: 0 };
  const live = await chrome.tabs.query({ windowId: approved.windowId });
  const current: Tab[] = live.filter(t => t.id !== undefined).map(t => ({
    id: t.id!, windowId: t.windowId, title: t.title ?? '', url: t.pendingUrl || t.url || '',
    pinned: t.pinned, groupId: t.groupId, active: t.active,
  }));
  const validated = revalidatePlan(approved, current);
  const count = (plan: GroupPlan) => plan.groups.reduce((n, g) => n + g.tabs.length, 0);
  result.changed = count(approved) - count(validated);
  for (const group of validated.groups) {
    // Narrow the race window again before each mutation.
    const fresh = await chrome.tabs.query({ windowId: approved.windowId });
    const ids = new Set(group.tabs.map(t => t.id));
    const eligible = planGroups(fresh.filter(t => t.id !== undefined && ids.has(t.id)).map(t => ({
      id: t.id!, windowId: t.windowId, title: t.title ?? '', url: t.pendingUrl || t.url || '',
      pinned: t.pinned, groupId: t.groupId, active: t.active,
    })), approved.windowId).groups.find(g => g.origin === group.origin);
    const tabIds = eligible?.tabs.map(t => t.id) ?? [];
    result.changed += group.tabs.length - tabIds.length;
    if (tabIds.length < 2) continue;
    try {
      const id = await chrome.tabs.group({ tabIds: tabIds as [number, ...number[]], createProperties: { windowId: approved.windowId } });
      result.grouped += tabIds.length;
      result.groups++;
      try { await chrome.tabGroups.update(id, { title: group.origin, color: 'blue' }); }
      catch { result.unnamed++; }
    } catch { result.failed += tabIds.length; }
  }
  return result;
}
