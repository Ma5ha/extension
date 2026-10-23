import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, CalendarBlank, Check, NotePencil, Plus } from '@phosphor-icons/react';
import { TaskReminder } from './TaskReminder';
import { useWorkspace, workspaceKey } from '../workspace/WorkspaceContext';
import { Dialog } from '../components/Dialog';
import { useLocalValue } from '../local/useLocalValue';
import { localDay, parseNote, parseTask } from './model';
import styles from '../App.module.css';
import css from './FocusPanel.module.css';

function DailyTask({ day, index }: { day: string; index: number }) {
  const { workspace } = useWorkspace();
  const store = useLocalValue(workspaceKey(`tabora.focus.v1.${day}.${index}`, workspace), { text: '', done: false }, parseTask);
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputId = useId();
  async function save() {
    const text = (draft ?? store.value.text).trim();
    setBusy(true);
    if (await store.save({ text, done: Boolean(text) && store.value.done })) setDraft(null);
    setBusy(false);
  }
  return <div className={css.task} aria-busy={busy}>
    <label className={css.checkbox}><input aria-label={`Completed task ${index + 1}`} type="checkbox" checked={store.ready && store.value.done} disabled={!store.ready || busy || !store.value.text} onChange={event => {
      setBusy(true); void store.save({ ...store.value, done: event.target.checked }).finally(() => setBusy(false));
    }} /></label>
    <form data-unsaved={draft !== null} onSubmit={event => { event.preventDefault(); void save(); }}>
      <label className={styles.srOnly} htmlFor={inputId}>Task {index + 1}</label>
      <input id={inputId} maxLength={200} value={draft ?? (store.ready ? store.value.text : '')} disabled={!store.ready || busy} onChange={event => setDraft(event.target.value)} onKeyDown={event => {
        if (event.key === 'Escape' && draft !== null) { event.preventDefault(); setDraft(null); }
      }} placeholder={`Task ${index + 1}`} data-done={store.ready && store.value.done} />
      {draft !== null && <button className={css.saveTask} disabled={busy} type="submit" aria-label={`Save task ${index + 1}`} title="Save task (Enter)"><Check size={17} /></button>}
    </form>
    {store.ready && <TaskReminder day={day} index={index} text={store.value.text} done={store.value.done} />}
    {store.error && <p className={css.error} role="alert">{store.error}<button onClick={() => void store.refresh()}>Try again</button></p>}
  </div>;
}

export function FocusPanel({ compact = false }: { compact?: boolean }) {
  const { workspace } = useWorkspace();
  const [day, setDay] = useState(() => localDay(new Date()));
  const notes = useLocalValue(workspaceKey('tabora.notes.v1', workspace), '', parseNote);
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const tasksRef = useRef<HTMLDivElement>(null);
  const titleId = useId(), notesTitleId = useId(), notesInputId = useId();
  const noteText = draft ?? (notes.ready ? notes.value : '');
  useEffect(() => {
    const sync = () => setDay(localDay(new Date()));
    const timer = window.setInterval(sync, 30_000); document.addEventListener('visibilitychange', sync);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', sync); };
  }, []);
  async function saveNote() {
    setBusy(true);
    if (await notes.save(draft ?? notes.value)) { setDraft(null); setSaved(true); }
    setBusy(false);
  }
  const editor = <form className={css.notes} data-unsaved={draft !== null} onSubmit={event => { event.preventDefault(); void saveNote(); }}>
    <label htmlFor={notesInputId}>Notes</label>
    <textarea id={notesInputId} rows={8} maxLength={20000} value={noteText} disabled={!notes.ready || busy} placeholder="Where did you leave off? What comes next?" onChange={event => { setDraft(event.target.value); setSaved(false); }} />
    <div className={css.actions}><button disabled={!notes.ready || busy || draft === null} className={styles.primary} type="submit">{busy ? 'Saving…' : 'Save note'}</button>{draft !== null && <button type="button" disabled={busy} onClick={() => { setDraft(null); setSaved(false); }}>Cancel</button>}</div>
    {draft !== null && <small>Unsaved changes</small>}{saved && <small role="status">Note saved.</small>}
    {notes.error && <p className={css.error} role="alert">{notes.error}<button type="button" onClick={() => void notes.refresh()}>Try again</button></p>}
  </form>;
  return <section data-unsaved={draft !== null} className={compact ? css.compact : `${styles.panel} ${css.standalone}`} aria-labelledby={titleId}>
    <div><header className={css.heading}><h2 id={titleId}>Today</h2><CalendarBlank size={20} aria-hidden="true" /></header>
      {!compact && <p className={css.meta}>Three tasks for today · {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(new Date(`${day}T12:00:00`))}</p>}
      <div className={css.tasks} ref={tasksRef}>{[0, 1, 2].map(index => <DailyTask key={`${day}-${index}`} day={day} index={index} />)}</div>
      {compact && <button className={css.addTask} title="Up to three tasks for today" onClick={() => {
        const inputs = [...(tasksRef.current?.querySelectorAll<HTMLInputElement>('input:not([type="checkbox"])') ?? [])];
        (inputs.find(input => !input.value.trim()) ?? inputs[0])?.focus();
      }}><Plus size={16} aria-hidden="true" />Add task</button>}
    </div>
    <section className={css.notesSection} aria-labelledby={notesTitleId}><header className={css.heading}><h2 id={notesTitleId}>Notes <ArrowUpRight size={15} aria-hidden="true" /></h2>{compact && <button className={css.textAction} onClick={() => setEditorOpen(true)} aria-haspopup="dialog">Show all</button>}</header>
      {compact ? <><button className={css.preview} onClick={() => setEditorOpen(true)} aria-label="Open note" aria-haspopup="dialog">{noteText.trim() ? <span className={css.previewText}>{noteText}</span> : <span className={css.emptyNote}><NotePencil size={20} aria-hidden="true" />{notes.ready ? 'Capture a thought or your next step.' : 'Loading note…'}</span>}<small>{draft !== null ? 'Unsaved changes' : 'Local note'}</small></button>{notes.error && !editorOpen && <p className={css.error} role="alert">{notes.error}<button type="button" onClick={() => void notes.refresh()}>Try again</button></p>}</> : editor}
    </section>
    {compact && editorOpen && <Dialog title="Notes" close={() => setEditorOpen(false)}>{editor}</Dialog>}
  </section>;
}
