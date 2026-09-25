// Generates cases.json/expected.json (2026) and cases2027.json/expected2027.json (2027: current law
// and the draft reform) using refModel.mjs.
// Run:   node tools/refmodel/genCases.mjs           – rewrites cases.json and expected.json
//        node tools/refmodel/genCases.mjs --check   – regenerates in memory and reports whether the
//                                                     committed files are up to date (exit 1 if not)
// Both files are written one case per line, so `git diff` shows exactly which cases changed.
import { readFileSync, writeFileSync } from 'node:fs';
import { computeAll, DEFAULT_OPTIONS, EUR_RATE_2027_FORECAST } from './refModel.mjs';

const cases = [];
let seq = 0;
const Z = (o = {}) => ({ enabled: true, startDate: null, path: 'full', chorobowe: true, birthDate: null, sex: null, employmentContract: false, wakacje: false, ...o });
function add(group, desc, inp) {
  seq++;
  cases.push({
    id: `${group}-${String(seq).padStart(3, '0')}`,
    group,
    desc,
    input: {
      revenue: 0, costs: 0, otherScaleIncome: 0,
      ipBox: { enabled: false, coeff: 0 },
      joint: { enabled: false, spouseIncome: 0 },
      multiRate: { enabled: false, allocations: {} },
      ...inp,
      zus: Z(inp.zus),
    },
  });
}

// Full ZUS 2026 (no start date, chorobowe): S = 21 459,48, FP = 1 661,64, total 23 121,12.
const ZUS_FULL = 23121.12;
const S_FULL = 21459.48;

// A. income boundaries (skala 30k/120k, danina 1M), full ZUS
for (const D of [-10000, 0, 10000, 23121.12, 30000, 53121.12, 53122, 60000, 120000, 143121.12, 143122, 150000, 250000, 1000000, 1023121.12, 1023122, 1100000, 2000000]) {
  const revenue = D < 0 ? 20000 : D;
  const costs = D < 0 ? 30000 : 0;
  add('A', `income ${D} full ZUS`, { revenue, costs });
  if (D > 0) add('A', `income ${D} costs 40% full ZUS`, { revenue: r(D / 0.6), costs: r(D / 0.6 - D) });
}
// A2. same boundaries with ZUS off
for (const D of [0, 30000, 120000, 1000000, 1200000]) add('A2', `income ${D} ZUS disabled`, { revenue: D, costs: 0, zus: { enabled: false } });

// B. ryczałt thresholds 60k / 300k incl. social effect (art. 81 ust. 2g)
for (const P of [59999, 60000, 60001, 60000 + S_FULL, 60000 + S_FULL + 0.01, 81500, 90000, 299999, 300000, 300001, 300000 + S_FULL, 300000 + S_FULL + 0.01, 330000]) {
  add('B', `ryczałt revenue ${r(P)} full ZUS`, { revenue: r(P), costs: 0 });
  add('B', `ryczałt revenue ${r(P)} full ZUS, other 150k`, { revenue: r(P), costs: 0, otherScaleIncome: 150000 });
}
for (const P of [65474.16, 65474.17, 65050.32, 65050.33, 70000]) {
  add('B', `ryczałt revenue ${P} pref ZUS (start 2025-06-01 pref)`, { revenue: P, zus: { startDate: '2025-06-01', path: 'pref', chorobowe: P !== 65050.32 && P !== 65050.33 } });
  add('B', `ryczałt revenue ${P} pref ZUS, other 50k`, { revenue: P, otherScaleIncome: 50000, zus: { startDate: '2025-06-01', path: 'pref', chorobowe: P !== 65050.32 && P !== 65050.33 } });
}
for (const P of [60000, 60001, 300001]) add('B', `ryczałt revenue ${P} ulga (S=0)`, { revenue: P, zus: { startDate: '2026-01-01', path: 'ulga' } });

// C. 8,5% / 12,5% around 100k
for (const P of [99999, 100000, 100001, 102000, 110000, 121459.48, 200000, 500000]) add('C', `8.5/12.5 revenue ${P}`, { revenue: P });

// D. linear health deduction limit 14 100 (4,9% × base = 14 100 ⇒ base 287 755,10)
for (const D of [250000, 300000, 310876.22, 310877, 320000, 400000, 800000]) {
  add('D', `linear health limit, income ${D}`, { revenue: D });
  add('D', `linear health limit, income ${D}, IP BOX 50%`, { revenue: D, ipBox: { enabled: true, coeff: 50 } });
}

// E. start dates × paths × chorobowe
const STARTS = [null, '2026-01-01', '2026-01-02', '2026-03-01', '2026-03-15', '2026-06-30', '2026-07-01', '2026-12-31', '2025-08-01', '2025-09-15', '2024-03-10', '2023-01-01'];
for (const sd of STARTS) for (const path of ['full', 'ulga', 'pref']) for (const chor of [true, false]) {
  if (sd === null && path !== 'full') continue; // path irrelevant without date – still add one below
  add('E', `start ${sd} path ${path} chor ${chor}`, { revenue: 120000, costs: 20000, zus: { startDate: sd, path, chorobowe: chor } });
}
add('E', 'no start date but path ulga (path must be ignored)', { revenue: 120000, costs: 20000, zus: { startDate: null, path: 'ulga' } });
add('E', 'no start date but path pref (path must be ignored)', { revenue: 120000, costs: 20000, zus: { startDate: null, path: 'pref' } });
// E2. start dates at a high income (skala 32%, linear), low income
for (const sd of ['2026-03-15', '2026-07-01', '2025-09-15', '2024-03-10']) for (const path of ['full', 'ulga', 'pref']) {
  add('E2', `start ${sd} path ${path}, income 400k`, { revenue: 400000, costs: 0, zus: { startDate: sd, path } });
  add('E2', `start ${sd} path ${path}, revenue 40k`, { revenue: 40000, costs: 5000, zus: { startDate: sd, path } });
}

// F. FP age exemption
const AGE = [
  ['1971-05-01', 'K', 'woman 55 on 2026-05-01 (exempt from May)'],
  ['1971-05-02', 'K', 'woman 55 on 2026-05-02 (exempt from June)'],
  ['1966-10-15', 'M', 'man 60 on 2026-10-15 (exempt from Nov)'],
  ['1966-10-01', 'M', 'man 60 on 2026-10-01 (exempt from Oct)'],
  ['1966-12-31', 'M', 'man 60 on 2026-12-31 (no exemption in 2026)'],
  ['1971-01-01', 'K', 'woman 55 on 2026-01-01 (exempt all 2026)'],
  ['1970-12-02', 'K', 'woman 55 on 2025-12-02 (exempt all 2026)'],
  ['1971-05-01', 'M', 'man born 1971 (no exemption)'],
  ['1966-10-15', null, 'DOB without sex (no exemption)'],
  ['1960-06-15', 'M', 'man 66 (exempt all year)'],
];
for (const [dob, sex, d] of AGE) {
  add('F', `${d}, full ZUS all year`, { revenue: 150000, costs: 10000, zus: { birthDate: dob, sex } });
  add('F', `${d}, full ZUS, chorobowe off`, { revenue: 150000, costs: 10000, zus: { birthDate: dob, sex, chorobowe: false } });
}
for (const [dob, sex] of [['1971-05-01', 'K'], ['1971-05-02', 'K'], ['1966-10-15', 'M']]) {
  add('F', `age ${dob} ${sex}, start 2026-03-15 full (partial first month)`, { revenue: 150000, costs: 10000, zus: { birthDate: dob, sex, startDate: '2026-03-15', path: 'full' } });
  add('F', `age ${dob} ${sex}, 2024-03-10 pref → full from April`, { revenue: 150000, costs: 10000, zus: { birthDate: dob, sex, startDate: '2024-03-10', path: 'pref' } });
  add('F', `age ${dob} ${sex}, wakacje`, { revenue: 150000, costs: 10000, zus: { birthDate: dob, sex, wakacje: true } });
}

// G. employment contract ≥ minimum wage
for (const [sd, path] of [[null, 'full'], ['2026-03-15', 'full'], ['2026-01-01', 'ulga'], ['2025-09-15', 'pref']]) {
  add('G', `employment, start ${sd} ${path}`, { revenue: 100000, costs: 10000, otherScaleIncome: 80000, zus: { startDate: sd, path, employmentContract: true } });
  add('G', `employment + wakacje (ineligible), start ${sd} ${path}`, { revenue: 100000, costs: 10000, otherScaleIncome: 80000, zus: { startDate: sd, path, employmentContract: true, wakacje: true } });
}
add('G', 'employment, ryczałt near 60k (no social ⇒ tier by gross revenue)', { revenue: 61000, otherScaleIncome: 60000, zus: { employmentContract: true } });

// H. wakacje składkowe
const WAK = [
  [null, 'full'], ['2026-01-01', 'ulga'], ['2026-01-01', 'pref'], ['2026-01-01', 'full'], ['2026-03-01', 'full'], ['2026-03-15', 'full'],
  ['2026-04-01', 'ulga'], ['2026-05-01', 'ulga'], ['2026-10-01', 'full'], ['2026-10-15', 'pref'], ['2026-11-01', 'full'], ['2026-12-31', 'full'],
  ['2025-08-01', 'ulga'], ['2025-09-15', 'ulga'], ['2025-09-15', 'full'], ['2025-11-20', 'full'], ['2024-03-10', 'ulga'], ['2024-03-10', 'pref'], ['2023-01-01', 'pref'],
];
for (const [sd, path] of WAK) {
  add('H', `wakacje, start ${sd} ${path}`, { revenue: 150000, costs: 20000, zus: { startDate: sd, path, wakacje: true } });
}
add('H', 'wakacje, chorobowe off', { revenue: 150000, costs: 20000, zus: { wakacje: true, chorobowe: false } });
add('H', 'wakacje, 2024-03-10 ulga, revenue 69 000: month choice changes ryczałt health tier (perVariant would pick a pref month)', { revenue: 69000, zus: { startDate: '2024-03-10', path: 'ulga', wakacje: true } });
add('H', 'wakacje, 2024-03-10 ulga, ryczałt revenue 70 000', { revenue: 70000, zus: { startDate: '2024-03-10', path: 'ulga', wakacje: true } });

// I. other scale income 0 / 50k / 150k / 1.2M
for (const other of [0, 50000, 150000, 1200000]) {
  for (const [rev, costs] of [[0, 0], [10000, 30000], [40000, 5000], [100000, 20000], [250000, 50000], [1500000, 100000]]) {
    add('I', `other ${other}, rev ${rev}, costs ${costs}`, { revenue: rev, costs, otherScaleIncome: other });
  }
  add('I', `other ${other}, rev 120k, ulga start 2026-01-01`, { revenue: 120000, costs: 10000, otherScaleIncome: other, zus: { startDate: '2026-01-01', path: 'ulga' } });
  add('I', `other ${other}, rev 70k, pref 2025-09-15`, { revenue: 70000, costs: 10000, otherScaleIncome: other, zus: { startDate: '2025-09-15', path: 'pref' } });
  add('I', `other ${other}, rev 20k (S > income)`, { revenue: 20000, costs: 0, otherScaleIncome: other });
}
add('I', 'other 100k, rev 15k (ryczałt: surplus social → scale)', { revenue: 15000, otherScaleIncome: 100000 });
add('I', 'other 25k, rev 30k', { revenue: 30000, otherScaleIncome: 25000 });
add('I', 'other 119k, rev 50k (other just under 2nd bracket)', { revenue: 50000, otherScaleIncome: 119000 });
add('I', 'other 130k, rev 50k', { revenue: 50000, otherScaleIncome: 130000 });
add('I', 'other 1.01M, rev 200k', { revenue: 200000, otherScaleIncome: 1010000 });

// J. joint taxation
for (const sp of [0, 30000, 100000, 200000, 1500000]) {
  for (const [rev, costs, other] of [[0, 0, 0], [60000, 10000, 0], [200000, 0, 0], [250000, 0, 0], [500000, 100000, 50000], [1300000, 0, 0]]) {
    add('J', `joint spouse ${sp}, rev ${rev}, costs ${costs}, other ${other}`, { revenue: rev, costs, otherScaleIncome: other, joint: { enabled: true, spouseIncome: sp } });
  }
}
add('J', 'joint, JDG loss with KUP vs art26, other 80k, spouse 0', { revenue: 10000, costs: 25000, otherScaleIncome: 80000, joint: { enabled: true, spouseIncome: 0 } });
add('J', 'joint + ulga', { revenue: 150000, costs: 0, joint: { enabled: true, spouseIncome: 20000 }, zus: { startDate: '2026-02-01', path: 'ulga' } });
add('J', 'joint + IP BOX 60%', { revenue: 300000, costs: 20000, ipBox: { enabled: true, coeff: 60 }, joint: { enabled: true, spouseIncome: 40000 } });
add('J', 'joint + IP BOX 100%', { revenue: 300000, costs: 20000, ipBox: { enabled: true, coeff: 100 }, joint: { enabled: true, spouseIncome: 40000 }, otherScaleIncome: 50000 });
add('J', 'joint + IP BOX 30%, spouse 150k, other 150k', { revenue: 500000, costs: 0, ipBox: { enabled: true, coeff: 30 }, joint: { enabled: true, spouseIncome: 150000 }, otherScaleIncome: 150000 });

// K. IP BOX coefficients
for (const coeff of [0, 25, 50, 80, 100]) {
  for (const [rev, costs, other] of [[50000, 0, 0], [150000, 30000, 0], [400000, 50000, 0], [1500000, 0, 0], [30000, 0, 100000], [200000, 0, 150000]]) {
    add('K', `IP BOX ${coeff}%, rev ${rev}, costs ${costs}, other ${other}`, { revenue: rev, costs, otherScaleIncome: other, ipBox: { enabled: true, coeff } });
  }
}
add('K', 'IP BOX 90%, pref ZUS, other 0 (non-qualified part < social)', { revenue: 60000, ipBox: { enabled: true, coeff: 90 }, zus: { startDate: '2025-09-15', path: 'pref' } });
add('K', 'IP BOX 100%, loss', { revenue: 10000, costs: 40000, ipBox: { enabled: true, coeff: 100 } });

// L. multi-rate allocations
const MR = [
  { '12': 100000, '8.5': 100000 },
  { '8.5': 80000, '12': 70000, '15': 50000 },
  { '12': 200000 },
  { '8.5-12.5': 150000, '12': 50000 },
  { '8.5-12.5': 99000, '3': 1000 },
  { '2': 30000, '17': 30000 },
  { '5.5': 40000, '8.5': 21459.48 },
  { '5.5': 40000, '8.5': 41459.49 },
  { '14': 150000, '10': 150000, '3': 21459.48 },
  { '14': 150000, '10': 150000, '3': 21459.49 },
  { '8.5-12.5': 250000, '5.5': 250000, '17': 250000 },
  { '12': 5000, '8.5': 5000 },
];
MR.forEach((alloc, i) => {
  // Round the float sum to grosze (e.g. 40 000 + 21 459,48 = 61459.479999999996); the app's
  // strict parser rejects amounts with more than 2 decimals, which would make the case invalid.
  const tot = r(Object.values(alloc).reduce((a, b) => a + b, 0));
  add('L', `multi ${JSON.stringify(alloc)}`, { revenue: tot, multiRate: { enabled: true, allocations: alloc } });
  if (i % 2 === 0) add('L', `multi ${JSON.stringify(alloc)}, pref ZUS, other 60k`, { revenue: tot, otherScaleIncome: 60000, multiRate: { enabled: true, allocations: alloc }, zus: { startDate: '2025-09-15', path: 'pref' } });
  if (i % 3 === 0) add('L', `multi ${JSON.stringify(alloc)}, ulga 2026-03-15`, { revenue: tot, multiRate: { enabled: true, allocations: alloc }, zus: { startDate: '2026-03-15', path: 'ulga' } });
});
add('L', 'multi allocations sum ≠ revenue (sum 150k, revenue 200k)', { revenue: 200000, multiRate: { enabled: true, allocations: { '12': 100000, '8.5': 50000 } } });

// M. ZUS disabled with start date (health months interpretation)
add('M', 'ZUS disabled, start 2026-07-01 (health months: 12 by default option)', { revenue: 100000, zus: { enabled: false, startDate: '2026-07-01', path: 'ulga' } });
add('M', 'ZUS disabled, start 2026-03-15', { revenue: 50000, costs: 5000, otherScaleIncome: 50000, zus: { enabled: false, startDate: '2026-03-15', path: 'full' } });
add('M', 'ZUS disabled, joint + IP', { revenue: 300000, ipBox: { enabled: true, coeff: 50 }, joint: { enabled: true, spouseIncome: 50000 }, zus: { enabled: false } });

// N. mixed stress combos
add('N', 'everything: IP 40%, joint 60k, other 50k, multi, pref 2025-09-15, wakacje, woman 55 on 2026-05-02', {
  revenue: 250000, costs: 30000, otherScaleIncome: 50000, ipBox: { enabled: true, coeff: 40 }, joint: { enabled: true, spouseIncome: 60000 },
  multiRate: { enabled: true, allocations: { '12': 150000, '8.5-12.5': 100000 } },
  zus: { startDate: '2025-09-15', path: 'pref', wakacje: true, birthDate: '1971-05-02', sex: 'K' },
});
add('N', 'start 2026-12-31 full, revenue 5k (1-day month, health 1 month)', { revenue: 5000, zus: { startDate: '2026-12-31', path: 'full' } });
add('N', 'start 2026-12-31 pref, revenue 5k', { revenue: 5000, zus: { startDate: '2026-12-31', path: 'pref' } });
add('N', 'start 2026-06-30 full, big income 1.1M', { revenue: 1100000, zus: { startDate: '2026-06-30', path: 'full' } });
add('N', 'zero everything', { revenue: 0, costs: 0 });
add('N', 'HAND-CHECK 1: start 2026-03-15 full, woman 55 on 2026-05-02, wakacje, rev 150k costs 10k', { revenue: 150000, costs: 10000, zus: { startDate: '2026-03-15', path: 'full', birthDate: '1971-05-02', sex: 'K', wakacje: true } });
add('N', 'zero revenue, ulga 2026-07-01', { revenue: 0, zus: { startDate: '2026-07-01', path: 'ulga' } });
add('N', 'income 105 928 (linear ~ health minimum edge), full ZUS', { revenue: 105928 + ZUS_FULL });

function r(x) { return Math.round(x * 100) / 100; }

// Alternative interpretations: for every non-default option, record the variant totals that change.
const ALT = {
  healthMonths12WhenZusOff: { healthMonthsWhenZusDisabled: '12' },
  noFpInPartialFirstMonth: { fpInPartialFirstMonth: false },
  fpFsSeparateRounding: { fpFsCombinedRounding: false },
  linearHealthKupCascade: { linearHealthKupCascade: true },
  linearSurplusToScale: { linearSurplusToScale: true },
  ryczaltNoSurplusToScale: { ryczaltSurplusToScale: false },
  ipBoxNoKupSocial: { ipBoxAllowKupSocial: false },
  ipBoxFpNonQualifiedOnly: { ipBoxFpAllocation: 'nonQualified' },
  baselineWithoutDanina: { baselineIncludesDanina: false },
  wakacjeGlobalMaxMonth: { wakacjeMonthChoice: 'maxContribution' },
  wakacjePerVariantNoNone: { wakacjeAllowNone: false },
};
// 2027 only: the EUR rate of 1.10.2026 is not known yet (forecast 4,3750 = NBP 25.09.2026);
// record how reform results move with the 24.09.2026 rate 4,3900.
const ALT_2027 = { ...ALT, eurRate4_39: { eurRate: 4.39 } };

function buildExpected(list, alts) {
  return list.map((c) => {
    const result = computeAll(c.input);
    const alt = {};
    if (result.error) return { id: c.id, result, alt };
    for (const [name, o] of Object.entries(alts)) {
      const a = computeAll(c.input, o);
      const diff = {};
      if (Math.abs(a.social.S - result.social.S) > 0.001 || Math.abs(a.social.FP - result.social.FP) > 0.001) diff._social = { S: a.social.S, FP: a.social.FP };
      for (const [k, v] of Object.entries(a.variants)) if (Math.abs(v.total - result.variants[k].total) > 0.004 || !!v.unavailable !== !!result.variants[k].unavailable) diff[k] = { total: v.total, pit: v.pit, health: v.health, danina: v.danina, method: v.method, ...(v.unavailable ? { unavailable: true } : {}) };
      if (Object.keys(diff).length) alt[name] = diff;
    }
    return { id: c.id, result, alt };
  });
}
// Every amount typed into the app must be a whole number of grosze (the app rejects > 2 decimals).
// compare.mjs types String(x) into the field, so check the string form (catches float noise).
const isGrosze = (x) => Number.isFinite(x) && /^-?\d+(\.\d{1,2})?$/.test(String(x));
function checkGrosze(list) {
  for (const c of list) {
    const { revenue, costs, otherScaleIncome, joint, multiRate, revenuePrevYear } = c.input;
    const amounts = [revenue, costs, otherScaleIncome, joint.spouseIncome, ...Object.values(multiRate.allocations)];
    if (revenuePrevYear !== undefined && revenuePrevYear !== null) amounts.push(revenuePrevYear);
    const badAmount = amounts.find((x) => !isGrosze(x));
    if (badAmount !== undefined) throw new Error(`${c.id}: amount ${badAmount} is not a whole number of grosze`);
  }
}

// One entry per line: valid JSON, small diffs.
const lines = (header, key, items) => `${JSON.stringify(header).slice(0, -1)},${JSON.stringify(key)}:[\n${items.map((x) => JSON.stringify(x)).join(',\n')}\n]}\n`;
const outputs = [];
function emit(list, alts, casesName, expectedName, casesHeader, expectedHeader) {
  checkGrosze(list);
  const expected = buildExpected(list, alts);
  outputs.push([new URL(`./${casesName}`, import.meta.url), lines(casesHeader, 'cases', list)]);
  outputs.push([new URL(`./${expectedName}`, import.meta.url), lines(expectedHeader, 'results', expected)]);
  console.log(casesName, 'cases:', list.length);
  const groups = {};
  for (const c of list) groups[c.group] = (groups[c.group] || 0) + 1;
  console.log(groups);
}

emit(cases, ALT, 'cases.json', 'expected.json',
  { note: 'Inputs for refModel.mjs computeAll(). ipBox.coeff is in percent. zus.path ignored when startDate is null. Amounts annual PLN.', options: DEFAULT_OPTIONS },
  { generatedWith: DEFAULT_OPTIONS });

// ===========================================================================
// 2027 grid (current law and the draft reform UD458 + UD116) → cases2027.json / expected2027.json
// ===========================================================================
const cases27 = [];
let seq27 = 0;
function add27(group, desc, inp, reform = false) {
  seq27++;
  cases27.push({
    id: `${group}-${String(seq27).padStart(3, '0')}`,
    group,
    desc: `${reform ? '[REFORM] ' : ''}${desc}`,
    input: {
      year: 2027, reform2027: reform, revenuePrevYear: null,
      revenue: 0, costs: 0, otherScaleIncome: 0,
      ipBox: { enabled: false, coeff: 0 },
      joint: { enabled: false, spouseIncome: 0 },
      multiRate: { enabled: false, allocations: {} },
      ...inp,
      zus: Z(inp.zus),
    },
  });
}
const both = (group, desc, inp) => { add27(group, desc, inp, false); add27(group, desc, inp, true); };

// Full ZUS 2027 (base 6 019,80, chorobowa): month 1 904,66 + FP 147,49 ⇒ S 22 855,92, FP 1 769,88.
const S27 = 22855.92, FP27 = 1769.88, Z27 = r(S27 + FP27); // 24 625,80
const EUR = EUR_RATE_2027_FORECAST;
const LIM250 = r(250000 * EUR), LIM300 = r(300000 * EUR); // 1 093 750,00 / 1 312 500,00

// 27A. scale bands: taxable base B = D − FP − S (full ZUS). Current law 30k/120k, reform 130k/150k, danina 1M.
for (const B of [0, 30000, 30000.01, 120000, 120000.01, 130000, 130000.01, 140000, 150000, 150000.01, 200000, 1000000, 1000000.01, 1100000]) {
  both('27A', `scale base ${B} (D = B + 24 625,80) full ZUS`, { revenue: r(B + Z27) });
}
for (const B of [130000, 150000, 400000]) both('27A', `scale base ${B}, costs 30% of revenue`, { revenue: r((B + Z27) / 0.7), costs: r((B + Z27) / 0.7 - (B + Z27)) });
both('27A', 'loss: revenue 20k, costs 30k', { revenue: 20000, costs: 30000 });
// 27A2. ZUS disabled (health only, 12 months × 445,50 minimum)
for (const D of [0, 30000, 59400, 130000, 150000, 1000000, 1200000]) both('27A2', `income ${D} ZUS disabled`, { revenue: D, zus: { enabled: false } });

// 27B. ryczałt health tiers (PLN thresholds unchanged; art. 81 ust. 2g with S27)
for (const P of [59999, 60000 + S27, r(60000 + S27 + 0.01), 150000, 300000 + S27, r(300000 + S27 + 0.01), 330000]) {
  add27('27B', `ryczałt revenue ${P} full ZUS`, { revenue: P });
  add27('27B', `ryczałt revenue ${P} full ZUS, other 150k`, { revenue: P, otherScaleIncome: 150000 });
}
for (const P of [r(60000 + 5638.2), r(60000 + 5638.21)]) add27('27B', `ryczałt revenue ${P} pref ZUS all 2027 (start 2026-03-01 pref)`, { revenue: P, zus: { startDate: '2026-03-01', path: 'pref' } });
both('27B', 'ryczałt revenue 300 000 + S, other 150k (reform scale on other income)', { revenue: r(300000 + S27 + 0.01), otherScaleIncome: 150000 });

// 27C. 8,5% / 12,5% around 100k
for (const P of [99999, 100000, 100001, 150000]) add27('27C', `8.5/12.5 revenue ${P}`, { revenue: P });

// 27D. linear health: minimum edge 5 346 / 4,9% = 109 102,04; deduction limit 15 100 / 4,9% = 308 163,27
for (const D of [r(109102.04 + Z27), r(109102.05 + Z27), 300000, r(308163.26 + Z27), r(308163.27 + Z27), r(308163.28 + Z27), 500000]) {
  add27('27D', `linear health, revenue ${D}`, { revenue: D });
}
for (const D of [r(308163.27 + Z27), 800000]) both('27D', `linear health, revenue ${D}, IP BOX 50%`, { revenue: D, ipBox: { enabled: true, coeff: 50 } });

// 27E. start dates × paths × chorobowa (carry-over from 2025/2026 into 2027)
const STARTS27 = [null, '2025-01-01', '2025-01-15', '2025-08-15', '2026-03-01', '2026-10-15', '2027-01-01', '2027-01-02', '2027-06-15', '2027-12-31'];
for (const sd of STARTS27) for (const path of ['full', 'ulga', 'pref']) for (const chor of [true, false]) {
  if (sd === null && path !== 'full') continue;
  add27('27E', `start ${sd} path ${path} chor ${chor}`, { revenue: 120000, costs: 20000, zus: { startDate: sd, path, chorobowe: chor } });
}
add27('27E', 'no start date but path ulga (ignored)', { revenue: 120000, costs: 20000, zus: { startDate: null, path: 'ulga' } });
for (const sd of ['2025-08-15', '2026-03-01', '2026-10-15', '2027-01-01', '2027-06-15']) for (const path of ['full', 'ulga', 'pref']) {
  add27('27E2', `start ${sd} path ${path}, income 200k`, { revenue: 200000, zus: { startDate: sd, path } }, true);
}
add27('27E', 'start 2028-01-01 → error (after the tax year)', { revenue: 100000, zus: { startDate: '2028-01-01', path: 'full' } });

// 27F. FP age exemption in 2027
const AGE27 = [
  ['1972-05-01', 'K', 'woman 55 on 2027-05-01 (exempt from May)'],
  ['1972-05-02', 'K', 'woman 55 on 2027-05-02 (exempt from June)'],
  ['1967-10-15', 'M', 'man 60 on 2027-10-15 (exempt from Nov)'],
  ['1967-01-01', 'M', 'man 60 on 2027-01-01 (exempt all 2027)'],
  ['1967-12-31', 'M', 'man 60 on 2027-12-31 (no exemption in 2027)'],
  ['1971-05-02', 'K', 'woman 55 in 2026 (exempt all 2027)'],
];
for (const [dob, sex, d] of AGE27) add27('27F', `${d}, full ZUS`, { revenue: 150000, costs: 10000, zus: { birthDate: dob, sex } });
add27('27F', 'woman 55 on 2027-05-02, start 2027-03-15 full (partial first month)', { revenue: 150000, costs: 10000, zus: { birthDate: '1972-05-02', sex: 'K', startDate: '2027-03-15', path: 'full' } });

// 27G. employment contract ≥ minimum wage (4 950)
for (const [sd, path] of [[null, 'full'], ['2026-10-15', 'ulga'], ['2027-06-15', 'pref']]) {
  add27('27G', `employment, start ${sd} ${path}, wakacje requested`, { revenue: 100000, costs: 10000, otherScaleIncome: 90000, zus: { startDate: sd, path, employmentContract: true, wakacje: true } });
}

// 27H. wakacje składkowe in 2027
const WAK27 = [[null, 'full'], ['2025-08-15', 'ulga'], ['2025-08-15', 'pref'], ['2026-03-01', 'ulga'], ['2026-03-01', 'full'], ['2026-10-15', 'full'], ['2026-10-15', 'ulga'], ['2026-10-15', 'pref'], ['2026-11-20', 'full'],
  ['2027-01-01', 'full'], ['2027-01-01', 'ulga'], ['2027-01-01', 'pref'], ['2027-06-15', 'full'], ['2027-06-15', 'ulga'], ['2027-06-15', 'pref'], ['2027-10-15', 'full'], ['2027-11-01', 'full']];
for (const [sd, path] of WAK27) add27('27H', `wakacje, start ${sd} ${path}`, { revenue: 150000, costs: 20000, zus: { startDate: sd, path, wakacje: true } });
add27('27H', 'wakacje, 2025-01-15 ulga (pref → full from Aug 2027), ryczałt revenue 70 000', { revenue: 70000, zus: { startDate: '2025-01-15', path: 'ulga', wakacje: true } });
add27('27H', 'wakacje, full ZUS, reform', { revenue: 250000, zus: { wakacje: true } }, true);

// 27I. other scale income
for (const other of [0, 50000, 125000, 140000, 160000, 1200000]) {
  for (const [rev, costs] of [[40000, 5000], [150000, 30000], [400000, 0]]) both('27I', `other ${other}, rev ${rev}, costs ${costs}`, { revenue: rev, costs, otherScaleIncome: other });
}
both('27I', 'other 100k, rev 15k (ryczałt surplus social → scale)', { revenue: 15000, otherScaleIncome: 100000 });
both('27I', 'other 135k, rev 20k (S > income), ulga 2027-01-01', { revenue: 20000, otherScaleIncome: 135000, zus: { startDate: '2027-01-01', path: 'ulga' } });

// 27J. joint taxation (reform: 2 × T(½) ⇒ 260k / 300k)
for (const sp of [0, 100000, 250000]) for (const [rev, costs, other] of [[200000, 0, 0], [r(300000 + Z27), 0, 0], [600000, 100000, 50000]]) {
  both('27J', `joint spouse ${sp}, rev ${rev}, costs ${costs}, other ${other}`, { revenue: rev, costs, otherScaleIncome: other, joint: { enabled: true, spouseIncome: sp } });
}
both('27J', 'joint, JDG base 260 000 exactly, spouse 0', { revenue: r(260000 + Z27), joint: { enabled: true, spouseIncome: 0 } });
both('27J', 'joint + IP BOX 60%, spouse 40k', { revenue: 300000, costs: 20000, ipBox: { enabled: true, coeff: 60 }, joint: { enabled: true, spouseIncome: 40000 } });
both('27J', 'joint + 1.3M revenue (danina, spouse 20k)', { revenue: 1300000, joint: { enabled: true, spouseIncome: 20000 } });

// 27K. IP BOX, incl. danina base extension (UD116)
for (const coeff of [50, 100]) for (const [rev, costs, other] of [[400000, 50000, 0], [1200000, 0, 0], [1500000, 0, 150000], [200000, 0, 150000]]) {
  both('27K', `IP BOX ${coeff}%, rev ${rev}, costs ${costs}, other ${other}`, { revenue: rev, costs, otherScaleIncome: other, ipBox: { enabled: true, coeff } });
}
// qualified income just around 1 000 000 with coefficient 100% (income after FP only, KUP method)
both('27K', 'IP BOX 100%, income so that qualified ≈ 1 000 000', { revenue: r(1000000 + FP27 + S27), ipBox: { enabled: true, coeff: 100 } });
both('27K', 'IP BOX 80%, other 1.1M (danina from other income + IP)', { revenue: 500000, otherScaleIncome: 1100000, ipBox: { enabled: true, coeff: 80 } });

// 27R. reform ryczałt EUR rules (eligibility 250 000 EUR on 2026 revenue; 17% above 300 000 EUR)
const RY = (desc, inp) => both('27R', desc, inp);
RY(`2026 revenue = 250k EUR limit ${LIM250} (eligible)`, { revenue: 500000, revenuePrevYear: LIM250 });
RY(`2026 revenue = limit + 0,01 (ineligible)`, { revenue: 500000, revenuePrevYear: r(LIM250 + 0.01) });
RY('2026 revenue empty → form revenue = limit (eligible)', { revenue: LIM250 });
RY('2026 revenue empty → form revenue = limit + 0,01 (ineligible)', { revenue: r(LIM250 + 0.01) });
RY('2026 revenue 0 typed, revenue 2M (eligible, 17% on excess)', { revenue: 2000000, revenuePrevYear: 0 });
RY('start 2027-03-01, revenue 2M, 2026 revenue empty (eligible: new business)', { revenue: 2000000, zus: { startDate: '2027-03-01', path: 'full' } });
RY('start 2027-03-01, revenue 2M, 2026 revenue 1.5M typed (new business ⇒ still eligible)', { revenue: 2000000, revenuePrevYear: 1500000, zus: { startDate: '2027-03-01', path: 'full' } });
RY('start 2026-10-15 ulga, 2026 revenue 1.2M (ineligible)', { revenue: 800000, revenuePrevYear: 1200000, zus: { startDate: '2026-10-15', path: 'ulga' } });
for (const P of [LIM300, r(LIM300 + 0.01), 1500000, 2500000]) RY(`revenue ${P} vs 300k EUR ${LIM300}, 2026 revenue 500k`, { revenue: P, revenuePrevYear: 500000 });
RY('revenue 1.5M, other 100k (surplus social → scale), 2026 revenue 500k', { revenue: 1500000, otherScaleIncome: 100000, revenuePrevYear: 500000 });
RY('revenue 1.5M, pref ZUS 2026-03-01, 2026 revenue 500k', { revenue: 1500000, revenuePrevYear: 500000, zus: { startDate: '2026-03-01', path: 'pref' } });
RY('multi 12%: 1M + 8.5-12.5: 500k, 2026 revenue 600k (excess split proportionally)', { revenue: 1500000, revenuePrevYear: 600000, multiRate: { enabled: true, allocations: { '12': 1000000, '8.5-12.5': 500000 } } });
RY('multi 3%: 1.4M + 17%: 100k, 2026 revenue 600k', { revenue: 1500000, revenuePrevYear: 600000, multiRate: { enabled: true, allocations: { '3': 1400000, '17': 100000 } } });
RY('multi below 300k EUR, 2026 revenue 1.2M (ineligible multi too)', { revenue: 400000, revenuePrevYear: 1200000, multiRate: { enabled: true, allocations: { '12': 200000, '8.5': 200000 } } });
RY('everything: IP 40%, joint 60k, other 50k, multi, 2026 revenue 1.1M', { revenue: 1350000, costs: 30000, otherScaleIncome: 50000, revenuePrevYear: 1100000, ipBox: { enabled: true, coeff: 40 }, joint: { enabled: true, spouseIncome: 60000 }, multiRate: { enabled: true, allocations: { '12': 1000000, '8.5-12.5': 350000 } } });

// 27L. multi-rate (health tier, proportional deductions) – current law and reform
for (const alloc of [{ '12': 100000, '8.5': 100000 }, { '8.5-12.5': 150000, '12': 50000 }, { '5.5': 40000, '8.5': r(20000 + S27) }, { '5.5': 40000, '8.5': r(20000 + S27 + 0.01) }]) {
  const tot = r(Object.values(alloc).reduce((a, b) => a + b, 0));
  both('27L', `multi ${JSON.stringify(alloc)}`, { revenue: tot, multiRate: { enabled: true, allocations: alloc } });
}

// 27N. misc
add27('27N', 'zero everything', { revenue: 0 });
add27('27N', 'start 2027-12-31 full, revenue 5k (1-day month)', { revenue: 5000, zus: { startDate: '2027-12-31', path: 'full' } });
add27('27N', 'ZUS disabled, start 2027-07-01 (health 6 months)', { revenue: 100000, zus: { enabled: false, startDate: '2027-07-01', path: 'ulga' } });
both('27N', 'HAND-CHECK Y1: full ZUS, revenue 200 000 (skala/liniowy/ryczałt 12%)', { revenue: 200000 });
add27('27N', 'HAND-CHECK Y2: start 2026-10-15 ulga, revenue 90 000, costs 10 000', { revenue: 90000, costs: 10000, zus: { startDate: '2026-10-15', path: 'ulga' } });
add27('27N', 'HAND-CHECK Y3: joint, revenue 400 000, costs 50 000, spouse 60 000', { revenue: 400000, costs: 50000, joint: { enabled: true, spouseIncome: 60000 } }, true);
add27('27N', 'HAND-CHECK Y4: ryczałt 1.5M, 2026 revenue 800k, 2025-08-15 pref', { revenue: 1500000, revenuePrevYear: 800000, zus: { startDate: '2025-08-15', path: 'pref' } }, true);

emit(cases27, ALT_2027, 'cases2027.json', 'expected2027.json',
  { note: 'Inputs for refModel.mjs computeAll(), tax year 2027. reform2027 = draft UD458 + UD116 scenario; revenuePrevYear = 2026 revenue for the 250 000 EUR ryczałt limit (null = revenue). ipBox.coeff in percent. Amounts annual PLN.', options: DEFAULT_OPTIONS, eurRate: EUR_RATE_2027_FORECAST },
  { generatedWith: DEFAULT_OPTIONS, eurRate: EUR_RATE_2027_FORECAST });

if (process.argv.includes('--check')) {
  const read = (u) => { try { return readFileSync(u, 'utf8'); } catch { return ''; } };
  const stale = outputs.filter(([u, txt]) => read(u) !== txt).map(([u]) => u.pathname.split('/').pop());
  console.log(stale.length ? `STALE: ${stale.join(', ')} differ from refModel.mjs/genCases.mjs output – run node tools/refmodel/genCases.mjs and review the diff` : 'OK: cases/expected files are up to date');
  process.exitCode = stale.length ? 1 : 0;
} else {
  for (const [u, txt] of outputs) writeFileSync(u, txt);
}
