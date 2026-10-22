# Radna konzola — završna vizuelna provjera

Source visual truth: `docs/ui-koncepti/radna-konzola-odabrano.jpg`, 1280 × 910 px.
Implementation screenshot: `docs/provjere/konzola/reference-state-light-1280.png`, 1280 × 910 px.
CSS viewport: 1280 × 910, deviceScaleFactor 1. Bez promjene razmjere; puna širina oba prikaza poređena je u istoj slici.
State: svijetla konzola, osam sintetičkih tabova u tri origina, dvije sačuvane sesije, lokalna bilješka i tri dnevna mjesta. Podaci postoje samo u QA fixture-u; produkcioni kod koristi stvarne lokalne podatke.

## Nalazi i istorija poređenja

Prvo direktno poređenje: `docs/provjere/konzola/comparison-v1.png`.

- [P1, ispravljeno] Previsoki redovi i pomoćni footer gurali su sesije iz prvog ekrana. Redovi su svedeni na 44px, zaglavlja/granični razmaci smanjeni i osvježavanje premješteno u toolbar.
- [P2, ispravljeno] Nedostajala je radnja Dodaj zadatak sa reference. Dodata je; fokusira prvo prazno od tri postojeća mjesta, bez četvrtog zadatka.

Ponovno direktno poređenje nakon popravki: `docs/provjere/konzola/comparison-v2.png`. Obe sesije sada su vidljive u izvornom viewport-u. Nema preostalih P0/P1/P2 nalaza.

Fokusirana poređenja: `docs/provjere/konzola/comparison-content-v2.png` (tabovi/sesije) i `docs/provjere/konzola/comparison-inspector-v2.png` (zadaci/bilješke/servisi). Pregledani su i dark desktop 1440px i dark 320px snimci.

## Obavezne površine

- Fonts/typography: sistemski sans iz postojećeg projekta, 29px glavni naslov, 21px glavni naslovi sekcija, 18px desni panel, 14px redovi i 12px metapodaci. Težina i prelamanje zadržavaju hijerarhiju reference; dugi naslovi imaju dostupan puni tekst kroz title.
- Spacing/layout rhythm: iste tri oblasti i proporcije (navigacija oko 16,6%, dnevni alati oko 24,4%); kompaktne liste i čista površina umjesto kartica unutar kartica. Sesije staju u prvi ekran pri 1280 × 910.
- Colors/tokens: bijela osnova, blaga siva navigacija, taman tekst i plavi akcenat. Tamna tema koristi postojeće semantičke tokene i isti raspored. Screenshot nije potvrda pune WCAG usklađenosti.
- Image quality/assets: izabrana referenca sačuvana neizmijenjena; UI nema dodatnih raster ilustracija. Lokalne Phosphor brend/servis ikone iz postojeće biblioteke čuvaju oštrinu i ne šalju privatne URL-ove favicon servisima.
- Copy/content: primjeri nisu ugrađeni u aplikaciju. Datum, tabovi, sesije, bilješke i zadaci dolaze iz stvarnih izvora u ekstenziji; u QA su označeni kao sintetički.

## Namjerne razlike i P3 dorade

- Monohromatske servisne ikone umjesto šarenih favicon-a.
- Nepodešeni Calendar ima stvarnu radnju Otvori kalendar, umjesto nefunkcionalnog povezivanja. Gmail ostaje prava eksternalna prečica.
- Bilješka nema izmišljeni datum posljednjeg čuvanja; prikazuje Lokalna bilješka.
- Osnovne akcije za izvore/dozvole i pomoć medija ostaju dostupne kroz sažete details kontrole. Izvor se ne pokreće automatski.
- Prethodni raspored i njegova podešavanja ostaju sačuvani u režimu Prilagođeni widgeti; nova konzola je podrazumijevana.

## Interakcije i provjere

`corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test` (46/46), `corepack pnpm build` i `git diff --check` prolaze.

`verify-console.mjs` / kompatibilni `verify-workspace.mjs` prolaze sa sintetičkim Chrome API-jima u odvojenom headless browseru: šest destinacija, aktiviranje/zatvaranje tabova, sklapanje grupa, pregled grupisanja i Escape, bilješke i draft nakon zatvaranja dijaloga, dnevni zadaci, sesije i preskakanje postojećih URL-ova, bookmark premještanje i potvrđeno otvaranje, stari raspored i drag/keyboard kontrole, bočni panel i dijeljenje bilješke. Nema pageerror ili console error poruka. Light/dark provjereni na 1440/1280/1024/768/320 px bez horizontalnog preliva; sidepanel na 360px. Reduced motion je uključen.

Granice: nije provjerena korisnikova stvarna instalacija ekstenzije, Chrome autorizacija, Google OAuth, aktivan player, puni accessibility audit ili stvarni browser zoom. HTTP pregled ne pristupa stvarnim Chrome tabovima i bookmarkovima. Razvojne integracije i otvorene faze nisu proglašene završenim ovim UI korakom.

final result: passed
