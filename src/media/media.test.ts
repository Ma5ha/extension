import { afterEach, describe, expect, it, vi } from 'vitest';
import { sitePattern, validCommand } from './model';
import { mediaDOM } from './dom';
afterEach(() => vi.unstubAllGlobals());
describe('media permissions and commands', () => {
  it('requests one HTTP host, excludes protected URLs', () => {
    expect(sitePattern('https://example.com:8443/watch?q=private')).toBe('https://example.com/*');
    expect(sitePattern('chrome://settings')).toBeNull();
    expect(sitePattern('not a url')).toBeNull();
  });
  it('rejects invalid volume and seek values', () => {
    expect(validCommand({ type: 'volume', value: 2 })).toBe(false);
    expect(validCommand({ type: 'seek', value: NaN })).toBe(false);
    expect(validCommand({ type: 'seek', value: -1 })).toBe(false);
    expect(validCommand({ type: 'volume', value: 0 })).toBe(true);
  });
});
describe('isolated media function', () => {
  function setup() {
    const first = { tagName: 'VIDEO', paused: true, ended: false, volume: 0.5, muted: false, currentTime: 20, duration: Infinity, seekable: { length: 1, start: () => 10, end: () => 30 }, play: vi.fn().mockResolvedValue(undefined), pause: vi.fn() };
    const second = { ...first, play: vi.fn(), pause: vi.fn() };
    vi.stubGlobal('document', { querySelectorAll: (query: string) => query === 'audio,video' ? [first, second] : [] });
    return { first, second };
  }
  it('discovery does not play and preserves paused/live sources', async () => {
    const { first } = setup();
    const result = await mediaDOM();
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({ paused: true, duration: null });
    expect(first.play).not.toHaveBeenCalled();
  });
  it('targets only the selected element and rejects seek outside live window', async () => {
    const { first, second } = setup();
    const { items } = await mediaDOM();
    await mediaDOM(items[1]!.id, { type: 'pause' });
    expect(second.pause).toHaveBeenCalledOnce();
    expect(first.pause).not.toHaveBeenCalled();
    expect((await mediaDOM(items[0]!.id, { type: 'seek', value: 40 })).error).toBeTruthy();
    expect(first.currentTime).toBe(20);
    await mediaDOM(items[0]!.id, { type: 'seek', value: 25 });
    expect(first.currentTime).toBe(25);
  });
  it('reports rejected playback and missing elements', async () => {
    const { first } = setup();
    first.play.mockRejectedValue(new Error('blocked'));
    const { items } = await mediaDOM();
    expect((await mediaDOM(items[0]!.id, { type: 'play' })).error).toBeTruthy();
    expect((await mediaDOM('missing', { type: 'pause' })).error).toBeTruthy();
  });
});
