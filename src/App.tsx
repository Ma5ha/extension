import { useCallback, useState, type CSSProperties } from 'react';
import { GearSix, Moon, Sun, Newspaper, ArrowUpRight, SquaresFour } from '@phosphor-icons/react';
import { executeGroups, getTabs, isExtension, requestAccess } from './adapters/chrome';
import { planGroups, type GroupPlan } from './domain/tabs';
import { useSettings } from './hooks/useSettings';
import { useTabs } from './hooks/useTabs';
import { Dialog } from './components/Dialog';
import { TabsPanel } from './components/TabsPanel';
import { GmailPanel } from './components/ServicePanels';
import { AgendaPanel } from './calendar/AgendaPanel';
import { MediaPanel } from './media/MediaPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { GroupPreview } from './components/GroupPreview';
import styles from './App.module.css';

export function App() {
  const [message, setMessage] = useState('');
  const report = useCallback((text: string) => setMessage(text), []);
  const { settings, ready, update } = useSettings(report);
  const tabs = useTabs(report);
  const [space, setSpace] = useState('Rad');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preview, setPreview] = useState<GroupPlan | null>(null);
  const [busy, setBusy] = useState(false);
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
  return <div className={styles.app} data-glass={settings.glass > 0} style={{ '--glass-opacity': 1 - settings.glass / 250 } as CSSProperties}>
    <a className={styles.skip} href="#main">Pređi na sadržaj</a>
    <header className={styles.topbar}><a className={styles.brand} href="#" onClick={e => { e.preventDefault(); setSpace('Rad'); }} aria-label="Tabora, radni prostor">tabora<span className={styles.brandDot}>.</span></a>
      <nav aria-label="Glavna navigacija">{['Rad', 'Vijesti', 'Muzika'].map(item => <button key={item} aria-current={space === item ? 'page' : undefined} onClick={() => setSpace(item)}>{item}</button>)}</nav>
      <div className={styles.headerActions}><button disabled={!ready} aria-label="Svijetla tema" aria-pressed={settings.theme === 'light'} onClick={() => void update({ theme: 'light' })}><Sun size={20} /></button><button disabled={!ready} aria-label="Tamna tema" aria-pressed={settings.theme === 'dark'} onClick={() => void update({ theme: 'dark' })}><Moon size={20} /></button><button disabled={!ready} aria-label="Podešavanja" onClick={() => setSettingsOpen(true)}><GearSix size={22} /></button></div>
    </header>
    <main id="main">
      <div className={styles.workspaceHeading}><div><p className={styles.eyebrow}>TVOJ LIČNI PROSTOR</p><h1>{space === 'Rad' ? 'Sve na svom mjestu.' : space === 'Vijesti' ? 'Nova perspektiva.' : 'Tvoj ritam.'}</h1></div>{space === 'Rad' && <button disabled={!ready} onClick={() => setSettingsOpen(true)}><SquaresFour size={18} />Uredi module</button>}</div>
      {message && <div className={styles.notice} role="status"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Skloni obavještenje">U redu</button></div>}
      {space === 'Rad' && <div className={styles.workspace} data-agenda={settings.agenda} data-aside={settings.gmail || settings.music}>
        {settings.agenda && <AgendaPanel />}
        <TabsPanel tabs={tabs.tabs} state={tabs.state} enable={() => void tabs.enable()} refresh={() => void tabs.refresh()} group={() => void previewGroups()} report={report} />
        {(settings.gmail || settings.music) && <aside className={styles.sidePanels} aria-label="Pošta i muzika">{settings.gmail && <GmailPanel />}{settings.music && <MediaPanel />}</aside>}
      </div>}
      {space === 'Vijesti' && <section className={`${styles.panel} ${styles.futureSpace}`}><Newspaper size={40} weight="light" /><h2>Vijesti, po tvom izboru.</h2><p>RSS izvori još nisu implementirani. Ovdje će biti naslovi iz izvora koje izabereš.</p><a href="https://news.google.com/" target="_blank" rel="noreferrer">Otvori Google News<ArrowUpRight size={16} /></a></section>}
      {space === 'Muzika' && <div className={styles.musicSpace}><MediaPanel /></div>}
    </main><footer className={styles.appFooter}><span>Tabora · Tvoj prostor, svaki novi tab.</span><span>{isExtension ? 'Lokalno u tvom browseru' : 'Pregled interfejsa · Chrome API nije dostupan'}</span></footer>
    {settingsOpen && <Dialog title="Tvoj prostor, tvoja pravila" close={() => setSettingsOpen(false)}><SettingsPanel settings={settings} update={update} /></Dialog>}
    {preview && <Dialog title="Pregled grupisanja" close={() => { if (!busy) setPreview(null); }}><GroupPreview plan={preview} busy={busy} confirm={() => void group()} cancel={() => setPreview(null)} /></Dialog>}
  </div>;
}
