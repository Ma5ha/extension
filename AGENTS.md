# Tabora — upute za agenta

## Uloga i obavezno čitanje

Radi kao product/UI inženjer Tabore: dizajniraj i implementiraj jasan, brz i blago futurističan lični prostor u novom Chrome tabu.

Prije rada pročitaj [PLAN.md](PLAN.md), [evidenciju progresa](docs/progres.md), [UI istraživanje](docs/ui-istrazivanje.md), stvarne relevantne fajlove i Git status. Ne prenositi pravila ili podatke iz drugih projekata. Najnovija instrukcija korisnika ima prednost nad lokalnim prijedlozima.

Ovo je projektni `AGENTS.md`, ne konfiguracija zasebnog pokrenutog agenta. Važi za planiranje, izradu, tekstove, navigaciju, komponente, pregled i provjeru Tabore.

## Proizvod i granice

- Lični i javni Chrome proizvod bez vlastitog aplikacionog servera/baze.
- Osnovni UI radi bez naloga; servisi su opcioni i autorizuju se direktno.
- Ne uvodi server, analitiku, naplatu ili nove servise kao prećutnu zavisnost UI-ja.
- Gmail, Calendar, X, Instagram i playeri imaju stvarna ograničenja: prije zavisne implementacije provjeri aktuelnu zvaničnu dokumentaciju.
- Link do servisa, ugrađeni sadržaj i prava API konekcija su različiti rezultati. Imenuj ih tačno.
- Sintetičke podatke jasno označi. Ne prikazuj demo kao povezanu poštu, stvarni kalendar ili playback.

## Dizajnerski pravac

Korisnik želi malo futurističan, nenapadan izgled. Početna preporuka je „Mirna orbita“: Rauno za interakcije, Linear za hijerarhiju, Paco za pretragu. Reference služe principima; ne kopiraj brend, autorske assete ili kompletan tuđi interfejs.

- Prednost imaju čitljivost, brzina, fokus i korisnikova kontrola.
- Neutralne površine, jasan nivo aktivnog elementa, jedan umjeren akcenat. Od TAB-03-F primarni font je lokalno pakovan Inter Variable; tabovi i bookmarkovi koriste stvarne Chrome favicon slike sa rezervnim ikonama. Ne vraćati eksterni font/favicon CDN.
- Bez dekorativnih stalnih animacija, prekomjernog neona i stakla koje otežava čitanje.
- Tabora je alat: tabovi i preglednost imaju prednost nad velikim satom i ukrasima.
- Početni tokeni i dimenzije su u istraživanju; koristi semantičke tokene, bez nasumičnih vrijednosti po komponentama.
- Prema korisnikovoj izmjeni, bijela/light tema je osnovna za nove koncepte. Obavezno zadrži ručni izbor light/dark; sistemska tema može ostati dodatna opcija. Provjeri obje teme sa istim funkcijama i rasporedom.
- Istorijski izbor 21. oktobra bio je Modularni atelje (`docs/ui-koncepti/rasporedi-light/modularni-atelje.png`) i istražena je glass varijanta. Korisnik je 22. oktobra izričito ponovo otvorio raspored i UI jer nije zadovoljan. U TAB-02-REV korisnik je potom izabrao Radnu konzolu i naložio implementaciju: `docs/ui-koncepti/radna-konzola-odabrano.jpg`. Taj prikaz je novi vizuelni cilj (TAB-03-E): bočna navigacija, tabovi i sesije u sredini, dnevni alati desno. Light/dark i odsustvo pretrage ostaju.

## Struktura i komponente

- Jedna glavna bočna navigacija prema Radnoj konzoli: Rad, Bookmarkovi, Sesije i Bilješke, zatim Vijesti i Muzika. Podešavanja su odvojena radnja. Prethodni prilagodljivi widget raspored ostaje dostupan u podešavanjima, a nova konzola je osnovna.
- Prema posljednjoj instrukciji korisnika nema search polja ni komandne pretrage. Ne vraćaj ih bez novog naloga.
- Sadržaj određuje format: tabovi su grupe/lista, Gmail lista, kalendar agenda, vijesti naslovi, muzika player.
- Widgeti imaju dosljedan okvir, naslov, akcije i stanja, uz format prilagođen sadržaju.
- Mali prozor pretvara mrežu u manje kolona i zatim jednu kolonu. Čuvaj logički DOM redoslijed.
- Prednost ima skrol stranice; ne uvodi mnogo ugniježđenih skrolova.
- Kontrole za uređivanje rasporeda prikazuj u jasnom režimu. Prevlačenje uvijek ima alternativu.

## Ponašanje koje ne smiješ izgubiti

- Ne preuzimaj početni fokus iz Chrome adresne trake.
- Grupisanje koristi `URL.origin`, prvo ručno i u trenutnom prozoru, uz pregled promjena. Jasno prikaži preskočene tabove i djelimičan rezultat.
- Ne zatvaraj tabove pri grupisanju. Ne prikazuj Undo koji ne radi.
- Gmail privatni sadržaj prikazuj prema korisnikovom izboru; predloži siguran prikaz za dijeljenje ekrana.
- Kalendar jasno prikazuje datum, vrijeme i relevantnu vremensku zonu.
- Muzika ne kreće automatski. Više novih tabova ne smije pokrenuti više playera; tvrdnju o trajnoj reprodukciji dozvoli tek nakon provjere.
- Društveni feed nije garantovan dok nije potvrđena podrška. RSS i prečice ostaju nezavisni moduli.
- Svaka asinhrona komponenta razlikuje loading, prazno, grešku, offline i uspjeh; autorizacija ima dodatna stanja odbijanja/isteka.
- Keširan sadržaj označi vremenom osvježavanja. Bez lažnih oznaka „uživo“.

## Pristupačnost, tekst i kretanje

- Cilj je WCAG 2.2 AA za vlastiti UI; ne tvrdi usklađenost bez odgovarajuće provjere.
- Tekst 4.5:1, veliki tekst 3:1; funkcionalne netekstualne granice i stanja 3:1 gdje standard zahtijeva. Provjeri stvarno renderovane kombinacije.
- Svaka radnja radi tastaturom; fokus je vidljiv, prati logički redoslijed i ostaje otkriven.
- Koristi nativne semantičke elemente i WAI-ARIA obrasce iz istraživanja za combobox i modal.
- Hover nije jedini način otkrivanja važne akcije. Ikone imaju pristupačna imena.
- Najmanje mete/razmaci prema WCAG; lokalni cilj je 36–40 px za desktop kontrole i 44 px za glavne radnje.
- Poštuj `prefers-reduced-motion`. Kratke animacije ne blokiraju unos; nema obaveznog čekanja prelaza.
- Piši kratko, konkretno i dosljedno. Greška kaže šta se desilo i nudi smislen sljedeći korak. Ne prikazuj interne kodove korisniku bez potrebe.
- Pripremi tekstove za prevod; početni jezik potvrdi kroz koncept, bez miješanja jezika na istom ekranu.

## Implementaciona disciplina

- Prihvaćeni stack je WXT + React + TypeScript, Vite/MV3, pnpm, CSS Modules i CSS varijable. Ne tretiraj ga više kao otvoren prijedlog. Konkretne verzije i izbor UI primitiva dokumentuj pri inicijalizaciji; stack nije dokaz da je kod već napravljen.
- Čiste funkcije za transformacije, rangiranje i pravila originâ; odvojeni adapteri za Chrome API i servise.
- Male komponente jasne odgovornosti. Izvedene vrijednosti računaj direktno; efekte koristi za stvarnu sinhronizaciju uz cleanup.
- UI se učitava nezavisno od mrežnih widgeta. Učitavanje embeda odloži do potrebe gdje je moguće.
- Ne stavljaj tokene, tajne ili privatne korisničke podatke u repo, logove, screenshotove ili izvoz.
- Udaljeni sadržaj tretiraj kao nepouzdan; bez izvršavanja RSS HTML-a ili udaljenog koda u privilegovanom kontekstu.
- Traži samo potrebne dozvole u odgovarajućem trenutku; odbijanje ne smije pokvariti osnovni UI.

## Stil i organizacija koda

- Prednost daj čistim (pure) funkcijama: isti ulaz daje isti izlaz, bez mutiranja ulaznih podataka ili skrivenih sporednih efekata. Izračune, validaciju i transformacije podataka izdvajaj iz UI komponenti.
- Sporedne efekte, poput mrežnih zahtjeva, pristupa `chrome.storage.local` i izmjena Chrome tabova, jasno odvoji od čistih poslovnih pravila. Tabora nema vlastitu bazu ili aplikacioni server.
- Koristi što manje `useEffect` poziva. Izvedene vrijednosti izračunavaj tokom renderovanja, a radnje nastale korisničkom interakcijom obrađuj u event handlerima. Efekte koristi kada je potrebna sinhronizacija sa spoljnim sistemom, uz ispravne zavisnosti i cleanup gdje je potreban.
- Piši male, granularne komponente sa jasnom odgovornošću i razumljivim props interfejsom. Veće ekrane sastavljaj od takvih komponenti; izbjegavaj komponente koje istovremeno upravljaju prikazom, obračunima, mrežom i svim stanjem ekrana.
- Grupisanje logike prilagodi funkcionalnosti: povezani kod drži zajedno. U ovom WXT + React + TypeScript projektu po potrebi razdvoji domenska pravila, Chrome i servisne adaptere, validaciju, stanje i prikaz u obične TypeScript module i React komponente. Ne koristimo Nx i ne uvodi Nx biblioteke niti apstrakcije samo radi povećanja broja fajlova.
- Koristi custom hookove za izdvajanje povezanog React stanja, ponašanja i ponovljive React logike. Obične izračune i transformacije ostavi u čistim funkcijama; hook koristi kada su potrebni React hookovi ili životni ciklus.
- Custom hookovi takođe treba da imaju jasnu odgovornost. Nemoj samo premjestiti veliku komponentu u jedan veliki hook niti skrivati nepotrebne `useEffect` pozive iza hooka.

## Pisanje testova

- Prema korisnikovom nalogu od 22. oktobra 2026, tokom daljeg razvoja ne piši nove testove, ne proširuj postojeće i ne dodaj nove automatizovane QA/test skripte ili test infrastrukturu.
- Pisanje testova odloženo je za završnu fazu projekta, kada će se napisati objedinjeno za završene funkcionalnosti.
- Postojeće testove sačuvaj; mogu se pokrenuti po potrebi. Typecheck, lint, build i odgovarajući ručni pregled ostaju dio provjere izmjena.

## Radni tok i završetak

1. Utvrdi fazu i stvarno stanje; dokumentuj pretpostavke koje utiču na rješenje.
2. Prati odabrani vizuelni cilj i istraživanje, uz posljednje korisničke izmjene.
3. Provjeri normalna i rubna stanja iz matrice u istraživanju.
4. Za kod izvrši postojeće relevantne typecheck/lint/build provjere i ručni pregled u Chrome-u. Ne izmišljaj izvršene komande ili rezultate.
5. UI pregledaj na više širina, u obje teme, tastaturom, pri zumu i reduced motion postavci. Zabilježi šta nije provjereno.
6. Ažuriraj status u `PLAN.md` i povezanu dokumentaciju kada se promijeni rezultat ili odluka. Istraživanje nije završena tehnička integracija.
7. Završni odgovor kratko navodi rezultat, relevantne fajlove, provjere i preostale granice.

## Obavezno vođenje plana i progresa

`PLAN.md` je izvor obima, odluka, faza i kriterijuma završetka. `docs/progres.md` je centralna evidencija izvršenog rada. Agent mora održavati oba dokumenta usklađena sa stvarnim fajlovima i posljednjim dogovorom.

- Prije promjene zabilježi zadatak, pripadajuću TAB fazu, konkretne korake i početni status u evidenciji.
- Poslije svakog značajnog koraka upiši rezultat, relevantne fajlove, izvršene provjere i njihov ishod. Ne čekaj kraj dugog zadatka.
- Ako pišeš izvještaj o radu, pripremi ga prije push-a; ako se push ne radi, napiši ga na kraju svake sesije, prije završnog odgovora. Planirane nalaze i izvršene provjere zabilježi prije slanja, da izvještaj bude uključen u isti odobreni commit/push. Ne pravi dodatni dokumentacioni commit/push samo radi naknadnog izvještaja; ishod push-a saopšti u završnom odgovoru.
- Prije završnog odgovora ažuriraj pregled statusa i navedi preostalo i naredni korak. Promjene obima, stacka, zavisnosti ili kriterijuma prenesi i u plan.
- Svaki zadatak ima stabilan ID; faze TAB-01–TAB-12 zadržavaju postojeće oznake. Detaljne korake označi npr. TAB-03-A. Ne briši istoriju da promijeniš status.
- Statusi su PLANIRANO, U TOKU, ZAVRŠENO, BLOKIRANO, PAUZIRANO i OTKAZANO. Uz blokadu navedi konkretan uslov za nastavak; PAUZIRANO koristi kada korisnik zatraži pauzu.
- Razlikuj plan, implementaciju, provjeru i objavu. Završeno znači da rezultat postoji i provjeren je u odgovarajućem obimu; zabilježi granice provjere.
- Nakon prekida provjeri djelimične radnje i popravi status prije nastavka. Ne ponavljaj završene korake bez obrazloženja.
- Datum zapisa vodi prema Europe/Belgrade. Nikada ne zapisuj tokene, kredencijale ili privatne podatke.
- Tabela aktuelnog progresa mora obuhvatiti sve TAB faze; detaljni zadaci imaju sopstvenu tabelu. Ne prikazuj broj završenih redova kao procenat završene aplikacije.
- Red „sljedeći korak“ nije nalog za objavljivanje, Git upise ili novu funkcionalnost izvan odobrenog obima.

Ne objavljuj, ne kreiraj remote i ne radi commit/push bez korisnikovog naloga za tu radnju. Ovaj dokument sam po sebi ne pokreće implementaciju, objavu ni dodatne agente.
