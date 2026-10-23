import { useState } from 'react';
import { Bell } from '@phosphor-icons/react';
import { useLocalValue } from '../local/useLocalValue';
import { emptyReminder, parseReminder, reminderKey } from '../clock/reminders';
import { notificationPermission, setReminder } from '../clock/adapter';
import { useWorkspace, workspaceKey } from '../workspace/WorkspaceContext';
import css from './TaskReminder.module.css';
export function TaskReminder({ day, index, text, done }: { day: string; index: number; text: string; done: boolean }) {
  const { workspace } = useWorkspace(), kind = `task:${workspace}:${day}:${index}`;
  const store = useLocalValue(reminderKey(kind), emptyReminder, parseReminder);
  const [when, setWhen] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const active = store.ready && store.value.end > 0;
  async function save(cancel = false) {
    const end = new Date(when).getTime();
    if (!cancel && (!Number.isFinite(end) || end <= Date.now())) { setMessage('Choose a future date and time.'); return; }
    setBusy(true); setMessage('');
    try {
      if (!cancel && !await notificationPermission()) setMessage('Notifications are off. The reminder stays visible here.');
      await setReminder(kind, cancel ? emptyReminder : { end, remaining: 0, done: false, label: text, workspace, taskKey: workspaceKey(`tabora.focus.v1.${day}.${index}`, workspace) });
      await store.refresh();
    } catch { setMessage('Could not save the reminder. Try again.'); }
    finally { setBusy(false); }
  }
  if (!text.trim() || done) return null;
  return <details className={css.reminder}><summary aria-label={`Reminder for ${text}`}><Bell size={13} aria-hidden="true" />{active ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(store.value.end) : store.value.done ? 'Reminder reached' : 'Remind me'}</summary>
    <div className={css.controls}><label>Local date and time<input aria-label={`Reminder time for task ${index + 1}`} type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} /></label><button disabled={!store.ready || busy || !when} onClick={() => void save()}>Set reminder</button>{(active || store.value.done) && <button disabled={busy} onClick={() => void save(true)}>Clear reminder</button>}</div>
    {(message || store.error) && <p role="status">{message || store.error}</p>}
  </details>;
}
