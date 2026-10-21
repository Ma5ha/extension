import { useState, type FormEvent } from 'react';
import { BookmarkSimple, Plus, PencilSimple, Trash, ArrowUpRight } from '@phosphor-icons/react';
import type { Tab } from '../domain/tabs';
import { useBookmarks } from './useBookmarks';
import { bookmarkHref, normalizeUrl, type Bookmark } from './model';
import styles from '../App.module.css';
import css from './BookmarkPanel.module.css';
export function BookmarkPanel({ tabs }: { tabs: Tab[] }) {
  const { bookmarks, folders, status, busy, error, save, remove, refresh, enable, openGroup } = useBookmarks();
  const [editing, setEditing] = useState<Bookmark | 'new' | null>(null);
  const [title, setTitle] = useState(''), [url, setUrl] = useState(''), [validation, setValidation] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [targetFolder, setTargetFolder] = useState('');
  const [opening, setOpening] = useState<{ name: string; items: Bookmark[] } | null>(null);
  const [openedMessage, setOpenedMessage] = useState('');
  const visibleFolders = folders.filter(f => !selectedFolder || f.id === selectedFolder || f.ancestors.includes(selectedFolder));
  const visibleIds = new Set(visibleFolders.map(f => f.id));
  const filtered = bookmarks.filter(b => !selectedFolder || visibleIds.has(b.parentId ?? ''));
  const groups = [...new Set(filtered.map(b => b.parentId ?? ''))].map(id => ({ id, name: folders.find(f => f.id === id)?.path || 'Ostali bookmarkovi', items: filtered.filter(b => (b.parentId ?? '') === id) }));
  const [pending, setPending] = useState<Bookmark | null>(null);
  const availableTabs = tabs.filter(t => /^https?:\/\//i.test(t.url));
  function edit(bookmark: Bookmark | 'new') {
    setTargetFolder(bookmark === 'new' ? selectedFolder : bookmark.parentId ?? ''); setEditing(bookmark); setTitle(bookmark === 'new' ? '' : bookmark.title); setUrl(bookmark === 'new' ? '' : bookmark.url); setValidation(''); setPending(null);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    try { normalizeUrl(url); } catch { setValidation('Unesi HTTP ili HTTPS adresu, npr. example.com.'); return; }
    setValidation('');
    if (await save(title, url, editing && editing !== 'new' ? editing : undefined, targetFolder || undefined)) setEditing(null);
  }
  return <section className={styles.panel} aria-labelledby="bookmarks-title" aria-busy={busy || status === 'loading'}>
    <header className={styles.panelHeader}><h2 id="bookmarks-title"><BookmarkSimple size={22} />Sačuvani linkovi</h2><button aria-label="Dodaj bookmark" disabled={busy || status !== 'ready'} onClick={() => edit('new')}><Plus size={18} /></button></header>
    <p className={styles.meta}>Isti Chrome bookmarkovi. Folder biraš pri dodavanju ili uređivanju.</p>
    {status === 'denied' && <div className={css.empty}><p>Omogući pristup da prikažeš i uređuješ Chrome bookmarkove.</p><button disabled={busy} onClick={() => void enable()}>Poveži Chrome bookmarkove</button></div>}
    {status === 'loading' && <p role="status">Učitavanje linkova…</p>}
    {error && <p className={css.error} role="alert">{error}</p>}
    {status === 'error' && <button onClick={() => void refresh()}>Pokušaj ponovo</button>}
    {status === 'ready' && <label className={css.folderSelect}>Prikaži folder<select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}><option value="">Svi folderi</option>{folders.map(f => <option key={f.id} value={f.id}>{f.path}</option>)}</select></label>}
    {openedMessage && <p role="status">{openedMessage}</p>}
    {editing && <form className={css.form} onSubmit={event => void submit(event)}>
      <h3>{editing === 'new' ? 'Novi bookmark' : 'Uredi bookmark'}</h3>
      {editing === 'new' && availableTabs.length > 0 && <label>Iz otvorenog taba<select disabled={busy} defaultValue="" onChange={event => {
        const tab = availableTabs.find(t => String(t.id) === event.target.value); if (tab) { setTitle(tab.title.slice(0, 160)); setUrl(tab.url); setValidation(''); }
      }}><option value="">Izaberi tab ili unesi adresu</option>{availableTabs.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}
      <label>Sačuvaj u folder<select disabled={busy} value={targetFolder} onChange={e => setTargetFolder(e.target.value)}><option value="">Ostali bookmarkovi (podrazumijevano)</option>{folders.filter(f => f.editable).map(f => <option key={f.id} value={f.id}>{f.path}</option>)}</select></label>
      <label>Naziv<input maxLength={160} value={title} disabled={busy} onChange={e => setTitle(e.target.value)} placeholder="Naziv sajta" /></label>
      <label>Web adresa<input type="text" inputMode="url" autoCapitalize="none" spellCheck={false} required maxLength={8192} value={url} disabled={busy} aria-invalid={!!validation} aria-describedby={validation ? 'bookmark-validation' : undefined} onChange={e => { setUrl(e.target.value); setValidation(''); }} placeholder="https://example.com" /></label>
      {validation && <p id="bookmark-validation" role="alert">{validation}</p>}
      <div className={css.actions}><button className={styles.primary} type="submit" disabled={busy}>{busy ? 'Čuvanje…' : 'Sačuvaj'}</button><button type="button" disabled={busy} onClick={() => setEditing(null)}>Odustani</button></div>
    </form>}
    {status === 'ready' && bookmarks.length === 0 && !editing && <div className={css.empty}><p>Sačuvaj stranice kojima se često vraćaš.</p><button onClick={() => edit('new')}><Plus size={16} />Dodaj prvi link</button></div>}
    {status === 'ready' && filtered.length === 0 && bookmarks.length > 0 && <p className={styles.meta}>U ovom folderu nema linkova.</p>}
    {groups.map(group => <details key={group.id} className={css.folder} open><summary>{group.name} · {group.items.length}</summary><button disabled={busy} onClick={() => setOpening({ name: group.name, items: group.items })}>Otvori linkove foldera</button>
    <ul className={css.list}>{group.items.map(b => <li key={b.id}>
      <div className={css.row}><a href={bookmarkHref(b.url)} target="_blank" rel="noreferrer" title={b.url}><span><strong>{b.title}</strong><small>{b.folder || b.url}</small></span><ArrowUpRight size={16} /></a><button aria-label={`Uredi link: ${b.title}`} disabled={busy || b.editable === false} onClick={() => edit(b)}><PencilSimple size={16} /></button><button aria-label={`Ukloni link: ${b.title}`} disabled={busy || b.editable === false} onClick={() => { setPending(b); setEditing(null); }}><Trash size={16} /></button></div>
      {pending?.id === b.id && <div className={css.confirm}><p>Ukloniti „{b.title}“ iz Chrome bookmarka?</p><div className={css.actions}><button disabled={busy} onClick={() => { void remove(b).then(() => setPending(null)); }}>Ukloni</button><button disabled={busy} onClick={() => setPending(null)}>Odustani</button></div></div>}
    </li>)}</ul></details>)}
    {opening && <div className={css.confirm}><h3>{opening.name}</h3><p>Otvoriće se do {opening.items.filter(b => bookmarkHref(b.url)).length} web tabova. Duplikati u folderu i nepodržane adrese biće preskočeni.</p><div className={css.actions}><button disabled={busy} onClick={() => void openGroup(opening.items).then(message => { setOpenedMessage(message); setOpening(null); })}>Otvori tabove</button><button disabled={busy} onClick={() => setOpening(null)}>Odustani</button></div></div>}
  </section>;
}
