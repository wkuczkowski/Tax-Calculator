/**
 * KALKULATOR PODATKOWY – stałe na lata podatkowe (2026, 2027)
 *
 * Każdy rok ma własny, zamrożony zestaw stałych (TAX_CONSTANTS_BY_YEAR) i
 * metadane każdej stałej (TAX_CONSTANTS_META_BY_YEAR):
 * - status: "final" (wartość z ogłoszonego aktu / obowiązujących przepisów),
 *   "forecast" (prognoza albo nasze wyliczenie – akt jeszcze nie wydany),
 *   "draft" (wartość z projektu ustawy);
 * - source: akt, obwieszczenie albo metoda wyliczenia;
 * - finalBy: kiedy wartość stanie się ostateczna (dla forecast / draft).
 * Scenariusze (TAX_SCENARIOS) to nakładki na stałe jednego roku, np.
 * „Projekt zmian 2027 (UD458 + UD116)” – domyślnie wyłączone.
 *
 * Aktywny zestaw stałych (TAX_CONSTANTS) wybiera warstwa UI (script.js)
 * funkcją taxYears.setActive(rok, scenariusz). Funkcje obliczeń (taxMath,
 * script.js) czytają wyłącznie TAX_CONSTANTS – bez wartości zaszytych na
 * konkretny rok. Data „dzisiaj” nie występuje w obliczeniach: regułę roku
 * domyślnego (taxYears.getDefaultYear) wywołuje UI z datą jako parametrem.
 *
 * Rok 2026 – stan prawny 24.09.2026 (brak zmian w trakcie roku
 * wpływających na poniższe wartości). Składka zdrowotna:
 * - skala, liniowy, IP BOX: rok składkowy 02.2026–01.2027 (od EFFECTIVE_FROM),
 *   który odpowiada dochodom ze stycznia–grudnia 2026;
 * - ryczałt: rok kalendarzowy, kwoty 2026 obowiązują od 1.01.2026.
 * Źródła danych bazowych 2026:
 * - MIN_WAGE (4806 PLN), Dz.U. 2025 poz. 1242: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001242
 * - AVG_SALARY_Q4_PREV (9228.64 PLN), M.P. 2026 poz. 117: https://monitorpolski.gov.pl/MP/2026/117
 * - Składka zdrowotna 2026 (ZUS): https://www.zus.pl/-/informacja-w-sprawie-podstawy-wymiaru-sk%C5%82adki-oraz-kwoty-sk%C5%82adki-na-ubezpieczenie-zdrowotne-w-2026-r.
 * - LINEAR_HEALTH_DEDUCTION_LIMIT (14100 PLN), M.P. 2025 poz. 1274: https://monitorpolski.gov.pl/MP/2025/1274
 * - Składki społeczne ZUS 2026 (ZUS, 30.12.2025): https://www.zus.pl/-/nowe-wysoko%C5%9Bci-sk%C5%82adek-na-ubezpieczenia-spo%C5%82eczne-w-2026-r.
 * - Ustawa o systemie ubezpieczeń społecznych, t.j. Dz.U. 2026 poz. 199: https://api.sejm.gov.pl/eli/acts/DU/2026/199/text.pdf
 * - Prawo przedsiębiorców (art. 18 – ulga na start), t.j. Dz.U. 2025 poz. 1480: https://api.sejm.gov.pl/eli/acts/DU/2025/1480/text.pdf
 *
 * Rok 2027 – stan na 25.09.2026, raporty docs/prawo/research-2027.md
 * (stałe, statusy) i docs/prawo/research-2027-reformy.md (UD458/UD116).
 */

/* ==================================================
   Stałe roku 2026
================================================== */
const TAX_CONSTANTS_2026 = {
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

  // Minimalna składka zdrowotna za styczeń 2026 (ostatni miesiąc roku
  // składkowego 2025/26). Tylko do opisu uproszczenia: kalkulator stosuje
  // za cały rok kwotę 9% × MIN_WAGE (zob. taxMath.getMinHealthMonthly).
  HEALTH_MIN_MONTHLY_JANUARY: 314.96, // PLN / miesiąc

  // Skala podatkowa (art. 27 ust. 1 ustawy o PIT). Przedziały: from = dolna
  // granica podstawy („ponad”), rate = stawka w przedziale. Kwota zmniejszająca
  // podatek odejmowana w pierwszym przedziale i wliczona w kwoty bazowe
  // wyższych przedziałów (np. 12% × 120 000 − 3 600 = 10 800 zł).
  TAX_FREE_AMOUNT: 30000, // Kwota wolna od podatku (3 600 / 12%)
  PIT_SCALE_BANDS: [
    { from: 0, rate: 0.12 },
    { from: 120000, rate: 0.32 },
  ],
  TAX_DECREASING_AMOUNT: 3600, // 30000 * 12% - kwota zmniejszająca podatek

  // Danina solidarnościowa (art. 30h ustawy o PIT)
  SOLIDARITY_THRESHOLD: 1000000, // Próg daniny solidarnościowej
  SOLIDARITY_RATE: 0.04, // Danina solidarnościowa 4%
  // Czy dochód kwalifikowany IP BOX (art. 30ca) wchodzi do podstawy daniny
  // (obecnie nie – art. 30h ust. 2, katalog zamknięty; projekt UD116: tak)
  SOLIDARITY_INCLUDES_IP_BOX: false,

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

  // Ryczałt – reguły z projektu UD458 (null = nie dotyczy w obowiązujących
  // przepisach; limit 2 mln EUR z art. 6 ust. 4 nie jest sprawdzany):
  RYCZALT_ELIGIBILITY_LIMIT_EUR: null, // limit przychodu z roku poprzedniego
  RYCZALT_HIGH_RATE_THRESHOLD_EUR: null, // próg przychodu w roku, ponad który stawka RYCZALT_HIGH_RATE
  RYCZALT_HIGH_RATE: null,
  EUR_PLN_RATE: null, // kurs średni NBP z 1. dnia roboczego października roku poprzedniego (art. 4 ust. 2)

  // Składki społeczne ZUS przedsiębiorcy (JDG) – rok 2026
  // ZUS, nowe wysokości składek 2026: https://www.zus.pl/-/nowe-wysoko%C5%9Bci-sk%C5%82adek-na-ubezpieczenia-spo%C5%82eczne-w-2026-r.
  ZUS_YEAR: 2026, // rok, dla którego liczony jest harmonogram składek (= rok podatkowy)
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
   Stałe roku 2027 (obowiązujące przepisy + kwoty na 2027 r.)
   Tylko wartości, które zmieniają się względem 2026; statusy i źródła –
   TAX_CONSTANTS_META_BY_YEAR[2027]. Zmiany z projektów UD458/UD116 są
   w scenariuszu TAX_SCENARIOS.reform2027 (domyślnie wyłączonym).
================================================== */
const TAX_CONSTANTS_2027 = {
  ...TAX_CONSTANTS_2026,
  LEGAL_STATUS_DATE: "25.09.2026",
  // Rok składkowy 02.2027–01.2028 (art. 81 u.ś.o.z.)
  EFFECTIVE_FROM: "2027-02-01",
  // Minimalne wynagrodzenie 2027: rozporządzenie RM, Dz.U. 2026 poz. 1213 (final)
  MIN_WAGE: 4950,
  // PROGNOZA: ok. 9 720 zł – IV kw. 2025 (9228,64) × dynamika r/r z II kw.
  // 2026 (9396,33 / 8919,94; M.P. 2026 poz. 720 i M.P. 2025 poz. 688) =
  // 9721,52, przyjęte w zaokrągleniu (widełki 9 650–9 800); składka ryczałtu
  // 524,88 / 874,80 / 1574,64; ostatecznie: obwieszczenie Prezesa GUS
  // ok. 20–22.01.2027
  AVG_SALARY_Q4_PREV: 9720,
  // PROGNOZA: 14 100 × (30 × 10 033) / (30 × 9 420) = 15 017,55 → w górę do
  // 100 zł (art. 30c ust. 2b ustawy o PIT); obwieszczenie MF do 31.12.2026
  LINEAR_HEALTH_DEDUCTION_LIMIT: 15100,
  // Styczeń 2027 = ostatni miesiąc roku składkowego 2026/27: 9% × 4806
  HEALTH_MIN_MONTHLY_JANUARY: 432.54,
  ZUS_YEAR: 2027,
  // PROGNOZA: projekt ustawy budżetowej na 2027 r., art. 24; obwieszczenie MRPiPS ok. XI 2026
  ZUS_FORECAST_AVG_SALARY: 10033,
  ZUS_FULL_BASE: 6019.8, // 60% × 10 033 (art. 18 ust. 8 u.s.u.s.)
  ZUS_PREF_BASE: 1485, // 30% × 4950 (art. 18a ust. 1 u.s.u.s.)
  // Wypadkowa 1,67%: do 03.2027 obowiązująca, od 04.2027 prognoza (bez zmian)
  // FP 1% / FS 1,45%: projekt ustawy budżetowej na 2027 r., art. 25–26 (prognoza)
};

const TAX_CONSTANTS_BY_YEAR = {
  2026: TAX_CONSTANTS_2026,
  2027: TAX_CONSTANTS_2027,
};

/* ==================================================
   Metadane stałych: opis (wspólny) + status / źródło / termin (per rok)
================================================== */
// group – sekcja tabeli w oknie „Założenia”; format – sposób wyświetlenia;
// hidden – stała techniczna (nie pokazujemy w tabeli)
const TAX_CONSTANT_LABELS = {
  LEGAL_STATUS_DATE: { group: "period", label: "Stan prawny na dzień", format: "text" },
  EFFECTIVE_FROM: {
    group: "period",
    label: "Początek roku składkowego (składka zdrowotna: skala, liniowy, IP BOX)",
    format: "date",
  },
  ASSUME_FULL_YEAR_FROM_FEB: { group: "period", label: "Stawki roku składkowego stosowane do całego roku", format: "bool", hidden: true },
  ZUS_YEAR: { group: "period", label: "Rok harmonogramu składek", format: "int", hidden: true },
  MIN_WAGE: { group: "base", label: "Minimalne wynagrodzenie (miesięcznie)", format: "pln" },
  AVG_SALARY_Q4_PREV: {
    short: "przeciętne wynagrodzenie z IV kw. (zdrowotna na ryczałcie)",
    group: "base",
    label: "Przeciętne wynagrodzenie w IV kw. roku poprzedniego (z wypłatami z zysku; składka zdrowotna na ryczałcie)",
    format: "pln",
  },
  LINEAR_HEALTH_DEDUCTION_LIMIT: { group: "base", short: "limit odliczenia zdrowotnej (liniowy)", label: "Limit odliczenia składki zdrowotnej (liniowy, rocznie)", format: "pln" },
  HEALTH_MIN_MONTHLY_JANUARY: {
    group: "base",
    label: "Minimalna składka zdrowotna za styczeń (koniec poprzedniego roku składkowego) — tylko informacyjnie",
    format: "pln",
  },
  TAX_FREE_AMOUNT: { group: "scale", label: "Kwota wolna od podatku", format: "pln" },
  PIT_SCALE_BANDS: { group: "scale", label: "Skala podatkowa — przedziały i stawki", format: "bands" },
  TAX_DECREASING_AMOUNT: { group: "scale", label: "Kwota zmniejszająca podatek", format: "pln" },
  SOLIDARITY_THRESHOLD: { group: "scale", label: "Próg daniny solidarnościowej", format: "pln" },
  SOLIDARITY_RATE: { group: "scale", label: "Danina solidarnościowa", format: "percent" },
  SOLIDARITY_INCLUDES_IP_BOX: { group: "scale", label: "Dochód kwalifikowany IP BOX w podstawie daniny", format: "bool" },
  LINEAR_PIT_RATE: { group: "linear", label: "Stawka podatku liniowego", format: "percent" },
  IP_BOX_RATE: { group: "linear", label: "Stawka IP BOX", format: "percent" },
  HEALTH_RATE_SCALE: { group: "health", label: "Składka zdrowotna — skala podatkowa", format: "percent" },
  HEALTH_RATE_LINEAR: { group: "health", label: "Składka zdrowotna — podatek liniowy", format: "percent" },
  HEALTH_RATE_RYCZALT: { group: "health", label: "Składka zdrowotna — ryczałt", format: "percent" },
  RYCZALT_REVENUE_THRESHOLD_LOW: { group: "health", label: "Ryczałt: próg niski przychodu (składka zdrowotna)", format: "pln" },
  RYCZALT_REVENUE_THRESHOLD_HIGH: { group: "health", label: "Ryczałt: próg wysoki przychodu (składka zdrowotna)", format: "pln" },
  RYCZALT_BASE_MULT_LOW: { group: "health", label: "Ryczałt: mnożnik podstawy (przychód ≤ próg niski)", format: "mult" },
  RYCZALT_BASE_MULT_MID: { group: "health", label: "Ryczałt: mnożnik podstawy (próg niski < przychód ≤ próg wysoki)", format: "mult" },
  RYCZALT_BASE_MULT_HIGH: { group: "health", label: "Ryczałt: mnożnik podstawy (przychód > próg wysoki)", format: "mult" },
  RYCZALT_HEALTH_DEDUCTION_FACTOR: { group: "health", label: "Ryczałt: odliczenie składki zdrowotnej od przychodu", format: "percent" },
  RYCZALT_8_5_THRESHOLD: { group: "ryczalt", label: "Próg stawki 8,5% / 12,5%", format: "pln" },
  RYCZALT_RATE_2: { group: "ryczalt", label: "Ryczałt 2%", format: "percent" },
  RYCZALT_RATE_3: { group: "ryczalt", label: "Ryczałt 3%", format: "percent" },
  RYCZALT_RATE_5_5: { group: "ryczalt", label: "Ryczałt 5,5%", format: "percent" },
  RYCZALT_RATE_8_5: { group: "ryczalt", label: "Ryczałt 8,5%", format: "percent" },
  RYCZALT_RATE_10: { group: "ryczalt", label: "Ryczałt 10%", format: "percent" },
  RYCZALT_RATE_12: { group: "ryczalt", label: "Ryczałt 12%", format: "percent" },
  RYCZALT_RATE_12_5: { group: "ryczalt", label: "Ryczałt 12,5%", format: "percent" },
  RYCZALT_RATE_14: { group: "ryczalt", label: "Ryczałt 14%", format: "percent" },
  RYCZALT_RATE_15: { group: "ryczalt", label: "Ryczałt 15%", format: "percent" },
  RYCZALT_RATE_17: { group: "ryczalt", label: "Ryczałt 17%", format: "percent" },
  RYCZALT_ELIGIBILITY_LIMIT_EUR: {
    group: "ryczalt",
    label: "Limit prawa do ryczałtu (przychód z roku poprzedniego)",
    format: "eur",
  },
  RYCZALT_HIGH_RATE_THRESHOLD_EUR: {
    group: "ryczalt",
    label: "Próg przychodu w roku, ponad który ryczałt wynosi 17%",
    format: "eur",
  },
  RYCZALT_HIGH_RATE: { group: "ryczalt", label: "Stawka od nadwyżki przychodu ponad próg", format: "percent" },
  EUR_PLN_RATE: {
    short: "kurs EUR (limity ryczałtu)",
    group: "ryczalt",
    label: "Kurs EUR do limitów ryczałtu (średni NBP, 1. dzień roboczy października roku poprzedniego)",
    format: "fx",
  },
  ZUS_FORECAST_AVG_SALARY: { group: "zus", short: "prognozowane przeciętne wynagrodzenie", label: "Prognozowane przeciętne wynagrodzenie (podstawa pełnego ZUS)", format: "pln" },
  ZUS_FULL_BASE: { group: "zus", short: "podstawa pełnego ZUS", label: "Podstawa pełnego ZUS (60% prognozowanego wynagrodzenia)", format: "pln" },
  ZUS_PREF_BASE: { group: "zus", label: "Podstawa małego ZUS (30% minimalnego wynagrodzenia)", format: "pln" },
  ZUS_RATE_PENSION: { group: "zus", label: "Składka emerytalna", format: "percent" },
  ZUS_RATE_DISABILITY: { group: "zus", label: "Składki rentowe", format: "percent" },
  ZUS_RATE_SICKNESS: { group: "zus", label: "Składka chorobowa (dobrowolna)", format: "percent" },
  ZUS_RATE_ACCIDENT: { group: "zus", short: "składka wypadkowa od IV", label: "Składka wypadkowa (płatnik do 9 ubezpieczonych)", format: "percent" },
  ZUS_RATE_FP: { group: "zus", short: "Fundusz Pracy", label: "Fundusz Pracy", format: "percent" },
  ZUS_RATE_FS: { group: "zus", short: "Fundusz Solidarnościowy", label: "Fundusz Solidarnościowy", format: "percent" },
  ZUS_ULGA_MONTHS: { group: "zus", label: "Ulga na start (miesiące)", format: "int" },
  ZUS_PREF_MONTHS: { group: "zus", label: "Mały ZUS (miesiące kalendarzowe)", format: "int" },
  ZUS_FP_EXEMPT_AGE_WOMEN: { group: "zus", label: "Zwolnienie z FP/FS — wiek kobiety", format: "years" },
  ZUS_FP_EXEMPT_AGE_MEN: { group: "zus", label: "Zwolnienie z FP/FS — wiek mężczyźni", format: "years" },
  ZUS_HOLIDAY_MIN_OFFSET: {
    group: "zus",
    label: "Wakacje składkowe — najwcześniej miesiąc po pierwszym miesiącu podlegania",
    format: "int",
  },
};

const TAX_CONSTANT_GROUPS = {
  period: "Okres i stan prawny",
  base: "Wartości bazowe",
  scale: "Skala podatkowa i danina solidarnościowa",
  linear: "Podatek liniowy i IP BOX",
  health: "Składka zdrowotna",
  ryczalt: "Ryczałt",
  zus: "Składki społeczne ZUS",
};

const TAX_STATUS_LABELS = {
  final: "ostateczna",
  forecast: "prognoza",
  draft: "projekt",
};

// Pomocnicze konstruktory metadanych
function finalMeta(source, extra = {}) {
  return { status: "final", source, finalBy: null, ...extra };
}
function forecastMeta(source, finalBy, extra = {}) {
  return { status: "forecast", source, finalBy, ...extra };
}
function draftMeta(source, finalBy, extra = {}) {
  return { status: "draft", source, finalBy, ...extra };
}

const META_PIT = "art. 27 ust. 1 ustawy o PIT (t.j. Dz.U. 2026 poz. 592)";
const META_RYCZALT = "art. 12 ust. 1 ustawy o ryczałcie (t.j. Dz.U. 2025 poz. 843)";
const META_USUS = "u.s.u.s. (t.j. Dz.U. 2026 poz. 199)";
const META_UZDR = "u.ś.o.z. (t.j. Dz.U. 2025 poz. 1461)";

// Metadane wspólne dla obu lat (przepisy bez zmian na 2027 r.)
const TAX_CONSTANTS_META_COMMON = {
  ASSUME_FULL_YEAR_FROM_FEB: finalMeta("założenie kalkulatora (rok składkowy stosowany do całego roku podatkowego)"),
  TAX_FREE_AMOUNT: finalMeta(`${META_PIT} (3 600 zł / 12%)`),
  PIT_SCALE_BANDS: finalMeta(META_PIT),
  TAX_DECREASING_AMOUNT: finalMeta(META_PIT),
  SOLIDARITY_THRESHOLD: finalMeta("art. 30h ust. 2 ustawy o PIT"),
  SOLIDARITY_RATE: finalMeta("art. 30h ust. 1 ustawy o PIT"),
  SOLIDARITY_INCLUDES_IP_BOX: finalMeta(
    "art. 30h ust. 2 ustawy o PIT (zamknięty katalog: art. 27, 30b, 30c, 30f); KIS 0112-KDIL2-1.4011.110.2019.1.AMN",
  ),
  LINEAR_PIT_RATE: finalMeta("art. 30c ust. 1 ustawy o PIT"),
  IP_BOX_RATE: finalMeta("art. 30ca ust. 1 ustawy o PIT"),
  HEALTH_RATE_SCALE: finalMeta(`art. 79 ust. 1 ${META_UZDR}`),
  HEALTH_RATE_LINEAR: finalMeta("art. 79a u.ś.o.z."),
  HEALTH_RATE_RYCZALT: finalMeta("art. 79 ust. 1 i art. 81 ust. 2e u.ś.o.z."),
  RYCZALT_REVENUE_THRESHOLD_LOW: finalMeta("art. 81 ust. 2e pkt 1 u.ś.o.z."),
  RYCZALT_REVENUE_THRESHOLD_HIGH: finalMeta("art. 81 ust. 2e pkt 2–3 u.ś.o.z."),
  RYCZALT_BASE_MULT_LOW: finalMeta("art. 81 ust. 2e pkt 1 u.ś.o.z."),
  RYCZALT_BASE_MULT_MID: finalMeta("art. 81 ust. 2e pkt 2 u.ś.o.z."),
  RYCZALT_BASE_MULT_HIGH: finalMeta("art. 81 ust. 2e pkt 3 u.ś.o.z."),
  RYCZALT_HEALTH_DEDUCTION_FACTOR: finalMeta("art. 11 ust. 1a ustawy o ryczałcie (t.j. Dz.U. 2025 poz. 843)"),
  RYCZALT_8_5_THRESHOLD: finalMeta("art. 12 ust. 1 pkt 4 lit. a ustawy o ryczałcie"),
  RYCZALT_RATE_2: finalMeta(META_RYCZALT),
  RYCZALT_RATE_3: finalMeta(META_RYCZALT),
  RYCZALT_RATE_5_5: finalMeta(META_RYCZALT),
  RYCZALT_RATE_8_5: finalMeta(META_RYCZALT),
  RYCZALT_RATE_10: finalMeta(META_RYCZALT),
  RYCZALT_RATE_12: finalMeta(META_RYCZALT),
  RYCZALT_RATE_12_5: finalMeta(META_RYCZALT),
  RYCZALT_RATE_14: finalMeta(META_RYCZALT),
  RYCZALT_RATE_15: finalMeta(META_RYCZALT),
  RYCZALT_RATE_17: finalMeta(META_RYCZALT),
  RYCZALT_ELIGIBILITY_LIMIT_EUR: finalMeta("nie dotyczy (obowiązujące przepisy: 2 mln EUR, art. 6 ust. 4 ustawy o ryczałcie – kalkulator nie sprawdza)"),
  RYCZALT_HIGH_RATE_THRESHOLD_EUR: finalMeta("nie dotyczy (obowiązujące przepisy)"),
  RYCZALT_HIGH_RATE: finalMeta("nie dotyczy (obowiązujące przepisy)"),
  EUR_PLN_RATE: finalMeta("nie dotyczy (obowiązujące przepisy)"),
  ZUS_RATE_PENSION: finalMeta(`art. 22 ust. 1 pkt 1 ${META_USUS}`),
  ZUS_RATE_DISABILITY: finalMeta("art. 22 ust. 1 pkt 2 u.s.u.s."),
  ZUS_RATE_SICKNESS: finalMeta("art. 22 ust. 1 pkt 3 u.s.u.s.; art. 11 ust. 2 (dobrowolna)"),
  ZUS_ULGA_MONTHS: finalMeta("art. 18 ust. 1 Prawa przedsiębiorców (t.j. Dz.U. 2025 poz. 1480)"),
  ZUS_PREF_MONTHS: finalMeta("art. 18a ust. 1 i art. 18aa ust. 3 u.s.u.s."),
  ZUS_FP_EXEMPT_AGE_WOMEN: finalMeta("art. 261 ustawy o rynku pracy (Dz.U. 2025 poz. 620)"),
  ZUS_FP_EXEMPT_AGE_MEN: finalMeta("art. 261 ustawy o rynku pracy (Dz.U. 2025 poz. 620)"),
  ZUS_HOLIDAY_MIN_OFFSET: finalMeta("art. 17a–17b u.s.u.s. (wniosek RWS w miesiącu poprzedzającym zwolnienie)"),
};

const TAX_CONSTANTS_META_BY_YEAR = {
  2026: {
    ...TAX_CONSTANTS_META_COMMON,
    LEGAL_STATUS_DATE: finalMeta("weryfikacja stanu prawnego (docs/prawo/research-zus-2026.md)"),
    EFFECTIVE_FROM: finalMeta("art. 81 ust. 1a i 2e u.ś.o.z. (rok składkowy od 1.02.2026)"),
    ZUS_YEAR: finalMeta("rok podatkowy 2026"),
    MIN_WAGE: finalMeta("rozporządzenie RM, Dz.U. 2025 poz. 1242"),
    AVG_SALARY_Q4_PREV: finalMeta("komunikat Prezesa GUS, M.P. 2026 poz. 117"),
    LINEAR_HEALTH_DEDUCTION_LIMIT: finalMeta("art. 30c ust. 2 pkt 2 ustawy o PIT; M.P. 2025 poz. 1274"),
    HEALTH_MIN_MONTHLY_JANUARY: finalMeta("art. 81 ust. 2b u.ś.o.z. (rok składkowy 2025/26)"),
    ZUS_FORECAST_AVG_SALARY: finalMeta("M.P. 2025 poz. 1206; ustawa budżetowa na 2026 r. (Dz.U. 2026 poz. 62), art. 24"),
    ZUS_FULL_BASE: finalMeta("art. 18 ust. 8 u.s.u.s. (60% × 9 420 zł)"),
    ZUS_PREF_BASE: finalMeta("art. 18a ust. 1 u.s.u.s. (30% × 4 806 zł)"),
    ZUS_RATE_ACCIDENT: finalMeta("art. 28 ust. 1 ustawy o ubezpieczeniu społecznym z tytułu wypadków przy pracy (cały 2026 r.)"),
    ZUS_RATE_FP: finalMeta("art. 259–261 ustawy o rynku pracy (Dz.U. 2025 poz. 620); ustawa budżetowa na 2026 r. (Dz.U. 2026 poz. 62), art. 25"),
    ZUS_RATE_FS: finalMeta("ustawa budżetowa na 2026 r. (Dz.U. 2026 poz. 62), art. 26"),
  },
  2027: {
    ...TAX_CONSTANTS_META_COMMON,
    LEGAL_STATUS_DATE: finalMeta("docs/prawo/research-2027.md, docs/prawo/research-2027-reformy.md"),
    EFFECTIVE_FROM: finalMeta("art. 81 u.ś.o.z. (rok składkowy od 1.02.2027)"),
    ZUS_YEAR: finalMeta("rok podatkowy 2027"),
    MIN_WAGE: finalMeta("rozporządzenie RM z 14.09.2026, Dz.U. 2026 poz. 1213"),
    AVG_SALARY_Q4_PREV: forecastMeta(
      "szacunek ok. 9 720 zł: IV kw. 2025 (9 228,64 zł, M.P. 2026 poz. 117) × dynamika r/r z II kw. 2026 (9 396,33 / 8 919,94; M.P. 2026 poz. 720 i M.P. 2025 poz. 688) = 9 721,52, zaokrąglone (widełki 9 650–9 800)",
      "obwieszczenie Prezesa GUS ok. 20–22.01.2027",
    ),
    LINEAR_HEALTH_DEDUCTION_LIMIT: forecastMeta(
      "wyliczenie z art. 30c ust. 2b ustawy o PIT: 14 100 × 300 990 / 282 600 = 15 017,55 → w górę do 100 zł",
      "obwieszczenie Ministra Finansów do 31.12.2026",
    ),
    HEALTH_MIN_MONTHLY_JANUARY: finalMeta("art. 81 ust. 2b u.ś.o.z. (rok składkowy 2026/27: 9% × 4 806 zł)"),
    ZUS_FORECAST_AVG_SALARY: forecastMeta(
      "projekt ustawy budżetowej na 2027 r. (RM 28.08.2026), art. 24",
      "obwieszczenie MRPiPS o kwocie ograniczenia podstawy (ok. XI 2026)",
    ),
    ZUS_FULL_BASE: forecastMeta(
      "art. 18 ust. 8 u.s.u.s. (60% × 10 033 zł – prognozowane wynagrodzenie z projektu budżetu)",
      "obwieszczenie MRPiPS (ok. XI 2026)",
    ),
    ZUS_PREF_BASE: finalMeta("art. 18a ust. 1 u.s.u.s. (30% × 4 950 zł)"),
    ZUS_RATE_ACCIDENT: forecastMeta(
      "art. 28 ust. 1 ustawy wypadkowej: 1,67% obowiązuje do 03.2027; od 04.2027 przyjęto bez zmian",
      "ewentualne rozporządzenie MRPiPS przed 1.04.2027",
    ),
    ZUS_RATE_FP: forecastMeta(
      "projekt ustawy budżetowej na 2027 r., art. 25",
      "ustawa budżetowa na 2027 r. (zwykle I–II 2027)",
    ),
    ZUS_RATE_FS: forecastMeta(
      "projekt ustawy budżetowej na 2027 r., art. 26",
      "ustawa budżetowa na 2027 r. (zwykle I–II 2027)",
    ),
  },
};

/* Informacje o roku (teksty okna „Założenia” i eksportu). */
const TAX_YEAR_INFO = {
  2026: {
    acts: "ustawa o PIT (Dz.U. 2026 poz. 592), ustawa o ryczałcie (Dz.U. 2025 poz. 843), u.ś.o.z. (Dz.U. 2025 poz. 1461), u.s.u.s. (Dz.U. 2026 poz. 199), Prawo przedsiębiorców (Dz.U. 2025 poz. 1480), ustawa o rynku pracy (Dz.U. 2025 poz. 620)",
    summary: null,
  },
  2027: {
    acts: "ustawa o PIT (Dz.U. 2026 poz. 592), ustawa o ryczałcie (Dz.U. 2025 poz. 843), u.ś.o.z. (Dz.U. 2025 poz. 1461), u.s.u.s. (Dz.U. 2026 poz. 199), Prawo przedsiębiorców (Dz.U. 2025 poz. 1480), ustawa o rynku pracy (Dz.U. 2025 poz. 620), minimalne wynagrodzenie 2027 (Dz.U. 2026 poz. 1213); prognozy: projekt ustawy budżetowej na 2027 r.",
    summary:
      "Rok 2027: obowiązujące przepisy z kwotami na 2027 r. Część kwot to prognozy (oznaczone „prognoza”) — staną się ostateczne między XI 2026 a I 2027.",
  },
};

/* ==================================================
   Scenariusze – nakładki na stałe roku (domyślnie wyłączone)
================================================== */
const TAX_SCENARIOS = {
  reform2027: {
    id: "reform2027",
    year: 2027,
    label: "Projekt zmian 2027 (UD458 + UD116)",
    statusDate: "25.09.2026",
    status:
      "UD458 (skala, danina 5%, ryczałt): po Stałym Komitecie RM 23.09.2026, nieprzyjęty przez Radę Ministrów, brak druku sejmowego. UD116 (danina od IP BOX): przyjęty przez Radę Ministrów 22.09.2026, brak druku sejmowego. Tekstu projektów z RCL nie udało się pobrać — elementy oparte na omówieniach są oznaczone jako niepotwierdzone.",
    sources: [
      "https://www.gov.pl/web/premier/projekt-ustawy-o-zmianie-ustawy-o-podatku-dochodowym-od-osob-fizycznych-ustawy-o-podatku-dochodowym-od-osob-prawnych-oraz-ustawy-o-zryczaltowanym-podatku-dochodowym-od-niektorych-przychodow-osiaganych-przez-osoby-fizyczne5",
      "https://legislacja.rcl.gov.pl/projekt/12413754",
      "https://www.gov.pl/web/premier/projekt-ustawy-o-zmianie-ustawy-o-podatku-dochodowym-od-osob-fizycznych-ustawy-o-podatku-dochodowym-od-osob-prawnych-oraz-ustawy-o-zryczaltowanym-podatku-dochodowym-od-niektorych-przychodow-osiaganych-przez-osoby-fizyczne7",
      "https://ksiegowosc.infor.pl/wiadomosci/7642538",
      "https://ksiegowosc.infor.pl/wiadomosci/7644640",
    ],
    overrides: {
      // UD458: 12% do 130 000; 12 000 + 24% ponad 130 000; 16 800 + 32% ponad 150 000
      PIT_SCALE_BANDS: [
        { from: 0, rate: 0.12 },
        { from: 130000, rate: 0.24 },
        { from: 150000, rate: 0.32 },
      ],
      SOLIDARITY_RATE: 0.05, // UD458
      SOLIDARITY_INCLUDES_IP_BOX: true, // UD116
      RYCZALT_ELIGIBILITY_LIMIT_EUR: 250000, // UD458 (przychód z 2026 r.)
      RYCZALT_HIGH_RATE_THRESHOLD_EUR: 300000, // UD458 (przychód w 2027 r.)
      RYCZALT_HIGH_RATE: 0.17, // UD458
      // PROGNOZA: ostatni znany kurs średni NBP (tabela 187/A/NBP/2026 z 25.09.2026);
      // wiążący kurs z 1.10.2026 (art. 4 ust. 2 ustawy o ryczałcie, bez zaokrąglenia)
      EUR_PLN_RATE: 4.375,
    },
    meta: {
      PIT_SCALE_BANDS: draftMeta(
        "projekt UD458 (art. 27 ust. 1 – tabela skali cytowana za Infor 7642538; wykaz prac RM)",
        "ogłoszenie ustawy w Dz.U. (cel: ok. 30.11.2026; ryzyko weta)",
      ),
      SOLIDARITY_RATE: draftMeta("projekt UD458 (wykaz prac RM)", "ogłoszenie ustawy w Dz.U. (cel: ok. 30.11.2026)"),
      SOLIDARITY_INCLUDES_IP_BOX: draftMeta(
        "projekt UD116, przyjęty przez RM 22.09.2026 (komunikat KPRM; zmiana art. 30h ust. 2 – brzmienie niepotwierdzone)",
        "ogłoszenie ustawy w Dz.U.",
      ),
      RYCZALT_ELIGIBILITY_LIMIT_EUR: draftMeta(
        "projekt UD458 (wykaz prac RM: przychód z 2026 r. ≤ 250 tys. EUR; brzmienie art. 6 ust. 4 niepotwierdzone)",
        "ogłoszenie ustawy w Dz.U. (cel: ok. 30.11.2026)",
      ),
      RYCZALT_HIGH_RATE_THRESHOLD_EUR: draftMeta(
        "projekt UD458 (art. 12 ust. 1 pkt 1 i nowy ust. 15 ustawy o ryczałcie – brzmienie niepotwierdzone)",
        "ogłoszenie ustawy w Dz.U. (cel: ok. 30.11.2026)",
      ),
      RYCZALT_HIGH_RATE: draftMeta("projekt UD458", "ogłoszenie ustawy w Dz.U. (cel: ok. 30.11.2026)"),
      EUR_PLN_RATE: forecastMeta(
        "art. 4 ust. 2 ustawy o ryczałcie; przyjęto ostatni znany kurs średni NBP 4,3750 (tabela 187/A/NBP/2026 z 25.09.2026)",
        "kurs średni NBP z 1.10.2026",
      ),
    },
    // Elementy przyjęte bez tekstu projektu (docs/prawo/research-2027-reformy.md, N1–N8)
    unconfirmed: [
      "17% od nadwyżki przychodu ponad 300 000 EUR: odliczenia (składki społeczne, 50% składki zdrowotnej) dzielimy między część opodatkowaną stawką właściwą i część 17% proporcjonalnie do przychodu (projekt tego nie określa – N2).",
      "Przy kilku stawkach ryczałtu nadwyżkę ponad 300 000 EUR przypisujemy stawkom proporcjonalnie do przychodu (projekt: „zgodnie z kolejnością przychodów”, której kalkulator nie zna – N1, N3); przy 8,5%/12,5% nadwyżka pochodzi z części 12,5%.",
      "Limit prawa do ryczałtu: przychód z 2026 r. porównujemy z 250 000 EUR × kurs z 1.10.2026 bez zaokrąglenia (art. 4 ust. 2; brzmienie zmian art. 6 ust. 4 niepotwierdzone – N4). Działalność rozpoczęta w 2027 r. – limit nie dotyczy (art. 6 ust. 4 pkt 2).",
      "Danina: podstawa powiększona o dochód kwalifikowany IP BOX (art. 30ca ust. 3) bez innych odliczeń; straty z lat ubiegłych nie są modelowane (N5).",
      "Wspólne rozliczenie i samotny rodzic: 2 × podatek od połowy dochodów według nowej skali (art. 6 ust. 2 bez zmian – wniosek, nie cytat projektu – N8).",
    ],
  },
};

/* ==================================================
   Aktywny zestaw stałych (wybierany w UI)
================================================== */
function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

Object.values(TAX_CONSTANTS_BY_YEAR).forEach(deepFreeze);
Object.values(TAX_SCENARIOS).forEach(deepFreeze);

// Aktywne stałe – jedyne źródło wartości dla obliczeń; zmienia je wyłącznie
// taxYears.setActive (przełącznik roku / scenariusza w UI).
let TAX_CONSTANTS = TAX_CONSTANTS_BY_YEAR[2026];

const taxYears = {
  /** Lata, dla których są stałe (rosnąco). */
  list() {
    return Object.keys(TAX_CONSTANTS_BY_YEAR)
      .map(Number)
      .sort((a, b) => a - b);
  },

  has(year) {
    return Object.prototype.hasOwnProperty.call(TAX_CONSTANTS_BY_YEAR, year);
  },

  /** Scenariusze dostępne dla roku. */
  scenariosFor(year) {
    return Object.values(TAX_SCENARIOS).filter((s) => s.year === Number(year));
  },

  /**
   * Stałe roku z nałożonym scenariuszem (scenariusz innego roku jest
   * ignorowany). Wynik zamrożony.
   */
  resolve(year, scenarioId = null) {
    const base = TAX_CONSTANTS_BY_YEAR[year];
    if (!base) throw new Error(`Brak stałych dla roku ${year}`);
    const scenario = scenarioId ? TAX_SCENARIOS[scenarioId] : null;
    if (!scenario || scenario.year !== Number(year)) return base;
    return deepFreeze({ ...base, ...scenario.overrides });
  },

  /** Metadane stałych roku (ze scenariuszem). */
  meta(year, scenarioId = null) {
    const base = TAX_CONSTANTS_META_BY_YEAR[year] || {};
    const scenario = scenarioId ? TAX_SCENARIOS[scenarioId] : null;
    if (!scenario || scenario.year !== Number(year)) return base;
    return { ...base, ...scenario.meta };
  },

  _active: { year: 2026, scenario: null },

  /** Ustawia aktywny rok (i scenariusz); zwraca aktywne stałe. */
  setActive(year, scenarioId = null) {
    const numericYear = Number(year);
    const scenario =
      scenarioId &&
      TAX_SCENARIOS[scenarioId] &&
      TAX_SCENARIOS[scenarioId].year === numericYear
        ? scenarioId
        : null;
    TAX_CONSTANTS = this.resolve(numericYear, scenario);
    this._active = { year: numericYear, scenario };
    return TAX_CONSTANTS;
  },

  /** { year, scenario } – aktywny rok i scenariusz (null = obowiązujące przepisy). */
  active() {
    return { ...this._active };
  },

  /**
   * Wykonuje fn przy innych stałych i przywraca poprzednie (np. porównanie
   * scenariusza z obowiązującymi przepisami).
   */
  withActive(year, scenarioId, fn) {
    const previous = this.active();
    this.setActive(year, scenarioId);
    try {
      return fn();
    } finally {
      this.setActive(previous.year, previous.scenario);
    }
  },

  /**
   * Reguła roku domyślnego (bez parametru ?rok= w adresie): bieżący rok
   * kalendarzowy, a od 1 listopada – rok następny, jeśli ma stałe; gdy
   * wybranego roku brak – najnowszy dostępny rok nie późniejszy od niego
   * (a gdy i takiego brak – najwcześniejszy dostępny).
   * @param {{y:number,m:number,d?:number}|string|Date} today – data „dzisiaj”
   *   (przekazuje ją UI; obliczenia nie używają bieżącej daty)
   * @param {number[]} [years]
   * @returns {number}
   */
  getDefaultYear(today, years = this.list()) {
    let y;
    let m;
    if (today instanceof Date) {
      y = today.getFullYear();
      m = today.getMonth() + 1;
    } else if (typeof today === "string") {
      const match = /^(\d{4})-(\d{2})/.exec(today);
      y = match ? Number(match[1]) : NaN;
      m = match ? Number(match[2]) : NaN;
    } else if (today && typeof today === "object") {
      y = today.y;
      m = today.m;
    }
    const sorted = [...years].map(Number).sort((a, b) => a - b);
    if (!Number.isFinite(y) || !Number.isFinite(m)) return sorted[sorted.length - 1];
    if (m >= 11 && sorted.includes(y + 1)) return y + 1;
    const notLater = sorted.filter((year) => year <= y);
    return notLater.length ? notLater[notLater.length - 1] : sorted[0];
  },
};

/* ==================================================
   Moduł taxMath - funkcje pomocnicze
================================================== */

const taxMath = {
  /**
   * Zaokrąglenie do groszy (2 miejsca po przecinku), „połówka w górę”
   * (od zera) odporne na błędy reprezentacji float: n × 100 jest najpierw
   * sprowadzane do 15 cyfr znaczących, więc np. 0,09 × 464 484,50 =
   * 41 803,60499999… (a matematycznie 41 803,605) daje 41 803,61.
   * @param {number} n - liczba do zaokrąglenia
   * @returns {number} zaokrąglona wartość
   */
  round2(n) {
    if (!Number.isFinite(n)) return n;
    const scaled = Number((Math.abs(n) * 100).toPrecision(15));
    return (Math.sign(n) * Math.round(scaled)) / 100 || 0;
  },

  /**
   * Parsuje kwotę wpisaną przez użytkownika (jeden parser dla wszystkich
   * pól kwotowych). Akceptuje m.in. „1234.56”, „1234,56”, „1 234,56”,
   * „1.234,56”, „1 234.56”, „1 234,56 zł”. Reguły:
   * - spacje (także twarde) i przyrostek „zł”/„PLN” są pomijane;
   * - gdy występują oba separatory „.” i „,”, ostatni z nich jest dziesiętny;
   * - pojedynczy „.” albo „,”, po którym na końcu są 1–2 cyfry, jest
   *   dziesiętny (pojedynczy separator na samym końcu – np. w trakcie
   *   pisania „1234,” – też); gdy tysiące są oddzielone spacjami, pojedynczy
   *   „.”/„,” za ostatnią spacją jest zawsze dziesiętny („1 000,555” = błąd);
   * - w pozostałych przypadkach „.”/„,”/spacje to separatory tysięcy
   *   i muszą dzielić liczbę na grupy po 3 cyfry;
   * - inne znaki (litery, wykładnik „12e3”, kilka minusów) = błąd.
   * @param {string} raw
   * @returns {{ok:boolean, empty:boolean, value:number|null, error:string|null}}
   */
  parseAmount(raw) {
    const fail = (error) => ({ ok: false, empty: false, value: null, error });
    let text = String(raw === null || raw === undefined ? "" : raw)
      .replace(/[\s\u00a0\u202f\u2009]+/g, " ")
      .trim()
      .replace(/\s*(zł|pln)\.?$/i, "")
      .trim();
    if (text === "") return { ok: true, empty: true, value: 0, error: null };
    let negative = false;
    if (/^[-−]/.test(text)) {
      negative = true;
      text = text.slice(1).trim();
    }
    if (!/^\d[\d .,]*$/.test(text)) return fail("format");
    const lastDot = text.lastIndexOf(".");
    const lastComma = text.lastIndexOf(",");
    let decimalSep = null;
    if (lastDot >= 0 && lastComma >= 0) {
      decimalSep = lastDot > lastComma ? "." : ",";
      if (text.split(decimalSep).length !== 2) return fail("format");
    } else {
      const sep = lastDot >= 0 ? "." : lastComma >= 0 ? "," : null;
      if (sep && text.split(sep).length === 2) {
        const sepIndex = text.lastIndexOf(sep);
        const after = text.slice(sepIndex + 1);
        // „1 000,555”: tysiące oddzielone spacjami, więc pojedynczy „,”/„.”
        // za ostatnią spacją jest dziesiętny (3 cyfry po nim = błąd),
        // a nie kolejną grupą tysięcy
        const spaceGrouped = sepIndex > text.lastIndexOf(" ") && text.includes(" ");
        if (/^\d{0,2}$/.test(after) || spaceGrouped) decimalSep = sep;
      }
    }
    let intPart = text;
    let fracPart = "";
    if (decimalSep) {
      const idx = text.lastIndexOf(decimalSep);
      intPart = text.slice(0, idx);
      fracPart = text.slice(idx + 1);
      if (!/^\d{0,2}$/.test(fracPart)) return fail("format");
    }
    const groups = intPart.split(/[ .,]/);
    if (groups.length > 1) {
      if (!/^\d{1,3}$/.test(groups[0])) return fail("format");
      if (!groups.slice(1).every((group) => /^\d{3}$/.test(group))) {
        return fail("format");
      }
    } else if (!/^\d+$/.test(intPart)) {
      return fail("format");
    }
    const value = Number(`${groups.join("")}.${fracPart || "0"}`);
    if (!Number.isFinite(value)) return fail("format");
    const signed = negative && value !== 0 ? -value : value;
    return { ok: true, empty: false, value: signed, error: null };
  },

  /**
   * Minimalna składka zdrowotna miesięczna (skala/liniowy)
   * @returns {number} składka miesięczna w PLN
   */
  getMinHealthMonthly() {
    return this.round2(
      TAX_CONSTANTS.MIN_WAGE * TAX_CONSTANTS.HEALTH_RATE_SCALE
    ); // 2026: 432.54; 2027: 445.50
  },

  /**
   * Minimalna składka zdrowotna roczna (skala/liniowy)
   * Art. 81 ust. 2b u.ś.o.z.: liczba miesięcy podlegania ubezpieczeniu
   * zdrowotnemu w roku × minimalne wynagrodzenie × 9%.
   * @param {number} [months=12] - liczba miesięcy podlegania w roku
   * @returns {number} składka roczna w PLN
   */
  getMinHealthAnnual(months = 12) {
    return this.round2(this.getMinHealthMonthly() * months); // 2026: 12 × 432.54 = 5190.48; 2027: 12 × 445.50 = 5346
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
   * Harmonogram składek społecznych ZUS na rok ZUS_YEAR (aktywny rok podatkowy),
   * miesiąc po miesiącu. Starty sprzed roku (np. ulga na start z 2026 r. przy
   * roku 2027) są uwzględniane – okresy liczone są w ciągłej numeracji miesięcy.
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

    // Przy umowie o pracę ≥ minimalnego nie ma obowiązkowych ubezpieczeń
    // społecznych z JDG – okresy ulgi / małego ZUS nie są ustalane (nie
    // pokazujemy „ulga na start do …”, jakby była wykorzystywana).
    const socialPath = opts.enabled && start && !opts.employment;
    let ulgaEndIdx = null;
    let prefEndIdx = null;
    if (socialPath && path === "ulga") {
      ulgaEndIdx = startIdx + C.ZUS_ULGA_MONTHS - 1 + (midMonthStart ? 1 : 0);
      prefEndIdx = ulgaEndIdx + C.ZUS_PREF_MONTHS;
    } else if (socialPath && path === "pref") {
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
   * Sanity check - kwoty pochodne aktywnego roku (i scenariusza)
   * Uruchom w konsoli: taxMath.sanityCheck()
   */
  sanityCheck() {
    const { year, scenario } = taxYears.active();
    console.log(
      `=== SANITY CHECK: TAX_CONSTANTS ${year}${scenario ? ` (${scenario})` : ""} ===\n`
    );

    console.log("1. Minimalna składka zdrowotna:");
    console.log(`   Miesięcznie: ${this.getMinHealthMonthly()} PLN`);
    console.log(`   Rocznie: ${this.getMinHealthAnnual()} PLN\n`);

    console.log("2. Progi dochodu dla minimalnej składki (liniowy):");
    console.log(
      `   Miesięcznie: ${this.getMinHealthThresholdLinearMonthly()} PLN`
    );
    console.log(
      `   Rocznie: ${this.getMinHealthThresholdLinearAnnual()} PLN\n`
    );

    console.log("3. Składka zdrowotna na ryczałcie (miesięcznie wg progu):");
    [50000, 100000, 400000].forEach((rev) => {
      console.log(
        `   Przychód ${rev}: ${this.getRyczaltHealthMonthlyForRevenue(rev)} PLN / mies., ${this.getRyczaltHealthAnnualForRevenue(rev)} PLN / rok`
      );
    });

    console.log("\n4. Skala podatkowa (przedziały art. 27 ust. 1):");
    TAX_CONSTANTS.PIT_SCALE_BANDS.forEach((band) => {
      console.log(`   od ${band.from}: ${band.rate * 100}%`);
    });

    console.log("\n5. Składki społeczne (pełny ZUS z chorobową, mały ZUS):");
    console.log(
      `   ${JSON.stringify(this.getSocialContributionsForBase(TAX_CONSTANTS.ZUS_FULL_BASE, { sickness: true, funds: true }))}`
    );
    console.log(
      `   ${JSON.stringify(this.getSocialContributionsForBase(TAX_CONSTANTS.ZUS_PREF_BASE, { sickness: true }))}\n`
    );

    console.log("=== KONIEC SANITY CHECK ===");
  },
};
