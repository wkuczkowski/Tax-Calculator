import { describe, it, expect } from "vitest";
import { loadCalculator } from "./helpers/loadCalculator.js";

/**
 * The v2 front-end (/v2) must show exactly the same numbers as the 2026
 * calculator. Each scenario is run against both and the visible outputs
 * are compared field by field - no snapshots involved.
 */

const SCENARIOS = {
  "income below tax-free quota": (c) => {
    c.setRevenue(25000);
    c.setCosts(0);
  },
  "32% bracket with costs": (c) => {
    c.setRevenue(300000);
    c.setCosts(10000);
  },
  "negative income": (c) => {
    c.setRevenue(5000);
    c.setCosts(10000);
  },
  "solidarity levy with IP BOX 25%": (c) => {
    c.setRevenue(1500000);
    c.setCosts(0);
    c.setIpBox(25);
  },
  "joint taxation with IP BOX": (c) => {
    c.setRevenue(290000);
    c.setCosts(0);
    c.setIpBox(25);
    c.setJointTaxation(true, 80000);
  },
  "joint taxation, unequal high incomes": (c) => {
    c.setRevenue(1200000);
    c.setCosts(0);
    c.setJointTaxation(true, 900000);
  },
  "every ryczałt rate": (c) => {
    c.setRevenue(333333.33);
    c.setCosts(12345.67);
    [
      "ryczalt2",
      "ryczalt3",
      "ryczalt5_5",
      "ryczalt8_5",
      "ryczalt8_5_12_5",
      "ryczalt10",
      "ryczalt12",
      "ryczalt14",
      "ryczalt15",
      "ryczalt17",
    ].forEach((key) => c.toggleRyczaltRate(key));
  },
  "multiple ryczałt rates": (c) => {
    c.setRevenue(400000);
    c.setCosts(5000);
    c.enableMultipleRates();
    c.toggleRyczaltRate("ryczalt8_5_12_5");
    c.toggleRyczaltRate("ryczalt3");
    c.setRateRevenue("ryczalt8_5_12_5", 250000);
    c.setRateRevenue("ryczalt3", 100000);
  },
};

function run(app, scenario) {
  const calc = loadCalculator(app);
  scenario(calc);
  calc.calculate();
  const outputs = calc.readOutputs();
  const best = calc.document.getElementById("bestCardTitle").textContent;
  calc.close();
  return { outputs, best };
}

describe("v2 matches the 2026 calculator", () => {
  for (const [name, scenario] of Object.entries(SCENARIOS)) {
    it(name, () => {
      expect(run("v2", scenario)).toEqual(run("2026", scenario));
    });
  }
});
