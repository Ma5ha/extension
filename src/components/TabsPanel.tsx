import { useState } from 'react';
import { CaretDown, Stack, PushPin, X, Browser, ArrowClockwise, NotePencil, Copy } from '@phosphor-icons/react';
import { activateTab, isExtension } from '../adapters/chrome';
import { byOrigin, type Tab } from '../domain/tabs';
import type { TabState } from '../hooks/useTabs';
import { DuplicateTabs } from './DuplicateTabs';
import { QuickNoteDialog, type NoteTarget } from '../focus/QuickNoteDialog';
import { bookmarkHref } from '../bookmarks/model';
import { duplicateGroups } from '../domain/duplicates';
import { SiteIcon } from './SiteIcon';
import styles from '../App.module.css';

function shortAddress(url: string) {
  try { return new URL(url).host || url; } catch { return url || 'Address unavailable'; }
}
function originLabel(origin: string) {
  try { const parsed = new URL(origin); return parsed.protocol === 'https:' ? parsed.host : origin; } catch { return origin; }
}
export function TabsPanel({ tabs, state, enable, refresh, group, report, compact = false, busy = false }: {
  tabs: Tab[]; state: TabState; enable: () => void; refresh: () => void; group: () => void; report: (text: string) => void; compact?: boolean; busy?: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [review, setReview] = useState(false), [note, setNote] = useState<NoteTarget | null>(null);
  const groups = byOrigin(tabs);
  const duplicates = duplicateGroups(tabs);
  const allCollapsed = groups.length > 0 && groups.every(g => !expanded.has(g.origin));
  return <section className={`${styles.panel} ${styles.tabsPanel}`} data-compact={compact} aria-labelledby="tabs-title">
    <header className={styles.panelHeader}><h2 id="tabs-title">Open tabs {state === 'ready' && <span className={styles.count}>{tabs.length}</span>}</h2>
      <div className={styles.listActions}>
        <button disabled={state !== 'ready' || busy} aria-label={`Review duplicate tabs (${duplicates.length} addresses)`} title="Review duplicates" onClick={() => setReview(true)}><Copy size={16} aria-hidden="true" />{duplicates.length || ''}</button>
        {compact && state === 'ready' && <><button className={styles.listMode} aria-label={allCollapsed ? 'Expand all groups' : 'Collapse all groups'} onClick={() => setExpanded(allCollapsed ? new Set(groups.map(g => g.origin)) : new Set())}>By site<CaretDown size={14} aria-hidden="true" /></button><button className={styles.refreshTabs} aria-label="Refresh tabs" title="Refresh tabs" onClick={refresh}><ArrowClockwise size={15} aria-hidden="true" /></button></>}
        <button className={styles.iconAction} disabled={state !== 'ready' || busy} aria-label="Group tabs by site" title="Group tabs by site" onClick={group}><Stack size={19} aria-hidden="true" /></button>
      </div>
    </header>
    {state === 'loading' && <div className={styles.empty} role="status"><Browser size={32} /><h3>Loading tabs…</h3></div>}
    {(state === 'denied' || state === 'preview') && <div className={styles.empty}><Browser size={36} /><h3>Everything open, in one place.</h3><p>{state === 'preview' ? 'Your tabs will appear when you load Tabora as a Chrome extension.' : 'Allow access to tab titles and addresses to organize this window.'}</p><button className={styles.primary} disabled={!isExtension} onClick={enable}>Allow tab access</button><small>No account needed. Local to your browser.</small></div>}
    {state === 'error' && <div className={styles.empty} role="alert"><h3>Could not load tabs.</h3><p>Check tab permission and try again.</p><button onClick={refresh}>Try again</button></div>}
    {state === 'ready' && tabs.length === 0 && <div className={styles.empty}><h3>No open tabs.</h3><p>New tabs in this window will appear here.</p></div>}
    {state === 'ready' && groups.map(({ origin, tabs: groupTabs }) => <section className={styles.originGroup} key={origin}>
      <button className={styles.originHeader} title={origin} aria-expanded={expanded.has(origin)} onClick={() => setExpanded(previous => {
        const next = new Set(previous); if (next.has(origin)) next.delete(origin); else next.add(origin); return next;
      })}><CaretDown size={14} className={!expanded.has(origin) ? styles.rotated : ''} aria-hidden="true" /><span className={styles.siteIcon}><SiteIcon url={groupTabs[0]?.url ?? origin} favIconUrl={groupTabs[0]?.favIconUrl} /></span><strong>{originLabel(origin)}</strong><span className={styles.count}>{groupTabs.length}</span></button>
      {expanded.has(origin) && <ul className={styles.tabList}>{groupTabs.map(tab => <li key={tab.id}>
        <button className={styles.tabLink} title={`${tab.title}\n${tab.url}`} onClick={() => { void activateTab(tab).catch(() => { report('This tab is no longer available. The list has been refreshed.'); refresh(); }); }}>
          <span className={styles.tabFavicon}><SiteIcon url={tab.url} favIconUrl={tab.favIconUrl} size={20} /></span><span className={styles.tabText}><strong>{tab.title}</strong><small>{shortAddress(tab.url)}</small></span>{tab.pinned && <PushPin size={13} aria-label="Pinned tab" />}{tab.groupId !== -1 && <Stack size={13} aria-label="Already grouped tab" />}
        </button>{bookmarkHref(tab.url) && <button className={styles.tabNoteAction} aria-label={`Note for ${tab.title}`} title="Page note" onClick={() => setNote(tab)}><NotePencil size={16} aria-hidden="true" /></button>}<button aria-label={`Close tab: ${tab.title}`} title="Close tab" onClick={() => { void chrome.tabs.remove(tab.id).catch(() => report('Could not close the tab. Refresh the list and try again.')); }}><X size={16} /></button>
      </li>)}</ul>}
    </section>)}
    {!compact && <footer className={styles.panelFooter}><span>Your current window</span><button aria-label="Refresh tabs" title="Refresh tabs" onClick={refresh} disabled={!isExtension}><ArrowClockwise size={16} aria-hidden="true" /></button></footer>}
    {review && <DuplicateTabs tabs={tabs} close={() => setReview(false)} refresh={refresh} />}
    {note && <QuickNoteDialog target={note} close={() => setNote(null)} />}
  </section>;
}
