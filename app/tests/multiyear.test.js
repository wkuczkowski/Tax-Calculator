import { describe, it, expect } from "vitest";
import { loadCalculator } from "./helpers/loadCalculator.js";

/* ----------------------------------------------------------------------
   Tryb wielu lat (2026 + 2027) i scenariusz „Projekt zmian 2027
   (UD458 + UD116)” – kwoty liczone ręcznie (bez migawek).

   Stałe 2027 (docs/prawo/research-2027.md; rejestr decyzji, sekcja Y):
   minimalne wynagrodzenie 4950 → mały ZUS 1485,00, minimalna zdrowotna
   445,50; prognozy: przeciętne wynagrodzenie 10 033 → pełny ZUS 6019,80,
   FP 1% + FS 1,45%, wypadkowa 1,67%, IV kw. 2026 ≈ 9720, limit odliczenia
   zdrowotnej (liniowy) 15 100. Scenariusz: skala 12/24/32% (130 000 /
   150 000), danina 5% także od IP BOX, ryczałt: limit 250 000 € przychodu
   z 2026 r., 17% ponad 300 000 € w roku; kurs EUR 4,3750.
   ---------------------------------------------------------------------- */

function withCalc(options, fn) {
  const calc = loadCalculator(options);
  try {
    return fn(calc);
  } finally {
    calc.close();
  }
}

describe("Stałe 2027 i harmonogram ZUS 2027", () => {
  it("pełny ZUS 2027 z chorobową: 1175,06 + 481,58 + 147,49 + 100,53 + FP/FS 147,49 = 2052,15 / mies.", () => {
    withCalc({ year: 2027 }, (calc) => {
      const { taxMath, taxYears } = calc.window;
      expect(taxYears.active()).toEqual({ year: 2027, scenario: null });
      const s = taxMath.buildSocialSchedule({});
      const jan = s.months[0];
      expect([jan.base, jan.pension, jan.disability, jan.sickness, jan.accident, jan.fpfs, jan.total]).toEqual([
        6019.8, 1175.06, 481.58, 147.49, 100.53, 147.49, 2052.15,
      ]);
      // 12 × 1904,66 = 22 855,92; 12 × 147,49 = 1769,88
      expect(s.totals.social).toBe(22855.92);
      expect(s.totals.fpfs).toBe(1769.88);
      expect(s.totals.total).toBe(24625.8);
    });
  });

  it("mały ZUS 2027 (1485,00): 289,87 + 118,80 + 36,38 + 24,80 = 469,85 bez FP/FS; start 1.01.2027 → 12 × 469,85", () => {
    withCalc({ year: 2027 }, (calc) => {
      const s = calc.window.taxMath.buildSocialSchedule({
        startDate: "2027-01-01",
        path: "pref",
      });
      const jan = s.months[0];
      expect([jan.base, jan.pension, jan.disability, jan.sickness, jan.accident, jan.fpfs, jan.total]).toEqual([
        1485, 289.87, 118.8, 36.38, 24.8, 0, 469.85,
      ]);
      expect(s.totals.total).toBe(5638.2);
    });
  });

  it("starty sprzed 2027 przechodzą na 2027: ulga od 15.03.2026 → cały 2027 mały ZUS; mały ZUS od 10.03.2025 → I–III mały, IV–XII pełny", () => {
    withCalc({ year: 2027 }, (calc) => {
      const { taxMath } = calc.window;
      const ulga = taxMath.buildSocialSchedule({ startDate: "2026-03-15", path: "ulga" });
      expect(ulga.ulgaEnd).toEqual({ y: 2026, m: 9 });
      expect(ulga.prefEnd).toEqual({ y: 2028, m: 9 });
      expect(ulga.months.every((m) => m.regime === "pref")).toBe(true);
      expect(ulga.totals.total).toBe(5638.2);
      expect(ulga.startsBeforeYear).toBe(true);
      const pref = taxMath.buildSocialSchedule({ startDate: "2025-03-10", path: "pref" });
      expect(pref.prefEnd).toEqual({ y: 2027, m: 3 });
      expect(pref.months.map((m) => m.regime).join(",")).toBe(
        "pref,pref,pref,full,full,full,full,full,full,full,full,full",
      );
      // 3 × 469,85 + 9 × 2052,15 = 1409,55 + 18 469,35 = 19 878,90
      expect(pref.totals.total).toBe(19878.9);
    });
  });

  it("składka zdrowotna 2027: minimum 445,50 / mies., 5346,00 / rok; ryczałt 524,88 / 874,80 / 1574,64; limit liniowy 15 100", () => {
    withCalc({ year: 2027 }, (calc) => {
      const { taxMath, TAX_CONSTANTS } = calc.window;
      expect(taxMath.getMinHealthMonthly()).toBe(445.5);
      expect(taxMath.getMinHealthAnnual()).toBe(5346);
      expect(taxMath.getMinHealthThresholdLinearAnnual()).toBe(109102.04);
      expect([50000, 100000, 400000].map((r) => taxMath.getRyczaltHealthMonthlyForRevenue(r))).toEqual([
        524.88, 874.8, 1574.64,
      ]);
      expect(TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT).toBe(15100);
      expect(TAX_CONSTANTS.PIT_SCALE_BANDS).toEqual([
        { from: 0, rate: 0.12 },
        { from: 120000, rate: 0.32 },
      ]);
    });
  });

  it("metadane: każda stała każdego roku ma status, źródło; prognozy mają termin (finalBy)", () => {
    withCalc({}, (calc) => {
      const { TAX_CONSTANTS_BY_YEAR, TAX_CONSTANTS_META_BY_YEAR, TAX_SCENARIOS } = calc.window;
      const problems = [];
      Object.keys(TAX_CONSTANTS_BY_YEAR).forEach((year) => {
        const meta = TAX_CONSTANTS_META_BY_YEAR[year];
        Object.keys(TAX_CONSTANTS_BY_YEAR[year]).forEach((key) => {
          const m = meta[key];
          if (!m || !["final", "forecast", "draft"].includes(m.status) || !m.source) {
            problems.push(`${year}.${key}`);
          } else if (m.status !== "final" && !m.finalBy) {
            problems.push(`${year}.${key} (finalBy)`);
          }
        });
      });
      Object.values(TAX_SCENARIOS).forEach((scenario) => {
        Object.keys(scenario.overrides).forEach((key) => {
          if (!scenario.meta[key] || !scenario.meta[key].finalBy) problems.push(`${scenario.id}.${key}`);
        });
      });
      expect(problems).toEqual([]);
      const forecast2027 = Object.keys(TAX_CONSTANTS_META_BY_YEAR[2027])
        .filter((key) => TAX_CONSTANTS_META_BY_YEAR[2027][key].status !== "final")
        .sort();
      expect(forecast2027).toEqual([
        "AVG_SALARY_Q4_PREV",
        "LINEAR_HEALTH_DEDUCTION_LIMIT",
        "ZUS_FORECAST_AVG_SALARY",
        "ZUS_FULL_BASE",
        "ZUS_RATE_ACCIDENT",
        "ZUS_RATE_FP",
        "ZUS_RATE_FS",
      ]);
      expect(Object.values(TAX_CONSTANTS_META_BY_YEAR[2026]).every((m) => m.status === "final")).toBe(true);
    });
  });
});

describe("Wyniki 2027 – obowiązujące przepisy (liczone ręcznie)", () => {
  it("przychód 100 000, pełny ZUS: skala = PIT 5444,90 + zdrowotna 6783,68 + ZUS 24 625,80 = 36 854,38", () => {
    // podstawa: 100 000 − FP/FS 1769,88 − społeczne 22 855,92 = 75 374,20;
    // PIT 12% × 75 374,20 − 3600 = 5444,90; zdrowotna 9% × 75 374,20 = 6783,68
    withCalc({ year: 2027 }, (calc) => {
      calc.setRevenue(100000);
      calc.calculate();
      const d = calc.readVariantData("taxScale");
      expect([d.taxes, d.health, d.social, d.total]).toEqual([5444.9, 6783.68, 24625.8, 36854.38]);
    });
  });

  it("liniowy 600 000 (ZUS wył.): limit odliczenia 15 100 → (600 000 − 15 100) × 19% = 111 131 + zdrowotna 29 400", () => {
    withCalc({ year: 2027 }, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(600000);
      calc.calculate();
      const d = calc.readVariantData("taxLinear");
      expect([d.taxes, d.health, d.total]).toEqual([111131, 29400, 140531]);
      const status = calc.document.querySelector('.results-row[data-variant="taxLinear"] .row-status');
      expect(status.hidden).toBe(false);
      expect(status.textContent.includes("Limit odliczenia składki zdrowotnej")).toBe(true);
    });
  });

  it("oznaczenia prognoz: wiersz, karta najlepszego wyniku, eksport (sekcja „Wartości prognozowane”); 2026 bez oznaczeń", () => {
    const y2027 = withCalc({ year: 2027 }, (calc) => {
      calc.setRevenue(200000);
      calc.setCosts(20000);
      calc.toggleRyczaltRate("ryczalt12");
      calc.calculate();
      const row = calc.document.querySelector('.results-row[data-variant="ryczalt12"] .row-status');
      const text = calc.readBreakdown();
      return {
        badge: row.hidden ? "" : row.querySelector(".row-status-btn").textContent,
        rowLists: row.textContent.includes("Przeciętne wynagrodzenie w IV kw.") && row.textContent.includes("Podstawa pełnego ZUS"),
        bestNote: calc.document.getElementById("bestCardSavings").textContent.includes("Wynik zależy od wartości prognozowanych"),
        header: text.startsWith("KALKULATOR PODATKOWY 2027"),
        section: text.includes("=== WARTOŚCI PROGNOZOWANE ==="),
        marker: text.includes("[prognoza: "),
        bannerHidden: calc.document.getElementById("yearBanner").hidden,
      };
    });
    expect(y2027).toEqual({
      badge: "prognoza",
      rowLists: true,
      bestNote: true,
      header: true,
      section: true,
      marker: true,
      bannerHidden: false,
    });
    const y2026 = withCalc({ year: 2026 }, (calc) => {
      calc.setRevenue(200000);
      calc.setCosts(20000);
      calc.toggleRyczaltRate("ryczalt12");
      calc.calculate();
      const text = calc.readBreakdown();
      return {
        badges: calc.document.querySelectorAll(".row-status:not([hidden])").length,
        section: text.includes("WARTOŚCI PROGNOZOWANE"),
        bannerHidden: calc.document.getElementById("yearBanner").hidden,
        yearCardHidden: calc.document.getElementById("yearCard").hidden,
      };
    });
    expect(y2026).toEqual({ badges: 0, section: false, bannerHidden: true, yearCardHidden: true });
  });

  it("okno „Założenia” 2027: tabela stałych ze statusem, źródłem i terminem", () => {
    withCalc({ year: 2027 }, (calc) => {
      calc.document.getElementById("infoFab").click();
      const row = calc.document.querySelector('.const-table tr[data-key="ZUS_FULL_BASE"]');
      expect(row.dataset.status).toBe("forecast");
      expect(row.querySelector(".const-value").textContent.replace(/\s/g, "")).toBe("6019,80zł");
      expect(row.querySelector(".const-final-by").textContent.includes("MRPiPS")).toBe(true);
      expect(!!calc.document.getElementById("info-forecast")).toBe(true);
      expect(!!calc.document.getElementById("info-reform")).toBe(true);
      expect(!!calc.document.getElementById("info-zus-params")).toBe(true);
    });
  });
});

describe("Scenariusz „Projekt zmian 2027 (UD458 + UD116)” (liczone ręcznie)", () => {
  it("skala z projektu: B = 140 000 → 12 000 + 24% × 10 000 = 14 400; B = 200 000 → 16 800 + 32% × 50 000 = 32 800", () => {
    withCalc({ year: 2027, reform: true }, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(140000);
      calc.calculate();
      const a = calc.readVariantData("taxScale");
      calc.setRevenue(200000);
      calc.calculate();
      const b = calc.readVariantData("taxScale");
      expect([a.taxes, a.health, a.total]).toEqual([14400, 12600, 27000]);
      expect([b.taxes, b.health, b.total]).toEqual([32800, 18000, 50800]);
      // obowiązujące przepisy 2027: 10 800 + 32% × 80 000 = 36 400 → zmiana −3600
      const badge = calc.document.querySelector('.results-row[data-variant="taxScale"] .row-status');
      expect(badge.textContent.includes("−3600,00")).toBe(true);
    });
  });

  it("wspólnie z małżonkiem (projekt): 200 000 + 100 000 → 2 × T(150 000) = 33 600 − T(100 000) 8400 = 25 200", () => {
    withCalc({ year: 2027, reform: true }, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(200000);
      calc.setJointTaxation(true, 100000);
      calc.calculate();
      expect(calc.readVariantData("taxScaleJoint").taxes).toBe(25200);
    });
  });

  it("ryczałt 12%, przychód 1 500 000 (ZUS wył., przychód 2026 = 1 000 000): 17% od nadwyżki ponad 1 312 500", () => {
    /* zdrowotna: 9% × 9720 × 1,8 = 1574,64 × 12 = 18 895,68; 50% = 9447,84
       odliczenie na część 12%: 9447,84 × 1 312 500 / 1 500 000 = 8266,86;
       na część 17%: 1180,98
       (1 312 500 − 8266,86) × 12% = 156 507,98; (187 500 − 1180,98) × 17% = 31 674,23
       ryczałt 188 182,21 + zdrowotna 18 895,68 = 207 077,89 */
    withCalc({ year: 2027, reform: true }, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(1500000);
      calc.setPrevYearRevenue(1000000);
      calc.toggleRyczaltRate("ryczalt12");
      calc.calculate();
      const d = calc.readVariantData("ryczalt12");
      expect([d.taxes, d.health, d.total]).toEqual([188182.21, 18895.68, 207077.89]);
      expect(d.unavailable).toBe(undefined);
      const text = calc.readBreakdown();
      expect(
        text
          .replace(/\s/g, " ")
          .includes("Część 17% (nadwyżka): (187 500,00 zł − 1180,98 zł) × 17% = 31 674,23 zł"),
      ).toBe(true);
      expect(text.includes("=== SCENARIUSZ: PROJEKT ZMIAN 2027 (UD458 + UD116) ===")).toBe(true);
    });
  });

  it("limit ryczałtu: przychód 2026 = przychód z formularza 1 500 000 > 1 093 750 → ryczałt niedostępny, poza rankingiem", () => {
    withCalc({ year: 2027, reform: true }, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(1500000);
      calc.toggleRyczaltRate("ryczalt12");
      calc.calculate();
      const d = calc.readVariantData("ryczalt12");
      const savings = calc.document
        .getElementById("bestCardSavings")
        .textContent.replace(/\s/g, " ");
      expect(d.unavailable).toBe("true");
      expect(calc.document.getElementById("bestCardTitle").textContent.startsWith("Ryczałt")).toBe(false);
      expect(savings.includes("przekracza limit 1 093 750,00 zł")).toBe(true);
      expect(calc.document.getElementById("prevYearRevenueHint").textContent.includes("ryczałt niedostępny")).toBe(true);
    });
  });

  it("działalność rozpoczęta w 2027 r.: limit nie dotyczy, także gdy wpisano przychód 2026 (2 000 000)", () => {
    withCalc({ year: 2027, reform: true }, (calc) => {
      calc.setZusEnabled(false);
      calc.setStartDate("2027-02-01");
      calc.setRevenue(500000);
      calc.setPrevYearRevenue(2000000);
      calc.toggleRyczaltRate("ryczalt12");
      calc.calculate();
      expect(calc.readVariantData("ryczalt12").unavailable).toBe(undefined);
      const hint = calc.document.getElementById("prevYearRevenueHint").textContent;
      expect(hint.includes("limit nie dotyczy")).toBe(true);
      expect(hint.includes("wpisana kwota jest pomijana")).toBe(true);
    });
  });

  it("danina 5% z dochodem IP BOX: liniowy + IP BOX 50%, dochód 2 000 000 (ZUS wył.) → danina 49 245", () => {
    /* IP BOX 1 000 000 (5% = 50 000); liniowy: 1 000 000 − 15 100 = 984 900 × 19% = 187 131;
       danina: (984 900 + 1 000 000 − 1 000 000) × 5% = 49 245; zdrowotna 4,9% × 2 000 000 = 98 000
       obowiązujące przepisy: podstawa daniny 984 900 < 1 000 000 → 0 */
    withCalc({ year: 2027, reform: true }, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(2000000);
      calc.setIpBox(50);
      calc.calculate();
      const d = calc.readVariantData("taxLinearIpBox");
      expect([d.taxes, d.health, d.total]).toEqual([286376, 98000, 384376]);
      const badge = calc.document.querySelector('.results-row[data-variant="taxLinearIpBox"] .row-status');
      expect(badge.textContent.replace(/\s/g, " ").includes("+49 245,00")).toBe(true);
    });
  });

  it("bez scenariusza (obowiązujące przepisy 2027) ten sam przypadek: danina 0, skala 120 000 / 32%", () => {
    withCalc({ year: 2027 }, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(2000000);
      calc.setIpBox(50);
      calc.calculate();
      expect(calc.readVariantData("taxLinearIpBox").taxes).toBe(237131);
      calc.setRevenue(200000);
      calc.calculate();
      // 10 800 + 32% × 80 000 = 36 400
      expect(calc.readVariantData("taxScale").taxes).toBe(36400);
    });
  });
});

describe("Przełącznik roku, adres (?rok=) i rok domyślny", () => {
  it("taxYears.getDefaultYear: bieżący rok, od 1 listopada następny (jeśli ma stałe), inaczej najnowszy ≤", () => {
    withCalc({}, (calc) => {
      const { taxYears } = calc.window;
      expect(taxYears.list()).toEqual([2026, 2027]);
      expect(taxYears.getDefaultYear("2026-10-31")).toBe(2026);
      expect(taxYears.getDefaultYear("2026-11-01")).toBe(2027);
      expect(taxYears.getDefaultYear({ y: 2027, m: 6 })).toBe(2027);
      expect(taxYears.getDefaultYear("2027-11-15")).toBe(2027);
      expect(taxYears.getDefaultYear("2029-01-10")).toBe(2027);
      expect(taxYears.getDefaultYear("2025-05-05")).toBe(2026);
    });
  });

  it("bez ?rok= rok wynika z daty (strona), błędny ?rok= jest usuwany z adresu", () => {
    const years = ["2026-10-31", "2026-11-01"].map((today) =>
      withCalc({ year: null, today }, (calc) => [calc.window.taxYears.active().year, calc.window.location.search]),
    );
    expect(years).toEqual([
      [2026, ""],
      [2027, ""],
    ]);
    withCalc({ url: "http://localhost/?rok=2030" }, (calc) => {
      expect(calc.window.taxYears.active().year >= 2026).toBe(true);
      expect(calc.window.location.search).toBe("");
    });
  });

  it("przełączenie roku: adres ?rok=, przeliczenie, teksty; powrót do 2026 daje te same wyniki", () => {
    withCalc({ year: 2026 }, (calc) => {
      calc.setRevenue(100000);
      calc.calculate();
      const before = calc.readVariantData("taxScale");
      calc.setYear(2027);
      const in2027 = {
        search: calc.window.location.search,
        total: calc.readVariantData("taxScale").total,
        title: calc.document.title,
        brand: calc.document.getElementById("brandSub").textContent,
        max: calc.document.getElementById("zusStartDate").max,
        reformHidden: calc.document.getElementById("reformField").hidden,
      };
      calc.setReform(true);
      const reformSearch = calc.window.location.search;
      const prevFieldVisible = !calc.document.getElementById("prevYearRevenueField").hidden;
      calc.setYear(2026);
      const after = calc.readVariantData("taxScale");
      expect(in2027).toEqual({
        search: "?rok=2027",
        total: 36854.38,
        title: "Kalkulator podatkowy 2027",
        brand: "Stan prawny na 25.09.2026",
        max: "2027-12-31",
        reformHidden: false,
      });
      expect(reformSearch).toBe("?rok=2027&projekt=1");
      expect(prevFieldVisible).toBe(true);
      expect(calc.window.location.search).toBe("?rok=2026");
      expect(calc.window.taxYears.active()).toEqual({ year: 2026, scenario: null });
      expect(calc.document.getElementById("yearCard").hidden).toBe(true);
      expect(after).toEqual(before);
    });
  });

  it("scenariusz tylko dla 2027: ?rok=2026&projekt=1 go nie włącza", () => {
    withCalc({ url: "http://localhost/?rok=2026&projekt=1" }, (calc) => {
      expect(calc.window.taxYears.active()).toEqual({ year: 2026, scenario: null });
      expect(calc.window.TAX_CONSTANTS.SOLIDARITY_RATE).toBe(0.04);
    });
  });

  it("data rozpoczęcia z 2027 r. jest błędem w roku 2026, poprawna w 2027", () => {
    withCalc({ year: 2026 }, (calc) => {
      calc.setRevenue(100000);
      calc.setStartDate("2027-03-01");
      calc.calculate();
      const invalid2026 = calc.document.getElementById("bestCard").dataset.state;
      calc.setYear(2027);
      const state2027 = calc.document.getElementById("bestCard").dataset.state;
      expect([invalid2026, state2027]).toEqual(["invalid", "ranked"]);
      expect(calc.readOutputs().healthMonths).toBe("10");
    });
  });
});
