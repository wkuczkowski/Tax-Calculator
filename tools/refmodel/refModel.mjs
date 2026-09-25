// Independent reference model: Polish JDG tax + ZUS burden, tax years 2026 and 2027
// (2027: current law, or the draft reform UD458 + UD116 with input.reform2027 = true).
//
// Built from the statutes, docs/decyzje/specyfikacja-zus.md (SPEC_ZUS), docs/prawo/research-zus-2026.md
// and docs/prawo/audyt-logiki-2026.md WITHOUT looking at the calculator implementation
// (2026/script.js, taxConstants.js). Keep it that way: change this file only from the law and the
// documented decisions, never by copying app code – otherwise the comparison proves nothing.
//
// Abbreviations used in comments:
//   uPIT   – ustawa o PIT, t.j. Dz.U. 2026 poz. 592
//   uRycz  – ustawa o zryczałtowanym podatku dochodowym, t.j. Dz.U. 2025 poz. 843
//   uŚOZ   – ustawa o świadczeniach opieki zdrowotnej, t.j. Dz.U. 2025 poz. 1461
//   uSUS   – ustawa o systemie ubezpieczeń społecznych, t.j. Dz.U. 2026 poz. 199
//   PP     – Prawo przedsiębiorców, t.j. Dz.U. 2025 poz. 1480
//   uRP    – ustawa o rynku pracy i służbach zatrudnienia, Dz.U. 2025 poz. 620
//   ZUS-FP – ZUS poradnik "Zasady opłacania składek na FP, FGŚP, FEP i FS" (stan 1.06.2025)
//
// Money: every published amount is rounded to grosze (0.01 zł). Social contributions are
// rounded per component per month (as ZUS does). Tax/health are rounded once, annually.
//
// INPUT (all amounts annual, PLN):
// {
//   revenue, costs,                       // JDG revenue and costs (costs WITHOUT ZUS)
//   otherScaleIncome,                     // taxpayer's other income taxed on the scale (after its own costs), >= 0
//   ipBox:  { enabled, coeff },           // coeff in PERCENT (0..100) = share of JDG income that is qualified (5%)
//   joint:  { enabled, spouseIncome },    // spouse's scale income (>= 0)
//   multiRate: { enabled, allocations: { '12': 100000, '8.5-12.5': 50000, ... } },
//   zus: { enabled, startDate: 'YYYY-MM-DD'|null, path: 'full'|'ulga'|'pref',
//          chorobowe, birthDate: 'YYYY-MM-DD'|null, sex: 'K'|'M'|null,
//          employmentContract, wakacje },
//   year: 2026 | 2027,                    // tax year (default 2026)
//   reform2027: false,                    // 2027 only: draft reform UD458 + UD116 scenario
//   revenuePrevYear: null,                // reform only: 2026 revenue for the 250 000 EUR ryczałt limit;
//                                         // null = same as `revenue`; ignored when the business starts in 2027
// }
// Extra option (not in DEFAULT_OPTIONS so 2026 output stays byte-identical): `eurRate` – EUR/PLN rate
// for the reform's EUR limits (default EUR_RATE_2027_FORECAST).
// OUTPUT: see computeAll().

// ---------------------------------------------------------------------------
// Constants per tax year. computeAll() activates one set (module-level `C`, see useYear()).
// Every value is re-derived from the source named next to it, never from the app's taxConstants.js.
// Status of 2027 values: F = final (published act), P = forecast, D = draft bill (reform2027 only).
// ---------------------------------------------------------------------------
// Ryczałt health amount: 9% × (60% | 100% | 180%) × average Q4 wage, base rounded to grosze first
// (ZUS/GUS publish e.g. 5 537,18 × 9% = 498,35 for 2026) – art. 81 ust. 2e–2f uŚOZ.
const ryczaltHealthFromWage = (w) => [0.6, 1, 1.8].map((m) => r2(r2(m * w) * 0.09));

const CONSTANTS_2026 = {
  YEAR: 2026,
  MIN_WAGE: 4806.0, // Dz.U. 2025 poz. 1242
  FULL_BASE: 5652.0, // 60% × 9 420 (prognozowane przeciętne) – art. 18 ust. 8 uSUS
  PREF_BASE: 1441.8, // 30% × 4 806 – art. 18a ust. 1 uSUS
  RATE_EMER: 0.1952, // art. 22 ust. 1 pkt 1 uSUS
  RATE_RENT: 0.08, // art. 22 ust. 1 pkt 2 uSUS
  RATE_CHOR: 0.0245, // art. 22 ust. 1 pkt 3 uSUS (dobrowolna – art. 11 ust. 2)
  RATE_WYP: 0.0167, // art. 28 ustawy wypadkowej: 50% najwyższej stopy, płatnik ≤ 9 ubezpieczonych
  RATE_FP_FS: 0.0245, // FP 1,00% + FS 1,45% (ustawa budżetowa 2026 art. 25–26)
  RATE_FP: 0.01,
  RATE_FS: 0.0145,
  // Health
  HEALTH_MIN_MONTHLY: 432.54, // 9% × 4 806 – art. 79 ust. 1, 79a ust. 1, 81 ust. 2b/2d uŚOZ
  HEALTH_SCALE_RATE: 0.09, // art. 79 ust. 1 uŚOZ
  HEALTH_LINEAR_RATE: 0.049, // art. 79a ust. 1–2 uŚOZ (also IP BOX when combined with 30c)
  LINEAR_HEALTH_DEDUCTION_LIMIT: 14100, // art. 30c ust. 2 pkt 2 uPIT + M.P. 2025 poz. 1274
  AVG_WAGE_Q4: 9228.64, // M.P. 2026 poz. 117
  RYCZALT_HEALTH_MONTHLY: [498.35, 830.58, 1495.04], // 9% × (60% | 100% | 180%) × 9 228,64 – art. 81 ust. 2e–2f uŚOZ
  RYCZALT_THRESHOLDS: [60000, 300000], // art. 81 ust. 2e uŚOZ ("nie przekroczyły")
  RYCZALT_HEALTH_DEDUCTION_SHARE: 0.5, // art. 11 ust. 1a uRycz
  // PIT
  SCALE_FREE: 30000, // art. 27 ust. 1 uPIT
  // art. 27 ust. 1 table, one row per bracket: tax = fixed + rate × (base − over) − minus.
  SCALE_BRACKETS: [
    { upTo: 120000, over: 0, fixed: 0, rate: 0.12, minus: 3600 }, // 12% minus kwota zmniejszająca 3 600
    { upTo: Infinity, over: 120000, fixed: 10800, rate: 0.32, minus: 0 }, // 10 800 + 32% nadwyżki ponad 120 000
  ],
  LINEAR_RATE: 0.19, // art. 30c ust. 1 uPIT
  IPBOX_RATE: 0.05, // art. 30ca ust. 1 uPIT
  DANINA_THRESHOLD: 1000000, // art. 30h uPIT
  DANINA_RATE: 0.04,
  DANINA_INCLUDES_IPBOX: false, // art. 30h ust. 2 – closed list without art. 30ca
  R85_THRESHOLD: 100000, // art. 12 ust. 1 pkt 4 uRycz (8,5% do 100 000 zł, 12,5% nadwyżki)
  // Family reliefs (unchanged in 2027: statutory amounts, no indexation; druki 824/1898 not enacted)
  CHILD_RATE_1_2: 92.67, // art. 27f ust. 2 pkt 1–3 lit. a uPIT – 1st and 2nd child per month
  CHILD_RATE_3: 166.67, // art. 27f ust. 2 pkt 3 lit. b – 3rd child
  CHILD_RATE_4PLUS: 225.0, // art. 27f ust. 2 pkt 3 lit. c – 4th and each next child
  CHILD_LIMIT_MARRIED: 112000, // art. 27f ust. 2 pkt 1 lit. a – spouses' incomes together
  CHILD_LIMIT_SINGLE_PARENT: 112000, // art. 27f ust. 2 pkt 1 lit. b (exception for art. 6 ust. 4c)
  CHILD_LIMIT_OTHER: 56000, // art. 27f ust. 2 pkt 1 lit. b
  FOUR_PLUS_LIMIT: 85528, // art. 21 ust. 1 pkt 153 and ust. 44 uPIT (shared limit with pkt 148, 152, 154)
  EST_EMPLOYEE_COSTS: 3000, // estimate of contributions on "other income" (research §4.1 pt 5): KUP 12 × 250
  EST_EMPLOYEE_SOCIAL_RATE: 0.1371, // employee social 9,76 + 1,5 + 2,45
  RYCZALT_EUR_RULES: null, // no 250k/300k EUR rules (2 mln EUR prior-year limit not modelled, as in 2026)
};

// 2027, CURRENT LAW (no UD458/UD116). Sources: research_2027.md §1, SPEC_MULTIYEAR.md.
const CONSTANTS_2027 = {
  ...CONSTANTS_2026,
  YEAR: 2027,
  MIN_WAGE: 4950.0, // F: rozp. RM z 14.09.2026, Dz.U. 2026 poz. 1213 § 1 (verified in the PDF)
  FULL_BASE: 6019.8, // P: 60% × 10 033 (projekt ustawy budżetowej 2027 art. 24) – art. 18 ust. 8 uSUS; final with the MRPiPS obwieszczenie (~XI 2026)
  PREF_BASE: 1485.0, // F: 30% × 4 950 – art. 18a ust. 1 uSUS
  // RATE_EMER/RENT/CHOR unchanged (F); RATE_WYP 1,67% (F to 03.2027, P from 04.2027);
  // FP 1% + FS 1,45% (P: projekt UB 2027 art. 25–26).
  HEALTH_MIN_MONTHLY: 445.5, // F: 9% × 4 950 – art. 81 ust. 2/2b uŚOZ; SPEC_MULTIYEAR: all 12 months × 445,50 (Jan 2027 simplification as in 2026)
  LINEAR_HEALTH_DEDUCTION_LIMIT: 15100, // P: art. 30c ust. 2b uPIT: 14 100 × 300 990/282 600 = 15 017,55 → up to full 100 zł; MF obwieszczenie by 31.12.2026
  AVG_WAGE_Q4: 9720, // P: SPEC_MULTIYEAR "≈ 9 720" (research: 9 228,64 × 1,0534 ≈ 9 721,52); GUS ~22.01.2027
  RYCZALT_HEALTH_MONTHLY: ryczaltHealthFromWage(9720), // P: 524,88 / 874,80 / 1 574,64
};

// Forecast EUR/PLN for the UD458 ryczałt limits: art. 4 ust. 2 uRycz – NBP average rate of the first
// working day of October of the preceding year (1.10.2026), NOT rounded. Unknown on 25.09.2026, so the
// latest known NBP rate is used: table 187/A/NBP/2026 of 25.09.2026, EUR mid = 4,3750
// (https://api.nbp.pl/api/exchangerates/rates/a/eur/last/10/). Override with option `eurRate`.
export const EUR_RATE_2027_FORECAST = 4.375;

// 2027 with the draft reform (UD458 as published on RCL 21.08.2026 + UD116 adopted by RM 22.09.2026).
// Status D (draft, not enacted) for every value below. Source: research_2027_reforms.md §2, §3, §5.
const REFORM_2027 = {
  SCALE_BRACKETS: [
    { upTo: 130000, over: 0, fixed: 0, rate: 0.12, minus: 3600 }, // UD458 art. 27 ust. 1: 12% minus 3 600 (constant)
    { upTo: 150000, over: 130000, fixed: 12000, rate: 0.24, minus: 0 }, // 12 000 zł + 24% nadwyżki ponad 130 000
    { upTo: Infinity, over: 150000, fixed: 16800, rate: 0.32, minus: 0 }, // 16 800 zł + 32% nadwyżki ponad 150 000
  ],
  DANINA_RATE: 0.05, // UD458 art. 30h ust. 1 (4% → 5%), first for 2027 income
  DANINA_INCLUDES_IPBOX: true, // UD116: base extended by qualified IP BOX income (art. 30ca ust. 3)
  RYCZALT_EUR_RULES: {
    eligibilityLimitEur: 250000, // UD458: 2026 revenue ≤ 250 000 EUR (art. 6 ust. 4 pkt 1 uRycz as amended)
    surchargeThresholdEur: 300000, // UD458: 17% on revenue above 300 000 EUR in the year (art. 12 ust. 1 pkt 1, ust. 15)
    surchargeRate: 0.17,
  },
};

export const CONSTANTS_BY_YEAR = { 2026: CONSTANTS_2026, 2027: CONSTANTS_2027 };

export function constantsFor(year = 2026, reform2027 = false, eurRate = EUR_RATE_2027_FORECAST) {
  const base = CONSTANTS_BY_YEAR[year];
  if (!base) throw new Error('no constants for year ' + year);
  if (!reform2027) return base;
  if (year !== 2027) throw new Error('reform2027 applies only to year 2027');
  return { ...base, ...REFORM_2027, SCENARIO: 'reform2027', EUR_RATE: eurRate };
}

// Active constant set. computeAll() switches it for the duration of one (synchronous) call.
// Exported as a live binding; outside computeAll it is the 2026 set (backward compatible).
export let C = CONSTANTS_2026;
function useYear(k) { const prev = C; C = k; return prev; }

export const RYCZALT_RATES = ['2', '3', '5.5', '8.5', '8.5-12.5', '10', '12', '14', '15', '17'];
export const RYCZALT_VARIANT_KEY = {
  '2': 'ryczalt2', '3': 'ryczalt3', '5.5': 'ryczalt5_5', '8.5': 'ryczalt8_5',
  '8.5-12.5': 'ryczalt8_5_12_5', '10': 'ryczalt10', '12': 'ryczalt12', '14': 'ryczalt14',
  '15': 'ryczalt15', '17': 'ryczalt17',
};

// ---------------------------------------------------------------------------
// Interpretation switches (defaults = my reading of SPEC + law; see report)
// ---------------------------------------------------------------------------
export const DEFAULT_OPTIONS = {
  // Health months when the "Uwzględnij składki ZUS" toggle is OFF: '12' ignores the start date
  // (whole ZUS section inactive), 'fromStartDate' still counts months from the start date.
  // SPEC ADDENDUM A3: the start date always drives health months, even with social ZUS off.
  healthMonthsWhenZusDisabled: 'fromStartDate',
  // FP/FS in the first, day-proportional month of full ZUS: ZUS-FP p. 27 and zus.pl: FP is due
  // "za każdy miesiąc, w którym podlegały ubezpieczeniom chociaż przez jeden dzień" when the
  // full-month minimum base is 60% of forecast wage. So true = FP due on the reduced base.
  fpInPartialFirstMonth: true,
  // FP and FS rounded as one 2,45% amount (true) or separately 1% + 1,45% (false).
  fpFsCombinedRounding: true,
  // Linear tax: health contribution booked as KUP lowers the health base itself (cascade,
  // art. 81 ust. 2 uŚOZ has no exclusion). SPEC does not ask for it; default off.
  linearHealthKupCascade: false,
  // Linear: social contributions that exceed linear income may be deducted from other scale
  // income (art. 26 ust. 13a / 30c ust. 3 are per-contribution). SPEC: no splitting → false.
  linearSurplusToScale: false,
  // Ryczałt: part of social contributions exceeding ryczałt revenue goes to scale income
  // (SPEC: "nadwyżka ponad przychód → od skali").
  ryczaltSurplusToScale: true,
  // IP BOX: allow booking social contributions as KUP (would partly reduce the 5% income).
  // SPEC: "IP BOX: nigdy od dochodu opodatkowanego 5%" → false.
  // SPEC ADDENDUM A1: all legal ways considered, incl. KUP → true.
  ipBoxAllowKupSocial: true,
  // IP BOX: FP/FS (always KUP) allocated 'proportional' to qualified/non-qualified income
  // (coefficient applied to income after all KUP) or entirely to 'nonQualified'.
  ipBoxFpAllocation: 'proportional',
  // Baseline "PIT from other income alone" also includes danina on that income (art. 30h).
  baselineIncludesDanina: true,
  // Wakacje składkowe month choice: 'maxContribution' (one month for all variants: highest
  // social+FP amount, earliest on ties) or 'perVariant' (brute force per variant).
  // SPEC ADDENDUM A2: chosen per variant.
  wakacjeMonthChoice: 'perVariant',
  // In 'perVariant' mode, may a variant also choose not to use the holiday at all
  // (only ever better through the ryczałt health tier, art. 81 ust. 2g)? Implementer allows it.
  wakacjeAllowNone: true,
  // Round PIT bases/taxes to full złoty (art. 63 Ordynacji). App convention is grosze → false.
  roundPitToZloty: false,
};

// Family-relief interpretation switches. Kept OUT of DEFAULT_OPTIONS so that outputs without the
// family card stay byte-identical (DEFAULT_OPTIONS is echoed into every result).
export const FAMILY_OPTIONS = {
  // Single parent who uses liniowy / ryczałt (art. 6 ust. 8 excludes art. 6 ust. 4d): one-child income
  // limit. SPEC (binding) + MF: 'cautious' = 56 000; literal art. 27f ust. 2 pkt 1 lit. b refers to the
  // status in art. 6 ust. 4c → 'literal' = 112 000.
  singleParentLimitLinRycz: 'cautious',
  // Refund cap (art. 27f ust. 9 pkt 1), liniowy with social contributions deducted from linear income:
  // the part of S that did NOT fit into linear income (not "odliczone w zeznaniu PIT-36L") is still
  // "podlegające odliczeniu" under art. 26 (ust. 13a) → counts ('undeducted', my reading of the law).
  // RD6 of the app: 0 for that method ('zero').
  linearLinMethodCapSocial: 'undeducted',
  // Refund cap (art. 27f ust. 9 pkt 2): health contributions paid, minus those DEDUCTED in PIT-36L /
  // under the ryczałt act. Literally (and per MF / podatki.gov.pl: "nie uwzględniasz składek … odliczone w
  // PIT-28, PIT-36L") the linear health above the deduction limit and the 50% of ryczałt health that is
  // not deducted COUNT → true (the law). SPEC/RD6 of 4c0ee3d (cautious): false – being changed in the app.
  capIncludesUndeductedHealth: true,
  // Contributions on "other income" / spouse when the field is empty: estimate as for employment
  // (research §4.1 pt 5, RD15) only when the income is > 0; 0 otherwise.
  estimateContribWhenZeroIncome: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function r2(x) {
  const s = x < 0 ? -1 : 1;
  return (s * Math.round(Math.abs(x) * 100 + 1e-6)) / 100;
}
const r0 = (x) => Math.round(x);
const pos = (x) => (x > 0 ? x : 0);

function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const monthIndex = (y, m) => y * 12 + (m - 1); // absolute month number

// Scale tax (art. 27 ust. 1 uPIT) evaluated from the bracket table of the active year:
//   2026 / 2027 current law: 12% − 3 600 up to 120 000; 10 800 + 32% above.
//   2027 reform (UD458): 12% − 3 600 up to 130 000; 12 000 + 24% to 150 000; 16 800 + 32% above.
export function scaleTaxRaw(base) {
  if (base <= C.SCALE_FREE) return 0;
  const b = C.SCALE_BRACKETS.find((x) => base <= x.upTo);
  return b.fixed + b.rate * (base - b.over) - b.minus;
}
function taxRound(x, opts) {
  return opts.roundPitToZloty ? r0(x) : r2(x);
}
function baseRound(x, opts) {
  return opts.roundPitToZloty ? r0(x) : x;
}
export function scaleTax(base, opts = DEFAULT_OPTIONS) {
  return taxRound(scaleTaxRaw(baseRound(pos(base), opts)), opts);
}
// Joint (art. 6 ust. 2 uPIT): 2 × tax(½ of the sum of both spouses' incomes).
export function jointScaleTax(ownBase, spouseBase, opts = DEFAULT_OPTIONS) {
  const half = baseRound((pos(ownBase) + pos(spouseBase)) / 2, opts);
  return taxRound(2 * scaleTaxRaw(half), opts);
}
// Danina (art. 30h uPIT): 4% (reform 2027: 5%) of the excess over 1 000 000 of incomes from art. 27,
// 30b, 30c, 30f after deducted social (art. 26 ust. 1 pkt 2, 30c ust. 2 pkt 1) and linear health
// (30c ust. 2 pkt 2). Ryczałt income is never part of the base. IP BOX (30ca) income is outside the
// base under current law and inside it under UD116 (callers add it when C.DANINA_INCLUDES_IPBOX).
export function danina(base) {
  return r2(C.DANINA_RATE * pos(base - C.DANINA_THRESHOLD));
}

// ---------------------------------------------------------------------------
// Social contributions month by month (active year C.YEAR; starts in earlier years carry over)
// ---------------------------------------------------------------------------

// Regime of a calendar month (y, m) for a business started at `start` with `path`.
// Legal basis:
//  * Ulga na start – art. 18 ust. 1 PP: 6 months "od dnia podjęcia"; ZUS: start on the 1st ⇒
//    that month is 1 of 6; start mid-month ⇒ the partial month is free + 6 full months.
//  * Preferential base – art. 18a ust. 1 uSUS: "pierwszych 24 miesięcy kalendarzowych od dnia
//    rozpoczęcia"; ZUS: 24 FULL calendar months + the partial first month (example 20.10.2022 →
//    31.10.2024). After ulga: art. 18aa ust. 3 – 24 months from the day after the ulga ends.
//  * Partial first month without ulga – art. 18 ust. 9 uSUS: minimum base × days/daysInMonth.
function monthRegime(y, m, start, path) {
  if (!start) return { regime: 'full', days: null };
  const k = monthIndex(y, m) - monthIndex(start.y, start.m);
  if (k < 0) return { regime: 'inactive', days: null };
  const partial = start.d > 1;
  const dim = daysInMonth(start.y, start.m);
  const partDays = dim - start.d + 1;
  if (path === 'full') {
    if (k === 0 && partial) return { regime: 'fullPartial', days: partDays, dim };
    return { regime: 'full', days: null };
  }
  if (path === 'pref') {
    if (partial) {
      if (k === 0) return { regime: 'prefPartial', days: partDays, dim };
      if (k <= 24) return { regime: 'pref', days: null };
      return { regime: 'full', days: null };
    }
    if (k <= 23) return { regime: 'pref', days: null };
    return { regime: 'full', days: null };
  }
  if (path === 'ulga') {
    const ulgaEnd = partial ? 6 : 5; // last k of ulga
    if (k <= ulgaEnd) return { regime: 'ulga', days: null };
    if (k <= ulgaEnd + 24) return { regime: 'pref', days: null };
    return { regime: 'full', days: null };
  }
  throw new Error('unknown path ' + path);
}

// FP/FS age exemption (art. 261 uRP; ZUS-FP p. 12): women ≥ 55, men ≥ 60, from the month
// FOLLOWING the birthday month; when the birthday falls on the 1st – from that month.
function fpExemptFromMonthIndex(birthDate, sex) {
  const b = parseDate(birthDate);
  if (!b || (sex !== 'K' && sex !== 'M')) return Infinity;
  const age = sex === 'K' ? 55 : 60;
  const y = b.y + age;
  const idx = monthIndex(y, b.m);
  return b.d === 1 ? idx : idx + 1;
}

const SUBJECT_REGIMES = new Set(['full', 'fullPartial', 'pref', 'prefPartial']);

function contributionsForBase(base, withChor, withFp, opts) {
  const emer = r2(base * C.RATE_EMER);
  const rent = r2(base * C.RATE_RENT);
  const chor = withChor ? r2(base * C.RATE_CHOR) : 0;
  const wyp = r2(base * C.RATE_WYP);
  let fp = 0;
  if (withFp) {
    fp = opts.fpFsCombinedRounding ? r2(base * C.RATE_FP_FS) : r2(base * C.RATE_FP) + r2(base * C.RATE_FS);
  }
  return { emer, rent, chor, wyp, fp };
}

// Build the raw 12-month schedule (without wakacje), then apply wakacje in `wakacjeMonth`.
function buildSchedule(zus, opts, wakacjeMonth = null) {
  const start = parseDate(zus.startDate);
  const exemptIdx = fpExemptFromMonthIndex(zus.birthDate, zus.sex);
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const row = { month: m, regime: 'full', base: 0, emer: 0, rent: 0, chor: 0, wyp: 0, fp: 0, social: 0, total: 0, fpExempt: false };
    const reg = monthRegime(C.YEAR, m, start, zus.startDate ? zus.path : 'full');
    row.regime = reg.regime;
    const ageExempt = monthIndex(C.YEAR, m) >= exemptIdx;
    row.fpExempt = ageExempt;
    if (!zus.enabled) {
      row.regime = reg.regime === 'inactive' ? 'inactive' : 'disabled';
    } else if (reg.regime === 'inactive' || reg.regime === 'ulga') {
      // no social insurance (ulga: art. 18 ust. 1 PP – przedsiębiorca nie podlega ubezpieczeniom)
    } else if (zus.employmentContract) {
      // art. 9 ust. 1 i 1a uSUS: umowa o pracę ≥ minimalne ⇒ JDG social contributions voluntary → 0
      row.regime = 'employment';
    } else {
      let base;
      let fpDue;
      if (reg.regime === 'full') { base = C.FULL_BASE; fpDue = true; }
      else if (reg.regime === 'pref') { base = C.PREF_BASE; fpDue = false; }
      else if (reg.regime === 'fullPartial') { base = r2((C.FULL_BASE * reg.days) / reg.dim); fpDue = opts.fpInPartialFirstMonth; }
      else if (reg.regime === 'prefPartial') { base = r2((C.PREF_BASE * reg.days) / reg.dim); fpDue = false; }
      // art. 259 ust. 1 pkt 4 uRP: FP only when the (full-month) base ≥ minimum wage; pref base 1 441,80 < 4 806.
      // art. 261 uRP: no FP for women 55+/men 60+.
      if (ageExempt) fpDue = false;
      row.base = base;
      row.days = reg.days || null;
      Object.assign(row, contributionsForBase(base, !!zus.chorobowe, fpDue, opts));
      if (wakacjeMonth === m) {
        // art. 17a uSUS (emer., rent., wyp., chor.) + art. 259 ust. 1 pkt 4 lit. o uRP (FP/FS)
        row.regime = 'wakacje:' + row.regime;
        row.emer = row.rent = row.chor = row.wyp = row.fp = 0;
      }
    }
    row.social = r2(row.emer + row.rent + row.chor + row.wyp);
    row.total = r2(row.social + row.fp);
    months.push(row);
  }
  return months;
}

// Wakacje składkowe eligibility (art. 17a–17b, 36d uSUS):
//  * application filed in the month preceding the exempt month E (art. 36d ust. 1),
//  * in the month preceding the filing month the person was subject to emer./rent./wyp.
//    insurance from the JDG (art. 17a ust. 1 pkt 4) ⇒ E ≥ F + 2, F = first month of being subject
//    (a partial month counts – the statute says "podlegał", not "przez cały miesiąc"),
//  * not in ulga na start (no insurance), not when JDG social is voluntary due to employment,
//  * once per calendar year (art. 17b ust. 1). Revenue ≤ 2 mln EUR and de minimis assumed met.
export function wakacjeCandidates(zus) {
  if (!zus.enabled) return { eligible: false, reason: 'zus disabled', months: [] };
  if (zus.employmentContract) return { eligible: false, reason: 'employment contract – JDG social contributions not mandatory', months: [] };
  const start = parseDate(zus.startDate);
  // first month F (absolute index) of being subject to social insurance
  let F;
  if (!start) F = -Infinity;
  else {
    F = null;
    for (let k = 0; k < 400; k++) {
      const idx = monthIndex(start.y, start.m) + k;
      const y = Math.floor(idx / 12), m = (idx % 12) + 1;
      if (SUBJECT_REGIMES.has(monthRegime(y, m, start, zus.path).regime)) { F = idx; break; }
    }
  }
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const idx = monthIndex(C.YEAR, m);
    const reg = monthRegime(C.YEAR, m, start, start ? zus.path : 'full').regime;
    if (idx >= F + 2 && (reg === 'full' || reg === 'pref')) months.push(m);
  }
  if (!months.length) return { eligible: false, reason: 'no month in ' + C.YEAR + ' satisfies E ≥ F+2 (F = first month subject to social insurance)', months };
  return { eligible: true, reason: null, months };
}

export function computeSchedule(zus, opts = DEFAULT_OPTIONS) {
  const raw = buildSchedule(zus, opts, null);
  let wak = { requested: !!zus.wakacje, eligible: false, month: null, reason: null, candidates: [] };
  let months = raw;
  if (zus.enabled && zus.wakacje) {
    const cand = wakacjeCandidates(zus);
    wak.eligible = cand.eligible;
    wak.reason = cand.reason;
    wak.candidates = cand.months;
    if (cand.eligible) {
      // highest contribution month, earliest on ties
      let best = null;
      for (const m of cand.months) if (best === null || raw[m - 1].total > raw[best - 1].total + 1e-9) best = m;
      wak.month = best;
      months = buildSchedule(zus, opts, best);
    }
  }
  return { months, wakacje: wak, ...sumSchedule(months) };
}

function sumSchedule(months) {
  const S = r2(months.reduce((a, r) => a + r.social, 0)); // deductible social (art. 26 ust. 1 pkt 2 lit. a)
  const FP = r2(months.reduce((a, r) => a + r.fp, 0)); // FP+FS – only KUP (not "składki na ubezpieczenia społeczne")
  return { S, FP, total: r2(S + FP) };
}

// Months of health insurance in C.YEAR (art. 81 ust. 2b/2e uŚOZ: months of being subject;
// contribution is monthly and indivisible – art. 79 ust. 2 – so the start month counts fully,
// also during ulga na start – art. 79a/81 ust. 2 list art. 18 ust. 1 PP persons).
export function healthMonths(zus, opts = DEFAULT_OPTIONS) {
  if (!zus.enabled && opts.healthMonthsWhenZusDisabled === '12') return 12;
  const s = parseDate(zus.startDate);
  if (!s || s.y < C.YEAR) return 12;
  return 13 - s.m;
}

// ---------------------------------------------------------------------------
// Tax variants
// ---------------------------------------------------------------------------

// Split JDG income after KUP into qualified (5%) and non-qualified parts.
// The IP BOX coefficient is "część dochodu opodatkowana 5%" (UI). Losses are never qualified.
function splitIp(incomeAfterKup, coeff, fpPart) {
  // fpPart: amount of FP to charge only to the non-qualified part (ipBoxFpAllocation='nonQualified')
  const inc = incomeAfterKup + fpPart; // income before the non-qualified-only FP
  if (inc <= 0) return { q: 0, nq: incomeAfterKup };
  const q = inc * coeff;
  return { q, nq: inc - q - fpPart };
}

function baselineFor(ctx, opts, spouseIncluded) {
  const pitOther = scaleTax(ctx.other, opts);
  const dan = opts.baselineIncludesDanina ? danina(ctx.other) : 0;
  const spouse = spouseIncluded ? scaleTax(ctx.spouse, opts) : 0;
  return { pitOther, daninaOther: dan, spousePit: spouse, total: r2(pitOther + dan + spouse) };
}

// ---------------------------------------------------------------------------
// Family reliefs: ulga na dzieci (art. 27f), samotny rodzic (art. 6 ust. 4c–4f, 8), ulga 4+ (art. 21
// ust. 1 pkt 153). Sources: docs/prawo/research-ulgi-rodzinne.md, docs/decyzje/specyfikacja-ulg-rodzinnych.md.
// ---------------------------------------------------------------------------

// Relief of the family per year, month by month (art. 27f ust. 2): in a month with n eligible children
// the rates of children 1…n are added (92,67 / 92,67 / 166,67 / 225 …). A child is given either as an
// explicit period { from, to } (months 1–12, inclusive – the law) or as a NUMBER of months { months }; for
// the latter the ASSUMPTION (SPEC/RD3 of the app at 4c0ee3d) is that periods overlap maximally: a child
// with m months is eligible in the last m months of the year.
export function childEligible(c, m) {
  if (c.from !== undefined && c.to !== undefined) return m >= c.from && m <= c.to;
  return c.months >= 13 - m;
}
export function childReliefAmount(children) {
  let U = 0;
  for (let m = 1; m <= 12; m++) {
    const n = children.filter((c) => childEligible(c, m)).length;
    for (let k = 1; k <= n; k++) U += k <= 2 ? C.CHILD_RATE_1_2 : k === 3 ? C.CHILD_RATE_3 : C.CHILD_RATE_4PLUS;
  }
  return r2(U);
}
// art. 27f ust. 2b: the one-child income limit does not apply once the taxpayer had more than one eligible
// child for at least one day (≈ month); ust. 2e: nor when the only child has a disability certificate.
// Sequential children (never together) → the limit applies unless every child is disabled (my reading).
export function childLimitApplies(children) {
  let maxN = 0;
  for (let m = 1; m <= 12; m++) maxN = Math.max(maxN, children.filter((c) => childEligible(c, m)).length);
  if (maxN >= 2) return false;
  return !children.every((c) => c.disabled);
}

// Contributions on employment income when the user leaves the field empty (research §4.1 pt 5):
// gross G = (D + 3 000) / (1 − 13,71%); social 13,71% × G; health 9% × (G − social); each to the grosz.
export function estimateEmployeeContrib(D, fopts = FAMILY_OPTIONS) {
  if (!(D > 0) && !fopts.estimateContribWhenZeroIncome) return 0;
  const G = r2((pos(D) + C.EST_EMPLOYEE_COSTS) / (1 - C.EST_EMPLOYEE_SOCIAL_RATE));
  const soc = r2(C.EST_EMPLOYEE_SOCIAL_RATE * G);
  return r2(soc + r2(0.09 * (G - soc)));
}

// One household evaluation of the child relief for one variant/mode.
//  info.mode: 'indiv' | 'single' (art. 6 ust. 4d) | 'joint' (art. 6 ust. 2)
//  info.userScaleTax: taxpayer's tax under art. 27 in this mode (joint: the couple's joint tax)
//  info.limitIncomeUser: taxpayer's incomes for the one-child limit (art. 27f ust. 2a: art. 27 + 30c
//    incomes after art. 26 social and deducted linear health; no ryczałt, no IP BOX qualified income)
//  info.capBusiness: JDG contributions that count for the refund cap (art. 27f ust. 9)
//  info.hasScaleReturnUser: the taxpayer files PIT-36/37 (refund only there – art. 27f ust. 8)
//  info.linOrRycz: the taxpayer uses art. 30c or ryczałt (art. 6 ust. 8)
function familyEval(ctx, info) {
  const F = ctx.fam, fo = ctx.fopts;
  const married = F.status === 'married';
  let limit;
  if (married) limit = C.CHILD_LIMIT_MARRIED;
  else if (F.status === 'single') limit = info.linOrRycz && fo.singleParentLimitLinRycz === 'cautious' ? C.CHILD_LIMIT_OTHER : C.CHILD_LIMIT_SINGLE_PARENT;
  else limit = C.CHILD_LIMIT_OTHER;
  // art. 27f ust. 2a: sum of incomes; each source floored at 0 by the callers (art. 9 ust. 2).
  const limitIncome = r2(pos(info.limitIncomeUser) + (married ? pos(ctx.spouse) + pos(F.spouseLinearIncome) : 0));
  const limitFailed = F.limitApplies && limitIncome > limit; // all-or-nothing
  const U = limitFailed ? 0 : F.reliefTotal;
  // art. 27f ust. 4: spouses split freely → optimal for the household; single parent 100%; others: share.
  const Uu = married || F.status === 'single' ? U : r2((U * F.share) / 100);
  const spouseSepTax = married && info.mode !== 'joint' ? scaleTax(ctx.spouse) : 0;
  const pool = pos(info.userScaleTax) + spouseSepTax;
  const used = r2(Math.min(Uu, pool));
  // art. 27f ust. 9–10: cap = taxpayer's (+ spouse's) contributions; refund only through PIT-36/37.
  const cap = r2(info.capBusiness + F.otherContrib + (married ? F.spouseContrib : 0));
  const canRefund = info.hasScaleReturnUser || (married && ctx.spouse > 0);
  const refund = canRefund ? r2(Math.min(Uu - used, cap)) : 0;
  return { mode: info.mode, reliefTotal: F.reliefTotal, limitApplies: F.limitApplies, limit, limitIncome, limitFailed, relief: Uu, used, refund, lost: r2(Uu - used - refund), cap, spouseSepTax };
}

function applyFamily(ctx, res, info) {
  const fe = familyEval(ctx, info);
  res.pit = r2(res.pit + fe.spouseSepTax - fe.used - fe.refund);
  res.baseline = ctx.famBaseline;
  res.total = r2(res.pit + res.danina + res.health + ctx.S + ctx.FP - res.baseline.total);
  res.family = fe;
  return res;
}

// H0: the household without the business (only other income and the spouse), best legal mode:
// individual, single parent (status single), joint (married, joint filing enabled, spouse not on
// liniowy/ryczałt) – with relief, split and refund. Danina on other income as in A10.
function familyBaseline(ctx, opts) {
  const F = ctx.fam;
  const modes = ['indiv'];
  if (F.status === 'single') modes.push('single');
  if (F.jointPossible) modes.push('joint');
  let best = null;
  for (const mode of modes) {
    const tax = mode === 'indiv' ? scaleTax(ctx.other, opts) : jointScaleTax(ctx.other, mode === 'joint' ? ctx.spouse : 0, opts);
    const fe = familyEval(ctx, { mode, userScaleTax: tax, limitIncomeUser: ctx.other, capBusiness: 0, hasScaleReturnUser: ctx.other > 0, linOrRycz: false });
    const val = r2(tax + fe.spouseSepTax - fe.used - fe.refund);
    if (!best || val < best.val - 1e-9) best = { val, mode, tax, fe };
  }
  const dan = opts.baselineIncludesDanina ? danina(ctx.other) : 0;
  const spousePit = F.status === 'married' ? scaleTax(ctx.spouse, opts) : 0;
  return { pitOther: best.tax, daninaOther: dan, spousePit, total: r2(best.val + dan), mode: best.mode, family: best.fe };
}

// Skala (optionally IP BOX, optionally joint).
// Social options: 'art26' – deducted from the taxpayer's total scale income (art. 26 ust. 1 pkt 2
// lit. a uPIT; excess lost), 'kup' – booked as KUP (art. 22 ust. 1; a JDG loss cannot reduce
// other-source income in the same year, art. 9 ust. 3). FP/FS always KUP.
// Health: 9% × max(D − FP − S, n × 4 806) (art. 79 ust. 1, 81 ust. 2 & 2b uŚOZ) – the base is
// the same whether S is KUP or deducted ("pomniejszony o składki… jeżeli nie zostały zaliczone do KUP").
// Health is not deductible on the scale (nor with IP BOX).
function evalScale(ctx, opts, { ip, joint, single = false }) {
  const methods = ['art26'];
  if (!ip || opts.ipBoxAllowKupSocial) methods.push('kup');
  const results = methods.map((method) => {
    const kupSocial = method === 'kup' ? ctx.S : 0;
    const fpNqOnly = ip && opts.ipBoxFpAllocation === 'nonQualified' ? ctx.FP : 0;
    // 4+ (art. 21 ust. 1 pkt 153): exempt revenue E; all costs stay deductible (art. 22 ust. 3a, 23 ust. 10).
    const incAfterKup = ctx.D - ctx.E - ctx.FP - kupSocial;
    let q = 0, nq = incAfterKup;
    if (ip) ({ q, nq } = splitIp(incAfterKup, ctx.coeff, fpNqOnly));
    const scaleIncome = pos(nq) + ctx.other; // loss of a source does not reduce other sources
    const art26 = method === 'art26' ? Math.min(ctx.S, scaleIncome) : 0;
    const taxable = scaleIncome - art26;
    // single parent (art. 6 ust. 4d): 2 × tax on half of the scale income (IP BOX qualified income outside)
    const pitScale = joint ? jointScaleTax(taxable, ctx.spouse, opts) : single ? jointScaleTax(taxable, 0, opts) : scaleTax(taxable, opts);
    const pitIp = ip ? taxRound(C.IPBOX_RATE * baseRound(q, opts), opts) : 0;
    const healthBase = ctx.D - ctx.FP - ctx.S;
    const health = r2(Math.max(C.HEALTH_SCALE_RATE * healthBase, C.HEALTH_MIN_MONTHLY * ctx.n));
    // UD116 (reform 2027): qualified IP BOX income (art. 30ca ust. 3) joins the danina base.
    const dan = danina(taxable + (ip && C.DANINA_INCLUDES_IPBOX ? q : 0));
    const baseline = baselineFor(ctx, opts, joint);
    const pit = r2(pitScale + pitIp);
    const total = r2(pit + dan + health + ctx.S + ctx.FP - baseline.total);
    const res = {
      method: { social: method, health: 'none' },
      pit, pitParts: { scale: pitScale, ipBox5: pitIp }, danina: dan, health, social: ctx.S, fp: ctx.FP,
      baseline, total,
      detail: { qualifiedIncome: r2(q), nonQualifiedIncome: r2(nq), scaleIncome: r2(scaleIncome), socialDeductedArt26: r2(art26), socialKup: kupSocial, taxableScale: r2(taxable), healthBase: r2(healthBase) },
    };
    if (ctx.E) res.detail.fourPlusExempt = ctx.E;
    // Refund cap (art. 27f ust. 9): S deducted under art. 26 in full (also when it exceeds income),
    // S booked as KUP does not count; scale health in full (never deducted on the scale).
    if (ctx.famChild) {
      // Limit income: amounts in grosze as in the return – the qualified IP BOX income is rounded first
      // (a half-grosz split must not decide the all-or-nothing test).
      const limitTaxable = ip && q > 0 ? pos(incAfterKup - r2(q)) + ctx.other - art26 : taxable;
      applyFamily(ctx, res, { mode: joint ? 'joint' : single ? 'single' : 'indiv', userScaleTax: pitScale, limitIncomeUser: limitTaxable, capBusiness: (method === 'art26' ? ctx.S : 0) + health, hasScaleReturnUser: true, linOrRycz: false });
    }
    return res;
  });
  return pickBest(results);
}

// Linear 19% (optionally IP BOX). Joint filing impossible (art. 6 ust. 8 uPIT).
// Social options: 'lin' – from linear income (art. 30c ust. 2 pkt 1), 'kup', 'scale' – from other
// scale income (art. 26 ust. 13a / 30c ust. 3 pkt 2 alternative).
// Health: 4,9% × (D − FP − S), min n × 432,54 (art. 79a ust. 1–2, 81 ust. 2 uŚOZ); deductible from
// linear income or KUP up to 14 100 zł/year (art. 30c ust. 2 pkt 2, art. 23 ust. 1 pkt 58; annual
// limit, no proration – M.P. 2025 poz. 1274). With IP BOX only from the linear (non-qualified) part.
function evalLinear(ctx, opts, { ip }) {
  const socialMethods = ['lin', 'kup', 'scale'].filter((m) => !(ip && m === 'kup' && !opts.ipBoxAllowKupSocial));
  const healthMethods = opts.linearHealthKupCascade ? ['deduct', 'kup'] : ['deduct'];
  const results = [];
  for (const sm of socialMethods) for (const hm of healthMethods) {
    const kupSocial = sm === 'kup' ? ctx.S : 0;
    const healthBase0 = ctx.D - ctx.FP - ctx.S;
    const minH = C.HEALTH_MIN_MONTHLY * ctx.n;
    let H;
    if (hm === 'kup') {
      // fixed point H = max(min, 4,9% × (base − min(H, limit)))
      let h = 0.049 * healthBase0 / 1.049;
      if (h > C.LINEAR_HEALTH_DEDUCTION_LIMIT) h = 0.049 * (healthBase0 - C.LINEAR_HEALTH_DEDUCTION_LIMIT);
      H = r2(Math.max(h, minH));
    } else {
      H = r2(Math.max(C.HEALTH_LINEAR_RATE * healthBase0, minH));
    }
    const Hded = Math.min(H, C.LINEAR_HEALTH_DEDUCTION_LIMIT);
    const fpNqOnly = ip && opts.ipBoxFpAllocation === 'nonQualified' ? ctx.FP : 0;
    const incAfterKup = ctx.D - ctx.E - ctx.FP - kupSocial - (hm === 'kup' ? Hded : 0);
    let q = 0, nq = incAfterKup;
    if (ip) ({ q, nq } = splitIp(incAfterKup, ctx.coeff, fpNqOnly));
    let linIncome = pos(nq);
    let socialFromLin = 0, socialToScale = 0;
    if (sm === 'lin') {
      socialFromLin = Math.min(ctx.S, linIncome);
      linIncome -= socialFromLin;
      if (opts.linearSurplusToScale) socialToScale = ctx.S - socialFromLin;
    } else if (sm === 'scale') socialToScale = ctx.S;
    let healthFromLin = 0;
    if (hm === 'deduct') { healthFromLin = Math.min(Hded, linIncome); linIncome -= healthFromLin; }
    const linBase = linIncome;
    const pitLin = taxRound(C.LINEAR_RATE * baseRound(linBase, opts), opts);
    const pitIp = ip ? taxRound(C.IPBOX_RATE * baseRound(q, opts), opts) : 0;
    const socialFromScale = Math.min(socialToScale, ctx.other);
    const otherTaxable = ctx.other - socialFromScale;
    const pitOther = scaleTax(otherTaxable, opts);
    const dan = danina(linBase + otherTaxable + (ip && C.DANINA_INCLUDES_IPBOX ? q : 0));
    const baseline = baselineFor(ctx, opts, false);
    const pit = r2(pitLin + pitIp + pitOther);
    const total = r2(pit + dan + H + ctx.S + ctx.FP - baseline.total);
    const healthDeducted = hm === 'deduct' ? healthFromLin : Hded;
    const res = {
      method: { social: sm, health: hm },
      pit, pitParts: { linear: pitLin, ipBox5: pitIp, otherScale: pitOther }, danina: dan, health: H, social: ctx.S, fp: ctx.FP,
      baseline, total,
      detail: { qualifiedIncome: r2(q), nonQualifiedIncome: r2(nq), linearTaxBase: r2(linBase), socialFromLinear: r2(socialFromLin), socialFromScale: r2(socialFromScale), socialKup: kupSocial, healthDeducted: r2(healthDeducted), healthBase: r2(healthBase0), otherTaxable: r2(otherTaxable) },
    };
    if (ctx.E) res.detail.fourPlusExempt = ctx.E;
    if (ctx.famChild) {
      // Refund cap: method 'scale' – S deducted under art. 26 → counts; 'kup' → 0; 'lin' – only the part
      // not deducted in PIT-36L (see FAMILY_OPTIONS.linearLinMethodCapSocial). Linear health: the part not
      // deducted in PIT-36L (above the limit / above linear income) counts (FAMILY_OPTIONS.capIncludesUndeductedHealth).
      // The taxpayer's own JDG contributions count only when he files PIT-36/37 (other scale income):
      // MF (broszura PIT-36, część M) – składki „podlegające odliczeniu od dochodu w zeznaniu PIT-37/36”.
      let capS = 0;
      if (sm === 'scale') capS = ctx.S;
      else if (sm === 'lin' && ctx.fopts.linearLinMethodCapSocial === 'undeducted') capS = ctx.S - socialFromLin;
      const capH = ctx.fopts.capIncludesUndeductedHealth ? H - healthDeducted : 0;
      // Social: only when the taxpayer files PIT-36/37 (MF: "podlegających odliczeniu od dochodu w PIT-37/36");
      // health (ust. 9 pkt 2): paid minus deducted in PIT-36L, no such condition (matters for the spouse, ust. 10).
      const files36 = ctx.other > 0;
      const limitLin = ip && q > 0 ? pos(pos(incAfterKup - r2(q)) - socialFromLin - healthFromLin) : pos(linBase);
      applyFamily(ctx, res, { mode: 'indiv', userScaleTax: pitOther, limitIncomeUser: limitLin + otherTaxable, capBusiness: (files36 ? capS : 0) + capH, hasScaleReturnUser: files36, linOrRycz: true });
    }
    results.push(res);
  }
  return pickBest(results);
}

function ryczaltTier(rev) {
  if (rev <= C.RYCZALT_THRESHOLDS[0]) return 0;
  if (rev <= C.RYCZALT_THRESHOLDS[1]) return 1;
  return 2;
}

// Ryczałt tax on a set of buckets {rateKey: revenue} given the total deduction Dtot, split in
// proportion to revenues (art. 11 ust. 3 uRycz; audit B1/B2 – 8,5% and 12,5% are different rates).
//
// Reform 2027 (UD458, `surcharge` = { threshold: 300 000 × EUR rate, rate: 0.17 }): revenue above the
// threshold is taxed at 17%. ASSUMPTIONS (no bill text): with several rates the excess is split across
// the buckets in proportion to their revenue (chronology unknown); the 8,5%/12,5% split applies to the
// bucket's non-excess part; all excess portions are pooled into one 17% part; the total deduction is
// split in proportion to revenue over all parts, the 17% part included.
//
// 4+ exemption (art. 21 ust. 1 pkt 153, `exempt` = E zł of revenue): the exempt revenue is the FIRST
// revenue of the year (exemption "od początku roku" until the limit is used – KIS
// 0115-KDIT2.4011.544.2023.1.AB). ASSUMPTIONS (RD16, research §8.9): with several rates E is split in
// proportion to the buckets' revenue; inside the 8,5%/12,5% bucket E uses up the part below 100 000 first;
// the reform's 17% excess (end of the year) is not affected. Deductions are split over taxable parts only.
function ryczaltTaxOnBuckets(buckets, Dtot, opts, surcharge = null, exempt = 0) {
  const parts = [];
  const Ptot = Object.values(buckets).reduce((a, v) => a + (v > 0 ? v : 0), 0);
  const excess = surcharge && Ptot > surcharge.threshold ? Ptot - surcharge.threshold : 0;
  for (const [key, rev0] of Object.entries(buckets)) {
    if (!(rev0 > 0)) continue;
    const rev = excess > 0 ? rev0 - (excess * rev0) / Ptot : rev0;
    const ex = exempt > 0 ? Math.min(rev, (exempt * rev0) / Ptot) : 0;
    if (key === '8.5-12.5') {
      const p85 = Math.min(rev, C.R85_THRESHOLD) - Math.min(ex, C.R85_THRESHOLD);
      if (ex > 0) {
        if (p85 > 0) parts.push({ rate: 0.085, rev: p85, key: '8.5(≤100k)' });
        const p125 = rev - Math.max(C.R85_THRESHOLD, ex);
        if (p125 > 0) parts.push({ rate: 0.125, rev: p125, key: '12.5(>100k)' });
      } else {
        parts.push({ rate: 0.085, rev: p85, key: '8.5(≤100k)' });
        if (rev > C.R85_THRESHOLD) parts.push({ rate: 0.125, rev: rev - C.R85_THRESHOLD, key: '12.5(>100k)' });
      }
    } else if (ex > 0) {
      if (rev - ex > 0) parts.push({ rate: Number(key) / 100, rev: rev - ex, key });
    } else parts.push({ rate: Number(key) / 100, rev, key });
  }
  if (excess > 0) parts.push({ rate: surcharge.rate, rev: excess, key: '17(>300kEUR)' });
  const P = parts.reduce((a, p) => a + p.rev, 0);
  let tax = 0;
  const detail = [];
  for (const p of parts) {
    const ded = P > 0 ? (Dtot * p.rev) / P : 0;
    const base = pos(p.rev - ded);
    const t = taxRound(p.rate * baseRound(base, opts), opts);
    tax += t;
    detail.push({ bucket: p.key, revenue: p.rev, deduction: r2(ded), base: r2(base), tax: t });
  }
  return { tax: r2(tax), detail };
}

// Ryczałt (single rate or multi-rate). Joint filing impossible (art. 6 ust. 8 uPIT).
// Social options: 'ryczalt' – from ryczałt revenue (art. 11 ust. 1 uRycz), any excess over
// revenue (after the 50% health deduction) → other scale income (art. 26 ust. 13a; SPEC);
// 'scale' – everything from other scale income (art. 26). FP/FS not deductible anywhere.
// Health: n × {498,35 | 830,58 | 1 495,04} by revenue tier (art. 81 ust. 2e uŚOZ); revenue for the
// tier reduced by social contributions NOT deducted under uPIT (art. 81 ust. 2g) – i.e. those
// deducted from ryczałt revenue, or not deducted at all. 50% of health deducted from ryczałt
// revenue (art. 11 ust. 1a uRycz), proportionally across rates (art. 11 ust. 3).
function evalRyczalt(ctx, opts, buckets) {
  // Sum in grosze: a float sum like 9731.85 + 71727.63 = 81459.48000000001 would wrongly exceed a tier.
  const P = r2(Object.values(buckets).reduce((a, v) => a + (v > 0 ? v : 0), 0));
  // 4+: taxable revenue after the exemption; the health tier still uses the full revenue (art. 81 ust. 2zd).
  const E = ctx.fourPlusLeft > 0 ? Math.min(ctx.fourPlusLeft, P) : 0;
  const Ptax = E ? r2(P - E) : P;
  const methods = ['ryczalt', 'scale'];
  const results = [];
  for (const method of methods) {
    let chosen = null;
    for (let tier = 0; tier < 3 && !chosen; tier++) {
      const H = r2(C.RYCZALT_HEALTH_MONTHLY[tier] * ctx.n);
      const Hd = r2(C.RYCZALT_HEALTH_DEDUCTION_SHARE * H);
      let Sr = 0, toScale = 0;
      if (method === 'ryczalt') {
        Sr = Math.min(ctx.S, pos(Ptax - Hd));
        toScale = opts.ryczaltSurplusToScale ? ctx.S - Sr : 0;
      } else toScale = ctx.S;
      const Sscale = Math.min(toScale, ctx.other);
      const notDeductedUnderPit = ctx.S - Sscale; // Sr + wasted
      const tierRevenue = r2(P - notDeductedUnderPit); // compare in grosze (float safety)
      if (ryczaltTier(tierRevenue) !== tier) continue;
      chosen = { H, Hd, Sr, Sscale, tierRevenue, tier };
    }
    if (!chosen) throw new Error('no consistent ryczałt tier');
    const { H, Hd, Sr, Sscale, tierRevenue, tier } = chosen;
    const rt = ryczaltTaxOnBuckets(buckets, Sr + Hd, opts, ctx.ryczaltSurcharge, E);
    const otherTaxable = ctx.other - Sscale;
    const pitOther = scaleTax(otherTaxable, opts);
    const dan = danina(otherTaxable);
    const baseline = baselineFor(ctx, opts, false);
    const pit = r2(rt.tax + pitOther);
    const total = r2(pit + dan + H + ctx.S + ctx.FP - baseline.total);
    const res = {
      method: { social: method, health: 'ryczalt50' },
      pit, pitParts: { ryczalt: rt.tax, otherScale: pitOther }, danina: dan, health: H, social: ctx.S, fp: ctx.FP,
      baseline, total,
      detail: { revenue: P, tierRevenue: r2(tierRevenue), healthTier: tier + 1, healthDeduction50: Hd, socialFromRyczalt: r2(Sr), socialFromScale: r2(Sscale), socialWasted: r2(ctx.S - Sr - Sscale), buckets: rt.detail, otherTaxable: r2(otherTaxable) },
    };
    if (E) res.detail.fourPlusExempt = E;
    // Refund cap: S not deducted from ryczałt revenue (art. 27f ust. 9 pkt 1) – only when the taxpayer
    // files PIT-36/37 (other scale income; MF broszura PIT-36 część M); health not deducted (pkt 2) counts.
    if (ctx.famChild) {
      const files36 = ctx.other > 0;
      // 50% health actually deducted = min(Hd, taxable revenue) (the rest is lost, F4) → the remainder counts.
      const capH = ctx.fopts.capIncludesUndeductedHealth ? H - Math.min(Hd, Ptax) : 0;
      applyFamily(ctx, res, { mode: 'indiv', userScaleTax: pitOther, limitIncomeUser: otherTaxable, capBusiness: (files36 ? ctx.S - Sr : 0) + capH, hasScaleReturnUser: files36, linOrRycz: true });
    }
    results.push(res);
  }
  return pickBest(results);
}

function pickBest(results) {
  let best = results[0];
  for (const r of results) if (r.total < best.total - 1e-9) best = r;
  return { ...best, alternatives: results.map((r) => ({ method: r.method, total: r.total })) };
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------
export function normalizeInput(inp) {
  const zus = Object.assign({ enabled: true, startDate: null, path: 'full', chorobowe: true, birthDate: null, sex: null, employmentContract: false, wakacje: false }, inp.zus || {});
  return {
    revenue: Number(inp.revenue) || 0,
    costs: Number(inp.costs) || 0,
    otherScaleIncome: Number(inp.otherScaleIncome) || 0,
    ipBox: Object.assign({ enabled: false, coeff: 0 }, inp.ipBox || {}),
    joint: Object.assign({ enabled: false, spouseIncome: 0 }, inp.joint || {}),
    multiRate: Object.assign({ enabled: false, allocations: {} }, inp.multiRate || {}),
    zus,
    year: inp.year === undefined || inp.year === null ? 2026 : Number(inp.year),
    reform2027: !!inp.reform2027,
    revenuePrevYear: inp.revenuePrevYear === undefined || inp.revenuePrevYear === null || inp.revenuePrevYear === '' ? null : Number(inp.revenuePrevYear),
    family: normalizeFamily(inp),
  };
}

// FAMILY INPUT (optional; null/absent = no family card → outputs identical to the model without it):
// family: { status: 'married'|'single'|'other', children: [{ months: 1..12, disabled, adult }],
//           share: 0..100 (status 'other'), spouseLinRycz, spouseLinearIncome, spouseContrib: null|zł,
//           otherContrib: null|zł (null = estimate), fourPlus, fourPlusUsed }
// The spouse's scale income is joint.spouseIncome (also used when not filing jointly).
function normalizeFamily(inp) {
  const f = inp.family;
  if (!f) return null;
  const num = (x) => (x === undefined || x === null || x === '' ? null : Number(x));
  let status = f.status || 'other';
  if (inp.joint && inp.joint.enabled) status = 'married'; // art. 6 ust. 2: joint filing ⇒ spouses (RD13)
  return {
    status,
    children: (f.children || []).map((c) => ({ months: Number(c.months ?? 12), ...(c.from !== undefined && c.to !== undefined ? { from: Number(c.from), to: Number(c.to) } : {}), disabled: !!c.disabled, adult: !!c.adult })),
    share: f.share === undefined || f.share === null ? 100 : Number(f.share),
    spouseLinRycz: !!f.spouseLinRycz,
    spouseLinearIncome: num(f.spouseLinearIncome) || 0,
    spouseContrib: num(f.spouseContrib),
    otherContrib: num(f.otherContrib),
    fourPlus: !!f.fourPlus,
    fourPlusUsed: num(f.fourPlusUsed) || 0,
  };
}

// Reform 2027 ryczałt eligibility (UD458; art. 6 ust. 4 uRycz as amended): revenue of the previous
// year (2026) ≤ 250 000 EUR × rate (art. 4 ust. 2: NBP rate of 1.10.2026, no rounding). A business
// started in 2027 qualifies regardless of revenue (art. 6 ust. 4 pkt 2 – "bez względu na wysokość
// przychodów"), even if a 2026 revenue was typed. Empty 2026 revenue = the form's revenue (SPEC).
export function ryczaltEligibility(inp) {
  const R = C.RYCZALT_EUR_RULES;
  if (!R) return null;
  const limit = r2(R.eligibilityLimitEur * C.EUR_RATE);
  const s = parseDate(inp.zus.startDate);
  if (s && s.y === C.YEAR) return { eligible: true, limit, prevRevenue: null, reason: 'business started in ' + C.YEAR };
  const prev = inp.revenuePrevYear === null ? inp.revenue : inp.revenuePrevYear;
  const eligible = prev <= limit;
  return { eligible, limit, prevRevenue: prev, reason: eligible ? null : `2026 revenue ${prev} > 250 000 EUR × ${C.EUR_RATE} = ${limit}` };
}

function evaluateVariants(inp, sched, n, opts) {
  const ctx = {
    D: inp.revenue - inp.costs,
    S: sched.S,
    FP: sched.FP,
    n,
    other: inp.otherScaleIncome,
    spouse: inp.joint.spouseIncome || 0,
    coeff: (inp.ipBox.coeff || 0) / 100,
    ryczaltSurcharge: C.RYCZALT_EUR_RULES ? { threshold: r2(C.RYCZALT_EUR_RULES.surchargeThresholdEur * C.EUR_RATE), rate: C.RYCZALT_EUR_RULES.surchargeRate } : null,
    E: 0, fourPlusLeft: 0, fam: null, famChild: false, fopts: { ...FAMILY_OPTIONS, ...(opts.family || {}) },
  };
  const F = inp.family;
  if (F) {
    // 4+: E = min(85 528 − limit used on other revenue, JDG revenue); a larger "used" amount = 0 left.
    ctx.fourPlusLeft = F.fourPlus ? pos(C.FOUR_PLUS_LIMIT - F.fourPlusUsed) : 0;
    ctx.E = ctx.fourPlusLeft > 0 ? Math.min(ctx.fourPlusLeft, pos(inp.revenue)) : 0;
    if (F.children.length) {
      ctx.fam = {
        ...F,
        reliefTotal: childReliefAmount(F.children),
        limitApplies: childLimitApplies(F.children),
        otherContrib: F.otherContrib !== null ? F.otherContrib : estimateEmployeeContrib(ctx.other, ctx.fopts),
        spouseContrib: F.status === 'married' ? (F.spouseContrib !== null ? F.spouseContrib : estimateEmployeeContrib(ctx.spouse, ctx.fopts)) : 0,
        jointPossible: F.status === 'married' && inp.joint.enabled && !F.spouseLinRycz,
      };
      ctx.famChild = true;
      ctx.famBaseline = familyBaseline(ctx, opts);
    }
  }
  const v = {};
  v.taxScale = evalScale(ctx, opts, { ip: false, joint: false });
  if (ctx.famChild && F.status === 'single') v.taxScaleSingle = evalScale(ctx, opts, { ip: false, joint: false, single: true });
  if (inp.joint.enabled) v.taxScaleJoint = evalScale(ctx, opts, { ip: false, joint: true });
  if (inp.ipBox.enabled) {
    v.taxScaleIpBox = evalScale(ctx, opts, { ip: true, joint: false });
    if (ctx.famChild && F.status === 'single') v.taxScaleIpBoxSingle = evalScale(ctx, opts, { ip: true, joint: false, single: true });
    if (inp.joint.enabled) v.taxScaleIpBoxJoint = evalScale(ctx, opts, { ip: true, joint: true });
  }
  v.taxLinear = evalLinear(ctx, opts, { ip: false });
  if (inp.ipBox.enabled) v.taxLinearIpBox = evalLinear(ctx, opts, { ip: true });
  for (const rate of RYCZALT_RATES) v[RYCZALT_VARIANT_KEY[rate]] = evalRyczalt(ctx, opts, { [rate]: inp.revenue });
  if (inp.multiRate.enabled) {
    const alloc = {};
    for (const [k, val] of Object.entries(inp.multiRate.allocations || {})) if (Number(val) > 0) alloc[k] = Number(val);
    v.ryczaltMulti = evalRyczalt(ctx, opts, alloc);
  }
  return v;
}

export function computeAll(rawInput, userOpts = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...userOpts };
  const inp = normalizeInput(rawInput);
  const eurRate = opts.eurRate !== undefined ? opts.eurRate : EUR_RATE_2027_FORECAST;
  const prev = useYear(constantsFor(inp.year, inp.reform2027, eurRate));
  try {
    return computeAllActive(inp, opts);
  } finally {
    useYear(prev);
  }
}

const RYCZALT_KEYS = new Set([...Object.values(RYCZALT_VARIANT_KEY), 'ryczaltMulti']);

function computeAllActive(inp, opts) {
  const s = parseDate(inp.zus.startDate);
  if (s && (s.y > C.YEAR)) return { error: `startDate after ${C.YEAR}-12-31` };
  // 4+: "limit already used" above 85 528 is an input error (the app blocks results – RD16).
  if (inp.family && inp.family.fourPlus && inp.family.fourPlusUsed > C.FOUR_PLUS_LIMIT) return { error: 'fourPlusUsed above the 85 528 limit' };
  const n = healthMonths(inp.zus, opts);
  const sched = computeSchedule(inp.zus, opts);
  let variants = evaluateVariants(inp, sched, n, opts);
  let perVariantWakacje = null;
  if (opts.wakacjeMonthChoice === 'perVariant' && sched.wakacje.eligible) {
    perVariantWakacje = {};
    const best = {};
    const cands = opts.wakacjeAllowNone ? [...sched.wakacje.candidates, null] : sched.wakacje.candidates;
    for (const m of cands) {
      const months = buildSchedule(inp.zus, opts, m);
      const s2 = { months, ...sumSchedule(months) };
      const v2 = evaluateVariants(inp, s2, n, opts);
      for (const [k, r] of Object.entries(v2)) if (!best[k] || r.total < best[k].total - 1e-9) { best[k] = { ...r, holidayMonth: m, socialS: s2.S, socialFP: s2.FP }; perVariantWakacje[k] = m; }
    }
    variants = best;
  }
  const out = {
    healthMonths: n,
    social: { S: sched.S, FP: sched.FP, total: sched.total, months: sched.months },
    wakacje: sched.wakacje,
    perVariantWakacje,
    variants: {},
  };
  for (const [k, r] of Object.entries(variants)) {
    out.variants[k] = {
      total: r.total, pit: r.pit, pitParts: r.pitParts, danina: r.danina, health: r.health,
      social: r.social, fp: r.fp, socialTotal: r2(r.social + r.fp),
      baseline: r.baseline, method: r.method, detail: r.detail, alternatives: r.alternatives,
      holidayMonth: r.holidayMonth !== undefined ? r.holidayMonth : (sched.wakacje.month ?? null),
    };
    if (r.family) out.variants[k].family = r.family;
  }
  // Spouse on liniowy/ryczałt (art. 6 ust. 8): joint variants computed for information, not available.
  if (inp.family && inp.family.spouseLinRycz) for (const k of ['taxScaleJoint', 'taxScaleIpBoxJoint']) if (out.variants[k]) out.variants[k].unavailable = true;
  // Reform 2027: ryczałt not available (2026 revenue > 250 000 EUR) → variants stay computed for
  // information but are flagged and excluded from the ranking (SPEC_MULTIYEAR: "niedostępny").
  const elig = ryczaltEligibility(inp);
  if (elig && !elig.eligible) for (const [k, v] of Object.entries(out.variants)) if (RYCZALT_KEYS.has(k)) v.unavailable = true;
  const ranked = Object.entries(out.variants).filter(([, v]) => !v.unavailable).sort((a, b) => a[1].total - b[1].total);
  out.best = ranked.length ? { variant: ranked[0][0], total: ranked[0][1].total } : null;
  out.options = opts;
  if (inp.family) {
    // Only with the family card, so outputs without it stay byte-identical.
    const f = inp.family;
    out.family = { status: f.status, children: f.children.length, fourPlusExempt: f.fourPlus ? Math.min(pos(C.FOUR_PLUS_LIMIT - f.fourPlusUsed), pos(inp.revenue)) : 0 };
    const any = Object.values(variants).find((r) => r.family);
    if (any) out.family.baseline = any.baseline;
  }
  if (C.YEAR !== 2026) {
    // Extra fields only for years other than 2026, so the 2026 snapshot (expected.json) is unchanged.
    out.year = C.YEAR;
    out.scenario = C.SCENARIO || 'currentLaw';
    if (elig) out.ryczaltEligibility = { ...elig, eurRate: C.EUR_RATE, surchargeThreshold: r2(C.RYCZALT_EUR_RULES.surchargeThresholdEur * C.EUR_RATE) };
  }
  return out;
}
