// Generates cases.json (inputs) and expected.json (reference outputs) using refModel.mjs.
// Run:   node tools/refmodel/genCases.mjs           – rewrites cases.json and expected.json
//        node tools/refmodel/genCases.mjs --check   – regenerates in memory and reports whether the
//                                                     committed files are up to date (exit 1 if not)
// Both files are written one case per line, so `git diff` shows exactly which cases changed.
import { readFileSync, writeFileSync } from 'node:fs';
import { computeAll, DEFAULT_OPTIONS } from './refModel.mjs';

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
const expected = cases.map((c) => {
  const result = computeAll(c.input);
  const alt = {};
  for (const [name, o] of Object.entries(ALT)) {
    const a = computeAll(c.input, o);
    const diff = {};
    if (Math.abs(a.social.S - result.social.S) > 0.001 || Math.abs(a.social.FP - result.social.FP) > 0.001) diff._social = { S: a.social.S, FP: a.social.FP };
    for (const [k, v] of Object.entries(a.variants)) if (Math.abs(v.total - result.variants[k].total) > 0.004) diff[k] = { total: v.total, pit: v.pit, health: v.health, danina: v.danina, method: v.method };
    if (Object.keys(diff).length) alt[name] = diff;
  }
  return { id: c.id, result, alt };
});
// Every amount typed into the app must be a whole number of grosze (the app rejects > 2 decimals).
// compare.mjs types String(x) into the field, so check the string form (catches float noise).
const isGrosze = (x) => Number.isFinite(x) && /^-?\d+(\.\d{1,2})?$/.test(String(x));
for (const c of cases) {
  const { revenue, costs, otherScaleIncome, joint, multiRate } = c.input;
  const amounts = [revenue, costs, otherScaleIncome, joint.spouseIncome, ...Object.values(multiRate.allocations)];
  const badAmount = amounts.find((x) => !isGrosze(x));
  if (badAmount !== undefined) throw new Error(`${c.id}: amount ${badAmount} is not a whole number of grosze`);
}

// One entry per line: valid JSON, small diffs.
const lines = (header, key, items) => `${JSON.stringify(header).slice(0, -1)},${JSON.stringify(key)}:[\n${items.map((x) => JSON.stringify(x)).join(',\n')}\n]}\n`;
const casesJson = lines({ note: 'Inputs for refModel.mjs computeAll(). ipBox.coeff is in percent. zus.path ignored when startDate is null. Amounts annual PLN.', options: DEFAULT_OPTIONS }, 'cases', cases);
const expectedJson = lines({ generatedWith: DEFAULT_OPTIONS }, 'results', expected);
const casesUrl = new URL('./cases.json', import.meta.url);
const expectedUrl = new URL('./expected.json', import.meta.url);
if (process.argv.includes('--check')) {
  const read = (u) => { try { return readFileSync(u, 'utf8'); } catch { return ''; } };
  const stale = [[casesUrl, casesJson], [expectedUrl, expectedJson]].filter(([u, txt]) => read(u) !== txt).map(([u]) => u.pathname.split('/').pop());
  console.log(stale.length ? `STALE: ${stale.join(', ')} differ from refModel.mjs/genCases.mjs output – run node tools/refmodel/genCases.mjs and review the diff` : 'OK: cases.json and expected.json are up to date');
  process.exitCode = stale.length ? 1 : 0;
} else {
  writeFileSync(casesUrl, casesJson);
  writeFileSync(expectedUrl, expectedJson);
}
console.log('cases:', cases.length);
const groups = {};
for (const c of cases) groups[c.group] = (groups[c.group] || 0) + 1;
console.log(groups);
