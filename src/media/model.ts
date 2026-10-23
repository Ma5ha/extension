export type MediaCommand = { type: 'mute'; value: boolean } | { type: 'play' | 'pause' | 'pip-enter' | 'pip-exit' } | { type: 'volume' | 'seek'; value: number };
export interface MediaItem { artwork?: string; title?: string; id: string; kind: string; paused: boolean; ended: boolean; volume: number; muted: boolean; time: number; duration: number | null; ranges: [number, number][]; pipAvailable: boolean; pipActive: boolean }
export interface FrameMedia { items: MediaItem[]; frames: number; error?: string; errorCode?: 'pip-unavailable' | 'pip-rejected' | 'pip-not-active' }
export interface Source { tab: chrome.tabs.Tab; items: (MediaItem & { frameId: number; documentId: string })[]; status: 'ready' | 'permission' | 'unavailable' | 'discarded'; frames: number }
export function sitePattern(url?: string) {
  try { const u = new URL(url!); return ['https:', 'http:'].includes(u.protocol) ? `${u.protocol}//${u.hostname}/*` : null; } catch { return null; }
}
export function validCommand(command: MediaCommand): boolean {
  return (command.type === 'mute' && typeof command.value === 'boolean') || command.type === 'play' || command.type === 'pause' || command.type === 'pip-enter' || command.type === 'pip-exit' ||
    (command.type === 'volume' && Number.isFinite(command.value) && command.value >= 0 && command.value <= 1) ||
    (command.type === 'seek' && Number.isFinite(command.value) && command.value >= 0);
}

export class MediaActionError extends Error {
  constructor(public readonly code: NonNullable<FrameMedia['errorCode']>) {
    super(code === 'pip-unavailable' ? 'Video view is unavailable for this source. Open the source tab.' : code === 'pip-not-active' ? 'The selected video is not in Picture-in-Picture. Refresh sources.' : 'The browser did not allow video Picture-in-Picture. Open the source tab and enable it there.');
    this.name = 'MediaActionError';
  }
}

export function optimisticMediaItem(item: MediaItem, command: MediaCommand): Partial<MediaItem> {
  switch (command.type) {
    case 'play': return { paused: false, ended: false };
    case 'pause': return { paused: true };
    case 'mute': return { muted: command.value };
    case 'volume': return { volume: command.value };
    case 'seek': return { time: command.value, ended: command.value < (item.duration ?? Infinity) ? false : item.ended };
    default: return {};
  }
}
