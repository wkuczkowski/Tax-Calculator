# Test Suite (`app/`)

This folder contains regression tests for the tax calculator in `app/` (until September 2026 the directory was `2026/`).

The goal is simple: lock in today's calculator behavior so future refactors or legal-value updates can be compared against a known baseline.

## What Is Tested

There are two kinds of tests:

### 1. `taxConstants.test.js`

This test snapshots:

- the full `TAX_CONSTANTS` object
- derived constants like `TAX_BAND_12` and `PIT_RATE_SOLIDARITY`
- selected `taxMath` helper outputs

This is the first warning system when someone changes values in `taxConstants.js`.

If a constant changes, this test should fail first and show exactly which value moved.

### 2. `calculator.test.js`

These are DOM-based regression tests.

They load the real:

- `app/index.html`
- `app/taxConstants.js`
- `app/script.js`

Then they simulate user input and snapshot the final visible output fields.

Covered scenarios include:

- tax thresholds
- solidarity levy
- negative income
- linear health deduction limit
- IP BOX
- joint taxation with spouse
- single-rate ryczalt
- multi-rate ryczalt
- social ZUS contributions 2026 (paths: full / ulga na start / mały ZUS, start dates
  on the 1st, mid-month and before 2026, chorobowe on/off, FP/FS age exemption,
  employment contract, wakacje składkowe)
- other income taxed at the scale (0 / 80k / 200k), joint taxation, IP BOX
- ryczałt health tiers near 60k / 300k (art. 81 ust. 2g)
- explicit (non-snapshot) amounts for the audit cases B1–B3, loss cases and
  hand-computed ZUS scenarios (`toBe` on raw numbers from `data-*` attributes)

- explicit assertions for the fix round: ryczałt „50% zdrowotnej przed
  składkami” (15 000 / inne 100 000 → 27 967,37), tie-safe rounding
  (1 177 622,32 / 713 137,82 → zdrowotna 41 803,61), the shared amount parser
  (`taxMath.parseAmount`), blocking validation (invalid inputs → no results,
  best card „Popraw dane”), employment + ulga export text and the holiday
  month in the ZUS table

`taxConstants.test.js` also contains explicit unit assertions for
`taxMath.buildSocialSchedule()` (month-by-month social contributions).

### 3. `multiyear.test.js` (no snapshots)

Explicit, hand-computed assertions for the multi-year mode: 2027 constants
and statuses (full ZUS 2052,15 / month, small ZUS 469,85, minimum health
5346,00 / year, ryczałt health 524,88 / 874,80 / 1574,64, linear limit
15 100), ZUS starts carried over from 2025/2026, forecast badges and the
„Wartości prognozowane” export section, the scenario „Projekt zmian 2027
(UD458 + UD116)” (scale 12/24/32% for B = 140 000 and 200 000, joint
taxation, ryczałt 17% over 1 312 500 zł, ryczałt limit 1 093 750 zł and the
new-business exception, 5% levy including IP BOX), the year switch
(`?rok=`, `&projekt=1`) and the default-year rule; the review fixes
(forecast badges only for values that differ between variants, ZUS forecasts
once on the ZUS card, canonical `?rok=`/`&projekt=` address, unavailable
ryczałt without a draft delta, eligibility text only when relevant, the
year hint „Rozliczasz rok 2026? Przełącz na 2026.”).

### 4. `family.test.js` (no snapshots)

Explicit, hand-computed assertions for the „Rodzina” card: child relief
amounts month by month (1112,04 / 2224,08 / 4224,12 / 6924,12 / 9624,12;
a third child for 6 months → 3224,10), the contribution estimate for other
income, results without children identical to the page without the card,
the single parent example from the research (skala – samotny rodzic
22 112,04 vs liniowy 27 916,33), the cautious 56 000 zł limit for a single
parent on liniowy, the one-child limit edge 112 000,00 / 112 000,01, the
refund cap and the deduction-method optimizer that takes it into account,
joint taxation with children, the spouse on liniowy/ryczałt (joint variants
unavailable) and the 4+ exemption (85 528 zł, amount already used,
8,5% / 12,5%).
Helpers: `setFamilyStatus("married" | "single" | "other")`,
`addChild({ months, disabled, adult })`, `setFamilyShare(percent)`,
`setSpouseIncome(value)`, `setSpouseLinRycz(on)`, `setSpouseLinearIncome(value)`,
`setSpouseContrib(value)`, `setOtherContrib(value)`, `setFourPlus(on, used)`.

Snapshot note (family change): only `TAX_CONSTANTS > matches the recorded
baseline` changes (new „Ulgi rodzinne” constants). Review and run
`npm run test:update`.

### 5. `toggles.test.js` (no snapshots)

Every toggle switch flips its checkbox (and recalculates) when the switch
graphic (`.slider`) itself is clicked, not only its text label.

### Year of the tested page

`loadCalculator()` opens the page with `?rok=2026` by default, so the older
tests (and `tools/refmodel`) keep testing 2026 whatever today's date is.
Options: `loadCalculator({ year: 2027 })`, `{ year: 2027, reform: true }`,
`{ year: null, today: "2026-11-01" }` (no `?rok=`, fixed date → default-year
rule), `{ url: "http://localhost/?rok=…" }`. Helpers: `setYear(2027)`,
`setReform(true)`, `setPrevYearRevenue(value)`.

Snapshot note (multi-year change): `TAX_CONSTANTS > matches the recorded
baseline` changes (new keys such as `PIT_SCALE_BANDS`,
`SOLIDARITY_INCLUDES_IP_BOX`; removed `TAX_THRESHOLD_12`, `PIT_RATE_12`,
`PIT_RATE_32`) and `TAX_CONSTANTS > derived constants match the recorded
baseline` was replaced by explicit assertions (its snapshot is obsolete).
All calculator snapshots are unchanged. Review and run `npm run test:update`.

Note: social contributions are ON by default, so every older snapshot changed
when this feature landed. Review the diff and run `npm run test:update`.

## How It Works

The helper file `helpers/loadCalculator.js` creates a fresh JSDOM environment for each test.

It:

1. reads the real HTML and JS files
2. injects `taxConstants.js` and `script.js` into the test DOM
3. exposes helper methods like:
   - `setRevenue(...)`
   - `setCosts(...)`
   - `setIpBox(...)`
   - `setJointTaxation(...)`
   - `toggleRyczaltRate(...)`
   - `enableMultipleRates(...)`
   - `setRateRevenue(...)`
   - `setOtherIncome(...)`, `setZusEnabled(...)`, `setStartDate("RRRR-MM-DD")`,
     `setZusPath("full" | "ulga" | "pref")`, `setSickness(...)`,
     `setEmployment(...)`, `setHoliday(...)`, `setBirthDate(...)`,
     `setSex("K" | "M" | "")`
   - `calculate()`
   - `readOutputs()`
   - `readVariantData(id)` – raw numbers of a variant (`total`, `taxes`,
     `baseline`, `health`, `social`, `method`, `holidayMonth`)
   - `readBreakdown()` – the full export text

Important details:

- tests use the real calculator code, not a mocked calculation layer
- snapshots include only visible/populated outputs
- `scrollIntoView()` is stubbed because jsdom does not implement it and it is only used for UI behavior

## Snapshot Files

Vitest stores the baseline in:

- `__snapshots__/taxConstants.test.js.snap`
- `__snapshots__/calculator.test.js.snap`

These files are the expected output of the calculator today.

If a future code change modifies the results, the tests will fail and show a diff between:

- expected snapshot
- current result

That makes it easy to see whether a change was intentional or a regression.

## Commands

From the project root:

```bash
npm test
```

Runs the full suite once.

```bash
npm run test:watch
```

Runs tests in watch mode while you work.

```bash
npm run test:update
```

Updates snapshots.

Use this only when the new results are intentional and reviewed.

## Typical Workflow

### If you refactor code and expect no behavioral change

1. Run `npm test`
2. If snapshots fail, inspect the diff
3. If the result should not have changed, fix the code

### If you intentionally change tax rules or calculator behavior

1. Update `taxConstants.js` or calculator logic
2. Run `npm test`
3. Review all failing snapshot diffs carefully
4. If the new values are correct, run `npm run test:update`
5. Commit the updated snapshots together with the code change

## When Constants Change

If you change something like:

- `PIT_RATE_12`
- `MIN_WAGE`
- `LINEAR_HEALTH_DEDUCTION_LIMIT`
- ryczalt thresholds or rates

you should expect:

1. `taxConstants.test.js` to fail
2. one or more calculator scenario snapshots to fail

That is expected and desired. It tells you both:

- what input value changed
- what visible calculator results were affected

## Notes

- The snapshot tests cover the 2026 tax year; 2027 is covered by explicit assertions in `multiyear.test.js`.
- They are regression tests, not legal validation by themselves.
- If a snapshot changes unexpectedly, always review the diff before updating it.
