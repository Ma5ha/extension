import { useEffect, useState } from 'react';
import { defaults, loadSettings, saveSettings, subscribeSettings, type Settings } from '../adapters/settings';

export function useSettings(report: (message: string) => void) {
  const [settings, setSettings] = useState(defaults);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    loadSettings().then(s => { if (active) setSettings(s); }).catch(() => {
      if (active) report('Podešavanja nisu učitana. Koristi se osnovni izgled. Pokušaj ponovo otvaranjem taba.');
    }).finally(() => { if (active) setReady(true); });
    const unsubscribe = subscribeSettings(s => { if (active) setSettings(s); });
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
    try { setSettings(await saveSettings(patch)); }
    catch { report('Podešavanja nisu sačuvana. Pokušaj ponovo.'); }
  }
  return { settings, ready, update };
}
