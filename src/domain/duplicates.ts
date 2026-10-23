import { webOrigin, type Tab } from './tabs';
export interface DuplicateGroup { url: string; tabs: Tab[] }
export function duplicateGroups(tabs: Tab[]): DuplicateGroup[] {
  const groups = new Map<string, Tab[]>();
  for (const tab of tabs) {
    if (!webOrigin(tab.url)) continue;
    groups.set(tab.url, [...(groups.get(tab.url) ?? []), tab]);
  }
  return [...groups].filter(([, values]) => values.length > 1).map(([url, values]) => ({ url, tabs: values }));
}
