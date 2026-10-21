import { isExtension } from '../adapters/chrome';
export function openSidePanel(windowId: number) {
  if (!isExtension || !chrome.sidePanel) return Promise.reject(new Error('sidepanel'));
  return chrome.sidePanel.open({ windowId });
}
