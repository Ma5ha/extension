import { useState } from 'react';
import { Terminal, Plug, X, Trash } from '@phosphor-icons/react';
import type { Tab } from '../domain/tabs';
import { isExtension } from '../adapters/chrome';
import { allowedConsoleUrl } from './model';
import { useConsole } from './useConsole';
import styles from '../App.module.css';
import css from './ConsoleWidget.module.css';
export function ConsoleWidget({ tabs, canList, enableTabs }: { tabs: Tab[]; canList: boolean; enableTabs: () => void }) {
  const { state, busy, ready, send } = useConsole();
  const [selected, setSelected] = useState(0), [level, setLevel] = useState('all');
  const choices = tabs.filter(tab => allowedConsoleUrl(tab.url));
  const target = choices.some(tab => tab.id === selected) ? selected : choices[0]?.id;
  const entries = state.entries.filter(entry => level === 'all' || entry.level === level || (level === 'warning' && entry.level === 'error'));
  return <section className={styles.panel} aria-labelledby="developer-console-title" aria-busy={busy}>
    <header className={styles.panelHeader}><h2 id="developer-console-title"><Terminal size={20} aria-hidden="true" />Developer console</h2>{state.connected && <span className={css.connected}>Connected</span>}</header>
    <p className={styles.meta}>Read-only logs · One selected tab · Kept only in memory</p>
    {!isExtension ? <p className={css.notice}>Console capture works in the Chrome extension. No demo logs are shown here.</p> : !canList ? <button onClick={enableTabs}>Allow tab list</button> : <div className={css.controls}>
      <label>Tab<select value={target ?? ''} disabled={state.connected || busy || !choices.length} onChange={event => setSelected(Number(event.target.value))}>{!choices.length && <option value="">No supported web tabs</option>}{choices.map(tab => <option key={tab.id} value={tab.id}>{tab.title} · {new URL(tab.url).hostname}</option>)}</select></label>
      <button disabled={!ready || busy || (!state.connected && target === undefined)} onClick={() => send(state.connected ? 'disconnect' : 'connect', target)}>{state.connected ? <X size={16} aria-hidden="true" /> : <Plug size={16} aria-hidden="true" />}{busy ? 'Connecting…' : state.connected ? 'Disconnect' : 'Connect'}</button>
    </div>}
    {state.error && <p role="alert" className={css.notice}>{state.error}</p>}
    {state.connected && <p className={styles.meta}>Capturing: {state.title}. Switching tabs does not change the target.</p>}
    <div className={css.toolbar}><label>Show<select value={level} onChange={event => setLevel(event.target.value)}><option value="all">All messages</option><option value="error">Errors</option><option value="warning">Warnings & errors</option><option value="log">Logs</option><option value="info">Info</option><option value="debug">Debug</option></select></label><button disabled={busy || !state.entries.length} onClick={() => send('clear')}><Trash size={14} aria-hidden="true" />Clear view</button></div>
    {entries.length ? <ol className={css.entries} aria-label="Captured console messages">{entries.map(entry => <li key={entry.id} data-level={entry.level}><div className={css.entryMeta}><span>{entry.level}</span><time dateTime={new Date(entry.time).toISOString()}>{new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(entry.time)}</time></div><pre>{entry.text}</pre>{entry.location && <small>{entry.location}</small>}</li>)}</ol> : <p className={css.notice}>{state.connected ? 'No matching messages yet. Use the connected page to generate logs.' : 'Select a web tab and connect to capture its console.'}</p>}
    <p className={styles.meta}>Latest 200 messages. Closing this widget disconnects and clears its logs. Chrome’s debugger permission is broad; attachment is manual. Page navigation disconnects. Cross-process frames and workers are not included.</p>
  </section>;
}
