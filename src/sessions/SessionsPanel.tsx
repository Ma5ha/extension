import { useId, useState } from 'react';
import { ArrowRight, DotsThree, Plus, Stack, Trash } from '@phosphor-icons/react';
import { Dialog } from '../components/Dialog';
import { useSessions } from './useSessions';
import type { SavedSession } from './model';
import styles from '../App.module.css';
import css from './SessionsPanel.module.css';

interface SessionsPanelProps {
  canSave: boolean;
  enable: () => void;
  compact?: boolean;
  onShowAll?: () => void;
}
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' });
const tabCount = (count: number) => `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'tab' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'taba' : 'tabova'}`;

export function SessionsPanel({ canSave, enable, compact = false, onShowAll }: SessionsPanelProps) {
  const { sessions, ready, busy, message, action, refresh } = useSessions();
  const headingId = useId(), nameId = useId();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<SavedSession | null>(null);
  const [removing, setRemoving] = useState<SavedSession | null>(null);
  const visibleSessions = compact ? sessions.slice(0, 2) : sessions;
  return <section className={`${styles.panel} ${css.panel} ${compact ? css.compact : ''}`} aria-labelledby={headingId}>
    <header className={css.header}>
      <h2 id={headingId}>Saved sessions {ready && <span className={css.count}>{sessions.length}</span>}</h2>
      {compact && onShowAll && <button className={css.showAll} onClick={onShowAll}>Show all <ArrowRight size={16} aria-hidden="true" /></button>}
    </header>
    {!compact && <p className={css.description}>Save your project tabs and pick up where you left off.</p>}
    {!canSave && <div className={css.permission}><p>Allow tab access to save and open sessions.</p><button onClick={enable}>Allow access</button></div>}
    {message && <p className={css.message} role="status">{message}</p>}
    {!ready && <div className={css.empty}><p>{message ? 'Saved sessions are currently unavailable.' : 'Loading sessions…'}</p>{message && <button onClick={() => void refresh()}>Try again</button>}</div>}
    {ready && sessions.length === 0 && <div className={css.empty}><Stack size={26} aria-hidden="true" /><p>No saved sessions yet.</p><small>Save your current tabs to return to them later.</small></div>}
    {visibleSessions.length > 0 && <ul className={css.list}>{visibleSessions.map(session => <li key={session.id} className={css.row}>
      <span className={css.icon}><Stack size={21} aria-hidden="true" /></span>
      <div className={css.summary}><strong title={session.name}>{session.name}</strong><small>{tabCount(session.tabs.length)} · {dateFormat.format(session.created)}</small></div>
      <button className={css.open} disabled={busy} aria-label={`Preview and open session ${session.name}`} onClick={() => setPreview(session)}>Otvori</button>
      <details className={css.more}>
        <summary aria-label={`Session options ${session.name}`} title="Session options"><DotsThree size={21} aria-hidden="true" /></summary>
        <div className={css.menu}><button disabled={busy} onClick={event => { event.currentTarget.closest('details')?.removeAttribute('open'); setRemoving(session); }}><Trash size={16} aria-hidden="true" />Remove session</button></div>
      </details>
    </li>)}</ul>}
    {!creating && <button className={css.save} disabled={!ready || busy} onClick={() => setCreating(true)}><Plus size={17} aria-hidden="true" />Save session</button>}
    {creating && <form className={css.form} onSubmit={event => {
      event.preventDefault();
      void action('save', name).then(ok => { if (ok) { setName(''); setCreating(false); } });
    }}>
      <label htmlFor={nameId}>Session name</label>
      <input id={nameId} value={name} onChange={event => setName(event.target.value)} maxLength={100} required placeholder="Project, learning…" />
      <div className={css.actions}><button disabled={!ready || !canSave || busy || !name.trim()} className={styles.primary}>Save tabs</button><button type="button" disabled={busy} onClick={() => setCreating(false)}>Cancel</button></div>
    </form>}
    {preview && <Dialog title={preview.name} close={() => setPreview(null)}>
      <div className={css.preview}><p>This will open up to {tabCount(preview.tabs.length)} in the current window. Addresses already open will be skipped.</p>
        <ul>{preview.tabs.map((tab, index) => <li key={`${tab.url}-${index}`}><strong>{tab.title}</strong><small>{tab.url}</small></li>)}</ul>
        {!canSave && <button onClick={enable}>Allow tab access</button>}
        <div className={css.actions}><button className={styles.primary} disabled={busy || !canSave} onClick={() => void action('restore', preview).then(ok => { if (ok) setPreview(null); })}>Open session</button><button disabled={busy} onClick={() => setPreview(null)}>Cancel</button></div>
        {message && <p role="status">{message}</p>}
      </div>
    </Dialog>}
    {removing && <Dialog title="Remove saved session?" close={() => setRemoving(null)}>
      <div className={css.preview}><p>Sesija „{removing.name}” will be removed. Open tabs will stay open.</p>
        <div className={css.actions}><button disabled={busy} onClick={() => void action('remove', removing).then(ok => { if (ok) setRemoving(null); })}>Confirm removal</button><button disabled={busy} onClick={() => setRemoving(null)}>Cancel</button></div>
        {message && <p role="status">{message}</p>}
      </div>
    </Dialog>}
  </section>;
}
