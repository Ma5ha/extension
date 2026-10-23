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

- Radna konzola: bočna navigacija; tabovi i sačuvane sesije u sredini; dnevni zadaci, bilješke, kalendar, Gmail i mediji u desnom panelu. Bookmarkovi, sesije i bilješke imaju svoje prikaze u navigaciji. Na užem prozoru dnevni alati prelaze ispod glavnog sadržaja.
- Svijetla, tamna i sistemska tema; opcioni glass (0 je neprozirna osnova).
- Pregled, aktiviranje, zatvaranje i grupisanje tabova trenutnog prozora. Pretraga je uklonjena na zahtjev korisnika.
- Ručni pregled grupisanja po `URL.origin`: najmanje dva podobna taba; preskaču se zakačeni, već grupisani, interni/nepodržani i pojedinačni tabovi. Ponovna provjera prije primjene ne uključuje naknadno otvorene tabove. Rezultat razlikuje uspjeh, preskakanje i neuspjeh. Grupisanje nema radnju zatvaranja ili Undo.
- Podešavanja se čuvaju po polju u `chrome.storage.local` i osvježavaju kroz storage događaje u ostalim novim tabovima. Istovremene promjene istog polja imaju pravilo posljednjeg upisa. HTTP pregled koristi localStorage samo za pregled izgleda.

`alarms` zakazuje timer, alarm i podsjetnike za zadatke; opciona `notifications` dozvola traži se pri pokretanju podsjetnika/timera. `storage` čuva lokalne podatke i podešavanja; `sidePanel` omogućava bočni panel; `favicon` omogućava stvarne ikonice sajtova iz Chrome-ovog lokalnog favicon prikaza. Opcioni `identity` i Google API host traže se pri povezivanju kalendara. `tabs` se traži za naslove/adrese tabova, a `tabGroups` pri primjeni pregleda. Search dozvola nije dio paketa; bookmarks dozvola je opciona za bookmark widget. Mediji opciono traže `scripting` i pristup jednom izabranom HTTP/HTTPS hostu. Manifest dopušta opcioni izbor tih hostova, bez unaprijed odobrenog pristupa svim sajtovima ili automatskih content skripti. Odbijanje dozvole ostavlja osnovni UI dostupnim.

Gmail prikazuje **nepovezano stanje i običnu prečicu**; Calendar ima opcionu integraciju opisanu ispod. Mediji kontrolišu postojeće tabove: mute/otvaranje i, uz opcioni pristup sajtu, HTML audio/video play/pause, jačinu i seek po dostupnim opsezima. Izbor pauziranog taba omogućava otkrivanje bez zvuka; dozvola se može ukinuti u panelu. Nema novog playera, Gmail poruka ili RSS-a. Podrška zavisi od sajta; stvarna Chrome matrica još nije potvrđena — vidi [Mediji provjeru](docs/provjere/mediji.md). Vijesti su označena naredna faza. Podešavanja nude osnovnu Radnu konzolu ili prethodni prilagodljivi režim. Sačuvani raspored widgeta ostaje netaknut; prilagodljivi režim podržava premještanje, redoslijed, širine kolona i najmanje visine widgeta; izvoz/uvoz i ostale integracije ostaju prema planu.

## Organizacija

`entrypoints/newtab` pokreće UI. `src/domain` sadrži čista pravila i rangiranje, `src/adapters` Chrome API i skladište, `src/hooks` React sinhronizaciju, `src/components` prikazne cjeline. Koriste se nativni HTML dialog/select/checkbox primitivi i lokalno zapakovan Phosphor skup ikona. Nx nije dio projekta.

Tačne verzije su u `pnpm-lock.yaml`; WXT 0.21.4, React 19.3.1, TypeScript 5.9.3 i pnpm 12.14.0 inicijalizovani su 21. oktobra 2026. Vite 8.3.4 dolazi kroz WXT. pnpm dozvoljava samo potrebnu esbuild install skriptu.

Obim provjera i granice su u [izvještaju provjere](docs/provjere/izvjestaj.md), a status faza u [planu](PLAN.md) i [progresu](docs/progres.md).

Izvori pregledani pri inicijalizaciji: [WXT instalacija](https://wxt.dev/guide/installation.html), [entrypoints](https://wxt.dev/guide/essentials/entrypoints.html), [Chrome tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs), [tabGroups](https://developer.chrome.com/docs/extensions/reference/api/tabGroups), [search](https://developer.chrome.com/docs/extensions/reference/api/search) i [optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions).

## Google Calendar

Implementirana je opciona read-only agenda primarnog Google kalendara. Za aktiviranje je potreban Google Cloud Chrome Extension OAuth client ID pri build-u; bez konfiguracije prikazuje se jasno nepodešeno stanje. Podešavanje i granice: [Google Calendar](docs/google-calendar.md). Nema čuvanja tokena/događaja u lokalnim podešavanjima. Stvarna autorizacija još nije potvrđena.

## Sačuvani linkovi — Chrome bookmarkovi

Widget koristi iste bookmarkove kao Chrome, uključujući njihove foldere. Dugme „Poveži Chrome bookmarkove“ traži opcionu bookmarks dozvolu. Dodavanje kreira Chrome bookmark u izabranom folderu ili podrazumijevanom folderu Ostali bookmarkovi; uređivanje i uklanjanje mijenjaju originalni zapis. Promjene iz Chrome-a i drugih Tabora tabova osvježavaju widget kroz bookmarks događaje. Upravljani bookmarkovi se ne mogu mijenjati. Linkovi koji nisu HTTP/HTTPS ostaju prikazani, ali se ne otvaraju kroz widget. Pretraga ostaje uklonjena.

Stara odvojena Tabora lista više se ne čita niti mijenja; prethodni lokalni zapisi nisu automatski obrisani ili prekopirani. Widget nema sopstvenu kopiju Chrome bookmarka. Sinhronizacija između uređaja zavisi od Chrome podešavanja.

## Sesije, fokus, raspored i bočni panel

Dodati sačuvane sesije web tabova, bilješke i tri dnevna zadatka, bolja organizacija Chrome foldera, režim uređivanja rasporeda i pravi Chrome bočni panel preko Tabora toolbar ikone. Sesije ne zatvaraju trenutne tabove; otvaranje ima pregled i izvještaj. Podaci ostaju lokalni. Detalji, ograničenja i provjere: [Radni prostor](docs/radni-prostor.md).

## Izabrani izgled — Radna konzola

Referenca: [izabrani koncept](docs/ui-koncepti/radna-konzola-odabrano.jpg). Konzola prikazuje stvarne lokalne podatke; primjeri sa reference nisu ugrađeni u aplikaciju. Formulari za novu sesiju i uređivanje bilješke otvaraju se na zahtjev. Tabovi i Chrome bookmarkovi prikazuju stvarne ikonice kroz Chrome favicon API, bez slanja URL-ova eksternom favicon servisu. Ako slika nije dostupna, koristi se lokalna Phosphor ikonica; nakon promjene izvora ponovo se pokušava učitavanje. U dark temi ikonica ima svijetlu podlogu radi čitljivosti.

Sintetički pregled novog rasporeda pokreće `scripts/verify-console.mjs` sa istim `TABORA_PLAYWRIGHT_PATH` i `TABORA_CHROMIUM_PATH` opcijama kao postojeća QA skripta. Ne čita korisnikov browser profil.

## Ikonice i font — TAB-03-F

Koristi se Chrome-ov `/_favicon/` endpoint uz potrebnu `favicon` dozvolu. Za grupu tabova uzima se prva stvarna stranica, a svaki tab i bookmark imaju sopstveni izvor. `favIconUrl` iz Chrome-a služi samo za osvježavanje lokalne slike kada se ikonica promijeni; udaljena adresa ikonice se ne učitava direktno. Interne, neispravne i adrese sa kredencijalima koriste rezervnu ikonicu. Nisu dodate nove host dozvole ili web-accessible resources. [Chrome dokumentacija](https://developer.chrome.com/docs/extensions/how-to/ui/favicons).

Font je lokalno pakovan Inter Variable 4.1, sa podrškom za latinična slova i promenljive debljine. Nema runtime font CDN-a. OFL licenca ide u `build/chrome-mv3/licenses/Inter-OFL.txt`; porijeklo i hash su u `src/assets/fonts/README.md`. [Inter](https://rsms.me/inter/).

Provjera sa `TABORA_QA_OUTPUT=docs/provjere/ikonice-font` čuva novi pregled odvojeno od prethodnog; detalji i granice u [izvještaju](docs/provjere/ikonice-font/izvjestaj.md).

## Mini-player i video — TAB-07-B

U panelu Mediji izaberi postojeći izvor i po potrebi odobri kontrole samo njegovom sajtu. **Mini-player** izdvaja iste kontrole unutar Tabore; ručicu možeš prevlačiti ili pomjerati strelicama tastature. Donja desna ručica mijenja veličinu, takođe strelicama. „Položaj i veličina“ nudi iste radnje bez prevlačenja. „Vrati u panel“ vraća kontrole; Escape radi dok je fokus u mini-playeru. Izabrani izvor ostaje sačuvan tokom navigacije unutar iste Tabora stranice.

**Izdvoji kontrole** otvara prozor iznad drugih aplikacija gdje Chrome podržava Document Picture-in-Picture. Prozor prati temu i nastavlja osvježavati stanje dok je Tabora u pozadini. Zatvaranje prozora vraća panel, a zatvaranje njegove Tabora stranice zatvara taj prozor. Izvorni tab nastavlja svoju reprodukciju.

**Prikaži video / Sakrij video** koristi Chrome-ov video PiP za izabrani izvor. Video ostaje isti element u izvornom tabu; ne preuzima se stream i ne pokreće se drugi player. Dugme je dostupno samo za učitan i podržan video. Chrome koristi jedan PiP prozor, pa prelazak sa izdvojenih kontrola na video vraća kontrole u lokalni mini-player. Ako browser odbije radnju, otvori izvorni tab i koristi njegove kontrole.

Izvorni tab mora ostati otvoren. Pristup sajtu i njegovim okvirima, dozvola za PiP i sam servis određuju podršku. Nema automatskog puštanja, novih dozvola ili pauziranja drugih izvora.

## Fokus i radni prostori

Work, Personal i Study imaju odvojene rasporede, vidljivost modula, sesije, zadatke i bilješke. Postojeći podaci ostaju u Work. Tema/veličina fonta, Chrome tabovi i bookmarkovi su zajednički. Izbor prostora pamti se u pojedinačnom tabu.

Dugme Focus ostavlja timer, zadatke i bilješke. Quick note otvara bilješku prostora. U listi tabova ikona bilješke vezuje tekst za tačan URL; Notes prikazuje te bilješke i nakon zatvaranja stranice. Pregled duplikata nalazi iste web adrese u trenutnom prozoru; korisnik bira kopije za zatvaranje, a aktivni i zakačeni tabovi ostaju zaštićeni.

Sačuvan zadatak dobija Remind me sa lokalnim datumom/vremenom. Završetak ili brisanje zadatka otkazuje podsjetnik. History pokazuje završene timere po danima za izabrani prostor; pauza i reset ne dodaju sesiju. Timer je zajednički svim Tabora prikazima i sesija ostaje vezana za prostor u kojem je pokrenuta.

Prečice unutar Tabore: **Alt/Option + Shift + F** fokus, **T** početak timera od 25 minuta/pauza/nastavak, **N** brza bilješka, **1/2/3** Work/Personal/Study. Ne aktiviraju se tokom unosa ili otvorenog dijaloga.

Chrome mora biti pokrenut za pozadinske podsjetnike; uspavani uređaj ne bude. Sistemske obavijesti i njihov zvuk zavise od dozvola Chrome-a i OS-a. Nakon build-a uradi Reload ekstenzije.
