import { KeyboardShortcuts } from '../workspace/KeyboardShortcuts';
import type { CSSProperties } from 'react';
import { fontSizePresets, type Settings } from '../adapters/settings';
import styles from '../App.module.css';

export function SettingsPanel({ settings, update, editLayout }: { settings: Settings; update: (patch: Partial<Settings>) => Promise<void>; editLayout?: () => void }) {
  return <div className={styles.settings}>
    <label>Appearance<select value={settings.theme} onChange={e => void update({ theme: e.target.value as Settings['theme'] })}><option value="light">Light theme</option><option value="dark">Dark theme</option><option value="system">System theme</option></select></label>
    <fieldset className={styles.fontPresets}><legend>Font size</legend><p>Choose your text size. Preview changes instantly across the workspace.</p><div role="group" aria-label="Font size presets">{fontSizePresets.map(({ value, label, pixels }) => <button key={value} aria-pressed={settings.fontSize === value} onClick={() => void update({ fontSize: value })}><span className={styles.fontSample} style={{ fontSize: `${pixels * 1.5}px` }}>Aa</span><span>{label}</span></button>)}</div></fieldset>
    <label>Layout<select value={settings.layoutMode} onChange={event => void update({ layoutMode: event.target.value as Settings['layoutMode'] })}><option value="console">Workspace console</option><option value="custom">Custom widgets</option></select></label>
    {editLayout && <button onClick={editLayout}>Edit layout</button>}
    <p>The workspace console keeps tabs and sessions in the center, with daily tools on the right. Your custom widget layout stays saved.</p>
    <label className={styles.checkbox}><input type="checkbox" checked={settings.backgroundMotion} onChange={event => void update({ backgroundMotion: event.target.checked })} />Animate background</label>
    <fieldset className={styles.materialSettings}><legend>Material</legend>
      <label>Card transparency <output>{settings.glass === 0 ? 'Opaque' : `${settings.glass}%`}</output><input aria-label="Card transparency" type="range" min="0" max="70" step="5" style={{ '--range-fill': `${settings.glass / 70 * 100}%` } as CSSProperties} value={settings.glass} onChange={e => void update({ glass: Number(e.target.value) })} /></label>
      <label>Background blur <output>{settings.blur === 0 ? 'No blur' : `${settings.blur} px`}</output><input aria-label="Material background blur" type="range" min="0" max="32" step="2" style={{ '--range-fill': `${settings.blur / 32 * 100}%` } as CSSProperties} value={settings.blur} onChange={e => void update({ blur: Number(e.target.value) })} /></label>
      <p>Blur softens the background behind transparent cards. Increase transparency to see the effect; text and controls stay sharp.</p>
    </fieldset>
    <fieldset><legend>Workspace modules</legend>{(['clock', 'agenda', 'gmail', 'music', 'bookmarks', 'sessions', 'focus'] as const).map(key => <label className={styles.checkbox} key={key}><input type="checkbox" checked={settings[key]} onChange={e => void update({ [key]: e.target.checked })} />{{ clock: 'Clock and day', agenda: 'Agenda', gmail: 'Gmail', music: 'Media', bookmarks: 'Sačuvani linkovi', sessions: 'Saved sessions', focus: 'Focus and notes' }[key]}</label>)}</fieldset>
    <p>Your layout, appearance, sessions, notes and daily tasks are saved in this browser. Changes sync across open Tabora tabs.</p>
    <KeyboardShortcuts /><hr /><h3>Privacy</h3><p>Tabs are displayed and organized locally in this browser. Site icons come from Chrome; the font is bundled with the extension. Bookmarks use your Chrome bookmarks with optional permission. Editing or deleting them changes Chrome bookmarks.</p><p>Google Calendar can optionally show today’s events from your primary calendar. Disconnecting clears the view and Chrome’s authorization cache; you can revoke Google access in your Google account. Events and tokens are not saved in local settings. Gmail is a shortcut. Media controls existing tabs; optional site access can be revoked in the panel or Chrome settings. No analytics or automatic playback.</p>
  </div>;
}
