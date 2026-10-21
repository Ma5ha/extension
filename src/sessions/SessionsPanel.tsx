import { useState } from 'react';
import { useSessions } from './useSessions';
import type { SavedSession } from './model';
import styles from '../App.module.css';
import css from './SessionsPanel.module.css';
export function SessionsPanel({ canSave, enable }: { canSave: boolean; enable: () => void }) {
  const { sessions, ready, busy, message, action, refresh } = useSessions();
  const [name, setName] = useState(''), [preview, setPreview] = useState<SavedSession | null>(null), [removing, setRemoving] = useState<string | null>(null);
  return <section className={styles.panel} aria-labelledby="sessions-title"><header className={styles.panelHeader}><h2 id="sessions-title">Sačuvane sesije</h2></header>
    <p className={styles.meta}>Sačuvaj tabove projekta i nastavi kasnije. Trenutni tabovi ostaju otvoreni.</p>
    {!canSave && <button onClick={enable}>Omogući pristup tabovima</button>}
    <form className={css.form} onSubmit={event => { event.preventDefault(); void action('save', name).then(ok => { if (ok) setName(''); }); }}><label htmlFor="session-name">Naziv sesije</label><div><input id="session-name" value={name} onChange={event => setName(event.target.value)} maxLength={100} required placeholder="Projekat, učenje…" /><button disabled={!ready || !canSave || busy || !name.trim()} className={styles.primary}>Sačuvaj tabove</button></div></form>
    {message && <p role="status">{message}</p>}{!ready && <button onClick={() => void refresh()}>Osvježi sesije</button>}
    {ready && sessions.length === 0 && <p className={styles.meta}>Još nema sačuvanih sesija.</p>}
    <ul className={css.list}>{sessions.map(s => <li key={s.id}><strong>{s.name}</strong><small>{s.tabs.length} tabova · {new Intl.DateTimeFormat('sr-Latn', { dateStyle: 'medium' }).format(s.created)}</small><div className={css.actions}><button disabled={busy} onClick={() => { setPreview(s); setRemoving(null); }}>Pregled i otvaranje</button><button disabled={busy} onClick={() => { setRemoving(s.id); setPreview(null); }}>Ukloni</button></div>
      {removing === s.id && <div><p>Ukloniti sačuvanu sesiju „{s.name}“?</p><button disabled={busy} onClick={() => void action('remove', s).then(ok => { if (ok) setRemoving(null); })}>Potvrdi uklanjanje</button><button disabled={busy} onClick={() => setRemoving(null)}>Odustani</button></div>}
    </li>)}</ul>
    {preview && <div className={css.preview}><h3>{preview.name}</h3><p>Otvoriće se do {preview.tabs.length} web tabova u trenutnom prozoru. Već otvorene adrese biće preskočene.</p><ul>{preview.tabs.map((t, i) => <li key={i}>{t.title}<small>{t.url}</small></li>)}</ul><div className={css.actions}><button disabled={busy || !canSave} onClick={() => void action('restore', preview).then(ok => { if (ok) setPreview(null); })}>Otvori sesiju</button><button disabled={busy} onClick={() => setPreview(null)}>Odustani</button></div></div>}
  </section>;
}
