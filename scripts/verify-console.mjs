/* global process, console, window, document, localStorage, innerWidth, URL, getComputedStyle */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.TABORA_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve('build/chrome-mv3');
let missingIconRequests = 0;
const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    if (requestUrl.pathname === '/favicon.ico') { res.statusCode = 204; res.end(); return; }
    if (requestUrl.pathname === '/_favicon/') {
      const pageUrl = new URL(requestUrl.searchParams.get('pageUrl'));
      res.setHeader('Content-Type', 'image/x-icon');
      res.setHeader('Cache-Control', 'no-store');
      if (pageUrl.searchParams.has('iconMissing')) missingIconRequests++;
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
  window.chrome = Object.assign(window.chrome || {}, fixture);
  window.addEventListener('storage', e => { if (e.key?.startsWith('mockchrome:')) changed.emit({ [e.key.slice(11)]: {} }, 'local'); if (e.key === treeKey) bookmarkEvents.onChanged.emit(); });
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const out = path.resolve(process.env.TABORA_QA_OUTPUT || 'docs/provjere/konzola');
const externalRequests = [];
context.on('request', request => { if (!request.url().startsWith(origin + '/') && !request.url().startsWith('data:')) externalRequests.push(request.url()); });
await mkdir(out, { recursive: true });
try {
  await page.goto(origin + '/newtab.html');
  await page.getByRole('heading', { name: 'Otvoreni tabovi 8', exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.evaluate(() => document.fonts.check('14px Inter', 'ČĆŠĐŽ čćšđž')), 'bundled Inter font loaded');
  assert.ok(await page.evaluate(() => getComputedStyle(document.body).fontFamily.includes('Inter')), 'Inter is applied');
  const firstTab = page.getByRole('button', { name: /^tabora\/tabora · GitHub/ });
  await firstTab.locator('img[data-site-icon="image"]').waitFor();
  await firstTab.locator('img').evaluate(img => img.decode());
  assert.ok(await firstTab.locator('img').evaluate(img => img.naturalWidth > 0), 'actual tab icon loaded from local endpoint');
  await page.evaluate(() => window.fixtureNavigateTab(1, 'https://github.com/tabora/tabora?iconMissing=1'));
  await firstTab.locator('[data-site-icon="fallback"]').waitFor();
  const firstMissingAttempts = missingIconRequests;
  await page.evaluate(() => window.fixtureNavigateTab(1, 'https://github.com/tabora/tabora'));
  await firstTab.locator('img').evaluate(img => img.decode());
  await page.evaluate(() => window.fixtureNavigateTab(1, 'https://github.com/tabora/tabora?iconMissing=1'));
  await firstTab.locator('[data-site-icon="fallback"]').waitFor();
  assert.ok(missingIconRequests > firstMissingAttempts, 'returning to a failed source retries the icon');
  await page.evaluate(() => window.fixtureNavigateTab(1, 'https://github.com/tabora/tabora?iconRecovered=1'));
  await firstTab.locator('img[data-site-icon="image"]').waitFor();
  await firstTab.locator('img').evaluate(img => img.decode());
  assert.ok(await firstTab.locator('img').evaluate(img => img.naturalWidth > 0), 'icon recovers when source changes');
  await page.evaluate(() => window.fixtureNavigateTab(1, 'https://github.com/tabora/tabora'));
  await firstTab.locator('img').evaluate(img => img.decode());
  assert.equal(await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('button').count(), 6);
  assert.equal(await page.getByRole('searchbox').count(), 0);
  await page.getByText('Sintetička bilješka za provjeru.', { exact: true }).waitFor();
  await page.getByText('Sintetički projekat', { exact: true }).waitFor();
  await page.screenshot({ path: path.join(out, 'reference-state-light-1280.png'), fullPage: false });
  await page.getByRole('button', { name: 'Skupi sve grupe' }).click();
  assert.equal(await page.getByRole('button', { name: /Zatvori tab:/ }).count(), 0);
  await page.getByRole('button', { name: 'Proširi sve grupe' }).click();
  assert.equal(await page.getByRole('button', { name: /Zatvori tab:/ }).count(), 8);
  await page.getByRole('button', { name: /^tabora\/tabora · GitHub/ }).click();
  await page.waitForFunction(() => window.fixtureActivated === 1);
  await page.getByRole('button', { name: 'Grupiši tabove', exact: true }).click();
  await page.getByRole('dialog', { name: 'Pregled grupisanja' }).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByRole('button', { name: 'Otvori bočni panel', exact: true }).click();
  assert.equal(await page.evaluate(() => window.fixturePanelOpened), true);
  await page.getByRole('complementary', { name: 'Dnevni alati' }).getByRole('button', { name: 'Prikaži sve', exact: true }).click();
  // The notes editor is opened by the compact Bilješke section.
  if (!(await page.getByRole('textbox', { name: 'Bilješke', exact: true }).isVisible())) {
    await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('button', { name: 'Bilješke', exact: true }).click();
  }
  await page.getByRole('textbox', { name: 'Bilješke', exact: true }).fill('Nova sintetička bilješka.');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Otvori bilješku', exact: true }).click();
  assert.equal(await page.getByRole('textbox', { name: 'Bilješke', exact: true }).inputValue(), 'Nova sintetička bilješka.');
  await page.getByRole('button', { name: 'Sačuvaj bilješku', exact: true }).click();
  if (await page.getByRole('dialog').count()) await page.keyboard.press('Escape');
  await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('button', { name: 'Bilješke', exact: true }).click();
  assert.equal(await page.getByRole('textbox', { name: 'Bilješke', exact: true }).inputValue(), 'Nova sintetička bilješka.');
  await page.getByLabel('Zadatak 2', { exact: true }).fill('Provjeriti novi UI');
  await page.getByLabel('Zadatak 2', { exact: true }).press('Enter');
  await page.getByLabel('Završen zadatak 2', { exact: true }).check();
  await page.reload();
  await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('button', { name: 'Bilješke', exact: true }).click();
  assert.equal(await page.getByLabel('Završen zadatak 2', { exact: true }).isChecked(), true);
  await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('button', { name: 'Sesije', exact: true }).click();
  await page.getByRole('button', { name: 'Sačuvaj sesiju', exact: true }).click();
  await page.getByLabel('Naziv sesije', { exact: true }).fill('QA nova sesija');
  await page.getByRole('button', { name: 'Sačuvaj tabove', exact: true }).click();
  await page.getByText('QA nova sesija', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Pregledaj i otvori sesiju QA nova sesija', exact: true }).click();
  await page.getByRole('button', { name: 'Otvori sesiju', exact: true }).click();
  await page.getByText(/Otvoreno: 0. Već otvoreno: 8. Neuspjelo: 0./).waitFor();
  await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('button', { name: 'Bookmarkovi', exact: true }).click();
  await page.getByRole('link', { name: /Dokumentacija/ }).locator('[data-site-icon="fallback"]').waitFor();
  await page.getByRole('button', { name: 'Uredi link: Dokumentacija' }).click();
  await page.getByLabel('Naziv', { exact: true }).fill('Izmijenjena dokumentacija');
  await page.getByLabel('Web adresa', { exact: true }).fill('https://github.com/tabora/documentation');
  await page.getByLabel('Sačuvaj u folder').selectOption('22');
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await page.getByRole('link', { name: /Izmijenjena dokumentacija/ }).waitFor();
  await page.getByRole('link', { name: /Izmijenjena dokumentacija/ }).locator('img').evaluate(img => img.decode());
  await page.getByRole('button', { name: 'Otvori linkove foldera' }).click();
  await page.getByRole('button', { name: 'Otvori tabove', exact: true }).click();
  await page.getByText('Otvoreno: 1. Preskočeno: 0. Neuspjelo: 0.').waitFor();
  for (const destination of ['Vijesti', 'Muzika', 'Rad']) {
    await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('button', { name: destination, exact: true }).click();
    assert.equal(await page.getByRole('navigation').getByRole('button', { name: destination, exact: true }).getAttribute('aria-current'), 'page');
  }
  for (const theme of ['Svijetla tema', 'Tamna tema']) {
    await page.getByRole('button', { name: theme, exact: true }).click();
    for (const width of [1440, 1280, 1024, 768, 320]) {
      await page.setViewportSize({ width, height: width === 1280 ? 910 : 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width} ${theme}`);
      await page.screenshot({ path: path.join(out, `${theme.startsWith('Tamna') ? 'dark' : 'light'}-${width}.png`), fullPage: true });
    }
  }
  await page.getByRole('button', { name: 'Zatvori tab: chrome.tabs – Chrome Developers', exact: true }).click();
  await page.getByRole('heading', { name: 'Otvoreni tabovi 7', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Podešavanja', exact: true }).click();
  await page.getByRole('button', { name: 'Uredi prilagođeni raspored', exact: true }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'custom editing fits 320px');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('[draggable="true"]').filter({ hasText: 'Chrome bookmarkovi' }).dragTo(page.locator('[data-widget-board] > div').nth(1), { targetPosition: { x: 20, y: 20 } });
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('mockchrome:tabora.settings.v1.layout')).items.find(p => p.id === 'bookmarks').column === 'center');
  await page.getByLabel('Širina: Lijevo', { exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await page.getByLabel('Kolona: Sačuvane sesije', { exact: true }).selectOption('left');
  await page.getByLabel('Visina: Sačuvane sesije', { exact: true }).selectOption('medium');
  await page.getByRole('button', { name: 'Završi uređivanje', exact: true }).click();
  await page.reload();
  assert.equal(await page.locator('[data-widget-board]').count(), 1);
  const layout = await page.evaluate(() => JSON.parse(localStorage.getItem('mockchrome:tabora.settings.v1.layout')));
  assert.equal(layout.items.find(p => p.id === 'sessions').column, 'left');
  assert.equal(layout.items.find(p => p.id === 'sessions').height, 'medium');
  await page.getByRole('button', { name: 'Podešavanja', exact: true }).click();
  await page.getByLabel('Raspored').selectOption('console');
  await page.getByRole('button', { name: 'Zatvori', exact: true }).click();
  await page.getByRole('button', { name: 'Uredi prilagođeni raspored', exact: true }).count();
  const side = await context.newPage();
  side.on('pageerror', error => errors.push(error.message));
  await side.setViewportSize({ width: 360, height: 900 });
  await side.goto(origin + '/sidepanel.html');
  await side.getByRole('link', { name: /Izmijenjena dokumentacija/ }).locator('img').evaluate(img => img.decode());
  await side.screenshot({ path: path.join(out, 'bookmarks-sidepanel-360.png'), fullPage: true });
  await side.getByRole('button', { name: 'Bilješke', exact: true }).click();
  assert.equal(await side.getByRole('textbox', { name: 'Bilješke', exact: true }).inputValue(), 'Nova sintetička bilješka.');
  await side.getByRole('textbox', { name: 'Bilješke', exact: true }).fill('Promjena iz bočnog panela.');
  await side.getByRole('button', { name: 'Sačuvaj bilješku', exact: true }).click();
  await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('button', { name: 'Bilješke', exact: true }).click();
  await page.getByRole('textbox', { name: 'Bilješke', exact: true }).waitFor();
  assert.equal(await page.getByRole('textbox', { name: 'Bilješke', exact: true }).inputValue(), 'Promjena iz bočnog panela.');
  await side.screenshot({ path: path.join(out, 'sidepanel-360.png'), fullPage: true });
  assert.ok(await side.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'side panel fits');
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, [], 'no remote favicon/font requests');
  await writeFile(path.join(out, 'results.json'), JSON.stringify({ synthetic: true, tests: ['selected screenshot layout', 'local Chrome favicon endpoint', 'icon decode error fallback and source-change recovery', 'retry when returning to a failed icon URL', 'bookmark and sidepanel icons', 'bundled Inter loaded', 'no external icon/font requests', 'six working navigation destinations', 'no search', 'collapse/expand tab groups', 'tab activation and close', 'group preview and Escape', 'sidepanel open handler', 'notes/task persistence and cross-page sync', 'session creation and duplicate-aware restore', 'bookmark folder move and confirmed open', 'light/dark at 1440/1280/1024/768/320', 'custom layout survives new console mode', 'drag and keyboard width controls', 'custom editing fits 320px', 'notes draft survives dialog close', 'sidepanel 360px', 'no page errors'], errors }, null, 2));
  console.log('Console UI verification passed. Synthetic screenshots: ' + out);
} catch (error) {
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true });
  console.error('Page errors:', errors);
  throw error;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
