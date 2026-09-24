(function () {
  /* ==================================================
     DOM Element References
  ================================================== */
  const DOM = {
    resultsSection: document.getElementById("resultsSection"),
    calculateButton: document.getElementById("calculateButton"),
    revenueInput: document.getElementById("revenue"),
    costsInput: document.getElementById("costs"),
    ipBoxCoeffInput: document.getElementById("ipBoxCoeff"),
    ipBoxRange: document.getElementById("ipBoxRange"),
    ipBoxContainer: document.getElementById("ipBoxContainer"),
    ipBoxEnabledRadios: document.querySelectorAll('input[name="ipBoxEnabled"]'),
    ipBoxReveal: document.getElementById("ipBoxReveal"),
    inputPeriodRadios: document.querySelectorAll('input[name="inputPeriod"]'),
    ryczaltCheckboxes: document.querySelectorAll(
      '.checkbox-group input[type="checkbox"]',
    ),
    jointTaxationRadios: document.querySelectorAll(
      'input[name="jointTaxation"]',
    ),
    spouseIncomeCard: document.getElementById("spouseIncomeCard"),
    spouseIncomeInput: document.getElementById("spouseIncome"),
    multipleRatesToggle: document.getElementById("multipleRatesToggle"),
    rateInputs: document.querySelectorAll(".rate-input"),
    revenueInfoText: document.querySelector(".multiple-rates-revenue-info p"),
    resetBtn: document.getElementById("resetBtn"),
    shareBtn: document.getElementById("shareBtn"),
    themeToggle: document.getElementById("themeToggle"),
    copyFab: document.getElementById("copyFab"),
    copyModal: document.getElementById("copyModal"),
    copyModalCopy: document.getElementById("copyModalCopy"),
    copyPreview: document.getElementById("copyPreview"),
    copyToast: document.getElementById("copyToast"),
    copyToastTitle: document.getElementById("copyToastTitle"),
    copyToastSubtitle: document.getElementById("copyToastSubtitle"),
    infoFab: document.getElementById("infoFab"),
    infoModal: document.getElementById("infoModal"),
    infoModalContent: document.getElementById("infoModalContent"),
    bestCard: document.getElementById("bestCard"),
    bestCardTitle: document.getElementById("bestCardTitle"),
    bestCardAmount: document.getElementById("bestCardAmount"),
    bestCardSavings: document.getElementById("bestCardSavings"),
    bestCardMonthly: document.getElementById("bestCardMonthly"),
    bestCardRate: document.getElementById("bestCardRate"),
    bestCardNet: document.getElementById("bestCardNet"),
    mobileSummary: document.getElementById("mobileSummary"),
    mobileSummaryTitle: document.getElementById("mobileSummaryTitle"),
    mobileSummaryAmount: document.getElementById("mobileSummaryAmount"),
    chartFrame: document.getElementById("chartFrame"),
    chartSvg: document.getElementById("chartSvg"),
    chartTooltip: document.getElementById("chartTooltip"),
    chartEmpty: document.getElementById("chartEmpty"),
    chartLegend: document.getElementById("chartLegend"),
    chartMeta: document.getElementById("chartMeta"),
    chartWinners: document.getElementById("chartWinners"),
    winnerStrip: document.getElementById("winnerStrip"),
    winnerList: document.getElementById("winnerList"),
    breakdownDetails: document.getElementById("breakdownDetails"),
    breakdownPre: document.getElementById("breakdownPre"),
  };

  /* ==================================================
     Variant labels (used by best-card + ranking)
  ================================================== */
  const VARIANT_LABELS = {
    taxScale: "Skala podatkowa",
    taxScaleIpBox: "Skala podatkowa + IP BOX",
    taxScaleJoint: "Skala podatkowa wspólnie z małżonkiem",
    taxScaleIpBoxJoint: "Skala podatkowa + IP BOX wspólnie z małżonkiem",
    taxLinear: "Podatek liniowy",
    taxLinearIpBox: "Podatek liniowy + IP BOX",
    ryczalt2: "Ryczałt 2%",
    ryczalt3: "Ryczałt 3%",
    ryczalt5_5: "Ryczałt 5,5%",
    ryczalt8_5: "Ryczałt 8,5%",
    ryczalt8_5_12_5: "Ryczałt 8,5% / 12,5%",
    ryczalt10: "Ryczałt 10%",
    ryczalt12: "Ryczałt 12%",
    ryczalt14: "Ryczałt 14%",
    ryczalt15: "Ryczałt 15%",
    ryczalt17: "Ryczałt 17%",
    ratesTotal: "Ryczałt łącznie",
  };

  const PIT_VARIANT_IDS = [
    "taxScale",
    "taxScaleIpBox",
    "taxScaleJoint",
    "taxScaleIpBoxJoint",
    "taxLinear",
    "taxLinearIpBox",
  ];

  const RYCZALT_VARIANT_IDS = [
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

  const COMPARISON_VARIANT_IDS = [
    ...PIT_VARIANT_IDS,
    ...RYCZALT_VARIANT_IDS,
  ];

  /* ==================================================
     Utility Functions
  ================================================== */
  function formatPLN(value) {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  function parsePLN(value) {
    return parseFloat(value.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
  }

  function selectInputValue(e) {
    e.target.select();
  }

  /* ==================================================
     Validation Functions
  ================================================== */
  function validateInput(value, fieldName) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    let isValid = true;
    if (input) input.classList.remove("error");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
    }
    const numericValue = parsePLN(value);
    if (isNaN(numericValue)) {
      if (errorElement) errorElement.textContent = "Wprowadź prawidłową kwotę.";
      isValid = false;
    } else if (numericValue < 0) {
      if (errorElement) errorElement.textContent = "Kwota nie może być ujemna.";
      isValid = false;
    } else if (numericValue > 999999999) {
      if (errorElement) errorElement.textContent = "Kwota jest zbyt duża.";
      isValid = false;
    }
    if (!isValid) {
      if (input) input.classList.add("error");
      if (errorElement) errorElement.classList.add("visible");
    }
    return isValid;
  }
  function validateIpBoxCoeff(value) {
    const errorElement = document.getElementById("ipBoxCoeff-error");
    const numValue = parseFloat(value);
    let isValid = true;
    DOM.ipBoxCoeffInput.classList.remove("error");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
    }
    if (isNaN(numValue) || value === "") {
      if (errorElement) errorElement.textContent = "Wpisz wartość 0–100.";
      isValid = false;
    } else if (numValue < 0 || numValue > 100) {
      if (errorElement)
        errorElement.textContent = "Wartość musi być w zakresie 0–100.";
      isValid = false;
    }
    if (!isValid) {
      DOM.ipBoxCoeffInput.classList.add("error");
      if (errorElement) errorElement.classList.add("visible");
    }
    return isValid;
  }

  /* ==================================================
     Tax Calculation Functions  (UNCHANGED — financial logic)
  ================================================== */
  function getScalePitDetails(income) {
    const taxableIncome = Math.max(income, 0);
    const taxFreeAmount = TAX_CONSTANTS.TAX_FREE_AMOUNT;
    const threshold12 = TAX_CONSTANTS.TAX_THRESHOLD_12;
    const inTaxFree = Math.min(taxableIncome, taxFreeAmount);
    const in12Bracket = Math.min(
      Math.max(taxableIncome - taxFreeAmount, 0),
      TAX_BAND_12,
    );
    const in32Bracket = Math.max(taxableIncome - threshold12, 0);
    const tax12 = taxMath.round2(in12Bracket * TAX_CONSTANTS.PIT_RATE_12);
    const tax32 = taxMath.round2(in32Bracket * TAX_CONSTANTS.PIT_RATE_32);
    const totalPit = taxMath.round2(tax12 + tax32);

    return {
      taxableIncome,
      inTaxFree,
      in12Bracket,
      in32Bracket,
      tax12,
      tax32,
      totalPit,
    };
  }

  function getSolidarityLevyDetails(baseIncome) {
    const solidarityBase = Math.max(baseIncome, 0);
    const threshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;
    const aboveThreshold = Math.max(solidarityBase - threshold, 0);
    const levy = taxMath.round2(aboveThreshold * TAX_CONSTANTS.SOLIDARITY_RATE);

    return {
      solidarityBase,
      threshold,
      aboveThreshold,
      levy,
    };
  }

  function calculateScalePitOnly(income) {
    return getScalePitDetails(income).totalPit;
  }

  function calculateSolidarityLevy(baseIncome) {
    return getSolidarityLevyDetails(baseIncome).levy;
  }

  function calculateJointScalePitOnly(income, spouseIncome) {
    const jointIncome = taxMath.round2(income + spouseIncome);
    const halfIncome = taxMath.round2(jointIncome / 2);
    return taxMath.round2(calculateScalePitOnly(halfIncome) * 2);
  }

  function calculateScaleTaxTotal(income, healthScale) {
    return taxMath.round2(
      calculateScalePitOnly(income) +
        calculateSolidarityLevy(income) +
        healthScale,
    );
  }

  function calculateJointScaleTaxTotal(income, spouseIncome, healthScale) {
    return taxMath.round2(
      calculateJointScalePitOnly(income, spouseIncome) +
        calculateSolidarityLevy(income) +
        calculateSolidarityLevy(spouseIncome) +
        healthScale,
    );
  }

  function getLinearPitDetails(baseIncome) {
    const pitBase = Math.max(baseIncome, 0);
    const pit = taxMath.round2(pitBase * TAX_CONSTANTS.LINEAR_PIT_RATE);

    return {
      pitBase,
      pit,
    };
  }

  function calculateLinearPitOnly(baseIncome) {
    return getLinearPitDetails(baseIncome).pit;
  }

  function calculateLinearTaxTotal(
    income,
    healthLinearDeduction,
    healthLinear,
  ) {
    const pitBase = Math.max(income - healthLinearDeduction, 0);
    return taxMath.round2(
      calculateLinearPitOnly(pitBase) +
        calculateSolidarityLevy(pitBase) +
        healthLinear,
    );
  }

  function calculateLinearIpBoxTaxTotal(
    income,
    ipBoxCoeff,
    healthLinearDeduction,
    healthLinear,
  ) {
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(
      income,
      ipBoxCoeff,
    );
    const ipBoxPit = taxMath.round2(ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE);
    const standardPitBase = Math.max(regularIncome - healthLinearDeduction, 0);

    return taxMath.round2(
      ipBoxPit +
        calculateLinearPitOnly(standardPitBase) +
        calculateSolidarityLevy(standardPitBase) +
        healthLinear,
    );
  }

  function getIpBoxIncomeSplit(income, ipBoxCoeff) {
    const ipBoxIncome = taxMath.round2(income * ipBoxCoeff);
    const regularIncome = taxMath.round2(income - ipBoxIncome);
    return { ipBoxIncome, regularIncome };
  }

  function calculateScaleIpBoxTaxTotal(income, ipBoxCoeff, healthScale) {
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(
      income,
      ipBoxCoeff,
    );
    const ipBoxTax = taxMath.round2(ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE);
    return taxMath.round2(
      ipBoxTax +
        calculateScalePitOnly(regularIncome) +
        calculateSolidarityLevy(regularIncome) +
        healthScale,
    );
  }

  function calculateJointScaleIpBoxTaxTotal(
    income,
    spouseIncome,
    ipBoxCoeff,
    healthScale,
  ) {
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(
      income,
      ipBoxCoeff,
    );
    const ipBoxTax = taxMath.round2(ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE);
    return taxMath.round2(
      ipBoxTax +
        calculateJointScalePitOnly(regularIncome, spouseIncome) +
        calculateSolidarityLevy(regularIncome) +
        calculateSolidarityLevy(spouseIncome) +
        healthScale,
    );
  }

  /* ==================================================
     UI Update Functions
  ================================================== */
  function syncIpBoxRange() {
    if (!DOM.ipBoxRange) return;
    const value = parseFloat(DOM.ipBoxCoeffInput.value);
    const safe = isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
    DOM.ipBoxRange.value = String(safe);
    DOM.ipBoxRange.style.setProperty("--ipbox-fill", safe + "%");
  }

  function isIpBoxEnabled() {
    const checked = document.querySelector(
      'input[name="ipBoxEnabled"]:checked',
    );
    return !!checked && checked.value === "yes";
  }

  function isJointTaxationEnabled() {
    const checked = document.querySelector(
      'input[name="jointTaxation"]:checked',
    );
    return !!checked && checked.value === "yes";
  }

  function clearIpBoxResultFields() {
    document.getElementById("taxScaleIpBox").value = "";
    document.getElementById("taxScaleIpBoxJoint").value = "";
    document.getElementById("taxLinearIpBox").value = "";
  }

  /* Compute visibility of conditional result rows.
     A row carrying both .joint-taxation-card and .ipbox-card is visible only
     when BOTH toggles are on. The shared .show class encodes the final
     answer so CSS stays simple. */
  function updateConditionalRowsVisibility() {
    const ipBoxOn = isIpBoxEnabled();
    const jointOn = isJointTaxationEnabled();
    document
      .querySelectorAll(".joint-taxation-card, .ipbox-card")
      .forEach((row) => {
        const requiresJoint = row.classList.contains("joint-taxation-card");
        const requiresIpBox = row.classList.contains("ipbox-card");
        const visible =
          (!requiresJoint || jointOn) && (!requiresIpBox || ipBoxOn);
        row.classList.toggle("show", visible);
      });
  }

  function setMultiRateLayout(isEnabled) {
    document
      .querySelectorAll(".multiple-rates-wrapper, .rate-grid")
      .forEach((el) => el.classList.toggle("is-multi", isEnabled));
  }

  function updateRemainingRevenue() {
    const totalRevenue = parsePLN(DOM.revenueInput.value);
    const rateInputsShown = document.querySelectorAll(".rate-input.show");
    let usedRevenue = 0;
    rateInputsShown.forEach((input) => {
      if (input.value) usedRevenue += parsePLN(input.value);
    });
    const difference = usedRevenue - totalRevenue;
    if (!DOM.revenueInfoText) return;
    const suffix = getPeriodFactor() === 12 ? " / mies." : "";
    const isDone = difference === 0 && totalRevenue > 0;
    DOM.revenueInfoText.classList.toggle("is-over", difference > 0);
    DOM.revenueInfoText.classList.toggle("is-done", isDone);
    if (difference > 0) {
      DOM.revenueInfoText.textContent = `Przekroczono przychód o ${formatPLN(
        difference,
      )}${suffix}`;
    } else if (isDone) {
      DOM.revenueInfoText.textContent = "Cały przychód jest rozdysponowany.";
    } else {
      DOM.revenueInfoText.textContent = `Przychód do rozdysponowania: ${formatPLN(
        totalRevenue - usedRevenue,
      )}${suffix}`;
    }
  }

  /* ==================================================
     Input period (amounts typed per year or per month)
  ================================================== */
  function getPeriodFactor() {
    const checked = document.querySelector('input[name="inputPeriod"]:checked');
    return checked && checked.value === "month" ? 12 : 1;
  }

  /* Money typed by the user, converted to an annual amount. */
  function readAnnualAmount(input) {
    if (!input) return 0;
    return (parsePLN(input.value) || 0) * getPeriodFactor();
  }

  function getAllocatedRevenueTotal() {
    let total = 0;
    document.querySelectorAll(".rate-input.show").forEach((input) => {
      total += readAnnualAmount(input);
    });
    return total;
  }

  /* ==================================================
     Pure scenario math (shared by results and the chart)
  ================================================== */
  const RYCZALT_RATES = {
    ryczalt2: TAX_CONSTANTS.RYCZALT_RATE_2,
    ryczalt3: TAX_CONSTANTS.RYCZALT_RATE_3,
    ryczalt5_5: TAX_CONSTANTS.RYCZALT_RATE_5_5,
    ryczalt8_5: TAX_CONSTANTS.RYCZALT_RATE_8_5,
    ryczalt10: TAX_CONSTANTS.RYCZALT_RATE_10,
    ryczalt12: TAX_CONSTANTS.RYCZALT_RATE_12,
    ryczalt14: TAX_CONSTANTS.RYCZALT_RATE_14,
    ryczalt15: TAX_CONSTANTS.RYCZALT_RATE_15,
    ryczalt17: TAX_CONSTANTS.RYCZALT_RATE_17,
  };

  /* Ryczałt PIT (without the health contribution) for one rate. */
  function calculateRyczaltPit(rateId, allocated, healthRyczaltDeduction) {
    if (rateId === "ryczalt8_5_12_5") {
      const ryczalt85Threshold = TAX_CONSTANTS.RYCZALT_8_5_THRESHOLD;
      const rate85 = TAX_CONSTANTS.RYCZALT_RATE_8_5;
      const rate125 = TAX_CONSTANTS.RYCZALT_RATE_12_5;
      const taxAt85Threshold = ryczalt85Threshold * rate85;

      if (allocated <= ryczalt85Threshold) {
        return Math.max(allocated - healthRyczaltDeduction, 0) * rate85;
      }
      return (
        Math.max(allocated - (healthRyczaltDeduction + ryczalt85Threshold), 0) *
          rate125 +
        taxAt85Threshold
      );
    }
    const base = Math.max(allocated - healthRyczaltDeduction, 0);
    return base * RYCZALT_RATES[rateId];
  }

  /* Annual PIT + health totals of every variant for one scenario.
     Ryczałt values are single-rate totals (whole revenue at that rate). */
  function computeVariantTotals({
    revenue,
    costs,
    ipBoxEnabled,
    ipBoxCoeff,
    jointEnabled,
    spouseIncome,
    ryczaltIds,
  }) {
    const income = revenue - costs;
    const healthScale = taxMath.calculateHealthScale(income);
    const healthLinear = taxMath.calculateHealthLinear(income);
    const healthLinearDeduction = Math.min(
      healthLinear,
      TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT,
    );
    const healthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(revenue);
    const healthRyczaltDeduction =
      healthRyczalt * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR;

    const totals = {
      taxScale: calculateScaleTaxTotal(income, healthScale),
      taxLinear: calculateLinearTaxTotal(
        income,
        healthLinearDeduction,
        healthLinear,
      ),
    };
    if (jointEnabled) {
      totals.taxScaleJoint = calculateJointScaleTaxTotal(
        income,
        spouseIncome,
        healthScale,
      );
    }
    if (ipBoxEnabled) {
      totals.taxScaleIpBox = calculateScaleIpBoxTaxTotal(
        income,
        ipBoxCoeff,
        healthScale,
      );
      if (jointEnabled) {
        totals.taxScaleIpBoxJoint = calculateJointScaleIpBoxTaxTotal(
          income,
          spouseIncome,
          ipBoxCoeff,
          healthScale,
        );
      }
      totals.taxLinearIpBox = calculateLinearIpBoxTaxTotal(
        income,
        ipBoxCoeff,
        healthLinearDeduction,
        healthLinear,
      );
    }
    (ryczaltIds || []).forEach((id) => {
      totals[id] =
        calculateRyczaltPit(id, revenue, healthRyczaltDeduction) +
        healthRyczalt;
    });
    return totals;
  }

  /* ==================================================
     Main Calculation Function
  ================================================== */
  function calculate() {
    const periodFactor = getPeriodFactor();
    const rawRevenue = DOM.revenueInput.value;
    const rawCosts = DOM.costsInput.value;
    const revenue =
      (parseFloat(rawRevenue.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0) *
      periodFactor;
    const costs =
      (parseFloat(rawCosts.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0) *
      periodFactor;
    const income = revenue - costs;

    document.getElementById("income").value = formatPLN(income);

    const ipBoxCoeff = parseFloat(DOM.ipBoxCoeffInput.value) / 100;
    const isMultiRate = DOM.multipleRatesToggle.checked;

    const healthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(revenue);
    const healthRyczaltDeduction = isMultiRate
      ? taxMath.getRyczaltHealthAnnualForRevenue(getAllocatedRevenueTotal()) *
        TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR
      : healthRyczalt * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR;

    const jointTaxationEnabled = isJointTaxationEnabled();
    const spouseIncome = jointTaxationEnabled
      ? readAnnualAmount(DOM.spouseIncomeInput)
      : 0;
    const ipBoxEnabled = isIpBoxEnabled();

    const totals = computeVariantTotals({
      revenue,
      costs,
      ipBoxEnabled,
      ipBoxCoeff,
      jointEnabled: jointTaxationEnabled,
      spouseIncome,
    });

    document.getElementById("taxScale").value = formatPLN(totals.taxScale);
    if (jointTaxationEnabled) {
      document.getElementById("taxScaleJoint").value = formatPLN(
        totals.taxScaleJoint,
      );
    }
    document.getElementById("taxLinear").value = formatPLN(totals.taxLinear);

    if (ipBoxEnabled) {
      document.getElementById("taxScaleIpBox").value = formatPLN(
        totals.taxScaleIpBox,
      );
      document.getElementById("taxScaleIpBoxJoint").value = jointTaxationEnabled
        ? formatPLN(totals.taxScaleIpBoxJoint)
        : "";
      document.getElementById("taxLinearIpBox").value = formatPLN(
        totals.taxLinearIpBox,
      );
    } else {
      clearIpBoxResultFields();
    }

    const allocatedRevenues = {};
    if (isMultiRate) {
      document.querySelectorAll(".rate-input.show").forEach((input) => {
        allocatedRevenues[input.dataset.for] = readAnnualAmount(input);
      });
    }

    function getAllocatedOrFullRateValue(rateId) {
      if (isMultiRate) {
        const rateInput = document.querySelector(
          `.rate-input[data-for="${rateId}"]`,
        );
        if (!rateInput || !rateInput.value) return 0;
        return allocatedRevenues[rateId] || 0;
      }
      return revenue;
    }

    RYCZALT_VARIANT_IDS.forEach((id) => {
      let value = calculateRyczaltPit(
        id,
        getAllocatedOrFullRateValue(id),
        healthRyczaltDeduction,
      );
      if (!isMultiRate) value += healthRyczalt;
      document.getElementById(id).value = formatPLN(value);
    });

    updateRatesTotal();
    updateRevenueTags(allocatedRevenues);
    updatePeriodHints();
    rankAndSummarize(revenue, income);
    renderChart({
      revenue,
      costs,
      ipBoxEnabled,
      ipBoxCoeff,
      jointEnabled: jointTaxationEnabled,
      spouseIncome,
      isMultiRate,
    });
    refreshBreakdownIfOpen();
  }

  /* ==================================================
     Update Rates Total
  ================================================== */
  function updateRatesTotal() {
    const ratesTotalElement = document.getElementById("ratesTotal");
    const ratesTotalValueElement = document.getElementById("ratesTotalValue");
    const ratesHealthRyczaltElement = document.getElementById(
      "ratesHealthRyczaltValue",
    );

    if (!DOM.multipleRatesToggle.checked) {
      ratesTotalElement.classList.add("hidden");
      return;
    }

    const anyRateSelected = Array.from(DOM.ryczaltCheckboxes).some(
      (checkbox) => checkbox.checked,
    );
    if (!anyRateSelected) {
      ratesTotalElement.classList.add("hidden");
      return;
    }

    const ratesHealthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(
      getAllocatedRevenueTotal(),
    );

    let total = 0;
    RYCZALT_VARIANT_IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (input && input.closest(".input-group").style.display !== "none") {
        total += parsePLN(input.value);
      }
    });

    ratesTotalElement.classList.remove("hidden");
    ratesHealthRyczaltElement.textContent = formatPLN(ratesHealthRyczalt);
    ratesTotalValueElement.textContent = formatPLN(total + ratesHealthRyczalt);
  }

  /* ==================================================
     Per-row revenue tags (helps multi-rate readability)
  ================================================== */
  function updateRevenueTags(allocatedRevenues) {
    RYCZALT_VARIANT_IDS.forEach((id) => {
      const row = document.querySelector(`.results-row[data-variant="${id}"]`);
      if (!row) return;
      const tagEl = row.querySelector("[data-revenue-tag]");
      if (!tagEl) return;
      // in single-rate mode every row uses the full revenue, so the tag
      // only adds information when revenue is split between rates
      const allocated = DOM.multipleRatesToggle.checked
        ? allocatedRevenues[id] || 0
        : 0;
      tagEl.textContent = allocated
        ? `od ${formatPLN(allocated)} przychodu`
        : "";
    });
  }

  function getVisibleResultVariant(id) {
    const input = document.getElementById(id);
    if (!input) return null;
    const row = input.closest(".input-group");
    if (!row) return null;

    const inlineHidden = row.style.display === "none";
    const computedHidden =
      !inlineHidden &&
      typeof window !== "undefined" &&
      window.getComputedStyle &&
      window.getComputedStyle(row).display === "none";
    if (inlineHidden || computedHidden) return null;

    const raw = (input.value || "").trim();
    if (!raw) return null;
    const value = parsePLN(raw);
    if (!Number.isFinite(value)) return null;

    return { id, value, row };
  }

  function getVisibleRatesTotalVariant() {
    const row = document.getElementById("ratesTotal");
    const valueElement = document.getElementById("ratesTotalValue");
    if (!row || !valueElement || row.classList.contains("hidden")) return null;

    const value = parsePLN(valueElement.textContent || "");
    if (!Number.isFinite(value)) return null;

    return { id: "ratesTotal", value, row };
  }

  function sortPitComparisonRows() {
    const container = document.getElementById("comparePit");
    if (!container) return;

    const visibleVariants = COMPARISON_VARIANT_IDS.map((id, index) => {
      const variant = getVisibleResultVariant(id);
      return variant ? { ...variant, index } : null;
    }).filter(Boolean);
    const ratesTotalVariant = getVisibleRatesTotalVariant();
    if (ratesTotalVariant) {
      visibleVariants.push({
        ...ratesTotalVariant,
        index: COMPARISON_VARIANT_IDS.length,
      });
    }

    const isMultiRate = DOM.multipleRatesToggle.checked;
    const isComponent = (id) => isMultiRate && RYCZALT_VARIANT_IDS.includes(id);
    RYCZALT_VARIANT_IDS.forEach((id) => {
      const row = document.querySelector(`.results-row[data-variant="${id}"]`);
      if (row) row.classList.toggle("is-component", isMultiRate);
    });

    // in multi-rate mode the per-rate rows are PIT components of the
    // "ryczałt łącznie" total, so they stay grouped directly above it
    const components = visibleVariants.filter((v) => isComponent(v.id));
    visibleVariants
      .filter((v) => !isComponent(v.id))
      .sort((a, b) => a.value - b.value || a.index - b.index)
      .forEach(({ id, row }) => {
        if (id === "ratesTotal") {
          components.forEach((c) => container.appendChild(c.row));
        }
        container.appendChild(row);
      });
  }

  /* ==================================================
     Rank visible variants & populate the best card
  ================================================== */
  function formatPercent1(value) {
    return (
      new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(value * 100) + "%"
    );
  }

  function formatWholePLN(value) {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function clearRowDetails(row) {
    row.classList.remove("is-best");
    const rank = row.querySelector("[data-rank]");
    const delta = row.querySelector("[data-delta]");
    const bar = row.querySelector("[data-bar]");
    if (rank) rank.textContent = "";
    if (delta) delta.textContent = "";
    if (bar) bar.style.width = "0%";
  }

  function setEmptySummary() {
    DOM.bestCard.dataset.state = "empty";
    DOM.bestCardTitle.textContent = "—";
    DOM.bestCardAmount.textContent = "—";
    DOM.bestCardSavings.textContent = "Wpisz przychód, aby zobaczyć wynik.";
    DOM.bestCardMonthly.textContent = "—";
    DOM.bestCardRate.textContent = "—";
    DOM.bestCardNet.textContent = "—";
    if (DOM.mobileSummary) {
      DOM.mobileSummary.dataset.state = "empty";
      DOM.mobileSummaryTitle.textContent = "—";
      DOM.mobileSummaryAmount.textContent = "—";
    }
  }

  function rankAndSummarize(revenue, income) {
    const isMultiRate = !!(
      DOM.multipleRatesToggle && DOM.multipleRatesToggle.checked
    );
    const variants = [];

    const collectVariant = (id) => {
      const variant = getVisibleResultVariant(id);
      if (!variant) return;
      const { value } = variant;
      if (value <= 0) return;
      variants.push(variant);
    };

    PIT_VARIANT_IDS.forEach(collectVariant);

    if (isMultiRate) {
      // in multi-rate mode the per-rate field shows only that rate's PIT
      // share (without health). The user-meaningful ryczałt cost is the
      // aggregated "Łącznie PIT + składka zdrowotna". Compare that as one option,
      // but only once the user actually allocated some revenue to a rate.
      const ratesTotalVariant = getVisibleRatesTotalVariant();
      if (
        ratesTotalVariant &&
        getAllocatedRevenueTotal() > 0 &&
        ratesTotalVariant.value > 0
      ) {
        variants.push(ratesTotalVariant);
      }
    } else {
      RYCZALT_VARIANT_IDS.forEach(collectVariant);
    }

    document
      .querySelectorAll(".results-row, #ratesTotal")
      .forEach(clearRowDetails);

    sortPitComparisonRows();

    const meaningful = revenue > 0 || income !== 0;

    if (!variants.length || !meaningful) {
      setEmptySummary();
      return;
    }

    const sorted = [...variants].sort((a, b) => a.value - b.value);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const second = sorted[1];

    best.row.classList.add("is-best");

    const maxVal = Math.max(...variants.map((v) => v.value), 1);
    sorted.forEach((v, index) => {
      const bar = v.row.querySelector("[data-bar]");
      if (bar) {
        const pct = maxVal > 0 ? (v.value / maxVal) * 100 : 0;
        bar.style.width = pct.toFixed(1) + "%";
      }
      const rank = v.row.querySelector("[data-rank]");
      if (rank) rank.textContent = String(index + 1);

      const delta = v.row.querySelector("[data-delta]");
      if (delta) {
        delta.textContent =
          v === best ? "najtaniej" : `+${formatWholePLN(v.value - best.value)}`;
      }
    });

    const bestLabel = VARIANT_LABELS[best.id] || best.id;
    DOM.bestCard.dataset.state = "ranked";
    DOM.bestCardTitle.textContent = bestLabel;
    DOM.bestCardAmount.textContent = formatPLN(best.value);
    DOM.bestCardMonthly.textContent = formatPLN(best.value / 12);
    DOM.bestCardRate.textContent =
      income > 0 ? formatPercent1(best.value / income) : "—";
    DOM.bestCardNet.textContent =
      income > 0 ? formatPLN(income - best.value) : "—";

    if (second && second.value > best.value) {
      const delta = second.value - best.value;
      DOM.bestCardSavings.innerHTML =
        `<strong>${formatPLN(delta)}</strong> taniej niż ` +
        (VARIANT_LABELS[second.id] || second.id);
    } else if (worst && worst.value > best.value) {
      const delta = worst.value - best.value;
      DOM.bestCardSavings.innerHTML = `<strong>${formatPLN(delta)}</strong> taniej niż najdroższy wariant`;
    } else {
      DOM.bestCardSavings.textContent =
        "Zaznacz stawkę ryczałtu, aby porównać więcej wariantów.";
    }

    if (DOM.mobileSummary) {
      DOM.mobileSummary.dataset.state = "ranked";
      DOM.mobileSummaryTitle.textContent = bestLabel;
      DOM.mobileSummaryAmount.textContent = formatWholePLN(best.value);
    }
  }

  /* ==================================================
     Period hints ("= X zł rocznie") and suffixes
  ================================================== */
  const DEFAULT_HINTS = {};
  document.querySelectorAll("[data-annual-hint]").forEach((el) => {
    DEFAULT_HINTS[el.dataset.annualHint] = el.textContent.trim();
  });

  function updatePeriodHints() {
    const isMonthly = getPeriodFactor() === 12;
    document.querySelectorAll("[data-period-suffix]").forEach((el) => {
      el.textContent = isMonthly ? "/mies." : "/rok";
    });
    document.querySelectorAll("[data-annual-hint]").forEach((el) => {
      const input = document.getElementById(el.dataset.annualHint);
      const annual = readAnnualAmount(input);
      el.classList.toggle("is-conversion", isMonthly && annual > 0);
      el.textContent =
        isMonthly && annual > 0
          ? `= ${formatPLN(annual)} rocznie`
          : DEFAULT_HINTS[el.dataset.annualHint];
    });
  }

  /* ==================================================
     Inline breakdown auto-update when <details> is open
  ================================================== */
  function refreshBreakdownIfOpen() {
    if (!DOM.breakdownDetails || !DOM.breakdownPre) return;
    if (DOM.breakdownDetails.open) {
      DOM.breakdownPre.textContent = getFormattedValues();
    }
  }

  /* ==================================================
     Event Handlers
  ================================================== */
  function handleCalculate() {
    const isRevenueValid = validateInput(DOM.revenueInput.value, "revenue");
    const isCostsValid = validateInput(DOM.costsInput.value, "costs");
    const isIpBoxValid = isIpBoxEnabled()
      ? validateIpBoxCoeff(DOM.ipBoxCoeffInput.value)
      : true;

    if (isRevenueValid && isCostsValid && isIpBoxValid) {
      DOM.revenueInput.value = formatPLN(parsePLN(DOM.revenueInput.value));
      DOM.costsInput.value = formatPLN(parsePLN(DOM.costsInput.value));
      calculate();
    }

    DOM.ryczaltCheckboxes.forEach((checkbox) => {
      const targetId = checkbox.dataset.target;
      const targetInput = document.getElementById(targetId);
      const targetGroup = targetInput.closest(".input-group");
      targetGroup.style.display = checkbox.checked ? "grid" : "none";
    });

    const jointTaxationSelected = document.querySelector(
      'input[name="jointTaxation"]:checked',
    ).value;
    if (jointTaxationSelected === "no") {
      DOM.spouseIncomeCard.classList.remove("is-revealed");
      DOM.spouseIncomeInput.setAttribute("readonly", "");
      DOM.spouseIncomeInput.value = formatPLN(0);
    }
  }

  /* ==================================================
     Reset
  ================================================== */
  function resetAll() {
    DOM.revenueInput.value = "";
    DOM.costsInput.value = "";
    document.getElementById("revenue-error").textContent = "";
    document.getElementById("revenue-error").classList.remove("visible");
    document.getElementById("costs-error").textContent = "";
    document.getElementById("costs-error").classList.remove("visible");
    DOM.revenueInput.classList.remove("error");
    DOM.costsInput.classList.remove("error");

    DOM.ipBoxCoeffInput.value = "25";
    syncIpBoxRange();
    document.getElementById("ipBoxCoeff-error").textContent = "";
    document.getElementById("ipBoxCoeff-error").classList.remove("visible");
    DOM.ipBoxCoeffInput.classList.remove("error");

    document.querySelector('input[name="ipBoxEnabled"][value="no"]').checked =
      true;
    if (DOM.ipBoxReveal) DOM.ipBoxReveal.classList.remove("is-revealed");
    clearIpBoxResultFields();

    document.querySelector('input[name="jointTaxation"][value="no"]').checked =
      true;
    DOM.spouseIncomeCard.classList.remove("is-revealed");
    DOM.spouseIncomeInput.setAttribute("readonly", "");
    DOM.spouseIncomeInput.value = formatPLN(0);
    updateConditionalRowsVisibility();

    DOM.multipleRatesToggle.checked = false;
    setMultiRateLayout(false);
    DOM.ryczaltCheckboxes.forEach((cb) => {
      cb.checked = false;
      const targetId = cb.dataset.target;
      const targetInput = document.getElementById(targetId);
      const targetGroup = targetInput.closest(".input-group");
      targetGroup.style.display = "none";
      const rateInput = cb
        .closest(".checkbox-wrapper")
        .querySelector(".rate-input");
      if (rateInput) {
        rateInput.classList.remove("show");
        rateInput.value = "";
      }
      targetInput.value = formatPLN(0);
    });
    document.getElementById("ratesTotal").classList.add("hidden");
    calculate();
    DOM.revenueInput.focus();
  }

  /* ==================================================
     Event Listener Registrations
  ================================================== */
  DOM.calculateButton.addEventListener("click", handleCalculate);

  [
    DOM.revenueInput,
    DOM.costsInput,
    DOM.ipBoxCoeffInput,
    DOM.spouseIncomeInput,
  ].forEach((input) => {
    input.addEventListener("focus", selectInputValue);
    input.addEventListener("click", selectInputValue);
  });

  DOM.revenueInput.addEventListener("input", (e) => {
    const isValid = validateInput(e.target.value, "revenue");
    if (isValid) {
      const cursorPos = e.target.selectionStart;
      const originalValue = e.target.value;
      calculate();
      e.target.value = originalValue;
      e.target.setSelectionRange(cursorPos, cursorPos);
    }
    if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
  });
  DOM.revenueInput.addEventListener("blur", (e) => {
    if (e.target.value === "") return;
    const originalValue = parsePLN(e.target.value);
    e.target.value = formatPLN(originalValue);
    calculate();
    if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
  });

  DOM.costsInput.addEventListener("input", (e) => {
    const isValid = validateInput(e.target.value, "costs");
    if (isValid) {
      const cursorPos = e.target.selectionStart;
      const originalValue = e.target.value;
      calculate();
      e.target.value = originalValue;
      e.target.setSelectionRange(cursorPos, cursorPos);
    }
  });
  DOM.costsInput.addEventListener("blur", (e) => {
    if (e.target.value === "") return;
    const originalValue = parsePLN(e.target.value);
    e.target.value = formatPLN(originalValue);
    calculate();
  });

  /* IP BOX: number input + range slider stay in sync */
  DOM.ipBoxCoeffInput.addEventListener("input", (e) => {
    if (validateIpBoxCoeff(e.target.value)) {
      syncIpBoxRange();
      calculate();
    }
  });
  DOM.ipBoxCoeffInput.addEventListener("blur", () => {
    if (validateIpBoxCoeff(DOM.ipBoxCoeffInput.value)) {
      syncIpBoxRange();
    }
  });
  if (DOM.ipBoxRange) {
    DOM.ipBoxRange.addEventListener("input", (e) => {
      DOM.ipBoxCoeffInput.value = e.target.value;
      syncIpBoxRange();
      validateIpBoxCoeff(DOM.ipBoxCoeffInput.value);
      calculate();
    });
  }

  /* IP BOX: Tak/Nie toggle reveals the slider and the IP BOX result rows */
  DOM.ipBoxEnabledRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "yes") {
        if (DOM.ipBoxReveal) DOM.ipBoxReveal.classList.add("is-revealed");
        syncIpBoxRange();
      } else {
        if (DOM.ipBoxReveal) DOM.ipBoxReveal.classList.remove("is-revealed");
        document.getElementById("ipBoxCoeff-error").textContent = "";
        document.getElementById("ipBoxCoeff-error").classList.remove("visible");
        DOM.ipBoxCoeffInput.classList.remove("error");
        clearIpBoxResultFields();
      }
      updateConditionalRowsVisibility();
      calculate();
    });
  });

  DOM.jointTaxationRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      DOM.spouseIncomeCard.classList.remove("shake");
      if (e.target.value === "yes") {
        DOM.spouseIncomeCard.classList.add("is-revealed");
        DOM.spouseIncomeInput.removeAttribute("readonly");
        DOM.spouseIncomeInput.value = "";
        DOM.spouseIncomeInput.placeholder = "0,00";
        DOM.spouseIncomeCard.classList.add("shake");
        setTimeout(() => {
          DOM.spouseIncomeCard.classList.remove("shake");
        }, 500);
        DOM.spouseIncomeInput.focus();
      } else {
        DOM.spouseIncomeCard.classList.remove("is-revealed");
        DOM.spouseIncomeInput.setAttribute("readonly", "");
        DOM.spouseIncomeInput.value = formatPLN(0);
        DOM.spouseIncomeInput.placeholder = "";
      }
      updateConditionalRowsVisibility();
      calculate();
    });
  });

  DOM.spouseIncomeInput.addEventListener("input", (e) => {
    if (DOM.spouseIncomeCard.classList.contains("is-revealed")) {
      const isValid = validateInput(e.target.value, "spouseIncome");
      if (isValid) calculate();
    }
  });
  DOM.spouseIncomeInput.addEventListener("blur", (e) => {
    if (DOM.spouseIncomeCard.classList.contains("is-revealed")) {
      e.target.value = formatPLN(parsePLN(e.target.value));
    }
  });

  DOM.multipleRatesToggle.addEventListener("change", function (e) {
    const isEnabled = e.target.checked;
    const rateInputs = document.querySelectorAll(".rate-input");
    setMultiRateLayout(isEnabled);

    rateInputs.forEach((input) => {
      const wrap = input.closest(".checkbox-wrapper");
      const checkbox = wrap.querySelector('input[type="checkbox"]');
      const targetId = checkbox.dataset.target;
      const targetInput = document.getElementById(targetId);
      if (isEnabled && checkbox.checked) {
        input.classList.add("show");
        input.value = "";
        targetInput.value = formatPLN(0);
      } else {
        input.classList.remove("show");
        input.value = "";
      }
    });
    if (isEnabled) updateRemainingRevenue();
    calculate();
    updateRatesTotal();
  });

  DOM.ryczaltCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const targetId = this.dataset.target;
      const targetInput = document.getElementById(targetId);
      const targetGroup = targetInput.closest(".input-group");
      const rateInput =
        this.closest(".checkbox-wrapper").querySelector(".rate-input");
      const multipleRatesEnabled = DOM.multipleRatesToggle.checked;

      if (this.checked) {
        targetGroup.style.display = "grid";
        if (multipleRatesEnabled) {
          rateInput.classList.add("show");
          rateInput.value = "";
          targetInput.value = formatPLN(0);
        }
      } else {
        targetGroup.style.display = "none";
        rateInput.classList.remove("show");
        rateInput.value = "";
        targetInput.value = formatPLN(0);
      }

      calculate();
      if (multipleRatesEnabled) updateRemainingRevenue();
    });
  });

  document.querySelectorAll(".rate-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const isValid =
        !e.target.value || validateInput(e.target.value, e.target.dataset.for);
      if (isValid) calculate();
      if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
    });
    input.addEventListener("blur", (e) => {
      if (e.target.value) {
        e.target.value = formatPLN(parsePLN(e.target.value));
        updateRemainingRevenue();
      }
    });
    input.addEventListener("focus", (e) => {
      e.target.select();
    });
    input.addEventListener("click", (e) => {
      selectInputValue(e);
      e.stopPropagation();
    });
  });

  if (DOM.resetBtn) {
    DOM.resetBtn.addEventListener("click", resetAll);
  }

  /* breakdown details: render content the moment the user opens it */
  if (DOM.breakdownDetails) {
    DOM.breakdownDetails.addEventListener("toggle", () => {
      if (DOM.breakdownDetails.open && DOM.breakdownPre) {
        DOM.breakdownPre.textContent = getFormattedValues();
      }
    });
  }

  /* ==================================================
     Clipboard / Breakdown text builders (UNCHANGED)
  ================================================== */
  function formatNumberPL(value) {
    return (
      new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " zł"
    );
  }

  function formatPercentPL(value) {
    return (value * 100).toLocaleString("pl-PL") + "%";
  }

  function getHealthScaleBreakdown(income) {
    const minHealth = taxMath.getMinHealthAnnual();
    const calculatedHealth = taxMath.round2(
      TAX_CONSTANTS.HEALTH_RATE_SCALE * income,
    );
    const healthScale = Math.max(calculatedHealth, minHealth);
    const usesMinimum = calculatedHealth < minHealth;

    let text = `Składka zdrowotna (${formatPercentPL(
      TAX_CONSTANTS.HEALTH_RATE_SCALE,
    )} od dochodu):\n`;
    text += `  ${formatNumberPL(income)} × ${formatPercentPL(
      TAX_CONSTANTS.HEALTH_RATE_SCALE,
    )} = ${formatNumberPL(calculatedHealth)}\n`;

    if (usesMinimum) {
      text += `  Minimalna składka zdrowotna: ${formatNumberPL(minHealth)}\n`;
      text += `  (obliczona składka jest niższa od minimalnej, stosuje się minimalną)\n`;
    }
    text += `  Składka zdrowotna do zapłaty: ${formatNumberPL(healthScale)}\n`;

    return { text, healthScale };
  }

  function getHealthLinearBreakdown(income) {
    const minHealth = taxMath.getMinHealthAnnual();
    const calculatedHealth = taxMath.round2(
      TAX_CONSTANTS.HEALTH_RATE_LINEAR * income,
    );
    const healthLinear = Math.max(calculatedHealth, minHealth);
    const usesMinimum = calculatedHealth < minHealth;
    const deductionLimit = TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT;
    const healthDeduction = Math.min(healthLinear, deductionLimit);

    let text = `Składka zdrowotna (${formatPercentPL(
      TAX_CONSTANTS.HEALTH_RATE_LINEAR,
    )} od dochodu):\n`;
    text += `  ${formatNumberPL(income)} × ${formatPercentPL(
      TAX_CONSTANTS.HEALTH_RATE_LINEAR,
    )} = ${formatNumberPL(calculatedHealth)}\n`;

    if (usesMinimum) {
      text += `  Minimalna składka zdrowotna: ${formatNumberPL(minHealth)}\n`;
      text += `  (obliczona składka jest niższa od minimalnej, stosuje się minimalną)\n`;
    }
    text += `  Składka zdrowotna do zapłaty: ${formatNumberPL(healthLinear)}\n`;
    text += `  Limit odliczenia od podstawy opodatkowania: ${formatNumberPL(
      deductionLimit,
    )}\n`;
    text += `  Składka do odliczenia: ${formatNumberPL(healthDeduction)}\n`;

    return { text, healthLinear, healthDeduction };
  }

  function getHealthRyczaltBreakdown(revenue) {
    const avgSalary = TAX_CONSTANTS.AVG_SALARY_Q4_PREV;
    const healthRate = TAX_CONSTANTS.HEALTH_RATE_RYCZALT;
    const mult = taxMath.getRyczaltHealthMultiplier(revenue);
    const monthlyHealth = taxMath.getRyczaltHealthMonthlyForRevenue(revenue);
    const annualHealth = taxMath.getRyczaltHealthAnnualForRevenue(revenue);
    const deduction = taxMath.round2(
      annualHealth * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR,
    );

    let thresholdDesc;
    if (revenue <= TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW) {
      thresholdDesc = `do ${formatNumberPL(
        TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW,
      )} przychodu, mnożnik ${mult * 100}%`;
    } else if (revenue <= TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH) {
      thresholdDesc = `${formatNumberPL(
        TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW + 1,
      )} - ${formatNumberPL(
        TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH,
      )} przychodu, mnożnik ${mult * 100}%`;
    } else {
      thresholdDesc = `powyżej ${formatNumberPL(
        TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH,
      )}, mnożnik ${mult * 100}%`;
    }

    let text = `Składka zdrowotna (ryczałt, ${thresholdDesc}):\n`;
    text += `  Podstawa: przeciętne wynagrodzenie ${formatNumberPL(
      avgSalary,
    )} × ${mult * 100}% × ${formatPercentPL(healthRate)}\n`;
    text += `  Miesięcznie: ${formatNumberPL(monthlyHealth)}\n`;
    text += `  Rocznie: ${formatNumberPL(
      monthlyHealth,
    )} × 12 = ${formatNumberPL(annualHealth)}\n`;
    text += `  Odliczenie od przychodu (50%): ${formatNumberPL(deduction)}\n`;

    return { text, annualHealth, deduction };
  }

  function getScaleTaxBreakdown(income, healthScale) {
    const taxFree = TAX_CONSTANTS.TAX_FREE_AMOUNT;
    const threshold12 = TAX_CONSTANTS.TAX_THRESHOLD_12;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;
    const pitDetails = getScalePitDetails(income);
    const levyDetails = getSolidarityLevyDetails(income);

    let text = `\nObliczenie podatku (skala podatkowa):\n`;
    text += `  Kwota wolna (do ${formatNumberPL(taxFree)}): ${formatNumberPL(
      pitDetails.inTaxFree,
    )} × 0% = 0,00 zł\n`;

    if (pitDetails.in12Bracket > 0) {
      text += `  I próg ${formatPercentPL(rate12)} (${formatNumberPL(
        taxFree + 1,
      )} - ${formatNumberPL(threshold12)}): ${formatNumberPL(
        pitDetails.in12Bracket,
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(pitDetails.tax12)}\n`;
    }

    if (pitDetails.in32Bracket > 0) {
      text += `  II próg ${formatPercentPL(rate32)} (${formatNumberPL(
        threshold12 + 1,
      )} i więcej): ${formatNumberPL(
        pitDetails.in32Bracket,
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(pitDetails.tax32)}\n`;
    }

    if (levyDetails.levy > 0) {
      text += `  Suma podatku wg skali: ${formatNumberPL(pitDetails.totalPit)}\n`;
      text += `  Danina solidarnościowa ${formatPercentPL(
        rateSolidarity,
      )} (liczona odrębnie, powyżej ${formatNumberPL(
        levyDetails.threshold,
      )}): ${formatNumberPL(
        levyDetails.aboveThreshold,
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        levyDetails.levy,
      )}\n`;
    }

    const totalTax = taxMath.round2(pitDetails.totalPit + levyDetails.levy);
    text +=
      levyDetails.levy > 0
        ? `  Suma podatku i daniny: ${formatNumberPL(totalTax)}\n`
        : `  Suma podatku: ${formatNumberPL(totalTax)}\n`;

    const total = taxMath.round2(totalTax + healthScale);
    text += `\nRAZEM (PIT + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  function getScaleTaxJointBreakdown(income, spouseIncome, healthScale) {
    const taxFree = TAX_CONSTANTS.TAX_FREE_AMOUNT;
    const threshold12 = TAX_CONSTANTS.TAX_THRESHOLD_12;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;
    const jointIncome = taxMath.round2(income + spouseIncome);
    const halfIncome = taxMath.round2(jointIncome / 2);
    const halfPitDetails = getScalePitDetails(halfIncome);
    const yourLevyDetails = getSolidarityLevyDetails(income);
    const spouseLevyDetails = getSolidarityLevyDetails(spouseIncome);
    const jointPit = taxMath.round2(halfPitDetails.totalPit * 2);
    const totalTax = taxMath.round2(
      jointPit + yourLevyDetails.levy + spouseLevyDetails.levy,
    );

    let text = `\nObliczenie podatku (skala podatkowa - wspólnie z małżonkiem):\n`;
    text += `  Dochód małżonka: ${formatNumberPL(spouseIncome)}\n`;
    text += `  Łączny dochód: ${formatNumberPL(income)} + ${formatNumberPL(
      spouseIncome,
    )} = ${formatNumberPL(jointIncome)}\n`;
    text += `  Połowa łącznego dochodu: ${formatNumberPL(
      jointIncome,
    )} : 2 = ${formatNumberPL(halfIncome)}\n`;
    text += `  Podatek od połowy łącznego dochodu:\n`;
    text += `    Kwota wolna (do ${formatNumberPL(taxFree)}): ${formatNumberPL(
      halfPitDetails.inTaxFree,
    )} × 0% = 0,00 zł\n`;

    if (halfPitDetails.in12Bracket > 0) {
      text += `    I próg ${formatPercentPL(rate12)} (${formatNumberPL(
        taxFree + 1,
      )} - ${formatNumberPL(threshold12)}): ${formatNumberPL(
        halfPitDetails.in12Bracket,
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(
        halfPitDetails.tax12,
      )}\n`;
    }

    if (halfPitDetails.in32Bracket > 0) {
      text += `    II próg ${formatPercentPL(rate32)} (${formatNumberPL(
        threshold12 + 1,
      )} i więcej): ${formatNumberPL(
        halfPitDetails.in32Bracket,
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(
        halfPitDetails.tax32,
      )}\n`;
    }

    text += `  Podatek od połowy dochodu: ${formatNumberPL(
      halfPitDetails.totalPit,
    )}\n`;
    text += `  Podatek wspólny od skali: ${formatNumberPL(
      halfPitDetails.totalPit,
    )} × 2 = ${formatNumberPL(jointPit)}\n`;

    if (yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0) {
      text += `  Danina solidarnościowa (liczona odrębnie dla każdego z małżonków):\n`;
    }
    if (yourLevyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        rateSolidarity,
      )} po Twojej stronie: ${formatNumberPL(
        yourLevyDetails.aboveThreshold,
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        yourLevyDetails.levy,
      )}\n`;
    }
    if (spouseLevyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        rateSolidarity,
      )} po stronie małżonka: ${formatNumberPL(
        spouseLevyDetails.aboveThreshold,
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        spouseLevyDetails.levy,
      )}\n`;
    }

    const total = taxMath.round2(totalTax + healthScale);
    text +=
      yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0
        ? `  Suma podatku i daniny: ${formatNumberPL(totalTax)}\n`
        : `  Suma podatku: ${formatNumberPL(totalTax)}\n`;
    text += `\nRAZEM (PIT + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  function getIpBoxScaleJointBreakdown(
    income,
    spouseIncome,
    ipBoxCoeff,
    healthScale,
  ) {
    const ipBoxRate = TAX_CONSTANTS.IP_BOX_RATE;
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(
      income,
      ipBoxCoeff,
    );
    const jointRegularIncome = taxMath.round2(regularIncome + spouseIncome);
    const halfJointRegularIncome = taxMath.round2(jointRegularIncome / 2);
    const halfPitDetails = getScalePitDetails(halfJointRegularIncome);
    const ipBoxTax = taxMath.round2(ipBoxIncome * ipBoxRate);
    const yourLevyDetails = getSolidarityLevyDetails(regularIncome);
    const spouseLevyDetails = getSolidarityLevyDetails(spouseIncome);
    const jointScalePit = taxMath.round2(halfPitDetails.totalPit * 2);
    const totalTax = taxMath.round2(
      ipBoxTax + jointScalePit + yourLevyDetails.levy + spouseLevyDetails.levy,
    );
    const total = taxMath.round2(totalTax + healthScale);

    let text = `\nObliczenie podatku (skala podatkowa z IP BOX - wspólnie z małżonkiem):\n`;
    text += `  Podział dochodu:\n`;
    text += `    - Dochód IP BOX (${ipBoxCoeff * 100}%): ${formatNumberPL(
      ipBoxIncome,
    )}\n`;
    text += `    - Dochód pozostały (${(1 - ipBoxCoeff) * 100}%): ${formatNumberPL(
      regularIncome,
    )}\n`;
    text += `  Dochód małżonka: ${formatNumberPL(spouseIncome)}\n`;
    text += `  Łączny dochód opodatkowany skalą: ${formatNumberPL(
      regularIncome,
    )} + ${formatNumberPL(spouseIncome)} = ${formatNumberPL(
      jointRegularIncome,
    )}\n`;
    text += `  Połowa dochodu opodatkowanego skalą: ${formatNumberPL(
      jointRegularIncome,
    )} : 2 = ${formatNumberPL(halfJointRegularIncome)}\n`;
    text += `\n  Podatek IP BOX:\n`;
    text += `    ${formatNumberPL(ipBoxIncome)} × ${formatPercentPL(
      ipBoxRate,
    )} = ${formatNumberPL(ipBoxTax)}\n`;
    text += `\n  Podatek od połowy dochodu opodatkowanego skalą:\n`;
    text += `    Kwota wolna (do ${formatNumberPL(
      TAX_CONSTANTS.TAX_FREE_AMOUNT,
    )}): ${formatNumberPL(halfPitDetails.inTaxFree)} × 0% = 0,00 zł\n`;

    if (halfPitDetails.in12Bracket > 0) {
      text += `    I próg ${formatPercentPL(
        TAX_CONSTANTS.PIT_RATE_12,
      )}: ${formatNumberPL(halfPitDetails.in12Bracket)} × ${formatPercentPL(
        TAX_CONSTANTS.PIT_RATE_12,
      )} = ${formatNumberPL(halfPitDetails.tax12)}\n`;
    }

    if (halfPitDetails.in32Bracket > 0) {
      text += `    II próg ${formatPercentPL(
        TAX_CONSTANTS.PIT_RATE_32,
      )}: ${formatNumberPL(halfPitDetails.in32Bracket)} × ${formatPercentPL(
        TAX_CONSTANTS.PIT_RATE_32,
      )} = ${formatNumberPL(halfPitDetails.tax32)}\n`;
    }

    text += `  Podatek od połowy dochodu: ${formatNumberPL(
      halfPitDetails.totalPit,
    )}\n`;
    text += `  Podatek wspólny od części skalowej: ${formatNumberPL(
      halfPitDetails.totalPit,
    )} × 2 = ${formatNumberPL(jointScalePit)}\n`;

    if (yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0) {
      text += `\n  Danina solidarnościowa (liczona odrębnie dla każdego z małżonków):\n`;
    }
    if (yourLevyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        TAX_CONSTANTS.SOLIDARITY_RATE,
      )} po Twojej stronie: ${formatNumberPL(
        yourLevyDetails.aboveThreshold,
      )} × ${formatPercentPL(
        TAX_CONSTANTS.SOLIDARITY_RATE,
      )} = ${formatNumberPL(yourLevyDetails.levy)}\n`;
    }
    if (spouseLevyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        TAX_CONSTANTS.SOLIDARITY_RATE,
      )} po stronie małżonka: ${formatNumberPL(
        spouseLevyDetails.aboveThreshold,
      )} × ${formatPercentPL(
        TAX_CONSTANTS.SOLIDARITY_RATE,
      )} = ${formatNumberPL(spouseLevyDetails.levy)}\n`;
    }

    if (yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0) {
      text += `\n  Łączny podatek i danina: ${formatNumberPL(
        ipBoxTax,
      )} + ${formatNumberPL(jointScalePit)}`;
      if (yourLevyDetails.levy > 0) {
        text += ` + ${formatNumberPL(yourLevyDetails.levy)}`;
      }
      if (spouseLevyDetails.levy > 0) {
        text += ` + ${formatNumberPL(spouseLevyDetails.levy)}`;
      }
      text += ` = ${formatNumberPL(totalTax)}\n`;
    } else {
      text += `\n  Łączny podatek: ${formatNumberPL(
        ipBoxTax,
      )} + ${formatNumberPL(jointScalePit)} = ${formatNumberPL(totalTax)}\n`;
    }
    text += `\nRAZEM (PIT + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  function getLinearTaxBreakdown(income, healthLinear, healthDeduction) {
    const linearRate = TAX_CONSTANTS.LINEAR_PIT_RATE;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;

    let text = `\nObliczenie podatku (podatek liniowy):\n`;

    const taxBase = Math.max(income - healthDeduction, 0);
    const pitDetails = getLinearPitDetails(taxBase);
    const levyDetails = getSolidarityLevyDetails(taxBase);
    text += `  Podstawa opodatkowania (PIT liniowy): ${formatNumberPL(
      income,
    )} - ${formatNumberPL(healthDeduction)} = ${formatNumberPL(taxBase)}\n`;

    if (pitDetails.pitBase > 0) {
      text += `  Podatek liniowy ${formatPercentPL(linearRate)}: ${formatNumberPL(
        pitDetails.pitBase,
      )} × ${formatPercentPL(linearRate)} = ${formatNumberPL(
        pitDetails.pit,
      )}\n`;
    }

    if (levyDetails.levy > 0) {
      text += `  Danina solidarnościowa ${formatPercentPL(
        rateSolidarity,
      )} (odrębna należność rozliczana na formularzu DSF-1, nie będąca częścią PIT-u liniowego; podstawa to dochód po odliczeniach dopuszczonych w DSF-1, w uproszczeniu kalkulator przyjmuje podstawę ${formatNumberPL(
        taxBase,
      )}; danina dotyczy nadwyżki ponad ${formatNumberPL(
        levyDetails.threshold,
      )}):\n    ${formatNumberPL(
        levyDetails.aboveThreshold,
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        levyDetails.levy,
      )}\n`;
    }

    const totalTax = taxMath.round2(pitDetails.pit + levyDetails.levy);
    text +=
      levyDetails.levy > 0
        ? `  Suma podatku i daniny: ${formatNumberPL(totalTax)}\n`
        : `  Suma podatku: ${formatNumberPL(totalTax)}\n`;

    const total = taxMath.round2(totalTax + healthLinear);
    text += `\nRAZEM (PIT + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  function getIpBoxScaleBreakdown(income, ipBoxCoeff, healthScale) {
    const ipBoxRate = TAX_CONSTANTS.IP_BOX_RATE;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(
      income,
      ipBoxCoeff,
    );
    const regularPitDetails = getScalePitDetails(regularIncome);
    const levyDetails = getSolidarityLevyDetails(regularIncome);

    let text = `\nObliczenie podatku (skala podatkowa z IP BOX):\n`;
    text += `  Podział dochodu:\n`;
    text += `    - Dochód IP BOX (${ipBoxCoeff * 100}%): ${formatNumberPL(
      ipBoxIncome,
    )}\n`;
    text += `    - Dochód pozostały (${
      (1 - ipBoxCoeff) * 100
    }%): ${formatNumberPL(regularIncome)}\n`;

    const ipBoxTax = taxMath.round2(ipBoxIncome * ipBoxRate);
    text += `\n  Podatek IP BOX:\n`;
    text += `    ${formatNumberPL(ipBoxIncome)} × ${formatPercentPL(
      ipBoxRate,
    )} = ${formatNumberPL(ipBoxTax)}\n`;

    text += `\n  Podatek od pozostałego dochodu (skala):\n`;

    text += `    Kwota wolna (do ${formatNumberPL(
      TAX_CONSTANTS.TAX_FREE_AMOUNT,
    )}): ${formatNumberPL(regularPitDetails.inTaxFree)} × 0% = 0,00 zł\n`;

    if (regularPitDetails.in12Bracket > 0) {
      text += `    I próg ${formatPercentPL(rate12)}: ${formatNumberPL(
        regularPitDetails.in12Bracket,
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(
        regularPitDetails.tax12,
      )}\n`;
    }

    if (regularPitDetails.in32Bracket > 0) {
      text += `    II próg ${formatPercentPL(rate32)}: ${formatNumberPL(
        regularPitDetails.in32Bracket,
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(
        regularPitDetails.tax32,
      )}\n`;
    }

    text += `    Suma podatku od pozostałego dochodu wg skali: ${formatNumberPL(
      regularPitDetails.totalPit,
    )}\n`;

    if (levyDetails.levy > 0) {
      text += `    Danina solidarnościowa: ${formatNumberPL(
        levyDetails.aboveThreshold,
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        levyDetails.levy,
      )}\n`;
    }

    const totalTax = taxMath.round2(
      ipBoxTax + regularPitDetails.totalPit + levyDetails.levy,
    );
    if (levyDetails.levy > 0) {
      text += `\n  Łączny podatek i danina: ${formatNumberPL(
        ipBoxTax,
      )} + ${formatNumberPL(regularPitDetails.totalPit)} + ${formatNumberPL(
        levyDetails.levy,
      )} = ${formatNumberPL(totalTax)}\n`;
    } else {
      text += `\n  Łączny podatek: ${formatNumberPL(
        ipBoxTax,
      )} + ${formatNumberPL(regularPitDetails.totalPit)} = ${formatNumberPL(
        totalTax,
      )}\n`;
    }

    const total = taxMath.round2(totalTax + healthScale);
    text += `\nRAZEM (PIT + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  function getIpBoxLinearBreakdown(
    income,
    ipBoxCoeff,
    healthLinear,
    healthDeduction,
  ) {
    const ipBoxRate = TAX_CONSTANTS.IP_BOX_RATE;
    const linearRate = TAX_CONSTANTS.LINEAR_PIT_RATE;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;

    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(
      income,
      ipBoxCoeff,
    );
    const taxBase = Math.max(regularIncome - healthDeduction, 0);
    const pitDetails = getLinearPitDetails(taxBase);
    const levyDetails = getSolidarityLevyDetails(taxBase);

    let text = `\nObliczenie podatku (podatek liniowy z IP BOX):\n`;
    text += `  Podział dochodu:\n`;
    text += `    - Dochód IP BOX (${ipBoxCoeff * 100}%): ${formatNumberPL(
      ipBoxIncome,
    )}\n`;
    text += `    - Dochód pozostały (${
      (1 - ipBoxCoeff) * 100
    }%): ${formatNumberPL(regularIncome)}\n`;

    const ipBoxTax = taxMath.round2(ipBoxIncome * ipBoxRate);
    text += `\n  Podatek IP BOX:\n`;
    text += `    ${formatNumberPL(ipBoxIncome)} × ${formatPercentPL(
      ipBoxRate,
    )} = ${formatNumberPL(ipBoxTax)}\n`;

    text += `\n  Podatek od pozostałego dochodu (liniowy):\n`;
    text += `    Podstawa (PIT liniowy): ${formatNumberPL(
      regularIncome,
    )} - ${formatNumberPL(healthDeduction)} = ${formatNumberPL(taxBase)}\n`;

    if (pitDetails.pitBase > 0) {
      text += `    Podatek liniowy ${formatPercentPL(linearRate)}: ${formatNumberPL(
        taxBase,
      )} × ${formatPercentPL(
        linearRate,
      )} = ${formatNumberPL(pitDetails.pit)}\n`;
    }

    if (levyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        rateSolidarity,
      )} (odrębna należność rozliczana na formularzu DSF-1, poza PIT-em liniowym; podstawa to dochód stanowiący podstawę daniny po odliczeniach dopuszczonych w DSF-1 — dochód z IP BOX do niej nie wchodzi; w uproszczeniu kalkulator przyjmuje podstawę ${formatNumberPL(
        taxBase,
      )}, danina dotyczy nadwyżki ponad ${formatNumberPL(
        levyDetails.threshold,
      )}):\n    ${formatNumberPL(
        levyDetails.aboveThreshold,
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        levyDetails.levy,
      )}\n`;
    }

    const totalRegularTax = taxMath.round2(pitDetails.pit + levyDetails.levy);
    const totalTax = taxMath.round2(ipBoxTax + totalRegularTax);
    text +=
      levyDetails.levy > 0
        ? `\n  Łączny podatek i danina: ${formatNumberPL(
            ipBoxTax,
          )} + ${formatNumberPL(pitDetails.pit)} + ${formatNumberPL(
            levyDetails.levy,
          )} = ${formatNumberPL(totalTax)}\n`
        : `\n  Łączny podatek: ${formatNumberPL(
            ipBoxTax,
          )} + ${formatNumberPL(totalRegularTax)} = ${formatNumberPL(
            totalTax,
          )}\n`;

    const total = taxMath.round2(totalTax + healthLinear);
    text += `\nRAZEM (PIT + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  function getRyczaltBreakdown(
    revenue,
    rate,
    rateName,
    healthDeduction,
    healthAnnual,
    isMultipleRates,
  ) {
    const taxBase = Math.max(revenue - healthDeduction, 0);
    const tax = taxMath.round2(taxBase * rate);

    let text = `\nObliczenie ryczałtu (stawka ${rateName}):\n`;
    text += `  Przychód: ${formatNumberPL(revenue)}\n`;
    text += `  Odliczenie składki zdrowotnej: ${formatNumberPL(
      healthDeduction,
    )}\n`;
    text += `  Podstawa opodatkowania: ${formatNumberPL(
      revenue,
    )} - ${formatNumberPL(healthDeduction)} = ${formatNumberPL(taxBase)}\n`;
    text += `  Ryczałt: ${formatNumberPL(
      taxBase,
    )} × ${rateName} = ${formatNumberPL(tax)}\n`;

    if (!isMultipleRates) {
      const total = taxMath.round2(tax + healthAnnual);
      text += `\nRAZEM (PIT + składka zdrowotna zdrowotna): ${formatNumberPL(
        total,
      )}\n`;
    }

    return text;
  }

  function getRyczalt85125Breakdown(
    revenue,
    healthDeduction,
    healthAnnual,
    isMultipleRates,
  ) {
    const threshold = TAX_CONSTANTS.RYCZALT_8_5_THRESHOLD;
    const rate85 = TAX_CONSTANTS.RYCZALT_RATE_8_5;
    const rate125 = TAX_CONSTANTS.RYCZALT_RATE_12_5;

    let text = `\nObliczenie ryczałtu (stawka 8,5% i 12,5%):\n`;
    text += `  Przychód: ${formatNumberPL(revenue)}\n`;
    text += `  Próg dla stawki 8,5%: ${formatNumberPL(threshold)}\n`;
    text += `  Odliczenie składki zdrowotnej: ${formatNumberPL(
      healthDeduction,
    )}\n`;

    let tax;
    if (revenue <= threshold) {
      const taxBase = Math.max(revenue - healthDeduction, 0);
      tax = taxMath.round2(taxBase * rate85);
      text += `  Cały przychód mieści się w progu 8,5%:\n`;
      text += `  Podstawa: ${formatNumberPL(taxBase)}\n`;
      text += `  Ryczałt: ${formatNumberPL(taxBase)} × 8,5% = ${formatNumberPL(
        tax,
      )}\n`;
    } else {
      const tax85 = taxMath.round2(threshold * rate85);
      const above = revenue - threshold;
      const aboveBase = Math.max(above - healthDeduction, 0);
      const tax125 = taxMath.round2(aboveBase * rate125);
      tax = taxMath.round2(tax85 + tax125);

      text += `  Część do ${formatNumberPL(threshold)} (8,5%): ${formatNumberPL(
        threshold,
      )} × 8,5% = ${formatNumberPL(tax85)}\n`;
      text += `  Część powyżej progu: ${formatNumberPL(above)}\n`;
      text += `  Po odliczeniu składki zdrowotnej: ${formatNumberPL(
        aboveBase,
      )}\n`;
      text += `  Ryczałt 12,5%: ${formatNumberPL(
        aboveBase,
      )} × 12,5% = ${formatNumberPL(tax125)}\n`;
      text += `  Suma ryczałtu: ${formatNumberPL(tax85)} + ${formatNumberPL(
        tax125,
      )} = ${formatNumberPL(tax)}\n`;
    }

    if (!isMultipleRates) {
      const total = taxMath.round2(tax + healthAnnual);
      text += `\nRAZEM (PIT + składka zdrowotna zdrowotna): ${formatNumberPL(
        total,
      )}\n`;
    }

    return text;
  }

  function getFormattedValues() {
    const periodFactor = getPeriodFactor();
    const revenueNum = readAnnualAmount(DOM.revenueInput);
    const costsNum = readAnnualAmount(DOM.costsInput);
    const incomeNum = revenueNum - costsNum;
    const ipBoxOn = isIpBoxEnabled();
    const ipBoxCoeffNum = ipBoxOn
      ? parseFloat(DOM.ipBoxCoeffInput.value) / 100
      : 0;
    const isJointTaxation = document.querySelector(".joint-taxation-card.show");
    const spouseIncomeNum = isJointTaxation
      ? readAnnualAmount(DOM.spouseIncomeInput)
      : 0;
    const isMultipleRates = DOM.multipleRatesToggle.checked;

    const healthScaleData = getHealthScaleBreakdown(incomeNum);
    const healthLinearData = getHealthLinearBreakdown(incomeNum);

    let ryczaltRevenueForHealth = revenueNum;
    if (isMultipleRates) {
      ryczaltRevenueForHealth = getAllocatedRevenueTotal();
    }
    const healthRyczaltData = getHealthRyczaltBreakdown(
      ryczaltRevenueForHealth,
    );

    let text = `=== DANE PODSTAWOWE (ROCZNIE) ===\n`;
    if (periodFactor === 12) {
      text += `(kwoty wprowadzone miesięcznie i przeliczone × 12)\n`;
    }
    text += `Przychód: ${formatNumberPL(revenueNum)}\n`;
    text += `Koszty: ${formatNumberPL(costsNum)}\n`;
    text += `Dochód: ${formatNumberPL(incomeNum)}\n`;
    if (isJointTaxation) {
      text += `Dochód małżonka: ${formatNumberPL(spouseIncomeNum)}\n`;
    }
    if (ipBoxOn) {
      text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n`;
    }

    text += `\nZakres obliczeń: kwoty obejmują PIT (skala / liniowy / ryczałt)\n`;
    text += `oraz składkę zdrowotną podatnika. Nie obejmują składek społecznych\n`;
    text += `(ZUS) ani obciążeń publicznoprawnych po stronie małżonka\n`;
    text += `(w tym jego składki zdrowotnej i ZUS).\n`;
    if (isJointTaxation) {
      text += `Przy wspólnym rozliczeniu przedstawione wartości nie stanowią\n`;
      text += `więc pełnego obciążenia gospodarstwa domowego — odpowiadają\n`;
      text += `części przypadającej na podatnika po zastosowaniu zasady\n`;
      text += `"2 × PIT((suma dochodów) / 2)" dla skali.\n`;
    }

    text += `\n${"=".repeat(50)}\n`;
    text += `=== PODSUMOWANIE WYNIKÓW ===\n`;
    text += `${"=".repeat(50)}\n\n`;

    const taxScaleValue = document.getElementById("taxScale").value;
    const taxScaleIpBoxValue = document.getElementById("taxScaleIpBox").value;
    text += `SKALA PODATKOWA:\n`;
    if (isJointTaxation) {
      const taxScaleJointValue = document.getElementById("taxScaleJoint").value;
      const taxScaleIpBoxJointValue =
        document.getElementById("taxScaleIpBoxJoint").value;
      text += `  Indywidualnie: ${taxScaleValue}\n`;
      if (ipBoxOn) {
        text += `  Indywidualnie (IP BOX): ${taxScaleIpBoxValue}\n`;
      }
      text += `  Wspólnie z małżonkiem: ${taxScaleJointValue}\n`;
      if (ipBoxOn) {
        text += `  Wspólnie z małżonkiem (IP BOX): ${taxScaleIpBoxJointValue}\n`;
      }
    } else {
      text += `  Skala podatkowa: ${taxScaleValue}\n`;
      if (ipBoxOn) {
        text += `  Skala podatkowa (IP BOX): ${taxScaleIpBoxValue}\n`;
      }
    }

    const taxLinearValue = document.getElementById("taxLinear").value;
    const taxLinearIpBoxValue = document.getElementById("taxLinearIpBox").value;
    text += `\nPODATEK LINIOWY:\n`;
    text += `  Podatek liniowy: ${taxLinearValue}\n`;
    if (ipBoxOn) {
      text += `  Podatek liniowy (IP BOX): ${taxLinearIpBoxValue}\n`;
    }

    const anyRyczaltVisible = Array.from(DOM.ryczaltCheckboxes).some(
      (checkbox) => checkbox.checked,
    );
    const ryczaltRates = [
      { id: "ryczalt2", label: "2%", rate: TAX_CONSTANTS.RYCZALT_RATE_2 },
      { id: "ryczalt3", label: "3%", rate: TAX_CONSTANTS.RYCZALT_RATE_3 },
      { id: "ryczalt5_5", label: "5,5%", rate: TAX_CONSTANTS.RYCZALT_RATE_5_5 },
      { id: "ryczalt8_5", label: "8,5%", rate: TAX_CONSTANTS.RYCZALT_RATE_8_5 },
      { id: "ryczalt8_5_12_5", label: "8,5% i 12,5%", rate: null },
      { id: "ryczalt10", label: "10%", rate: TAX_CONSTANTS.RYCZALT_RATE_10 },
      { id: "ryczalt12", label: "12%", rate: TAX_CONSTANTS.RYCZALT_RATE_12 },
      { id: "ryczalt14", label: "14%", rate: TAX_CONSTANTS.RYCZALT_RATE_14 },
      { id: "ryczalt15", label: "15%", rate: TAX_CONSTANTS.RYCZALT_RATE_15 },
      { id: "ryczalt17", label: "17%", rate: TAX_CONSTANTS.RYCZALT_RATE_17 },
    ];

    if (anyRyczaltVisible) {
      text += `\nRYCZAŁT:\n`;
      ryczaltRates.forEach((rate) => {
        const element = document.getElementById(rate.id);
        if (
          element &&
          element.closest(".input-group").style.display !== "none"
        ) {
          text += `  ${rate.label}: ${element.value}\n`;
        }
      });

      if (isMultipleRates) {
        const ratesTotalValue = document.getElementById("ratesTotalValue");
        if (ratesTotalValue) {
          text += `  ---\n`;
          text += `  SUMA (PIT + składka zdrowotna zdrowotna): ${ratesTotalValue.textContent}\n`;
        }
      }
    }

    text += `\n${"=".repeat(50)}\n`;
    text += `=== SZCZEGÓŁY OBLICZEŃ ===\n`;
    text += `${"=".repeat(50)}\n`;

    text += `\n--- SKALA PODATKOWA ---\n`;
    text += `\nDochód: ${formatNumberPL(incomeNum)}\n\n`;
    text += healthScaleData.text;
    text += getScaleTaxBreakdown(incomeNum, healthScaleData.healthScale);

    if (ipBoxOn && ipBoxCoeffNum > 0) {
      text += `\n--- SKALA PODATKOWA (IP BOX) ---\n`;
      text += `\nDochód: ${formatNumberPL(incomeNum)}\n`;
      text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n\n`;
      text += healthScaleData.text;
      text += getIpBoxScaleBreakdown(
        incomeNum,
        ipBoxCoeffNum,
        healthScaleData.healthScale,
      );
    }

    if (isJointTaxation) {
      text += `\n--- SKALA PODATKOWA (WSPÓLNIE Z MAŁŻONKIEM) ---\n`;
      text += `\nDochód: ${formatNumberPL(incomeNum)}\n`;
      text += `Dochód małżonka: ${formatNumberPL(spouseIncomeNum)}\n\n`;
      text += healthScaleData.text;
      text += getScaleTaxJointBreakdown(
        incomeNum,
        spouseIncomeNum,
        healthScaleData.healthScale,
      );

      if (ipBoxOn && ipBoxCoeffNum > 0) {
        text += `\n--- SKALA PODATKOWA Z IP BOX (WSPÓLNIE Z MAŁŻONKIEM) ---\n`;
        text += `\nDochód: ${formatNumberPL(incomeNum)}\n`;
        text += `Dochód małżonka: ${formatNumberPL(spouseIncomeNum)}\n`;
        text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n\n`;
        text += healthScaleData.text;
        text += getIpBoxScaleJointBreakdown(
          incomeNum,
          spouseIncomeNum,
          ipBoxCoeffNum,
          healthScaleData.healthScale,
        );
      }
    }

    text += `\n--- PODATEK LINIOWY ---\n`;
    text += `\nDochód: ${formatNumberPL(incomeNum)}\n\n`;
    text += healthLinearData.text;
    text += getLinearTaxBreakdown(
      incomeNum,
      healthLinearData.healthLinear,
      healthLinearData.healthDeduction,
    );

    if (ipBoxOn && ipBoxCoeffNum > 0) {
      text += `\n--- PODATEK LINIOWY (IP BOX) ---\n`;
      text += `\nDochód: ${formatNumberPL(incomeNum)}\n`;
      text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n\n`;
      text += healthLinearData.text;
      text += getIpBoxLinearBreakdown(
        incomeNum,
        ipBoxCoeffNum,
        healthLinearData.healthLinear,
        healthLinearData.healthDeduction,
      );
    }

    if (anyRyczaltVisible) {
      text += `\n--- RYCZAŁT ---\n`;
      text += `\nPrzychód: ${formatNumberPL(revenueNum)}\n`;
      if (isMultipleRates) {
        text += `(Tryb wielu stawek - obliczenia dla każdej stawki osobno)\n`;
      }
      text += `\n`;
      text += healthRyczaltData.text;

      ryczaltRates.forEach((rateInfo) => {
        const element = document.getElementById(rateInfo.id);
        if (
          element &&
          element.closest(".input-group").style.display !== "none"
        ) {
          let rateRevenue = revenueNum;
          if (isMultipleRates) {
            const rateInput = document.querySelector(
              `.rate-input[data-for="${rateInfo.id}"]`,
            );
            rateRevenue = readAnnualAmount(rateInput);
          }

          if (rateInfo.id === "ryczalt8_5_12_5") {
            text += getRyczalt85125Breakdown(
              rateRevenue,
              healthRyczaltData.deduction,
              healthRyczaltData.annualHealth,
              isMultipleRates,
            );
          } else if (rateInfo.rate !== null) {
            text += getRyczaltBreakdown(
              rateRevenue,
              rateInfo.rate,
              rateInfo.label,
              healthRyczaltData.deduction,
              healthRyczaltData.annualHealth,
              isMultipleRates,
            );
          }
        }
      });

      if (isMultipleRates) {
        text += `\n--- SUMA RYCZAŁTU (WIELE STAWEK) ---\n`;
        const totalAllocated = getAllocatedRevenueTotal();
        let totalRyczalt = 0;
        ryczaltRates.forEach((rateInfo) => {
          const element = document.getElementById(rateInfo.id);
          if (
            element &&
            element.closest(".input-group").style.display !== "none"
          ) {
            totalRyczalt += parsePLN(element.value) || 0;
          }
        });
        const ratesHealth =
          taxMath.getRyczaltHealthAnnualForRevenue(totalAllocated);
        const ratesTotal = taxMath.round2(totalRyczalt + ratesHealth);
        text += `  Suma przychodów rozdysponowanych: ${formatNumberPL(
          totalAllocated,
        )}\n`;
        text += `  Suma ryczałtu: ${formatNumberPL(totalRyczalt)}\n`;
        text += `  Składka zdrowotna: ${formatNumberPL(ratesHealth)}\n`;
        text += `  RAZEM: ${formatNumberPL(ratesTotal)}\n`;
      }
    }

    text += `\n${"=".repeat(50)}\n`;
    text += `Obliczenia wykonane kalkulatorem podatkowym 2026\n`;
    text += `Stan prawny: od ${TAX_CONSTANTS.EFFECTIVE_FROM}\n`;

    return text;
  }

  /* ==================================================
     Copy Modal Controller + Confirmation Toast
  ================================================== */
  let modalCloseTimeout = null;
  let lastFocusedBeforeModal = null;
  let toastShowTimeout = null;
  let toastHideTimeout = null;
  const MODAL_TRANSITION_MS = 200;
  const TOAST_VISIBLE_MS = 1700;
  const TOAST_TRANSITION_MS = 320;

  function openCopyModal() {
    if (!DOM.copyModal || !DOM.copyPreview) return;
    if (modalCloseTimeout) {
      clearTimeout(modalCloseTimeout);
      modalCloseTimeout = null;
    }
    DOM.copyPreview.textContent = getFormattedValues();
    DOM.copyPreview.scrollTop = 0;
    DOM.copyModal.hidden = false;
    DOM.copyModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lastFocusedBeforeModal = document.activeElement;
    requestAnimationFrame(() => {
      DOM.copyModal.classList.add("open");
      if (DOM.copyModalCopy) DOM.copyModalCopy.focus();
    });
  }

  function closeCopyModal() {
    if (!DOM.copyModal || DOM.copyModal.hidden) return;
    DOM.copyModal.classList.remove("open");
    DOM.copyModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalCloseTimeout) clearTimeout(modalCloseTimeout);
    modalCloseTimeout = setTimeout(() => {
      DOM.copyModal.hidden = true;
      modalCloseTimeout = null;
    }, MODAL_TRANSITION_MS);
    if (lastFocusedBeforeModal && lastFocusedBeforeModal.focus) {
      lastFocusedBeforeModal.focus();
    } else if (DOM.copyFab) {
      DOM.copyFab.focus();
    }
  }

  function showCopyToast(
    title = "Skopiowano",
    subtitle = "Wyniki znajdują się w schowku",
  ) {
    if (!DOM.copyToast) return;
    if (DOM.copyToastTitle) DOM.copyToastTitle.textContent = title;
    if (DOM.copyToastSubtitle) DOM.copyToastSubtitle.textContent = subtitle;
    if (toastShowTimeout) {
      clearTimeout(toastShowTimeout);
      toastShowTimeout = null;
    }
    if (toastHideTimeout) {
      clearTimeout(toastHideTimeout);
      toastHideTimeout = null;
    }
    DOM.copyToast.classList.remove("show");
    DOM.copyToast.hidden = false;
    void DOM.copyToast.offsetWidth;
    requestAnimationFrame(() => {
      DOM.copyToast.classList.add("show");
    });
    toastShowTimeout = setTimeout(() => {
      DOM.copyToast.classList.remove("show");
      toastHideTimeout = setTimeout(() => {
        if (DOM.copyToast) DOM.copyToast.hidden = true;
        toastHideTimeout = null;
      }, TOAST_TRANSITION_MS);
      toastShowTimeout = null;
    }, TOAST_VISIBLE_MS);
  }

  async function copyResultsToClipboard() {
    const text = DOM.copyPreview ? DOM.copyPreview.textContent : "";
    if (!text) return;
    if (await copyText(text)) {
      closeCopyModal();
      showCopyToast();
    }
  }

  if (DOM.copyFab) {
    DOM.copyFab.addEventListener("click", openCopyModal);
  }

  if (DOM.copyModal) {
    DOM.copyModal.addEventListener("click", (e) => {
      if (
        e.target instanceof Element &&
        e.target.closest("[data-copy-modal-close]")
      ) {
        closeCopyModal();
      }
    });
  }

  if (DOM.copyModalCopy) {
    DOM.copyModalCopy.addEventListener("click", copyResultsToClipboard);
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      DOM.copyModal &&
      !DOM.copyModal.hidden &&
      DOM.copyModal.classList.contains("open")
    ) {
      closeCopyModal();
    }
    if (
      e.key === "Escape" &&
      DOM.infoModal &&
      !DOM.infoModal.hidden &&
      DOM.infoModal.classList.contains("open")
    ) {
      closeInfoModal();
    }
  });

  /* ==================================================
     Info Modal Controller (TAX_CONSTANTS preview)
  ================================================== */
  let infoModalCloseTimeout = null;
  let lastFocusedBeforeInfoModal = null;
  let infoModalBuilt = false;

  function formatMultiplierPL(mult) {
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(mult);
  }

  function createInfoSection(title, items) {
    const section = document.createElement("section");
    section.className = "info-section";

    const heading = document.createElement("h4");
    heading.textContent = title;
    section.appendChild(heading);

    const list = document.createElement("dl");
    list.className = "info-list";

    items.forEach((item) => {
      const dt = document.createElement("dt");
      const label = document.createElement("span");
      label.textContent = item.label;
      dt.appendChild(label);
      if (item.code) {
        const code = document.createElement("span");
        code.className = "info-list-code";
        code.textContent = item.code;
        dt.appendChild(code);
      }

      const dd = document.createElement("dd");
      dd.textContent = item.value;

      list.appendChild(dt);
      list.appendChild(dd);
    });

    section.appendChild(list);
    return section;
  }

  function buildInfoModalContent() {
    if (!DOM.infoModalContent) return;

    DOM.infoModalContent.textContent = "";

    const intro = document.createElement("p");
    intro.className = "info-modal-intro";
    intro.textContent =
      "Poniżej znajdziesz wszystkie stałe podatkowe i współczynniki, które kalkulator bierze pod uwagę dla roku 2026.";
    DOM.infoModalContent.appendChild(intro);

    DOM.infoModalContent.appendChild(
      createInfoSection("Okres obowiązywania", [
        {
          label: "Stan prawny od",
          code: "EFFECTIVE_FROM",
          value: TAX_CONSTANTS.EFFECTIVE_FROM,
        },
        {
          label: "Pełny rok liczony stawkami od lutego 2026",
          code: "ASSUME_FULL_YEAR_FROM_FEB",
          value: TAX_CONSTANTS.ASSUME_FULL_YEAR_FROM_FEB ? "Tak" : "Nie",
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Wartości bazowe", [
        {
          label: "Minimalne wynagrodzenie (miesięcznie)",
          code: "MIN_WAGE",
          value: formatPLN(TAX_CONSTANTS.MIN_WAGE),
        },
        {
          label:
            "Przeciętne wynagrodzenie w IV kw. roku poprzedniego (miesięcznie)",
          code: "AVG_SALARY_Q4_PREV",
          value: formatPLN(TAX_CONSTANTS.AVG_SALARY_Q4_PREV),
        },
        {
          label: "Limit odliczenia składki zdrowotnej (liniowy, rocznie)",
          code: "LINEAR_HEALTH_DEDUCTION_LIMIT",
          value: formatPLN(TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Skala podatkowa", [
        {
          label: "Kwota wolna od podatku",
          code: "TAX_FREE_AMOUNT",
          value: formatPLN(TAX_CONSTANTS.TAX_FREE_AMOUNT),
        },
        {
          label: "Próg I progu podatkowego",
          code: "TAX_THRESHOLD_12",
          value: formatPLN(TAX_CONSTANTS.TAX_THRESHOLD_12),
        },
        {
          label: "Próg daniny solidarnościowej",
          code: "SOLIDARITY_THRESHOLD",
          value: formatPLN(TAX_CONSTANTS.SOLIDARITY_THRESHOLD),
        },
        {
          label: "Stawka PIT I progu",
          code: "PIT_RATE_12",
          value: formatPercentPL(TAX_CONSTANTS.PIT_RATE_12),
        },
        {
          label: "Stawka PIT II progu",
          code: "PIT_RATE_32",
          value: formatPercentPL(TAX_CONSTANTS.PIT_RATE_32),
        },
        {
          label: "Danina solidarnościowa",
          code: "SOLIDARITY_RATE",
          value: formatPercentPL(TAX_CONSTANTS.SOLIDARITY_RATE),
        },
        {
          label: "Kwota zmniejszająca podatek",
          code: "TAX_DECREASING_AMOUNT",
          value: formatPLN(TAX_CONSTANTS.TAX_DECREASING_AMOUNT),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Podatek liniowy i IP BOX", [
        {
          label: "Stawka podatku liniowego",
          code: "LINEAR_PIT_RATE",
          value: formatPercentPL(TAX_CONSTANTS.LINEAR_PIT_RATE),
        },
        {
          label: "Stawka IP BOX",
          code: "IP_BOX_RATE",
          value: formatPercentPL(TAX_CONSTANTS.IP_BOX_RATE),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Składka zdrowotna – stawki", [
        {
          label: "Skala podatkowa",
          code: "HEALTH_RATE_SCALE",
          value: formatPercentPL(TAX_CONSTANTS.HEALTH_RATE_SCALE),
        },
        {
          label: "Podatek liniowy",
          code: "HEALTH_RATE_LINEAR",
          value: formatPercentPL(TAX_CONSTANTS.HEALTH_RATE_LINEAR),
        },
        {
          label: "Ryczałt",
          code: "HEALTH_RATE_RYCZALT",
          value: formatPercentPL(TAX_CONSTANTS.HEALTH_RATE_RYCZALT),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Ryczałt – progi i mnożniki", [
        {
          label: "Próg niski przychodu",
          code: "RYCZALT_REVENUE_THRESHOLD_LOW",
          value: formatPLN(TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW),
        },
        {
          label: "Próg wysoki przychodu",
          code: "RYCZALT_REVENUE_THRESHOLD_HIGH",
          value: formatPLN(TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH),
        },
        {
          label: "Mnożnik podstawy (przychód ≤ próg niski)",
          code: "RYCZALT_BASE_MULT_LOW",
          value: formatMultiplierPL(TAX_CONSTANTS.RYCZALT_BASE_MULT_LOW),
        },
        {
          label: "Mnożnik podstawy (próg niski < przychód ≤ próg wysoki)",
          code: "RYCZALT_BASE_MULT_MID",
          value: formatMultiplierPL(TAX_CONSTANTS.RYCZALT_BASE_MULT_MID),
        },
        {
          label: "Mnożnik podstawy (przychód > próg wysoki)",
          code: "RYCZALT_BASE_MULT_HIGH",
          value: formatMultiplierPL(TAX_CONSTANTS.RYCZALT_BASE_MULT_HIGH),
        },
        {
          label: "Odliczenie składki zdrowotnej od przychodu",
          code: "RYCZALT_HEALTH_DEDUCTION_FACTOR",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR),
        },
        {
          label: "Próg stawki 8,5% / 12,5%",
          code: "RYCZALT_8_5_THRESHOLD",
          value: formatPLN(TAX_CONSTANTS.RYCZALT_8_5_THRESHOLD),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Stawki ryczałtu", [
        {
          label: "Ryczałt 2%",
          code: "RYCZALT_RATE_2",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_2),
        },
        {
          label: "Ryczałt 3%",
          code: "RYCZALT_RATE_3",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_3),
        },
        {
          label: "Ryczałt 5,5%",
          code: "RYCZALT_RATE_5_5",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_5_5),
        },
        {
          label: "Ryczałt 8,5%",
          code: "RYCZALT_RATE_8_5",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_8_5),
        },
        {
          label: "Ryczałt 10%",
          code: "RYCZALT_RATE_10",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_10),
        },
        {
          label: "Ryczałt 12%",
          code: "RYCZALT_RATE_12",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_12),
        },
        {
          label: "Ryczałt 12,5%",
          code: "RYCZALT_RATE_12_5",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_12_5),
        },
        {
          label: "Ryczałt 14%",
          code: "RYCZALT_RATE_14",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_14),
        },
        {
          label: "Ryczałt 15%",
          code: "RYCZALT_RATE_15",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_15),
        },
        {
          label: "Ryczałt 17%",
          code: "RYCZALT_RATE_17",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_17),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Wartości pochodne", [
        {
          label: "Szerokość I progu (kwota wolna → próg 120 000)",
          code: "TAX_BAND_12",
          value: formatPLN(TAX_BAND_12),
        },
        {
          label: "Szerokość II progu (próg 120 000 → danina)",
          code: "TAX_BAND_32",
          value: formatPLN(TAX_BAND_32),
        },
        {
          label: "Stawka PIT + danina solidarnościowa",
          code: "PIT_RATE_SOLIDARITY",
          value: formatPercentPL(PIT_RATE_SOLIDARITY),
        },
        {
          label: "Efektywna stawka liniowa (PIT + zdrowotna)",
          code: "EFFECTIVE_LINEAR_RATE",
          value: formatPercentPL(EFFECTIVE_LINEAR_RATE),
        },
        {
          label: "Efektywna stawka liniowa + danina",
          code: "EFFECTIVE_LINEAR_RATE_SOLIDARITY",
          value: formatPercentPL(EFFECTIVE_LINEAR_RATE_SOLIDARITY),
        },
        {
          label: "Efektywna stawka IP BOX + zdrowotna",
          code: "EFFECTIVE_IPBOX_PLUS_HEALTH",
          value: formatPercentPL(EFFECTIVE_IPBOX_PLUS_HEALTH),
        },
        {
          label: "Minimalna składka zdrowotna (miesięcznie)",
          code: "taxMath.getMinHealthMonthly()",
          value: formatPLN(taxMath.getMinHealthMonthly()),
        },
        {
          label: "Minimalna składka zdrowotna (rocznie)",
          code: "taxMath.getMinHealthAnnual()",
          value: formatPLN(taxMath.getMinHealthAnnual()),
        },
        {
          label: "Próg dochodu dla minimalnej składki liniowej (miesięcznie)",
          code: "taxMath.getMinHealthThresholdLinearMonthly()",
          value: formatPLN(taxMath.getMinHealthThresholdLinearMonthly()),
        },
        {
          label: "Próg dochodu dla minimalnej składki liniowej (rocznie)",
          code: "taxMath.getMinHealthThresholdLinearAnnual()",
          value: formatPLN(taxMath.getMinHealthThresholdLinearAnnual()),
        },
      ]),
    );

    const footnote = document.createElement("p");
    footnote.className = "info-modal-footnote";
    footnote.textContent = `Wszystkie wartości zdefiniowane są w pliku taxConstants.js. Stan prawny obowiązujący od ${TAX_CONSTANTS.EFFECTIVE_FROM}.`;
    DOM.infoModalContent.appendChild(footnote);

    infoModalBuilt = true;
  }

  function openInfoModal() {
    if (!DOM.infoModal || !DOM.infoModalContent) return;
    if (!infoModalBuilt) {
      buildInfoModalContent();
    }
    if (infoModalCloseTimeout) {
      clearTimeout(infoModalCloseTimeout);
      infoModalCloseTimeout = null;
    }
    DOM.infoModal.hidden = false;
    DOM.infoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lastFocusedBeforeInfoModal = document.activeElement;
    const closeBtn = DOM.infoModal.querySelector(".copy-modal-close");
    requestAnimationFrame(() => {
      DOM.infoModal.classList.add("open");
      if (closeBtn) closeBtn.focus();
    });
  }

  function closeInfoModal() {
    if (!DOM.infoModal || DOM.infoModal.hidden) return;
    DOM.infoModal.classList.remove("open");
    DOM.infoModal.setAttribute("aria-hidden", "true");
    if (!DOM.copyModal || DOM.copyModal.hidden) {
      document.body.style.overflow = "";
    }
    if (infoModalCloseTimeout) clearTimeout(infoModalCloseTimeout);
    infoModalCloseTimeout = setTimeout(() => {
      DOM.infoModal.hidden = true;
      infoModalCloseTimeout = null;
    }, MODAL_TRANSITION_MS);
    if (lastFocusedBeforeInfoModal && lastFocusedBeforeInfoModal.focus) {
      lastFocusedBeforeInfoModal.focus();
    } else if (DOM.infoFab) {
      DOM.infoFab.focus();
    }
  }

  if (DOM.infoFab) {
    DOM.infoFab.addEventListener("click", openInfoModal);
  }

  if (DOM.infoModal) {
    DOM.infoModal.addEventListener("click", (e) => {
      if (
        e.target instanceof Element &&
        e.target.closest("[data-info-modal-close]")
      ) {
        closeInfoModal();
      }
    });
  }

  /* ==================================================
     Chart: total burden vs. revenue + cheapest form by revenue
  ================================================== */
  const SVG_NS = "http://www.w3.org/2000/svg";
  const CHART_SAMPLES = 160;
  const PIT_SERIES_SLOTS = {
    taxScale: 1,
    taxLinear: 2,
    taxLinearIpBox: 4,
    taxScaleJoint: 5,
    taxScaleIpBox: 7,
    taxScaleIpBoxJoint: 8,
  };
  const RYCZALT_SERIES_SLOTS = [3, 6];
  let lastChartArgs = null;
  let chartModel = null;
  let chartHoverIndex = null;

  const compactFormatter = new Intl.NumberFormat("pl-PL", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  function niceCeil(value) {
    if (value <= 0) return 1;
    const exp = Math.pow(10, Math.floor(Math.log10(value)));
    const f = value / exp;
    const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((n) => f <= n);
    return step * exp;
  }

  function niceStep(max, targetTicks) {
    const raw = max / targetTicks;
    const exp = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / exp;
    const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return step * exp;
  }

  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      el.setAttribute(key, String(value));
    });
    if (parent) parent.appendChild(el);
    return el;
  }

  function getChartSeries(args) {
    const series = [];
    const add = (id, slot, dashed) =>
      series.push({ id, label: VARIANT_LABELS[id], slot, dashed: !!dashed });

    add("taxScale", PIT_SERIES_SLOTS.taxScale);
    if (args.jointEnabled) add("taxScaleJoint", PIT_SERIES_SLOTS.taxScaleJoint);
    if (args.ipBoxEnabled) {
      add("taxScaleIpBox", PIT_SERIES_SLOTS.taxScaleIpBox);
      if (args.jointEnabled) {
        add("taxScaleIpBoxJoint", PIT_SERIES_SLOTS.taxScaleIpBoxJoint);
      }
    }
    add("taxLinear", PIT_SERIES_SLOTS.taxLinear);
    if (args.ipBoxEnabled) {
      add("taxLinearIpBox", PIT_SERIES_SLOTS.taxLinearIpBox);
    }
    if (!args.isMultiRate) {
      Array.from(DOM.ryczaltCheckboxes)
        .filter((cb) => cb.checked)
        .forEach((cb, index) => {
          const slots = RYCZALT_SERIES_SLOTS;
          add(cb.dataset.target, slots[index % slots.length], index >= slots.length);
        });
    }
    return series;
  }

  function totalsAtRevenue(args, series, revenue) {
    return computeVariantTotals({
      revenue,
      costs: revenue * args.costRatio,
      ipBoxEnabled: args.ipBoxEnabled,
      ipBoxCoeff: args.ipBoxCoeff,
      jointEnabled: args.jointEnabled,
      spouseIncome: args.spouseIncome,
      ryczaltIds: series.filter((s) => s.id.startsWith("ryczalt")).map((s) => s.id),
    });
  }

  function cheapestId(series, totals) {
    let bestId = null;
    series.forEach((s) => {
      if (bestId === null || totals[s.id] < totals[bestId]) bestId = s.id;
    });
    return bestId;
  }

  /* Find the revenue at which the cheapest form switches (bisection). */
  function refineSwitchPoint(args, series, lo, hi, loId) {
    for (let i = 0; i < 40 && hi - lo > 1; i++) {
      const mid = (lo + hi) / 2;
      const id = cheapestId(series, totalsAtRevenue(args, series, mid));
      if (id === loId) lo = mid;
      else hi = mid;
    }
    return hi;
  }

  function buildChartModel(args) {
    const series = getChartSeries(args);
    const xMax = niceCeil(Math.max(args.revenue * 2, 100000));
    const xs = [];
    const values = {};
    series.forEach((s) => (values[s.id] = []));
    for (let i = 0; i <= CHART_SAMPLES; i++) {
      const x = (xMax * i) / CHART_SAMPLES;
      const totals = totalsAtRevenue(args, series, x);
      xs.push(x);
      series.forEach((s) => values[s.id].push(totals[s.id]));
    }

    const segments = [];
    let currentId = null;
    xs.forEach((x, i) => {
      const totalsHere = {};
      series.forEach((s) => (totalsHere[s.id] = values[s.id][i]));
      const id = cheapestId(series, totalsHere);
      if (id !== currentId) {
        const from =
          currentId === null
            ? 0
            : refineSwitchPoint(args, series, xs[i - 1], x, currentId);
        if (segments.length) segments[segments.length - 1].to = from;
        segments.push({ id, from, to: xMax });
        currentId = id;
      }
    });

    const yMaxRaw = Math.max(
      1,
      ...series.map((s) => Math.max(...values[s.id])),
    );
    return {
      args,
      series,
      xs,
      values,
      xMax,
      yMax: niceCeil(yMaxRaw),
      segments,
      currentTotals: totalsAtRevenue(args, series, args.revenue),
    };
  }

  function seriesColor(slot) {
    return `var(--series-${slot})`;
  }

  function renderLegend(model) {
    DOM.chartLegend.textContent = "";
    model.series.forEach((s) => {
      const item = document.createElement("span");
      item.className = "chart-legend-item";
      const key = document.createElement("span");
      key.className = "chart-key" + (s.dashed ? " is-dashed" : "");
      key.style.setProperty("--key-color", seriesColor(s.slot));
      item.appendChild(key);
      item.appendChild(document.createTextNode(s.label));
      DOM.chartLegend.appendChild(item);
    });
  }

  function renderWinners(model) {
    DOM.winnerStrip.textContent = "";
    DOM.winnerList.textContent = "";
    const bySlot = {};
    model.series.forEach((s) => (bySlot[s.id] = s));
    const revenue = model.args.revenue;

    model.segments.forEach((seg, index) => {
      const s = bySlot[seg.id];
      const width = ((seg.to - seg.from) / model.xMax) * 100;
      const block = document.createElement("span");
      block.className = "winner-strip-seg" + (s.dashed ? " is-dashed" : "");
      block.style.width = `${width}%`;
      block.style.setProperty("--seg-color", seriesColor(s.slot));
      DOM.winnerStrip.appendChild(block);

      const isLast = index === model.segments.length - 1;
      const li = document.createElement("li");
      const isCurrent =
        revenue >= seg.from && (revenue < seg.to || (isLast && revenue <= seg.to));
      li.className = "winner-item" + (isCurrent ? " is-current" : "");
      const key = document.createElement("span");
      key.className = "chart-key" + (s.dashed ? " is-dashed" : "");
      key.style.setProperty("--key-color", seriesColor(s.slot));
      const range = document.createElement("span");
      range.className = "winner-range";
      const fromTxt = formatWholePLN(Math.round(seg.from / 100) * 100);
      const toTxt = formatWholePLN(Math.round(seg.to / 100) * 100);
      if (model.segments.length === 1) range.textContent = "w całym zakresie";
      else if (index === 0) range.textContent = `do ${toTxt}`;
      else if (isLast) range.textContent = `od ${fromTxt}`;
      else range.textContent = `${fromTxt} – ${toTxt}`;
      const name = document.createElement("span");
      name.className = "winner-name";
      name.textContent = s.label;
      li.append(key, range, name);
      if (isCurrent) {
        const you = document.createElement("span");
        you.className = "winner-you";
        you.textContent = "Twój przychód";
        li.appendChild(you);
      }
      DOM.winnerList.appendChild(li);
    });
  }

  function drawChart(model) {
    const svg = DOM.chartSvg;
    svg.textContent = "";
    const width = Math.max(DOM.chartFrame.clientWidth || 0, 280) || 640;
    const height = width < 520 ? 220 : 260;
    const m = { top: 20, right: 16, bottom: 30, left: 58 };
    const iw = width - m.left - m.right;
    const ih = height - m.top - m.bottom;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    const sx = (x) => m.left + (x / model.xMax) * iw;
    const sy = (y) => m.top + ih - (y / model.yMax) * ih;
    model.sx = sx;
    model.sy = sy;
    model.inner = { left: m.left, right: m.left + iw, top: m.top, bottom: m.top + ih };

    const grid = svgEl("g", { class: "chart-grid" }, svg);
    const yStep = niceStep(model.yMax, 4);
    for (let y = 0; y <= model.yMax + 1e-6; y += yStep) {
      svgEl("line", { x1: m.left, x2: m.left + iw, y1: sy(y), y2: sy(y), class: y === 0 ? "chart-baseline" : "chart-gridline" }, grid);
      const t = svgEl("text", { x: m.left - 10, y: sy(y), class: "chart-tick chart-tick-y" }, grid);
      t.textContent = y === 0 ? "0" : compactFormatter.format(y);
    }
    const xStep = niceStep(model.xMax, width < 520 ? 3 : 5);
    for (let x = 0; x <= model.xMax + 1e-6; x += xStep) {
      const t = svgEl("text", { x: sx(x), y: m.top + ih + 20, class: "chart-tick chart-tick-x" }, grid);
      t.textContent = x === 0 ? "0 zł" : compactFormatter.format(x);
    }

    const currentX = sx(model.args.revenue);
    const marker = svgEl("g", { class: "chart-current" }, svg);
    svgEl("line", { x1: currentX, x2: currentX, y1: m.top - 6, y2: m.top + ih }, marker);
    const markerLabel = svgEl("text", {
      x: currentX,
      y: m.top - 8,
      class: "chart-current-label",
      "text-anchor": currentX > m.left + iw - 60 ? "end" : currentX < m.left + 60 ? "start" : "middle",
    }, marker);
    markerLabel.textContent = "Twój przychód";

    const lines = svgEl("g", { class: "chart-lines" }, svg);
    model.series.forEach((s) => {
      const d = model.xs
        .map((x, i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(model.values[s.id][i]).toFixed(1)}`)
        .join("");
      const path = svgEl("path", { d, class: "chart-line" + (s.dashed ? " is-dashed" : "") }, lines);
      path.style.stroke = seriesColor(s.slot);
    });

    const dots = svgEl("g", { class: "chart-dots" }, svg);
    model.series.forEach((s) => {
      const dot = svgEl("circle", { cx: currentX, cy: sy(model.currentTotals[s.id]), r: 4.5, class: "chart-dot" }, dots);
      dot.style.fill = seriesColor(s.slot);
    });

    const hover = svgEl("g", { class: "chart-hover", visibility: "hidden" }, svg);
    model.hoverLine = svgEl("line", { y1: m.top, y2: m.top + ih }, hover);
    model.hoverDots = model.series.map((s) => {
      const dot = svgEl("circle", { r: 4.5, class: "chart-dot" }, hover);
      dot.style.fill = seriesColor(s.slot);
      return dot;
    });
    model.hoverGroup = hover;

    svgEl("rect", { x: m.left, y: m.top, width: iw, height: ih, class: "chart-hit" }, svg);
  }

  function showChartHover(index) {
    const model = chartModel;
    if (!model || !model.hoverGroup) return;
    chartHoverIndex = Math.max(0, Math.min(model.xs.length - 1, index));
    const x = model.xs[chartHoverIndex];
    const px = model.sx(x);
    model.hoverGroup.setAttribute("visibility", "visible");
    model.hoverLine.setAttribute("x1", px);
    model.hoverLine.setAttribute("x2", px);
    model.series.forEach((s, i) => {
      model.hoverDots[i].setAttribute("cx", px);
      model.hoverDots[i].setAttribute("cy", model.sy(model.values[s.id][chartHoverIndex]));
    });

    const tip = DOM.chartTooltip;
    tip.textContent = "";
    const head = document.createElement("p");
    head.className = "chart-tooltip-head";
    head.textContent = `Przychód ${formatWholePLN(x)}`;
    tip.appendChild(head);
    model.series
      .map((s) => ({ s, v: model.values[s.id][chartHoverIndex] }))
      .sort((a, b) => a.v - b.v)
      .forEach(({ s, v }) => {
        const row = document.createElement("p");
        row.className = "chart-tooltip-row";
        const key = document.createElement("span");
        key.className = "chart-key" + (s.dashed ? " is-dashed" : "");
        key.style.setProperty("--key-color", seriesColor(s.slot));
        const val = document.createElement("strong");
        val.textContent = formatWholePLN(v);
        const name = document.createElement("span");
        name.textContent = s.label;
        row.append(key, val, name);
        tip.appendChild(row);
      });
    tip.hidden = false;
    const frameWidth = DOM.chartFrame.clientWidth || 0;
    const tipWidth = tip.offsetWidth || 220;
    const left = px + 14 + tipWidth > frameWidth ? px - 14 - tipWidth : px + 14;
    tip.style.left = `${Math.max(0, left)}px`;
  }

  function hideChartHover() {
    chartHoverIndex = null;
    if (chartModel && chartModel.hoverGroup) {
      chartModel.hoverGroup.setAttribute("visibility", "hidden");
    }
    DOM.chartTooltip.hidden = true;
  }

  function renderChart(args) {
    if (!DOM.chartSvg) return;
    const hasData = args.revenue > 0;
    const costRatio = args.revenue > 0 ? args.costs / args.revenue : 0;
    lastChartArgs = { ...args, costRatio };
    DOM.chartFrame.classList.toggle("is-empty", !hasData);
    DOM.chartWinners.hidden = !hasData;
    DOM.chartLegend.hidden = !hasData;
    if (!hasData) {
      chartModel = null;
      DOM.chartSvg.textContent = "";
      DOM.chartMeta.textContent = "";
      hideChartHover();
      return;
    }

    chartModel = buildChartModel(lastChartArgs);
    DOM.chartMeta.textContent =
      (costRatio > 0
        ? `Koszty: ${formatPercent1(costRatio)} przychodu`
        : "Bez kosztów") + (args.isMultiRate ? ", bez ryczałtu" : "");
    renderLegend(chartModel);
    drawChart(chartModel);
    renderWinners(chartModel);
    if (chartHoverIndex !== null) showChartHover(chartHoverIndex);
  }

  if (DOM.chartSvg) {
    const indexFromPointer = (e) => {
      if (!chartModel || !chartModel.inner) return null;
      const rect = DOM.chartSvg.getBoundingClientRect();
      const viewWidth = DOM.chartSvg.viewBox.baseVal.width || rect.width;
      const x = (e.clientX - rect.left) * (rect.width ? viewWidth / rect.width : 1);
      const ratio = (x - chartModel.inner.left) / (chartModel.inner.right - chartModel.inner.left);
      return Math.round(ratio * CHART_SAMPLES);
    };
    DOM.chartSvg.addEventListener("pointermove", (e) => {
      const index = indexFromPointer(e);
      if (index === null || index < 0 || index > CHART_SAMPLES) {
        hideChartHover();
        return;
      }
      showChartHover(index);
    });
    DOM.chartSvg.addEventListener("pointerleave", hideChartHover);
    DOM.chartSvg.addEventListener("blur", hideChartHover);
    DOM.chartSvg.addEventListener("keydown", (e) => {
      if (!chartModel) return;
      const start =
        chartHoverIndex === null
          ? Math.round((lastChartArgs.revenue / chartModel.xMax) * CHART_SAMPLES)
          : chartHoverIndex;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowRight") showChartHover(start + (chartHoverIndex === null ? 0 : step));
      else if (e.key === "ArrowLeft") showChartHover(start - (chartHoverIndex === null ? 0 : step));
      else if (e.key === "Escape") hideChartHover();
      else return;
      e.preventDefault();
    });

    if (typeof ResizeObserver !== "undefined") {
      let resizeFrame = null;
      let lastWidth = 0;
      new ResizeObserver(() => {
        const width = DOM.chartFrame.clientWidth;
        if (width === lastWidth || !chartModel) return;
        lastWidth = width;
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          drawChart(chartModel);
          if (chartHoverIndex !== null) showChartHover(chartHoverIndex);
        });
      }).observe(DOM.chartFrame);
    }
  }

  /* ==================================================
     Input period switch (rocznie / miesięcznie)
  ================================================== */
  DOM.inputPeriodRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      calculate();
      if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
    });
  });

  /* ==================================================
     Shareable link (state lives in the URL hash)
  ================================================== */
  function roundForUrl(value) {
    return String(taxMath.round2(value));
  }

  function buildShareUrl() {
    const params = new URLSearchParams();
    const factor = getPeriodFactor();
    if (factor === 12) params.set("okres", "m");
    const revenue = parsePLN(DOM.revenueInput.value);
    const costs = parsePLN(DOM.costsInput.value);
    if (revenue) params.set("p", roundForUrl(revenue));
    if (costs) params.set("k", roundForUrl(costs));
    if (isIpBoxEnabled()) params.set("ipbox", DOM.ipBoxCoeffInput.value || "0");
    if (isJointTaxationEnabled()) {
      params.set("malzonek", roundForUrl(parsePLN(DOM.spouseIncomeInput.value)));
    }
    const rates = Array.from(DOM.ryczaltCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.dataset.target.replace("ryczalt", ""));
    if (rates.length) params.set("ryczalt", rates.join(","));
    if (DOM.multipleRatesToggle.checked) {
      const split = [];
      document.querySelectorAll(".rate-input.show").forEach((input) => {
        const value = parsePLN(input.value);
        if (value) split.push(`${input.dataset.for.replace("ryczalt", "")}:${roundForUrl(value)}`);
      });
      params.set("podzial", split.join(",") || "1");
    }
    const url = new URL(window.location.href);
    url.hash = params.toString();
    return url.toString();
  }

  function setRadio(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio && !radio.checked) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function applyStateFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash || !/(^|&)(p|k|ryczalt)=/.test(hash)) return false;
    const params = new URLSearchParams(hash);
    const num = (key) => {
      const value = parseFloat(params.get(key));
      return Number.isFinite(value) && value >= 0 ? value : null;
    };

    setRadio("inputPeriod", params.get("okres") === "m" ? "month" : "year");
    if (num("p") !== null) DOM.revenueInput.value = formatPLN(num("p"));
    if (num("k") !== null) DOM.costsInput.value = formatPLN(num("k"));

    if (params.has("ipbox") && num("ipbox") !== null) {
      setRadio("ipBoxEnabled", "yes");
      DOM.ipBoxCoeffInput.value = String(Math.min(100, num("ipbox")));
      syncIpBoxRange();
    }
    if (params.has("malzonek")) {
      setRadio("jointTaxation", "yes");
      DOM.spouseIncomeInput.value = formatPLN(num("malzonek") || 0);
    }

    const rates = (params.get("ryczalt") || "").split(",").filter(Boolean);
    DOM.ryczaltCheckboxes.forEach((cb) => {
      const shouldCheck = rates.includes(cb.dataset.target.replace("ryczalt", ""));
      if (cb.checked !== shouldCheck) {
        cb.checked = shouldCheck;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    if (params.has("podzial")) {
      DOM.multipleRatesToggle.checked = true;
      DOM.multipleRatesToggle.dispatchEvent(new Event("change", { bubbles: true }));
      params
        .get("podzial")
        .split(",")
        .forEach((pair) => {
          const [key, value] = pair.split(":");
          const input = document.querySelector(`.rate-input.show[data-for="ryczalt${key}"]`);
          const amount = parseFloat(value);
          if (input && Number.isFinite(amount)) input.value = formatPLN(amount);
        });
      updateRemainingRevenue();
    }
    calculate();
    return true;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through to the legacy path */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  }

  if (DOM.shareBtn) {
    DOM.shareBtn.addEventListener("click", async () => {
      const url = buildShareUrl();
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", url);
      }
      if (await copyText(url)) {
        showCopyToast("Link skopiowany", "Otwórz go, aby wrócić do tych danych");
      }
    });
  }

  /* ==================================================
     Theme toggle (system default, manual override stored)
  ================================================== */
  function getEffectiveTheme() {
    const explicit = document.documentElement.dataset.theme;
    if (explicit === "light" || explicit === "dark") return explicit;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener("click", () => {
      const next = getEffectiveTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("tax-calc-theme", next);
      } catch {
        /* storage unavailable - theme lasts for this visit only */
      }
    });
  }

  /* ==================================================
     Mobile summary bar (visible while the result is off-screen)
  ================================================== */
  if (DOM.mobileSummary) {
    DOM.mobileSummary.addEventListener("click", () => {
      DOM.bestCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if (typeof IntersectionObserver !== "undefined") {
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            DOM.mobileSummary.classList.toggle("is-hidden", entry.isIntersecting);
          });
        },
        { threshold: 0.15 },
      ).observe(DOM.bestCard);
    }
  }

  /* ==================================================
     Initial paint — set up empty state correctly
  ================================================== */
  syncIpBoxRange();
  updateConditionalRowsVisibility();
  // hide all ryczałt result rows by default
  RYCZALT_VARIANT_IDS.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      const group = input.closest(".input-group");
      if (group) group.style.display = "none";
    }
  });
  // run an initial calculation so the income field shows 0,00 and rank state is stable
  calculate();
  applyStateFromHash();
})();
