import { createContext, useContext } from 'react';
import type { MediaController } from './useMediaController';
export const MediaContext = createContext<MediaController | null>(null);
export function useMediaPlayer() {
  const player = useContext(MediaContext);
  if (!player) throw new Error('MediaProvider is required');
  return player;
}
