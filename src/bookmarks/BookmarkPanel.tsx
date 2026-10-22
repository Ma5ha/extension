import { useState, type FormEvent } from 'react';
import { BookmarkSimple, Plus, PencilSimple, Trash, ArrowUpRight, Folder } from '@phosphor-icons/react';
import type { Tab } from '../domain/tabs';
import { useBookmarks } from './useBookmarks';
import { SiteIcon } from '../components/SiteIcon';
import { bookmarkHref, normalizeUrl, type Bookmark } from './model';
import styles from '../App.module.css';
import css from './BookmarkPanel.module.css';
export function BookmarkPanel({ tabs }: { tabs: Tab[] }) {
  const { bookmarks, folders, status, busy, error, save, remove, refresh, enable, openGroup } = useBookmarks();
  const [editing, setEditing] = useState<Bookmark | 'new' | null>(null);
  const [title, setTitle] = useState(''), [url, setUrl] = useState(''), [validation, setValidation] = useState('');
  const [targetFolder, setTargetFolder] = useState('');
  const [opening, setOpening] = useState<{ name: string; items: Bookmark[] } | null>(null);
  const [openedMessage, setOpenedMessage] = useState('');
  const [pending, setPending] = useState<Bookmark | null>(null);
  const availableTabs = tabs.filter(t => /^https?:\/\//i.test(t.url));
  function edit(bookmark: Bookmark | 'new') {
    setTargetFolder(bookmark === 'new' ? '' : bookmark.parentId ?? ''); setEditing(bookmark); setTitle(bookmark === 'new' ? '' : bookmark.title); setUrl(bookmark === 'new' ? '' : bookmark.url); setValidation(''); setPending(null);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    try { normalizeUrl(url); } catch { setValidation('Enter an HTTP or HTTPS address, such as example.com.'); return; }
    setValidation('');
    if (await save(title, url, editing && editing !== 'new' ? editing : undefined, targetFolder || undefined)) setEditing(null);
  }
  function renderLinks(items: Bookmark[]) { return <ul className={css.list}>{items.map(b => <li key={b.id}>
      <div className={css.row}><a href={bookmarkHref(b.url)} target="_blank" rel="noreferrer" title={b.url}><SiteIcon url={b.url} size={20} /><span><strong>{b.title}</strong><small>{b.folder || b.url}</small></span><ArrowUpRight size={16} /></a><button aria-label={`Edit bookmark: ${b.title}`} disabled={busy || b.editable === false} onClick={() => edit(b)}><PencilSimple size={16} /></button><button aria-label={`Remove bookmark: ${b.title}`} disabled={busy || b.editable === false} onClick={() => { setPending(b); setEditing(null); }}><Trash size={16} /></button></div>
      {pending?.id === b.id && <div className={css.confirm}><p>Remove “{b.title}” from Chrome bookmarks?</p><div className={css.actions}><button disabled={busy} onClick={() => { void remove(b).then(() => setPending(null)); }}>Remove</button><button disabled={busy} onClick={() => setPending(null)}>Cancel</button></div></div>}
    </li>)}</ul>; }
  function renderFolders(parentId?: string) {
    return folders.filter(folder => {
      const parent = folder.ancestors.at(-1);
      return parentId ? parent === parentId : !folders.some(candidate => candidate.id === parent);
    }).map(folder => {
      const items = bookmarks.filter(bookmark => bookmark.parentId === folder.id);
      const descendants = new Set([folder.id, ...folders.filter(child => child.ancestors.includes(folder.id)).map(child => child.id)]);
      const all = bookmarks.filter(bookmark => descendants.has(bookmark.parentId ?? ''));
      return <li key={folder.id}><details className={css.folder} onKeyDown={event => {
        if (event.target !== event.currentTarget.firstElementChild) return;
        if (event.key === 'ArrowRight') { event.preventDefault(); event.currentTarget.open = true; }
        if (event.key === 'ArrowLeft') { event.preventDefault(); if (event.currentTarget.open) event.currentTarget.open = false; else (event.currentTarget.parentElement?.closest('details')?.firstElementChild as HTMLElement | null)?.focus(); }
      }}><summary><Folder size={18} /><span>{folder.title}</span><small>{all.length}</small></summary>
        <div className={css.branch}><div className={css.actions}><button disabled={busy || !folder.editable} onClick={() => { edit('new'); setTargetFolder(folder.id); }}>Add bookmark</button><button disabled={busy || !all.length} onClick={() => setOpening({ name: folder.title, items: all })}>Open folder links</button></div>
        {renderLinks(items)}<ul className={css.tree}>{renderFolders(folder.id)}</ul>{!all.length && <p className={styles.meta}>This folder is empty.</p>}</div>
      </details></li>;
    });
  }
  return <section lang="en" className={styles.panel} aria-labelledby="bookmarks-title" aria-busy={busy || status === 'loading'}>
    <header className={styles.panelHeader}><h2 id="bookmarks-title"><BookmarkSimple size={22} />Bookmarks</h2><button aria-label="Add bookmark" disabled={busy || status !== 'ready'} onClick={() => edit('new')}><Plus size={18} /></button></header>
    <p className={styles.meta}>Your Chrome bookmarks, organized in their original folders.</p>
    {status === 'denied' && <div className={css.empty}><p>Allow access to view and edit your Chrome bookmarks.</p><button disabled={busy} onClick={() => void enable()}>Connect Chrome bookmarks</button></div>}
    {status === 'loading' && <p role="status">Loading bookmarks…</p>}
    {error && <p className={css.error} role="alert">{error}</p>}
    {status === 'error' && <button onClick={() => void refresh()}>Try again</button>}
    {openedMessage && <p role="status">{openedMessage}</p>}
    {editing && <form className={css.form} onSubmit={event => void submit(event)}>
      <h3>{editing === 'new' ? 'New bookmark' : 'Edit bookmark'}</h3>
      {editing === 'new' && availableTabs.length > 0 && <label>From an open tab<select disabled={busy} defaultValue="" onChange={event => {
        const tab = availableTabs.find(t => String(t.id) === event.target.value); if (tab) { setTitle(tab.title.slice(0, 160)); setUrl(tab.url); setValidation(''); }
      }}><option value="">Choose a tab or enter an address</option>{availableTabs.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}
      <label>Save in folder<select disabled={busy} value={targetFolder} onChange={e => setTargetFolder(e.target.value)}><option value="">Other bookmarks (default)</option>{folders.filter(f => f.editable).map(f => <option key={f.id} value={f.id}>{f.path}</option>)}</select></label>
      <label>Name<input maxLength={160} value={title} disabled={busy} onChange={e => setTitle(e.target.value)} placeholder="Website name" /></label>
      <label>Web address<input type="text" inputMode="url" autoCapitalize="none" spellCheck={false} required maxLength={8192} value={url} disabled={busy} aria-invalid={!!validation} aria-describedby={validation ? 'bookmark-validation' : undefined} onChange={e => { setUrl(e.target.value); setValidation(''); }} placeholder="https://example.com" /></label>
      {validation && <p id="bookmark-validation" role="alert">{validation}</p>}
      <div className={css.actions}><button className={styles.primary} type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button><button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button></div>
    </form>}
    {status === 'ready' && bookmarks.length === 0 && !editing && <div className={css.empty}><p>Save the pages you return to.</p><button onClick={() => edit('new')}><Plus size={16} />Add your first bookmark</button></div>}
    {status === 'ready' && <div onKeyDown={event => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || !(event.target instanceof HTMLElement) || !event.target.matches('summary')) return;
      const summaries = [...event.currentTarget.querySelectorAll<HTMLElement>('summary')].filter(item => !item.parentElement?.parentElement?.closest('details:not([open])'));
      const index = summaries.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? summaries.length - 1 : Math.max(0, Math.min(summaries.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
      event.preventDefault(); summaries[next]?.focus();
    }}><ul className={css.tree} aria-label="Bookmark folders">{renderFolders()}</ul>{renderLinks(bookmarks.filter(bookmark => !folders.some(folder => folder.id === bookmark.parentId)))}</div>}
    {opening && <div className={css.confirm}><h3>{opening.name}</h3><p>This will open up to {opening.items.filter(b => bookmarkHref(b.url)).length} web tabs. Duplicate and unsupported addresses will be skipped.</p><div className={css.actions}><button disabled={busy} onClick={() => void openGroup(opening.items).then(message => { setOpenedMessage(message); setOpening(null); })}>Open tabs</button><button disabled={busy} onClick={() => setOpening(null)}>Cancel</button></div></div>}
  </section>;
}
