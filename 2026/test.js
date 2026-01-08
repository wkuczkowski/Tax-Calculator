// Updated TEST_CASES array with meaningful names, logical order, and 3 additional tests
const TEST_CASES = [
  {
    name: "Zero Revenue Scenario",
    input: {
      revenue: 0,
      costs: 0,
      ipBoxCoeff: 25,
      spouseIncome: 0,
      jointTaxation: false,
    },
    expected: {
      income: 0.0,
      C6: 3779.52, // Skala podatkowa
      F6: 3779.52, // Skala podatkowa (IP BOX)
      E6: 3779.52, // Podatek liniowy
      G6: 3779.52, // Podatek liniowy (IP BOX)
      C9: 5539.92, // Ryczałt 2%
      D9: 5539.92, // Ryczałt 3%
      E9: 5539.92, // Ryczałt 5.5%
      F9: 5539.92, // Ryczałt 8.5%
      G9: 5539.92, // Ryczałt 8.5% i 12.5%
      C11: 5539.92, // Ryczałt 10%
      D11: 5539.92, // Ryczałt 12%
      E11: 5539.92, // Ryczałt 14%
      F11: 5539.92, // Ryczałt 15%
      G11: 5539.92, // Ryczałt 17%
    },
  },
  {
    name: "Very Low Income Scenario",
    input: {
      revenue: 1000,
      costs: 0,
      ipBoxCoeff: 25,
      spouseIncome: 0,
      jointTaxation: false,
    },
    expected: {
      income: 1000,
      C6: 3779.52, // Skala podatkowa
      F6: 3792.02, // Skala podatkowa (IP BOX)
      E6: 3779.52, // Podatek liniowy
      G6: 3792.02, // Podatek liniowy (IP BOX)
      C9: 5539.92, // Ryczałt 2%
      D9: 5539.92, // Ryczałt 3%
      E9: 5539.92, // Ryczałt 5.5%
      F9: 5539.92, // Ryczałt 8.5%
      G9: 5539.92, // Ryczałt 8.5% i 12.5%
      C11: 5539.92, // Ryczałt 10%
      D11: 5539.92, // Ryczałt 12%
      E11: 5539.92, // Ryczałt 14%
      F11: 5539.92, // Ryczałt 15%
      G11: 5539.92, // Ryczałt 17%
    },
  },
  {
    name: "Low Income with Joint Taxation",
    input: {
      revenue: 3000,
      costs: 0,
      ipBoxCoeff: 25,
      spouseIncome: 0,
      jointTaxation: true,
    },
    expected: {
      income: 3000,
      C6: 3779.52, // Skala podatkowa
      C6_joint: 3779.52, // Skala podatkowa (wspólne rozliczenie z małżonkiem)
      F6: 3817.02, // Skala podatkowa (IP BOX)
      F6_joint: 3817.02, // Skala podatkowa (IP BOX) (wspólne rozliczenie z małżonkiem)
      E6: 3779.52, // Podatek liniowy
      G6: 3817.02, // Podatek liniowy (IP BOX)
      C9: 5544.52, // Ryczałt 2%
      D9: 5546.82, // Ryczałt 3%
      E9: 5552.57, // Ryczałt 5.5%
      F9: 5559.47, // Ryczałt 8.5%
      G9: 5559.47, // Ryczałt 8.5% i 12.5%
      C11: 5562.92, // Ryczałt 10%
      D11: 5567.52, // Ryczałt 12%
      E11: 5572.13, // Ryczałt 14%
      F11: 5574.43, // Ryczałt 15%
      G11: 5579.03, // Ryczałt 17%
    },
  },
  {
    name: "Maximum IP BOX Coefficient Test (Low Revenue)",
    input: {
      revenue: 5000,
      costs: 0,
      ipBoxCoeff: 99,
      spouseIncome: 0,
      jointTaxation: false,
    },
    expected: {
      income: 5000,
      C6: 3779.52, // Skala podatkowa
      F6: 4027.02, // Skala podatkowa (IP BOX)
      E6: 4011.41, // Podatek liniowy
      G6: 4027.02, // Podatek liniowy (IP BOX)
      C9: 5584.52, // Ryczałt 2%
      D9: 5606.82, // Ryczałt 3%
      E9: 5662.57, // Ryczałt 5.5%
      F9: 5729.47, // Ryczałt 8.5%
      G9: 5729.47, // Ryczałt 8.5% i 12.5%
      C11: 5762.92, // Ryczałt 10%
      D11: 5807.52, // Ryczałt 12%
      E11: 5852.13, // Ryczałt 14%
      F11: 5874.43, // Ryczałt 15%
      G11: 5919.03, // Ryczałt 17%
    },
  },
  {
    name: "Boundary IP BOX Coefficient Scenario",
    input: {
      revenue: 50000,
      costs: 10000,
      ipBoxCoeff: 0,
      spouseIncome: 0,
      jointTaxation: false,
    },
    expected: {
      income: 40000, // Dochód
      C6: 4979.52, // Skala podatkowa
      F6: 4979.52, // Skala podatkowa (IP BOX)
      E6: 10661.41, // Podatek liniowy
      G6: 10661.41, // Podatek liniowy (IP BOX)
      C9: 6484.52, // Ryczałt 2%
      D9: 6956.82, // Ryczałt 3%
      E9: 8137.57, // Ryczałt 5.5%
      F9: 9554.47, // Ryczałt 8.5%
      G9: 9554.47, // Ryczałt 8.5% i 12.5%
      C11: 10262.92, // Ryczałt 10%
      D11: 11207.52, // Ryczałt 12%
      E11: 12152.13, // Ryczałt 14%
      F11: 12624.43, // Ryczałt 15%
      G11: 13569.03, // Ryczałt 17%
    },
  },
  {
    name: "Standard Income Calculation",
    input: {
      revenue: 120000,
      costs: 20000,
      ipBoxCoeff: 25,
      spouseIncome: 0,
      jointTaxation: false,
    },
    expected: {
      income: 100000,
      C6: 17400.0, // Skala podatkowa
      F6: 15650.0, // Skala podatkowa (IP BOX)
      E6: 22728.9, // Podatek liniowy
      G6: 19228.9, // Podatek liniowy (IP BOX)
      C9: 11540.83, // Ryczałt 2%
      D9: 12694.66, // Ryczałt 3%
      E9: 15579.25, // Ryczałt 5.5%
      F9: 19040.75, // Ryczałt 8.5%
      G9: 19656.09, // Ryczałt 8.5% i 12.5%
      C11: 20771.5, // Ryczałt 10%
      D11: 23079.17, // Ryczałt 12%
      E11: 25386.84, // Ryczałt 14%
      F11: 26540.67, // Ryczałt 15%
      G11: 28848.34, // Ryczałt 17%
    },
  },
  {
    name: "Equal Income Spousal Joint Scenario",
    input: {
      revenue: 150000,
      costs: 50000,
      ipBoxCoeff: 50,
      spouseIncome: 150000,
      jointTaxation: true,
    },
    expected: {
      income: 100000.0, // Dochód
      C6: 17400.0, // Skala podatkowa
      C6_joint: 17400.0, // Skala podatkowa (wspólne rozliczenie z małżonkiem)
      F6: 13900.0, // Skala podatkowa (IP BOX)
      F6_joint: 13900.0, // Skala podatkowa (IP BOX) (wspólne rozliczenie z małżonkiem)
      E6: 22728.9, // Podatek liniowy
      G6: 15728.9, // Podatek liniowy (IP BOX)
      C9: 12140.83, // Ryczałt 2%
      D9: 13594.66, // Ryczałt 3%
      E9: 17229.25, // Ryczałt 5.5%
      F9: 21590.75, // Ryczałt 8.5%
      G9: 23406.09, // Ryczałt 8.5% i 12.5%
      C11: 23771.5, // Ryczałt 10%
      D11: 26679.17, // Ryczałt 12%
      E11: 29586.84, // Ryczałt 14%
      F11: 31040.67, // Ryczałt 15%
      G11: 33948.34, // Ryczałt 17%
    },
  },
  {
    name: "Standard Income with Joint Taxation",
    input: {
      revenue: 240000,
      costs: 40000,
      ipBoxCoeff: 50,
      spouseIncome: 30000,
      jointTaxation: true,
    },
    expected: {
      income: 200000,
      C6: 54400.0, // Skala podatkowa
      C6_joint: 38400.0, // Skala podatkowa (wspólne rozliczenie z małżonkiem)
      F6: 31400.0, // Skala podatkowa (IP BOX)
      F6_joint: 31400.0, // Skala podatkowa (IP BOX) (wspólne rozliczenie z małżonkiem)
      E6: 45457.8, // Podatek liniowy
      G6: 31457.8, // Podatek liniowy (IP BOX)
      C9: 13940.83, // Ryczałt 2%
      D9: 16294.66, // Ryczałt 3%
      E9: 22179.25, // Ryczałt 5.5%
      F9: 29240.75, // Ryczałt 8.5%
      G9: 34656.09, // Ryczałt 8.5% i 12.5%
      C11: 32771.5, // Ryczałt 10%
      D11: 37479.17, // Ryczałt 12%
      E11: 42186.84, // Ryczałt 14%
      F11: 44540.67, // Ryczałt 15%
      G11: 49248.34, // Ryczałt 17%
    },
  },
  {
    name: "High Income: Elevated IP BOX Coefficient",
    input: {
      revenue: 1200000,
      costs: 200000,
      ipBoxCoeff: 75,
      spouseIncome: 0,
      jointTaxation: false,
    },
    expected: {
      income: 1000000,
      C6: 382400.0, // Skala podatkowa
      F6: 179900.0, // Skala podatkowa (IP BOX)
      E6: 235630.1, // Podatek liniowy
      G6: 130630.1, // Podatek liniowy (IP BOX)
      C9: 40453.44, // Ryczałt 2%
      D9: 52370.35, // Ryczałt 3%
      E9: 82162.6, // Ryczałt 5.5%
      F9: 117913.31, // Ryczałt 8.5%
      G9: 161580.91, // Ryczałt 8.5% i 12.5%
      C11: 135788.66, // Ryczałt 10%
      D11: 159622.46, // Ryczałt 12%
      E11: 183456.27, // Ryczałt 14%
      F11: 195373.17, // Ryczałt 15%
      G11: 219206.97, // Ryczałt 17%
    },
  },
  {
    name: "Ultra High Income: Joint Taxation with Standard IP BOX",
    input: {
      revenue: 4000000,
      costs: 0,
      ipBoxCoeff: 25,
      spouseIncome: 78000,
      jointTaxation: true,
    },
    expected: {
      income: 4000000,
      C6: 1732400.0, // Skala podatkowa
      C6_joint: 1687120.0, // Skala podatkowa (wspólne rozliczenie z małżonkiem)
      F6: 1422400.0, // Skala podatkowa (IP BOX)
      F6_joint: 1377120.0, // Skala podatkowa (IP BOX) (wspólne rozliczenie z małżonkiem)
      E6: 1072066.1, // Podatek liniowy
      G6: 892066.1, // Podatek liniowy (IP BOX)
      C9: 96453.44, // Ryczałt 2%
      D9: 136370.35, // Ryczałt 3%
      E9: 236162.6, // Ryczałt 5.5%
      F9: 355913.31, // Ryczałt 8.5%
      G9: 511580.91, // Ryczałt 8.5% i 12.5%
      C11: 415788.66, // Ryczałt 10%
      D11: 495622.46, // Ryczałt 12%
      E11: 575456.27, // Ryczałt 14%
      F11: 615373.17, // Ryczałt 15%
      G11: 695206.97, // Ryczałt 17%
    },
  },
];

// --- Helper Functions ---

// Local parsePLN function (copied from your calculator code)
function parsePLN(value) {
  return parseFloat(value.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
}

// Helper function to format numbers for comparison
function formatNumber(num) {
  return parseFloat(num.toFixed(2));
}

// Helper function to compare actual and expected values
function compareValues(actual, expected, fieldName) {
  const actualNum = formatNumber(actual);
  const expectedNum = formatNumber(expected);
  const diff = Math.abs(actualNum - expectedNum);
  const isClose = diff < 0.02; // Allow for small rounding differences

  if (!isClose) {
    console.error(
      `❌ ${fieldName}: Expected ${expectedNum}, but got ${actualNum} (diff: ${diff})`
    );
    return false;
  }
  return true;
}

// Function to run a single test case
async function runTestCase(testCase) {
  console.log(`\nRunning test: ${testCase.name}`);

  // Set up the initial values
  document.getElementById("revenue").value = testCase.input.revenue.toString();
  document.getElementById("costs").value = testCase.input.costs.toString();
  document.getElementById("ipBoxCoeff").value =
    testCase.input.ipBoxCoeff.toString();

  // Handle joint taxation
  const jointTaxationRadio = document.querySelector(
    `input[name="jointTaxation"][value="${
      testCase.input.jointTaxation ? "yes" : "no"
    }"]`
  );
  jointTaxationRadio.checked = true;
  jointTaxationRadio.dispatchEvent(new Event("change"));

  if (testCase.input.jointTaxation) {
    document.getElementById("spouseIncome").value =
      testCase.input.spouseIncome.toString();
  }

  // Trigger calculation by clicking the calculate button
  document.getElementById("calculateButton").click();

  // Wait for calculations to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Verify results
  let allTestsPassed = true;

  // Check each expected value
  for (const [field, expectedValue] of Object.entries(testCase.expected)) {
    const actualElement = document.getElementById(field);
    if (!actualElement) {
      console.error(`❌ Field ${field} not found in DOM`);
      allTestsPassed = false;
      continue;
    }

    const actualValue = parsePLN(actualElement.value);
    if (!compareValues(actualValue, expectedValue, field)) {
      allTestsPassed = false;
    }
  }

  if (allTestsPassed) {
    console.log(`✅ Test passed: ${testCase.name}`);
  } else {
    console.log(`❌ Test failed: ${testCase.name}`);
  }

  return allTestsPassed;
}

// Main function to run all tests
async function runAllTests() {
  console.log("Starting Tax Calculator Tests...");

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of TEST_CASES) {
    const passed = await runTestCase(testCase);
    if (passed) {
      passedTests++;
    } else {
      failedTests++;
    }
  }

  console.log("\nTest Summary:");
  console.log(`Total Tests: ${TEST_CASES.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
}

// Add test button to the page
function addTestButton() {
  const button = document.createElement("button");
  button.id = "runTestsButton";
  button.innerHTML = "Run Tests";
  button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        z-index: 1000;
    `;
  button.addEventListener("click", runAllTests);
  document.body.appendChild(button);
}

// Initialize tests when the page loads
window.addEventListener("load", addTestButton);
