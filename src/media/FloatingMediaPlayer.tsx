import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { DotsSix, ArrowsInSimple, CornersOut } from '@phosphor-icons/react';
import { MediaContent } from './MediaContent';
import { useMediaPlayer } from './MediaContext';
import { fitPlayer, placePlayer, type PlayerRect } from './playerGeometry';
import css from './FloatingMediaPlayer.module.css';

const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });
export function FloatingMediaPlayer() {
  const player = useMediaPlayer();
  const popup = player.playerWindow.pipWindow;
  const shown = player.floating || !!popup;
  const [rect, setRect] = useState(() => placePlayer({ x: 0, y: 0, width: 360, height: 520 }, viewport()));
  const drag = useRef<{ x: number; y: number; rect: PlayerRect; resizing: boolean } | null>(null);
  const focus = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const resize = () => setRect(previous => fitPlayer(previous, viewport()));
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => { if (shown) focus.current?.focus(); }, [shown, popup]);
  if (!shown) return null;
  function start(event: ReactPointerEvent<HTMLButtonElement>, resizing = false) {
    if (event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, rect, resizing };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: ReactPointerEvent<HTMLButtonElement>) {
    const origin = drag.current;
    if (!origin) return;
    const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
    setRect(fitPlayer(origin.resizing ? { ...origin.rect, width: origin.rect.width + dx, height: origin.rect.height + dy } : { ...origin.rect, x: origin.rect.x + dx, y: origin.rect.y + dy }, viewport()));
  }
  function finish(event: ReactPointerEvent<HTMLButtonElement>) {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, resizing = false) {
    const step = event.shiftKey ? 32 : 16;
    const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
    const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
    if (!dx && !dy) return;
    event.preventDefault();
    setRect(previous => fitPlayer(resizing ? { ...previous, width: previous.width + dx, height: previous.height + dy } : { ...previous, x: previous.x + dx, y: previous.y + dy }, viewport()));
  }
  const root = <aside className={popup ? css.window : css.floating} style={popup ? undefined : { left: rect.x, top: rect.y, width: rect.width, height: rect.height }} aria-label={popup ? 'Izdvojene medijske kontrole' : 'Plutajući mini-player'} onKeyDown={event => { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); player.dock(); } }}>
    <header className={css.bar}>
      {!popup && <button ref={focus} className={css.handle} aria-label="Pomjeri mini-player" title="Prevuci ili pomjeraj strelicama tastature" onPointerDown={event => start(event)} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={() => { drag.current = null; }} onKeyDown={event => keyboard(event)}><DotsSix size={20} aria-hidden="true" /><span>Mini-player</span></button>}
      {popup && <strong>Mini-player</strong>}
      <button ref={popup ? focus : undefined} className={css.dock} onClick={player.dock} title="Vrati u panel" aria-label="Vrati u panel"><ArrowsInSimple size={19} aria-hidden="true" /></button>
    </header>
    <div className={css.content}><MediaContent compact detached />
      {!popup && <details className={css.placement}><summary>Položaj i veličina</summary><label>Položaj<select aria-label="Položaj mini-playera" defaultValue="" onChange={event => { if (event.target.value) setRect(previous => placePlayer(previous, viewport(), event.target.value)); }}><option value="" disabled>Izaberi ugao…</option><option value="bottom-right">Dolje desno</option><option value="bottom-left">Dolje lijevo</option><option value="top-right">Gore desno</option><option value="top-left">Gore lijevo</option></select></label><label>Veličina<select aria-label="Veličina mini-playera" defaultValue="" onChange={event => { const sizes = { small: [320, 400], medium: [360, 520], large: [480, 620] } as const; const size = sizes[event.target.value as keyof typeof sizes]; if (size) setRect(previous => fitPlayer({ ...previous, width: size[0], height: size[1] }, viewport())); }}><option value="" disabled>Izaberi veličinu…</option><option value="small">Mala</option><option value="medium">Srednja</option><option value="large">Velika</option></select></label></details>}
    </div>
    {!popup && <button className={css.resize} aria-label="Promijeni veličinu mini-playera" title="Prevuci ili koristi strelice tastature" onPointerDown={event => start(event, true)} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={() => { drag.current = null; }} onKeyDown={event => keyboard(event, true)}><CornersOut size={16} aria-hidden="true" /></button>}
  </aside>;
  return createPortal(root, popup?.document.body ?? document.body);
}
