// Random differential test app vs model (seeded, reproducible).
// Usage: node tools/refmodel/fuzz.mjs [N=200] [seed=7 ...]   (npm run verify:fuzz; APP_DIR as in compare.mjs)
// Writes out/fuzz_out_<seed>.json per seed. Exit code 1 when any input differs (total > 0,02 zł) or throws.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { APP_DIR, OUT_DIR, runApp } from './compare.mjs';
import { computeAll } from './refModel.mjs';

const N = Number(process.argv[2] || 200);
const SEEDS = process.argv.length > 3 ? process.argv.slice(3).map(Number) : [7];
const RATES = ['2', '3', '5.5', '8.5', '8.5-12.5', '10', '12', '14', '15', '17'];
const round2 = (x) => Math.round(x * 100) / 100;
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
    const revenue = pick([money(80000), money(400000), money(1500000), pick([60000, 81459.48, 100000, 300000])]);
    const costs = pick([0, money(revenue * 0.6), money(revenue * 1.2)]);
    const y = pick([2023, 2024, 2025, 2026, 2026, 2026]);
    const startDate = pick([null, `${y}-${String(1 + Math.floor(rnd() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}`]);
    const multi = rnd() < 0.2;
    const allocations = {};
    // Allocations are kept in whole grosze so that they always add up exactly to the revenue.
    if (multi) { const ks = [pick(RATES), pick(RATES)]; let left = revenue; ks.forEach((k, j) => { const v = j === ks.length - 1 ? left : round2(left * rnd()); allocations[k] = round2((allocations[k] || 0) + v); left = round2(left - v); }); }
    const inp = {
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
    const m = computeAll(inp);
    let a;
    try { a = runApp(inp); } catch (e) { out.push({ inp, crash: String(e) }); bad++; continue; }
    const diffs = [];
    for (const [k, v] of Object.entries(a.variants)) {
      const mv = m.variants[k]; if (!mv) continue; nv++;
      if (!(Math.abs(v.total - mv.total) <= 0.02)) diffs.push({ k, app: v.total, model: mv.total, appMethod: v.method, modelMethod: mv.method, appHol: v.holidayMonth, modelHol: mv.holidayMonth });
    }
    if (a.errors.length) diffs.push({ errors: a.errors });
    if (diffs.length) { bad++; out.push({ inp, diffs }); }
  }
  writeFileSync(resolve(OUT_DIR, `fuzz_out_${startSeed}.json`), JSON.stringify(out, null, 1));
  console.log({ seed: startSeed, N, variants: nv, casesWithDiffs: bad });
  return bad;
}
for (const startSeed of SEEDS) totalBad += runSeed(startSeed);
console.log(totalBad ? `FAIL: ${totalBad} input(s) with differences (details: tools/refmodel/out/fuzz_out_<seed>.json)` : 'OK: no differences');
process.exitCode = totalBad ? 1 : 0;
