import { useRef, useState } from 'react';
import { allowSite, control } from './adapter';
import { MediaActionError, optimisticMediaItem, type MediaCommand, type Source } from './model';
import { useMedia } from './useMedia';
import { usePlayerWindow } from './usePlayerWindow';

export const mediaItemKey = (item: Source['items'][number]) => `${item.documentId}:${item.id}`;

export function useMediaController(active: boolean) {
  const playerWindow = usePlayerWindow();
  const [floating, setFloating] = useState(false);
  const data = useMedia(active || floating || !!playerWindow.pipWindow, playerWindow.pipWindow);
  const [selected, setSelected] = useState('');
  const [element, setElement] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const commands = useRef<Promise<void>>(Promise.resolve());
  const commandVersions = useRef(new Map<string, number>());
  const trigger = useRef<HTMLElement | null>(null);
  const source = data.sources.find(s => String(s.tab.id) === selected) ?? data.sources[0];
  const item = source?.items.find(i => mediaItemKey(i) === element) ?? source?.items[0];

  async function perform(action: () => Promise<unknown>) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof MediaActionError ? error.message : 'The action failed. The source may have changed, closed or become unavailable. Open the tab or refresh the list.'); }
    finally { locked.current = false; setBusy(false); void data.refresh(); }
  }
  function command(value: MediaCommand) {
    if (!source || !item || locked.current) return;
    const targetSource = source, targetItem = item;
    const tabId = source.tab.id!;
    const key = `${tabId}:${mediaItemKey(item)}`;
    const version = (commandVersions.current.get(key) ?? 0) + 1;
    commandVersions.current.set(key, version);
    setMessage('');
    // PiP must retain the synchronous user gesture; do not put it in the queue.
    if (value.type === 'pip-enter' || value.type === 'pip-exit') {
      if (value.type === 'pip-enter' && playerWindow.pipWindow) { playerWindow.close(); setFloating(true); }
      return perform(async () => {
        const confirmed = await control(targetSource, targetItem, value);
        if (confirmed) data.updateItem(tabId, targetItem.documentId, targetItem.id, confirmed);
      });
    }
    const finish = data.beginItemChange(tabId);
    data.updateItem(tabId, item.documentId, item.id, optimisticMediaItem(item, value));
    const execute = async () => {
      try {
        const confirmed = await control(targetSource, targetItem, value);
        if (confirmed && commandVersions.current.get(key) === version) data.updateItem(tabId, targetItem.documentId, targetItem.id, confirmed);
      } catch (error) {
        if (commandVersions.current.get(key) === version) {
          data.updateItem(tabId, targetItem.documentId, targetItem.id, targetItem);
          setMessage(error instanceof MediaActionError ? error.message : 'The source did not accept the change. Refresh or open its tab to try again.');
          void data.refresh();
        }
      } finally { finish(); }
    };
    const pending = commands.current.then(execute, execute);
    commands.current = pending;
    return pending;
  }
  function selectSource(value: string) { setSelected(value); setElement(''); setMessage(''); }
  function selectElement(value: string) { setElement(value); setMessage(''); }
  function float(opener?: HTMLElement) {
    if (opener) trigger.current = opener;
    playerWindow.close(); setFloating(true);
  }
  function dock() {
    playerWindow.close(); setFloating(false);
    window.requestAnimationFrame(() => {
      const target = trigger.current?.isConnected ? trigger.current : document.querySelector<HTMLElement>('[aria-label="Media"] button, nav button[aria-current="page"]');
      target?.focus();
    });
  }
  async function detach(opener?: HTMLElement) {
    if (opener) trigger.current = opener;
    if (await playerWindow.open()) setFloating(false);
  }
  async function grant(url?: string) {
    const candidate = data.candidates.find(tab => tab.url === url);
    if (candidate?.id !== undefined) { data.rememberSource(candidate.id); selectSource(String(candidate.id)); }
    await perform(async () => {
      if (!await allowSite(url)) setMessage('Access was not granted. Muting and opening the tab are still available.');
    });
  }
  return { ...data, source, item, busy, message, perform, command, selectSource, selectElement, grant,
    floating, playerWindow, float, dock, detach };
}
export type MediaController = ReturnType<typeof useMediaController>;
