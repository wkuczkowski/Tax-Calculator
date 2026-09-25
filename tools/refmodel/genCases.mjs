// Generates cases.json/expected.json (2026) and cases2027.json/expected2027.json (2027: current law
// and the draft reform) using refModel.mjs.
// Run:   node tools/refmodel/genCases.mjs           – rewrites cases.json and expected.json
//        node tools/refmodel/genCases.mjs --check   – regenerates in memory and reports whether the
//                                                     committed files are up to date (exit 1 if not)
// Both files are written one case per line, so `git diff` shows exactly which cases changed.
import { readFileSync, writeFileSync } from 'node:fs';
import { computeAll, DEFAULT_OPTIONS, EUR_RATE_2027_FORECAST, FAMILY_OPTIONS } from './refModel.mjs';

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
    const f = c.input.family;
    if (f) for (const x of [f.spouseLinearIncome, f.spouseContrib, f.otherContrib, f.fourPlusUsed]) if (x !== undefined && x !== null) amounts.push(x);
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

// ===========================================================================
// Family grid (ulga na dzieci, samotny rodzic, małżonkowie, ulga 4+), 2026 + 2027 (+ reform)
//   → casesFamily.json / expectedFamily.json
// ===========================================================================
const casesF = [];
let seqF = 0;
const KID = (months = 12, o = {}) => ({ months, disabled: false, adult: false, ...o });
const KIDS = (n, months = 12) => Array.from({ length: n }, () => KID(months));
function addF(group, desc, inp, fam) {
  seqF++;
  const year = inp.year || 2026;
  casesF.push({
    id: `${group}-${String(seqF).padStart(3, '0')}`,
    group,
    desc: `${year === 2027 ? (inp.reform2027 ? '[2027 REFORM] ' : '[2027] ') : ''}${desc}`,
    input: {
      ...(year === 2027 ? { year: 2027, reform2027: !!inp.reform2027, revenuePrevYear: inp.revenuePrevYear ?? null } : {}),
      revenue: 0, costs: 0, otherScaleIncome: 0,
      ipBox: { enabled: false, coeff: 0 },
      joint: { enabled: false, spouseIncome: 0 },
      multiRate: { enabled: false, allocations: {} },
      ...Object.fromEntries(Object.entries(inp).filter(([k]) => !['year', 'reform2027', 'revenuePrevYear'].includes(k))),
      zus: Z(inp.zus),
      family: { status: 'other', children: [], share: null, spouseLinRycz: false, spouseLinearIncome: 0, spouseContrib: null, otherContrib: null, fourPlus: false, fourPlusUsed: 0, ...fam },
    },
  });
}
const STATUSES = [['married', { joint: { enabled: false, spouseIncome: 40000 } }], ['single', {}], ['other', {}]];
// Largest revenue (in grosze) for which `variant`'s one-child limit income stays ≤ its limit, by
// bisection on the model (limit income grows with revenue). Returns [R, R + 0,01] – the two sides.
function limitEdge(inp, variant) {
  const probe = (R) => { const r = computeAll({ ...inp, revenue: R }); return r.variants[variant].family; };
  let lo = 0, hi = 5000000;
  const L = probe(hi).limit;
  if (probe(lo).limitIncome > L) return null;
  while (hi - lo > 0.01 + 1e-9) {
    const mid = r(Math.floor(((lo + hi) / 2) * 100) / 100);
    if (mid === lo || mid === hi) break;
    if (probe(mid).limitIncome > L) hi = mid; else lo = mid;
  }
  return [lo, r(lo + 0.01)];
}

// FA. relief amounts: 1–5 children, months, adult flag × status (income 100k, full ZUS, no other income)
const COMPOSITIONS = [
  ['1 child 12m', [KID()]], ['1 child 5m (born in August)', [KID(5)]], ['2 children', KIDS(2)], ['2 children, 2nd 1m', [KID(), KID(1)]],
  ['3 children', KIDS(3)], ['3 children, 3rd 5m', [KID(), KID(), KID(5)]], ['4 children', KIDS(4)], ['4 children, 4th 3m, 3rd adult', [KID(), KID(), KID(12, { adult: true }), KID(3)]],
  ['5 children', KIDS(5)], ['5 children, months 12/12/9/6/2', [KID(), KID(), KID(9), KID(6), KID(2)]],
];
for (const [d, kids] of COMPOSITIONS) for (const [st, extra] of STATUSES) addF('FA', `${d}, status ${st}, revenue 100k costs 20k`, { revenue: 100000, costs: 20000, ...extra }, { status: st, children: kids });
// low income: relief mostly refunded (cap = contributions)
for (const [d, kids] of [['3 children', KIDS(3)], ['5 children', KIDS(5)]]) for (const [st, extra] of STATUSES) addF('FA', `${d}, status ${st}, revenue 40k (refund)`, { revenue: 40000, ...extra }, { status: st, children: kids });

// FB. one-child income limit edges (all-or-nothing), per variant and status
const edgeCases = [
  ['FB', 'married, spouse 40k, skala', { joint: { enabled: false, spouseIncome: 40000 } }, 'married', 'taxScale'],
  ['FB', 'married, spouse 40k, liniowy', { joint: { enabled: false, spouseIncome: 40000 } }, 'married', 'taxLinear'],
  ['FB', 'married, spouse 40k scale + 10k linear (spouse on liniowy), skala', { joint: { enabled: false, spouseIncome: 40000 } }, 'married', 'taxScale', { spouseLinRycz: true, spouseLinearIncome: 10000 }],
  ['FB', 'married joint, spouse 30k, joint skala', { joint: { enabled: true, spouseIncome: 30000 } }, 'married', 'taxScaleJoint'],
  ['FB', 'other, skala (56k)', {}, 'other', 'taxScale'],
  ['FB', 'other, liniowy (56k)', {}, 'other', 'taxLinear'],
  ['FB', 'other, other income 20k, skala', { otherScaleIncome: 20000 }, 'other', 'taxScale'],
  ['FB', 'single, skala individual (112k)', {}, 'single', 'taxScale'],
  ['FB', 'single, skala single parent (112k)', {}, 'single', 'taxScaleSingle'],
  ['FB', 'single, liniowy (cautious 56k)', {}, 'single', 'taxLinear'],
  ['FB', 'single, liniowy, other 30k (cautious 56k)', { otherScaleIncome: 30000 }, 'single', 'taxLinear'],
  ['FB', 'other, IP BOX 50% skala (qualified income outside the limit)', { ipBox: { enabled: true, coeff: 50 } }, 'other', 'taxScaleIpBox'],
  ['FB', 'married, spouse 20k, IP BOX 60% liniowy', { ipBox: { enabled: true, coeff: 60 }, joint: { enabled: false, spouseIncome: 20000 } }, 'married', 'taxLinearIpBox'],
];
for (const year of [2026, 2027]) for (const [g, d, extra, st, variant, famExtra] of edgeCases) {
  if (year === 2027 && !/skala|liniowy \(56k\)/.test(d)) continue;
  const base = { ...(year === 2027 ? { year: 2027 } : {}), ...extra };
  const fam = { status: st, children: [KID()], ...(famExtra || {}) };
  const probeInp = casesFInput(base, fam);
  const e = limitEdge(probeInp, variant);
  if (!e) continue;
  addF(g, `${d}: at limit (${variant} limit income ≤ limit)`, { ...base, revenue: e[0] }, fam);
  addF(g, `${d}: limit + 0,01 zł (relief lost)`, { ...base, revenue: e[1] }, fam);
  if (year === 2026 && (variant === 'taxScale' || variant === 'taxLinear')) addF(g, `${d}: just above the limit but child disabled (no limit)`, { ...base, revenue: e[1] }, { ...fam, children: [KID(12, { disabled: true })] });
}
// ryczałt: only other income counts (revenue irrelevant) – other income around 56 000 / married 112 000
for (const [o, st, extra] of [[56000, 'other', {}], [56000.01, 'other', {}], [56000.01, 'single', {}], [72000, 'married', { joint: { enabled: false, spouseIncome: 40000 } }], [72000.01, 'married', { joint: { enabled: false, spouseIncome: 40000 } }]]) {
  addF('FB', `ryczałt: other income ${o}, status ${st}, revenue 150k (ryczałt revenue outside the limit)`, { revenue: 150000, otherScaleIncome: o, ...extra }, { status: st, children: [KID()] });
}
addF('FB', 'two children: no limit, income 500k', { revenue: 500000 }, { status: 'other', children: KIDS(2) });
addF('FB', 'one child 6 months + limit exceeded', { revenue: 150000 }, { status: 'other', children: [KID(6)] });

// FC. refund and its cap; optimizer including the refund
addF('FC', 'ulga na start 2026-01-01 (S = 0): 5 children, cap = health only', { revenue: 60000, zus: { startDate: '2026-01-01', path: 'ulga' } }, { status: 'other', children: KIDS(5) });
addF('FC', 'ulga na start, 4 children, revenue 30k', { revenue: 30000, zus: { startDate: '2026-01-01', path: 'ulga' } }, { status: 'other', children: KIDS(4) });
addF('FC', 'ZUS off, 3 children, revenue 20k (cap = health only)', { revenue: 20000, zus: { enabled: false } }, { status: 'other', children: KIDS(3) });
addF('FC', 'RD7: liniowy, 5 children, other 10k, full ZUS (method scale wins via refund)', { revenue: 150000, otherScaleIncome: 10000 }, { status: 'other', children: KIDS(5) });
addF('FC', 'liniowy, 5 children, other 10k, otherContrib 500 (cap tight)', { revenue: 150000, otherScaleIncome: 10000 }, { status: 'other', children: KIDS(5), otherContrib: 500 });
addF('FC', 'liniowy low income 15k (S > linear income), 3 children, other 30k', { revenue: 15000, otherScaleIncome: 30000 }, { status: 'other', children: KIDS(3) });
addF('FC', 'liniowy low income 8k, 2 children, other 5k, otherContrib 0', { revenue: 8000, otherScaleIncome: 5000 }, { status: 'other', children: KIDS(2), otherContrib: 0 });
addF('FC', 'liniowy, no other income, 3 children (no PIT-36/37 → no refund)', { revenue: 150000 }, { status: 'other', children: KIDS(3) });
addF('FC', 'ryczałt, no other income, 3 children (no refund)', { revenue: 90000 }, { status: 'other', children: KIDS(3) });
addF('FC', 'ryczałt revenue 15k, other 20k, 4 children (S not deducted from revenue counts)', { revenue: 15000, otherScaleIncome: 20000 }, { status: 'other', children: KIDS(4) });
addF('FC', 'skala loss (costs > revenue), 2 children: full refund', { revenue: 30000, costs: 50000 }, { status: 'other', children: KIDS(2) });
addF('FC', 'skala, pref ZUS 2025-09-15, 5 children, revenue 50k', { revenue: 50000, zus: { startDate: '2025-09-15', path: 'pref' } }, { status: 'other', children: KIDS(5) });
addF('FC', 'skala, employment contract (S = 0), 5 children, other 20k, otherContrib 1 000', { revenue: 40000, otherScaleIncome: 20000, zus: { employmentContract: true } }, { status: 'other', children: KIDS(5), otherContrib: 1000 });
addF('FC', 'otherContrib explicit 2 000 vs estimate, other 40k, 3 children, ryczałt-favourable', { revenue: 60000, otherScaleIncome: 40000 }, { status: 'other', children: KIDS(3), otherContrib: 2000 });
addF('FC', 'other income 40k, contribution estimate, 3 children', { revenue: 60000, otherScaleIncome: 40000 }, { status: 'other', children: KIDS(3) });
addF('FC', 'wakacje + ulga 2025-08-01 pref: 4 children', { revenue: 70000, zus: { startDate: '2025-08-01', path: 'ulga', wakacje: true } }, { status: 'other', children: KIDS(4) });

// FD. single parent
for (const [rev, costs, other] of [[60000, 0, 0], [150000, 20000, 0], [300000, 0, 0], [100000, 0, 60000], [40000, 0, 60000], [500000, 50000, 100000], [1200000, 0, 0]]) {
  addF('FD', `single parent, 1 child, rev ${rev}, costs ${costs}, other ${other}`, { revenue: rev, costs, otherScaleIncome: other }, { status: 'single', children: [KID()] });
  addF('FD', `single parent, 3 children, rev ${rev}, costs ${costs}, other ${other}`, { revenue: rev, costs, otherScaleIncome: other }, { status: 'single', children: KIDS(3) });
}
addF('FD', 'single parent + IP BOX 70%, 2 children, rev 250k', { revenue: 250000, ipBox: { enabled: true, coeff: 70 } }, { status: 'single', children: KIDS(2) });
addF('FD', 'single parent + IP BOX 30%, 1 child, rev 120k, other 30k', { revenue: 120000, otherScaleIncome: 30000, ipBox: { enabled: true, coeff: 30 } }, { status: 'single', children: [KID()] });
addF('FD', 'single parent, ulga start 2026-03-15, 2 children, other 50k', { revenue: 80000, otherScaleIncome: 50000, zus: { startDate: '2026-03-15', path: 'ulga' } }, { status: 'single', children: KIDS(2) });
addF('FD', 'single parent, 1 adult child, other 45k, rev 50k', { revenue: 50000, otherScaleIncome: 45000 }, { status: 'single', children: [KID(12, { adult: true })] });

// FE. spouses
for (const sp of [0, 50000, 150000]) for (const joint of [false, true]) for (const [rev, costs, other] of [[100000, 0, 0], [250000, 50000, 30000], [40000, 0, 0]]) {
  addF('FE', `married, joint ${joint}, spouse ${sp}, 2 children, rev ${rev}, costs ${costs}, other ${other}`, { revenue: rev, costs, otherScaleIncome: other, joint: { enabled: joint, spouseIncome: sp } }, { status: 'married', children: KIDS(2) });
}
addF('FE', 'married, spouse on liniowy/ryczałt, joint on (unavailable), spouse 30k, 3 children', { revenue: 120000, joint: { enabled: true, spouseIncome: 30000 } }, { status: 'married', children: KIDS(3), spouseLinRycz: true });
addF('FE', 'married, spouse on liniowy (no children): joint unavailable', { revenue: 120000, joint: { enabled: true, spouseIncome: 30000 } }, { status: 'married', children: [], spouseLinRycz: true });
addF('FE', 'married, spouse contributions given 3 000, spouse 20k, user liniowy-favourable, 4 children', { revenue: 200000, joint: { enabled: false, spouseIncome: 20000 } }, { status: 'married', children: KIDS(4), spouseContrib: 3000 });
addF('FE', 'married, spouse 0 income, user liniowy, 2 children (no PIT-37 from spouse)', { revenue: 200000, joint: { enabled: false, spouseIncome: 0 } }, { status: 'married', children: KIDS(2) });
addF('FE', 'married joint + IP BOX 50%, spouse 60k, 3 children', { revenue: 300000, ipBox: { enabled: true, coeff: 50 }, joint: { enabled: true, spouseIncome: 60000 } }, { status: 'married', children: KIDS(3) });
addF('FE', 'married joint, 1 child, spouse 50k, other 20k, rev 90k', { revenue: 90000, otherScaleIncome: 20000, joint: { enabled: true, spouseIncome: 50000 } }, { status: 'married', children: [KID()] });
addF('FE', 'married, 5 children, spouse 10k, user rev 30k (refund with joint cap)', { revenue: 30000, joint: { enabled: false, spouseIncome: 10000 } }, { status: 'married', children: KIDS(5) });

// FF. status other: share
for (const share of [0, 50, 100]) for (const [rev, other] of [[80000, 0], [40000, 30000]]) addF('FF', `other, share ${share}%, 2 children, rev ${rev}, other ${other}`, { revenue: rev, otherScaleIncome: other }, { status: 'other', children: KIDS(2), share });
addF('FF', 'other, share 33%, 1 child, rev 50k', { revenue: 50000 }, { status: 'other', children: [KID()], share: 33 });

// FG. IP BOX with children (qualified income outside the limit, relief not from 5%)
for (const coeff of [0, 60, 100]) addF('FG', `IP BOX ${coeff}%, 3 children, rev 200k`, { revenue: 200000, ipBox: { enabled: true, coeff } }, { status: 'other', children: KIDS(3) });
addF('FG', 'IP BOX 100%, 1 child, rev 150k (limit income only other)', { revenue: 150000, otherScaleIncome: 20000, ipBox: { enabled: true, coeff: 100 } }, { status: 'other', children: [KID()] });

// FH. ulga 4+ (art. 21 ust. 1 pkt 153)
for (const R of [85527.99, 85528, 85528.01, 120000, 200000]) addF('FH', `4+ (4 children), revenue ${R}, full ZUS`, { revenue: R }, { status: 'other', children: KIDS(4), fourPlus: true });
for (const used of [0, 50000, 85528]) addF('FH', `4+, limit used ${used}, revenue 150k (8,5/12,5 band)`, { revenue: 150000 }, { status: 'other', children: KIDS(4), fourPlus: true, fourPlusUsed: used });
addF('FH', '4+, used 85 528,01 → input error', { revenue: 150000 }, { status: 'other', children: KIDS(4), fourPlus: true, fourPlusUsed: 85528.01 });
addF('FH', '4+ without children list (exemption only)', { revenue: 150000 }, { status: 'other', children: [], fourPlus: true });
addF('FH', '4+ without children, revenue 60k + S (ryczałt health tier on full revenue)', { revenue: r(60000 + S_FULL) }, { status: 'other', children: [], fourPlus: true });
addF('FH', '4+, costs 90k (loss after exemption), 4 children', { revenue: 150000, costs: 90000 }, { status: 'other', children: KIDS(4), fourPlus: true });
addF('FH', '4+, IP BOX 50%, 4 children, rev 300k', { revenue: 300000, ipBox: { enabled: true, coeff: 50 } }, { status: 'other', children: KIDS(4), fourPlus: true });
addF('FH', '4+, multi 12%: 100k + 8,5/12,5: 150k, 4 children', { revenue: 250000, multiRate: { enabled: true, allocations: { '12': 100000, '8.5-12.5': 150000 } } }, { status: 'other', children: KIDS(4), fourPlus: true });
addF('FH', '4+, multi 3%: 60k + 17%: 40k, used 20k', { revenue: 100000, multiRate: { enabled: true, allocations: { '3': 60000, '17': 40000 } } }, { status: 'other', children: KIDS(4), fourPlus: true, fourPlusUsed: 20000 });
addF('FH', '4+, married joint, spouse 60k, 5 children, rev 250k', { revenue: 250000, joint: { enabled: true, spouseIncome: 60000 } }, { status: 'married', children: KIDS(5), fourPlus: true });
addF('FH', '4+, single parent, 4 children, other 40k, rev 180k', { revenue: 180000, otherScaleIncome: 40000 }, { status: 'single', children: KIDS(4), fourPlus: true });
addF('FH', '4+, big income 1.2M (danina without exempt revenue), 4 children', { revenue: 1200000 }, { status: 'other', children: KIDS(4), fourPlus: true });
addF('FH', '4+, ulga na start 2026-05-01, 4 children, rev 100k', { revenue: 100000, zus: { startDate: '2026-05-01', path: 'ulga' } }, { status: 'other', children: KIDS(4), fourPlus: true });
addF('FH', '4+, other income 30k, used 30k, 6 children, rev 90k', { revenue: 90000, otherScaleIncome: 30000 }, { status: 'other', children: KIDS(6), fourPlus: true, fourPlusUsed: 30000 });

// FI. 2027 current law and reform
for (const reform of [false, true]) {
  const y = { year: 2027, reform2027: reform };
  addF('FI', 'status other, 2 children, rev 150k', { ...y, revenue: 150000 }, { status: 'other', children: KIDS(2) });
  addF('FI', 'single parent, 1 child, other 60k, rev 100k', { ...y, revenue: 100000, otherScaleIncome: 60000 }, { status: 'single', children: [KID()] });
  addF('FI', 'single parent, 3 children, rev 320k', { ...y, revenue: 320000 }, { status: 'single', children: KIDS(3) });
  addF('FI', 'married joint, spouse 80k, 3 children, rev 260k', { ...y, revenue: 260000, joint: { enabled: true, spouseIncome: 80000 } }, { status: 'married', children: KIDS(3) });
  addF('FI', 'married separate, spouse 140k, 1 child... limit exceeded', { ...y, revenue: 90000, joint: { enabled: false, spouseIncome: 140000 } }, { status: 'married', children: [KID()] });
  addF('FI', '5 children, ulga start 2027-01-01, rev 60k (refund, cap)', { ...y, revenue: 60000, zus: { startDate: '2027-01-01', path: 'ulga' } }, { status: 'other', children: KIDS(5) });
  addF('FI', 'IP BOX 60% single parent, 2 children, rev 1.2M (danina incl. IP in reform)', { ...y, revenue: 1200000, ipBox: { enabled: true, coeff: 60 } }, { status: 'single', children: KIDS(2) });
  addF('FI', '4+, 4 children, rev 150k (8,5/12,5), used 10k', { ...y, revenue: 150000 }, { status: 'other', children: KIDS(4), fourPlus: true, fourPlusUsed: 10000 });
  addF('FI', 'liniowy RD7-like: 5 children, other 10k, rev 150k', { ...y, revenue: 150000, otherScaleIncome: 10000 }, { status: 'other', children: KIDS(5) });
  addF('FI', 'single parent, scale 140k band (reform 24%), 2 children', { ...y, revenue: 180000 }, { status: 'single', children: KIDS(2) });
}
for (const B of [130000, 150000]) addF('FI', `reform, single parent, other ${B * 2} (2 × T(½) at the reform thresholds), 1 child, rev 50k`, { year: 2027, reform2027: true, revenue: 50000, otherScaleIncome: B * 2 }, { status: 'single', children: [KID()] });
addF('FI', 'reform 17% surcharge + 4+: ryczałt 1.5M, 2026 revenue 500k, 4 children', { year: 2027, reform2027: true, revenue: 1500000, revenuePrevYear: 500000 }, { status: 'other', children: KIDS(4), fourPlus: true });
{
  const e = limitEdge(casesFInput({ year: 2027, reform2027: true }, { status: 'other', children: [KID()] }), 'taxScale');
  addF('FI', 'reform, other, 1 child, skala at the 56k limit', { year: 2027, reform2027: true, revenue: e[0] }, { status: 'other', children: [KID()] });
  addF('FI', 'reform, other, 1 child, skala limit + 0,01', { year: 2027, reform2027: true, revenue: e[1] }, { status: 'other', children: [KID()] });
}

// FJ. 2027 current law: statuses × children × ZUS carried over from 2026/started in 2027, other income
for (const [st, extra] of STATUSES) for (const kids of [[KID()], KIDS(2), KIDS(4)]) for (const zus of [{ startDate: '2026-03-01', path: 'pref' }, { startDate: '2027-01-01', path: 'ulga' }]) {
  addF('FJ', `status ${st}, ${kids.length} child(ren), ZUS ${zus.path} from ${zus.startDate}, rev 70k, other 25k`, { year: 2027, revenue: 70000, otherScaleIncome: 25000, zus, ...extra }, { status: st, children: kids });
}
for (const R of [60000, r(60000 + 22855.92), r(60000 + 22855.92 + 0.01)]) addF('FJ', `4+ 2027, ryczałt tier edge (revenue ${R}, tier from full revenue), 4 children`, { year: 2027, revenue: R }, { status: 'other', children: KIDS(4), fourPlus: true });
addF('FJ', '2027 reform: joint + IP BOX 40% + 4+, spouse 30k, 4 children, rev 400k', { year: 2027, reform2027: true, revenue: 400000, ipBox: { enabled: true, coeff: 40 }, joint: { enabled: true, spouseIncome: 30000 } }, { status: 'married', children: KIDS(4), fourPlus: true });
addF('FJ', '2027 reform: single parent + 4+, 5 children, other 70k, rev 200k', { year: 2027, reform2027: true, revenue: 200000, otherScaleIncome: 70000 }, { status: 'single', children: KIDS(5), fourPlus: true, fourPlusUsed: 40000 });
addF('FJ', '2027: married, spouse on ryczałt with 0 scale income, user skala loss, 2 children', { year: 2027, revenue: 20000, costs: 40000, joint: { enabled: false, spouseIncome: 0 } }, { status: 'married', children: KIDS(2), spouseLinRycz: true });
addF('FJ', '2026: other, 1 disabled child, rev 500k liniowy', { revenue: 500000 }, { status: 'other', children: [KID(12, { disabled: true })] });
addF('FJ', '2026: other, 1 child 12m + share 60%, other 30k, rev 40k', { revenue: 40000, otherScaleIncome: 30000 }, { status: 'other', children: [KID()], share: 60 });
addF('FJ', '2026: wakacje + single parent, 2 children, rev 120k', { revenue: 120000, zus: { wakacje: true } }, { status: 'single', children: KIDS(2) });
addF('FJ', '2026: employment contract + married joint, spouse 90k, 3 children, rev 60k, other 80k', { revenue: 60000, otherScaleIncome: 80000, joint: { enabled: true, spouseIncome: 90000 }, zus: { employmentContract: true } }, { status: 'married', children: KIDS(3) });
addF('FJ', '2026: FP age exemption, single parent, 1 adult child, rev 90k', { revenue: 90000, zus: { birthDate: '1966-10-15', sex: 'M' } }, { status: 'single', children: [KID(12, { adult: true })] });
addF('FJ', '2026: multi-rate with children (no 4+), 3 children, other 20k', { revenue: 150000, otherScaleIncome: 20000, multiRate: { enabled: true, allocations: { '12': 100000, '5.5': 50000 } } }, { status: 'other', children: KIDS(3) });

// FN. hand checks (HAND_CHECKS.md, section "Rodzina")
addF('FN', 'HAND-CHECK R1: single parent, 1 child, other 60k, rev 100k, ZUS off (research §4.2)', { revenue: 100000, otherScaleIncome: 60000, zus: { enabled: false } }, { status: 'single', children: [KID()] });
addF('FN', 'HAND-CHECK R2: married separate, spouse 50k, 3 children (3rd 5 months), rev 180k costs 30k', { revenue: 180000, costs: 30000, joint: { enabled: false, spouseIncome: 50000 } }, { status: 'married', children: [KID(), KID(), KID(5)] });
addF('FN', 'HAND-CHECK R3: 4+, 4 children, ryczałt 8,5/12,5, rev 150k, used 20k, other 30k', { revenue: 150000, otherScaleIncome: 30000 }, { status: 'other', children: KIDS(4), fourPlus: true, fourPlusUsed: 20000 });
addF('FN', 'HAND-CHECK R4: 2027 reform, liniowy vs skala, 5 children, other 10k, rev 150k', { year: 2027, reform2027: true, revenue: 150000, otherScaleIncome: 10000 }, { status: 'other', children: KIDS(5) });

function casesFInput(base, fam) {
  const tmp = { length: casesF.length };
  addF('TMP', 'tmp', base, fam);
  const c = casesF.pop();
  seqF--;
  void tmp;
  return c.input;
}

const ALT_FAMILY = {
  ...ALT_2027,
  familySingleParentLimitLiteral: { family: { singleParentLimitLinRycz: 'literal' } },
  familyLinearLinCapZero_RD6: { family: { linearLinMethodCapSocial: 'zero' } },
  familyCapExcludesUndeductedHealth_RD6: { family: { capIncludesUndeductedHealth: false } },
  familyEstimateContribAtZeroIncome: { family: { estimateContribWhenZeroIncome: true } },
};
emit(casesF, ALT_FAMILY, 'casesFamily.json', 'expectedFamily.json',
  { note: 'Family-relief grid for refModel.mjs computeAll() (2026, 2027, 2027 reform). input.family: status, children [{months, disabled, adult}], share (other), spouse fields (spouse scale income = joint.spouseIncome), otherContrib/spouseContrib (null = estimate), fourPlus, fourPlusUsed. Amounts annual PLN.', options: DEFAULT_OPTIONS, familyOptions: FAMILY_OPTIONS, eurRate: EUR_RATE_2027_FORECAST },
  { generatedWith: DEFAULT_OPTIONS, familyOptions: FAMILY_OPTIONS, eurRate: EUR_RATE_2027_FORECAST });

if (process.argv.includes('--check')) {
  const read = (u) => { try { return readFileSync(u, 'utf8'); } catch { return ''; } };
  const stale = outputs.filter(([u, txt]) => read(u) !== txt).map(([u]) => u.pathname.split('/').pop());
  console.log(stale.length ? `STALE: ${stale.join(', ')} differ from refModel.mjs/genCases.mjs output – run node tools/refmodel/genCases.mjs and review the diff` : 'OK: cases/expected files are up to date');
  process.exitCode = stale.length ? 1 : 0;
} else {
  for (const [u, txt] of outputs) writeFileSync(u, txt);
}
