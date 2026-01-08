// Element references
const resultsSection = document.getElementById("resultsSection");
const calculateButton = document.getElementById("calculateButton");
const revenueInput = document.getElementById("revenue");
const costsInput = document.getElementById("costs");
const ipBoxCoeffInput = document.getElementById("ipBoxCoeff");
const ipBoxEdit = document.getElementById("ipBoxEdit");
const ipBoxContainer = document.getElementById("ipBoxContainer");
const ryczaltCheckboxes = document.querySelectorAll(
  '.checkbox-group input[type="checkbox"]'
);
const ryczaltMessage = document.getElementById("ryczalt-message");
const jointTaxationRadios = document.querySelectorAll(
  'input[name="jointTaxation"]'
);
const spouseIncomeCard = document.getElementById("spouseIncomeCard");
const spouseIncomeInput = document.getElementById("spouseIncome");
const multipleRatesToggle = document.getElementById("multipleRatesToggle");
const rateInputs = document.querySelectorAll(".rate-input");
const revenueInfoText = document.querySelector(
  ".multiple-rates-revenue-info p"
);

// Variables
let previousIncome = null;
let initialIncome = null;
let initialRevenue = null;
let initialCosts = null;
let initialC6 = null;
let initialF6 = null;
let initialD6 = null;
let initialH6 = null;
let initialE6 = null;
let initialG6 = null;
let initialC9 = null;
let initialD9 = null;
let initialE9 = null;
let initialF9 = null;
let initialG9 = null;
let initialC11 = null;
let initialD11 = null;
let initialE11 = null;
let initialF11 = null;
let initialG11 = null;
let initialC6_joint = null;
let initialF6_joint = null;

// Utility functions
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
  ipBoxCoeffInput.classList.remove("error");
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
    ipBoxCoeffInput.classList.add("error");
    errorElement.classList.add("visible");
  }
  return isValid;
}

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

function makeIpBoxReadonly() {
  if (!ipBoxCoeffInput.hasAttribute("readonly")) {
    ipBoxCoeffInput.setAttribute("readonly", "");
    ipBoxCoeffInput.classList.remove("editable");
    ipBoxEdit.textContent = "✎";
    if (validateIpBoxCoeff(ipBoxCoeffInput.value)) calculate();
  }
}

function updateDifferenceDisplay(elementId, diff) {
  let diffContainer = document.getElementById(`${elementId}-diff`);
  if (!diffContainer) {
    diffContainer = document.createElement("div");
    diffContainer.id = `${elementId}-diff`;
    diffContainer.className = "income-diff";
    document.getElementById(elementId).parentNode.appendChild(diffContainer);
  }
  if (Math.abs(diff) > 0.01) {
    diffContainer.textContent = `${diff > 0 ? "+" : ""}${formatPLN(diff)}`;
    diffContainer.style.display = "inline";
  } else {
    diffContainer.style.display = "none";
  }
}

function updateRemainingRevenue() {
  const totalRevenue = parsePLN(revenueInput.value);
  const rateInputsShown = document.querySelectorAll(".rate-input.show");
  let usedRevenue = 0;
  rateInputsShown.forEach((input) => {
    if (input.value) usedRevenue += parsePLN(input.value);
  });
  const difference = usedRevenue - totalRevenue;
  if (difference > 0) {
    revenueInfoText.innerHTML = `<span style="color: var(--app-error)">Przekroczono przychód o: ${formatPLN(
      difference
    )}</span>`;
  } else {
    const remainingRevenue = totalRevenue - usedRevenue;
    revenueInfoText.textContent = `Przychód do rozdysponowania: ${formatPLN(
      remainingRevenue
    )}`;
  }
}

function handleCalculate() {
  const isRevenueValid = validateInput(revenueInput.value, "revenue");
  const isCostsValid = validateInput(costsInput.value, "costs");
  const isIpBoxValid = validateIpBoxCoeff(ipBoxCoeffInput.value);

  if (isRevenueValid && isCostsValid && isIpBoxValid) {
    initialRevenue = parsePLN(revenueInput.value);
    initialCosts = parsePLN(costsInput.value);
    initialIncome = initialRevenue - initialCosts;

    document.getElementById(
      "revenue-initial"
    ).textContent = `Wartość początkowa: ${formatPLN(initialRevenue)}`;
    document.getElementById(
      "costs-initial"
    ).textContent = `Wartość początkowa: ${formatPLN(initialCosts)}`;

    // Perform the initial calculation with the current settings
    calculate();

    // Set initial values for standard and IP BOX calculations
    initialC6 = parsePLN(document.getElementById("C6").value);
    initialF6 = parsePLN(document.getElementById("F6").value);
    initialE6 = parsePLN(document.getElementById("E6").value);
    initialG6 = parsePLN(document.getElementById("G6").value);

    initialC9 = parsePLN(document.getElementById("C9").value);
    initialD9 = parsePLN(document.getElementById("D9").value);
    initialE9 = parsePLN(document.getElementById("E9").value);
    initialF9 = parsePLN(document.getElementById("F9").value);
    initialG9 = parsePLN(document.getElementById("G9").value);

    initialC11 = parsePLN(document.getElementById("C11").value);
    initialD11 = parsePLN(document.getElementById("D11").value);
    initialE11 = parsePLN(document.getElementById("E11").value);
    initialF11 = parsePLN(document.getElementById("F11").value);
    initialG11 = parsePLN(document.getElementById("G11").value);

    // Now we calculate initialC6_joint and initialF6_joint as if jointTaxation = "yes"
    // even if it's currently "no".

    // Retrieve necessary values from the current state
    let spouseIncome = parsePLN(document.getElementById("spouseIncome").value);
    if (isNaN(spouseIncome)) {
      spouseIncome = 0;
    }
    let C18 = parsePLN(document.getElementById("C18").value);
    let ipBoxCoeff =
      parseFloat(document.getElementById("ipBoxCoeff").value) / 100;
    let J3 = initialIncome * (1 - ipBoxCoeff);

    // Calculate C6_joint assuming joint taxation = true
    let C6_joint_val = calculateTaxWithSpouse(
      initialIncome,
      true,
      spouseIncome,
      C18
    );

    // Calculate F6_joint assuming joint taxation = true
    const J11 = calculateSpouseFreeQuota0(spouseIncome);
    const K11 = calculateSpouseFreeQuota12(spouseIncome);
    const L11 = calculateSpouseFreeQuota32(spouseIncome);

    let F6_joint_val =
      initialIncome * ipBoxCoeff * 0.05 +
      Math.min(J3, 30000 + J11) * 0 +
      Math.min(Math.max(J3 - (30000 + J11), 0), 90000 + K11) * 0.12 +
      Math.min(Math.max(J3 - (30000 + J11) - (90000 + K11), 0), 880000 + L11) *
        0.32 +
      Math.max(J3 - (30000 + J11) - (90000 + K11) - (880000 + L11), 0) * 0.36 +
      C18;

    // Store these values as initial values
    initialC6_joint = C6_joint_val;
    initialF6_joint = F6_joint_val;

    resultsSection.classList.remove("hidden");
    calculateButton.style.display = "none";
    document
      .querySelector(".input-section")
      .scrollIntoView({ behavior: "smooth" });
    document.getElementById("legalDisclaimer").classList.add("show");
  }

  ryczaltCheckboxes.forEach((checkbox) => {
    const targetId = checkbox.dataset.target;
    const targetInput = document.getElementById(targetId);
    const targetGroup = targetInput.closest(".input-group");
    if (checkbox.checked) {
      targetGroup.style.display = "flex";
    } else {
      targetGroup.style.display = "none";
    }
  });
  const anyChecked = Array.from(ryczaltCheckboxes).some((cb) => cb.checked);
  ryczaltMessage.style.display = anyChecked ? "none" : "block";

  const jointTaxationSelected = document.querySelector(
    'input[name="jointTaxation"]:checked'
  ).value;
  if (jointTaxationSelected === "no") {
    spouseIncomeCard.classList.add("inactive");
    spouseIncomeInput.setAttribute("readonly", "");
    spouseIncomeInput.value = formatPLN(0);
  }
}

function calculate() {
  let revenue = parsePLN(document.getElementById("revenue").value);
  let costs = parsePLN(document.getElementById("costs").value);
  let income = revenue - costs;
  document.getElementById("income").value = formatPLN(income);
  if (initialIncome !== null) {
    let diff = income - initialIncome;
    let diffContainer = document.getElementById("income-diff-container");
    if (!diffContainer) {
      diffContainer = document.createElement("div");
      diffContainer.id = "income-diff-container";
      diffContainer.className = "income-diff";
      document.getElementById("income").parentNode.appendChild(diffContainer);
    }
    if (diff !== 0) {
      diffContainer.textContent = `${diff > 0 ? "+" : ""}${formatPLN(diff)}`;
      diffContainer.style.display = "inline";
    } else {
      diffContainer.style.display = "none";
    }
  }
  previousIncome = income;
  let ipBoxCoeff =
    parseFloat(document.getElementById("ipBoxCoeff").value) / 100;
  const healthContribLimit = 11600; // F16, Maksymalna składka zdrowotna do odliczenia podatek liniowy 
  let C16;
  if (income / 12 <= 7791.43) {
    C16 = 4581.36;
  } else {
    C16 = 0.049 * income;
  }
  document.getElementById("C16").value = formatPLN(C16);

  // Calculate C17 based on total revenue
  let C17;
  if (revenue > 300000) C17 = 12 * 1258.39;
  else if (revenue > 60000) C17 = 12 * 699.11;
  else C17 = 12 * 419.46;
  document.getElementById("C17").value = formatPLN(C17);

  let C18;
  if (income / 12 <= 4242) {
    C18 = 4581.36;
  } else {
    C18 = 0.09 * income;
  }
  document.getElementById("C18").value = formatPLN(C18);
  let F17 = Math.min(C16, healthContribLimit);
  document.getElementById("F17").value = formatPLN(F17);

  // Calculate F18 based on whether we're in multiple rates mode
  let F18;
  if (multipleRatesToggle.checked) {
    // Calculate total allocated revenue for C17
    let totalAllocatedRevenue = 0;
    document.querySelectorAll(".rate-input.show").forEach(input => {
      totalAllocatedRevenue += parsePLN(input.value) || 0;
    });

    // Calculate C17 based on allocated revenue
    let ratesC17;
    if (totalAllocatedRevenue > 300000) ratesC17 = 12 * 1339.60;
    else if (totalAllocatedRevenue > 60000) ratesC17 = 12 * 744.22;
    else ratesC17 = 12 * 446.53;

    F18 = ratesC17 * 0.5;
  } else {
    F18 = C17 * 0.5;
  }
  document.getElementById("F18").value = formatPLN(F18);

  let J3 = income * (1 - ipBoxCoeff);

  function calculateTaxWithSpouseLocal(
    income,
    jointTaxation,
    spouseIncome,
    C18
  ) {
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

  let C6 = calculateTaxWithSpouse(income, false, 0, C18);
  document.getElementById("C6").value = formatPLN(C6);
  if (
    document.querySelector('input[name="jointTaxation"]:checked').value ===
    "yes"
  ) {
    let C6_joint = calculateTaxWithSpouse(
      income,
      true,
      parsePLN(document.getElementById("spouseIncome").value),
      C18
    );
    document.getElementById("C6_joint").value = formatPLN(C6_joint);
    if (initialC6_joint !== null) {
      let diffC6_joint = C6_joint - initialC6_joint;
      updateDifferenceDisplay("C6_joint", diffC6_joint);
    }
  }
  if (initialC6 !== null) {
    let diffC6 = C6 - initialC6;
    let diffContainerC6 = document.getElementById("C6-diff");
    if (!diffContainerC6) {
      diffContainerC6 = document.createElement("div");
      diffContainerC6.id = "C6-diff";
      diffContainerC6.className = "income-diff";
      document.getElementById("C6").parentNode.appendChild(diffContainerC6);
    }
    if (diffC6 !== 0) {
      diffContainerC6.textContent = `${diffC6 > 0 ? "+" : ""}${formatPLN(
        diffC6
      )}`;
      diffContainerC6.style.display = "inline";
    } else {
      diffContainerC6.style.display = "none";
    }
  }

  let E6;
  if (income - F17 > 1000000) {
    E6 = (income - (F17 + 1000000)) * 0.279 + 0.239 * 1000000;
  } else if (income - F17 > 93495.6) {
    E6 = (income - F17) * 0.239;
  } else if (income - F17 > 0) {
    E6 = 4581.36 + (income - F17) * 0.19;
  } else {
    E6 = 4581.36;
  }
  document.getElementById("E6").value = formatPLN(E6);

  // Update difference display if initial value exists
  if (initialE6 !== null) {
    let diffE6 = E6 - initialE6;
    let diffContainerE6 = document.getElementById("E6-diff");
    if (!diffContainerE6) {
      diffContainerE6 = document.createElement("div");
      diffContainerE6.id = "E6-diff";
      diffContainerE6.className = "income-diff";
      document.getElementById("E6").parentNode.appendChild(diffContainerE6);
    }
    if (Math.abs(diffE6) > 0.01) {
      diffContainerE6.textContent = `${diffE6 > 0 ? "+" : ""}${formatPLN(
        diffE6
      )}`;
      diffContainerE6.style.display = "inline";
    } else {
      diffContainerE6.style.display = "none";
    }
  }

  let F6 =
    income * ipBoxCoeff * 0.05 +
    Math.min(J3, 30000) * 0 +
    Math.min(Math.max(J3 - 30000, 0), 90000) * 0.12 +
    Math.min(Math.max(J3 - 120000, 0), 880000) * 0.32 +
    Math.max(J3 - 1000000, 0) * 0.36 +
    C18;
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
      Math.min(Math.max(J3 - (30000 + J11) - (90000 + K11), 0), 880000 + L11) *
        0.32 +
      Math.max(J3 - (30000 + J11) - (90000 + K11) - (880000 + L11), 0) * 0.36 +
      C18;
    document.getElementById("F6_joint").value = formatPLN(F6_joint);
    if (initialF6_joint !== null) {
      let diffF6_joint = F6_joint - initialF6_joint;
      updateDifferenceDisplay("F6_joint", diffF6_joint);
    }
  }
  if (initialF6 !== null) {
    let diffF6 = F6 - initialF6;
    let diffContainerF6 = document.getElementById("F6-diff");
    if (!diffContainerF6) {
      diffContainerF6 = document.createElement("div");
      diffContainerF6.id = "F6-diff";
      diffContainerF6.className = "income-diff";
      document.getElementById("F6").parentNode.appendChild(diffContainerF6);
    }
    if (diffF6 !== 0) {
      diffContainerF6.textContent = `${diffF6 > 0 ? "+" : ""}${formatPLN(
        diffF6
      )}`;
      diffContainerF6.style.display = "inline";
    } else {
      diffContainerF6.style.display = "none";
    }
  }

  function calculateG6(income, ipBoxCoeff, F17) {
    if (income - F17 > 93495.6) {
      // IP Box part calculation
      const ipBoxPart = income * ipBoxCoeff * 0.099;

      // Standard income calculation
      const standardIncome = income * (1 - ipBoxCoeff) - F17;

      // Standard part calculation with threshold check
      const standardPart =
        standardIncome > 1000000
          ? (standardIncome - 1000000) * 0.279 + 0.239 * 1000000
          : Math.max(standardIncome * 0.239, 0);

      return ipBoxPart + standardPart;
    } else if (income > 0) {
      // IP Box part for lower income
      const ipBoxPart = income * ipBoxCoeff * 0.05;

      // Standard part for lower income with minimum 0
      const standardPart = Math.max(income * (1 - ipBoxCoeff) - F17, 0) * 0.19;

      return ipBoxPart + standardPart + 4581.36;
    } else {
      return 4581.36;
    }
  }

  // Main calculation and DOM manipulation
  let G6 = calculateG6(income, ipBoxCoeff, F17);
  document.getElementById("G6").value = formatPLN(G6);

  if (initialG6 !== null) {
    let diffG6 = G6 - initialG6;
    let diffContainerG6 = document.getElementById("G6-diff");
    if (!diffContainerG6) {
      diffContainerG6 = document.createElement("div");
      diffContainerG6.id = "G6-diff";
      diffContainerG6.className = "income-diff";
      document.getElementById("G6").parentNode.appendChild(diffContainerG6);
    }
    if (Math.abs(diffG6) > 0.01) {
      diffContainerG6.textContent = `${diffG6 > 0 ? "+" : ""}${formatPLN(
        diffG6
      )}`;
      diffContainerG6.style.display = "inline";
    } else {
      diffContainerG6.style.display = "none";
    }
  }

  let allocatedRevenues = {};
  if (multipleRatesToggle.checked) {
    const totalRevenue = parsePLN(document.getElementById("revenue").value);
    let usedRevenue = 0;
    const rateInputsVisible = document.querySelectorAll(".rate-input.show");
    rateInputsVisible.forEach((input) => {
      const allocatedValue = parsePLN(input.value) || 0;
      usedRevenue += allocatedValue;
      allocatedRevenues[input.dataset.for] = allocatedValue;
    });
  }

  function getAllocatedOrFullRateValue(rateId) {
    if (multipleRatesToggle.checked) {
      const rateInput = document.querySelector(
        `.rate-input[data-for="${rateId}"]`
      );
      if (!rateInput || !rateInput.value) return 0;
      return allocatedRevenues[rateId] || 0;
    }
    return revenue;
  }

  {
    let base = Math.max(getAllocatedOrFullRateValue("C9") - F18, 0);
    let C9 = base * 0.02;
    if (!multipleRatesToggle.checked) C9 += C17;
    document.getElementById("C9").value = formatPLN(C9);
  }
  {
    let base = Math.max(getAllocatedOrFullRateValue("D9") - F18, 0);
    let D9 = base * 0.03;
    if (!multipleRatesToggle.checked) D9 += C17;
    document.getElementById("D9").value = formatPLN(D9);
  }
  {
    let base = Math.max(getAllocatedOrFullRateValue("E9") - F18, 0);
    let E9 = base * 0.055;
    if (!multipleRatesToggle.checked) E9 += C17;
    document.getElementById("E9").value = formatPLN(E9);
  }
  {
    let base = Math.max(getAllocatedOrFullRateValue("F9") - F18, 0);
    let F9 = base * 0.085;
    if (!multipleRatesToggle.checked) F9 += C17;
    document.getElementById("F9").value = formatPLN(F9);
  }
  {
    let allocated = getAllocatedOrFullRateValue("G9");
    let G9;
    if (allocated <= 100000) {
        G9 = Math.max(allocated - F18, 0) * 0.085;
    } else {
        G9 = Math.max(allocated - (F18 + 100000), 0) * 0.125 + 8500;
    }
    if (!multipleRatesToggle.checked) G9 += C17;
    document.getElementById("G9").value = formatPLN(G9);
  }
  {
    let base = Math.max(getAllocatedOrFullRateValue("C11") - F18, 0);
    let C11 = base * 0.1;
    if (!multipleRatesToggle.checked) C11 += C17;
    document.getElementById("C11").value = formatPLN(C11);
  }
  {
    let base = Math.max(getAllocatedOrFullRateValue("D11") - F18, 0);
    let D11 = base * 0.12;
    if (!multipleRatesToggle.checked) D11 += C17;
    document.getElementById("D11").value = formatPLN(D11);
  }
  {
    let base = Math.max(getAllocatedOrFullRateValue("E11") - F18, 0);
    let E11 = base * 0.14;
    if (!multipleRatesToggle.checked) E11 += C17;
    document.getElementById("E11").value = formatPLN(E11);
  }
  {
    let base = Math.max(getAllocatedOrFullRateValue("F11") - F18, 0);
    let F11 = base * 0.15;
    if (!multipleRatesToggle.checked) F11 += C17;
    document.getElementById("F11").value = formatPLN(F11);
  }
  {
    let base = Math.max(getAllocatedOrFullRateValue("G11") - F18, 0);
    let G11 = base * 0.17;
    if (!multipleRatesToggle.checked) G11 += C17;
    document.getElementById("G11").value = formatPLN(G11);
  }

  const ryczaltFields = [
    { id: "C9", initial: initialC9 },
    { id: "D9", initial: initialD9 },
    { id: "E9", initial: initialE9 },
    { id: "F9", initial: initialF9 },
    { id: "G9", initial: initialG9 },
    { id: "C11", initial: initialC11 },
    { id: "D11", initial: initialD11 },
    { id: "E11", initial: initialE11 },
    { id: "F11", initial: initialF11 },
    { id: "G11", initial: initialG11 },
  ];

  ryczaltFields.forEach((field) => {
    if (field.initial !== null) {
      let currentValue = parsePLN(document.getElementById(field.id).value);
      let diff = currentValue - field.initial;
      let diffContainer = document.getElementById(`${field.id}-diff`);
      if (!diffContainer) {
        diffContainer = document.createElement("div");
        diffContainer.id = `${field.id}-diff`;
        diffContainer.className = "income-diff";
        document.getElementById(field.id).parentNode.appendChild(diffContainer);
      }
      if (Math.abs(diff) > 0.01 && !multipleRatesToggle.checked) {
        diffContainer.textContent = `${diff > 0 ? "+" : ""}${formatPLN(diff)}`;
        diffContainer.style.display = "inline";
      } else {
        diffContainer.style.display = "none";
      }
    }
  });

  updateRatesTotal(C17);
}

function updateRatesTotal(C17) {
  const ratesTotalElement = document.getElementById("ratesTotal");
  const ratesTotalValueElement = document.getElementById("ratesTotalValue");
  const ratesC17ValueElement = document.getElementById("ratesC17Value");

  if (!multipleRatesToggle.checked) {
    ratesTotalElement.classList.add("hidden");
    return;
  }

  // Check if any rate checkbox is selected
  const anyRateSelected = Array.from(ryczaltCheckboxes).some(checkbox => checkbox.checked);
  
  if (!anyRateSelected) {
    ratesTotalElement.classList.add("hidden");
    return;
  }

  // Calculate total allocated revenue
  let totalAllocatedRevenue = 0;
  document.querySelectorAll(".rate-input.show").forEach(input => {
    totalAllocatedRevenue += parsePLN(input.value) || 0;
  });

  // Calculate C17 based on allocated revenue
  let ratesC17;
  if (totalAllocatedRevenue > 300000) ratesC17 = 12 * 1339.60;
  else if (totalAllocatedRevenue > 60000) ratesC17 = 12 * 744.22;
  else ratesC17 = 12 * 446.53;

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

// Event listeners
calculateButton.addEventListener("click", handleCalculate);

revenueInput.addEventListener("input", (e) => {
  const isValid = validateInput(e.target.value, "revenue");
  if (!resultsSection.classList.contains("hidden") && isValid) calculate();
  if (multipleRatesToggle.checked) updateRemainingRevenue();
});
revenueInput.addEventListener("blur", (e) => {
  e.target.value = formatPLN(parsePLN(e.target.value));
  if (multipleRatesToggle.checked) updateRemainingRevenue();
});

costsInput.addEventListener("input", (e) => {
  const isValid = validateInput(e.target.value, "costs");
  if (!resultsSection.classList.contains("hidden") && isValid) calculate();
});
costsInput.addEventListener("blur", (e) => {
  e.target.value = formatPLN(parsePLN(e.target.value));
});

ipBoxCoeffInput.addEventListener("input", (e) => {
  if (
    !e.target.hasAttribute("readonly") &&
    validateIpBoxCoeff(e.target.value) &&
    !resultsSection.classList.contains("hidden")
  ) {
    calculate();
  }
});

ipBoxEdit.addEventListener("click", (e) => {
  e.stopPropagation();
  const isCurrentlyReadOnly = ipBoxCoeffInput.hasAttribute("readonly");
  if (isCurrentlyReadOnly) {
    ipBoxCoeffInput.removeAttribute("readonly");
    ipBoxCoeffInput.classList.add("editable");
    ipBoxEdit.textContent = "✓";
    ipBoxCoeffInput.focus();
  } else {
    makeIpBoxReadonly();
  }
});

ipBoxCoeffInput.addEventListener("click", (e) => e.stopPropagation());

document.addEventListener("click", (e) => {
  if (!ipBoxContainer.contains(e.target)) makeIpBoxReadonly();
});

jointTaxationRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    spouseIncomeCard.classList.remove("shake");
    const jointTaxationCards = document.querySelectorAll(
      ".joint-taxation-card"
    );
    if (e.target.value === "yes") {
      spouseIncomeCard.classList.remove("inactive");
      spouseIncomeInput.removeAttribute("readonly");
      spouseIncomeInput.value = "";
      spouseIncomeInput.placeholder = "wartość...";
      spouseIncomeCard.classList.add("shake");
      jointTaxationCards.forEach((card) => card.classList.add("show"));
      setTimeout(() => {
        spouseIncomeCard.classList.remove("shake");
      }, 500);
      if (!resultsSection.classList.contains("hidden")) {
        calculate();
        initialC6_joint = parsePLN(document.getElementById("C6_joint").value);
        initialF6_joint = parsePLN(document.getElementById("F6_joint").value);
      }
    } else {
      spouseIncomeCard.classList.add("inactive");
      spouseIncomeInput.setAttribute("readonly", "");
      spouseIncomeInput.value = formatPLN(0);
      spouseIncomeInput.placeholder = "";
      jointTaxationCards.forEach((card) => card.classList.remove("show"));
      if (!resultsSection.classList.contains("hidden")) calculate();
    }
  });
});

spouseIncomeInput.addEventListener("input", (e) => {
  if (!spouseIncomeCard.classList.contains("inactive")) {
    const isValid = validateInput(e.target.value, "spouseIncome");
    if (!resultsSection.classList.contains("hidden") && isValid) calculate();
  }
});
spouseIncomeInput.addEventListener("blur", (e) => {
  if (!spouseIncomeCard.classList.contains("inactive")) {
    e.target.value = formatPLN(parsePLN(e.target.value));
  }
});

document
  .getElementById("multipleRatesToggle")
  .addEventListener("change", function (e) {
    const isEnabled = e.target.checked;
    const rateInputs = document.querySelectorAll(".rate-input");
    const revenueInfo = document.querySelector(".multiple-rates-revenue-info");
    const wrapper = document.querySelector(".multiple-rates-wrapper");
    const ryczaltDiffs = document.querySelectorAll(
      "#ryczalt-message ~ .input-group .income-diff"
    );

    revenueInfo.style.display = isEnabled ? "block" : "none";
    wrapper.style.justifyContent = isEnabled ? "space-between" : "flex-end";

    // Hide income differences in ryczałt section when multiple rates is enabled
    ryczaltDiffs.forEach((diff) => {
      diff.style.display = isEnabled
        ? "none"
        : diff.textContent.trim()
        ? "inline"
        : "none";
    });

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
    else if (!resultsSection.classList.contains("hidden")) calculate();
    updateRatesTotal();
  });

// Event listener for rate checkboxes
ryczaltCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
        const targetId = this.dataset.target;
        const targetInput = document.getElementById(targetId);
        const targetGroup = targetInput.closest(".input-group");
        const rateInput = this.closest(".checkbox-wrapper").querySelector(".rate-input");
        const multipleRatesEnabled = multipleRatesToggle.checked;
        
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
        
        const anyChecked = Array.from(ryczaltCheckboxes).some((cb) => cb.checked);
        ryczaltMessage.style.display = anyChecked ? "none" : "block";
        
        if (!resultsSection.classList.contains("hidden")) {
            calculate();
        }
        
        if (multipleRatesEnabled) {
            updateRemainingRevenue();
        }
    });
});

// Event listeners for rate inputs
document.querySelectorAll(".rate-input").forEach((input) => {
    input.addEventListener("input", (e) => {
        if (!e.target.value) return;
        const isValid = validateInput(e.target.value, e.target.dataset.for);
        if (!resultsSection.classList.contains("hidden") && isValid) calculate();
        if (multipleRatesToggle.checked) updateRemainingRevenue();
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
