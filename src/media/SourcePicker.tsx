import { Check } from '@phosphor-icons/react';
import type { Source } from './model';
import { MediaArtwork } from './MediaArtwork';
import css from './SourcePicker.module.css';

function sourceSite(url?: string) {
  try { return new URL(url ?? '').hostname; } catch { return 'Chrome tab'; }
}

export function SourcePicker({ sources, selectedId, busy, select }: {
  sources: Source[]; selectedId?: number; busy: boolean; select: (id: string) => void;
}) {
  return <section className={css.picker} aria-label="Source playlist">
    <div className={css.heading}><span>Playlist</span><small>{sources.length} {sources.length === 1 ? 'source' : 'sources'}</small></div>
    <div className={css.choices}>
      <ul onKeyDown={event => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const index = buttons.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next]?.focus();
      }}>{sources.map(source => <li key={source.tab.id}>
        <button disabled={busy} aria-pressed={source.tab.id === selectedId} onClick={() => select(String(source.tab.id))}>
          <MediaArtwork artwork={source.items[0]?.artwork} url={source.tab.url || ''} favicon={source.tab.favIconUrl} small />
          <span><strong>{source.items[0]?.title || source.tab.title || 'Untitled tab'}</strong><small>{sourceSite(source.tab.url)}{source.tab.mutedInfo?.muted ? ' · muted' : ''}</small></span>
          {source.tab.id === selectedId && <Check size={18} aria-label="Selected source" />}
        </button>
      </li>)}</ul>
    </div>
  </section>;
}
