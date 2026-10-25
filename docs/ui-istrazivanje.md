# Tabora — UI istraživanje i smjernice

Datum: 21. oktobar 2026. Obim: istraživanje za prvi vizuelni koncept, ne implementacija.

## Aktuelna izmjena obima

TAB-07-B, 22. oktobar 2026: Mediji dobijaju zajedničke kontrole kroz navigaciju, pomjerljiv mini-player sa promjenom veličine, Document PiP kontrole i opcioni izvorni video PiP. Light/dark, tastatura i 320px reflow provjereni sintetički. Video nije prenesen u Tabora DOM; podrška i stvarni sistemski PiP zavise od izvora/browsera. Detalji: mini-player.md.

TAB-03-F, 22. oktobar 2026: prema korisnikovoj doradi, primarni font je lokalni Inter Variable 4.1. Tabovi i bookmarkovi prikazuju stvarnu Chrome favicon sliku gdje je dostupna, sa lokalnim fallback ikonama; dark podloga poboljšava čitljivost. Ovo zamjenjuje raniji izbor samo sistemskog fonta/monohromatskih servisnih ikona. Sidebar i odsustvo pretrage ostaju.

TAB-03-E, 22. oktobar 2026: izabrana i implementirana Radna konzola (`ui-koncepti/radna-konzola-odabrano.jpg`). Jedna bočna navigacija; tabovi i sačuvane sesije u centru; zadaci, bilješke i sažeti servisi desno. Ovo je aktuelni vizuelni pravac, a stariji Modularni atelje ostaje dostupna prilagodljiva opcija. Sintetički UI/visual QA prolazi; stvarni Chrome/Google tokovi ostaju zasebni. Detalji u `../design-qa.md`.

22. oktobar 2026, TAB-02-REV: korisnik ponovo otvara izbor rasporeda i vizuelnog pravca. Modularni atelje više nije obavezni raspored za nove koncepte. Istražuju se tri alternative; light/dark i odsustvo pretrage ostaju. Stari izbori i QA slike služe istorijskom kontekstu; novi koncepti nisu implementacija.

Korisnik je odobrio svih pet nadogradnji: Chrome folderi/premještanje, sesije, fokus/bilješke, raspored/veličine i bočni panel. Modularni atelje ostaje početni raspored, sada prilagodljiv. Detalji su u [radni-prostor.md](radni-prostor.md). Pretraga ostaje isključena.


TAB-10-C zamjenjuje lokalni bookmark widget direktnim Chrome bookmarkovima prema korisnikovoj ispravci. Isti zapisi, opciona bookmarks dozvola, prikaz putanje foldera i promjene preko Chrome događaja. Pretraga ostaje uklonjena. Raniji TAB-10-B opis ispod je istorijski.


TAB-10-B: dodat je widget Sačuvani linkovi u desnoj koloni, uz podešavanje vidljivosti. Lokalni bookmarkovi sa ručnim unosom ili izborom otvorenog taba, uređivanjem i potvrdom uklanjanja. Pretraga ostaje uklonjena; nema Chrome bookmarks dozvole.


TAB-05-A: agenda sada ima implementiran opcioni read-only primarni Google kalendar, umjesto same prečice. Bez build OAuth konfiguracije prikazuje nepodešeno stanje. Stvarni događaji i nova agenda u Chrome-u nisu potvrđeni. Korisnik je odložio svoje ručne provjere; stanje ostaje jasno evidentirano.


Korisnik je nakon implementacije uklonio search. Novi UI nema polje pretrage, prečicu Cmd/Ctrl+K ni search/bookmarks dozvole. Stariji nalazi o pretrazi ispod ostaju istorijski kontekst, ne aktivan zahtjev. Sačuvani su raspored Modularnog ateljea i light/dark teme uz mirniju navigaciju, manje ugniježđenih obruba i kraće tekstove nepovezanih modula.

## 1. Zaključak

Preporučeni pravac je **„Mirna orbita“**: funkcionalna početna stranica sa blagim futurističkim karakterom, jasnom pretragom, neutralnim površinama i pažljivo odmjerenim interakcijama. Rauno Freiberg je glavna referenca za ponašanje, Linear za hijerarhiju, Paco Coursey za pristup pretrazi i jednostavnosti.

Ne postoji korisnički odabran konačan mockup. Paleta, dimenzije i raspored ispod su lokalni prijedlozi za izradu koncepta, ne pravila ovih dizajnera ili potvrđen izgled proizvoda.

## 2. Metod i granice istraživanja

- Pregledani su primarni izvori dizajnera, W3C obrasci pristupačnosti i Chrome dokumentacija. Linkovi su uz nalaze.
- U browseru vizuelno su pregledani Raunova Craft galerija, početni prikaz Pacovog sajta i Linearov članak. Raunova galerija pokazuje raznovrsne eksperimente, a ne jedan univerzalni vizuelni sistem. Linearova uvećana ilustracija nije se prikazala, pa zaključci o njegovom proizvodu ovdje polaze prvenstveno od autorskog objašnjenja i opisa ilustracija.
- Nisu instalirani Re-newtab ni Tabora; nema mjerenja stvarnog proizvoda, razgovora sa korisnicima ili korisničkih testova. Ovo je istraživanje izvora i projektantska sinteza.
- Nisu izmjerene brzina animacija referenci, njihove tačne boje ili CSS dimenzije. Sve brojčane preporuke za Taboru ispod su naše početne vrijednosti.
- Tehnička provjera OAuth-a, playera i društvenih feedova ostaje zaseban dio TAB-02.

## 3. Reference i primjena

### Rauno Freiberg — interakcije

U eseju opisuje odnos namjere, povratne informacije i prekidivosti interakcije, te razliku između laganog pregleda i radnje sa posljedicama. Za Taboru iz toga izvodimo: rezultat pretrage reaguje odmah, korisnik ne čeka dekorativni prelaz, a premještanje ili zatvaranje tabova zahtijeva jasnu namjeru. Ovo je naša primjena, ne autorov recept za dashboard. [Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design)

U tekstu o dubini istražuje slojeve, pozadinu i redoslijed pojavljivanja. Primjena za Taboru: diskretno izdvojiti aktivni panel, a pozadinu prigušiti kada modal preuzima interakciju. Efekte ograničiti na korisnu hijerarhiju. [Designing Depth](https://rauno.me/craft/depth)

Craft galeriju koristiti kao zbirku ideja za detalje, bez kopiranja brenda, ilustracija ili eksperimentalnih kontrola koje otežavaju uobičajen rad. [Craft](https://rauno.me/craft)

### Linear — organizacija većeg broja modula

Autori redizajna opisuju smanjenje vizuelnog šuma, poravnanje elemenata i provjeru okruženja, izgleda i hijerarhije. Tabora treba zajednički okvir navigacije i tokena koji može izdržati i prazan i veoma popunjen ekran. Ne preuzimamo kompletnu navigaciju issue trackera. [How we redesigned the Linear UI, part II](https://karrisaarinen.com/posts/how-we-redesigned-the-linear-ui/)

### Paco Coursey — pretraga i jednostavnost

Na sajtu navodi rad na uglađenim interfejsima i projekat ⌘K, komponentu za komandni meni. To ga čini relevantnim za našu pretragu i komande. Izbor biblioteke tek treba procijeniti; ime reference nije razlog za dodavanje zavisnosti. [Paco Coursey](https://paco.me/)

## 4. Potrebe i hijerarhija

Radne pretpostavke koje treba provjeriti prototipom:

| Potreba | UI odgovor | Provjera u prototipu |
|---|---|---|
| Brzo pronaći stranicu | Pretraga na vrhu, jasna vrsta svakog rezultata | Pronaći postojeći tab bez otvaranja duplikata |
| Urediti mnogo tabova | Grupe po originu, broj tabova, pregled prije promjene | Razumjeti koje tabove grupisanje mijenja |
| Vidjeti šta slijedi | Dnevna agenda i naredni sastanak | Pronaći vrijeme i dugme za sastanak |
| Provjeriti poštu | Sažeta lista i opcija skrivanja privatnog sadržaja | Razlikovati prazan inbox od greške autorizacije |
| Čitati vijesti | Izvor, vrijeme objave, sačuvaj, konačna lista | Vratiti se na zadatak bez beskonačnog feeda |
| Slušati muziku | Jedan jasno označen aktivni izvor | Otvoriti još jedan novi tab bez drugog zvuka |

Primarni zadaci su pretraga i tabovi. Agenda i Gmail su sekundarni na radnom prostoru. Vijesti i muzika dobijaju vlastite prostore; korisnik može mijenjati raspored. Veliki sat, pozadina i pozdrav nisu prioritet iznad stvarnih zadataka.

## 5. Predložena arhitektura ekrana

1. Kompaktna gornja navigacija: Tabora, Rad / Vijesti / Muzika, uređivanje rasporeda, podešavanja.
2. Pretraga ispod navigacije, sa vidljivim izborom opsega i dugmetom za komande.
3. Prostor Rad: tabovi kao najširi panel, agenda i Gmail kao uži paneli. U početnoj verziji bez Gmaila prikazati samo implementirane module.
4. Prostor Vijesti: čitljive liste naslova, filter izvora, sačuvani članci; društveni izvori su opcioni.
5. Prostor Muzika: odabrani servis, sačuvani linkovi i stvarni player.
6. Podešavanja: izgled, widgeti, veze i dozvole, privatnost, podaci/izvoz i prečice.

Ne prikazivati dvostruku stalnu navigaciju (sidebar i gornje tabove sa istim funkcijama). Prednost ima običan tok dokumenta; manje prozore ne pretvarati u mrežu sitnih panela sa sopstvenim skrolovima.

### Adaptivnost

Početni prijedlog: od 1200 CSS px tri kolone prema sadržaju, 800–1199 dvije, ispod 800 jedna. Prelom određuje čitljivost sadržaja; broj nije obavezan ako konkretan prikaz traži raniji prelom. Na uskom prikazu zadržati isti logički redoslijed i omogućiti skrol stranice. Nema horizontalnog skrola cijele stranice. Provjeriti i 320 CSS px za reflow, iako telefon nije početna platforma.

## 6. Vizuelni jezik — početni tokeni

Ovo su lokalne početne vrijednosti za koncept. Prije implementacije provjeriti kontrast stvarnih kombinacija, hovera, transparentnosti i teksta preko slika.

| Semantički token | Tamna tema | Svijetla tema |
|---|---|---|
| Pozadina | `#101216` | `#F4F6F8` |
| Panel | `#191D24` | `#FFFFFF` |
| Izdignuta površina | `#242B35` | `#E8EDF3` |
| Glavni tekst | `#F2F5FA` | `#18202A` |
| Sekundarni tekst | `#ABB6C7` | `#526174` |
| Akcenat / fokus | `#9BD8FF` | `#155C91` |
| Dekorativni obrub | `#343D4B` | `#CDD5DF` |

- Tema: korisnik je nakon prvih koncepata izabrao bijelu/light kao osnovu novih primjera, uz obavezno zadržavanje light/dark izbora. Ovo zamjenjuje raniji prijedlog tamne kao glavnog koncepta. Sistemska tema može biti dodatna opcija. Raspored i funkcije ostaju jednaki između tema.
- Akcenat koristiti za fokus, izbor i primarnu radnju. Statične kartice ne svijetle sve istovremeno.
- Dekorativni obrub nije automatski dovoljno kontrastan za jedinu granicu inputa ili fokus; funkcionalne granice zahtijevaju zaseban token i provjeru.
- Tipografija: lokalno zapakovan Inter ili sistemski sans; provjeriti licencu ako se font dodaje. Osnovni tekst 14–16 px, metadata 12–13 px, naslovi panela 16–18 px. Ne koristiti sitan tekst kao glavni način povećanja gustine.
- Razmaci: skala 4, 8, 12, 16, 24, 32 px. Unutrašnji razmak panela početno 16–24 px.
- Radijusi: kontrole 8–10 px, paneli 14–16 px; kapsule za opseg/status gdje imaju značenje.
- Ikone: jedan dosljedan skup; 16–20 px grafika unutar veće klikabilne površine. Faviconi i logotipi servisa ostaju prepoznatljivi.
- Dubina: jedan diskretan sloj sjenke za overlay; zamućenje opciono i nikada iza osnovnog teksta bez čvrste podloge.
- Bez animirane mreže, stalnih čestica, velikih neon oreola ili video pozadine u početnom pravcu.

### Kretanje

Naš početni budžet: 100–160 ms za stanje kontrole, 160–220 ms za panel ili modal, pomjeranje najviše nekoliko piksela za mikrointerakcije. Pretraga i tastaturne komande ne čekaju animaciju. Nema ulazne animacije svakog reda pri svakom novom tabu. Poštovati sistemski `prefers-reduced-motion`; neesencijalno kretanje ukloniti. To je podržan W3C obrazac, a konkretna trajanja su naš izbor. [W3C C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html)

## 7. Ponašanje komponenti

### Pretraga i komandna paleta

- Jasno razdvojiti rezultate: tab, bookmark, web pretraga, Gmail i radnja. Nikad poslati svaki unos Gmailu ili tuđem servisu bez izabranog opsega.
- Lokalni rezultati prvi, mrežni izvor ima sopstveni loading, grešku i otkazivanje zastarjelog zahtjeva.
- `Enter` bez izabranog rezultata pokreće vidljivo označenu web pretragu; sa izabranim rezultatom izvršava upravo njega. Ne mijenjati odredište prećutno.
- Za sugestije pratiti combobox obrazac: strelice biraju opciju, Escape zatvara, input ostaje uređiv i ima pristupačno ime. Složene radnje ne uguravati u nepravilno strukturisane listbox opcije. [WAI-ARIA Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- `Cmd/Ctrl+K` je predložena prečica kada stranica ima fokus. Ne obećavati njeno presretanje iz Chrome adresne trake ili drugih stranica. Uvijek ponuditi vidljivo dugme.
- Novi tab ne smije krasti fokus iz adresne trake. Chrome navodi da se ne treba oslanjati na početni fokus unutar override stranice. [Override Chrome pages](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages?authuser=370)

### Tabovi

- Svaki red: favicon, naslov, origin i jasno odvojeno zatvaranje. Dugi naslovi imaju dostupan puni tekst.
- Objasniti origin kao „Isti sajt: protokol, host i port“. UI ne smije nazivati svaki origin samo domenom ako se pravilo razlikuje.
- Prije grupisanja prikazati broj tabova i ciljnih grupa u trenutnom prozoru. Početno preskočiti zakačene tabove, postojeće grupe i interne/nepodržane URL-ove, uz prikaz broja preskočenih; to je prijedlog za prvu implementaciju.
- Dok korisnik pregleda plan, tabovi se mogu promijeniti: ponovo provjeriti stanje prije izvršavanja i prijaviti djelimičan rezultat.
- Grupisanje ne zatvara tabove. Bulk zatvaranje je zasebna radnja. Ne obećavati Undo dok vraćanje zaista nije implementirano.
- Uređivanje rasporeda ima jasno stanje „Uredi raspored“ i alternativu prevlačenju, npr. „Pomjeri prije/poslije“.

### Gmail i kalendar

- Nepovezan widget objašnjava korist i nudi povezivanje; ostatak aplikacije ostaje upotrebljiv.
- Razlikovati: nije povezano, autorizacija traje, dozvola odbijena, sesija istekla, offline, prazno, greška i uspjeh. Ne prikazivati grešku kao nula poruka/događaja.
- U metapodacima navesti posljednje osvježavanje kada se prikazuje keširan sadržaj. Ne pisati „uživo“ bez potvrde.
- Za Gmail ponuditi skrivanje pošiljalaca/naslova i jasan izbor vidljivosti na novom tabu; početni prijedlog je skriven privatni sadržaj dok ga korisnik ne uključi.
- Kalendar počinje agendom, uz datum, vremensku zonu kada je bitna i razliku cjelodnevnih događaja. Mjesečni prikaz je sekundaran.
- Čitanje i kreiranje događaja imaju različite radnje i objašnjenja dozvola. Ne dodavati slanje pošte kao podrazumijevanu mogućnost.

### Vijesti i društvene mreže

- Naslov, izvor, vrijeme objave i otvaranje originala. Vrijeme objave razlikovati od vremena preuzimanja.
- Konačna lista i „Učitaj još“, bez automatskog beskonačnog skrola i pomjeranja redova dok korisnik čita.
- X/Instagram predstavljati kao eksperimentalne dok se ne potvrde API, cijena i dozvole. Prečica do profila nije povezan feed.
- Tuđi sadržaj nije izvršivi HTML: sanitizovati RSS i spoljne podatke, bez automatskog pokretanja skripti.

### Muzika

- Bez automatskog puštanja zvuka pri otvaranju taba.
- Prikazati stvarni servis, pjesmu i stanje; ne crtati kontrole koje stvarni player ne podržava.
- Razlikovati embed, daljinsko upravljanje i puni playback. Dostupnost zavisi od servisa i naloga; provjera playera ostaje otvorena.
- Jedan aktivni izvor je UX cilj koji tek treba tehnički dokazati. Poseban prozor je kandidat, ne završena funkcija.
- Prazan ili blokiran player ima opciju otvaranja u servisu. Dokazati ponašanje sa dva nova taba i zatvaranjem taba koji reprodukuje.
- Fiksni donji player ne prekriva sadržaj ili fokus; na uskom prikazu ostaje u toku dokumenta.

## 8. Pristupačnost

Cilj je WCAG 2.2 AA za naš UI, uz posebno evidentiranje ograničenja tuđih embedova. To nije tvrdnja o sertifikaciji. [WCAG 2.2 pregled](https://www.w3.org/WAI/WCAG22/quickref/)

- Kontrast običnog teksta najmanje 4.5:1, velikog 3:1; relevantne kontrole, stanja i grafika 3:1 gdje kriterijum važi. Boja nije jedini signal.
- Cijeli tok radi tastaturom; fokus je vidljiv i nije sakriven playerom ili panelom.
- Zum 200% i reflow do 320 CSS px bez gubitka funkcija; tekst se ne odsijeca zbog fiksne visine.
- Pristupačna imena, stvarni button/link/input elementi, logički naslovi i status poruke za bitne asinhrone rezultate.
- Prevlačenje ima alternativu jednim pokazivačem bez prevlačenja i tastaturni put.
- AA minimum mete je 24 × 24 CSS px, uz izuzetke iz standarda. Naš poželjni cilj je 36–40 px za guste desktop kontrole i 44 px za glavne radnje; to su lokalne preporuke. [W3C Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Modal ima naslov, fokus unutar njega, Escape i vidljivo zatvaranje; po zatvaranju fokus se vraća na pokretač ili smislen nastavak. Modalnost označiti samo kada je pozadina stvarno neaktivna. [WAI-ARIA Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## 9. Brzina i povjerenje

Naš početni cilj: osnovna lokalna navigacija i pretraga postaju upotrebljive bez čekanja mreže; integracije se učitavaju zasebno. Broj otvorenih widgeta i više novih tabova ne smiju nekontrolisano množiti mrežne zahtjeve.

Predloženi budžet za mjerenje na zabilježenom razvojnom uređaju: lokalni okvir upotrebljiv unutar 500 ms od početka navigacije, odgovor lokalne pretrage do 100 ms za dogovoreni skup podataka. Ovo su ciljevi, ne izmjereni rezultati ili univerzalne garancije. Zabilježiti hladno/toplo učitavanje, uređaj i broj tabova.

Tuđe playere i društveni sadržaj učitavati na zahtjev gdje je moguće. Ne učitavati udaljene fontove samo radi izgleda. Povezivanje i odspajanje servisa mora imati razumljivo objašnjenje šta se čuva lokalno i kako se uklanja pristup. Nema analitike ni slanja istorije bez zasebno definisanog razloga i izbora korisnika.

## 10. Matrica provjere budućeg koncepta

| Oblast | Obavezni primjeri |
|---|---|
| Veličine | 1440×900, 1280×720, 1024×768, uski prozor; reflow 320 CSS px |
| Izgled | Svijetla/tamna tema, sistemska tema, reduced motion, 200% zum |
| Podaci | 0/5/50/200 tabova, dugi naslovi, nedostajući favicon, više originâ |
| Integracije | Nepovezano, povezano, odbijeno, isteklo, offline, greška, zastarjeli keš |
| Pretraga | Bez rezultata, miješani izvori, spor mrežni odgovor, tastatura, IME unos |
| Kontrola | Grupisanje sa promjenom tabova tokom pregleda, premještanje bez drag-a |
| Privatnost | Skrivena pošta, odspajanje, izvoz bez privatnog sadržaja/tokena |
| Muzika | Dva nova taba, zatvaranje player taba, blokiran sadržaj, bez autoplay-a |

Za vizuelni izbor 21. oktobra 2026. generisana su tri koncepta iste osnovne funkcionalnosti: [Mirna orbita](ui-koncepti/mirna-orbita.png) — grafit i ledenoplava, [Dnevni studio](ui-koncepti/dnevni-studio.png) — svijetla neutralna varijanta, [Večernji signal](ui-koncepti/vecernji-signal.png) — tamna sa toplijim akcentom. Generisano ugrađenim ImageGen alatom, bez priloženih referentnih screenshotova; korišćen je tekstualni brief iz ovog dokumenta. Promptovi su tražili desktop 1440×1024, tri zasebna ekrana, Rad/Vijesti/Muzika navigaciju, pretragu, tabove po originu, agendu, skriven Gmail i mali Spotify player, uz izmišljene podatke za 21. oktobar 2026. Razlikovali su paletu, naglasak pretrage i raspored liste/agende. Slike služe izboru izgleda; detaljna ograničenja zabilježena su u planu. Korisnik još nije izabrao cilj. Tipografija, tokeni i raspored zatim se usklađuju s izborom.

## 11. Preostalo

- Izabran je Modularni atelje; preostaju izbor običnog/glass materijala i razrada pripadajuće dark teme.
- Prototipska provjera ključnih zadataka i kontrasta svih stanja.
- Stvarna tehnička provjera Google integracija, playera i društvenih izvora.
- Provjera brzine u učitanoj Chrome ekstenziji.
- Početni jezik interfejsa i eventualni engleski prevod za javno izdanje.

Istraživanje je dovoljno za prvi koncept i agentova pravila. Nije dokaz da su integracije izvedene ili korisničko ponašanje potvrđeno.

## 12. Nova serija rasporeda na bijeloj osnovi

Naknadni izbor: korisnik je izabrao Modularni atelje, treći prikaz ove serije. Na njegov zahtjev generisana je [glass varijanta](ui-koncepti/rasporedi-light/modularni-atelje-glass.png); materijal još nije potvrđen. Ovo zamjenjuje raniju napomenu ispod da izbor nije napravljen.

Na korisnikov zahtjev generisana su tri rasporeda, svi sa light/dark izborom: [Bočni studio](ui-koncepti/rasporedi-light/bocni-studio.png), [Otvoreni horizont](ui-koncepti/rasporedi-light/otvoreni-horizont.png), [Modularni atelje](ui-koncepti/rasporedi-light/modularni-atelje.png). Stvarna ulazna referenca za svaku sliku bila je prethodna slika Dnevni studio. Alat: ugrađeni ImageGen. Promptovi: desktop 1440×1024, bijela/pale-grey osnova, tamni tekst i umjeren plavi akcenat, šest tabova u tri origina, agenda za 21. oktobar 2026, skriven Gmail i pauziran muzički player; bez browser okvira i dekorativnog sata. Varijacije traže bočnu navigaciju sa origin kolonama, horizontalne pojaseve i modularni raspored sa agendom lijevo. Rezultati se donekle razlikuju od zatraženih detalja; slike su vizuelne reference, a ne konačne specifikacije. Izbor još nije napravljen. Nije generisana nova dark razrada niti implementiran UI.

## 13. Implementacioni pregled — 21. oktobar 2026.

Naknadni izbor i implementacija imaju prednost nad istorijskim napomenama ranijih koncepta: Modularni atelje je izabran i implementiran kao prilagodljiva light/dark osnova sa opcionim glass efektom. Vidljivost tri sporedna modula i izgled čuvaju se lokalno. Agenda/Gmail/muzika trenutno imaju samo nepovezana stanja i obične linkove, bez sintetičkih poruka, događaja ili playbacka. Izvještaj i snimci stvarnog HTTP pregleda su u [provjeri](provjere/izvjestaj.md). Konačan materijal, puna pristupačnost i tehničke integracije ostaju otvoreni. Učitavanje kao Chrome ekstenzija i stvarni API tokovi još čekaju potvrdu; HTTP pregled to ne dokazuje.

### Dopuna TAB-07-A — 21. oktobar 2026.

Nepovezani muzički widget zamijenjen je panelom Mediji u istom rasporedu. Standardni DOM adapter i opcione dozvole imaju implementaciju; Spotify nalog/embed nije dio ove izmjene. HTTP pregled potvrđuje osnovni panel u obje teme i 320 px reflow; aktivne Chrome kontrole još zahtijevaju matricu u `provjere/mediji.md`.

## 14. TAB-03-G — kartice i bookmark stablo, 22. oktobar 2026.

Korisnik sada traži prozirne kartice, suptilan linearni gradijent, engleski bookmark interfejs i diskretne animacije. Pregledane žive reference [Linear](https://linear.app/features) i [Rauno](https://rauno.me/); smjer ostaje jednostavna hijerarhija i kratka povratna informacija, bez kopiranja njihovih asseta. Dokumentacioni pregled, ne korisničko istraživanje.

[Chrome bookmarks API](https://developer.chrome.com/docs/extensions/reference/api/bookmarks) potvrđuje stvarnu hijerarhiju children i postojeće CRUD/move operacije. [WAI disclosure/tree primjer](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-navigation/) preporučuje jednostavniji disclosure kada puni ARIA tree nije potreban: ovdje su nativni details/summary i ugniježđene liste, bez lažnog tree role-a. Tab dolazi do svake radnje; Enter/Space otvara folder, Left/Right zatvara/otvara, Up/Down/Home/End kreće se među vidljivim folderima. Native stanje ostaje dostupno čitaču ekrana.

[MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) primijenjen kroz postojeći globalni override. [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) pregledan; kartice koriste alfa površine bez dodatnog blura. Nema novih zavisnosti ili dozvola. Engleski obuhvata bookmark navigacioni naziv, naslov, forme, potvrde i statusne poruke; korisnički nazivi foldera ostaju originalni. Ostali moduli zadržavaju raniji jezik.

## 15. TAB-07-E — istraživanje playera, 22. oktobar 2026.

Korisnik je odbacio izgled native selecta u kartici. Pregledani [Spotify Connect](https://support.spotify.com/us/article/spotify-connect/) (posebna akcija pa izbor izvora), [Apple Music web](https://music.apple.com/us/new) (screenshot: naslov/lista sa slikom i sekundarnim tekstom) i [Plyr](https://plyr.io/) (stranica sada upućuje na Video.js i označava Plyr deprecated). Nijedna nova player biblioteka se ne instalira. Principi, bez kopiranja brenda: sadašnji medij odvojen od izbora izvora; veći naslov, favicon u zasebnom polju, centralni Play/Pause, lakše sekundarne radnje.

Izvor više nije native select: SourcePicker je nativni disclosure sa listom dugmadi, faviconom, naslovom, hostom i Check oznakom/aria-pressed izabranog taba. Enter/Space i Tab su nativni, strelice/Home/End kreću se među dugmadima, Escape zatvara i vraća fokus na okidač; izbor zatvara listu i vraća fokus. Lista raste u toku stranice, ne dobija novi ugniježđeni scroll niti popup koji bi bio odrezan u mini-playeru. Ovo nije Spotify integracija ili promjena reprodukcije.

## 16. TAB-03-H — scroll i atmosfera

Prema najnovijem korisnikovom nalogu, konzola prelazi sa page scroll-a na dvije nezavisne scroll regije, uz stalnu navigaciju i zaglavlje. Na užem prozoru regije su vertikalno podijeljene. Nativni overflow zadržava touch/wheel/tastaturu, bez biblioteke i novih scrollova unutar svake kartice. Lokalni SVG orbitalnih linija i jednokratan ulaz zamjenjuju ideju stalnog dekorativnog kretanja; reduced-motion gasi animacije. Ovo mijenja raniju opštu preporuku u ovom dokumentu za konkretni odabrani console raspored.

## 17. TAB-10-H — materijal

Korisnik traži prljaviju bijelu osnovu i više kontrole nad staklom: light tokeni sada su topla sivobijela osnova, prozirnost stvarnih 0–70%, a blur pozadine nezavisnih 0–32px. Blur se primjenjuje na pozadinu materijala kroz backdrop-filter, ne na tekst; pri neprozirnosti 0% nema vidljiv efekat. Izbori su lokalni i u obje teme, bez mrežnih asseta.

## 18. TAB-10-P — jedini raspored, 25. oktobar 2026.

Najnoviji korisnikov izbor je samo Custom widgets. Prethodna Radna konzola više nije alternativni raspored. Bočna navigacija i zajedničko zaglavlje ostaju, a widgeti koriste sačuvane kolone, redoslijed, širine, visine i vidljivost po prostoru. Light/dark, drag i alternativne kontrole u Edit layout ostaju.

TAB-06-A (25. oktobar 2026): Gmail widget implementira opcioni metadata-only inbox, filter nepročitanih i početno skriven privatni sadržaj, bez pretrage. Stvarni OAuth i UI matrica još nisu potvrđeni; detalji u [Gmail dokumentaciji](gmail.md).

TAB-10-Q (25. oktobar 2026): korisnik traži razdvajanje widget zaglavlja i kartice. Kategorija/ikona i tanka linija sada su na podlozi iznad samostalne sadržajne kartice; uklonjena je spojena gornja traka. Referenca: [Linear Insights](https://linear.app/insights), uz postojeće Tabora tokene. Drag ručke i alternative za premještanje dostupne su u Edit layout režimu. Light/dark desktop i dark uski HTTP pregled potvrđeni; stvarni Chrome i puna matrica ostaju otvoreni.

TAB-10-R: prema najnovijoj korisnikovoj instrukciji drag ručke su stalno dostupne i van Edit layout režima. Novi odvojeni izgled ostaje; alternativne kontrole su i dalje u editoru.

TAB-10-S: korisnik screenshotom pojašnjava da je prvobitno razdvajanje tražio za gornji dnevni pregled. Now/Today/Week/Year sada su četiri odvojene kartice, Timer & alarm je samostalna površina ispod. Prihvaćene vanjske oznake ostalih widgeta i stalni drag ostaju.

TAB-10-T: Time tools sada ima Timer/Alarm/Stopwatch kartice, velike unose i preset trajanja, statusne oznake i primarne radnje. Zajednički opcioni zvuk sa Preview sound. Light/dark desktop HTTP pregled potvrđen; integracione granice u [time-tools.md](time-tools.md).

TAB-03-G: diskretniji plus/drag i ravnija dugmad. ThemeSwitch izuzet iz opšteg icon pravila prema korisnikovoj korekciji; zadržava svoj prethodni slider. TAB-08-A: News sada prikazuje stvarne RSS/Atom izvore i sačuvane članke; ograničenja u [rss.md](rss.md).

TAB-10-V (25. oktobar 2026): korisnik traži sopstveno miješanje boja, punu providnost i pozadinsku sliku. Settings sada dozvoljava custom accent/dva tonta, glass do 100% i lokalni raster background. Blur je nezavisan, Settings ostaje neproziran. Detalji i granice provjere u [appearance.md](appearance.md).

TAB-10-W: Settings organizovan u četiri sekcije; pet stilova ima pregled i eksplicitni Apply. Reset appearance zadržava backgroundImage i layout. Novi panel light/dark/390px HTTP pregledan; detalji u [appearance.md](appearance.md).

TAB-08-B: RSS članci opcionalno prikazuju lazy thumbnail iz samog feeda, sa Show article images prekidačem, tekstualnim fallback-om i dvorednim opisom. NASA stvarne slike potvrđene u light/dark HTTP pregledu. Ranija zabrana učitavanja feed slika zamijenjena je ovim eksplicitnim korisničkim izborom; HTML/skripte se i dalje ne izvršavaju.

TAB-08-C: RSS news je sada i Work widget, sa pet zajedničkih naslova/slikama/refreshom i vezom ka News. Vidljivost po prostoru i postojeći drag/edit kontrole su dostupni.

TAB-10-X: Developer console widget je implementiran kao ručno povezivanje jednog web taba, read-only logovi/filter/clear i odspajanje, bez izvršavanja komandi. Debugger je required dozvola jer Chrome ne podržava optional debugger. HTTP početno stanje provjereno, stvarni Chrome capture preostaje; [detalji](developer-console.md).

### TAB-10-Y — podesiv bočni meni

Prema korisnikovom nalogu 25. oktobra: Settings → Sidebar bira vidljive navigacione stranice, uključujući samostalnu Developer console. Work i Settings ostaju dostupni; izbor je globalan i ne briše podatke niti mijenja widget visibility. HTTP potvrđeni hide/persist/restore i fallback na Work.
