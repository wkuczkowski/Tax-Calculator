// Random differential test app vs model (seeded, reproducible).
// Usage: node tools/refmodel/fuzz.mjs [--year=2027] [N=200] [seed=7 ...]
//        (npm run verify:fuzz / verify:fuzz2027; APP_DIR as in compare.mjs)
// --year=2027: tax year 2027, reform scenario on in half of the inputs (with a random „Przychód 2026”
// around the 250 000 EUR limit), start dates 2024–2027; ryczałt availability is compared too.
// --family: random family card (status, 0–5 children with months/disability, share, spouse, contributions,
// 4+), years 2026/2027 and the reform scenario mixed.
// Writes out/fuzz_out[_2027|_family]_<seed>.json per seed. Exit code 1 when any input differs (total > 0,02 zł) or throws.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { APP_DIR, OUT_DIR, YEAR, FAMILY, runApp } from './compare.mjs';
import { computeAll, EUR_RATE_2027_FORECAST } from './refModel.mjs';

const POS = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const N = Number(POS[0] || 200);
const SEEDS = POS.length > 1 ? POS.slice(1).map(Number) : [7];
const LIM250 = Math.round(250000 * EUR_RATE_2027_FORECAST * 100) / 100;
const LIM300 = Math.round(300000 * EUR_RATE_2027_FORECAST * 100) / 100;
const RATES = ['2', '3', '5.5', '8.5', '8.5-12.5', '10', '12', '14', '15', '17'];
const round2 = (x) => Math.round(x * 100) / 100;
// Family mode: 2 × T(½) is rounded differently (app: half and T(½) to the grosz, then × 2; model: once after
// doubling) in the variant AND in the household baseline H0, so up to ~0,02 zł can add up → 0,03.
const TOL_TOTAL = FAMILY ? 0.03 : 0.02;
// FAMILY_OPTS='{"capIncludesUndeductedHealth":false}' – compare against the model with other family
// interpretation switches (refModel.mjs FAMILY_OPTIONS), e.g. to reproduce an app that is being changed.
const FAM_OPTS = process.env.FAMILY_OPTS ? { family: JSON.parse(process.env.FAMILY_OPTS) } : {};
mkdirSync(OUT_DIR, { recursive: true });
console.log('APP_DIR:', APP_DIR);
let totalBad = 0;
function runSeed(startSeed) {
  let seed = startSeed;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const money = (max) => Math.round(rnd() * max * 100) / 100;
  const out = [];
  let bad = 0, nv = 0;
  for (let i = 0; i < N; i++) {
    const revenue = YEAR === 2026
      ? pick([money(80000), money(400000), money(1500000), pick([60000, 81459.48, 100000, 300000])])
      : pick([money(80000), money(400000), money(2500000), pick([60000, 84170.9, 100000, 150000, 300000, LIM250, LIM300, 1500000])]);
    const costs = pick([0, money(revenue * 0.6), money(revenue * 1.2)]);
    const y = YEAR === 2026 ? pick([2023, 2024, 2025, 2026, 2026, 2026]) : pick([2024, 2025, 2026, 2026, 2027, 2027]);
    const startDate = pick([null, `${y}-${String(1 + Math.floor(rnd() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}`]);
    const multi = rnd() < 0.2;
    const allocations = {};
    // Allocations are kept in whole grosze so that they always add up exactly to the revenue.
    if (multi) { const ks = [pick(RATES), pick(RATES)]; let left = revenue; ks.forEach((k, j) => { const v = j === ks.length - 1 ? left : round2(left * rnd()); allocations[k] = round2((allocations[k] || 0) + v); left = round2(left - v); }); }
    const reform = YEAR === 2027 && rnd() < 0.5;
    const famYear = FAMILY ? pick([2026, 2027, 2027]) : null;
    const famReform = FAMILY && famYear === 2027 && rnd() < 0.5;
    const inp = {
      ...(YEAR === 2026 ? {} : { year: YEAR, reform2027: reform, revenuePrevYear: reform ? pick([null, null, money(LIM250), LIM250, round2(LIM250 + 0.01), money(3000000)]) : null }),
      ...(famYear === 2027 ? { year: 2027, reform2027: famReform, revenuePrevYear: null } : {}),
      revenue, costs,
      otherScaleIncome: pick([0, 0, money(60000), money(200000), 1200000]),
      ipBox: rnd() < 0.3 ? { enabled: true, coeff: Math.floor(rnd() * 101) } : { enabled: false, coeff: 0 },
      joint: rnd() < 0.3 ? { enabled: true, spouseIncome: pick([0, money(50000), money(300000)]) } : { enabled: false, spouseIncome: 0 },
      multiRate: { enabled: multi && Object.values(allocations).every((v) => v > 0), allocations },
      zus: {
        enabled: rnd() < 0.9, startDate, path: pick(['full', 'ulga', 'pref']), chorobowe: rnd() < 0.7,
        birthDate: rnd() < 0.3 ? `${pick([1960, 1966, 1970, 1971, 1985])}-${String(1 + Math.floor(rnd() * 12)).padStart(2, '0')}-${pick(['01', '02', '15'])}` : null,
        sex: pick([null, 'K', 'M']), employmentContract: rnd() < 0.1, wakacje: rnd() < 0.3,
      },
    };
    if (FAMILY) {
      const status = pick(['married', 'single', 'other']);
      const nKids = pick([0, 1, 1, 2, 3, 4, 5]);
      const children = Array.from({ length: nKids }, () => ({ months: pick([12, 12, 12, 1 + Math.floor(rnd() * 12)]), disabled: rnd() < 0.1, adult: rnd() < 0.1 }));
      if (status !== 'married') inp.joint = { enabled: false, spouseIncome: 0 };
      else if (!inp.joint.enabled && rnd() < 0.7) inp.joint = { enabled: false, spouseIncome: pick([0, money(60000), money(200000)]) };
      if (inp.zus.startDate && Number(inp.zus.startDate.slice(0, 4)) > (inp.year || 2026)) inp.zus.startDate = null;
      const fourPlus = rnd() < 0.2;
      inp.family = {
        status, children, share: status === 'other' ? pick([100, 100, 50, Math.floor(rnd() * 101)]) : null,
        spouseLinRycz: status === 'married' && rnd() < 0.2, spouseLinearIncome: 0,
        spouseContrib: status === 'married' && rnd() < 0.3 ? money(20000) : null,
        otherContrib: rnd() < 0.3 ? money(15000) : null,
        fourPlus, fourPlusUsed: fourPlus && rnd() < 0.5 ? money(85528) : 0,
      };
      if (inp.family.spouseLinRycz && rnd() < 0.5) inp.family.spouseLinearIncome = money(150000);
    }
    const m = computeAll(inp, FAM_OPTS);
    let a;
    try { a = runApp(inp); } catch (e) { out.push({ inp, crash: String(e) }); bad++; continue; }
    const diffs = [];
    for (const [k, v] of Object.entries(a.variants)) {
      const mv = m.variants[k]; if (!mv) continue; nv++;
      if (!(Math.abs(v.total - mv.total) <= TOL_TOTAL)) diffs.push({ k, app: v.total, model: mv.total, appMethod: v.method, modelMethod: mv.method, appHol: v.holidayMonth, modelHol: mv.holidayMonth });
      if ((v.unavailable === 'true') !== !!mv.unavailable) diffs.push({ k, unavailable: { app: v.unavailable === 'true', model: !!mv.unavailable } });
    }
    if (a.errors.length) diffs.push({ errors: a.errors });
    if (diffs.length) { bad++; out.push({ inp, diffs }); }
  }
  writeFileSync(resolve(OUT_DIR, `fuzz_out${FAMILY ? '_family' : YEAR === 2026 ? '' : '_' + YEAR}_${startSeed}.json`), JSON.stringify(out, null, 1));
  console.log({ year: FAMILY ? 'family (2026/2027/reform mixed)' : YEAR, seed: startSeed, N, variants: nv, casesWithDiffs: bad });
  return bad;
}
for (const startSeed of SEEDS) totalBad += runSeed(startSeed);
console.log(totalBad ? `FAIL: ${totalBad} input(s) with differences (details: tools/refmodel/out/fuzz_out[_<year>]_<seed>.json)` : 'OK: no differences');
process.exitCode = totalBad ? 1 : 0;
