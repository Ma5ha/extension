import { useEffect, useState } from 'react';
import { Clock, CalendarDots, SunHorizon, ChartLine } from '@phosphor-icons/react';
import { ReminderTools } from './ReminderTools';
import { dayOverview } from './model';
import css from './ClockPanel.module.css';

export function ClockPanel() {
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
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  return <div className={css.widgets} role="group" aria-label="Clock and day overview">
    <section className={css.widget} aria-label="Local time">
      <h2><Clock size={14} aria-hidden="true" />Now</h2>
      <time className={css.time} dateTime={now.toISOString()}>{time}</time>
      <small title={zone}>{zone.split('/').at(-1)?.replaceAll('_', ' ')}</small>
    </section>
    <section className={css.widget} aria-label="Today’s date">
      <h2><CalendarDots size={14} aria-hidden="true" />Today</h2>
      <p className={css.date}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(now)}</p>
      <small>{new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(now)}</small>
    </section>
    <section className={css.widget} aria-label="Week overview">
      <h2><SunHorizon size={14} aria-hidden="true" />Week</h2>
      <p className={css.value}>{overview.week}</p>
      <div className={css.weekDays} aria-label="This week">{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => <span key={day} title={day} aria-label={day} aria-current={(now.getDay() + 6) % 7 === index ? 'date' : undefined}>{day.slice(0, 1)}</span>)}</div>
      <small>{overview.weekend ? 'Weekend' : `Until Saturday: ${overview.untilSaturday} ${overview.untilSaturday === 1 ? 'day' : 'days'}`}</small>
    </section>
    <section className={css.widget} aria-label="Year progress">
      <h2><ChartLine size={14} aria-hidden="true" />{overview.year}</h2>
      <p className={css.value}>{Math.round(overview.day / overview.total * 100)}<span>%</span></p>
      <small>Day {overview.day} / {overview.total}</small>
      <progress aria-label="Days elapsed this year" value={overview.day} max={overview.total} />
    </section>
    <ReminderTools />
  </div>;
}
