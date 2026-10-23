import { useCallback, useEffect, useRef, useState } from 'react';
import { listLocal, subscribeLocal } from './store';
export function useLocalList<T>(prefix: string, parse: (raw: unknown) => T | null) {
  const [items, setItems] = useState<T[]>([]), [ready, setReady] = useState(false), [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const run = ++generation.current;
    try {
      const values = (await listLocal(prefix)).flatMap(raw => { const item = parse(raw); return item ? [item] : []; });
      if (run === generation.current) { setItems(values); setReady(true); setError(''); }
    } catch { if (run === generation.current) { setReady(false); setError('Could not load saved data. Try again.'); } }
  }, [prefix, parse]);
  useEffect(() => {
    const version = generation; setReady(false); const stop = subscribeLocal(prefix, () => void refresh()); void refresh();
    return () => { ++version.current; stop(); };
  }, [prefix, refresh]);
  return { items, ready, error, refresh };
}
