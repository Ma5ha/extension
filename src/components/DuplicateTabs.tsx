import { useRef, useState } from 'react';
import { Dialog } from './Dialog';
import { duplicateGroups } from '../domain/duplicates';
import { closeDuplicates } from '../adapters/duplicates';
import type { Tab } from '../domain/tabs';
import styles from '../App.module.css';
import css from './DuplicateTabs.module.css';
export function DuplicateTabs({ tabs, close, refresh }: { tabs: Tab[]; close: () => void; refresh: () => void }) {
  const [groups] = useState(() => duplicateGroups(tabs));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [finished, setFinished] = useState(false);
  const lock = useRef(false);
  async function confirm() {
    if (lock.current || !selected.size) return;
    lock.current = true; setBusy(true);
    try { const result = await closeDuplicates(groups, selected); setMessage(`Closed: ${result.closed}. Changed or protected tabs skipped: ${result.skipped}. Failed: ${result.failed}.`); setFinished(true); setSelected(new Set()); }
    catch { setMessage('Could not finish. Refresh the tab list and review again.'); }
    finally { lock.current = false; setBusy(false); refresh(); }
  }
  return <Dialog title="Review duplicate tabs" close={() => { if (!busy) close(); }}><div className={css.content}>
    <p>Exact web addresses in this window, including query and fragment. Choose tabs to close; keep at least one per address. Active and pinned tabs are protected.</p>
    {!groups.length && <p>No duplicate web tabs in this window.</p>}
    {!finished && groups.map(group => <fieldset key={group.url}><legend>{group.tabs.length} copies</legend><p className={css.url}>{group.url}</p>{group.tabs.map(tab => {
      const locked = tab.active || tab.pinned || (!selected.has(tab.id) && group.tabs.filter(t => !selected.has(t.id)).length <= 1);
      return <label key={tab.id}><input type="checkbox" checked={selected.has(tab.id)} disabled={busy || locked} onChange={event => setSelected(previous => { const next = new Set(previous); if (event.target.checked) next.add(tab.id); else next.delete(tab.id); return next; })} /><span>{tab.title}<small>{tab.pinned ? 'Pinned · kept' : tab.active ? 'Active · kept' : `Tab ${tab.id}`}</small></span></label>;
    })}</fieldset>)}
    {message && <p role="status">{message}</p>}<div className={styles.dialogActions}>{!finished && <button disabled={busy || !selected.size} onClick={() => void confirm()}>Close selected ({selected.size})</button>}<button disabled={busy} onClick={close}>{finished ? 'Done' : 'Cancel'}</button></div>
  </div></Dialog>;
}
