# Tabora

Lokalna Chrome MV3 ekstenzija za novi tab. WXT + React + TypeScript, pnpm, CSS Modules i semantičke CSS varijable. Bez vlastitog servera, baze, analitike ili udaljenih fontova.

## Pokretanje

Potreban je Node 22.22.1 ili odgovarajući noviji podržani Node i Corepack.

```sh
corepack pnpm install
corepack pnpm dev
```

WXT razvojni runner koristi privremeni browser profil. Za produkcioni lokalni paket:

```sh
corepack pnpm build
```

U Chrome-u otvori `chrome://extensions`, uključi Developer mode, izaberi **Load unpacked** i folder `build/chrome-mv3` u ovom projektu. Novi tab tada otvara Taboru. Ako druga ekstenzija već zamjenjuje novi tab, Chrome može tražiti izbor aktivne zamjene. Ne treba povezivanje naloga.

```sh
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
```

## Lokalni obim

- Modularni atelje: agenda lijevo, tabovi u sredini, Gmail/muzika desno; dvije i jedna kolona na užim širinama.
- Svijetla, tamna i sistemska tema; opcioni glass (0 je neprozirna osnova).
- Pregled, aktiviranje, zatvaranje i grupisanje tabova trenutnog prozora. Pretraga je uklonjena na zahtjev korisnika.
- Ručni pregled grupisanja po `URL.origin`: najmanje dva podobna taba; preskaču se zakačeni, već grupisani, interni/nepodržani i pojedinačni tabovi. Ponovna provjera prije primjene ne uključuje naknadno otvorene tabove. Rezultat razlikuje uspjeh, preskakanje i neuspjeh. Grupisanje nema radnju zatvaranja ili Undo.
- Podešavanja se čuvaju po polju u `chrome.storage.local` i osvježavaju kroz storage događaje u ostalim novim tabovima. Istovremene promjene istog polja imaju pravilo posljednjeg upisa. HTTP pregled koristi localStorage samo za pregled izgleda.

`storage` čuva podešavanja i uključenost kalendara. Opcioni `identity` i Google API host traže se pri povezivanju kalendara. `tabs` se traži za naslove/adrese tabova, a `tabGroups` pri primjeni pregleda. Search i bookmarks dozvole nisu dio paketa. Mediji opciono traže `scripting` i pristup jednom izabranom HTTP/HTTPS hostu. Manifest dopušta opcioni izbor tih hostova, bez unaprijed odobrenog pristupa svim sajtovima ili automatskih content skripti. Odbijanje dozvole ostavlja osnovni UI dostupnim.

Gmail prikazuje **nepovezano stanje i običnu prečicu**; Calendar ima opcionu integraciju opisanu ispod. Mediji kontrolišu postojeće tabove: mute/otvaranje i, uz opcioni pristup sajtu, HTML audio/video play/pause, jačinu i seek po dostupnim opsezima. Izbor pauziranog taba omogućava otkrivanje bez zvuka; dozvola se može ukinuti u panelu. Nema novog playera, Gmail poruka ili RSS-a. Podrška zavisi od sajta; stvarna Chrome matrica još nije potvrđena — vidi [Mediji provjeru](docs/provjere/mediji.md). Vijesti su označena naredna faza. Premještanje modula, izvoz/uvoz i integracije ostaju prema planu. Trenutna personalizacija uključuje vidljivost modula, bez proizvoljnog mijenjanja njihovog redoslijeda.

## Organizacija

`entrypoints/newtab` pokreće UI. `src/domain` sadrži čista pravila i rangiranje, `src/adapters` Chrome API i skladište, `src/hooks` React sinhronizaciju, `src/components` prikazne cjeline. Koriste se nativni HTML dialog/select/checkbox primitivi i lokalno zapakovan Phosphor skup ikona. Nx nije dio projekta.

Tačne verzije su u `pnpm-lock.yaml`; WXT 0.21.4, React 19.3.1, TypeScript 5.9.3 i pnpm 12.14.0 inicijalizovani su 21. oktobra 2026. Vite 8.3.4 dolazi kroz WXT. pnpm dozvoljava samo potrebnu esbuild install skriptu.

Obim provjera i granice su u [izvještaju provjere](docs/provjere/izvjestaj.md), a status faza u [planu](PLAN.md) i [progresu](docs/progres.md).

Izvori pregledani pri inicijalizaciji: [WXT instalacija](https://wxt.dev/guide/installation.html), [entrypoints](https://wxt.dev/guide/essentials/entrypoints.html), [Chrome tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs), [tabGroups](https://developer.chrome.com/docs/extensions/reference/api/tabGroups), [search](https://developer.chrome.com/docs/extensions/reference/api/search) i [optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions).

## Google Calendar

Implementirana je opciona read-only agenda primarnog Google kalendara. Za aktiviranje je potreban Google Cloud Chrome Extension OAuth client ID pri build-u; bez konfiguracije prikazuje se jasno nepodešeno stanje. Podešavanje i granice: [Google Calendar](docs/google-calendar.md). Nema čuvanja tokena/događaja u lokalnim podešavanjima. Stvarna autorizacija još nije potvrđena.
