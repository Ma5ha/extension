# Kontrola postojećeg YouTube taba

Datum: 21. oktobar 2026. Faza: TAB-07 / TAB-07-A. Naknadno implementiran standardni DOM adapter u `src/media`; stvarni YouTube/Chrome prototipski test nije potvrđen. Istorijski prijedlozi ispod su istraživački kontekst.

## Proširenje: svi tabovi sa medijima

Korisnik želi objedinjenu kontrolu svih tabova koji reprodukuju ili mogu reprodukovati medije. Predloženi modul je „Mediji“, sa podrškom po mogućnostima izvora, bez obećanja pune kontrole svakog sajta.

- Osnovni nivo: Chrome `audible` signal identifikuje tabove koji su proizvodili zvuk; mute/unmute i otvaranje taba rade na nivou taba. Audible nije pouzdan dokaz trenutnog play/pause stanja. Mute ne zaustavlja reprodukciju. [Chrome Tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- Standardni nivo: uz odobren pristup sajtu adapter pronalazi HTML audio/video elemente i omogućava podržane play/pause, volume i seek komande. Pauzirani izvor ostaje u listi dok postoji; prazni tab bez medija ne mora se unaprijed prepoznati. [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
- Posebni izvori: Web Audio, zatvoreni shadow DOM i složeni servisi mogu zahtijevati poseban adapter ili imati samo osnovni mute. Iframe player zahtijeva pristup odgovarajućem frame originu; pristup glavnoj stranici nije automatski pristup svim okvirima. Interni Chrome tabovi i drugi zaštićeni konteksti nisu univerzalno dostupni za skripting. [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- Media Session API omogućava stranici integraciju sa browser/OS kontrolama; nije opšti javni Chrome API kojim Tabora može pozvati play/pause bilo kojeg drugog taba. [MediaSession](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession)

UI: lista izvora, naziv taba/sajta, odvojeno „Čuje se“/„Utišano“ i potvrđeno stanje playera; kontrole samo za otkrivene mogućnosti. Za više elemenata u tabu ponuditi izbor, ne pokretati sve odjednom. „Utišaj ostale“ i „Pauziraj ostale“ su različite radnje; automatsko utišavanje/zaustavljanje nije podrazumijevano, naročito za pozive.

Dozvole tražiti opciono po sajtu, bez tihog pristupa svim sajtovima. Široki pristup, ako kasnije bude potreban, mora biti eksplicitna korisnička opcija. Za osnovni nivo nije potrebno čitanje sadržaja stranice. Bez servera, preuzimanja audio streama ili obaveznih prijava. Stvarni prototip i matrica servisa ostaju preostali posao.

## Nalaz

Tehnički je izvedivo da Tabora bude daljinski upravljač već otvorenog YouTube taba, bez vlastitog servera, API ključa ili Google prijave za osnovne lokalne kontrole. Zaključak je izveden iz Chrome content-script/scripting mogućnosti i HTML media interfejsa; nije potvrđen prototipom na trenutnom YouTube sajtu.

Video ostaje u izvornom tabu. Tabora ne preuzima niti ponovo reprodukuje audio. Zatvaranje Tabore zato samo po sebi ne zatvara izvor; zatvaranje ili odbacivanje izvornog taba prekida kontrolu i može prekinuti reprodukciju.

## Predloženi pristup

1. Korisnik uključi „Kontrola YouTube taba“ i odobri pristup samo `https://www.youtube.com/*`. Posebno dodavati druge hostove samo ako postanu dio obima.
2. Uz `scripting` dozvolu, ekstenzija ubacuje svoj zapakovani adapter u odabrani postojeći YouTube tab. Alternativa je deklarisani content script; ne uvoditi oba mehanizma bez potrebe.
3. Adapter pronalazi aktivni video element i čita ograničeno stanje: paused, currentTime, duration, muted, volume i naslov.
4. Tabora šalje eksplicitne komande odabranom tabu; adapter potvrđuje izvršenje ili vraća razlog neuspjeha. Poruke prihvata samo od vlastite ekstenzije, sa validiranim komandama i vrijednostima.
5. Po otvaranju novog Tabora taba ponovo se očitava izvor. Ne oslanjati se na trajno aktivan service worker. Za već otvorene YouTube stranice inicijalni adapter mora biti ubačen bez zahtjeva da korisnik ponovo otvori video.

Chrome dokumentuje skripting uz dozvole i dijeljenje DOM-a kroz izolovane content skripte. [Scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting), [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

`activeTab` sam nije odgovarajuća trajna osnova za kontrolu drugog taba iz new-tab stranice. Prednost ima opcioni host pristup odobren pri uključivanju funkcije. [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [opcione dozvole](https://developer.chrome.com/docs/extensions/reference/api/permissions)

## Obim i granice

| Funkcija | Procjena |
|---|---|
| Play/pause | Kandidat za prvi prototip; koristiti stvarno potvrđeno stanje |
| Mute/unmute i jačina | Kandidat za prvi prototip kroz media element; posebno razlikovati utišan tab od utišanog videa |
| Naprijed/nazad 10 s | Provjeriti seekable opseg; live video i nepoznato trajanje zahtijevaju posebno stanje |
| Naslov i progres | Lokalno očitavanje; bez slanja istorije ili naslova van browsera |
| Sljedeći/prethodni video | Zavisno od playlist-e i YouTube kontrola; ne postoji univerzalni HTML next-track metod |
| Više YouTube tabova | Prikazati izbor izvora; audible je signal aktivnosti, nije dokaz da video nije pauziran |

HTML media interfejs pruža osnovne kontrole i događaje. `play()` može biti odbijen; korisniku tada ponuditi otvaranje izvornog taba. [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement), [play](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play)

YouTube IFrame API je namijenjen ugrađenom playeru koji kontrolišemo, ne daljinskoj kontroli proizvoljnog postojećeg youtube.com taba. Za postojeću stranicu adapter zavisi od njenog DOM-a; YouTube promjene mogu zahtijevati održavanje. [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)

Ne oslanjati se na nedokumentovane interne YouTube JS objekte. Ne uvoditi preskakanje reklama, ekstrakciju medija, zaobilaženje ograničenja ili automatsku reprodukciju kao dio ovog modula. Osnovne komande nisu garancija da će svaki tip sadržaja raditi.

## Potrebna provjera prije oznake ZAVRŠENO

Stvarni učitani MV3 paket: običan video, playlist-a, live, više YouTube tabova, već pauziran sadržaj, odbijena/ukinuta dozvola, promjena videa kroz YouTube navigaciju, zatvoren/odbačen tab i odbijen play. Provjeriti da otvaranje više Tabora stranica ne pokreće novi zvuk, ne duplicira adaptere i ne izvršava komandu dvaput. Dugmad next/previous prikazati samo kada je konkretna podrška potvrđena.

Sljedeći predloženi korak je mali TAB-07-YT prototip: izbor izvora + play/pause + mute + otvaranje izvornog taba. Ovo istraživanje nije nalog za implementaciju ili dodavanje dozvola.

## Implementacija TAB-07-A

Panel koristi zapakovanu `executeScript` funkciju u izolovanom kontekstu; nema page-world mosta ili poruka koje stranica može slati. Discovery ne pušta medij. Dokument i element imaju odvojene identifikatore; komanda ne prelazi na novi dokument poslije navigacije. Očitavanje svakih 2,5 s dok je stranica vidljiva, kao i Chrome događaji, osvježavaju stanje. Nema pretpostavke stalno aktivnog service workera.

Pristup se traži samo odabranom hostu; Chrome host match pattern ne ograničava port. Nedostupni iframe-i traže kontrolu u izvornom tabu; nema automatskog zahtjeva svim iframe originima. Otvoreni shadow DOM za sada se takođe ne pretražuje. Tab izvori bez DOM medija pamte se samo tokom životnog ciklusa panela; DOM izvori na odobrenim sajtovima otkrivaju se ponovo, uključujući pauzirane. Nema keširanja naslova u storage ili izvoza.

Aktuelna dokumentacija pregledana 21. oktobra 2026: [Chrome scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting), [permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions), [tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs), [WXT scripting](https://wxt.dev/guide/essentials/scripting). Implementacija nije dokaz kompatibilnosti svakog servisa; [provjere](provjere/mediji.md) odvajaju izvršene testove od preostale Chrome matrice.
