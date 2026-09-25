# Dokumentacja kalkulatora `/2026`

W tym katalogu są dokumenty, na których opiera się logika kalkulatora: analizy prawne, specyfikacja, rejestr decyzji i raporty z weryfikacji. Większość to **raporty historyczne**, czyli zapis stanu wiedzy i kodu z dnia sporządzenia. Nie aktualizuje się ich. Wyjątkiem jest **rejestr decyzji**. To dokument żywy i trzeba go uzupełniać przy każdej zmianie obliczeń.

Każdy dokument zaczyna się krótkim nagłówkiem. Podaje w nim datę, status (raport historyczny, specyfikacja albo dokument żywy), zakres i pierwotną nazwę pliku.

## Od czego zacząć

1. [`decyzje/decyzje-implementacyjne.md`](decyzje/decyzje-implementacyjne.md) mówi, **jak** kalkulator liczy i **dlaczego**, z podstawą prawną każdej reguły.
2. [`decyzje/specyfikacja-zus.md`](decyzje/specyfikacja-zus.md) opisuje, **co** miało zostać zbudowane, wraz z wiążącym ADDENDUM A1–A10.
3. [`../tools/refmodel/README.md`](../tools/refmodel/README.md) opisuje, jak sprawdzić, że aplikacja nadal liczy zgodnie z przepisami.

## `decyzje/`: wymagania i decyzje

| Plik | Status | Co zawiera |
|---|---|---|
| [`decyzje-implementacyjne.md`](decyzje/decyzje-implementacyjne.md) | **dokument żywy: rejestr decyzji** | Każda decyzja interpretacyjna i implementacyjna z uzasadnieniem, w grupach: kalendarz składek (D), wakacje składkowe (W), składka zdrowotna (H), optymalizacja odliczeń, inne dochody (O), poprawki z recenzji (R), runda końcowa (F), świadome uproszczenia. **Uzupełniaj przy każdej zmianie logiki**, w tym samym commicie. |
| [`specyfikacja-zus.md`](decyzje/specyfikacja-zus.md) | specyfikacja (zamknięta) | Wymagania dla składek ZUS i innych dochodów: pola wejściowe, reguły liczenia, optymalizacja odliczeń, wyświetlanie. ADDENDUM A1–A10 zawiera decyzje podjęte po porównaniu z modelem referencyjnym. |

## `prawo/`: analizy prawne

| Plik | Status | Co zawiera |
|---|---|---|
| [`research-zus-2026.md`](prawo/research-zus-2026.md) | raport historyczny (stan prawny 24.09.2026) | Składki ZUS przedsiębiorcy w 2026 r.: podstawy i stawki, ulga na start, preferencyjny ZUS, FP/FS i zwolnienie wiekowe, wakacje składkowe, składka zdrowotna, odliczanie składek. Zawiera wykaz źródeł (ISAP/ELI, zus.pl) i listę kwestii niepewnych. |
| [`audyt-logiki-2026.md`](prawo/audyt-logiki-2026.md) | raport historyczny | Audyt prawny logiki sprzed dodania składek ZUS: stałe, PIT (skala, liniowy, ryczałt, IP BOX, małżonek, danina), składka zdrowotna. Ustalenia B1–B10 zostały później poprawione. Wzmianki o `v2/` są historyczne, bo katalog usunięto. |
| [`weryfikacja-danina-ulga-na-start.md`](prawo/weryfikacja-danina-ulga-na-start.md) | raport historyczny | Dochód z IP BOX nie wchodzi do podstawy daniny solidarnościowej (art. 30h PIT). Omawia też zasady ulgi na start (art. 18 Prawa przedsiębiorców). |

## `weryfikacja/`: recenzje i raporty z weryfikacji

Dokumenty w kolejności powstania:

| Plik | Dotyczy | Co zawiera |
|---|---|---|
| [`recenzja-04de063.md`](weryfikacja/recenzja-04de063.md) | commit `04de063` | Recenzja poprawek B1/B2/B3/B5 z audytu: podział odliczeń przy wielu stawkach ryczałtu, 8,5%/12,5%, małżonek, etykieta stanu prawnego. Zawiera też test regresji. |
| [`code-review-9121c02.md`](weryfikacja/code-review-9121c02.md) | `04de063..9121c02` | Krytyczna recenzja wprowadzenia składek ZUS, innych dochodów i optymalizacji odliczeń: harmonogram, FP, wakacje, danina, optymalizator, porównanie starej i nowej wersji. |
| [`porownanie-z-modelem-referencyjnym.md`](weryfikacja/porownanie-z-modelem-referencyjnym.md) | `9121c02` | Porównanie aplikacji z niezależnym modelem referencyjnym (396 przypadków, test losowy, spójność „szczegółowych obliczeń”). Opisuje przyczyny rozbieżności RC1 (poprawione) i RC2 (zaakceptowana różnica interpretacji). |
| [`przeglad-ux.md`](weryfikacja/przeglad-ux.md) | `9121c02` | Przegląd UX z perspektywy doradcy podatkowego: przejrzystość wyników, eksport, formularz, walidacja, wersja mobilna. |
| [`weryfikacja-koncowa.md`](weryfikacja/weryfikacja-koncowa.md) | `07adef8..0305dd6` | Weryfikacja przed merge: problemy uszeregowane według wagi, kontrola prawna kolejności odliczeń przy ryczałcie (R1), wyniki skryptów, regresja, test w przeglądarce. |

W raportach pojawiają się odwołania do plików roboczych: lokalnych kopii aktów `*.txt`, skryptów, zrzutów ekranu. Te pliki powstały w katalogu roboczym sesji weryfikacyjnej i nie ma ich w repozytorium. Utrzymywaną wersją skryptów porównawczych jest [`tools/refmodel/`](../tools/refmodel/).

## Dawne nazwy plików

Dokumenty powstały pod roboczymi nazwami, które nadal występują w ich treści:

| Dawna nazwa | Obecny plik |
|---|---|
| `research_zus.md` | [`prawo/research-zus-2026.md`](prawo/research-zus-2026.md) |
| `audit_logic.md` | [`prawo/audyt-logiki-2026.md`](prawo/audyt-logiki-2026.md) |
| `legal_check_danina_ulga.md` | [`prawo/weryfikacja-danina-ulga-na-start.md`](prawo/weryfikacja-danina-ulga-na-start.md) |
| `SPEC_ZUS.md` („SPEC”, „ADDENDUM”) | [`decyzje/specyfikacja-zus.md`](decyzje/specyfikacja-zus.md) |
| `IMPL_DECISIONS.md` | [`decyzje/decyzje-implementacyjne.md`](decyzje/decyzje-implementacyjne.md) |
| `review_04de063.md` | [`weryfikacja/recenzja-04de063.md`](weryfikacja/recenzja-04de063.md) |
| `codereview/REVIEW.md` | [`weryfikacja/code-review-9121c02.md`](weryfikacja/code-review-9121c02.md) |
| `refmodel/COMPARE_REPORT.md` | [`weryfikacja/porownanie-z-modelem-referencyjnym.md`](weryfikacja/porownanie-z-modelem-referencyjnym.md) |
| `ux/UX_REVIEW.md` | [`weryfikacja/przeglad-ux.md`](weryfikacja/przeglad-ux.md) |
| `final/FINAL_VERIFICATION.md` | [`weryfikacja/weryfikacja-koncowa.md`](weryfikacja/weryfikacja-koncowa.md) |
| `refmodel/HAND_CHECKS.md`, `refmodel/*.mjs` | [`../tools/refmodel/`](../tools/refmodel/) |

## Przy zmianie obliczeń

1. Wpisz decyzję do [rejestru decyzji](decyzje/decyzje-implementacyjne.md): regułę, podstawę prawną i powód.
2. Uruchom `npm run verify:refmodel`. Przy większych zmianach uruchom też `verify:breakdown` i `verify:fuzz`. Nowe rozbieżności wyjaśnij według [README modelu referencyjnego](../tools/refmodel/README.md).
3. Gdy zmienia się prawo, np. na nowy rok podatkowy, zaktualizuj model z przepisów, a nie z kodu aplikacji. Nową analizę prawną dodaj jako nowy raport w `prawo/`.
