export const soundKey = 'tabora.reminder.sound';
export const soundErrorKey = 'tabora.reminder.soundError';
export const parseSound = (value: unknown) => value !== false;
export const parseSoundError = (value: unknown) => value === true;
let creating: Promise<void> | undefined;
let audioPort: chrome.runtime.Port | undefined;
const ready = new Set<(port: chrome.runtime.Port) => void>();
export function registerSound() {
  chrome.runtime.onConnect.addListener(port => {
    if (port.name !== 'tabora-reminder-audio' || port.sender?.id !== chrome.runtime.id || port.sender.url !== chrome.runtime.getURL('/reminder-audio.html')) return;
    audioPort = port;
    port.onDisconnect.addListener(() => { if (audioPort === port) audioPort = undefined; });
    for (const resolve of ready) resolve(port);
    ready.clear();
  });
}
async function audioConnection(): Promise<chrome.runtime.Port> {
  if (!creating) creating = (async () => {
    const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType], documentUrls: [chrome.runtime.getURL('/reminder-audio.html')] });
    // A surviving offscreen page may have lost its port after a worker restart.
    if (contexts.length && !audioPort) await chrome.offscreen.closeDocument();
    if (!contexts.length || !audioPort) await chrome.offscreen.createDocument({ url: 'reminder-audio.html', reasons: ['AUDIO_PLAYBACK' as chrome.offscreen.Reason], justification: 'Play a local chime when a timer or alarm finishes.' });
  })().finally(() => { creating = undefined; });
  await creating;
  if (audioPort) return audioPort;
  return new Promise((resolve, reject) => {
    const accept = (port: chrome.runtime.Port) => { clearTimeout(timer); resolve(port); };
    const timer = setTimeout(() => { ready.delete(accept); reject(new Error('audio-not-ready')); }, 5000);
    ready.add(accept);
  });
}
export async function playReminderSound() {
  if ((await chrome.storage.local.get(soundKey))[soundKey] === false) return;
  try {
    const port = await audioConnection();
    await new Promise<void>((resolve, reject) => {
      const id = crypto.randomUUID();
      const cleanup = () => { clearTimeout(timer); port.onMessage.removeListener(reply); port.onDisconnect.removeListener(disconnect); };
      const reply = (message: { id?: string; ok?: boolean }) => { if (message.id !== id) return; cleanup(); if (message.ok) resolve(); else reject(new Error('audio-playback')); };
      const disconnect = () => { cleanup(); reject(new Error('audio-disconnected')); };
      const timer = setTimeout(() => { cleanup(); reject(new Error('audio-timeout')); }, 5000);
      port.onMessage.addListener(reply); port.onDisconnect.addListener(disconnect);
      try { port.postMessage({ type: 'play', id }); } catch (error) { cleanup(); reject(error); }
    });
    await chrome.storage.local.set({ [soundErrorKey]: false });
  } catch (error) { await chrome.storage.local.set({ [soundErrorKey]: true }); throw error; }
}
