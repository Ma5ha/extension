# TAB-07-B — provjera mini-playera

22. oktobar 2026. Implementirano i sintetički provjereno.

- Typecheck, lint bez upozorenja, 57/57 testova, build i git diff --check prolaze.
- Fokusirana skripta scripts/verify-media.mjs: izbor izvora kroz navigaciju, odsustvo autoplay-a, play/pause/seek/volume i video PiP komande, drag/tastatura/resize/preset položaja i veličine, route persistence i dock, dark 320px reflow, Escape, tema i polling u skrivenom openeru, ručno zatvaranje/odbijanje/otkazivanje zakašnjelog prozora, onemogućena video akcija i zatvoren izvor.
- Pageerror/console error: 0. Eksterni zahtjevi: 0. Izolovan profil, samo sintetički izvori Alpha/Beta i javne fixture ikonice.
- Postojeći scripts/verify-console.mjs regresioni pregled glavnog i bočnog panela prolazi; snimci su u ignorisanom test-results/mini-player-regression.
- Vizuelno pregledani light-1280.png, dark-320.png i controls-window.png. Reduced motion uključen.

Document PiP se u browser QA simulira same-origin prozorom; izvorni video koristi scripting fixture. Ovi testovi potvrđuju naš UI i lifecycle kod, ne stvarni sistemski PiP ili podršku pojedinih servisa. Stvarni browser zoom i puni accessibility audit nisu izvršeni. Stvarna matrica i uputstvo su u ../../mini-player.md; korisnikov sljedeći korak je Reload ekstenzije i probni otvoreni medij.
