import { useCallback, useEffect, useState } from 'react';
import { GearSix, Moon, Sun, Newspaper, ArrowUpRight, Browser, BookmarkSimple, Stack, NotePencil, Headphones, SidebarSimple, Timer, Crosshair, Note } from '@phosphor-icons/react';
import { executeGroups, getTabs, isExtension, requestAccess } from './adapters/chrome';
import { planGroups, type GroupPlan } from './domain/tabs';
import { useSettings } from './hooks/useSettings';
import { useTabs } from './hooks/useTabs';
import { Dialog } from './components/Dialog';
import { TabsPanel } from './components/TabsPanel';
import { GmailPanel } from './components/ServicePanels';
import { ClockPanel } from './clock/ClockPanel';
import { AgendaPanel } from './calendar/AgendaPanel';
import { BookmarkPanel } from './bookmarks/BookmarkPanel';
import { MediaPanel } from './media/MediaPanel';
import { MediaProvider } from './media/MediaProvider';
import { SettingsPanel } from './components/SettingsPanel';
import { SectionOrder, SectionDragProvider, consoleLayout } from './workspace/SectionOrder';
import { WidgetBoard } from './workspace/WidgetBoard';
import { SessionsPanel } from './sessions/SessionsPanel';
import { FocusPanel } from './focus/FocusPanel';
import { openSidePanel } from './sidepanel/open';
import { GroupPreview } from './components/GroupPreview';
import { WorkspaceProvider, WorkspacePicker, useWorkspace, workspaces } from './workspace/WorkspaceContext';
import { useShortcuts, KeyboardShortcuts } from './workspace/KeyboardShortcuts';
import { FocusView } from './focus/FocusView';
import { QuickNoteDialog } from './focus/QuickNoteDialog';
import { TabNotesPanel } from './focus/TabNotesPanel';
import { TimerHistory } from './clock/TimerHistory';
import { notificationPermission, toggleTimer } from './clock/adapter';
import styles from './App.module.css';

const destinations = [
  { name: 'Work', icon: Browser },
  { name: 'Bookmarks', icon: BookmarkSimple },
  { name: 'Sessions', icon: Stack },
  { name: 'Notes', icon: NotePencil },
  { name: 'History', icon: Timer },
  { name: 'News', icon: Newspaper },
  { name: 'Music', icon: Headphones },
] as const;
type Space = typeof destinations[number]['name'];

export function App() { return <WorkspaceProvider><SelectedWorkspace /></WorkspaceProvider>; }
function SelectedWorkspace() { const { workspace } = useWorkspace(); return <AppContent key={workspace} />; }
function AppContent() {
  const { workspace, select } = useWorkspace();
  const [focusMode, setFocusMode] = useState(false), [quickNote, setQuickNote] = useState(false);
  const [message, setMessage] = useState('');
  const report = useCallback((text: string) => setMessage(text), []);
  const { settings, ready, update } = useSettings(report);
  const tabs = useTabs(report);
  const [space, setSpace] = useState<Space>('Work');
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
    } catch { report('Grouping preview is unavailable. Refresh the tabs and try again.'); }
  }
  async function group() {
    if (!preview || busy) return;
    setBusy(true);
    try {
      if (!await requestAccess(['tabGroups'])) { setPreview(null); report('Grouping was not allowed. No tabs were changed.'); return; }
      const result = await executeGroups(preview);
      report(`Grupisano: ${result.grouped} tabova u ${result.groups} grupa. Promijenjeno i preskočeno: ${result.changed}. Neuspjelo: ${result.failed}.${result.unnamed ? ` Grupe bez novog naziva: ${result.unnamed}.` : ''}`);
      setPreview(null);
    } catch { report('Grouping was interrupted. Some tabs may have been grouped. Review the refreshed list before trying again.'); setPreview(null); }
    finally { setBusy(false); await tabs.refresh(); }
  }
  const custom = settings.layoutMode === 'custom';
  const activeLayout = custom ? settings.layout : consoleLayout(settings.layout);
  const inspector = !focusMode && space === 'Work' && !custom;
  const title = space === 'Work' ? 'Workspace' : space === 'Music' ? 'Media' : space === 'Bookmarks' ? 'Bookmarks' : space;
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const consoleWidgets = {
    tabs: <TabsPanel busy={busy} tabs={tabs.tabs} state={tabs.state} enable={() => void tabs.enable()} refresh={() => void tabs.refresh()} group={() => void previewGroups()} report={report} compact />,
    sessions: settings.sessions ? <SessionsPanel canSave={tabs.state === 'ready'} enable={() => void tabs.enable()} compact onShowAll={() => setSpace('Sessions')} /> : undefined,
    focus: settings.focus ? <FocusPanel compact /> : undefined,
    agenda: settings.agenda ? <AgendaPanel compact /> : undefined,
    gmail: settings.gmail ? <GmailPanel compact /> : undefined,
    music: settings.music ? <MediaPanel compact /> : undefined,
  };
  function toggleFocus() {
    if (document.querySelector('[data-unsaved="true"]') && !window.confirm('Change focus mode and discard unsaved edits?')) return;
    setEditingLayout(false); setFocusMode(value => !value);
  }
  async function timerShortcut() {
    try {
      const allowed = await notificationPermission();
      const running = await toggleTimer(workspace);
      report(`${running ? 'Timer running.' : 'Timer paused.'}${allowed ? '' : ' System notifications are off.'}`);
    } catch { report('Could not change the timer. Try again.'); }
  }
  function navigate(next: Space) {
    if (space !== next && document.querySelector('[data-unsaved="true"]') && !window.confirm('Leave this view and discard unsaved edits?')) return;
    setSpace(next); setEditingLayout(false);
  }
  useShortcuts({ focus: toggleFocus, timer: () => void timerShortcut(), note: () => setQuickNote(true), workspace: select });
  return <MediaProvider active={settings.music || space === 'Music'} showFloating={!focusMode}><div className={styles.app} data-focus={focusMode}>
    <a className={styles.skip} href="#main">Skip to content</a>
    <aside className={styles.sidebar} aria-label="Tabora navigation">
      <a className={styles.brand} href="#main" onClick={event => { event.preventDefault(); navigate('Work'); }} aria-label="Tabora, workspace">tabora<span className={styles.brandDot}>.</span></a>
      <WorkspacePicker />
      <nav className={styles.navigation} aria-label="Main navigation">{destinations.map(({ name, icon: Icon }, index) => <button className={index === 5 ? styles.secondaryDestination : undefined} key={name} aria-current={space === name ? 'page' : undefined} onClick={() => navigate(name)}><Icon size={21} aria-hidden="true" /><span>{name === 'Bookmarks' ? 'Bookmarks' : name}</span></button>)}</nav>
      <div className={styles.sidebarFooter}><div className={styles.headerActions}>
        <div className={styles.themeSwitch} role="group" aria-label="Color theme">
          <span className={styles.themeThumb} data-dark={settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)} aria-hidden="true" />
          <button disabled={!ready} aria-label="Light theme" aria-pressed={settings.theme === 'light'} title="Light theme" onClick={() => void update({ theme: 'light' })}><Sun size={18} aria-hidden="true" /></button>
          <button disabled={!ready} aria-label="Dark theme" aria-pressed={settings.theme === 'dark'} title="Dark theme" onClick={() => void update({ theme: 'dark' })}><Moon size={18} aria-hidden="true" /></button>
        </div>
        <button disabled={!ready} aria-label="Settings" title="Settings" onClick={() => setSettingsOpen(true)}><GearSix size={21} /></button>
        <button disabled={windowId === null} title="Open side panel" aria-label="Open side panel" onClick={() => { if (windowId !== null) void openSidePanel(windowId).catch(() => report('The side panel could not be opened. Try the Tabora icon in the Chrome toolbar.')); }}><SidebarSimple size={20} /></button>
      </div><p>Local to your browser</p><small>Tabora · Your space, every new tab.</small></div>
    </aside>
    <SectionDragProvider layout={activeLayout} update={layout => update({ layout })}><main id="main" tabIndex={-1} className={styles.main}>
      <div className={styles.workspaceGrid} data-inspector={inspector}>
        <div className={styles.center}>
          <header className={`${styles.workspaceHeading} ${!focusMode && space === 'Work' && settings.clock ? styles.widgetHeading : ''}`}>
            {!focusMode && space === 'Work' && settings.clock ? <><h1 className={styles.srOnly}>{title}</h1><ClockPanel /></> : <div><h1>{focusMode ? 'Focus' : title}</h1><p className={styles.workspaceDate}>{today}<span> · {timeZone}</span></p></div>}
            <div className={styles.workspaceToolbar}><span className={styles.workspaceLabel}>{workspaces.find(w => w.id === workspace)?.name}</span><button disabled={!ready} aria-pressed={focusMode} aria-keyshortcuts="Alt+Shift+F" title="Focus mode (Alt/Option + Shift + F)" onClick={toggleFocus}><Crosshair size={16} aria-hidden="true" />{focusMode ? 'Exit focus' : 'Focus'}</button><button aria-keyshortcuts="Alt+Shift+N" title="Quick note (Alt/Option + Shift + N)" onClick={() => setQuickNote(true)}><Note size={16} aria-hidden="true" />Quick note</button><KeyboardShortcuts /></div>
          </header>
          <div key={space} className={styles.sectionScroll} data-scroll-region role="region" aria-label="Workspace content" tabIndex={0}>
          {!focusMode && space === 'Work' && editingLayout && <div className={styles.layoutNotice}><span>Editing layout · Drag sections or use the controls.</span><button onClick={() => setEditingLayout(false)}>Done</button></div>}
          {message && <div className={styles.notice} role="status"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Dismiss notification">OK</button></div>}
          {focusMode && <FocusView />}
          {!focusMode && <>{space === 'Work' && (custom ? <WidgetBoard layout={settings.layout} update={layout => update({ layout })} editing={editingLayout} widgets={{
            agenda: settings.agenda ? <AgendaPanel /> : undefined,
            focus: settings.focus ? <FocusPanel /> : undefined,
            tabs: <TabsPanel busy={busy} tabs={tabs.tabs} state={tabs.state} enable={() => void tabs.enable()} refresh={() => void tabs.refresh()} group={() => void previewGroups()} report={report} compact />,
            sessions: settings.sessions ? <SessionsPanel canSave={tabs.state === 'ready'} enable={() => void tabs.enable()} /> : undefined,
            bookmarks: settings.bookmarks ? <BookmarkPanel tabs={tabs.tabs} /> : undefined,
            gmail: settings.gmail ? <GmailPanel /> : undefined,
            music: settings.music ? <MediaPanel /> : undefined,
          }} /> : <div className={styles.primaryContent}>
            {editingLayout && <p className={styles.reorderHint}>Drag sections to reorder or move between columns. Changes are saved automatically. Arrow buttons also work with the keyboard.</p>}
            <SectionOrder column="center" layout={activeLayout} update={layout => update({ layout })} editing={editingLayout} widgets={consoleWidgets} />
          </div>)}
          {space === 'Bookmarks' && <div className={styles.destination}><BookmarkPanel tabs={tabs.tabs} /></div>}
          {space === 'Sessions' && <div className={styles.destination}><SessionsPanel canSave={tabs.state === 'ready'} enable={() => void tabs.enable()} /></div>}
          {space === 'Notes' && <div className={`${styles.destination} ${styles.notesDestination}`}><FocusPanel /><TabNotesPanel tabs={tabs.tabs} /></div>}
          {space === 'History' && <div className={styles.destination}><TimerHistory /></div>}
          {space === 'News' && <section className={`${styles.panel} ${styles.futureSpace}`}><Newspaper size={36} weight="light" /><h2>News, your way.</h2><p>RSS feeds are not available yet. You can open Google News in the meantime.</p><a href="https://news.google.com/" target="_blank" rel="noreferrer">Open Google News<ArrowUpRight size={16} /></a></section>}
          {space === 'Music' && <div className={styles.destination}><MediaPanel /></div>}</>}
          </div>
        </div>
        {inspector && <aside className={styles.inspector} aria-label="Daily tools" tabIndex={0}>
          <SectionOrder column="right" layout={activeLayout} update={layout => update({ layout })} editing={editingLayout} widgets={consoleWidgets} />
        </aside>}
      </div>
    </main></SectionDragProvider>
    {quickNote && <QuickNoteDialog close={() => setQuickNote(false)} />}
    {settingsOpen && <Dialog title="Your space, your rules" close={() => setSettingsOpen(false)}><SettingsPanel settings={settings} update={update} editLayout={() => { setSpace('Work'); setEditingLayout(true); setSettingsOpen(false); }} /></Dialog>}
    {preview && <Dialog title="Grouping preview" close={() => { if (!busy) setPreview(null); }}><GroupPreview plan={preview} busy={busy} confirm={() => void group()} cancel={() => setPreview(null)} /></Dialog>}
  </div></MediaProvider>;
}
