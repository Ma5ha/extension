export interface Tab {
  id: number;
  windowId: number;
  title: string;
  url: string;
  pinned: boolean;
  groupId: number;
  active: boolean;
}

export interface OriginGroup { origin: string; tabs: Tab[] }
export interface GroupPlan {
  windowId: number;
  groups: OriginGroup[];
  skipped: { pinned: number; grouped: number; unsupported: number; single: number };
}

export function webOrigin(url: string): string | null {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.origin : null;
  } catch { return null; }
}

export function byOrigin(tabs: Tab[]): OriginGroup[] {
  const groups = new Map<string, Tab[]>();
  for (const tab of tabs) {
    const key = webOrigin(tab.url) ?? 'Interne i ostale stranice';
    groups.set(key, [...(groups.get(key) ?? []), tab]);
  }
  return [...groups].map(([origin, tabs]) => ({ origin, tabs }));
}

export function planGroups(tabs: Tab[], windowId: number): GroupPlan {
  const skipped = { pinned: 0, grouped: 0, unsupported: 0, single: 0 };
  const eligible = tabs.filter(tab => {
    if (tab.windowId !== windowId) return false;
    if (tab.pinned) { skipped.pinned++; return false; }
    if (tab.groupId !== -1) { skipped.grouped++; return false; }
    if (!webOrigin(tab.url)) { skipped.unsupported++; return false; }
    return true;
  });
  const groups = byOrigin(eligible).filter(group => {
    if (group.tabs.length < 2) { skipped.single += group.tabs.length; return false; }
    return true;
  });
  return { windowId, groups, skipped };
}

// Revalidate only the approved tab IDs and origins; never absorb newly opened tabs.
export function revalidatePlan(plan: GroupPlan, current: Tab[]): GroupPlan {
  const allowed = new Map(plan.groups.flatMap(g => g.tabs.map(t => [t.id, g.origin] as const)));
  return planGroups(current.filter(t => allowed.get(t.id) === webOrigin(t.url)), plan.windowId);
}

export function rank<T extends { title: string; url: string }>(items: T[], query: string): T[] {
  const text = query.trim().toLocaleLowerCase();
  if (!text) return items;
  return items.map((item, index) => {
    const title = item.title.toLocaleLowerCase();
    const score = title.startsWith(text) ? 3 : title.includes(text) ? 2 : item.url.toLocaleLowerCase().includes(text) ? 1 : 0;
    return { item, score, index };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).map(r => r.item);
}
