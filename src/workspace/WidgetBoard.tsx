import { useRef, type CSSProperties, type ReactNode } from 'react';
import { defaultLayout, placeWidget, shiftWidget, widgetNames, type Column, type Layout, type WidgetId } from './layout';
import css from './WidgetBoard.module.css';
const columns = { left: 'Lijevo', center: 'Sredina', right: 'Desno' } as const;
export function WidgetBoard({ layout, update, editing, widgets }: { layout: Layout; update: (layout: Layout) => Promise<void>; editing: boolean; widgets: Partial<Record<WidgetId, ReactNode>> }) {
  const dragged = useRef<WidgetId | null>(null);
  const activeColumns = (Object.keys(columns) as Column[]).filter(col => editing || layout.items.some(p => p.column === col && widgets[p.id]));
  return <div>
    {editing && <div className={css.editor}><p>Prevuci widget za ručku ili koristi kolonu i strelice. Visina je najmanja visina; sadržaj se uvijek prikazuje cijeli.</p><div className={css.widths}>{(Object.keys(columns) as Column[]).map(col => <label key={col}>Širina: {columns[col]}<input type="range" min="0.6" max="3" step="0.1" value={layout.widths[col]} onChange={event => void update({ ...layout, widths: { ...layout.widths, [col]: Number(event.target.value) } })} /></label>)}<button onClick={() => void update(defaultLayout)}>Vrati početni raspored</button></div></div>}
    <div className={css.board} data-widget-board data-columns={activeColumns.length} style={{ '--grid-columns': activeColumns.map(col => `minmax(0, ${layout.widths[col]}fr)`).join(' '), '--left-width': `${layout.widths.left}fr`, '--center-width': `${layout.widths.center}fr`, '--right-width': `${layout.widths.right}fr` } as CSSProperties}>
      {activeColumns.map(col => <div key={col} className={css.column} data-editing={editing} onDragOver={event => { if (editing && dragged.current) event.preventDefault(); }} onDrop={event => {
        event.preventDefault(); if (editing && dragged.current) void update(placeWidget(layout, dragged.current, col)); dragged.current = null;
      }}>
        {editing && <p className={css.columnName}>{columns[col]}</p>}
        {layout.items.filter(p => p.column === col && widgets[p.id]).map(p => <div key={p.id} className={css.widget} data-height={p.height} onDragOver={event => { if (editing && dragged.current) event.preventDefault(); }} onDrop={event => {
          if (editing && dragged.current) { event.preventDefault(); event.stopPropagation(); void update(placeWidget(layout, dragged.current, col, p.id)); dragged.current = null; }
        }}>
          {editing && <div className={css.controls}><span draggable onDragStart={event => { dragged.current = p.id; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', p.id); }} onDragEnd={() => dragged.current = null} className={css.handle} title="Prevuci widget">⠿ {widgetNames[p.id]}</span>
            <div><button aria-label={`Pomjeri ${widgetNames[p.id]} gore`} onClick={() => void update(shiftWidget(layout, p.id, -1))}>↑</button><button aria-label={`Pomjeri ${widgetNames[p.id]} dolje`} onClick={() => void update(shiftWidget(layout, p.id, 1))}>↓</button>
            <label><span className={css.srOnly}>Kolona: {widgetNames[p.id]}</span><select aria-label={`Kolona: ${widgetNames[p.id]}`} value={p.column} onChange={event => void update(placeWidget(layout, p.id, event.target.value as Column))}>{(Object.keys(columns) as Column[]).map(c => <option key={c} value={c}>{columns[c]}</option>)}</select></label>
            <label><span className={css.srOnly}>Visina: {widgetNames[p.id]}</span><select aria-label={`Visina: ${widgetNames[p.id]}`} value={p.height} onChange={event => void update({ ...layout, items: layout.items.map(item => item.id === p.id ? { ...item, height: event.target.value as typeof p.height } : item) })}><option value="auto">Prirodna visina</option><option value="medium">Najmanje 360 px</option><option value="tall">Najmanje 560 px</option></select></label></div>
          </div>}{widgets[p.id]}
        </div>)}
      </div>)}
    </div>
  </div>;
}
