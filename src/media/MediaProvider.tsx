import type { ReactNode } from 'react';
import { MediaContext } from './MediaContext';
import { FloatingMediaPlayer } from './FloatingMediaPlayer';
import { useMediaController } from './useMediaController';

export function MediaProvider({ active, children, showFloating = true }: { active: boolean; children: ReactNode; showFloating?: boolean }) {
  const player = useMediaController(active);
  return <MediaContext.Provider value={player}>{children}{(showFloating || player.playerWindow.pipWindow) && <FloatingMediaPlayer />}</MediaContext.Provider>;
}
