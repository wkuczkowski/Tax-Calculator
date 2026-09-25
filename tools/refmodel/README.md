# Model referencyjny: narzędzie regresji dla kalkulatora (`app/`)

## Po co to jest

`refModel.mjs` to **niezależny model obliczeń** (PIT w czterech formach, składka zdrowotna, składki społeczne ZUS miesiąc po miesiącu, FP/FS, wakacje składkowe, danina, IP BOX, rozliczenie z małżonkiem, ryczałt z wieloma stawkami) na lata 2026 i 2027 (2027: obowiązujące prawo oraz scenariusz projektu UD458 + UD116). Model został napisany **z przepisów i udokumentowanych decyzji**:
- [`docs/prawo/`](../../docs/prawo/),
- [`docs/decyzje/specyfikacja-zus.md`](../../docs/decyzje/specyfikacja-zus.md), w tym ADDENDUM A1–A10,
- [`docs/decyzje/decyzje-implementacyjne.md`](../../docs/decyzje/decyzje-implementacyjne.md).

**Autor modelu nie czytał kodu aplikacji** (`app/script.js`, `app/taxConstants.js`).

Skrypty w tym katalogu uruchamiają prawdziwą aplikację w jsdom, wyłącznie przez DOM (loader testów `app/tests/helpers/loadCalculator.js`). Wyniki aplikacji porównują z modelem. Rozbieżność oznacza błąd po jednej ze stron albo różnicę interpretacji, którą trzeba nazwać.

### Zasada niezależności: nie łam jej

- **Nie kopiuj kodu z `app/script.js` ani `app/taxConstants.js` do `refModel.mjs`.** Nie „poprawiaj” modelu tylko po to, żeby zgadzał się z aplikacją. Porównanie dwóch kopii tego samego kodu niczego nie dowodzi.
- Model zmieniaj tylko z dwóch powodów:
  - zmienia się prawo (np. nowe kwoty na kolejny rok);
  - zapada nowa decyzja interpretacyjna. Najpierw zapisz ją w [`docs/decyzje/decyzje-implementacyjne.md`](../../docs/decyzje/decyzje-implementacyjne.md), potem zmień model.
- Stałe (`CONSTANTS_2026`, `CONSTANTS_2027`, nakładka `REFORM_2027` w `refModel.mjs`; aktywny zestaw to `C`) mają przy sobie podstawę prawną i status (final / prognoza / projekt). Przy aktualizacji przepisz je ze źródła, a nie z `taxConstants.js`.
- Interpretacje sporne są przełącznikami w `DEFAULT_OPTIONS`. Domyślne wartości odpowiadają decyzjom przyjętym w aplikacji. `genCases.mjs` zapisuje w `expected.json` (pole `alt`), jak zmieniłyby się wyniki przy każdej alternatywnej interpretacji.

## Pliki

| Plik | Rola |
|---|---|
| `refModel.mjs` | Model. Eksportuje `computeAll(input, options)`. Format wejścia jest opisany w nagłówku pliku. |
| `genCases.mjs` | Generator siatek przypadków brzegowych: 2026 (grupy A–N, 396 przypadków) → `cases.json` / `expected.json`; 2027 (grupy 27A–27N i 27R, 321 przypadków, obowiązujące prawo i projekt) → `cases2027.json` / `expected2027.json`. Wyniki modelu + `alt`. |
| `cases.json`, `cases2027.json` | Wejścia, jeden przypadek na linię. Wszystkie kwoty w pełnych groszach (generator to sprawdza). |
| `expected.json`, `expected2027.json` | Migawka wyników modelu, jeden przypadek na linię. Służy do wykrywania dryfu modelu (`--check`) i do przeglądania wyników. Nie wpływa na `compare.mjs`, który liczy model na bieżąco. |
| `compare.mjs` | Główne porównanie: aplikacja vs model dla każdego przypadku z `cases.json` (`--year=2027`: `cases2027.json`). Eksportuje też `runApp()` dla pozostałych skryptów. |
| `checkBreakdown.mjs` | Spójność tekstu „Pokaż szczegółowe obliczenia” na próbce 60 przypadków 2026 albo 78 przypadków 2027 (`--year=2027`; szczegóły niżej). |
| `fuzz.mjs` | Losowy test różnicowy aplikacja vs model (ziarno ⇒ powtarzalny; `--year=2027` losuje też scenariusz projektu i przychód 2026). |
| `checkHand.mjs` + `HAND_CHECKS.md` | 6 przykładów 2026 i 4 przykłady 2027 (Y1–Y4, w tym projekt) policzone ręcznie (148 liczb) porównane z modelem. Sprawdza sam model, bez aplikacji. |
| `out/` | Wyniki szczegółowe ostatniego uruchomienia (JSON). Katalog jest w `.gitignore`. |

## Jak uruchomić

Z katalogu głównego repo (wymaga `npm install`):

```sh
npm run verify:refmodel     # compare.mjs: 396 przypadków (ok. 6 min)
npm run verify:breakdown    # checkBreakdown.mjs: 60 przypadków (ok. 1 min)
npm run verify:fuzz         # fuzz.mjs: 200 losowych wejść × ziarna 7, 99, 2024 (kilka minut)
npm run verify:hand         # checkHand.mjs: sam model, natychmiast (2026 i 2027)
npm run verify:refmodel2027  # compare.mjs --year=2027: 321 przypadków 2027 (ok. 5 min)
npm run verify:breakdown2027 # checkBreakdown.mjs --year=2027: 78 przypadków (ok. 1 min)
npm run verify:fuzz2027      # fuzz.mjs --year=2027: 200 wejść × ziarna 7, 99, 2024 (ok. 7 min)
```

- Wszystkie skrypty kończą się kodem 1, gdy znajdą nieoczekiwaną różnicę, więc nadają się do CI.
- **Nie są podpięte pod `npm test`.** Są wolne, a `npm test` uruchamia użytkownik.
- Po każdej zmianie w obliczeniach (`app/script.js`, `app/taxConstants.js`) uruchom co najmniej `verify:refmodel`. Zobacz też [`AGENTS.md`](../../AGENTS.md).

Warianty:

```sh
node tools/refmodel/compare.mjs L-      # tylko przypadki, których id zaczyna się od "L-"
node tools/refmodel/compare.mjs --year=2027 27R-   # tylko reguły EUR ryczałtu 2027
node tools/refmodel/fuzz.mjs 500 42     # 500 wejść, ziarno 42
node tools/refmodel/genCases.mjs --check  # czy cases.json/expected.json odpowiadają obecnemu modelowi
node tools/refmodel/genCases.mjs          # przegeneruj (potem przejrzyj `git diff`)
```

### Rok podatkowy (2026 / 2027)

Aplikacja obsługuje lata 2026 i 2027 (przełącznik roku, `?rok=`). Loader testów otwiera stronę domyślnie z `?rok=2026`, więc skrypty bez `--year` porównują rok 2026 niezależnie od bieżącej daty.

Rok 2027 (stałe z [`docs/prawo/research-2027.md`](../../docs/prawo/research-2027.md), scenariusz z [`research-2027-reformy.md`](../../docs/prawo/research-2027-reformy.md); rozszerzenie przygotował niezależny weryfikator, bez czytania kodu aplikacji):
- **Wejście modelu:** `year: 2027`, `reform2027: true|false`, `revenuePrevYear` (przychód 2026 do limitu 250 000 EUR; `null` = przychód z formularza; przy starcie działalności w 2027 warunek spełniony zawsze). Opcja `eurRate` (domyślnie `EUR_RATE_2027_FORECAST` = 4,3750, NBP 25.09.2026; ustawowo kurs z 1.10.2026) jest poza `DEFAULT_OPTIONS`, żeby migawka 2026 została bajt w bajt ta sama.
- **Wyjście modelu 2027:** dodatkowo `year`, `scenario` i (w projekcie) `ryczaltEligibility`; warianty ryczałtu bez prawa do ryczałtu mają `unavailable: true` i nie wchodzą do `best`.
- **Stałe 2027:** płaca minimalna 4 950 (final), podstawa pełna 6 019,80 i FP/FS 2,45% (prognoza), preferencyjna 1 485,00, minimalna zdrowotna 445,50 × 12 mies., ryczałt z IV kw. 2026 = 9 720 (prognoza: 524,88 / 874,80 / 1 574,64), limit zdrowotnej liniowej 15 100 (prognoza). Projekt: skala 12/24/32% (130 000 / 150 000, kwota zmniejszająca 3 600), danina 5% z IP BOX, ryczałt: limit 250 000 EUR przychodu 2026, 17% ponad 300 000 EUR (proporcjonalny podział nadwyżki i odliczeń, próg roczny bez proporcji – założenia).
- **Uruchamianie aplikacji:** `runApp()` otwiera stronę z `loadCalculator({ year, reform })` wg `input.year` / `input.reform2027` i wpisuje „Przychód 2026” (`setPrevYearRevenue()`). Porównywana jest też dostępność ryczałtu (`data-unavailable`), a przypadek z błędem modelu (start po roku podatkowym) wymaga stanu `data-state="invalid"` bez wyników.
- `KNOWN_DIFFS_2027` w `compare.mjs` – dziś pusta lista.
- Stan porównania z aplikacją (commit 979be6c): 3 783 warianty w 321 przypadkach 2027 bez różnic, 78 przypadków w `verify:breakdown2027` bez problemów, fuzz 2027 (3 × 200 wejść) bez różnic. Różnice poniżej tolerancji (1 gr) występują przy 8,5%/12,5%, rozliczeniu wspólnym i ryczałcie 17% z nadwyżką (zaokrąglanie części).

### Inna wersja aplikacji: `APP_DIR`

Domyślnie skrypty ładują aplikację z `app/` w tym repo (do 2026 r. katalog nazywał się `2026/`; stary adres przekierowuje). Zmienna `APP_DIR` wskazuje inny katalog aplikacji. Musi on zawierać `index.html`, `script.js`, `taxConstants.js` i `tests/helpers/loadCalculator.js`. Przykłady użycia:
- porównanie ze starszym commitem;
- praca, gdy katalog roboczy jest w trakcie edycji.

```sh
git worktree add --detach ../tc-main origin/main
ln -s "$PWD/node_modules" ../tc-main/node_modules   # loader importuje jsdom
APP_DIR=../tc-main/app npm run verify:refmodel   # commity sprzed przeniesienia: ../tc-main/2026
git worktree remove ../tc-main
```

## Jak czytać wynik

`compare.mjs` porównuje dla każdego widocznego wariantu (skala, liniowy, ryczałty, IP BOX, wspólnie z małżonkiem, wiele stawek) pola `data-total`, `data-taxes`, `data-baseline`, `data-health` i `data-social`. Tolerancja wynosi ±0,02 zł. Dodatkowo sprawdza:
- tożsamość `total = taxes − baseline + health + social`;
- podsumowanie ZUS (`#zusSocialTotal`: składki społeczne S i FP/FS);
- liczbę miesięcy składki zdrowotnej;
- miesiąc wakacji składkowych („soft diffs”);
- błędy JS w oknie.

Wyjście kończy się jedną z linii:
- `OK: no unexpected differences`: wszystkie różnice są na liście znanych (`KNOWN_DIFFS` w `compare.mjs`);
- `known   <id>: …`: znana, zaakceptowana różnica (niżej);
- `UNKNOWN <id> (opis): <wariant>: {pole: {app, model}}`: nowa rozbieżność. Szczegóły są w `out/compare_out.json`.

Co zrobić z nową rozbieżnością:
1. Znajdź przypadek w `cases.json` (opis `desc` mówi, co jest testowane) i odtwórz go w przeglądarce. Tekst „Pokaż szczegółowe obliczenia” pokazuje, jak liczy aplikacja.
2. Porównaj z modelem: `node -e "import('./tools/refmodel/refModel.mjs').then(m => console.log(JSON.stringify(m.computeAll(<input>), null, 1)))"`.
3. Ustal, kto ma rację, na podstawie przepisu, nie kodu:
   - **błąd aplikacji**: popraw aplikację;
   - **błąd modelu**: popraw model z przepisu, przegeneruj `cases.json`/`expected.json` i opisz zmianę w commicie;
   - **świadoma różnica interpretacji**: zapisz decyzję w `docs/decyzje/decyzje-implementacyjne.md`. Potem albo dodaj opcję w `DEFAULT_OPTIONS` modelu, albo, w ostateczności, dopisz przypadek do `KNOWN_DIFFS` z uzasadnieniem.
4. Zamierzona zmiana wyniku (np. nowe prawo) zmienia oczekiwania. Zaktualizuj model i sprawdź `git diff tools/refmodel/expected.json`: zmienić się powinny tylko spodziewane przypadki.

Pozostałe skrypty:
- `checkBreakdown.mjs` sprawdza w tekście „Pokaż szczegółowe obliczenia” cztery rzeczy:
  - końcowe „RAZEM … = X zł” równa się `data-total`;
  - składniki RAZEM równają się `data-(taxes − baseline)`, `data-health` i `data-social`;
  - linia „Składki ZUS w tym wariancie” równa się `data-social`;
  - działania w tekście się zgadzają („A × p% = B”, sumy, różnice, „A : 2”, „× 2”).
  Wynik powinien brzmieć `problems: 0`.
- `fuzz.mjs` porównuje tylko `total` każdego wariantu. Wejście z różnicą ląduje w `out/fuzz_out_<ziarno>.json` z metodami odliczenia (`appMethod`/`modelMethod`) i miesiącem wakacji.
- `checkHand.mjs`: każda linia `BAD` oznacza, że model przestał zgadzać się z ręcznym wyliczeniem z `HAND_CHECKS.md`.

## Znane, zaakceptowane różnice

| Przypadek | Przyczyna | Status |
|---|---|---|
| **L-385**: ryczałt z wieloma stawkami, przychód 200 000, przydziały 12%: 100 000 + 8,5%: 50 000 (suma 150 000 ≠ przychód) | **RC2**. Aplikacja liczy próg składki zdrowotnej i proporcje odliczeń (art. 11 ust. 3 uRycz) od pełnego przychodu, więc część odliczeń przypadająca na nieprzydzielone 50 000 przepada. Model liczy wszystko od sumy przydziałów. Różnica +716,17 zł na `ryczaltMulti`. | Akceptowana. Dane są niespójne, aplikacja wyraźnie ostrzega („podział przychodu nie zgadza się…”) i nie bierze sumy do rankingu. Opis: [`docs/weryfikacja/porownanie-z-modelem-referencyjnym.md`](../../docs/weryfikacja/porownanie-z-modelem-referencyjnym.md) (RC2) oraz decyzje H5 i R9 w rejestrze decyzji. |

Różnice prezentacji, które `compare.mjs` normalizuje (to nie są rozbieżności):
- **Warianty wspólne z małżonkiem:** aplikacja wlicza podatek małżonka rozliczanego osobno do `data-taxes`, a nie do `data-baseline`. Suma jest ta sama.
- **Zaokrąglenie przy rozliczeniu wspólnym:** aplikacja zaokrągla podatek od połowy dochodów, potem go podwaja. Model zaokrągla po podwojeniu. Różnica wynosi najwyżej 0,01 zł i mieści się w tolerancji.

Historia: w siatce były też przypadki L-374…L-377. Ich przychód był zapisany z szumem zmiennoprzecinkowym (`61459.479999999996`), więc aplikacja słusznie odrzucała go jako kwotę z ponad dwoma miejscami po przecinku. `genCases.mjs` zaokrągla teraz sumy do groszy i sprawdza, czy każda kwota ma najwyżej 2 miejsca po przecinku. Te przypadki są poprawnymi wejściami i zgadzają się z aplikacją.
