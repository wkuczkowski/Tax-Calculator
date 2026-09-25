# Final verification: branch `claude/internet-access-check-gwiyap` @ 0305dd6 (scope `07adef8..HEAD`)

> **Data:** 2026-09-24  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu.  
> **Zakres:** weryfikacja końcowa gałęzi przed merge (`07adef8..0305dd6`): problemy uszeregowane według wagi, kontrola prawna R1 (kolejność odliczeń przy ryczałcie), wyniki skryptów weryfikacyjnych, regresja względem `04de063`, test w przeglądarce, testy. Poprawki po tym raporcie są opisane w [rejestrze decyzji](../decyzje/decyzje-implementacyjne.md), sekcja 9.  
> **Pierwotna nazwa pliku:** `final/FINAL_VERIFICATION.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).
>
> **Stan obecny:** skrypty `refmodel/*.mjs` wymienione niżej są utrzymywane w [`tools/refmodel/`](../../tools/refmodel/). Artefakt L-374…L-377 (szum zmiennoprzecinkowy w `cases.json`) usunięto tam: generator zaokrągla kwoty do groszy. Jedyną oczekiwaną różnicą jest L-385 (RC2).

## Verdict: nearly ready. Fix #1 (process) and #2 (small code fix) before the PR is merged

The calculation engine is consistent everywhere I checked:
- the reference model (after removing harness artifacts);
- 600 fuzz cases;
- the breakdown arithmetic;
- the regression grid against 04de063.

Lint is clean, the shim runs every test without an exception, and the browser smoke test at 1440 and 390 px has no page errors. The only console error is the Google Fonts TLS failure.

The R1 legal decision is defensible and low risk. Two things block the merge:
- **Snapshots:** the committed `.snap` files are stale, so the user must update them.
- **Validation:** a hidden, inert field can block all results.

---

## Ranked issues

### 1. MUST (process): the committed snapshots are stale, so `npm test` will fail until they are updated
- **Evidence:** `final/snapdiff2.mjs` runs the shim and serialises each value with `@vitest/pretty-format`, then compares it with `2026/tests/__snapshots__/*.snap`.
- **Result:** 27 existing snapshot entries: **24 differ**, 3 match. There are 29 new entries and none are obsolete.
- **Why they differ:**
  - social ZUS is now on by default, which adds `zusSocialTotal`, `zusFpTotal`, `zusSchedule`, `healthMonths` and `socialDeduction`, and changes every total;
  - `TAX_CONSTANTS` has new ZUS keys and `LEGAL_STATUS_DATE`;
  - the multi-rate ryczałt split now uses R1.
- **Fix:** the user runs `npm run test:update`, reviews the diff and commits both `.snap` files in the PR. The tests README already says this.

### 2. MEDIUM: a hidden birth date blocks all results when "Uwzględnij składki społeczne" is off
- **Repro (Playwright, both viewports; `final/smoke.out`, screenshot `shots/*-05-invalid-hidden-birth.png`):**
  1. Set the start date to 16.03.2026.
  2. Set the birth date to 01.05.2026. This correctly gives "Data urodzenia musi być wcześniejsza niż data rozpoczęcia".
  3. Switch social ZUS **off**.
- **What happens:** the results stay in the "Popraw dane" state. `#zusBirthDate` is inside the `inert` `#zusReveal`, so the user cannot see or reach it. Clicking the error link in the card does nothing (focus stays on the link). A typed but incomplete birth date (`badInput`) left behind before switching the section off causes the same thing.
- **Cause:** `validateAllInputs()` always calls `validateBirthDate()`. The birth date only matters for FP/FS, so it is irrelevant when social ZUS is off.
- **Fix:**
  ```js
  if (DOM.zusEnabled.checked) note("zusBirthDate", validateBirthDate());
  else clearFieldError("zusBirthDate");
  ```
  Optionally also make `renderInvalidState` error links reveal the section before focusing, or skip targets that sit inside `[inert]`.

### 3. LOW (UX): results flicker to "invalid" while the user types a grouped number or a date
- **Evidence:** typing `150 000` key by key gives the states `ranked, ranked, ranked, ranked, invalid, invalid, ranked`. `150 0` and `150 00` are bad groupings.
- **Dates:** Chrome's date input produces `0002-…`/`0202-…` while the year is typed. That fails `DATE_MIN` for a moment.
- **Accessibility:** the aria-live message "Wyniki ukryte…" is debounced by 700 ms, so it is announced only if the user pauses.
- **Fix (optional):** on `input` events, while the field has focus, accept a trailing incomplete group, or keep the previous results and show format errors only on blur or change.

### 4. LOW: `parseAmount` misreads mixed separators without warning
- `"1 000,555"` → **1 000 555**. With spaces as the grouping, `,555` is taken as another thousands group instead of a 3-decimal typo.
- `"1,234"` → 1234 is by design (R4) and acceptable.
- `"1 000,-"` and `"zł 100"` are rejected with a visible error, which is safe.
- **Fix (optional):** if the integer part already uses spaces as the thousands separator, treat a single trailing `,ddd`/`.ddd` as a decimal part, which gives an error for 3 digits.

### 5. COSMETIC: wording in the ryczałt breakdown
- **Revenue below 50% of health (e.g. revenue 1 000, other income 50 000):**
  - The text shows "Odliczenie 50% składki zdrowotnej: 2990,10", then "Podstawa: 1000,00 − 2990,10 = 0,00". It never says that the unused 1 990,10 is lost; it cannot be carried to scale income, which is correct.
  - The header says "składki społeczne: od przychodu" although 0 zł of social contributions came from revenue. The method tied with "od skali" and was picked as the first option.
- **Other-income line:** it says "ust. 13a — nadwyżka ponad przychód". Since R1 this should read "…ponad przychód pomniejszony o 50% zdrowotnej".
- **Suggestion:** add one practical line on how to report it: "W PIT-28 (część E.1) wpisz jako składki społeczne tylko X; resztę Y odlicz w PIT-36/PIT-37". See the legal section below.

### 6. COSMETIC, existed before this PR: "zł" appears twice in amount inputs
Formatted values such as "150 000,00 zł" sit next to the "ZŁ" suffix. 04de063 already did this (`formatPLN` in the input plus the suffix).

---

## Task 1: legal check of R1 (ryczałt: 50% of health first, social contributions only up to the rest, remainder from scale income)

**Provisions checked (current texts, Sejm ELI API on 24.09.2026):**
- **Ryczałt act, t.j. Dz.U. 2025 poz. 843:** the only amendment after the consolidated text is Dz.U. 2026 poz. 779. It changes art. 15 ust. 13a only (signing powers). **Art. 11 is unchanged.**
- **PIT act, t.j. Dz.U. 2026 poz. 592:** amendments 779 (art. 24a), 1079 (art. 20–29 shipping items, art. 27 ust. 4 pkt 5) and 846 (art. 25b, 30f, 31d; in force 1.10.2026). **None touches art. 26 ust. 1 pkt 2 or ust. 13a.**
- **Correction:** the 50% health deduction is **art. 11 ust. 1a**, not 1b. Ust. 1b only says that the amount is set from documents. IMPL_DECISIONS ([rejestr decyzji](../decyzje/decyzje-implementacyjne.md)) R1 already cites 1a correctly.

**Texts:**
- Ryczałt act, **art. 11 ust. 1:** "Podatnik … opłacający ryczałt od przychodów ewidencjonowanych, **może odliczyć** od przychodów … wydatki określone w art. 26 ust. 1 pkt 2 … ustawy o podatku dochodowym, **jeżeli nie zostały odliczone od dochodu** lub nie zostały zaliczone do kosztów uzyskania przychodów…"
- **Art. 11 ust. 1a:** "Przychody, o których mowa w art. 6 ust. 1, **mogą być pomniejszone o 50 % składek na ubezpieczenie zdrowotne** zapłaconych w roku podatkowym … 1) z tytułu pozarolniczej działalności gospodarczej opodatkowanej w formie ryczałtu…"
- **Art. 11 ust. 4:** "Przychody … pomniejszone o dokonane na podstawie ust. 1, 1a, 2 i 3a odliczenia…". The deductions are listed together, with **no order** between ust. 1 and 1a.
- **Art. 11 ust. 3:** the proportional split across rates. It says nothing about order.
- PIT act, **art. 26 ust. 13a:** "Wydatki na cele określone w ust. 1 podlegają odliczeniu od dochodu, jeżeli nie zostały zaliczone do kosztów … lub **nie zostały odliczone od przychodu na podstawie ustawy o zryczałtowanym podatku dochodowym** albo nie zostały zwrócone…"
- **Health contribution is not transferable:** art. 26 ust. 1 has no health-contribution item, and art. 27b is repealed ("(uchylony)"). The health deduction from income exists only for linear tax, in art. 30c ust. 2 pkt 2: "składki na ubezpieczenie zdrowotne … z tytułu pozarolniczej działalności gospodarczej opodatkowanej zgodnie z ust. 1". So an unused 50% ryczałt health deduction **cannot** be moved to scale income. The app is correct to drop it.

**Form practice:**
- I checked PIT-28(26) (podatki-pit.pl mirror; the podatki.gov.pl copy was blocked by Incapsula). E.1 "Odliczenia … na podstawie art. 11 ust. 1": poz. 97 "Składki na ubezpieczenia społeczne", "Suma odliczeń nie może przekroczyć sumy przychodów".
- E.4 poz. 104 is the health contribution (art. 11 ust. 1a). In part F the health share per rate "nie może przekroczyć kwoty przychodu z poz. 51 **pomniejszonej o kwotę z poz. 108**", where poz. 108 is the social contribution share.
- So **the form computes social first and caps health at the revenue left over**. But the amount in poz. 97 is whatever the taxpayer claims. Nothing in the act or on the form requires claiming the maximum social deduction from revenue: art. 11 ust. 1 says "może odliczyć".
- The R1 result is therefore reached by entering a **reduced** social amount in poz. 97, namely revenue − 50% of health. The rest goes into PIT-36/PIT-37 under art. 26 ust. 13a, which requires only that the contributions "nie zostały odliczone" from ryczałt revenue, not that they "could not be". The form's footnote 6) repeats the same literal condition.

**Verdict: SAFE / LOW RISK (defensible literal reading).**
- The statute sets no order. Both deductions are optional ("może", "mogą być"). Art. 26 ust. 13a keys on the contributions not actually having been deducted.
- **Residual risk:**
  - I found no individual interpretation (KIS) that expressly confirms deliberately under-claiming social contributions in PIT-28 to make room for the health deduction.
  - The form's default flow is social first, so a tax office could question the split. Its argument would be weak, because the law gives no basis for requiring the maximum claim.
- **Tier interaction:** R1 cannot move the health tier. Revenue is "insufficient" only when R < S + ½H, which is at most about 31 000 zł (below the 60 000 threshold). So health-first dominates social-first, and R1's claim "stara kolejność jest zdominowana" holds.
- **Recommendation:** keep R1. Add the filing note from issue #5 to the export so an adviser knows to enter the reduced amount in PIT-28 poz. "Składki na ubezpieczenia społeczne".

---

## Task 2: harness results (`final/harness/`)

| Harness | Result |
|---|---|
| `refmodel/compare.mjs` | 396 cases, 4 666 variants: **13 mismatching variants in 5 cases**, 2 social-summary differences, 0 soft differences |
| `refmodel/checkBreakdown.mjs` | 60 cases, 712 sections, 1 964 arithmetic lines: **0 problems** |
| `refmodel/fuzz.mjs` 200 × seeds 7 / 99 / 2024 | 2 253 / 2 271 / 2 222 variants: **0 cases with differences** |
| `codereview/consist.mjs` | 5 668 checks, 0 bad |
| `codereview/consist2.mjs` | 2 150 checks, 0 bad |
| `codereview/scenA.mjs` | RC1: ryczałt 12/17% = 27 967,37 (hand check); 2% = 26 766,38 (method "scale"). Consistent with R1. |
| `codereview/robust.mjs` | All expected: negative amount, IP BOX 150, "abc", start date 2027, year 1899, birth date 2030 and spouse −10 000 all give "Popraw dane" with the right messages. `1234.56` → 1 234,56. `50000.50` → 50 000,50. No JS errors. |
| `codereview/grid.mjs` (needs `codereview/old`; I linked it temporarily to the 04de063 worktree) | 1 568 cases, 1 709 differences. These are the same categories as in REVIEW.md: stale hidden joint/IP BOX fields in 04de063 plus loss clamps. The filtered analysis is in Task 3. |
| `runtests.mjs` shim | **93 pass, 0 fail, 56 snapshots executed** without throwing |
| `npm run lint` | clean |

**Every remaining compare mismatch explained:**
- **L-374, L-375, L-376, L-377: harness artifact.**
  - Cause: `cases.json` stores the revenue as float noise (`61459.479999999996`, `81459.48999999999`), and the harness types it as `61459,479999999996`. The strict parser (R4) correctly rejects more than 2 decimals, so the app is in the invalid state with no data.
  - This also explains the 2 social-summary differences (L-375, L-376).
  - Re-run with the revenue rounded to the grosz (`final/l37x.mjs`): **all variants match**. The largest gap is 0,01 (L-376 ryczaltMulti, within tolerance).
- **L-385: documented interpretation difference RC2 / H5 / R9.** Allocations (150k) ≠ revenue (200k); the app takes the health threshold and shares from the full revenue. The result is flagged as incomplete and excluded from the ranking, and the app states this explicitly.

## Task 3: regression vs 04de063 (ZUS off, other income 0)

- **Setup:** script `final/regress.mjs`, output `final/regress.out`. The 04de063 worktree was detached under `final/wt04` and **removed afterwards**; `git worktree list` shows only the main tree, and the repo is clean.
- **Grid:** 16 revenues (incl. 59 999,99 / 60 000,01 / 300 000,01 / 81 459,48) × costs 0/30/90/120% × IP BOX {off, 0, 25, 33.3, 50, 99.9, 100} × joint {off, 0, 50k, 300k}, plus 224 multi-rate splits. **2 016 cases, 0 JS errors.** Hidden rows (`.joint-taxation-card`/`.ipbox-card` without `.show`) are skipped.

All 2 407 real differences fall into intended categories:

| Category | Count | Explanation |
|---|---|---|
| Best card, 04de063 bug | 518 titles + 518 amounts | 04de063 ranked **stale hidden** joint or IP BOX rows. Example: 81 459,48 with joint off gave best "Skala wspólnie" 5 798,39; now "Ryczałt 2%" 11 496,48. Fixed by R10 (ranking built from the result). |
| Loss clamps F1/F2 | IP BOX 268 + 32 per IP BOX row; joint 105 + 214 (+26 negative → clamp); best 256 | IP BOX loss: qualified income 0 (e.g. 5 187,98 → 5 190,48, −982,36 → 5 190,48). Joint: taxpayer income max(0, …) (e.g. −22 473,52 → −22 409,52). Title changes (153) follow from ties created by the clamp (IP BOX = scale, so the first in order wins). |
| Rounding tie R2 | 12 × 0,01 | Revenue 1 000, costs 300, IP BOX 99.9%: 5% × 699,30 = 34,965 (float 34,96499…) now rounds half-up to 34,97. Joint doubles it: −22 374,34 → −22 374,33. 81 459,48 / 90% / 33.3% / joint 300k: −20 535,23 → −20 535,21 (income = round2(P−K) plus tie, doubled by the joint formula). |
| Multi-rate allocation (F7 / R2) | 4 × 0,01 | 50 000 split 16 665 / 33 335: largest-remainder split of `round2(amount)` moves 1 grosz of deduction between rates, so ryczałt 15% 4 701,22 → 4 701,23 and the total 11 543,18 → 11 543,19. |
| NaN = NaN | 112 | Both "—" (empty state); harness noise. |

No other differences. With ZUS off and no other income, the single-rate ryczałt, scale, linear and multi-rate values are identical apart from the rows above.

## Task 4: fresh-eyes review of 0305dd6

- **Parser edge cases (`taxMath.parseAmount`):**
  - Accepted: `"0"`; `""`/`"  "` (empty → 0, no error); `" 1 000 "`; `"1 000,5"` → 1000.5; NBSP/U+202F/U+2009 plus "zł"/"PLN"/"zł." (`"1 000,50 zł"`, `"12 345,67 zł"`); `"1.234,56"`; `"1,234.56"`; `"5,"` (mid-typing); `"100zł"`.
  - Rejected with a visible error (safe): `",5"`, `".5"`, `"+100"`, `"zł 100"`, `"1 000,-"`, `"1234.567"`, `"12 34"`, `"1e3"`.
  - Only silent misread: issue #4.
- **Browser paste:** filling `120␣000,00␣zł` (NBSP) works and formats back to "120 000,00 zł".
- **Recalculation triggers:** revenue, costs and other income use input+blur; spouse income uses input+blur when joint is on; dates use input/change/blur; radios and checkboxes use change; IP BOX uses number+range; rate inputs use input+blur; the multi-rate toggle and rate checkboxes use change. None is missing. `calculate()` always re-validates everything.
- **Inert:**
  - `#ipBoxReveal`, `#spouseIncomeCard` and `#zusReveal` start inert in the HTML, are re-synced at init from the control state, and become interactive when switched on (verified: IP BOX 50 and spouse 40 000 typed in the browser).
  - The background is inert only while a modal is open, and is restored on close (`main inert = false` after Esc).
  - The only defect found is issue #2.
- **Modals:** Enter on the button opens the modal and focuses the "Kopiuj" button. Tab cycles inside (close > preview > close button > copy > close …, never outside). Shift+Tab also cycles. Esc closes and focus returns to the opening button. With the copy modal open, `#main` is inert.
- **Export:**
  - Fresh-load export (8 092 chars): clean, no "undefined", NaN or "[object".
  - Invalid-state export: the single sentence "Wyniki nie są dostępne…".
  - ZUS-off export: clean.
  - Employment contract with ulga: "Ścieżka składek (wybrana): ulga na start → mały ZUS — nie stosowana przy umowie o pracę".
  - The clipboard text equals the preview (27 908 chars).
- **Empty state:** a fresh load shows best card "—" with "Wprowadź dane…", Dochód 0,00 zł, no errors and no horizontal overflow.
- **Reset:** confirm dialog, then the empty state, with focus on revenue.

## Task 5: browser smoke (Chromium headless_shell 1194, pl-PL; `final/smoke.cjs`, `final/smoke.out`)

**Viewports:** 1440×900 and 390×844.

**Scenarios:**
1. **Pasted NBSP amounts, 120k / 20 000,50:** best "Skala podatkowa" 35 665,58.
2. **Ryczałt 12%, start 16.03.2026 with ulga, other income 80k:** best "Ryczałt 12%" 27 011,77, with the "zweryfikuj stawkę" note.
3. **IP BOX 50% + joint 40k + wakacje:** best "Podatek liniowy + IP BOX" 21 462,42, wakacje in XII. The months strip shows "I–II przed rozpoczęciem · III–IX ulga · X–XI mały ZUS · XII wakacje".

**Checks:**
- Invalid state and the issue #2 repro.
- Keyboard modal checks and export copy (see Task 4).
- Horizontal overflow 0 px at both widths.
- **Errors:** only the Google Fonts `ERR_CERT_AUTHORITY_INVALID` request failure plus its console error.

**Screenshots** in `final/shots/`, prefixed `desktop-` and `mobile-`:
- `01-fresh`, `02-s1`, `03-s2`, `04-s3`
- `05-invalid-hidden-birth`
- `06-copy-modal`, `07-info-modal`
- the export texts: `desktop-export.txt` and `mobile-export.txt`

The server on port 5503 was stopped.

## Task 6: tests

- **Helpers:** every setter in `tests/helpers/loadCalculator.js` targets ids and selectors that exist in `index.html`:
  - ids: `#zusEnabled`, `#zusStartDate`, `#zusSickness`, `#zusEmployment`, `#zusHoliday`, `#zusBirthDate`, `#otherIncome`, `#multipleRatesToggle`, `#calculateButton`, `#copyFab`, `#copyPreview`, `#ratesTotalValue`, `#zusSocialTotal`, `#zusHealthMonths`, `#zusHolidayStatus`;
  - selectors: `input[name=zusPath|zusSex]` (including `value=""`), `.rate-input[data-for]`, `input[data-target]`.
- **Shim run:** 93/93 assertions pass and all 56 snapshot calls execute without throwing. The tests use only `toBe`, `toEqual` and `toMatchSnapshot`, with no async tests, so the shim is representative.
- **Snapshots:** they will **fail** under vitest until updated (issue #1).

## Files
- **Harness outputs:** `final/harness/*.out`, `final/harness/compare_out.json`. The full per-case JSON was rewritten by the harness at `refmodel/compare_out.json`.
- **Scripts:** `final/regress.mjs` + `regress.out`, `final/l37x.mjs`, `final/snapdiff2.mjs`, `final/rysmall.mjs`, `final/exp.mjs`, `final/smoke.cjs` + `smoke.out`.
- **Legal sources:** `final/pit28.txt` (PIT-28(26) form text), `final/a846.txt` (Dz.U. 2026 poz. 846).
