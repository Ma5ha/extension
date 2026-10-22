export const widgetIds = ['agenda', 'focus', 'tabs', 'sessions', 'bookmarks', 'gmail', 'music', 'clock'] as const;
export type WidgetId = typeof widgetIds[number];
export type Column = 'left' | 'center' | 'right';
export type WidgetHeight = 'auto' | 'medium' | 'tall';
export interface Placement { id: WidgetId; column: Column; height: WidgetHeight; }
export interface Layout { items: Placement[]; widths: Record<Column, number>; }
export const widgetNames: Record<WidgetId, string> = { agenda: 'Agenda', focus: 'Fokus i bilješke', tabs: 'Otvoreni tabovi', sessions: 'Sačuvane sesije', bookmarks: 'Chrome bookmarkovi', gmail: 'Gmail', music: 'Mediji', clock: 'Sat i dan' };
export const defaultLayout: Layout = {
  items: widgetIds.map(id => ({ id, column: id === 'agenda' || id === 'focus' ? 'left' : id === 'tabs' || id === 'sessions' ? 'center' : 'right', height: 'auto' })),
  widths: { left: .84, center: 2.1, right: 1.03 },
};
export function parseLayout(raw: unknown): Layout {
  if (!raw || typeof raw !== 'object') return defaultLayout;
  const value = raw as { items?: unknown; widths?: Partial<Record<Column, unknown>> };
  const seen = new Set<string>();
  const items: Placement[] = Array.isArray(value.items) ? value.items.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const p = item as Partial<Placement>;
    if (!widgetIds.includes(p.id as WidgetId) || seen.has(p.id!) || !['left', 'center', 'right'].includes(p.column!)) return [];
    seen.add(p.id!); return [{ id: p.id!, column: p.column!, height: p.height === 'medium' || p.height === 'tall' ? p.height : 'auto' }];
  }) : [];
  const widths = { ...defaultLayout.widths };
  for (const col of ['left', 'center', 'right'] as const) {
    const v = value.widths?.[col]; if (typeof v === 'number' && Number.isFinite(v)) widths[col] = Math.max(.6, Math.min(3, v));
  }
  return { items: [...items, ...defaultLayout.items.filter(p => !seen.has(p.id))], widths };
}
export function placeWidget(layout: Layout, id: WidgetId, column: Column, before?: WidgetId): Layout {
  const current = layout.items.find(p => p.id === id); if (!current || before === id) return layout;
  const items = layout.items.filter(p => p.id !== id);
  const index = before ? items.findIndex(p => p.id === before && p.column === column) : -1;
  items.splice(index < 0 ? items.length : index, 0, { ...current, column });
  return { ...layout, items };
}
export function shiftWidget(layout: Layout, id: WidgetId, direction: -1 | 1): Layout {
  const current = layout.items.find(p => p.id === id); if (!current) return layout;
  const column = layout.items.filter(p => p.column === current.column), i = column.findIndex(p => p.id === id), target = column[i + direction];
  if (!target) return layout;
  const items = [...layout.items], a = items.findIndex(p => p.id === id), b = items.findIndex(p => p.id === target.id);
  [items[a], items[b]] = [items[b]!, items[a]!]; return { ...layout, items };
}
