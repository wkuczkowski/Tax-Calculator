# SPEC: składki ZUS + inne dochody (kalkulator /2026)

> **Data:** 2026-09-24  
> **Status:** specyfikacja wymagań (zamknięta). Opisuje wymagania, na których zbudowano obsługę składek ZUS i innych dochodów. ADDENDUM A1–A10 jest wiążące. Treści nie zmienia się. Późniejsze doprecyzowania i odstępstwa zapisuje się w [rejestrze decyzji](decyzje-implementacyjne.md).  
> **Zakres:** nowe pola wejściowe (składki ZUS, ścieżki ulga na start / mały ZUS, chorobowa, FP/FS i wiek, umowa o pracę, wakacje składkowe, inne dochody), reguły liczenia składek i zdrowotnej, optymalizacja odliczeń, wyświetlanie. Na końcu ADDENDUM A1–A10 z decyzjami po modelu referencyjnym.  
> **Pierwotna nazwa pliku:** `SPEC_ZUS.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Źródła prawne i liczby: [`research-zus-2026.md`](../prawo/research-zus-2026.md) (dawniej `research_zus.md`). Audyt obecnej logiki: [`audyt-logiki-2026.md`](../prawo/audyt-logiki-2026.md) (dawniej `audit_logic.md`).
Rok podatkowy: 2026. Decyzje użytkownika poniżej są wiążące.

## Nowe pola wejściowe (sekcja „Składki ZUS” + pole w sekcji dochodów)
1. **Uwzględnij składki ZUS** – przełącznik, domyślnie WŁĄCZONY.
2. **Data rozpoczęcia działalności** – pełna data (dzień). Puste = działalność prowadzona przed 2026 r. i przez cały 2026 (brak ulg startowych, pełny ZUS od 1.01). Data może być wcześniejsza niż 2026 (wtedy liczymy, ile ulgi / preferencyjnego ZUS przypada na 2026). Data po 31.12.2026 – walidacja/błąd.
3. **Ścieżka składek**: (a) Pełny ZUS, (b) Ulga na start → mały ZUS (preferencyjny, 24 mies.) → pełny ZUS, (c) Mały ZUS (preferencyjny, 24 mies., bez ulgi na start) → pełny ZUS. „Mały ZUS” = preferencyjny ZUS (art. 18a), NIE Mały ZUS Plus.
4. **Składka chorobowa** – checkbox, domyślnie zaznaczony.
5. **Data urodzenia** i **płeć** – opcjonalne; służą wyłącznie do zwolnienia z FP+FS (kobiety 55+, mężczyźni 60+; od miesiąca po urodzinach, a przy urodzinach 1. dnia miesiąca – od tego miesiąca). Brak danych = FP należny.
6. **Mam umowę o pracę z wynagrodzeniem ≥ minimalnego (4 806 zł)** – checkbox; zaznaczony ⇒ brak obowiązkowych składek społecznych z JDG przez cały rok (zdrowotna z JDG nadal należna).
7. **Wakacje składkowe** – checkbox, domyślnie wyłączony. Jeden miesiąc w 2026 bez składek społecznych i FP/FS (zdrowotna należna). Kalkulator sam sprawdza, czy w danym scenariuszu przysługują (zasady w [research-zus-2026.md](../prawo/research-zus-2026.md): nie w okresie ulgi na start, wniosek miesiąc wcześniej, najwcześniej 2. miesiąc po pierwszym miesiącu podlegania itp.) i wybiera najkorzystniejszy dozwolony miesiąc. Jeśli nie przysługują – komunikat.
8. **Inne dochody opodatkowane skalą** – roczny DOCHÓD (po kosztach, przed PIT; np. z etatu), domyślnie 0.

## Reguły liczenia składek społecznych (miesiąc po miesiącu w 2026)
- Kwoty 2026: podstawa pełna 5 652,00; preferencyjna 1 441,80. Stawki: emerytalna 19,52%, rentowe 8%, chorobowa 2,45% (dobrowolna), wypadkowa 1,67%, FP 1,00% + FS 1,45%. Weryfikować z [research-zus-2026.md](../prawo/research-zus-2026.md).
- Ulga na start (art. 18 Prawa przedsiębiorców): start 1. dnia miesiąca ⇒ ten miesiąc jest 1. z 6; start w trakcie miesiąca ⇒ niepełny miesiąc wolny + 6 pełnych miesięcy. Potem preferencyjny przez 24 pełne miesiące kalendarzowe, potem pełny.
- Bez ulgi (ścieżki a i c): pierwszy niepełny miesiąc – podstawa × dni podlegania / liczba dni w miesiącu (faktyczna). Czas trwania preferencyjnego w ścieżce (c) – wg [research-zus-2026.md](../prawo/research-zus-2026.md) (24 miesiące kalendarzowe; zasady dla niepełnego miesiąca startu sprawdzić i opisać).
- FP+FS tylko gdy podstawa ≥ minimalnego wynagrodzenia (czyli nie na preferencyjnym, nie w uldze) i gdy brak zwolnienia wiekowego. Przy proporcjonalnej podstawie pierwszego miesiąca – sprawdzić w research, czy FP należny (kryterium podstawy pełnomiesięcznej vs faktycznej) i opisać.
- Kwoty składek zaokrąglane do groszy per składnik per miesiąc (jak ZUS).

## Składka zdrowotna
- Należna od miesiąca startu (niepodzielna – pełna kwota za niepełny miesiąc), także w uldze na start. Liczba miesięcy = od miesiąca startu do grudnia (start przed 2026 ⇒ 12).
- Skala: 9% × (dochód JDG − składki społeczne nieujęte w kosztach), minimum 432,54 zł × liczba miesięcy.
- Liniowy / IP BOX: jak w research (4,9% przy liniowym, 9% przy skali z IP BOX), dochód pomniejszony o składki społeczne; minimum × liczba miesięcy; limit odliczenia 14 100 zł (dla niepełnego roku – sprawdzić, czy limit jest roczny bez proporcji).
- Ryczałt: kwota miesięczna wg progu rocznego przychodu (60k / 300k), × liczba miesięcy. Przychód do progów pomniejszony o składki społeczne, jeśli nie zostały odliczone w PIT (art. 81 ust. 2g) – uwzględnić w optymalizacji. 50% zapłaconej zdrowotnej odliczane od przychodu (proporcjonalnie przy wielu stawkach – poprawka B1/B2).
- Styczeń: przyjmujemy 432,54 dla wszystkich miesięcy (jak obecny kalkulator – podejście potwierdzone w audycie).

## Odliczanie składek społecznych – optymalizacja
Dla każdego wariantu kalkulator liczy wszystkie legalne sposoby odliczenia i wybiera ten z najniższym łącznym obciążeniem; wybrany sposób pokazuje w szczegółach obliczeń:
- Skala (indywidualnie i wspólnie): od dochodu (art. 26) lub w kosztach – zbadać różnicę (koszty obniżają też podstawę zdrowotnej itd.). Przy wspólnym – tylko od dochodu podatnika.
- Liniowy: koszty / dochód liniowy / dochód ze skali (inne dochody).
- Ryczałt: od przychodu ryczałtowego / od dochodu ze skali (nadwyżka ponad przychód → od skali).
- IP BOX: nigdy od dochodu opodatkowanego 5%.
- FP/FS: tylko w kosztach (skala, liniowy); na ryczałcie nieodliczalne.
- Bez dzielenia składek między dwa sposoby (porównujemy warianty w całości) – chyba że research wykaże, że dzielenie jest legalne.
- Założenie kasowe uproszczone: składki należne za 2026 odliczane w 2026 (opisać w info).

## Inne dochody na skali
- Wchodzą do podstawy skali (i daniny – art. 30h obejmuje dochody z art. 27).
- Przy liniowym / ryczałcie / IP BOX z liniowym są opodatkowane skalą osobno.
- Rozliczenie wspólne (tylko skala i skala z IP BOX): dochody podatnika = JDG + inne.
- **Wynik wariantu = obciążenie przypisane JDG** = [PIT łączny podatnika (+ danina) + zdrowotna JDG + składki społeczne] − PIT, jaki podatnik zapłaciłby od samych innych dochodów (indywidualnie na skali, bez JDG). Przy wspólnym dodatkowo odejmujemy PIT małżonka przy rozliczeniu indywidualnym (decyzja B3).
- Zdrowotna od innych dochodów (etat) – poza zakresem (pobiera pracodawca).

## Wyświetlanie
- Wynik każdego wariantu obejmuje teraz: PIT + zdrowotna + składki społeczne (etykiety/disclaimery do aktualizacji).
- Osobno pokazać roczną kwotę składek społecznych i rozpisanie miesiąc po miesiącu (reżim, podstawa, składniki, FP) w szczegółach obliczeń i w tekście do kopiowania.
- Wszystkie założenia/uproszczenia opisane w info-ikonach / modalu info (ulga na start: warunki kwalifikacji nie są sprawdzane; konwencja dat; założenie kasowe; zwolnienie FP wg wieku; etat ≥ minimalne).

## ADDENDUM (decyzje orkiestratora po modelu referencyjnym — wiążące)
A1. IP BOX: optymalizator rozważa WSZYSTKIE legalne sposoby, w tym składki społeczne w KUP (pomniejszają dochód, także kwalifikowany). Reguła „nigdy od 5%” była radą, nie zakazem — wybieramy najtańszy.
A2. Wakacje składkowe: miesiąc wybierany osobno dla każdego wariantu (najkorzystniejszy dla danego wariantu); w szczegółach pokazać wybrany miesiąc.
A3. Data rozpoczęcia wpływa na liczbę miesięcy składki zdrowotnej ZAWSZE, także gdy przełącznik ZUS (społeczne) jest wyłączony — pole daty nie może być zależne od przełącznika społecznych.
A4. Zdrowotna liniowego ujęta w KUP NIE obniża własnej podstawy (ostrożnie; brak potwierdzenia ZUS/MF) — opisać w Założeniach.
A5. Bez dzielenia składek między sposoby odliczenia (poza nadwyżką z ryczałtu → skala).
A6. Art. 81 ust. 2g literalnie: przychód do progów ryczałtu pomniejszamy o składki społeczne NIEodliczone od dochodu ze skali (tj. odliczone od przychodu ryczałtowego albo nieodliczone nigdzie).
A7. FP w niepełnym pierwszym miesiącu pełnego ZUS — należny od podstawy proporcjonalnej. FP+FS zaokrąglane łącznie jako 2,45%.
A8. Wakacje: miesiąc zwolnienia E ≥ F+2 (F = pierwszy miesiąc podlegania, także niepełny); nie w uldze na start, nie przy umowie o pracę; limity przychodu/de minimis zakładamy spełnione.
A9. FP przy IP BOX alokowany proporcjonalnie (jak pozostałe KUP).
A10. Danina: baseline (PIT od samych innych dochodów) obejmuje też daninę od tych dochodów.
