import type { GroupPlan } from '../domain/tabs';
import styles from '../App.module.css';

export function GroupPreview({ plan, busy, confirm, cancel }: { plan: GroupPlan; busy: boolean; confirm: () => void; cancel: () => void }) {
  const count = plan.groups.reduce((sum, g) => sum + g.tabs.length, 0);
  return <div className={styles.groupPreview}><p><strong>{count} tabova → {plan.groups.length} grupa</strong> u trenutnom prozoru.</p><p>Isti sajt znači isti protokol, host i port. Grupisanje premješta tabove u nove Chrome grupe; nijedan tab se ne zatvara.</p><ul>{plan.groups.map(g => <li key={g.origin}><strong>{g.origin}</strong><span>{g.tabs.length} tabova</span></li>)}</ul>
    <h3>Preskočeno</h3><dl>{Object.entries({ 'Zakačeni tabovi': plan.skipped.pinned, 'Već grupisani': plan.skipped.grouped, 'Interne i nepodržane adrese': plan.skipped.unsupported, 'Sajtovi sa jednim tabom': plan.skipped.single }).map(([name, count]) => <div key={name}><dt>{name}</dt><dd>{count}</dd></div>)}</dl>
    <p>Prije primjene ponovo provjeravamo odabrane tabove. Promijenjeni tabovi se preskaču; novi tabovi ne ulaze u ovaj pregled.</p><div className={styles.dialogActions}><button disabled={busy} onClick={cancel}>Odustani</button><button className={styles.primary} disabled={busy || count === 0} onClick={confirm}>{busy ? 'Grupisanje…' : 'Primijeni grupisanje'}</button></div>
  </div>;
}
