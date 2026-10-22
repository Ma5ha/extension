import { useRef, useState } from 'react';
import { allowSite, control } from './adapter';
import { MediaActionError, type MediaCommand, type Source } from './model';
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
  const trigger = useRef<HTMLElement | null>(null);
  const source = data.sources.find(s => String(s.tab.id) === selected) ?? data.sources[0];
  const item = source?.items.find(i => mediaItemKey(i) === element) ?? source?.items[0];

  async function perform(action: () => Promise<unknown>) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof MediaActionError ? error.message : 'Radnja nije uspjela. Izvor je možda promijenjen, zatvoren ili nedostupan. Otvori tab ili osvježi listu.'); }
    finally { locked.current = false; setBusy(false); await data.refresh(); }
  }
  function command(value: MediaCommand) {
    if (!source || !item || locked.current) return;
    // Chrome shares one PiP slot between video and document windows.
    // Close our controls synchronously while preserving the click gesture.
    if (value.type === 'pip-enter' && playerWindow.pipWindow) {
      playerWindow.close(); setFloating(true);
    }
    void perform(() => control(source, item, value));
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
      const target = trigger.current?.isConnected ? trigger.current : document.querySelector<HTMLElement>('[aria-label="Mediji"] button, nav button[aria-current="page"]');
      target?.focus();
    });
  }
  async function detach(opener?: HTMLElement) {
    if (opener) trigger.current = opener;
    if (await playerWindow.open()) setFloating(false);
  }
  async function grant(url?: string) {
    await perform(async () => {
      if (!await allowSite(url)) setMessage('Pristup nije odobren. Mute i otvaranje taba ostaju dostupni.');
    });
  }
  return { ...data, source, item, busy, message, perform, command, selectSource, selectElement, grant,
    floating, playerWindow, float, dock, detach };
}
export type MediaController = ReturnType<typeof useMediaController>;
