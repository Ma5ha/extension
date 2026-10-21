import { useState } from 'react';
import { ArrowSquareOut, CaretDown, Stack, PushPin, X, Browser } from '@phosphor-icons/react';
import { activateTab, isExtension } from '../adapters/chrome';
import { byOrigin, type Tab } from '../domain/tabs';
import type { TabState } from '../hooks/useTabs';
import styles from '../App.module.css';

export function TabsPanel({ tabs, state, enable, refresh, group, report }: {
  tabs: Tab[]; state: TabState; enable: () => void; refresh: () => void; group: () => void; report: (text: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  return <section className={`${styles.panel} ${styles.tabsPanel}`} aria-labelledby="tabs-title">
    <header className={styles.panelHeader}><div><h2 id="tabs-title">Otvoreni tabovi {state === 'ready' && <span className={styles.count}>{tabs.length}</span>}</h2><p className={styles.meta}>Tvoj trenutni prozor</p></div>
      <button className={styles.primary} disabled={state !== 'ready'} onClick={group}><Stack size={18} aria-hidden="true" />Grupiši tabove</button>
    </header>
    {state === 'loading' && <div className={styles.empty} role="status"><Browser size={32} /><h3>Učitavanje tabova…</h3></div>}
    {(state === 'denied' || state === 'preview') && <div className={styles.empty}><Browser size={36} /><h3>Sve otvoreno, na jednom mjestu.</h3><p>{state === 'preview' ? 'Stvarni tabovi pojaviće se kada učitaš Taboru kao Chrome ekstenziju.' : 'Omogući pregled naslova i adresa da organizuješ tabove ovog prozora.'}</p><button className={styles.primary} disabled={!isExtension} onClick={enable}>Omogući pregled tabova</button><small>Bez naloga. Lokalno u tvom browseru.</small></div>}
    {state === 'error' && <div className={styles.empty} role="alert"><h3>Tabovi nisu učitani.</h3><p>Provjeri dozvolu za tabove i pokušaj ponovo.</p><button onClick={refresh}>Pokušaj ponovo</button></div>}
    {state === 'ready' && tabs.length === 0 && <div className={styles.empty}><h3>Nema otvorenih tabova.</h3><p>Novi tabovi ovog prozora pojaviće se ovdje.</p></div>}
    {state === 'ready' && byOrigin(tabs).map(({ origin, tabs: groupTabs }) => <section className={styles.originGroup} key={origin}>
      <button className={styles.originHeader} aria-expanded={!collapsed.has(origin)} onClick={() => setCollapsed(previous => {
        const next = new Set(previous); if (next.has(origin)) next.delete(origin); else next.add(origin); return next;
      })}><CaretDown size={15} className={collapsed.has(origin) ? styles.rotated : ''} aria-hidden="true" /><span className={styles.siteIcon}><Browser size={21} /></span><strong>{origin}</strong><span className={styles.meta}>{groupTabs.length}</span></button>
      {!collapsed.has(origin) && <ul className={styles.tabList}>{groupTabs.map(tab => <li key={tab.id}>
        <button className={styles.tabLink} title={`${tab.title}\n${tab.url}`} onClick={() => { void activateTab(tab).catch(() => { report('Tab više nije dostupan. Lista je osvježena.'); refresh(); }); }}>
          <ArrowSquareOut size={18} aria-hidden="true" /><span><strong>{tab.title}</strong><small>{tab.url || 'Adresa nije dostupna'}{tab.pinned ? ' · Zakačen' : tab.groupId !== -1 ? ' · Već grupisan' : ''}</small></span>{tab.pinned && <PushPin size={14} aria-hidden="true" />}
        </button><button aria-label={`Zatvori tab: ${tab.title}`} title="Zatvori tab" onClick={() => { void chrome.tabs.remove(tab.id).catch(() => report('Tab nije zatvoren. Osvježi listu i pokušaj ponovo.')); }}><X size={16} /></button>
      </li>)}</ul>}
    </section>)}
    <footer className={styles.panelFooter}><span>Grupisanje koristi protokol, host i port.</span><button onClick={refresh} disabled={!isExtension}>Osvježi</button></footer>
  </section>;
}
