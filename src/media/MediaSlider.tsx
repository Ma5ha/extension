import { useRef, useState, type CSSProperties, type ReactNode } from 'react';

const sliderKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);

// Keep browser polling and asynchronous commands out of an active native drag.
export function MediaSlider({ value, min, max, step, disabled, label, commit, children }: {
  value: number; min: number; max: number; step: number; disabled: boolean; label: string;
  commit: (value: number) => Promise<void> | undefined;
  children?: (value: number) => ReactNode;
}) {
  const [draft, setDraft] = useState<number | null>(null);
  const interaction = useRef<'pointer' | 'keyboard' | null>(null);
  const latest = useRef<number | null>(null);
  const generation = useRef(0);
  const shown = draft ?? value;
  function preview(next: number) { latest.current = next; setDraft(next); }
  function finish() {
    interaction.current = null;
    const next = latest.current;
    latest.current = null;
    if (next === null) { setDraft(null); return; }
    const run = ++generation.current;
    void Promise.resolve(commit(next)).finally(() => { if (generation.current === run) setDraft(null); });
  }
  function cancel() {
    generation.current++; interaction.current = null; latest.current = null; setDraft(null);
  }
  return <>
    <input aria-label={label} type="range" min={min} max={max} step={step} value={Math.max(min, Math.min(max, shown))} disabled={disabled && interaction.current === null}
      style={{ '--range-fill': `${max > min ? Math.max(0, Math.min(100, (shown - min) / (max - min) * 100)) : 0}%`, touchAction: 'none' } as CSSProperties}
      onPointerDown={event => { interaction.current = 'pointer'; generation.current++; event.currentTarget.setPointerCapture(event.pointerId); preview(Number(event.currentTarget.value)); }}
      onChange={event => { preview(Number(event.currentTarget.value)); if (!interaction.current) finish(); }}
      onPointerUp={() => finish()} onPointerCancel={cancel}
      onLostPointerCapture={() => { if (interaction.current === 'pointer') cancel(); }}
      onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancel(); } else if (sliderKeys.has(event.key)) { interaction.current = 'keyboard'; generation.current++; } }}
      onKeyUp={event => { if (sliderKeys.has(event.key) && interaction.current === 'keyboard') finish(); }}
      onBlur={() => { if (interaction.current) finish(); }} />
    {children?.(shown)}
  </>;
}
