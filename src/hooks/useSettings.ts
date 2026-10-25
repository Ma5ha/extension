import { appearanceVariables } from '../adapters/appearance';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { useEffect, useRef, useState } from 'react';
import { defaults, loadSettings, parseSettings, saveSettings, subscribeSettings, type Settings } from '../adapters/settings';

export function useSettings(report: (message: string) => void) {
  const { workspace } = useWorkspace();
  const [settings, setSettings] = useState(defaults);
  const [ready, setReady] = useState(false);
  const pending = useRef(0), writes = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    let active = true;
    loadSettings(workspace).then(s => { if (active && pending.current === 0) setSettings(s); }).catch(() => {
      if (active) report('Settings could not be loaded. The default layout is shown. Reopen this tab to try again.');
    }).finally(() => { if (active) setReady(true); });
    const unsubscribe = subscribeSettings(s => { if (active && pending.current === 0) setSettings(s); }, workspace);
    return () => { active = false; unsubscribe(); };
  }, [report, workspace]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const root = document.documentElement;
      const dark = settings.theme === 'system' ? media.matches : settings.theme === 'dark';
      root.dataset.theme = dark ? 'dark' : 'light';
      root.dataset.customColors = String(settings.customColors);
      root.dataset.transparentCards = String(settings.glass === 100);
      for (const [name, value] of Object.entries(appearanceVariables(settings, dark))) root.style.setProperty(name, value);
    };
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [settings]);
  useEffect(() => { document.documentElement.dataset.fontSize = settings.fontSize; }, [settings.fontSize]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.backgroundMotion = String(settings.backgroundMotion);
    const sync = () => { root.dataset.pageVisible = String(!document.hidden); };
    sync(); document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [settings.backgroundMotion]);
  async function update(patch: Partial<Settings>) {
    pending.current++;
    setSettings(previous => parseSettings({ ...previous, ...patch }));
    const operation = writes.current.then(() => saveSettings(patch, workspace));
    writes.current = operation.catch(() => {});
    try { const saved = await operation; if (pending.current === 1) setSettings(saved); }
    catch {
      report('Settings could not be saved. Try again.');
      if (pending.current === 1) { try { setSettings(await loadSettings(workspace)); } catch { /* Keep the last visible settings. */ } }
    } finally { pending.current--; }
  }
  return { settings, ready, update };
}
