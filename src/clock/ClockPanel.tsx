import { useEffect, useId, useState } from 'react';
import { Clock, GlobeHemisphereWest, CalendarDots, SunHorizon } from '@phosphor-icons/react';
import { dayOverview } from './model';
import styles from '../App.module.css';
import css from './ClockPanel.module.css';

export function ClockPanel() {
  const titleId = useId();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function sync() {
      clearTimeout(timer);
      setNow(new Date());
      if (!document.hidden) timer = setTimeout(sync, 60_000 - Date.now() % 60_000 + 20);
    }
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', sync); };
  }, []);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const overview = dayOverview(now);
  const time = new Intl.DateTimeFormat('sr-Latn', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  const date = new Intl.DateTimeFormat('sr-Latn', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  return <section className={`${styles.panel} ${css.clock}`} aria-labelledby={titleId}>
    <header className={css.header}><h2 id={titleId}><Clock size={18} aria-hidden="true" />Tvoj trenutak</h2><span>{overview.year}</span></header>
    <time className={css.time} dateTime={now.toISOString()}>{time}</time>
    <p className={css.date}>{date}</p>
    <p className={css.zone}><GlobeHemisphereWest size={14} aria-hidden="true" />{zone.replaceAll('_', ' ')}</p>
    <div className={css.details}>
      <span><CalendarDots size={16} aria-hidden="true" />{overview.week}. sedmica</span>
      <span><SunHorizon size={16} aria-hidden="true" />{overview.weekend ? 'Vikend' : `Do subote: ${overview.untilSaturday} ${overview.untilSaturday === 1 ? 'dan' : 'dana'}`}</span>
    </div>
    <div className={css.year}><span>Dan {overview.day} / {overview.total}</span><progress aria-label="Protekli dani u godini" value={overview.day} max={overview.total} /></div>
  </section>;
}
