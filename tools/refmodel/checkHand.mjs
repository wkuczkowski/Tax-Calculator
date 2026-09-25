// Cross-checks the hand-worked numbers in HAND_CHECKS.md against refModel.mjs (model only, no app).
// Usage: node tools/refmodel/checkHand.mjs   (npm run verify:hand). Exit code 1 on any mismatch.
import { computeAll } from './refModel.mjs';
const Z = (o) => ({ enabled: true, startDate: null, path: 'full', chorobowe: true, birthDate: null, sex: null, employmentContract: false, wakacje: false, ...o });
const HAND = [
  { name: 'HC1', input: { revenue: 150000, costs: 10000, zus: Z({ startDate: '2026-03-15', path: 'full', birthDate: '1971-05-02', sex: 'K', wakacje: true }) },
    social: { S: 15287.0, FP: 214.41 }, wak: 5, n: 10,
    v: { taxScale: { pit: 12239.55, health: 11204.87, total: 38945.83 }, taxLinear: { pit: 22495.65, health: 6100.43, total: 44097.49 }, ryczalt12: { pit: 15667.21, health: 8305.8, total: 39474.42 } } },
  { name: 'HC2', input: { revenue: 400000, costs: 0, zus: Z({ startDate: '2026-03-15', path: 'ulga' }) },
    social: { S: 1368.54, FP: 0 }, n: 10,
    v: { taxLinear: { pit: 73060.98, health: 19532.94, total: 93962.46 }, taxScale: { pit: 99962.07, health: 35876.83, total: 137207.44 } } },
  { name: 'HC3a', input: { revenue: 81459.48, zus: Z({}) }, social: { S: 21459.48, FP: 1661.64 }, n: 12,
    v: { ryczalt12: { pit: 6841.19, health: 5980.2, total: 35942.51 } } },
  { name: 'HC3b', input: { revenue: 81459.49, zus: Z({}) }, social: { S: 21459.48, FP: 1661.64 }, n: 12,
    v: { ryczalt12: { pit: 6601.98, health: 9966.96, total: 39690.06 } } },
  { name: 'HC4', input: { revenue: 500000, costs: 100000, otherScaleIncome: 50000, joint: { enabled: true, spouseIncome: 30000 }, zus: Z({}) },
    social: { S: 21459.48, FP: 1661.64 }, n: 12,
    v: { taxScaleJoint: { pit: 91001.24, health: 33919.1, total: 145641.46 }, taxScale: { pit: 109001.24, health: 33919.1, total: 163641.46 } } },
  { name: 'HC5', input: { revenue: 200000, costs: 0, otherScaleIncome: 150000, ipBox: { enabled: true, coeff: 50 }, zus: Z({}) },
    social: { S: 21459.48, FP: 1661.64 }, n: 12,
    v: { taxLinearIpBox: { pit: 35686.83, health: 8667.07, total: 47075.02 }, taxScaleIpBox: { pit: 50225.56, health: 15919.1, total: 68865.78 } } },
  { name: 'HC6', input: { revenue: 200000, multiRate: { enabled: true, allocations: { '12': 50000, '8.5-12.5': 150000 } }, zus: Z({}) },
    social: { S: 21459.48, FP: 1661.64 }, n: 12,
    v: { ryczaltMulti: { pit: 18006.54, health: 9966.96, total: 51094.62 } } },
];
let bad = 0;
for (const h of HAND) {
  const r = computeAll(h.input);
  const chk = (label, a, b) => { const ok = Math.abs(a - b) < 0.005; if (!ok) bad++; console.log(`${ok ? 'OK ' : 'BAD'} ${h.name} ${label}: hand=${b} model=${a}`); };
  chk('S', r.social.S, h.social.S); chk('FP', r.social.FP, h.social.FP); chk('n', r.healthMonths, h.n);
  if (h.wak) chk('wakacje month', r.wakacje.month, h.wak);
  for (const [k, e] of Object.entries(h.v)) for (const f of ['pit', 'health', 'total']) chk(`${k}.${f}`, r.variants[k][f], e[f]);
}
console.log(bad ? `${bad} mismatches` : 'all hand checks match');
process.exitCode = bad ? 1 : 0;
