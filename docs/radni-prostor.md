# Nadogradnje radnog prostora

Datum: 21. oktobar 2026. Bez servera ili dodatnog naloga. Pretraga ostaje uklonjena.

## Chrome bookmarkovi — TAB-10-D

Widget čita isto Chrome stablo, uključujući foldere. Izbor foldera uključuje njegove podfoldere; linkovi su grupisani po stvarnom folder ID-ju, pa istoimeni folderi nisu spojeni. Grupe se sklapaju preko nativnog details/summary elementa. Prazni folderi ostaju u izboru. Pri dodavanju/uređivanju može se izabrati cilj: izmjena foldera poziva Chrome move za originalni bookmark. Upravljani folderi i zapisi nisu dostupni za izmjene. Naziv i premještanje su odvojene API radnje: djelimičan neuspjeh osvježava prikaz i traži provjeru rezultata.

Dugme Otvori linkove foldera prvo prikazuje potvrdu broja. Otvara samo HTTP/HTTPS adrese direktno u toj grupi, bez aktiviranja svakog novog taba, uklanja duplikate iz tog izbora i prikazuje otvoreno/preskočeno/neuspjelo. Ne zatvara postojeće tabove. Koristi postojeću opcionu bookmarks dozvolu. Ne pravi posebnu Tabora kopiju bookmarka.

## Sesije — TAB-04-B

Sačuvaj tabove čita stvarni trenutni prozor u trenutku čuvanja. Potreban je već postojeći opcioni pristup tabovima. Sesija ima naziv i lokalno čuva URL, naslov i pinning podobnih HTTP/HTTPS tabova (do 500); interne stranice, adrese sa kredencijalima i nepodržani protokoli se preskaču. Rezultat navodi sačuvano/preskočeno. Svaka sesija ima sopstveni storage ključ.

Pregled i otvaranje pokazuje sadržaj prije primjene. Otvaranje koristi trenutni prozor, preskače već otvorene adrese i nastavlja nakon greške jednog taba, uz tačan djelimičan rezultat. Trenutni tabovi se ne zatvaraju. Sesija ne čuva sadržaj forme, prijavu, istoriju navigacije, položaj skrola ili Chrome tab grupe. Uklanjanje sačuvane sesije ima posebnu potvrdu i ne zatvara tabove.

## Fokus i bilješke — TAB-10-E

Tri zadatka po lokalnom kalendarskom danu, svaki do 200 znakova. Svaki zadatak ima zaseban storage ključ, tekst se čuva dugmetom ili Enter-om, a završenost checkboxom. Pri promjeni dana prikazuju se nova tri mjesta; jučerašnji podaci se ne brišu. Datum se provjerava pri povratku na stranicu i svakih 30 sekundi.

Bilješka je običan tekst do 20.000 znakova, čuva se eksplicitnim dugmetom i dostupna je u novom tabu i bočnom panelu. Nesačuvani nacrt ne prepisuje se promjenom iz drugog taba. Za istovremeno čuvanje iste bilješke/zadatka važi posljednji upis. Zatvaranje ili premještanje widgeta prije čuvanja može odbaciti nesačuvani nacrt; UI označava nesačuvane izmjene. Lokalni moduli rade bez mreže.

## Raspored — TAB-10-F

Od 25. oktobra 2026. jedini raspored je Custom widgets (TAB-10-P). Uklonjeni su izbor režima i Radna konzola. Staro polje `layoutMode` čita se radi kompatibilnosti i normalizuje na `custom`; sačuvani `layout`, širine, visine i vidljivost widgeta ostaju sačuvani za svaki radni prostor.

Uredi raspored uključuje kontrole; Završi uređivanje ih sakriva. Widget se prevlači ručkom na drugu kolonu ili ispred drugog widgeta. Iste radnje dostupne su kroz izbor Lijevo/Sredina/Desno i dugmad gore/dolje. Širine su podesive po koloni; visina je prirodna ili najmanje 360/560 px, a sadržaj može povećati karticu. Nema skraćivanja sadržaja ili obaveznih unutrašnjih skrolova. Prazne kolone se uklanjaju iz prikaza van režima uređivanja.

Raspored se čuva lokalno i prenosi na ostale Tabora stranice. Upisi podešavanja se serijalizuju, prikaz se osvježava odmah, greška čuvanja ima obavještenje. Neispravan raspored se normalizuje bez gubitka poznatih widgeta. Vrati početni raspored vraća Modularni atelje. Vidljivost modula ostaje u Podešavanjima. Na užim ekranima raspored prelazi u dvije/jednu kolonu i čuva DOM redoslijed.

## Bočni panel — TAB-10-G

Pravi Chrome sidepanel entrypoint je `sidepanel.html`; otvara se preko Tabora toolbar ikone ili dugmeta u novom tabu. Manifest sadrži side_panel, action i background service worker, uz sidePanel dozvolu. SidePanel dozvola dodata je kao obavezna za ovu funkciju; sama ne autorizuje čitanje tabova/bookmarka/Google podataka. Ostale dozvole ostaju opcione.

Panel prikazuje iste bookmarkove, postojeće medijske kontrole i fokus/bilješke, uz zajednička podešavanja teme i lokalne podatke. Ne pokreće drugi player. Google OAuth preduslovi nisu promijenjeni.

## Provjere

Model/API testovi pokrivaju filtriranje URL-ova, djelimične rezultate otvaranja, folder/managed granice, izolovane sesije i validaciju/uređivanje rasporeda. `scripts/verify-workspace.mjs` pokreće lokalni HTTP pregled produkcionog build-a sa sintetičkim Chrome API-jima u odvojenom headless browseru. Rezultati i slike su u `docs/provjere/workspace/`. Ovo provjerava DOM/UI i ugovore sintetičkih API-ja; ne potvrđuje stvarne Chrome dozvole, stvarni toolbar gest ili nativni životni ciklus bočnog panela. Testovi ne pristupaju korisničkom browser profilu. Reduced motion je uključen tokom pregleda; browser zum 200% i puna pristupačnost nisu potvrđeni.

QA skripta koristi instalirani Playwright (`TABORA_PLAYWRIGHT_PATH` može navesti njegov ESM ulaz); `TABORA_CHROMIUM_PATH` opciono bira već instalirani browser. Nisu dodate produkcione zavisnosti.

Izvori: [Chrome bookmarks](https://developer.chrome.com/docs/extensions/reference/api/bookmarks), [Chrome sidePanel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel), [WXT entrypoints](https://wxt.dev/guide/essentials/entrypoints.html).

## Radni tokovi — TAB-10-O, 23. oktobar 2026.

Implementirani Work/Personal/Study prostori; Work zadržava stare ključeve bez migracije ili brisanja. Personal/Study koriste svoje prefikse za raspored, module, sesije, zadatke, opšte i URL bilješke. Tema/font/materijal ostaju zajednički. Izbor prostora je sessionStorage po tabu; promjene podataka istog prostora osvježavaju druge Tabora prikaze. Bočni panel ima isti izbor prostora. Prebacivanje ne otvara/ne zatvara tabove ili sesije.

Focus ostavlja timer i FocusPanel, sklanja navigaciju i ostale glavne panele; Exit focus vraća prethodni prikaz. Quick note uređuje sačuvanu bilješku prostora. Page notes su običan tekst do 20.000 znakova za tačan HTTP(S) URL, s dostupnim pregledom u Notes i poslije zatvaranja taba. Prazan sačuvan tekst uklanja bilješku iz liste. Nesačuvani zadatak/bilješka se ne odbacuju pri promjeni prostora/prikaza/fokusa bez upozorenja.

Duplikati se porede po tačnoj adresi sa query/fragment dijelom. Nema preselektovanih kopija. Pregled zahtijeva da ostane bar jedna kopija, a aktivne/pinned tabove nije moguće izabrati. Prije svakog zatvaranja ponovo se čita isti prozor, provjerava originalni ID/adresa i postojanje kopije koja ostaje; novi tabovi se ne dodaju u izbor. Izvještaj razlikuje zatvoreno/preskočeno/neuspjelo.

Podsjetnik zadatka ima lokalni datetime i identitet prostora/dana/indeksa. Worker pri završetku ponovo čita stvarni zadatak; završeni/prazni zadaci ne šalju obavijest. Storage događaji otkazuju podsjetnik kada se zadatak završi ili isprazni. Serijalizovan reminder worker obnavlja aktivne rokove pri startu. Timer je jedan zajednički svim prikazima, pauza/nastavak čuvaju ID/trajanje/prostor sesije. Završetak i istorija upisuju se jednim storage upisom; reset ne upisuje nezavršenu sesiju. History grupiše završetke po lokalnom danu i prostoru, prikazuje broj sesija i minute te posljednjih 30 sesija. Timere koji su započeti prije dodavanja istorije bez metapodataka ne dopisuje retroaktivno.

Alt/Option+Shift: F fokus, T novi 25-minutni timer ili pauza/nastavak, N bilješka prostora, 1/2/3 izbor prostora. Ignorišu input/textarea/select/contenteditable, IME, ponavljanje i otvorene dijaloge; nema globalnih browser prečica.

Provjera: typecheck/lint/build/diff prolaze. Postojeći testovi 55/57: dva pada su prethodni prevodi Calendar All day i PiP poruke, bez izmjene tih testova ili ranijih prevoda. Izolovani HTTP browser: čuvanje zadatka i bilješke, prazan Personal/povratak Work, nezavisan clock izbor, fokus, prečice i njihovo ignorisanje tokom pisanja, timer početak/pauza i stvarni jednominutni istek sa istorijom samo u Work. Light 1440 i dark 1024/320 vizuelno pregledani; stvarni 320px viewport ima document.scrollWidth 320, bez JS grešaka. Privremeni snimci su van repoa; nema novih testova/QA fajlova ili infrastrukture. Stvarni Chrome notifications, task delivery, duplicate close, native PiP i multi-tab/restart/sleep ostaju neprovjereni.

API izvori: [Chrome alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [Chrome tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs).
