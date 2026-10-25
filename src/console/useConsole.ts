import { useEffect, useRef, useState } from 'react';
import { isExtension } from '../adapters/chrome';
import { emptyConsole, type ConsoleState } from './model';
export function useConsole() {
  const [state, setState] = useState<ConsoleState>(emptyConsole), [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const port = useRef<chrome.runtime.Port | null>(null);
  useEffect(() => {
    if (!isExtension) return;
    const connection = chrome.runtime.connect({ name: 'tabora-console' }); port.current = connection;
    const timeout = setTimeout(() => {
      port.current = null; setReady(false); setBusy(false);
      setState({ ...emptyConsole, entries: [], error: 'Console service did not respond. Reload Tabora in chrome://extensions, then open a new Tabora tab.' });
      connection.disconnect();
    }, 5000);
    const receive = (next: ConsoleState) => { clearTimeout(timeout); setReady(true); setState(next); setBusy(false); };
    connection.onMessage.addListener(receive);
    const disconnected = () => { void chrome.runtime.lastError; clearTimeout(timeout); setReady(false); port.current = null; setBusy(false); setState({ ...emptyConsole, entries: [], error: 'Console disconnected. Reopen this widget to reconnect.' }); };
    connection.onDisconnect.addListener(disconnected);
    return () => { clearTimeout(timeout); port.current = null; connection.onMessage.removeListener(receive); connection.onDisconnect.removeListener(disconnected); connection.disconnect(); };
  }, []);
  function send(type: 'connect' | 'disconnect' | 'clear', tabId?: number) {
    if (!port.current || busy) return;
    setBusy(true);
    try { port.current.postMessage({ type, tabId }); } catch { setBusy(false); setState({ ...emptyConsole, entries: [], error: 'Console is unavailable. Reload the extension and try again.' }); }
  }
  return { state, busy, ready, send };
}
