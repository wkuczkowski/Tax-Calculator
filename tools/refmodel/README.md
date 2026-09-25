# Model referencyjny: narzędzie regresji dla kalkulatora (`app/`)

## Po co to jest

`refModel.mjs` to **niezależny model obliczeń** (PIT w czterech formach, składka zdrowotna, składki społeczne ZUS miesiąc po miesiącu, FP/FS, wakacje składkowe, danina, IP BOX, rozliczenie z małżonkiem, ryczałt z wieloma stawkami) na rok 2026. Model został napisany **z przepisów i udokumentowanych decyzji**:
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
- Stałe (`C` w `refModel.mjs`) mają przy sobie podstawę prawną. Przy aktualizacji przepisz je ze źródła, a nie z `taxConstants.js`.
- Interpretacje sporne są przełącznikami w `DEFAULT_OPTIONS`. Domyślne wartości odpowiadają decyzjom przyjętym w aplikacji. `genCases.mjs` zapisuje w `expected.json` (pole `alt`), jak zmieniłyby się wyniki przy każdej alternatywnej interpretacji.

## Pliki

| Plik | Rola |
|---|---|
| `refModel.mjs` | Model. Eksportuje `computeAll(input, options)`. Format wejścia jest opisany w nagłówku pliku. |
| `genCases.mjs` | Generator siatki przypadków brzegowych (grupy A–N, 396 przypadków). Zapisuje `cases.json` (wejścia) i `expected.json` (wyniki modelu + `alt`). |
| `cases.json` | Wejścia, jeden przypadek na linię. Wszystkie kwoty w pełnych groszach (generator to sprawdza). |
| `expected.json` | Migawka wyników modelu, jeden przypadek na linię. Służy do wykrywania dryfu modelu (`--check`) i do przeglądania wyników. Nie wpływa na `compare.mjs`, który liczy model na bieżąco. |
| `compare.mjs` | Główne porównanie: aplikacja vs model dla każdego przypadku z `cases.json`. Eksportuje też `runApp()` dla pozostałych skryptów. |
| `checkBreakdown.mjs` | Spójność tekstu „Pokaż szczegółowe obliczenia” na próbce 60 przypadków (szczegóły niżej). |
| `fuzz.mjs` | Losowy test różnicowy aplikacja vs model (ziarno ⇒ powtarzalny). |
| `checkHand.mjs` + `HAND_CHECKS.md` | 6 przykładów policzonych ręcznie (58 liczb) porównanych z modelem. Sprawdza sam model, bez aplikacji. |
| `out/` | Wyniki szczegółowe ostatniego uruchomienia (JSON). Katalog jest w `.gitignore`. |

## Jak uruchomić

Z katalogu głównego repo (wymaga `npm install`):

```sh
npm run verify:refmodel     # compare.mjs: 396 przypadków (ok. 6 min)
npm run verify:breakdown    # checkBreakdown.mjs: 60 przypadków (ok. 1 min)
npm run verify:fuzz         # fuzz.mjs: 200 losowych wejść × ziarna 7, 99, 2024 (kilka minut)
npm run verify:hand         # checkHand.mjs: sam model, natychmiast
```

- Wszystkie skrypty kończą się kodem 1, gdy znajdą nieoczekiwaną różnicę, więc nadają się do CI.
- **Nie są podpięte pod `npm test`.** Są wolne, a `npm test` uruchamia użytkownik.
- Po każdej zmianie w obliczeniach (`app/script.js`, `app/taxConstants.js`) uruchom co najmniej `verify:refmodel`. Zobacz też [`AGENTS.md`](../../AGENTS.md).

Warianty:

```sh
node tools/refmodel/compare.mjs L-      # tylko przypadki, których id zaczyna się od "L-"
node tools/refmodel/fuzz.mjs 500 42     # 500 wejść, ziarno 42
node tools/refmodel/genCases.mjs --check  # czy cases.json/expected.json odpowiadają obecnemu modelowi
node tools/refmodel/genCases.mjs          # przegeneruj (potem przejrzyj `git diff`)
```

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
