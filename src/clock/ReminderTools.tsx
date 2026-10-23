import { useEffect, useState } from 'react';
import { Timer, Bell } from '@phosphor-icons/react';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { completedSession, historyPrefix } from './history';
import { writeLocal } from '../local/store';
import { setReminder } from './adapter';
import { isExtension } from '../adapters/chrome';
import { useLocalValue } from '../local/useLocalValue';
import { emptyReminder, nextAlarm, parseReminder, reminderKey, runningTimer, type Reminder } from './reminders';
import css from './ReminderTools.module.css';

export function ReminderControl({ kind }: { kind: 'timer' | 'alarm' }) {
  const { workspace } = useWorkspace();
  const store = useLocalValue(reminderKey(kind), emptyReminder, parseReminder);
  const [minutes, setMinutes] = useState('5'), [time, setTime] = useState('09:00');
  const [now, setNow] = useState(Date.now), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const value = store.value;
  const seconds = Math.max(0, Math.ceil((value.end ? value.end - now : value.remaining) / 1000));
  const finished = value.done || (value.end > 0 && seconds === 0);
  useEffect(() => {
    if (!value.end) return;
    const update = () => setNow(Date.now());
    update(); const id = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', update); };
  }, [value.end]);
  useEffect(() => {
    if (isExtension || kind !== 'timer' || !finished || !value.end) return;
    const session = completedSession(value);
    if (session) void writeLocal(historyPrefix + session.id, session).catch(() => {});
  }, [finished, kind, value]);
  async function change(next: Reminder) {
    setBusy(true); setError('');
    try {
      await setReminder(kind, next);
      await store.refresh();
      setNow(Date.now());
    } catch { setError('Could not save. Try again.'); }
    finally { setBusy(false); }
  }
  async function start() {
    setError('');
    try {
      if (isExtension && !await chrome.permissions.contains({ permissions: ['notifications'] })) {
        const allowed = await chrome.permissions.request({ permissions: ['notifications'] });
        setNotice(allowed ? '' : 'Notifications are off. Completion will appear here.');
      }
      const duration = value.remaining || Number(minutes) * 60_000;
      if (kind === 'timer' && (!Number.isFinite(duration) || duration < 60_000 || duration > 86_400_000) && !value.remaining) {
        setError('Choose 1–1440 minutes.'); return;
      }
      await change(kind === 'timer' ? runningTimer(Number(minutes), workspace, value) : { end: nextAlarm(time), remaining: 0, done: false });
    } catch { setError('Could not start. Check the time and try again.'); }
  }
  return <section className={css.tool} aria-label={kind === 'timer' ? 'Timer' : 'Alarm'}>
    <h3>{kind === 'timer' ? <Timer size={15} aria-hidden="true" /> : <Bell size={15} aria-hidden="true" />}{kind === 'timer' ? 'Timer' : 'Alarm'}</h3>
    {finished ? <p role="status" className={css.finished}>{kind === 'timer' ? 'Time is up' : 'Alarm reached'}</p> : value.end || value.remaining ? <output className={css.readout} aria-label={kind === 'timer' ? 'Time remaining' : 'Alarm time'}>{kind === 'timer' ? `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : new Intl.DateTimeFormat('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(value.end)}</output> : <label className={css.input}>{kind === 'timer' ? 'Minutes' : 'Local time'}<input aria-label={kind === 'timer' ? 'Timer minutes' : 'Alarm time'} type={kind === 'timer' ? 'number' : 'time'} min={kind === 'timer' ? 1 : undefined} max={kind === 'timer' ? 1440 : undefined} step={kind === 'timer' ? 1 : undefined} value={kind === 'timer' ? minutes : time} onChange={event => kind === 'timer' ? setMinutes(event.target.value) : setTime(event.target.value)} /></label>}
    {kind === 'timer' && (value.end > 0 || value.remaining > 0) && value.workspace && <small className={css.hint}>Session · {value.workspace}</small>}
    <div className={css.actions}>
      {!finished && (!value.end ? <button disabled={!store.ready || busy} onClick={() => void start()}>{value.remaining ? 'Resume' : kind === 'timer' ? 'Start' : 'Set alarm'}</button> : kind === 'timer' ? <button disabled={busy} onClick={() => void change({ ...value, end: 0, remaining: Math.max(0, value.end - Date.now()), done: false })}>Pause</button> : null)}
      {(value.end > 0 || value.remaining > 0 || finished) && <button disabled={busy} onClick={() => void change(emptyReminder)}>{finished ? 'Dismiss' : kind === 'timer' ? 'Reset' : 'Cancel'}</button>}
    </div>
    {notice && <p className={css.hint}>{notice}</p>}
    {(error || store.error) && <p role="alert">{error || store.error}</p>}
  </section>;
}
export function ReminderTools() {
  return <details className={css.tools}><summary><Timer size={14} aria-hidden="true" />Timer & alarm</summary><div className={css.grid}><ReminderControl kind="timer" /><ReminderControl kind="alarm" /></div><p className={css.hint}>Alarms use local time. Notifications need permission. Sleeping devices notify after waking.</p></details>;
}
