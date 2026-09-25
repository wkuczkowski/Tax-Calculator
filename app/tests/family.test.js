import { describe, it, expect } from "vitest";
import { loadCalculator } from "./helpers/loadCalculator.js";

/* ----------------------------------------------------------------------
   Karta „Rodzina”: ulga na dzieci (art. 27f), samotny rodzic (art. 6
   ust. 4c–4d), rozliczenie wspólne z dziećmi, ulga dla rodzin 4+ (art. 21
   ust. 1 pkt 153) – kwoty liczone ręcznie (bez migawek).
   Źródła: docs/prawo/research-ulgi-rodzinne.md, specyfikacja
   docs/decyzje/specyfikacja-ulg-rodzinnych.md, rejestr decyzji (sekcja 12).

   Oznaczenia: T(x) – PIT wg skali 2026 (12% − 3600 do 120 000; 10 800 +
   32% nadwyżki); H0 – obciążenie gospodarstwa bez działalności (punkt
   odniesienia); wynik = obciążenie z działalnością − H0.
   Szacunek składek od innych dochodów (etat): G = (D + 3000) / 0,8629;
   społeczne 13,71% G; zdrowotna 9% (G − społeczne):
     D = 60 000 → G 73 009,62 → 10 009,62 + 5 670,00 = 15 679,62
     D = 50 000 → G 61 420,79 →  8 420,79 + 4 770,00 = 13 190,79
     D = 12 000 → G 17 383,24 →  2 383,24 + 1 350,00 =  3 733,24
     D = 10 000 → G 15 065,48 →  2 065,48 + 1 170,00 =  3 235,48
   ---------------------------------------------------------------------- */

function withCalc(options, fn) {
  const calc = loadCalculator(options);
  try {
    return fn(calc);
  } finally {
    calc.close();
  }
}

// Intl (pl-PL) grupuje cyfry twardą spacją – porównujemy tekst po zamianie
// twardych spacji na zwykłe
const norm = (text) => text.replace(/[\u00a0\u202f]/g, " ");
const rowOf = (calc, id) =>
  calc.document.querySelector(`.results-row[data-variant="${id}"]`);
const detailOf = (calc, id) =>
  norm(rowOf(calc, id).querySelector("[data-detail]").textContent);
const noteOf = (calc, id) =>
  norm(rowOf(calc, id).querySelector(".row-note .row-note-pop").textContent);

const MONEY = /[−+-]?\d+(?:[\u00a0 ]\d{3})*,\d{2}/;
const toNumber = (text) =>
  Number(text.replace(/[\u00a0 ]/g, "").replace("−", "-").replace(",", "."));
/* Składniki linii pod wynikiem (bez sposobu odliczenia i wakacji) sumują
   się do wyniku wiersza – także w trybie „Rodzina”. */
function detailSum(detail) {
  return (
    Math.round(
      detail
        .split(" · ")
        .filter((part) => !/^(składki społeczne|wakacje)/.test(part))
        .map((part) => toNumber(part.match(MONEY)[0]))
        .reduce((a, b) => a + b, 0) * 100,
    ) / 100
  );
}

describe("taxMath – kwota ulgi na dzieci (art. 27f ust. 2) i szacunek składek", () => {
  it("kwoty roczne: 1 dziecko 1112,04; 2 – 2224,08; 3 – 4224,12; 4 – 6924,12; 5 – 9624,12", () => {
    withCalc({}, (calc) => {
      const { taxMath } = calc.window;
      const total = (months) =>
        taxMath.getChildRelief(months.map((m) => ({ months: m }))).total;
      expect([
        total([12]),
        total([12, 12]),
        total([12, 12, 12]),
        total([12, 12, 12, 12]),
        total([12, 12, 12, 12, 12]),
      ]).toEqual([1112.04, 2224.08, 4224.12, 6924.12, 9624.12]);
    });
  });

  it("miesiąc po miesiącu: 3. dziecko przez 6 miesięcy → 6 × 185,34 + 6 × 352,01 = 3224,10; [12, 3] → 834,03 + 556,02", () => {
    withCalc({}, (calc) => {
      const { taxMath } = calc.window;
      const three = taxMath.getChildRelief([{ months: 12 }, { months: 12 }, { months: 6 }]);
      expect(three.total).toBe(3224.1);
      expect(
        three.groups.map((g) => [g.count, g.months, g.monthly, g.amount]),
      ).toEqual([
        [2, 6, 185.34, 1112.04],
        [3, 6, 352.01, 2112.06],
      ]);
      expect(three.maxCount).toBe(3);
      expect(taxMath.getChildRelief([{ months: 12 }, { months: 3 }]).total).toBe(1390.05);
      expect(taxMath.getChildRelief([{ months: 6 }]).total).toBe(556.02);
    });
  });

  it("szacunek składek od innych dochodów: 60 000 → 15 679,62; 10 000 → 3235,48; 0 → 0", () => {
    withCalc({}, (calc) => {
      const { taxMath } = calc.window;
      expect(taxMath.estimateEmploymentContributions(60000)).toEqual({
        gross: 73009.62,
        social: 10009.62,
        health: 5670,
        total: 15679.62,
      });
      expect(taxMath.estimateEmploymentContributions(10000).total).toBe(3235.48);
      expect(taxMath.estimateEmploymentContributions(0).total).toBe(0);
    });
  });

  it("stałe 2026 i 2027: te same kwoty ustawowe, status „ostateczna”", () => {
    withCalc({}, (calc) => {
      const { TAX_CONSTANTS_BY_YEAR, TAX_CONSTANTS_META_BY_YEAR } = calc.window;
      const keys = [
        "CHILD_RELIEF_MONTHLY_1_2",
        "CHILD_RELIEF_MONTHLY_3",
        "CHILD_RELIEF_MONTHLY_4PLUS",
        "CHILD_RELIEF_LIMIT_MARRIED",
        "CHILD_RELIEF_LIMIT_SINGLE_PARENT",
        "CHILD_RELIEF_LIMIT_OTHER",
        "FOUR_PLUS_EXEMPTION_LIMIT",
      ];
      const values = (year) => keys.map((key) => TAX_CONSTANTS_BY_YEAR[year][key]);
      expect(values(2026)).toEqual([92.67, 166.67, 225, 112000, 112000, 56000, 85528]);
      expect(values(2027)).toEqual(values(2026));
      expect(
        keys.every(
          (key) =>
            TAX_CONSTANTS_META_BY_YEAR[2026][key].status === "final" &&
            TAX_CONSTANTS_META_BY_YEAR[2027][key].status === "final",
        ),
      ).toBe(true);
    });
  });
});

describe("Bez dzieci – wyniki jak bez karty „Rodzina”", () => {
  it("rozwinięta karta, status „samotny rodzic” / „małżeństwo” bez dzieci: te same kwoty i eksport", () => {
    const run = (touch) =>
      withCalc({}, (calc) => {
        calc.setRevenue(150000);
        calc.setCosts(20000);
        calc.setOtherIncome(40000);
        calc.toggleRyczaltRate("ryczalt12");
        if (touch) {
          calc.document.getElementById("familyToggle").click();
          calc.setFamilyStatus(touch);
        }
        calc.calculate();
        const ids = ["taxScale", "taxLinear", "ryczalt12"];
        return {
          totals: ids.map((id) => calc.readVariantData(id).total),
          details: ids.map((id) => detailOf(calc, id)),
          singleRowShown: rowOf(calc, "taxScaleSingle").classList.contains("show"),
          familyBadges: calc.document.querySelectorAll(".row-family").length,
          breakdown: calc.readBreakdown().replace(/^Data sporządzenia: .*$/m, ""),
        };
      });
    const plain = run(null);
    expect(run("single")).toEqual(plain);
    expect(run("married")).toEqual(plain);
    expect(plain.singleRowShown).toBe(false);
    expect(plain.familyBadges).toBe(0);
  });
});

describe("Samotny rodzic – przykład z research §4.2 (ZUS wył.)", () => {
  /* Samotna matka, 1 dziecko, etat D = 60 000, działalność 100 000.
     H0: 2 × T(30 000) = 0; ulga 1112,04 w całości jako zwrot (limit zwrotu
     15 679,62) → H0 = −1112,04.
     Skala – samotny rodzic: 2 × T(80 000) = 12 000; dochód 160 000 > 112 000
       → bez ulgi; wynik 12 000 + 1112,04 + zdrowotna 9000 = 22 112,04.
     Liniowy: zdrowotna minimalna 5190,48 (odliczona); (100 000 − 5190,48)
       × 19% = 18 013,81; etat bez preferencji T(60 000) = 3600; limit
       (ostrożnie 56 000) przekroczony → bez ulgi; wynik 18 013,81 + 3600
       + 1112,04 + 5190,48 = 27 916,33.
     Skala indywidualnie: T(160 000) = 23 600 → 23 600 + 1112,04 + 9000 =
       33 712,04.
     Research (sam PIT, bez zdrowotnej): skala lepsza o 10 600; z zdrowotną:
       10 600 − (9000 − 5190,48) − 19% × 5190,48 (986,19) = 5804,29. */
  it("skala – samotny rodzic 22 112,04 wygrywa z liniowym 27 916,33 o 5804,29", () => {
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(100000);
      calc.setOtherIncome(60000);
      calc.setFamilyStatus("single");
      calc.addChild();
      calc.calculate();
      const single = calc.readVariantData("taxScaleSingle");
      const linear = calc.readVariantData("taxLinear");
      const indiv = calc.readVariantData("taxScale");
      expect([single.total, linear.total, indiv.total]).toEqual([
        22112.04, 27916.33, 33712.04,
      ]);
      expect([single.baseline, linear.baseline, indiv.baseline]).toEqual([
        -1112.04, -1112.04, -1112.04,
      ]);
      expect(Math.round((linear.total - single.total) * 100) / 100).toBe(5804.29);
      expect(
        Math.round((10600 - (9000 - 5190.48) - 986.19) * 100) / 100,
      ).toBe(5804.29);
      expect(rowOf(calc, "taxScaleSingle").classList.contains("show")).toBe(true);
      expect(calc.document.getElementById("bestCardTitle").textContent).toBe(
        "Skala podatkowa — samotny rodzic",
      );
      const linearLine = detailOf(calc, "taxLinear");
      expect(linearLine.includes("utrata preferencji samotnego rodzica: +3600,00")).toBe(true);
      expect(linearLine.includes("utrata ulgi na dzieci: +1112,04")).toBe(true);
      for (const id of ["taxScale", "taxScaleSingle", "taxLinear"]) {
        expect(detailSum(detailOf(calc, id))).toBe(calc.readVariantData(id).total);
      }
      const bd = norm(calc.readBreakdown());
      expect(bd.includes("--- RODZINA: SYTUACJA BEZ DZIAŁALNOŚCI (PUNKT ODNIESIENIA) ---")).toBe(true);
      expect(bd.includes("Podatek od połowy × 2: 6000,00 zł × 2 = 12 000,00 zł")).toBe(true);
      expect(bd.includes("160 000,00 zł > 112 000,00 zł → ulga NIE przysługuje")).toBe(true);
      expect(bd.includes("Zwrot niewykorzystanej ulgi (art. 27f ust. 8): min(1112,04 zł; 15 679,62 zł) = 1112,04 zł")).toBe(true);
      expect(bd.includes("Punkt odniesienia (bez działalności): 0,00 zł − 1112,04 zł = -1112,04 zł")).toBe(true);
    });
  });

  it("samotny rodzic na liniowym: limit ostrożnie 56 000 zł (etat 50 000, działalność 20 000)", () => {
    /* Liniowy: (20 000 − 5190,48) × 19% = 2813,81; T(50 000) = 2400 (bez
       preferencji); limit: 14 809,52 + 50 000 = 64 809,52 > 56 000 → bez ulgi;
       H0: 2 × T(25 000) = 0, zwrot 1112,04 → −1112,04.
       Wynik: 2813,81 + 2400 + 1112,04 + 5190,48 = 11 516,33.
       Skala – samotny rodzic: 2 × T(35 000) = 1200; 70 000 ≤ 112 000 →
       ulga 1112,04 od podatku → 87,96; zdrowotna minimalna 5190,48;
       wynik 87,96 + 1112,04 + 5190,48 = 6390,48. */
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(20000);
      calc.setOtherIncome(50000);
      calc.setFamilyStatus("single");
      calc.addChild();
      calc.calculate();
      expect(calc.readVariantData("taxLinear").total).toBe(11516.33);
      expect(calc.readVariantData("taxScaleSingle").total).toBe(6390.48);
      const note = noteOf(calc, "taxLinear");
      expect(note.includes("Limit dochodu 56 000,00 zł")).toBe(true);
    });
  });
});

describe("Limit dochodu przy jednym dziecku – 112 000 / 112 000,01 (małżeństwo)", () => {
  /* Małżeństwo (bez rozliczenia wspólnego), 1 dziecko, dochód małżonka
     12 000 (T = 0), ZUS wył. H0: ulga 1112,04 jako zwrot przez PIT-37
     małżonka (limit zwrotu: szacunek 3733,24) → H0 = −1112,04.
     Skala, przychód 100 000: dochody 100 000 + 12 000 = 112 000 ≤ limit →
       T(100 000) 8400 − ulga 1112,04; wynik 7287,96 + 1112,04 + 9000 = 17 400.
     Przychód 100 000,01: 112 000,01 > limit → bez ulgi: 8400 + 1112,04 +
       9000 = 18 512,04.
     Liniowy (100 000): 94 809,52 + 12 000 = 106 809,52 ≤ limit → ulga jako
       zwrot przez małżonka; wynik jak bez dzieci: 18 013,81 + 5190,48 = 23 204,29. */
  const run = (revenue) =>
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(revenue);
      calc.setFamilyStatus("married");
      calc.addChild();
      calc.setSpouseIncome("12000");
      calc.calculate();
      return {
        scale: calc.readVariantData("taxScale"),
        linear: calc.readVariantData("taxLinear").total,
        detail: detailOf(calc, "taxScale"),
      };
    });

  it("112 000,00 → ulga przysługuje (17 400,00); 112 000,01 → nie (18 512,04)", () => {
    const at = run("100000");
    const over = run("100000,01");
    expect([at.scale.total, at.scale.taxes, at.scale.baseline]).toEqual([17400, 7287.96, -1112.04]);
    expect(at.linear).toBe(23204.29);
    expect([over.scale.total, over.scale.taxes]).toEqual([18512.04, 8400]);
    expect(at.detail.includes("ulga na dzieci: +0,00 (bez zmian)")).toBe(true);
    expect(over.detail.includes("utrata ulgi na dzieci: +1112,04")).toBe(true);
  });

  it("orzeczenie o niepełnosprawności jedynego dziecka: bez limitu (100 000,01 → 17 400,01)", () => {
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue("100000,01");
      calc.setFamilyStatus("married");
      calc.addChild({ disabled: true });
      calc.setSpouseIncome("12000");
      calc.calculate();
      // T(100 000,01) = 8400,00; zdrowotna 9000,00 → 8400 − 1112,04 + 1112,04 + 9000
      expect(calc.readVariantData("taxScale").total).toBe(17400);
    });
  });
});

describe("Zwrot niewykorzystanej ulgi – limit składek i wybór sposobu odliczenia", () => {
  /* Inna sytuacja, 5 dzieci (9624,12, bez limitu dochodu), etat 10 000
     (T = 0; szacunek składek 3235,48), przychód 200 000, pełny ZUS 2026:
     społeczne 21 459,48, FP/FS 1661,64 (razem 23 121,12); liniowy:
     zdrowotna 4,9% × 176 878,88 = 8667,07.
     Sposób „od dochodu liniowego”: (198 338,36 − 8667,07 − 21 459,48) ×
       19% = 31 960,24; zwrot tylko do 3235,48 → podatki 28 724,76.
     Sposób „od innych dochodów ze skali”: 189 671,29 × 19% = 36 037,55;
       składki z art. 26 w limicie zwrotu → limit 24 694,96 → zwrot 9624,12
       → podatki 26 413,43 (taniej o 2311,33).
     H0: zwrot 3235,48 → −3235,48. Wynik: 26 413,43 + 3235,48 + 8667,07 +
       23 121,12 = 61 437,10. Bez dzieci wygrywa „od dochodu liniowego”
       (31 960,24 + 8667,07 + 23 121,12 = 63 748,43). */
  it("liniowy: optymalizator wybiera odliczenie składek od etatu, bo podnosi limit zwrotu", () => {
    const run = (children) =>
      withCalc({}, (calc) => {
        calc.setRevenue(200000);
        calc.setOtherIncome(10000);
        for (let i = 0; i < children; i++) calc.addChild();
        calc.calculate();
        return calc.readVariantData("taxLinear");
      });
    const withKids = run(5);
    const without = run(0);
    expect([withKids.method, withKids.taxes, withKids.baseline, withKids.total]).toEqual([
      "scale",
      26413.43,
      -3235.48,
      61437.1,
    ]);
    expect([without.method, without.total]).toEqual(["linear", 63748.43]);
  });

  it("zwrot ograniczony limitem: podane składki od etatu 1000 zł → zwrot 1000 (ryczałt bez innych składek w limicie)", () => {
    /* Inna sytuacja, 3 dzieci (4224,12), etat 10 000 (T = 0), składki podane
       1000, ZUS wył., ryczałt 12% od 100 000: zwrot min(4224,12; 1000) =
       1000 – tak samo jak w H0, więc wynik = wynik bez dzieci. */
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(100000);
      calc.setOtherIncome(10000);
      calc.toggleRyczaltRate("ryczalt12");
      for (let i = 0; i < 3; i++) calc.addChild();
      calc.setOtherContrib("1000");
      calc.calculate();
      const d = calc.readVariantData("ryczalt12");
      expect(d.baseline).toBe(-1000);
      const bd = norm(calc.readBreakdown());
      expect(bd.includes("Zwrot niewykorzystanej ulgi (art. 27f ust. 8): min(4224,12 zł; 1000,00 zł) = 1000,00 zł (przepada 3224,12 zł)")).toBe(true);
      const note = noteOf(calc, "ryczalt12");
      expect(note.includes("Zwrot niewykorzystanej ulgi ograniczony limitem składek")).toBe(true);
    });
  });

  it("udział w uldze 50% (inna sytuacja, 2 dzieci): 2224,08 × 50% = 1112,04", () => {
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(100000);
      calc.addChild();
      calc.addChild();
      calc.setFamilyShare(50);
      calc.calculate();
      // T(100 000) = 8400 − 1112,04 = 7287,96; H0 bez dochodów: brak zeznania → 0
      const d = calc.readVariantData("taxScale");
      expect([d.taxes, d.baseline, d.total]).toEqual([7287.96, 0, 16287.96]);
    });
  });
});

describe("Rozliczenie wspólne z dziećmi", () => {
  /* Wspólnie (status: małżeństwo), 2 dzieci (2224,08), małżonek 50 000,
     ZUS wył., przychód 100 000. H0: wspólnie 2 × T(25 000) = 0 → zwrot
     2224,08 (limit: składki małżonka 13 190,79); PIT małżonka osobno
     T(50 000) = 2400 odjęty po obu stronach → data-baseline = −4624,08.
     Wspólnie: 2 × T(75 000) = 10 800 − ulga 2224,08; przypisane: 10 800 −
       2400 − 2224,08 = 6175,92; wynik 6175,92 + 4624,08 + 9000 = 19 800.
     Indywidualnie: T(100 000) + T(50 000) = 10 800 → to samo: 19 800.
     Liniowy: PIT 18 013,81; ulgę odlicza małżonek (2400 ≥ 2224,08); utrata
       wspólnego rozliczenia: 0 + 2400 − 2 × T(25 000) = 2400; wynik
       18 013,81 + 2400 + 5190,48 = 25 604,29.
     Bez dzieci (dotychczasowy model, H0 osobno): wspólnie 10 800 − 2400 +
       9000 = 17 400. */
  it("wspólnie 19 800,00, indywidualnie 19 800,00, liniowy 25 604,29 (utrata wspólnego +2400,00)", () => {
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(100000);
      calc.setJointTaxation(true, "50000");
      calc.addChild();
      calc.addChild();
      calc.calculate();
      const joint = calc.readVariantData("taxScaleJoint");
      expect([joint.taxes, joint.baseline, joint.total]).toEqual([6175.92, -4624.08, 19800]);
      expect(calc.readVariantData("taxScale").total).toBe(19800);
      expect(calc.readVariantData("taxLinear").total).toBe(25604.29);
      expect(detailOf(calc, "taxLinear").includes("utrata wspólnego rozliczenia: +2400,00")).toBe(true);
      for (const id of ["taxScale", "taxScaleJoint", "taxLinear"]) {
        expect(detailSum(detailOf(calc, id))).toBe(calc.readVariantData(id).total);
      }
      // status wymuszony: małżeństwo
      expect(calc.document.querySelector('input[name="familyStatus"][value="married"]').checked).toBe(true);
      expect(calc.document.querySelector('input[name="familyStatus"][value="single"]').disabled).toBe(true);
    });
  });

  it("bez dzieci – wspólnie jak dotąd (17 400,00)", () => {
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(100000);
      calc.setJointTaxation(true, "50000");
      calc.calculate();
      expect(calc.readVariantData("taxScaleJoint").total).toBe(17400);
    });
  });

  it("małżonek na liniowym / ryczałcie: warianty wspólne niedostępne i poza rankingiem (art. 6 ust. 8)", () => {
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(100000);
      calc.setJointTaxation(true, "200000");
      calc.setSpouseLinRycz(true);
      calc.calculate();
      const el = calc.document.getElementById("taxScaleJoint");
      expect(el.dataset.unavailable).toBe("true");
      expect(rowOf(calc, "taxScaleJoint").classList.contains("is-unavailable")).toBe(true);
      expect(calc.document.getElementById("bestCardTitle").textContent).toBe("Skala podatkowa");
      expect(calc.document.getElementById("bestCardSavings").textContent.includes("art. 6 ust. 8")).toBe(true);
    });
  });
});

describe("Ulga dla rodzin 4+ (art. 21 ust. 1 pkt 153), ZUS wył.", () => {
  /* Ryczałt 12%: zdrowotna wg przychodu przed zwolnieniem (60–300 tys.):
     830,58/mies. → 9966,96; odliczenie 50% = 4983,48.
       przychód 85 528: opodatkowany 0 → ryczałt 0 → wynik 9966,96
         (bez ulgi: (85 528 − 4983,48) × 12% = 9665,34 → 19 632,30);
       przychód 100 000: (14 472 − 4983,48) × 12% = 1138,62 → 11 105,58;
       limit wykorzystany 50 000: (64 472 − 4983,48) × 12% = 7138,62 → 17 105,58.
     Skala 100 000: dochód 14 472 → T = 0; zdrowotna 9% × 100 000 = 9000.
     Liniowy 100 000: zdrowotna minimalna 5190,48; (14 472 − 5190,48) × 19%
       = 1763,49 → 6953,97.
     8,5% / 12,5% przy 150 000: zwolnienie zużywa najpierw część 8,5%:
       8,5% od 14 472, 12,5% od 50 000; odliczenie 4983,48 dzielone
       14 472 / 64 472 → 1118,64 i 3864,84; (14 472 − 1118,64) × 8,5% =
       1135,04; (50 000 − 3864,84) × 12,5% = 5766,90; wynik 6901,94 +
       9966,96 = 16 868,90. */
  const run = (revenue, used = "", rates = ["ryczalt12"]) =>
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(revenue);
      rates.forEach((rate) => calc.toggleRyczaltRate(rate));
      calc.setFourPlus(true, used);
      calc.calculate();
      const out = {};
      ["taxScale", "taxLinear", ...rates].forEach((id) => {
        out[id] = calc.readVariantData(id).total;
      });
      out.breakdown = norm(calc.readBreakdown());
      return out;
    });

  it("przychód 85 528 – cały zwolniony; 100 000 – od nadwyżki; limit wykorzystany 50 000", () => {
    const at = run(85528);
    expect([at.ryczalt12, at.taxScale, at.taxLinear]).toEqual([9966.96, 7697.52, 5190.48]);
    const above = run(100000);
    expect([above.ryczalt12, above.taxScale, above.taxLinear]).toEqual([11105.58, 9000, 6953.97]);
    expect(run(100000, "50000").ryczalt12).toBe(17105.58);
    expect(above.breakdown.includes("Przychód zwolniony: min(85 528,00 zł; przychód 100 000,00 zł) = 85 528,00 zł")).toBe(true);
    expect(above.breakdown.includes("Przychód opodatkowany: 100 000,00 zł − 85 528,00 zł (zwolniony — ulga 4+) = 14 472,00 zł")).toBe(true);
  });

  it("bez ulgi 4+ ten sam ryczałt: 19 632,30", () => {
    withCalc({}, (calc) => {
      calc.setZusEnabled(false);
      calc.setRevenue(85528);
      calc.toggleRyczaltRate("ryczalt12");
      calc.calculate();
      expect(calc.readVariantData("ryczalt12").total).toBe(19632.3);
    });
  });

  it("8,5% / 12,5% przy 150 000: zwolnienie najpierw z części 8,5% → 16 868,90", () => {
    expect(run(150000, "", ["ryczalt8_5_12_5"]).ryczalt8_5_12_5).toBe(16868.9);
  });

  it("limit wykorzystany ponad 85 528 zł jest błędem", () => {
    withCalc({}, (calc) => {
      calc.setRevenue(100000);
      calc.document.getElementById("familyToggle").click();
      calc.setFourPlus(true, "90000");
      calc.calculate();
      expect(calc.document.getElementById("bestCard").dataset.state).toBe("invalid");
    });
  });
});
