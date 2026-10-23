import { EnvelopeSimple, ArrowUpRight, LockSimple } from '@phosphor-icons/react';
import styles from '../App.module.css';
import css from './ServicePanels.module.css';
import { SiteIcon } from './SiteIcon';

export function GmailPanel({ compact = false }: { compact?: boolean }) {
  if (compact) return <section className={css.compact} aria-labelledby="gmail-title"><a className={css.shortcut} href="https://mail.google.com/" target="_blank" rel="noreferrer"><span className={css.icon}><SiteIcon url="https://mail.google.com/" size={24} /></span><div><h2 id="gmail-title">Gmail</h2><p>Open Gmail in a new tab.</p></div><ArrowUpRight className={css.arrow} size={19} /></a></section>;
  return <section className={styles.panel} aria-labelledby="gmail-title"><header className={styles.panelHeader}><h2 id="gmail-title"><EnvelopeSimple size={22} />Gmail</h2><span className={styles.badge}>Not connected</span></header><div className={styles.inset}><LockSimple size={22} /><h3>A place for your inbox.</h3><p>Connection is not available yet. Messages are not loaded.</p><a href="https://mail.google.com/" target="_blank" rel="noreferrer">Open Gmail<ArrowUpRight size={16} /></a></div></section>;
}
