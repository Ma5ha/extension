import { SidebarSettings } from './SidebarSettings';
import { useState } from 'react';
import { KeyboardShortcuts } from '../workspace/KeyboardShortcuts';
import { AppearanceSettings } from './AppearanceSettings';
import { StylePresets } from './StylePresets';
import { ConnectionSettings } from './ConnectionSettings';
import { fontSizePresets, type Settings } from '../adapters/settings';
import styles from '../App.module.css';
import css from './SettingsPanel.module.css';
const sections = [{ id: 'appearance', name: 'Appearance' }, { id: 'widgets', name: 'Widgets' }, { id: 'sidebar', name: 'Sidebar' }, { id: 'connections', name: 'Connections' }, { id: 'data', name: 'Data' }] as const;
export function SettingsPanel({ settings, update, editLayout }: { settings: Settings; update: (patch: Partial<Settings>) => Promise<void>; editLayout?: () => void }) {
  const [section, setSection] = useState<typeof sections[number]['id']>('appearance');
  return <div className={styles.settings}>
    <nav className={css.navigation} aria-label="Settings sections">{sections.map(item => <button key={item.id} aria-current={section === item.id ? 'page' : undefined} onClick={() => setSection(item.id)}>{item.name}</button>)}</nav>
    <section className={css.section} aria-label={sections.find(item => item.id === section)!.name}>
      {section === 'appearance' && <>
        <StylePresets settings={settings} update={update} />
        <label>Theme<select value={settings.theme} onChange={e => void update({ theme: e.target.value as Settings['theme'] })}><option value="light">Light theme</option><option value="dark">Dark theme</option><option value="system">System theme</option></select></label>
        <fieldset className={styles.fontPresets}><legend>Font size</legend><p>Preview changes instantly across the workspace.</p><div role="group" aria-label="Font size presets">{fontSizePresets.map(({ value, label, pixels }) => <button key={value} aria-pressed={settings.fontSize === value} onClick={() => void update({ fontSize: value })}><span className={styles.fontSample} style={{ fontSize: `${pixels * 1.5}px` }}>Aa</span><span>{label}</span></button>)}</div></fieldset>
        <label className={styles.checkbox}><input type="checkbox" checked={settings.backgroundMotion} onChange={event => void update({ backgroundMotion: event.target.checked })} />Animate background</label>
        <AppearanceSettings settings={settings} update={update} />
      </>}
      {section === 'widgets' && <>
        <h3>Your workspace</h3><p>Choose which widgets appear here. Visibility and layout are saved for the current workspace.</p>
        <fieldset><legend>Visible widgets</legend>{(['clock', 'agenda', 'gmail', 'music', 'bookmarks', 'sessions', 'focus', 'news', 'console'] as const).map(key => <label className={styles.checkbox} key={key}><input type="checkbox" checked={settings[key]} onChange={e => void update({ [key]: e.target.checked })} />{{ clock: 'Clock and day', agenda: 'Agenda', gmail: 'Gmail', music: 'Media', bookmarks: 'Chrome bookmarks', sessions: 'Saved sessions', focus: 'Focus and notes', news: 'RSS news', console: 'Developer console' }[key]}</label>)}</fieldset>
        {editLayout && <button onClick={editLayout}>Edit layout</button>}<p className={css.hint}>Drag widgets with their handles. Edit layout also gives you arrow controls, columns, widths and heights.</p><KeyboardShortcuts />
      </>}
      {section === 'sidebar' && <SidebarSettings settings={settings} update={update} />}
      {section === 'connections' && <ConnectionSettings />}
      {section === 'data' && <>
        <h3>Saved in this browser</h3><p>Your appearance, background image, layout, sessions, notes, tasks, time history, RSS sources and saved headlines stay local. Changes sync across open Tabora tabs in this browser profile.</p>
        <h3>Chrome data</h3><p>Bookmark edits change your Chrome bookmarks. Opening or grouping tabs changes the current browser window.</p>
        <h3>Private content</h3><p>Google tokens use Chrome’s authorization cache. Gmail headers and Calendar events are not stored in your local settings or saved headlines. Gmail content starts hidden in new tabs.</p>
        <h3>Network access</h3><p>Google APIs, RSS sources and media site access are optional. Site icons come from Chrome and fonts are bundled. Developer console captures logs only from a manually connected tab, keeps them in memory, and clears them on disconnect. No analytics or automatic media playback.</p>
        <p className={css.hint}>Local data can be lost if you remove the extension or clear this browser profile.</p>
      </>}
    </section>
  </div>;
}
