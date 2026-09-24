/**
 * KALKULATOR PODATKOWY 2026
 * Stan prawny: TAX_CONSTANTS.LEGAL_STATUS_DATE (rok podatkowy 2026; brak zmian
 * w trakcie roku wpływających na poniższe wartości).
 * Składka zdrowotna:
 * - skala, liniowy, IP BOX: rok składkowy 02.2026–01.2027 (od EFFECTIVE_FROM),
 *   który odpowiada dochodom ze stycznia–grudnia 2026;
 * - ryczałt: rok kalendarzowy, kwoty 2026 obowiązują od 1.01.2026.
 *
 * Źródła danych bazowych:
 * - MIN_WAGE (4806 PLN), Dz.U. 2025 poz. 1242: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001242
 * - AVG_SALARY_Q4_PREV (9228.64 PLN), M.P. 2026 poz. 117: https://monitorpolski.gov.pl/MP/2026/117
 * - Składka zdrowotna 2026 (ZUS): https://www.zus.pl/-/informacja-w-sprawie-podstawy-wymiaru-sk%C5%82adki-oraz-kwoty-sk%C5%82adki-na-ubezpieczenie-zdrowotne-w-2026-r.
 * - LINEAR_HEALTH_DEDUCTION_LIMIT (14100 PLN), M.P. 2025 poz. 1274: https://monitorpolski.gov.pl/MP/2025/1274
 * - Składki społeczne ZUS 2026 (ZUS, 30.12.2025): https://www.zus.pl/-/nowe-wysoko%C5%9Bci-sk%C5%82adek-na-ubezpieczenia-spo%C5%82eczne-w-2026-r.
 * - Ustawa o systemie ubezpieczeń społecznych, t.j. Dz.U. 2026 poz. 199: https://api.sejm.gov.pl/eli/acts/DU/2026/199/text.pdf
 * - Prawo przedsiębiorców (art. 18 – ulga na start), t.j. Dz.U. 2025 poz. 1480: https://api.sejm.gov.pl/eli/acts/DU/2025/1480/text.pdf
 */

const TAX_CONSTANTS = {
  // Data weryfikacji stanu prawnego (jedno źródło dla nagłówka, eksportu i „Założeń”)
  LEGAL_STATUS_DATE: "24.09.2026",

  // Początek roku składkowego 2026/27 dla skali, liniowego i IP BOX
  // (pełny rok liczony stawkami od lutego 2026; ryczałt wg roku kalendarzowego)
  EFFECTIVE_FROM: "2026-02-01",
  ASSUME_FULL_YEAR_FROM_FEB: true,

  // Dane z aktów/obwieszczeń
  // Minimalne wynagrodzenie 2026 (Dz.U. 2025 poz. 1242): https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001242
  MIN_WAGE: 4806, // PLN / miesiąc

  // GUS IV kw. 2025 (włącznie z wypłatami z zysku), M.P. 2026 poz. 117: https://monitorpolski.gov.pl/MP/2026/117
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
  // ZUS, składka zdrowotna 2026: https://www.zus.pl/-/informacja-w-sprawie-podstawy-wymiaru-sk%C5%82adki-oraz-kwoty-sk%C5%82adki-na-ubezpieczenie-zdrowotne-w-2026-r.
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

  // Składki społeczne ZUS przedsiębiorcy (JDG) – rok 2026
  // ZUS, nowe wysokości składek 2026: https://www.zus.pl/-/nowe-wysoko%C5%9Bci-sk%C5%82adek-na-ubezpieczenia-spo%C5%82eczne-w-2026-r.
  ZUS_YEAR: 2026, // rok, dla którego liczony jest harmonogram składek
  // Prognozowane przeciętne wynagrodzenie 2026 (M.P. 2025 poz. 1206; ustawa budżetowa 2026, Dz.U. 2026 poz. 62, art. 24)
  ZUS_FORECAST_AVG_SALARY: 9420, // PLN / miesiąc
  // Najniższa podstawa „pełnego” ZUS = 60% × 9420 (art. 18 ust. 8 u.s.u.s., Dz.U. 2026 poz. 199)
  ZUS_FULL_BASE: 5652, // PLN / miesiąc
  // Najniższa podstawa preferencyjna („mały ZUS”) = 30% × 4806 (art. 18a ust. 1 u.s.u.s.)
  ZUS_PREF_BASE: 1441.8, // PLN / miesiąc
  // Stopy składek (art. 22 ust. 1 u.s.u.s.; wypadkowa: art. 28 ust. 1 ustawy wypadkowej – płatnik do 9 ubezpieczonych)
  ZUS_RATE_PENSION: 0.1952, // emerytalna 19,52%
  ZUS_RATE_DISABILITY: 0.08, // rentowe 8%
  ZUS_RATE_SICKNESS: 0.0245, // chorobowa 2,45% (dobrowolna, art. 11 ust. 2)
  ZUS_RATE_ACCIDENT: 0.0167, // wypadkowa 1,67% (cały 2026)
  // Fundusz Pracy i Fundusz Solidarnościowy (ustawa budżetowa 2026 art. 25–26; art. 259–261 ustawy o rynku pracy,
  // Dz.U. 2025 poz. 620: https://api.sejm.gov.pl/eli/acts/DU/2025/620/text.pdf) – tylko przy podstawie ≥ MIN_WAGE
  ZUS_RATE_FP: 0.01, // Fundusz Pracy 1%
  ZUS_RATE_FS: 0.0145, // Fundusz Solidarnościowy 1,45%
  // Ulga na start: 6 miesięcy (art. 18 ust. 1 Prawa przedsiębiorców); preferencja: 24 miesiące (art. 18a, 18aa u.s.u.s.)
  ZUS_ULGA_MONTHS: 6,
  ZUS_PREF_MONTHS: 24,
  // Zwolnienie z FP/FS ze względu na wiek (art. 261 ustawy o rynku pracy): kobiety 55+, mężczyźni 60+
  ZUS_FP_EXEMPT_AGE_WOMEN: 55,
  ZUS_FP_EXEMPT_AGE_MEN: 60,
  // Wakacje składkowe (art. 17a–17b u.s.u.s.): wniosek w miesiącu poprzedzającym zwolnienie, a w miesiącu
  // przed złożeniem wniosku trzeba podlegać ubezpieczeniom → najwcześniej 2. miesiąc po pierwszym miesiącu podlegania
  ZUS_HOLIDAY_MIN_OFFSET: 2,
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
   * Art. 81 ust. 2b u.ś.o.z.: liczba miesięcy podlegania ubezpieczeniu
   * zdrowotnemu w roku × minimalne wynagrodzenie × 9%.
   * @param {number} [months=12] - liczba miesięcy podlegania w roku
   * @returns {number} składka roczna w PLN
   */
  getMinHealthAnnual(months = 12) {
    return this.round2(this.getMinHealthMonthly() * months); // 12 × 432.54 = 5190.48
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
   * Wyliczana jako miesięczna × liczba miesięcy (po zaokrągleniu miesięcznej).
   * Progi 60 000 / 300 000 są kwotowe (bez proporcji przy niepełnym roku),
   * art. 81 ust. 2e u.ś.o.z.
   * @param {number} revenueAnnual - przychód roczny w PLN (po pomniejszeniu z art. 81 ust. 2g)
   * @param {number} [months=12] - liczba miesięcy podlegania ubezpieczeniu zdrowotnemu
   * @returns {number} składka roczna w PLN
   */
  getRyczaltHealthAnnualForRevenue(revenueAnnual, months = 12) {
    return this.round2(
      this.getRyczaltHealthMonthlyForRevenue(revenueAnnual) * months
    );
  },

  /**
   * Oblicza składkę zdrowotną dla skali podatkowej
   * @param {number} income - dochód roczny (art. 81 ust. 2: po pomniejszeniu
   *   o składki społeczne niezaliczone do kosztów)
   * @param {number} [months=12] - liczba miesięcy podlegania (minimum)
   * @returns {number} składka roczna
   */
  calculateHealthScale(income, months = 12) {
    if (income > 0) {
      return Math.max(
        this.round2(TAX_CONSTANTS.HEALTH_RATE_SCALE * income),
        this.getMinHealthAnnual(months)
      );
    }
    return this.getMinHealthAnnual(months);
  },

  /**
   * Oblicza składkę zdrowotną dla podatku liniowego
   * @param {number} income - dochód roczny (po pomniejszeniu o składki
   *   społeczne niezaliczone do kosztów)
   * @param {number} [months=12] - liczba miesięcy podlegania (minimum)
   * @returns {number} składka roczna
   */
  calculateHealthLinear(income, months = 12) {
    if (income > 0) {
      return Math.max(
        this.round2(TAX_CONSTANTS.HEALTH_RATE_LINEAR * income),
        this.getMinHealthAnnual(months)
      );
    }
    return this.getMinHealthAnnual(months);
  },

  /* ------------------------------------------------------------------
     Składki społeczne ZUS – harmonogram miesięczny (rok ZUS_YEAR)
     Czysta arytmetyka kalendarzowa (bez new Date()), rok podany jawnie.
  ------------------------------------------------------------------ */

  /**
   * Czy rok jest przestępny (kalendarz gregoriański)
   * @param {number} year
   * @returns {boolean}
   */
  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },

  /**
   * Liczba dni w miesiącu
   * @param {number} year
   * @param {number} month - 1..12
   * @returns {number}
   */
  daysInMonth(year, month) {
    const days = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[month - 1];
  },

  /**
   * Parsuje datę w formacie RRRR-MM-DD (wartość pola <input type="date">)
   * @param {string} value
   * @returns {{y:number,m:number,d:number}|null} null dla pustej/nieprawidłowej daty
   */
  parseISODate(value) {
    if (typeof value !== "string") return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const y = Number(match[1]);
    const m = Number(match[2]);
    const d = Number(match[3]);
    if (m < 1 || m > 12 || d < 1 || d > this.daysInMonth(y, m)) return null;
    return { y, m, d };
  },

  /**
   * Numer miesiąca liczony ciągle (rok × 12 + miesiąc − 1) – ułatwia
   * arytmetykę okresów przechodzących przez granicę roku
   * @param {number} year
   * @param {number} month - 1..12
   * @returns {number}
   */
  monthIndex(year, month) {
    return year * 12 + (month - 1);
  },

  /**
   * Odwrotność monthIndex
   * @param {number} index
   * @returns {{y:number,m:number}}
   */
  monthFromIndex(index) {
    return { y: Math.floor(index / 12), m: (index % 12) + 1 };
  },

  /**
   * Miesiąc (monthIndex), od którego przedsiębiorca jest zwolniony z FP/FS
   * ze względu na wiek (art. 261 ustawy o rynku pracy): kobiety 55 lat,
   * mężczyźni 60 lat. Zwolnienie od miesiąca następującego po miesiącu
   * urodzin; przy urodzinach 1. dnia miesiąca – już od tego miesiąca
   * (poradnik ZUS „Zasady opłacania składek na FP…”, pkt 2.2).
   * @param {string|null} birthDate - RRRR-MM-DD
   * @param {"K"|"M"|null} sex
   * @returns {number|null} monthIndex albo null (brak danych = FP należny)
   */
  getFpExemptionMonthIndex(birthDate, sex) {
    const birth = this.parseISODate(birthDate);
    if (!birth || (sex !== "K" && sex !== "M")) return null;
    const age =
      sex === "K"
        ? TAX_CONSTANTS.ZUS_FP_EXEMPT_AGE_WOMEN
        : TAX_CONSTANTS.ZUS_FP_EXEMPT_AGE_MEN;
    const year = birth.y + age;
    let month = birth.m;
    let day = birth.d;
    if (day > this.daysInMonth(year, month)) {
      // 29 lutego w roku nieprzestępnym – wiek osiągany 1 marca
      month += 1;
      day = 1;
    }
    const index = this.monthIndex(year, month);
    return day === 1 ? index : index + 1;
  },

  /**
   * Składki społeczne od podanej podstawy (każda składka zaokrąglana
   * osobno do grosza, jak w deklaracji ZUS DRA). FP i FS liczone łącznie
   * (2,45%), tak jak wykazuje je ZUS.
   * @param {number} base - podstawa wymiaru (PLN)
   * @param {{sickness?: boolean, funds?: boolean}} [flags]
   * @returns {{pension:number, disability:number, sickness:number, accident:number, social:number, fpfs:number, total:number}}
   */
  getSocialContributionsForBase(base, flags = {}) {
    const C = TAX_CONSTANTS;
    const pension = this.round2(base * C.ZUS_RATE_PENSION);
    const disability = this.round2(base * C.ZUS_RATE_DISABILITY);
    const sickness = flags.sickness
      ? this.round2(base * C.ZUS_RATE_SICKNESS)
      : 0;
    const accident = this.round2(base * C.ZUS_RATE_ACCIDENT);
    const fundsRate =
      Math.round((C.ZUS_RATE_FP + C.ZUS_RATE_FS) * 1e6) / 1e6; // 0.0245
    const fpfs = flags.funds ? this.round2(base * fundsRate) : 0;
    const social = this.round2(pension + disability + sickness + accident);
    return {
      pension,
      disability,
      sickness,
      accident,
      social,
      fpfs,
      total: this.round2(social + fpfs),
    };
  },

  /**
   * Harmonogram składek społecznych ZUS na rok ZUS_YEAR (2026), miesiąc po miesiącu.
   *
   * Reguły (research_zus.md, SPEC_ZUS.md):
   * - brak daty rozpoczęcia = działalność prowadzona przed rokiem i przez cały rok:
   *   pełny ZUS od stycznia, 12 miesięcy składki zdrowotnej;
   * - ścieżka "ulga": ulga na start 6 mies. (start 1. dnia – ten miesiąc jest 1. z 6;
   *   start w trakcie miesiąca – niepełny miesiąc wolny + 6 pełnych), potem
   *   preferencyjny 24 pełne miesiące kalendarzowe, potem pełny (art. 18 Pr. przeds.,
   *   art. 18aa ust. 3 u.s.u.s.);
   * - ścieżka "pref": preferencyjny od dnia startu: niepełny pierwszy miesiąc +
   *   24 pełne miesiące (przy starcie 1. dnia: 24 miesiące od miesiąca startu),
   *   potem pełny (art. 18a ust. 1 u.s.u.s.);
   * - ścieżka "full": pełny ZUS od dnia startu;
   * - niepełny pierwszy miesiąc (bez ulgi): podstawa × dni podlegania / dni miesiąca
   *   (art. 18 ust. 9 u.s.u.s.);
   * - FP+FS tylko gdy podstawa miesięczna ≥ MIN_WAGE (pełny ZUS – także w niepełnym
   *   miesiącu, od podstawy proporcjonalnej) i brak zwolnienia wiekowego;
   * - umowa o pracę ≥ minimalnego: brak obowiązkowych składek społecznych z JDG
   *   (art. 9 ust. 1 i 1a u.s.u.s.);
   * - wakacje składkowe (art. 17a–17b): jeden miesiąc bez składek społecznych i FP/FS,
   *   najwcześniej 2. miesiąc po pierwszym miesiącu podlegania; wybierany miesiąc
   *   o najwyższej kwocie składek (przy remisie – najwcześniejszy);
   * - składka zdrowotna należna od miesiąca startu (także w uldze na start).
   *
   * @param {object} [options]
   * @param {boolean} [options.enabled=true] - czy uwzględniać składki ZUS
   * @param {string|null} [options.startDate=null] - data rozpoczęcia działalności RRRR-MM-DD
   * @param {"full"|"ulga"|"pref"} [options.path="full"] - ścieżka składek
   * @param {boolean} [options.sickness=true] - dobrowolna składka chorobowa
   * @param {boolean} [options.employment=false] - umowa o pracę z wynagrodzeniem ≥ minimalnego
   * @param {boolean} [options.holiday=false] - wakacje składkowe
   * @param {string|null} [options.birthDate=null] - data urodzenia RRRR-MM-DD (zwolnienie z FP)
   * @param {"K"|"M"|null} [options.sex=null] - płeć (zwolnienie z FP)
   * @returns {object} harmonogram: months[12], totals, healthMonths, holiday, okresy
   */
  buildSocialSchedule(options = {}) {
    const C = TAX_CONSTANTS;
    const opts = {
      enabled: true,
      startDate: null,
      path: "full",
      sickness: true,
      employment: false,
      holiday: false,
      birthDate: null,
      sex: null,
      ...options,
    };
    const year = C.ZUS_YEAR;
    const firstIdx = this.monthIndex(year, 1);
    const lastIdx = this.monthIndex(year, 12);
    // Data rozpoczęcia zawsze wyznacza miesiące składki zdrowotnej (także
    // gdy składki społeczne są wyłączone – SPEC, addendum A3)
    const start = this.parseISODate(opts.startDate);
    const startIdx = start ? this.monthIndex(start.y, start.m) : null;
    const midMonthStart = !!start && start.d !== 1;
    const path = start && ["full", "ulga", "pref"].includes(opts.path)
      ? opts.path
      : "full";

    let ulgaEndIdx = null;
    let prefEndIdx = null;
    if (opts.enabled && start && path === "ulga") {
      ulgaEndIdx = startIdx + C.ZUS_ULGA_MONTHS - 1 + (midMonthStart ? 1 : 0);
      prefEndIdx = ulgaEndIdx + C.ZUS_PREF_MONTHS;
    } else if (opts.enabled && start && path === "pref") {
      prefEndIdx = startIdx + C.ZUS_PREF_MONTHS - 1 + (midMonthStart ? 1 : 0);
    }

    // Pierwszy miesiąc podlegania ubezpieczeniom społecznym z JDG
    // (-Infinity = podlega od przed rozpoczęcia roku)
    let firstSocialIdx = null;
    if (opts.enabled && !opts.employment) {
      if (!start) firstSocialIdx = -Infinity;
      else if (path === "ulga") firstSocialIdx = ulgaEndIdx + 1;
      else firstSocialIdx = startIdx;
    }

    const fpExemptFromIdx = this.getFpExemptionMonthIndex(
      opts.birthDate,
      opts.sex
    );

    const months = [];
    for (let month = 1; month <= 12; month++) {
      const idx = this.monthIndex(year, month);
      const dim = this.daysInMonth(year, month);
      let regime;
      let health = true;
      if (startIdx !== null && idx < startIdx) {
        regime = "inactive";
        health = false;
      } else if (!opts.enabled) regime = "off";
      else if (opts.employment) regime = "employment";
      else if (ulgaEndIdx !== null && idx <= ulgaEndIdx) regime = "ulga";
      else if (prefEndIdx !== null && idx <= prefEndIdx) regime = "pref";
      else regime = "full";

      const entry = {
        month,
        regime,
        health,
        partial: false,
        days: dim,
        daysInMonth: dim,
        monthlyBase: 0,
        base: 0,
        pension: 0,
        disability: 0,
        sickness: 0,
        accident: 0,
        social: 0,
        fpfs: 0,
        total: 0,
        fpDue: false,
        fpExempt: false,
        holiday: false,
      };

      if (regime === "pref" || regime === "full") {
        const monthlyBase =
          regime === "pref" ? C.ZUS_PREF_BASE : C.ZUS_FULL_BASE;
        const partial = midMonthStart && idx === startIdx;
        const days = partial ? dim - start.d + 1 : dim;
        const base = partial
          ? this.round2((monthlyBase * days) / dim)
          : monthlyBase;
        // FP: podstawa w przeliczeniu na miesiąc ≥ minimalnego wynagrodzenia
        const fpDue = monthlyBase >= C.MIN_WAGE;
        const fpExempt =
          fpDue && fpExemptFromIdx !== null && idx >= fpExemptFromIdx;
        Object.assign(entry, {
          partial,
          days,
          monthlyBase,
          base,
          fpDue,
          fpExempt,
          ...this.getSocialContributionsForBase(base, {
            sickness: opts.sickness,
            funds: fpDue && !fpExempt,
          }),
        });
      }
      months.push(entry);
    }

    // Wakacje składkowe: ustalamy miesiące, za które zwolnienie przysługuje.
    // Domyślnie stosujemy miesiąc o najwyższej kwocie składek (przy remisie
    // najwcześniejszy); kalkulator wybiera miesiąc osobno dla każdego wariantu
    // (applySocialHoliday).
    const holiday = {
      requested: !!opts.holiday,
      applied: false,
      declined: false,
      month: null,
      saving: 0,
      reason: null,
      eligibleMonths: [],
      firstSocialMonth:
        firstSocialIdx !== null && Number.isFinite(firstSocialIdx)
          ? this.monthFromIndex(firstSocialIdx)
          : null,
      earliestMonth: null,
    };
    let defaultHolidayMonth = null;
    if (holiday.requested) {
      if (!opts.enabled) holiday.reason = "disabled";
      else if (opts.employment) holiday.reason = "employment";
      else {
        const earliestIdx = firstSocialIdx + C.ZUS_HOLIDAY_MIN_OFFSET;
        holiday.earliestMonth = Number.isFinite(earliestIdx)
          ? this.monthFromIndex(earliestIdx)
          : null;
        let best = null;
        months.forEach((entry) => {
          const idx = this.monthIndex(year, entry.month);
          if (entry.regime !== "pref" && entry.regime !== "full") return;
          if (idx < earliestIdx || entry.total <= 0) return;
          holiday.eligibleMonths.push(entry.month);
          if (!best || entry.total > best.total) best = entry;
        });
        if (best) defaultHolidayMonth = best.month;
        else holiday.reason = earliestIdx > lastIdx ? "too-late" : "no-month";
      }
    }

    const toMonth = (idx) =>
      idx === null ? null : this.monthFromIndex(idx);

    const schedule = {
      year,
      enabled: !!opts.enabled,
      employment: !!(opts.enabled && opts.employment),
      sicknessEnabled: !!opts.sickness,
      path,
      startDate: start,
      startsBeforeYear: startIdx !== null && startIdx < firstIdx,
      startsAfterYear: startIdx !== null && startIdx > lastIdx,
      ulgaEnd: toMonth(ulgaEndIdx),
      prefEnd: toMonth(prefEndIdx),
      fpExemptFrom: toMonth(fpExemptFromIdx),
      months,
      totals: this.sumSocialTotals(months),
      healthMonths: months.filter((entry) => entry.health).length,
      holiday,
    };
    return defaultHolidayMonth === null
      ? schedule
      : this.applySocialHoliday(schedule, defaultHolidayMonth);
  },

  /**
   * Sumy roczne harmonogramu (zaokrąglone do grosza)
   * @param {Array<object>} months - pozycje harmonogramu
   * @returns {{pension:number, disability:number, sickness:number, accident:number, social:number, fpfs:number, total:number}}
   */
  sumSocialTotals(months) {
    const keys = [
      "pension",
      "disability",
      "sickness",
      "accident",
      "social",
      "fpfs",
      "total",
    ];
    const totals = {};
    keys.forEach((key) => {
      totals[key] = this.round2(
        months.reduce((sum, entry) => sum + entry[key], 0)
      );
    });
    return totals;
  },

  /**
   * Zwraca kopię harmonogramu z wakacjami składkowymi w podanym miesiącu
   * (month = null – bez korzystania z wakacji). Miesiąc musi być na liście
   * holiday.eligibleMonths; w przeciwnym razie wakacje nie są stosowane.
   * Za miesiąc zwolnienia nie płaci się składek społecznych ani FP/FS
   * (art. 17a u.s.u.s.; art. 259 ust. 1 pkt 4 lit. o ustawy o rynku pracy).
   * @param {object} schedule - wynik buildSocialSchedule
   * @param {number|null} month - 1..12 albo null
   * @returns {object} nowy harmonogram
   */
  applySocialHoliday(schedule, month) {
    const amountKeys = [
      "pension",
      "disability",
      "sickness",
      "accident",
      "social",
      "fpfs",
      "total",
    ];
    const months = schedule.months.map((entry) => {
      const copy = { ...entry };
      if (copy.holiday && copy.waived) Object.assign(copy, copy.waived);
      copy.holiday = false;
      delete copy.waived;
      return copy;
    });
    let saving = 0;
    const eligible = schedule.holiday.eligibleMonths || [];
    if (month !== null && eligible.includes(month)) {
      const target = months[month - 1];
      target.waived = {};
      amountKeys.forEach((key) => {
        target.waived[key] = target[key];
        target[key] = 0;
      });
      target.holiday = true;
      saving = target.waived.total;
    }
    return {
      ...schedule,
      months,
      totals: this.sumSocialTotals(months),
      holiday: {
        ...schedule.holiday,
        applied: saving > 0,
        declined: month === null && eligible.length > 0,
        month: saving > 0 ? month : null,
        saving,
      },
    };
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
