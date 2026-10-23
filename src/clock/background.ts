import { emptyReminder, parseReminder, reminderKey, runningTimer, validReminderKind, type Reminder } from './reminders';
import { completedSession, historyPrefix } from './history';
import { parseTask } from '../focus/model';

export function registerReminders() {
  const prefix = reminderKey('');
  let queue = Promise.resolve();
  function enqueue(action: () => Promise<void>) {
    const operation = queue.catch(() => {}).then(action);
    queue = operation.catch(() => {});
    return operation;
  }
  async function schedule(kind: string, value: Reminder) {
    const key = reminderKey(kind), before = (await chrome.storage.local.get(key))[key];
    await chrome.alarms.clear(key);
    try {
      await chrome.storage.local.set({ [key]: value });
      if (value.end) await chrome.alarms.create(key, { when: value.end });
    } catch (error) {
      const old = parseReminder(before);
      await chrome.storage.local.set({ [key]: old });
      if (old.end) await chrome.alarms.create(key, { when: old.end });
      throw error;
    }
  }
  async function complete(kind: string) {
    const key = reminderKey(kind), value = parseReminder((await chrome.storage.local.get(key))[key]);
    if (!value.end || value.end > Date.now()) return;
    let message = kind === 'timer' ? 'Your timer has finished.' : 'Your alarm time has arrived.';
    if (kind.startsWith('task:')) {
      if (!value.taskKey) { await schedule(kind, emptyReminder); return; }
      const task = parseTask((await chrome.storage.local.get(value.taskKey))[value.taskKey]);
      if (task.done || !task.text.trim()) { await schedule(kind, emptyReminder); return; }
      message = task.text;
    }
    const session = kind === 'timer' ? completedSession(value) : null;
    await chrome.storage.local.set({ [key]: { ...emptyReminder, done: true }, ...(session ? { [historyPrefix + session.id]: session } : {}) });
    try {
      if (await chrome.permissions.contains({ permissions: ['notifications'] })) await chrome.notifications.create(key, { type: 'basic', iconUrl: chrome.runtime.getURL('/reminder.png'), title: kind.startsWith('task:') ? 'Tabora · Task reminder' : 'Tabora', message, priority: 1 });
    } catch { /* Completion remains saved if notifications are blocked by the OS. */ }
  }
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id) return;
    if (message?.type === 'tabora-timer-toggle') {
      let running = false;
      void enqueue(async () => {
        let value = parseReminder((await chrome.storage.local.get(reminderKey('timer')))[reminderKey('timer')]);
        if (value.end && value.end <= Date.now()) { await complete('timer'); value = emptyReminder; }
        const workspace = ['work', 'personal', 'study'].includes(message.workspace) ? message.workspace : 'work';
        const next = value.end ? { ...value, end: 0, remaining: Math.max(0, value.end - Date.now()) } : runningTimer(25, workspace, value);
        running = !!next.end; await schedule('timer', next);
      }).then(() => respond({ ok: true, running }), () => respond({ ok: false }));
      return true;
    }
    if (message?.type !== 'tabora-reminder' || !validReminderKind(message.kind)) return;
    const kind: string = message.kind, value = parseReminder(message.value);
    void enqueue(async () => {
      if (kind === 'timer') await complete('timer');
      if (kind.startsWith('task:') && value.end) {
        const [, workspace, day, index] = kind.split(':');
        const expected = `${workspace === 'work' ? '' : `tabora.workspace.${workspace}.`}tabora.focus.v1.${day}.${index}`;
        if (value.taskKey !== expected) throw new Error('task');
        const task = parseTask((await chrome.storage.local.get(expected))[expected]);
        if (task.done || !task.text.trim()) throw new Error('task');
      }
      await schedule(kind, value);
    }).then(() => respond({ ok: true }), () => respond({ ok: false }));
    return true;
  });
  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name.startsWith(prefix) && validReminderKind(alarm.name.slice(prefix.length))) void enqueue(() => complete(alarm.name.slice(prefix.length))).catch(() => {});
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const [key, change] of Object.entries(changes)) {
      const match = /^(?:tabora\.workspace\.(personal|study)\.)?tabora\.focus\.v1\.(\d{4}-\d{2}-\d{2})\.([0-2])$/.exec(key);
      if (!match) continue;
      const task = parseTask(change.newValue);
      if (task.done || !task.text.trim()) void enqueue(async () => {
        const current = parseTask((await chrome.storage.local.get(key))[key]);
        if (current.done || !current.text.trim()) await schedule(`task:${match[1] ?? 'work'}:${match[2]}:${match[3]}`, emptyReminder);
      }).catch(() => {});
    }
  });
  async function restore() {
    const stored = await chrome.storage.local.get(null);
    for (const [key, raw] of Object.entries(stored)) {
      if (!key.startsWith(prefix)) continue;
      const kind = key.slice(prefix.length), value = parseReminder(raw);
      if (!validReminderKind(kind) || !value.end) continue;
      if (value.end <= Date.now()) await complete(kind);
      else if (!await chrome.alarms.get(key)) await chrome.alarms.create(key, { when: value.end });
    }
  }
  void enqueue(restore).catch(() => {});
}
