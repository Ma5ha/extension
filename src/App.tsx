import { useCallback, useEffect, useState } from 'react';
import { GearSix, Moon, Sun, Newspaper, ArrowUpRight, Browser, BookmarkSimple, Stack, NotePencil, Headphones, SidebarSimple } from '@phosphor-icons/react';
import { executeGroups, getTabs, isExtension, requestAccess } from './adapters/chrome';
import { planGroups, type GroupPlan } from './domain/tabs';
import { useSettings } from './hooks/useSettings';
import { useTabs } from './hooks/useTabs';
import { Dialog } from './components/Dialog';
import { TabsPanel } from './components/TabsPanel';
import { GmailPanel } from './components/ServicePanels';
import { AgendaPanel } from './calendar/AgendaPanel';
import { BookmarkPanel } from './bookmarks/BookmarkPanel';
import { MediaPanel } from './media/MediaPanel';
import { MediaProvider } from './media/MediaProvider';
import { SettingsPanel } from './components/SettingsPanel';
import { WidgetBoard } from './workspace/WidgetBoard';
import { SessionsPanel } from './sessions/SessionsPanel';
import { FocusPanel } from './focus/FocusPanel';
import { openSidePanel } from './sidepanel/open';
import { GroupPreview } from './components/GroupPreview';
import styles from './App.module.css';

const destinations = [
  { name: 'Rad', icon: Browser },
  { name: 'Bookmarkovi', icon: BookmarkSimple },
  { name: 'Sesije', icon: Stack },
  { name: 'Bilješke', icon: NotePencil },
  { name: 'Vijesti', icon: Newspaper },
  { name: 'Muzika', icon: Headphones },
] as const;
type Space = typeof destinations[number]['name'];

export function App() {
  const [message, setMessage] = useState('');
  const report = useCallback((text: string) => setMessage(text), []);
  const { settings, ready, update } = useSettings(report);
  const tabs = useTabs(report);
  const [space, setSpace] = useState<Space>('Rad');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preview, setPreview] = useState<GroupPlan | null>(null);
  const [editingLayout, setEditingLayout] = useState(false);
  const [windowId, setWindowId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (isExtension) void chrome.windows.getCurrent().then(w => setWindowId(w.id ?? null)).catch(() => setWindowId(null)); }, []);
  async function previewGroups() {
    try {
      const data = await getTabs();
      setPreview(planGroups(data.tabs, data.windowId));
    } catch { report('Pregled grupisanja nije dostupan. Osvježi tabove i pokušaj ponovo.'); }
  }
  async function group() {
    if (!preview || busy) return;
    setBusy(true);
    try {
      if (!await requestAccess(['tabGroups'])) { setPreview(null); report('Grupisanje nije odobreno. Tabovi nisu promijenjeni.'); return; }
      const result = await executeGroups(preview);
      report(`Grupisano: ${result.grouped} tabova u ${result.groups} grupa. Promijenjeno i preskočeno: ${result.changed}. Neuspjelo: ${result.failed}.${result.unnamed ? ` Grupe bez novog naziva: ${result.unnamed}.` : ''}`);
      setPreview(null);
    } catch { report('Grupisanje je prekinuto. Dio tabova je možda grupisan; pregledaj osvježenu listu prije novog pokušaja.'); setPreview(null); }
    finally { setBusy(false); await tabs.refresh(); }
  }
  const custom = settings.layoutMode === 'custom';
  const inspector = space === 'Rad' && !custom && (settings.focus || settings.agenda || settings.gmail || settings.music);
  const title = space === 'Rad' ? 'Radni prostor' : space === 'Muzika' ? 'Mediji' : space === 'Bookmarkovi' ? 'Bookmarks' : space;
  const today = new Intl.DateTimeFormat('sr-Latn', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <MediaProvider active={settings.music || space === 'Muzika'}><div className={styles.app}>
    <a className={styles.skip} href="#main">Pređi na sadržaj</a>
    <aside className={styles.sidebar} aria-label="Tabora navigacija">
      <a className={styles.brand} href="#main" onClick={event => { event.preventDefault(); setSpace('Rad'); }} aria-label="Tabora, radni prostor">tabora<span className={styles.brandDot}>.</span></a>
      <nav className={styles.navigation} aria-label="Glavna navigacija">{destinations.map(({ name, icon: Icon }, index) => <button className={index === 4 ? styles.secondaryDestination : undefined} key={name} aria-current={space === name ? 'page' : undefined} onClick={() => { setSpace(name); setEditingLayout(false); }}><Icon size={21} aria-hidden="true" /><span>{name === 'Bookmarkovi' ? 'Bookmarks' : name}</span></button>)}</nav>
      <div className={styles.sidebarFooter}><div className={styles.headerActions}>
        <button disabled={!ready} aria-label="Svijetla tema" aria-pressed={settings.theme === 'light'} title="Svijetla tema" onClick={() => void update({ theme: 'light' })}><Sun size={21} /></button>
        <button disabled={!ready} aria-label="Tamna tema" aria-pressed={settings.theme === 'dark'} title="Tamna tema" onClick={() => void update({ theme: 'dark' })}><Moon size={21} /></button>
        <button disabled={!ready} aria-label="Podešavanja" title="Podešavanja" onClick={() => setSettingsOpen(true)}><GearSix size={21} /></button>
        <button disabled={windowId === null} title="Otvori bočni panel" aria-label="Otvori bočni panel" onClick={() => { if (windowId !== null) void openSidePanel(windowId).catch(() => report('Bočni panel nije otvoren. Pokušaj preko Tabora ikone u Chrome alatnoj traci.')); }}><SidebarSimple size={20} /></button>
      </div><p>Lokalno u tvom browseru</p><small>Tabora · Tvoj prostor, svaki novi tab.</small></div>
    </aside>
    <main id="main" tabIndex={-1} className={styles.main}>
      <div className={styles.workspaceGrid} data-inspector={inspector}>
        <div className={styles.center}>
          <header className={styles.workspaceHeading}><div><h1>{title}</h1><p className={styles.workspaceDate}>{today}<span> · {timeZone}</span></p></div>
            {space === 'Rad' && <div className={styles.workspaceActions}>{custom && <button disabled={!ready} aria-pressed={editingLayout} onClick={() => setEditingLayout(value => !value)}>{editingLayout ? 'Završi uređivanje' : 'Uredi raspored'}</button>}<button className={styles.primary} disabled={tabs.state !== 'ready' || busy} onClick={() => void previewGroups()}><Stack size={18} aria-hidden="true" />Grupiši tabove</button></div>}
          </header>
          <div className={styles.sectionScroll} role="region" aria-label="Sadržaj radnog prostora" tabIndex={0}>
          {message && <div className={styles.notice} role="status"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Skloni obavještenje">U redu</button></div>}
          {space === 'Rad' && (custom ? <WidgetBoard layout={settings.layout} update={layout => update({ layout })} editing={editingLayout} widgets={{
            agenda: settings.agenda ? <AgendaPanel /> : undefined,
            focus: settings.focus ? <FocusPanel /> : undefined,
            tabs: <TabsPanel tabs={tabs.tabs} state={tabs.state} enable={() => void tabs.enable()} refresh={() => void tabs.refresh()} group={() => void previewGroups()} report={report} compact />,
            sessions: settings.sessions ? <SessionsPanel canSave={tabs.state === 'ready'} enable={() => void tabs.enable()} /> : undefined,
            bookmarks: settings.bookmarks ? <BookmarkPanel tabs={tabs.tabs} /> : undefined,
            gmail: settings.gmail ? <GmailPanel /> : undefined,
            music: settings.music ? <MediaPanel /> : undefined,
          }} /> : <div className={styles.primaryContent}>
            <TabsPanel tabs={tabs.tabs} state={tabs.state} enable={() => void tabs.enable()} refresh={() => void tabs.refresh()} group={() => void previewGroups()} report={report} compact />
            {settings.sessions && <SessionsPanel canSave={tabs.state === 'ready'} enable={() => void tabs.enable()} compact onShowAll={() => setSpace('Sesije')} />}
          </div>)}
          {space === 'Bookmarkovi' && <div className={styles.destination}><BookmarkPanel tabs={tabs.tabs} /></div>}
          {space === 'Sesije' && <div className={styles.destination}><SessionsPanel canSave={tabs.state === 'ready'} enable={() => void tabs.enable()} /></div>}
          {space === 'Bilješke' && <div className={styles.destination}><FocusPanel /></div>}
          {space === 'Vijesti' && <section className={`${styles.panel} ${styles.futureSpace}`}><Newspaper size={36} weight="light" /><h2>Vijesti, po tvom izboru.</h2><p>RSS izvori još nisu dostupni. Do tada možeš otvoriti Google News.</p><a href="https://news.google.com/" target="_blank" rel="noreferrer">Otvori Google News<ArrowUpRight size={16} /></a></section>}
          {space === 'Muzika' && <div className={styles.destination}><MediaPanel /></div>}
          </div>
        </div>
        {inspector && <aside className={styles.inspector} aria-label="Dnevni alati" tabIndex={0}>
          {settings.focus && <FocusPanel compact />}
          {settings.agenda && <AgendaPanel compact />}
          {settings.gmail && <GmailPanel compact />}
          {settings.music && <MediaPanel compact />}
        </aside>}
      </div>
    </main>
    {settingsOpen && <Dialog title="Tvoj prostor, tvoja pravila" close={() => setSettingsOpen(false)}><SettingsPanel settings={settings} update={update} editLayout={() => { void update({ layoutMode: 'custom' }); setSpace('Rad'); setEditingLayout(true); setSettingsOpen(false); }} /></Dialog>}
    {preview && <Dialog title="Pregled grupisanja" close={() => { if (!busy) setPreview(null); }}><GroupPreview plan={preview} busy={busy} confirm={() => void group()} cancel={() => setPreview(null)} /></Dialog>}
  </div></MediaProvider>;
}
