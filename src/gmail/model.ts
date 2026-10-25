export interface Mail { id: string; threadId: string; subject: string; from: string; date: number | null; unread: boolean }
export interface Inbox { messages: Mail[]; email: string; updated: number; more: boolean }
export function parseMail(value: unknown): Mail | null {
  if (!value || typeof value !== 'object') return null;
  const m = value as Record<string, unknown>;
  if (typeof m.id !== 'string' || !/^[a-f0-9]+$/i.test(m.id) || typeof m.threadId !== 'string' || !/^[a-f0-9]+$/i.test(m.threadId)) return null;
  const payload = m.payload as { headers?: { name?: unknown; value?: unknown }[] } | undefined;
  const headers = Array.isArray(payload?.headers) ? payload.headers : [];
  const header = (name: string) => headers.find(h => typeof h?.name === 'string' && h.name.toLowerCase() === name)?.value;
  const text = (name: string, fallback: string) => typeof header(name) === 'string' ? String(header(name)).slice(0, 1000) : fallback;
  const date = typeof m.internalDate === 'string' ? Number(m.internalDate) : NaN;
  return { id: m.id, threadId: m.threadId, subject: text('subject', '(No subject)'), from: text('from', 'Unknown sender'), date: Number.isFinite(date) && Math.abs(date) < 8.64e15 ? date : null, unread: Array.isArray(m.labelIds) && m.labelIds.includes('UNREAD') };
}
export function mailUrl(email: string, threadId?: string) {
  return `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(email)}#${threadId ? `all/${encodeURIComponent(threadId)}` : 'inbox'}`;
}
