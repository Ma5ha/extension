import { useState } from 'react';
import { EnvelopeSimple, ArrowUpRight } from '@phosphor-icons/react';
import { useGmail } from './useGmail';
import { mailUrl } from './model';
import styles from '../App.module.css';
import css from './GmailPanel.module.css';
const messages = {
  setup: 'Gmail connection is not configured in this build.',
  disconnected: 'Connect Gmail to view senders and subjects. Message bodies are not accessed.',
  denied: 'Connection was not approved. Check that your account is a Google test user, then try again.',
  expired: 'Gmail access has expired or been revoked. Connect again.',
  offline: 'Gmail is unavailable offline. Check your connection and try again.',
  forbidden: 'Google denied Gmail access. Check that Gmail API and the Gmail metadata permission are enabled in Google Cloud.',
  rate: 'Google is limiting requests. Try again later.',
  error: 'Could not load Gmail. Try again.',
  loading: 'Loading Gmail…', ready: '',
};
export function GmailPanel() {
  const [visible, setVisible] = useState(false), [unread, setUnread] = useState(true);
  const { status, inbox, busy, connect, disconnect, refresh } = useGmail(unread, visible);
  const connected = !['setup', 'disconnected', 'denied'].includes(status);
  return <section className={styles.panel} aria-labelledby="gmail-title" aria-busy={status === 'loading' || busy}>
    <header className={styles.panelHeader}><h2 id="gmail-title"><EnvelopeSimple size={22} aria-hidden="true" />Gmail</h2>{connected && <button aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? 'Hide messages' : 'Show messages'}</button>}</header>
    {connected && <p className={styles.meta}>Read-only headers · No message bodies · Hidden on every new tab</p>}
    {connected && visible && <label className={css.filter}><input type="checkbox" checked={unread} onChange={e => setUnread(e.target.checked)} />Unread inbox only</label>}
    {status !== 'ready' && <div className={styles.serviceEmpty}><p role={['error', 'forbidden', 'rate'].includes(status) ? 'alert' : 'status'}>{messages[status]}</p>
      {['disconnected', 'denied', 'expired'].includes(status) && <button className={styles.primary} disabled={busy} onClick={() => void connect()}>Connect Gmail</button>}
      {['offline', 'error', 'forbidden', 'rate'].includes(status) && <button disabled={busy} onClick={() => void refresh()}>Try again</button>}
    </div>}
    {status === 'ready' && !visible && <p className={css.notice}>Private content is hidden. Show messages when you are ready.</p>}
    {visible && inbox && <div>
      <p className={css.account}>{inbox.email}</p>
      {inbox.messages.length === 0 ? <p className={css.notice}>{unread ? 'No unread messages in your inbox.' : 'Your inbox is empty.'}</p> : <ul className={css.messages}>{inbox.messages.map(mail => <li key={mail.id}>
        <a href={mailUrl(inbox.email, mail.threadId)} target="_blank" rel="noreferrer">
          <span className={css.sender}>{mail.from}</span><strong>{mail.subject || '(No subject)'}</strong>
          <span className={css.details}>{mail.unread && <span>Unread</span>}{mail.date !== null && <time dateTime={new Date(mail.date).toISOString()}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(mail.date)}</time>}<ArrowUpRight size={14} aria-hidden="true" /></span>
        </a>
      </li>)}</ul>}
      <p className={styles.meta}>Updated {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(inbox.updated)} · {inbox.more ? 'Latest 10 messages · Open Gmail for more' : `${inbox.messages.length} messages`}</p>
    </div>}
    <div className={css.actions}><a href={inbox ? mailUrl(inbox.email) : 'https://mail.google.com/'} target="_blank" rel="noreferrer">Open Gmail<ArrowUpRight size={16} aria-hidden="true" /></a>
      {connected && <button disabled={busy} onClick={() => { setVisible(false); void disconnect(); }}>Disconnect Gmail</button>}
      {visible && inbox && <button disabled={busy} onClick={() => void refresh()}>Refresh</button>}
    </div>
  </section>;
}
