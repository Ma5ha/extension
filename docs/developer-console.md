# Developer console — TAB-10-X

Work dobija Developer console widget, početno vidljiv, sa zasebnim per-workspace checkbox-om u Settings → Widgets i postojećim drag/kolona/visina kontrolama. Stari layout dobija console placement u centru, bez resetovanja postojećih itema i širina.

Obim: ručni izbor jednog HTTP(S) taba iz trenutnog prozora, Connect/Disconnect, console log/info/warning/error/debug i neuhvaćene JavaScript greške, browser Log događaji, filter nivoa i Clear view. Nema Runtime.evaluate, JavaScript unosa, getProperties, DOM izmjena ili network body capture-a. Objekti se prikazuju kao ograničen tekstualni opis, ne interaktivno stablo. Browser može isporučiti ranije zadržane logove pri Runtime.enable; potpuna istorija nije garantovana. Cross-process iframe/worker auto-attach nije uključen. Chrome interne, extension i Web Store stranice nisu ponuđene.

## Dozvole i upotreba

Chrome ne podržava debugger u optional_permissions. Dodata je required manifest dozvola debugger, koja ima široko upozorenje. To nije host dozvola ograničena na jedan sajt; Tabora u implementaciji povezuje samo tab izabran ručnom radnjom. Postojeća tabs dozvola služi za listu i informacije o tabu i traži se postojećim Allow tab list tokom. Nakon Reload-a Chrome može zatražiti potvrdu proširenih dozvola. Agent nije prihvatio ovu potvrdu ni povezao korisnikov tab tokom provjere.

Reload ekstenzije → novi Tabora tab → Developer console (po potrebi uključiti u Settings → Widgets) → Allow tab list ako je potrebno → izabrati običnu web stranicu → Connect. Ako drugi DevTools/debugger koristi tab ili ga politika blokira, widget prikazuje grešku. Prvo zatvoriti DevTools i pokušati ponovo. Chrome prikazuje vlastitu oznaku debugginga i može otkazati vezu. Nema automatskog povezivanja pri otvaranju taba.

## Životni ciklus i privatnost

Background vodi jedan owner port i jednu debugger sesiju. Drugi Tabora widget ne dobija tuđe logove; mora sačekati odspajanje vlasnika. Zatvaranje/unmount widgeta (uključujući odlazak sa Work ili hide u Settings), Disconnect, promjena URL-a ciljnog taba ili uklanjanje tabs/debugger dozvole prekidaju vezu i brišu buffer. Target close/user cancel/onDetach čisti prikaz. Na navigaciji nema tihog nastavka na novoj stranici. Browser reload ne vraća povezivanje automatski.

Logovi su samo u memoriji service worker-a i povezanog widgeta; nisu upisani u storage, repo, izvještaje ili izvoz. Najviše 200 zapisa; 4000 znakova teksta i 1000 lokacije po zapisu, prvih 20 argumenata; slanje UI ažuriranja grupisano na 100ms. Clear view briše Tabora buffer, ne briše Chrome konzolu. Samo ugrađene extension stranice mogu otvoriti upravljački port; content-script porijeklo nije prihvaćeno. Logovi se renderuju kao React tekst/pre, bez HTML izvršavanja. Widget može prikazati osjetljive podatke koje sam sajt ispisuje, pa ih ne snimati u QA screenshotove.

## Provjere

Typecheck, lint i produkcioni build sa postojećim Google Client ID-jem te git diff --check prolaze. Manifest sadrži debugger u permissions. HTTP preview potvrđuje prisustvo widgeta/checkbox-a, off uklanja heading (0), on vraća i prikazuje iskreno extension-only stanje bez sintetičkih logova. Dark screenshot bez privatnih podataka: /private/tmp/tabora-console-widget.png. Nema novih testova/QA skripti.

Stvarni attach/event capture/detach, runtime grant/reload upozorenje, navigacija/cancel/devtools konflikt, više Tabora tabova, browser restart, log burst i light/narrow/keyboard/zoom/reduced-motion matrica još nisu izvršno potvrđeni. Ovo je implementiran prototip za korisničku Chrome probu, ne potvrđena univerzalna podrška.

Zvanični izvori provjereni 25. oktobra 2026:
- [Chrome Debugger API](https://developer.chrome.com/docs/extensions/reference/api/debugger).
- [Neopcione dozvole](https://developer.chrome.com/docs/extensions/reference/api/permissions).
- [CDP Runtime](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/).

## Bočni meni

Settings → Sidebar omogućava izbor prikazanih stranica, uključujući Developer console. Izbor važi globalno; Work ostaje dostupan. Console stranica radi nezavisno od uključivanja console widgeta. Skrivanjem aktivne stranice prikaz prelazi na Work. Izlazak iz prikaza prekida vezu i čisti memorijske zapise; za novu sesiju izaberi tab i Connect. Ovo je navigacija unutar Tabore, ne Chrome side panel.

### Dijagnostika povezivanja

Nakon promjene build-a uraditi Reload ekstenzije na chrome://extensions i otvoriti novi Tabora tab. Connect čeka odgovor background servisa; nedostupan servis, debugger dozvola, zauzet debugger i nepodržan target imaju poruke. Neuspjeh oslobađa vlasništvo nad vezom. Interni port provjerava sender.id, bez zahtjeva da URL Chrome override stranice počinje extension URL-om. Stvarni attach nakon ove popravke još nije potvrđen.
