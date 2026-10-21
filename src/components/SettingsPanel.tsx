import type { Settings } from '../adapters/settings';
import styles from '../App.module.css';

export function SettingsPanel({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => Promise<void> }) {
  return <div className={styles.settings}>
    <label>Izgled<select value={settings.theme} onChange={e => void update({ theme: e.target.value as Settings['theme'] })}><option value="light">Svijetla tema</option><option value="dark">Tamna tema</option><option value="system">Prema sistemu</option></select></label>
    <label>Glass materijal <output>{settings.glass === 0 ? 'Neprozirno' : `${settings.glass}%`}</output><input aria-label="Intenzitet glass materijala" type="range" min="0" max="70" step="10" value={settings.glass} onChange={e => void update({ glass: Number(e.target.value) })} /></label>
    <p>Opcioni efekat. Vrijednost 0 čuva neprozirne površine.</p>
    <fieldset><legend>Moduli radnog prostora</legend>{(['agenda', 'gmail', 'music'] as const).map(key => <label className={styles.checkbox} key={key}><input type="checkbox" checked={settings[key]} onChange={e => void update({ [key]: e.target.checked })} />{{ agenda: 'Agenda', gmail: 'Gmail', music: 'Mediji' }[key]}</label>)}</fieldset>
    <p>Raspored i izgled čuvaju se u ovom browseru. Promjene se prenose na druge otvorene Tabora tabove.</p>
    <hr /><h3>Privatnost</h3><p>Tabovi se prikazuju i organizuju lokalno u ovom browseru.</p><p>Google Calendar se opciono povezuje za čitanje današnjih događaja primarnog kalendara. Odspajanje briše prikaz i Chrome keš autorizacije; Google dozvolu možeš opozvati u svom Google nalogu. Događaji i tokeni se ne čuvaju u lokalnim podešavanjima. Gmail je obična prečica. Mediji kontrolišu postojeće tabove; dodatni pristup sajtu je opcioni i može se ukinuti u panelu ili Chrome podešavanjima. Nema analitike ili automatske reprodukcije.</p>
  </div>;
}
