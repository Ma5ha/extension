# TAB-07-B — mini-player i opcioni video

Implementacioni obim: postojeći HTML audio/video izvori; kontrole u panelu, pomjerljivom okviru u Tabori i Document PiP prozoru. Video prikaz koristi izvorni video PiP. Nema proizvoljnog preslikavanja videa u Tabora DOM, capture-a, stream ekstrakcije, nove reprodukcije ili novih manifest dozvola.

## Ponašanje

MediaProvider živi iznad navigacionih grana glavnog i bočnog panela. Jedna instanca izvora i izbor elementa dijele sve prikaze unutar iste Tabora stranice. Različiti novi tabovi imaju sopstveni izbor kontrola, bez pokretanja dodatnog zvuka. Zatvaranje kontrola ne šalje pause. Video izbor je uvijek vezan za tačan izvorni dokument i element; navigacija na drugi dokument ne preusmjerava komandu.

Lokalni okvir ima ograničenu geometriju, pomjeranje/veličinu pokazivačem i tastaturom, izbor ugla i veličine, povratak u panel i Escape. Prozor iznad aplikacija zahtijeva klik korisnika i podršku browsera; sadrži samo naše kontrole i prati temu. Prozor ne nadživljava stranicu koja ga je otvorila. Polling koristi taj prozor dok je otvoren, pa skrivena Tabora ne zamrzava kontrole.

Video dugme se omogućava samo za podržan, učitan video. Ne uklanjaju se zabrane izvornog sajta. Native PiP zahtjev pokreće executeScript u istom korisničkom klik toku, prije await operacija, uz documentId ciljanje. Chrome dijeli PiP mjesto između video i Document PiP prozora; prelaz na video vraća naše kontrole u lokalni okvir. Neuspjeh ostavlja kontrole i jasnu mogućnost otvaranja izvornog taba.

## Provjera

Završni rezultat provjera vodi se u docs/progres.md i docs/provjere/mini-player/. Sintetički API/UI testovi nisu potvrda kompatibilnosti svih servisa ili stvarnog korisnikovog profila. Preostala stvarna matrica: običan YouTube video, live/playlist, iframe porijeklo, zabrana PiP-a, ukidanje dozvola, više Tabora tabova, zatvaranje/odbacivanje izvora i prelaz sa Document PiP kontrola na video.

## Primarni izvori

- [Chrome Document Picture-in-Picture](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)
- [Chrome video Picture-in-Picture](https://developer.chrome.com/blog/watch-video-using-picture-in-picture)
- [GoogleChromeLabs primjer ekstenzije](https://github.com/GoogleChromeLabs/picture-in-picture-chrome-extension)
