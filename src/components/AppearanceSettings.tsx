import { useState, type CSSProperties } from 'react';
import { defaults, type Settings } from '../adapters/settings';
import styles from '../App.module.css';
import css from './AppearanceSettings.module.css';
const fill = (value: number): CSSProperties => ({ '--range-fill': `${value}%` } as CSSProperties);
export function AppearanceSettings({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => Promise<void> }) {
  const [error, setError] = useState(''), [loading, setLoading] = useState(false);
  async function upload(file: File) {
    setError(''); setLoading(true);
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image.');
      if (file.size > 3_000_000) throw new Error('Choose an image smaller than 3 MB.');
      const image = await createImageBitmap(file);
      const pixels = image.width * image.height; image.close();
      if (pixels > 40_000_000) throw new Error('Choose an image under 40 megapixels.');
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read this image. Try another file.'));
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read this image.'));
        reader.readAsDataURL(file);
      });
      await update({ backgroundImage: data });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not open this image. Try another file.'); }
    finally { setLoading(false); }
  }
  return <>
    <fieldset className={styles.materialSettings}><legend>Mix your colors</legend>
      <label className={styles.checkbox}><input type="checkbox" checked={settings.customColors} onChange={e => void update({ customColors: e.target.checked })} />Use custom colors</label>
      <div className={css.colors}>{([{ key: 'accentColor', label: 'Accent' }, { key: 'tintOne', label: 'First color' }, { key: 'tintTwo', label: 'Second color' }] as const).map(({ key, label }) => <label key={key}><span>{label}</span><input type="color" aria-label={label} value={settings[key]} onChange={e => void update({ [key]: e.target.value, customColors: true })} /><small>{settings[key]}</small></label>)}</div>
      <label>Color blend <output>{settings.colorMix}%</output><input aria-label="Color blend" type="range" min="0" max="100" step="5" style={fill(settings.colorMix)} value={settings.colorMix} onChange={e => void update({ colorMix: Number(e.target.value), customColors: true })} /></label>
      <p>Mix two colors into your light or dark theme. Accent sets buttons, links and active states.</p>
      <button onClick={() => void update({ customColors: false, accentColor: defaults.accentColor, tintOne: defaults.tintOne, tintTwo: defaults.tintTwo, colorMix: defaults.colorMix })}>Reset colors</button>
    </fieldset>
    <fieldset className={styles.materialSettings}><legend>Card material</legend>
      <label>Card transparency <output>{settings.glass === 0 ? 'Opaque' : settings.glass === 100 ? 'Fully transparent' : `${settings.glass}%`}</output><input aria-label="Card transparency" type="range" min="0" max="100" step="5" style={fill(settings.glass)} value={settings.glass} onChange={e => void update({ glass: Number(e.target.value) })} /></label>
      <label>Background blur <output>{settings.blur === 0 ? 'No blur' : `${settings.blur} px`}</output><input aria-label="Material background blur" type="range" min="0" max="32" step="2" style={fill(settings.blur / 32 * 100)} value={settings.blur} onChange={e => void update({ blur: Number(e.target.value) })} /></label>
      <p>100% removes card fill. Set blur to zero for a clear view through the cards. Text and controls keep their own colors.</p>
    </fieldset>
    <fieldset className={styles.materialSettings}><legend>Background image</legend>
      <label className={css.upload}>Choose an image<input type="file" accept="image/png,image/jpeg,image/webp" disabled={loading} onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void upload(file); }} /></label>
      <p>{loading ? 'Reading image…' : 'JPG, PNG or WebP · Up to 3 MB · Stored only in this browser'}</p>
      {error && <p role="alert">{error}</p>}
      {settings.backgroundImage && <>
        <img className={css.preview} src={settings.backgroundImage} alt="Selected background preview" />
        <label>Image fit<select value={settings.backgroundFit} onChange={e => void update({ backgroundFit: e.target.value as Settings['backgroundFit'] })}><option value="cover">Fill the screen</option><option value="contain">Show whole image</option></select></label>
        <label>Theme overlay <output>{settings.backgroundDim}%</output><input aria-label="Background image overlay" type="range" min="0" max="100" step="5" style={fill(settings.backgroundDim)} value={settings.backgroundDim} onChange={e => void update({ backgroundDim: Number(e.target.value) })} /></label>
        <button onClick={() => void update({ backgroundImage: '' })}>Remove image</button>
      </>}
    </fieldset>
  </>;
}
