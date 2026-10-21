# Tabora — UI istraživanje i smjernice

Datum: 21. oktobar 2026. Obim: istraživanje za prvi vizuelni koncept, ne implementacija.

## Aktuelna izmjena obima

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
