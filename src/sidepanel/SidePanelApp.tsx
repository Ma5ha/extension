import { useCallback, useState } from 'react';
import { BookmarkPanel } from '../bookmarks/BookmarkPanel';
import { MediaPanel } from '../media/MediaPanel';
import { MediaProvider } from '../media/MediaProvider';
import { FocusPanel } from '../focus/FocusPanel';
import { useTabs } from '../hooks/useTabs';
import { useSettings } from '../hooks/useSettings';
import { WorkspaceProvider, WorkspacePicker, useWorkspace } from '../workspace/WorkspaceContext';
import css from './SidePanelApp.module.css';
export function SidePanelApp() { return <WorkspaceProvider><SelectedPanel /></WorkspaceProvider>; }
function SelectedPanel() { const { workspace } = useWorkspace(); return <SidePanelContent key={workspace} />; }
function SidePanelContent() {
  const [message, setMessage] = useState(''); const report = useCallback((s: string) => setMessage(s), []);
  const tabs = useTabs(report); const { settings, update } = useSettings(report);
  const [panel, setPanel] = useState<'bookmarks' | 'media' | 'focus'>('bookmarks');
  return <MediaProvider active={panel === 'media'}><main className={css.app}><header><strong>tabora.</strong><button aria-label="Switch theme" onClick={() => void update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>{settings.theme === 'dark' ? 'Svijetlo' : 'Tamno'}</button></header>
    <WorkspacePicker /><nav aria-label="Side panel">{(['bookmarks', 'media', 'focus'] as const).map(key => <button key={key} aria-current={panel === key ? 'page' : undefined} onClick={() => setPanel(key)}>{{ bookmarks: 'Bookmarks', media: 'Media', focus: 'Notes' }[key]}</button>)}</nav>
    {message && <p role="status">{message}</p>}{tabs.state === 'denied' && panel === 'bookmarks' && <button onClick={() => void tabs.enable()}>Allow open-tab selection</button>}
    {panel === 'bookmarks' && <BookmarkPanel tabs={tabs.tabs} />}{panel === 'media' && <MediaPanel />}{panel === 'focus' && <FocusPanel />}
  </main></MediaProvider>;
}
