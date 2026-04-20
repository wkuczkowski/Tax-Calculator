import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loadCalculator } from "./helpers/loadCalculator.js";

/**
 * Snapshot the raw constants and derived values from taxConstants.js.
 *
 * If anyone edits TAX_CONSTANTS (e.g. updates MIN_WAGE for a new year),
 * this test fails first - the diff in __snapshots__ shows exactly which
 * constant changed. Then the calculator scenario snapshots fail and show
 * exactly which calculations were affected. Run `npm run test:update`
 * to accept intentional changes.
 */

let calc;

beforeAll(() => {
  calc = loadCalculator();
});

afterAll(() => {
  calc.close();
});

describe("TAX_CONSTANTS", () => {
  it("matches the recorded baseline", () => {
    expect(calc.window.TAX_CONSTANTS).toMatchSnapshot();
  });

  it("derived constants match the recorded baseline", () => {
    expect({
      TAX_BAND_12: calc.window.TAX_BAND_12,
      TAX_BAND_32: calc.window.TAX_BAND_32,
      PIT_RATE_SOLIDARITY: calc.window.PIT_RATE_SOLIDARITY,
      EFFECTIVE_LINEAR_RATE: calc.window.EFFECTIVE_LINEAR_RATE,
      EFFECTIVE_LINEAR_RATE_SOLIDARITY:
        calc.window.EFFECTIVE_LINEAR_RATE_SOLIDARITY,
      EFFECTIVE_IPBOX_PLUS_HEALTH: calc.window.EFFECTIVE_IPBOX_PLUS_HEALTH,
    }).toMatchSnapshot();
  });
});

describe("taxMath helpers", () => {
  it("min health contributions match the recorded baseline", () => {
    const { taxMath } = calc.window;
    expect({
      monthly: taxMath.getMinHealthMonthly(),
      annual: taxMath.getMinHealthAnnual(),
      linearMinThresholdMonthly: taxMath.getMinHealthThresholdLinearMonthly(),
      linearMinThresholdAnnual: taxMath.getMinHealthThresholdLinearAnnual(),
    }).toMatchSnapshot();
  });

  it("ryczałt health contributions across all 3 revenue bands match baseline", () => {
    const { taxMath } = calc.window;
    const samples = {};
    for (const revenue of [50_000, 100_000, 400_000]) {
      samples[`revenue_${revenue}`] = {
        multiplier: taxMath.getRyczaltHealthMultiplier(revenue),
        monthly: taxMath.getRyczaltHealthMonthlyForRevenue(revenue),
        annual: taxMath.getRyczaltHealthAnnualForRevenue(revenue),
      };
    }
    expect(samples).toMatchSnapshot();
  });
});
