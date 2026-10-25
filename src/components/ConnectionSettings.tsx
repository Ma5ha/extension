import { useState } from 'react';
import { useLocalValue } from '../local/useLocalValue';
import { calendarAvailable, connectCalendar, disconnectCalendar, connectionKey as calendarKey } from '../calendar/adapter';
import { connectGmail, disconnectGmail, connectionKey as gmailKey } from '../gmail/adapter';
import css from './SettingsPanel.module.css';
const parseEnabled = (value: unknown) => value === true;
function GoogleConnection({ gmail = false }: { gmail?: boolean }) {
  const connection = useLocalValue(gmail ? gmailKey : calendarKey, false, parseEnabled);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const available = calendarAvailable();
  async function toggle() {
    if (busy) return; setBusy(true); setError('');
    try {
      if (gmail) { if (connection.value) await disconnectGmail(); else await connectGmail(); }
      else { if (connection.value) await disconnectCalendar(); else await connectCalendar(); }
      await connection.refresh();
    } catch { setError('The connection could not be changed. Check Google access and try again.'); }
    finally { setBusy(false); }
  }
  return <section className={css.connection}><div><h3>{gmail ? 'Gmail' : 'Google Calendar'}</h3><p>{gmail ? 'Inbox senders and subjects. Message content starts hidden.' : 'Read-only events from your primary calendar.'}</p><small>{!available ? 'Not configured in this build' : !connection.ready ? 'Checking…' : connection.value ? 'Enabled · Access checked when loading' : 'Not connected'}</small></div>
    <button disabled={busy || !connection.ready || !available} onClick={() => void toggle()}>{busy ? 'Please wait…' : connection.value ? 'Disconnect' : 'Connect'}</button>{(error || connection.error) && <p role="alert">{error || connection.error}</p>}
  </section>;
}
export function ConnectionSettings() {
  return <div className={css.section}>
    <p>Google services are optional. Each asks for its own access.</p><GoogleConnection /><GoogleConnection gmail />
    <section className={css.connection}><div><h3>RSS sources</h3><p>Add and refresh feeds in News. Site access is requested for each source.</p></div></section>
    <section className={css.connection}><div><h3>Media & Chrome bookmarks</h3><p>Manage access in the corresponding widget. Site access can also be revoked in Chrome extension settings.</p></div></section>
    <p className={css.hint}>Disconnecting clears the view and cached service token. To revoke Google consent, use <a href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">Google connected apps</a>.</p>
  </div>;
}
