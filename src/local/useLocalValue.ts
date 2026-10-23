import { useCallback, useEffect, useRef, useState } from 'react';
import { readLocal, subscribeLocal, writeLocal } from './store';
export function useLocalValue<T>(key: string, fallback: T, parse: (raw: unknown) => T) {
  const [value, setValue] = useState(fallback), [ready, setReady] = useState(false), [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const run = ++generation.current;
    try { const next = parse(await readLocal(key)); if (generation.current === run) { setValue(next); setReady(true); setError(''); } }
    catch { if (generation.current === run) { setReady(false); setError('Could not load data. Try again.'); } }
  }, [key, parse]);
  useEffect(() => {
    const version = generation; setReady(false); const stop = subscribeLocal(key, () => void refresh()); void refresh();
    return () => { ++version.current; stop(); };
  }, [key, refresh]);
  async function save(next: T) {
    try { await writeLocal(key, next); setValue(next); setError(''); return true; }
    catch { setError('Could not save the change. Try again.'); return false; }
  }
  return { value, ready, error, save, refresh };
}
