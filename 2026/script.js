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
    ipBoxEdit: document.getElementById("ipBoxEdit"),
    ipBoxContainer: document.getElementById("ipBoxContainer"),
    ryczaltCheckboxes: document.querySelectorAll(
      '.checkbox-group input[type="checkbox"]'
    ),
    ryczaltMessage: document.getElementById("ryczalt-message"),
    jointTaxationRadios: document.querySelectorAll(
      'input[name="jointTaxation"]'
    ),
    spouseIncomeCard: document.getElementById("spouseIncomeCard"),
    spouseIncomeInput: document.getElementById("spouseIncome"),
    multipleRatesToggle: document.getElementById("multipleRatesToggle"),
    rateInputs: document.querySelectorAll(".rate-input"),
    revenueInfoText: document.querySelector(".multiple-rates-revenue-info p"),
    copySidebar: document.querySelector(".copy-sidebar"),
    sidebarToggle: document.querySelector(".copy-sidebar-toggle"),
    copyButton: document.getElementById("copyValues"),
    copySuccess: document.getElementById("copySuccess"),
  };

  /* ==================================================
     Shared Variables & Calculation Value Getters/Setters
  ================================================== */
  const contributionValues = {
    healthLinear: 0, // Składka zdrowotna - podatek liniowy
    healthRyczalt: 0, // Składka zdrowotna - ryczałt
    healthScale: 0, // Składka zdrowotna - skala podatkowa
    healthLinearDeduction: 0, // Efektywna składka zdrowotna do odliczenia - podatek liniowy
    healthRyczaltDeduction: 0, // Efektywna składka zdrowotna do odliczenia - ryczałt
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

  /* ==================================================
     Validation Functions
  ================================================== */
  function validateInput(value, fieldName) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    let isValid = true;
    input.classList.remove("error");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
    }
    const numericValue = parsePLN(value);
    if (isNaN(numericValue)) {
      if (errorElement)
        errorElement.textContent = "Proszę wprowadzić prawidłową kwotę";
      isValid = false;
    } else if (numericValue < 0) {
      if (errorElement) errorElement.textContent = "Kwota nie może być ujemna";
      isValid = false;
    } else if (numericValue > 999999999) {
      if (errorElement) errorElement.textContent = "Kwota jest zbyt duża";
      isValid = false;
    }
    if (!isValid) {
      input.classList.add("error");
      if (errorElement) errorElement.classList.add("visible");
    }
    return isValid;
  }
  function validateIpBoxCoeff(value) {
    const errorElement = document.getElementById("ipBoxCoeff-error");
    const numValue = parseFloat(value);
    let isValid = true;
    DOM.ipBoxCoeffInput.classList.remove("error");
    errorElement.textContent = "";
    errorElement.classList.remove("visible");
    if (isNaN(numValue) || value === "") {
      errorElement.textContent = "Proszę wprowadzić wartość";
      isValid = false;
    } else if (numValue < 0 || numValue > 100) {
      errorElement.textContent = "Wartość musi być między 0 a 100";
      isValid = false;
    }
    if (!isValid) {
      DOM.ipBoxCoeffInput.classList.add("error");
      errorElement.classList.add("visible");
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
      TAX_BAND_12
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
        healthScale
    );
  }

  function calculateJointScaleTaxTotal(income, spouseIncome, healthScale) {
    return taxMath.round2(
      calculateJointScalePitOnly(income, spouseIncome) +
        calculateSolidarityLevy(income) +
        calculateSolidarityLevy(spouseIncome) +
        healthScale
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

  function calculateLinearTaxTotal(income, healthLinearDeduction, healthLinear) {
    const pitBase = Math.max(income - healthLinearDeduction, 0);
    return taxMath.round2(
      calculateLinearPitOnly(pitBase) +
        calculateSolidarityLevy(pitBase) +
        healthLinear
    );
  }

  function calculateLinearIpBoxTaxTotal(
    income,
    ipBoxCoeff,
    healthLinearDeduction,
    healthLinear
  ) {
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(income, ipBoxCoeff);
    const ipBoxPit = taxMath.round2(ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE);
    const standardPitBase = Math.max(regularIncome - healthLinearDeduction, 0);

    return taxMath.round2(
      ipBoxPit +
        calculateLinearPitOnly(standardPitBase) +
        calculateSolidarityLevy(standardPitBase) +
        healthLinear
    );
  }

  function getIpBoxIncomeSplit(income, ipBoxCoeff) {
    const ipBoxIncome = taxMath.round2(income * ipBoxCoeff);
    const regularIncome = taxMath.round2(income - ipBoxIncome);
    return { ipBoxIncome, regularIncome };
  }

  function calculateScaleIpBoxTaxTotal(income, ipBoxCoeff, healthScale) {
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(income, ipBoxCoeff);
    const ipBoxTax = taxMath.round2(ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE);
    return taxMath.round2(
      ipBoxTax +
        calculateScalePitOnly(regularIncome) +
        calculateSolidarityLevy(regularIncome) +
        healthScale
    );
  }

  function calculateJointScaleIpBoxTaxTotal(
    income,
    spouseIncome,
    ipBoxCoeff,
    healthScale
  ) {
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(income, ipBoxCoeff);
    const ipBoxTax = taxMath.round2(ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE);
    return taxMath.round2(
      ipBoxTax +
        calculateJointScalePitOnly(regularIncome, spouseIncome) +
        calculateSolidarityLevy(regularIncome) +
        calculateSolidarityLevy(spouseIncome) +
        healthScale
    );
  }

  /* ==================================================
     UI Update Functions
  ================================================== */
  function makeIpBoxReadonly() {
    if (!DOM.ipBoxCoeffInput.hasAttribute("readonly")) {
      DOM.ipBoxCoeffInput.setAttribute("readonly", "");
      DOM.ipBoxCoeffInput.classList.remove("editable");
      DOM.ipBoxEdit.textContent = "✎";
      if (validateIpBoxCoeff(DOM.ipBoxCoeffInput.value)) calculate();
    }
  }
  function updateRemainingRevenue() {
    const totalRevenue = parsePLN(DOM.revenueInput.value);
    const rateInputsShown = document.querySelectorAll(".rate-input.show");
    let usedRevenue = 0;
    rateInputsShown.forEach((input) => {
      if (input.value) usedRevenue += parsePLN(input.value);
    });
    const difference = usedRevenue - totalRevenue;
    if (difference > 0) {
      DOM.revenueInfoText.innerHTML = `<span style="color: var(--app-error)">Przekroczono przychód o: ${formatPLN(
        difference
      )}</span>`;
    } else {
      const remainingRevenue = totalRevenue - usedRevenue;
      DOM.revenueInfoText.textContent = `Przychód do rozdysponowania: ${formatPLN(
        remainingRevenue
      )}`;
    }
  }

  /* ==================================================
     Main Calculation Function
  ================================================== */
  function calculate() {
    // Retrieve and parse input values
    const rawRevenue = DOM.revenueInput.value;
    const rawCosts = DOM.costsInput.value;
    let revenue =
      parseFloat(rawRevenue.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    let costs =
      parseFloat(rawCosts.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    let income = revenue - costs;

    // Update displayed income value only, don't reformat revenue and costs
    // which would move the cursor position
    document.getElementById("income").value = formatPLN(income);

    let ipBoxCoeff = parseFloat(DOM.ipBoxCoeffInput.value) / 100;
    const healthContribLimit = TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT;

    // Składka zdrowotna dla podatku liniowego
    let healthLinear = taxMath.calculateHealthLinear(income);
    setCalculationValue("healthLinear", healthLinear);

    // Składka zdrowotna dla ryczałtu (na podstawie przychodu)
    let healthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(revenue);
    setCalculationValue("healthRyczalt", healthRyczalt);

    // Składka zdrowotna dla skali podatkowej
    let healthScale = taxMath.calculateHealthScale(income);
    setCalculationValue("healthScale", healthScale);
    let healthLinearDeduction = Math.min(healthLinear, healthContribLimit);
    setCalculationValue("healthLinearDeduction", healthLinearDeduction);

    // Składka zdrowotna do odliczenia dla ryczałtu
    let healthRyczaltDeduction;
    if (DOM.multipleRatesToggle.checked) {
      let totalAllocatedRevenue = 0;
      document.querySelectorAll(".rate-input.show").forEach((input) => {
        totalAllocatedRevenue += parsePLN(input.value) || 0;
      });
      let ratesHealthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(
        totalAllocatedRevenue
      );
      healthRyczaltDeduction =
        ratesHealthRyczalt * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR;
    } else {
      healthRyczaltDeduction =
        healthRyczalt * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR;
    }
    setCalculationValue("healthRyczaltDeduction", healthRyczaltDeduction);

    const jointTaxationEnabled =
      document.querySelector('input[name="jointTaxation"]:checked').value === "yes";
    const spouseIncome = jointTaxationEnabled
      ? parsePLN(document.getElementById("spouseIncome").value)
      : 0;

    // Calculate tax values for individual and joint taxation
    let taxScale = calculateScaleTaxTotal(
      income,
      getCalculationValue("healthScale")
    );
    document.getElementById("taxScale").value = formatPLN(taxScale);
    if (jointTaxationEnabled) {
      let taxScaleJoint = calculateJointScaleTaxTotal(
        income,
        spouseIncome,
        getCalculationValue("healthScale")
      );
      document.getElementById("taxScaleJoint").value = formatPLN(taxScaleJoint);
    }

    let taxLinear = calculateLinearTaxTotal(
      income,
      healthLinearDeduction,
      healthLinear
    );
    document.getElementById("taxLinear").value = formatPLN(taxLinear);

    let taxScaleIpBox = calculateScaleIpBoxTaxTotal(
      income,
      ipBoxCoeff,
      getCalculationValue("healthScale")
    );
    document.getElementById("taxScaleIpBox").value = formatPLN(taxScaleIpBox);
    if (jointTaxationEnabled) {
      let taxScaleIpBoxJoint = calculateJointScaleIpBoxTaxTotal(
        income,
        spouseIncome,
        ipBoxCoeff,
        getCalculationValue("healthScale")
      );
      document.getElementById("taxScaleIpBoxJoint").value =
        formatPLN(taxScaleIpBoxJoint);
    }

    let taxLinearIpBox = calculateLinearIpBoxTaxTotal(
      income,
      ipBoxCoeff,
      healthLinearDeduction,
      healthLinear
    );
    document.getElementById("taxLinearIpBox").value = formatPLN(taxLinearIpBox);

    let allocatedRevenues = {};
    if (DOM.multipleRatesToggle.checked) {
      const rateInputsVisible = document.querySelectorAll(".rate-input.show");
      rateInputsVisible.forEach((input) => {
        const allocatedValue = parsePLN(input.value) || 0;
        allocatedRevenues[input.dataset.for] = allocatedValue;
      });
    }

    function getAllocatedOrFullRateValue(rateId) {
      if (DOM.multipleRatesToggle.checked) {
        const rateInput = document.querySelector(
          `.rate-input[data-for="${rateId}"]`
        );
        if (!rateInput || !rateInput.value) return 0;
        return allocatedRevenues[rateId] || 0;
      }
      return revenue;
    }

    // Calculate Ryczałt values
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt2") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt2 = base * TAX_CONSTANTS.RYCZALT_RATE_2;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt2 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt2").value = formatPLN(ryczalt2);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt3") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt3 = base * TAX_CONSTANTS.RYCZALT_RATE_3;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt3 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt3").value = formatPLN(ryczalt3);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt5_5") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt5_5 = base * TAX_CONSTANTS.RYCZALT_RATE_5_5;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt5_5 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt5_5").value = formatPLN(ryczalt5_5);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt8_5") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt8_5 = base * TAX_CONSTANTS.RYCZALT_RATE_8_5;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt8_5 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt8_5").value = formatPLN(ryczalt8_5);
    }
    {
      let allocated = getAllocatedOrFullRateValue("ryczalt8_5_12_5");
      let ryczalt8_5_12_5;
      const ryczalt85Threshold = TAX_CONSTANTS.RYCZALT_8_5_THRESHOLD;
      const rate85 = TAX_CONSTANTS.RYCZALT_RATE_8_5;
      const rate125 = TAX_CONSTANTS.RYCZALT_RATE_12_5;
      const taxAt85Threshold = ryczalt85Threshold * rate85; // 8500

      if (allocated <= ryczalt85Threshold) {
        ryczalt8_5_12_5 =
          Math.max(
            allocated - getCalculationValue("healthRyczaltDeduction"),
            0
          ) * rate85;
      } else {
        ryczalt8_5_12_5 =
          Math.max(
            allocated -
              (getCalculationValue("healthRyczaltDeduction") +
                ryczalt85Threshold),
            0
          ) *
            rate125 +
          taxAt85Threshold;
      }
      if (!DOM.multipleRatesToggle.checked)
        ryczalt8_5_12_5 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt8_5_12_5").value =
        formatPLN(ryczalt8_5_12_5);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt10") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt10 = base * TAX_CONSTANTS.RYCZALT_RATE_10;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt10 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt10").value = formatPLN(ryczalt10);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt12") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt12 = base * TAX_CONSTANTS.RYCZALT_RATE_12;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt12 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt12").value = formatPLN(ryczalt12);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt14") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt14 = base * TAX_CONSTANTS.RYCZALT_RATE_14;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt14 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt14").value = formatPLN(ryczalt14);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt15") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt15 = base * TAX_CONSTANTS.RYCZALT_RATE_15;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt15 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt15").value = formatPLN(ryczalt15);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("ryczalt17") -
          getCalculationValue("healthRyczaltDeduction"),
        0
      );
      let ryczalt17 = base * TAX_CONSTANTS.RYCZALT_RATE_17;
      if (!DOM.multipleRatesToggle.checked)
        ryczalt17 += getCalculationValue("healthRyczalt");
      document.getElementById("ryczalt17").value = formatPLN(ryczalt17);
    }

    updateRatesTotal();
  }

  /* ==================================================
     Update Rates Total
  ================================================== */
  function updateRatesTotal() {
    const ratesTotalElement = document.getElementById("ratesTotal");
    const ratesTotalValueElement = document.getElementById("ratesTotalValue");
    const ratesHealthRyczaltElement = document.getElementById(
      "ratesHealthRyczaltValue"
    );

    if (!DOM.multipleRatesToggle.checked) {
      ratesTotalElement.classList.add("hidden");
      return;
    }

    const anyRateSelected = Array.from(DOM.ryczaltCheckboxes).some(
      (checkbox) => checkbox.checked
    );
    if (!anyRateSelected) {
      ratesTotalElement.classList.add("hidden");
      return;
    }

    let totalAllocatedRevenue = 0;
    document.querySelectorAll(".rate-input.show").forEach((input) => {
      totalAllocatedRevenue += parsePLN(input.value) || 0;
    });

    // Użyj tej samej funkcji co w calculate() dla spójności
    let ratesHealthRyczalt = taxMath.getRyczaltHealthAnnualForRevenue(
      totalAllocatedRevenue
    );

    const rateIds = [
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
    let total = 0;
    rateIds.forEach((id) => {
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
     Event Handlers
  ================================================== */
  function handleCalculate() {
    const isRevenueValid = validateInput(DOM.revenueInput.value, "revenue");
    const isCostsValid = validateInput(DOM.costsInput.value, "costs");
    const isIpBoxValid = validateIpBoxCoeff(DOM.ipBoxCoeffInput.value);

    if (isRevenueValid && isCostsValid && isIpBoxValid) {
      // Format the input values on initial calculation
      DOM.revenueInput.value = formatPLN(parsePLN(DOM.revenueInput.value));
      DOM.costsInput.value = formatPLN(parsePLN(DOM.costsInput.value));

      calculate();
      DOM.resultsSection.classList.remove("hidden");
      DOM.calculateButton.style.display = "none";
      document
        .querySelector(".input-section")
        .scrollIntoView({ behavior: "smooth" });
      document.getElementById("legalDisclaimer").classList.add("show");
    }

    DOM.ryczaltCheckboxes.forEach((checkbox) => {
      const targetId = checkbox.dataset.target;
      const targetInput = document.getElementById(targetId);
      const targetGroup = targetInput.closest(".input-group");
      targetGroup.style.display = checkbox.checked ? "flex" : "none";
    });
    const anyChecked = Array.from(DOM.ryczaltCheckboxes).some(
      (cb) => cb.checked
    );
    DOM.ryczaltMessage.style.display = anyChecked ? "none" : "block";

    const jointTaxationSelected = document.querySelector(
      'input[name="jointTaxation"]:checked'
    ).value;
    if (jointTaxationSelected === "no") {
      DOM.spouseIncomeCard.classList.add("inactive");
      DOM.spouseIncomeInput.setAttribute("readonly", "");
      DOM.spouseIncomeInput.value = formatPLN(0);
    }
  }

  /* ==================================================
     Event Listener Registrations
  ================================================== */
  DOM.calculateButton.addEventListener("click", handleCalculate);

  DOM.revenueInput.addEventListener("input", (e) => {
    const isValid = validateInput(e.target.value, "revenue");
    if (!DOM.resultsSection.classList.contains("hidden") && isValid) {
      // Store cursor position before calculation
      const cursorPos = e.target.selectionStart;
      const originalValue = e.target.value;

      // Perform calculation
      calculate();

      // Don't reformat during typing, restore original value
      e.target.value = originalValue;

      // Restore cursor position
      e.target.setSelectionRange(cursorPos, cursorPos);
    }
    if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
  });
  DOM.revenueInput.addEventListener("blur", (e) => {
    const originalValue = parsePLN(e.target.value);
    e.target.value = formatPLN(originalValue);
    // Recalculate when focus leaves the field to ensure correct results
    if (!DOM.resultsSection.classList.contains("hidden")) calculate();
    if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
  });
  DOM.costsInput.addEventListener("input", (e) => {
    const isValid = validateInput(e.target.value, "costs");
    if (!DOM.resultsSection.classList.contains("hidden") && isValid) {
      // Store cursor position before calculation
      const cursorPos = e.target.selectionStart;
      const originalValue = e.target.value;

      // Perform calculation
      calculate();

      // Don't reformat during typing, restore original value
      e.target.value = originalValue;

      // Restore cursor position
      e.target.setSelectionRange(cursorPos, cursorPos);
    }
  });
  DOM.costsInput.addEventListener("blur", (e) => {
    const originalValue = parsePLN(e.target.value);
    e.target.value = formatPLN(originalValue);
    // Recalculate when focus leaves the field to ensure correct results
    if (!DOM.resultsSection.classList.contains("hidden")) calculate();
  });
  DOM.ipBoxCoeffInput.addEventListener("input", (e) => {
    if (
      !e.target.hasAttribute("readonly") &&
      validateIpBoxCoeff(e.target.value) &&
      !DOM.resultsSection.classList.contains("hidden")
    ) {
      calculate();
    }
  });
  DOM.ipBoxEdit.addEventListener("click", (e) => {
    e.stopPropagation();
    const isCurrentlyReadOnly = DOM.ipBoxCoeffInput.hasAttribute("readonly");
    if (isCurrentlyReadOnly) {
      DOM.ipBoxCoeffInput.removeAttribute("readonly");
      DOM.ipBoxCoeffInput.classList.add("editable");
      DOM.ipBoxEdit.textContent = "✓";
      DOM.ipBoxCoeffInput.focus();
    } else {
      makeIpBoxReadonly();
    }
  });
  DOM.ipBoxCoeffInput.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", (e) => {
    if (!DOM.ipBoxContainer.contains(e.target)) makeIpBoxReadonly();
  });
  DOM.jointTaxationRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      DOM.spouseIncomeCard.classList.remove("shake");
      const jointTaxationCards = document.querySelectorAll(
        ".joint-taxation-card"
      );
      if (e.target.value === "yes") {
        DOM.spouseIncomeCard.classList.remove("inactive");
        DOM.spouseIncomeInput.removeAttribute("readonly");
        DOM.spouseIncomeInput.value = "";
        DOM.spouseIncomeInput.placeholder = "wartość...";
        DOM.spouseIncomeCard.classList.add("shake");
        jointTaxationCards.forEach((card) => card.classList.add("show"));
        setTimeout(() => {
          DOM.spouseIncomeCard.classList.remove("shake");
        }, 500);
        if (!DOM.resultsSection.classList.contains("hidden")) {
          calculate();
        }
      } else {
        DOM.spouseIncomeCard.classList.add("inactive");
        DOM.spouseIncomeInput.setAttribute("readonly", "");
        DOM.spouseIncomeInput.value = formatPLN(0);
        DOM.spouseIncomeInput.placeholder = "";
        jointTaxationCards.forEach((card) => card.classList.remove("show"));
        if (!DOM.resultsSection.classList.contains("hidden")) calculate();
      }
    });
  });
  DOM.spouseIncomeInput.addEventListener("input", (e) => {
    if (!DOM.spouseIncomeCard.classList.contains("inactive")) {
      const isValid = validateInput(e.target.value, "spouseIncome");
      if (!DOM.resultsSection.classList.contains("hidden") && isValid)
        calculate();
    }
  });
  DOM.spouseIncomeInput.addEventListener("blur", (e) => {
    if (!DOM.spouseIncomeCard.classList.contains("inactive")) {
      e.target.value = formatPLN(parsePLN(e.target.value));
    }
  });
  document
    .getElementById("multipleRatesToggle")
    .addEventListener("change", function (e) {
      const isEnabled = e.target.checked;
      const rateInputs = document.querySelectorAll(".rate-input");
      const revenueInfo = document.querySelector(
        ".multiple-rates-revenue-info"
      );
      const wrapper = document.querySelector(".multiple-rates-wrapper");

      revenueInfo.style.display = isEnabled ? "block" : "none";
      wrapper.style.justifyContent = isEnabled ? "space-between" : "flex-end";

      rateInputs.forEach((input) => {
        const wrapper = input.closest(".checkbox-wrapper");
        const checkbox = wrapper.querySelector('input[type="checkbox"]');
        const targetId = checkbox.dataset.target;
        const targetInput = document.getElementById(targetId);
        if (isEnabled && checkbox.checked) {
          input.classList.add("show");
          input.value = "";
          targetInput.value = formatPLN(0);
        } else {
          input.classList.remove("show");
          input.value = "";
          if (!isEnabled && checkbox.checked) calculate();
        }
      });
      if (isEnabled) updateRemainingRevenue();
      else if (!DOM.resultsSection.classList.contains("hidden")) calculate();
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
        targetGroup.style.display = "flex";
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

      const anyChecked = Array.from(DOM.ryczaltCheckboxes).some(
        (cb) => cb.checked
      );
      DOM.ryczaltMessage.style.display = anyChecked ? "none" : "block";

      if (!DOM.resultsSection.classList.contains("hidden")) {
        calculate();
      }
      if (multipleRatesEnabled) {
        updateRemainingRevenue();
      }
    });
  });
  document.querySelectorAll(".rate-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      if (!e.target.value) return;
      const isValid = validateInput(e.target.value, e.target.dataset.for);
      if (!DOM.resultsSection.classList.contains("hidden") && isValid)
        calculate();
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
  });
  DOM.sidebarToggle.addEventListener("click", () => {
    DOM.copySidebar.classList.toggle("expanded");
  });

  /* ==================================================
     Clipboard Calculation Breakdown Functions
  ================================================== */

  /**
   * Helper to format number in Polish locale (e.g., 150 000,00 zł)
   */
  function formatNumberPL(value) {
    return (
      new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " zł"
    );
  }

  /**
   * Helper to format percentage in Polish locale (e.g., 9%)
   */
  function formatPercentPL(value) {
    return (value * 100).toLocaleString("pl-PL") + "%";
  }

  /**
   * Get health contribution breakdown for scale tax
   */
  function getHealthScaleBreakdown(income) {
    const minHealth = taxMath.getMinHealthAnnual();
    const calculatedHealth = taxMath.round2(
      TAX_CONSTANTS.HEALTH_RATE_SCALE * income
    );
    const healthScale = Math.max(calculatedHealth, minHealth);
    const usesMinimum = calculatedHealth < minHealth;

    let text = `Składka zdrowotna (${formatPercentPL(
      TAX_CONSTANTS.HEALTH_RATE_SCALE
    )} od dochodu):\n`;
    text += `  ${formatNumberPL(income)} × ${formatPercentPL(
      TAX_CONSTANTS.HEALTH_RATE_SCALE
    )} = ${formatNumberPL(calculatedHealth)}\n`;

    if (usesMinimum) {
      text += `  Minimalna składka zdrowotna: ${formatNumberPL(minHealth)}\n`;
      text += `  (obliczona składka jest niższa od minimalnej, stosuje się minimalną)\n`;
    }
    text += `  Składka zdrowotna do zapłaty: ${formatNumberPL(healthScale)}\n`;

    return { text, healthScale };
  }

  /**
   * Get health contribution breakdown for linear tax
   */
  function getHealthLinearBreakdown(income) {
    const minHealth = taxMath.getMinHealthAnnual();
    const calculatedHealth = taxMath.round2(
      TAX_CONSTANTS.HEALTH_RATE_LINEAR * income
    );
    const healthLinear = Math.max(calculatedHealth, minHealth);
    const usesMinimum = calculatedHealth < minHealth;
    const deductionLimit = TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT;
    const healthDeduction = Math.min(healthLinear, deductionLimit);

    let text = `Składka zdrowotna (${formatPercentPL(
      TAX_CONSTANTS.HEALTH_RATE_LINEAR
    )} od dochodu):\n`;
    text += `  ${formatNumberPL(income)} × ${formatPercentPL(
      TAX_CONSTANTS.HEALTH_RATE_LINEAR
    )} = ${formatNumberPL(calculatedHealth)}\n`;

    if (usesMinimum) {
      text += `  Minimalna składka zdrowotna: ${formatNumberPL(minHealth)}\n`;
      text += `  (obliczona składka jest niższa od minimalnej, stosuje się minimalną)\n`;
    }
    text += `  Składka zdrowotna do zapłaty: ${formatNumberPL(healthLinear)}\n`;
    text += `  Limit odliczenia od podstawy opodatkowania: ${formatNumberPL(
      deductionLimit
    )}\n`;
    text += `  Składka do odliczenia: ${formatNumberPL(healthDeduction)}\n`;

    return { text, healthLinear, healthDeduction };
  }

  /**
   * Get health contribution breakdown for ryczałt
   */
  function getHealthRyczaltBreakdown(revenue) {
    const avgSalary = TAX_CONSTANTS.AVG_SALARY_Q4_PREV;
    const healthRate = TAX_CONSTANTS.HEALTH_RATE_RYCZALT;
    const mult = taxMath.getRyczaltHealthMultiplier(revenue);
    const monthlyHealth = taxMath.getRyczaltHealthMonthlyForRevenue(revenue);
    const annualHealth = taxMath.getRyczaltHealthAnnualForRevenue(revenue);
    const deduction = taxMath.round2(
      annualHealth * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR
    );

    // Determine threshold description
    let thresholdDesc;
    if (revenue <= TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW) {
      thresholdDesc = `do ${formatNumberPL(
        TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW
      )} przychodu, mnożnik ${mult * 100}%`;
    } else if (revenue <= TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH) {
      thresholdDesc = `${formatNumberPL(
        TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW + 1
      )} - ${formatNumberPL(
        TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH
      )} przychodu, mnożnik ${mult * 100}%`;
    } else {
      thresholdDesc = `powyżej ${formatNumberPL(
        TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH
      )}, mnożnik ${mult * 100}%`;
    }

    let text = `Składka zdrowotna (ryczałt, ${thresholdDesc}):\n`;
    text += `  Podstawa: przeciętne wynagrodzenie ${formatNumberPL(
      avgSalary
    )} × ${mult * 100}% × ${formatPercentPL(healthRate)}\n`;
    text += `  Miesięcznie: ${formatNumberPL(monthlyHealth)}\n`;
    text += `  Rocznie: ${formatNumberPL(
      monthlyHealth
    )} × 12 = ${formatNumberPL(annualHealth)}\n`;
    text += `  Odliczenie od przychodu (50%): ${formatNumberPL(deduction)}\n`;

    return { text, annualHealth, deduction };
  }

  /**
   * Get scale tax calculation breakdown (without joint taxation)
   */
  function getScaleTaxBreakdown(income, healthScale) {
    const taxFree = TAX_CONSTANTS.TAX_FREE_AMOUNT;
    const threshold12 = TAX_CONSTANTS.TAX_THRESHOLD_12;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;
    const pitDetails = getScalePitDetails(income);
    const levyDetails = getSolidarityLevyDetails(income);

    let text = `\nObliczenie podatku (skala podatkowa):\n`;

    // Tax-free amount
    text += `  Kwota wolna (do ${formatNumberPL(taxFree)}): ${formatNumberPL(
      pitDetails.inTaxFree
    )} × 0% = 0,00 zł\n`;

    // 12% bracket
    if (pitDetails.in12Bracket > 0) {
      text += `  I próg ${formatPercentPL(rate12)} (${formatNumberPL(
        taxFree + 1
      )} - ${formatNumberPL(threshold12)}): ${formatNumberPL(
        pitDetails.in12Bracket
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(pitDetails.tax12)}\n`;
    }

    // 32% bracket
    if (pitDetails.in32Bracket > 0) {
      text += `  II próg ${formatPercentPL(rate32)} (${formatNumberPL(
        threshold12 + 1
      )} i więcej): ${formatNumberPL(
        pitDetails.in32Bracket
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(pitDetails.tax32)}\n`;
    }

    if (levyDetails.levy > 0) {
      text += `  Suma podatku wg skali: ${formatNumberPL(pitDetails.totalPit)}\n`;
      text += `  Danina solidarnościowa ${formatPercentPL(
        rateSolidarity
      )} (liczona odrębnie, powyżej ${formatNumberPL(
        levyDetails.threshold
      )}): ${formatNumberPL(
        levyDetails.aboveThreshold
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        levyDetails.levy
      )}\n`;
    }

    const totalTax = taxMath.round2(pitDetails.totalPit + levyDetails.levy);
    text +=
      levyDetails.levy > 0
        ? `  Suma podatku i daniny: ${formatNumberPL(totalTax)}\n`
        : `  Suma podatku: ${formatNumberPL(totalTax)}\n`;

    const total = taxMath.round2(totalTax + healthScale);
    text += `\nRAZEM (podatek + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  /**
   * Get scale tax calculation breakdown with joint taxation
   */
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
      jointPit + yourLevyDetails.levy + spouseLevyDetails.levy
    );

    let text = `\nObliczenie podatku (skala podatkowa - wspólnie z małżonkiem):\n`;
    text += `  Dochód małżonka: ${formatNumberPL(spouseIncome)}\n`;
    text += `  Łączny dochód: ${formatNumberPL(income)} + ${formatNumberPL(
      spouseIncome
    )} = ${formatNumberPL(jointIncome)}\n`;
    text += `  Połowa łącznego dochodu: ${formatNumberPL(
      jointIncome
    )} : 2 = ${formatNumberPL(halfIncome)}\n`;
    text += `  Podatek od połowy łącznego dochodu:\n`;
    text += `    Kwota wolna (do ${formatNumberPL(taxFree)}): ${formatNumberPL(
      halfPitDetails.inTaxFree
    )} × 0% = 0,00 zł\n`;

    if (halfPitDetails.in12Bracket > 0) {
      text += `    I próg ${formatPercentPL(rate12)} (${formatNumberPL(
        taxFree + 1
      )} - ${formatNumberPL(threshold12)}): ${formatNumberPL(
        halfPitDetails.in12Bracket
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(
        halfPitDetails.tax12
      )}\n`;
    }

    if (halfPitDetails.in32Bracket > 0) {
      text += `    II próg ${formatPercentPL(rate32)} (${formatNumberPL(
        threshold12 + 1
      )} i więcej): ${formatNumberPL(
        halfPitDetails.in32Bracket
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(
        halfPitDetails.tax32
      )}\n`;
    }

    text += `  Podatek od połowy dochodu: ${formatNumberPL(
      halfPitDetails.totalPit
    )}\n`;
    text += `  Podatek wspólny od skali: ${formatNumberPL(
      halfPitDetails.totalPit
    )} × 2 = ${formatNumberPL(jointPit)}\n`;

    if (yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0) {
      text += `  Danina solidarnościowa (liczona odrębnie dla każdego z małżonków):\n`;
    }
    if (yourLevyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        rateSolidarity
      )} po Twojej stronie: ${formatNumberPL(
        yourLevyDetails.aboveThreshold
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        yourLevyDetails.levy
      )}\n`;
    }
    if (spouseLevyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        rateSolidarity
      )} po stronie małżonka: ${formatNumberPL(
        spouseLevyDetails.aboveThreshold
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        spouseLevyDetails.levy
      )}\n`;
    }

    const total = taxMath.round2(totalTax + healthScale);
    text +=
      yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0
        ? `  Suma podatku i daniny: ${formatNumberPL(totalTax)}\n`
        : `  Suma podatku: ${formatNumberPL(totalTax)}\n`;
    text += `\nRAZEM (podatek + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  function getIpBoxScaleJointBreakdown(
    income,
    spouseIncome,
    ipBoxCoeff,
    healthScale
  ) {
    const ipBoxRate = TAX_CONSTANTS.IP_BOX_RATE;
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(income, ipBoxCoeff);
    const jointRegularIncome = taxMath.round2(regularIncome + spouseIncome);
    const halfJointRegularIncome = taxMath.round2(jointRegularIncome / 2);
    const halfPitDetails = getScalePitDetails(halfJointRegularIncome);
    const ipBoxTax = taxMath.round2(ipBoxIncome * ipBoxRate);
    const yourLevyDetails = getSolidarityLevyDetails(regularIncome);
    const spouseLevyDetails = getSolidarityLevyDetails(spouseIncome);
    const jointScalePit = taxMath.round2(halfPitDetails.totalPit * 2);
    const totalTax = taxMath.round2(
      ipBoxTax + jointScalePit + yourLevyDetails.levy + spouseLevyDetails.levy
    );
    const total = taxMath.round2(totalTax + healthScale);

    let text = `\nObliczenie podatku (skala podatkowa z IP BOX - wspólnie z małżonkiem):\n`;
    text += `  Podział dochodu:\n`;
    text += `    - Dochód IP BOX (${ipBoxCoeff * 100}%): ${formatNumberPL(
      ipBoxIncome
    )}\n`;
    text += `    - Dochód pozostały (${(1 - ipBoxCoeff) * 100}%): ${formatNumberPL(
      regularIncome
    )}\n`;
    text += `  Dochód małżonka: ${formatNumberPL(spouseIncome)}\n`;
    text += `  Łączny dochód opodatkowany skalą: ${formatNumberPL(
      regularIncome
    )} + ${formatNumberPL(spouseIncome)} = ${formatNumberPL(
      jointRegularIncome
    )}\n`;
    text += `  Połowa dochodu opodatkowanego skalą: ${formatNumberPL(
      jointRegularIncome
    )} : 2 = ${formatNumberPL(halfJointRegularIncome)}\n`;
    text += `\n  Podatek IP BOX:\n`;
    text += `    ${formatNumberPL(ipBoxIncome)} × ${formatPercentPL(
      ipBoxRate
    )} = ${formatNumberPL(ipBoxTax)}\n`;
    text += `\n  Podatek od połowy dochodu opodatkowanego skalą:\n`;
    text += `    Kwota wolna (do ${formatNumberPL(
      TAX_CONSTANTS.TAX_FREE_AMOUNT
    )}): ${formatNumberPL(halfPitDetails.inTaxFree)} × 0% = 0,00 zł\n`;

    if (halfPitDetails.in12Bracket > 0) {
      text += `    I próg ${formatPercentPL(
        TAX_CONSTANTS.PIT_RATE_12
      )}: ${formatNumberPL(halfPitDetails.in12Bracket)} × ${formatPercentPL(
        TAX_CONSTANTS.PIT_RATE_12
      )} = ${formatNumberPL(halfPitDetails.tax12)}\n`;
    }

    if (halfPitDetails.in32Bracket > 0) {
      text += `    II próg ${formatPercentPL(
        TAX_CONSTANTS.PIT_RATE_32
      )}: ${formatNumberPL(halfPitDetails.in32Bracket)} × ${formatPercentPL(
        TAX_CONSTANTS.PIT_RATE_32
      )} = ${formatNumberPL(halfPitDetails.tax32)}\n`;
    }

    text += `  Podatek od połowy dochodu: ${formatNumberPL(
      halfPitDetails.totalPit
    )}\n`;
    text += `  Podatek wspólny od części skalowej: ${formatNumberPL(
      halfPitDetails.totalPit
    )} × 2 = ${formatNumberPL(jointScalePit)}\n`;

    if (yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0) {
      text += `\n  Danina solidarnościowa (liczona odrębnie dla każdego z małżonków):\n`;
    }
    if (yourLevyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        TAX_CONSTANTS.SOLIDARITY_RATE
      )} po Twojej stronie: ${formatNumberPL(
        yourLevyDetails.aboveThreshold
      )} × ${formatPercentPL(
        TAX_CONSTANTS.SOLIDARITY_RATE
      )} = ${formatNumberPL(yourLevyDetails.levy)}\n`;
    }
    if (spouseLevyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        TAX_CONSTANTS.SOLIDARITY_RATE
      )} po stronie małżonka: ${formatNumberPL(
        spouseLevyDetails.aboveThreshold
      )} × ${formatPercentPL(
        TAX_CONSTANTS.SOLIDARITY_RATE
      )} = ${formatNumberPL(spouseLevyDetails.levy)}\n`;
    }

    if (yourLevyDetails.levy > 0 || spouseLevyDetails.levy > 0) {
      text += `\n  Łączny podatek i danina: ${formatNumberPL(
        ipBoxTax
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
        ipBoxTax
      )} + ${formatNumberPL(jointScalePit)} = ${formatNumberPL(totalTax)}\n`;
    }
    text += `\nRAZEM (podatek + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  /**
   * Get linear tax calculation breakdown
   */
  function getLinearTaxBreakdown(income, healthLinear, healthDeduction) {
    const linearRate = TAX_CONSTANTS.LINEAR_PIT_RATE;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;

    let text = `\nObliczenie podatku (podatek liniowy):\n`;

    const taxBase = Math.max(income - healthDeduction, 0);
    const pitDetails = getLinearPitDetails(taxBase);
    const levyDetails = getSolidarityLevyDetails(taxBase);
    text += `  Podstawa opodatkowania: ${formatNumberPL(
      income
    )} - ${formatNumberPL(healthDeduction)} = ${formatNumberPL(taxBase)}\n`;

    if (pitDetails.pitBase > 0) {
      text += `  Podatek liniowy ${formatPercentPL(linearRate)}: ${formatNumberPL(
        pitDetails.pitBase
      )} × ${formatPercentPL(linearRate)} = ${formatNumberPL(
        pitDetails.pit
      )}\n`;
    }

    if (levyDetails.levy > 0) {
      text += `  Danina solidarnościowa ${formatPercentPL(
        rateSolidarity
      )} (liczona odrębnie, powyżej ${formatNumberPL(
        levyDetails.threshold
      )}): ${formatNumberPL(
        levyDetails.aboveThreshold
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        levyDetails.levy
      )}\n`;
    }

    const totalTax = taxMath.round2(pitDetails.pit + levyDetails.levy);
    text +=
      levyDetails.levy > 0
        ? `  Suma podatku i daniny: ${formatNumberPL(totalTax)}\n`
        : `  Suma podatku: ${formatNumberPL(totalTax)}\n`;

    const total = taxMath.round2(totalTax + healthLinear);
    text += `\nRAZEM (podatek + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  /**
   * Get IP BOX scale tax calculation breakdown
   */
  function getIpBoxScaleBreakdown(income, ipBoxCoeff, healthScale) {
    const ipBoxRate = TAX_CONSTANTS.IP_BOX_RATE;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(income, ipBoxCoeff);
    const regularPitDetails = getScalePitDetails(regularIncome);
    const levyDetails = getSolidarityLevyDetails(regularIncome);

    let text = `\nObliczenie podatku (skala podatkowa z IP BOX):\n`;
    text += `  Podział dochodu:\n`;
    text += `    - Dochód IP BOX (${ipBoxCoeff * 100}%): ${formatNumberPL(
      ipBoxIncome
    )}\n`;
    text += `    - Dochód pozostały (${
      (1 - ipBoxCoeff) * 100
    }%): ${formatNumberPL(regularIncome)}\n`;

    // IP BOX tax
    const ipBoxTax = taxMath.round2(ipBoxIncome * ipBoxRate);
    text += `\n  Podatek IP BOX:\n`;
    text += `    ${formatNumberPL(ipBoxIncome)} × ${formatPercentPL(
      ipBoxRate
    )} = ${formatNumberPL(ipBoxTax)}\n`;

    // Regular income tax (scale)
    text += `\n  Podatek od pozostałego dochodu (skala):\n`;

    text += `    Kwota wolna (do ${formatNumberPL(
      TAX_CONSTANTS.TAX_FREE_AMOUNT
    )}): ${formatNumberPL(
      regularPitDetails.inTaxFree
    )} × 0% = 0,00 zł\n`;

    if (regularPitDetails.in12Bracket > 0) {
      text += `    I próg ${formatPercentPL(rate12)}: ${formatNumberPL(
        regularPitDetails.in12Bracket
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(
        regularPitDetails.tax12
      )}\n`;
    }

    if (regularPitDetails.in32Bracket > 0) {
      text += `    II próg ${formatPercentPL(rate32)}: ${formatNumberPL(
        regularPitDetails.in32Bracket
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(
        regularPitDetails.tax32
      )}\n`;
    }

    text += `    Suma podatku od pozostałego dochodu wg skali: ${formatNumberPL(
      regularPitDetails.totalPit
    )}\n`;

    if (levyDetails.levy > 0) {
      text += `    Danina solidarnościowa: ${formatNumberPL(
        levyDetails.aboveThreshold
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        levyDetails.levy
      )}\n`;
    }

    const totalTax = taxMath.round2(
      ipBoxTax + regularPitDetails.totalPit + levyDetails.levy
    );
    if (levyDetails.levy > 0) {
      text += `\n  Łączny podatek i danina: ${formatNumberPL(
        ipBoxTax
      )} + ${formatNumberPL(regularPitDetails.totalPit)} + ${formatNumberPL(
        levyDetails.levy
      )} = ${formatNumberPL(totalTax)}\n`;
    } else {
      text += `\n  Łączny podatek: ${formatNumberPL(
        ipBoxTax
      )} + ${formatNumberPL(regularPitDetails.totalPit)} = ${formatNumberPL(
        totalTax
      )}\n`;
    }

    const total = taxMath.round2(totalTax + healthScale);
    text += `\nRAZEM (podatek + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  /**
   * Get IP BOX linear tax calculation breakdown
   */
  function getIpBoxLinearBreakdown(
    income,
    ipBoxCoeff,
    healthLinear,
    healthDeduction
  ) {
    const ipBoxRate = TAX_CONSTANTS.IP_BOX_RATE;
    const linearRate = TAX_CONSTANTS.LINEAR_PIT_RATE;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;

    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(income, ipBoxCoeff);
    const taxBase = Math.max(regularIncome - healthDeduction, 0);
    const pitDetails = getLinearPitDetails(taxBase);
    const levyDetails = getSolidarityLevyDetails(taxBase);

    let text = `\nObliczenie podatku (podatek liniowy z IP BOX):\n`;
    text += `  Podział dochodu:\n`;
    text += `    - Dochód IP BOX (${ipBoxCoeff * 100}%): ${formatNumberPL(
      ipBoxIncome
    )}\n`;
    text += `    - Dochód pozostały (${
      (1 - ipBoxCoeff) * 100
    }%): ${formatNumberPL(regularIncome)}\n`;

    // IP BOX tax
    const ipBoxTax = taxMath.round2(ipBoxIncome * ipBoxRate);
    text += `\n  Podatek IP BOX:\n`;
    text += `    ${formatNumberPL(ipBoxIncome)} × ${formatPercentPL(
      ipBoxRate
    )} = ${formatNumberPL(ipBoxTax)}\n`;

    // Regular income tax (linear)
    text += `\n  Podatek od pozostałego dochodu (liniowy):\n`;
    text += `    Podstawa: ${formatNumberPL(regularIncome)} - ${formatNumberPL(
      healthDeduction
    )} = ${formatNumberPL(taxBase)}\n`;

    if (pitDetails.pitBase > 0) {
      text += `    Podatek liniowy ${formatPercentPL(linearRate)}: ${formatNumberPL(
        taxBase
      )} × ${formatPercentPL(
        linearRate
      )} = ${formatNumberPL(pitDetails.pit)}\n`;
    }

    if (levyDetails.levy > 0) {
      text += `    Danina solidarnościowa ${formatPercentPL(
        rateSolidarity
      )}: ${formatNumberPL(levyDetails.aboveThreshold)} × ${formatPercentPL(
        rateSolidarity
      )} = ${formatNumberPL(levyDetails.levy)}\n`;
    }

    const totalRegularTax = taxMath.round2(pitDetails.pit + levyDetails.levy);
    const totalTax = taxMath.round2(ipBoxTax + totalRegularTax);
    text +=
      levyDetails.levy > 0
        ? `\n  Łączny podatek i danina: ${formatNumberPL(
            ipBoxTax
          )} + ${formatNumberPL(pitDetails.pit)} + ${formatNumberPL(
            levyDetails.levy
          )} = ${formatNumberPL(totalTax)}\n`
        : `\n  Łączny podatek: ${formatNumberPL(
            ipBoxTax
          )} + ${formatNumberPL(totalRegularTax)} = ${formatNumberPL(
            totalTax
          )}\n`;

    const total = taxMath.round2(totalTax + healthLinear);
    text += `\nRAZEM (podatek + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  /**
   * Get ryczałt calculation breakdown for a single rate
   */
  function getRyczaltBreakdown(
    revenue,
    rate,
    rateName,
    healthDeduction,
    healthAnnual,
    isMultipleRates
  ) {
    const taxBase = Math.max(revenue - healthDeduction, 0);
    const tax = taxMath.round2(taxBase * rate);

    let text = `\nObliczenie ryczałtu (stawka ${rateName}):\n`;
    text += `  Przychód: ${formatNumberPL(revenue)}\n`;
    text += `  Odliczenie składki zdrowotnej: ${formatNumberPL(
      healthDeduction
    )}\n`;
    text += `  Podstawa opodatkowania: ${formatNumberPL(
      revenue
    )} - ${formatNumberPL(healthDeduction)} = ${formatNumberPL(taxBase)}\n`;
    text += `  Ryczałt: ${formatNumberPL(
      taxBase
    )} × ${rateName} = ${formatNumberPL(tax)}\n`;

    if (!isMultipleRates) {
      const total = taxMath.round2(tax + healthAnnual);
      text += `\nRAZEM (ryczałt + składka zdrowotna): ${formatNumberPL(
        total
      )}\n`;
    }

    return text;
  }

  /**
   * Get ryczałt 8.5%/12.5% calculation breakdown (mixed rate)
   */
  function getRyczalt85125Breakdown(
    revenue,
    healthDeduction,
    healthAnnual,
    isMultipleRates
  ) {
    const threshold = TAX_CONSTANTS.RYCZALT_8_5_THRESHOLD;
    const rate85 = TAX_CONSTANTS.RYCZALT_RATE_8_5;
    const rate125 = TAX_CONSTANTS.RYCZALT_RATE_12_5;

    let text = `\nObliczenie ryczałtu (stawka 8,5% i 12,5%):\n`;
    text += `  Przychód: ${formatNumberPL(revenue)}\n`;
    text += `  Próg dla stawki 8,5%: ${formatNumberPL(threshold)}\n`;
    text += `  Odliczenie składki zdrowotnej: ${formatNumberPL(
      healthDeduction
    )}\n`;

    let tax;
    if (revenue <= threshold) {
      const taxBase = Math.max(revenue - healthDeduction, 0);
      tax = taxMath.round2(taxBase * rate85);
      text += `  Cały przychód mieści się w progu 8,5%:\n`;
      text += `  Podstawa: ${formatNumberPL(taxBase)}\n`;
      text += `  Ryczałt: ${formatNumberPL(taxBase)} × 8,5% = ${formatNumberPL(
        tax
      )}\n`;
    } else {
      const tax85 = taxMath.round2(threshold * rate85);
      const above = revenue - threshold;
      const aboveBase = Math.max(above - healthDeduction, 0);
      const tax125 = taxMath.round2(aboveBase * rate125);
      tax = taxMath.round2(tax85 + tax125);

      text += `  Część do ${formatNumberPL(threshold)} (8,5%): ${formatNumberPL(
        threshold
      )} × 8,5% = ${formatNumberPL(tax85)}\n`;
      text += `  Część powyżej progu: ${formatNumberPL(above)}\n`;
      text += `  Po odliczeniu składki zdrowotnej: ${formatNumberPL(
        aboveBase
      )}\n`;
      text += `  Ryczałt 12,5%: ${formatNumberPL(
        aboveBase
      )} × 12,5% = ${formatNumberPL(tax125)}\n`;
      text += `  Suma ryczałtu: ${formatNumberPL(tax85)} + ${formatNumberPL(
        tax125
      )} = ${formatNumberPL(tax)}\n`;
    }

    if (!isMultipleRates) {
      const total = taxMath.round2(tax + healthAnnual);
      text += `\nRAZEM (ryczałt + składka zdrowotna): ${formatNumberPL(
        total
      )}\n`;
    }

    return text;
  }

  function getFormattedValues() {
    // Parse input values
    const revenueNum = parsePLN(DOM.revenueInput.value);
    const costsNum = parsePLN(DOM.costsInput.value);
    const incomeNum = revenueNum - costsNum;
    const ipBoxCoeffNum = parseFloat(DOM.ipBoxCoeffInput.value) / 100;
    const isJointTaxation = document.querySelector(".joint-taxation-card.show");
    const spouseIncomeNum = isJointTaxation
      ? parsePLN(document.getElementById("spouseIncome").value)
      : 0;
    const isMultipleRates = DOM.multipleRatesToggle.checked;

    // Get calculated health contributions
    const healthScaleData = getHealthScaleBreakdown(incomeNum);
    const healthLinearData = getHealthLinearBreakdown(incomeNum);

    // Determine ryczałt revenue (total allocated or full revenue)
    let ryczaltRevenueForHealth = revenueNum;
    if (isMultipleRates) {
      let totalAllocated = 0;
      document.querySelectorAll(".rate-input.show").forEach((input) => {
        totalAllocated += parsePLN(input.value) || 0;
      });
      ryczaltRevenueForHealth = totalAllocated;
    }
    const healthRyczaltData = getHealthRyczaltBreakdown(
      ryczaltRevenueForHealth
    );

    // Build output text
    let text = `=== DANE PODSTAWOWE ===\n`;
    text += `Przychód: ${formatNumberPL(revenueNum)}\n`;
    text += `Koszty: ${formatNumberPL(costsNum)}\n`;
    text += `Dochód: ${formatNumberPL(incomeNum)}\n`;
    if (isJointTaxation) {
      text += `Dochód małżonka: ${formatNumberPL(spouseIncomeNum)}\n`;
    }
    text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n`;

    // ==================== PODSUMOWANIE WYNIKÓW ====================
    text += `\n${"=".repeat(50)}\n`;
    text += `=== PODSUMOWANIE WYNIKÓW ===\n`;
    text += `${"=".repeat(50)}\n\n`;

    // Scale tax summary
    const taxScaleValue = document.getElementById("taxScale").value;
    const taxScaleIpBoxValue = document.getElementById("taxScaleIpBox").value;
    text += `SKALA PODATKOWA:\n`;
    if (isJointTaxation) {
      const taxScaleJointValue = document.getElementById("taxScaleJoint").value;
      const taxScaleIpBoxJointValue =
        document.getElementById("taxScaleIpBoxJoint").value;
      text += `  Indywidualnie: ${taxScaleValue}\n`;
      text += `  Indywidualnie (IP BOX): ${taxScaleIpBoxValue}\n`;
      text += `  Wspólnie z małżonkiem: ${taxScaleJointValue}\n`;
      text += `  Wspólnie z małżonkiem (IP BOX): ${taxScaleIpBoxJointValue}\n`;
    } else {
      text += `  Skala podatkowa: ${taxScaleValue}\n`;
      text += `  Skala podatkowa (IP BOX): ${taxScaleIpBoxValue}\n`;
    }

    // Linear tax summary
    const taxLinearValue = document.getElementById("taxLinear").value;
    const taxLinearIpBoxValue = document.getElementById("taxLinearIpBox").value;
    text += `\nPODATEK LINIOWY:\n`;
    text += `  Podatek liniowy: ${taxLinearValue}\n`;
    text += `  Podatek liniowy (IP BOX): ${taxLinearIpBoxValue}\n`;

    // Ryczałt summary
    const anyRyczaltVisible = Array.from(DOM.ryczaltCheckboxes).some(
      (checkbox) => checkbox.checked
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

      // Show total if multiple rates
      if (isMultipleRates) {
        const ratesTotalValue = document.getElementById("ratesTotalValue");
        if (ratesTotalValue) {
          text += `  ---\n`;
          text += `  SUMA (ryczałt + składka zdrowotna): ${ratesTotalValue.textContent}\n`;
        }
      }
    }

    // ==================== SZCZEGÓŁY OBLICZEŃ ====================
    text += `\n${"=".repeat(50)}\n`;
    text += `=== SZCZEGÓŁY OBLICZEŃ ===\n`;
    text += `${"=".repeat(50)}\n`;

    // ===== SKALA PODATKOWA =====
    text += `\n--- SKALA PODATKOWA ---\n`;
    text += `\nDochód: ${formatNumberPL(incomeNum)}\n\n`;
    text += healthScaleData.text;
    text += getScaleTaxBreakdown(incomeNum, healthScaleData.healthScale);

    // Scale tax with IP BOX
    if (ipBoxCoeffNum > 0) {
      text += `\n--- SKALA PODATKOWA (IP BOX) ---\n`;
      text += `\nDochód: ${formatNumberPL(incomeNum)}\n`;
      text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n\n`;
      text += healthScaleData.text;
      text += getIpBoxScaleBreakdown(
        incomeNum,
        ipBoxCoeffNum,
        healthScaleData.healthScale
      );
    }

    // Joint taxation
    if (isJointTaxation) {
      text += `\n--- SKALA PODATKOWA (WSPÓLNIE Z MAŁŻONKIEM) ---\n`;
      text += `\nDochód: ${formatNumberPL(incomeNum)}\n`;
      text += `Dochód małżonka: ${formatNumberPL(spouseIncomeNum)}\n\n`;
      text += healthScaleData.text;
      text += getScaleTaxJointBreakdown(
        incomeNum,
        spouseIncomeNum,
        healthScaleData.healthScale
      );

      // Joint with IP BOX
      if (ipBoxCoeffNum > 0) {
        text += `\n--- SKALA PODATKOWA Z IP BOX (WSPÓLNIE Z MAŁŻONKIEM) ---\n`;
        text += `\nDochód: ${formatNumberPL(incomeNum)}\n`;
        text += `Dochód małżonka: ${formatNumberPL(spouseIncomeNum)}\n`;
        text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n\n`;
        text += healthScaleData.text;
        text += getIpBoxScaleJointBreakdown(
          incomeNum,
          spouseIncomeNum,
          ipBoxCoeffNum,
          healthScaleData.healthScale
        );
      }
    }

    // ===== PODATEK LINIOWY =====
    text += `\n--- PODATEK LINIOWY ---\n`;
    text += `\nDochód: ${formatNumberPL(incomeNum)}\n\n`;
    text += healthLinearData.text;
    text += getLinearTaxBreakdown(
      incomeNum,
      healthLinearData.healthLinear,
      healthLinearData.healthDeduction
    );

    // Linear with IP BOX
    if (ipBoxCoeffNum > 0) {
      text += `\n--- PODATEK LINIOWY (IP BOX) ---\n`;
      text += `\nDochód: ${formatNumberPL(incomeNum)}\n`;
      text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n\n`;
      text += healthLinearData.text;
      text += getIpBoxLinearBreakdown(
        incomeNum,
        ipBoxCoeffNum,
        healthLinearData.healthLinear,
        healthLinearData.healthDeduction
      );
    }

    // ===== RYCZAŁT =====
    if (anyRyczaltVisible) {
      text += `\n--- RYCZAŁT ---\n`;
      text += `\nPrzychód: ${formatNumberPL(revenueNum)}\n`;
      if (isMultipleRates) {
        text += `(Tryb wielu stawek - obliczenia dla każdej stawki osobno)\n`;
      }
      text += `\n`;
      text += healthRyczaltData.text;

      // Show breakdown for each visible ryczałt rate
      ryczaltRates.forEach((rateInfo) => {
        const element = document.getElementById(rateInfo.id);
        if (
          element &&
          element.closest(".input-group").style.display !== "none"
        ) {
          let rateRevenue = revenueNum;
          if (isMultipleRates) {
            const rateInput = document.querySelector(
              `.rate-input[data-for="${rateInfo.id}"]`
            );
            rateRevenue = rateInput ? parsePLN(rateInput.value) || 0 : 0;
          }

          if (rateInfo.id === "ryczalt8_5_12_5") {
            text += getRyczalt85125Breakdown(
              rateRevenue,
              healthRyczaltData.deduction,
              healthRyczaltData.annualHealth,
              isMultipleRates
            );
          } else if (rateInfo.rate !== null) {
            text += getRyczaltBreakdown(
              rateRevenue,
              rateInfo.rate,
              rateInfo.label,
              healthRyczaltData.deduction,
              healthRyczaltData.annualHealth,
              isMultipleRates
            );
          }
        }
      });

      // Multiple rates total
      if (isMultipleRates) {
        text += `\n--- SUMA RYCZAŁTU (WIELE STAWEK) ---\n`;
        let totalAllocated = 0;
        let totalRyczalt = 0;
        document.querySelectorAll(".rate-input.show").forEach((input) => {
          totalAllocated += parsePLN(input.value) || 0;
        });
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
          totalAllocated
        )}\n`;
        text += `  Suma ryczałtu: ${formatNumberPL(totalRyczalt)}\n`;
        text += `  Składka zdrowotna: ${formatNumberPL(ratesHealth)}\n`;
        text += `  RAZEM: ${formatNumberPL(ratesTotal)}\n`;
      }
    }

    // Footer
    text += `\n${"=".repeat(50)}\n`;
    text += `Obliczenia wykonane kalkulatorem podatkowym 2026\n`;
    text += `Stan prawny: od ${TAX_CONSTANTS.EFFECTIVE_FROM}\n`;

    return text;
  }
  DOM.copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getFormattedValues());
      DOM.copySuccess.classList.add("show");
      setTimeout(() => {
        DOM.copySuccess.classList.remove("show");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy values:", err);
    }
  });
})();
