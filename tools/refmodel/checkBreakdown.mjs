// Breakdown-text consistency check on a sample of cases:
//  (1) every variant section's final "RAZEM … = X zł" equals the displayed data-total,
//  (2) the RAZEM addends equal data-(taxes − baseline), data-health, data-social,
//  (3) the "Składki ZUS w tym wariancie" line equals data-social,
//  (4) generic arithmetic lines inside the text are self-consistent:
//      "A × p% = B", "A + B (+ C…) = D", "A − B = C", "A : 2 = B", "A × 2 = B".
//
// Usage: node tools/refmodel/checkBreakdown.mjs [--year=2027 | --family]
//        (npm run verify:breakdown / verify:breakdown2027; APP_DIR as in compare.mjs)
// Writes out/breakdown_check[_2027].json. Exit code 1 when any problem is found.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { APP_DIR, OUT_DIR, YEAR, FAMILY, KNOWN_DIFFS_FAMILY, runApp } from './compare.mjs';
import { computeAll } from './refModel.mjs';

const cases = JSON.parse(readFileSync(new URL(FAMILY ? './casesFamily.json' : YEAR === 2026 ? './cases.json' : `./cases${YEAR}.json`, import.meta.url), 'utf8')).cases;
const HEAD = {
  'SKALA PODATKOWA': 'taxScale',
  'SKALA PODATKOWA Z IP BOX': 'taxScaleIpBox',
  'SKALA PODATKOWA WSPÓLNIE Z MAŁŻONKIEM': 'taxScaleJoint',
  'SKALA PODATKOWA Z IP BOX WSPÓLNIE Z MAŁŻONKIEM': 'taxScaleIpBoxJoint',
  'SKALA PODATKOWA — SAMOTNY RODZIC': 'taxScaleSingle',
  'SKALA PODATKOWA Z IP BOX — SAMOTNY RODZIC': 'taxScaleIpBoxSingle',
  'PODATEK LINIOWY': 'taxLinear',
  'PODATEK LINIOWY Z IP BOX': 'taxLinearIpBox',
  'RYCZAŁT (WIELE STAWEK)': 'ryczaltMulti',
};
const RYHEAD = { '2%': 'ryczalt2', '3%': 'ryczalt3', '5,5%': 'ryczalt5_5', '8,5%': 'ryczalt8_5', '10%': 'ryczalt10', '12%': 'ryczalt12', '14%': 'ryczalt14', '15%': 'ryczalt15', '17%': 'ryczalt17' };
// Amounts may carry an ASCII hyphen or a typographic minus (U+2212) – both are negative.
const num = (s) => Number(s.replace(/\s/g, '').replace(/\u00a0/g, '').replace(/\u2212/g, '-').replace(',', '.'));
const NUM = '([-\u2212]?\\d[\\d\\s\\u00a0]*,\\d{2})';

function sectionId(h) {
  if (HEAD[h]) return HEAD[h];
  const m = h.match(/^RYCZAŁT (.+)$/);
  if (m) {
    if (/8,5%.*12,5%/.test(m[1])) return 'ryczalt8_5_12_5';
    return RYHEAD[m[1].trim()] || null;
  }
  return null;
}

// pick ~50 cases spread over all groups
// 2027: every 7th case plus the joint / IP BOX / ryczałt-EUR / multi / hand-check groups (both scenarios).
const sample = FAMILY
  ? cases.filter((_, i) => i % 3 === 0).concat(cases.filter((c) => /^F(N|H|E)-/.test(c.id) && Number(c.id.split('-')[1]) % 3 !== 0)).slice(0, 110)
  : YEAR === 2026
  ? cases.filter((_, i) => i % 8 === 0).concat(cases.filter((c) => /^(J|K|L|N|H)-/.test(c.id) && Number(c.id.slice(2)) % 5 === 1)).slice(0, 60)
  : cases.filter((_, i) => i % 7 === 0).concat(cases.filter((c) => /^27(J|K|R|L|N)-/.test(c.id) && Number(c.id.split('-')[1]) % 3 === 0)).slice(0, 90);
const problems = [];
let checkedSections = 0, checkedArith = 0;
for (const cs of sample) {
  const a = runApp(cs.input, { breakdown: true });
  const text = a.breakdown;
  const lines = text.split('\n');
  // split into sections
  let cur = null;
  const sections = {};
  for (const ln of lines) {
    const h = ln.match(/^--- (.+) ---$/);
    if (h) { cur = sectionId(h[1]); if (cur) sections[cur] = []; continue; }
    if (/^={5,}/.test(ln)) cur = null;
    if (cur) sections[cur].push(ln);
  }
  // --family: the relief amount, the part deducted and the refund in each variant section agree with the model.
  const mFam = FAMILY && cs.input.family && cs.input.family.children.length ? computeAll(cs.input) : null;
  if (mFam && !mFam.error) {
    const m = mFam;
    const ku = text.match(new RegExp('Kwota ulgi rodziny: ' + NUM + ' zł'));
    checkedArith++;
    if (!ku || Math.abs(num(ku[1]) - m.family.baseline.family.reliefTotal) > 0.011) problems.push({ id: cs.id, issue: 'relief amount ≠ model', text: ku && ku[0], model: m.family.baseline.family.reliefTotal });
    for (const [id, sl] of Object.entries(sections)) {
      const mv = m.variants[id];
      if (!mv || !mv.family) continue;
      const used = sl.map((l) => l.match(new RegExp('Odliczono od podatku \\(art\\. 27f ust\\. 1\\): .*= ' + NUM + ' zł'))).find(Boolean);
      const ref = sl.map((l) => l.match(new RegExp('Zwrot niewykorzystanej ulgi \\(art\\. 27f ust\\. 8\\): .*= ' + NUM + ' zł'))).find(Boolean);
      checkedArith++;
      if (used && Math.abs(num(used[1]) - mv.family.used) > 0.011) problems.push({ id: cs.id, variant: id, issue: 'deducted relief ≠ model', text: used[0], model: mv.family.used });
      if (ref && Math.abs(num(ref[1]) - mv.family.refund) > 0.011 && !KNOWN_DIFFS_FAMILY[cs.id]) problems.push({ id: cs.id, variant: id, issue: 'refund ≠ model', text: ref[0], model: mv.family.refund });
      if (!ref && mv.family.refund > 0.005) problems.push({ id: cs.id, variant: id, issue: 'model refund but no refund line', model: mv.family.refund });
    }
  }
  for (const [id, sl] of Object.entries(sections)) {
    const d = a.variants[id];
    if (!d) { problems.push({ id: cs.id, variant: id, issue: 'section without displayed variant' }); continue; }
    checkedSections++;
    const razemIdx = sl.findIndex((l) => l.startsWith('RAZEM'));
    const razem = sl.slice(razemIdx + 1).find((l) => /=/.test(l));
    if (!razem) { problems.push({ id: cs.id, variant: id, issue: 'no RAZEM line' }); continue; }
    const nums = [...razem.matchAll(new RegExp(NUM, 'g'))].map((m) => num(m[1]));
    const total = nums[nums.length - 1];
    if (Math.abs(total - d.total) > 0.011) problems.push({ id: cs.id, variant: id, issue: 'RAZEM total ≠ data-total', text: razem.trim(), dataTotal: d.total });
    if (nums.length === 4) {
      const [t, h, s] = nums;
      if (Math.abs(t - (d.taxes - d.baseline)) > 0.011 || Math.abs(h - d.health) > 0.011 || Math.abs(s - d.social) > 0.011) problems.push({ id: cs.id, variant: id, issue: 'RAZEM addends ≠ data-*', text: razem.trim(), data: { taxesMinusBaseline: +(d.taxes - d.baseline).toFixed(2), health: d.health, social: d.social } });
    }
    const zl = sl.find((l) => l.startsWith('Składki ZUS w tym wariancie'));
    if (zl) {
      const zn = [...zl.matchAll(new RegExp(NUM, 'g'))].map((m) => num(m[1]));
      if (Math.abs(zn[zn.length - 1] - d.social) > 0.011) problems.push({ id: cs.id, variant: id, issue: 'ZUS line ≠ data-social', text: zl.trim(), dataSocial: d.social });
    }
  }
  // generic arithmetic
  for (const ln of lines) {
    let m;
    if ((m = ln.match(new RegExp('min\\(' + NUM + ' zł; ' + NUM + ' zł\\) = ' + NUM + ' zł')))) {
      checkedArith++;
      if (Math.abs(Math.min(num(m[1]), num(m[2])) - num(m[3])) > 0.011) problems.push({ id: cs.id, issue: 'min(A; B) ≠ C', text: ln.trim() });
    } else if ((m = ln.match(new RegExp(NUM + ' zł × (\\d+(?:,\\d+)?)% = ' + NUM + ' zł')))) {
      checkedArith++;
      const A = num(m[1]), p = num(m[2]), B = num(m[3]);
      if (Math.abs(Math.round(A * p) / 100 - B) > 0.011) problems.push({ id: cs.id, issue: 'A × p% ≠ B', text: ln.trim() });
    } else if ((m = ln.match(new RegExp(NUM + ' zł × (\\d+) = ' + NUM + ' zł')))) {
      checkedArith++;
      if (Math.abs(num(m[1]) * Number(m[2]) - num(m[3])) > 0.011) problems.push({ id: cs.id, issue: 'A × k ≠ B', text: ln.trim() });
    } else if ((m = ln.match(new RegExp(NUM + ' zł : 2 = ' + NUM + ' zł')))) {
      checkedArith++;
      if (Math.abs(num(m[1]) / 2 - num(m[2])) > 0.006) problems.push({ id: cs.id, issue: 'A : 2 ≠ B', text: ln.trim() });
    } else if (/=/.test(ln) && !/×|:|%|\//.test(ln)) {
      // sums / differences: "A zł + B zł − C zł = D zł" (only when every token is a money amount)
      const eq = ln.lastIndexOf('=');
      const lhs = ln.slice(0, eq), rhs = ln.slice(eq + 1);
      const rn = rhs.match(new RegExp('^\\s*' + NUM + ' zł\\s*$'));
      const lhsBody = lhs.replace(/^[^:]*:\s*/, '');
      const toks = lhsBody.match(new RegExp('([+−-]\\s*)?' + NUM + ' zł', 'g'));
      if (!rn || !toks || toks.length < 2) continue;
      const rest = lhsBody.replace(new RegExp('([+−-]\\s*)?' + NUM + ' zł', 'g'), '').replace(/\([^)]*\)/g, '').replace(/[a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ0-9.,\s]/g, '');
      if (rest.length) continue; // contains other words/ops – skip
      let sum = 0;
      for (const t of toks) {
        const neg = /^[−-]/.test(t.trim());
        const v = num(t.replace(/^[+−-]\s*/, '').replace(' zł', ''));
        sum += neg ? -v : v;
      }
      checkedArith++;
      if (Math.abs(sum - num(rn[1])) > 0.011) problems.push({ id: cs.id, issue: 'sum/diff ≠ result', text: ln.trim(), computed: +sum.toFixed(2) });
    }
  }
}
mkdirSync(OUT_DIR, { recursive: true });
const OUT_NAME = FAMILY ? 'breakdown_check_family.json' : YEAR === 2026 ? 'breakdown_check.json' : `breakdown_check_${YEAR}.json`;
writeFileSync(resolve(OUT_DIR, OUT_NAME), JSON.stringify({ sampled: sample.length, checkedSections, checkedArith, problems }, null, 1));
console.log('APP_DIR:', APP_DIR, 'year:', YEAR);
console.log({ sampled: sample.length, checkedSections, checkedArith, problems: problems.length });
for (const p of problems.slice(0, 40)) console.log(JSON.stringify(p));
console.log(problems.length ? `FAIL: ${problems.length} problem(s) (details: tools/refmodel/out/${OUT_NAME})` : 'OK: breakdown text consistent');
process.exitCode = problems.length ? 1 : 0;
