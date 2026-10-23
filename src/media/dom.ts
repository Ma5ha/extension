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
  const canPip = (element: HTMLMediaElement) => {
    const video = element as HTMLVideoElement;
    return element.tagName === 'VIDEO' && document.pictureInPictureEnabled === true && typeof video.requestPictureInPicture === 'function' && !video.disablePictureInPicture && video.readyState > 0 && video.videoWidth > 0;
  };
  let error: string | undefined;
  let errorCode: FrameMedia['errorCode'];
  if (command) {
    const element = elements.find(e => identify(e) === id);
    if (!element) error = 'The source is no longer available. Refresh the list.';
    else try {
      if (command.type === 'pip-enter') {
        if (!canPip(element)) { errorCode = 'pip-unavailable'; throw new Error('pip'); }
        if (document.pictureInPictureElement !== element) await (element as HTMLVideoElement).requestPictureInPicture();
      } else if (command.type === 'pip-exit') {
        if (document.pictureInPictureElement !== element) { errorCode = 'pip-not-active'; throw new Error('pip'); }
        await document.exitPictureInPicture();
      } else if (command.type === 'play') await element.play();
      else if (command.type === 'pause') element.pause();
      else if (command.type === 'mute') element.muted = command.value;
      else if (command.type === 'volume' && Number.isFinite(command.value) && command.value >= 0 && command.value <= 1) { element.volume = command.value; if (Math.abs(element.volume - command.value) > 0.01) throw new Error('volume'); }
      else if (command.type === 'seek' && Number.isFinite(command.value) && command.value >= 0) {
        const ranges = element.seekable;
        let allowed = false;
        for (let i = 0; i < ranges.length; i++) if (command.value >= ranges.start(i) && command.value <= ranges.end(i)) allowed = true;
        if (!allowed) throw new Error('range');
        element.currentTime = command.value;
      } else throw new Error('command');
    } catch {
      if (command.type === 'pip-enter' || command.type === 'pip-exit') errorCode ??= 'pip-rejected';
      error = 'The player did not accept the command. Open the source tab and try there.';
    }
  }
  // Artwork is optional: a metadata getter or page selector must never break discovery.
  let title: string | undefined, artwork: string | undefined, pageArtwork: string | undefined;
  const imageURL = (value?: string) => {
    if (!value) return undefined;
    try { const url = new URL(value, document.baseURI); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
  };
  try {
    const metadata = navigator.mediaSession?.metadata;
    title = metadata?.title?.slice(0, 300);
    artwork = metadata?.artwork?.map(image => imageURL(image.src)).find(Boolean);
  } catch { /* Some documents do not expose media-session metadata. */ }
  try { pageArtwork = imageURL(document.querySelector<HTMLMetaElement>('meta[property="og:image"], meta[name="twitter:image"]')?.content); } catch { /* Keep basic media detection available. */ }
  return { error, errorCode, frames: document.querySelectorAll('iframe,frame').length, items: elements.map(e => ({
    artwork: imageURL(e.tagName === 'VIDEO' ? (e as HTMLVideoElement).poster : undefined) ?? artwork ?? pageArtwork, title,
    id: identify(e), kind: e.tagName === 'VIDEO' ? 'Video' : 'Audio', paused: e.paused, ended: e.ended,
    pipAvailable: canPip(e), pipActive: e.tagName === 'VIDEO' && document.pictureInPictureElement === e,
    volume: e.volume, muted: e.muted, time: Number.isFinite(e.currentTime) ? e.currentTime : 0,
    duration: Number.isFinite(e.duration) ? e.duration : null,
    ranges: Array.from({ length: e.seekable.length }, (_, i) => [e.seekable.start(i), e.seekable.end(i)] as [number, number]),
  })) };
}
