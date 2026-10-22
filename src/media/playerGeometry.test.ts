import { expect, it } from 'vitest';
import { fitPlayer, placePlayer } from './playerGeometry';
it('keeps the whole player reachable after a narrow viewport or large zoom', () => {
  const rect = fitPlayer({ x: 1200, y: -50, width: 500, height: 600 }, { width: 320, height: 300 });
  expect(rect).toEqual({ x: 8, y: 8, width: 304, height: 284 });
});
it('bounds dragging and resizing and offers exact corner placement without dragging', () => {
  const rect = fitPlayer({ x: -100, y: 1000, width: 20, height: 20 }, { width: 1280, height: 720 });
  expect(rect).toEqual({ x: 8, y: 492, width: 300, height: 220 });
  expect(placePlayer(rect, { width: 1280, height: 720 }, 'top-left')).toMatchObject({ x: 8, y: 8 });
  const lower = placePlayer(rect, { width: 1280, height: 720 });
  expect(lower.x + lower.width).toBeLessThanOrEqual(1272);
  expect(lower.y + lower.height).toBeLessThanOrEqual(712);
});
