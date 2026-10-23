import { useCallback, useEffect, useRef, useState } from 'react';
import { hasAccess, isExtension, requestAccess, subscribeTabs } from '../adapters/chrome';
import { inspectSource } from './adapter';
import { withMediaDeadline } from './deadline';
import type { Source, MediaItem } from './model';

export function useMedia(active = true, playerWindow: Window | null = null) {
  const [candidates, setCandidates] = useState<chrome.tabs.Tab[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [state, setState] = useState(isExtension ? 'loading' : 'preview');
  const remembered = useRef(new Set<number>());
  const running = useRef<number | null>(null);
  const generation = useRef({ value: 0 });
  const mounted = useRef(false);
  const revisions = useRef(new Map<number, number>());
  const pendingChanges = useRef(new Map<number, number>());
  const updateItem = useCallback((tabId: number, documentId: string, id: string, patch: Partial<MediaItem>) => {
    revisions.current.set(tabId, (revisions.current.get(tabId) ?? 0) + 1);
    setSources(previous => previous.map(source => source.tab.id === tabId ? { ...source, items: source.items.map(item => item.documentId === documentId && item.id === id ? { ...item, ...patch } : item) } : source));
  }, []);
  function beginItemChange(tabId: number) {
    pendingChanges.current.set(tabId, (pendingChanges.current.get(tabId) ?? 0) + 1);
    return () => {
      pendingChanges.current.set(tabId, Math.max(0, (pendingChanges.current.get(tabId) ?? 1) - 1));
      revisions.current.set(tabId, (revisions.current.get(tabId) ?? 0) + 1);
    };
  }
  const refresh = useCallback(async () => {
    if (!isExtension || !mounted.current || running.current !== null) return;
    const run = ++generation.current.value;
    running.current = run;
    const current = () => mounted.current && generation.current.value === run;
    try {
      if (!await withMediaDeadline(hasAccess('tabs'), 3000)) {
        if (current()) { setState('permission'); setSources([]); setCandidates([]); }
        return;
      }
      const tabs = await withMediaDeadline(chrome.tabs.query({}), 3000);
      if (!current()) return;
      const eligible = tabs.filter(t => t.id !== undefined && /^https?:/.test(t.url || ''));
      // The user can select a paused tab before any player inspection finishes.
      setCandidates(eligible);
      setState('ready');
      const openIds = new Set(eligible.map(tab => tab.id!));
      for (const id of remembered.current) if (!openIds.has(id)) remembered.current.delete(id);
      const scanRevisions = new Map(revisions.current);
      const results = await Promise.all(eligible.map(async tab => {
        try { return await withMediaDeadline(inspectSource(tab), 2500); }
        catch { return { tab, items: [], status: 'unavailable', frames: 0 } as Source; }
      }));
      if (!current()) return;
      const visible = results.filter(source => {
        if (source.tab.audible || source.items.length) remembered.current.add(source.tab.id!);
        return remembered.current.has(source.tab.id!);
      });
      setSources(previous => visible.map(next => {
        const id = next.tab.id!;
        const changed = (pendingChanges.current.get(id) ?? 0) > 0 || (scanRevisions.get(id) ?? 0) !== (revisions.current.get(id) ?? 0);
        const existing = previous.find(source => source.tab.id === id && source.tab.url === next.tab.url);
        return changed && existing ? existing : next;
      }));
    } catch { if (current()) setState('error'); }
    finally { if (running.current === run) running.current = null; }
  }, []);
  useEffect(() => {
    if (!isExtension || !active) return;
    mounted.current = true;
    const sequence = generation.current;
    void refresh();
    const cleanup = subscribeTabs(() => void refresh());
    const timerWindow = playerWindow ?? window;
    const timer = timerWindow.setInterval(() => { if (playerWindow || !document.hidden) void refresh(); }, 3500);
    return () => {
      mounted.current = false; sequence.value++; running.current = null;
      cleanup(); timerWindow.clearInterval(timer);
    };
  }, [refresh, active, playerWindow]);
  async function enable() { const granted = await requestAccess(['tabs']); await refresh(); if (!granted) throw new Error('denied'); }
  function rememberSource(id: number) { remembered.current.add(id); }
  return { sources, candidates, state, refresh, enable, rememberSource, updateItem, beginItemChange };
}
