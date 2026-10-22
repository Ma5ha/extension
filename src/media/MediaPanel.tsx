import { Headphones } from '@phosphor-icons/react';
import { useMediaPlayer } from './MediaContext';
import { MediaContent } from './MediaContent';
import styles from '../App.module.css';
import media from './MediaPanel.module.css';

export function MediaPanel({ compact = false }: { compact?: boolean }) {
  const player = useMediaPlayer();
  if (!player.floating && !player.playerWindow.pipWindow) return <MediaContent compact={compact} />;
  return <section className={`${styles.panel} ${media.panel} ${compact ? media.compact : ''}`} aria-label="Mediji">
    <header className={styles.panelHeader}><h2><Headphones size={22} />Mediji</h2></header>
    <p className={styles.meta}>Kontrole su {player.playerWindow.pipWindow ? 'u izdvojenom prozoru' : 'u mini-playeru'}.</p>
    {player.source && <p className={media.sourceTitle}>{player.source.tab.title || 'Medijski izvor'}</p>}
    <button onClick={player.dock}>Vrati u panel</button>
  </section>;
}
