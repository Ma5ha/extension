import { useCallback, useState } from 'react';
import { BookmarkPanel } from '../bookmarks/BookmarkPanel';
import { MediaPanel } from '../media/MediaPanel';
import { FocusPanel } from '../focus/FocusPanel';
import { useTabs } from '../hooks/useTabs';
import { useSettings } from '../hooks/useSettings';
import css from './SidePanelApp.module.css';
export function SidePanelApp() {
  const [message, setMessage] = useState(''); const report = useCallback((s: string) => setMessage(s), []);
  const tabs = useTabs(report); const { settings, update } = useSettings(report);
  const [panel, setPanel] = useState<'bookmarks' | 'media' | 'focus'>('bookmarks');
  return <main className={css.app}><header><strong>tabora.</strong><button aria-label="Promijeni temu" onClick={() => void update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>{settings.theme === 'dark' ? 'Svijetlo' : 'Tamno'}</button></header>
    <nav aria-label="Bočni panel">{(['bookmarks', 'media', 'focus'] as const).map(key => <button key={key} aria-current={panel === key ? 'page' : undefined} onClick={() => setPanel(key)}>{{ bookmarks: 'Bookmarkovi', media: 'Mediji', focus: 'Bilješke' }[key]}</button>)}</nav>
    {message && <p role="status">{message}</p>}{tabs.state === 'denied' && panel === 'bookmarks' && <button onClick={() => void tabs.enable()}>Omogući izbor otvorenog taba</button>}
    {panel === 'bookmarks' && <BookmarkPanel tabs={tabs.tabs} />}{panel === 'media' && <MediaPanel />}{panel === 'focus' && <FocusPanel />}
  </main>;
}
