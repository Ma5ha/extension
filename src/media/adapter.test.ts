import { afterEach, expect, it, vi } from 'vitest';
import { allowSite, control, inspectSource } from './adapter';
import type { Source } from './model';
afterEach(() => vi.unstubAllGlobals());
it('requests only the selected host and scripting, without URL content', async () => {
  const request = vi.fn().mockResolvedValue(true);
  vi.stubGlobal('chrome', { permissions: { request } });
  await allowSite('https://www.youtube.com/watch?v=private');
  expect(request).toHaveBeenCalledWith({ permissions: ['scripting'], origins: ['https://www.youtube.com/*'] });
});
it('does not inject when permission is absent or tab is discarded', async () => {
  const executeScript = vi.fn();
  vi.stubGlobal('chrome', { permissions: { contains: vi.fn().mockResolvedValue(false) }, scripting: { executeScript } });
  expect((await inspectSource({ id: 1, url: 'https://example.com' } as chrome.tabs.Tab)).status).toBe('permission');
  expect((await inspectSource({ id: 1, discarded: true } as chrome.tabs.Tab)).status).toBe('discarded');
  expect(executeScript).not.toHaveBeenCalled();
});
it('targets the original document and rejects navigation before any command', async () => {
  const source = { tab: { id: 1, url: 'https://example.com/video' } } as Source;
  const item = { id: 'media1', documentId: 'original-document' } as Source['items'][number];
  const get = vi.fn().mockResolvedValue(source.tab);
  const executeScript = vi.fn().mockResolvedValue([{ result: { items: [] } }]);
  vi.stubGlobal('chrome', { tabs: { get }, scripting: { executeScript } });
  await control(source, item, { type: 'pause' });
  expect(executeScript.mock.calls[0]![0].target).toEqual({ tabId: 1, documentIds: ['original-document'] });
  executeScript.mockClear(); get.mockResolvedValue({ id: 1, url: 'https://example.com/other' });
  await expect(control(source, item, { type: 'play' })).rejects.toThrow();
  expect(executeScript).not.toHaveBeenCalled();
});

it('injects PiP before the first await and pins the selected document', async () => {
  const source = { tab: { id: 1, url: 'https://example.com/video' } } as Source;
  const item = { id: 'chosen-video', documentId: 'chosen-document' } as Source['items'][number];
  const get = vi.fn();
  const executeScript = vi.fn().mockResolvedValue([{ result: { items: [] } }]);
  vi.stubGlobal('chrome', { tabs: { get }, scripting: { executeScript } });
  const pending = control(source, item, { type: 'pip-enter' });
  expect(executeScript).toHaveBeenCalledOnce();
  expect(get).not.toHaveBeenCalled();
  expect(executeScript.mock.calls[0]![0]).toMatchObject({ target: { tabId: 1, documentIds: ['chosen-document'] }, args: ['chosen-video', { type: 'pip-enter' }] });
  await pending;
});
it('returns a safe actionable error when the browser rejects PiP', async () => {
  const source = { tab: { id: 1 } } as Source;
  const item = { id: 'video', documentId: 'original' } as Source['items'][number];
  vi.stubGlobal('chrome', { scripting: { executeScript: vi.fn().mockResolvedValue([{ result: { errorCode: 'pip-rejected' } }]) } });
  await expect(control(source, item, { type: 'pip-enter' })).rejects.toThrow('Otvori izvorni tab');
});
