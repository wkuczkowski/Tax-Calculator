// Cross-checks the hand-worked numbers in HAND_CHECKS.md (2026 and 2027) against refModel.mjs (model only, no app).
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
  // ---- 2027 (HAND_CHECKS.md, section "Rok 2027") ----
  { name: 'Y1', input: { year: 2027, revenue: 200000, zus: Z({}) }, social: { S: 22855.92, FP: 1769.88 }, n: 12,
    v: { taxScale: { pit: 28519.74, health: 15783.68, total: 68929.22 }, taxLinear: { pit: 31688.36, health: 8593.34, total: 64907.5 }, ryczalt12: { pit: 20627.43, health: 10497.6, total: 55750.83 } } },
  { name: 'Y1-reform', input: { year: 2027, reform2027: true, revenue: 200000, zus: Z({}) }, social: { S: 22855.92, FP: 1769.88 }, n: 12,
    v: { taxScale: { pit: 24919.74, health: 15783.68, total: 65329.22 }, taxLinear: { pit: 31688.36, health: 8593.34, total: 64907.5 }, ryczalt12: { pit: 20627.43, health: 10497.6, total: 55750.83 } } },
  { name: 'Y2', input: { year: 2027, revenue: 90000, costs: 10000, zus: Z({ startDate: '2026-10-15', path: 'ulga' }) }, social: { S: 3758.8, FP: 0 }, n: 12,
    v: { taxScale: { pit: 5548.94, health: 6861.71, total: 16169.45 }, taxLinear: { pit: 13470.09, health: 5346, total: 22574.89 }, ryczalt12: { pit: 9719.09, health: 10497.6, total: 23975.49 } } },
  { name: 'Y3-reform', input: { year: 2027, reform2027: true, revenue: 400000, costs: 50000, joint: { enabled: true, spouseIncome: 60000 }, zus: Z({}) }, social: { S: 22855.92, FP: 1769.88 }, n: 12,
    v: { taxScaleJoint: { pit: 60919.74, health: 29283.68, total: 111229.22 }, taxScale: { pit: 72919.74, health: 29283.68, total: 126829.22 }, taxLinear: { pit: 58952.1, health: 15943.34, total: 99521.24 } } },
  { name: 'Y3-current', input: { year: 2027, revenue: 400000, costs: 50000, joint: { enabled: true, spouseIncome: 60000 }, zus: Z({}) }, social: { S: 22855.92, FP: 1769.88 }, n: 12,
    v: { taxScaleJoint: { pit: 68119.74, health: 29283.68, total: 118429.22 }, taxScale: { pit: 76519.74, health: 29283.68, total: 130429.22 } } },
  { name: 'Y4-reform', input: { year: 2027, reform2027: true, revenue: 1500000, revenuePrevYear: 800000, zus: Z({ startDate: '2025-08-15', path: 'pref' }) }, social: { S: 11377.44, FP: 589.96 }, n: 12,
    v: { ryczalt12: { pit: 186745.81, health: 18895.68, total: 217608.89 }, taxLinear: { pit: 279857.19, health: 72913.6, danina: 23646.63, total: 388384.82 } } },
  { name: 'Y4-current', input: { year: 2027, revenue: 1500000, zus: Z({ startDate: '2025-08-15', path: 'pref' }) }, social: { S: 11377.44, FP: 589.96 }, n: 12,
    v: { ryczalt12: { pit: 177500.97, health: 18895.68, total: 208364.05 }, taxLinear: { pit: 279857.19, health: 72913.6, danina: 18917.3, total: 383655.49 } } },
  // SPEC_MULTIYEAR explicit tests: reform scale T(140 000) = 14 400, T(200 000) = 32 800 (ZUS off ⇒ base = revenue).
  { name: 'T140k', input: { year: 2027, reform2027: true, revenue: 140000, zus: Z({ enabled: false }) }, social: { S: 0, FP: 0 }, n: 12, v: { taxScale: { pit: 14400 } } },
  { name: 'T200k', input: { year: 2027, reform2027: true, revenue: 200000, zus: Z({ enabled: false }) }, social: { S: 0, FP: 0 }, n: 12, v: { taxScale: { pit: 32800 } } },
];
let bad = 0;
for (const h of HAND) {
  const r = computeAll(h.input);
  const chk = (label, a, b) => { const ok = Math.abs(a - b) < 0.005; if (!ok) bad++; console.log(`${ok ? 'OK ' : 'BAD'} ${h.name} ${label}: hand=${b} model=${a}`); };
  chk('S', r.social.S, h.social.S); chk('FP', r.social.FP, h.social.FP); chk('n', r.healthMonths, h.n);
  if (h.wak) chk('wakacje month', r.wakacje.month, h.wak);
  for (const [k, e] of Object.entries(h.v)) for (const f of ['pit', 'health', 'danina', 'total']) if (e[f] !== undefined) chk(`${k}.${f}`, r.variants[k][f], e[f]);
  if (h.input.year === 2027 && h.input.zus.enabled && !h.input.zus.startDate) {
    // one full month 2027: 1 904,66 social + 147,49 FP = 2 052,15; health minimum 12 × 445,50 = 5 346
    chk('full month total', r.social.months[0].total, 2052.15);
  }
  if (h.name === 'Y2') { chk('pref month total', r.social.months[11].total, 469.85); }
}
console.log(bad ? `${bad} mismatches` : 'all hand checks match');
process.exitCode = bad ? 1 : 0;
