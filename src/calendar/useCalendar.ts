import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarError, calendarAvailable, connectCalendar, connectionKey, disconnectCalendar, isConnected, loadAgenda, type CalendarFailure } from './adapter';
import type { Agenda } from './model';
type Status = 'setup' | 'disconnected' | 'loading' | 'ready' | CalendarFailure;
export function useCalendar() {
  const [status, setStatus] = useState<Status>(calendarAvailable() ? 'loading' : 'setup');
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [busy, setBusy] = useState(false);
  const generation = useRef(0), controller = useRef<AbortController | null>(null), active = useRef(false);
  const fail = useCallback((e: unknown) => setStatus(e instanceof CalendarError ? e.kind : 'error'), []);
  const refresh = useCallback(async () => {
    const run = ++generation.current;
    controller.current?.abort(); const request = new AbortController(); controller.current = request;
    setStatus('loading'); setAgenda(null);
    try {
      if (!calendarAvailable()) { setStatus('setup'); return; }
      if (!await isConnected()) { if (run === generation.current) setStatus('disconnected'); return; }
      const data = await loadAgenda(new Date(), request.signal);
      if (run === generation.current) { setAgenda(data); setStatus('ready'); }
    } catch (e) { if (run === generation.current) fail(e); }
  }, [fail]);
  useEffect(() => {
    const requestGeneration = generation;
    void refresh();
    if (typeof chrome === 'undefined' || !chrome.runtime?.id) return;
    const changed = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && changes[connectionKey]) void refresh();
    };
    const resume = () => { if (document.visibilityState === 'visible') void refresh(); };
    chrome.storage.onChanged.addListener(changed);
    chrome.permissions.onRemoved.addListener(refresh);
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('online', refresh);
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 60_000);
    return () => {
      ++requestGeneration.current; controller.current?.abort();
      chrome.storage.onChanged.removeListener(changed); chrome.permissions.onRemoved.removeListener(refresh);
      document.removeEventListener('visibilitychange', resume); window.removeEventListener('online', refresh); window.clearInterval(timer);
    };
  }, [refresh]);
  async function connect() {
    if (active.current) return; active.current = true; setBusy(true);
    try { await connectCalendar(); await refresh(); } catch (e) { fail(e); } finally { active.current = false; setBusy(false); }
  }
  async function disconnect() {
    if (active.current) return; active.current = true; setBusy(true);
    ++generation.current; controller.current?.abort(); setAgenda(null);
    try { await disconnectCalendar(); setStatus('disconnected'); } catch { setStatus('error'); } finally { active.current = false; setBusy(false); }
  }
  return { status, agenda, busy, connect, disconnect, refresh };
}
