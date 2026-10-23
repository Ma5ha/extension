import { isExtension } from '../adapters/chrome';
import { readLocal, writeLocal } from '../local/store';
import { parseReminder, reminderKey, runningTimer, type Reminder } from './reminders';
export async function setReminder(kind: string, value: Reminder) {
  if (isExtension) {
    const response = await chrome.runtime.sendMessage({ type: 'tabora-reminder', kind, value });
    if (!response?.ok) throw new Error('reminder');
  } else await writeLocal(reminderKey(kind), value);
}
export async function notificationPermission(): Promise<boolean> {
  return isExtension && (await chrome.permissions.contains({ permissions: ['notifications'] }) || await chrome.permissions.request({ permissions: ['notifications'] }));
}
export async function toggleTimer(workspace: string) {
  if (isExtension) {
    const response = await chrome.runtime.sendMessage({ type: 'tabora-timer-toggle', workspace });
    if (!response?.ok) throw new Error('timer');
    return response.running as boolean;
  }
  const previous = parseReminder(await readLocal(reminderKey('timer')));
  const next = previous.end > Date.now() ? { ...previous, end: 0, remaining: previous.end - Date.now() } : runningTimer(25, workspace, previous.done || previous.end ? undefined : previous);
  await setReminder('timer', next); return !!next.end;
}
