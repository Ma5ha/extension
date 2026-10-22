import { useRef } from 'react';
import { CaretDown, Check, Broadcast } from '@phosphor-icons/react';
import type { Source } from './model';
import { SiteIcon } from '../components/SiteIcon';
import css from './SourcePicker.module.css';

function sourceSite(url?: string) {
  try { return new URL(url ?? '').hostname; } catch { return 'Chrome tab'; }
}

export function SourcePicker({ sources, selectedId, busy, select }: {
  sources: Source[]; selectedId?: number; busy: boolean; select: (id: string) => void;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  function close() {
    if (!disclosure.current) return;
    disclosure.current.open = false;
    (disclosure.current.firstElementChild as HTMLElement)?.focus();
  }
  return <details ref={disclosure} className={css.picker} onKeyDown={event => {
    if (event.key === 'Escape' && event.currentTarget.open) { event.preventDefault(); event.stopPropagation(); close(); }
  }}>
    <summary><Broadcast size={18} aria-hidden="true" /><span>Promijeni izvor</span><small>{sources.length}</small><CaretDown size={16} aria-hidden="true" /></summary>
    <div className={css.choices}>
      <p>Izaberi tab za kontrolu</p>
      <ul onKeyDown={event => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const index = buttons.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next]?.focus();
      }}>{sources.map(source => <li key={source.tab.id}>
        <button disabled={busy} aria-pressed={source.tab.id === selectedId} onClick={() => { select(String(source.tab.id)); close(); }}>
          <SiteIcon url={source.tab.url ?? ''} favIconUrl={source.tab.favIconUrl} size={24} />
          <span><strong>{source.tab.title || 'Tab bez naslova'}</strong><small>{sourceSite(source.tab.url)}{source.tab.mutedInfo?.muted ? ' · utišan' : ''}</small></span>
          {source.tab.id === selectedId && <Check size={18} aria-label="Izabran izvor" />}
        </button>
      </li>)}</ul>
    </div>
  </details>;
}
