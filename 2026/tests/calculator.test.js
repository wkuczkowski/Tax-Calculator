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

/* ======================================================================
   Składki ZUS 2026, inne dochody i optymalny sposób odliczenia składek.
   Uwaga: od tej wersji składki społeczne są domyślnie WŁĄCZONE, więc
   wszystkie wcześniejsze snapshoty też się zmieniły (npm run test:update).
   ====================================================================== */

function scenario(setup) {
  const calc = loadCalculator();
  setup(calc);
  calc.calculate();
  const out = calc.readOutputs();
  calc.close();
  return out;
}

const withRates = (calc, ...rates) =>
  rates.forEach((rate) => calc.toggleRyczaltRate(rate));

describe("ZUS – ścieżki składek i daty rozpoczęcia", () => {
  it("brak daty: pełny ZUS z chorobową przez cały rok (120 000 przychodu)", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(120000);
        calc.setCosts(20000);
        withRates(calc, "ryczalt12");
      }),
    ).toMatchSnapshot();
  });

  it("ulga na start od 1.01.2026 → mały ZUS od VII", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(100000);
        calc.setCosts(10000);
        calc.setStartDate("2026-01-01");
        calc.setZusPath("ulga");
        withRates(calc, "ryczalt12");
      }),
    ).toMatchSnapshot();
  });

  it("ulga na start od 16.03.2026 (w trakcie miesiąca: niepełny III + 6 pełnych)", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(90000);
        calc.setCosts(10000);
        calc.setStartDate("2026-03-16");
        calc.setZusPath("ulga");
      }),
    ).toMatchSnapshot();
  });

  it("ulga na start od 15.09.2025 (przed 2026: ulga I–III, mały ZUS IV–XII)", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(100000);
        calc.setCosts(0);
        calc.setStartDate("2025-09-15");
        calc.setZusPath("ulga");
        withRates(calc, "ryczalt8_5");
      }),
    ).toMatchSnapshot();
  });

  it("mały ZUS bez ulgi od 1.04.2026", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(80000);
        calc.setCosts(5000);
        calc.setStartDate("2026-04-01");
        calc.setZusPath("pref");
      }),
    ).toMatchSnapshot();
  });

  it("mały ZUS bez ulgi od 16.03.2026 (niepełny miesiąc: podstawa × 16/31)", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(80000);
        calc.setCosts(10000);
        calc.setStartDate("2026-03-16");
        calc.setZusPath("pref");
      }),
    ).toMatchSnapshot();
  });

  it("mały ZUS od 10.02.2024 kończy się w II 2026, potem pełny ZUS", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(150000);
        calc.setCosts(30000);
        calc.setStartDate("2024-02-10");
        calc.setZusPath("pref");
      }),
    ).toMatchSnapshot();
  });

  it("pełny ZUS od 20.05.2026 (niepełny V, FP od podstawy proporcjonalnej), bez chorobowej", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(100000);
        calc.setCosts(0);
        calc.setStartDate("2026-05-20");
        calc.setZusPath("full");
        calc.setSickness(false);
      }),
    ).toMatchSnapshot();
  });

  it("składki społeczne wyłączone – data nadal wyznacza miesiące zdrowotnej (8)", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(100000);
        calc.setCosts(0);
        calc.setStartDate("2026-05-20");
        calc.setZusEnabled(false);
        withRates(calc, "ryczalt12");
      }),
    ).toMatchSnapshot();
  });
});

describe("ZUS – zwolnienie z FP/FS ze względu na wiek", () => {
  it("kobieta 56 lat – zwolniona z FP/FS przez cały 2026", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(150000);
        calc.setCosts(20000);
        calc.setBirthDate("1970-05-10");
        calc.setSex("K");
      }),
    ).toMatchSnapshot();
  });

  it("mężczyzna kończy 60 lat 15.06.2026 – FP/FS do VI, zwolnienie od VII", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(150000);
        calc.setCosts(20000);
        calc.setBirthDate("1966-06-15");
        calc.setSex("M");
      }),
    ).toMatchSnapshot();
  });

  it("mężczyzna kończy 60 lat 1.06.2026 – zwolnienie już od VI", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(150000);
        calc.setCosts(20000);
        calc.setBirthDate("1966-06-01");
        calc.setSex("M");
      }),
    ).toMatchSnapshot();
  });
});

describe("ZUS – umowa o pracę i wakacje składkowe", () => {
  it("umowa o pracę ≥ minimalnego: bez składek społecznych, etat 80 000 w innych dochodach; wakacje nie przysługują", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(120000);
        calc.setCosts(0);
        calc.setEmployment(true);
        calc.setOtherIncome(80000);
        calc.setHoliday(true);
        withRates(calc, "ryczalt8_5", "ryczalt12");
      }),
    ).toMatchSnapshot();
  });

  it("wakacje składkowe przy pełnym ZUS przez cały rok", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(200000);
        calc.setCosts(30000);
        calc.setHoliday(true);
        withRates(calc, "ryczalt12");
      }),
    ).toMatchSnapshot();
  });

  it("wakacje składkowe po uldze na start (start 15.09.2025 → najwcześniej VI)", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(100000);
        calc.setCosts(0);
        calc.setStartDate("2025-09-15");
        calc.setZusPath("ulga");
        calc.setHoliday(true);
      }),
    ).toMatchSnapshot();
  });

  it("wakacje składkowe nie przysługują: ulga na start od 1.05.2026", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(60000);
        calc.setCosts(0);
        calc.setStartDate("2026-05-01");
        calc.setZusPath("ulga");
        calc.setHoliday(true);
      }),
    ).toMatchSnapshot();
  });
});

describe("Inne dochody opodatkowane skalą", () => {
  for (const otherIncome of [0, 80000, 200000]) {
    it(`inne dochody ${otherIncome} – skala, liniowy, ryczałt`, () => {
      expect(
        scenario((calc) => {
          calc.setRevenue(150000);
          calc.setCosts(20000);
          calc.setOtherIncome(otherIncome);
          withRates(calc, "ryczalt8_5", "ryczalt12");
        }),
      ).toMatchSnapshot();
    });
  }

  it("rozliczenie wspólne + inne dochody 80 000 + ulga na start", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(200000);
        calc.setCosts(20000);
        calc.setOtherIncome(80000);
        calc.setStartDate("2026-02-01");
        calc.setZusPath("ulga");
        calc.setJointTaxation(true, 40000);
      }),
    ).toMatchSnapshot();
  });

  it("IP BOX 50% + inne dochody 80 000 (składki w kosztach dzielone proporcjonalnie)", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(300000);
        calc.setCosts(40000);
        calc.setOtherIncome(80000);
        calc.setIpBox(50);
        calc.setJointTaxation(true, 60000);
      }),
    ).toMatchSnapshot();
  });
});

describe("Ryczałt – progi składki zdrowotnej a składki społeczne (art. 81 ust. 2g)", () => {
  // "81459,48" − 21 459,48 = dokładnie 60 000 (próg „nie przekroczył”)
  for (const revenue of [60000, 75000, "81459,48", 300000, 318000, 322000]) {
    it(`przychód ${revenue}`, () => {
      expect(
        scenario((calc) => {
          calc.setRevenue(revenue);
          calc.setCosts(0);
          withRates(calc, "ryczalt8_5", "ryczalt12", "ryczalt8_5_12_5");
        }),
      ).toMatchSnapshot();
    });
  }

  it("przychód 70 000 + inne dochody 150 000: odliczenie od skali vs od przychodu", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(70000);
        calc.setCosts(0);
        calc.setOtherIncome(150000);
        withRates(calc, "ryczalt3", "ryczalt12");
      }),
    ).toMatchSnapshot();
  });

  it("wiele stawek z ZUS: 100 000 @ 12% + 100 000 @ 8,5%", () => {
    expect(
      scenario((calc) => {
        calc.setRevenue(200000);
        calc.setCosts(0);
        calc.enableMultipleRates();
        withRates(calc, "ryczalt12", "ryczalt8_5");
        calc.setRateRevenue("ryczalt12", 100000);
        calc.setRateRevenue("ryczalt8_5", 100000);
      }),
    ).toMatchSnapshot();
  });
});

/* ----------------------------------------------------------------------
   Jawne kwoty (bez snapshotów). Wartości liczone ręcznie.
   ---------------------------------------------------------------------- */

function totals(setup, ids) {
  const calc = loadCalculator();
  setup(calc);
  calc.calculate();
  const result = {};
  for (const id of ids) result[id] = calc.readVariantData(id).total;
  result.best = calc.document.getElementById("bestCardAmount").textContent;
  result.bestTitle = calc.document.getElementById("bestCardTitle").textContent;
  calc.close();
  return result;
}

describe("Audyt B1–B3 i przypadki straty (składki społeczne wyłączone)", () => {
  it("B1: wiele stawek 100 000 @ 12% + 100 000 @ 8,5% → 29 956,15", () => {
    const r = totals(
      (calc) => {
        calc.setZusEnabled(false);
        calc.setRevenue(200000);
        calc.setCosts(0);
        calc.enableMultipleRates();
        withRates(calc, "ryczalt12", "ryczalt8_5");
        calc.setRateRevenue("ryczalt12", 100000);
        calc.setRateRevenue("ryczalt8_5", 100000);
      },
      ["ratesTotal"],
    );
    expect(r.ratesTotal).toBe(29956.15);
  });

  it("B2: 8,5%/12,5% przy 200 000 → 30 443,69 i przy 102 000 → 18 289,46", () => {
    for (const [revenue, expected] of [
      [200000, 30443.69],
      [102000, 18289.46],
    ]) {
      const r = totals(
        (calc) => {
          calc.setZusEnabled(false);
          calc.setRevenue(revenue);
          calc.setCosts(0);
          withRates(calc, "ryczalt8_5_12_5");
        },
        ["ryczalt8_5_12_5"],
      );
      expect(r.ryczalt8_5_12_5).toBe(expected);
    }
  });

  it("B3: wspólnie 200 000 / małżonek 100 000 → 50 400", () => {
    const r = totals(
      (calc) => {
        calc.setZusEnabled(false);
        calc.setRevenue(200000);
        calc.setCosts(0);
        calc.setJointTaxation(true, 100000);
      },
      ["taxScaleJoint"],
    );
    expect(r.taxScaleJoint).toBe(50400);
  });

  it("B3: wspólnie 250 000 / małżonek 32 000 → 57 300 i wygrywa z liniowym (57 422,50)", () => {
    const r = totals(
      (calc) => {
        calc.setZusEnabled(false);
        calc.setRevenue(250000);
        calc.setCosts(0);
        calc.setJointTaxation(true, 32000);
      },
      ["taxScaleJoint", "taxLinear"],
    );
    expect(r.taxScaleJoint).toBe(57300);
    expect(r.taxLinear).toBe(57422.5);
    expect(r.bestTitle).toBe("Skala podatkowa wspólnie z małżonkiem");
  });

  it("strata z IP BOX 100% nie daje ujemnego podatku (1 000 000 / 1 200 000 → 5190,48)", () => {
    const r = totals(
      (calc) => {
        calc.setZusEnabled(false);
        calc.setRevenue(1000000);
        calc.setCosts(1200000);
        calc.setIpBox(100);
      },
      ["taxScale", "taxScaleIpBox", "taxLinearIpBox"],
    );
    expect(r.taxScaleIpBox).toBe(5190.48);
    expect(r.taxLinearIpBox).toBe(5190.48);
    expect(r.best).toBe("5190,48\u00a0zł");
  });

  it("strata z działalności nie pomniejsza dochodu małżonka (50 000 / 100 000, małżonek 100 000 → 1590,48)", () => {
    const r = totals(
      (calc) => {
        calc.setZusEnabled(false);
        calc.setRevenue(50000);
        calc.setCosts(100000);
        calc.setJointTaxation(true, 100000);
      },
      ["taxScaleJoint"],
    );
    expect(r.taxScaleJoint).toBe(1590.48);
  });
});

describe("Składki ZUS – jawne kwoty (liczone ręcznie)", () => {
  it("100 000 przychodu, pełny ZUS z chorobową: skala 35 665,69; liniowy 41 932,40; ryczałt 12% 41 914,92", () => {
    // S = 21 459,48, FP/FS = 1661,64; podstawa zdrowotnej 76 878,88
    const r = totals(
      (calc) => {
        calc.setRevenue(100000);
        calc.setCosts(0);
        withRates(calc, "ryczalt12");
      },
      ["taxScale", "taxLinear", "ryczalt12"],
    );
    expect(r.taxScale).toBe(35665.69);
    expect(r.taxLinear).toBe(41932.4);
    expect(r.ryczalt12).toBe(41914.92);
  });

  it("ryczałt 12% przy 75 000: próg liczony od 75 000 − 21 459,48 → niski (498,35 × 12) → 35 167,37", () => {
    const calc = loadCalculator();
    calc.setRevenue(75000);
    calc.setCosts(0);
    calc.toggleRyczaltRate("ryczalt12");
    calc.calculate();
    const data = calc.readVariantData("ryczalt12");
    calc.close();
    expect(data.health).toBe(5980.2);
    expect(data.total).toBe(35167.37);
    expect(data.method).toBe("ryczalt");
  });

  it("inne dochody 200 000: liniowy odlicza składki od skali (32% > 19%)", () => {
    const calc = loadCalculator();
    calc.setRevenue(150000);
    calc.setCosts(0);
    calc.setOtherIncome(200000);
    calc.calculate();
    const data = calc.readVariantData("taxLinear");
    calc.close();
    expect(data.method).toBe("scale");
    expect(data.baseline).toBe(36400);
  });
});

describe("Ryczałt – 50% zdrowotnej przed składkami społecznymi (RC1)", () => {
  it("przychód 15 000, inne dochody 100 000, pełny ZUS: ryczałt 17% → 27 967,37", () => {
    // Zdrowotna próg I: 498,35 × 12 = 5980,20 → odliczenie 2990,10.
    // Od przychodu: 2990,10 + składki 12 009,90 = 15 000 → ryczałt 0.
    // Nadwyżka składek 21 459,48 − 12 009,90 = 9449,58 od skali:
    // PIT 12% × 90 550,42 − 3600 = 7266,05; bez działalności 8400.
    // 7266,05 − 8400 + 5980,20 + 23 121,12 = 27 967,37.
    const calc = loadCalculator();
    calc.setRevenue(15000);
    calc.setCosts(0);
    calc.setOtherIncome(100000);
    withRates(calc, "ryczalt17", "ryczalt12");
    calc.calculate();
    const r17 = calc.readVariantData("ryczalt17");
    const r12 = calc.readVariantData("ryczalt12");
    calc.close();
    expect(r17.method).toBe("ryczalt");
    expect(r17.taxes).toBe(7266.05);
    expect(r17.health).toBe(5980.2);
    expect(r17.total).toBe(27967.37);
    expect(r12.total).toBe(27967.37);
  });

  it("przychód 10 000 (koszty 30 000), inne dochody 50 000: ryczałt 15% → 27 367,37 (I-265)", () => {
    // 10 000 − 2990,10 = 7009,90 składek od przychodu; 14 449,58 od skali:
    // PIT 12% × 35 550,42 − 3600 = 666,05; bez działalności 2400.
    const r = totals(
      (calc) => {
        calc.setRevenue(10000);
        calc.setCosts(30000);
        calc.setOtherIncome(50000);
        withRates(calc, "ryczalt15");
      },
      ["ryczalt15"],
    );
    expect(r.ryczalt15).toBe(27367.37);
  });

  it("bez innych dochodów wynik się nie zmienia (100 000 @ 12% → 41 914,92)", () => {
    const r = totals(
      (calc) => {
        calc.setRevenue(100000);
        calc.setCosts(0);
        withRates(calc, "ryczalt12");
      },
      ["ryczalt12"],
    );
    expect(r.ryczalt12).toBe(41914.92);
  });
});

describe("Zaokrąglanie do grosza – połówka w górę (C4)", () => {
  it("przychód 1 177 622,32 / koszty 713 137,82, ZUS wył.: zdrowotna 9% × 464 484,50 = 41 803,61", () => {
    const calc = loadCalculator();
    calc.setZusEnabled(false);
    calc.setRevenue("1177622,32");
    calc.setCosts("713137,82");
    calc.calculate();
    const data = calc.readVariantData("taxScale");
    calc.close();
    expect(data.health).toBe(41803.61);
    // PIT: 10 800 + 32% × 344 484,50 = 121 035,04
    expect(data.taxes).toBe(121035.04);
    expect(data.total).toBe(162838.65);
  });

  it("taxMath.round2: remisy w górę (od zera), bez -0", () => {
    const calc = loadCalculator();
    const { taxMath } = calc.window;
    const out = [
      taxMath.round2(0.09 * 464484.5),
      taxMath.round2(1.005),
      taxMath.round2(2.675),
      taxMath.round2(-2.675),
      taxMath.round2(-0.001),
      taxMath.round2(41803.604),
    ];
    calc.close();
    expect(out).toEqual([41803.61, 1.01, 2.68, -2.68, 0, 41803.6]);
  });
});
