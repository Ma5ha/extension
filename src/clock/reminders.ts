export type Reminder = { end: number; remaining: number; done: boolean; sessionId?: string; started?: number; duration?: number; workspace?: string; label?: string; taskKey?: string };
export const emptyReminder: Reminder = { end: 0, remaining: 0, done: false };
export const reminderKey = (kind: string) => `tabora.reminder.${kind}`;
export function parseReminder(raw: unknown): Reminder {
  if (!raw || typeof raw !== 'object') return emptyReminder;
  const v = raw as Partial<Reminder>;
  return typeof v.end === 'number' && Number.isFinite(v.end) && v.end >= 0 && v.end <= 8_640_000_000_000_000 && typeof v.remaining === 'number' && Number.isFinite(v.remaining) && v.remaining >= 0 && v.remaining <= 86_400_000
    ? { end: v.end, remaining: v.remaining, done: v.done === true,
      ...(typeof v.sessionId === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(v.sessionId) ? { sessionId: v.sessionId } : {}),
      ...(typeof v.started === 'number' && Number.isFinite(v.started) && v.started > 0 && v.started <= 8_640_000_000_000_000 ? { started: v.started } : {}),
      ...(typeof v.duration === 'number' && Number.isFinite(v.duration) && v.duration > 0 && v.duration <= 86_400_000 ? { duration: v.duration } : {}),
      ...(v.workspace === 'work' || v.workspace === 'personal' || v.workspace === 'study' ? { workspace: v.workspace } : {}),
      ...(typeof v.label === 'string' ? { label: v.label.slice(0, 200) } : {}),
      ...(typeof v.taskKey === 'string' && /^(tabora\.workspace\.(personal|study)\.)?tabora\.focus\.v1\.\d{4}-\d{2}-\d{2}\.[0-2]$/.test(v.taskKey) ? { taskKey: v.taskKey } : {}),
    } : emptyReminder;
}
export function nextAlarm(time: string, now = new Date()): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Choose a valid time.');
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  const next = new Date(now); next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime();
}

export const validReminderKind = (kind: unknown): kind is string => typeof kind === 'string' && /^(timer|alarm|task:(work|personal|study):\d{4}-\d{2}-\d{2}:[0-2])$/.test(kind);
export function runningTimer(minutes: number, workspace: string, previous = emptyReminder, now = Date.now()): Reminder {
  const remaining = previous.remaining || minutes * 60_000;
  if (!Number.isFinite(remaining) || remaining <= 0 || remaining > 86_400_000) throw new Error('duration');
  return { end: now + remaining, remaining: 0, done: false, sessionId: previous.remaining ? previous.sessionId : crypto.randomUUID(), started: previous.remaining ? previous.started : now, duration: previous.remaining ? previous.duration : remaining, workspace: previous.remaining ? previous.workspace : workspace };
}
