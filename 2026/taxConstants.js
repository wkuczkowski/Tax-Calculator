/**
 * KALKULATOR PODATKOWY 2026
 * Stan prawny: od 1.02.2026 (rok składkowy 02.2026–01.2027)
 * Kalkulator zakłada pełny rok na tych stawkach.
 *
 * Źródła danych bazowych:
 * - MIN_WAGE (4806 PLN): https://www.gov.pl/web/rodzina/minimalne-wynagrodzenie-za-prace
 * - AVG_SALARY_Q4_PREV (9228.64 PLN): https://stat.gov.pl/.../obwieszczenie-...-iv-kwartale-2025-r.html
 * - Minimalna składka zdrowotna od 1.02.2026: https://www.zus.pl/.../minimalna-skladka-na-ubezpieczenie-zdrowotne-w-2026-r.
 * - LINEAR_HEALTH_DEDUCTION_LIMIT (14100 PLN): https://monitorpolski.gov.pl/MP/2025/1274
 */

const TAX_CONSTANTS = {
  // Obowiązuje w kalkulatorze (pełny rok liczony stawkami od lutego 2026)
  EFFECTIVE_FROM: "2026-02-01",
  ASSUME_FULL_YEAR_FROM_FEB: true,

  // Dane z aktów/obwieszczeń
  // Minimalne wynagrodzenie 2026: https://www.gov.pl/web/rodzina/minimalne-wynagrodzenie-za-prace
  MIN_WAGE: 4806, // PLN / miesiąc

  // GUS IV kw. 2025 (włącznie z wypłatami z zysku): https://stat.gov.pl/.../obwieszczenie-...-iv-kwartale-2025-r.html
  AVG_SALARY_Q4_PREV: 9228.64, // PLN / miesiąc

  // Limit odliczenia liniowy 2026 (MP 2025 poz. 1274): https://monitorpolski.gov.pl/MP/2025/1274
  LINEAR_HEALTH_DEDUCTION_LIMIT: 14100, // PLN / rok

  // Progi i stawki PIT
  TAX_FREE_AMOUNT: 30000, // Kwota wolna od podatku
  TAX_THRESHOLD_12: 120000, // Próg I progu podatkowego (12%)
  SOLIDARITY_THRESHOLD: 1000000, // Próg daniny solidarnościowej
  PIT_RATE_12: 0.12, // Stawka 12%
  PIT_RATE_32: 0.32, // Stawka 32%
  SOLIDARITY_RATE: 0.04, // Danina solidarnościowa 4%
  TAX_DECREASING_AMOUNT: 3600, // 30000 * 12% - kwota zmniejszająca podatek

  // Stawki podatku liniowego i IP BOX
  LINEAR_PIT_RATE: 0.19, // Stawka liniowa 19%
  IP_BOX_RATE: 0.05, // Stawka IP BOX 5%

  // Składka zdrowotna – stawki
  // ZUS minimalna składka zdrowotna od 1.02.2026: https://www.zus.pl/.../minimalna-skladka-na-ubezpieczenie-zdrowotne-w-2026-r.
  HEALTH_RATE_SCALE: 0.09, // Stawka zdrowotna dla skali podatkowej (9%)
  HEALTH_RATE_LINEAR: 0.049, // Stawka zdrowotna dla podatku liniowego (4.9%)
  HEALTH_RATE_RYCZALT: 0.09, // Stawka zdrowotna dla ryczałtu (9%)

  // Ryczałt – progi przychodu i mnożniki podstawy
  RYCZALT_REVENUE_THRESHOLD_LOW: 60000, // Próg niski
  RYCZALT_REVENUE_THRESHOLD_HIGH: 300000, // Próg wysoki
  RYCZALT_BASE_MULT_LOW: 0.6, // Mnożnik dla przychodu <= 60000
  RYCZALT_BASE_MULT_MID: 1.0, // Mnożnik dla przychodu > 60000 i <= 300000
  RYCZALT_BASE_MULT_HIGH: 1.8, // Mnożnik dla przychodu > 300000

  // Ryczałt – odliczenie składki zdrowotnej od przychodu (50%)
  RYCZALT_HEALTH_DEDUCTION_FACTOR: 0.5,

  // Dodatkowe progi (8.5%/12.5%)
  RYCZALT_8_5_THRESHOLD: 100000,

  // Stawki ryczałtu
  RYCZALT_RATE_2: 0.02,
  RYCZALT_RATE_3: 0.03,
  RYCZALT_RATE_5_5: 0.055,
  RYCZALT_RATE_8_5: 0.085,
  RYCZALT_RATE_10: 0.1,
  RYCZALT_RATE_12: 0.12,
  RYCZALT_RATE_12_5: 0.125,
  RYCZALT_RATE_14: 0.14,
  RYCZALT_RATE_15: 0.15,
  RYCZALT_RATE_17: 0.17,
};

/* ==================================================
   Stałe pochodne (wyliczane z TAX_CONSTANTS)
================================================== */

// Szerokości przedziałów podatkowych
const TAX_BAND_12 =
  TAX_CONSTANTS.TAX_THRESHOLD_12 - TAX_CONSTANTS.TAX_FREE_AMOUNT; // 90000
const TAX_BAND_32 =
  TAX_CONSTANTS.SOLIDARITY_THRESHOLD - TAX_CONSTANTS.TAX_THRESHOLD_12; // 880000

// Efektywne stawki (PIT + składka zdrowotna)
const PIT_RATE_SOLIDARITY =
  TAX_CONSTANTS.PIT_RATE_32 + TAX_CONSTANTS.SOLIDARITY_RATE; // 0.36
const EFFECTIVE_LINEAR_RATE =
  TAX_CONSTANTS.LINEAR_PIT_RATE + TAX_CONSTANTS.HEALTH_RATE_LINEAR; // 0.239
const EFFECTIVE_LINEAR_RATE_SOLIDARITY =
  EFFECTIVE_LINEAR_RATE + TAX_CONSTANTS.SOLIDARITY_RATE; // 0.279
const EFFECTIVE_IPBOX_PLUS_HEALTH =
  TAX_CONSTANTS.IP_BOX_RATE + TAX_CONSTANTS.HEALTH_RATE_LINEAR; // 0.099

/* ==================================================
   Moduł taxMath - funkcje pomocnicze
================================================== */

const taxMath = {
  /**
   * Zaokrąglenie do groszy (2 miejsca po przecinku)
   * @param {number} n - liczba do zaokrąglenia
   * @returns {number} zaokrąglona wartość
   */
  round2(n) {
    return Math.round(n * 100) / 100;
  },

  /**
   * Minimalna składka zdrowotna miesięczna (skala/liniowy)
   * @returns {number} składka miesięczna w PLN
   */
  getMinHealthMonthly() {
    return this.round2(
      TAX_CONSTANTS.MIN_WAGE * TAX_CONSTANTS.HEALTH_RATE_SCALE
    ); // 432.54
  },

  /**
   * Minimalna składka zdrowotna roczna (skala/liniowy)
   * @returns {number} składka roczna w PLN
   */
  getMinHealthAnnual() {
    return this.round2(this.getMinHealthMonthly() * 12); // 5190.48
  },

  /**
   * Próg miesięczny dochodu dla minimalnej składki zdrowotnej (podatek liniowy)
   * Poniżej tego progu płaci się minimalną składkę
   * @returns {number} próg miesięczny w PLN
   */
  getMinHealthThresholdLinearMonthly() {
    return this.round2(
      this.getMinHealthAnnual() / TAX_CONSTANTS.HEALTH_RATE_LINEAR / 12
    );
  },

  /**
   * Próg roczny dochodu dla minimalnej składki zdrowotnej (podatek liniowy)
   * Poniżej tego progu płaci się minimalną składkę
   * @returns {number} próg roczny w PLN
   */
  getMinHealthThresholdLinearAnnual() {
    return this.round2(
      this.getMinHealthAnnual() / TAX_CONSTANTS.HEALTH_RATE_LINEAR
    );
  },

  /**
   * Pobiera mnożnik podstawy składki zdrowotnej dla ryczałtu na podstawie przychodu rocznego
   * @param {number} revenueAnnual - przychód roczny w PLN
   * @returns {number} mnożnik (0.6, 1.0 lub 1.8)
   */
  getRyczaltHealthMultiplier(revenueAnnual) {
    if (revenueAnnual > TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH) {
      return TAX_CONSTANTS.RYCZALT_BASE_MULT_HIGH; // 1.8
    } else if (revenueAnnual > TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW) {
      return TAX_CONSTANTS.RYCZALT_BASE_MULT_MID; // 1.0
    }
    return TAX_CONSTANTS.RYCZALT_BASE_MULT_LOW; // 0.6
  },

  /**
   * Składka zdrowotna miesięczna dla ryczałtu na podstawie przychodu rocznego
   * Zaokrąglenie do groszy na etapie miesięcznym (eliminuje rozjazdy float)
   * @param {number} revenueAnnual - przychód roczny w PLN
   * @returns {number} składka miesięczna w PLN
   */
  getRyczaltHealthMonthlyForRevenue(revenueAnnual) {
    const mult = this.getRyczaltHealthMultiplier(revenueAnnual);
    return this.round2(
      TAX_CONSTANTS.HEALTH_RATE_RYCZALT *
        TAX_CONSTANTS.AVG_SALARY_Q4_PREV *
        mult
    );
  },

  /**
   * Składka zdrowotna roczna dla ryczałtu na podstawie przychodu rocznego
   * Wyliczana jako miesięczna × 12 (po zaokrągleniu miesięcznej)
   * @param {number} revenueAnnual - przychód roczny w PLN
   * @returns {number} składka roczna w PLN
   */
  getRyczaltHealthAnnualForRevenue(revenueAnnual) {
    return this.round2(
      this.getRyczaltHealthMonthlyForRevenue(revenueAnnual) * 12
    );
  },

  /**
   * Oblicza składkę zdrowotną dla skali podatkowej
   * @param {number} income - dochód roczny
   * @returns {number} składka roczna
   */
  calculateHealthScale(income) {
    if (income > 0) {
      return Math.max(
        this.round2(TAX_CONSTANTS.HEALTH_RATE_SCALE * income),
        this.getMinHealthAnnual()
      );
    }
    return this.getMinHealthAnnual();
  },

  /**
   * Oblicza składkę zdrowotną dla podatku liniowego
   * @param {number} income - dochód roczny
   * @returns {number} składka roczna
   */
  calculateHealthLinear(income) {
    if (income > 0) {
      return Math.max(
        this.round2(TAX_CONSTANTS.HEALTH_RATE_LINEAR * income),
        this.getMinHealthAnnual()
      );
    }
    return this.getMinHealthAnnual();
  },

  /**
   * Sanity check - weryfikacja obliczeń dla przykładowych wartości
   * Uruchom w konsoli: taxMath.sanityCheck()
   */
  sanityCheck() {
    console.log("=== SANITY CHECK: TAX_CONSTANTS (stawki od 02.2026) ===\n");

    console.log("1. Minimalna składka zdrowotna:");
    console.log(
      `   Miesięcznie: ${this.getMinHealthMonthly()} PLN (oczekiwane: 432.54)`
    );
    console.log(
      `   Rocznie: ${this.getMinHealthAnnual()} PLN (oczekiwane: 5190.48)\n`
    );

    console.log("2. Progi dochodu dla minimalnej składki (liniowy):");
    console.log(
      `   Miesięcznie: ${this.getMinHealthThresholdLinearMonthly()} PLN`
    );
    console.log(
      `   Rocznie: ${this.getMinHealthThresholdLinearAnnual()} PLN\n`
    );

    console.log("3. Składka ryczałtowa dla różnych przychodów:");
    const testRevenues = [50000, 100000, 400000];
    testRevenues.forEach((rev) => {
      const monthly = this.getRyczaltHealthMonthlyForRevenue(rev);
      const annual = this.getRyczaltHealthAnnualForRevenue(rev);
      const deduction = this.round2(
        annual * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR
      );
      console.log(`   Revenue ${rev.toLocaleString("pl-PL")} PLN:`);
      console.log(`     C17 (roczna): ${annual} PLN`);
      console.log(`     F18 (50% C17): ${deduction} PLN`);
      console.log(`     Składka miesięczna: ${monthly} PLN\n`);
    });

    console.log("4. Wartości bazowe (miesięczne składki ryczałt):");
    console.log(
      `   Low (mult 0.6):  ${this.round2(
        TAX_CONSTANTS.AVG_SALARY_Q4_PREV *
          TAX_CONSTANTS.HEALTH_RATE_RYCZALT *
          0.6
      )} PLN (oczekiwane: 498.35)`
    );
    console.log(
      `   Mid (mult 1.0):  ${this.round2(
        TAX_CONSTANTS.AVG_SALARY_Q4_PREV *
          TAX_CONSTANTS.HEALTH_RATE_RYCZALT *
          1.0
      )} PLN (oczekiwane: 830.58)`
    );
    console.log(
      `   High (mult 1.8): ${this.round2(
        TAX_CONSTANTS.AVG_SALARY_Q4_PREV *
          TAX_CONSTANTS.HEALTH_RATE_RYCZALT *
          1.8
      )} PLN (oczekiwane: 1495.04)\n`
    );

    console.log("5. Stałe pochodne:");
    console.log(`   TAX_BAND_12: ${TAX_BAND_12} (oczekiwane: 90000)`);
    console.log(`   TAX_BAND_32: ${TAX_BAND_32} (oczekiwane: 880000)`);
    console.log(
      `   PIT_RATE_SOLIDARITY: ${PIT_RATE_SOLIDARITY} (oczekiwane: 0.36)`
    );
    console.log(
      `   EFFECTIVE_LINEAR_RATE: ${EFFECTIVE_LINEAR_RATE} (oczekiwane: 0.239)`
    );
    console.log(
      `   EFFECTIVE_LINEAR_RATE_SOLIDARITY: ${EFFECTIVE_LINEAR_RATE_SOLIDARITY} (oczekiwane: 0.279)`
    );
    console.log(
      `   EFFECTIVE_IPBOX_PLUS_HEALTH: ${EFFECTIVE_IPBOX_PLUS_HEALTH} (oczekiwane: 0.099)\n`
    );

    console.log("=== KONIEC SANITY CHECK ===");
  },
};
