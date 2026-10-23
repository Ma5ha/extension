import { localDay } from '../focus/model';
import type { Reminder } from './reminders';
export const historyPrefix = 'tabora.timer-history.v1.';
export interface TimerSession { id: string; started: number; completed: number; duration: number; workspace: string; }
export function completedSession(value: Reminder): TimerSession | null {
  return value.sessionId && value.started && value.duration && value.end ? { id: value.sessionId, started: value.started, completed: value.end, duration: value.duration, workspace: value.workspace ?? 'work' } : null;
}
export function parseTimerSession(raw: unknown): TimerSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as TimerSession;
  return typeof s.id === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(s.id) && Number.isFinite(s.started) && s.started > 0 && Number.isFinite(s.completed) && s.completed >= s.started && s.completed <= 8_640_000_000_000_000 && Number.isFinite(s.duration) && s.duration > 0 && s.duration <= 86_400_000 && ['work', 'personal', 'study'].includes(s.workspace) ? s : null;
}
export function dailyHistory(sessions: TimerSession[]) {
  const days = new Map<string, { count: number; duration: number }>();
  for (const s of sessions) { const day = localDay(new Date(s.completed)), previous = days.get(day) ?? { count: 0, duration: 0 }; days.set(day, { count: previous.count + 1, duration: previous.duration + s.duration }); }
  return [...days].sort(([a], [b]) => b.localeCompare(a));
}
