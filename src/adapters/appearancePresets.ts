import { defaults, type Settings } from './settings';
export const appearancePresets = [
  { id: 'quiet', name: 'Quiet light', description: 'Neutral surfaces, calm blue accents.', colors: ['#e8e6e1', '#dbe5ee'], patch: { theme: 'light', customColors: false, glass: 35, blur: 8 } },
  { id: 'orbit', name: 'Night orbit', description: 'Dark surfaces with a cool blue glow.', colors: ['#10151c', '#22394a'], patch: { theme: 'dark', customColors: false, glass: 55, blur: 12 } },
  { id: 'sand', name: 'Warm sand', description: 'Warm neutrals and terracotta details.', colors: ['#ede2d4', '#d9bdae'], patch: { theme: 'light', customColors: true, accentColor: '#8c4934', tintOne: '#cfb998', tintTwo: '#d5a89a', colorMix: 25, glass: 30, blur: 8 } },
  { id: 'aurora', name: 'Aurora', description: 'A soft mix of teal and violet.', colors: ['#24494c', '#423354'], patch: { theme: 'dark', customColors: true, accentColor: '#a5e3d8', tintOne: '#326f70', tintTwo: '#76579b', colorMix: 30, glass: 65, blur: 16 } },
  { id: 'clear', name: 'Clear space', description: 'Fully transparent cards, no blur.', colors: ['#e4ebe8', '#e7e1ee'], patch: { theme: 'light', customColors: true, accentColor: '#335f86', tintOne: '#a1bbb4', tintTwo: '#b0a2bf', colorMix: 20, glass: 100, blur: 0 } },
] satisfies { id: string; name: string; description: string; colors: string[]; patch: Partial<Settings> }[];
export const resetAppearance: Partial<Settings> = Object.fromEntries((['theme', 'fontSize', 'backgroundMotion', 'glass', 'blur', 'customColors', 'accentColor', 'tintOne', 'tintTwo', 'colorMix', 'backgroundFit', 'backgroundDim'] as const).map(key => [key, defaults[key]]));
