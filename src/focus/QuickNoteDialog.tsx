import { useId, useState } from 'react';
import { Dialog } from '../components/Dialog';
import { useLocalValue } from '../local/useLocalValue';
import { useWorkspace, workspaceKey } from '../workspace/WorkspaceContext';
import { parseNote } from './model';
import { parseTabNote, tabNotesPrefix, type TabNote } from './tabNotes';
import css from './FocusPanel.module.css';
import styles from '../App.module.css';
export interface NoteTarget { url: string; title: string; }
export function QuickNoteDialog({ target, close }: { target?: NoteTarget; close: () => void }) {
  return target ? <LinkedNote target={target} close={close} /> : <GeneralNote close={close} />;
}
function NoteForm({ title, initial, ready, error, save, close, url }: { title: string; initial: string; ready: boolean; error: string; save: (text: string) => Promise<boolean>; close: () => void; url?: string }) {
  const [draft, setDraft] = useState<string | null>(null), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  const id = useId();
  function dismiss() { if (busy) return; if (draft !== null && !window.confirm('Discard unsaved note changes?')) return; close(); }
  return <Dialog title={title} close={dismiss}><form className={css.notes} data-unsaved={draft !== null} onSubmit={event => {
    event.preventDefault(); setBusy(true); void save(draft ?? initial).then(ok => { if (ok) { setDraft(null); setSaved(true); } }).finally(() => setBusy(false));
  }}>
    {url && <a href={url} target="_blank" rel="noreferrer" style={{ overflowWrap: 'anywhere' }}>{url}</a>}
    <label htmlFor={id}>{url ? 'Note for this page' : 'Workspace note'}</label><textarea autoFocus id={id} rows={8} maxLength={20000} readOnly={!ready || busy} value={draft ?? initial} onChange={e => { setDraft(e.target.value); setSaved(false); }} />
    <div className={css.actions}><button className={styles.primary} disabled={!ready || busy || draft === null}>{busy ? 'Saving…' : 'Save note'}</button><button type="button" disabled={busy} onClick={dismiss}>Close</button></div>
    {draft !== null && <small>Unsaved changes</small>}{saved && <p role="status">Note saved.</p>}{error && <p role="alert">{error}</p>}
  </form></Dialog>;
}
function GeneralNote({ close }: { close: () => void }) {
  const { workspace } = useWorkspace(), store = useLocalValue(workspaceKey('tabora.notes.v1', workspace), '', parseNote);
  return <NoteForm title="Quick note" initial={store.value} ready={store.ready} error={store.error} save={store.save} close={close} />;
}
function LinkedNote({ target, close }: { target: NoteTarget; close: () => void }) {
  const { workspace } = useWorkspace();
  const store = useLocalValue<TabNote | null>(workspaceKey(tabNotesPrefix, workspace) + encodeURIComponent(target.url), null, parseTabNote);
  return <NoteForm title={target.title || 'Page note'} url={target.url} initial={store.value?.text ?? ''} ready={store.ready} error={store.error} save={text => store.save({ url: target.url, title: target.title, text, updated: Date.now() })} close={close} />;
}
