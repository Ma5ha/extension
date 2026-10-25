import { navigationNames, defaultNavigation } from '../workspace/navigation';
import type { Settings } from '../adapters/settings';
import styles from '../App.module.css';
import css from './SettingsPanel.module.css';
export function SidebarSettings({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => Promise<void> }) {
  return <div className={css.section}>
    <h3>Your sidebar</h3><p>Choose the pages shown in the side menu. This choice applies to all workspaces in this browser.</p>
    <fieldset><legend>Visible pages</legend>{navigationNames.map(name => <label className={styles.checkbox} key={name}><input type="checkbox" checked={settings.sidebarItems.includes(name)} disabled={name === 'Work'} onChange={event => void update({ sidebarItems: event.target.checked ? [...settings.sidebarItems, name] : settings.sidebarItems.filter(item => item !== name) })} />{name}{name === 'Work' && <small> · Always available</small>}</label>)}</fieldset>
    <button onClick={() => void update({ sidebarItems: [...defaultNavigation] })}>Show all pages</button>
    <p className={css.hint}>Settings stays available below the menu. Hiding a page does not delete its data or hide its workspace widget.</p>
    <p className={css.hint}>Developer console opens a full-width console page. Leaving the console view disconnects it and clears its in-memory logs; connect again in the new view.</p>
  </div>;
}
