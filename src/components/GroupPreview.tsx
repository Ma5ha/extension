import type { GroupPlan } from '../domain/tabs';
import styles from '../App.module.css';

export function GroupPreview({ plan, busy, confirm, cancel }: { plan: GroupPlan; busy: boolean; confirm: () => void; cancel: () => void }) {
  const count = plan.groups.reduce((sum, g) => sum + g.tabs.length, 0);
  return <div className={styles.groupPreview}><p><strong>{count} tabova → {plan.groups.length} grupa</strong> u trenutnom prozoru.</p><p>Sites are grouped by protocol, host and port. Tabs move into new Chrome groups; no tabs are closed.</p><ul>{plan.groups.map(g => <li key={g.origin}><strong>{g.origin}</strong><span>{g.tabs.length} tabova</span></li>)}</ul>
    <h3>Skipped</h3><dl>{Object.entries({ 'Pinned tabs': plan.skipped.pinned, 'Already grouped': plan.skipped.grouped, 'Internal and unsupported addresses': plan.skipped.unsupported, 'Sites with a single tab': plan.skipped.single }).map(([name, count]) => <div key={name}><dt>{name}</dt><dd>{count}</dd></div>)}</dl>
    <p>Selected tabs are checked again before grouping. Changed tabs are skipped; newly opened tabs are not included in this preview.</p><div className={styles.dialogActions}><button disabled={busy} onClick={cancel}>Cancel</button><button className={styles.primary} disabled={busy || count === 0} onClick={confirm}>{busy ? 'Grouping…' : 'Apply grouping'}</button></div>
  </div>;
}
