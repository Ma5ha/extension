export type MediaCommand = { type: 'play' | 'pause' } | { type: 'volume' | 'seek'; value: number };
export interface MediaItem { id: string; kind: string; paused: boolean; ended: boolean; volume: number; muted: boolean; time: number; duration: number | null; ranges: [number, number][] }
export interface FrameMedia { items: MediaItem[]; frames: number; error?: string }
export interface Source { tab: chrome.tabs.Tab; items: (MediaItem & { frameId: number; documentId: string })[]; status: 'ready' | 'permission' | 'unavailable' | 'discarded'; frames: number }
export function sitePattern(url?: string) {
  try { const u = new URL(url!); return ['https:', 'http:'].includes(u.protocol) ? `${u.protocol}//${u.hostname}/*` : null; } catch { return null; }
}
export function validCommand(command: MediaCommand): boolean {
  return command.type === 'play' || command.type === 'pause' ||
    (command.type === 'volume' && Number.isFinite(command.value) && command.value >= 0 && command.value <= 1) ||
    (command.type === 'seek' && Number.isFinite(command.value) && command.value >= 0);
}
