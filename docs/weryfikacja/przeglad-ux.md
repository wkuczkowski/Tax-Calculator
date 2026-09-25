# UX review: Kalkulator podatkowy 2026 (JDG), from a tax advisor's point of view

> **Data:** 2026-09-24  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu.  
> **Zakres:** przegląd UX kalkulatora (HEAD `9121c02`) z perspektywy doradcy podatkowego: warstwa przejrzystości (szczegółowe obliczenia, eksport), formularz, walidacja, komunikaty, wersja mobilna. Rekomendacje wdrożone w rundzie „fix” opisuje [rejestr decyzji](../decyzje/decyzje-implementacyjne.md), sekcja 8.  
> **Pierwotna nazwa pliku:** `ux/UX_REVIEW.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Build: branch `claude/internet-access-check-gwiyap`, HEAD `9121c02`. Tested on http://localhost:5502/2026/ with Playwright and Chromium (headless shell 1194), locale pl-PL, at 1440×900, 1024×768 and 390×844.
Screenshots, JSON snapshots and exported text were saved in the session working directory (`ux/out/`, not kept in the repo). I did not modify the repo.

## Overall verdict

The transparency layer ("Pokaż szczegółowe obliczenia" / "Eksport") is very strong. For all 6 scenarios I could re-derive every total by hand from the export alone. The export covers:
- statutory references;
- the full month-by-month ZUS table (per-contribution rounding);
- the ryczałt health tier logic, including the art. 81 ust. 2g reduction;
- the comparison of deduction methods with the rejected alternatives and their cost deltas;
- the per-variant comparison of wakacje składkowe months;
- the attribution logic for "inne dochody" and joint taxation.

The "Założenia" modal is thorough and honest about its simplifications: no rounding to full złoty, the cash-basis assumption, the minimum health contribution for January 2026, and Mały ZUS Plus not being modelled.

The main problems are elsewhere:
- **input robustness**: a decimal point silently multiplies amounts by 100, and a negative amount gets calculated;
- **one probable legal/numerical error**: the danina does not include IP BOX income;
- **keyboard access**: invisible modals and collapsed sections take focus;
- **mobile readability** of the monospace breakdown;
- **presentation gaps**: the per-row composition and ryczałt tier are not visible at a glance, and the export has no ranking.

---

## Numerically suspicious or wrong (flagged, with inputs)

| # | Inputs | Observation | Why suspicious |
|---|---|---|---|
| N1 | Revenue 3 000 000, costs 0, IP BOX = Tak, 80%, full ZUS | In the IP BOX variants the danina is charged only on the scale/linear part. Linear+IP BOX shows a danina of 0 zł, although total income is about 3 mln zł. The export text says "podstawa: dochód opodatkowany skalą po odliczeniach". | Art. 30h ust. 2 ustawy o PIT includes income taxed under **art. 30ca** (IP BOX) in the danina base. The expected extra levy is about 4% × 2 398 670,69 ≈ **95 947 zł**. Code: `computeScaleOption` → `calculateSolidarityLevy(pitBase)`; `computeLinearOption` → `levyBase = linearBase + scaleBase` (both leave out `ipBoxIncome`). **P1: please verify and fix.** |
| N2 | Revenue typed as `81459.48` (dot as decimal separator) | While typing, "Dochód" shows 81 459,48 zł. On blur the field turns into **8 145 948,00 zł** and every result is recalculated from that. `321460.00` becomes 32 146 000 zł. | `parsePLN()` strips `.`; `parseAmount()` keeps it. The two parsers disagree. See U1. |
| N3 | Costs `-100` | An error message is shown, but on blur the field is formatted as "-100,00 zł" and **calculate() still runs with negative costs** (Dochód = revenue + 100). | The blur handlers call `calculate()` without checking validity. |
| N4 | Start 2026-03-15, Ulga na start | The ulga runs until **09.2026 (full September)**; the mały ZUS runs Oct 2026 – Sep 2028. The export labels this "6 mies. + niepełny miesiąc rozpoczęcia"; Założenia calls it "stanowisko ZUS". | Art. 18 Prawa przedsiębiorców says "6 miesięcy od dnia podjęcia" (date to date → until 14.09.2026, then a proportional preferential base for 15–30.09 ≈ 16/30 × 456,18 ≈ 243 zł). Some ZUS materials use the full-month reading. **Verify the source and cite the specific ZUS publication in the export** so an advisor can defend the figure. P2. |
| N5 | Any scenario with wakacje on (e.g. scenario 6: woman born 1970-06-10, full ZUS, wakacje) | The chosen holiday month is **01.2026**: equal contributions every month, so the tie goes to the earliest. The status reads "wniosek RWS najwcześniej w 12.2025". | Today is 24.09.2026 (the header shows "Stan prawny na 24.09.2026"). An RWS filed now covers 10.2026 at the earliest. For current-year planning, January is not actionable and may already have been used. See U9. |
| N6 | All scenarios | The tax base and tax are not rounded to full złoty (art. 63 § 1 O.p.). For example, scale PIT is 19 962,07 instead of 19 962. | This is disclosed in Założenia, but the export itself does not say it. Totals will differ by about 1 zł from PIT-36/36L/28. P3: add one line to the export, or add an "zaokrąglaj do pełnych zł" toggle. |
| N7 | IP BOX + liniowy (scenario 5: 300 000 / 20 000, 80%) | The **whole** health contribution (12 587,07) and the social contributions are deducted from the 20% non-IP linear slice. | This is defensible, but it is a choice. Health paid on qualified (5%) income arguably has no link to art. 30c. It should be stated as an assumption in the IP BOX section of Założenia and in the export. P2. |

Checked by hand and **correct**:
- ZUS 2026 bases and rates: 1926,76 / 456,18 / FP+FS 138,47; a partial month is base × days / month days (03.2026: 3099,48).
- FP/FS age exemption: woman 55+ → the whole of 2026; man born 1966-03-01 → from 03.2026, born 1966-03-15 → from 04.2026.
- The 50% ryczałt health deduction and proportional splitting in multi-rate mode.
- The ryczałt tier boundary after subtracting social contributions: revenue 81 459,48 → tier I; 81 460 → tier II.
- The linear 14 100 zł limit.
- Joint taxation: 2 × PIT(½ of the sum) − the spouse's own PIT.
- Attribution when there is other scale income (baseline 7 200 zł on 90 000 zł).

---

## Prioritised improvements

### P1: fix first

**U1. Decimal-point and invalid amount input (money fields, `.rate-input`, `#spouseIncome`)**
- *Problem:* see N2 and N3. `abc` silently becomes 0 with no error, `12e3` becomes 123, and `1,5,5` becomes 1,50. `#spouseIncome` has no `-error` element, so errors there are never shown.
- *Change:* use one parser everywhere. Accept `,` and `.` as the decimal separator when the last separator is followed by 1–2 digits, and treat spaces or `.` in thousands groups as grouping. Reject anything else with an error and do **not** recalculate or reformat an invalid value on blur. Add `<p class="error-message" id="spouseIncome-error">`.
- *Copy:*
  - "Wpisz kwotę, np. 12 345,67 zł."
  - "Kwota nie może być ujemna — koszty wpisz bez znaku minus."
  - "Nieprawidłowy format kwoty."

**U2. Danina must include IP BOX income (N1)**
- *Where:* `computeScaleOption`, `computeLinearOption`, and the danina line in `getScaleVariantText` / `getLinearVariantText`.
- *Change:* use `levyBase = pitBase (+ linear base) + ipBoxIncome`.
- *Copy:* "Danina solidarnościowa 4% (art. 30h ust. 2 ustawy o PIT; podstawa: dochody opodatkowane wg skali, liniowo i stawką 5% IP BOX po odliczeniach …)".

**U3. Invisible elements take keyboard focus**
- *Problem:* `#copyModal` and `#infoModal` have the `hidden` attribute, but CSS `display:flex; opacity:0` overrides it. When closed, 5 invisible buttons are in the tab order right after "Pokaż szczegółowe obliczenia". The collapsed `#ipBoxReveal` (range + number) and `#spouseIncomeCard` (tooltip + input) are also focusable with height 0 and opacity 0. The readonly `#income` is a tab stop with no focus ring.
- *Change:*
  - When closed, set `display:none` (honour `[hidden]`) or `inert` on the modals.
  - Add `inert` or `hidden` to the collapsed reveals.
  - Set `tabindex="-1"` on `#income`.
  - Add a focus trap inside open modals: today 4 × Tab from the info modal lands on "Przejdź do treści" behind it.

**U4. Show the composition of each result at a glance (`#comparePit .results-row`)**
- *Problem:* each row shows only one total. To see PIT vs health vs ZUS vs the chosen deduction method, the advisor has to open an 800-line text. The data is already in `data-taxes`, `data-health`, `data-social` and `data-method`.
- *Change:* add a secondary line under each row value.
- *Copy:*
  - Row: "PIT 19 962 · zdrowotna 13 377 · ZUS 1 369 · składki: od dochodu".
  - For ryczałt, also: "zdrowotna: próg II (60–300 tys.), 830,58 zł/mies."
  - Rename the section heading "Porównanie PIT" to **"Porównanie form opodatkowania"**. Keep the meta label "PIT + zdrowotna + ZUS".

**U5. The export has no ranking and does not list every input**
- *Where:* `getFormattedValues()`, header "=== DANE PODSTAWOWE ===" and "=== PODSUMOWANIE WYNIKÓW ===".
- *Change:*
  - Start with a ranked list of variants and each variant's difference from the best.
  - List all inputs in one block: ZUS path, start date, chorobowa, etat, wakacje, birth date and sex, the ryczałt rates selected, joint taxation, and IP BOX. Today some of these appear only deep in the text, and the ryczałt rates are not listed as inputs at all.
  - Add the date the analysis was generated.
- *Copy:*
  ```
  === RANKING (od najniższego obciążenia) ===
  1. Ryczałt 8,5% — 24 505,02 zł
  2. Ryczałt 12% — 30 611,77 zł (+6106,75 zł)
  …
  Data sporządzenia: 24.09.2026
  ```

### P2: important

**U6. Date validation (`#zusStartDate`, `#zusBirthDate`)**
- *Problems:*
  - A **partially typed date** (e.g. month and day only) has `value=""`, so it is silently treated as "no start date → full year" with no message.
  - A birth date after the start date, or in 2026 (e.g. 2026-05-01), is accepted, and the hint shows "Zwolnienie z FP i FS dopiero od 05.2086".
  - With an invalid date the results stay on screen as if they were valid. Only the small hint under the field says "Data pominięta…".
- *Change:*
  - Check `input.validity.badInput` and show an error for incomplete dates.
  - Cross-validate the birth date against the start date and a minimum age (warn below 16).
  - While any error is present, dim the results card (`data-state="stale"`) and show a banner.
- *Copy:*
  - "Uzupełnij pełną datę (dd.mm.rrrr)."
  - "Data urodzenia musi być wcześniejsza niż data rozpoczęcia działalności."
  - "Data urodzenia nie może przypadać w 2026 r. ani później."
  - Banner: "Wyniki nie uwzględniają błędnie wpisanej daty — popraw pole oznaczone na czerwono."

**U7. The "Ścieżka składek" choice is ignored when there is no start date (`.seg` with `name=zusPath`)**
- *Problem:* you can select "Ulga na start" with an empty date. The result silently stays full ZUS; only the grey hint text explains why.
- *Change:* disable Ulga and Mały ZUS until a date is entered, with `aria-describedby` pointing to the hint.
- *Copy:* "Ulga na start i mały ZUS wymagają daty rozpoczęcia działalności."

**U8. ZUS card: visual hierarchy and legend (`#zusSummary`)**
- *Problems:*
  - The month chips carry the regime in colour only. The per-month amounts sit in a `title` attribute, which is unreachable by keyboard or touch.
  - Contrast is too low: ulga uses #a3791f on #f8efd7 (≈3.5:1) at 10 px; inactive months use #8b8d97.
  - A partial month is marked by an almost invisible gradient.
  - There is no legend.
- *Change:*
  - Put a colour legend under the chips: "■ pełny ZUS ■ mały ZUS ■ ulga na start ■ wakacje ◇ poza działalnością".
  - Show each month's amount under its chip (e.g. "456"), or add an expandable table "Pokaż składki miesięcznie".
  - Mark a partial month with an asterisk, e.g. "III*", and add the footnote "* niepełny miesiąc".
  - Use a font of at least 11 px and a contrast of at least 4.5:1.
  - Add a "Składka zdrowotna" row that gives the range across variants, e.g. "7 283–13 377 zł zależnie od formy".

**U9. Wakacje składkowe month**
- *Problems:* see N5. In addition, the per-variant comparison label "[x] I–XII (zwolnienie 456,18 zł)" reads as if every month were on holiday.
- *Change:*
  - Add a select "Miesiąc wakacji: automatycznie / I … XII".
  - Add an option "Uwzględnij tylko miesiące, dla których termin RWS jeszcze nie minął (od 10.2026)".
  - Relabel the comparison line.
- *Copy:* "[x] dowolny miesiąc z I–XII (ta sama kwota; przyjęto I)".

**U10. Multi-rate ryczałt ("Wiele stawek")**
- *Problems:*
  - Per-rate rows show only the ryczałt tax part (e.g. "Ryczałt 8,5% 3688,09 zł"). They are interleaved with full-cost rows and look cheapest.
  - When allocation is incomplete or over-allocated, the best card silently ignores ryczałt. The warning appears only under the chips in the inputs panel.
- *Change:*
  - Group the per-rate rows inside the "Łącznie" block with the tag "sam ryczałt (bez zdrowotnej i ZUS)".
  - Add a note in the best card.
- *Copy:* "Ryczałt (wiele stawek) pominięty — nieprzypisane 50 000,00 zł przychodu."

**U11. Breakdown readability on mobile, and its length**
- *Problems:*
  - At 390 px the `pre-wrap` monospace output wraps the 9-column ZUS table into unreadable pairs of lines. See `out/12-mobile-zus-table.png`.
  - The "=====" separators wrap as well.
  - With all options on, the breakdown is **46 k characters / 867 lines** with no navigation.
- *Change:*
  - Render the on-screen breakdown as HTML: real `<table>` elements inside `overflow-x:auto`, one collapsible `<details>` per variant, and a table of contents with anchors.
  - Keep plain text only for the clipboard export.
  - Add a print stylesheet (`@media print`) so the advisor can "Drukuj / zapisz PDF" for the client file.

**U12. Label: "Współczynnik IP BOX"**
- *Problem:* in practice "współczynnik" means the nexus ratio. Here the value is the share of total business income that is qualified and taxed at 5%.
- *Copy:*
  - Label: "Udział dochodu kwalifikowanego IP BOX".
  - Hint: "Część dochodu z działalności opodatkowana 5% (po zastosowaniu wskaźnika nexus)".
  - Add the N7 assumption to Założenia: "Całą składkę zdrowotną i składki społeczne odliczamy od dochodu opodatkowanego liniowo/wg skali — nie od dochodu kwalifikowanego".

**U13. Scale PIT shown as brackets instead of the statutory formula**
- *Where:* `getScalePitBracketLines`.
- *Problem:* lines such as "Kwota wolna (do 30 000,00 zł) … × 0%" and "I próg 12% (30 001,00 zł - 120 000,00 zł)" do not match art. 27 ust. 1. The "30 001,00 zł" boundary is odd and "kwota wolna" is colloquial.
- *Change:* show the statutory formula, and optionally keep the bracket view as a sub-note.
- *Copy:*
  - "do 120 000 zł: 12% × podstawa − 3600 zł (kwota zmniejszająca podatek)".
  - "ponad 120 000 zł: 10 800 zł + 32% × nadwyżka ponad 120 000 zł (art. 27 ust. 1)".

**U14. "Założenia" modal shows developer identifiers instead of sources**
- *Problem:* entries such as `EFFECTIVE_FROM`, `ASSUME_FULL_YEAR_FROM_FEB`, `taxMath.getSocialContributionsForBase()` and "EFFECTIVE_LINEAR_RATE 23,9%" are noise for advisors. The last one is also misleading because it ignores the health-contribution deduction.
- *Change:* replace the code names with a "Źródło" column: Dz.U./M.P. references plus links, which already exist in the comments in `taxConstants.js`. Hide or remove the unused "effective rate" rows.
- *Copy:* "Minimalne wynagrodzenie 2026 — 4806,00 zł — Dz.U. 2025 poz. 1242".

**U15. Two "Skala podatkowa" rows can only be told apart by an icon (`.variant-mark--joint`)**
- *Problem:* in joint mode the two rows look the same apart from a small icon.
- *Copy:* use visible text in the label or tag: "Skala — wspólnie z małżonkiem". In the best card, "Skala podatkowa + IP BOX" ties with the joint IP BOX variant; show this as "ex aequo: … / …".

**U16. Ryczałt defaults and the rate caveat**
- *Problem:* no ryczałt rate is selected by default, so a first look shows only skala vs liniowy. When a ryczałt rate wins, nothing reminds the user that the rate depends on the activity (PKWiU / art. 12).
- *Change:*
  - In an empty "Ryczałt" card, add: "Zaznacz stawkę właściwą dla działalności klienta (art. 12 ustawy o ryczałcie), aby porównać ryczałt."
  - In the best card, when ryczałt wins: "Stawka ryczałtu zależy od rodzaju działalności — zweryfikuj PKWiU."

**U17. Mobile layout (390 px)**
- *Problems:*
  - The header title "Kalkulator podatkowy" is overlapped by the "2026" badge.
  - The results start about 2 600 px below the top, and there is no quick way to see the result while editing inputs.
- *Change:*
  - Wrap or shorten the brand title on small screens.
  - Add a sticky bottom bar with the best variant and amount ("Najniższe: Ryczałt 8,5% · 24 505 zł ↓"), linking to `#resultsSection`.

**U18. Weak focus indicator on toggles (`.toggle-switch .slider`)**
- *Problem:* the focus halo is faint grey (`out/08a-focus-toggle.png`).
- *Change:* use `outline: 2px solid var(--primary); outline-offset: 2px` on `:focus-visible + .slider`, and the same on `.seg-opt` and chips.

**U19. Screen-reader noise**
- *Problem:* the whole `#resultsSection` has `aria-live="polite"`, so every keystroke re-announces all results.
- *Change:* remove it from the section. Add a single `role="status"` element with a summary, e.g. "Najniższe obciążenie: Ryczałt 8,5%, 24 505,02 zł", debounced by about 500 ms.

**U20. Save and share scenarios**
- *Problem:* there is no persistence. A reload loses all inputs, and "Wyzeruj" clears everything without confirmation.
- *Change:* encode the inputs in the URL hash ("Kopiuj link do scenariusza"), optionally remember the last scenario in `localStorage`, and ask before resetting.
- *Copy:* "Wyzerować wszystkie dane? Tej operacji nie można cofnąć."

### P3: polish

- **U21.** When only employment income is present, the export prints a 12-row table of zeros plus "Składka chorobowa: tak" and "FP i FS należne". Collapse this to: "Umowa o pracę ≥ minimalnego: brak składek społecznych z działalności w 2026 r.".
- **U22.** The Ryczałt text "od przychodu …, nadwyżka od innych dochodów ze skali — jedyny sensowny sposób (brak innych dochodów ze skali)" contradicts itself. Change it to: "od przychodu (art. 11 ust. 1) — brak innych dochodów ze skali, więc nie ma alternatywy".
- **U23.** Before any revenue is entered, the result rows show 28 311,60 zł (ZUS plus minimum health) while the best card says "Wprowadź dane". Either show "—" in the rows or label them "koszt stały przy zerowym dochodzie".
- **U24.** The "Pokaż szczegółowe obliczenia" chevron points left when collapsed. Use ▸ collapsed and ▾ expanded.
- **U25.** Esc does not dismiss a tooltip that is open on focus (WCAG 1.4.13). On touch devices, a second tap should close it.
- **U26.** The native date input follows the browser's language. An English-language Chrome shows `mm/dd/yyyy`, which is error-prone for Polish users. Add a hint under the field: "dd.mm.rrrr", or use three numeric fields.
- **U27.** Amount formatting is inconsistent: "1926,76 zł" vs "23 121,12 zł", which is correct `pl-PL` behaviour but misaligns columns. In tables, use `useGrouping: "always"` for column alignment.
- **U28.** The etat checkbox and "Inne dochody" are not cross-checked. With the checkbox on and other income at 0, show: "Zaznaczono umowę o pracę — wpisz dochód z etatu w polu „Inne dochody opodatkowane skalą”."
- **U29.** "Mały ZUS Plus" (art. 18c) is not modelled. Advisors will look for it. Add a disabled fourth option "Mały ZUS Plus (wkrótce)", or a note under "Ścieżka składek".

---

## Scenario notes

1. **New client, 15.03.2026, ulga, 180k/30k.** Ulga III–IX, mały ZUS X–XII: 1 368,54 zł. Health for 10 months. Ryczałt 8,5% is best at 24 505,02 zł. Every number can be reproduced from the export. The ulga end date is open to question (N4).
2. **400k/80k + etat 90k, employment checkbox on.** Ryczałt 12% 64 864,05 zł (tier III, 1 495,04 × 12), linear 73 801,00 zł, scale 125 200,00 zł. The baseline of 7 200 zł is explained well. The ZUS section is noisy (U21).
3. **+ joint taxation, spouse 60k.** Joint scale 113 200,00 zł vs individual 125 200,00 zł. The 3-step attribution in the export is excellent. The two rows are visually near-identical (U15).
4. **Ryczałt 12% near the thresholds, multi-rate.** The tier moves exactly at revenue − social contributions = 60 000 / 300 000, as documented. In multi-rate mode, 150k at 12% + 50k at 8,5% gives 52 396,30 zł (verified). See U10 for the presentation issues.
5. **IP BOX 80% (300k/20k).** Linear+IP BOX 50 949,73 zł. The deduction-method comparison shows a real difference (+2 403,47 zł for costs), which is good. See N1, N7 and U12.
6. **Woman born 10.06.1970, full ZUS, wakacje.** FP/FS exempt for the whole year, so 1 788,29 zł per month. The holiday month defaults to January (N5).

**Performance:** the page loads in about 0.46 s (DOMContentLoaded). With every option on (10 rates, IP BOX, joint, wakacje, other income), a recalculation takes a median of 6,9 ms (max 17 ms). With the breakdown open it takes a median of 35 ms (max 47 ms), which is fine. Rebuilding the 46 k-character text on every keystroke is the only visible cost; debounce it if the breakdown is later made richer.
