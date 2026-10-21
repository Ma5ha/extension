import { useCallback, useEffect, useRef, useState } from 'react';
import { loadSessions, removeSession, restoreSession, saveSession, subscribeSessions } from './adapter';
import type { SavedSession } from './model';
export function useSessions() {
  const [sessions, setSessions] = useState<SavedSession[]>([]), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const version = useRef(0), lock = useRef(false);
  const refresh = useCallback(async () => {
    const run = ++version.current;
    try { const data = await loadSessions(); if (version.current === run) { setSessions(data); setReady(true); } }
    catch { if (version.current === run) { setReady(false); setMessage('Sesije nisu učitane. Pokušaj ponovo.'); } }
  }, []);
  useEffect(() => { const generation = version; const stop = subscribeSessions(() => void refresh()); void refresh(); return () => { ++generation.current; stop(); }; }, [refresh]);
  async function action(kind: 'save' | 'restore' | 'remove', value: string | SavedSession) {
    if (lock.current) return false; lock.current = true; setBusy(true); setMessage('');
    try {
      if (kind === 'save') { const result = await saveSession(value as string); setMessage(`Sačuvano ${result.saved} tabova. Preskočeno: ${result.skipped}.`); }
      if (kind === 'restore') { const result = await restoreSession(value as SavedSession); setMessage(`Otvoreno: ${result.opened}. Već otvoreno: ${result.skipped}. Neuspjelo: ${result.failed}.`); }
      if (kind === 'remove') { await removeSession(value as SavedSession); setMessage('Sačuvana sesija je uklonjena.'); }
      await refresh(); return true;
    } catch { setMessage('Radnja nije završena. Provjeri pristup tabovima i pokušaj ponovo; već otvoreni tabovi ostaju otvoreni.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  return { sessions, ready, busy, message, action, refresh };
}
