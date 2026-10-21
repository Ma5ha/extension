export interface DailyTask { text: string; done: boolean; }
export function parseNote(raw: unknown): string { return typeof raw === 'string' ? raw.slice(0, 20000) : ''; }
export function parseTask(raw: unknown): DailyTask {
  const v = raw && typeof raw === 'object' ? raw as Partial<DailyTask> : {};
  return { text: typeof v.text === 'string' ? v.text.slice(0, 200) : '', done: v.done === true };
}
export function localDay(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
