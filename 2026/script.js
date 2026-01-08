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
    C16: 0, // Składka zdrowotna - podatek liniowy
    C17: 0, // Składka zdrowotna - ryczałt
    C18: 0, // Składka zdrowotna - skala podatkowa
    F16: 0, // Maksymalna składka zdrowotna do odliczenia - podatek liniowy
    F17: 0, // Efektywna składka zdrowotna do odliczenia - podatek liniowy
    F18: 0, // Efektywna składka zdrowotna do odliczenia - ryczałt
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
    return spouseIncome <= 30000 ? 30000 - spouseIncome : 0;
  }
  function calculateSpouseFreeQuota12(spouseIncome) {
    if (spouseIncome <= 120000) {
      if (spouseIncome <= 30000) return 90000;
      return 90000 - (spouseIncome - 30000);
    }
    return 0;
  }
  function calculateSpouseFreeQuota32(spouseIncome) {
    if (spouseIncome <= 1000000) {
      if (spouseIncome <= 120000) return 880000;
      return 880000 - (spouseIncome - 120000);
    }
    return 0;
  }
  function calculateTaxWithSpouse(income, jointTaxation, spouseIncome, C18) {
    if (!jointTaxation) {
      return (
        Math.min(income, 30000) * 0 +
        Math.min(Math.max(income - 30000, 0), 90000) * 0.12 +
        Math.min(Math.max(income - 120000, 0), 880000) * 0.32 +
        Math.max(income - 1000000, 0) * 0.36 +
        C18
      );
    }
    const J11 = calculateSpouseFreeQuota0(spouseIncome);
    const K11 = calculateSpouseFreeQuota12(spouseIncome);
    const L11 = calculateSpouseFreeQuota32(spouseIncome);
    return (
      Math.min(income, 30000 + J11) * 0 +
      Math.min(Math.max(income - (30000 + J11), 0), 90000 + K11) * 0.12 +
      Math.min(
        Math.max(income - (30000 + J11) - (90000 + K11), 0),
        880000 + L11
      ) *
        0.32 +
      Math.max(income - (30000 + J11) - (90000 + K11) - (880000 + L11), 0) *
        0.36 +
      C18
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
    const healthContribLimit = 14100; // Maksymalna składka zdrowotna do odliczenia przy podatku liniowym
    let C16 = income / 12 <= 6427.67 ? 3779.52 : 0.049 * income;
    setCalculationValue("C16", C16);

    // Calculate C17 based on revenue
    let C17;
    if (revenue > 300000) C17 = 12 * 1384.97;
    else if (revenue > 60000) C17 = 12 * 769.43;
    else C17 = 12 * 461.66;
    setCalculationValue("C17", C17);

    let C18 = income / 12 <= 3499.5 ? 3779.52 : 0.09 * income;
    setCalculationValue("C18", C18);
    let F17 = Math.min(C16, healthContribLimit);
    setCalculationValue("F17", F17);

    // Calculate F18 based on multiple rates toggle
    let F18;
    if (DOM.multipleRatesToggle.checked) {
      let totalAllocatedRevenue = 0;
      document.querySelectorAll(".rate-input.show").forEach((input) => {
        totalAllocatedRevenue += parsePLN(input.value) || 0;
      });
      let ratesC17 =
        totalAllocatedRevenue > 300000
          ? 12 * 1339.6
          : totalAllocatedRevenue > 60000
          ? 12 * 744.22
          : 12 * 446.53;
      F18 = ratesC17 * 0.5;
    } else {
      F18 = C17 * 0.5;
    }
    setCalculationValue("F18", F18);

    let J3 = income * (1 - ipBoxCoeff);

    // Calculate tax values for individual and joint taxation
    let C6 = calculateTaxWithSpouse(
      income,
      false,
      0,
      getCalculationValue("C18")
    );
    document.getElementById("C6").value = formatPLN(C6);
    if (
      document.querySelector('input[name="jointTaxation"]:checked').value ===
      "yes"
    ) {
      let C6_joint = calculateTaxWithSpouse(
        income,
        true,
        parsePLN(document.getElementById("spouseIncome").value),
        getCalculationValue("C18")
      );
      document.getElementById("C6_joint").value = formatPLN(C6_joint);
    }

    let E6;
    if (income - F17 > 1000000) {
      E6 = (income - (F17 + 1000000)) * 0.279 + 0.239 * 1000000;
    } else if (income - F17 > 77096.4) {
      E6 = (income - F17) * 0.239;
    } else if (income - F17 > 0) {
      E6 = 3779.52 + (income - F17) * 0.19;
    } else {
      E6 = 3779.52;
    }
    document.getElementById("E6").value = formatPLN(E6);

    let F6 =
      income * ipBoxCoeff * 0.05 +
      Math.min(J3, 30000) * 0 +
      Math.min(Math.max(J3 - 30000, 0), 90000) * 0.12 +
      Math.min(Math.max(J3 - 120000, 0), 880000) * 0.32 +
      Math.max(J3 - 1000000, 0) * 0.36 +
      getCalculationValue("C18");
    document.getElementById("F6").value = formatPLN(F6);
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
      let F6_joint =
        income * ipBoxCoeff * 0.05 +
        Math.min(J3, 30000 + J11) * 0 +
        Math.min(Math.max(J3 - (30000 + J11), 0), 90000 + K11) * 0.12 +
        Math.min(
          Math.max(J3 - (30000 + J11) - (90000 + K11), 0),
          880000 + L11
        ) *
          0.32 +
        Math.max(J3 - (30000 + J11) - (90000 + K11) - (880000 + L11), 0) *
          0.36 +
        getCalculationValue("C18");
      document.getElementById("F6_joint").value = formatPLN(F6_joint);
    }

    function calculateG6(income, ipBoxCoeff, F17) {
      if (income - F17 > 77096.4) {
        const ipBoxPart = income * ipBoxCoeff * 0.099;
        const standardIncome = income * (1 - ipBoxCoeff) - F17;
        const standardPart =
          standardIncome > 1000000
            ? (standardIncome - 1000000) * 0.279 + 0.239 * 1000000
            : Math.max(standardIncome * 0.239, 0);
        return ipBoxPart + standardPart;
      } else if (income > 0) {
        const ipBoxPart = income * ipBoxCoeff * 0.05;
        const standardPart =
          Math.max(income * (1 - ipBoxCoeff) - F17, 0) * 0.19;
        return ipBoxPart + standardPart + 3779.52;
      } else {
        return 3779.52;
      }
    }
    let G6 = calculateG6(income, ipBoxCoeff, F17);
    document.getElementById("G6").value = formatPLN(G6);

    let allocatedRevenues = {};
    if (DOM.multipleRatesToggle.checked) {
      const totalRevenue = parsePLN(DOM.revenueInput.value);
      let usedRevenue = 0;
      const rateInputsVisible = document.querySelectorAll(".rate-input.show");
      rateInputsVisible.forEach((input) => {
        const allocatedValue = parsePLN(input.value) || 0;
        usedRevenue += allocatedValue;
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
        getAllocatedOrFullRateValue("C9") - getCalculationValue("F18"),
        0
      );
      let C9 = base * 0.02;
      if (!DOM.multipleRatesToggle.checked) C9 += getCalculationValue("C17");
      document.getElementById("C9").value = formatPLN(C9);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("D9") - getCalculationValue("F18"),
        0
      );
      let D9 = base * 0.03;
      if (!DOM.multipleRatesToggle.checked) D9 += getCalculationValue("C17");
      document.getElementById("D9").value = formatPLN(D9);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("E9") - getCalculationValue("F18"),
        0
      );
      let E9 = base * 0.055;
      if (!DOM.multipleRatesToggle.checked) E9 += getCalculationValue("C17");
      document.getElementById("E9").value = formatPLN(E9);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("F9") - getCalculationValue("F18"),
        0
      );
      let F9 = base * 0.085;
      if (!DOM.multipleRatesToggle.checked) F9 += getCalculationValue("C17");
      document.getElementById("F9").value = formatPLN(F9);
    }
    {
      let allocated = getAllocatedOrFullRateValue("G9");
      let G9;
      if (allocated <= 100000) {
        G9 = Math.max(allocated - getCalculationValue("F18"), 0) * 0.085;
      } else {
        G9 =
          Math.max(allocated - (getCalculationValue("F18") + 100000), 0) *
            0.125 +
          8500;
      }
      if (!DOM.multipleRatesToggle.checked) G9 += getCalculationValue("C17");
      document.getElementById("G9").value = formatPLN(G9);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("C11") - getCalculationValue("F18"),
        0
      );
      let C11 = base * 0.1;
      if (!DOM.multipleRatesToggle.checked) C11 += getCalculationValue("C17");
      document.getElementById("C11").value = formatPLN(C11);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("D11") - getCalculationValue("F18"),
        0
      );
      let D11 = base * 0.12;
      if (!DOM.multipleRatesToggle.checked) D11 += getCalculationValue("C17");
      document.getElementById("D11").value = formatPLN(D11);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("E11") - getCalculationValue("F18"),
        0
      );
      let E11 = base * 0.14;
      if (!DOM.multipleRatesToggle.checked) E11 += getCalculationValue("C17");
      document.getElementById("E11").value = formatPLN(E11);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("F11") - getCalculationValue("F18"),
        0
      );
      let F11 = base * 0.15;
      if (!DOM.multipleRatesToggle.checked) F11 += getCalculationValue("C17");
      document.getElementById("F11").value = formatPLN(F11);
    }
    {
      let base = Math.max(
        getAllocatedOrFullRateValue("G11") - getCalculationValue("F18"),
        0
      );
      let G11 = base * 0.17;
      if (!DOM.multipleRatesToggle.checked) G11 += getCalculationValue("C17");
      document.getElementById("G11").value = formatPLN(G11);
    }

    updateRatesTotal(getCalculationValue("C17"));
  }

  /* ==================================================
     Update Rates Total
  ================================================== */
  function updateRatesTotal(C17) {
    const ratesTotalElement = document.getElementById("ratesTotal");
    const ratesTotalValueElement = document.getElementById("ratesTotalValue");
    const ratesC17ValueElement = document.getElementById("ratesC17Value");

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

    let ratesC17 =
      totalAllocatedRevenue > 300000
        ? 12 * 1339.6
        : totalAllocatedRevenue > 60000
        ? 12 * 744.22
        : 12 * 446.53;

    const rateIds = [
      "C9",
      "D9",
      "E9",
      "F9",
      "G9",
      "C11",
      "D11",
      "E11",
      "F11",
      "G11",
    ];
    let total = 0;
    rateIds.forEach((id) => {
      const input = document.getElementById(id);
      if (input && input.closest(".input-group").style.display !== "none") {
        total += parsePLN(input.value);
      }
    });

    ratesTotalElement.classList.remove("hidden");
    ratesC17ValueElement.textContent = formatPLN(ratesC17);
    ratesTotalValueElement.textContent = formatPLN(total + ratesC17);
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
  function getFormattedValues() {
    const revenue = DOM.revenueInput.value;
    const costs = DOM.costsInput.value;
    const income = document.getElementById("income").value;
    const ipBoxCoeff = DOM.ipBoxCoeffInput.value;
    const isJointTaxation = document.querySelector(".joint-taxation-card.show");

    let text = `=== DANE PODSTAWOWE ===\n`;
    text += `Przychód: ${revenue}\n`;
    text += `Koszty: ${costs}\n`;
    text += `Dochód: ${income}\n`;
    if (isJointTaxation) {
      const spouseIncome = document.getElementById("spouseIncome").value;
      text += `Dochód małżonka: ${spouseIncome}\n`;
    }
    text += `Współczynnik IP BOX: ${ipBoxCoeff}%\n\n`;

    text += `=== SKALA PODATKOWA ===\n`;
    const c6 = document.getElementById("C6").value;
    const f6 = document.getElementById("F6").value;
    if (isJointTaxation) {
      const c6Joint = document.getElementById("C6_joint").value;
      const f6Joint = document.getElementById("F6_joint").value;
      text += `Indywidualnie:\n`;
      text += `  Skala podatkowa: ${c6}\n`;
      text += `  Skala podatkowa (IP BOX): ${f6}\n`;
      text += `Wspólnie z małżonkiem:\n`;
      text += `  Skala podatkowa: ${c6Joint}\n`;
      text += `  Skala podatkowa (IP BOX): ${f6Joint}\n`;
    } else {
      text += `Skala podatkowa: ${c6}\n`;
      text += `Skala podatkowa (IP BOX): ${f6}\n`;
    }

    text += `\n=== PODATEK LINIOWY ===\n`;
    const e6 = document.getElementById("E6").value;
    const g6 = document.getElementById("G6").value;
    text += `Podatek liniowy: ${e6}\n`;
    text += `Podatek liniowy (IP BOX): ${g6}\n`;

    const anyRyczaltVisible = Array.from(DOM.ryczaltCheckboxes).some(
      (checkbox) => checkbox.checked
    );
    if (anyRyczaltVisible) {
      text += `\n=== RYCZAŁT ===\n`;
      const ryczaltRates = [
        { id: "C9", label: "2%" },
        { id: "D9", label: "3%" },
        { id: "E9", label: "5,5%" },
        { id: "F9", label: "8,5%" },
        { id: "G9", label: "8,5% i 12,5%" },
        { id: "C11", label: "10%" },
        { id: "D11", label: "12%" },
        { id: "E11", label: "14%" },
        { id: "F11", label: "15%" },
        { id: "G11", label: "17%" },
      ];
      ryczaltRates.forEach((rate) => {
        const element = document.getElementById(rate.id);
        if (
          element &&
          element.closest(".input-group").style.display !== "none"
        ) {
          text += `${rate.label}: ${element.value}\n`;
        }
      });
    }
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
