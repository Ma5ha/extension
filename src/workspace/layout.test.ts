import { describe, expect, it } from 'vitest';
import { defaultLayout, parseLayout, placeWidget, shiftWidget, widgetIds } from './layout';
import { localDay, parseNote, parseTask } from '../focus/model';
describe('Workspace storage boundaries', () => {
  it('repairs incomplete and corrupt layouts without dropping or duplicating widgets', () => {
    const layout = parseLayout({ items: [{ id: 'tabs', column: 'left', height: 'tall' }, { id: 'tabs', column: 'right' }, { id: 'unknown', column: 'right' }], widths: { left: -1, center: Infinity, right: 20 } });
    expect(layout.items.map(p => p.id).sort()).toEqual([...widgetIds].sort());
    expect(layout.items[0]).toEqual({ id: 'tabs', column: 'left', height: 'tall' });
    expect(layout.widths).toEqual({ left: .6, center: defaultLayout.widths.center, right: 3 });
  });
  it('moves and orders cards without mutating the starting layout', () => {
    const before = JSON.stringify(defaultLayout); const layout = placeWidget(defaultLayout, 'bookmarks', 'left', 'agenda');
    expect(layout.items.filter(p => p.column === 'left').map(p => p.id)).toEqual(['bookmarks', 'agenda', 'focus']);
    expect(shiftWidget(layout, 'bookmarks', 1).items.filter(p => p.column === 'left').map(p => p.id)).toEqual(['agenda', 'bookmarks', 'focus']);
    expect(JSON.stringify(defaultLayout)).toBe(before);
  });
  it('keys daily tasks by the local date and validates stored note/task data', () => {
    expect(localDay(new Date(2026, 9, 21, 23, 59))).toBe('2026-10-21');
    expect(localDay(new Date(2026, 9, 22, 0, 1))).toBe('2026-10-22');
    expect(parseTask({ text: 3, done: 'true' })).toEqual({ text: '', done: false });
    expect(parseNote('a'.repeat(20001))).toHaveLength(20000);
  });
});
