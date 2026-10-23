import { useEffect, useRef, useState } from 'react';
import { documentPlayerAPI, preparePlayerWindow } from './playerWindow';

export function usePlayerWindow() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');
  const current = useRef<Window | null>(null);
  const dispose = useRef<(() => void) | null>(null);
  const pending = useRef(false);
  const generation = useRef({ value: 0 });
  const mounted = useRef(true);
  const supported = !!documentPlayerAPI();
  useEffect(() => {
    mounted.current = true;
    const cancellation = generation.current;
    return () => {
      mounted.current = false; cancellation.value++;
      dispose.current?.(); dispose.current = null;
      current.current?.close(); current.current = null;
    };
  }, []);
  function close() {
    generation.current.value++; pending.current = false;
    dispose.current?.(); dispose.current = null;
    current.current?.close(); current.current = null;
    setPipWindow(null); setOpening(false); setError('');
  }
  async function open(): Promise<boolean> {
    if (current.current && !current.current.closed) { current.current.focus(); return true; }
    if (pending.current) return false;
    const api = documentPlayerAPI();
    if (!api) { setError('Detached controls are not supported in this browser. Use the Tabora mini-player.'); return false; }
    pending.current = true; setOpening(true); setError('');
    const token = ++generation.current.value;
    let popup: Window | null = null;
    try {
      // Invoke synchronously in the click handler, before any await or permission query.
      popup = await api.requestWindow({ width: 380, height: 600 });
      if (!mounted.current || token !== generation.current.value || popup.closed) { popup.close(); return false; }
      const disconnect = preparePlayerWindow(popup);
      const opened = popup;
      const cleanup = () => { disconnect(); opened.removeEventListener('pagehide', onClose); };
      const onClose = () => {
        cleanup();
        if (current.current === opened) {
          current.current = null; dispose.current = null;
          if (mounted.current) setPipWindow(null);
        }
      };
      opened.addEventListener('pagehide', onClose, { once: true });
      current.current = opened; dispose.current = cleanup;
      setPipWindow(opened);
      return true;
    } catch {
      popup?.close();
      if (mounted.current && token === generation.current.value) setError('The window could not be opened. Click to try again or use the Tabora mini-player.');
      return false;
    } finally {
      if (mounted.current && token === generation.current.value) { pending.current = false; setOpening(false); }
    }
  }
  return { pipWindow, supported, opening, error, open, close };
}
