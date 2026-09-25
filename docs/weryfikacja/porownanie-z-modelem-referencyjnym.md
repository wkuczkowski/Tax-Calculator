# App vs reference model: comparison report

> **Data:** 2026-09-24  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu.  
> **Zakres:** porównanie aplikacji (HEAD `9121c02`) z niezależnym modelem referencyjnym: 396 przypadków brzegowych, test losowy, spójność tekstu „szczegółowe obliczenia”, sondy DOM. Opisuje przyczyny rozbieżności RC1 (poprawione w aplikacji, decyzja R1) i RC2 (zaakceptowana różnica interpretacji, decyzje H5/R9).  
> **Pierwotna nazwa pliku:** `refmodel/COMPARE_REPORT.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).
>
> **Stan obecny:** model i skrypty są utrzymywane w [`tools/refmodel/`](../../tools/refmodel/) (`npm run verify:refmodel`, `verify:breakdown`, `verify:fuzz`). Tamtejszy README opisuje aktualną listę znanych różnic (dziś tylko RC2, przypadek L-385). Pliki `refModel.v1.mjs`, `expected.v1.json` i `probe*.mjs` wymienione niżej nie zostały przeniesione do repozytorium.

- **App version:** HEAD `9121c02`.
- **How the app was driven:** only through the DOM, in jsdom, via `2026/tests/helpers/loadCalculator.js`. I did not read `script.js` or `taxConstants.js`, did not modify the repo, and did not run npm test.
- **Model settings:** `refModel.mjs` with the defaults aligned to the SPEC ADDENDUM:
  - A1: `ipBoxAllowKupSocial = true`
  - A2: `wakacjeMonthChoice = 'perVariant'`, plus `wakacjeAllowNone = true`
  - A3: `healthMonthsWhenZusDisabled = 'fromStartDate'`
  - The other options already matched A4–A10.
- **Tolerance:** ±0.02 zł per field.

## 1. Counts

| Check | Result |
|---|---|
| Grid cases (`cases.json`) | 396 |
| Variant results compared (total, taxes, baseline, health, social) | 4 666 |
| Mismatching variant results | **16**, in 5 cases |
| Identity `total = taxes − baseline + health + social` on app data-* | 4 666 / 4 666 OK |
| ZUS summary (`#zusSocialTotal` data-social / data-fpfs vs model S / FP) | 396 / 396 OK |
| Health-insurance months (`#zusHealthMonths`) | 396 / 396 OK |
| Per-variant wakacje month (`data-holiday-month`; "no holiday" allowed) | 4 666 / 4 666 OK (H-253: ryczałt picks the pref month I, skala and liniowy pick the full month X, same as the model) |
| Month regimes (`#zusMonths li[data-regime]`) | All consistent. Label differences: fullPartial/prefPartial are shown as full/pref. In employment + ulga cases the ulga months are labelled `employment` (both are 0 zł). |
| JS errors in the window | 0 |
| Random differential test (`fuzz.mjs`, seeds 7 / 99 / 2024) | 1 000 random inputs, 11 152 variants. Only 3 inputs differ, all with root cause RC1. |
| Breakdown text (`checkBreakdown.mjs`, 60 sampled cases) | 715 variant sections: RAZEM line = data-total, RAZEM addends = data-(taxes−baseline) / health / social, ZUS line = data-social. 2 097 arithmetic lines checked ("A × p% = B", sums, differences, "A : 2", "× 2"). **0 inconsistencies.** |

**Model bug found and fixed.** The fuzz run caught it; it is not an app bug.
- In multi-rate mode the model summed the allocations in floating point: 9 731,85 + 71 727,63 = 81 459,48000000001.
- The tier revenue therefore came out at 60 000,00000000001, and the model wrongly picked health tier 2.
- The app was correct. The model now rounds P and the tier revenue to grosze, and `expected.json` has been regenerated.
- The previous files are kept as `refModel.v1.mjs` and `expected.v1.json`.

**Presentation difference, normalised in the harness.** Totals are identical; only the split between fields differs.
- For joint variants the app puts `2·PIT(½Σ) − spouse's solo PIT` into `data-taxes`, which can be negative (e.g. −27 600).
- The spouse's PIT is left out of `data-baseline`.
- The model reports the spouse's PIT inside the baseline. 20 grid cases were affected before normalisation (J-308…J-325, J-328…J-330, M-388, N-389).
- Joint PIT rounding: the app rounds the tax on the half and then doubles it, e.g. 24 397,12 × 2 = 48 794,24. The model rounds after doubling (48 794,25). The difference is ≤ 0,01 zł.

## 2. Mismatches by root cause

### RC1: ryczałt "nadwyżka → skala" wastes the 50% health deduction. App is suboptimal.
Classification: **app bug (not the cheapest legal method) / interpretation of A5**. 4 grid cases, 15 variants, plus 3 fuzz inputs.

**What the app does** (seen in `readBreakdown`, I-265, ryczałt 17%):
- It deducts social contributions from ryczałt revenue up to the full revenue (10 000,00).
- It then deducts 50% of health (2 990,10) from a revenue that is already zero, so that deduction is lost.
- Only S − revenue (11 459,48) goes to the scale.

**What the model does:**
- It deducts 50% of health first (art. 11 ust. 1a uRycz).
- It then deducts only as much social as still fits (7 009,90).
- The rest (14 449,58) goes to the scale under art. 26 ust. 13a.

**Why this is legal:** it is the same kind of split the app already allows ("excess over ryczałt revenue → scale"); only the split point moves. Art. 11 ust. 1 lets the taxpayer deduct from ryczałt revenue only contributions not deducted under the PIT act. Nothing forces them to deduct social to the point where the 50% health deduction is lost.

**When it applies:** ryczałt revenue < S + 50% of health (about 26–32 k with full ZUS) and the taxpayer has other scale income.

| Case | Input | Variant | App (method) | Model | Δ |
|---|---|---|---|---|---|
| I-265 | rev 10 000, costs 30 000, other 50 000, full ZUS | ryczalt10 / 12 / 14 | 27 402,31 / 27 542,51 / 27 682,71 (scale) | 27 367,37 | +34,94 / +175,14 / +315,34 |
| I-265 | same | ryczalt15 / 17 | 27 726,18 (ryczalt) | 27 367,37 | +358,81 |
| I-272 | rev 20 000, other 50 000 | ryczalt12 | 28 742,51 (scale) | 28 567,37 | +175,14 |
| I-272 | same | ryczalt14 / 15 / 17 | 28 926,18 (ryczalt) | 28 567,37 | +358,81 |
| I-291 | rev 15 000, other 100 000 | ryczalt14 | 28 207,57 (scale) | 27 967,37 | +240,20 |
| I-291 | same | ryczalt15 / 17 | 28 326,18 (ryczalt) | 27 967,37 | +358,81 |
| J-326 | rev 10 000, costs 25 000, other 80 000, joint spouse 0 | ryczalt14 / 15 / 17 | 27 507,57 / 27 577,66 / 27 717,86 (scale) | 27 367,37 | +140,20 / +210,29 / +350,49 |
| fuzz | rev 18 166,29, other 114 588,84, pref ZUS, joint | ryczalt14 / 15 / 17 | 27 188,61 / 27 243,89 | 26 885,08 | +303,53 / +358,81 |
| fuzz | rev 19 313,62, other 89 200,34, full ZUS without chorobowe | ryczalt14 / 15 / 17 | 27 349,23 / 27 381,57 | 27 022,76 | +326,47 / +358,81 |

**Worked check (I-265, 17%):**
- App: other income taxed on 50 000 − 11 459,48 = 38 540,52, giving tax 1 024,86. Ryczałt tax 0.
- Model: other income taxed on 50 000 − 14 449,58 = 35 550,52 → tax 666,05, and the ryczałt base is 10 000 − 7 009,90 − 2 990,10 = 0.
- The difference is 12% × 2 990,10 = 358,81, which is the cap on this error at the 12% scale bracket.

**Fix:** in the "od przychodu, nadwyżka od skali" option, deduct from ryczałt revenue `S_r = min(S, max(0, P − 50%·H))` and send `S − S_r` to the scale. The health-tier revenue under art. 81 ust. 2g must then use the same `S_r`.

### RC2: multi-rate when the allocations do not add up to revenue. Interpretation difference, input is inconsistent.
Classification: **interpretation difference** (the app explicitly warns and leaves the sum out of the ranking). 1 case.

| Case | Input | App | Model | Δ |
|---|---|---|---|---|
| L-385 | revenue 200 000, allocations 12%: 100 000 + 8,5%: 50 000 | 47 189,59 | 46 473,42 | +716,17 |

- **App:** the health tier and the art. 11 ust. 3 proportions use the full revenue (200 000). The share of deductions that belongs to the unallocated 50 000 is dropped, so the 12% part gets 26 442,96 × 100/200.
- **Model:** uses the sum of the allocations (150 000) for everything, as audit B10 suggested ("one consistent value").
- Both are defensible for an inconsistent input. The app's breakdown states: "UWAGA: podział przychodu nie zgadza się… Suma nie jest porównywana w rankingu."

## 3. Findings from DOM probes (outside the grid)

1. **A dot is treated as a thousands separator.**
   - "23121.12" in #revenue becomes **2 312 112,00 zł**; "100000.5" becomes 1 000 005.
   - The field is reformatted, so the user can see it, but typing a decimal point by habit silently multiplies the amount by 100.
   - The harness had to feed decimal commas.
   - UX risk: medium.
2. **A start date after 2026 shows a validation error, but results are still calculated and displayed.**
   - "Data rozpoczęcia nie może być późniejsza niż 31.12.2026." appears, yet #taxScale shows 35 665,69 zł, the same as with no start date.
   - SPEC says "walidacja/błąd". Results that silently ignore the field alongside an error are misleading.
   - A future birth date behaves the same way (it is harmless there).
   - Severity: low.
3. **Regime label:** with the employment checkbox and the ulga path, ulga months are labelled `employment`. Cosmetic.
4. **Global ZUS table vs per-variant wakacje:** the table shows the "global" holiday month (highest contribution), while variants may pick another month or none. The text discloses this, and each variant's `data-social` is correct. OK.
5. **Invalid calendar dates** (2026-02-30): the input is type=date, so browsers sanitise it; jsdom does the same. Not an issue.

## 4. Ranked list of suspected app bugs

1. **RC1: ryczałt social "excess → scale" split wastes the 50% health deduction.** Observed maximum: 358,81 zł (= 12% × 2 990,10, other income in the 12% bracket). When other income is in the 32% bracket, the "everything to the scale" option already wins, so there is no difference (probe: revenue 15 000, other 200 000 → app = model). Only for low ryczałt revenue (< S + 50% H) with other scale income. The fix is small (see RC1).
2. **Decimal point read as a thousands separator** (probe 1). A user can get a result 100× off. Suggest accepting "." as a decimal separator when it is followed by 1–2 digits, or showing a warning.
3. **Results shown despite a start-date validation error** (probe 2). The calculation should be blocked, or the result clearly marked as "computed without the start date".
4. **RC2: multi-rate with unallocated revenue.** Only an interpretation difference (it is disclosed). Consider requiring the allocations to sum to revenue before calculating.
5. **Cosmetic:** the regime label for ulga months under an employment contract (probe 3).

No other discrepancies were found. These areas all match the model to the grosz on every grid and fuzz input:
- ZUS schedule
- FP (including the partial month and the age exemption)
- wakacje eligibility and per-variant choice
- health months and bases
- the 14 100 limit
- the 60k / 300k tiers with 2g, and 8,5/12,5
- IP BOX (A1 KUP option, proportional FP)
- joint filing (B3)
- danina and its baseline
- other income
- ZUS toggle off

## Files (session working directory `refmodel/`; maintained version: [`tools/refmodel/`](../../tools/refmodel/))
- `compare.mjs`: harness. `node compare.mjs [idPrefix]` writes `compare_out.json` (per case: diffs, social summary, regimes, health months) and `compare_soft.json` (holiday-month diffs).
- `checkBreakdown.mjs` → `breakdown_check.json`: breakdown text consistency.
- `fuzz.mjs N seed` → `fuzz_out_<seed>.json`: random differential test.
- `probe2.mjs <caseId…>`: prints the app's breakdown text. `probe3.mjs` / `probe4.mjs`: the validation and parsing probes.
- `refModel.mjs` (aligned with the addendum, float fix), `expected.json` (regenerated; `alt` lists the other interpretations), `cases.json`, `HAND_CHECKS.md` (still 58/58 OK).
