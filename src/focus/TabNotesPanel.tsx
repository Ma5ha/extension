import { useState } from 'react';
import { useLocalList } from '../local/useLocalList';
import { useWorkspace, workspaceKey } from '../workspace/WorkspaceContext';
import { bookmarkHref } from '../bookmarks/model';
import { parseTabNote, tabNotesPrefix } from './tabNotes';
import { QuickNoteDialog, type NoteTarget } from './QuickNoteDialog';
import type { Tab } from '../domain/tabs';
import styles from '../App.module.css';
import css from './TabNotesPanel.module.css';
export function TabNotesPanel({ tabs }: { tabs: Tab[] }) {
  const { workspace } = useWorkspace(), store = useLocalList(workspaceKey(tabNotesPrefix, workspace), parseTabNote);
  const [target, setTarget] = useState<NoteTarget | null>(null), [choice, setChoice] = useState('');
  const eligible = tabs.filter(tab => bookmarkHref(tab.url));
  const notes = store.items.filter(note => note.text.trim()).sort((a, b) => b.updated - a.updated);
  return <section className={styles.panel}><header className={styles.panelHeader}><h2>Page notes</h2><span className={styles.count}>{notes.length}</span></header><p>Notes stay linked to the exact page address, even after the tab closes.</p>
    <form className={css.picker} onSubmit={event => { event.preventDefault(); const tab = eligible.find(t => String(t.id) === choice); if (tab) setTarget(tab); }}><label>Open page<select aria-label="Page to annotate" value={choice} onChange={e => setChoice(e.target.value)}><option value="">Choose an open tab</option>{eligible.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label><button disabled={!eligible.some(t => String(t.id) === choice)}>Add page note</button></form>
    {!eligible.length && <small>Allow tab access in Work to choose a page.</small>}
    {!store.ready && !store.error && <p role="status">Loading page notes…</p>}{store.error && <p role="alert">{store.error}<button onClick={() => void store.refresh()}>Try again</button></p>}
    {store.ready && !notes.length && <p>No page notes yet. You can also use the note button beside an open tab.</p>}
    <ul className={css.notes}>{notes.map(note => <li key={note.url}><button onClick={() => setTarget(note)}><strong>{note.title}</strong><small>{note.url}</small><span>{note.text}</span></button><a href={note.url} target="_blank" rel="noreferrer">Open page</a></li>)}</ul>
    {target && <QuickNoteDialog target={target} close={() => setTarget(null)} />}
  </section>;
}
