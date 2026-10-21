# Tabora — evidencija progresa

Datumi se vode prema Europe/Belgrade. Ovaj dokument prati rezultate; [PLAN.md](../PLAN.md) definiše obim i kriterijume.

## Aktuelni pregled

TAB-10-D/E/F/G i TAB-04-B — ZAVRŠENO u implementacionom i automatizovano provjerenom obimu. Dodate sve odobrene nadogradnje; 45 testova i UI provjere prolaze. Stvarni Chrome/nativni panel nisu potvrđeni; ručne korisničke provjere ostaju odložene. Detalji: [Radni prostor](radni-prostor.md).


TAB-10-C — ZAVRŠENO u implementacionom i automatizovano provjerenom obimu: widget direktno koristi Chrome bookmarkove umjesto odvojene lokalne liste. Opciona dozvola, folderi, Chrome create/update/remove i osvježavanje preko događaja. 36/36 testova, typecheck/lint/build prolaze; stvarni Chrome pregled ostaje neizvršen.


TAB-10-B — ZAVRŠENO u implementacionom i automatizovano provjerenom obimu: dodat bookmark widget. Novi UI nije ručno pregledan u Chrome-u, prema prethodno odloženim korisničkim provjerama. Korisnik traži bookmark widget. Obim: lokalni sačuvani linkovi, dodavanje ručno ili izborom otvorenog taba, uređivanje, uklanjanje i sinhronizacija između Tabora tabova. Bez Chrome bookmarks integracije i bez vraćanja pretrage. Koraci: model/adapter, widget, vidljivost u podešavanjima, provjere.


TAB-05-A — U TOKU: korisnik je naložio preskakanje svojih ručnih provjera i početak Google Calendar integracije. Postojeće Chrome provjere ostaju neizvršene i ne blokiraju ovaj korak. Plan: read-only primarni kalendar, opcioni Chrome identity/host pristup, dnevna agenda, naredni događaj, sigurne veze, odspajanje, testovi i build. OAuth klijent još nije konfigurisan; stvarna autorizacija zavisi od Google Cloud konfiguracije.


TAB-07-R istraživanje obuhvata sve medijske tabove. Korisnik je sada odobrio početak TAB-07-A u novom chatu: lokalni panel Mediji, kontrola postojećih izvora i podrška po mogućnostima, bez vlastitog servera. Implementacija TAB-07-A postoji u `src/media`; završna Chrome provjera preostaje. Cijeli TAB-07 i dalje je nezavršen.

TAB-03-D — ZAVRŠENO: pretraga je uklonjena, pojednostavljen raspored i tekstovi. Typecheck/lint/build i HTTP vizuelni pregled u obje teme prolaze; stvarni Chrome tokovi ostaju zasebna provjera.

Izabrani raspored je Modularni atelje, treći koncept light serije. Prihvaćena osnova: WXT + React + TypeScript, Vite/MV3, pnpm i CSS Modules sa CSS varijablama. Light i dark ostaju obavezni; glass je prikazan, a njegov konačan intenzitet/materijal još nije izabran.

Implementacija TAB-03-A/TAB-04-A postoji: WXT osnova, izabrani raspored/teme, Chrome adapteri, pregled grupisanja i lokalna podešavanja; pretraga je naknadno uklonjena. Typecheck, lint, 13 testova i produkcioni build prolaze. HTTP UI pregled provjeren na više širina u obje teme; stvarno učitavanje i rad Chrome API-ja još nisu potvrđeni. Lokalni paket je u `build/chrome-mv3`. Početni commit je `095f865`; nove promjene nisu commitovane, nema remote-a ili objave. Aktuelna izmjena: korisnik je preskočio svoje ručne provjere i odobrio TAB-05-A. Sljedeći preduslov za stvarni Calendar pristup je Google OAuth konfiguracija.

## Istorija rada

### 21. oktobar 2026. — početna evidencija

Prethodni rad rekonstruisan je iz stvarnih fajlova, Git statusa i istorijskih zapisa u planu:

- TAB-01: lokalni Git na `main`, `.gitignore` i početni plan postoje. Provjera: `git status --short --branch` i pregled fajlova; nema commita.
- TAB-02: napravljeni su `docs/ui-istrazivanje.md`, `AGENTS.md` i dvije serije po tri ImageGen koncepta. Korisnik je izabrao Modularni atelje iz druge serije. Postoji i glass varijanta. Slike su vizuelno pregledane, nisu funkcionalna ekstenzija; kontrast i integracije nisu potvrđeni.
- Ostale TAB faze nisu započete. Potvrda: nema package manifesta ili aplikacionog koda u trenutnom repozitorijumu.

### 21. oktobar 2026. — TAB-02-DOC: prihvaćeni stack i praćenje rada

Zahtjev: upisati prihvaćenu preporuku u plan i obavezati agenta da vodi plan i progres.

Koraci: uskladiti tehničku osnovu i redoslijed razvoja; dopuniti agentove upute; uspostaviti evidenciju; provjeriti veze i dosljednost dokumenata.

Rezultat: `PLAN.md` sada navodi prihvaćeni WXT stack, UI pristup i redoslijed. `AGENTS.md` nalaže zapis prije rada, poslije značajnih koraka, pri prekidu i prije završetka. Ovaj dokument uspostavlja istoriju i pregled svih faza. Nije pokrenuta inicijalizacija ili instalacija.

Provjera: pregled izmijenjenih dokumenata, provjera lokalnih Markdown veza i Git whitespace provjera. Za ovaj dokumentacioni zadatak nema build/typecheck provjere jer aplikacija ne postoji.

Preostalo: konačna razrada materijala i dark teme, tehničke provjere Google integracija/playera/društvenih izvora i implementacija prema planu. Prihvatanje frameworka je završena odluka, ne završetak cijelog TAB-02.

## Detaljni zadaci

### 21. oktobar 2026. — TAB-07-A: odobrenje i predaja

Korisnik traži dodavanje playera u plan i pokretanje u novom chatu. Plan proširen odobrenim nezavisnim korakom kontrole postojećih medijskih tabova, bez čekanja Google modula. Koraci novog rada: pregled stvarnog koda i dokumentacije; osnovni audible/mute nivo; opcioni pristup po sajtu i HTML media adapter; UI sa izborom izvora i stanjima; provjere i evidencija. U ovom chatu je pripremljena dokumentacija i predaja, bez implementacije playera. Spotify OAuth/embeds ostaju zasebni, X nije dio ovog zadatka.

### 21. oktobar 2026. — TAB-07-R: istraživanje YouTube kontrole

Zahtjev je istražiti kontrolu već otvorenog YouTube taba. Pregledani Chrome scripting/content scripts/activeTab/permissions, HTMLMediaElement i YouTube IFrame API. Rezultat je `docs/youtube-kontrola.md`: zaključak tehničke izvedivosti, predložene opcione dozvole, granice i matrica provjere. Ovo je dokumentaciono istraživanje, bez prototipa, izmjene manifesta ili korišćenja privatnih tabova. TAB-07 implementacija ostaje PLANIRANO. Predložen mali prototip play/pause/mute i izbor izvora.

### 21. oktobar 2026. — GIT-01: prvi lokalni commit

Korisnik je izričito naložio commit. Obim: `.gitignore`, plan, agentove upute, UI istraživanje, evidencija i sedam sintetičkih UI koncepata. Ciljna grana je `main`; remote nije konfigurisan. Pregledan je sadržaj dokumenata i izvršena pretraga uobičajenih obrazaca tajni bez pronađenih podudaranja. Slike su prethodno vizuelno pregledane i prikazuju sintetičke podatke. Lokalni commit se izvršava nakon ovog zapisa; njegov ishod i identifikator provjeravaju se u Git istoriji i završnom odgovoru. Push nije zatražen.

| ID | Zadatak | Status | Rezultat / preostalo |
|---|---|---|---|
| TAB-02-DOC | Prihvaćeni stack, upute i evidencija | ZAVRŠENO | Dokumenti usklađeni; lokalne veze i format provjereni. Bez instalacije u tom koraku. |
| TAB-07-R | Istraživanje kontrole YouTube taba | ZAVRŠENO | Pregledana zvanična dokumentacija; tehnička procjena postoji, stvarni YouTube prototip nije izvršen. |
| TAB-07-A | Objedinjena kontrola medijskih tabova | U TOKU | Korisnik odobrio početak u novom chatu; Panel i DOM/Chrome adapteri implementirani; automatizovane provjere i HTTP osnovni pregled prolaze, stvarna Chrome matrica preostaje. |
| TAB-03-A | WXT osnova, raspored i teme | U TOKU | Implementirano i HTTP pregled provjeren; učitavanje u Chrome preostaje. |
| TAB-03-B | Stil i organizacija koda | ZAVRŠENO | AGENTS.md prilagođen WXT projektu, bez Nx-a. |
| TAB-03-D | Uklanjanje pretrage i pregledniji UI | ZAVRŠENO | Bez search/bookmark dozvola i prečice; pregledane light/dark teme i 320 px bez preliva. |
| TAB-10-D | Chrome bookmark folderi i premještanje | ZAVRŠENO | Izbor/svijanje foldera, premještanje originalnog zapisa i potvrđeno grupno otvaranje; model/API i sintetički UI provjereni. |
| TAB-04-B | Sačuvane sesije | ZAVRŠENO | Snimak web tabova, pregled/obnova i djelimičan rezultat; bez zatvaranja trenutnih tabova. |
| TAB-10-E | Fokus i bilješke | ZAVRŠENO | Tri dnevna zadatka i lokalne bilješke, provjeren reload i dijeljenje sa panelom. |
| TAB-10-F | Raspored i veličine widgeta | ZAVRŠENO | Prevlačenje/tastatura, kolone/redoslijed, širine i min. visine; čuvanje i validacija provjereni. |
| TAB-10-G | Bočni panel | ZAVRŠENO | Native entrypoint/action/background implementirani, manifest i sintetički UI provjereni; stvarni Chrome panel nije ručno potvrđen. |
| TAB-10-B | Lokalni bookmark widget | ZAVRŠENO | Dodavanje/izmjena/uklanjanje i lokalno čuvanje, 35/35 testova i build prolaze; Chrome UI pregled nije izvršen. |
| TAB-03-C | Vidljiv lokalni paket i učitavanje | U TOKU | build/chrome-mv3 sadrži manifest; korisniku dat tačan put nakon greške izbora foldera. |
| TAB-04-A | Tabovi i origin grupisanje | U TOKU | Implementirani adapteri i UI, 13 testova prolazi; stvarne dozvole i radnje preostaju. |

## Status razvojnih faza

| ID | Faza | Status | Rezultat / preostalo |
|---|---|---|---|
| TAB-01 | Repozitorijum i plan | ZAVRŠENO | Lokalni Git, `.gitignore`, plan i commit `095f865`; nema remote-a. |
| TAB-02 | Specifikacija i tehnička provjera | U TOKU | Istraživanje, izbor rasporeda i prihvaćeni stack postoje; materijal/obim i tehničke provjere integracija preostaju. |
| TAB-03 | Osnova ekstenzije i UI | U TOKU | Kod i MV3 build postoje; obje teme i HTTP pregled provjereni. Potvrda učitavanja kao novi tab još preostaje. |
| TAB-04 | Tabovi i grupisanje | U TOKU | Adapteri i origin pregled implementirani, pravila testirana; pretraga naknadno uklonjena. Stvarni Chrome tokovi čekaju učitavanje. |
| TAB-05 | Google Calendar | U TOKU | Read-only primarna agenda i OAuth/API kod implementirani; 30 testova/typecheck/lint/build prolaze. Stvarni OAuth klijent i povezivanje preostaju. |
| TAB-06 | Gmail | PLANIRANO | Autorizacija, pregled/pretraga i uslovi javne verifikacije. |
| TAB-07 | Muzika | PLANIRANO | Spotify/SoundCloud i provjera trajanja reprodukcije kroz više tabova. |
| TAB-08 | Vijesti | PLANIRANO | RSS izvori, naslovi i lokalno čuvanje članaka. |
| TAB-09 | X i Instagram | PLANIRANO | Potvrditi podršku, troškove i dozvole prije implementacije. |
| TAB-10 | Personalizacija i prenos | U TOKU | Osnovni izbor teme/vidljivosti implementiran u TAB-03; premještanje, izvoz/uvoz i puna provjera preostaju. |
| TAB-11 | Priprema javnog izdanja | PLANIRANO | Privatnost, dozvole, provjere i paket za prodavnicu. |
| TAB-12 | Objavljivanje | PLANIRANO | Zaseban nalog i predaja u prodavnicu, tek poslije pripreme. |

### 21. oktobar 2026. — TAB-03-A / TAB-04-A: početak implementacije

Status: U TOKU. Koraci: pregled WXT/Chrome dokumentacije; inicijalizacija WXT/React/TypeScript sa pnpm; Modularni atelje i ručni light/dark/sistemski izbor, opcioni glass; stvarni tabovi trenutnog prozora, lokalna pretraga tabova/oznaka i eksplicitna web pretraga; pregled i ponovno provjeravanje origin grupisanja; storage sinhronizacija; provjere tipova, lint, build, pravila i browser pregled gdje je dostupan. Google i player integracije nisu obim ovog koraka. UI je na srpskom latinicom prema postojećem konceptu.

Početna provjera: Git bez promjena, `095f865`; Node 22.22.1, pnpm 12.14.0 preuzet uz odobren pristup mreži. Pregledane zvanične WXT installation/entrypoints i Chrome tabs/tabGroups/search/permissions stranice. WXT se može inicijalizovati ručno u postojećem repozitorijumu. Prije implementacije nema izvršenih build ili UI provjera.

### 21. oktobar 2026. — TAB-03-B: stil i organizacija koda

Na korisnikov zahtjev dodat odjeljak u `AGENTS.md`: čiste funkcije, izolovani sporedni efekti, mali prikazni moduli i namjenski hookovi, efekti samo za sinhronizaciju. Tekst prilagođen stvarnom WXT projektu: obični TypeScript moduli/React komponente, bez Nx-a; primjeri skladišta i izmjena koriste Chrome API, bez pretpostavke o bazi. Provjera: pregled odjeljka i poređenje sa prihvaćenim stackom. Status: ZAVRŠENO; pravila se primjenjuju na tekuću implementaciju.

### 21. oktobar 2026. — TAB-03-A / TAB-04-A: implementacioni korak

Postoje WXT newtab entrypoint, CSS Modules i semantičke light/dark varijable, opcioni glass/neprozirni prikaz, podešavanja i Chrome adapteri. `src/domain/tabs.ts` odvaja origin pravila, rangiranje i ponovno provjeravanje od efekata. `src/hooks` sinhronizuje tabove i podešavanja; prikaz je podijeljen u komponente. Calendar/Gmail/muzika imaju samo označena nepovezana stanja i obične linkove.

Instalacija: WXT 0.21.4, @wxt-dev/module-react 1.2.2, React/ReactDOM 19.3.1, TypeScript 5.9.3, pnpm 12.14.0; Vite 8.3.4 dolazi kroz WXT. UI primitivi: nativni dialog, select, checkbox, dugmad; ikone Phosphor 2.1.10; sistemski font, bez udaljenih asseta. Lockfile sačuvan. pnpm allowBuilds eksplicitno dozvoljava esbuild skriptu.

Prvi build prolazi; generisani MV3 manifest zaista sadrži `chrome_url_overrides.newtab`. Prvi typecheck otkrio je Vite deklaraciju tipa i tuple tip Chrome `tabs.group`; ispravljeno, ponovna provjera slijedi. Lint potom bez upozorenja. Devet testova origin/ranking/settings pravila prolazi. Chrome HTTP pregled otvoren na lokalnom portu 4174; osnovni light raspored vizuelno potvrđen, stvarni Chrome API se u tom pregledu ne izvršava. Slijede rubna stanja, tastatura, druge širine i teme.

### 21. oktobar 2026. — TAB-03-C: lokalno učitavanje i vidljiv paket

Korisnik je odobrio lokalno učitavanje i test pristup tabovima/oznakama/grupisanju. Browser bezbjednosna provjera odbila je `chrome://extensions/` jer dozvoljava samo HTTP/HTTPS; nije korišćen zaobilazni pristup. Korisnik pri ručnom pokušaju javlja „manifest file is missing“. Provjera potvrđuje da `.output/chrome-mv3/manifest.json` postoji, ali je njegov nadređeni folder skriven. WXT `outDir` je promijenjen na vidljivi `build`; README i lint ignore su usklađeni. Novi paket ima `build/chrome-mv3/manifest.json`. Stvarno učitavanje još nije potvrđeno.

### 21. oktobar 2026. — TAB-03-A / TAB-04-A: pregled i automatizovana provjera

Typecheck, lint bez upozorenja, 13 Vitest testova i produkcioni build prolaze. U Chrome-u vizuelno pregledane light/dark osnove; za odvojenu QA provjeru korišćen ugrađeni browser da se ne ometa korisnikova aktivnost. Obje teme snimljene na 1440×900, 1280×720, 1024×768 i 320×800. Na 320 nema horizontalnog preliva. Provjereni dijalog/Escape/povratak fokusa, vidljivo dugme pretrage, izbor opsega, čuvanje nakon reload-a i sinhronizacija teme između dva HTTP taba. Maksimalni glass vizuelno pregledan. Tokeni pročitani iz renderovanog DOM-a; izračunati kontrasti su u docs/provjere/kontrast.json. Nije tvrdnja pune WCAG usklađenosti.

Preostalo: stvarno učitavanje novog taba, Chrome dozvole i stvarni tab/bookmark/search/group tokovi, 200% browser zoom i runtime reduced-motion provjera. CSS reduced-motion pravilo postoji; nema dekorativnih animacija. Snimci prikazuju samo nepovezane module, bez privatnih podataka. Google/player/RSS integracije i javno izdanje nisu pokrenuti. Detalji i granice u docs/provjere/izvjestaj.md.

Završni paket provjeren: `build/chrome-mv3/manifest.json`, newtab HTML i sve njegove lokalne JS/CSS reference postoje; MV3 override, odsustvo host dozvola i content skripti potvrđeni. Završni `git diff --check` prolazi. Odvojeni HTTP browser nema console error/warn poruka. Stvarni Chrome rezultat ostaje nepotvrđen nakon korisnikove poruke o izboru foldera; novi vidljivi put je dostavljen. TAB-03/TAB-04 ostaju U TOKU, bez commita ili objave.

### 21. oktobar 2026. — TAB-03-D: rezultat

Na korisnikov zahtjev uklonjeni su Search komponenta, bookmark hook, search/bookmark adapteri, Cmd/Ctrl+K i dozvole iz WXT manifesta. Preuređeni App.tsx i App.module.css: kompaktna segmentirana navigacija, jasniji naslov radnog prostora, manje obruba origin grupa i kraći nepovezani widgeti. Usklađeni SettingsPanel, README, PLAN, AGENTS i UI istraživanje. Nakon prekida provjereno je da build postoji; lokalni server je ponovo pokrenut uz dozvolu. Prvi pristup na 127.0.0.1 nije uspio; localhost pregled radi.

Provjere: typecheck, lint i produkcioni build prolaze nakon konačnog uklanjanja adaptera. U HTTP browseru pregledane obje teme; pri 320 CSS px scrollWidth je 320 i combobox ne postoji. Dijalog prikazuje ažuriranu Privatnost sekciju i nema pretrage. Sačuvani snimci bez-pretrage-light.png i bez-pretrage-dark.png u docs/provjere. Stvarni tabovi nisu prikazani u HTTP okruženju; ranije nepotvrđeni Chrome tokovi nisu proglašeni završenim. Nisu dodati testovi, nije rađen commit/push.

### 21. oktobar 2026. — TAB-07-A: početak implementacije

Status U TOKU. Pregledani plan, evidencija, istraživanje, postojeći App/Chrome adapteri i Git izmjene; postojeći necommitovani rad ostaje sačuvan. Koraci: zapakovani izolovani DOM adapter i validacija komandi; opcione dozvole po sajtu; otkrivanje/izbor izvora i stanja; automatizovane provjere i ručni pregled gdje je dostupan. Provjerene aktuelne zvanične Chrome tabs/scripting/permissions i WXT scripting stranice. Pristup: periodično očitavanje samo dok je Tabora otvorena, bez background playera. Pauzirani DOM izvori ponovo se otkrivaju na odobrenim sajtovima; audible izvori pamte se tokom otvorenog panela. Stvarni Chrome test još nije izvršen.

### 21. oktobar 2026. — TAB-07-A: implementacioni rezultat

Dodati `src/media` DOM adapter, Chrome adapter, hook i panel. Osnovni nivo lista audible tabove iz svih prozora, pamti ih do zatvaranja panela, nudi tab mute i otvaranje. Na odobrenim sajtovima svaki novi panel ponovo otkriva i pauzirane DOM izvore. Izbor taba omogućava odobrenje i kad nikada nije bilo zvuka. Kontrole ciljaju documentId i stabilan ID elementa, bez automatskog play-a ili uticaja na ostale izvore. Live seek se ograničava stvarnim seekable opsegom. Više elemenata ima izbor; iframe, nedostupnost, odbijanje, ukidanje dozvole i discarded tab imaju tekstualni fallback. Host deklaracija obuhvata HTTP/HTTPS, ali runtime zahtjev uvijek traži jedan odabrani host; port se ne može ograničiti Chrome match patternom. Nema background playera ili servisa.

Prvi krug: typecheck i lint prolaze, 18 testova prolazi (5 novih za granice komandi, selekciju elementa, live seek i odbijeni play), WXT produkcioni build prolazi. Dodatno usklađivanje privatnosti i provjera potvrde volume komande slijede. Nativni Chrome pregled trenutno nije dostupan: computer-use inventar javlja zaključan Mac, automatsko otključavanje nije uspjelo. Nije tvrđeno da HTTP pregled potvrđuje Chrome funkcije.

### 21. oktobar 2026. — TAB-07-A: završna evidencija implementacionog koraka

Rezultat postoji u `src/media`, App i SettingsPanel su povezani sa novim panelom; prethodne izmjene i odsustvo searcha sačuvani. Novi testovi prvo su otkrili četiri stroga indeksna TypeScript upozorenja u testovima; ispravljeno i typecheck zatim prolazi. HTTP pregled na localhost:4174 prikazuje Medije u light/dark rasporedu; 320 px ima scrollWidth 320, navigacija Muzika i Tab fokus rade. Stvarne aktivne kontrole nisu prikazane u HTTP okruženju. Lokalni server pokušaj prvo odbijen sandboxom; eskalirani pokušaj prijavio zauzet port, postojeći server je zatim poslužio novi build. Nativni pregled zaključanog Mac-a nije dostupan.

TAB-07-A ostaje U TOKU zbog stvarne Chrome matrice, dok je implementacioni korak završen u opisanom obimu. Naredni korak je reload `build/chrome-mv3` i izvršavanje `docs/provjere/mediji.md`; nema naloga za commit/push/objavu. Zum 200%, runtime reduced motion, glass sa aktivnim medijima i puna tastaturna Chrome matrica nisu provjereni.

Konačne provjere TAB-07-A: `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test` (21/21), `corepack pnpm build` i `git diff --check` prolaze. Build manifest sadrži samo storage kao obaveznu dozvolu, tabs/tabGroups/scripting kao opcione i HTTP/HTTPS opcione hostove; nema statičkih content skripti. README i UI istraživanje usklađeni. Implementacija je spremna za reload i stvarnu Chrome provjeru; TAB-07-A nije označen potpuno završenim.

### 21. oktobar 2026. — TAB-05-A: prvi implementacioni rezultat

Dodati Calendar model, Chrome/OAuth/API adapter, hook i agenda panel. Podržani su dnevni primarni kalendar, sve stranice rezultata, cjelodnevni događaji, naredni događaj, Meet link, opcione dozvole, greške i odspajanje. Dokumentovana Google Cloud konfiguracija; stvaran klijent nije dostavljen. Prvi krug: 30/30 testova i build prolaze; typecheck otkrio tip permissions objekta i nedostajuće Node konfiguracione tipove, lint jedno cleanup ref upozorenje. Ispravke u toku.

### 21. oktobar 2026. — TAB-05-A: završetak implementacionog koraka

Implementacija je u `src/calendar` (model, adapter, hook, panel/CSS i 9 testova); App, SettingsPanel, ServicePanels i WXT manifest su usklađeni. Dodati `@types/node` 22.20.5 za Node build konfiguraciju. `TABORA_GOOGLE_CLIENT_ID` dodaje oauth2 samo u konfigurisan build; opcioni javni key podržava stabilan ID. Nema client secret-a, stvarnog klijenta, tokena ili privatnih događaja u projektu. README i `docs/google-calendar.md` opisuju aktiviranje, odspajanje, opseg i granice.

Konačna provjera: typecheck prolazi, lint bez upozorenja, 30/30 testova prolazi, produkcioni build prolazi sa i bez sintetičkog OAuth client ID-ja. Automatski pregled oba manifesta potvrđuje opcioni identity, ispravan newtab override i odsustvo oauth2 u nekonfigurisanom paketu. Posljednji `build/chrome-mv3` je bez sintetičkog klijenta. `git diff --check` prolazi. Nove Chrome/Google i vizuelne provjere nisu izvršene; korisnik je preskočio svoje ručne provjere. Ranije provjere tema nisu dokaz provjere nove agende.

TAB-05-A implementacioni korak je završen u ovom obimu, a cijeli TAB-05 ostaje U TOKU: stvarna autorizacija i dohvat zahtijevaju Google Cloud Chrome Extension OAuth client ID vezan za ID ekstenzije. Naredni korak je konfiguracija stvarnog OAuth klijenta prema uputstvu; unos događaja, dodatni kalendari i Gmail nisu implementirani. Nema commit/push/objave.

### 21. oktobar 2026. — Git komit implementacije

Na korisnikov nalog pripremljen komit postojećih izmjena TAB-03/TAB-04, TAB-05-A i TAB-07-A, zajedno sa dokumentacijom i QA artefaktima. Ponovljene provjere: typecheck, lint, 30/30 testova, produkcioni build i git diff --check prolaze. Stvarne Chrome i Google OAuth provjere ostaju neizvršene; statusi faza se ne mijenjaju. Push i objava nisu dio naloga.

### 21. oktobar 2026. — TAB-10-B: implementacija

Dodati model/adapterski sloj, hook i bookmark widget sa ručnim unosom, izborom otvorenog HTTP/HTTPS taba, uređivanjem i potvrdom uklanjanja. Svaki zapis ima svoj storage ključ, tako da paralelna dodavanja različitih linkova ne prepisuju kompletnu listu. Widget je u desnoj koloni; podešavanje vidljivosti podrazumijevano uključeno i kompatibilno sa starim podešavanjima. Nema novih dozvola, mrežnog učitavanja ikonica, Chrome bookmark stabla ni search polja. Prvi krug: typecheck/lint/30 postojećih testova/build prolaze. Dodato 5 ciljanih testova za validaciju, konkurentne upise, oštećene zapise, storage greške i pretplatu; konačna provjera slijedi.

### 21. oktobar 2026. — TAB-10-B: rezultat i provjere

Konačno: `corepack pnpm typecheck`, `corepack pnpm lint` (bez upozorenja), `corepack pnpm test` (35/35), `corepack pnpm build` i `git diff --check` prolaze. Lokalni paket obnovljen u `build/chrome-mv3`. Validacija blokira izvršive protokole i URL kredencijale; oštećeni i nepovezani storage zapisi se preskaču. Relevantni fajlovi: `src/bookmarks/*`, App, SettingsPanel, settings adapter, README, plan i UI smjernice. Nema novih dozvola ili zavisnosti. TAB-10-B završen u implementacionom i automatizovano provjerenom obimu; novi UI/sinhronizacija u stvarnom Chrome-u nisu ručno potvrđeni. Cijeli TAB-10 ostaje U TOKU zbog rasporeda i izvoza/uvoza. Postojeće Google OAuth podešavanje ostaje naredni spoljašnji preduslov; nema commit/push/objave.

### 21. oktobar 2026. — TAB-10-C: Chrome bookmarkovi

U TOKU. Korisnik je izričito ispravio obim: želi iste bookmarkove kao Chrome. Zamijeniti lokalni adapter Chrome bookmarks API-jem, dodati opcionu dozvolu, prikaz foldera i događaje za sinhronizaciju; postojeće lokalne zapise ne brisati niti automatski kopirati. Pretraga ostaje isključena.

### 21. oktobar 2026. — TAB-10-C: rezultat

Lokalni storage adapter zamijenjen Chrome bookmarks API-jem; opciona dozvola traži se na Poveži. Čita kompletno stablo, prikazuje putanje foldera i upravljane zapise, uređuje po originalnom ID-ju i kreira u Chrome podrazumijevanom folderu. Neizvršivi HTTP/HTTPS linkovi su klikabilni, ostali zapisi ostaju vidljivi bez navigacije. Potvrda uklanjanja kaže da se mijenja Chrome. Praćeni created/changed/removed/moved/reordered/import i permission događaji, uz cleanup. Stari lokalni zapisi nisu automatski brisani niti prekopirani. README, SettingsPanel, UI smjernice i plan usklađeni; pretraga ostaje isključena.

Prvi typecheck novih testova otkrio nedostajuću syncing osobinu sintetičkog podatka; ispravljeno. Konačno: typecheck, lint bez upozorenja, 36/36 testova, build i git diff --check prolaze. API kontrakti provjereni prema https://developer.chrome.com/docs/extensions/reference/api/bookmarks. Stvarni korisnički bookmarkovi nisu čitani/mijenjani tokom provjera; testovi koriste mock. UI i dozvola u učitanoj ekstenziji nisu ručno potvrđeni. Nema commit/push/objave.

### 21. oktobar 2026. — TAB-10-D/E/F/G i TAB-04-B: početak

Korisnik je odobrio svih pet prijedloga: Chrome bookmark folderi/premještanje/otvaranje foldera; lokalne sesije; bilješke i tri dnevna zadatka; raspored i veličine widgeta; pravi Chrome side panel. Status U TOKU. Koraci: proširiti bookmark model/adapter, lokalni storage i sesije, fokus widget, raspored sa tastaturnim alternativama i čuvanjem, sidepanel entrypoint/background/action; provjere modela/API-ja, typecheck/lint/build i automatski UI pregled gdje je dostupan. Zadržati isti Chrome bookmark skup, bez pretrage, naloga, servera ili automatske reprodukcije. Ručne korisničke provjere ostaju odložene.

### 21. oktobar 2026. — TAB-10-D/E/F/G i TAB-04-B: implementacioni korak

Dodati sesije sa filtriranim snimkom web URL-ova i pinningom, pregled/obnova bez zatvaranja i preskakanje postojećih adresa. Fokus ima nezavisne storage ključeve za tri dnevna zadatka i eksplicitno čuvanu bilješku. Bookmark widget ima izbor/svijanje foldera i izbor cilja pri uređivanju, otvaranje web linkova uz potvrdu i djelimični rezultat. WidgetBoard pamti kolone, redoslijed, širine kolona i najmanju visinu kartica, sa drag ručkom i tastaturnim alternativama. Dodati sidepanel HTML/React entrypoint i action/background; pravi manifest side_panel pokazuje na zapakovani HTML. Prvi build/typecheck/lint prolaze. Prošireni testovi i automatski UI pregled slijede.

### 21. oktobar 2026. — automatizovani UI pregled nadogradnji

45/45 model/API testova, typecheck/lint i build prolaze. Playwright HTTP pregled sa sintetičkim Chrome API-jima potvrđuje čuvanje bilješke i zadatka, sesiju i preskakanje postojećih URL-ova, promjenu bookmark foldera po ID-ju, potvrđeno otvaranje foldera, raspored nakon reload-a i zajedničke bilješke između newtab i sidepanel stranica. Obje teme na 1440/1024/320 px bez horizontalnog preliva; pregledani light desktop, dark mobilni i sidepanel snimci. Stvarna Chrome autorizacija i nativno otvaranje panela nisu ovim HTTP testom potvrđeni.

UI alat je prvo tražio neinstaliranu Chromium verziju; korišćen već dostupan headless binary bez preuzimanja. Prvobitni storage fixture vraćao null umjesto undefined za nedostajuće ključeve i resetovao podešavanja; fixture usklađen sa Chrome-om. Uz to poboljšano optimistično prikazivanje i serijalizacija upisa podešavanja i eksplicitni pristupačni nazivi kontrola rasporeda. Proširena provjera prevlačenja, širina i praznih kolona slijedi.

### 21. oktobar 2026. — konačni rezultat svih pet nadogradnji

Native drag provjera između vidljivih kolona prolazi nakon korišćenja ref-a za sinhrono stanje drag događaja. Provjereni i kontrola širine tastaturom, uklanjanje prazne kolone, čuvanje redoslijeda/visine, sesije, bookmark folderi i zajedničke bilješke. QA skripta prolazi; `docs/provjere/workspace/results.json` i 7 slika imaju samo sintetičke podatke. Pregledani desktop light, mobilni dark i sidepanel snimci. Nema pageerror poruka, nema horizontalnog preliva na 1440/1024/320 px ili u sidepanel 360 px. Reduced-motion postavka aktivna; ne tvrdi se puna accessibility ili zoom provjera.

Relevantni moduli: `src/bookmarks`, `src/sessions`, `src/focus`, `src/local`, `src/workspace`, `src/sidepanel`, sidepanel/background entrypoints, App/settings i manifest. Nema novih zavisnosti. Produkcioni paket ima newtab i sidepanel, background/action i samo storage/sidePanel kao obavezne dozvole; tabs/tabGroups/scripting/identity/bookmarks ostaju opcioni. Preostalo: stvarni Chrome tokovi, Google Cloud konfiguracija, izvoz/uvoz i ostale faze plana. Nema commit/push/objave.

### 21. oktobar 2026. — lokalni commit nadogradnji

Korisnik je izričito naložio commit. Obim obuhvata Chrome bookmarkove i foldere, sesije, fokus/bilješke, raspored widgeta i bočni panel, povezane testove, dokumentaciju i sintetičke QA snimke. Pregledani Git status, diff i svi novi fajlovi; diff --check prolazi, pretraga obrazaca privatnih ključeva i tokena nije pronašla podudaranja. Build i zavisnosti ostaju ignorisani. Prethodne provjere: 45 testova, typecheck/lint/build i sintetički UI pregled prolaze. Commit se pravi lokalno; njegov ishod i identifikator provjeravaju se u Git istoriji. Push nije zatražen.
