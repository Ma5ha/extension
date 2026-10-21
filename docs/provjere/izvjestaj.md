# Tabora — provjera lokalne osnove

Datum: 21. oktobar 2026, Europe/Belgrade. Obim: TAB-03-A, TAB-03-C i TAB-04-A. Implementacija postoji; učitavanje ekstenzije i stvarni Chrome API tokovi još čekaju potvrdu.

## Automatizovano

| Provjera | Ishod |
|---|---|
| `corepack pnpm typecheck` | Prolazi |
| `corepack pnpm lint` | Prolazi, bez upozorenja |
| `corepack pnpm test` | 13 testova u 3 fajla prolazi |
| `corepack pnpm build` | Prolazi; `build/chrome-mv3/manifest.json` postoji |
| Paket / HTML asseti | Manifest i sve lokalne script/CSS reference postoje; provjera prolazi |
| Manifest | MV3; `chrome_url_overrides.newtab` upućuje na `newtab.html`; storage/search obavezni, tabs/tabGroups/bookmarks opcioni; bez host dozvola/content skripti |

Testovi pokrivaju protokol/host/port, interne i neispravne adrese, zakačene i već grupisane tabove, drugi prozor, 0/5/50/200 tabova, stabilno rangiranje, navigaciju i promjenu tabova tokom pregleda, zabranu uključivanja novih tabova, djelimični neuspjeh grupisanja i neuspjeh imenovanja grupe, validaciju podešavanja i nezavisne paralelne izmjene polja. Chrome adapter testovi koriste kontrolisani mock API; nisu dokaz stvarnog Chrome ponašanja.

## UI pregled

Osnovni prikaz pregledan u Google Chrome-u preko lokalnog HTTP-a. Odvojena detaljna provjera u ugrađenom Chromium browseru, kako se ne bi ometao korisnikov aktivni Chrome tab. Ovaj HTTP pregled jasno prikazuje da Chrome API nije dostupan; ne prikazuje izmišljene tabove.

| Širina × visina | Svijetla | Tamna | Nalaz |
|---|---|---|---|
| 1440×900 | [snimak](light-1440.png) | [snimak](dark-1440.png) | Agenda / tabovi / Gmail i muzika u tri kolone |
| 1280×720 | [snimak](light-1280.png) | [snimak](dark-1280.png) | Tri čitljive kolone; stranica se skroluje |
| 1024×768 | [snimak](light-1024.png) | [snimak](dark-1024.png) | Agenda i tabovi u dvije kolone; sporedni moduli ispod |
| 320×800 | [snimak](light-320.png) | [snimak](dark-320.png) | Jedna kolona, logički DOM redoslijed; document.scrollWidth = 320 |

Provjereno: izbor light/dark i čuvanje nakon reload-a; osnovni fokus ostaje na BODY u HTTP prikazu; otvaranje modala fokusira zatvaranje; Escape vraća fokus pokretaču; checkbox skriva/vraća Gmail; tema se prenosi u drugi otvoreni HTTP tab; vidljivo dugme fokusira pretragu; unos, Escape i izbor Web opsega imaju odgovarajuće stanje. Maksimalni glass vizuelno pregledan, a neprozirna osnova vraćena. Nema automatskog playbacka ili mrežnih widgeta. Završna konzola u odvojenom ugrađenom browseru nema error/warn poruka.

Kontrast je izračunat iz [tokena pročitani iz renderovanog DOM-a](rendered-tokens.json), za neprozirne osnovne površine: [rezultati](kontrast.json). Najniži kontrast glavnog teksta je 13.06:1, sekundarnog 5.61:1, akcenta 6.27:1 i funkcionalne kontrolne granice 3.17:1. Ovo nije puna provjera svih hover/focus/disabled i glass kompozitnih piksela niti tvrdnja WCAG usklađenosti.

## Granice i naredni korak

Korisnik je odobrio lokalno učitavanje i test pristup tabovima, oznakama i grupisanju. Browser bezbjednosna provjera blokirala je otvaranje `chrome://extensions/` jer alat dozvoljava samo HTTP/HTTPS protokole. Nije pokušavano zaobilaženje preko drugog browser interfejsa. Korisniku su dati ručni koraci. Nakon poruke „manifest file is missing“ provjeren je postojeći manifest i izlaz premješten u vidljivi `build/chrome-mv3`; potrebno je izabrati upravo taj folder u Load unpacked dijalogu.

Još nije potvrđeno:

- Stvarna zamjena novog taba, početni fokus Chrome adresne trake i konflikt sa postojećom new-tab ekstenzijom.
- Prihvatanje/odbijanje/ukidanje Chrome dozvola; stvarno aktiviranje/zatvaranje, bookmark rezultati i web pretraga preko podrazumijevanog servisa.
- Stvarno ručno grupisanje i promjena tabova tokom pregleda u zasebnom testnom prozoru.
- `chrome.storage.local` kroz dva učitana nova taba; HTTP pregled provjerio je samo fallback localStorage put.
- Browser zoom 200%, runtime reduced-motion postavka, sistemska promjena teme, čitač ekrana i kompletna tastaturna/kontrast matrica svih stanja.

CSS poštuje reduced-motion i nema dekorativnih animacija. Stvarni faviconi trenutno imaju lokalnu generičku ikonu; ne učitavaju se udaljeni resursi. Google OAuth, Calendar/Gmail sadržaj, RSS i playeri nisu implementirani. Nije rađen commit/push, remote ili objavljivanje. TAB-03 i TAB-04 ostaju U TOKU do odgovarajuće Chrome provjere.
