import { useWorkspace } from '../workspace/WorkspaceContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { loadSessions, removeSession, restoreSession, saveSession, subscribeSessions } from './adapter';
import type { SavedSession } from './model';
export function useSessions() {
  const { workspace } = useWorkspace();
  const [sessions, setSessions] = useState<SavedSession[]>([]), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const version = useRef(0), lock = useRef(false);
  const refresh = useCallback(async () => {
    const run = ++version.current;
    try { const data = await loadSessions(workspace); if (version.current === run) { setSessions(data); setReady(true); } }
    catch { if (version.current === run) { setReady(false); setMessage('Could not load sessions. Try again.'); } }
  }, [workspace]);
  useEffect(() => { const generation = version; const stop = subscribeSessions(() => void refresh(), workspace); void refresh(); return () => { ++generation.current; stop(); }; }, [refresh, workspace]);
  async function action(kind: 'save' | 'restore' | 'remove', value: string | SavedSession) {
    if (lock.current) return false; lock.current = true; setBusy(true); setMessage('');
    try {
      if (kind === 'save') { const result = await saveSession(value as string, workspace); setMessage(`Sačuvano ${result.saved} tabova. Skipped: ${result.skipped}.`); }
      if (kind === 'restore') { const result = await restoreSession(value as SavedSession); setMessage(`Otvoreno: ${result.opened}. Već otvoreno: ${result.skipped}. Neuspjelo: ${result.failed}.`); }
      if (kind === 'remove') { await removeSession(value as SavedSession, workspace); setMessage('Saved session removed.'); }
      await refresh(); return true;
    } catch { setMessage('The action did not finish. Check tab access and try again; tabs already opened will stay open.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  return { sessions, ready, busy, message, action, refresh };
}
