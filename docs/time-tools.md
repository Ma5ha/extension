# Time tools — TAB-10-T

Tri kartice u dnevnom pregledu: Timer, Alarm i Stopwatch. Number/time polja imaju velike mete i tabularni prikaz; Timer nudi 5/15/25/45-min presete. Timer prihvata cijele minute od 1 do 1440 i omogućava pause/resume/reset. Alarm koristi lokalnu zonu i sljedeće pojavljivanje izabranog vremena; prikazuje dan zakazanog alarma. Stopwatch podržava start/pause/resume/reset, čuva početnu vremensku oznaku i proteklo trajanje lokalno i sinhronizuje prikaz kroz postojeći storage adapter. Promjena sistemskog sata može uticati na stopwatch; ovo nije profesionalno monotono mjerenje.

## Zvuk

`public/reminder-chime.wav` je originalno sintetizovan, lokalno pakovan dvostruki trotonski chime (2.6 sekundi, mono PCM, 24kHz). Nema preuzetih audio asseta, udaljenog playera, mreže niti reprodukcije pri otvaranju taba. Sound on/off je lokalni zajednički izbor za timer i alarm, početno uključen prema korisnikovom nalogu. Preview sound omogućava provjeru reprodukcije i prikazuje grešku ako je blokirana.

U ekstenziji zvuk pokreće centralni background nakon evidentiranja završenog timera/alarma. Postojeći red operacija i uklanjanje aktivnog end-a sprečavaju da više novih tabova pusti više zvukova za isti završetak. `sound.ts` provjerava postavku i kreira najviše jedan offscreen dokument, uz promise zaštitu pri konkurentnom kreiranju. `entrypoints/reminder-audio` koristi samo runtime messaging i lokalni Audio asset. Nova manifest dozvola `offscreen` je potrebna zbog audio reprodukcije dok nema otvorenog Tabora taba; razlog je AUDIO_PLAYBACK. Chrome zatvara taj dokument poslije 30 sekundi bez zvuka. Nema posebne trajne pozadinske stranice.

Zvuk je kratak i sam se završava; nema ponavljanja ni obaveznog stop dugmeta. Task podsjetnici zadržavaju obavještenja, bez ovog zvuka. Neuspjeh audio reprodukcije ne sprečava upis završetka ili pokušaj notifikacije. Browser/system mute, jačina i sleep mogu uticati na čujnost i vrijeme; pri sleep-u alarm se obrađuje nakon buđenja. HTTP preview podržava probu zvuka, ali završni pozadinski zvuk radi samo u ekstenziji.

## Provjere i granice

Typecheck, lint, produkcioni build sa postojećim Google OAuth Client ID-jem i git diff --check prolaze. U paketu postoje offscreen permission, reminder-audio HTML/JS i WAV asset. HTTP pregled 1280×720 u light/dark temama potvrđen; ručno provjereni preset 25 minuta, start/pause/reset timera, start/pause/reset stopwatch-a, postavljanje/cancel alarma i Preview sound bez prijavljene greške. Screenshot: /private/tmp/tabora-time-tools-dark.png. Nema privatnih snimaka ni novih testova/QA skripti.

Stvarna Chrome offscreen reprodukcija na završetku, zatvoreni svi Tabora tabovi, više tabova, sleep/wake, sistemski mute, uski prozori, zoom, reduced motion i puna tastatura još nisu izvršno potvrđeni. Nakon Reload-a ekstenzije prvo Preview sound, zatim timer od jednog minuta i alarm; ponoviti sa više tabova i bez otvorenog Tabora taba. Ne tvrdi se garantovana čujnost u svim OS/browser postavkama.

Zvanični izvori provjereni 25. oktobra 2026:
- [Chrome Offscreen API](https://developer.chrome.com/docs/extensions/reference/api/offscreen).
- [WXT entrypoints](https://wxt.dev/guide/essentials/entrypoints).

## TAB-10-U — prijavljena tišina

Korisnik potvrđuje da prethodni Preview sound nije bio čujan. Nova verzija proba zvuk direktno iz klika na UI; worker i offscreen koriste port spremnosti i potvrdu sa ID-jem zahtjeva umjesto početnog sendMessage. Offscreen bez porta nakon worker restarta se ponovo kreira. Literalne context/reason vrijednosti izbjegavaju zavisnost od runtime enum objekata. Audio element je dodat u DOM, volume je 0.9; pozadinske greške nisu više nevidljive, već se prikazuju u panelu preko boolean storage zastavice. Čujnost u stvarnom Chrome-u i konkretan prvobitni uzrok nisu potvrđeni; typecheck/lint/build prolaze. Potrebni su Reload, novi tab i proba. Prethodni HTTP uspjeh znači samo da Audio.play nije prijavio grešku, ne da je korisnik čuo zvuk.
