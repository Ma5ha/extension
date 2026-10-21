import { useEffect, useRef, useState } from 'react';
import { defaults, loadSettings, parseSettings, saveSettings, subscribeSettings, type Settings } from '../adapters/settings';

export function useSettings(report: (message: string) => void) {
  const [settings, setSettings] = useState(defaults);
  const [ready, setReady] = useState(false);
  const pending = useRef(0), writes = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    let active = true;
    loadSettings().then(s => { if (active && pending.current === 0) setSettings(s); }).catch(() => {
      if (active) report('Podešavanja nisu učitana. Koristi se osnovni izgled. Pokušaj ponovo otvaranjem taba.');
    }).finally(() => { if (active) setReady(true); });
    const unsubscribe = subscribeSettings(s => { if (active && pending.current === 0) setSettings(s); });
    return () => { active = false; unsubscribe(); };
  }, [report]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      document.documentElement.dataset.theme = settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme;
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [settings.theme]);
  async function update(patch: Partial<Settings>) {
    pending.current++;
    setSettings(previous => parseSettings({ ...previous, ...patch }));
    const operation = writes.current.then(() => saveSettings(patch));
    writes.current = operation.catch(() => {});
    try { const saved = await operation; if (pending.current === 1) setSettings(saved); }
    catch {
      report('Podešavanja nisu sačuvana. Pokušaj ponovo.');
      if (pending.current === 1) { try { setSettings(await loadSettings()); } catch { /* Keep the last visible settings. */ } }
    } finally { pending.current--; }
  }
  return { settings, ready, update };
}
