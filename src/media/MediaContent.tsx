import { ArrowsClockwise, Headphones, Play, Pause, ArrowSquareOut, PictureInPicture, ArrowUpRight, ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react';
import { openSource } from './adapter';
import { sitePattern } from './model';
import { useMediaPlayer } from './MediaContext';
import { SourcePicker } from './SourcePicker';
import { MediaArtwork } from './MediaArtwork';
import { MediaSlider } from './MediaSlider';
import { VolumeControl } from './VolumeControl';
import styles from '../App.module.css';
import media from './MediaPanel.module.css';

function mediaTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600), minutes = Math.floor(total / 60) % 60;
  return `${hours ? `${hours}:${String(minutes).padStart(2, '0')}` : minutes}:${String(total % 60).padStart(2, '0')}`;
}
export function MediaContent({ compact = false, detached = false }: { compact?: boolean; detached?: boolean }) {
  const player = useMediaPlayer();
  const { sources, candidates, state, source, item, busy, message, perform, command, refresh } = player;
  const windowPlayer = player.playerWindow;
  const range = item?.ranges.find(([start, end]) => item.time >= start && item.time <= end);
  const viewButtons = <>
    {!detached && <button title="Mini-player" aria-label="Mini-player" onClick={event => player.float(event.currentTarget)}><PictureInPicture size={18} /><span className={styles.srOnly}>Mini-player</span></button>}
    {!windowPlayer.pipWindow && <button aria-label={windowPlayer.opening ? 'Opening detached controls' : 'Detach controls'} title={windowPlayer.supported ? 'Detach controls above other windows' : 'Detached window is not supported'} disabled={!windowPlayer.supported || windowPlayer.opening} onClick={event => void player.detach(event.currentTarget)}><ArrowSquareOut size={18} /></button>}
  </>;
  return <section className={`${styles.panel} ${media.panel} ${compact ? media.compact : ''}`} data-detached={detached} aria-label="Media">
    <header className={styles.panelHeader}><h2><Headphones size={20} aria-hidden="true" />Media</h2><div className={media.headerTools}>{source && !detached && <SourcePicker sources={sources} selectedId={source.tab.id} busy={busy} select={player.selectSource} />}<button className={media.iconButton} aria-label="Refresh sources" title="Refresh sources" disabled={busy || state === 'preview'} onClick={() => void perform(refresh)}><ArrowsClockwise size={18} /></button></div></header>
    {windowPlayer.error && <p role="status">{windowPlayer.error}</p>}
    {state === 'preview' && <div className={media.empty}><p>Controls are available in the Chrome extension.</p><small>Play media in another tab, then choose a source.</small></div>}
    {state === 'loading' && <p role="status">Finding sources…</p>}
    {state === 'permission' && <><p>Allow tab title and address access to choose a source.</p><button disabled={busy} onClick={() => void perform(player.enable)}>Allow tab access</button></>}
    {state === 'error' && <div className={media.empty} role="status"><p>Chrome did not return the source list. Try again.</p><button disabled={busy} onClick={() => void perform(refresh)}>Retry discovery</button></div>}
    {state === 'ready' && !source && <div className={media.empty}><p>No active source.</p><small>Choose a source tab below. Paused media can be detected after you allow access to its site.</small></div>}
    {state === 'ready' && candidates.length > 0 && <details className={media.help} open={!source}>
      <summary>{source ? 'Add another source' : 'Choose a source tab'}</summary>
      <p className={styles.meta}>Choose a tab to detect its player, including paused media. Site access is requested only if needed.</p>
      <div className={media.candidateList}>{candidates.map(tab => <button key={tab.id} disabled={busy} onClick={() => void player.grant(tab.url)}>{tab.title || 'Untitled tab'}</button>)}</div>
    </details>}
    {source && <>
      <MediaArtwork artwork={item?.artwork} url={source.tab.url || ''} favicon={source.tab.favIconUrl} />
      <div className={media.sourceText}>
        <strong className={media.sourceTitle}>{item?.title || source.tab.title || 'Media source'}</strong>
        <small>{item && source.status === 'ready' ? item.ended ? 'Ended' : item.paused ? 'Paused' : 'Playing' : 'Tab controls'}{source.tab.mutedInfo?.muted ? ' · tab muted' : item?.muted ? ' · muted' : ''}</small>
      </div>
      {source.status === 'ready' && item && <>
        <div className={media.playback}><div className={media.transport}>
          {[-10, 10].map((delta, index) => <button key={delta} className={index === 0 ? media.backward : media.forward} aria-label={delta < 0 ? 'Back 10 seconds' : 'Forward 10 seconds'} disabled={busy || !item.ranges.some(([a, b]) => item.time + delta >= a && item.time + delta <= b)} onClick={() => command({ type: 'seek', value: item.time + delta })}>{delta < 0 ? <ArrowCounterClockwise size={18} aria-hidden="true" /> : <ArrowClockwise size={18} aria-hidden="true" />}<span>10<span className={styles.srOnly}> seconds</span></span></button>)}
          <button className={media.play} aria-label={item.paused || item.ended ? 'Play' : 'Pause'} disabled={busy} onClick={() => command({ type: item.paused || item.ended ? 'play' : 'pause' })}>{item.paused || item.ended ? <Play size={18} weight="fill" /> : <Pause size={18} weight="fill" />}</button>
        </div>
        <div className={media.seekControl}>
          <MediaSlider key={`${source.tab.id}:${item.documentId}:${item.id}`} label="Playback position" min={range?.[0] ?? 0} max={range?.[1] ?? 1} step={0.1} value={range ? item.time : 0} disabled={busy || !range || range[0] === range[1]} commit={value => command({ type: 'seek', value })}>{value => <div className={media.timeline}><span>{mediaTime(range ? value : item.time)}</span><span>{item.duration === null ? 'Duration unavailable' : mediaTime(item.duration)}</span></div>}</MediaSlider>
        </div>
        </div>
      </>}
      <div className={media.controls} aria-label="Source controls">
        <VolumeControl />
        {detached && <SourcePicker sources={sources} selectedId={source.tab.id} busy={busy} select={player.selectSource} />}
        <div className={media.actions}>
          <button title="Open tab" aria-label="Open tab" disabled={busy} onClick={() => void perform(() => openSource(source.tab.id!))}><ArrowUpRight size={18} /></button>
          {source.status === 'ready' && item?.kind === 'Video' && <button title={item.pipActive ? 'Hide video' : 'Show video'} aria-label={item.pipActive ? 'Hide video' : 'Show video'} aria-pressed={item.pipActive} disabled={busy || (!item.pipAvailable && !item.pipActive)} onClick={() => command({ type: item.pipActive ? 'pip-exit' : 'pip-enter' })}><PictureInPicture size={18} /></button>}
          {viewButtons}
        </div>
      </div>


      {source.status === 'permission' && <><p>Allow access to this site for playback, volume and video controls.</p><button disabled={busy || !sitePattern(source.tab.url)} onClick={() => void player.grant(source.tab.url)}>Allow controls: {sitePattern(source.tab.url)}</button></>}
      {source.status === 'discarded' && <p>Chrome unloaded this tab. Open it and refresh sources.</p>}
      {source.status === 'unavailable' && <p>The player or page is unavailable. Open the source tab or refresh the list.</p>}
      {source.status === 'ready' && !item && <p>No HTML player is available. Media may be in an inaccessible frame or use another system. Open the source tab.</p>}
    </>}
    {message && <p role="status">{message}</p>}
    {!source && <div className={media.presentations}>{viewButtons}</div>}
    {(state === 'ready' || source) && <details className={media.help}><summary>Sources, permissions and help</summary>

      {source?.status === 'ready' && <button disabled={busy} onClick={() => void perform(() => chrome.permissions.remove({ origins: [sitePattern(source.tab.url)!] }))}>Revoke site access</button>}
      <p className={styles.meta}>Controls affect only the selected source. Muting a tab does not pause playback. Video appears in a separate Chrome window when supported by the site. Chrome switches between video and detached controls in Picture-in-Picture.</p>
      <p className={styles.meta}>The source tab must stay open. Closing detached controls returns to the panel; closing Tabora closes its controls window. Other sources are never played or paused automatically.</p>
      {!!source?.frames && <p className={styles.meta}>Access to the main site does not grant access to every video frame.</p>}
    </details>}
  </section>;
}
