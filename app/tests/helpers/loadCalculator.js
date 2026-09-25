import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CALC_ROOT = resolve(HERE, "..", "..");

const HTML_PATH = resolve(CALC_ROOT, "index.html");
const TAX_CONSTANTS_PATH = resolve(CALC_ROOT, "taxConstants.js");
const SCRIPT_PATH = resolve(CALC_ROOT, "script.js");

const RESULT_IDS = [
  "income",
  "taxScale",
  "taxScaleIpBox",
  "taxScaleSingle",
  "taxScaleIpBoxSingle",
  "taxScaleJoint",
  "taxScaleIpBoxJoint",
  "taxLinear",
  "taxLinearIpBox",
  "ryczalt2",
  "ryczalt3",
  "ryczalt5_5",
  "ryczalt8_5",
  "ryczalt8_5_12_5",
  "ryczalt10",
  "ryczalt12",
  "ryczalt14",
  "ryczalt15",
  "ryczalt17",
];

const RYCZALT_KEYS = [
  "ryczalt2",
  "ryczalt3",
  "ryczalt5_5",
  "ryczalt8_5",
  "ryczalt8_5_12_5",
  "ryczalt10",
  "ryczalt12",
  "ryczalt14",
  "ryczalt15",
  "ryczalt17",
];

/**
 * Builds a JSDOM document by reading the real index.html, stripping its
 * external <script> tags, and inlining taxConstants.js + script.js so the
 * calculator's IIFE runs against the test DOM.
 *
 * A bootstrap script after them re-publishes the top-level globals
 * (TAX_CONSTANTS – the active constant set, via a getter because it changes
 * with the year switch; taxYears, taxMath, per-year constants and scenarios)
 * onto window so tests can inspect them. Browsers don't auto-attach
 * top-level `const`/`let` to window, so this exposure is only for tests - it
 * does not change runtime behavior.
 */
function buildDocumentSource() {
  const html = readFileSync(HTML_PATH, "utf8");
  const taxConstantsSrc = readFileSync(TAX_CONSTANTS_PATH, "utf8");
  const scriptSrc = readFileSync(SCRIPT_PATH, "utf8");

  const stripped = html
    .replace(/<script\s+src="taxConstants\.js"\s*><\/script>/i, "")
    .replace(/<script\s+src="script\.js"\s*><\/script>/i, "");

  const exposeGlobals = `
    Object.defineProperty(window, "TAX_CONSTANTS", {
      configurable: true,
      get: () => TAX_CONSTANTS,
    });
    window.taxMath = taxMath;
    window.taxYears = taxYears;
    window.TAX_CONSTANTS_BY_YEAR = TAX_CONSTANTS_BY_YEAR;
    window.TAX_CONSTANTS_META_BY_YEAR = TAX_CONSTANTS_META_BY_YEAR;
    window.TAX_CONSTANT_LABELS = TAX_CONSTANT_LABELS;
    window.TAX_SCENARIOS = TAX_SCENARIOS;
  `;

  const injected = `
<script>${taxConstantsSrc}\n${exposeGlobals}</script>
<script>${scriptSrc}</script>
`;

  return stripped.replace("</body>", `${injected}</body>`);
}

/**
 * Boots a fresh calculator instance in a new JSDOM window.
 * Returns an ergonomic API for driving inputs and reading outputs.
 *
 * Options:
 * - year: tax year put in the address (?rok=…). Default 2026, so existing
 *   tests and tools/refmodel keep testing 2026 regardless of today's date.
 *   null = no ?rok= parameter (the default-year rule applies).
 * - reform: true adds &projekt=1 (scenario „Projekt zmian 2027”).
 * - today: "RRRR-MM-DD" – fixed date for the page (Date / Date.now), to test
 *   the default-year rule; default: the real date.
 * - url: full address (overrides year / reform).
 */
export function loadCalculator(options = {}) {
  const { year = 2026, reform = false, today = null } = options;
  const params = new URLSearchParams();
  if (year !== null && year !== undefined) params.set("rok", String(year));
  if (reform) params.set("projekt", "1");
  const query = params.toString();
  const url = options.url || `http://localhost/${query ? `?${query}` : ""}`;
  const dom = new JSDOM(buildDocumentSource(), {
    runScripts: "dangerously",
    url,
    pretendToBeVisual: true,
    beforeParse(window) {
      if (!today) return;
      const RealDate = window.Date;
      const fixed = new RealDate(`${today}T12:00:00`).getTime();
      class FixedDate extends RealDate {
        constructor(...args) {
          super(...(args.length ? args : [fixed]));
        }
        static now() {
          return fixed;
        }
      }
      window.Date = FixedDate;
    },
  });
  const { window } = dom;
  const { document } = window;

  // jsdom doesn't implement scrollIntoView; the calculator calls it after a
  // successful calculation purely for UX. Stub it so tests don't pollute
  // stderr with harmless TypeErrors.
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  }

  function $(selector) {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);
    return el;
  }

  function setRevenue(value) {
    $("#revenue").value = String(value);
  }

  function setCosts(value) {
    $("#costs").value = String(value);
  }

  function setIpBox(percent) {
    const radio = document.querySelector(
      'input[name="ipBoxEnabled"][value="yes"]'
    );
    if (radio && !radio.checked) {
      radio.checked = true;
      radio.dispatchEvent(new window.Event("change", { bubbles: true }));
    }
    const el = $("#ipBoxCoeff");
    el.removeAttribute("readonly");
    el.value = String(percent);
  }

  function setJointTaxation(enabled, spouseIncome = 0) {
    const radio = document.querySelector(
      `input[name="jointTaxation"][value="${enabled ? "yes" : "no"}"]`
    );
    radio.checked = true;
    radio.dispatchEvent(new window.Event("change", { bubbles: true }));
    if (enabled) {
      const spouseEl = $("#spouseIncome");
      spouseEl.removeAttribute("readonly");
      spouseEl.value = String(spouseIncome);
    }
  }

  function toggleRyczaltRate(rateKey, on = true) {
    if (!RYCZALT_KEYS.includes(rateKey)) {
      throw new Error(`Unknown ryczałt key: ${rateKey}`);
    }
    const checkbox = document.querySelector(
      `input[type="checkbox"][data-target="${rateKey}"]`
    );
    if (!checkbox) throw new Error(`Checkbox not found for ${rateKey}`);
    if (checkbox.checked !== on) {
      checkbox.checked = on;
      checkbox.dispatchEvent(new window.Event("change", { bubbles: true }));
    }
  }

  function enableMultipleRates(on = true) {
    const toggle = $("#multipleRatesToggle");
    if (toggle.checked !== on) {
      toggle.checked = on;
      toggle.dispatchEvent(new window.Event("change", { bubbles: true }));
    }
  }

  function setRateRevenue(rateKey, value) {
    const el = document.querySelector(`.rate-input[data-for="${rateKey}"]`);
    if (!el) throw new Error(`Rate input not found for ${rateKey}`);
    el.value = String(value);
  }

  function fire(el, type) {
    el.dispatchEvent(new window.Event(type, { bubbles: true }));
  }

  function setChecked(selector, on) {
    const el = $(selector);
    if (el.checked !== on) {
      el.checked = on;
      fire(el, "change");
    }
  }

  function checkRadio(name, value) {
    const radio = $(`input[name="${name}"][value="${value}"]`);
    radio.checked = true;
    fire(radio, "change");
  }

  /** Roczny dochód z innych źródeł opodatkowanych skalą (np. etat). */
  function setOtherIncome(value) {
    $("#otherIncome").value = String(value);
  }

  /** Przełącznik „Uwzględnij składki społeczne” (domyślnie włączony). */
  function setZusEnabled(on = true) {
    setChecked("#zusEnabled", on);
  }

  /** Data rozpoczęcia działalności RRRR-MM-DD ("" = przed 2026 r.). */
  function setStartDate(value) {
    const el = $("#zusStartDate");
    el.value = value;
    fire(el, "change");
  }

  /** Ścieżka składek: "full" | "ulga" | "pref". */
  function setZusPath(path) {
    checkRadio("zusPath", path);
  }

  /** Dobrowolna składka chorobowa (domyślnie zaznaczona). */
  function setSickness(on = true) {
    setChecked("#zusSickness", on);
  }

  /** Umowa o pracę z wynagrodzeniem ≥ minimalnego. */
  function setEmployment(on = true) {
    setChecked("#zusEmployment", on);
  }

  /** Wakacje składkowe. */
  function setHoliday(on = true) {
    setChecked("#zusHoliday", on);
  }

  /** Data urodzenia RRRR-MM-DD ("" = brak). */
  function setBirthDate(value) {
    const el = $("#zusBirthDate");
    el.value = value;
    fire(el, "change");
  }

  /** Płeć: "K" | "M" | "" (brak). */
  function setSex(value) {
    checkRadio("zusSex", value);
  }

  /** Przełącznik roku w nagłówku (2026 | 2027). */
  function setYear(year) {
    checkRadio("taxYear", String(year));
  }

  /** Scenariusz „Projekt zmian 2027 (UD458 + UD116)” (tylko 2027). */
  function setReform(on = true) {
    setChecked("#reformToggle", on);
  }

  /** Przychód z roku poprzedniego (limit ryczałtu w scenariuszu). */
  function setPrevYearRevenue(value) {
    const el = $("#prevYearRevenue");
    el.value = String(value);
  }

  /* ---------- Karta „Rodzina” ---------- */

  /** Status: "married" | "single" | "other". */
  function setFamilyStatus(status) {
    checkRadio("familyStatus", status);
  }

  /** Dodaje dziecko: { from = 1, to = 12, disabled, adult } (miesiące od–do);
   *  { months: m } = ostatnie m miesięcy roku. */
  function addChild({ from, to, months, disabled = false, adult = false } = {}) {
    $("#addChildBtn").click();
    const rows = document.querySelectorAll("#childrenList .child-row");
    const row = rows[rows.length - 1];
    let f = from === undefined ? 1 : from;
    let t = to === undefined ? 12 : to;
    if (months !== undefined && from === undefined) {
      f = 13 - months;
      t = 12;
    }
    const set = (field, value) => {
      const select = row.querySelector(`select[data-field="${field}"]`);
      if (select.value !== String(value)) {
        select.value = String(value);
        fire(select, "change");
      }
    };
    set("to", t);
    set("from", f);
    const setBox = (field, on) => {
      const box = row.querySelector(`input[data-field="${field}"]`);
      if (box.checked !== on) {
        box.checked = on;
        fire(box, "change");
      }
    };
    setBox("disabled", !!disabled);
    setBox("adult", !!adult);
    return row;
  }

  /** Udział podatnika w uldze na dzieci w % (status „inna”). */
  function setFamilyShare(percent) {
    const el = $("#familyShare");
    el.value = String(percent);
    fire(el, "input");
  }

  /** Dochód małżonka (pole w karcie „Opcje”; także bez rozliczenia wspólnego). */
  function setSpouseIncome(value) {
    const el = $("#spouseIncome");
    el.removeAttribute("readonly");
    el.value = String(value);
    fire(el, "input");
  }

  /** „Małżonek jest rodzicem dzieci” (domyślnie włączone). */
  function setSpouseIsParent(on = true) {
    setChecked("#spouseIsParent", on);
  }

  function setSpouseLinRycz(on = true) {
    setChecked("#spouseLinRycz", on);
  }

  function setSpouseLinearIncome(value) {
    $("#spouseLinearIncome").value = String(value);
  }

  function setSpouseContrib(value) {
    $("#spouseContrib").value = String(value);
  }

  /** Składki od innych dochodów (limit zwrotu ulgi); "" = szacunek. */
  function setOtherContrib(value) {
    $("#otherContrib").value = String(value);
  }

  /** Ulga dla rodzin 4+ i limit wykorzystany na innych przychodach. */
  function setFourPlus(on = true, used = "") {
    setChecked("#fourPlus", on);
    $("#fourPlusUsed").value = String(used);
  }

  function calculate() {
    $("#calculateButton").click();
  }

  /** Pełny tekst eksportu / szczegółowych obliczeń. */
  function readBreakdown() {
    $("#copyFab").click();
    return $("#copyPreview").textContent;
  }

  /** Surowe liczby wariantu z atrybutów data-* pola wyniku. */
  function readVariantData(id) {
    const el =
      id === "ratesTotal"
        ? $("#ratesTotalValue")
        : $(`#${id}`);
    const data = { ...el.dataset };
    ["total", "taxes", "baseline", "health", "social", "holidayMonth"].forEach(
      (key) => {
        if (data[key] !== undefined) data[key] = Number(data[key]);
      }
    );
    return data;
  }

  function readOutputs() {
    const out = {};
    for (const id of RESULT_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const group = el.closest(".input-group");
      const isHidden = group && group.style.display === "none";
      if (isHidden) continue;
      const value = (el.value || "").trim();
      if (value === "") continue;
      out[id] = value;
    }

    const ratesTotalEl = document.getElementById("ratesTotal");
    if (ratesTotalEl && !ratesTotalEl.classList.contains("hidden")) {
      const totalValue =
        document.getElementById("ratesTotalValue")?.textContent.trim() || "";
      const healthValue =
        document
          .getElementById("ratesHealthRyczaltValue")
          ?.textContent.trim() || "";
      if (healthValue) out.ratesHealthRyczalt = healthValue;
      if (totalValue) out.ratesTotal = totalValue;
      const socialRow = document.getElementById("ratesSocialRow");
      if (socialRow && !socialRow.classList.contains("hidden")) {
        out.ratesSocial = document
          .getElementById("ratesSocialValue")
          .textContent.trim();
      }
      const otherRow = document.getElementById("ratesOtherPitRow");
      if (otherRow && !otherRow.classList.contains("hidden")) {
        out.ratesOtherPit = document
          .getElementById("ratesOtherPitValue")
          .textContent.trim();
      }
    }

    // Składki ZUS (podsumowanie w panelu wyników) i wybór sposobu odliczenia
    const zusSummary = document.getElementById("zusSummary");
    if (zusSummary && !zusSummary.classList.contains("hidden")) {
      out.zusSocialTotal = document
        .getElementById("zusSocialTotal")
        .textContent.trim();
      out.zusFpTotal = document.getElementById("zusFpTotal").textContent.trim();
      out.zusSchedule = document
        .getElementById("zusScheduleSummary")
        .textContent.trim();
    }
    out.healthMonths = document
      .getElementById("zusHealthMonths")
      .textContent.trim();
    const holidayStatus = document
      .getElementById("zusHolidayStatus")
      .textContent.trim();
    if (holidayStatus) out.zusHolidayStatus = holidayStatus;
    const methods = {};
    for (const id of RESULT_IDS) {
      const el = document.getElementById(id);
      if (!el || !el.dataset.method) continue;
      const group = el.closest(".input-group");
      if (group && group.style.display === "none") continue;
      methods[id] =
        el.dataset.method +
        (el.dataset.holidayMonth ? ` (wakacje ${el.dataset.holidayMonth})` : "");
    }
    const ratesTotalValue = document.getElementById("ratesTotalValue");
    if (out.ratesTotal && ratesTotalValue.dataset.method) {
      methods.ratesTotal = ratesTotalValue.dataset.method;
    }
    if (Object.keys(methods).length) out.socialDeduction = methods;
    out.best = `${document.getElementById("bestCardTitle").textContent} | ${
      document.getElementById("bestCardAmount").textContent
    }`;

    return out;
  }

  return {
    window,
    document,
    setRevenue,
    setCosts,
    setIpBox,
    setJointTaxation,
    toggleRyczaltRate,
    enableMultipleRates,
    setRateRevenue,
    setOtherIncome,
    setZusEnabled,
    setStartDate,
    setZusPath,
    setSickness,
    setEmployment,
    setHoliday,
    setBirthDate,
    setSex,
    setYear,
    setReform,
    setPrevYearRevenue,
    setFamilyStatus,
    addChild,
    setFamilyShare,
    setSpouseIncome,
    setSpouseLinRycz,
    setSpouseIsParent,
    setSpouseLinearIncome,
    setSpouseContrib,
    setOtherContrib,
    setFourPlus,
    calculate,
    readOutputs,
    readBreakdown,
    readVariantData,
    close() {
      window.close();
    },
  };
}
