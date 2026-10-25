# Gmail — TAB-06-A

Implementirano: opciono Google povezivanje preko Chrome Identity, deset najnovijih inbox poruka, početni filter nepročitanih, pošiljalac/naslov/vrijeme i otvaranje razgovora u Gmailu sa nalogom iz API profila. Nema pretrage prema važećem korisnikovom nalogu, čitanja tijela, slanja, brisanja ili označavanja pročitanim. Lista je ograničeni pregled; ako ima još rezultata, UI upućuje na Gmail. Broj prikazanih poruka nije ukupan broj nepročitanih.

## Lokalno povezivanje

U istom Google Cloud projektu kao OAuth Chrome Extension klijent:

1. Omogućiti Gmail API.
2. Google Auth Platform → Audience → Test users: dodati tačan nalog.
3. Data Access → Add or remove scopes: dodati `https://www.googleapis.com/auth/gmail.metadata` i sačuvati.
4. Napraviti build sa postojećim javnim Client ID-jem:

```sh
TABORA_GOOGLE_CLIENT_ID='TVOJ_CLIENT_ID.apps.googleusercontent.com' corepack pnpm build
```

Reload učitane ekstenzije iz `build/chrome-mv3`, otvoriti novi Tabora tab, omogućiti Gmail widget ako je skriven, kliknuti Connect Gmail, pa odobriti novu Gmail dozvolu. Calendar saglasnost sama ne daje Gmail pristup. ID ekstenzije mora odgovarati Cloud klijentu. Client secret nije potreban. Varijabla iz komandne linije važi samo za tu komandu.

## Privatnost i životni ciklus

Sadržaj je skriven pri svakom mount-u widgeta/novom tabu. Show messages tek pokreće zahtjeve za profil i zaglavlja; Hide messages uklanja sadržaj i otkazuje zahtjeve. Izbor prikaza se ne čuva. Prije dijeljenja ekrana sakriti sadržaj u svim otvorenim Tabora tabovima zasebno. Privatni podaci se ne upisuju u storage, logove ili izvoz. Chrome Identity kešira tokene; lokalno se čuva samo uključenost integracije. Nema udaljenih slika, HTML-a ili tijela poruke.

OAuth se pokreće interaktivno samo dugmetom. Gmail i Calendar eksplicitno traže vlastiti scope. Odspajanje isključuje integraciju u svim Tabora tabovima i uklanja njen keširani token; ne čisti cijeli Identity keš. Ne opoziva Google saglasnost: za to koristiti Google nalog → povezane aplikacije. Zajedničke host/identity dozvole se ne uklanjaju jer ih drugi moduli mogu koristiti.

Vidljivi widget se osvježava svake dvije minute, pri povratku na tab/mrežu i ručno. Skriveni widget ne učitava poruke. Greška briše prethodne rezultate; nema offline keša. Prikaz razlikuje setup, nepovezano, loading, spremno/prazno/skriveno, odbijeno, isteklo, offline, 403, ograničenje zahtjeva i ostale greške. Timeout je 20 sekundi za cijelo učitavanje; 401 uklanja token i jednom ponavlja zahtjev. Zahtjevi se otkazuju pri promjeni filtera, skrivanju ili unmount-u; generacija sprečava zakašnjele rezultate.

`gmail.metadata` je Google restricted scope. Prije javnog izdanja dokumentovati i dovršiti primjenjivu Google verifikaciju i politiku privatnosti; lokalni test pristup nije javna verifikacija. Ne obećava se završena verifikacija ili bezuslovno oslobađanje od procjene bezbjednosti.

## Zvanični izvori provjereni 25. oktobra 2026.

- [Messages list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list) — INBOX/UNREAD label filteri, limit i paginacija; metadata ne podržava q.
- [Messages get](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get) — metadata format i izbor zaglavlja.
- [Profile](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/getProfile) — email naloga.
- [Scopes](https://developers.google.com/workspace/gmail/api/auth/scopes).
- [Chrome Identity](https://developer.chrome.com/docs/extensions/reference/api/identity).

## Provjera

Typecheck, lint i produkcioni build sa korisnikovim Client ID-jem prolaze. Nema novih testova/QA skripti. Stvarni Gmail OAuth i API rezultati, odspajanje uz aktivan Calendar i više tabova, prazno/odbijeno/offline/istek, vizuelna matrica light/dark/usko/zoom/reduced-motion i tastatura još nisu izvršno potvrđeni. Chrome interne stranice nisu dostupne browser konektoru; native pregled nije doveo do Tabora stranice. Nema sačuvanih privatnih snimaka.
