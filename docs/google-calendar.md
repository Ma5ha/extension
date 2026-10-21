# Google Calendar — TAB-05-A

Prvi obim: read-only primarni kalendar, događaji današnjeg lokalnog dana, ponavljanja proširena u pojedinačne događaje, naredni današnji vremenski događaj i Google Meet link ako postoji. Ne učitava druge kalendare i ne kreira događaje. Sva vremena prikazana su u označenoj browser vremenskoj zoni; cjelodnevni datumi ostaju datumi. API kraj cjelodnevnog događaja je isključiv.

## Google Cloud konfiguracija

1. U svom Google Cloud projektu omogući Google Calendar API i podesi OAuth consent screen. Za aplikaciju u test režimu dodaj svoj nalog kao test korisnika.
2. Napravi OAuth klijent tipa **Chrome Extension**, sa ID-jem lokalno učitane Tabore. Client secret nije potreban i ne unosi se u projekat.
3. Pokreni build sa javnim client ID-jem:

```sh
TABORA_GOOGLE_CLIENT_ID='TVOJ_CLIENT_ID.apps.googleusercontent.com' corepack pnpm build
```

Ista varijabla važi za `corepack pnpm dev`. Opciona `TABORA_EXTENSION_KEY` prima javni manifest key za stabilan ID. Nikada ne unositi privatni ključ. OAuth client ID mora odgovarati ID-ju konkretno učitane ekstenzije; WXT privremeni dev profil i promjena putanje mogu koristiti drugi ID. Uputstvo ne kreira Cloud projekat i ne objavljuje ekstenziju.

Bez client ID-ja build normalno radi, ne uključuje oauth2 manifest polje i agenda prikazuje da povezivanje nije podešeno. Nema izmišljenog naloga ili događaja.

## Autorizacija i podaci

Dugme Poveži traži opcione `identity` i `https://www.googleapis.com/*` dozvole, zatim Google pristup `calendar.events.owned.readonly`. OAuth se interaktivno pokreće samo pritiskom na dugme. Zahtjevi koriste primarni kalendar; scope je ograničen na čitanje događaja kalendara koje korisnik posjeduje. Chrome pamti tokene u vlastitom Identity kešu; Tabora ne upisuje tokene ili događaje u storage, logove ili izvoz. Lokalno se čuva samo uključenost kalendara.

Odspajanje prvo isključi modul i sinhronizuje ostale otvorene Tabora stranice, zatim poziva clearAllCachedAuthTokens. Time se čisti Identity stanje ove ekstenzije; buduća Gmail integracija mora uskladiti ponašanje jer je keš zajednički. Ovo nije opoziv Google saglasnosti. Za to postoji [Google pregled povezanih aplikacija](https://myaccount.google.com/connections). Odspajanje ne uklanja host dozvolu koju medijski modul može koristiti.

Događaji se očitavaju po otvaranju, povratku na vidljiv tab, povratku mreže i svakog minuta dok je Tabora vidljiva. Prikaz navodi vrijeme posljednjeg učitavanja. Tokom neuspjelog osvježavanja prethodni sadržaj se uklanja; nema trajnog offline keša. Mrežni zahtjevi imaju granicu od 20 sekundi i AbortController; zakašnjeli rezultati se zanemaruju nakon novog zahtjeva ili odspajanja. Sve stranice dnevnih rezultata se učitavaju; 401 uklanja token i jednom ponavlja zahtjev bez dijaloga.

## Izvori

- [Chrome Identity](https://developer.chrome.com/docs/extensions/reference/api/identity?hl=en)
- [Chrome Google OAuth](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth)
- [Opcione dozvole](https://developer.chrome.com/docs/extensions/reference/api/permissions)
- [Calendar scopes](https://developers.google.com/workspace/calendar/api/auth)
- [Events list](https://developers.google.com/workspace/calendar/api/v3/reference/events/list)

Prije javnog izdanja provjeriti zahtjeve Google verifikacije i politiku privatnosti. Stvarna Google autorizacija nije potvrđena bez konfigurisanog klijenta. Korisnik je odložio svoje ručne Chrome provjere; one nisu kriterijum za početak ovog koraka i nisu označene završenim.
