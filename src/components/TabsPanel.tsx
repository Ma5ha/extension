import { useState } from 'react';
import { CaretDown, Stack, PushPin, X, Browser, ArrowClockwise } from '@phosphor-icons/react';
import { activateTab, isExtension } from '../adapters/chrome';
import { byOrigin, type Tab } from '../domain/tabs';
import type { TabState } from '../hooks/useTabs';
import { SiteIcon } from './SiteIcon';
import styles from '../App.module.css';

function shortAddress(url: string) {
  try { return new URL(url).host || url; } catch { return url || 'Adresa nije dostupna'; }
}
function originLabel(origin: string) {
  try { const parsed = new URL(origin); return parsed.protocol === 'https:' ? parsed.host : origin; } catch { return origin; }
}
export function TabsPanel({ tabs, state, enable, refresh, group, report, compact = false }: {
  tabs: Tab[]; state: TabState; enable: () => void; refresh: () => void; group: () => void; report: (text: string) => void; compact?: boolean;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const groups = byOrigin(tabs);
  const allCollapsed = groups.length > 0 && groups.every(g => collapsed.has(g.origin));
  return <section className={`${styles.panel} ${styles.tabsPanel}`} data-compact={compact} aria-labelledby="tabs-title">
    <header className={styles.panelHeader}><h2 id="tabs-title">Otvoreni tabovi {state === 'ready' && <span className={styles.count}>{tabs.length}</span>}</h2>
      {compact ? state === 'ready' && <div className={styles.listActions}><button className={styles.listMode} aria-label={allCollapsed ? 'Proširi sve grupe' : 'Skupi sve grupe'} onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(groups.map(g => g.origin)))}>Po sajtu<CaretDown size={14} aria-hidden="true" /></button><button className={styles.refreshTabs} aria-label="Osvježi tabove" title="Osvježi tabove" onClick={refresh}><ArrowClockwise size={15} aria-hidden="true" /></button></div> : <button className={styles.primary} disabled={state !== 'ready'} onClick={group}><Stack size={18} aria-hidden="true" />Grupiši tabove</button>}
    </header>
    {state === 'loading' && <div className={styles.empty} role="status"><Browser size={32} /><h3>Učitavanje tabova…</h3></div>}
    {(state === 'denied' || state === 'preview') && <div className={styles.empty}><Browser size={36} /><h3>Sve otvoreno, na jednom mjestu.</h3><p>{state === 'preview' ? 'Stvarni tabovi pojaviće se kada učitaš Taboru kao Chrome ekstenziju.' : 'Omogući pregled naslova i adresa da organizuješ tabove ovog prozora.'}</p><button className={styles.primary} disabled={!isExtension} onClick={enable}>Omogući pregled tabova</button><small>Bez naloga. Lokalno u tvom browseru.</small></div>}
    {state === 'error' && <div className={styles.empty} role="alert"><h3>Tabovi nisu učitani.</h3><p>Provjeri dozvolu za tabove i pokušaj ponovo.</p><button onClick={refresh}>Pokušaj ponovo</button></div>}
    {state === 'ready' && tabs.length === 0 && <div className={styles.empty}><h3>Nema otvorenih tabova.</h3><p>Novi tabovi ovog prozora pojaviće se ovdje.</p></div>}
    {state === 'ready' && groups.map(({ origin, tabs: groupTabs }) => <section className={styles.originGroup} key={origin}>
      <button className={styles.originHeader} title={origin} aria-expanded={!collapsed.has(origin)} onClick={() => setCollapsed(previous => {
        const next = new Set(previous); if (next.has(origin)) next.delete(origin); else next.add(origin); return next;
      })}><CaretDown size={14} className={collapsed.has(origin) ? styles.rotated : ''} aria-hidden="true" /><span className={styles.siteIcon}><SiteIcon url={origin} /></span><strong>{originLabel(origin)}</strong><span className={styles.count}>{groupTabs.length}</span></button>
      {!collapsed.has(origin) && <ul className={styles.tabList}>{groupTabs.map(tab => <li key={tab.id}>
        <button className={styles.tabLink} title={`${tab.title}\n${tab.url}`} onClick={() => { void activateTab(tab).catch(() => { report('Tab više nije dostupan. Lista je osvježena.'); refresh(); }); }}>
          <span className={styles.tabFavicon}><SiteIcon url={tab.url} size={20} /></span><span className={styles.tabText}><strong>{tab.title}</strong><small>{shortAddress(tab.url)}</small></span>{tab.pinned && <PushPin size={13} aria-label="Zakačen tab" />}{tab.groupId !== -1 && <Stack size={13} aria-label="Već grupisan tab" />}
        </button><button aria-label={`Zatvori tab: ${tab.title}`} title="Zatvori tab" onClick={() => { void chrome.tabs.remove(tab.id).catch(() => report('Tab nije zatvoren. Osvježi listu i pokušaj ponovo.')); }}><X size={16} /></button>
      </li>)}</ul>}
    </section>)}
    {!compact && <footer className={styles.panelFooter}><span>Tvoj trenutni prozor</span><button aria-label="Osvježi tabove" title="Osvježi tabove" onClick={refresh} disabled={!isExtension}><ArrowClockwise size={16} aria-hidden="true" /></button></footer>}
  </section>;
}
