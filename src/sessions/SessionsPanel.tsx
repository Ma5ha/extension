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
const dateFormat = new Intl.DateTimeFormat('sr-Latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
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
      <h2 id={headingId}>Sačuvane sesije {ready && <span className={css.count}>{sessions.length}</span>}</h2>
      {compact && onShowAll && <button className={css.showAll} onClick={onShowAll}>Prikaži sve <ArrowRight size={16} aria-hidden="true" /></button>}
    </header>
    {!compact && <p className={css.description}>Sačuvaj tabove projekta i nastavi kasnije.</p>}
    {!canSave && <div className={css.permission}><p>Omogući pristup tabovima za čuvanje i otvaranje sesija.</p><button onClick={enable}>Omogući pristup</button></div>}
    {message && <p className={css.message} role="status">{message}</p>}
    {!ready && <div className={css.empty}><p>{message ? 'Sačuvane sesije trenutno nisu dostupne.' : 'Učitavanje sesija…'}</p>{message && <button onClick={() => void refresh()}>Pokušaj ponovo</button>}</div>}
    {ready && sessions.length === 0 && <div className={css.empty}><Stack size={26} aria-hidden="true" /><p>Još nema sačuvanih sesija.</p><small>Sačuvaj trenutne tabove da im se lako vratiš.</small></div>}
    {visibleSessions.length > 0 && <ul className={css.list}>{visibleSessions.map(session => <li key={session.id} className={css.row}>
      <span className={css.icon}><Stack size={21} aria-hidden="true" /></span>
      <div className={css.summary}><strong title={session.name}>{session.name}</strong><small>{tabCount(session.tabs.length)} · {dateFormat.format(session.created)}</small></div>
      <button className={css.open} disabled={busy} aria-label={`Pregledaj i otvori sesiju ${session.name}`} onClick={() => setPreview(session)}>Otvori</button>
      <details className={css.more}>
        <summary aria-label={`Opcije sesije ${session.name}`} title="Opcije sesije"><DotsThree size={21} aria-hidden="true" /></summary>
        <div className={css.menu}><button disabled={busy} onClick={event => { event.currentTarget.closest('details')?.removeAttribute('open'); setRemoving(session); }}><Trash size={16} aria-hidden="true" />Ukloni sesiju</button></div>
      </details>
    </li>)}</ul>}
    {!creating && <button className={css.save} disabled={!ready || busy} onClick={() => setCreating(true)}><Plus size={17} aria-hidden="true" />Sačuvaj sesiju</button>}
    {creating && <form className={css.form} onSubmit={event => {
      event.preventDefault();
      void action('save', name).then(ok => { if (ok) { setName(''); setCreating(false); } });
    }}>
      <label htmlFor={nameId}>Naziv sesije</label>
      <input id={nameId} value={name} onChange={event => setName(event.target.value)} maxLength={100} required placeholder="Projekat, učenje…" />
      <div className={css.actions}><button disabled={!ready || !canSave || busy || !name.trim()} className={styles.primary}>Sačuvaj tabove</button><button type="button" disabled={busy} onClick={() => setCreating(false)}>Odustani</button></div>
    </form>}
    {preview && <Dialog title={preview.name} close={() => setPreview(null)}>
      <div className={css.preview}><p>Otvoriće se do {tabCount(preview.tabs.length)} u trenutnom prozoru. Već otvorene adrese biće preskočene.</p>
        <ul>{preview.tabs.map((tab, index) => <li key={`${tab.url}-${index}`}><strong>{tab.title}</strong><small>{tab.url}</small></li>)}</ul>
        {!canSave && <button onClick={enable}>Omogući pristup tabovima</button>}
        <div className={css.actions}><button className={styles.primary} disabled={busy || !canSave} onClick={() => void action('restore', preview).then(ok => { if (ok) setPreview(null); })}>Otvori sesiju</button><button disabled={busy} onClick={() => setPreview(null)}>Odustani</button></div>
        {message && <p role="status">{message}</p>}
      </div>
    </Dialog>}
    {removing && <Dialog title="Ukloni sačuvanu sesiju?" close={() => setRemoving(null)}>
      <div className={css.preview}><p>Sesija „{removing.name}“ biće uklonjena. Otvoreni tabovi ostaju otvoreni.</p>
        <div className={css.actions}><button disabled={busy} onClick={() => void action('remove', removing).then(ok => { if (ok) setRemoving(null); })}>Potvrdi uklanjanje</button><button disabled={busy} onClick={() => setRemoving(null)}>Odustani</button></div>
        {message && <p role="status">{message}</p>}
      </div>
    </Dialog>}
  </section>;
}
