# TAB-07-A — provjera Medija

21. oktobar 2026, Europe/Belgrade. Implementacija: `src/media`, `src/App.tsx`, `src/components/SettingsPanel.tsx`, `wxt.config.ts`.

Automatizovano: typecheck, ESLint, Vitest i produkcioni WXT build; konačan ishod evidentiran u progresu. Testovi pokrivaju uski host zahtjev, odbijenu dozvolu, discarded tab, ciljanje dokumenta, navigaciju, više elemenata, live seek granice, odbijen play i odsustvo autoplay pri discovery. Ovo su unit testovi sa test dvojnicima, nisu dokaz izvršenja Chrome skriptinga.

HTTP UI: light/dark osnovni raspored na 1280×720, 320×800 reflow bez horizontalnog preliva (scrollWidth 320), prostor Muzika i osnovni tastaturni prelaz. Vidljiv je samo stvarni fallback „Chrome ekstenzija“; nema sintetičkog playbacka. Nema tvrdnje pune WCAG provjere.

Stvarni Chrome pregled nije izvršen: native computer-use prijavio zaključan Mac. Prije oznake TAB-07-A ZAVRŠENO reloadovati paket `build/chrome-mv3` i provjeriti:

- Bez tabs dozvole, odbijanje, odobrenje; početna lista audible izvora iz više prozora.
- Tab mute/unmute je različit od pause; otvaranje pravog prozora i taba.
- Pauzirani tab kroz izbor i dozvolu samo jednom hostu; reload Tabore ponovo otkriva pauzirani DOM izvor.
- Običan audio/video, YouTube video/playlist/live, više elemenata, promjena videa i navigacija tokom komande.
- Play odbijen ili ograničena jačina, seek izvan live opsega; iframe bez pristupa, Web Audio i shadow DOM fallback.
- Ukidanje dozvole u panelu i Chrome-u, zatvoren/odbačen tab; ponovno osvježavanje.
- Dva Tabora taba: bez novog zvuka, automatskog play-a ili pauziranja drugih izvora/poziva; zatvaranje Tabore ne mijenja izvor.
- Obje teme, glass, uski prikaz sa aktivnim kontrolama, kompletna tastatura, 200% zoom i reduced motion.

Podrška za servis se bilježi tek nakon stvarnog testa. Nema posebnih YouTube/Spotify adaptera, naloga, snimanja ili izdvajanja streama. Lokalni mediji nemaju mrežni loading/offline tok: nema zahtjeva servisu, a nedostupno stanje izvornog sajta prikazuje se kroz stanje DOM playera ili fallback.
