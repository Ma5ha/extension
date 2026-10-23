import { useLocalList } from '../local/useLocalList';
import { useWorkspace, workspaces } from '../workspace/WorkspaceContext';
import { dailyHistory, historyPrefix, parseTimerSession } from './history';
import styles from '../App.module.css';
import css from './TimerHistory.module.css';
export function TimerHistory() {
  const { workspace } = useWorkspace();
  const store = useLocalList(historyPrefix, parseTimerSession);
  const sessions = store.items.filter(s => s.workspace === workspace).sort((a, b) => b.completed - a.completed);
  const days = dailyHistory(sessions);
  return <section className={styles.panel}><header className={styles.panelHeader}><h2>Timer history</h2><span className={styles.count}>{workspaces.find(w => w.id === workspace)?.name}</span></header>
    {!store.ready && !store.error && <p role="status">Loading timer history…</p>}
    {store.error && <p role="alert">{store.error}<button onClick={() => void store.refresh()}>Try again</button></p>}
    {store.ready && !sessions.length && <p>Finished timers will appear here. Paused and reset timers do not count.</p>}
    {!!days.length && <><div className={css.summary}><strong>{sessions.length}<small>Completed</small></strong><strong>{Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60_000)}<small>Focus minutes</small></strong></div><ul className={css.days}>{days.map(([day, value]) => <li key={day}><time dateTime={day}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${day}T12:00:00`))}</time><span>{value.count} sessions · {Math.round(value.duration / 60_000)} min</span></li>)}</ul><details><summary>Recent sessions</summary><ul className={css.days}>{sessions.slice(0, 30).map(s => <li key={s.id}><time dateTime={new Date(s.completed).toISOString()}>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(s.completed)}</time><span>{Math.round(s.duration / 60_000)} min</span></li>)}</ul></details></>}
  </section>;
}
