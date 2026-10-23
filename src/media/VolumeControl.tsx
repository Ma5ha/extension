import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { useMediaPlayer } from './MediaContext';
import { MediaSlider } from './MediaSlider';
import css from './MediaPanel.module.css';

export function VolumeControl() {
  const { source, item, busy, command, perform } = useMediaPlayer();
  if (!source) return null;
  const muted = !!source.tab.mutedInfo?.muted || !!item?.muted;
  function toggle() {
    if (!source) return;
    if (source.tab.mutedInfo?.muted || !item) void perform(() => chrome.tabs.update(source.tab.id!, { muted: !source.tab.mutedInfo?.muted }));
    else command({ type: 'mute', value: !item.muted });
  }
  return <div className={css.volumeControl} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); event.currentTarget.querySelector('button')?.focus(); } }}>
    <button className={css.iconButton} title={muted ? 'Unmute' : 'Mute'} aria-label={muted ? 'Unmute source' : 'Mute source'} aria-pressed={muted} disabled={busy} onClick={toggle}>{muted ? <SpeakerSlash size={20} /> : <SpeakerHigh size={20} />}</button>
    {source.status === 'ready' && item && <div className={css.volumePopover}><MediaSlider key={`${source.tab.id}:${item.documentId}:${item.id}`} label="Player volume" min={0} max={1} step={0.01} value={item.volume} disabled={busy} commit={value => command({ type: 'volume', value })}>{value => <output>{Math.round(value * 100)}%</output>}</MediaSlider></div>}

  </div>;
}
