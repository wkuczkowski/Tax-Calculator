// Independent reference model: Polish JDG tax + ZUS burden, tax year 2026.
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
//          employmentContract, wakacje }
// }
// OUTPUT: see computeAll().

// ---------------------------------------------------------------------------
// Constants 2026
// ---------------------------------------------------------------------------
export const C = {
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
  SCALE_THRESHOLD: 120000,
  SCALE_RATE1: 0.12,
  SCALE_RATE2: 0.32,
  SCALE_REDUCTION: 3600,
  LINEAR_RATE: 0.19, // art. 30c ust. 1 uPIT
  IPBOX_RATE: 0.05, // art. 30ca ust. 1 uPIT
  DANINA_THRESHOLD: 1000000, // art. 30h uPIT
  DANINA_RATE: 0.04,
  R85_THRESHOLD: 100000, // art. 12 ust. 1 pkt 4 uRycz (8,5% do 100 000 zł, 12,5% nadwyżki)
};

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

// Scale tax (art. 27 ust. 1 uPIT, 2026): 12% − 3 600 up to 120 000; 10 800 + 32% above.
export function scaleTaxRaw(base) {
  if (base <= C.SCALE_FREE) return 0;
  if (base <= C.SCALE_THRESHOLD) return C.SCALE_RATE1 * base - C.SCALE_REDUCTION;
  return 10800 + C.SCALE_RATE2 * (base - C.SCALE_THRESHOLD);
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
// Danina (art. 30h uPIT): 4% of the excess over 1 000 000 of incomes from art. 27, 30b, 30c, 30f
// after deducted social (art. 26 ust. 1 pkt 2, 30c ust. 2 pkt 1) and linear health (30c ust. 2 pkt 2).
// IP BOX (30ca) and ryczałt income are NOT part of the base.
export function danina(base) {
  return r2(C.DANINA_RATE * pos(base - C.DANINA_THRESHOLD));
}

// ---------------------------------------------------------------------------
// Social contributions month by month (2026)
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
  if (!months.length) return { eligible: false, reason: 'no month in 2026 satisfies E ≥ F+2 (F = first month subject to social insurance)', months };
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

// Months of health insurance in 2026 (art. 81 ust. 2b/2e uŚOZ: months of being subject;
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

// Skala (optionally IP BOX, optionally joint).
// Social options: 'art26' – deducted from the taxpayer's total scale income (art. 26 ust. 1 pkt 2
// lit. a uPIT; excess lost), 'kup' – booked as KUP (art. 22 ust. 1; a JDG loss cannot reduce
// other-source income in the same year, art. 9 ust. 3). FP/FS always KUP.
// Health: 9% × max(D − FP − S, n × 4 806) (art. 79 ust. 1, 81 ust. 2 & 2b uŚOZ) – the base is
// the same whether S is KUP or deducted ("pomniejszony o składki… jeżeli nie zostały zaliczone do KUP").
// Health is not deductible on the scale (nor with IP BOX).
function evalScale(ctx, opts, { ip, joint }) {
  const methods = ['art26'];
  if (!ip || opts.ipBoxAllowKupSocial) methods.push('kup');
  const results = methods.map((method) => {
    const kupSocial = method === 'kup' ? ctx.S : 0;
    const fpNqOnly = ip && opts.ipBoxFpAllocation === 'nonQualified' ? ctx.FP : 0;
    const incAfterKup = ctx.D - ctx.FP - kupSocial;
    let q = 0, nq = incAfterKup;
    if (ip) ({ q, nq } = splitIp(incAfterKup, ctx.coeff, fpNqOnly));
    const scaleIncome = pos(nq) + ctx.other; // loss of a source does not reduce other sources
    const art26 = method === 'art26' ? Math.min(ctx.S, scaleIncome) : 0;
    const taxable = scaleIncome - art26;
    const pitScale = joint ? jointScaleTax(taxable, ctx.spouse, opts) : scaleTax(taxable, opts);
    const pitIp = ip ? taxRound(C.IPBOX_RATE * baseRound(q, opts), opts) : 0;
    const healthBase = ctx.D - ctx.FP - ctx.S;
    const health = r2(Math.max(C.HEALTH_SCALE_RATE * healthBase, C.HEALTH_MIN_MONTHLY * ctx.n));
    const dan = danina(taxable);
    const baseline = baselineFor(ctx, opts, joint);
    const pit = r2(pitScale + pitIp);
    const total = r2(pit + dan + health + ctx.S + ctx.FP - baseline.total);
    return {
      method: { social: method, health: 'none' },
      pit, pitParts: { scale: pitScale, ipBox5: pitIp }, danina: dan, health, social: ctx.S, fp: ctx.FP,
      baseline, total,
      detail: { qualifiedIncome: r2(q), nonQualifiedIncome: r2(nq), scaleIncome: r2(scaleIncome), socialDeductedArt26: r2(art26), socialKup: kupSocial, taxableScale: r2(taxable), healthBase: r2(healthBase) },
    };
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
    const incAfterKup = ctx.D - ctx.FP - kupSocial - (hm === 'kup' ? Hded : 0);
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
    const dan = danina(linBase + otherTaxable);
    const baseline = baselineFor(ctx, opts, false);
    const pit = r2(pitLin + pitIp + pitOther);
    const total = r2(pit + dan + H + ctx.S + ctx.FP - baseline.total);
    results.push({
      method: { social: sm, health: hm },
      pit, pitParts: { linear: pitLin, ipBox5: pitIp, otherScale: pitOther }, danina: dan, health: H, social: ctx.S, fp: ctx.FP,
      baseline, total,
      detail: { qualifiedIncome: r2(q), nonQualifiedIncome: r2(nq), linearTaxBase: r2(linBase), socialFromLinear: r2(socialFromLin), socialFromScale: r2(socialFromScale), socialKup: kupSocial, healthDeducted: r2(hm === 'deduct' ? healthFromLin : Hded), healthBase: r2(healthBase0), otherTaxable: r2(otherTaxable) },
    });
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
function ryczaltTaxOnBuckets(buckets, Dtot, opts) {
  const parts = [];
  for (const [key, rev] of Object.entries(buckets)) {
    if (!(rev > 0)) continue;
    if (key === '8.5-12.5') {
      const p85 = Math.min(rev, C.R85_THRESHOLD);
      parts.push({ rate: 0.085, rev: p85, key: '8.5(≤100k)' });
      if (rev > C.R85_THRESHOLD) parts.push({ rate: 0.125, rev: rev - C.R85_THRESHOLD, key: '12.5(>100k)' });
    } else parts.push({ rate: Number(key) / 100, rev, key });
  }
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
  const methods = ['ryczalt', 'scale'];
  const results = [];
  for (const method of methods) {
    let chosen = null;
    for (let tier = 0; tier < 3 && !chosen; tier++) {
      const H = r2(C.RYCZALT_HEALTH_MONTHLY[tier] * ctx.n);
      const Hd = r2(C.RYCZALT_HEALTH_DEDUCTION_SHARE * H);
      let Sr = 0, toScale = 0;
      if (method === 'ryczalt') {
        Sr = Math.min(ctx.S, pos(P - Hd));
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
    const rt = ryczaltTaxOnBuckets(buckets, Sr + Hd, opts);
    const otherTaxable = ctx.other - Sscale;
    const pitOther = scaleTax(otherTaxable, opts);
    const dan = danina(otherTaxable);
    const baseline = baselineFor(ctx, opts, false);
    const pit = r2(rt.tax + pitOther);
    const total = r2(pit + dan + H + ctx.S + ctx.FP - baseline.total);
    results.push({
      method: { social: method, health: 'ryczalt50' },
      pit, pitParts: { ryczalt: rt.tax, otherScale: pitOther }, danina: dan, health: H, social: ctx.S, fp: ctx.FP,
      baseline, total,
      detail: { revenue: P, tierRevenue: r2(tierRevenue), healthTier: tier + 1, healthDeduction50: Hd, socialFromRyczalt: r2(Sr), socialFromScale: r2(Sscale), socialWasted: r2(ctx.S - Sr - Sscale), buckets: rt.detail, otherTaxable: r2(otherTaxable) },
    });
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
  };
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
  };
  const v = {};
  v.taxScale = evalScale(ctx, opts, { ip: false, joint: false });
  if (inp.joint.enabled) v.taxScaleJoint = evalScale(ctx, opts, { ip: false, joint: true });
  if (inp.ipBox.enabled) {
    v.taxScaleIpBox = evalScale(ctx, opts, { ip: true, joint: false });
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
  const s = parseDate(inp.zus.startDate);
  if (s && (s.y > C.YEAR)) return { error: 'startDate after 2026-12-31' };
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
  }
  const ranked = Object.entries(out.variants).sort((a, b) => a[1].total - b[1].total);
  out.best = ranked.length ? { variant: ranked[0][0], total: ranked[0][1].total } : null;
  out.options = opts;
  return out;
}
