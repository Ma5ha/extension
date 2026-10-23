import type { CSSProperties, ReactNode } from 'react';
import { defaultLayout, type Column, type Layout, type WidgetId } from './layout';
import { SectionOrder } from './SectionOrder';
import css from './WidgetBoard.module.css';
const columns = { left: 'Left', center: 'Center', right: 'Right' } as const;
export function WidgetBoard({ layout, update, editing, widgets }: { layout: Layout; update: (layout: Layout) => Promise<void>; editing: boolean; widgets: Partial<Record<WidgetId, ReactNode>> }) {
  const activeColumns = (Object.keys(columns) as Column[]).filter(col => editing || layout.items.some(p => p.column === col && widgets[p.id]));
  return <div>
    {editing && <div className={css.editor}><p>Drag sections between columns. Space picks up a handle; arrow keys move it; Space drops and Escape cancels.</p><div className={css.widths}>{(Object.keys(columns) as Column[]).map(col => <label key={col}>Width: {columns[col]}<input type="range" min="0.6" max="3" step="0.1" value={layout.widths[col]} onChange={event => void update({ ...layout, widths: { ...layout.widths, [col]: Number(event.target.value) } })} /></label>)}<button onClick={() => void update(defaultLayout)}>Reset layout</button></div></div>}
    <div className={css.board} data-widget-board data-columns={activeColumns.length} style={{ '--grid-columns': activeColumns.map(col => `minmax(0, ${layout.widths[col]}fr)`).join(' ') } as CSSProperties}>
      {activeColumns.map(col => <SectionOrder key={col} column={col} layout={layout} update={update} editing={editing} widgets={widgets} custom />)}
    </div>
  </div>;
}
