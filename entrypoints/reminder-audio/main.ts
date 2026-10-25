const audio = document.createElement('audio');
audio.src = chrome.runtime.getURL('/reminder-chime.wav');
audio.preload = 'auto';
audio.volume = 0.9;
document.body.append(audio);
const port = chrome.runtime.connect({ name: 'tabora-reminder-audio' });
port.onMessage.addListener((message: { type?: string; id?: string }) => {
  if (message.type !== 'play' || typeof message.id !== 'string') return;
  audio.currentTime = 0;
  void audio.play().then(() => port.postMessage({ id: message.id, ok: true }), () => port.postMessage({ id: message.id, ok: false }));
});
