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

- The tests are written for the `2026` calculator only.
- They are regression tests, not legal validation by themselves.
- If a snapshot changes unexpectedly, always review the diff before updating it.
