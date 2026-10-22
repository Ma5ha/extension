import { useState } from 'react';
import { ArrowsClockwise, Headphones } from '@phosphor-icons/react';
import { allowSite, control, openSource } from './adapter';
import { sitePattern, type MediaCommand } from './model';
import { useMedia } from './useMedia';
import styles from '../App.module.css';
import media from './MediaPanel.module.css';

export function MediaPanel({ compact = false }: { compact?: boolean }) {
  const { sources, candidates, state, refresh, enable } = useMedia();
  const [selected, setSelected] = useState('');
  const [element, setElement] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const source = sources.find(s => String(s.tab.id) === selected) ?? sources[0];
  const key = (item: NonNullable<typeof source>['items'][number]) => `${item.documentId}:${item.id}`;
  const item = source?.items.find(i => key(i) === element) ?? source?.items[0];
  async function perform(action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await action(); }
    catch { setMessage('Radnja nije uspjela. Izvor je možda promijenjen, zatvoren ili nedostupan. Otvori tab ili osvježi listu.'); }
    finally { setBusy(false); await refresh(); }
  }
  function command(value: MediaCommand) { if (source && item) void perform(() => control(source, item, value)); }
  return <section className={`${styles.panel} ${media.panel} ${compact ? media.compact : ''}`} aria-label="Mediji">
    <header className={styles.panelHeader}><h2><Headphones size={22} />Mediji</h2><button className={compact ? media.iconButton : undefined} aria-label={compact ? 'Osvježi izvore' : undefined} title={compact ? 'Osvježi izvore' : undefined} disabled={busy || state === 'preview'} onClick={() => void perform(refresh)}>{compact ? <ArrowsClockwise size={17} /> : 'Osvježi'}</button></header>
    {!compact && <p className={styles.meta}>Daljinska kontrola postojećih tabova. Bez automatskog puštanja.</p>}
    {state === 'preview' && <div className={compact ? media.empty : undefined}><p>{compact ? 'Nema aktivnog izvora.' : 'Kontrole su dostupne u učitanoj Chrome ekstenziji.'}</p>{compact && <small>Kontrole su dostupne u Chrome ekstenziji.</small>}</div>}
    {state === 'loading' && <p role="status">Tražim izvore…</p>}
    {state === 'permission' && <><p>Dozvoli pregled naslova i adresa tabova da izabereš izvor.</p><button disabled={busy} onClick={() => void perform(enable)}>Omogući pregled tabova</button></>}
    {state === 'error' && <p role="status">Lista nije dostupna. Pokušaj osvježavanje.</p>}
    {state === 'ready' && !source && <div className={compact ? media.empty : undefined}><p>{compact ? 'Nema aktivnog izvora.' : 'Nema otkrivenih izvora. Pokreni medij u drugom tabu, pa osvježi. Pauzirani izvori se otkrivaju na sajtovima kojima odobriš pristup.'}</p>{compact && <small>Pokreni medij u drugom tabu, pa osvježi.</small>}</div>}
    {state === 'ready' && candidates.length > 0 && <details open={!compact} className={media.details}><summary>Izvori i dozvole</summary><label>Dodaj pauzirani izvor sa sajta<select disabled={busy} value="" onChange={e => { const tab = candidates.find(t => String(t.id) === e.target.value); if (tab) void perform(async () => { if (!await allowSite(tab.url)) setMessage('Pristup nije odobren.'); }); }}><option value="">Izaberi tab i odobri pristup…</option>{candidates.map(t => <option key={t.id} value={t.id}>{t.title || 'Bez naslova'}</option>)}</select></label></details>}
    {source && <>
      <label>Izvor<select value={String(source.tab.id)} onChange={e => { setSelected(e.target.value); setElement(''); setMessage(''); }}>{sources.map(s => <option key={s.tab.id} value={s.tab.id}>{s.tab.title || 'Tab bez naslova'}</option>)}</select></label>
      <p className={styles.meta}>{source.tab.mutedInfo?.muted ? 'Tab je utišan' : source.tab.audible ? 'Tab proizvodi zvuk' : 'Zvuk nije prijavljen'} · ovo nije play/pause stanje.</p>
      <div className={media.actions}><button disabled={busy} onClick={() => void perform(() => chrome.tabs.update(source.tab.id!, { muted: !source.tab.mutedInfo?.muted }))}>{source.tab.mutedInfo?.muted ? 'Uključi zvuk taba' : 'Utišaj tab'}</button><button disabled={busy} onClick={() => void perform(() => openSource(source.tab.id!))}>Otvori tab</button></div>
      {source.status === 'permission' && <><p>Za HTML audio/video kontrole odobri pristup ovom sajtu. Tabora čita stanje medija samo u browseru.</p><button disabled={busy || !sitePattern(source.tab.url)} onClick={() => void perform(async () => { if (!await allowSite(source.tab.url)) setMessage('Pristup nije odobren. Mute i otvaranje taba ostaju dostupni.'); })}>Dozvoli kontrole: {sitePattern(source.tab.url)}</button></>}
      {source.status === 'ready' && <button disabled={busy} onClick={() => void perform(() => chrome.permissions.remove({ origins: [sitePattern(source.tab.url)!] }))}>Ukini pristup ovom sajtu</button>}
      {source.status === 'discarded' && <p>Chrome je odbacio tab iz memorije. Otvori ga i ponovo osvježi izvore.</p>}
      {source.status === 'unavailable' && <p>Player ili pristup stranici nije dostupan. Dozvola je možda ukinuta. Koristi kontrole u izvornom tabu.</p>}
      {source.status === 'ready' && !item && <p>Nema dostupnog HTML playera. Medij može biti u nedostupnom iframe-u, zatvorenom shadow DOM-u ili koristiti drugi sistem. Otvori izvorni tab.</p>}
      {source.frames > 0 && <p className={styles.meta}>Stranica sadrži okvire. Pristup glavnom sajtu ne odobrava pristup svim iframe playerima.</p>}
      {item && source.status === 'ready' && <>
        {source.items.length > 1 && <label>Player u tabu<select value={key(item)} onChange={e => setElement(e.target.value)}>{source.items.map((i, index) => <option key={key(i)} value={key(i)}>{i.kind} {index + 1} · okvir {i.frameId}</option>)}</select></label>}
        <p>{item.ended ? 'Završeno' : item.paused ? 'Pauzirano' : 'Reprodukuje se'} · očitano iz playera{item.muted ? ' · player utišan' : ''}</p>
        <button disabled={busy} onClick={() => command({ type: item.paused || item.ended ? 'play' : 'pause' })}>{item.paused || item.ended ? 'Pusti' : 'Pauziraj'}</button>
        <label>Jačina playera · {Math.round(item.volume * 100)}%<input aria-label="Jačina playera" type="range" min="0" max="1" step="0.05" value={item.volume} disabled={busy} onChange={e => command({ type: 'volume', value: Number(e.target.value) })} /></label>
        <p className={styles.meta}>{Math.floor(item.time)} s / {item.duration === null ? 'Nepoznato trajanje ili live sadržaj' : `${Math.floor(item.duration)} s`}</p>
        <div className={media.actions}>{[-10, 10].map(delta => { const time = item.time + delta; return <button key={delta} disabled={busy || !item.ranges.some(([a, b]) => time >= a && time <= b)} onClick={() => command({ type: 'seek', value: time })}>{delta > 0 ? '+10 s' : '−10 s'}</button>; })}</div>
        {!item.ranges.length && <p className={styles.meta}>Premotavanje trenutno nije dostupno.</p>}
      </>}
    </>}
    {message && <p role="status">{message}</p>}
    <details open={!compact} className={media.help}><summary>O kontrolama medija</summary><p className={styles.meta}>Kontrole utiču samo na izabrani izvor. Podrška zavisi od sajta; drugi tabovi i pozivi se ne pauziraju. Bez automatskog puštanja.</p></details>
  </section>;
}
