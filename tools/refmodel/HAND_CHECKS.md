# Hand checks: reference model for 2026 and 2027

Six 2026 examples and four 2027 examples (Y1–Y4, current law and the draft reform), worked through by hand. `node tools/refmodel/checkHand.mjs` (or `npm run verify:hand`) compares every number below with `refModel.mjs`. All 148 checks match (58 for 2026, 90 for 2027 incl. two reform-scale spot checks).

Conventions:
- Every social contribution is rounded to the grosz, separately for each component and each month.
- Health, PIT and danina are rounded to the grosz once for the whole year.
- r(x) means rounding to 0.01 zł, half-up.

Constants:
- Full ZUS month: base 5 652,00. Emerytalna 1 103,27, rentowe 452,16, chorobowa 138,47, wypadkowa 94,39 (social 1 788,29 with chorobowa). FP+FS 138,47.
- Preferential month: base 1 441,80. Social 456,18 with chorobowa, 420,86 without. No FP.
- Health: minimum 432,54 per month. Ryczałt amounts 498,35 / 830,58 / 1 495,04 per month.

---

## HC1: partial first month, FP age exemption and wakacje (skala / liniowy / ryczałt 12%)
Input: revenue 150 000, costs 10 000, start **2026-03-15**, path **full**, chorobowa on, woman born **1971-05-02**, wakacje on (case `N-394`).

**Schedule**
1. January and February: the business is not running yet, so nothing is due.
2. March is the first month and only partly covered: days 15–31 are 17 of 31 days (art. 18 ust. 9 uSUS).
   - Base = r(5 652 × 17/31) = r(3 099,4839) = **3 099,48**.
   - Emerytalna r(3 099,48×19,52%) = 605,02. Rentowe r(×8%) = 247,96. Chorobowa r(×2,45%) = 75,94. Wypadkowa r(×1,67%) = 51,76. Social total = **980,68**.
   - FP+FS r(3 099,48×2,45%) = **75,94**. It is due because the full-month minimum base, 5 652, is at least the minimum wage, and FP is owed "for every month with at least 1 day of insurance" (ZUS-FP p. 27). She turns 55 only on 2 May.
3. April is a full month: 1 788,29 social + 138,47 FP.
4. Age exemption: she turns 55 on 2026-05-02. The birthday is not on the 1st, so FP stops from the month after, June (art. 261 uRP; ZUS-FP p. 12). FP is still due in May.
5. Wakacje: the first month of insurance is F = March. The application must be filed in E−1, and she must have been insured in E−2 (art. 17a ust. 1 pkt 4, art. 36d). So E ≥ May. The allowed months are May–December. May has the highest amount due (1 788,29 + 138,47 = 1 926,76), so **May is exempt** and pays 0.
6. June to December: 7 × 1 788,29 social, FP 0.
- **S** = 980,68 + 1 788,29 (Apr) + 7 × 1 788,29 = 980,68 + 14 306,32 = **15 287,00**
- **FP** = 75,94 + 138,47 = **214,41**. Social + FP = 15 501,41.
- Health months n = 10 (March to December; the partial March counts in full, art. 79 ust. 2 uŚOZ).

**Skala** (the best social method is art. 26; KUP gives the same result here)
- Income D = 140 000. Income after FP (KUP) = 139 785,59. After deducting S under art. 26: **124 498,59**.
- PIT = 10 800 + 32% × (124 498,59 − 120 000) = 10 800 + 1 439,5488 = **12 239,55**
- Health = 9% × (140 000 − 214,41 − 15 287) = 9% × 124 498,59 = **11 204,87**. The minimum, 4 325,40, is lower.
- Total = 12 239,55 + 11 204,87 + 15 287,00 + 214,41 = **38 945,83**

**Liniowy** (the best method deducts S from linear income)
- Health = 4,9% × 124 498,59 = **6 100,43**. This is at most 14 100, so the whole amount is deductible.
- Tax base = 139 785,59 − 15 287 − 6 100,43 = 118 398,16. PIT = 19% × 118 398,16 = **22 495,65**
- Total = 22 495,65 + 6 100,43 + 15 501,41 = **44 097,49**

**Ryczałt 12%** (the best method deducts S from ryczałt revenue)
- Revenue used for the health tier (art. 81 ust. 2g) = 150 000 − 15 287 = 134 713. That falls between 60k and 300k, so health = 10 × 830,58 = **8 305,80**. 50% of it is 4 152,90.
- Tax base = 150 000 − 15 287 − 4 152,90 = 130 560,10. PIT = 12% of that = **15 667,21**
- Total = 15 667,21 + 8 305,80 + 15 501,41 = **39 474,42**

---

## HC2: ulga na start with a mid-month start and the 14 100 health-deduction limit
Input: revenue 400 000, costs 0, start **2026-03-15**, path **ulga**, chorobowa on.

1. Ulga: March is a partial month, so it is free, and the 6 full months April–September follow (ZUS: "w trakcie miesiąca → od kolejnego miesiąca"). No social contributions and no FP.
2. Preferential base for 24 months from 1 October 2026 (art. 18aa ust. 3). October–December 2026 = 3 × 456,18 = **S 1 368,54**, FP 0.
3. n = 10. Health is due from March, including the ulga months.

**Liniowy**
- Health base = 400 000 − 1 368,54 = 398 631,46. Health = 4,9% × that = 19 532,9415 → **19 532,94**. That is more than the minimum of 4 325,40.
- Deductible health = min(19 532,94; **14 100**) = 14 100. The limit is annual with no proration (art. 30c ust. 2 pkt 2).
- Tax base = 400 000 − 1 368,54 − 14 100 = 384 531,46. PIT = 19% × that = **73 060,98**
- Total = 73 060,98 + 19 532,94 + 1 368,54 = **93 962,46**

**Skala**
- Taxable income = 398 631,46. PIT = 10 800 + 32% × 278 631,46 = 10 800 + 89 162,0672 = **99 962,07**
- Health = 9% × 398 631,46 = **35 876,83**
- Total = 99 962,07 + 35 876,83 + 1 368,54 = **137 207,44**

---

## HC3: ryczałt 12% on both sides of the 60 000 tier after social contributions (art. 81 ust. 2g)
Full ZUS all year: S 21 459,48, FP 1 661,64 (social + FP = 23 121,12). There is no other income.

**a) Revenue 81 459,48** (option: social deducted from ryczałt revenue)
- Tier revenue = 81 459,48 − 21 459,48 = **60 000,00**. The statute says "nie przekroczyły 60 000", so this is tier 1: health = 12 × 498,35 = **5 980,20**, and 50% of it is 2 990,10.
- Base = 81 459,48 − 21 459,48 − 2 990,10 = 57 009,90. PIT = 12% of that = 6 841,188 → **6 841,19**
- Total = 6 841,19 + 5 980,20 + 23 121,12 = **35 942,51**
- Cross-check of the other option, deducting from the scale: there is no scale income, so S is not deducted anywhere. It therefore still lowers the tier revenue under 2g. PIT = 12% × (81 459,48 − 2 990,10) = 9 416,33, which is worse.

**b) Revenue 81 459,49**
- Tier revenue = 60 000,01, which is more than 60 000, so tier 2: health = 12 × 830,58 = **9 966,96**, and 50% of it is 4 983,48.
- Base = 81 459,49 − 21 459,48 − 4 983,48 = 55 016,53. PIT = **6 601,98**
- Total = 6 601,98 + 9 966,96 + 23 121,12 = **39 690,06**. Adding 1 grosz of revenue raises the total by 3 747,55.

---

## HC4: joint filing with other income and a spouse (decision B3 plus the baseline rule)
Input: revenue 500 000, costs 100 000, other scale income 50 000, spouse income 30 000, full ZUS.

- D = 400 000. Income after FP = 398 338,36. Adding other income gives 448 338,36. Minus S (art. 26, from the taxpayer's own income only) = **426 878,88**.
- Joint PIT (art. 6 ust. 2): half of (426 878,88 + 30 000) = 228 439,44. Tax on the half = 10 800 + 32% × 108 439,44 = 45 500,6208. Doubled = 91 001,2416 → **91 001,24**
- Danina: 426 878,88 is below 1 000 000, so 0.
- Health (JDG only) = 9% × (400 000 − 1 661,64 − 21 459,48) = 9% × 376 878,88 = **33 919,10**
- Baseline: PIT on other income alone = 12% × 50 000 − 3 600 = **2 400**. Spouse's own PIT = scale(30 000) = **0**.
- **taxScaleJoint** = 91 001,24 + 33 919,10 + 23 121,12 − 2 400 − 0 = **145 641,46**
- **taxScale** (individual): PIT = 10 800 + 32% × 306 878,88 = **109 001,24**. Total = 109 001,24 + 33 919,10 + 23 121,12 − 2 400 = **163 641,46**

---

## HC5: IP BOX 50% with other income 150 000 (social deducted from the scale)
Input: revenue 200 000, costs 0, other 150 000, IP BOX coefficient 50%, full ZUS.

- Income after FP (KUP) = 198 338,36. With FP allocated proportionally, the qualified income (5%) is 99 169,18 and the non-qualified income is 99 169,18.
- **Liniowy + IP BOX**
  - Health = 4,9% × (200 000 − 1 661,64 − 21 459,48) = 4,9% × 176 878,88 = 8 667,0651 → **8 667,07**. The whole amount is deductible from the linear part.
  - Option "scale", which is the best one:
    - Linear base = 99 169,18 − 8 667,07 = 90 502,11. PIT = 19% × that = 17 195,40.
    - IP BOX tax = 5% × 99 169,18 = 4 958,46.
    - Other income: 150 000 − 21 459,48 = 128 540,52. PIT = 10 800 + 32% × 8 540,52 = 13 532,97.
    - PIT total = **35 686,83**.
    - Baseline = scale(150 000) = 10 800 + 32% × 30 000 = 20 400.
    - Total = 35 686,83 + 8 667,07 + 23 121,12 − 20 400 = **47 075,02**
  - Option "lin": linear base = 99 169,18 − 21 459,48 − 8 667,07 = 69 042,63, PIT 13 118,10. The other-income PIT stays at 20 400. Total = 49 864,75. That is worse by 13% × 21 459,48 = 2 789,73.
- **Skala + IP BOX** (art. 26):
  - Scale income = 99 169,18 + 150 000 − 21 459,48 = 227 709,70. PIT = 10 800 + 32% × 107 709,70 = 45 267,10.
  - Adding the IP BOX tax of 4 958,46 gives PIT **50 225,56**.
  - Health = 9% × 176 878,88 = **15 919,10**
  - Total = 50 225,56 + 15 919,10 + 23 121,12 − 20 400 = **68 865,78**

---

## HC6: several ryczałt rates, 12% alongside 8,5%/12,5% (fixes B1 and B2, art. 11 ust. 3 uRycz)
Input: allocations 12%: 50 000 and 8,5/12,5%: 150 000, so revenue P = 200 000. Full ZUS.

- Tier revenue = 200 000 − 21 459,48 = 178 540,52, which is tier 2: health = **9 966,96**, and 50% of it is 4 983,48.
- Total deduction = S + 50% health = 21 459,48 + 4 983,48 = 26 442,96. It is split in proportion to revenue. The 8,5/12,5 bucket splits into two rates: 100 000 at 8,5% and 50 000 at 12,5%.
  - 12%: share 50 000/200 000, so deduction 6 610,74. Base 43 389,26. Tax = 5 206,7112 → **5 206,71**
  - 8,5%: share 100 000/200 000, so deduction 13 221,48. Base 86 778,52. Tax = 7 376,1742 → **7 376,17**
  - 12,5%: share 50 000/200 000, so deduction 6 610,74. Base 43 389,26. Tax = 5 423,6575 → **5 423,66**
- Ryczałt PIT = **18 006,54**
- Total = 18 006,54 + 9 966,96 + 23 121,12 = **51 094,62**

---

# Rok 2027

Status of the inputs (see `refModel.mjs`, `CONSTANTS_2027` / `REFORM_2027`): minimum wage 4 950 (final, Dz.U. 2026 poz. 1213), full base 6 019,80 = 60% × 10 033 (forecast: draft budget 2027 art. 24), preferential base 1 485,00 (final), FP 1% + FS 1,45% (forecast), wypadkowa 1,67% (all year), health minimum 445,50 per month for all 12 months (SPEC_MULTIYEAR), ryczałt health from the forecast Q4 2026 wage 9 720: 9% × 5 832,00 = **524,88**, 9% × 9 720,00 = **874,80**, 9% × 17 496,00 = **1 574,64**, linear health deduction limit **15 100** (forecast: 14 100 × 300 990 / 282 600 = 15 017,55, rounded up to 100 zł).
Reform (draft UD458 + UD116): scale T(B) = 12% × B − 3 600 up to 130 000; 12 000 + 24% × (B − 130 000) up to 150 000; 16 800 + 32% × (B − 150 000) above. Danina 5%, with qualified IP BOX income in the base. Ryczałt only if 2026 revenue ≤ 250 000 EUR × r; 17% on the revenue above 300 000 EUR × r. r = 4,3750 (forecast: NBP table 187/A/NBP/2026 of 25.09.2026; the statutory rate is the one of 1.10.2026), so the limits are **1 093 750,00** and **1 312 500,00** zł.

Constants:
- Full ZUS month: base 6 019,80. Emerytalna r(1 175,06496) = 1 175,06, rentowe r(481,584) = 481,58, chorobowa r(147,4851) = 147,49, wypadkowa r(100,53066) = 100,53: social **1 904,66**. FP+FS r(147,4851) = **147,49**. Month total **2 052,15**. Year: S = 12 × 1 904,66 = **22 855,92**, FP = **1 769,88**, together 24 625,80.
- Preferential month: base 1 485,00. Emerytalna r(289,872) = 289,87, rentowe 118,80, chorobowa r(36,3825) = 36,38, wypadkowa r(24,7995) = 24,80: **469,85** (no FP: 1 485 < 4 950).
- Health minimum: 12 × 445,50 = **5 346,00**.

---

## Y1: full ZUS all year, revenue 200 000 (current law and reform; case `27N-317` / `27N-318`)

- D = 200 000. Taxable scale base (art. 26 method) = 200 000 − 1 769,88 − 22 855,92 = **175 374,20**.
- **Skala, current law:** 10 800 + 32% × 55 374,20 = 10 800 + 17 719,744 = **28 519,74**. Health 9% × 175 374,20 = 15 783,678 → **15 783,68**. Total = 28 519,74 + 15 783,68 + 24 625,80 = **68 929,22**.
- **Skala, reform:** 16 800 + 32% × 25 374,20 = 16 800 + 8 119,744 = **24 919,74** (exactly 3 600 less: above 150 000 the reform saves 20 400 − 16 800). Total **65 329,22**.
- **Liniowy** (same in both scenarios, danina 0): health 4,9% × 175 374,20 = 8 593,3358 → **8 593,34** (< 15 100, fully deductible). Base = 175 374,20 − 8 593,34 = 166 780,86. PIT 19% = 31 688,3634 → **31 688,36**. Total = 31 688,36 + 8 593,34 + 24 625,80 = **64 907,50**.
- **Ryczałt 12%** (same in both scenarios; 200 000 ≤ 1 093 750 so eligible, and below 1 312 500 so no 17%): tier revenue (art. 81 ust. 2g) = 200 000 − 22 855,92 = 177 144,08, tier 2 → 12 × 874,80 = **10 497,60**, 50% = 5 248,80. Base = 200 000 − 22 855,92 − 5 248,80 = 171 895,28. PIT = 20 627,4336 → **20 627,43**. Total = 20 627,43 + 10 497,60 + 24 625,80 = **55 750,83**.

## Y2: ulga na start from 15.10.2026 carried into 2027 (current law; case `27N-319`)
Input: revenue 90 000, costs 10 000, start **2026-10-15**, path ulga, chorobowa on.

1. October 2026 is partial, so it is free; the 6 full months are November 2026 – April 2027. In 2027: January–April = ulga (no social, no FP).
2. Preferential base for 24 months from 1.05.2027 (art. 18aa ust. 3): May–December 2027 = 8 × 469,85 = **S 3 758,80**, FP 0.
3. The business started before 2027, so health months n = **12**.

- **Skala:** D = 80 000. Base = 80 000 − 3 758,80 = 76 241,20. PIT = 12% × 76 241,20 − 3 600 = 9 148,944 − 3 600 = **5 548,94**. Health = 9% × 76 241,20 = 6 861,708 → **6 861,71** (> 5 346). Total = 5 548,94 + 6 861,71 + 3 758,80 = **16 169,45**.
- **Liniowy:** 4,9% × 76 241,20 = 3 735,82 < 5 346, so health = **5 346,00** (minimum), fully deductible. Base = 80 000 − 3 758,80 − 5 346 = 70 895,20. PIT = 13 470,088 → **13 470,09**. Total = 13 470,09 + 5 346 + 3 758,80 = **22 574,89**.
- **Ryczałt 12%:** tier revenue = 90 000 − 3 758,80 = 86 241,20, tier 2 → **10 497,60**, 50% = 5 248,80. Base = 90 000 − 3 758,80 − 5 248,80 = 80 992,40. PIT = 9 719,088 → **9 719,09**. Total = 9 719,09 + 10 497,60 + 3 758,80 = **23 975,49**.

## Y3: joint filing under the reform scale (case `27N-320`)
Input: revenue 400 000, costs 50 000, spouse income 60 000, full ZUS, **reform on**.

- D = 350 000. Taxpayer's income after FP and S (art. 26) = 350 000 − 1 769,88 − 22 855,92 = **325 374,20**.
- Joint (art. 6 ust. 2, unchanged by UD458: 2 × T(½)): half = (325 374,20 + 60 000) / 2 = 192 687,10. T(half) = 16 800 + 32% × 42 687,10 = 16 800 + 13 659,872 = 30 459,872. Doubled = 60 919,744 → **60 919,74**. (Effective joint thresholds 260 000 / 300 000, kwota zmniejszająca 7 200.)
- Health = 9% × 325 374,20 = 29 283,678 → **29 283,68**.
- Baseline = spouse's own PIT: T(60 000) = 7 200 − 3 600 = **3 600**. Other income 0.
- **taxScaleJoint** = 60 919,74 + 29 283,68 + 24 625,80 − 3 600 = **111 229,22**.
- **taxScale** (individual): T(325 374,20) = 16 800 + 32% × 175 374,20 = 16 800 + 56 119,744 = **72 919,74**. Total = 72 919,74 + 29 283,68 + 24 625,80 = **126 829,22**.
- **Liniowy** (limit 15 100 binds): health = 4,9% × 325 374,20 = 15 943,3358 → **15 943,34**; deductible min(15 943,34; 15 100) = 15 100. Base = 325 374,20 − 15 100 = 310 274,20. PIT = 58 952,098 → **58 952,10**. Total = 58 952,10 + 15 943,34 + 24 625,80 = **99 521,24**.
- Cross-check, **current law** for the same input: joint 2 × (10 800 + 32% × 72 687,10) = 2 × 34 059,872 = **68 119,74**, total **118 429,22** (reform saves 7 200 = 2 × 3 600); individual 10 800 + 32% × 205 374,20 = **76 519,74**, total **130 429,22**.

## Y4: reform ryczałt with the 17% surcharge above 300 000 EUR (case `27N-321`)
Input: revenue 1 500 000, **2026 revenue 800 000**, start **2025-08-15**, path pref, chorobowa on, **reform on**.

1. Schedule: August 2025 is a partial preferential month, then 24 full preferential months September 2025 – August 2027 (art. 18a; decision D4); full ZUS from September 2027.
   S = 8 × 469,85 + 4 × 1 904,66 = 3 758,80 + 7 618,64 = **11 377,44**; FP = 4 × 147,49 = **589,96**. n = 12.
2. Eligibility: 800 000 ≤ 250 000 × 4,3750 = 1 093 750 → ryczałt available.
3. **Ryczałt 12%:** tier revenue = 1 500 000 − 11 377,44 > 300 000 → tier 3: 12 × 1 574,64 = **18 895,68**, 50% = 9 447,84.
   - Total deduction = 11 377,44 + 9 447,84 = 20 825,28.
   - Surcharge threshold 300 000 × 4,3750 = 1 312 500. Excess = 187 500.
   - Deduction split in proportion to revenue (assumption, bill text unknown): 20 825,28 × 1 312 500 / 1 500 000 = **18 222,12**; 20 825,28 × 187 500 / 1 500 000 = **2 603,16**.
   - 12% part: (1 312 500 − 18 222,12) × 12% = 1 294 277,88 × 12% = 155 313,3456 → **155 313,35**.
   - 17% part: (187 500 − 2 603,16) × 17% = 184 896,84 × 17% = 31 432,4628 → **31 432,46**.
   - PIT = **186 745,81**. Total = 186 745,81 + 18 895,68 + 11 377,44 + 589,96 = **217 608,89**.
4. **Liniowy (reform, danina 5%):** health = 4,9% × (1 500 000 − 589,96 − 11 377,44) = 4,9% × 1 488 032,60 = 72 913,5974 → **72 913,60**; deductible 15 100. Base = 1 488 032,60 − 15 100 = 1 472 932,60. PIT = 279 857,194 → **279 857,19**. Danina = 5% × 472 932,60 = 23 646,63 → **23 646,63**. Total = 279 857,19 + 23 646,63 + 72 913,60 + 11 377,44 + 589,96 = **388 384,82**.
5. Cross-check, **current law** (no 17%, danina 4%): ryczałt 12% = 12% × (1 500 000 − 20 825,28) = 12% × 1 479 174,72 = **177 500,97**, total **208 364,05** (the 17% surcharge costs 5% × 184 896,84 = 9 244,84); liniowy danina 4% × 472 932,60 = **18 917,30**, total **383 655,49**.
6. If the 2026 revenue were 1 100 000 (> 1 093 750), every ryczałt variant would be flagged `unavailable` and the best variant would be liniowy (388 384,82).
