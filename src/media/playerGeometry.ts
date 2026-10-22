export interface PlayerRect { x: number; y: number; width: number; height: number }
export interface PlayerViewport { width: number; height: number }
export function fitPlayer(rect: PlayerRect, viewport: PlayerViewport): PlayerRect {
  const maxWidth = Math.max(1, viewport.width - 16), maxHeight = Math.max(1, viewport.height - 16);
  const width = Math.min(maxWidth, Math.max(Math.min(300, maxWidth), rect.width));
  const height = Math.min(maxHeight, Math.max(Math.min(220, maxHeight), rect.height));
  return { width, height, x: Math.max(8, Math.min(rect.x, viewport.width - width - 8)), y: Math.max(8, Math.min(rect.y, viewport.height - height - 8)) };
}
export function placePlayer(rect: PlayerRect, viewport: PlayerViewport, corner = 'bottom-right'): PlayerRect {
  const fitted = fitPlayer(rect, viewport);
  return fitPlayer({ ...fitted, x: corner.endsWith('left') ? 8 : viewport.width - fitted.width - 16, y: corner.startsWith('top') ? 8 : viewport.height - fitted.height - 16 }, viewport);
}
