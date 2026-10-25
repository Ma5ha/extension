import { useState, type CSSProperties } from 'react';
import { appearancePresets, resetAppearance } from '../adapters/appearancePresets';
import type { Settings } from '../adapters/settings';
import css from './SettingsPanel.module.css';
export function StylePresets({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => Promise<void> }) {
  const [chosen, setChosen] = useState(appearancePresets[0]!.id), [busy, setBusy] = useState(false);
  const selected = appearancePresets.find(p => p.id === chosen) ?? appearancePresets[0]!;
  const matches = Object.entries(selected.patch).every(([key, value]) => settings[key as keyof Settings] === value);
  async function apply(patch: Partial<Settings>) { setBusy(true); try { await update(patch); } finally { setBusy(false); } }
  return <fieldset className={css.presets}><legend>Ready-made styles</legend><p>Choose a preview, then apply it. Your layout and background image stay.</p>
    <div className={css.presetGrid}>{appearancePresets.map(preset => <button key={preset.id} className={css.preset} aria-pressed={chosen === preset.id} onClick={() => setChosen(preset.id)}>
      <span className={css.miniature} aria-hidden="true" style={{ '--preview-one': preset.colors[0], '--preview-two': preset.colors[1], '--preview-panel': `rgb(${preset.patch.theme === 'dark' ? '25 29 36' : '255 255 255'} / ${1 - preset.patch.glass / 100})`, '--preview-border': preset.patch.theme === 'dark' ? '#ffffff50' : '#18202a40' } as CSSProperties}><span /><span /><span /></span><strong>{preset.name}</strong><small>{preset.description}</small>
    </button>)}</div>
    <div className={css.row}><button disabled={busy} onClick={() => void apply(selected.patch)}>Apply {selected.name}</button><button disabled={busy} onClick={() => void apply(resetAppearance)}>Reset appearance</button></div>
    <p className={css.hint}>Reset restores theme, colors, text size and material. Your image stays; remove it under Background image.</p>
    {matches && <p role="status">{selected.name} is active.</p>}
  </fieldset>;
}
