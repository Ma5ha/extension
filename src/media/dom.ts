import type { FrameMedia, MediaCommand } from './model';

// Serialized by executeScript: keep every dependency inside this function.
export async function mediaDOM(id?: string, command?: MediaCommand): Promise<FrameMedia> {
  const scope = globalThis as typeof globalThis & { __taboraMedia?: { ids: WeakMap<HTMLMediaElement, string>; next: number } };
  const state = scope.__taboraMedia ??= { ids: new WeakMap(), next: 0 };
  const elements = Array.from(document.querySelectorAll<HTMLMediaElement>('audio,video'));
  const identify = (element: HTMLMediaElement) => {
    let key = state.ids.get(element);
    if (!key) { key = String(++state.next); state.ids.set(element, key); }
    return key;
  };
  let error: string | undefined;
  if (command) {
    const element = elements.find(e => identify(e) === id);
    if (!element) error = 'Izvor više nije dostupan. Osvježi listu.';
    else try {
      if (command.type === 'play') await element.play();
      else if (command.type === 'pause') element.pause();
      else if (command.type === 'volume' && Number.isFinite(command.value) && command.value >= 0 && command.value <= 1) { element.volume = command.value; if (Math.abs(element.volume - command.value) > 0.01) throw new Error('volume'); }
      else if (command.type === 'seek' && Number.isFinite(command.value) && command.value >= 0) {
        const ranges = element.seekable;
        let allowed = false;
        for (let i = 0; i < ranges.length; i++) if (command.value >= ranges.start(i) && command.value <= ranges.end(i)) allowed = true;
        if (!allowed) throw new Error('range');
        element.currentTime = command.value;
      } else throw new Error('command');
    } catch { error = 'Player nije prihvatio komandu. Otvori izvorni tab i pokušaj tamo.'; }
  }
  return { error, frames: document.querySelectorAll('iframe,frame').length, items: elements.map(e => ({
    id: identify(e), kind: e.tagName === 'VIDEO' ? 'Video' : 'Audio', paused: e.paused, ended: e.ended,
    volume: e.volume, muted: e.muted, time: Number.isFinite(e.currentTime) ? e.currentTime : 0,
    duration: Number.isFinite(e.duration) ? e.duration : null,
    ranges: Array.from({ length: e.seekable.length }, (_, i) => [e.seekable.start(i), e.seekable.end(i)] as [number, number]),
  })) };
}
