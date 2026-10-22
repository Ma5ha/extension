# Tabora — plan proizvoda i razvoja

Datum: 21. oktobar 2026.

## Ideja

Tabora je prilagodljiva Chrome ekstenzija koja novi tab pretvara u lični prostor za rad, pretragu, komunikaciju, vijesti i muziku. Namijenjena je ličnoj upotrebi autora i javnom objavljivanju.

Radni slogan: **Tvoj prostor, svaki novi tab.** Dostupnost imena, domena i žiga nije provjerena.

## Dogovoreni pravac

- Bez vlastitog aplikacionog servera i baze.
- Podešavanja, raspored, radni prostori i sačuvani sadržaji čuvaju se lokalno u browseru.
- Gmail i Google Calendar povezuju se direktno preko Google OAuth autorizacije i zvaničnih API-ja.
- Povezivanje servisa je opciono; osnovna stranica radi bez prijave.
- Bijela/light tema je osnova novih vizuelnih koncepata; proizvod zadržava light i dark temu sa istim funkcijama.
- Javni proizvod se priprema za Chrome Web Store; prvo se razvija i provjerava lokalno.
- Bez vlastitog servera ne znači bez interneta, Google Cloud konfiguracije, provjera aplikacije ili mogućih troškova tuđih API-ja.

## Planirane funkcije

| Oblast | Predloženi obim |
|---|---|
| Početna stranica | Widgeti koji se uključuju, premještaju i prilagođavaju; svijetla i tamna tema |
| Pretraga | OTKAZANO prema korisnikovoj izmjeni: uklonjeni search UI, prečica i dozvole; ne vraćati bez naloga |
| Tabovi | Pregled, aktiviranje i grupisanje stvarnih Chrome tabova po originu |
| Gmail | Nepročitane poruke, naslovi, pošiljaoci, pretraga i otvaranje poruke u Gmailu |
| Kalendar | Današnji raspored, naredni događaj, otvaranje sastanka; zatim kreiranje događaja uz posebnu dozvolu |
| Vijesti | RSS izvori, hronološki naslovi, izbor izvora i čuvanje članaka |
| Društveni servisi | X i Instagram: istražiti podržane načine prikaza; lični feed nije potvrđen |
| Muzika | Spotify i SoundCloud playeri za linkove pjesama, playlista i podcasta koje servis podržava |
| Kontrola YouTube taba | Istražena mogućnost lokalnog daljinskog upravljanja postojećim tabom; [nalaz i provjere](docs/youtube-kontrola.md). Prototip je prijedlog, ne implementirana funkcija. |
| Objedinjeni mediji | Korisnik želi kontrolu svih medijskih tabova: osnovni mute/otvaranje i napredne kontrole prema otkrivenim mogućnostima sajta. Implementiran lokalni panel i standardni DOM adapter; automatizovane provjere prolaze, stvarna Chrome matrica još preostaje. Univerzalna podrška nije garantovana. |
| Brze veze | Korisnički linkovi za ostale servise |
| Prenos podataka | Verziran izvoz i uvoz lokalnih podešavanja bez tokena |

### Grupisanje po originu

Početno pravilo koristi kombinaciju protokola, hosta i porta (`URL.origin`). `https://mail.google.com` i `https://calendar.google.com` čine odvojene grupe. Grupisanje se prvo pokreće ručno, u trenutnom prozoru, uz pregled rezultata. Treba definisati ponašanje postojećih grupa, zakačenih tabova i internih Chrome stranica. Automatsko grupisanje, spajanje poddomena i korisnička pravila dolaze kasnije.

### Prostori i muzika

Predloženi prostori su **Rad**, **Vijesti** i **Muzika**. Korisnik bira raspored i vidljive module. Poseban mali prozor playera treba provjeriti kao način da muzika nastavi nakon zatvaranja novog taba i da više tabova ne pokrene više playera.

## Prihvaćena tehnička osnova

- **WXT + React + TypeScript**, sa Vite build osnovom i Chrome Manifest V3.
- **pnpm** za upravljanje paketima; konkretne verzije zabilježiti pri inicijalizaciji i sačuvati lockfile.
- **CSS Modules + CSS varijable** za stilove i semantičke tokene light/dark tema.
- Pristupačni UI primitivi za dijaloge, menije i izbore; konkretnu biblioteku odabrati prema potrebama, bez unaprijed obavezne zavisnosti.
- Glass efekat kroz CSS prozirnost, `backdrop-filter`, obrube i sjenke, sa podesivim intenzitetom i neprozirnom alternativom. Isti raspored i funkcije u obje teme. Konačan materijal još nije potvrđen.
- Zapakovan lokalni kod ekstenzije; kompatibilnost ugrađenih playera sa CSP/MV3 provjeriti prototipom.
- `chrome.storage.local` za podešavanja; IndexedDB samo ako količina lokalnih podataka to opravda.
- Service worker za Chrome događaje i koordinaciju; bez pretpostavke da stalno radi u pozadini.
- `chrome.identity` za Google autorizaciju; nikakve serverske tajne u paketu ekstenzije.
- Odvojeni moduli za UI, lokalno skladište, upravljanje tabovima i svaku integraciju.
- Najmanje potrebne dozvole, dodatne dozvole u trenutku uključivanja funkcije gdje API to podržava.
- Autorizacioni tokeni i sadržaj pošte ne ulaze u izvoz, logove ili repozitorijum.

Korisnik je prihvatio ovaj stack 21. oktobra 2026. Istog dana inicijalizovani su WXT 0.21.4, React/ReactDOM 19.3.1, TypeScript 5.9.3 i pnpm 12.14.0; Vite 8.3.4 dolazi kroz WXT. Nativni HTML dialog/select/checkbox koriste se kao UI primitivi, uz Phosphor ikone i sistemski font. Lockfile postoji. Produkcioni lokalni izlaz je `build/chrome-mv3`.

### Redoslijed početne implementacije

1. WXT osnova koja se učitava kao ekstenzija i zamjenjuje novi Chrome tab.
2. Izabrani Modularni atelje raspored, light/dark teme i podesivi glass efekat.
3. Stvarni tabovi i ručno grupisanje po originu, bez search polja.
4. Lokalno čuvanje podešavanja i provjera ponovnog otvaranja i više tabova.
5. Google Calendar, Gmail i muzički servisi kao odvojene integracije prema fazama ispod.

Otvorene provjere Google autorizacije i playera vode se u TAB-02, ali ne blokiraju nezavisnu lokalnu osnovu i rad sa tabovima. Svaka integracija mora ispuniti svoje preduslove prije povezivanja. Inicijalizacija i implementacioni obim evidentirani su u progresu; provjera učitane ekstenzije ostaje zaseban kriterijum.

## Faze i kriterijumi završetka

| ID | Faza | Kriterijum završetka | Status |
|---|---|---|---|
| TAB-01 | Repozitorijum i plan | Lokalni Git i ovaj dokument postoje | ZAVRŠENO |
| TAB-02 | Specifikacija i tehnička provjera | Istraživanje i pravila postoje, raspored i WXT stack prihvaćeni; preostaju konačan materijal/obim i tehničke provjere integracija | U TOKU |
| TAB-03 | Osnova ekstenzije i UI | Ekstenzija se lokalno učitava i zamjenjuje novi tab; radi prilagodljiv osnovni raspored i tema | U TOKU |
| TAB-04 | Tabovi i grupisanje | Pregled/aktiviranje/zatvaranje i ručno grupisanje po originu; search i bookmark pretraga uklonjeni iz obima | U TOKU |
| TAB-05 | Google Calendar | Stvarna autorizacija, prikaz događaja, prazna stanja, greške i odspajanje rade; posebno provjeren unos događaja ako se uključi | U TOKU |
| TAB-06 | Gmail | Stvarna autorizacija, pregled i pretraga rade; definisan postupak Google verifikacije za javno izdanje | PLANIRANO |
| TAB-07 | Muzika | Spotify i SoundCloud rade za podržani sadržaj; provjereni prijava, ograničenja reprodukcije i životni ciklus playera | PLANIRANO |
| TAB-07-A | Objedinjena kontrola medijskih tabova | Odobrena implementacija u novom chatu: otkrivanje izvora, izbor taba, mute/unmute i podržane play/pause/volume/seek kontrole, opcione dozvole i jasni fallback prikazi | U TOKU |
| TAB-08 | Vijesti | Dodavanje RSS izvora, čitanje naslova, greške i lokalno čuvanje članaka rade | PLANIRANO |
| TAB-09 | X i Instagram | Dokumentovana podrška, cijena i autorizacija; implementirane samo potvrđene mogućnosti | PLANIRANO |
| TAB-10 | Personalizacija i prenos | Raspored ostaje sačuvan; validirani izvoz i uvoz rade; pristupačnost i tastatura provjereni | U TOKU |
| TAB-11 | Priprema javnog izdanja | Pregled dozvola i privatnosti, potrebne Google provjere, provjera paketa i materijali za prodavnicu | PLANIRANO |
| TAB-12 | Objavljivanje | Posebno odobrena i predata verzija; status pregleda i objave evidentiran | PLANIRANO |

TAB-02 obuhvata ranu provjeru Gmail uslova iako njegova implementacija dolazi kasnije. Muzički i društveni moduli ne treba da blokiraju rad osnovne stranice. Planirane faze nisu izvršene ovim dokumentom.

## Predložena prva upotrebljiva verzija

Novi tab, brze veze, pregled i grupisanje tabova, lokalno čuvanje rasporeda i kalendar. Gmail, muzika i vijesti slijede kroz zasebne cjeline. X i Instagram zavise od tehničke provjere i dostupnih zvaničnih mogućnosti.

## Dodatne ideje za kasnije

### Odobreni sljedeći korak — TAB-07-A

Korisnik je 21. oktobra 2026. naložio dodavanje playera i početak implementacije u novom chatu. Prvo implementirati lokalni modul „Mediji“ za postojeće tabove, bez vlastitog servera: otkrivanje zvuka na nivou taba, izbor izvora, mute/unmute i otvaranje izvornog taba; zatim standardni HTML audio/video adapter sa stvarno podržanim play/pause, volume i seek kontrolama. Pauzirani otkriveni izvori ostaju dostupni. Dozvole su opcione po sajtu, kontrola ne pokreće drugi player i ne utiče automatski na ostale tabove ili pozive. Detalji i rubna stanja su u `docs/youtube-kontrola.md`.

Ovo je odobren ogranak TAB-07 koji može početi prije Google integracija jer ne zavisi od njih. Ne znači da je cijeli TAB-07 završen. Spotify embed i OAuth PKCE ostaju zasebne mogućnosti bez obaveznog vlastitog backend-a; provjeriti aktuelne uslove, Premium i javne kvote prije zavisne implementacije. X povezivanje nije dio player zadatka. Nema odobrenja za server, plaćene resurse, commit/push ili objavu.

- Pronalaženje duplih tabova uz pregled prije zatvaranja.
- Čuvanje sesije kao skupa URL-ova i ponovno otvaranje.
- Komandna paleta i prečice na tastaturi.
- Lokalne bilješke, zadaci i fokus režim.
- Pravila grupisanja po projektu ili domenu.

## Otvorene odluke i ograničenja

- Da li Gmail u prvoj integraciji samo čita i pretražuje ili kasnije dobija radnje nad porukama?
- Kalendar prvo podržava samo pregled primarnog kalendara; unos događaja je kasniji zaseban obim.
- Koji RSS izvori i jezici ulaze u početnu ponudu?
- Da li je poseban prozor playera prihvatljiv kao glavni način trajne reprodukcije?
- X API može imati troškove; puni lični X/Instagram feed nije obećana funkcija.
- Spotify reprodukcija zavisi od naloga, sesije, sadržaja i pravila servisa; puni playback nije unaprijed garantovan.
- Lokalni podaci mogu biti izgubljeni uklanjanjem ekstenzije; potreban je jasan izvoz i uvoz.
- Nema ugrađenog zajedničkog tajnog API ključa za javnu ekstenziju.
- Chrome je početna platforma; drugi browseri nisu dio prve verzije.

## Provjera kvaliteta

Po fazama provjeravati tipove, build, relevantni lint i stvarno ponašanje učitane ekstenzije. Integracije provjeravati stvarnom autorizacijom, uključujući odbijene dozvole, istek sesije, odspajanje, offline režim i prazne rezultate. Provjeriti tastaturu, fokus, kontrast, različite širine i više otvorenih novih tabova. Prema korisnikovom nalogu od 22. oktobra 2026. (TAB-02-T), pisanje novih testova, proširivanje postojećih i dodavanje automatizovanih QA/test skripti ili test infrastrukture odloženi su za završnu fazu projekta. Tada testove napisati objedinjeno za završene funkcionalnosti. Postojeće testove sačuvati i pokretati po potrebi; typecheck, lint, build i odgovarajuće ručne provjere ostaju dio rada.

## Referentna dokumentacija

- [WXT — inicijalizacija](https://wxt.dev/guide/installation.html)
- [WXT — entrypoints](https://wxt.dev/guide/essentials/entrypoints.html)
- [Re-newtab — referentni proizvod](https://chromewebstore.google.com/detail/re-newtab/ccfjmnfklnaofoggkolocloghafpoccc?hl=en)
- [Chrome Identity](https://developer.chrome.com/docs/extensions/reference/api/identity)
- [Chrome tabGroups](https://developer.chrome.com/docs/extensions/reference/api/tabGroups)
- [Chrome Search](https://developer.chrome.com/docs/extensions/reference/api/search)
- [Gmail dozvole](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Google restricted scope verifikacija](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
- [Google Calendar događaji](https://developers.google.com/workspace/calendar/api/v3/reference/events/list)
- [Spotify Embed](https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api)
- [SoundCloud Widget](https://developers.soundcloud.com/docs/api/html5-widget.html)
- [X Developer Platform](https://docs.x.com/overview)
- [Chrome MV3 pravila](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements)

## Trenutno stanje i naredni korak

Aktuelno (22. oktobar 2026): Radna konzola prema korisnikovoj izabranoj slici je implementirana i sintetički provjerena u TAB-03-E. Raniji Modularni atelje ostaje dostupan kao prilagodljivi režim. Postoji lokalna WXT osnova sa light/dark/sistemskim temama, opcionim glass efektom i neprozirnom osnovom. Postoje Chrome adapteri za tabove i pregled origin grupisanja; search je naknadno uklonjen, kao i lokalno čuvanje vidljivosti modula i izgleda. Konačan glass materijal nije potvrđen. Typecheck, lint, 13 testova i produkcioni build prolaze; HTTP UI pregled je provjeren na više širina u obje teme. Stvarna provjera učitane ekstenzije još nije potvrđena, pa TAB-03/TAB-04 ostaju U TOKU. Tehničke provjere integracija ostaju otvorene. [Evidencija progresa](docs/progres.md) prati izvršene korake i preostalo.

Git repozitorijum je na grani `main`, sa početnim commitom `095f865`. Postoje aplikacioni kod, instalirane zavisnosti, lockfile, README i [izvještaj provjere](docs/provjere/izvjestaj.md). Prethodna implementacija je commitovana; commit `6b6f5a4` uspješno je poslat na `origin/main` 22. oktobra 2026. Nova Radna konzola (TAB-03-E), dokumentacija i sintetički QA materijali komitovani su kao `72c479c` i poslati na origin/main u TAB-01-C. Remote `origin` je `https://github.com/Ma5ha/extension.git` (22. oktobar 2026); objava nije izvršena. Korisnik je odložio svoje ručne Chrome provjere i naložio početak TAB-05-A. Read-only agenda je implementirana; naredni preduslov za stvarne događaje je Google Cloud OAuth klijent vezan za ID ekstenzije, prema `docs/google-calendar.md`. Provjere tabova i medija ostaju neizvršene.

21. oktobar 2026: nakon izbora trećeg light rasporeda, ugrađenim ImageGen alatom napravljena je [glass varijanta](docs/ui-koncepti/rasporedi-light/modularni-atelje-glass.png), sa izabranom slikom stvarno priloženom kao edit target. Prompt: sačuvati raspored, light/dark izbor i sadržaj; dodati prozirne bijele panele, blag blur, difuznu plavo-ljubičastu pozadinu i čitljiv taman tekst; ispraviti kontradiktoran Gmail tekst. Vizuelno pregledano: raspored je sačuvan i stakleni materijal vidljiv. Nije mjeren kontrast niti implementiran efekat. U razradi smanjiti ugniježđene obrube redova. AGENTS.md usklađen sa izborom rasporeda. TAB-02 ostaje u toku.

21. oktobar 2026: na korisnikov nalog istražene su UI reference i napisane projektne upute. Pregledani su autorski izvori, browser prikazi referenci i smjernice pristupačnosti. Nije urađena implementacija, prototipska provjera korisnika ili stvarna provjera integracija. TAB-02 ostaje u toku. Naredni korak je izrada vizuelnih koncepata i izbor cilja, uz tehničku provjeru Google integracija, playera i društvenih izvora.

21. oktobar 2026: generisana su i prikazana tri nezavisna ImageGen koncepta početnog radnog prostora, sa sintetičkim podacima. Redoslijed prikaza: 1 — [Mirna orbita](docs/ui-koncepti/mirna-orbita.png), 2 — [Dnevni studio](docs/ui-koncepti/dnevni-studio.png), 3 — [Večernji signal](docs/ui-koncepti/vecernji-signal.png). Generisane slike su sačuvane u repozitorijumu; nisu funkcionalni UI. Vizuelno pregledane: osnovna hijerarhija i raspored su prisutni. AI detalji nisu specifikacija: broj tabova nije usklađen sa prikazanim redovima, player prikazuje pause umjesto traženog početnog play stanja, a svijetli koncept miješa skriven sadržaj sa pozivom na povezivanje. Te detalje ispraviti u odabranoj razradi. Čeka se korisnikov izbor; nema implementacije ili provjere integracija. TAB-02 ostaje u toku.

21. oktobar 2026: korisniku odgovara estetika sva tri koncepta; tražio je druge rasporede na bijeloj osnovi i zadržavanje light/dark tema. Usklađeni su AGENTS.md i UI smjernice. Ugrađenim ImageGen alatom generisana su tri zasebna nova rasporeda uz prethodni Dnevni studio kao stvarno priloženu referencu. Redoslijed prikaza nove serije: 1 — [Bočni studio](docs/ui-koncepti/rasporedi-light/bocni-studio.png), 2 — [Otvoreni horizont](docs/ui-koncepti/rasporedi-light/otvoreni-horizont.png), 3 — [Modularni atelje](docs/ui-koncepti/rasporedi-light/modularni-atelje.png). Vizuelno pregledani: svi su light, imaju različitu strukturu i prikaz izbora teme. Broj tabova i početno play stanje su sada usklađeni. Preostala AI nedosljednost: Gmail prikazuje broj poruka i skriven sadržaj, ali i tekst za povezivanje; u implementaciji razdvojiti ta stanja. Ovo nisu funkcionalne integracije. Čeka se izbor rasporeda; dark razrada, prototip i tehničke provjere ostaju otvoreni.

### TAB-07-A — implementacija 21. oktobra 2026.

Implementirani su Mediji panel u desnoj koloni i prostoru Muzika, izbor medijskih tabova iz svih prozora, tab mute/otvaranje, opcioni pristup jednom HTTP/HTTPS hostu i standardni izolovani HTML audio/video adapter. Play/pause, jačina i seek rade kroz izabrani element i dokument; live seek po stvarnim opsezima. Izvor ne reprodukuje Tabora već postojeći tab. Nema servera, računa, stream ekstrakcije ili automatskog upravljanja drugim izvorima.

Status TAB-07-A ostaje U TOKU: implementacioni dio postoji i provjeren je automatizovano, ali kriterijum stvarne učitane Chrome ekstenzije nije potvrđen zbog zaključanog Mac-a. Potrebni su reload paketa i matrica u `docs/provjere/mediji.md`. Spotify/SoundCloud integracija ostaje zaseban TAB-07.

### TAB-05-A — odobren početak 21. oktobra 2026.

Korisnik traži nastavak bez svojih ručnih Chrome provjera. One ostaju evidentirane kao neizvršene. Aktuelni korak je read-only integracija primarnog Google kalendara: današnji događaji, naredni događaj, sastanci, autorizacija i odspajanje. Bez kreiranja događaja ili Gmail pristupa. OAuth klijent vezan za ID ekstenzije je spoljašnji preduslov.

TAB-05-A rezultat: implementirani Chrome Identity i Calendar adapter, današnja agenda, naredni događaj i Meet link, read-only scope, odspajanje, offline/istekla/odbijena autorizacija i greške. 30/30 testova, typecheck, lint bez upozorenja i build prolaze. Oba manifest načina provjerena automatizovano uz sintetički klijent; konačni paket nema OAuth klijenta. Stvaran OAuth i novi UI nisu provjereni u Chrome-u, pa cijela faza ostaje U TOKU. Uputstvo: [Google Calendar](docs/google-calendar.md).

### TAB-10-B — Bookmark widget

Odobreno: lokalna lista sačuvanih linkova u radnom prostoru. Dodavanje URL/naziv ili izbor otvorenog taba, uređivanje/uklanjanje, trajno lokalno čuvanje, sinhronizacija između Tabora stranica i podešavanje vidljivosti. Ne mijenja Chrome bookmark stablo i ne vraća pretragu. Status: ZAVRŠENO u implementacionom i automatizovano provjerenom obimu. Typecheck, lint bez upozorenja, 35/35 testova, build i diff provjera prolaze. Novi UI nije ručno potvrđen u Chrome-u; korisničke ručne provjere ostaju odložene. Cijeli TAB-10 ostaje U TOKU.

### TAB-10-C — isti bookmarkovi kao Chrome

Prethodni lokalni obim TAB-10-B zamijenjen prema korisnikovoj ispravci: widget direktno čita i mijenja Chrome bookmarkove uz opcionu bookmarks dozvolu. Lokalna lista se više ne koristi. Nema automatskog prebacivanja/brisanja starih lokalnih zapisa. Status: ZAVRŠENO u implementacionom i automatizovano provjerenom obimu; 36/36 testova, typecheck/lint/build i diff provjera prolaze. Stvarni Chrome tok ostaje ručno nepotvrđen.

### Odobrene nadogradnje poslije istraživanja — 21. oktobar 2026.

- TAB-10-D: Chrome folderi, sklopivi prikaz, izbor ciljnog foldera, premještanje i potvrđeno otvaranje svih web linkova foldera.
- TAB-04-B: lokalne imenovane sesije tabova, pregled prije otvaranja, bez zatvaranja trenutnih tabova, prikaz djelimičnih rezultata.
- TAB-10-E: lokalne bilješke i do tri dnevna zadatka sa označavanjem završenosti.
- TAB-10-F: čuvanje kolone, redoslijeda i veličine widgeta; eksplicitan režim uređivanja, prevlačenje i tastaturne kontrole. Modularni atelje ostaje početni raspored.
- TAB-10-G: Chrome bočni panel za iste bookmarkove i medijske kontrole, uz dijeljenje lokalnih podataka i podešavanja.

Svi navedeni zadaci su implementirani i provjereni automatizovano; stvarni Chrome tokovi i nativni sidepanel ostaju nepotvrđeni. Ovo odobrenje ne obuhvata server, pretragu, društvene integracije, commit/push ili objavu.

### Rezultat nadogradnji — 21. oktobar 2026.

TAB-10-D/E/F/G i TAB-04-B su ZAVRŠENI u implementacionom i automatizovano provjerenom obimu: Chrome folderi/odabir/premještanje/otvaranje; lokalne sesije sa pregledom; bilješke i tri dnevna zadatka; raspored/širine kolona/minimalne visine; pravi sidepanel entrypoint, action i background. Testovi: 45/45, typecheck, lint bez upozorenja, produkcioni build. Automatski HTTP UI pregled sa sintetičkim Chrome API-jima prolazi u obje teme na 1440/1024/320 i sidepanel 360 px, uključujući prevlačenje, tastaturu, čuvanje i zajedničke podatke. Nije potvrda stvarnih Chrome dozvola ili nativnog panela. Detalji: [Radni prostor](docs/radni-prostor.md).

Cijeli TAB-04/TAB-10 ostaju U TOKU: odložene Chrome provjere, izvoz/uvoz i preostali kriterijumi nisu proglašeni završenim. Google OAuth klijent ostaje preduslov stvarnog kalendara. Nema novih naloga, servera, pretrage, commita/pusha ili objave.

### 22. oktobar 2026. — TAB-01-A: origin

ZAVRŠENO. Na korisnikov nalog dodat je `origin` sa URL-om `https://github.com/Ma5ha/extension.git`. Fetch i push URL provjereni komandom `git remote get-url`. Posljednji postojeći lokalni commit je `6b6f5a4`. Nije izvršen novi commit, fetch, push ili objava. Obim i statusi razvojnih faza ostaju isti; razvojni preduslovi ostaju navedeni iznad.

### 22. oktobar 2026. — TAB-01-B: prvi push

ZAVRŠENO (rezultat i provjera ispod). Korisnik je naložio push postojeće grane `main` na `origin`; planirana provjera je jednakost lokalnog i udaljenog HEAD-a i podešen upstream. Dokumentacioni zapisi ostaju lokalne necommitovane izmjene. Obim ne uključuje novi commit ili izdanje ekstenzije.

TAB-01-B rezultat — ZAVRŠENO: `git push --set-upstream origin main` uspješno je napravio granu `main` na GitHub-u. `git ls-remote --heads origin refs/heads/main`, lokalni HEAD i `origin/main` imaju isti hash `6b6f5a43fa73708d6b9b68fd6efa6857f6901c8a`; upstream je `origin/main`. Sva tri postojeća commita su poslata. PLAN.md i docs/progres.md ostaju lokalno izmijenjeni bez novog commita; nema izdavanja ekstenzije. Razvojni preduslovi ostaju nepromijenjeni.

### 22. oktobar 2026. — TAB-02-REV: ponovni izbor UI pravca

U TOKU. Prema najnovijoj korisnikovoj instrukciji, izgled i raspored Modularnog ateljea više nisu zatvoren izbor. Novi obim je istraživanje tri vidljivo različite hijerarhije i rasporeda postojećih funkcija, sa manjim vizuelnim opterećenjem i jasnijim prioritetom sadržaja. Izbor korisnika prethodi implementaciji. Light osnova, light/dark izbor, odsustvo searcha, lokalni model i postojeće funkcionalne granice ostaju. Raniji izbori ostaju istorijski zapis; nema naloga za novi commit, push ili objavu u ovom zadatku.

### 22. oktobar 2026. — TAB-03-E: odabrana Radna konzola

U TOKU. Korisnik je izričito izabrao priloženi izgled Radne konzole i naložio implementaciju u postojećoj ekstenziji. Cilj: bočna navigacija, kompaktna lista tabova i sesija u sredini, zadaci/bilješke/kalendar/Gmail/mediji desno. Bookmarkovi, sesije i bilješke dostupni su navigacijom. Postojeće lokalne podatke, funkcije, opcione dozvole i light/dark treba sačuvati. Prethodni raspored ostaje dostupan kao prilagodljivi režim, a nova konzola je osnovna. Izbor zamjenjuje dalju generaciju alternativa u TAB-02-REV.

TAB-03-E završni rezultat — ZAVRŠENO u implementacionom i sintetički provjerenom obimu. Novi osnovni izgled odgovara izabranoj Radnoj konzoli; stari raspored ostaje u podešavanjima. Typecheck, lint, 46 testova, produkcioni build i browser interakcije/raspon širina prolaze. Direktno vizuelno poređenje nakon korekcije gustine: `design-qa.md`, final result passed. Lokalni paket je obnovljen; naredni korisnikov korak je Reload u Chrome-u. Statusi TAB-03/TAB-04/TAB-05/TAB-07/TAB-10 ostaju uslovljeni ranije navedenim stvarnim Chrome/integracionim provjerama. Nema novog commita/push-a u ovom koraku.

### 22. oktobar 2026. — TAB-01-C: commit i push novog UI-ja

U TOKU. Na izričit korisnikov nalog komituje se i šalje pregledana Radna konzola sa sidebar navigacijom, bez searcha, uz testove, dokumentaciju i sintetičke QA artefakte. Odredište je postojeći origin/main. Kriterijum završetka: postojeći kod i artefakti u Git istoriji, uspješan push i jednakost lokalnog/udaljenog HEAD-a. Prethodne implementacione provjere prolaze; razvojni i integracioni obim se ne proširuje.

TAB-01-C završni rezultat — ZAVRŠENO: commit `72c479c` (`feat: redesign workspace with sidebar console`) kreiran i uspješno poslat na origin/main. Lokalni i udaljeni HEAD provjereni su kao `72c479cf73913892c8dfb70304de7b5cd0a2d11b`, radno stablo čisto nakon slanja. Završna evidencija ide u prateći dokumentacioni commit. Korisnikov nalog za commit/push je ispunjen; stvarne Chrome/integracione provjere i preostale razvojne faze ostaju otvorene prema planu.

### 22. oktobar 2026. — TAB-03-F: ikonice i Inter

U TOKU. Odobreni obim: stvarne ikonice uz web tabove/grupe i Chrome bookmarkove gdje su dostupne, fallback pri nedostupnosti, lokalno pakovan Inter font. Koristi se Chrome favicon API uz njegovu potrebnu `favicon` dozvolu, bez eksternog favicon servisa ili novih host dozvola. Postojeći sidebar i odsustvo searcha ostaju. Potrebne su provjere uspješnog/neuspješnog učitavanja, promjene izvora ikone, učitanog fonta i obje teme/užih širina; stvarni Chrome rezultat ostaje zasebna granica ako nije dostupan.

TAB-03-F rezultat — ZAVRŠENO u implementacionom i sintetički provjerenom obimu. Web tabovi/grupe i Chrome bookmarkovi koriste lokalni favicon prikaz uz rezervu i oporavak nakon promjene izvora; font je lokalni Inter Variable 4.1 sa OFL licencom. Dodata je potrebna favicon dozvola, bez novih host dozvola ili font/favicon CDN-a. Typecheck/lint/50 testova/build i prošireni UI QA prolaze. Doradu je korisnik naknadno naložio komitovati i poslati: commit `6953a84` uspješno je poslat na origin/main u TAB-01-D. Sljedeći korisnikov korak je Reload ekstenzije. Preostali stvarni Chrome/Google/player i drugi razvojni kriterijumi ostaju otvoreni.

### 22. oktobar 2026. — TAB-01-D: commit i push ikonica i fonta

U TOKU. Korisnik je izričito naložio commit i push, zatim otklanjanje prepreke izvršavanju. Stvarna putanja projekta ima završni razmak (`extension `); eksplicitna radna putanja omogućava komande bez preimenovanja foldera. Obim je postojeća TAB-03-F dorada: favicon prikaz, lokalni Inter, testovi, dokumentacija i sintetički QA materijali. Koraci: pregled izmjena i odgovarajuće provjere; lokalni commit; običan push na postojeći origin/main; potvrda udaljenog HEAD-a i završna evidencija. Početni HEAD je f647f12 na main.

TAB-01-D završni rezultat — ZAVRŠENO: stvarna putanja sa završnim razmakom omogućila je izvršavanje komandi. Commit `6953a84` (`feat: add Chrome favicons and bundled Inter font`) obuhvata 41 pregledani fajl; običan push na origin/main uspio je. Lokalni HEAD i `git ls-remote --heads origin refs/heads/main` potvrdili su isti hash `6953a84254c10713e3ccf977a5b819de499f4877`, uz čisto radno stablo. Ponovljene typecheck/lint/50 testova/build provjere prolaze. Ovaj završni zapis šalje se pratećim dokumentacionim commitom. Stvarni Chrome cache i raniji integracioni kriterijumi ostaju otvoreni; naredni korisnikov korak je Reload ekstenzije.

### 22. oktobar 2026. — TAB-07-B: opcioni video i plutajući mini-player

U TOKU. Korisnik je naložio implementaciju prethodno razmotrenog playera. Obim: postojeći izvori i jedne zajedničke kontrole, pomjerljiv/promjenljiv mini-player unutar Tabore, Document Picture-in-Picture kontrole iznad drugih prozora i uključivanje/isključivanje izvornog video PiP prikaza gdje je podržan. Video ostaje izvorni HTML video u njegovom tabu, bez kopiranja streama ili druge reprodukcije. Podrazumijevan je prikaz kontrola bez videa. Kontrole žive iznad navigacionih prikaza, stanje se osvježava i dok je Tabora u pozadini a PiP otvoren. Pretraga, serveri, nove dozvole, autoplay i commit/push nisu dio ove izmjene. Koraci: zajednički controller i prikaz; životni ciklus/plutanje; bezbjedno video PiP ciljanje; automatizovane provjere i sintetički UI pregled u obje teme, sa jasno evidentiranim stvarnim Chrome granicama.

TAB-07-B rezultat — ZAVRŠENO u implementacionom i sintetički provjerenom obimu: zajednički controller i izbor izvora, pomjerljiv/promjenljiv mini-player sa tastaturnim alternativama, Document PiP kontrole sa praćenjem teme i osvježavanjem iz pozadine, izvorni video PiP sa provjerom podrške i bez autoplay-a. Typecheck, lint bez upozorenja, 57/57 testova i build prolaze. Fokusirani browser QA i postojeći regresioni pregled konzole/bočnog panela prolaze. Document PiP prozor i video komande provjereni su simulacijom; stvarni sistemski PiP, YouTube/ostali servisi, puna accessibility i stvarni browser zoom ostaju neprovjereni. Uputstvo: docs/mini-player.md; sintetički dokazi: docs/provjere/mini-player/. Naredni korisnikov korak je Reload ekstenzije i probni izvor. Nema novih dozvola, zavisnosti, servera ili commit/push-a.

### 22. oktobar 2026. — TAB-01-E: commit i push mini-playera i uputa

U TOKU. Korisnik je naložio commit i push svih pripremljenih izmjena: TAB-07-B mini-player i video/Document PiP kontrole, prateća dokumentacija/sintetički QA i TAB-02-T pravilo odlaganja pisanja testova. Testovi i QA skripte u ovom paketu nastali su prije tog pravila; sada se novi testovi ne pišu. Prethodne provjere istog implementacionog koda prolaze (57/57, typecheck/lint/build, fokusirani i regresioni UI pregled); nakon njih mijenjana je samo dokumentacija. Koraci: pregled i staging, commit, običan push na postojeći origin/main, potvrda udaljenog HEAD-a i završna evidencija. Početni HEAD je d33af38.

TAB-01-E rezultat — ZAVRŠENO: commit `08274a8` (`feat: add floating media controls and optional video PiP`, 34 fajla) uspješno je poslat običnim pushom na origin/main. Lokalni i udaljeni HEAD potvrđeni su kao `08274a8bcfa307c68344a030f4e84ef6ccd88b84`; radno stablo nakon slanja čisto. Paket uključuje TAB-07-B i TAB-02-T; novi testovi nisu pisani tokom ovog Git zadatka. Završna evidencija šalje se pratećim dokumentacionim commitom. Sljedeći korisnikov korak ostaje Reload ekstenzije i provjera stvarnih PiP izvora; razvojni kriterijumi ostaju kako su prethodno evidentirani.

### 22. oktobar 2026. — TAB-03-G: prozirne kartice i bookmark stablo

U TOKU. Početno čisto stablo na 26b0792. Obim: suptilan linearni gradijent, tematske prozirne kartice, stvarna hijerarhija Chrome foldera sa disclosure kontrolama i tastaturom, engleski tekst bookmark interfejsa i kratki prelazi uz reduced motion. Koraci: web istraživanje; prikaz i tekstovi; typecheck/lint/build i ručni browser pregled. Bez novih testova/QA skripti, dozvola, zavisnosti ili commit/push-a.

TAB-03-G rezultat — implementacija i typecheck/lint/build ZAVRŠENI; ručna provjera djelimična. Promijenjeni theme/App stilovi daju linearni light/dark gradijent i prozirne kartice, uključujući kompaktne dnevne module; kratki ulazni/hover/disclosure prelazi poštuju reduced motion. BookmarkPanel prikazuje stvarnu ugniježđenu hijerarhiju i prazne foldere, nativne disclosure kontrole sa tastaturom, postojeće create/edit/remove/move forme i potvrdu otvaranja foldera uključujući podfoldere. Engleski bookmark tekstovi i statusi, originalni korisnički nazivi ostaju.

Provjere: corepack pnpm typecheck, lint i build prolaze nakon završne korekcije; git diff --check prolazi. Nisu pisani novi testovi ili QA skripte. Ručno u Chrome-u na HTTP prikazu pregledani light/dark kartice i gradient, navigacija i englesko denied stanje Bookmarks; početni IAB nije dosegao localhost, Chrome 127.0.0.1 prikaz jeste. Popunjeno stablo i Chrome CRUD/dozvole, uske širine, stvarni zoom, tastatura i reduced-motion nisu izvršno potvrđeni; ne tvrdi se puna accessibility usklađenost. Lokalni paket build/chrome-mv3 spreman je za Reload. Sljedeći korak: pregled učitane ekstenzije sa stvarnim folderima i dovršetak ručne matrice. Bez novog commita/push-a/objave. TAB-03 i ostale razvojne faze ostaju U TOKU prema ranijim kriterijumima.

### 22. oktobar 2026. — TAB-02-U: vrijeme pisanja izvještaja

ZAVRŠENO. Prema korisnikovom nalogu, izvještaj se priprema prije push-a, odnosno na kraju svake sesije ako push nije dio rada. AGENTS.md nalaže uključivanje izvještaja u isti odobreni Git korak, bez dodatnog dokumentacionog commit/push-a radi naknadnog izvještaja; ishod push-a ide u završni odgovor. Dokumentaciona izmjena, bez promjene razvojnih faza ili odobrenja za Git upise.

### 22. oktobar 2026. — TAB-01-F: slanje kartica i bookmark stabla

U TOKU. Korisnik je odobrio commit/push pripremljenog TAB-03-G i TAB-02-U paketa na origin/main. Pregled svih 11 fajlova i završni typecheck/lint/build/diff --check prolaze. Izvještaj je pripremljen prije slanja prema novom pravilu; ishod Git radnji ide u završni odgovor. Preostale ručne UI provjere i razvojni kriterijumi ostaju otvoreni.

### 22. oktobar 2026. — TAB-07-C: kompaktniji media player

U TOKU. Korisnik traži manje i grupisanije kontrole i izbor izvora u jednoj selekt kartici. Početno stablo čisto. Koraci: objediniti naslov izvora i select, grupisati transport/progres/jačinu, skloniti sporedne prikaze u sklopivi dio; typecheck/lint/build i raspoloživi ručni pregled. Postojeće komande i PiP ostaju. Bez novih testova, zavisnosti ili commit/push-a.

TAB-07-C rezultat — implementacija ZAVRŠENA; ručna provjera djelimična. MediaContent objedinjuje ikonicu, native select izvora i status u jednu karticu bez duplog naslova. Transport 40px, progres/vremena i horizontalna jačina su grupisani sa manjim razmacima; sekundarni mini-player/Document PiP izbori su u disclosure „Prikaz playera“. MediaPanel CSS ograničava široki prikaz na 620px; floating sadržaj ima manje unutrašnje margine. Komande, dozvole, player izbor i video PiP ostaju postojeći.

Provjere: corepack pnpm typecheck/lint/build prolaze, git diff --check prolazi. Ručno u Chrome HTTP prikazu pregledani sidebar preview i samostalni panel, light/dark i otvaranje „Prikaz playera“. HTTP nema stvarne izvore: aktivna selekt kartica/transport, nativni PiP, uske širine/zoom/tastatura i reduced motion nisu izvršno potvrđeni. Bez novih testova/QA skripti ili zavisnosti. Lokalni build spreman za Reload; naredni korak pregled sa stvarnim izvorom u učitanoj ekstenziji. Nema commita/push-a po ovom nalogu.

TAB-01-F naknadna evidencija u narednoj sesiji — ZAVRŠENO: prethodni commit 22665c0 poslat je na origin/main i jednakost HEAD-a potvrđena u završnom odgovoru; ovaj zapis ne pokreće novi commit/push.

### 22. oktobar 2026. — TAB-01-G: slanje kompaktnog playera

U TOKU. Korisnik je odobrio commit i push TAB-07-C dorade na origin/main. Pregledano pet izmijenjenih fajlova: MediaContent, panel/floating stilovi, plan i progres; git diff --check prolazi. Prethodni typecheck/lint/build istog koda prolaze, ručno pregledani HTTP panel i disclosure u obje teme. Nema naknadnih promjena koda, novih testova, zavisnosti ili dozvola. Stvarni aktivni izvor/PiP i preostala ručna matrica ostaju otvoreni. Izvještaj je pripremljen prije slanja; slijede commit, običan push i provjera udaljenog HEAD-a, čiji ishod ide u završni odgovor bez dodatnog dokumentacionog commita.

### 22. oktobar 2026. — TAB-07-D: kartice kontrola i prilagođeni klizači

U TOKU. Korisnik traži izraženiji kartični izbor, ikonice uz mute/open i ljepše klizače/scrollbar. Tumačenje: kartica izvora i Prikaz playera, grupisane akcije, CSS stil nativnih range i scrollbar kontrola. Koraci: prikaz i semantički tokeni; typecheck/lint/build; ručni pregled u raspoloživom obimu. Bez novih dozvola, biblioteka, testova ili commit/push-a.

TAB-07-D rezultat — implementacija ZAVRŠENA, ručna matrica djelimična. Izvor dobija karticu sa jasnim obrubom, hover/focus stanjem i caret ikonom; Prikaz playera je sklopiva kartica sa ikonama. Mute/unmute i otvaranje taba imaju odgovarajuće ikone u zajedničkoj površini, premotavanje koristi rotacione ikone. Globalni nativni range klizači imaju prilagođenu traku/thumb, media progres i jačina procentualnu ispunu; globalni scrollbar koristi tematske tokene. Nema JS scroll zamjene ili nove biblioteke; tastatura i forced-colors alternativa sačuvani.

Typecheck, lint i produkcioni build prolaze; git diff --check prolazi. Ručno u Chrome HTTP prikazu pregledani light/dark kartica Prikaz playera i otvaranje Enter tasterom. Aktivni izvor, nove akcione ikone i media klizači, scrollbar pri prelivu, uske širine/zoom i forced-colors/reduced-motion nisu izvršno potvrđeni. Paket spreman za Reload i pregled sa stvarnim izvorom. Bez novih testova/QA skripti ili commit/push-a.

TAB-01-G naknadna evidencija u narednoj sesiji — ZAVRŠENO: prethodni commit e53c763 poslat je na origin/main i udaljeni HEAD potvrđen u završnom odgovoru; ovaj zapis ne odobrava nove Git radnje.

### 22. oktobar 2026. — TAB-01-H: slanje kartica i klizača

U TOKU. Korisnik je odobrio commit/push TAB-07-D paketa na origin/main. Pregledano svih pet izmijenjenih fajlova i diff --check prolazi. Prethodni typecheck/lint/build istog koda prolaze; poslije provjera mijenjana je samo evidencija. Ručno pregledana kartica u obje teme i Enter otvaranje. Aktivni izvor/klizači/scrollbar pri prelivu i ostala ručna matrica ostaju otvoreni. Bez novih testova, zavisnosti, dozvola ili privatnih podataka. Izvještaj pripremljen prije slanja; slijede commit, običan push i potvrda udaljenog HEAD-a. Ishod ide u završni odgovor bez dodatnog dokumentacionog commita.
