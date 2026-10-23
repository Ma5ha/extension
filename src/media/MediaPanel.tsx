import { Headphones } from '@phosphor-icons/react';
import { useMediaPlayer } from './MediaContext';
import { MediaContent } from './MediaContent';
import styles from '../App.module.css';
import media from './MediaPanel.module.css';

export function MediaPanel({ compact = false }: { compact?: boolean }) {
  const player = useMediaPlayer();
  if (!player.floating && !player.playerWindow.pipWindow) return <MediaContent compact={compact} />;
  return <section className={`${styles.panel} ${media.panel} ${compact ? media.compact : ''}`} aria-label="Media">
    <header className={styles.panelHeader}><h2><Headphones size={22} />Media</h2></header>
    <p className={styles.meta}>Controls are {player.playerWindow.pipWindow ? 'in a detached window' : 'in the mini-player'}.</p>
    {player.source && <p className={media.sourceTitle}>{player.source.tab.title || 'Media source'}</p>}
    <button onClick={player.dock}>Return to panel</button>
  </section>;
}
