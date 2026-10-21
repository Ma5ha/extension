# Tabora — evidencija progresa

Datumi se vode prema Europe/Belgrade. Ovaj dokument prati rezultate; [PLAN.md](../PLAN.md) definiše obim i kriterijume.

## Aktuelni pregled

Izabrani raspored je Modularni atelje, treći koncept light serije. Prihvaćena osnova: WXT + React + TypeScript, Vite/MV3, pnpm i CSS Modules sa CSS varijablama. Light i dark ostaju obavezni; glass je prikazan, a njegov konačan intenzitet/materijal još nije izabran.

Repozitorijum sadrži dokumentaciju i slike koncepata. Nema aplikacionog koda, instaliranih zavisnosti, commita, remote-a ili objave. Sljedeći implementacioni korak je lokalna WXT osnova prema planu; ovaj zadatak mijenja samo dokumentaciju.

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

### 21. oktobar 2026. — GIT-01: prvi lokalni commit

Korisnik je izričito naložio commit. Obim: `.gitignore`, plan, agentove upute, UI istraživanje, evidencija i sedam sintetičkih UI koncepata. Ciljna grana je `main`; remote nije konfigurisan. Pregledan je sadržaj dokumenata i izvršena pretraga uobičajenih obrazaca tajni bez pronađenih podudaranja. Slike su prethodno vizuelno pregledane i prikazuju sintetičke podatke. Lokalni commit se izvršava nakon ovog zapisa; njegov ishod i identifikator provjeravaju se u Git istoriji i završnom odgovoru. Push nije zatražen.

| ID | Zadatak | Status | Rezultat / preostalo |
|---|---|---|---|
| TAB-02-DOC | Prihvaćeni stack, upute i evidencija | ZAVRŠENO | Dokumenti usklađeni; lokalne veze i format provjereni. Bez instalacije ili implementacije. |

## Status razvojnih faza

| ID | Faza | Status | Rezultat / preostalo |
|---|---|---|---|
| TAB-01 | Repozitorijum i plan | ZAVRŠENO | Lokalni Git, `.gitignore` i plan postoje; nema remote-a ili commita. |
| TAB-02 | Specifikacija i tehnička provjera | U TOKU | Istraživanje, izbor rasporeda i prihvaćeni stack postoje; materijal/obim i tehničke provjere integracija preostaju. |
| TAB-03 | Osnova ekstenzije i UI | PLANIRANO | WXT inicijalizacija, novi tab, izabrani raspored i light/dark. |
| TAB-04 | Pretraga i tabovi | PLANIRANO | Stvarni tabovi, bookmarkovi, web pretraga i grupisanje po originu. |
| TAB-05 | Google Calendar | PLANIRANO | OAuth i stvarni događaji, stanja grešaka i odspajanje; obim unosa razriješiti. |
| TAB-06 | Gmail | PLANIRANO | Autorizacija, pregled/pretraga i uslovi javne verifikacije. |
| TAB-07 | Muzika | PLANIRANO | Spotify/SoundCloud i provjera trajanja reprodukcije kroz više tabova. |
| TAB-08 | Vijesti | PLANIRANO | RSS izvori, naslovi i lokalno čuvanje članaka. |
| TAB-09 | X i Instagram | PLANIRANO | Potvrditi podršku, troškove i dozvole prije implementacije. |
| TAB-10 | Personalizacija i prenos | PLANIRANO | Sačuvani raspored, izvoz/uvoz i pristupačnost. |
| TAB-11 | Priprema javnog izdanja | PLANIRANO | Privatnost, dozvole, provjere i paket za prodavnicu. |
| TAB-12 | Objavljivanje | PLANIRANO | Zaseban nalog i predaja u prodavnicu, tek poslije pripreme. |
