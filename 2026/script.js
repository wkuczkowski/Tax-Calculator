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
    ipBoxEdit: document.getElementById("ipBoxEdit"),
    ipBoxContainer: document.getElementById("ipBoxContainer"),
    ipBoxEnabledRadios: document.querySelectorAll('input[name="ipBoxEnabled"]'),
    ipBoxReveal: document.getElementById("ipBoxReveal"),
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
    copyFab: document.getElementById("copyFab"),
    copyModal: document.getElementById("copyModal"),
    copyModalCard: document.querySelector(".copy-modal-card"),
    copyModalCopy: document.getElementById("copyModalCopy"),
    copyPreview: document.getElementById("copyPreview"),
    copyToast: document.getElementById("copyToast"),
    infoFab: document.getElementById("infoFab"),
    infoModal: document.getElementById("infoModal"),
    infoModalContent: document.getElementById("infoModalContent"),
    bestCard: document.getElementById("bestCard"),
    bestCardTitle: document.getElementById("bestCardTitle"),
    bestCardAmount: document.getElementById("bestCardAmount"),
    bestCardSavings: document.getElementById("bestCardSavings"),
    breakdownDetails: document.getElementById("breakdownDetails"),
    breakdownPre: document.getElementById("breakdownPre"),
  };

  // Data weryfikacji stanu prawnego (etykieta w nagłówku, eksport, Założenia)
  const LEGAL_STATUS_DATE = "24.09.2026";

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

  const RATE_INPUT_MIN_WIDTH = 96;
  const RATE_INPUT_MAX_WIDTH = 190;
  const RATE_INPUT_CHAR_WIDTH = 8.5;
  const RATE_INPUT_HORIZONTAL_SPACE = 30;

  function resizeRateInput(input) {
    if (!input) return;

    const text = input.value || input.placeholder || "";
    const contentWidth =
      Array.from(text).length * RATE_INPUT_CHAR_WIDTH +
      RATE_INPUT_HORIZONTAL_SPACE;
    const width = Math.min(
      RATE_INPUT_MAX_WIDTH,
      Math.max(RATE_INPUT_MIN_WIDTH, Math.ceil(contentWidth)),
    );

    input.style.setProperty("--rate-input-width", `${width}px`);
  }

  function resetRateInputWidth(input) {
    if (!input) return;
    input.style.removeProperty("--rate-input-width");
  }

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
     Shared Variables & Calculation Value Getters/Setters
  ================================================== */
  const contributionValues = {
    healthLinear: 0,
    healthRyczalt: 0,
    healthScale: 0,
    healthLinearDeduction: 0,
    healthRyczaltDeduction: 0,
  };

  function setCalculationValue(id, value) {
    contributionValues[id] = value;
  }
  function getCalculationValue(id) {
    return contributionValues[id];
  }

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
     Tax Calculation Functions
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

  /* Rozliczenie wspólne: wynik ma być porównywalny z wariantami
     indywidualnymi (które obejmują tylko podatnika). Dlatego od PIT
     wspólnego pary odejmujemy PIT, który małżonek zapłaciłby sam wg skali.
     Danina małżonka jest taka sama w obu scenariuszach, więc jej nie
     wliczamy. Wynik może być ujemny, gdy wspólne rozliczenie obniża
     podatek małżonka bardziej, niż wynosi podatek podatnika. */
  function calculateJointScalePitAttributed(income, spouseIncome) {
    return taxMath.round2(
      calculateJointScalePitOnly(income, spouseIncome) -
        calculateScalePitOnly(spouseIncome),
    );
  }

  function calculateJointScaleTaxTotal(income, spouseIncome, healthScale) {
    return taxMath.round2(
      calculateJointScalePitAttributed(income, spouseIncome) +
        calculateSolidarityLevy(income) +
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
        calculateJointScalePitAttributed(regularIncome, spouseIncome) +
        calculateSolidarityLevy(regularIncome) +
        healthScale,
    );
  }

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

  /* Art. 11 ust. 3 ustawy o ryczałcie: przy przychodach opodatkowanych
     różnymi stawkami odliczenie dzieli się w stosunku, w jakim przychód
     danej stawki pozostaje do ogólnej kwoty przychodów. */
  function getRyczaltDeductionShare(deduction, rateRevenue, totalRevenue) {
    if (totalRevenue <= 0) return 0;
    return taxMath.round2((deduction * rateRevenue) / totalRevenue);
  }

  /* 8,5% do 100 000 zł i 12,5% od nadwyżki to dwie różne stawki, więc
     odliczenie dzielimy między nie proporcjonalnie do przychodu. */
  function getRyczalt85125Details(rateRevenue, deduction) {
    const threshold = TAX_CONSTANTS.RYCZALT_8_5_THRESHOLD;
    const revenue85 = Math.min(Math.max(rateRevenue, 0), threshold);
    const revenue125 = Math.max(rateRevenue - threshold, 0);
    const deduction85 =
      rateRevenue > threshold
        ? getRyczaltDeductionShare(deduction, revenue85, rateRevenue)
        : deduction;
    const deduction125 = taxMath.round2(deduction - deduction85);
    const base85 = Math.max(revenue85 - deduction85, 0);
    const base125 = Math.max(revenue125 - deduction125, 0);
    const tax85 = taxMath.round2(base85 * TAX_CONSTANTS.RYCZALT_RATE_8_5);
    const tax125 = taxMath.round2(base125 * TAX_CONSTANTS.RYCZALT_RATE_12_5);

    return {
      threshold,
      revenue85,
      revenue125,
      deduction85,
      deduction125,
      base85,
      base125,
      tax85,
      tax125,
      tax: taxMath.round2(tax85 + tax125),
    };
  }

  function calculateRyczaltRateTax(rateId, rateRevenue, deduction) {
    if (rateId === "ryczalt8_5_12_5") {
      return getRyczalt85125Details(rateRevenue, deduction).tax;
    }
    return Math.max(rateRevenue - deduction, 0) * RYCZALT_RATES[rateId];
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

  /* Przychody przypisane stawkom w trybie „Wiele stawek" (tylko widoczne
     pola) oraz ich suma — jedno źródło dla wyniku, sumy i szczegółów. */
  function getAllocatedRevenues() {
    const revenues = {};
    let total = 0;
    document.querySelectorAll(".rate-input.show").forEach((input) => {
      const value = parsePLN(input.value) || 0;
      revenues[input.dataset.for] = value;
      total += value;
    });
    return { revenues, total };
  }

  function updateRemainingRevenue() {
    const totalRevenue = parsePLN(DOM.revenueInput.value);
    const usedRevenue = getAllocatedRevenues().total;
    const difference = usedRevenue - totalRevenue;
    if (!DOM.revenueInfoText) return;
    if (difference > 0) {
      DOM.revenueInfoText.innerHTML = `<span style="color: var(--error)">Przekroczono przychód o ${formatPLN(
        difference,
      )}</span>`;
    } else {
      const remainingRevenue = totalRevenue - usedRevenue;
      DOM.revenueInfoText.textContent = `Przychód do rozdysponowania: ${formatPLN(
        remainingRevenue,
      )}`;
    }
  }

  /* ==================================================
     Main Calculation Function
  ================================================== */
  function calculate() {
    const rawRevenue = DOM.revenueInput.value;
    const rawCosts = DOM.costsInput.value;
    const revenue =
      parseFloat(rawRevenue.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const costs =
      parseFloat(rawCosts.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const income = revenue - costs;

    document.getElementById("income").value = formatPLN(income);

    const ipBoxCoeff = parseFloat(DOM.ipBoxCoeffInput.value) / 100;
    const healthContribLimit = TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT;

    const healthLinear = taxMath.calculateHealthLinear(income);
    setCalculationValue("healthLinear", healthLinear);

    const healthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(revenue);
    setCalculationValue("healthRyczalt", healthRyczalt);

    const healthScale = taxMath.calculateHealthScale(income);
    setCalculationValue("healthScale", healthScale);
    const healthLinearDeduction = Math.min(healthLinear, healthContribLimit);
    setCalculationValue("healthLinearDeduction", healthLinearDeduction);

    const isMultipleRates = DOM.multipleRatesToggle.checked;
    const { revenues: allocatedRevenues, total: totalAllocatedRevenue } =
      isMultipleRates
        ? getAllocatedRevenues()
        : { revenues: {}, total: 0 };

    let healthRyczaltDeduction;
    if (isMultipleRates) {
      const ratesHealthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(
        totalAllocatedRevenue,
      );
      healthRyczaltDeduction =
        ratesHealthRyczalt * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR;
    } else {
      healthRyczaltDeduction =
        healthRyczalt * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR;
    }
    setCalculationValue("healthRyczaltDeduction", healthRyczaltDeduction);

    const jointTaxationEnabled =
      document.querySelector('input[name="jointTaxation"]:checked').value ===
      "yes";
    const spouseIncome = jointTaxationEnabled
      ? parsePLN(document.getElementById("spouseIncome").value)
      : 0;

    const taxScale = calculateScaleTaxTotal(
      income,
      getCalculationValue("healthScale"),
    );
    document.getElementById("taxScale").value = formatPLN(taxScale);
    if (jointTaxationEnabled) {
      const taxScaleJoint = calculateJointScaleTaxTotal(
        income,
        spouseIncome,
        getCalculationValue("healthScale"),
      );
      document.getElementById("taxScaleJoint").value = formatPLN(taxScaleJoint);
    }

    const taxLinear = calculateLinearTaxTotal(
      income,
      healthLinearDeduction,
      healthLinear,
    );
    document.getElementById("taxLinear").value = formatPLN(taxLinear);

    const ipBoxEnabled = isIpBoxEnabled();
    if (ipBoxEnabled) {
      const taxScaleIpBox = calculateScaleIpBoxTaxTotal(
        income,
        ipBoxCoeff,
        getCalculationValue("healthScale"),
      );
      document.getElementById("taxScaleIpBox").value = formatPLN(taxScaleIpBox);
      if (jointTaxationEnabled) {
        const taxScaleIpBoxJoint = calculateJointScaleIpBoxTaxTotal(
          income,
          spouseIncome,
          ipBoxCoeff,
          getCalculationValue("healthScale"),
        );
        document.getElementById("taxScaleIpBoxJoint").value =
          formatPLN(taxScaleIpBoxJoint);
      } else {
        document.getElementById("taxScaleIpBoxJoint").value = "";
      }

      const taxLinearIpBox = calculateLinearIpBoxTaxTotal(
        income,
        ipBoxCoeff,
        healthLinearDeduction,
        healthLinear,
      );
      document.getElementById("taxLinearIpBox").value =
        formatPLN(taxLinearIpBox);
    } else {
      clearIpBoxResultFields();
    }

    /* Ryczałt: w trybie jednej stawki każdy wariant to alternatywa dla
       całego przychodu (pełne odliczenie + składka zdrowotna). W trybie
       „Wiele stawek" jedno odliczenie dzielimy proporcjonalnie między
       stawki, a składka zdrowotna jest doliczana raz w sumie. */
    RYCZALT_VARIANT_IDS.forEach((rateId) => {
      const rateRevenue = isMultipleRates
        ? allocatedRevenues[rateId] || 0
        : revenue;
      const deduction = isMultipleRates
        ? getRyczaltDeductionShare(
            healthRyczaltDeduction,
            rateRevenue,
            totalAllocatedRevenue,
          )
        : healthRyczaltDeduction;
      let value = calculateRyczaltRateTax(rateId, rateRevenue, deduction);
      if (!isMultipleRates) value += healthRyczalt;
      document.getElementById(rateId).value = formatPLN(value);
    });

    updateRatesTotal();
    updateRevenueTags(revenue, allocatedRevenues);
    rankAndSummarize(revenue, income);
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

    const totalAllocatedRevenue = getAllocatedRevenues().total;

    const ratesHealthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(
      totalAllocatedRevenue,
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
  function updateRevenueTags(revenue, allocatedRevenues) {
    RYCZALT_VARIANT_IDS.forEach((id) => {
      const row = document.querySelector(`.results-row[data-variant="${id}"]`);
      if (!row) return;
      const tagEl = row.querySelector("[data-revenue-tag]");
      if (!tagEl) return;
      if (DOM.multipleRatesToggle.checked) {
        const allocated = allocatedRevenues[id] || 0;
        tagEl.textContent = allocated
          ? `od ${formatPLN(allocated)} przychodu`
          : "";
      } else {
        tagEl.textContent = revenue ? `od ${formatPLN(revenue)} przychodu` : "";
      }
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

    visibleVariants
      .sort((a, b) => a.value - b.value || a.index - b.index)
      .forEach(({ row }) => {
        container.appendChild(row);
      });
  }

  /* ==================================================
     Rank visible variants & populate the best card
  ================================================== */
  function rankAndSummarize(revenue, income) {
    const isMultiRate = !!(
      DOM.multipleRatesToggle && DOM.multipleRatesToggle.checked
    );
    const variants = [];

    const collectVariant = (id) => {
      const variant = getVisibleResultVariant(id);
      if (!variant) return;
      const { value } = variant;
      // joint variants may be negative (see calculateJointScalePitAttributed)
      if (value === 0) return;
      variants.push(variant);
    };

    PIT_VARIANT_IDS.forEach(collectVariant);

    if (isMultiRate) {
      // in multi-rate mode the per-rate field shows only that rate's PIT
      // share (without health). The user-meaningful ryczałt cost is the
      // aggregated "Łącznie PIT + składka zdrowotna". Compare that as one option,
      // but only once the user actually allocated some revenue to a rate.
      const allocatedRevenue = getAllocatedRevenues().total;
      const ratesTotalVariant = getVisibleRatesTotalVariant();
      if (
        ratesTotalVariant &&
        allocatedRevenue > 0 &&
        ratesTotalVariant.value > 0
      ) {
        variants.push(ratesTotalVariant);
      }
    } else {
      RYCZALT_VARIANT_IDS.forEach(collectVariant);
    }

    document
      .querySelectorAll(".results-row, #ratesTotal")
      .forEach((r) => r.classList.remove("is-best"));
    document
      .querySelectorAll(".results-row [data-bar]")
      .forEach((b) => (b.style.width = "0%"));

    sortPitComparisonRows();

    const meaningful = revenue > 0 || income !== 0;

    if (!variants.length || !meaningful) {
      DOM.bestCard.dataset.state = "empty";
      DOM.bestCardTitle.textContent = "—";
      DOM.bestCardAmount.textContent = "—";
      DOM.bestCardSavings.textContent =
        "Wprowadź dane, aby zobaczyć najkorzystniejszy wariant.";
      return;
    }

    const sorted = [...variants].sort((a, b) => a.value - b.value);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const second = sorted[1];

    best.row.classList.add("is-best");

    const maxVal = Math.max(...variants.map((v) => v.value), 1);
    variants.forEach((v) => {
      const bar = v.row.querySelector("[data-bar]");
      if (!bar) return;
      const pct = maxVal > 0 ? Math.max(v.value / maxVal, 0) * 100 : 0;
      bar.style.width = pct.toFixed(1) + "%";
    });

    DOM.bestCard.dataset.state = "ranked";
    DOM.bestCardTitle.textContent = VARIANT_LABELS[best.id] || best.id;
    DOM.bestCardAmount.textContent = formatPLN(best.value);

    if (second && second.value > best.value) {
      const delta = second.value - best.value;
      DOM.bestCardSavings.innerHTML =
        `<strong>−${formatPLN(delta)}</strong>` +
        ` vs. drugi najlepszy wariant (${VARIANT_LABELS[second.id] || second.id})`;
    } else if (worst && worst.value > best.value) {
      const delta = worst.value - best.value;
      DOM.bestCardSavings.innerHTML = `<strong>−${formatPLN(delta)}</strong> vs. najwyższy wariant`;
    } else {
      DOM.bestCardSavings.textContent =
        "Tylko jeden widoczny wariant — wybierz więcej, aby porównać.";
    }
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
    document.querySelector(".multiple-rates-revenue-info").style.display =
      "none";
    document.querySelector(".multiple-rates-wrapper").style.justifyContent =
      "flex-end";
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
        resetRateInputWidth(rateInput);
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
    const revenueInfo = document.querySelector(".multiple-rates-revenue-info");
    const wrapper = document.querySelector(".multiple-rates-wrapper");

    revenueInfo.style.display = isEnabled ? "block" : "none";
    wrapper.style.justifyContent = isEnabled ? "space-between" : "flex-end";

    rateInputs.forEach((input) => {
      const wrap = input.closest(".checkbox-wrapper");
      const checkbox = wrap.querySelector('input[type="checkbox"]');
      const targetId = checkbox.dataset.target;
      const targetInput = document.getElementById(targetId);
      if (isEnabled && checkbox.checked) {
        input.classList.add("show");
        input.value = "";
        resizeRateInput(input);
        targetInput.value = formatPLN(0);
      } else {
        input.classList.remove("show");
        input.value = "";
        resetRateInputWidth(input);
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
          resizeRateInput(rateInput);
          targetInput.value = formatPLN(0);
        }
      } else {
        targetGroup.style.display = "none";
        rateInput.classList.remove("show");
        rateInput.value = "";
        resetRateInputWidth(rateInput);
        targetInput.value = formatPLN(0);
      }

      calculate();
      if (multipleRatesEnabled) updateRemainingRevenue();
    });
  });

  document.querySelectorAll(".rate-input").forEach((input) => {
    resizeRateInput(input);
    input.addEventListener("input", (e) => {
      resizeRateInput(e.target);
      if (!e.target.value) return;
      const isValid = validateInput(e.target.value, e.target.dataset.for);
      if (isValid) calculate();
      if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
    });
    input.addEventListener("blur", (e) => {
      if (e.target.value) {
        e.target.value = formatPLN(parsePLN(e.target.value));
        resizeRateInput(e.target);
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
     Clipboard / Breakdown text builders
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

  function getScalePitBracketLines(pitDetails, indent) {
    const taxFree = TAX_CONSTANTS.TAX_FREE_AMOUNT;
    const threshold12 = TAX_CONSTANTS.TAX_THRESHOLD_12;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;

    let text = `${indent}Kwota wolna (do ${formatNumberPL(
      taxFree,
    )}): ${formatNumberPL(pitDetails.inTaxFree)} × 0% = 0,00 zł\n`;

    if (pitDetails.in12Bracket > 0) {
      text += `${indent}I próg ${formatPercentPL(rate12)} (${formatNumberPL(
        taxFree + 1,
      )} - ${formatNumberPL(threshold12)}): ${formatNumberPL(
        pitDetails.in12Bracket,
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(pitDetails.tax12)}\n`;
    }

    if (pitDetails.in32Bracket > 0) {
      text += `${indent}II próg ${formatPercentPL(rate32)} (${formatNumberPL(
        threshold12 + 1,
      )} i więcej): ${formatNumberPL(
        pitDetails.in32Bracket,
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(pitDetails.tax32)}\n`;
    }

    return text;
  }

  /* Wspólna część breakdownu rozliczenia wspólnego: PIT wspólny pary,
     PIT małżonka przy rozliczeniu indywidualnym i różnica przypisana
     podatnikowi (zob. calculateJointScalePitAttributed). */
  function getJointPitAttributionBreakdown(
    scaleIncome,
    spouseIncome,
    scaleIncomeLabel,
  ) {
    const jointIncome = taxMath.round2(scaleIncome + spouseIncome);
    const halfIncome = taxMath.round2(jointIncome / 2);
    const halfPitDetails = getScalePitDetails(halfIncome);
    const jointPit = taxMath.round2(halfPitDetails.totalPit * 2);
    const spousePitDetails = getScalePitDetails(spouseIncome);
    const attributedPit = taxMath.round2(jointPit - spousePitDetails.totalPit);

    let text = `  Dochód małżonka: ${formatNumberPL(spouseIncome)}\n`;
    text += `  ${scaleIncomeLabel}: ${formatNumberPL(
      scaleIncome,
    )} + ${formatNumberPL(spouseIncome)} = ${formatNumberPL(jointIncome)}\n`;
    text += `  Połowa łącznego dochodu: ${formatNumberPL(
      jointIncome,
    )} : 2 = ${formatNumberPL(halfIncome)}\n`;

    text += `\n  1) PIT wspólny pary (od połowy łącznego dochodu × 2):\n`;
    text += getScalePitBracketLines(halfPitDetails, "    ");
    text += `    Podatek od połowy dochodu: ${formatNumberPL(
      halfPitDetails.totalPit,
    )}\n`;
    text += `    PIT wspólny pary: ${formatNumberPL(
      halfPitDetails.totalPit,
    )} × 2 = ${formatNumberPL(jointPit)}\n`;

    text += `\n  2) PIT małżonka przy rozliczeniu indywidualnym (skala):\n`;
    text += getScalePitBracketLines(spousePitDetails, "    ");
    text += `    PIT małżonka przy rozliczeniu indywidualnym: ${formatNumberPL(
      spousePitDetails.totalPit,
    )}\n`;

    text += `\n  3) Różnica przypisana podatnikowi (1 - 2):\n`;
    text += `    ${formatNumberPL(jointPit)} - ${formatNumberPL(
      spousePitDetails.totalPit,
    )} = ${formatNumberPL(attributedPit)}\n`;
    text += `    (tyle PIT-u pary przypada na podatnika; kwotę można porównać\n`;
    text += `    z wariantami indywidualnymi, bo małżonek i tak zapłaciłby\n`;
    text += `    ${formatNumberPL(spousePitDetails.totalPit)} rozliczając się sam)\n`;

    return { text, attributedPit };
  }

  function getJointLevyBreakdown(yourLevyDetails, spouseLevyDetails, indent) {
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;
    let text = "";

    if (yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0) {
      text += `\n${indent}Danina solidarnościowa (liczona odrębnie dla każdego z małżonków):\n`;
    }
    if (yourLevyDetails.levy > 0) {
      text += `${indent}  Danina solidarnościowa ${formatPercentPL(
        rateSolidarity,
      )} po Twojej stronie: ${formatNumberPL(
        yourLevyDetails.aboveThreshold,
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        yourLevyDetails.levy,
      )}\n`;
    }
    if (spouseLevyDetails.levy > 0) {
      text += `${indent}  Danina solidarnościowa ${formatPercentPL(
        rateSolidarity,
      )} po stronie małżonka: ${formatNumberPL(
        spouseLevyDetails.aboveThreshold,
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        spouseLevyDetails.levy,
      )}\n`;
      text += `${indent}  (danina małżonka nie jest wliczana — zapłaciłby ją także\n`;
      text += `${indent}  przy rozliczeniu indywidualnym)\n`;
    }

    return text;
  }

  function getScaleTaxJointBreakdown(income, spouseIncome, healthScale) {
    const yourLevyDetails = getSolidarityLevyDetails(income);
    const spouseLevyDetails = getSolidarityLevyDetails(spouseIncome);
    const attribution = getJointPitAttributionBreakdown(
      income,
      spouseIncome,
      "Łączny dochód",
    );
    const totalTax = taxMath.round2(
      attribution.attributedPit + yourLevyDetails.levy,
    );

    let text = `\nObliczenie podatku (skala podatkowa - wspólnie z małżonkiem):\n`;
    text += attribution.text;
    text += getJointLevyBreakdown(yourLevyDetails, spouseLevyDetails, "  ");

    text +=
      yourLevyDetails.levy > 0
        ? `\n  Suma podatku przypisanego podatnikowi i daniny: ${formatNumberPL(
            attribution.attributedPit,
          )} + ${formatNumberPL(yourLevyDetails.levy)} = ${formatNumberPL(
            totalTax,
          )}\n`
        : `\n  Suma podatku przypisanego podatnikowi: ${formatNumberPL(
            totalTax,
          )}\n`;

    const total = taxMath.round2(totalTax + healthScale);
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
    const ipBoxTax = taxMath.round2(ipBoxIncome * ipBoxRate);
    const yourLevyDetails = getSolidarityLevyDetails(regularIncome);
    const spouseLevyDetails = getSolidarityLevyDetails(spouseIncome);
    const attribution = getJointPitAttributionBreakdown(
      regularIncome,
      spouseIncome,
      "Łączny dochód opodatkowany skalą",
    );
    const totalTax = taxMath.round2(
      ipBoxTax + attribution.attributedPit + yourLevyDetails.levy,
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
    text += `\n  Podatek IP BOX:\n`;
    text += `    ${formatNumberPL(ipBoxIncome)} × ${formatPercentPL(
      ipBoxRate,
    )} = ${formatNumberPL(ipBoxTax)}\n`;
    text += `\n  Podatek od dochodu opodatkowanego skalą (wspólnie z małżonkiem):\n`;
    text += attribution.text;
    text += getJointLevyBreakdown(yourLevyDetails, spouseLevyDetails, "  ");

    if (yourLevyDetails.levy > 0) {
      text += `\n  Łączny podatek i danina: ${formatNumberPL(
        ipBoxTax,
      )} + ${formatNumberPL(attribution.attributedPit)} + ${formatNumberPL(
        yourLevyDetails.levy,
      )} = ${formatNumberPL(totalTax)}\n`;
    } else {
      text += `\n  Łączny podatek: ${formatNumberPL(
        ipBoxTax,
      )} + ${formatNumberPL(attribution.attributedPit)} = ${formatNumberPL(
        totalTax,
      )}\n`;
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

  /* Opis odliczenia w trybie „Wiele stawek": część odliczenia przypadająca
     na daną stawkę (art. 11 ust. 3 ustawy o ryczałcie). */
  function getRyczaltDeductionShareLine(
    rateRevenue,
    totalRevenue,
    totalDeduction,
    deductionShare,
  ) {
    return `  Część odliczenia przypadająca na tę stawkę: ${formatNumberPL(
      totalDeduction,
    )} × ${formatNumberPL(rateRevenue)} / ${formatNumberPL(
      totalRevenue,
    )} = ${formatNumberPL(deductionShare)}\n`;
  }

  function getRyczaltBreakdown(
    revenue,
    rate,
    rateName,
    healthDeduction,
    healthAnnual,
    isMultipleRates,
    deductionShareLine = "",
  ) {
    const taxBase = Math.max(revenue - healthDeduction, 0);
    const tax = taxMath.round2(taxBase * rate);

    let text = `\nObliczenie ryczałtu (stawka ${rateName}):\n`;
    text += `  Przychód: ${formatNumberPL(revenue)}\n`;
    text += deductionShareLine;
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
    deductionShareLine = "",
  ) {
    const details = getRyczalt85125Details(revenue, healthDeduction);
    const { threshold, tax } = details;

    let text = `\nObliczenie ryczałtu (stawka 8,5% i 12,5%):\n`;
    text += `  Przychód: ${formatNumberPL(revenue)}\n`;
    text += `  Próg dla stawki 8,5%: ${formatNumberPL(threshold)}\n`;
    text += deductionShareLine;
    text += `  Odliczenie składki zdrowotnej: ${formatNumberPL(
      healthDeduction,
    )}\n`;

    if (revenue <= threshold) {
      text += `  Cały przychód mieści się w progu 8,5%:\n`;
      text += `  Podstawa: ${formatNumberPL(revenue)} - ${formatNumberPL(
        healthDeduction,
      )} = ${formatNumberPL(details.base85)}\n`;
      text += `  Ryczałt: ${formatNumberPL(
        details.base85,
      )} × 8,5% = ${formatNumberPL(tax)}\n`;
    } else {
      text += `  Odliczenie dzielone proporcjonalnie do przychodu w każdej stawce\n`;
      text += `  (art. 11 ust. 3 ustawy o zryczałtowanym podatku dochodowym):\n`;
      text += `    - na część 8,5%: ${formatNumberPL(
        healthDeduction,
      )} × ${formatNumberPL(details.revenue85)} / ${formatNumberPL(
        revenue,
      )} = ${formatNumberPL(details.deduction85)}\n`;
      text += `    - na część 12,5%: ${formatNumberPL(
        healthDeduction,
      )} - ${formatNumberPL(details.deduction85)} = ${formatNumberPL(
        details.deduction125,
      )}\n`;
      text += `  Część do ${formatNumberPL(threshold)} (8,5%): (${formatNumberPL(
        details.revenue85,
      )} - ${formatNumberPL(details.deduction85)}) × 8,5% = ${formatNumberPL(
        details.tax85,
      )}\n`;
      text += `  Część powyżej progu (12,5%): (${formatNumberPL(
        details.revenue125,
      )} - ${formatNumberPL(details.deduction125)}) × 12,5% = ${formatNumberPL(
        details.tax125,
      )}\n`;
      text += `  Suma ryczałtu: ${formatNumberPL(
        details.tax85,
      )} + ${formatNumberPL(details.tax125)} = ${formatNumberPL(tax)}\n`;
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
    const revenueNum = parsePLN(DOM.revenueInput.value);
    const costsNum = parsePLN(DOM.costsInput.value);
    const incomeNum = revenueNum - costsNum;
    const ipBoxOn = isIpBoxEnabled();
    const ipBoxCoeffNum = ipBoxOn
      ? parseFloat(DOM.ipBoxCoeffInput.value) / 100
      : 0;
    const isJointTaxation = document.querySelector(".joint-taxation-card.show");
    const spouseIncomeNum = isJointTaxation
      ? parsePLN(document.getElementById("spouseIncome").value)
      : 0;
    const isMultipleRates = DOM.multipleRatesToggle.checked;

    const healthScaleData = getHealthScaleBreakdown(incomeNum);
    const healthLinearData = getHealthLinearBreakdown(incomeNum);

    const { revenues: allocatedRevenues, total: totalAllocated } =
      isMultipleRates
        ? getAllocatedRevenues()
        : { revenues: {}, total: 0 };
    const ryczaltRevenueForHealth = isMultipleRates
      ? totalAllocated
      : revenueNum;
    const healthRyczaltData = getHealthRyczaltBreakdown(
      ryczaltRevenueForHealth,
    );

    let text = `=== DANE PODSTAWOWE ===\n`;
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
    text += `(ZUS) ani składki zdrowotnej, ZUS i daniny solidarnościowej\n`;
    text += `małżonka.\n`;
    if (isJointTaxation) {
      text += `Przy wspólnym rozliczeniu PIT jest wspólny dla pary\n`;
      text += `("2 × PIT((suma dochodów) / 2)"). Aby wynik był porównywalny\n`;
      text += `z wariantami indywidualnymi, kalkulator odejmuje od PIT-u pary\n`;
      text += `PIT, który małżonek zapłaciłby sam wg skali. Pokazana kwota to\n`;
      text += `różnica przypisana podatnikowi (może być ujemna, gdy wspólne\n`;
      text += `rozliczenie obniża podatek małżonka bardziej, niż wynosi podatek\n`;
      text += `podatnika).\n`;
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
        text += `(Tryb wielu stawek - odliczenie 50% składki zdrowotnej dzielone\n`;
        text += `między stawki proporcjonalnie do przychodu, art. 11 ust. 3\n`;
        text += `ustawy o zryczałtowanym podatku dochodowym)\n`;
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
          let rateDeduction = healthRyczaltData.deduction;
          let deductionShareLine = "";
          if (isMultipleRates) {
            rateRevenue = allocatedRevenues[rateInfo.id] || 0;
            rateDeduction = getRyczaltDeductionShare(
              healthRyczaltData.deduction,
              rateRevenue,
              totalAllocated,
            );
            if (totalAllocated > 0) {
              deductionShareLine = getRyczaltDeductionShareLine(
                rateRevenue,
                totalAllocated,
                healthRyczaltData.deduction,
                rateDeduction,
              );
            }
          }

          if (rateInfo.id === "ryczalt8_5_12_5") {
            text += getRyczalt85125Breakdown(
              rateRevenue,
              rateDeduction,
              healthRyczaltData.annualHealth,
              isMultipleRates,
              deductionShareLine,
            );
          } else if (rateInfo.rate !== null) {
            text += getRyczaltBreakdown(
              rateRevenue,
              rateInfo.rate,
              rateInfo.label,
              rateDeduction,
              healthRyczaltData.annualHealth,
              isMultipleRates,
              deductionShareLine,
            );
          }
        }
      });

      if (isMultipleRates) {
        text += `\n--- SUMA RYCZAŁTU (WIELE STAWEK) ---\n`;
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
    text += `Stan prawny na ${LEGAL_STATUS_DATE} (rok podatkowy 2026)\n`;

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

  function showCopyToast() {
    if (!DOM.copyToast) return;
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
    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        success = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (fallbackErr) {
        console.error("Failed to copy values:", fallbackErr);
      }
    }
    if (success) {
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

  function createInfoTextSection(title, paragraphs) {
    const section = document.createElement("section");
    section.className = "info-section";

    const heading = document.createElement("h4");
    heading.textContent = title;
    section.appendChild(heading);

    paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.className = "info-section-text";
      p.textContent = paragraph;
      section.appendChild(p);
    });

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
          label: "Stan prawny na dzień",
          value: LEGAL_STATUS_DATE,
        },
        {
          label:
            "Początek roku składkowego (skala, liniowy, IP BOX; ryczałt wg roku kalendarzowego od 1.01.2026)",
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
      createInfoTextSection("Rozliczenie wspólne z małżonkiem", [
        "PIT przy rozliczeniu wspólnym jest wspólny dla pary: 2 × PIT od połowy sumy dochodów (art. 6 ust. 2 ustawy o PIT). Pozostałe warianty (skala indywidualnie, liniowy, ryczałt) obejmują tylko podatnika.",
        "Aby kwoty były porównywalne, wariant „wspólnie z małżonkiem” pokazuje: PIT wspólny pary − PIT, który małżonek zapłaciłby sam wg skali = różnica przypisana podatnikowi. Do tego doliczana jest Twoja danina solidarnościowa i Twoja składka zdrowotna.",
        "Danina solidarnościowa małżonka, jego składka zdrowotna i ZUS nie są wliczane — małżonek płaci je niezależnie od formy rozliczenia. Wynik może być ujemny, gdy wspólne rozliczenie obniża podatek małżonka bardziej, niż wynosi Twój podatek.",
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
    footnote.textContent = `Wszystkie wartości zdefiniowane są w pliku taxConstants.js. Stan prawny na ${LEGAL_STATUS_DATE}.`;
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
})();
