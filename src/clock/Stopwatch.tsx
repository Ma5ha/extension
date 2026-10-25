import { useEffect, useState } from 'react';
import { Timer as StopwatchIcon } from '@phosphor-icons/react';
import { useLocalValue } from '../local/useLocalValue';
import css from './ReminderTools.module.css';
type Watch = { started: number; elapsed: number };
const emptyWatch: Watch = { started: 0, elapsed: 0 };
function parseWatch(raw: unknown): Watch {
  const v = raw as Partial<Watch> | null;
  return v && typeof v.started === 'number' && Number.isFinite(v.started) && v.started >= 0 && v.started <= 8.64e15 && typeof v.elapsed === 'number' && Number.isFinite(v.elapsed) && v.elapsed >= 0 && v.elapsed <= 8.64e15 ? { started: v.started, elapsed: v.elapsed } : emptyWatch;
}
export function Stopwatch() {
  const store = useLocalValue('tabora.stopwatch.v1', emptyWatch, parseWatch);
  const [now, setNow] = useState(Date.now), [busy, setBusy] = useState(false);
  const { started, elapsed } = store.value;
  useEffect(() => {
    if (!started) return;
    const update = () => setNow(Date.now());
    update(); const timer = window.setInterval(update, 100);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, [started]);
  const duration = elapsed + (started ? Math.max(0, now - started) : 0);
  const seconds = Math.floor(duration / 1000);
  async function save(value: Watch) { if (busy) return; setBusy(true); try { setNow(Date.now()); await store.save(value); } finally { setBusy(false); } }
  return <section className={css.tool} aria-label="Stopwatch">
    <h3><StopwatchIcon size={18} aria-hidden="true" />Stopwatch<span className={css.status}>{started ? 'Running' : elapsed ? 'Paused' : 'Ready'}</span></h3>
    <output className={css.readout} aria-label="Elapsed time">{String(Math.floor(seconds / 3600)).padStart(2, '0')}:{String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}<small>.{Math.floor(duration % 1000 / 100)}</small></output>
    <p className={css.hint}>Count up · Keeps time across tabs</p>
    <div className={css.actions}><button className={css.primary} disabled={!store.ready || busy} onClick={() => void save(started ? { started: 0, elapsed: elapsed + Math.max(0, Date.now() - started) } : { started: Date.now(), elapsed })}>{started ? 'Pause' : elapsed ? 'Resume' : 'Start'}</button><button disabled={!store.ready || busy || (!started && !elapsed)} onClick={() => void save(emptyWatch)}>Reset</button></div>
    {store.error && <p role="alert">{store.error}</p>}
  </section>;
}
