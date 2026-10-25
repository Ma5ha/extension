export const navigationNames = ['Work', 'Bookmarks', 'Sessions', 'Notes', 'History', 'News', 'Music', 'Developer console'] as const;
export type NavigationName = typeof navigationNames[number];
export const defaultNavigation: NavigationName[] = [...navigationNames];
export function parseNavigation(raw: unknown): NavigationName[] {
  if (!Array.isArray(raw)) return [...defaultNavigation];
  return navigationNames.filter(name => name === 'Work' || raw.includes(name));
}
