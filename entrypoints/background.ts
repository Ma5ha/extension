import { defineBackground } from 'wxt/utils/define-background';
import { registerReminders } from '../src/clock/background';

export default defineBackground(() => {
  registerReminders();
  chrome.action.onClicked.addListener(tab => {
    if (tab.windowId !== undefined) void chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {
      // A failed open can be retried from the Chrome side-panel chooser.
    });
  });
});
