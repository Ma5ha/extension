/* global process, console, window, document, localStorage, innerWidth, URL, getComputedStyle */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.TABORA_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve('build/chrome-mv3');
const server = createServer(async (req, res) => {
  try {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(root + path.sep)) throw Error('path');
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ...(process.env.TABORA_CHROMIUM_PATH ? { executablePath: process.env.TABORA_CHROMIUM_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
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
  const tabs = [{ id: 1, windowId: 7, title: 'Projekat A', url: 'https://a.example.test/', pinned: true, groupId: -1, active: false }, { id: 2, windowId: 7, title: 'Projekat B', url: 'https://b.example.test/', pinned: false, groupId: -1, active: true }, { id: 3, windowId: 7, title: 'Novi tab', url: 'chrome://newtab/', pinned: false, groupId: -1, active: false }];
  const created = []; window.fixtureCreated = created;
  const fixture = {
    runtime: { id: 'tabora-fixture', getManifest: () => ({}), getURL: p => 'chrome-extension://tabora-fixture/' + p },
    storage: { onChanged: changed, local: {
      get: async keys => Object.fromEntries((keys === null ? Object.keys(localStorage).filter(k => k.startsWith('mockchrome:')).map(k => k.slice(11)) : typeof keys === 'string' ? [keys] : keys).map(k => [k, (localStorage.getItem('mockchrome:' + k) === null ? undefined : JSON.parse(localStorage.getItem('mockchrome:' + k)))])),
      set: async entries => { for (const [key,value] of Object.entries(entries)) { localStorage.setItem('mockchrome:' + key, JSON.stringify(value)); changed.emit({ [key]: { newValue: value } }, 'local'); } },
      remove: async key => { localStorage.removeItem('mockchrome:' + key); changed.emit({ [key]: {} }, 'local'); },
    } },
    permissions: { contains: async details => !details.permissions?.includes('scripting'), request: async () => true, onAdded: event(), onRemoved: event() },
    windows: { getCurrent: async () => ({ id: 7 }), update: async () => ({}) },
    sidePanel: { open: async () => { window.fixturePanelOpened = true; } },
    bookmarks: { ...bookmarkEvents,
      getTree: async () => readTree(), get: async id => [find(readTree(), id)].filter(Boolean),
      create: async details => { const tree = readTree(), parent = find(tree, details.parentId || '1'); const node = { ...details, id: String(Date.now()), parentId: parent.id }; (parent.children ||= []).push(node); writeTree(tree, 'onCreated'); return node; },
      update: async (id, details) => { const tree = readTree(), node = find(tree, id); Object.assign(node, details); writeTree(tree, 'onChanged'); return node; },
      move: async (id, details) => { const tree = readTree(), node = find(tree, id), parent = find(tree, node.parentId), next = find(tree, details.parentId); parent.children = parent.children.filter(n => n.id !== id); node.parentId = next.id; (next.children ||= []).push(node); writeTree(tree, 'onMoved'); return node; },
      remove: async id => { const tree = readTree(), node = find(tree, id), parent = find(tree, node.parentId); parent.children = parent.children.filter(n => n.id !== id); writeTree(tree, 'onRemoved'); },
    },
    tabs: { ...Object.fromEntries(['onCreated','onRemoved','onUpdated','onMoved','onAttached','onDetached','onActivated'].map(k => [k,event()])), query: async () => tabs, get: async id => tabs.find(t => t.id === id), update: async () => ({}), create: async details => { created.push(details); return { id: 10 + created.length, ...details }; } },
  };
  window.chrome = Object.assign(window.chrome || {}, fixture);
  window.addEventListener('storage', e => { if (e.key?.startsWith('mockchrome:')) changed.emit({ [e.key.slice(11)]: {} }, 'local'); if (e.key === treeKey) bookmarkEvents.onChanged.emit(); });
});
const page = await context.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
const out = path.resolve('docs/provjere/workspace'); await mkdir(out, { recursive: true });
try {
  await page.goto(origin + '/newtab.html');
  await page.getByRole('heading', { name: 'Fokus i bilješke' }).waitFor();
  await page.getByLabel('Bilješke', { exact: true }).fill('Sintetička bilješka za provjeru.');
  await page.getByRole('button', { name: 'Sačuvaj bilješku' }).click();
  await page.getByLabel('Zadatak 1', { exact: true }).fill('Provjeriti raspored');
  await page.getByLabel('Zadatak 1', { exact: true }).press('Enter');
  await page.getByLabel('Završen zadatak 1', { exact: true }).check();
  await page.getByLabel('Naziv sesije').fill('Sintetički projekat');
  await page.getByRole('button', { name: 'Sačuvaj tabove', exact: true }).click();
  await page.getByText('Sačuvano 2 tabova. Preskočeno: 1.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Pregled i otvaranje' }).click();
  await page.getByRole('button', { name: 'Otvori sesiju', exact: true }).click();
  await page.getByText('Otvoreno: 0. Već otvoreno: 2. Neuspjelo: 0.').waitFor();
  await page.getByRole('button', { name: 'Uredi link: Dokumentacija' }).click();
  await page.getByLabel('Naziv', { exact: true }).fill('Izmijenjena dokumentacija');
  await page.getByLabel('Sačuvaj u folder').selectOption('22');
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await page.getByRole('link', { name: /Izmijenjena dokumentacija/ }).waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mock-tree'))[0].children[0].children[0].children[0].parentId), '22');
  await page.getByRole('button', { name: 'Otvori linkove foldera' }).click();
  await page.getByRole('button', { name: 'Otvori tabove', exact: true }).click();
  await page.getByText('Otvoreno: 1. Preskočeno: 0. Neuspjelo: 0.').waitFor();
  await page.getByRole('button', { name: 'Uredi raspored', exact: true }).click();
  await page.getByLabel('Kolona: Sačuvane sesije', { exact: true }).selectOption('left');
  await page.getByLabel('Visina: Sačuvane sesije', { exact: true }).selectOption('medium');
  await page.getByRole('button', { name: 'Pomjeri Sačuvane sesije gore' }).click();
  await page.getByRole('button', { name: 'Završi uređivanje' }).click();
  await page.reload();
  assert.equal(await page.getByLabel('Bilješke', { exact: true }).inputValue(), 'Sintetička bilješka za provjeru.');
  assert.equal(await page.getByLabel('Završen zadatak 1', { exact: true }).isChecked(), true);
  const layout = await page.evaluate(() => JSON.parse(localStorage.getItem('mockchrome:tabora.settings.v1.layout')));
  assert.equal(layout.items.find(p => p.id === 'sessions').column, 'left');
  assert.equal(layout.items.find(p => p.id === 'sessions').height, 'medium');
  const grid = await page.locator('[data-widget-board]').evaluate(el => getComputedStyle(el).gridTemplateColumns);
  assert.equal(grid.split(' ').length, 3, 'three rendered desktop columns');
  await page.getByRole('button', { name: 'Otvori bočni panel', exact: true }).click();
  assert.equal(await page.evaluate(() => window.fixturePanelOpened), true);
  for (const theme of ['Svijetla tema', 'Tamna tema']) {
    await page.getByRole('button', { name: theme, exact: true }).click();
    for (const width of [1440, 1024, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width} ${theme}`);
      await page.screenshot({ path: path.join(out, `${theme.startsWith('Tamna') ? 'dark' : 'light'}-${width}.png`), fullPage: true });
    }
  }
  await page.getByRole('button', { name: 'Uredi raspored', exact: true }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'editing fits 320px');
  await page.getByRole('button', { name: 'Završi uređivanje' }).click();
  const side = await context.newPage(); side.on('pageerror', e => errors.push(e.message));
  await side.setViewportSize({ width: 360, height: 900 }); await side.goto(origin + '/sidepanel.html');
  await side.getByRole('link', { name: /Izmijenjena dokumentacija/ }).waitFor();
  await side.getByRole('button', { name: 'Bilješke', exact: true }).click();
  assert.equal(await side.getByLabel('Bilješke', { exact: true }).inputValue(), 'Sintetička bilješka za provjeru.');
  await side.getByLabel('Bilješke', { exact: true }).fill('Promjena iz bočnog panela.'); await side.getByRole('button', { name: 'Sačuvaj bilješku' }).click();
  await page.waitForFunction(() => document.querySelector('#notes')?.value === 'Promjena iz bočnog panela.');
  await side.getByRole('button', { name: 'Mediji', exact: true }).click();
  await side.screenshot({ path: path.join(out, 'sidepanel-360.png'), fullPage: true });
  assert.ok(await side.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'side panel fits');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Uredi raspored', exact: true }).click();
  const handle = page.locator('[draggable="true"]').filter({ hasText: 'Chrome bookmarkovi' });
  await handle.dragTo(page.locator('[data-widget-board] > div').nth(1), { targetPosition: { x: 20, y: 20 } });
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('mockchrome:tabora.settings.v1.layout')).items.find(p => p.id === 'bookmarks').column === 'center');
  await page.getByLabel('Kolona: Fokus i bilješke', { exact: true }).selectOption('center');
  await page.getByLabel('Širina: Lijevo', { exact: true }).focus(); await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: 'Završi uređivanje' }).click();
  await page.getByRole('button', { name: 'Podešavanja', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Agenda', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Sačuvane sesije', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Zatvori', exact: true }).click();
  assert.equal(await page.locator('[data-widget-board]').getAttribute('data-columns'), '2', 'hidden empty column is removed');
  assert.deepEqual(errors, []);
  await writeFile(path.join(out, 'results.json'), JSON.stringify({ synthetic: true, tests: ['notes and daily task persistence', 'session save and duplicate-aware restore', 'real-ID bookmark move using synthetic Chrome API', 'folder open confirmation', 'layout column/height/order persistence', 'native drag and keyboard width controls', 'empty-column removal', 'responsive grid light/dark 1440/1024/320', 'editing at 320', 'sidepanel route and cross-page note sync', 'sidepanel open handler', 'no page errors'], errors }, null, 2));
  console.log('Workspace UI verification passed using synthetic Chrome APIs. Screenshots and results: docs/provjere/workspace');
} catch (error) { await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}); console.error('Page errors:',errors); throw error; } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
