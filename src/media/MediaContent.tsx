import type { CSSProperties } from 'react';
import { ArrowsClockwise, Headphones, Play, Pause, SpeakerHigh, ArrowSquareOut, PictureInPicture, SpeakerSlash, ArrowUpRight, ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react';
import { openSource } from './adapter';
import { sitePattern } from './model';
import { useMediaPlayer } from './MediaContext';
import { SourcePicker } from './SourcePicker';
import { SiteIcon } from '../components/SiteIcon';
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
    {!windowPlayer.pipWindow && <button aria-label={windowPlayer.opening ? 'Otvaram izdvojene kontrole' : 'Izdvoji kontrole'} title={windowPlayer.supported ? 'Izdvoji kontrole iznad drugih prozora' : 'Izdvojeni prozor nije podržan'} disabled={!windowPlayer.supported || windowPlayer.opening} onClick={event => void player.detach(event.currentTarget)}><ArrowSquareOut size={18} /></button>}
  </>;
  return <section className={`${styles.panel} ${media.panel} ${compact ? media.compact : ''}`} aria-label="Mediji">
    <header className={styles.panelHeader}><h2><Headphones size={22} aria-hidden="true" />Mediji</h2><button className={media.iconButton} aria-label="Osvježi izvore" title="Osvježi izvore" disabled={busy || state === 'preview'} onClick={() => void perform(refresh)}><ArrowsClockwise size={18} /></button></header>
    {windowPlayer.error && <p role="status">{windowPlayer.error}</p>}
    {state === 'preview' && <div className={media.empty}><p>Kontrole su dostupne u Chrome ekstenziji.</p><small>Pokreni medij u drugom tabu, pa izaberi izvor.</small></div>}
    {state === 'loading' && <p role="status">Tražim izvore…</p>}
    {state === 'permission' && <><p>Dozvoli pregled naslova i adresa tabova da izabereš izvor.</p><button disabled={busy} onClick={() => void perform(player.enable)}>Omogući pregled tabova</button></>}
    {state === 'error' && <p role="status">Lista nije dostupna. Pokušaj osvježavanje.</p>}
    {state === 'ready' && !source && <div className={media.empty}><p>Nema aktivnog izvora.</p><small>Pokreni medij u drugom tabu, pa osvježi. Pauzirani izvori se otkrivaju na sajtovima kojima odobriš pristup.</small></div>}
    {source && <>
      <div className={media.nowPlaying}><span className={media.artwork}><SiteIcon url={source.tab.url || ''} favIconUrl={source.tab.favIconUrl} size={32} /></span><div className={media.sourceText}>
        <small>{item && source.status === 'ready' ? item.ended ? 'Završeno' : item.paused ? 'Pauzirano' : 'Reprodukuje se' : 'Kontrola taba'}{source.tab.mutedInfo?.muted ? ' · tab utišan' : item?.muted ? ' · player utišan' : ''}</small>
        <strong className={media.sourceTitle}>{source.tab.title || 'Medijski izvor'}</strong>
      </div></div>
      <SourcePicker sources={sources} selectedId={source.tab.id} busy={busy} select={player.selectSource} />
      {source.status === 'ready' && item && <>
        <div className={media.playback}><div className={media.transport}>
          {[-10, 10].map((delta, index) => <button key={delta} className={index === 0 ? media.backward : media.forward} aria-label={delta < 0 ? 'Nazad 10 sekundi' : 'Naprijed 10 sekundi'} disabled={busy || !item.ranges.some(([a, b]) => item.time + delta >= a && item.time + delta <= b)} onClick={() => command({ type: 'seek', value: item.time + delta })}>{delta < 0 ? <ArrowCounterClockwise size={18} aria-hidden="true" /> : <ArrowClockwise size={18} aria-hidden="true" />}<span>10<span className={styles.srOnly}> sekundi</span></span></button>)}
          <button className={media.play} aria-label={item.paused || item.ended ? 'Pusti' : 'Pauziraj'} disabled={busy} onClick={() => command({ type: item.paused || item.ended ? 'play' : 'pause' })}>{item.paused || item.ended ? <Play size={22} weight="fill" /> : <Pause size={22} weight="fill" />}</button>
        </div>
        <div className={media.progress}><div className={media.timeline}><span>{mediaTime(item.time)}</span><span>{item.duration === null ? 'Uživo / nepoznato' : mediaTime(item.duration)}</span></div>
        <input style={{ '--range-fill': `${range && range[1] > range[0] ? Math.max(0, Math.min(100, (item.time - range[0]) / (range[1] - range[0]) * 100)) : 0}%` } as CSSProperties} aria-label="Pozicija reprodukcije" type="range" min={range?.[0] ?? 0} max={range?.[1] ?? 1} step="0.1" value={range ? item.time : 0} disabled={busy || !range || range[0] === range[1]} onChange={event => command({ type: 'seek', value: Number(event.target.value) })} /></div>
        </div>
      </>}
      <div className={media.controls} aria-label="Kontrole izvora">
        {source.status === 'ready' && item && <label className={media.volume}><span className={media.volumeLabel}><SpeakerHigh size={17} aria-hidden="true" /><span className={styles.srOnly}>Jačina · </span>{Math.round(item.volume * 100)}%</span><input style={{ '--range-fill': `${item.volume * 100}%` } as CSSProperties} aria-label="Jačina playera" type="range" min="0" max="1" step="0.05" value={item.volume} disabled={busy} onChange={event => command({ type: 'volume', value: Number(event.target.value) })} /></label>}
        <div className={media.actions}>
          <button title={source.tab.mutedInfo?.muted ? 'Uključi zvuk taba' : 'Utišaj tab'} aria-label={source.tab.mutedInfo?.muted ? 'Uključi zvuk taba' : 'Utišaj tab'} aria-pressed={!!source.tab.mutedInfo?.muted} disabled={busy} onClick={() => void perform(() => chrome.tabs.update(source.tab.id!, { muted: !source.tab.mutedInfo?.muted }))}>{source.tab.mutedInfo?.muted ? <SpeakerSlash size={18} /> : <SpeakerHigh size={18} />}</button>
          <button title="Otvori tab" aria-label="Otvori tab" disabled={busy} onClick={() => void perform(() => openSource(source.tab.id!))}><ArrowUpRight size={18} /></button>
          {source.status === 'ready' && item?.kind === 'Video' && <button title={item.pipActive ? 'Sakrij video' : 'Prikaži video'} aria-label={item.pipActive ? 'Sakrij video' : 'Prikaži video'} aria-pressed={item.pipActive} disabled={busy || (!item.pipAvailable && !item.pipActive)} onClick={() => command({ type: item.pipActive ? 'pip-exit' : 'pip-enter' })}><PictureInPicture size={18} /></button>}
          {viewButtons}
        </div>
      </div>
      {item?.kind === 'Video' && !item.pipAvailable && !item.pipActive && <p className={styles.meta}>Video prikaz nije dostupan. Koristi izvorni tab.</p>}

      {source.status === 'permission' && <><p>Odobri pristup ovom sajtu za play/pause, jačinu i video prikaz.</p><button disabled={busy || !sitePattern(source.tab.url)} onClick={() => void player.grant(source.tab.url)}>Dozvoli kontrole: {sitePattern(source.tab.url)}</button></>}
      {source.status === 'discarded' && <p>Chrome je odbacio tab iz memorije. Otvori ga i ponovo osvježi izvore.</p>}
      {source.status === 'unavailable' && <p>Player ili pristup stranici nije dostupan. Otvori izvorni tab ili osvježi listu.</p>}
      {source.status === 'ready' && !item && <p>Nema dostupnog HTML playera. Medij može biti u nedostupnom okviru ili koristiti drugi sistem. Otvori izvorni tab.</p>}
    </>}
    {message && <p role="status">{message}</p>}
    {!source && <div className={media.presentations}>{viewButtons}</div>}
    {(state === 'ready' || source) && <details className={media.help}><summary>Izvori, dozvole i pomoć</summary>
      {candidates.length > 0 && <label>Dodaj pauzirani izvor<select disabled={busy} value="" onChange={event => { const tab = candidates.find(t => String(t.id) === event.target.value); if (tab) void player.grant(tab.url); }}><option value="">Izaberi tab i odobri pristup…</option>{candidates.map(t => <option key={t.id} value={t.id}>{t.title || 'Bez naslova'}</option>)}</select></label>}
      {source?.status === 'ready' && <button disabled={busy} onClick={() => void perform(() => chrome.permissions.remove({ origins: [sitePattern(source.tab.url)!] }))}>Ukini pristup ovom sajtu</button>}
      <p className={styles.meta}>Kontrole utiču samo na izabrani izvor. Utišavanje taba ne pauzira reprodukciju. Video se prikazuje u zasebnom Chrome prozoru gdje ga sajt podržava. Chrome smjenjuje video i izdvojene kontrole u PiP prikazu.</p>
      <p className={styles.meta}>Izvorni tab mora ostati otvoren. Zatvaranje izdvojenih kontrola vraća panel; zatvaranje Tabore zatvara njen prozor kontrola. Nema automatskog puštanja ili pauziranja drugih izvora.</p>
      {!!source?.frames && <p className={styles.meta}>Pristup glavnom sajtu ne odobrava pristup svim okvirima sa videom.</p>}
    </details>}
  </section>;
}
