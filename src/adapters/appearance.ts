import type { Settings } from './settings';
const channels = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
function mix(base: number[], tint: string, amount: number) {
  const rgb = channels(tint);
  return base.map((value, index) => Math.round(value * (1 - amount) + rgb[index]! * amount)).join(' ');
}
function onAccent(hex: string) {
  const rgb = channels(hex).map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; });
  const luminance = rgb[0]! * .2126 + rgb[1]! * .7152 + rgb[2]! * .0722;
  return (luminance + .05) / .05 > 1.05 / (luminance + .05) ? '#000000' : '#ffffff';
}
export function appearanceVariables(settings: Settings, dark: boolean): Record<string, string> {
  const base: Record<string, string> = {
    '--glass-opacity': String(1 - settings.glass / 100),
    '--material-blur': `${settings.blur}px`,
    '--user-background': settings.backgroundImage ? `url("${settings.backgroundImage}")` : 'none',
    '--background-fit': settings.backgroundFit,
    '--background-dim': settings.backgroundImage ? String(settings.backgroundDim / 100) : '0',
    '--background-shade-rgb': dark ? '0 0 0' : '255 255 255',
    '--custom-accent': settings.accentColor,
    '--custom-on-accent': onAccent(settings.accentColor),
    '--tint-one': settings.tintOne,
    '--tint-two': settings.tintTwo,
    '--color-mix': `${settings.colorMix}%`,
    '--tinted-panel-rgb': mix(dark ? [25, 29, 36] : [255, 255, 255], settings.tintOne, settings.colorMix / 100 * .18),
  };
  return base;
}
