# TAB-03-F — ikonice i Inter

Status: implementirano i sintetički provjereno, 22. oktobar 2026.

## Izmjene

Stvarna ikonica koristi lokalni Chrome `/_favicon/` endpoint. URL stranice se ne šalje eksternom favicon servisu, a udaljeni favIconUrl se ne učitava direktno. Potrebna je manifest dozvola `favicon`; nove host dozvole/content skripte nisu dodate. Tabovi, zaglavlja grupa, bookmarkovi (uključujući bočni panel) i Gmail prečica koriste zajedničku komponentu. Nedostupan izvor ima lokalnu rezervu; promjena izvora omogućava oporavak. Crne ikonice u dark temi imaju malu svijetlu podlogu.

Inter Variable 4.1 je lokalni WOFF2, bez runtime mrežne zavisnosti. Cijela SIL OFL licenca je u paketu. Font se koristi u obje entrypoint stranice i provjeren je sa ČĆŠĐŽ/čćšđž tekstom.

## Izvršene provjere

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`: 50/50, `corepack pnpm build`, `git diff --check` prolaze.
- Browser QA učitava originalne javne GitHub/Figma ico fajlove kroz lokalni testni endpoint; bez stvarnog korisničkog profila.
- Potvrđeni naturalWidth/decode za tab, bookmark i sidepanel, prazni/neispravni izvor i oporavak kada URL izvora postane dostupan. Povratak na ranije neuspjeli URL ponovo pokušava učitavanje (A → B → A), bez zadržavanja prethodne greške.
- `document.fonts.ready`, `document.fonts.check` i computed font-family potvrđuju Inter. Eksterni font/favicon zahtjevi: 0.
- Sve postojeće navigacione/storage/session/bookmark/layout interakcije prolaze; dark/light pri 1440/1280/1024/768/320px i sidepanel360px bez horizontalnog preliva.
- Pageerror i console error: 0. Reduced motion uključen. Vizuelno pregledani light1280, dark1440/320 i bookmark sidepanel.

Dokazi: `results.json`, `reference-state-light-1280.png`, `dark-1440.png`, `dark-320.png`, `bookmarks-sidepanel-360.png`. Testne ikonice i njihovi izvori su u `fixtures/README.md`; ne pakuju se u ekstenziju.

## Granice

HTTP fixture potvrđuje integraciju i fallback stanja, ne stvarni korisnikov Chrome favicon cache. Učitana ekstenzija koristi Chrome-ov stvarni endpoint nakon Reload-a. Stvarni cache/autorizacija, puni accessibility i browser zoom nisu provjeravani. Postojeće Google/player granice nisu promijenjene. Search nije vraćen.

## Primarni izvori

- https://developer.chrome.com/docs/extensions/how-to/ui/favicons
- https://developer.chrome.com/docs/extensions/reference/api/tabs
- https://wxt.dev/guide/essentials/favicons
- https://rsms.me/inter/
- https://github.com/rsms/inter/tree/v4.1
