import { useState, type ReactNode } from 'react';
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, useDroppable, closestCorners, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, Browser, CalendarDots, Stack, NotePencil, BookmarkSimple, EnvelopeSimple, Headphones, Clock, Rss, Terminal } from '@phosphor-icons/react';
import { placeWidget, widgetNames, type Layout, type WidgetId, type Column } from './layout';
import css from './WidgetBoard.module.css';

const sectionIdentity = {
  tabs: { label: 'Browser', icon: Browser },
  agenda: { label: 'Daily plan', icon: CalendarDots },
  sessions: { label: 'Saved for later', icon: Stack },
  focus: { label: 'Daily tools', icon: NotePencil },
  bookmarks: { label: 'Your library', icon: BookmarkSimple },
  gmail: { label: 'Mail', icon: EnvelopeSimple },
  music: { label: 'Listening', icon: Headphones },
  clock: { label: 'At a glance', icon: Clock },
  news: { label: 'Your headlines', icon: Rss },
  console: { label: 'Developer tools', icon: Terminal },
} as const;

export function SectionDragProvider({ children, layout, update }: { children: ReactNode; layout: Layout; update: (layout: Layout) => Promise<void> }) {
  const [active, setActive] = useState<WidgetId | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  function clear() { setActive(null); setOver(null); }
  function finish(event: DragEndEvent) {
    const target = event.over;
    if (target && event.active.id !== target.id) {
      const id = event.active.id as WidgetId;
      const column = target.data.current?.column as Column | undefined;
      if (column) {
        const targetId = target.data.current?.widget as WidgetId | undefined;
        const sourceIndex = layout.items.findIndex(item => item.id === id);
        const targetIndex = layout.items.findIndex(item => item.id === targetId);
        const sameColumn = layout.items[sourceIndex]?.column === column;
        const after = targetId && (sameColumn ? sourceIndex < targetIndex : (event.active.rect.current.translated?.top ?? 0) > target.rect.top + target.rect.height / 2);
        const next = targetId && after ? layout.items.slice(targetIndex + 1).find(item => item.column === column && item.id !== id)?.id : targetId;
        void update(placeWidget(layout, id, column, next));
      }
    }
    clear();
  }
  function hover(event: DragOverEvent) { setOver(event.over ? String(event.over.id) : null); }
  return <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={event => setActive(event.active.id as WidgetId)} onDragOver={hover} onDragEnd={finish} onDragCancel={clear} accessibility={{ screenReaderInstructions: { draggable: 'Press Space to pick up a section. Use arrow keys to move it, Space to drop, or Escape to cancel.' } }}>
    <div className={css.dragContents} data-section-dragging={!!active} data-section-over={over ?? ''}>{children}</div>
    <DragOverlay dropAnimation={null}>{active ? <div className={css.dragPreview}><DotsSixVertical size={20} />{widgetNames[active]}</div> : null}</DragOverlay>
  </DndContext>;
}

function SortableSection({ id, column, children, controls, height }: { id: WidgetId; column: Column; children: ReactNode; controls: ReactNode; height: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging, over } = useSortable({ id, data: { column, widget: id } });
  const { label, icon: Icon } = sectionIdentity[id];
  return <div ref={setNodeRef} data-widget={id} className={css.draggableSection} data-drag-source={isDragging} data-drop-before={over?.id === id && !isDragging} data-height={height} style={{ transform: CSS.Transform.toString(transform), transition }}>
    <div className={css.sectionToolbar}>
      <span className={css.sectionIdentity}><Icon size={14} aria-hidden="true" /><span>{label}</span></span>
      <button ref={setActivatorNodeRef} className={css.dragGrip} {...attributes} {...listeners} aria-label={`Move ${widgetNames[id]}`} title="Drag to move"><DotsSixVertical size={16} aria-hidden="true" /></button>
      {controls}
    </div>{children}
  </div>;
}

export function SectionOrder({ layout, widgets, editing, update, column }: { layout: Layout; widgets: Partial<Record<WidgetId, ReactNode>>; editing: boolean; update: (layout: Layout) => Promise<void>; column: Column }) {
  const visible = layout.items.filter(item => item.column === column && widgets[item.id]);
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column}`, data: { column } });
  function move(id: WidgetId, before?: WidgetId, destination: Column = column) { void update(placeWidget(layout, id, destination, before)); }
  return <div ref={setNodeRef} className={css.dropColumn} data-column={column} data-over={isOver}>
    <SortableContext items={visible.map(item => item.id)} strategy={verticalListSortingStrategy}>
      {visible.map((item, index) => <SortableSection key={item.id} id={item.id} column={column} height={item.height} controls={editing && <div className={css.orderActions}>
        <button disabled={index === 0} aria-label={`Move ${widgetNames[item.id]} up`} onClick={() => move(item.id, visible[index - 1]!.id)}>↑</button>
        <button disabled={index === visible.length - 1} aria-label={`Move ${widgetNames[item.id]} down`} onClick={() => move(item.id, visible[index + 2]?.id)}>↓</button>
        <select aria-label={`Column for ${widgetNames[item.id]}`} value={column} onChange={event => move(item.id, undefined, event.target.value as Column)}>{['left', 'center', 'right'].map(value => <option key={value} value={value}>{value}</option>)}</select>
        <select aria-label={`Height for ${widgetNames[item.id]}`} value={item.height} onChange={event => void update({ ...layout, items: layout.items.map(p => p.id === item.id ? { ...p, height: event.target.value as typeof p.height } : p) })}><option value="auto">Natural height</option><option value="medium">At least 360 px</option><option value="tall">At least 560 px</option></select>
      </div>}>{widgets[item.id]}</SortableSection>)}
    </SortableContext>
    <div className={css.dropEnd}>{visible.length === 0 ? 'Drag a section here' : 'Drop here to move to the end'}</div>
  </div>;
}
