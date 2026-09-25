# Adversarial review: `git diff 04de063..9121c02`

> **Data:** 2026-09-24  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu.  
> **Zakres:** krytyczna recenzja zmian `04de063..9121c02`: składki społeczne ZUS, inne dochody na skali, wybór optymalnego odliczenia, poprawki po recenzji. Obejmuje harmonogram składek, FP, wakacje, daninę, optymalizator oraz porównanie starej i nowej wersji przy wyłączonym ZUS.  
> **Pierwotna nazwa pliku:** `codereview/REVIEW.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

**Scope:** social ZUS contributions, other scale income, the optimal-deduction choice, and the review fixes.

**What I did:**
- Reviewed branch `claude/internet-access-check-gwiyap` at 9121c02. I did not modify the repo and made no commits.
- Did not run `npm test`.
- Ran eslint on `2026/`: clean.
- Ran the explicit assertions through `runtests.mjs` (a vitest shim in the session working directory): 76 passed, 0 failed; 56 snapshot calls were collected but not compared.

**Scratch scripts** were in the session working directory `codereview/` (not kept in the repo; the maintained equivalent is [`tools/refmodel/`](../../tools/refmodel/)):

| Script | What it does |
|---|---|
| `lib.mjs` | jsdom loader, parameterised by root |
| `grid.mjs` | old vs new comparison with ZUS off, 1568 cases |
| `fuzzip.mjs` | random IP BOX / joint inputs with grosze, 1200 cases |
| `multi.mjs` | multi-rate ryczałt, old vs new |
| `consist.mjs`, `consist2.mjs` | display vs `data-total` vs breakdown RAZEM, and RAZEM arithmetic |
| `ref.mjs` | independent reference optimiser |
| `sched.mjs` | schedule edge cases |
| `robust.mjs` | invalid and extreme inputs |
| `scenA.mjs`, `scenB.mjs` | the specific findings below |

The 04de063 worktree used for the comparisons was removed afterwards. To re-run the old-vs-new scripts, recreate it:

```
git worktree add --detach <katalog-roboczy>/codereview/old 04de063
```

## Verdict

**The core is sound.**
- **Schedule:** `buildSocialSchedule` matches the spec, the addendum and ZUS practice in every edge case I tried.
- **Optimiser:** it matches my independent reference model exactly: 250 random scenarios × 11 variants, 0 mismatches.
- **Consistency:** the displayed value, `data-total`, breakdown RAZEM, export and ranking are consistent.
  - 5668 + 2150 checks, 0 mismatches.
  - The RAZEM parts always add up.
  - Exactly one `is-best` row.
- **Regressions with ZUS off:** apart from the intended fixes F1, F2, F6 and F7, the only difference is one 1-grosz float rounding case (finding 4).

**I found one real optimiser gap (ryczałt, low revenue plus other income).** The rest are low-severity input-robustness issues and cosmetic nits.

## Findings, ranked

### 1. MEDIUM-LOW: ryczałt deducts social contributions from revenue before the 50% health deduction, which wastes the health deduction
- **Where:** `2026/script.js:736-742` (`computeRyczaltOption`, method `"ryczalt"`).
- **What the code does:** `socialFromRevenue = min(S, revenue)`, and only the rest (`S − revenue`) moves to scale income under art. 26 ust. 13a. The 50% health deduction (art. 11 ust. 1a) is then added on top, and whatever part of it exceeds revenue is lost.
- **Why that is not optimal:**
  - The health deduction cannot move to scale income; social contributions can.
  - So the taxpayer should first deduct the health half from revenue and deduct only `revenue − healthDeduction` of social contributions there, sending the rest to scale income.
  - Art. 11 ust. 1/1a sets no order between the two deductions.
  - What goes to scale is still exactly the "overflow" the A5 exception allows.
- **Example:** revenue 15 000, costs 0, other income 100 000, default ZUS (full, with sickness: S = 21 459,48), ryczałt 17% or 15%.
  - **Shown:** 28 326,18 zł (method "od przychodu", ryczałt 0, PIT on other income 7 624,86).
  - **Correct:** social from revenue 12 009,90 + health 2 990,10 = 15 000, so ryczałt is still 0. Social from scale is then 9 449,58, which gives PIT 7 266,05 and **27 967,37 zł**.
  - The result is overstated by **358,81 zł**.
  - Reproduce with `node scenA.mjs`.
- **How often:** the reference sweep found 48 affected (variant, input) pairs. All had revenue ≤ 15 000 with other income > 0, and the largest gap was 358,81 zł, about 12% × 2 990,10.
  - With a 32% marginal scale rate, the "scale" method already wins, so the gap is capped at the first-bracket value.
  - The health tier is unaffected, because this regime always has threshold revenue ≤ 60 000.
- **Fix:** when `otherIncome > 0`, cap the revenue deduction at `max(revenueTotal − healthDeduction, 0)`:
  - Compute the health amount from the tier of `revenueTotal − socialNotFromScale` first.
  - Or add a third candidate method, e.g. `ryczaltHealthFirst`, to `SOCIAL_DEDUCTION_METHODS.ryczalt` so the optimiser picks it.
  - Also apply this to multi-rate mode, which uses the same function.

### 2. LOW: a decimal point is misread in the new "Inne dochody" field; revenue and costs have the same older inconsistency
- **Where:** `script.js:161-163` (`parsePLN` strips "."), `script.js:1016-1018` (`parseAmount` keeps "."), `script.js:1049` (other income uses `parsePLN`).
- **Other income:** typing `50000.50` computes with, and after blur displays, **5 000 050,00 zł**. That is 100× the intended amount.
- **Revenue:** typing `1234.56` computes with 1 234,56 while typing (`parseAmount`), but blur or "Oblicz" turns it into **123 456,00 zł** (`parsePLN`). This is older behaviour; the new field repeats it.
- **Fix:** use one parser that removes spaces and NBSP and treats a single "." or "," followed by 1–2 digits as the decimal separator. Use it everywhere: validation, `gatherInputs`, blur.

### 3. LOW: invalid inputs are still used in calculation when another control changes
- **Background:** many new controls call `calculate()` directly: ZUS toggles, dates, path and sex radios, other income. `calculate()` does not check the validity of the other fields.
- **Invalid IP BOX coefficient `150`:**
  - An error is shown, but toggling "chorobowa" recalculates with the coefficient clamped to 100% (`getIpBoxIncomeSplit`, `script.js:381`).
  - "Podatek liniowy + IP BOX 30 576,99 zł" wins the best card.
  - The export prints "Współczynnik IP BOX: 150%".
- **Invalid coefficient `abc`:** it is silently treated as 0% (`script.js:1044,1052`).
- **Negative revenue (`-50000`, rejected by the button):** it is still computed and ranked after any toggle.
- **Negative spouse income:** it is never validated in `handleCalculate`. The engine clamps it, but the export prints "Dochód małżonka: -10 000,00 zł". This is older behaviour.
- **Fix:** have `calculate()` (or `gatherInputs`) validate all fields and leave affected outputs empty, or show a "popraw dane" state, while any field is invalid.

### 4. LOW/NIT: half-grosz float rounding in `taxMath.round2`
- **Why this matters:** this is the only non-loss difference against 04de063 with ZUS off, and it explains the implementer's report that "IP BOX results changed slightly with ZUS off".
- **Where:** `taxConstants.js:142`. `Math.round(n*100)/100` has no epsilon handling.
- **Example:** revenue 1 177 622,32, costs 713 137,82, ZUS off.
  - Income in floating point is 464 484,5000000001. 04de063 multiplied that unrounded value: 9% gave 41 803,605000…01 and rounded to **41 803,61**.
  - New code rounds income first (`buildCalculationContext`: `round2(income − fpfs − social)`): 9% × 464 484,50 is stored as 41 803,6049999… and rounds to **41 803,60**.
  - So `taxScale` and `taxScaleIpBox` move by −0,01 zł. It happened in 1 of 1200 fuzz cases.
- **Assessment:**
  - Neither version is right on principle. Half-up gives ,61, and new code gets ,60.
  - It is not a logic regression. IP BOX is not special here; `taxScale` moves too.
- **Fix:** make rounding tie-safe, e.g. `Math.round(Number((n * 100).toPrecision(15))) / 100`, or compute in integer grosze.

### 5. NIT: the ZUS section of the export shows ulga and mały ZUS dates when "umowa o pracę" is ticked
- **Where:** `taxConstants.js:451-456` computes `ulgaEnd` and `prefEnd` even when `employment` is true. `script.js:2224-2237` then prints them.
- **Example:** start 2026-03-01, path ulga, employment ticked.
  - The export says "Ulga na start … do 08.2026 / Mały ZUS … do 08.2028".
  - The monthly table says "etat" for every month.
  - The amounts are correct (0).
- **Fix:** skip those lines, or null the dates, when `schedule.employment` is true.

### 6. NIT: the monthly ZUS table's Σ row does not equal its column sums in a holiday month
- **Where:** `script.js:2168-2195`.
- **What happens:** in the holiday month the component columns show the waived amounts (`entry.waived`), while Σ uses totals in which that month is zero.
- **Example:** full ZUS with holiday in January.
  - The Emer. column shows 12 × 1 103,27 = 13 239,24.
  - Σ shows 12 135,97.
- **Current explanation:** only the legend's "kwoty zwolnione pokazane, w Razem 0" covers it.
- **Fix:** print zeros in the component columns and put the waived amount in a note, or label the Σ row "po zwolnieniu".

### 7. PROCESS (known): snapshots not regenerated
- `2026/tests/__snapshots__/*.snap` is unchanged by the diff. It was already stale after 04de063 (F3).
- Every snapshot changes because ZUS is ON by default.
- The user must review the diff and run `npm run test:update`. The README says so.

### 8. INFORMATIONAL (by design: A5, "no splitting")
- **Linear:** splitting S between linear and scale income would be cheaper in some cases. The reference sweep found gaps up to 1 126,62 zł (revenue 25 000, other income 125 000).
- **Ryczałt:** near the 60k/300k tier, a partial split could also help.
- This follows the binding A5 decision.
- [research_zus.md](../prawo/research-zus-2026.md) §5.2 says splitting per payment is "probably permissible". If that is ever confirmed, this is where the optimiser would gain.

## Confirmed correct

### Schedule (`sched.mjs`, `taxConstants.test.js`)
- **Ulga na start:**
  - A start on the 1st uses 6 months including the start month.
  - A mid-month start gives a free partial month plus 6 full months.
  - The preferential period is the next 24 full months.
  - Worked cases:

    | Start | Ulga until | Preferential until | 2026 result |
    |---|---|---|---|
    | 2024-03-10 | 09.2024 | 09.2026 | 2026 = pref I–IX, full X–XII |
    | 2024-03-01 | 08.2024 | 08.2026 | |
    | 2025-09-15 | 03.2026 | 03.2028 | |
    | 2023-01-01 | | | all 2026 on full ZUS |
    | 2026-12-31 | covers XII | | health months = 1 |
- **Pref path (art. 18a):**
  - A start on the 1st gives 24 months including the start month (2024-01-01 → 12.2025).
  - A mid-month start gives a partial month plus 24 full months (2024-01-02 → 01.2026; ZUS example 20.10.2022 → 31.10.2024).
- **Proportional first month:**
  - The base is `round2(base × days / actual days)`, and each contribution is rounded separately.
  - Pref, 16.03: 744,15 → 235,45.
  - Full, 20.05: 2 187,87 → 692,24 including FP 53,60.
  - Full, 31.12: 182,32 → FP 4,47, following A7.
  - Pref, 31.12: 14,72.
- **Leap years and day counts:** no `Date` is used anywhere (`grep`), so there is no UTC/timezone off-by-one. Dates are parsed by regex and checked against `daysInMonth`.
- **FP exemption:**
  - It starts the month after the birthday month; with a birthday on the 1st it starts that month.
  - I verified this against the ZUS guide text (`fp.txt` 317–343).
  - K 1971-02-28 → from 03.2026 (FP 2 × 138,47). K 1971-03-01 → from 03.2026.
  - M 1966-06-15 → from 07. M 1966-06-01 → from 06.
  - Born 29 February: exemption from March either way.
  - A missing sex or birth date means FP is due.
- **Employment ≥ minimum wage:** social contributions are 0 all year, health is still due, and holidays are refused.
- **Holidays:**
  - Rule: E ≥ F + 2, where a partial month F counts, the relief is never taken during ulga, and it is refused with employment.
  - Examples: ulga from 1.01 gives IX–XII; ulga from 2.01 gives X–XII; ulga from 1.05 is too late (earliest 01.2027); full ZUS from 15.10 gives XII only; from 1.11 is too late.
  - The month is chosen per variant, including "no holiday"; on a tie the earliest month wins.
- **A3:** with ZUS off, the start date still sets the number of health months. The date field sits outside the ZUS reveal block.

### Health contribution
- n = number of months from the start month.
- Minimum = n × 432,54.
- Base = D − FP − S, whatever the deduction method.
- Linear: 4,9%, with an annual 14 100 zł deduction limit and no proration.
- Ryczałt: the tier comes from revenue minus the social contributions not deducted from scale income (A6); the thresholds are not prorated; the health amount is monthly × n.
- The 50% deduction is split by largest remainder (F7).
- IP BOX: 9% on scale, 4,9% on linear, charged on the whole business income.

### Levy
- Art. 30h ust. 2 in the current text (Dz.U. 2026 poz. 592, `pit592.txt:8166-8170`) deducts art. 26 contributions and the art. 30c ust. 2 pkt 2 health contribution.
- So `levyBase = linearBase + scaleBase` is right.
- IP BOX and ryczałt income are correctly left out of the levy base.

### Optimiser (`ref.mjs`)
- My independent model covered scale (income/costs), linear (linear/costs/scale) and ryczałt (ryczałt/scale), each with every holiday candidate.
- It matched `data-total` for every case: 250 scenarios × 11 variants, 0 mismatches.
- I hand-checked IP BOX 25% at revenue 100 000 with ZUS on: 33 944,76, with the "income" method correctly beating "costs" (3 904,54 vs 4 280,09 in PIT + IP tax).
- The coefficient is applied after FP/FS, as A9 requires.

### Old vs new with ZUS off (`grid.mjs`, `fuzzip.mjs`, `multi.mjs`)
- **Single-rate grid:** 1568 cases; I filtered out harness artifacts from stale hidden joint and IP BOX fields in 04de063.
- **Profitable cases (costs ≤ 90% of revenue):** every output is identical.
- **Loss cases:** every difference is an intended fix:
  - **F1:** IP BOX loss no longer produces a negative tax. Revenue 1 000 / costs 1 200 / 100%: 5 180,48 → 5 190,48. Old negative "best" results such as −54 809,52 are gone.
  - **F2:** a joint-filing loss is clamped at 0. Revenue 1 000 / costs 1 200 / spouse 300 000: −22 473,52 → −22 409,52.
- **Multi-rate:** with incomplete allocations the results differ by design (F6; those totals are excluded from the ranking). With complete allocations they differ by at most ±0,01 zł (F7 rounding, 3 of about 230 cases).
- **IP BOX fuzz** with grosze and fractional coefficients: 1 difference in 1200, which is finding 4.

### Test assertions recomputed by hand
- 35 665,69 (scale), 41 932,40 (linear at the minimum health contribution 5 190,48), 41 914,92 (ryczałt 12%).
- 35 167,37 (75 000 at 12%, low tier 5 980,20).
- 4 341,07 (pref from 16.03) and 13 210,27 (full from 20.05 without sickness).
- Baseline 36 400 (PIT on 200 000).
- All correct.

### Review fixes from 04de063
- **F1, F2, F6, F7:** behave as intended (see above).
- **F4:** the negative-amount note is present, and only joint variants can be negative.
- **F8:** `LEGAL_STATUS_DATE` is the single source.
- **F9:** `validateRateInput` now marks the rate field itself.
- **Also present:** `calculateRyczaltRateTax` rounds to the grosz, and the best card has the tie text.
