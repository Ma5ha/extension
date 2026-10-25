# RSS/Atom — TAB-08-A

News navigacija sada prima ručno unesene HTTPS RSS 2.0/Atom URL-ove. Najviše 20 izvora, cache od 20 članaka po izvoru i objedinjeni pregled posljednjih 20 naslova. Saved articles prikazuje do 200 sačuvanih zapisa. Filter po izvoru, naslov/kratki tekst/datum, otvaranje originala i Save/Unsave. Ažuriranje pri dodavanju i ručno preko Refresh/Refresh all, bez pozadinskog periodičnog čitanja. Trenutna implementacija je News prikaz; poseban Work widget i oznake pročitanosti još nisu dodati.

Izvori i članci čuvaju se kao zasebni lokalni zapisi preko postojećeg adaptera. Cache je označen vremenom osvježavanja; greška ne briše prethodne naslove. Sačuvani članci ostaju poslije uklanjanja izvora. Čuva se naslov/opis/link, ne cijela stranica. Podaci su zajednički Work/Personal/Study prostorima. Novi izvori zahtijevaju HTTPS; otvaranje članaka podržava HTTP/HTTPS. URL sa kredencijalima i ostali protokoli se odbijaju.

Fetch u ekstenziji traži opcionu host dozvolu za konkretan HTTPS hostname koristeći već deklarisane optional_host_permissions; nema novih manifest dozvola. Dozvola se traži na submit/Allow access korisničkom gestu. Uklanjanje izvora ne ukida zajedničku host dozvolu (mogu je koristiti drugi moduli); korisnik je može ukinuti u Chrome-u. Ne šalju se cookies ni referrer. Redirect se odbija: unijeti konačni URL feeda. Timeout 20s, stream granica 2 MB. Nema proxy-ja, servera ili mrežnog favicon servisa.

XML se parsira kao inertni XML, DOCTYPE/ENTITY se odbijaju; HTML opisi se pretvaraju u ograničen tekst i renderuju isključivo kroz React tekst. Ne učitavaju se slike/iframe/skripte iz feeda. RSS 1.0/RDF, automatsko otkrivanje feeda sa HTML stranice i specijalne legacy encoding varijante nisu obuhvaćeni.

Provjere: typecheck/lint/build sa postojećim Google klijentom i diff --check prolaze. Ručni HTTP pregled učitao stvarni NASA feed https://www.nasa.gov/feed/, prikazao naslove/datum/cache timestamp; Save ažurira broj na 1 i zapis ostaje nakon reloada. Light/dark prikazi pregledani. Atom, Chrome grant/deny/revoke, offline, neispravan XML, timeout/redirect/veliki odgovor, uklanjanje izvora, puna tastatura i uski/zoom/reduced-motion nisu izvršno potvrđeni. Nema novih testova/QA skripti. TAB-08 ostaje U TOKU do integracione matrice.

Izvori provjereni 25. oktobra 2026: [Chrome mrežni zahtjevi](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests), [RSS specifikacija](https://www.rssboard.org/rss-2-0-11).

## TAB-08-B — opcione slike

Show article images je početno isključen i čuva se lokalno. Nakon uključivanja img elementi se dodaju samo za dostupne HTTPS image URL-ove iz feeda, uz loading=lazy, decoding=async i referrerPolicy=no-referrer. Uključivanje kontaktira image servere prema browserovim cookie/cache pravilima; slika može biti s drugog domena. Nema skidanja slika u repo, preuzimanja originalnog članka ili izvršavanja RSS HTML-a. U storage se čuva URL slike, ne njeni bajtovi; offline prikaz slike zavisi od browser cache-a. Greška slike uklanja thumbnail i ostavlja tekst.

Podržani izvori URL-a: Media RSS thumbnail/content (image MIME/medium ili poznata image ekstenzija), RSS enclosure sa image MIME, Atom enclosure i img src u description/summary/content:encoded/content tekstu ili Atom XHTML. HTTP/data/javascript URL slike se odbija. Starije naslove treba osvježiti; ranije sačuvani članak bez image polja ostaje tekstualan dok se ponovo ne sačuva iz osvježenog feeda.

Typecheck/lint/build/diff-check prolaze. Stvarni NASA RSS poslije refresha dao je 9 uspješno učitanih lazy slika u HTTP pregledu, potvrđen light/dark izgled. Ostale XML varijante i Chrome/CSP/offline/broken/uski/keyboard matrica nisu izvršno potvrđeni. [Media RSS specifikacija](https://www.rssboard.org/media-rss) provjerena 25. oktobra 2026. Screenshot: /private/tmp/tabora-rss-images.png. Nema novih testova.

## TAB-08-C — RSS widget

Work prikazuje RSS news widget sa pet najnovijih naslova iz istog lokalnog cache-a. Uključen je početno i ima zasebnu per-workspace vidljivost u Settings → Widgets. Novi news placement se dodaje postojećim layout-ima bez resetovanja redoslijeda ili širina. Podržava postojeće drag/kolona/visina kontrole. Izvori i Show article images ostaju zajednički sa News prikazom. Nema dodatnog automatskog fetch-a pri otvaranju taba; ručni Refresh pokreće isti adapter, a Open all news vodi na puni prikaz. Greške zadržavaju cache i upućuju na News za dozvole. Timestamp navodi najstariji update među učitanim izvorima. Stari sačuvani članci se ne prikazuju kao nove vijesti.

Typecheck/lint/build/diff-check i HTTP prikaz sa NASA slikama, visibility off/on i navigacija potvrđeni. Dark screenshot /private/tmp/tabora-rss-widget.png. Ostala integraciona/pristupačnost matrica ostaje otvorena.
