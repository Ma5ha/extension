import { useCallback, useEffect, useRef, useState } from 'react';
import { GmailError, gmailAvailable, connectGmail, connectionKey, disconnectGmail, isConnected, loadInbox, type GmailFailure } from './adapter';
import type { Inbox } from './model';
type Status = 'setup' | 'disconnected' | 'loading' | 'ready' | GmailFailure;
export function useGmail(unread: boolean, visible: boolean) {
  const [status, setStatus] = useState<Status>(gmailAvailable() ? 'loading' : 'setup');
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [busy, setBusy] = useState(false);
  const generation = useRef(0), controller = useRef<AbortController | null>(null), active = useRef(false);
  const fail = useCallback((e: unknown) => setStatus(e instanceof GmailError ? e.kind : 'error'), []);
  const refresh = useCallback(async () => {
    const run = ++generation.current;
    controller.current?.abort(); const request = new AbortController(); controller.current = request;
    setStatus('loading'); setInbox(null);
    try {
      if (!gmailAvailable()) { setStatus('setup'); return; }
      if (!await isConnected()) { if (run === generation.current) setStatus('disconnected'); return; }
      if (!visible) { if (run === generation.current) setStatus('ready'); return; }
      const data = await loadInbox(unread, request.signal);
      if (run === generation.current) { setInbox(data); setStatus('ready'); }
    } catch (e) { if (run === generation.current) fail(e); }
  }, [fail, unread, visible]);
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
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 120_000);
    return () => {
      ++requestGeneration.current; controller.current?.abort();
      chrome.storage.onChanged.removeListener(changed); chrome.permissions.onRemoved.removeListener(refresh);
      document.removeEventListener('visibilitychange', resume); window.removeEventListener('online', refresh); window.clearInterval(timer);
    };
  }, [refresh]);
  async function connect() {
    if (active.current) return; active.current = true; setBusy(true);
    try { await connectGmail(); await refresh(); } catch (e) { fail(e); } finally { active.current = false; setBusy(false); }
  }
  async function disconnect() {
    if (active.current) return; active.current = true; setBusy(true);
    ++generation.current; controller.current?.abort(); setInbox(null);
    try { await disconnectGmail(); setStatus('disconnected'); } catch { setStatus('error'); } finally { active.current = false; setBusy(false); }
  }
  return { status, inbox, busy, connect, disconnect, refresh };
}
