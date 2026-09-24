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
 * A bootstrap script after them re-publishes the const-declared globals
 * (TAX_CONSTANTS, taxMath, derived constants) onto window so tests can
 * inspect them. Browsers don't auto-attach top-level `const` to window,
 * so this exposure is only for tests - it does not change runtime behavior.
 */
function buildDocumentSource() {
  const html = readFileSync(HTML_PATH, "utf8");
  const taxConstantsSrc = readFileSync(TAX_CONSTANTS_PATH, "utf8");
  const scriptSrc = readFileSync(SCRIPT_PATH, "utf8");

  const stripped = html
    .replace(/<script\s+src="taxConstants\.js"\s*><\/script>/i, "")
    .replace(/<script\s+src="script\.js"\s*><\/script>/i, "");

  const exposeGlobals = `
    window.TAX_CONSTANTS = TAX_CONSTANTS;
    window.taxMath = taxMath;
    window.TAX_BAND_12 = TAX_BAND_12;
    window.TAX_BAND_32 = TAX_BAND_32;
    window.PIT_RATE_SOLIDARITY = PIT_RATE_SOLIDARITY;
    window.EFFECTIVE_LINEAR_RATE = EFFECTIVE_LINEAR_RATE;
    window.EFFECTIVE_LINEAR_RATE_SOLIDARITY = EFFECTIVE_LINEAR_RATE_SOLIDARITY;
    window.EFFECTIVE_IPBOX_PLUS_HEALTH = EFFECTIVE_IPBOX_PLUS_HEALTH;
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
 */
export function loadCalculator() {
  const dom = new JSDOM(buildDocumentSource(), {
    runScripts: "dangerously",
    url: "http://localhost/",
    pretendToBeVisual: true,
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
    calculate,
    readOutputs,
    readBreakdown,
    readVariantData,
    close() {
      window.close();
    },
  };
}
