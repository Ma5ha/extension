import { EnvelopeSimple, ArrowUpRight, LockSimple } from '@phosphor-icons/react';
import styles from '../App.module.css';

export function GmailPanel() {
  return <section className={styles.panel} aria-labelledby="gmail-title"><header className={styles.panelHeader}><h2 id="gmail-title"><EnvelopeSimple size={22} />Gmail</h2><span className={styles.badge}>Nepovezano</span></header><div className={styles.inset}><LockSimple size={22} /><h3>Prostor za tvoju poštu.</h3><p>Povezivanje još nije dostupno. Poruke se ne učitavaju.</p><a href="https://mail.google.com/" target="_blank" rel="noreferrer">Otvori Gmail<ArrowUpRight size={16} /></a></div></section>;
}
