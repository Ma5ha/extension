import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaults, loadSettings, parseSettings, saveSettings } from './settings';

afterEach(() => vi.unstubAllGlobals());

describe('settings boundary', () => {
  it('validates untrusted stored values and discards unknown fields', () => {
    expect(parseSettings(null)).toEqual(defaults);
    expect(parseSettings({ theme: 'invalid', glass: Infinity, agenda: 'false', token: 'not-retained' })).toEqual(defaults);
    expect(parseSettings({ theme: 'dark', glass: 500, agenda: false })).toEqual({ ...defaults, theme: 'dark', glass: 70, agenda: false });
    expect(parseSettings({ glass: -10 }).glass).toBe(0);
  });
  it('opens the new console without discarding a previously saved custom layout', () => {
    const layout = { ...defaults.layout, widths: { left: 1, center: 2.4, right: 1.2 } };
    expect(parseSettings({ layout }).layoutMode).toBe('console');
    expect(parseSettings({ layout }).layout).toEqual(layout);
    expect(parseSettings({ layoutMode: 'custom', layout }).layoutMode).toBe('custom');
    expect(parseSettings({ layoutMode: 'unknown' }).layoutMode).toBe('console');
  });
  it('persists independent fields without overwriting parallel updates', async () => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) });
    expect(await loadSettings()).toEqual(defaults);
    await Promise.all([saveSettings({ theme: 'dark' }), saveSettings({ gmail: false })]);
    expect(await loadSettings()).toEqual({ ...defaults, theme: 'dark', gmail: false });
    await saveSettings({ glass: 70 });
    expect((await loadSettings()).glass).toBe(70);
  });
});
