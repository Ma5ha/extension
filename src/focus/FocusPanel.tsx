import { useEffect, useState } from 'react';
import { useLocalValue } from '../local/useLocalValue';
import { localDay, parseNote, parseTask } from './model';
import styles from '../App.module.css';
import css from './FocusPanel.module.css';
function DailyTask({ day, index }: { day: string; index: number }) {
  const store = useLocalValue(`tabora.focus.v1.${day}.${index}`, { text: '', done: false }, parseTask);
  const [draft, setDraft] = useState<string | null>(null), [busy, setBusy] = useState(false);
  async function save() { setBusy(true); if (await store.save({ text: (draft ?? store.value.text).trim(), done: store.value.done })) setDraft(null); setBusy(false); }
  return <div className={css.task}>
    <input aria-label={`Završen zadatak ${index + 1}`} type="checkbox" checked={store.ready && store.value.done} disabled={!store.ready || busy || !store.value.text} onChange={event => { setBusy(true); void store.save({ ...store.value, done: event.target.checked }).finally(() => setBusy(false)); }} />
    <form onSubmit={event => { event.preventDefault(); void save(); }}><label className={styles.srOnly} htmlFor={`task-${index}`}>Zadatak {index + 1}</label><input id={`task-${index}`} maxLength={200} value={draft ?? (store.ready ? store.value.text : '')} disabled={!store.ready || busy} onChange={event => setDraft(event.target.value)} placeholder={`Zadatak ${index + 1}`} data-done={store.value.done} />{draft !== null && <button disabled={busy} type="submit">Sačuvaj</button>}</form>
    {store.error && <p role="alert">{store.error}<button onClick={() => void store.refresh()}>Pokušaj ponovo</button></p>}
  </div>;
}
export function FocusPanel() {
  const [day, setDay] = useState(() => localDay(new Date()));
  const notes = useLocalValue('tabora.notes.v1', '', parseNote);
  const [draft, setDraft] = useState<string | null>(null), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setDay(localDay(new Date())); const timer = window.setInterval(sync, 30_000); document.addEventListener('visibilitychange', sync);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', sync); };
  }, []);
  return <section className={styles.panel} aria-labelledby="focus-title"><header className={styles.panelHeader}><h2 id="focus-title">Fokus i bilješke</h2></header>
    <p className={styles.meta}>Tri zadatka za danas · {day}</p><div className={css.tasks}>{[0, 1, 2].map(index => <DailyTask key={`${day}-${index}`} day={day} index={index} />)}</div>
    <form className={css.notes} onSubmit={event => { event.preventDefault(); setBusy(true); void notes.save(draft ?? notes.value).then(ok => { if (ok) { setDraft(null); setSaved(true); } }).finally(() => setBusy(false)); }}>
      <label htmlFor="notes">Bilješke</label><textarea id="notes" rows={6} maxLength={20000} value={draft ?? (notes.ready ? notes.value : '')} disabled={!notes.ready || busy} placeholder="Gdje si stao? Šta je sljedeće?" onChange={event => { setDraft(event.target.value); setSaved(false); }} />
      <div className={css.actions}><button disabled={!notes.ready || busy || draft === null} className={styles.primary} type="submit">Sačuvaj bilješku</button>{draft !== null && <button type="button" disabled={busy} onClick={() => setDraft(null)}>Odustani</button>}</div>
      {draft !== null && <small>Nesačuvane izmjene</small>}{saved && <small role="status">Bilješka je sačuvana.</small>}
    </form>{notes.error && <p role="alert">{notes.error}<button onClick={() => void notes.refresh()}>Pokušaj ponovo</button></p>}
  </section>;
}
