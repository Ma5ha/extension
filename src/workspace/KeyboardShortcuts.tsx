import { useEffect } from 'react';
import type { WorkspaceId } from './WorkspaceContext';
export function useShortcuts({ focus, timer, note, workspace }: { focus: () => void; timer: () => void; note: () => void; workspace: (id: WorkspaceId) => void }) {
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.defaultPrevented || event.isComposing || event.repeat || !event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]')) return;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'))) return;
      const action = event.code === 'KeyF' ? focus : event.code === 'KeyT' ? timer : event.code === 'KeyN' ? note : event.code === 'Digit1' ? () => workspace('work') : event.code === 'Digit2' ? () => workspace('personal') : event.code === 'Digit3' ? () => workspace('study') : null;
      if (action) { event.preventDefault(); action(); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [focus, timer, note, workspace]);
}
export function KeyboardShortcuts() {
  return <details><summary>Keyboard shortcuts</summary><p>Use Alt/Option + Shift inside Tabora. Shortcuts pause while typing or when a dialog is open.</p><dl><dt>F</dt><dd>Toggle focus mode</dd><dt>T</dt><dd>Start a 25-minute timer, pause or resume</dd><dt>N</dt><dd>New workspace note</dd><dt>1 / 2 / 3</dt><dd>Work / Personal / Study</dd></dl></details>;
}
