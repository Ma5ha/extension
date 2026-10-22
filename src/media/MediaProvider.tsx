import type { ReactNode } from 'react';
import { MediaContext } from './MediaContext';
import { FloatingMediaPlayer } from './FloatingMediaPlayer';
import { useMediaController } from './useMediaController';

export function MediaProvider({ active, children }: { active: boolean; children: ReactNode }) {
  const player = useMediaController(active);
  return <MediaContext.Provider value={player}>{children}<FloatingMediaPlayer /></MediaContext.Provider>;
}
