import { useCallback, useEffect, useRef, useState } from 'react';
import { hasAccess, isExtension, requestAccess, subscribeTabs } from '../adapters/chrome';
import { inspectSource } from './adapter';
import type { Source } from './model';

export function useMedia(active = true, playerWindow: Window | null = null) {
  const [candidates, setCandidates] = useState<chrome.tabs.Tab[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [state, setState] = useState(isExtension ? 'loading' : 'preview');
  const remembered = useRef(new Set<number>());
  const running = useRef(false);
  const mounted = useRef(false);
  const refresh = useCallback(async () => {
    if (!isExtension || !mounted.current || running.current) return;
    running.current = true;
    try {
      if (!await hasAccess('tabs')) { if (mounted.current) { setState('permission'); setSources([]); setCandidates([]); } return; }
      const tabs = await chrome.tabs.query({});
      const next = await Promise.all(tabs.filter(t => t.id !== undefined && !t.url?.startsWith(chrome.runtime.getURL(''))).map(inspectSource));
      const visible = next.filter(s => {
        if (s.tab.audible || s.items.length) remembered.current.add(s.tab.id!);
        return remembered.current.has(s.tab.id!);
      });
      remembered.current = new Set(visible.map(s => s.tab.id!));
      if (mounted.current) { setSources(visible); setCandidates(tabs.filter(t => t.id !== undefined && /^https?:/.test(t.url || ''))); setState('ready'); }
    } catch { if (mounted.current) { setSources([]); setState('error'); } }
    finally { running.current = false; }
  }, []);
  useEffect(() => {
    if (!isExtension || !active) return;
    mounted.current = true;
    void refresh();
    const cleanup = subscribeTabs(() => void refresh());
    const timerWindow = playerWindow ?? window;
    const timer = timerWindow.setInterval(() => { if (playerWindow || !document.hidden) void refresh(); }, 2500);
    return () => { mounted.current = false; cleanup(); timerWindow.clearInterval(timer); };
  }, [refresh, active, playerWindow]);
  async function enable() { const granted = await requestAccess(['tabs']); await refresh(); if (!granted) throw new Error('denied'); }
  return { sources, candidates, state, refresh, enable };
}
