import type { CSSProperties } from 'react';
import type { Settings } from '../adapters/settings';
import styles from '../App.module.css';

export function SettingsPanel({ settings, update, editLayout }: { settings: Settings; update: (patch: Partial<Settings>) => Promise<void>; editLayout?: () => void }) {
  return <div className={styles.settings}>
    <label>Izgled<select value={settings.theme} onChange={e => void update({ theme: e.target.value as Settings['theme'] })}><option value="light">Svijetla tema</option><option value="dark">Tamna tema</option><option value="system">Prema sistemu</option></select></label>
    <label>Raspored<select value={settings.layoutMode} onChange={event => void update({ layoutMode: event.target.value as Settings['layoutMode'] })}><option value="console">Radna konzola</option><option value="custom">Prilagođeni widgeti</option></select></label>
    {editLayout && <button onClick={editLayout}>Uredi prilagođeni raspored</button>}
    <p>Radna konzola čuva tabove i sesije u sredini, a dnevne alate desno. Prethodni raspored widgeta ostaje sačuvan u prilagođenom režimu.</p>
    <fieldset className={styles.materialSettings}><legend>Materijal</legend>
      <label>Prozirnost kartica <output>{settings.glass === 0 ? 'Neprozirno' : `${settings.glass}%`}</output><input aria-label="Prozirnost kartica" type="range" min="0" max="70" step="5" style={{ '--range-fill': `${settings.glass / 70 * 100}%` } as CSSProperties} value={settings.glass} onChange={e => void update({ glass: Number(e.target.value) })} /></label>
      <label>Zamućenje pozadine <output>{settings.blur === 0 ? 'Bez blura' : `${settings.blur} px`}</output><input aria-label="Zamućenje pozadine materijala" type="range" min="0" max="32" step="2" style={{ '--range-fill': `${settings.blur / 32 * 100}%` } as CSSProperties} value={settings.blur} onChange={e => void update({ blur: Number(e.target.value) })} /></label>
      <p>Blur omekšava pozadinu iza prozirnih kartica. Povećaj prozirnost da vidiš efekat; tekst i kontrole ostaju oštri.</p>
    </fieldset>
    <fieldset><legend>Moduli radnog prostora</legend>{(['agenda', 'gmail', 'music', 'bookmarks', 'sessions', 'focus'] as const).map(key => <label className={styles.checkbox} key={key}><input type="checkbox" checked={settings[key]} onChange={e => void update({ [key]: e.target.checked })} />{{ agenda: 'Agenda', gmail: 'Gmail', music: 'Mediji', bookmarks: 'Sačuvani linkovi', sessions: 'Sačuvane sesije', focus: 'Fokus i bilješke' }[key]}</label>)}</fieldset>
    <p>Raspored, izgled, sesije, bilješke i dnevni zadaci čuvaju se u ovom browseru. Promjene se prenose na druge otvorene Tabora tabove.</p>
    <hr /><h3>Privatnost</h3><p>Tabovi se prikazuju i organizuju lokalno u ovom browseru. Ikonice sajtova dolaze iz Chrome-a; font je uključen u ekstenziju. Widget koristi iste Chrome bookmarkove uz opcionu dozvolu. Izmjene i uklanjanje mijenjaju Chrome bookmarkove.</p><p>Google Calendar se opciono povezuje za čitanje današnjih događaja primarnog kalendara. Odspajanje briše prikaz i Chrome keš autorizacije; Google dozvolu možeš opozvati u svom Google nalogu. Događaji i tokeni se ne čuvaju u lokalnim podešavanjima. Gmail je obična prečica. Mediji kontrolišu postojeće tabove; dodatni pristup sajtu je opcioni i može se ukinuti u panelu ili Chrome podešavanjima. Nema analitike ili automatske reprodukcije.</p>
  </div>;
}
