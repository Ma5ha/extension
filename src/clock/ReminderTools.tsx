import { useEffect, useState } from 'react';
import { Timer, Bell, SpeakerHigh } from '@phosphor-icons/react';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { completedSession, historyPrefix } from './history';
import { writeLocal } from '../local/store';
import { setReminder } from './adapter';
import { isExtension } from '../adapters/chrome';
import { useLocalValue } from '../local/useLocalValue';
import { emptyReminder, nextAlarm, parseReminder, reminderKey, runningTimer, type Reminder } from './reminders';
import css from './ReminderTools.module.css';
import { Stopwatch } from './Stopwatch';
import { parseSound, soundKey, parseSoundError, soundErrorKey } from './sound';

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
      if (kind === 'timer' && !value.remaining && (!Number.isInteger(Number(minutes)) || Number(minutes) < 1 || Number(minutes) > 1440)) { setError('Choose 1–1440 whole minutes.'); return; }
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
    <h3>{kind === 'timer' ? <Timer size={18} aria-hidden="true" /> : <Bell size={18} aria-hidden="true" />}{kind === 'timer' ? 'Timer' : 'Alarm'}<span className={css.status}>{finished ? 'Finished' : value.end ? 'Running' : value.remaining ? 'Paused' : 'Ready'}</span></h3>
    {finished ? <p role="status" className={css.finished}>{kind === 'timer' ? 'Time is up' : 'Alarm reached'}</p> : value.end || value.remaining ? <output className={css.readout} aria-label={kind === 'timer' ? 'Time remaining' : 'Alarm time'}>{kind === 'timer' ? `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : new Intl.DateTimeFormat('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(value.end)}</output> : <label className={css.input}><span>{kind === 'timer' ? 'Duration in minutes' : 'Local alarm time'}</span><input aria-label={kind === 'timer' ? 'Timer minutes' : 'Alarm time'} type={kind === 'timer' ? 'number' : 'time'} min={kind === 'timer' ? 1 : undefined} max={kind === 'timer' ? 1440 : undefined} step={kind === 'timer' ? 1 : undefined} value={kind === 'timer' ? minutes : time} onChange={event => kind === 'timer' ? setMinutes(event.target.value) : setTime(event.target.value)} /></label>}
    {kind === 'timer' && !finished && !value.end && !value.remaining && <div className={css.presets} aria-label="Timer presets">{[5, 15, 25, 45].map(preset => <button key={preset} aria-pressed={Number(minutes) === preset} onClick={() => setMinutes(String(preset))}>{preset} min</button>)}</div>}
    {kind === 'alarm' && <p className={css.hint}>{Intl.DateTimeFormat().resolvedOptions().timeZone} · {value.end ? 'Scheduled for the next occurrence' : 'Next occurrence of this time'}</p>}
    {kind === 'timer' && (value.end > 0 || value.remaining > 0) && value.workspace && <small className={css.hint}>Session · {value.workspace}</small>}
    <div className={css.actions}>
      {!finished && (!value.end ? <button className={css.primary} disabled={!store.ready || busy} onClick={() => void start()}>{value.remaining ? 'Resume' : kind === 'timer' ? 'Start' : 'Set alarm'}</button> : kind === 'timer' ? <button className={css.primary} disabled={busy} onClick={() => void change({ ...value, end: 0, remaining: Math.max(0, value.end - Date.now()), done: false })}>Pause</button> : null)}
      {(value.end > 0 || value.remaining > 0 || finished) && <button disabled={busy} onClick={() => void change(emptyReminder)}>{finished ? 'Dismiss' : kind === 'timer' ? 'Reset' : 'Cancel'}</button>}
    </div>
    {notice && <p className={css.hint}>{notice}</p>}
    {(error || store.error) && <p role="alert">{error || store.error}</p>}
  </section>;
}
export function ReminderTools() {
  const sound = useLocalValue(soundKey, true, parseSound);
  const soundFailure = useLocalValue(soundErrorKey, false, parseSoundError);
  const [error, setError] = useState(''), [previewing, setPreviewing] = useState(false);
  async function preview() {
    setError(''); setPreviewing(true);
    try {
      const audio = new Audio(isExtension ? chrome.runtime.getURL('/reminder-chime.wav') : '/reminder-chime.wav');
      audio.volume = .9;
      await audio.play();
      await soundFailure.save(false);
    } catch { setError('Sound could not play. Check browser audio settings and try again.'); }
    finally { setPreviewing(false); }
  }
  return <details className={css.tools}><summary><Timer size={16} aria-hidden="true" />Time tools<span className={css.summaryHint}>Timer · Alarm · Stopwatch</span></summary>
    <div className={css.soundBar}><span><SpeakerHigh size={16} aria-hidden="true" />Completion sound</span><label><input type="checkbox" checked={sound.value} disabled={!sound.ready} onChange={e => void sound.save(e.target.checked)} />Sound {sound.value ? 'on' : 'off'}</label><button disabled={!sound.ready || !sound.value || previewing} onClick={() => void preview()}>Preview sound</button></div>
    {soundFailure.value && <p role="alert" className={css.hint}>The completion sound could not play in the background. Try Preview sound and reload the extension.</p>}
    {(error || sound.error) && <p role="alert">{error || sound.error}</p>}
    <div className={css.grid}><ReminderControl kind="timer" /><ReminderControl kind="alarm" /><Stopwatch /></div>
    <p className={css.hint}>Alarms use local time. Sleeping devices alert after waking. Sound follows browser and system volume. Background alerts require the Chrome extension.</p>
  </details>;
}
