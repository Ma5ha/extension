import { allowedConsoleUrl, consoleEntry, emptyConsole, type ConsoleState } from './model';
export function registerConsole() {
  let owner: chrome.runtime.Port | null = null, state: ConsoleState = { ...emptyConsole, entries: [] }, serial = 0;
  let queue = Promise.resolve();
  let flush: ReturnType<typeof setTimeout> | undefined;
  const enqueue = (work: () => Promise<void>) => { queue = queue.catch(() => {}).then(work).catch(() => {}); };
  function publish() { try { owner?.postMessage(state); } catch { /* Disconnected widget receives no data. */ } }
  async function disconnect() {
    clearTimeout(flush); flush = undefined;
    const tabId = state.tabId;
    state = { ...emptyConsole, entries: [] }; publish();
    if (tabId !== null) { try { await chrome.debugger.detach({ tabId }); } catch { /* Target may already be closed or detached. */ } }
  }
  chrome.debugger?.onEvent.addListener((source, method, params) => {
    if (!owner || source.tabId !== state.tabId || source.sessionId) return;
    const entry = consoleEntry(method, params, ++serial, Date.now());
    if (entry) { state = { ...state, entries: [...state.entries, entry].slice(-200) };
      if (!flush) flush = setTimeout(() => { flush = undefined; publish(); }, 100);
    }
  });
  chrome.debugger?.onDetach.addListener(source => {
    if (source.tabId === state.tabId) { state = { ...emptyConsole, entries: [], error: 'Connection ended. The tab closed, DevTools took over, or debugging was cancelled. Connect again to resume.' }; publish(); }
  });
  chrome.tabs.onUpdated.addListener((tabId, change) => {
    if (tabId !== state.tabId || !change.url) return;
    // Stop at navigation boundaries so the original choice never captures another page silently.
    enqueue(async () => { if (state.tabId === tabId) { await disconnect(); state.error = 'The page navigated. Connect again to capture this page.'; publish(); } });
  });
  chrome.permissions.onRemoved.addListener(permissions => {
    if (permissions.permissions?.some(permission => permission === 'tabs' || permission === 'debugger')) enqueue(disconnect);
  });
  chrome.runtime.onConnect.addListener(port => {
    // Chrome can report chrome://newtab/ for an overridden new-tab page.
    // onConnect is internal; the extension ID still authenticates the sender.
    if (port.name !== 'tabora-console' || port.sender?.id !== chrome.runtime.id) return;
    let alive = true;
    port.postMessage({ ...emptyConsole, entries: [], error: owner ? 'Another Tabora console owns the connection. Disconnect it first.' : '' });
    port.onDisconnect.addListener(() => { alive = false; enqueue(async () => { if (owner === port) { await disconnect(); owner = null; } }); });
    port.onMessage.addListener(message => {
      if (!['connect', 'disconnect', 'clear'].includes(message?.type)) return;
      enqueue(async () => {
        if (!alive) return;
        if (owner && owner !== port) { port.postMessage({ ...emptyConsole, entries: [], error: 'Another Tabora console is connected. Disconnect it first.' }); return; }
        owner = port;
        if (message.type === 'disconnect') { await disconnect(); owner = null; return; }
        if (message.type === 'clear') { state = { ...state, entries: [] }; publish(); return; }
        await disconnect();
        try {
          if (!chrome.debugger) throw new Error('permission');
          if (!Number.isInteger(message.tabId)) throw new Error('target');
          const tab = await chrome.tabs.get(message.tabId);
          if (!tab.url || !allowedConsoleUrl(tab.url)) throw new Error('target');
          await chrome.debugger.attach({ tabId: message.tabId }, '1.3');
          state = { ...emptyConsole, connected: false, tabId: message.tabId, title: (tab.title ?? 'Selected tab').slice(0, 200), entries: [] };
          await chrome.debugger.sendCommand({ tabId: message.tabId }, 'Runtime.enable');
          await chrome.debugger.sendCommand({ tabId: message.tabId }, 'Log.enable');
          if (!alive) { await disconnect(); owner = null; return; }
          state.connected = true; publish();
        } catch (error) {
          await disconnect();
          const reason = error instanceof Error ? error.message : '';
          state.error = reason === 'permission' || /permission|manifest/i.test(reason)
            ? 'Debugger permission is unavailable. Reload Tabora in chrome://extensions, then open a new Tabora tab.'
            : /another debugger|already attached|DevTools/i.test(reason)
              ? 'This tab is already being debugged. Close its DevTools or disconnect the other debugger, then try again.'
              : reason === 'target' || /No tab|Cannot access|not allowed/i.test(reason)
                ? 'This page cannot be connected. Choose an open, regular HTTP or HTTPS web tab.'
                : 'Could not connect to this tab. Reload Tabora in chrome://extensions and try again with DevTools closed.';
          publish(); owner = null;
        }
      });
    });
  });
}
