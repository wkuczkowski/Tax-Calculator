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

/* ----------------------------------------------------------------------
   Harmonogram składek społecznych ZUS 2026 – kwoty liczone ręcznie
   (każda składka zaokrąglana do grosza; FP+FS łącznie 2,45%).
   Pełny ZUS 5652,00: 1103,27 + 452,16 + 138,47 + 94,39 + FP/FS 138,47 = 1926,76
   Mały ZUS 1441,80: 281,44 + 115,34 + 35,32 + 24,08 = 456,18 (bez FP/FS)
   ---------------------------------------------------------------------- */
describe("taxMath.buildSocialSchedule (2026)", () => {
  it("brak daty rozpoczęcia: pełny ZUS z chorobową przez 12 miesięcy", () => {
    const s = calc.window.taxMath.buildSocialSchedule({});
    expect(s.months.every((m) => m.regime === "full")).toBe(true);
    expect(s.months[0].total).toBe(1926.76);
    expect(s.months[0].fpfs).toBe(138.47);
    expect(s.totals.social).toBe(21459.48);
    expect(s.totals.fpfs).toBe(1661.64);
    expect(s.totals.total).toBe(23121.12);
    expect(s.healthMonths).toBe(12);
  });

  it("ulga na start od 1.01.2026: I–VI ulga, VII–XII mały ZUS (6 × 456,18)", () => {
    const s = calc.window.taxMath.buildSocialSchedule({
      startDate: "2026-01-01",
      path: "ulga",
    });
    expect(s.months.map((m) => m.regime)).toEqual([
      "ulga", "ulga", "ulga", "ulga", "ulga", "ulga",
      "pref", "pref", "pref", "pref", "pref", "pref",
    ]);
    expect(s.months[6].total).toBe(456.18);
    expect(s.totals.total).toBe(2737.08);
    expect(s.totals.fpfs).toBe(0);
    expect(s.ulgaEnd).toEqual({ y: 2026, m: 6 });
    expect(s.prefEnd).toEqual({ y: 2028, m: 6 });
    expect(s.healthMonths).toBe(12);
  });

  it("mały ZUS od 16.03.2026: niepełny marzec 1441,80 × 16/31 = 744,15 → 235,45; rocznie 4341,07", () => {
    const s = calc.window.taxMath.buildSocialSchedule({
      startDate: "2026-03-16",
      path: "pref",
    });
    const march = s.months[2];
    expect(march.partial).toBe(true);
    expect(march.days).toBe(16);
    expect(march.base).toBe(744.15);
    expect(march.pension).toBe(145.26);
    expect(march.disability).toBe(59.53);
    expect(march.sickness).toBe(18.23);
    expect(march.accident).toBe(12.43);
    expect(march.total).toBe(235.45);
    // 235,45 + 9 × 456,18 = 4341,07
    expect(s.totals.total).toBe(4341.07);
    expect(s.months[0].regime).toBe("inactive");
    expect(s.healthMonths).toBe(10);
  });

  it("ulga na start od 15.09.2025 + wakacje: ulga do III, wakacje najwcześniej VI → 8 × 456,18 = 3649,44", () => {
    const s = calc.window.taxMath.buildSocialSchedule({
      startDate: "2025-09-15",
      path: "ulga",
      holiday: true,
    });
    expect(s.ulgaEnd).toEqual({ y: 2026, m: 3 });
    expect(s.holiday.firstSocialMonth).toEqual({ y: 2026, m: 4 });
    expect(s.holiday.earliestMonth).toEqual({ y: 2026, m: 6 });
    expect(s.holiday.eligibleMonths).toEqual([6, 7, 8, 9, 10, 11, 12]);
    expect(s.holiday.month).toBe(6);
    expect(s.holiday.saving).toBe(456.18);
    expect(s.totals.total).toBe(3649.44);
    const withoutHoliday = calc.window.taxMath.applySocialHoliday(s, null);
    expect(withoutHoliday.totals.total).toBe(4105.62);
    expect(withoutHoliday.holiday.declined).toBe(true);
  });

  it("mężczyzna kończy 60 lat 15.06.2026: FP/FS za I–VI (6 × 138,47 = 830,82), rocznie 22 290,30", () => {
    const s = calc.window.taxMath.buildSocialSchedule({
      birthDate: "1966-06-15",
      sex: "M",
    });
    expect(s.fpExemptFrom).toEqual({ y: 2026, m: 7 });
    expect(s.months[5].fpfs).toBe(138.47);
    expect(s.months[6].fpfs).toBe(0);
    expect(s.totals.fpfs).toBe(830.82);
    expect(s.totals.total).toBe(22290.3);
  });

  it("urodziny 1. dnia miesiąca: zwolnienie z FP od tego miesiąca; kobieta 56 lat – cały rok", () => {
    const { taxMath } = calc.window;
    expect(
      taxMath.buildSocialSchedule({ birthDate: "1966-06-01", sex: "M" })
        .fpExemptFrom,
    ).toEqual({ y: 2026, m: 6 });
    const woman = taxMath.buildSocialSchedule({
      birthDate: "1970-05-10",
      sex: "K",
    });
    expect(woman.totals.fpfs).toBe(0);
    expect(woman.totals.total).toBe(21459.48);
    // bez płci – brak zwolnienia
    expect(
      taxMath.buildSocialSchedule({ birthDate: "1950-01-10" }).totals.fpfs,
    ).toBe(1661.64);
  });

  it("pełny ZUS od 20.05.2026 bez chorobowej: niepełny maj 5652 × 12/31 = 2187,87 z FP; rocznie 13 210,27", () => {
    const s = calc.window.taxMath.buildSocialSchedule({
      startDate: "2026-05-20",
      path: "full",
      sickness: false,
    });
    const may = s.months[4];
    expect(may.base).toBe(2187.87);
    expect(may.sickness).toBe(0);
    expect(may.fpfs).toBe(53.6);
    expect(may.total).toBe(692.24);
    expect(s.totals.social).toBe(12187.38);
    expect(s.totals.fpfs).toBe(1022.89);
    expect(s.totals.total).toBe(13210.27);
    expect(s.healthMonths).toBe(8);
  });

  it("umowa o pracę ≥ minimalnego: brak składek społecznych, wakacje nie przysługują", () => {
    const s = calc.window.taxMath.buildSocialSchedule({
      employment: true,
      holiday: true,
    });
    expect(s.totals.total).toBe(0);
    expect(s.healthMonths).toBe(12);
    expect(s.holiday.reason).toBe("employment");
  });

  it("wakacje: pełny ZUS cały rok → I (1926,76); ulga od 1.05.2026 → nie przysługują w 2026", () => {
    const { taxMath } = calc.window;
    const full = taxMath.buildSocialSchedule({ holiday: true });
    expect(full.holiday.month).toBe(1);
    expect(full.totals.total).toBe(21194.36);
    const moved = taxMath.applySocialHoliday(full, 3);
    expect(moved.months[0].total).toBe(1926.76);
    expect(moved.months[2].total).toBe(0);
    expect(moved.totals.total).toBe(21194.36);
    const late = taxMath.buildSocialSchedule({
      startDate: "2026-05-01",
      path: "ulga",
      holiday: true,
    });
    expect(late.holiday.reason).toBe("too-late");
    expect(late.holiday.earliestMonth).toEqual({ y: 2027, m: 1 });
    expect(late.totals.total).toBe(912.36);
  });

  it("składki wyłączone: brak składek społecznych, data wyznacza miesiące zdrowotnej", () => {
    const s = calc.window.taxMath.buildSocialSchedule({
      enabled: false,
      startDate: "2026-05-20",
    });
    expect(s.totals.total).toBe(0);
    expect(s.healthMonths).toBe(8);
  });

  it("składka zdrowotna za niepełny rok (liczba miesięcy)", () => {
    const { taxMath } = calc.window;
    expect(taxMath.getMinHealthAnnual(10)).toBe(4325.4);
    expect(taxMath.calculateHealthScale(10000, 8)).toBe(3460.32);
    expect(taxMath.getRyczaltHealthAnnualForRevenue(50000, 8)).toBe(3986.8);
  });
});
