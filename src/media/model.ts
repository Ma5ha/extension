export type MediaCommand = { type: 'play' | 'pause' | 'pip-enter' | 'pip-exit' } | { type: 'volume' | 'seek'; value: number };
export interface MediaItem { id: string; kind: string; paused: boolean; ended: boolean; volume: number; muted: boolean; time: number; duration: number | null; ranges: [number, number][]; pipAvailable: boolean; pipActive: boolean }
export interface FrameMedia { items: MediaItem[]; frames: number; error?: string; errorCode?: 'pip-unavailable' | 'pip-rejected' | 'pip-not-active' }
export interface Source { tab: chrome.tabs.Tab; items: (MediaItem & { frameId: number; documentId: string })[]; status: 'ready' | 'permission' | 'unavailable' | 'discarded'; frames: number }
export function sitePattern(url?: string) {
  try { const u = new URL(url!); return ['https:', 'http:'].includes(u.protocol) ? `${u.protocol}//${u.hostname}/*` : null; } catch { return null; }
}
export function validCommand(command: MediaCommand): boolean {
  return command.type === 'play' || command.type === 'pause' || command.type === 'pip-enter' || command.type === 'pip-exit' ||
    (command.type === 'volume' && Number.isFinite(command.value) && command.value >= 0 && command.value <= 1) ||
    (command.type === 'seek' && Number.isFinite(command.value) && command.value >= 0);
}

export class MediaActionError extends Error {
  constructor(public readonly code: NonNullable<FrameMedia['errorCode']>) {
    super(code === 'pip-unavailable' ? 'Video prikaz nije dostupan za ovaj izvor. Otvori izvorni tab.' : code === 'pip-not-active' ? 'Izabrani video nije u PiP prikazu. Osvježi izvore.' : 'Browser nije dozvolio izdvajanje videa. Otvori izvorni tab i uključi video prikaz tamo.');
    this.name = 'MediaActionError';
  }
}
