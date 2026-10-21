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
| Pretraga | Web pretraga preko podrazumijevanog pretraživača; direktni rezultati za otvorene tabove i bookmarkove; naknadno Gmail |
| Tabovi | Pregled, pretraga, aktiviranje i grupisanje stvarnih Chrome tabova po originu |
| Gmail | Nepročitane poruke, naslovi, pošiljaoci, pretraga i otvaranje poruke u Gmailu |
| Kalendar | Današnji raspored, naredni događaj, otvaranje sastanka; zatim kreiranje događaja uz posebnu dozvolu |
| Vijesti | RSS izvori, hronološki naslovi, izbor izvora i čuvanje članaka |
| Društveni servisi | X i Instagram: istražiti podržane načine prikaza; lični feed nije potvrđen |
| Muzika | Spotify i SoundCloud playeri za linkove pjesama, playlista i podcasta koje servis podržava |
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

Korisnik je prihvatio ovaj stack 21. oktobra 2026. To je donesena tehnička odluka; aplikacija i zavisnosti još nisu inicijalizovani.

### Redoslijed početne implementacije

1. WXT osnova koja se učitava kao ekstenzija i zamjenjuje novi Chrome tab.
2. Izabrani Modularni atelje raspored, light/dark teme i podesivi glass efekat.
3. Stvarni tabovi, pretraga i ručno grupisanje po originu.
4. Lokalno čuvanje podešavanja i provjera ponovnog otvaranja i više tabova.
5. Google Calendar, Gmail i muzički servisi kao odvojene integracije prema fazama ispod.

Otvorene provjere Google autorizacije i playera vode se u TAB-02, ali ne blokiraju nezavisnu lokalnu osnovu i rad sa tabovima. Svaka integracija mora ispuniti svoje preduslove prije povezivanja. Prihvatanje stacka i zapis plana u ovom zadatku ne predstavljaju izvršenu inicijalizaciju.

## Faze i kriterijumi završetka

| ID | Faza | Kriterijum završetka | Status |
|---|---|---|---|
| TAB-01 | Repozitorijum i plan | Lokalni Git i ovaj dokument postoje | ZAVRŠENO |
| TAB-02 | Specifikacija i tehnička provjera | Istraživanje i pravila postoje, raspored i WXT stack prihvaćeni; preostaju konačan materijal/obim i tehničke provjere integracija | U TOKU |
| TAB-03 | Osnova ekstenzije i UI | Ekstenzija se lokalno učitava i zamjenjuje novi tab; radi prilagodljiv osnovni raspored i tema | PLANIRANO |
| TAB-04 | Pretraga i tabovi | Web pretraga, tabovi i bookmarkovi rade; ručno grupisanje po originu je provjereno | PLANIRANO |
| TAB-05 | Google Calendar | Stvarna autorizacija, prikaz događaja, prazna stanja, greške i odspajanje rade; posebno provjeren unos događaja ako se uključi | PLANIRANO |
| TAB-06 | Gmail | Stvarna autorizacija, pregled i pretraga rade; definisan postupak Google verifikacije za javno izdanje | PLANIRANO |
| TAB-07 | Muzika | Spotify i SoundCloud rade za podržani sadržaj; provjereni prijava, ograničenja reprodukcije i životni ciklus playera | PLANIRANO |
| TAB-08 | Vijesti | Dodavanje RSS izvora, čitanje naslova, greške i lokalno čuvanje članaka rade | PLANIRANO |
| TAB-09 | X i Instagram | Dokumentovana podrška, cijena i autorizacija; implementirane samo potvrđene mogućnosti | PLANIRANO |
| TAB-10 | Personalizacija i prenos | Raspored ostaje sačuvan; validirani izvoz i uvoz rade; pristupačnost i tastatura provjereni | PLANIRANO |
| TAB-11 | Priprema javnog izdanja | Pregled dozvola i privatnosti, potrebne Google provjere, provjera paketa i materijali za prodavnicu | PLANIRANO |
| TAB-12 | Objavljivanje | Posebno odobrena i predata verzija; status pregleda i objave evidentiran | PLANIRANO |

TAB-02 obuhvata ranu provjeru Gmail uslova iako njegova implementacija dolazi kasnije. Muzički i društveni moduli ne treba da blokiraju rad osnovne stranice. Planirane faze nisu izvršene ovim dokumentom.

## Predložena prva upotrebljiva verzija

Novi tab, pretraga, brze veze, pregled i grupisanje tabova, lokalno čuvanje rasporeda i kalendar. Gmail, muzika i vijesti slijede kroz zasebne cjeline. X i Instagram zavise od tehničke provjere i dostupnih zvaničnih mogućnosti.

## Dodatne ideje za kasnije

- Pronalaženje duplih tabova uz pregled prije zatvaranja.
- Čuvanje sesije kao skupa URL-ova i ponovno otvaranje.
- Komandna paleta i prečice na tastaturi.
- Lokalne bilješke, zadaci i fokus režim.
- Pravila grupisanja po projektu ili domenu.

## Otvorene odluke i ograničenja

- Da li Gmail u prvoj integraciji samo čita i pretražuje ili kasnije dobija radnje nad porukama?
- Da li kalendar odmah podržava unos ili prvo samo pregled?
- Koji RSS izvori i jezici ulaze u početnu ponudu?
- Da li je poseban prozor playera prihvatljiv kao glavni način trajne reprodukcije?
- X API može imati troškove; puni lični X/Instagram feed nije obećana funkcija.
- Spotify reprodukcija zavisi od naloga, sesije, sadržaja i pravila servisa; puni playback nije unaprijed garantovan.
- Lokalni podaci mogu biti izgubljeni uklanjanjem ekstenzije; potreban je jasan izvoz i uvoz.
- Nema ugrađenog zajedničkog tajnog API ključa za javnu ekstenziju.
- Chrome je početna platforma; drugi browseri nisu dio prve verzije.

## Provjera kvaliteta

Po fazama provjeravati tipove, build, relevantni lint i stvarno ponašanje učitane ekstenzije. Integracije provjeravati stvarnom autorizacijom, uključujući odbijene dozvole, istek sesije, odspajanje, offline režim i prazne rezultate. Provjeriti tastaturu, fokus, kontrast, različite širine i više otvorenih novih tabova. Automatizovane testove planirati prema riziku pri implementaciji.

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

Aktuelno: korisnik je izabrao Modularni atelje (opcija 3 light serije) i prihvatio WXT/React/TypeScript, pnpm i CSS Modules sa varijablama. Glass materijal je novi prijedlog i čeka njegov sud; dark razrada i tehničke provjere ostaju otvorene. [Evidencija progresa](docs/progres.md) prati izvršene korake i preostalo.

Git repozitorijum je inicijalizovan na grani `main`. Postoje plan, osnovni `.gitignore`, [UI istraživanje](docs/ui-istrazivanje.md) i [pravila za agenta](AGENTS.md). Nema aplikacionog koda, instaliranih zavisnosti, commita, udaljenog repozitorijuma ili objave.

21. oktobar 2026: nakon izbora trećeg light rasporeda, ugrađenim ImageGen alatom napravljena je [glass varijanta](docs/ui-koncepti/rasporedi-light/modularni-atelje-glass.png), sa izabranom slikom stvarno priloženom kao edit target. Prompt: sačuvati raspored, light/dark izbor i sadržaj; dodati prozirne bijele panele, blag blur, difuznu plavo-ljubičastu pozadinu i čitljiv taman tekst; ispraviti kontradiktoran Gmail tekst. Vizuelno pregledano: raspored je sačuvan i stakleni materijal vidljiv. Nije mjeren kontrast niti implementiran efekat. U razradi smanjiti ugniježđene obrube redova. AGENTS.md usklađen sa izborom rasporeda. TAB-02 ostaje u toku.

21. oktobar 2026: na korisnikov nalog istražene su UI reference i napisane projektne upute. Pregledani su autorski izvori, browser prikazi referenci i smjernice pristupačnosti. Nije urađena implementacija, prototipska provjera korisnika ili stvarna provjera integracija. TAB-02 ostaje u toku. Naredni korak je izrada vizuelnih koncepata i izbor cilja, uz tehničku provjeru Google integracija, playera i društvenih izvora.

21. oktobar 2026: generisana su i prikazana tri nezavisna ImageGen koncepta početnog radnog prostora, sa sintetičkim podacima. Redoslijed prikaza: 1 — [Mirna orbita](docs/ui-koncepti/mirna-orbita.png), 2 — [Dnevni studio](docs/ui-koncepti/dnevni-studio.png), 3 — [Večernji signal](docs/ui-koncepti/vecernji-signal.png). Generisane slike su sačuvane u repozitorijumu; nisu funkcionalni UI. Vizuelno pregledane: osnovna hijerarhija i raspored su prisutni. AI detalji nisu specifikacija: broj tabova nije usklađen sa prikazanim redovima, player prikazuje pause umjesto traženog početnog play stanja, a svijetli koncept miješa skriven sadržaj sa pozivom na povezivanje. Te detalje ispraviti u odabranoj razradi. Čeka se korisnikov izbor; nema implementacije ili provjere integracija. TAB-02 ostaje u toku.

21. oktobar 2026: korisniku odgovara estetika sva tri koncepta; tražio je druge rasporede na bijeloj osnovi i zadržavanje light/dark tema. Usklađeni su AGENTS.md i UI smjernice. Ugrađenim ImageGen alatom generisana su tri zasebna nova rasporeda uz prethodni Dnevni studio kao stvarno priloženu referencu. Redoslijed prikaza nove serije: 1 — [Bočni studio](docs/ui-koncepti/rasporedi-light/bocni-studio.png), 2 — [Otvoreni horizont](docs/ui-koncepti/rasporedi-light/otvoreni-horizont.png), 3 — [Modularni atelje](docs/ui-koncepti/rasporedi-light/modularni-atelje.png). Vizuelno pregledani: svi su light, imaju različitu strukturu i prikaz izbora teme. Broj tabova i početno play stanje su sada usklađeni. Preostala AI nedosljednost: Gmail prikazuje broj poruka i skriven sadržaj, ali i tekst za povezivanje; u implementaciji razdvojiti ta stanja. Ovo nisu funkcionalne integracije. Čeka se izbor rasporeda; dark razrada, prototip i tehničke provjere ostaju otvoreni.
