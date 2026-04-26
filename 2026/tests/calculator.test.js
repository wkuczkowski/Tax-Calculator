import { describe, it, expect } from "vitest";
import { loadCalculator } from "./helpers/loadCalculator.js";

/**
 * End-to-end regression scenarios for the 2026 tax calculator.
 *
 * Each scenario boots a fresh JSDOM instance, runs the real script.js IIFE
 * against the real index.html DOM, drives inputs the same way a user would,
 * clicks the calculate button, and snapshots all populated output fields.
 *
 * The snapshot serves as the regression baseline. After an intentional
 * change to script.js, taxConstants.js, or index.html, run
 * `npm run test:update` and review the snapshot diff.
 */

describe("Tax brackets", () => {
  it("income below tax-free quota uses min health for both scale and linear", () => {
    const calc = loadCalculator();
    calc.setRevenue(25000);
    calc.setCosts(0);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("income exactly at tax-free amount (30 000) - boundary", () => {
    const calc = loadCalculator();
    calc.setRevenue(30000);
    calc.setCosts(0);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("income exactly at the 12% threshold (120 000) - boundary", () => {
    const calc = loadCalculator();
    calc.setRevenue(120000);
    calc.setCosts(0);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("income deep in the 32% bracket (revenue 300 000, costs 10 000)", () => {
    const calc = loadCalculator();
    calc.setRevenue(300000);
    calc.setCosts(10000);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("income above solidarity threshold (revenue 1 500 000) exercises 4% solidarity in scale, linear, and IP BOX paths", () => {
    const calc = loadCalculator();
    calc.setRevenue(1500000);
    calc.setCosts(0);
    calc.setIpBox(25);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });
});

describe("Edge cases", () => {
  it("negative income (revenue < costs) still applies min health", () => {
    const calc = loadCalculator();
    calc.setRevenue(5000);
    calc.setCosts(10000);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("linear health deduction limit (14 100) is hit at high income (revenue 600 000)", () => {
    const calc = loadCalculator();
    calc.setRevenue(600000);
    calc.setCosts(0);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });
});

describe("IP BOX", () => {
  it("IP BOX 100% - all income taxed at 5%", () => {
    const calc = loadCalculator();
    calc.setRevenue(200000);
    calc.setCosts(0);
    calc.setIpBox(100);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("IP BOX 50% with high income - mixed standard + IP BOX, both above solidarity threshold", () => {
    const calc = loadCalculator();
    calc.setRevenue(2500000);
    calc.setCosts(0);
    calc.setIpBox(50);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("IP BOX 50% at 1 500 000 keeps the levy separate from linear PIT", () => {
    const calc = loadCalculator();
    calc.setRevenue(1500000);
    calc.setCosts(0);
    calc.setIpBox(50);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });
});

describe("Linear tax high income", () => {
  it("income 1 200 000 keeps the linear levy outside the 19% PIT line", () => {
    const calc = loadCalculator();
    calc.setRevenue(1200000);
    calc.setCosts(0);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });
});

describe("Joint taxation with spouse", () => {
  it("spouse income 0 - full quota transfer (kwota wolna + bands)", () => {
    const calc = loadCalculator();
    calc.setRevenue(200000);
    calc.setCosts(0);
    calc.setJointTaxation(true, 0);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("spouse income 50 000 - partial 12% bracket transfer", () => {
    const calc = loadCalculator();
    calc.setRevenue(200000);
    calc.setCosts(0);
    calc.setJointTaxation(true, 50000);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("spouse income 200 000 - partial 32% bracket transfer", () => {
    const calc = loadCalculator();
    calc.setRevenue(500000);
    calc.setCosts(0);
    calc.setJointTaxation(true, 200000);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("joint taxation uses MF formula for 290 000 income, spouse 80 000, IP BOX 25%", () => {
    const calc = loadCalculator();
    calc.setRevenue(290000);
    calc.setCosts(0);
    calc.setIpBox(25);
    calc.setJointTaxation(true, 80000);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("joint taxation keeps the solidarity levy individual when only one spouse exceeds 1 000 000", () => {
    const calc = loadCalculator();
    calc.setRevenue(1500000);
    calc.setCosts(0);
    calc.setIpBox(0);
    calc.setJointTaxation(true, 0);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("joint taxation does not average away the solidarity levy for unequal high incomes", () => {
    const calc = loadCalculator();
    calc.setRevenue(1200000);
    calc.setCosts(0);
    calc.setIpBox(0);
    calc.setJointTaxation(true, 900000);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("joint taxation with IP BOX excludes the IP BOX portion from the solidarity levy base", () => {
    const calc = loadCalculator();
    calc.setRevenue(1500000);
    calc.setCosts(0);
    calc.setIpBox(50);
    calc.setJointTaxation(true, 0);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });
});

describe("Ryczałt - single rate per revenue band", () => {
  it("low band (revenue 50 000, mult 0.6) - rate 8.5%", () => {
    const calc = loadCalculator();
    calc.setRevenue(50000);
    calc.setCosts(0);
    calc.toggleRyczaltRate("ryczalt8_5");
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("mid band (revenue 200 000, mult 1.0) - rate 12%", () => {
    const calc = loadCalculator();
    calc.setRevenue(200000);
    calc.setCosts(0);
    calc.toggleRyczaltRate("ryczalt12");
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("high band (revenue 500 000, mult 1.8) - rate 15%", () => {
    const calc = loadCalculator();
    calc.setRevenue(500000);
    calc.setCosts(0);
    calc.toggleRyczaltRate("ryczalt15");
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });

  it("8.5%/12.5% mixed split at 100 000 threshold (revenue 250 000)", () => {
    const calc = loadCalculator();
    calc.setRevenue(250000);
    calc.setCosts(0);
    calc.toggleRyczaltRate("ryczalt8_5_12_5");
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });
});

describe("Ryczałt - multiple rates mode", () => {
  it("split 200 000 across 8.5% / 12% / 15% with 50% deduction rebuild", () => {
    const calc = loadCalculator();
    calc.setRevenue(200000);
    calc.setCosts(0);
    calc.enableMultipleRates();
    calc.toggleRyczaltRate("ryczalt8_5");
    calc.toggleRyczaltRate("ryczalt12");
    calc.toggleRyczaltRate("ryczalt15");
    calc.setRateRevenue("ryczalt8_5", 80000);
    calc.setRateRevenue("ryczalt12", 70000);
    calc.setRateRevenue("ryczalt15", 50000);
    calc.calculate();
    expect(calc.readOutputs()).toMatchSnapshot();
    calc.close();
  });
});
