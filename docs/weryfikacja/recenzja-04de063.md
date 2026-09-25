# Review of commit 04de063: ryczałt deduction split, joint-taxation comparability, legal-status label

> **Data:** 2026-09-24  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu.  
> **Zakres:** recenzja commita `04de063`: poprawki B1/B2/B3/B5 z audytu (podział odliczeń przy ryczałcie z wieloma stawkami, próg 8,5%/12,5%, porównywalność rozliczenia z małżonkiem, etykieta stanu prawnego). Sprawdzono też regresje. Wnioski F1–F7 wdrożono jako decyzje R* w [rejestrze decyzji](../decyzje/decyzje-implementacyjne.md).  
> **Pierwotna nazwa pliku:** `review_04de063.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

I reviewed the code in a detached worktree at 04de063 and compared it against 04de063^ (bfe7e43) in a second worktree. I did not run `npm test`, made no commits, and did not touch the main working tree.

## Verdict

- **The B1/B2/B3/B5 fixes are correct.**
  - The math matches art. 11 ust. 3 uRycz and art. 6 ust. 2 uPIT. I checked both against the current consolidated texts (Dz.U. 2025 poz. 843 and Dz.U. 2026 poz. 592), fetched through the Sejm ELI API.
  - All 5 audit examples and 12 of my own cases match my hand calculations to the grosz. The exception is F2 below, which is an older bug.
- **No regressions in single-rate ryczałt.**
  - I ran 336 grid combinations (21 revenues × 4 cost ratios × 4 IP BOX settings, all 10 ryczałt rates) through old and new code.
  - Only `ryczalt8_5_12_5` changed, and only for revenue above 100 000 zł. That change is the intended B2 fix.
  - Joint taxation with spouse income 0 is identical in old and new code.
- **I found 2 real problems, both in the loss (negative income) path:**
  - F1 is a new regression in the ranking.
  - F2 is an older bug that the commit now makes visible and lets win the ranking.
- **One process item:** the commit did not update the test snapshots, so 6 snapshot tests will fail (F3).

## Findings, ranked

### F1 — MEDIUM (regression): a negative IP BOX total can now become "Najniższe obciążenie"
- **Where:** `2026/script.js:787`, `if (value === 0) return;`. It was `value <= 0`.
- **What changed:** the filter was relaxed for every variant, not only the joint ones.
- **Why totals go negative:** `getIpBoxIncomeSplit` (`script.js:343-347`) does not clamp income. With a loss, the IP BOX "tax" becomes negative (5% × a negative amount).
- **Before:** the negative total was shown in its row but never ranked.
- **Now:** it wins the best card.
- **Scenario:** revenue 1 000 000, costs 1 200 000, IP BOX 100%.
  - Old best card: "Skala podatkowa 5190,48 zł".
  - New best card: "Skala podatkowa + IP BOX **−4809,52 zł**", i.e. −200 000 × 5% + 5190,48.
  - It also happens with 3 000 000 / 3 600 000 at IP BOX 25% (−2309,52 zł) and 100% (−24 809,52 zł).
  - These are 4 of the 336 grid cases, and they are the only ranking differences in the grid.
- **When it triggers:** loss × IP BOX share × 5% is greater than 5190,48, i.e. loss × share is above about 103 810 zł.
- **Fix:**
  - (a) In `getIpBoxIncomeSplit`, use `const base = Math.max(income, 0)`. This also fixes the wrong row values, e.g. revenue 30 000, costs 100 000, IP BOX 50% shows 3440,48 instead of 5190,48.
  - (b) Additionally, or at minimum, allow negative values in `collectVariant` only for `taxScaleJoint` and `taxScaleIpBoxJoint`.

### F2 — MEDIUM (older bug, now surfaced by B3 and able to win): a JDG loss reduces the spouse's income in joint taxation
- **Where:**
  - `calculateJointScalePitOnly` (`script.js:263-267`) adds `income + spouseIncome` without clamping, where `income = revenue − costs` can be negative.
  - It is used by `calculateJointScalePitAttributed`, by the IP BOX joint path (`regularIncome`), and by the breakdown (`getJointPitAttributionBreakdown`, `script.js:1400+`).
- **Law:**
  - Art. 6 ust. 2 uPIT taxes "od sumy swoich dochodów określonych zgodnie z art. 9 ust. 1 i 1a".
  - Art. 9 ust. 2: when costs exceed revenue, the result is a loss (strata), not income (dochód).
  - Art. 9 ust. 3: a loss can only reduce income from the same source in the following 5 years.
  - So one spouse's JDG loss cannot reduce the other spouse's income in the joint sum.
- **Scenario:** revenue 50 000, costs 100 000 (income −50 000), spouse 100 000.
  - The app sums 50 000, so 2 × PIT(25 000) = 0. Then 0 − 8400 = −8400, plus 5190,48 health gives **−3209,52 zł**. It is ranked best: "−8400 vs Skala podatkowa".
  - Correct: 2 × PIT(50 000) = 4800. Then 4800 − 8400 = −3600, plus 5190,48 gives **1590,48 zł**. It is still the best option, but it is overstated by 4800 zł.
  - Before this commit the error was the same size (it showed 5190,48 instead of 9990,48 household-equivalent). It was hidden because the value stayed positive.
- **Fix:** use `Math.max(income, 0)` for the taxpayer's part of the joint sum. Do this in `calculateJointScalePitOnly`, in the IP BOX joint path (`regularIncome`) and in `getJointPitAttributionBreakdown`. `spouseIncome` is already validated as ≥ 0.

### F3 — MEDIUM (process): snapshots not updated; no targeted tests for the new behaviour
- **Where:** `2026/tests/__snapshots__/calculator.test.js.snap` was not changed by the commit.
- **Expected failures (6 snapshots):**
  - joint 200 000 / spouse 50 000: 42 800 → 40 400
  - joint 500 000 / spouse 200 000: 213 800 → 177 400
  - joint 290 000 / 80 000 with IP BOX: 89 300 / 69 725 → 83 300 / 63 725
  - joint 1 200 000 / 900 000: 732 800 → 472 400 (now equal to individual scale)
  - 8,5%/12,5% at 250 000: 36 594,03 → 36 673,76
  - multi-rate 200 000 (8,5 / 12 / 15%)
- **Fix:**
  - The user runs `npm run test:update` and reviews the diff; an agent may not run it.
  - Add explicit `toBe` assertions for the audit numbers: 29 956,15; 30 443,69; 18 289,46; 50 400; 57 300 with joint winning by 122,50.
  - Add explicit assertions for the edge cases: 8,5%/12,5% at exactly 100 000; a negative joint result; and the IP BOX-with-loss and joint-with-loss cases after F1/F2 are fixed.

### F4 — LOW (UX): negative joint amount in the best card has no explanation there
- **Scenario:** income 20 000, spouse 300 000.
  - The best card reads "NAJNIŻSZE OBCIĄŻENIE — Skala podatkowa wspólnie z małżonkiem **-16 009,52 zł**".
  - The number is correct: 47 200 − 68 400 + 5190,48.
- **Where it is explained:** only in the tooltip, the footnote and the Założenia modal. A negative "obciążenie" in the headline will confuse users.
- **Fix:** add a short subtitle in the best card or joint row when the value is < 0, for example "oszczędność PIT małżonka większa niż Twój podatek". Optionally also show the household total.

### F5 — LOW (older issue, worse now): spouse tooltip overflows the viewport on mobile
- **Where:** `style.css:488-510` sets `.field-tooltip-bubble` to `left: 0; width: 260px`.
- **Scenario:** at 390 px viewport width the bubble spans x = 152…412 px, so about 22 px is cut off on the right.
- **What the commit changed:** the text is longer, so the bubble grew to 8 lines, about 184 px tall. See `review-04de063/05-mobile-tooltip.png`.
- **Fix:** `right: 0; left: auto` for this tooltip, or `max-width: min(260px, calc(100vw - 32px))` plus a clamp.

### F6 — LOW (B10 only partly fixed): allocations that do not add up to revenue
- **What is now consistent:** the result, the "Łącznie" total and the breakdown all use the allocated total. I confirmed this over 544 comparisons with 0 mismatches.
- **What is still open:**
  - The health tier and the art. 11 ust. 3 ratio are based on the allocated sum, not on total business revenue.
  - Example: revenue 200 000 with only 12%: 50 000 allocated gives health 5980,20 instead of 9966,96.
  - The UI only shows "Przychód do rozdysponowania".
- **Fix:** either block the ryczałt total and ranking when allocations ≠ revenue, or compute the health tier from `revenue`.

### F7 — NIT: rounded deduction shares may not sum exactly to the deduction
- **Where:** `getRyczaltDeductionShare` (`script.js:404-407`) rounds each share separately.
- **Example:** 7 equal allocations above 300 000 give 7 × 1281,46 = 8970,22 against a deduction of 8970,24. The tax effect is under 0,01 zł.
- **Fix, optional:** give the rounding remainder to the last or largest share.

### F8 — NIT: the legal-status date is hard-coded in 3 places
- **Where:** `LEGAL_STATUS_DATE` in `script.js:46`, "Stan prawny na 24.09.2026" in `index.html:62`, and the header comment in `taxConstants.js:3`.
- **Fix:** keep it once in `TAX_CONSTANTS`, set `.brand-sub` from JS and leave a static fallback in the HTML.

### F9 — NIT (older, cosmetic; not introduced by this commit)
- The joint breakdown prints "Dochód małżonka" twice: in the section header and inside `getJointPitAttributionBreakdown`.
- The export has the typo "SUMA (PIT + składka zdrowotna zdrowotna)" (`script.js` in `getFormattedValues`).
- `validateInput(e.target.value, e.target.dataset.for)` on rate inputs puts the error class on the result field (the id is the rate id).

## Confirmed correct

- **B1 (art. 11 ust. 3 uRycz):**
  - Verified text, in force since 30.10.2024: "…odliczeń tych dokonuje w takim stosunku, w jakim w roku podatkowym pozostają poszczególne przychody … w tym opodatkowane różnymi stawkami, w ogólnej kwocie przychodów".
  - The code deducts D = 50% × health(allocated total) once and gives each rate D × P_i / ΣP.
  - Revenue 0 or an empty rate gives share 0 and no division by zero.
  - A single allocation equal to revenue gives the same result as before for all rates except 8,5%/12,5%.
- **B2 (art. 12 ust. 1 pkt 4: "8,5% przychodów do kwoty 100 000 zł oraz 12,5% przychodów od nadwyżki"):**
  - The deduction is split 100 000/P and (P − 100 000)/P.
  - At P = 100 000 exactly, the whole deduction goes to the 8,5% part: 18 043,36, same as plain 8,5%.
  - At P = 100 000,01 the result is 18 043,36, so there is no jump.
  - At P = 102 000 no deduction is lost: 18 289,46.
  - In multi-rate mode the rate's share is split again by the threshold. This equals splitting by D × 100 000 / ΣP, which is correct.
- **B3 (art. 6 ust. 2 uPIT, art. 30h):**
  - Displayed value = 2·PIT(½Σ) − PIT(spouse alone) + own levy + own health.
  - The spouse's levy is correctly left out: the levy is per person and does not depend on the filing form.
  - Hand checks:
    - 200 000 / 100 000 → 50 400
    - 250 000 / 32 000 → 57 300, joint beats linear 57 422,50 by 122,50
    - 40 000 / 150 000 → 390,48
    - 20 000 / 300 000 → −16 009,52
    - 1 500 000 / 1 200 000 → 607 400, the same as individual, which is right because both spouses are in the 32% band
    - IP BOX 290 000 at 25% / 80 000 → 63 725
- **Consistency:** the displayed value, the breakdown "RAZEM", the export summary line, and multi-rate "Łącznie" vs the breakdown "SUMA" all match (544 checks, 0 mismatches). Breakdown and export use the same `getFormattedValues()`.
- **Negative number handling:** `formatPLN`/`parsePLN` round-trip negative numbers correctly, since pl-PL uses the ASCII hyphen. The ranking sorts negatives, and the bars clamp to 0%.
- **B5:** header "Stan prawny na 24.09.2026", modal "Stan prawny na dzień" plus the contribution-year label, export footer and footnote are all present.
  - The new source URLs resolve: MP 2026/117 → 200, ZUS → 200, MP 2025/1274 → 200.
  - ISAP returned 403 to curl (bot-blocking). I confirmed through the ELI API that Dz.U. 2025 poz. 1242 is the 2026 minimum-wage regulation.
- **Lint:** eslint on `2026/` is clean.
- **Browser (Chromium headless at /opt/pw-browsers, http://localhost:5501/2026/):**
  - No JS errors. The only console error is the Google Fonts request failing TLS through the sandbox proxy, which is environmental.
  - The joint tooltip renders correctly on desktop.
  - The Założenia modal shows the new "Rozliczenie wspólne z małżonkiem" section.
  - Multi-rate UI with 100k @ 12%, 50k @ 8,5%, 50k @ 8,5/12,5 gives 11 700,99 / 4144,10 / 4144,10, health 9966,96, total 29 956,15. This matches my hand calculation.
  - The breakdown shows a "Część odliczenia przypadająca na tę stawkę" line for each rate.
  - Screenshots were saved in the session working directory (`review-04de063/`, not kept in the repo): 01-joint-tooltip, 01b-joint-full, 02-joint-negative, 03-info-modal-joint, 03b-info-okres, 04-multi-rate, 05-mobile-tooltip.
