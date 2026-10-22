import { CalendarBlank, ArrowUpRight } from '@phosphor-icons/react';
import { useCalendar } from './useCalendar';
import { eventTime, nextEvent } from './model';
import styles from '../App.module.css';
import css from './AgendaPanel.module.css';
const messages = {
  setup: 'Povezivanje kalendara još nije podešeno u ovoj verziji.',
  disconnected: 'Poveži Google Calendar za današnju agendu. Pristup služi samo za čitanje događaja.',
  denied: 'Povezivanje nije odobreno ili je prozor zatvoren. Možeš pokušati ponovo.',
  expired: 'Pristup kalendaru je istekao ili ukinut. Poveži ga ponovo.',
  offline: 'Kalendar nije dostupan bez mreže. Provjeri vezu i pokušaj ponovo.',
  forbidden: 'Google ne dozvoljava pristup kalendaru. Provjeri dozvolu i Google API konfiguraciju.',
  rate: 'Google trenutno ograničava zahtjeve. Pokušaj ponovo kasnije.',
  error: 'Kalendar nije učitan. Pokušaj ponovo.',
  loading: 'Učitavanje kalendara…', ready: '',
};
export function AgendaPanel({ compact = false }: { compact?: boolean }) {
  const { status, agenda, busy, connect, disconnect, refresh } = useCalendar();
  const now = new Date(), next = agenda ? nextEvent(agenda.events, now.getTime()) : undefined;
  const timeZone = agenda?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <section className={`${styles.panel} ${styles.agenda} ${compact ? css.compact : ''}`} aria-labelledby="agenda-title" aria-busy={status === 'loading' || busy}>
    <header className={styles.panelHeader}><div><h2 id="agenda-title">{compact && <CalendarBlank size={21} />}{compact ? 'Kalendar' : 'Danas'}</h2>{!compact && <p className={styles.meta}>{new Intl.DateTimeFormat('sr-Latn', { weekday: 'long', day: 'numeric', month: 'long', timeZone }).format(now)}</p>}</div>{!compact && <CalendarBlank size={22} />}</header>
    {agenda ? <div className={css.content}>
      {next && <p className={css.next}>Sljedeće: <strong>{next.title}</strong> · {eventTime(next, timeZone)}</p>}
      {agenda.events.length === 0 ? <p>Danas nema događaja u primarnom kalendaru.</p> : <ul className={css.events}>{agenda.events.map(e => <li key={e.id}>
        <span className={css.time}>{eventTime(e, timeZone)}</span><strong>{e.title}</strong>
        <div className={css.links}>{e.url && <a href={e.url} target="_blank" rel="noreferrer">Događaj<ArrowUpRight size={14} /></a>}{e.meeting && <a href={e.meeting} target="_blank" rel="noreferrer">Pridruži se<ArrowUpRight size={14} /></a>}</div>
      </li>)}</ul>}
      <small>Osvježeno {new Intl.DateTimeFormat('sr-Latn', { hour: '2-digit', minute: '2-digit', timeZone }).format(agenda.updated)} · Primarni kalendar</small>
    </div> : <div className={compact ? css.empty : styles.serviceEmpty}>{!compact && <h3>Tvoja agenda</h3>}<p role={['error', 'forbidden', 'rate'].includes(status) ? 'alert' : 'status'}>{compact && status === 'setup' ? 'Povezivanje kalendara još nije podešeno.' : messages[status]}</p>
      {['disconnected', 'denied', 'expired'].includes(status) && <button className={styles.primary} disabled={busy} onClick={() => void connect()}>Poveži Google Calendar</button>}
      {['offline', 'error', 'forbidden', 'rate'].includes(status) && <button disabled={busy} onClick={() => void refresh()}>Pokušaj ponovo</button>}
    </div>}
    <div className={css.actions}><a href="https://calendar.google.com/" target="_blank" rel="noreferrer">Otvori kalendar<ArrowUpRight size={16} /></a>
      {status !== 'setup' && status !== 'disconnected' && status !== 'denied' && <button disabled={busy} onClick={() => void disconnect()}>Odspoji</button>}
      {agenda && <button disabled={busy} onClick={() => void refresh()}>Osvježi</button>}
    </div>{(!compact || agenda) && <footer className={compact ? css.timezone : styles.timezone}>{compact ? 'Danas · ' : <>Vremenska zona<br /></>}<strong>{timeZone}</strong></footer>}
  </section>;
}
