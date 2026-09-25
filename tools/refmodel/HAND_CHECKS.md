# Hand checks: reference model for 2026

Six examples, worked through by hand. `node tools/refmodel/checkHand.mjs` (or `npm run verify:hand`) compares every number below with `refModel.mjs`. All 58 checks match.

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
