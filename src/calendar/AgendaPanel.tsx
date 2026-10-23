import { CalendarBlank, ArrowUpRight } from '@phosphor-icons/react';
import { useCalendar } from './useCalendar';
import { eventTime, nextEvent } from './model';
import styles from '../App.module.css';
import css from './AgendaPanel.module.css';
const messages = {
  setup: 'Calendar connection is not configured in this version yet.',
  disconnected: 'Connect Google Calendar for today’s agenda. Access is read-only.',
  denied: 'Connection was not approved or the window was closed. You can try again.',
  expired: 'Calendar access has expired or been revoked. Connect again.',
  offline: 'Calendar is unavailable offline. Check your connection and try again.',
  forbidden: 'Google denied calendar access. Check permission and Google API configuration.',
  rate: 'Google is limiting requests. Try again later.',
  error: 'Could not load the calendar. Try again.',
  loading: 'Loading calendar…', ready: '',
};
export function AgendaPanel({ compact = false }: { compact?: boolean }) {
  const { status, agenda, busy, connect, disconnect, refresh } = useCalendar();
  const now = new Date(), next = agenda ? nextEvent(agenda.events, now.getTime()) : undefined;
  const timeZone = agenda?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <section className={`${styles.panel} ${styles.agenda} ${compact ? css.compact : ''}`} aria-labelledby="agenda-title" aria-busy={status === 'loading' || busy}>
    <header className={styles.panelHeader}><div><h2 id="agenda-title">{compact && <CalendarBlank size={21} />}{compact ? 'Kalendar' : 'Today'}</h2>{!compact && <p className={styles.meta}>{new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone }).format(now)}</p>}</div>{!compact && <CalendarBlank size={22} />}</header>
    {agenda ? <div className={css.content}>
      {next && <p className={css.next}>Next: <strong>{next.title}</strong> · {eventTime(next, timeZone)}</p>}
      {agenda.events.length === 0 ? <p>No events in your primary calendar today.</p> : <ul className={css.events}>{agenda.events.map(e => <li key={e.id}>
        <span className={css.time}>{eventTime(e, timeZone)}</span><strong>{e.title}</strong>
        <div className={css.links}>{e.url && <a href={e.url} target="_blank" rel="noreferrer">Event<ArrowUpRight size={14} /></a>}{e.meeting && <a href={e.meeting} target="_blank" rel="noreferrer">Join<ArrowUpRight size={14} /></a>}</div>
      </li>)}</ul>}
      <small>Updated {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(agenda.updated)} · Primary calendar</small>
    </div> : <div className={compact ? css.empty : styles.serviceEmpty}>{!compact && <h3>Your agenda</h3>}<p role={['error', 'forbidden', 'rate'].includes(status) ? 'alert' : 'status'}>{compact && status === 'setup' ? 'Calendar connection is not configured yet.' : messages[status]}</p>
      {['disconnected', 'denied', 'expired'].includes(status) && <button className={styles.primary} disabled={busy} onClick={() => void connect()}>Connect Google Calendar</button>}
      {['offline', 'error', 'forbidden', 'rate'].includes(status) && <button disabled={busy} onClick={() => void refresh()}>Try again</button>}
    </div>}
    <div className={css.actions}><a href="https://calendar.google.com/" target="_blank" rel="noreferrer">Open calendar<ArrowUpRight size={16} /></a>
      {status !== 'setup' && status !== 'disconnected' && status !== 'denied' && <button disabled={busy} onClick={() => void disconnect()}>Disconnect</button>}
      {agenda && <button disabled={busy} onClick={() => void refresh()}>Refresh</button>}
    </div>{(!compact || agenda) && <footer className={compact ? css.timezone : styles.timezone}>{compact ? 'Today · ' : <>Time zone<br /></>}<strong>{timeZone}</strong></footer>}
  </section>;
}
