import { useCallback, useEffect, useRef, useState } from 'react';
import { getTabs, hasAccess, isExtension, requestAccess, subscribeTabs } from '../adapters/chrome';
import type { Tab } from '../domain/tabs';
export type TabState = 'loading' | 'ready' | 'denied' | 'error' | 'preview';

export function useTabs(report: (text: string) => void) {
  const [data, setData] = useState<{ tabs: Tab[]; windowId: number }>({ tabs: [], windowId: -1 });
  const [state, setState] = useState<TabState>(isExtension ? 'loading' : 'preview');
  const generation = useRef(0);
  const mounted = useRef(false);
  const refresh = useCallback(async () => {
    if (!isExtension || !mounted.current) return;
    const current = ++generation.current;
    try {
      if (!await hasAccess('tabs')) {
        if (mounted.current && current === generation.current) { setData({ tabs: [], windowId: -1 }); setState('denied'); }
        return;
      }
      const next = await getTabs();
      if (mounted.current && current === generation.current) { setData(next); setState('ready'); }
    } catch { if (mounted.current && current === generation.current) setState('error'); }
  }, []);
  useEffect(() => {
    if (!isExtension) return;
    mounted.current = true;
    void refresh();
    const cleanup = subscribeTabs(() => void refresh());
    return () => { mounted.current = false; cleanup(); };
  }, [refresh]);
  async function enable() {
    try {
      const granted = await requestAccess(['tabs']);
      if (!granted) report('Tab access was not granted. You can enable it later.');
      await refresh();
    } catch { report('Permission is unavailable. Try again.'); }
  }
  return { ...data, state, refresh, enable };
}
