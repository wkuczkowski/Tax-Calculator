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
  function calculateSpouseFreeQuota0(spouseIncome) {
    return spouseIncome <= TAX_CONSTANTS.TAX_FREE_AMOUNT
      ? TAX_CONSTANTS.TAX_FREE_AMOUNT - spouseIncome
      : 0;
  }
  function calculateSpouseFreeQuota12(spouseIncome) {
    if (spouseIncome <= TAX_CONSTANTS.TAX_THRESHOLD_12) {
      if (spouseIncome <= TAX_CONSTANTS.TAX_FREE_AMOUNT) return TAX_BAND_12;
      return TAX_BAND_12 - (spouseIncome - TAX_CONSTANTS.TAX_FREE_AMOUNT);
    }
    return 0;
  }
  function calculateSpouseFreeQuota32(spouseIncome) {
    if (spouseIncome <= TAX_CONSTANTS.SOLIDARITY_THRESHOLD) {
      if (spouseIncome <= TAX_CONSTANTS.TAX_THRESHOLD_12) return TAX_BAND_32;
      return TAX_BAND_32 - (spouseIncome - TAX_CONSTANTS.TAX_THRESHOLD_12);
    }
    return 0;
  }
  function calculateTaxWithSpouse(
    income,
    jointTaxation,
    spouseIncome,
    healthScale
  ) {
    const taxFree = TAX_CONSTANTS.TAX_FREE_AMOUNT;
    const band12 = TAX_BAND_12;
    const band32 = TAX_BAND_32;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = PIT_RATE_SOLIDARITY;
    const solidarityThreshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;

    if (!jointTaxation) {
      return (
        Math.min(income, taxFree) * 0 +
        Math.min(Math.max(income - taxFree, 0), band12) * rate12 +
        Math.min(Math.max(income - taxFree - band12, 0), band32) * rate32 +
        Math.max(income - solidarityThreshold, 0) * rateSolidarity +
        healthScale
      );
    }
    const J11 = calculateSpouseFreeQuota0(spouseIncome);
    const K11 = calculateSpouseFreeQuota12(spouseIncome);
    const L11 = calculateSpouseFreeQuota32(spouseIncome);
    return (
      Math.min(income, taxFree + J11) * 0 +
      Math.min(Math.max(income - (taxFree + J11), 0), band12 + K11) * rate12 +
      Math.min(
        Math.max(income - (taxFree + J11) - (band12 + K11), 0),
        band32 + L11
      ) *
        rate32 +
      Math.max(income - (taxFree + J11) - (band12 + K11) - (band32 + L11), 0) *
        rateSolidarity +
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

    let J3 = income * (1 - ipBoxCoeff);

    // Calculate tax values for individual and joint taxation
    let taxScale = calculateTaxWithSpouse(
      income,
      false,
      0,
      getCalculationValue("healthScale")
    );
    document.getElementById("taxScale").value = formatPLN(taxScale);
    if (
      document.querySelector('input[name="jointTaxation"]:checked').value ===
      "yes"
    ) {
      let taxScaleJoint = calculateTaxWithSpouse(
        income,
        true,
        parsePLN(document.getElementById("spouseIncome").value),
        getCalculationValue("healthScale")
      );
      document.getElementById("taxScaleJoint").value = formatPLN(taxScaleJoint);
    }

    let taxLinear;
    const solidarityThreshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;

    // Calculate PIT for linear tax (separate from health contribution)
    const taxBase = Math.max(income - healthLinearDeduction, 0);
    let linearPit = 0;

    if (taxBase > solidarityThreshold) {
      // PIT with solidarity tax above threshold
      linearPit =
        solidarityThreshold * TAX_CONSTANTS.LINEAR_PIT_RATE +
        (taxBase - solidarityThreshold) *
          (TAX_CONSTANTS.LINEAR_PIT_RATE + TAX_CONSTANTS.SOLIDARITY_RATE);
    } else {
      linearPit = taxBase * TAX_CONSTANTS.LINEAR_PIT_RATE;
    }

    // Total = PIT + health contribution (health already calculated on full income)
    taxLinear = linearPit + healthLinear;
    document.getElementById("taxLinear").value = formatPLN(taxLinear);

    let taxScaleIpBox =
      income * ipBoxCoeff * TAX_CONSTANTS.IP_BOX_RATE +
      Math.min(J3, TAX_CONSTANTS.TAX_FREE_AMOUNT) * 0 +
      Math.min(Math.max(J3 - TAX_CONSTANTS.TAX_FREE_AMOUNT, 0), TAX_BAND_12) *
        TAX_CONSTANTS.PIT_RATE_12 +
      Math.min(Math.max(J3 - TAX_CONSTANTS.TAX_THRESHOLD_12, 0), TAX_BAND_32) *
        TAX_CONSTANTS.PIT_RATE_32 +
      Math.max(J3 - TAX_CONSTANTS.SOLIDARITY_THRESHOLD, 0) *
        PIT_RATE_SOLIDARITY +
      getCalculationValue("healthScale");
    document.getElementById("taxScaleIpBox").value = formatPLN(taxScaleIpBox);
    if (
      document.querySelector('input[name="jointTaxation"]:checked').value ===
      "yes"
    ) {
      const spouseIncome = parsePLN(
        document.getElementById("spouseIncome").value
      );
      const J11 = calculateSpouseFreeQuota0(spouseIncome);
      const K11 = calculateSpouseFreeQuota12(spouseIncome);
      const L11 = calculateSpouseFreeQuota32(spouseIncome);
      const taxFree = TAX_CONSTANTS.TAX_FREE_AMOUNT;
      const band12 = TAX_BAND_12;
      const band32 = TAX_BAND_32;
      let taxScaleIpBoxJoint =
        income * ipBoxCoeff * TAX_CONSTANTS.IP_BOX_RATE +
        Math.min(J3, taxFree + J11) * 0 +
        Math.min(Math.max(J3 - (taxFree + J11), 0), band12 + K11) *
          TAX_CONSTANTS.PIT_RATE_12 +
        Math.min(
          Math.max(J3 - (taxFree + J11) - (band12 + K11), 0),
          band32 + L11
        ) *
          TAX_CONSTANTS.PIT_RATE_32 +
        Math.max(J3 - (taxFree + J11) - (band12 + K11) - (band32 + L11), 0) *
          PIT_RATE_SOLIDARITY +
        getCalculationValue("healthScale");
      document.getElementById("taxScaleIpBoxJoint").value =
        formatPLN(taxScaleIpBoxJoint);
    }

    function calculateLinearIpBox(
      income,
      ipBoxCoeff,
      healthLinearDeduction,
      healthLinear
    ) {
      const solidarityThreshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;

      const ipBoxIncome = income * ipBoxCoeff;
      const standardIncome = income * (1 - ipBoxCoeff);
      const standardTaxBase = Math.max(
        standardIncome - healthLinearDeduction,
        0
      );

      // IP BOX PIT (5% only, health is calculated separately on full income)
      const ipBoxPit = ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE;

      // Standard PIT (19% + solidarity if applicable)
      let standardPit = 0;
      if (standardTaxBase > solidarityThreshold) {
        standardPit =
          solidarityThreshold * TAX_CONSTANTS.LINEAR_PIT_RATE +
          (standardTaxBase - solidarityThreshold) *
            (TAX_CONSTANTS.LINEAR_PIT_RATE + TAX_CONSTANTS.SOLIDARITY_RATE);
      } else {
        standardPit = standardTaxBase * TAX_CONSTANTS.LINEAR_PIT_RATE;
      }

      // Total = IP BOX PIT + Standard PIT + Health (health on full income)
      return ipBoxPit + standardPit + healthLinear;
    }
    let taxLinearIpBox = calculateLinearIpBox(
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
    const solidarityThreshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;

    let text = `\nObliczenie podatku (skala podatkowa):\n`;

    // Tax-free amount
    const inTaxFree = Math.min(income, taxFree);
    text += `  Kwota wolna (do ${formatNumberPL(taxFree)}): ${formatNumberPL(
      inTaxFree
    )} × 0% = 0,00 zł\n`;

    // 12% bracket
    let tax12 = 0;
    if (income > taxFree) {
      const in12Bracket = Math.min(income - taxFree, threshold12 - taxFree);
      tax12 = taxMath.round2(in12Bracket * rate12);
      text += `  I próg ${formatPercentPL(rate12)} (${formatNumberPL(
        taxFree + 1
      )} - ${formatNumberPL(threshold12)}): ${formatNumberPL(
        in12Bracket
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(tax12)}\n`;
    }

    // 32% bracket
    let tax32 = 0;
    if (income > threshold12) {
      const in32Bracket = Math.min(
        income - threshold12,
        solidarityThreshold - threshold12
      );
      tax32 = taxMath.round2(in32Bracket * rate32);
      text += `  II próg ${formatPercentPL(rate32)} (${formatNumberPL(
        threshold12 + 1
      )} - ${formatNumberPL(solidarityThreshold)}): ${formatNumberPL(
        in32Bracket
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(tax32)}\n`;
    }

    // Solidarity tax
    let taxSolidarity = 0;
    if (income > solidarityThreshold) {
      const inSolidarity = income - solidarityThreshold;
      taxSolidarity = taxMath.round2(inSolidarity * rateSolidarity);
      text += `  Danina solidarnościowa ${formatPercentPL(
        rateSolidarity
      )} (powyżej ${formatNumberPL(solidarityThreshold)}): ${formatNumberPL(
        inSolidarity
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        taxSolidarity
      )}\n`;
    }

    const totalTax = taxMath.round2(tax12 + tax32 + taxSolidarity);
    text += `  Suma podatku: ${formatNumberPL(totalTax)}\n`;

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
    const solidarityThreshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;

    const J11 = calculateSpouseFreeQuota0(spouseIncome);
    const K11 = calculateSpouseFreeQuota12(spouseIncome);
    const L11 = calculateSpouseFreeQuota32(spouseIncome);

    let text = `\nObliczenie podatku (skala podatkowa - wspólnie z małżonkiem):\n`;
    text += `  Dochód małżonka: ${formatNumberPL(spouseIncome)}\n`;

    // Explain spouse quota transfer
    if (J11 > 0 || K11 > 0 || L11 > 0) {
      text += `  Niewykorzystane kwoty z rozliczenia małżonka:\n`;
      if (J11 > 0) text += `    - z kwoty wolnej: ${formatNumberPL(J11)}\n`;
      if (K11 > 0) text += `    - z I progu (12%): ${formatNumberPL(K11)}\n`;
      if (L11 > 0) text += `    - z II progu (32%): ${formatNumberPL(L11)}\n`;
    }

    // Extended tax-free amount
    const extendedTaxFree = taxFree + J11;
    const inTaxFree = Math.min(income, extendedTaxFree);
    text += `  Kwota wolna (do ${formatNumberPL(
      extendedTaxFree
    )}): ${formatNumberPL(inTaxFree)} × 0% = 0,00 zł\n`;

    // Extended 12% bracket
    let tax12 = 0;
    const band12Extended = TAX_BAND_12 + K11;
    if (income > extendedTaxFree) {
      const in12Bracket = Math.min(income - extendedTaxFree, band12Extended);
      tax12 = taxMath.round2(in12Bracket * rate12);
      text += `  I próg ${formatPercentPL(rate12)}: ${formatNumberPL(
        in12Bracket
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(tax12)}\n`;
    }

    // Extended 32% bracket
    let tax32 = 0;
    const band32Extended = TAX_BAND_32 + L11;
    if (income > extendedTaxFree + band12Extended) {
      const in32Bracket = Math.min(
        income - extendedTaxFree - band12Extended,
        band32Extended
      );
      tax32 = taxMath.round2(in32Bracket * rate32);
      text += `  II próg ${formatPercentPL(rate32)}: ${formatNumberPL(
        in32Bracket
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(tax32)}\n`;
    }

    // Solidarity tax
    let taxSolidarity = 0;
    if (income > extendedTaxFree + band12Extended + band32Extended) {
      const inSolidarity =
        income - extendedTaxFree - band12Extended - band32Extended;
      taxSolidarity = taxMath.round2(inSolidarity * rateSolidarity);
      text += `  Danina solidarnościowa ${formatPercentPL(
        rateSolidarity
      )}: ${formatNumberPL(inSolidarity)} × ${formatPercentPL(
        rateSolidarity
      )} = ${formatNumberPL(taxSolidarity)}\n`;
    }

    const totalTax = taxMath.round2(tax12 + tax32 + taxSolidarity);
    text += `  Suma podatku: ${formatNumberPL(totalTax)}\n`;

    const total = taxMath.round2(totalTax + healthScale);
    text += `\nRAZEM (podatek + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  /**
   * Get linear tax calculation breakdown
   */
  function getLinearTaxBreakdown(income, healthLinear, healthDeduction) {
    const linearRate = TAX_CONSTANTS.LINEAR_PIT_RATE;
    const solidarityThreshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;
    const minHealth = taxMath.getMinHealthAnnual();
    const minHealthThreshold = taxMath.getMinHealthThresholdLinearAnnual();

    let text = `\nObliczenie podatku (podatek liniowy):\n`;

    const taxBase = Math.max(income - healthDeduction, 0);
    text += `  Podstawa opodatkowania: ${formatNumberPL(
      income
    )} - ${formatNumberPL(healthDeduction)} = ${formatNumberPL(taxBase)}\n`;

    let linearTax = 0;
    let solidarityTax = 0;

    if (taxBase > solidarityThreshold) {
      const baseBeforeSolidarity = solidarityThreshold;
      const baseInSolidarity = taxBase - solidarityThreshold;
      linearTax = taxMath.round2(baseBeforeSolidarity * linearRate);
      solidarityTax = taxMath.round2(
        baseInSolidarity * (linearRate + rateSolidarity)
      );
      text += `  Podatek ${formatPercentPL(linearRate)} (do ${formatNumberPL(
        solidarityThreshold
      )}): ${formatNumberPL(baseBeforeSolidarity)} × ${formatPercentPL(
        linearRate
      )} = ${formatNumberPL(linearTax)}\n`;
      text += `  Podatek ${formatPercentPL(
        linearRate + rateSolidarity
      )} (powyżej ${formatNumberPL(
        solidarityThreshold
      )}, w tym danina solidarnościowa): ${formatNumberPL(
        baseInSolidarity
      )} × ${formatPercentPL(linearRate + rateSolidarity)} = ${formatNumberPL(
        solidarityTax
      )}\n`;
    } else {
      linearTax = taxMath.round2(taxBase * linearRate);
      text += `  Podatek ${formatPercentPL(linearRate)}: ${formatNumberPL(
        taxBase
      )} × ${formatPercentPL(linearRate)} = ${formatNumberPL(linearTax)}\n`;
    }

    const totalTax = taxMath.round2(linearTax + solidarityTax);
    text += `  Suma podatku: ${formatNumberPL(totalTax)}\n`;

    const total = taxMath.round2(totalTax + healthLinear);
    text += `\nRAZEM (podatek + składka zdrowotna): ${formatNumberPL(total)}\n`;

    return text;
  }

  /**
   * Get IP BOX scale tax calculation breakdown
   */
  function getIpBoxScaleBreakdown(income, ipBoxCoeff, healthScale) {
    const ipBoxRate = TAX_CONSTANTS.IP_BOX_RATE;
    const taxFree = TAX_CONSTANTS.TAX_FREE_AMOUNT;
    const threshold12 = TAX_CONSTANTS.TAX_THRESHOLD_12;
    const solidarityThreshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;

    const ipBoxIncome = taxMath.round2(income * ipBoxCoeff);
    const regularIncome = taxMath.round2(income * (1 - ipBoxCoeff));

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

    const inTaxFree = Math.min(regularIncome, taxFree);
    text += `    Kwota wolna (do ${formatNumberPL(taxFree)}): ${formatNumberPL(
      inTaxFree
    )} × 0% = 0,00 zł\n`;

    let tax12 = 0;
    if (regularIncome > taxFree) {
      const in12Bracket = Math.min(
        regularIncome - taxFree,
        threshold12 - taxFree
      );
      tax12 = taxMath.round2(in12Bracket * rate12);
      text += `    I próg ${formatPercentPL(rate12)}: ${formatNumberPL(
        in12Bracket
      )} × ${formatPercentPL(rate12)} = ${formatNumberPL(tax12)}\n`;
    }

    let tax32 = 0;
    if (regularIncome > threshold12) {
      const in32Bracket = Math.min(
        regularIncome - threshold12,
        solidarityThreshold - threshold12
      );
      tax32 = taxMath.round2(in32Bracket * rate32);
      text += `    II próg ${formatPercentPL(rate32)}: ${formatNumberPL(
        in32Bracket
      )} × ${formatPercentPL(rate32)} = ${formatNumberPL(tax32)}\n`;
    }

    let taxSolidarity = 0;
    if (regularIncome > solidarityThreshold) {
      const inSolidarity = regularIncome - solidarityThreshold;
      taxSolidarity = taxMath.round2(inSolidarity * rateSolidarity);
      text += `    Danina solidarnościowa: ${formatNumberPL(
        inSolidarity
      )} × ${formatPercentPL(rateSolidarity)} = ${formatNumberPL(
        taxSolidarity
      )}\n`;
    }

    const regularTax = taxMath.round2(tax12 + tax32 + taxSolidarity);
    text += `    Suma podatku od pozostałego dochodu: ${formatNumberPL(
      regularTax
    )}\n`;

    const totalTax = taxMath.round2(ipBoxTax + regularTax);
    text += `\n  Łączny podatek: ${formatNumberPL(ipBoxTax)} + ${formatNumberPL(
      regularTax
    )} = ${formatNumberPL(totalTax)}\n`;

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
    const solidarityThreshold = TAX_CONSTANTS.SOLIDARITY_THRESHOLD;
    const rateSolidarity = TAX_CONSTANTS.SOLIDARITY_RATE;

    const ipBoxIncome = taxMath.round2(income * ipBoxCoeff);
    const regularIncome = taxMath.round2(income * (1 - ipBoxCoeff));
    const taxBase = Math.max(regularIncome - healthDeduction, 0);

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

    let regularTax = 0;
    let solidarityTax = 0;

    if (taxBase > solidarityThreshold) {
      const baseBeforeSolidarity = solidarityThreshold;
      const baseInSolidarity = taxBase - solidarityThreshold;
      regularTax = taxMath.round2(baseBeforeSolidarity * linearRate);
      solidarityTax = taxMath.round2(
        baseInSolidarity * (linearRate + rateSolidarity)
      );
      text += `    Podatek ${formatPercentPL(linearRate)} (do ${formatNumberPL(
        solidarityThreshold
      )}): ${formatNumberPL(regularTax)}\n`;
      text += `    + danina solidarnościowa: ${formatNumberPL(
        solidarityTax
      )}\n`;
    } else {
      regularTax = taxMath.round2(taxBase * linearRate);
      text += `    ${formatNumberPL(taxBase)} × ${formatPercentPL(
        linearRate
      )} = ${formatNumberPL(regularTax)}\n`;
    }

    const totalRegularTax = taxMath.round2(regularTax + solidarityTax);
    const totalTax = taxMath.round2(ipBoxTax + totalRegularTax);
    text += `\n  Łączny podatek: ${formatNumberPL(ipBoxTax)} + ${formatNumberPL(
      totalRegularTax
    )} = ${formatNumberPL(totalTax)}\n`;

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
        text += `Współczynnik IP BOX: ${ipBoxCoeffNum * 100}%\n`;
        text += `\n(Obliczenie analogiczne do skali z IP BOX, z uwzględnieniem niewykorzystanych kwot małżonka)\n`;
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
