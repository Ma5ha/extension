/* global process, console, window, document, localStorage, URL */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.TABORA_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve('build/chrome-mv3');
const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    if (requestUrl.pathname === '/favicon.ico') { res.statusCode = 204; res.end(); return; }
    if (requestUrl.pathname === '/_favicon/') {
      const pageUrl = new URL(requestUrl.searchParams.get('pageUrl'));
      res.setHeader('Content-Type', 'image/x-icon');
      res.setHeader('Cache-Control', 'no-store');
      const filename = pageUrl.hostname === 'github.com' ? 'github.ico' : pageUrl.hostname.endsWith('figma.com') ? 'figma.ico' : null;
      // A 200 response with an undecodable image exercises image-error fallback without a network failure.
      res.end(filename && !pageUrl.searchParams.has('iconMissing') ? await readFile(path.resolve('docs/provjere/ikonice-font/fixtures', filename)) : 'No cached icon');
      return;
    }
    const file = path.resolve(root, '.' + requestUrl.pathname);
    if (!file.startsWith(root + path.sep)) throw Error('path');
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.woff2') ? 'font/woff2' : 'text/html');
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ...(process.env.TABORA_CHROMIUM_PATH ? { executablePath: process.env.TABORA_CHROMIUM_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 910 }, reducedMotion: 'reduce' });
await context.addInitScript(() => {
  // Synthetic browser fixture only. No real bookmarks, account, media, or private profile.
  const event = () => { const listeners = new Set(); return { addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn), emit: (...args) => listeners.forEach(fn => fn(...args)) }; };
  const changed = event();
  const treeKey = 'mock-tree';
  const initial = [{ id: '0', title: '', children: [{ id: '1', parentId: '0', title: 'Traka', children: [{ id: '11', parentId: '1', title: 'Dokumentacija', url: 'https://docs.example.test/' }, { id: '22', parentId: '1', title: 'Projekat', children: [] }] }] }];
  if (!localStorage.getItem(treeKey)) localStorage.setItem(treeKey, JSON.stringify(initial));
  const readTree = () => JSON.parse(localStorage.getItem(treeKey));
  const find = (nodes, id) => nodes.flatMap(n => [n, ...flat(n.children || [])]).find(n => n.id === id);
  const flat = nodes => nodes.flatMap(n => [n, ...flat(n.children || [])]);
  const bookmarkEvents = Object.fromEntries(['onCreated','onChanged','onRemoved','onMoved','onChildrenReordered','onImportEnded'].map(k => [k,event()]));
  const writeTree = (tree, kind) => { localStorage.setItem(treeKey, JSON.stringify(tree)); bookmarkEvents[kind].emit(); };
  const samples = [
    ['tabora/tabora · GitHub', 'https://github.com/tabora/tabora'],
    ['Issues · tabora/tabora', 'https://github.com/tabora/tabora/issues'],
    ['Pull requests · tabora/tabora', 'https://github.com/tabora/tabora/pulls'],
    ['Tabora – UI Design', 'https://www.figma.com/design/tabora'],
    ['Design System – Foundations', 'https://www.figma.com/design/foundations'],
    ['New Tab – Radna konzola (Draft)', 'https://www.figma.com/design/console'],
    ['Window management using the Chrome APIs', 'https://developer.mozilla.org/en-US/docs/Web/API/Window'],
    ['chrome.tabs – Chrome Developers', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/open'],
  ];
  const tabs = samples.map(([title, url], i) => ({ id: i + 1, windowId: 7, title, url, pinned: i === 0, groupId: -1, active: i === 1 }));
  const seed = (key, value) => { if (localStorage.getItem('mockchrome:' + key) === null) localStorage.setItem('mockchrome:' + key, JSON.stringify(value)); };
  const today = new Date(), day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  seed(`tabora.focus.v1.${day}.0`, { text: 'Provjeriti raspored', done: true });
  seed('tabora.notes.v1', 'Sintetička bilješka za provjeru.');
  seed('tabora.session.v1.qa-project', { id: 'qa-project', name: 'Sintetički projekat', created: Date.now() - 86400000, tabs: tabs.slice(0, 2).map(({ title, url, pinned }) => ({ title, url, pinned })) });
  seed('tabora.session.v1.qa-research', { id: 'qa-research', name: 'Istraživanje – ekstenzije', created: Date.now() - 4 * 86400000, tabs: tabs.slice(0, 5).map(({ title, url, pinned }) => ({ title, url, pinned })) });
  const created = []; window.fixtureCreated = created;
  const fixture = {
    runtime: { id: 'tabora-fixture', getManifest: () => ({ permissions: ['storage', 'sidePanel', 'favicon'] }), getURL: p => p.includes('_favicon') ? window.location.origin + '/_favicon/' : 'chrome-extension://tabora-fixture/' + p },
    storage: { onChanged: changed, local: {
      get: async keys => Object.fromEntries((keys === null ? Object.keys(localStorage).filter(k => k.startsWith('mockchrome:')).map(k => k.slice(11)) : typeof keys === 'string' ? [keys] : keys).map(k => [k, (localStorage.getItem('mockchrome:' + k) === null ? undefined : JSON.parse(localStorage.getItem('mockchrome:' + k)))])),
      set: async entries => { for (const [key,value] of Object.entries(entries)) { localStorage.setItem('mockchrome:' + key, JSON.stringify(value)); changed.emit({ [key]: { newValue: value } }, 'local'); } },
      remove: async key => { localStorage.removeItem('mockchrome:' + key); changed.emit({ [key]: {} }, 'local'); },
    } },
    permissions: { contains: async details => !details.permissions?.includes('scripting'), request: async () => true, onAdded: event(), onRemoved: event() },
    tabGroups: { update: async () => ({}) },
    windows: { getCurrent: async () => ({ id: 7 }), update: async () => ({}) },
    sidePanel: { open: async () => { window.fixturePanelOpened = true; } },
    bookmarks: { ...bookmarkEvents,
      getTree: async () => readTree(), get: async id => [find(readTree(), id)].filter(Boolean),
      create: async details => { const tree = readTree(), parent = find(tree, details.parentId || '1'); const node = { ...details, id: String(Date.now()), parentId: parent.id }; (parent.children ||= []).push(node); writeTree(tree, 'onCreated'); return node; },
      update: async (id, details) => { const tree = readTree(), node = find(tree, id); Object.assign(node, details); writeTree(tree, 'onChanged'); return node; },
      move: async (id, details) => { const tree = readTree(), node = find(tree, id), parent = find(tree, node.parentId), next = find(tree, details.parentId); parent.children = parent.children.filter(n => n.id !== id); node.parentId = next.id; (next.children ||= []).push(node); writeTree(tree, 'onMoved'); return node; },
      remove: async id => { const tree = readTree(), node = find(tree, id), parent = find(tree, node.parentId); parent.children = parent.children.filter(n => n.id !== id); writeTree(tree, 'onRemoved'); },
    },
    tabs: { ...Object.fromEntries(['onCreated','onRemoved','onUpdated','onMoved','onAttached','onDetached','onActivated'].map(k => [k,event()])), query: async () => tabs, get: async id => tabs.find(t => t.id === id), update: async (id, details) => { window.fixtureActivated = id; return { id, ...details }; }, remove: async id => { const index = tabs.findIndex(t => t.id === id); if (index >= 0) tabs.splice(index, 1); fixture.tabs.onRemoved.emit(id); }, group: async () => 1, create: async details => { created.push(details); return { id: 10 + created.length, ...details }; } },
  };
  window.fixtureNavigateTab = (id, url) => { const tab = tabs.find(t => t.id === id); tab.url = url; fixture.tabs.onUpdated.emit(id, { url }, tab); };
  const video = { id: 'v1', kind: 'Video', paused: true, ended: false, volume: 0.5, muted: false, time: 20, duration: 120, ranges: [[0, 120]], pipAvailable: true, pipActive: false };
  const audio = { ...video, id: 'a1', kind: 'Audio', pipAvailable: false };
  tabs.push({ id: 9001, windowId: 7, title: 'Sintetički video Alpha', url: 'https://media.example.test/alpha', audible: true, groupId: -1, pinned: false }, { id: 9002, windowId: 7, title: 'Sintetički audio Beta', url: 'https://audio.example.test/beta', audible: true, groupId: -1, pinned: false });
  window.fixtureMedia = { video, audio, commands: [] };
  fixture.permissions.contains = async () => true;
  fixture.scripting = { executeScript: async request => {
    const item = request.target.tabId === 9001 ? video : request.target.tabId === 9002 ? audio : null;
    const command = request.args?.[1];
    if (item && command) {
      window.fixtureMedia.commands.push(command);
      if (command.type === 'play') item.paused = false;
      if (command.type === 'pause') item.paused = true;
      if (command.type === 'volume') item.volume = command.value;
      if (command.type === 'seek') item.time = command.value;
      if (command.type === 'pip-enter') item.pipActive = true;
      if (command.type === 'pip-exit') item.pipActive = false;
    }
    return [{ frameId: 0, documentId: 'doc-' + request.target.tabId, result: { frames: 0, items: item ? [JSON.parse(JSON.stringify(item))] : [] } }];
  } };
  window.fixtureRemoveMedia = () => { for (let index = tabs.length - 1; index >= 0; index--) if (tabs[index].id >= 9001) tabs.splice(index, 1); fixture.tabs.onRemoved.emit(9001); };
  Object.defineProperty(window, 'documentPictureInPicture', { configurable: true, value: { requestWindow: async () => {
    if (window.fixtureRejectPopup) throw new Error('Synthetic rejection');
    const popup = window.open('', 'tabora-qa-pip', 'width=380,height=520');
    if (!popup) throw new Error('Popup blocked');
    window.addEventListener('pagehide', () => popup.close(), { once: true });
    if (window.fixtureDeferPopup) await new Promise(resolve => { window.fixtureResolvePopup = resolve; });
    return popup;
  } } });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => !!window.fixtureHidden });
  window.chrome = Object.assign(window.chrome || {}, fixture);
  window.addEventListener('storage', e => { if (e.key?.startsWith('mockchrome:')) changed.emit({ [e.key.slice(11)]: {} }, 'local'); if (e.key === treeKey) bookmarkEvents.onChanged.emit(); });
});

const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [], externalRequests = [];
context.on('page', opened => opened.on('pageerror', error => errors.push(error.message)));
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
context.on('request', request => { if (!request.url().startsWith(origin + '/') && !request.url().startsWith('data:')) externalRequests.push(request.url()); });
const out = path.resolve(process.env.TABORA_QA_OUTPUT || 'docs/provjere/mini-player');
await mkdir(out, { recursive: true });
const results = [];
const mark = name => { results.push(name); console.log('passed:', name); };
try {
  await page.goto(origin + '/newtab.html');
  await page.getByRole('button', { name: 'Muzika', exact: true }).click();
  await page.getByLabel('Izvor', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.fixtureMedia.commands.length), 0);
  await page.getByLabel('Izvor', { exact: true }).selectOption('9002');
  await page.getByRole('button', { name: 'Rad', exact: true }).click();
  assert.equal(await page.getByLabel('Izvor', { exact: true }).inputValue(), '9002');
  mark('no autoplay; source selection survives navigation');
  await page.getByLabel('Izvor', { exact: true }).selectOption('9001');
  await page.getByRole('button', { name: 'Prikaži video', exact: true }).click();
  await page.getByRole('button', { name: 'Sakrij video', exact: true }).click();
  await page.getByRole('button', { name: 'Pusti', exact: true }).click();
  await page.getByRole('button', { name: 'Pauziraj', exact: true }).click();
  await page.getByRole('button', { name: 'Naprijed 10 sekundi' }).click();
  await page.waitForFunction(() => window.fixtureMedia.video.time === 30);
  await page.getByLabel('Jačina playera', { exact: true }).press('Home');
  await page.waitForFunction(() => window.fixtureMedia.video.volume === 0);
  mark('video enter/exit, play/pause, seek and volume command wiring');
  await page.getByRole('button', { name: 'Mini-player', exact: true }).click();
  const floating = page.getByRole('complementary', { name: 'Plutajući mini-player' });
  await floating.waitFor();
  const before = await floating.boundingBox();
  await floating.getByRole('button', { name: 'Pomjeri mini-player' }).press('ArrowLeft');
  const after = await floating.boundingBox();
  assert.ok(after.x < before.x);
  await page.mouse.move(after.x + 80, after.y + 25);
  await page.mouse.down(); await page.mouse.move(after.x - 20, after.y + 65); await page.mouse.up();
  assert.ok((await floating.boundingBox()).x < after.x);
  const initialWidth = (await floating.boundingBox()).width;
  await floating.getByRole('button', { name: 'Promijeni veličinu mini-playera' }).press('ArrowLeft');
  assert.ok((await floating.boundingBox()).width < initialWidth);
  await floating.getByText('Položaj i veličina', { exact: true }).click();
  await floating.getByLabel('Položaj mini-playera').selectOption('top-left');
  assert.equal((await floating.boundingBox()).x, 8);
  await floating.getByLabel('Veličina mini-playera').selectOption('large');
  await floating.getByLabel('Položaj mini-playera').selectOption('bottom-right');
  await floating.getByText('Položaj i veličina', { exact: true }).click();
  await floating.locator(':scope > div').evaluate(node => { node.scrollTop = 0; });
  await page.screenshot({ path: path.join(out, 'light-1280.png'), fullPage: true });
  await page.getByRole('button', { name: 'Bookmarkovi', exact: true }).click();
  assert.ok(await floating.isVisible());
  await floating.getByRole('button', { name: 'Vrati u panel', exact: true }).click();
  await page.getByRole('button', { name: 'Muzika', exact: true }).click();
  assert.equal(await page.getByLabel('Izvor', { exact: true }).inputValue(), '9001');
  mark('floating drag, keyboard move/resize, presets, route persistence and dock');
  await page.getByRole('button', { name: 'Tamna tema', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole('button', { name: 'Mini-player', exact: true }).click();
  const small = await floating.boundingBox();
  assert.ok(small.x >= 0 && small.x + small.width <= 320);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 320);
  await page.screenshot({ path: path.join(out, 'dark-320.png'), fullPage: true });
  await floating.getByRole('button', { name: 'Pomjeri mini-player' }).press('Escape');
  await page.getByRole('button', { name: 'Mini-player', exact: true }).waitFor();
  mark('dark 320px reflow, viewport clamp and keyboard Escape');
  await page.setViewportSize({ width: 1280, height: 910 });
  const popupEvent = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Izdvoji kontrole', exact: true }).click();
  const popup = await popupEvent;
  popup.setDefaultTimeout(10000);
  await popup.getByRole('complementary', { name: 'Izdvojene medijske kontrole' }).waitFor();
  await popup.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await page.evaluate(() => { window.fixtureHidden = true; window.fixtureMedia.video.time = 40; document.documentElement.dataset.theme = 'light'; });
  await popup.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await popup.waitForFunction(() => document.querySelector('input[aria-label="Pozicija reprodukcije"]')?.value === '40');
  await popup.screenshot({ path: path.join(out, 'controls-window.png'), fullPage: true });
  await popup.close();
  await page.getByRole('button', { name: 'Mini-player', exact: true }).waitFor();
  await page.evaluate(() => { window.fixtureHidden = false; window.fixtureRejectPopup = true; });
  await page.getByRole('button', { name: 'Izdvoji kontrole', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Prozor nije otvoren' }).waitFor();
  assert.ok(await page.getByRole('button', { name: 'Pusti', exact: true }).isVisible());
  mark('simulated Document PiP: portal, theme, hidden-opener polling, manual close and rejection');
  await page.evaluate(() => { window.fixtureRejectPopup = false; window.fixtureDeferPopup = true; });
  const lateEvent = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Izdvoji kontrole', exact: true }).click();
  const late = await lateEvent;
  await page.getByRole('button', { name: 'Mini-player', exact: true }).click();
  const closed = late.waitForEvent('close');
  await page.evaluate(() => window.fixtureResolvePopup());
  await closed;
  assert.ok(await floating.isVisible());
  await floating.getByRole('button', { name: 'Vrati u panel', exact: true }).click();
  mark('late popup request is cancelled when the user chooses the local player');
  await page.evaluate(() => { window.fixtureMedia.video.pipAvailable = false; });
  await page.getByRole('button', { name: 'Osvježi izvore' }).click();
  await page.waitForFunction(() => document.querySelector('input[aria-label="Pozicija reprodukcije"]')?.value === '40');
  await page.getByText('Video prikaz trenutno nije dostupan za ovaj izvor. Koristi izvorni tab.', { exact: true }).waitFor();
  assert.ok(await page.getByRole('button', { name: 'Prikaži video', exact: true }).isDisabled());
  mark('unavailable video cannot send a PiP command');
  await page.evaluate(() => window.fixtureRemoveMedia());
  await page.getByText('Nema aktivnog izvora.', { exact: true }).waitFor();
  mark('closed source returns to empty state');
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  await writeFile(path.join(out, 'results.json'), JSON.stringify({ passed: results, errors, externalRequests, documentPip: 'same-origin window simulation; actual native PiP not verified', nativeVideo: 'synthetic Chrome scripting fixture; no real media or user profile' }, null, 2));
  console.log('All focused media QA passed');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
