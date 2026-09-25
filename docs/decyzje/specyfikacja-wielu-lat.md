# SPEC: tryb wielu lat (2026 + 2027) — wiążące decyzje (zaakceptowane przez użytkownika)

> **Data:** 2026-09-25  
> **Status:** specyfikacja (wiążąca, zaakceptowana przez użytkownika). Sposób realizacji i odstępstwa: [rejestr decyzji](decyzje-implementacyjne.md), sekcja „Tryb wielu lat (2026 + 2027)”.  
> **Zakres:** tryb wielu lat kalkulatora: stałe per rok z metadanymi (status, źródło, termin), katalog `app/`, przełącznik roku i reguła roku domyślnego, wartości 2027 i ich statusy, scenariusz „Projekt zmian 2027 (UD458 + UD116)”, przejrzystość (oznaczenia prognoz), testy.  
> **Pierwotna nazwa pliku:** `SPEC_MULTIYEAR.md`. W treści `research_2027.md` = [research-2027.md](../prawo/research-2027.md), `research_2027_reforms.md` = [research-2027-reformy.md](../prawo/research-2027-reformy.md). Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Źródła: `research_2027.md` (stałe 2027, statusy), `research_2027_reforms.md` (UD458/UD116 – formuły, co potwierdzone).

## Architektura
- Jeden kod liczący, stałe per rok: `TAX_CONSTANTS_BY_YEAR = { 2026: {...}, 2027: {...} }` (+ ewentualnie `2027_reform` jako nakładka scenariusza). Bieżący zestaw wybierany w runtime; wszystkie funkcje taxMath/obliczeń biorą stałe z aktywnego roku (bez globali zaszytych na 2026; `ZUS_YEAR` itd. z aktywnego roku).
- Każda stała ma metadane: `status` ('final' | 'forecast' | 'draft'), `source` (URL/akt), `finalBy` (kiedy stanie się ostateczna, dla forecast/draft). Można jako równoległy obiekt `TAX_CONSTANTS_META_BY_YEAR`.
- Katalog aplikacji: przenieść `2026/` → `app/` (git mv, historia zachowana). `2026/index.html` zostaje jako przekierowanie do `../app/?rok=2026` (stare linki działają); root `index.html` → `app/`. Zaktualizować: testy (app/tests), tools/refmodel (APP_DIR domyślnie app/), package.json (lint), eslint.config.js, vitest.config.js, AGENTS.md (adres weryfikacji `http://localhost:5500/app/`), docs/README.md.
- Przełącznik roku w nagłówku (segment 2026 | 2027), stan w URL `?rok=2027` (history.replaceState, bez przeładowania; zmiana roku przelicza wszystko). Domyślny rok bez parametru: bieżący rok kalendarzowy, a od 1 listopada — rok następny, jeśli ma stałe; fallback do najnowszego dostępnego ≤ tego. Data "dzisiaj" tylko w warstwie UI (nie w matematyce) — testowalne przez parametr.
- Nagłówek „Stan prawny na …” per rok.

## Rok 2027 — wartości (wg research_2027.md; statusy!)
- Final: płaca minimalna 4 950; podstawa preferencyjna 1 485,00; minimalna zdrowotna 445,50/mies. (roczne minimum 12 × 445,50 — ta sama logika co 2026, udokumentowana w audycie); stawki ZUS emer./rent./chor.; stawki zdrowotne 9/4,9/9; progi ryczałtu 60k/300k i mnożniki; stawki PIT i progi obecnego prawa (120k/32%, kwota wolna 30k, 3 600); liniowy 19%; IP BOX 5%; danina 4% (bez IP BOX); ulga na start/mały ZUS/wakacje bez zmian; ulga 4+ 85 528; ulga na dzieci bez zmian.
- Forecast: prognozowane przeciętne wynagrodzenie 10 033 → podstawa pełna 6 019,80 (finalBy ~11.2026); FP 1,00% + FS 1,45% (finalBy ustawa budżetowa ~01–02.2027); wypadkowa 1,67% (final do 03.2027, forecast od 04.2027); limit odliczenia zdrowotnej liniowej 15 100 (finalBy 31.12.2026); przeciętne wynagrodzenie IV kw. 2026 ≈ 9 720 → zdrowotna ryczałt ≈ wyliczyć z formuły (60%/100%/180% × 9%) (finalBy ~22.01.2027).
- Harmonogram ZUS 2027: starty z 2025/2026 przenoszą ulgę/mały ZUS na 2027 (buildSocialSchedule już liczy starty sprzed roku — sparametryzować rokiem).

## Scenariusz „Projekt zmian 2027 (UD458 + UD116)” — przełącznik widoczny tylko dla roku 2027, domyślnie WYŁĄCZONY
- Wyraźny baner „projekt — nieuchwalony; stan na 25.09.2026; status: …” + link do źródeł; w eksporcie i na karcie najlepszego wyniku oznaczenie scenariusza.
- Skala: T(B) = B≤130k ? max(0, 12%·B − 3 600) : B≤150k ? 12 000 + 24%·(B−130k) : 16 800 + 32%·(B−150k). Dotyczy też wspólnego (2·T(½)) i samotnego rodzica. Wymaga uogólnienia kodu na N progów (tabela progów w stałych roku), z wyliczeniem w breakdown wg tabeli art. 27 ust. 1.
- Danina 5%; podstawa obejmuje kwalifikowany dochód IP BOX (UD116).
- Ryczałt: warunek limitu 250 000 EUR przychodu z 2026 (nowe pole „Przychód 2026 (limit ryczałtu)” widoczne tylko w scenariuszu; domyślnie = przychód z formularza; puste przy starcie w 2027 → warunek spełniony). Kurs EUR: średni NBP z 1.10.2026 (art. 4 ust. 2, bez zaokrąglenia) — do tego czasu forecast (najnowszy znany kurs, oznaczony). Przy niespełnieniu — ryczałt oznaczony „niedostępny” (poza rankingiem) z wyjaśnieniem.
- 17% od nadwyżki przychodu ponad 300 000 EUR w roku: s·min(R, 300k·r) + 17%·max(0, R − 300k·r). Odliczenia (składki społeczne, 50% zdrowotnej) — podział proporcjonalny do przychodu w części „s” i „17%” (założenie, oznaczyć jako niepotwierdzone, bo brak tekstu projektu). Wiele stawek: nadwyżka wg kolejności uzyskania — nieznana → proporcjonalnie (założenie, oznaczyć).
- Niepotwierdzone elementy (brak tekstu z RCL) opisać w modalu i przy wynikach (badge).

## Przejrzystość
- Badge „prognoza” przy wynikach zależnych od wartości forecast (lista, które wartości i kiedy ostateczne) — w wierszu wyniku (ikonka), w karcie najlepszego wyniku, w eksporcie (sekcja „Wartości prognozowane”), w modalu Założenia (tabela stałych roku ze statusem, źródłem, finalBy).
- Modal Założenia pokazuje stałe aktywnego roku.

## Testy / weryfikacja
- Testy jawne dla 2027 (kilka wyliczonych ręcznie przypadków: pełny ZUS 2 052,15/mies. z chorobową, preferencyjny, minimalna zdrowotna 5 346/rok, skala reformy dla B=140k i 200k, joint reformy, ryczałt 17% nadwyżka).
- Snapshoty — nie generować (użytkownik).
- tools/refmodel: rozszerzenie o rok 2027 zrobi NIEZALEŻNY weryfikator (nie implementator).
