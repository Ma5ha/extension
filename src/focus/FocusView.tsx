import { FocusPanel } from './FocusPanel';
import { ReminderControl } from '../clock/ReminderTools';
import styles from '../App.module.css';
export function FocusView() {
  return <div className={styles.focusContent}><section className={styles.panel}><header className={styles.panelHeader}><h2>Focus timer</h2></header><ReminderControl kind="timer" /></section><FocusPanel /></div>;
}
