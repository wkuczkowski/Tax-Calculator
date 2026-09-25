// Drives the real app (index.html + scripts) through jsdom via the app's own test loader
// (<APP_DIR>/tests/helpers/loadCalculator.js) and compares DOM outputs with refModel.mjs
// for every case in cases.json (2026) or cases2027.json (2027: current law + reform scenario).
//
// Usage: node tools/refmodel/compare.mjs [--year=2027] [idPrefix]
//        (npm run verify:refmodel / npm run verify:refmodel2027)
//   APP_DIR=<path to an app directory>  – default: <repo>/app
// Each case's input.year / input.reform2027 open the app with ?rok=…&projekt=1 (loader options);
// input.revenuePrevYear fills „Przychód 2026”. Ryczałt availability (data-unavailable) is compared too.
// Writes out/compare_out[_2027].json (per case) and out/compare_soft[_2027].json (holiday-month diffs).
// Exit code 1 when there is any mismatch, crash or ZUS-summary diff outside KNOWN_DIFFS.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { computeAll } from './refModel.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const APP_DIR = resolve(process.env.APP_DIR || resolve(HERE, '..', '..', 'app'));
export const OUT_DIR = resolve(HERE, 'out');
const { loadCalculator } = await import(pathToFileURL(resolve(APP_DIR, 'tests', 'helpers', 'loadCalculator.js')).href);

// Accepted, documented differences (see README.md, "Znane, zaakceptowane różnice").
export const KNOWN_DIFFS = {
  'L-385': 'RC2: wiele stawek, suma przydziałów ≠ przychód – aplikacja liczy próg zdrowotnej i proporcje od pełnego przychodu, model od sumy przydziałów (docs/weryfikacja/porownanie-z-modelem-referencyjnym.md)',
};
export const KNOWN_DIFFS_2027 = {};
// Family grid: empty since a0a67be (the app reads the art. 27f ust. 9 refund cap literally, like the model).
export const KNOWN_DIFFS_FAMILY = {};

const RY = { '2': 'ryczalt2', '3': 'ryczalt3', '5.5': 'ryczalt5_5', '8.5': 'ryczalt8_5', '8.5-12.5': 'ryczalt8_5_12_5', '10': 'ryczalt10', '12': 'ryczalt12', '14': 'ryczalt14', '15': 'ryczalt15', '17': 'ryczalt17' };
const ARGS = process.argv.slice(2);
const YEAR_ARG = ARGS.find((a) => a.startsWith('--year='));
export const YEAR = YEAR_ARG ? Number(YEAR_ARG.slice(7)) : 2026;
// --family: the family-relief grid (casesFamily.json, both years; each case carries its own year).
export const FAMILY = ARGS.includes('--family');
// Family grid: 2 × T(½) rounding (single parent / joint) differs in the variant and in the household
// baseline (app: half and T(½) to the grosz, then × 2; model: once after doubling) → up to ~0,02 + 0,01.
const TOL = FAMILY ? 0.03 : 0.02;
const SUFFIX = FAMILY ? '_family' : YEAR === 2026 ? '' : `_${YEAR}`;
const CASES_FILE = FAMILY ? './casesFamily.json' : YEAR === 2026 ? './cases.json' : `./cases${YEAR}.json`;
const KNOWN = FAMILY ? KNOWN_DIFFS_FAMILY : YEAR === 2026 ? KNOWN_DIFFS : KNOWN_DIFFS_2027;
const cases = JSON.parse(readFileSync(new URL(CASES_FILE, import.meta.url), 'utf8')).cases;
const filter = ARGS.find((a) => !a.startsWith('--'));

// The app treats '.' as a thousands separator ("23121.12" → 2 312 112), so feed Polish decimal commas.
const pl = (x) => String(x).replace('.', ',');
export function runApp(inp, { breakdown = false } = {}) {
  const c = loadCalculator({ year: inp.year || 2026, reform: !!inp.reform2027 });
  const errors = [];
  c.window.addEventListener('error', (e) => errors.push(String(e.message)));
  try {
    c.setRevenue(pl(inp.revenue));
    c.setCosts(pl(inp.costs));
    c.setOtherIncome(pl(inp.otherScaleIncome || 0));
    if (inp.ipBox.enabled) c.setIpBox(inp.ipBox.coeff);
    if (inp.joint.enabled) c.setJointTaxation(true, pl(inp.joint.spouseIncome));
    const z = inp.zus;
    c.setZusEnabled(!!z.enabled);
    c.setStartDate(z.startDate || '');
    c.setZusPath(z.path || 'full');
    c.setSickness(!!z.chorobowe);
    c.setEmployment(!!z.employmentContract);
    c.setHoliday(!!z.wakacje);
    c.setBirthDate(z.birthDate || '');
    c.setSex(z.sex || '');
    const f = inp.family;
    if (f) {
      // Karta „Rodzina” (loader setters), expanded as a user would (so its validation is active).
      // Status before the spouse fields; joint filing forces „married”.
      const tg = c.document.getElementById('familyToggle');
      if (tg && tg.getAttribute('aria-expanded') !== 'true') tg.click();
      if (!inp.joint.enabled) c.setFamilyStatus(f.status || 'other');
      for (const ch of f.children || []) c.addChild({ months: ch.months ?? 12, disabled: !!ch.disabled, adult: !!ch.adult });
      if ((f.status || 'other') === 'other' && f.share !== undefined && f.share !== null) c.setFamilyShare(f.share);
      if (f.status === 'married' && !inp.joint.enabled && inp.joint.spouseIncome) c.setSpouseIncome(pl(inp.joint.spouseIncome));
      if (f.spouseLinRycz) c.setSpouseLinRycz(true);
      if (f.spouseLinearIncome) c.setSpouseLinearIncome(pl(f.spouseLinearIncome));
      if (f.spouseContrib !== undefined && f.spouseContrib !== null) c.setSpouseContrib(pl(f.spouseContrib));
      if (f.otherContrib !== undefined && f.otherContrib !== null) c.setOtherContrib(pl(f.otherContrib));
      if (f.fourPlus) c.setFourPlus(true, f.fourPlusUsed ? pl(f.fourPlusUsed) : '');
    }
    if (inp.reform2027 && inp.revenuePrevYear !== null && inp.revenuePrevYear !== undefined) c.setPrevYearRevenue(pl(inp.revenuePrevYear));
    const multi = inp.multiRate.enabled;
    if (multi) {
      c.enableMultipleRates(true);
      for (const [k, v] of Object.entries(inp.multiRate.allocations)) { c.toggleRyczaltRate(RY[k]); c.setRateRevenue(RY[k], pl(v)); }
    } else {
      for (const k of Object.values(RY)) c.toggleRyczaltRate(k);
    }
    c.calculate();
    const out = { variants: {}, errors };
    const ids = ['taxScale', 'taxLinear'];
    if (inp.joint.enabled) ids.push('taxScaleJoint');
    if (inp.ipBox.enabled) { ids.push('taxScaleIpBox', 'taxLinearIpBox'); if (inp.joint.enabled) ids.push('taxScaleIpBoxJoint'); }
    if (inp.family && inp.family.status === 'single' && !inp.joint.enabled && (inp.family.children || []).length) { ids.push('taxScaleSingle'); if (inp.ipBox.enabled) ids.push('taxScaleIpBoxSingle'); }
    if (!multi) ids.push(...Object.values(RY));
    for (const id of ids) {
      const el = c.document.getElementById(id);
      const group = el && el.closest('.input-group');
      const hidden = group && group.style.display === 'none';
      const d = c.readVariantData(id);
      out.variants[id] = { ...d, hidden, value: el.value };
    }
    if (multi) out.variants.ryczaltMulti = { ...c.readVariantData('ratesTotal'), value: c.document.getElementById('ratesTotalValue').textContent };
    const st = c.document.getElementById('zusSocialTotal');
    out.social = st ? { total: Number(st.dataset.total), social: Number(st.dataset.social), fpfs: Number(st.dataset.fpfs) } : null;
    out.months = [...c.document.querySelectorAll('#zusMonths li')].map((li) => ({ regime: li.dataset.regime, text: li.textContent.replace(/\s+/g, ' ').trim() }));
    out.outputs = c.readOutputs();
    out.invalid = c.document.querySelector('[data-state="invalid"]') !== null;
    if (breakdown) out.breakdown = c.readBreakdown();
    return out;
  } finally {
    c.close();
  }
}

function modelView(r, key) {
  const v = r.variants[key];
  if (!v) return null;
  // Presentation convention of the app for joint variants: the spouse's solo PIT is netted inside
  // "taxes" instead of being part of "baseline" (the total is the same).
  const sp = v.baseline.spousePit || 0;
  return {
    total: v.total,
    taxes: v.pit + v.danina - sp,
    baseline: v.baseline.total - sp,
    health: v.health,
    social: v.socialTotal,
    method: v.method,
    holidayMonth: v.holidayMonth,
    unavailable: !!v.unavailable,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = [];
  const softDiffs = [];
  let nVar = 0, nBad = 0;
  for (const cs of cases) {
    if (filter && !cs.id.startsWith(filter)) continue;
    const m = computeAll(cs.input);
    let app;
    try { app = runApp(cs.input); } catch (e) { report.push({ id: cs.id, desc: cs.desc, crash: String(e.stack || e) }); nBad++; continue; }
    if (m.error) {
      // Model rejects the input (e.g. start date after the tax year): the app must show no results.
      const shown = Object.entries(app.variants).filter(([, a]) => Number.isFinite(a.total)).map(([k]) => k);
      const diffs = shown.length || !app.invalid ? [{ key: '_invalidInput', fields: { modelError: m.error, appInvalidState: app.invalid, appVariantsWithTotal: shown } }] : [];
      nBad += diffs.length;
      report.push({ id: cs.id, desc: cs.desc, diffs, socialDiff: null, regimes: [], modelRegimes: [], errors: app.errors });
      continue;
    }
    const diffs = [];
    for (const [key, a] of Object.entries(app.variants)) {
      const mv = modelView(m, key);
      if (!mv) continue;
      nVar++;
      const fields = {};
      for (const f of ['total', 'taxes', 'baseline', 'health', 'social']) {
        if (!(Math.abs((a[f] ?? NaN) - mv[f]) <= TOL)) fields[f] = { app: a[f], model: r2(mv[f]) };
      }
      const identity = r2(a.taxes - a.baseline + a.health + a.social);
      if (Math.abs(identity - a.total) > TOL) fields.identity = { app: a.total, sum: identity };
      if (a.hidden) fields.hidden = true;
      if ((a.unavailable === 'true') !== mv.unavailable) fields.unavailable = { app: a.unavailable === 'true', model: mv.unavailable };
      const soft = {};
      if ((a.holidayMonth ?? null) !== (mv.holidayMonth ?? null) && !(Number.isNaN(a.holidayMonth))) soft.holidayMonth = { app: a.holidayMonth ?? null, model: mv.holidayMonth ?? null };
      if (Object.keys(soft).length) softDiffs.push({ id: cs.id, key, soft, total: a.total });
      if (Object.keys(fields).length) { nBad++; diffs.push({ key, fields, appMethod: a.method, appHoliday: a.holidayMonth, modelMethod: mv.method, modelHoliday: mv.holidayMonth }); }
    }
    const soc = app.social;
    const socialDiff = soc && (Math.abs(soc.social - m.social.S) > TOL || Math.abs(soc.fpfs - m.social.FP) > TOL) ? { app: soc, model: { S: m.social.S, FP: m.social.FP } } : null;
    const regimes = app.months.map((x) => x.regime);
    report.push({ id: cs.id, desc: cs.desc, diffs, socialDiff, regimes, modelRegimes: m.social.months.map((x) => x.regime), errors: app.errors, healthMonthsApp: app.outputs.healthMonths, healthMonthsModel: m.healthMonths });
  }
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, `compare_out${SUFFIX}.json`), JSON.stringify(report, null, 1));
  writeFileSync(resolve(OUT_DIR, `compare_soft${SUFFIX}.json`), JSON.stringify(softDiffs, null, 1));
  console.log('APP_DIR:', APP_DIR, 'year:', YEAR, 'cases file:', CASES_FILE);
  console.log('soft (holiday-month) diffs:', softDiffs.length);
  console.log(`variants compared: ${nVar}, mismatching variants: ${nBad}, cases with diffs: ${report.filter((r) => r.crash || r.diffs.length).length}/${report.length}, social-summary diffs: ${report.filter((r) => r.socialDiff).length}`);
  const flagged = report.filter((r) => r.crash || r.diffs.length || r.socialDiff || r.errors?.length);
  const known = flagged.filter((r) => KNOWN[r.id]);
  const unknown = flagged.filter((r) => !KNOWN[r.id]);
  for (const r of known) console.log(`known   ${r.id}: ${r.diffs.map((d) => d.key).join(', ')} – ${KNOWN[r.id]}`);
  for (const r of unknown) {
    console.log(`UNKNOWN ${r.id} (${r.desc}):`);
    if (r.crash) console.log('  crash:', r.crash.split('\n')[0]);
    for (const d of r.diffs) console.log(`  ${d.key}: ${JSON.stringify(d.fields)}`);
    if (r.socialDiff) console.log('  social:', JSON.stringify(r.socialDiff));
    if (r.errors?.length) console.log('  errors:', JSON.stringify(r.errors));
  }
  for (const id of Object.keys(KNOWN)) if (!filter && !known.some((r) => r.id === id)) console.log(`note: known diff ${id} no longer reproduces – consider removing it from KNOWN_DIFFS`);
  console.log(unknown.length ? `FAIL: ${unknown.length} case(s) with unexpected differences (details: tools/refmodel/out/compare_out${SUFFIX}.json)` : 'OK: no unexpected differences');
  process.exitCode = unknown.length ? 1 : 0;
}
function r2(x) { return Math.round(x * 100) / 100; }
