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
    otherIncomeInput: document.getElementById("otherIncome"),
    zusEnabled: document.getElementById("zusEnabled"),
    zusReveal: document.getElementById("zusReveal"),
    zusStartDate: document.getElementById("zusStartDate"),
    zusPathRadios: document.querySelectorAll('input[name="zusPath"]'),
    zusPathHint: document.getElementById("zusPathHint"),
    zusStartHint: document.getElementById("zusStartHint"),
    zusSickness: document.getElementById("zusSickness"),
    zusEmployment: document.getElementById("zusEmployment"),
    zusHoliday: document.getElementById("zusHoliday"),
    zusHolidayStatus: document.getElementById("zusHolidayStatus"),
    zusBirthDate: document.getElementById("zusBirthDate"),
    zusSexRadios: document.querySelectorAll('input[name="zusSex"]'),
    zusBirthHint: document.getElementById("zusBirthHint"),
    zusSummary: document.getElementById("zusSummary"),
    zusSummaryMeta: document.getElementById("zusSummaryMeta"),
    zusSocialTotal: document.getElementById("zusSocialTotal"),
    zusFpTotal: document.getElementById("zusFpTotal"),
    zusHealthMonths: document.getElementById("zusHealthMonths"),
    zusMonths: document.getElementById("zusMonths"),
    zusScheduleSummary: document.getElementById("zusScheduleSummary"),
    comparePitMeta: document.getElementById("comparePitMeta"),
  };

  // Data weryfikacji stanu prawnego (etykieta w nagłówku, eksport, Założenia)
  // – jedno źródło: TAX_CONSTANTS.LEGAL_STATUS_DATE
  const LEGAL_STATUS_DATE = TAX_CONSTANTS.LEGAL_STATUS_DATE;

  // Warianty, których wynik może być ujemny (PIT przypisany przy rozliczeniu
  // wspólnym, zob. calculateJointScalePitAttributed)
  const JOINT_VARIANT_IDS = ["taxScaleJoint", "taxScaleIpBoxJoint"];

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
  /* Pole przychodu dla stawki (tryb „Wiele stawek”) – błąd zaznaczamy
     na samym polu, a nie na polu wyniku o tym samym identyfikatorze. */
  function validateRateInput(input) {
    const value = parsePLN(input.value);
    const isValid = Number.isFinite(value) && value >= 0 && value <= 999999999;
    input.classList.toggle("error", !isValid);
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

  /* Pola dat (RRRR-MM-DD z <input type="date">). Puste pole jest poprawne
     (oba pola są opcjonalne). Data musi mieścić się w latach 1900–2026. */
  const DATE_MIN = "1900-01-01";
  const DATE_MAX = `${TAX_CONSTANTS.ZUS_YEAR}-12-31`;

  function validateDateField(fieldName, maxErrorText) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (!input) return true;
    input.classList.remove("error");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
    }
    const raw = (input.value || "").trim();
    let message = "";
    if (raw !== "") {
      const parsed = taxMath.parseISODate(raw);
      if (!parsed || raw < DATE_MIN) {
        message = "Wprowadź prawidłową datę.";
      } else if (raw > DATE_MAX) {
        message = maxErrorText;
      }
    }
    if (message) {
      input.classList.add("error");
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add("visible");
      }
      return false;
    }
    return true;
  }

  function validateStartDate() {
    return validateDateField(
      "zusStartDate",
      "Data rozpoczęcia nie może być późniejsza niż 31.12.2026.",
    );
  }

  function validateBirthDate() {
    return validateDateField(
      "zusBirthDate",
      "Data urodzenia nie może być późniejsza niż 31.12.2026.",
    );
  }

  /* Wartość pola daty, jeśli jest poprawna; w przeciwnym razie null
     (błąd jest pokazywany pod polem, a obliczenie pomija tę datę). */
  function getValidDateValue(input) {
    if (!input) return null;
    const raw = (input.value || "").trim();
    if (!raw || raw < DATE_MIN || raw > DATE_MAX) return null;
    return taxMath.parseISODate(raw) ? raw : null;
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

  /* Strata z działalności nie pomniejsza dochodu małżonka (art. 6 ust. 2
     w zw. z art. 9 ust. 2–3 ustawy o PIT) – dochód podatnika ≥ 0. */
  function calculateJointScalePitOnly(income, spouseIncome) {
    const jointIncome = taxMath.round2(
      Math.max(income, 0) + Math.max(spouseIncome, 0),
    );
    const halfIncome = taxMath.round2(jointIncome / 2);
    return taxMath.round2(calculateScalePitOnly(halfIncome) * 2);
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

  /* Współczynnik IP BOX stosujemy do dochodu z działalności przed składkami
     ZUS; przy dochodzie ujemnym dochodu kwalifikowanego nie ma (wcześniej
     powstawał ujemny „podatek” 5%). Składki ZUS przypisujemy do części
     opodatkowanej skalą / liniowo – nigdy do dochodu z IP BOX. */
  function getIpBoxIncomeSplit(income, ipBoxCoeff) {
    const coeff = Number.isFinite(ipBoxCoeff)
      ? Math.min(Math.max(ipBoxCoeff, 0), 1)
      : 0;
    const ipBoxIncome = income > 0 ? taxMath.round2(income * coeff) : 0;
    const regularIncome = taxMath.round2(income - ipBoxIncome);
    return { ipBoxIncome, regularIncome };
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

  /* Podział kwoty proporcjonalnie do wag, w groszach, metodą największych
     reszt – udziały sumują się dokładnie do kwoty (dla sumy wag = total).
     Gdy suma wag < total (część przychodu bez stawki), rozdzielana jest
     tylko odpowiednia część kwoty. */
  function splitProportionally(amount, weights, totalWeight) {
    const denominator = Math.max(
      totalWeight,
      weights.reduce((sum, weight) => sum + Math.max(weight, 0), 0),
    );
    if (denominator <= 0) return weights.map(() => 0);
    const amountCents = Math.round(amount * 100);
    const weightSum = weights.reduce((sum, weight) => sum + Math.max(weight, 0), 0);
    const targetCents = Math.round((amountCents * weightSum) / denominator);
    const raw = weights.map(
      (weight) => (amountCents * Math.max(weight, 0)) / denominator,
    );
    const cents = raw.map((value) => Math.floor(value));
    let remainder = targetCents - cents.reduce((sum, value) => sum + value, 0);
    raw
      .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
      .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
      .forEach(({ index }) => {
        if (remainder > 0) {
          cents[index] += 1;
          remainder -= 1;
        }
      });
    return cents.map((value) => value / 100);
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
    return taxMath.round2(
      Math.max(rateRevenue - deduction, 0) * RYCZALT_RATES[rateId],
    );
  }

  /* ==================================================
     Składki ZUS, inne dochody i wybór sposobu odliczenia składek
     (czyste funkcje – bez DOM; dane wejściowe przekazywane jawnie)

     Oznaczenia:
       D   – dochód z działalności przed składkami ZUS (przychód − koszty),
       S   – składki społeczne odliczalne (emerytalna, rentowa, chorobowa,
             wypadkowa) należne za 2026 r. (założenie kasowe: zapłacone w 2026),
       FP  – Fundusz Pracy + Fundusz Solidarnościowy (tylko koszt uzyskania
             przychodu na skali i liniowym; na ryczałcie nieodliczalne),
       O   – inne dochody opodatkowane skalą (np. etat),
       n   – liczba miesięcy podlegania ubezpieczeniu zdrowotnemu w 2026.
     Wynik wariantu = podatki łącznie (z innymi dochodami) − PIT od samych
     innych dochodów + składka zdrowotna + składki społeczne ZUS,
     czyli obciążenie przypisane działalności.
     Składek nie dzielimy między sposoby odliczenia – wyjątek: nadwyżka
     składek ponad przychód ryczałtowy odliczana od dochodu ze skali
     (art. 26 ust. 13a ustawy o PIT; SPEC addendum A5).
  ================================================== */

  /* Sposoby odliczenia składek społecznych porównywane w każdym wariancie.
     Kolejność = preferencja przy równym wyniku. */
  const SOCIAL_DEDUCTION_METHODS = {
    scale: ["income", "costs"],
    linear: ["linear", "costs", "scale"],
    ryczalt: ["ryczalt", "scale"],
  };

  const SOCIAL_DEDUCTION_LABELS = {
    scale: {
      none: "brak składek społecznych do odliczenia",
      income: "od dochodu (art. 26 ust. 1 pkt 2 ustawy o PIT)",
      costs: "w kosztach uzyskania przychodu",
    },
    linear: {
      none: "brak składek społecznych do odliczenia",
      linear:
        "od dochodu z działalności (art. 30c ust. 2 pkt 1 ustawy o PIT)",
      costs: "w kosztach uzyskania przychodu",
      scale: "od innych dochodów ze skali (art. 26 ust. 1 pkt 2 i ust. 13a)",
    },
    ryczalt: {
      none: "brak składek społecznych do odliczenia",
      ryczalt:
        "od przychodu (art. 11 ust. 1 ustawy o ryczałcie), nadwyżka od innych dochodów ze skali",
      scale: "od innych dochodów ze skali (art. 26 ust. 1 pkt 2 i ust. 13a)",
    },
  };

  const SOCIAL_DEDUCTION_SHORT_LABELS = {
    none: "brak do odliczenia",
    income: "od dochodu",
    costs: "w kosztach",
    linear: "od dochodu liniowego",
    scale: "od innych dochodów ze skali",
    ryczalt: "od przychodu",
  };

  /* PIT (i danina), który podatnik zapłaciłby od samych innych dochodów –
     indywidualnie wg skali, bez działalności. Odejmowany w każdym wariancie. */
  function getOtherIncomeBaseline(otherIncome) {
    const pit = calculateScalePitOnly(otherIncome);
    const levy = calculateSolidarityLevy(otherIncome);
    return {
      income: otherIncome,
      pit,
      levy,
      total: taxMath.round2(pit + levy),
    };
  }

  function buildCalculationContext(inputs, schedule) {
    const income = inputs.revenue - inputs.costs;
    const otherIncome = Math.max(inputs.otherIncome || 0, 0);
    return {
      revenue: inputs.revenue,
      costs: inputs.costs,
      income,
      otherIncome,
      schedule,
      zusEnabled: schedule.enabled,
      social: schedule.totals.social,
      fpfs: schedule.totals.fpfs,
      socialTotal: schedule.totals.total,
      healthMonths: schedule.healthMonths,
      // art. 81 ust. 2 u.ś.o.z.: dochód pomniejszony o składki społeczne
      // (FP+FS jako koszt obniża dochód), niezależnie od miejsca odliczenia
      healthBaseIncome: taxMath.round2(
        income - schedule.totals.fpfs - schedule.totals.social,
      ),
      baseline: getOtherIncomeBaseline(otherIncome),
    };
  }

  function getVariantTotal(taxes, health, ctx) {
    return taxMath.round2(
      taxes - ctx.baseline.total + health + ctx.socialTotal,
    );
  }

  /* Skala (indywidualnie / wspólnie, z IP BOX lub bez).
     method: "income" – art. 26 od łącznego dochodu ze skali (JDG + inne),
             "costs"  – składki w kosztach działalności (strata JDG nie
                        pomniejsza innych dochodów w tym samym roku). */
  function computeScaleOption(ctx, method, ipBoxCoeff, spouseIncome) {
    // FP+FS (i składki społeczne przy "costs") to koszty całej działalności –
    // przy IP BOX dzielone proporcjonalnie wg współczynnika (addendum A1, A9)
    const socialInCosts = method === "costs" ? ctx.social : 0;
    const businessAfterCosts = taxMath.round2(
      ctx.income - ctx.fpfs - socialInCosts,
    );
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(
      businessAfterCosts,
      ipBoxCoeff,
    );
    const scaleIncome = taxMath.round2(
      Math.max(regularIncome, 0) + ctx.otherIncome,
    );
    const socialDeducted =
      method === "costs" ? 0 : Math.min(ctx.social, scaleIncome);
    const pitBase = taxMath.round2(scaleIncome - socialDeducted);
    const health = taxMath.calculateHealthScale(
      ctx.healthBaseIncome,
      ctx.healthMonths,
    );
    const ipBoxTax = taxMath.round2(ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE);
    const joint = spouseIncome !== null && spouseIncome !== undefined;
    const pit = joint
      ? calculateJointScalePitAttributed(pitBase, spouseIncome)
      : calculateScalePitOnly(pitBase);
    const levy = calculateSolidarityLevy(pitBase);
    const taxes = taxMath.round2(ipBoxTax + pit + levy);

    return {
      form: "scale",
      method,
      ipBoxCoeff,
      ipBoxIncome,
      regularIncome,
      socialInCosts,
      businessAfterCosts,
      scaleIncome,
      socialDeducted,
      pitBase,
      joint,
      spouseIncome: joint ? spouseIncome : 0,
      pit,
      levy,
      ipBoxTax,
      health,
      taxes,
      total: getVariantTotal(taxes, health, ctx),
    };
  }

  /* Liniowy (z IP BOX lub bez). Inne dochody opodatkowane osobno skalą.
     method: "linear" – od dochodu liniowego (art. 30c ust. 2 pkt 1),
             "costs"  – w kosztach działalności,
             "scale"  – od innych dochodów ze skali (art. 26).
     Nadwyżka ponad dochód z wybranego źródła przepada (bez dzielenia). */
  function computeLinearOption(ctx, method, ipBoxCoeff) {
    const socialInCosts = method === "costs" ? ctx.social : 0;
    const businessAfterCosts = taxMath.round2(
      ctx.income - ctx.fpfs - socialInCosts,
    );
    const { ipBoxIncome, regularIncome } = getIpBoxIncomeSplit(
      businessAfterCosts,
      ipBoxCoeff,
    );
    const health = taxMath.calculateHealthLinear(
      ctx.healthBaseIncome,
      ctx.healthMonths,
    );
    const healthDeduction = Math.min(
      health,
      TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT,
    );
    // Zdrowotna odliczana od dochodu liniowego (nie w KUP – bez efektu
    // obniżenia własnej podstawy, addendum A4); limit roczny bez proporcji
    const healthDeducted = Math.min(
      healthDeduction,
      Math.max(regularIncome, 0),
    );
    const linearAvailable = taxMath.round2(
      Math.max(regularIncome, 0) - healthDeducted,
    );
    let socialFromLinear = 0;
    let socialFromScale = 0;
    if (method === "scale") {
      socialFromScale = Math.min(ctx.social, ctx.otherIncome);
    } else if (method !== "costs") {
      socialFromLinear = Math.min(ctx.social, linearAvailable);
    }
    const linearBase = taxMath.round2(linearAvailable - socialFromLinear);
    const scaleBase = taxMath.round2(ctx.otherIncome - socialFromScale);
    const linearPit = calculateLinearPitOnly(linearBase);
    const scalePit = calculateScalePitOnly(scaleBase);
    // art. 30h ust. 2: podstawa daniny = dochody z art. 27 i 30c po odliczeniach
    const levyBase = taxMath.round2(linearBase + scaleBase);
    const levy = calculateSolidarityLevy(levyBase);
    const ipBoxTax = taxMath.round2(ipBoxIncome * TAX_CONSTANTS.IP_BOX_RATE);
    const taxes = taxMath.round2(ipBoxTax + linearPit + scalePit + levy);

    return {
      form: "linear",
      method,
      ipBoxCoeff,
      ipBoxIncome,
      regularIncome,
      socialInCosts,
      businessAfterCosts,
      healthDeduction,
      healthDeducted,
      linearAvailable,
      socialFromLinear,
      socialFromScale,
      linearBase,
      scaleBase,
      linearPit,
      scalePit,
      levyBase,
      levy,
      ipBoxTax,
      health,
      taxes,
      total: getVariantTotal(taxes, health, ctx),
    };
  }

  /* Ryczałt dla podanych przychodów przypisanych stawkom
     ({ rateId: przychód }; jedna stawka = cały przychód).
     method: "ryczalt" – od przychodu (nadwyżka od dochodu ze skali,
                         art. 26 ust. 13a),
             "scale"   – od innych dochodów ze skali (nadwyżka przepada).
     Próg składki zdrowotnej: przychód pomniejszony o składki społeczne
     NIEodliczone od dochodu na podstawie ustawy o PIT, tj. odliczone od
     przychodu albo nigdzie (art. 81 ust. 2g u.ś.o.z. literalnie, addendum A6).
     Odliczenia dzielone między stawki proporcjonalnie do przychodu
     (art. 11 ust. 3 ustawy o ryczałcie), w groszach metodą największych reszt.
     businessRevenue – łączny przychód z działalności (tryb „Wiele stawek”:
     pole „Przychód roczny”); próg zdrowotnej i „ogólna kwota przychodów”
     liczone są od niego, a nie od sumy przydziałów (B10). */
  function computeRyczaltOption(ctx, method, allocations, businessRevenue) {
    const rateIds = Object.keys(allocations);
    const allocatedTotal = taxMath.round2(
      rateIds.reduce((sum, id) => sum + (allocations[id] || 0), 0),
    );
    const revenueTotal = taxMath.round2(
      Math.max(
        Number.isFinite(businessRevenue) ? businessRevenue : 0,
        allocatedTotal,
      ),
    );
    let socialFromRevenue;
    let socialFromScale;
    if (method === "scale") {
      socialFromScale = Math.min(ctx.social, ctx.otherIncome);
      socialFromRevenue = 0;
    } else {
      socialFromRevenue = Math.min(ctx.social, Math.max(revenueTotal, 0));
      socialFromScale = Math.min(
        taxMath.round2(ctx.social - socialFromRevenue),
        ctx.otherIncome,
      );
    }
    const socialNotFromScale = taxMath.round2(ctx.social - socialFromScale);
    const thresholdRevenue = taxMath.round2(revenueTotal - socialNotFromScale);
    const healthMonthly =
      taxMath.getRyczaltHealthMonthlyForRevenue(thresholdRevenue);
    const health = taxMath.getRyczaltHealthAnnualForRevenue(
      thresholdRevenue,
      ctx.healthMonths,
    );
    const healthDeduction = taxMath.round2(
      health * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR,
    );
    const totalDeduction = taxMath.round2(socialFromRevenue + healthDeduction);
    const rates = {};
    let ryczaltTax = 0;
    const shares = splitProportionally(
      totalDeduction,
      rateIds.map((rateId) => allocations[rateId] || 0),
      revenueTotal,
    );
    rateIds.forEach((rateId, index) => {
      const rateRevenue = allocations[rateId] || 0;
      const deduction = shares[index];
      const tax = calculateRyczaltRateTax(rateId, rateRevenue, deduction);
      rates[rateId] = { rateRevenue, deduction, tax };
      ryczaltTax += tax;
    });
    ryczaltTax = taxMath.round2(ryczaltTax);
    const scaleBase = taxMath.round2(ctx.otherIncome - socialFromScale);
    const scalePit = calculateScalePitOnly(scaleBase);
    const levy = calculateSolidarityLevy(scaleBase);
    const taxes = taxMath.round2(ryczaltTax + scalePit + levy);

    return {
      form: "ryczalt",
      method,
      revenueTotal,
      allocatedTotal,
      socialFromRevenue,
      socialFromScale,
      socialNotFromScale,
      thresholdRevenue,
      healthMonthly,
      health,
      healthDeduction,
      totalDeduction,
      rates,
      ryczaltTax,
      scaleBase,
      scalePit,
      levy,
      taxes,
      total: getVariantTotal(taxes, health, ctx),
    };
  }

  /* Liczy wariant dla każdego legalnego sposobu odliczenia składek
     społecznych i wybiera ten z najniższym łącznym obciążeniem (przy równym
     wyniku – pierwszy z listy SOCIAL_DEDUCTION_METHODS). */
  function evaluateSocialDeduction(form, ctx, computeOption) {
    let methods = SOCIAL_DEDUCTION_METHODS[form];
    if (ctx.social <= 0) {
      methods = [methods[0]];
    } else if (ctx.otherIncome <= 0) {
      methods = methods.filter((method) => method !== "scale");
    }
    const options = methods.map((method) => computeOption(method));
    let best = options[0];
    options.forEach((option) => {
      if (option.total < best.total - 0.004) best = option;
    });
    return {
      form,
      options,
      best,
      method: ctx.social > 0 ? best.method : "none",
      total: best.total,
    };
  }

  /* Warianty harmonogramu ZUS do porównania w każdym wariancie podatkowym:
     przy wakacjach składkowych – każdy dozwolony miesiąc oraz rezygnacja
     z wakacji (addendum A2); w pozostałych przypadkach jeden harmonogram. */
  function getScheduleCandidates(schedule) {
    const eligible = schedule.holiday.eligibleMonths || [];
    if (!schedule.holiday.requested || eligible.length === 0) {
      return [schedule];
    }
    return [
      ...eligible.map((month) => taxMath.applySocialHoliday(schedule, month)),
      taxMath.applySocialHoliday(schedule, null),
    ];
  }

  /* Wariant podatkowy: dla każdego harmonogramu (miesiąc wakacji) i każdego
     sposobu odliczenia składek liczy obciążenie i wybiera najniższe
     (przy remisie – wcześniejszy miesiąc wakacji). */
  function evaluateVariant(form, inputs, candidates, computeOption) {
    let bestEvaluation = null;
    const holidayCandidates = [];
    candidates.forEach((schedule) => {
      const ctx = buildCalculationContext(inputs, schedule);
      const evaluation = evaluateSocialDeduction(form, ctx, (method) =>
        computeOption(ctx, method),
      );
      evaluation.ctx = ctx;
      evaluation.schedule = schedule;
      if (candidates.length > 1) {
        holidayCandidates.push({
          month: schedule.holiday.month,
          saving: schedule.holiday.saving,
          total: evaluation.total,
        });
      }
      if (!bestEvaluation || evaluation.total < bestEvaluation.total - 0.004) {
        bestEvaluation = evaluation;
      }
    });
    bestEvaluation.holidayCandidates = holidayCandidates;
    bestEvaluation.holidayMonth = bestEvaluation.schedule.holiday.month;
    return bestEvaluation;
  }

  /* Wszystkie warianty dla podanych danych wejściowych i harmonogramu ZUS. */
  function computeVariants(inputs, schedule) {
    const ctx = buildCalculationContext(inputs, schedule);
    const candidates = getScheduleCandidates(schedule);
    const variants = {};
    const spouseIncome = inputs.jointTaxation ? inputs.spouseIncome : null;
    const ipBoxCoeff = inputs.ipBoxEnabled ? inputs.ipBoxCoeff : 0;
    const evaluate = (form, computeOption) =>
      evaluateVariant(form, inputs, candidates, computeOption);

    variants.taxScale = evaluate("scale", (c, method) =>
      computeScaleOption(c, method, 0, null),
    );
    if (inputs.jointTaxation) {
      variants.taxScaleJoint = evaluate("scale", (c, method) =>
        computeScaleOption(c, method, 0, spouseIncome),
      );
    }
    variants.taxLinear = evaluate("linear", (c, method) =>
      computeLinearOption(c, method, 0),
    );
    if (inputs.ipBoxEnabled) {
      variants.taxScaleIpBox = evaluate("scale", (c, method) =>
        computeScaleOption(c, method, ipBoxCoeff, null),
      );
      if (inputs.jointTaxation) {
        variants.taxScaleIpBoxJoint = evaluate("scale", (c, method) =>
          computeScaleOption(c, method, ipBoxCoeff, spouseIncome),
        );
      }
      variants.taxLinearIpBox = evaluate("linear", (c, method) =>
        computeLinearOption(c, method, ipBoxCoeff),
      );
    }

    if (inputs.isMultipleRates) {
      variants.ratesTotal = evaluate("ryczalt", (c, method) =>
        computeRyczaltOption(
          c,
          method,
          inputs.allocatedRevenues,
          inputs.revenue,
        ),
      );
    } else {
      RYCZALT_VARIANT_IDS.forEach((rateId) => {
        variants[rateId] = evaluate("ryczalt", (c, method) =>
          computeRyczaltOption(
            c,
            method,
            { [rateId]: inputs.revenue },
            inputs.revenue,
          ),
        );
      });
    }

    return { inputs, ctx, schedule, variants };
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

  function isAllocationComplete(totalRevenue, usedRevenue) {
    return Math.abs(taxMath.round2(usedRevenue - totalRevenue)) < 0.005;
  }

  function updateRemainingRevenue() {
    const totalRevenue = parsePLN(DOM.revenueInput.value);
    const usedRevenue = getAllocatedRevenues().total;
    const difference = taxMath.round2(usedRevenue - totalRevenue);
    if (!DOM.revenueInfoText) return;
    const container = DOM.revenueInfoText.parentElement;
    const incomplete = usedRevenue > 0 && !isAllocationComplete(totalRevenue, usedRevenue);
    if (container) container.classList.toggle("is-warning", incomplete);
    if (difference > 0) {
      DOM.revenueInfoText.innerHTML = `<span style="color: var(--error)">Przekroczono przychód o ${formatPLN(
        difference,
      )}</span> — popraw podział; suma ryczałtu nie jest porównywana.`;
    } else {
      const remainingRevenue = taxMath.round2(totalRevenue - usedRevenue);
      DOM.revenueInfoText.textContent = incomplete
        ? `Przychód do rozdysponowania: ${formatPLN(
            remainingRevenue,
          )} — przypisz cały przychód stawkom; do tego czasu suma ryczałtu nie jest porównywana.`
        : `Przychód do rozdysponowania: ${formatPLN(remainingRevenue)}`;
    }
  }

  /* ==================================================
     Main Calculation Function
  ================================================== */
  function parseAmount(raw) {
    return parseFloat(raw.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
  }

  function getCheckedValue(radios, fallback) {
    const checked = Array.from(radios || []).find((radio) => radio.checked);
    return checked ? checked.value : fallback;
  }

  /* Opcje harmonogramu ZUS z formularza (nieprawidłowe daty są pomijane). */
  function getZusOptions() {
    const sex = getCheckedValue(DOM.zusSexRadios, "");
    return {
      enabled: !!(DOM.zusEnabled && DOM.zusEnabled.checked),
      startDate: getValidDateValue(DOM.zusStartDate),
      path: getCheckedValue(DOM.zusPathRadios, "full"),
      sickness: !!(DOM.zusSickness && DOM.zusSickness.checked),
      employment: !!(DOM.zusEmployment && DOM.zusEmployment.checked),
      holiday: !!(DOM.zusHoliday && DOM.zusHoliday.checked),
      birthDate: getValidDateValue(DOM.zusBirthDate),
      sex: sex === "K" || sex === "M" ? sex : null,
    };
  }

  function gatherInputs() {
    const isMultipleRates = DOM.multipleRatesToggle.checked;
    const jointTaxation = isJointTaxationEnabled();
    const ipBoxEnabled = isIpBoxEnabled();
    const ipBoxCoeffRaw = parseFloat(DOM.ipBoxCoeffInput.value) / 100;
    return {
      revenue: parseAmount(DOM.revenueInput.value),
      costs: parseAmount(DOM.costsInput.value),
      otherIncome: DOM.otherIncomeInput
        ? Math.max(parsePLN(DOM.otherIncomeInput.value), 0)
        : 0,
      ipBoxEnabled,
      ipBoxCoeff: Number.isFinite(ipBoxCoeffRaw) ? ipBoxCoeffRaw : 0,
      jointTaxation,
      spouseIncome: jointTaxation ? parsePLN(DOM.spouseIncomeInput.value) : 0,
      isMultipleRates,
      allocatedRevenues: isMultipleRates ? getAllocatedRevenues().revenues : {},
      zus: getZusOptions(),
    };
  }

  /* Pełne obliczenie na podstawie aktualnego formularza (bez DOM-u wyników). */
  function computeFromForm() {
    const inputs = gatherInputs();
    const schedule = taxMath.buildSocialSchedule(inputs.zus);
    return computeVariants(inputs, schedule);
  }

  /* Surowe liczby wariantu w atrybutach data-* (odczyt programowy):
     data-total   – wynik wariantu (= taxes − baseline + health + social),
     data-taxes   – PIT/ryczałt/IP BOX + danina łącznie z innymi dochodami,
     data-baseline– PIT + danina od samych innych dochodów (odejmowane),
     data-health  – składka zdrowotna z działalności,
     data-social  – składki społeczne ZUS + FP/FS w tym wariancie,
     data-method  – wybrany sposób odliczenia składek społecznych,
     data-holiday-month – miesiąc wakacji składkowych (1–12) lub brak. */
  const VARIANT_DATA_KEYS = [
    "total",
    "taxes",
    "baseline",
    "health",
    "social",
    "method",
    "holidayMonth",
  ];

  function writeVariantData(element, evaluation) {
    const { best, ctx } = evaluation;
    element.dataset.total = String(evaluation.total);
    element.dataset.taxes = String(best.taxes);
    element.dataset.baseline = String(ctx.baseline.total);
    element.dataset.health = String(best.health);
    element.dataset.social = String(ctx.socialTotal);
    element.dataset.method = evaluation.method;
    if (evaluation.holidayMonth) {
      element.dataset.holidayMonth = String(evaluation.holidayMonth);
    } else {
      delete element.dataset.holidayMonth;
    }
  }

  function setVariantOutput(element, evaluation) {
    if (!element) return;
    element.value = formatPLN(evaluation.total);
    writeVariantData(element, evaluation);
  }

  function clearVariantOutput(element) {
    if (!element) return;
    element.value = "";
    VARIANT_DATA_KEYS.forEach((key) => delete element.dataset[key]);
  }

  function calculate() {
    const result = computeFromForm();
    const { inputs, ctx, variants } = result;

    document.getElementById("income").value = formatPLN(ctx.income);

    PIT_VARIANT_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (variants[id]) setVariantOutput(element, variants[id]);
      else clearVariantOutput(element);
    });

    /* Ryczałt: w trybie jednej stawki każdy wariant to alternatywa dla
       całego przychodu (odliczenia + składka zdrowotna + ZUS). W trybie
       „Wiele stawek" pole stawki pokazuje tylko jej część ryczałtu, a
       składki i PIT od innych dochodów są doliczane raz w sumie. */
    RYCZALT_VARIANT_IDS.forEach((rateId) => {
      const element = document.getElementById(rateId);
      if (inputs.isMultipleRates) {
        const rate = variants.ratesTotal.best.rates[rateId];
        clearVariantOutput(element);
        element.value = formatPLN(rate ? rate.tax : 0);
        element.dataset.total = String(rate ? rate.tax : 0);
      } else {
        setVariantOutput(element, variants[rateId]);
      }
    });

    updateRatesTotal(result);
    if (inputs.isMultipleRates) updateRemainingRevenue();
    renderZusStatus(result);
    updateRevenueTags(inputs.revenue, inputs.allocatedRevenues);
    rankAndSummarize(inputs.revenue, ctx.income);
    refreshBreakdownIfOpen();
  }

  /* ==================================================
     Update Rates Total
  ================================================== */
  function updateRatesTotal(result) {
    const ratesTotalElement = document.getElementById("ratesTotal");
    const ratesTotalValueElement = document.getElementById("ratesTotalValue");
    const ratesHealthRyczaltElement = document.getElementById(
      "ratesHealthRyczaltValue",
    );
    const ratesSocialRow = document.getElementById("ratesSocialRow");
    const ratesSocialElement = document.getElementById("ratesSocialValue");
    const ratesOtherRow = document.getElementById("ratesOtherPitRow");
    const ratesOtherElement = document.getElementById("ratesOtherPitValue");

    const anyRateSelected = Array.from(DOM.ryczaltCheckboxes).some(
      (checkbox) => checkbox.checked,
    );
    const evaluation = result && result.variants.ratesTotal;
    if (!DOM.multipleRatesToggle.checked || !anyRateSelected || !evaluation) {
      ratesTotalElement.classList.add("hidden");
      return;
    }

    const { best, ctx } = evaluation;
    const otherIncomeEffect = taxMath.round2(
      best.scalePit + best.levy - ctx.baseline.total,
    );

    ratesTotalElement.classList.remove("hidden");
    ratesHealthRyczaltElement.textContent = formatPLN(best.health);
    if (ratesSocialElement) {
      ratesSocialElement.textContent = formatPLN(ctx.socialTotal);
      ratesSocialRow.classList.toggle("hidden", !ctx.zusEnabled);
    }
    if (ratesOtherElement) {
      ratesOtherElement.textContent = formatPLN(otherIncomeEffect);
      ratesOtherRow.classList.toggle("hidden", ctx.otherIncome <= 0);
    }
    ratesTotalValueElement.textContent = formatPLN(evaluation.total);
    writeVariantData(ratesTotalValueElement, evaluation);
  }

  /* ==================================================
     Składki ZUS – statusy pod polami i podsumowanie w wynikach
  ================================================== */
  const ZUS_REGIME_LABELS = {
    full: "pełny ZUS",
    pref: "mały ZUS",
    ulga: "ulga na start",
    inactive: "przed rozpoczęciem działalności",
    employment: "etat – bez składek społecznych z JDG",
    off: "składki nieuwzględniane",
    holiday: "wakacje składkowe",
  };

  const ROMAN_MONTHS = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];

  function formatMonthYear(monthObj) {
    if (!monthObj) return "";
    return `${String(monthObj.m).padStart(2, "0")}.${monthObj.y}`;
  }

  function getMonthRegimeKey(entry) {
    return entry.holiday ? "holiday" : entry.regime;
  }

  /* Grupuje kolejne miesiące o tym samym trybie: „I–VI ulga na start · …”. */
  function getScheduleRanges(schedule) {
    const ranges = [];
    schedule.months.forEach((entry) => {
      const key = getMonthRegimeKey(entry);
      const last = ranges[ranges.length - 1];
      if (last && last.key === key) last.to = entry.month;
      else ranges.push({ key, from: entry.month, to: entry.month });
    });
    return ranges.map((range) => {
      const months =
        range.from === range.to
          ? ROMAN_MONTHS[range.from - 1]
          : `${ROMAN_MONTHS[range.from - 1]}–${ROMAN_MONTHS[range.to - 1]}`;
      return `${months} ${ZUS_REGIME_LABELS[range.key]}`;
    });
  }

  function getZusPathHintText(schedule) {
    if (!schedule.enabled) return "";
    if (schedule.startsAfterYear) {
      return "Data rozpoczęcia po 2026 r. — brak składek w 2026 r.";
    }
    if (schedule.employment) {
      return "Umowa o pracę ≥ minimalnego: bez obowiązkowych składek społecznych z JDG (zdrowotna nadal należna).";
    }
    if (!schedule.startDate) {
      return "Bez daty rozpoczęcia: działalność prowadzona przed 2026 r. — pełny ZUS przez cały rok (ścieżka nie ma znaczenia).";
    }
    if (schedule.path === "ulga") {
      return `Ulga na start do ${formatMonthYear(
        schedule.ulgaEnd,
      )}, mały ZUS do ${formatMonthYear(schedule.prefEnd)}, potem pełny ZUS.`;
    }
    if (schedule.path === "pref") {
      return `Mały ZUS do ${formatMonthYear(
        schedule.prefEnd,
      )}, potem pełny ZUS.`;
    }
    return "Pełny ZUS od dnia rozpoczęcia działalności.";
  }

  function getZusHolidayStatusText(schedule) {
    const { holiday } = schedule;
    if (!schedule.enabled || !holiday.requested) return "";
    if (holiday.eligibleMonths && holiday.eligibleMonths.length) {
      const first = { y: schedule.year, m: holiday.eligibleMonths[0] };
      const requestFirst = taxMath.monthFromIndex(
        taxMath.monthIndex(first.y, first.m) - 1,
      );
      const defaultText = holiday.applied
        ? ` Zwykle najkorzystniejszy jest miesiąc z najwyższymi składkami: ${formatMonthYear(
            { y: schedule.year, m: holiday.month },
          )} (−${formatPLN(holiday.saving)}).`
        : "";
      return `Przysługują za jeden miesiąc od ${formatMonthYear(
        first,
      )} (wniosek RWS najwcześniej w ${formatMonthYear(
        requestFirst,
      )}). Miesiąc dobierany osobno dla każdego wariantu.${defaultText}`;
    }
    if (holiday.reason === "employment") {
      return "Nie przysługują: przy umowie o pracę ≥ minimalnego nie podlegasz obowiązkowo ubezpieczeniom społecznym z JDG.";
    }
    if (holiday.reason === "too-late") {
      const afterUlga = schedule.path === "ulga" && schedule.startDate;
      return `Nie przysługują w 2026 r.: pierwszy miesiąc podlegania ubezpieczeniom społecznym to ${formatMonthYear(
        holiday.firstSocialMonth,
      )}${
        afterUlga ? " (w uldze na start wakacje nie przysługują)" : ""
      }, a wniosek składa się w miesiącu poprzedzającym zwolnienie — najwcześniej za ${formatMonthYear(
        holiday.earliestMonth,
      )}.`;
    }
    return "Nie przysługują w 2026 r.: brak miesiąca, za który można uzyskać zwolnienie.";
  }

  function getZusBirthHintText(schedule, zusOptions) {
    const defaultText =
      "Opcjonalnie — tylko do zwolnienia z FP i FS (kobiety 55+, mężczyźni 60+).";
    if (!zusOptions.birthDate) return defaultText;
    if (!zusOptions.sex) {
      return "Wybierz płeć, aby uwzględnić zwolnienie z FP i FS.";
    }
    const from = schedule.fpExemptFrom;
    if (!from) return defaultText;
    const fromIdx = taxMath.monthIndex(from.y, from.m);
    if (fromIdx <= taxMath.monthIndex(schedule.year, 1)) {
      return "Zwolnienie z FP i FS przez cały 2026 r.";
    }
    if (fromIdx > taxMath.monthIndex(schedule.year, 12)) {
      return `Zwolnienie z FP i FS dopiero od ${formatMonthYear(
        from,
      )} (po 2026 r.).`;
    }
    return `Zwolnienie z FP i FS od ${formatMonthYear(from)}.`;
  }

  function formatDatePL(dateObj) {
    if (!dateObj) return "";
    return `${String(dateObj.d).padStart(2, "0")}.${String(dateObj.m).padStart(
      2,
      "0",
    )}.${dateObj.y}`;
  }

  function getZusStartHintText(schedule) {
    const n = schedule.healthMonths;
    const typed = DOM.zusStartDate && DOM.zusStartDate.value.trim() !== "";
    if (!schedule.startDate && typed) {
      return "Data pominięta w obliczeniach do czasu poprawienia (liczymy cały 2026 r.).";
    }
    if (!schedule.startDate) {
      return "Puste = działalność przez cały 2026 r. (12 mies. składki zdrowotnej).";
    }
    if (schedule.startsAfterYear) {
      return "Działalność rozpoczyna się po 2026 r. — brak składek w 2026 r.";
    }
    if (schedule.startsBeforeYear) {
      return `Działalność od ${formatDatePL(
        schedule.startDate,
      )} — składka zdrowotna za 12 mies. 2026 r.`;
    }
    return `Składka zdrowotna za ${n} mies. 2026 r. (od ${formatMonthYear(
      schedule.startDate,
    )}, pełna kwota także za niepełny miesiąc).`;
  }

  function renderZusStatus(result) {
    const { schedule, ctx, inputs } = result;

    if (DOM.zusStartHint) {
      DOM.zusStartHint.textContent = getZusStartHintText(schedule);
    }

    if (DOM.zusPathHint) DOM.zusPathHint.textContent = getZusPathHintText(schedule);
    if (DOM.zusHolidayStatus) {
      DOM.zusHolidayStatus.textContent = getZusHolidayStatusText(schedule);
      DOM.zusHolidayStatus.dataset.state = schedule.holiday.applied
        ? "applied"
        : schedule.holiday.reason || "";
    }
    if (DOM.zusBirthHint) {
      DOM.zusBirthHint.textContent = getZusBirthHintText(schedule, inputs.zus);
    }
    if (DOM.comparePitMeta) {
      DOM.comparePitMeta.textContent = schedule.enabled
        ? "PIT + zdrowotna + ZUS"
        : "PIT + składka zdrowotna";
    }

    if (!DOM.zusSummary) return;
    DOM.zusSummary.classList.toggle("hidden", !schedule.enabled);
    DOM.zusSocialTotal.textContent = formatPLN(schedule.totals.total);
    DOM.zusSocialTotal.dataset.total = String(schedule.totals.total);
    DOM.zusSocialTotal.dataset.social = String(schedule.totals.social);
    DOM.zusSocialTotal.dataset.fpfs = String(schedule.totals.fpfs);
    DOM.zusFpTotal.textContent = formatPLN(schedule.totals.fpfs);
    DOM.zusHealthMonths.textContent = String(ctx.healthMonths);
    if (DOM.zusSummaryMeta) {
      DOM.zusSummaryMeta.textContent = "wliczone w każdy wariant";
    }
    if (DOM.zusScheduleSummary) {
      DOM.zusScheduleSummary.textContent = getScheduleRanges(schedule).join(
        " · ",
      );
    }
    if (DOM.zusMonths) {
      DOM.zusMonths.textContent = "";
      schedule.months.forEach((entry) => {
        const item = document.createElement("li");
        const key = getMonthRegimeKey(entry);
        item.dataset.regime = key;
        if (entry.partial) item.dataset.partial = "true";
        item.textContent = ROMAN_MONTHS[entry.month - 1];
        const amount = entry.holiday ? entry.waived.total : entry.total;
        item.title = `${formatMonthYear({
          y: schedule.year,
          m: entry.month,
        })}: ${ZUS_REGIME_LABELS[key]}${
          entry.partial ? " (niepełny miesiąc)" : ""
        } — ${formatPLN(entry.holiday ? 0 : amount)}`;
        DOM.zusMonths.appendChild(item);
      });
    }
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
      // only joint variants may be negative (see
      // calculateJointScalePitAttributed); anything else ≤ 0 is not a real
      // option and must never win the ranking
      if (value === 0) return;
      if (value < 0 && !JOINT_VARIANT_IDS.includes(id)) return;
      variants.push(variant);
    };

    PIT_VARIANT_IDS.forEach(collectVariant);

    if (isMultiRate) {
      // in multi-rate mode the per-rate field shows only that rate's PIT
      // share (without health / ZUS). The user-meaningful ryczałt cost is the
      // aggregated "Łącznie" row. Compare that as one option,
      // but only once the user actually allocated some revenue to a rate.
      // the aggregated total is compared only when the whole revenue is
      // allocated to rates (otherwise part of the revenue has no rate)
      const allocatedRevenue = getAllocatedRevenues().total;
      const ratesTotalVariant = getVisibleRatesTotalVariant();
      if (
        ratesTotalVariant &&
        allocatedRevenue > 0 &&
        isAllocationComplete(revenue, allocatedRevenue) &&
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
    } else if (variants.length > 1) {
      DOM.bestCardSavings.textContent =
        "Wszystkie widoczne warianty dają tę samą kwotę.";
    } else {
      DOM.bestCardSavings.textContent =
        "Tylko jeden widoczny wariant — wybierz więcej, aby porównać.";
    }

    if (best.value < 0) {
      const note = document.createElement("span");
      note.className = "best-card-note";
      note.textContent =
        "Kwota ujemna: wspólne rozliczenie obniża PIT małżonka bardziej, niż wynosi Twoje obciążenie (oszczędność gospodarstwa domowego).";
      DOM.bestCardSavings.appendChild(note);
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
    const isOtherIncomeValid = validateInput(
      DOM.otherIncomeInput.value,
      "otherIncome",
    );
    const isIpBoxValid = isIpBoxEnabled()
      ? validateIpBoxCoeff(DOM.ipBoxCoeffInput.value)
      : true;
    const isStartDateValid = validateStartDate();
    const isBirthDateValid = validateBirthDate();

    if (
      isRevenueValid &&
      isCostsValid &&
      isOtherIncomeValid &&
      isIpBoxValid &&
      isStartDateValid &&
      isBirthDateValid
    ) {
      DOM.revenueInput.value = formatPLN(parsePLN(DOM.revenueInput.value));
      DOM.costsInput.value = formatPLN(parsePLN(DOM.costsInput.value));
      if (DOM.otherIncomeInput.value !== "") {
        DOM.otherIncomeInput.value = formatPLN(
          parsePLN(DOM.otherIncomeInput.value),
        );
      }
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
    DOM.otherIncomeInput.value = "";
    document.getElementById("otherIncome-error").textContent = "";
    document.getElementById("otherIncome-error").classList.remove("visible");
    DOM.otherIncomeInput.classList.remove("error");

    DOM.zusEnabled.checked = true;
    if (DOM.zusReveal) DOM.zusReveal.classList.add("is-revealed");
    DOM.zusStartDate.value = "";
    DOM.zusBirthDate.value = "";
    validateStartDate();
    validateBirthDate();
    DOM.zusPathRadios.forEach((radio) => {
      radio.checked = radio.value === "full";
    });
    DOM.zusSexRadios.forEach((radio) => {
      radio.checked = radio.value === "";
    });
    DOM.zusSickness.checked = true;
    DOM.zusEmployment.checked = false;
    DOM.zusHoliday.checked = false;

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
    DOM.otherIncomeInput,
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

  DOM.otherIncomeInput.addEventListener("input", (e) => {
    const isValid = validateInput(e.target.value, "otherIncome");
    if (isValid) {
      const cursorPos = e.target.selectionStart;
      const originalValue = e.target.value;
      calculate();
      e.target.value = originalValue;
      e.target.setSelectionRange(cursorPos, cursorPos);
    }
  });
  DOM.otherIncomeInput.addEventListener("blur", (e) => {
    if (e.target.value === "") return;
    e.target.value = formatPLN(parsePLN(e.target.value));
    calculate();
  });

  /* Składki ZUS: przełącznik sekcji, daty, ścieżka i opcje */
  DOM.zusEnabled.addEventListener("change", () => {
    if (DOM.zusReveal) {
      DOM.zusReveal.classList.toggle("is-revealed", DOM.zusEnabled.checked);
    }
    calculate();
  });
  [
    [DOM.zusStartDate, validateStartDate],
    [DOM.zusBirthDate, validateBirthDate],
  ].forEach(([input, validate]) => {
    ["input", "change"].forEach((type) => {
      input.addEventListener(type, () => {
        validate();
        calculate();
      });
    });
  });
  [...DOM.zusPathRadios, ...DOM.zusSexRadios].forEach((radio) => {
    radio.addEventListener("change", calculate);
  });
  [DOM.zusSickness, DOM.zusEmployment, DOM.zusHoliday].forEach((checkbox) => {
    checkbox.addEventListener("change", calculate);
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
      const isValid = validateRateInput(e.target);
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
     Tekst budowany wyłącznie z wyniku computeVariants(), więc szczegóły
     zawsze odpowiadają kwotom pokazanym w wynikach.
  ================================================== */
  function formatNumberPL(value) {
    return (
      new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " zł"
    );
  }

  function formatAmountPL(value) {
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercentPL(value) {
    return (value * 100).toLocaleString("pl-PL") + "%";
  }

  const SEPARATOR_LINE = "=".repeat(50);

  function toSentenceCase(title) {
    return title.toLowerCase().replace(/ip box/g, "IP BOX");
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

  function getLevyLine(levyDetails, indent, baseDescription) {
    const rate = TAX_CONSTANTS.SOLIDARITY_RATE;
    return `${indent}Danina solidarnościowa ${formatPercentPL(
      rate,
    )} (art. 30h ustawy o PIT; ${baseDescription}; nadwyżka ponad ${formatNumberPL(
      levyDetails.threshold,
    )}): ${formatNumberPL(levyDetails.aboveThreshold)} × ${formatPercentPL(
      rate,
    )} = ${formatNumberPL(levyDetails.levy)}\n`;
  }

  /* Wspólna część breakdownu rozliczenia wspólnego: PIT wspólny pary,
     PIT małżonka przy rozliczeniu indywidualnym i różnica przypisana
     podatnikowi (zob. calculateJointScalePitAttributed). */
  function getJointPitAttributionBreakdown(
    scaleIncome,
    spouseIncome,
    scaleIncomeLabel,
  ) {
    const jointIncome = taxMath.round2(
      Math.max(scaleIncome, 0) + Math.max(spouseIncome, 0),
    );
    const halfIncome = taxMath.round2(jointIncome / 2);
    const halfPitDetails = getScalePitDetails(halfIncome);
    const jointPit = taxMath.round2(halfPitDetails.totalPit * 2);
    const spousePitDetails = getScalePitDetails(spouseIncome);
    const attributedPit = taxMath.round2(jointPit - spousePitDetails.totalPit);

    let text = `  ${scaleIncomeLabel}: ${formatNumberPL(
      Math.max(scaleIncome, 0),
    )} + ${formatNumberPL(spouseIncome)} (dochód małżonka) = ${formatNumberPL(
      jointIncome,
    )}\n`;
    text += `  Połowa łącznego dochodu: ${formatNumberPL(
      jointIncome,
    )} : 2 = ${formatNumberPL(halfIncome)}\n`;

    text += `\n  1) PIT wspólny pary (od połowy łącznego dochodu × 2, art. 6 ust. 2):\n`;
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

  /* ---------- Składki ZUS: tabela miesięczna ---------- */
  const ZUS_TABLE_REGIME = {
    full: "pełny",
    pref: "mały",
    ulga: "ulga",
    inactive: "—",
    employment: "etat",
    off: "—",
    holiday: "wakac.",
  };

  const ZUS_PATH_LABELS = {
    full: "pełny ZUS od rozpoczęcia działalności",
    ulga: "ulga na start → mały ZUS (preferencyjny) → pełny ZUS",
    pref: "mały ZUS (preferencyjny, bez ulgi na start) → pełny ZUS",
  };

  function getZusMonthlyTable(schedule) {
    const columns = [
      { title: "Mc", width: 3, align: "left" },
      { title: "Tryb", width: 7, align: "left" },
      { title: "Podstawa", width: 9 },
      { title: "Emer.", width: 9 },
      { title: "Rent.", width: 8 },
      { title: "Chor.", width: 7 },
      { title: "Wyp.", width: 7 },
      { title: "FP+FS", width: 7 },
      { title: "Razem", width: 9 },
    ];
    const formatRow = (cells) =>
      cells
        .map((cell, index) => {
          const column = columns[index];
          const value = String(cell);
          return column.align === "left"
            ? value.padEnd(column.width)
            : value.padStart(column.width);
        })
        .join(" ")
        .trimEnd();

    let text = formatRow(columns.map((column) => column.title)) + "\n";
    schedule.months.forEach((entry) => {
      const key = entry.holiday ? "holiday" : entry.regime;
      const shown = entry.holiday ? entry.waived : entry;
      text +=
        formatRow([
          String(entry.month).padStart(2, "0"),
          ZUS_TABLE_REGIME[key] + (entry.partial ? "*" : ""),
          formatAmountPL(entry.base),
          formatAmountPL(shown.pension),
          formatAmountPL(shown.disability),
          formatAmountPL(shown.sickness),
          formatAmountPL(shown.accident),
          formatAmountPL(shown.fpfs),
          formatAmountPL(entry.total),
        ]) + "\n";
    });
    const totals = schedule.totals;
    text +=
      formatRow([
        "Σ",
        "",
        "",
        formatAmountPL(totals.pension),
        formatAmountPL(totals.disability),
        formatAmountPL(totals.sickness),
        formatAmountPL(totals.accident),
        formatAmountPL(totals.fpfs),
        formatAmountPL(totals.total),
      ]) + "\n";
    return text;
  }

  function getZusSectionText(result) {
    const { schedule, ctx } = result;
    const C = TAX_CONSTANTS;
    let text = `\n${SEPARATOR_LINE}\n=== SKŁADKI ZUS 2026 ===\n${SEPARATOR_LINE}\n\n`;

    text += `Data rozpoczęcia działalności: ${
      schedule.startDate
        ? formatDatePL(schedule.startDate)
        : "brak (działalność prowadzona przed 2026 r. i przez cały rok)"
    }\n`;
    text += `Miesiące składki zdrowotnej w 2026 r.: ${schedule.healthMonths}`;
    text += schedule.startDate && !schedule.startsBeforeYear
      ? ` (od ${formatMonthYear(schedule.startDate)}; składka miesięczna i niepodzielna — pełna kwota także za niepełny miesiąc, art. 79 ust. 2 u.ś.o.z.)\n`
      : "\n";

    if (!schedule.enabled) {
      text += `Składki społeczne: nieuwzględniane (przełącznik wyłączony).\n`;
      return text;
    }

    text += `Ścieżka składek: ${
      schedule.startDate
        ? ZUS_PATH_LABELS[schedule.path]
        : "pełny ZUS przez cały rok (bez daty rozpoczęcia ścieżka nie ma znaczenia)"
    }\n`;
    if (schedule.ulgaEnd) {
      text += `  Ulga na start (art. 18 Prawa przedsiębiorców, 6 mies.${
        schedule.startDate.d !== 1
          ? " + niepełny miesiąc rozpoczęcia"
          : ""
      }): do ${formatMonthYear(schedule.ulgaEnd)}\n`;
    }
    if (schedule.prefEnd) {
      text += `  Mały ZUS (art. 18a u.s.u.s., 24 pełne miesiące kalendarzowe${
        schedule.path === "pref" && schedule.startDate.d !== 1
          ? " + niepełny miesiąc rozpoczęcia"
          : ""
      }): do ${formatMonthYear(schedule.prefEnd)}\n`;
    }
    text += `Składka chorobowa (dobrowolna): ${
      schedule.sicknessEnabled ? "tak" : "nie"
    }\n`;
    text += `Umowa o pracę ≥ minimalnego wynagrodzenia: ${
      schedule.employment
        ? "tak — brak obowiązkowych składek społecznych z działalności (art. 9 ust. 1 i 1a u.s.u.s.)"
        : "nie"
    }\n`;
    const zusOptions = result.inputs.zus;
    let fpText = "brak danych — FP i FS należne";
    if (zusOptions.birthDate && zusOptions.sex && schedule.fpExemptFrom) {
      const fromIdx = taxMath.monthIndex(
        schedule.fpExemptFrom.y,
        schedule.fpExemptFrom.m,
      );
      if (fromIdx <= taxMath.monthIndex(schedule.year, 1)) {
        fpText = "przez cały 2026 r.";
      } else if (fromIdx > taxMath.monthIndex(schedule.year, 12)) {
        fpText = `dopiero od ${formatMonthYear(schedule.fpExemptFrom)} (po 2026 r.)`;
      } else {
        fpText = `od ${formatMonthYear(schedule.fpExemptFrom)}`;
      }
      fpText += ` (${zusOptions.sex === "K" ? "kobieta, 55 lat" : "mężczyzna, 60 lat"}; urodzenie ${formatDatePL(
        taxMath.parseISODate(zusOptions.birthDate),
      )}; art. 261 ustawy o rynku pracy)`;
    }
    text += `Zwolnienie z FP/FS ze względu na wiek: ${fpText}\n`;

    const holiday = schedule.holiday;
    if (holiday.requested) {
      text += `Wakacje składkowe (art. 17a–17b u.s.u.s.): `;
      if (holiday.eligibleMonths.length) {
        text += `przysługują za jeden miesiąc spośród: ${holiday.eligibleMonths
          .map((m) => ROMAN_MONTHS[m - 1])
          .join(", ")}`;
        text += holiday.firstSocialMonth
          ? ` (pierwszy miesiąc podlegania ubezpieczeniom społecznym: ${formatMonthYear(
              holiday.firstSocialMonth,
            )}; wniosek RWS w miesiącu poprzedzającym zwolnienie, a w miesiącu przed wnioskiem trzeba podlegać ubezpieczeniom → najwcześniej ${formatMonthYear(
              holiday.earliestMonth,
            )})`
          : " (ubezpieczenia społeczne od przed 2026 r.)";
        text += `.\n  Miesiąc wybierany osobno dla każdego wariantu (najniższe obciążenie; także rezygnacja, jeśli wakacje się nie opłacają). Tabela poniżej: wakacje w ${formatMonthYear(
          { y: schedule.year, m: holiday.month },
        )} (miesiąc z najwyższymi składkami).\n`;
      } else {
        text += `${getZusHolidayStatusText(schedule)}\n`;
      }
    }

    text += `\nPodstawy 2026: pełna ${formatNumberPL(C.ZUS_FULL_BASE)} (60% × ${formatNumberPL(
      C.ZUS_FORECAST_AVG_SALARY,
    )}, art. 18 ust. 8 u.s.u.s.), mała ${formatNumberPL(
      C.ZUS_PREF_BASE,
    )} (30% × ${formatNumberPL(C.MIN_WAGE)}, art. 18a).\n`;
    text += `Stopy: emerytalna ${formatPercentPL(
      C.ZUS_RATE_PENSION,
    )}, rentowe ${formatPercentPL(C.ZUS_RATE_DISABILITY)}, chorobowa ${formatPercentPL(
      C.ZUS_RATE_SICKNESS,
    )}, wypadkowa ${formatPercentPL(C.ZUS_RATE_ACCIDENT)}, FP ${formatPercentPL(
      C.ZUS_RATE_FP,
    )} + FS ${formatPercentPL(
      C.ZUS_RATE_FS,
    )} (łącznie, tylko przy podstawie ≥ minimalnego wynagrodzenia, czyli na pełnym ZUS). Każda składka zaokrąglana do grosza.\n\n`;

    text += getZusMonthlyTable(schedule);
    text += `\n* niepełny miesiąc: podstawa × dni podlegania / dni miesiąca (art. 18 ust. 9 u.s.u.s.)\n`;
    text += `Tryb: pełny = pełny ZUS, mały = mały ZUS (preferencyjny), ulga = ulga na start (brak ubezpieczeń społecznych), wakac. = wakacje składkowe (kwoty zwolnione pokazane, w Razem 0), etat = umowa o pracę, — = poza działalnością.\n\n`;

    text += `Składki społeczne do odliczenia (emerytalna, rentowa, chorobowa, wypadkowa): ${formatNumberPL(
      schedule.totals.social,
    )}\n`;
    text += `FP + FS (koszt uzyskania przychodu na skali i liniowym; na ryczałcie nieodliczalne): ${formatNumberPL(
      schedule.totals.fpfs,
    )}\n`;
    text += `Razem składki społeczne ZUS 2026: ${formatNumberPL(
      schedule.totals.total,
    )}\n`;
    text += `(założenie kasowe: składki należne za 2026 r. zapłacone i odliczone w 2026 r.)\n`;
    if (ctx.zusEnabled && schedule.holiday.eligibleMonths.length) {
      text += `(kwota może się różnić w wariantach, które wybrały inny miesiąc wakacji lub z nich zrezygnowały)\n`;
    }
    return text;
  }

  /* ---------- Inne dochody: PIT „bez działalności” ---------- */
  function getOtherIncomeSectionText(ctx) {
    if (ctx.otherIncome <= 0) return "";
    const details = getScalePitDetails(ctx.otherIncome);
    let text = `\n--- INNE DOCHODY OPODATKOWANE SKALĄ ---\n\n`;
    text += `Dochód: ${formatNumberPL(ctx.otherIncome)}\n`;
    text += `PIT od samych innych dochodów (bez działalności, indywidualnie wg skali):\n`;
    text += getScalePitBracketLines(details, "  ");
    text += `  PIT: ${formatNumberPL(ctx.baseline.pit)}\n`;
    if (ctx.baseline.levy > 0) {
      text += `  Danina solidarnościowa od tych dochodów: ${formatNumberPL(
        ctx.baseline.levy,
      )}\n`;
    }
    text += `Kwota odejmowana od podatków każdego wariantu: ${formatNumberPL(
      ctx.baseline.total,
    )}\n`;
    text += `(wynik wariantu = obciążenie przypisane działalności: łączne podatki − podatek, który i tak zapłaciłbyś od innych dochodów; składka zdrowotna od etatu jest poza zakresem)\n`;
    return text;
  }

  /* ---------- Elementy wspólne dla wariantów ---------- */
  function getVariantZusLine(evaluation) {
    const { ctx, schedule } = evaluation;
    if (!ctx.zusEnabled) {
      return `Składki społeczne ZUS: nieuwzględniane\n`;
    }
    let text = `Składki ZUS w tym wariancie: społeczne ${formatNumberPL(
      ctx.social,
    )} + FP/FS ${formatNumberPL(ctx.fpfs)} = ${formatNumberPL(
      ctx.socialTotal,
    )}\n`;
    const holiday = schedule.holiday;
    if (holiday.requested && holiday.eligibleMonths.length) {
      text += holiday.applied
        ? `  Wakacje składkowe: ${formatMonthYear({
            y: schedule.year,
            m: holiday.month,
          })} (zwolnienie ${formatNumberPL(holiday.saving)})\n`
        : `  Wakacje składkowe: nieopłacalne w tym wariancie — pominięte\n`;
    }
    return text;
  }

  /* Porównanie miesięcy wakacji (kolejne miesiące o tym samym wyniku
     są łączone w zakres). */
  function getHolidayComparisonText(evaluation) {
    const candidates = evaluation.holidayCandidates || [];
    if (candidates.length < 2) return "";
    const groups = [];
    candidates.forEach((candidate) => {
      const last = groups[groups.length - 1];
      if (
        last &&
        candidate.month !== null &&
        last.to !== null &&
        candidate.month === last.to + 1 &&
        Math.abs(candidate.total - last.total) < 0.005 &&
        Math.abs(candidate.saving - last.saving) < 0.005
      ) {
        last.to = candidate.month;
      } else {
        groups.push({ ...candidate, from: candidate.month, to: candidate.month });
      }
    });
    let text = `\nWakacje składkowe — porównanie (łączne obciążenie wariantu):\n`;
    groups.forEach((group) => {
      const chosen =
        group.from === null
          ? evaluation.holidayMonth === null
          : evaluation.holidayMonth !== null &&
            evaluation.holidayMonth >= group.from &&
            evaluation.holidayMonth <= group.to;
      const label =
        group.from === null
          ? "bez wakacji"
          : `${
              group.from === group.to
                ? ROMAN_MONTHS[group.from - 1]
                : `${ROMAN_MONTHS[group.from - 1]}–${ROMAN_MONTHS[group.to - 1]}`
            } (zwolnienie ${formatNumberPL(group.saving)})`;
      text += `  ${chosen ? "[x]" : "[ ]"} ${label}: ${formatNumberPL(group.total)}${
        chosen ? "  ← wybrane" : ""
      }\n`;
    });
    return text;
  }

  function getDeductionComparisonText(evaluation) {
    const { ctx, options, best, form } = evaluation;
    if (!ctx.zusEnabled) return "";
    const labels = SOCIAL_DEDUCTION_LABELS[form];
    if (ctx.social <= 0) {
      return `\nOdliczenie składek społecznych: ${labels.none}\n`;
    }
    if (options.length === 1) {
      return `\nOdliczenie składek społecznych (${formatNumberPL(
        ctx.social,
      )}): ${labels[best.method]} — jedyny sensowny sposób (brak innych dochodów ze skali)\n`;
    }
    let text = `\nOdliczenie składek społecznych (${formatNumberPL(
      ctx.social,
    )}) — porównanie sposobów (łączne obciążenie wariantu):\n`;
    options.forEach((option) => {
      const chosen = option === best;
      const diff = taxMath.round2(option.total - best.total);
      text += `  ${chosen ? "[x]" : "[ ]"} ${labels[option.method]}: ${formatNumberPL(
        option.total,
      )}${chosen ? "  ← wybrany" : diff > 0 ? ` (+${formatNumberPL(diff)})` : " (tyle samo)"}\n`;
    });
    if (options.length > 1) {
      text += `  (przy równym wyniku wybierany jest pierwszy sposób; składek nie dzielimy między sposoby)\n`;
    }
    if (form === "scale" && evaluation.best.ipBoxCoeff > 0) {
      text += `  (w kosztach składki pomniejszają proporcjonalnie także dochód z IP BOX; od dochodu – tylko dochód ze skali)\n`;
    }
    return text;
  }

  function getVariantHeaderText(title, evaluation, extraLines = "") {
    const { ctx } = evaluation;
    let text = `\n--- ${title} ---\n\n`;
    text += `Dochód z działalności (przychód − koszty, przed składkami ZUS): ${formatNumberPL(
      ctx.income,
    )}\n`;
    text += extraLines;
    if (ctx.otherIncome > 0) {
      text += `Inne dochody opodatkowane skalą: ${formatNumberPL(
        ctx.otherIncome,
      )}\n`;
    }
    text += getVariantZusLine(evaluation);
    text += getHolidayComparisonText(evaluation);
    text += getDeductionComparisonText(evaluation);
    return text;
  }

  function getHealthIncomeBaseLines(ctx, rate) {
    let text = "";
    if (ctx.fpfs > 0 || ctx.social > 0) {
      text += `  Podstawa (art. 81 ust. 2 u.ś.o.z.): dochód ${formatNumberPL(
        ctx.income,
      )} − FP/FS ${formatNumberPL(ctx.fpfs)} − składki społeczne ${formatNumberPL(
        ctx.social,
      )} = ${formatNumberPL(ctx.healthBaseIncome)}\n`;
    } else {
      text += `  Podstawa: dochód ${formatNumberPL(ctx.healthBaseIncome)}\n`;
    }
    const calculated = taxMath.round2(Math.max(ctx.healthBaseIncome, 0) * rate);
    text += `  ${formatNumberPL(Math.max(ctx.healthBaseIncome, 0))} × ${formatPercentPL(
      rate,
    )} = ${formatNumberPL(calculated)}\n`;
    return { text, calculated };
  }

  function getHealthPitFormText(evaluation, rate, title) {
    const { ctx, best } = evaluation;
    let text = `\nSkładka zdrowotna (${title}):\n`;
    const base = getHealthIncomeBaseLines(ctx, rate);
    text += base.text;
    const minHealth = taxMath.getMinHealthAnnual(ctx.healthMonths);
    text += `  Minimalna (art. 81 ust. 2b / art. 79a): ${ctx.healthMonths} mies. × ${formatNumberPL(
      taxMath.getMinHealthMonthly(),
    )} = ${formatNumberPL(minHealth)}\n`;
    if (base.calculated < minHealth) {
      text += `  (obliczona składka jest niższa od minimalnej, stosuje się minimalną)\n`;
    }
    text += `  Składka zdrowotna do zapłaty: ${formatNumberPL(best.health)}\n`;
    if (ctx.social > 0 || ctx.fpfs > 0) {
      text += `  (podstawa nie zależy od sposobu odliczenia składek społecznych)\n`;
    }
    return text;
  }

  function getTotalSummaryText(evaluation) {
    const { ctx, best } = evaluation;
    let text = "";
    let taxesAttributed = best.taxes;
    if (ctx.baseline.total > 0) {
      taxesAttributed = taxMath.round2(best.taxes - ctx.baseline.total);
      text += `\n  Podatki łącznie (z innymi dochodami): ${formatNumberPL(
        best.taxes,
      )}\n`;
      text += `  − podatek od samych innych dochodów (bez działalności): ${formatNumberPL(
        ctx.baseline.total,
      )}\n`;
      text += `  = podatki przypisane działalności: ${formatNumberPL(
        taxesAttributed,
      )}\n`;
    }
    const parts = [taxesAttributed, best.health];
    let label = "PIT + składka zdrowotna";
    if (ctx.zusEnabled) {
      parts.push(ctx.socialTotal);
      label += " + składki społeczne ZUS";
    }
    if (ctx.baseline.total > 0) label += "; obciążenie przypisane działalności";
    text += `\nRAZEM (${label}):\n  ${parts
      .map((part) => formatNumberPL(part))
      .join(" + ")} = ${formatNumberPL(evaluation.total)}\n`;
    return text;
  }

  function getIpBoxSplitLines(option, indent) {
    let text = `${indent}Podział dochodu (współczynnik IP BOX ${formatPercentPL(
      option.ipBoxCoeff,
    )}):\n`;
    text += `${indent}  - Dochód IP BOX: ${formatNumberPL(
      Math.max(option.businessAfterCosts, 0),
    )} × ${formatPercentPL(option.ipBoxCoeff)} = ${formatNumberPL(
      option.ipBoxIncome,
    )}\n`;
    text += `${indent}  - Dochód pozostały: ${formatNumberPL(
      option.regularIncome,
    )}\n`;
    text += `${indent}Podatek IP BOX (art. 30ca): ${formatNumberPL(
      option.ipBoxIncome,
    )} × ${formatPercentPL(TAX_CONSTANTS.IP_BOX_RATE)} = ${formatNumberPL(
      option.ipBoxTax,
    )}\n`;
    return text;
  }

  function getBusinessAfterCostsLine(option, ctx, indent) {
    const parts = [formatNumberPL(ctx.income)];
    if (ctx.fpfs > 0) parts.push(`${formatNumberPL(ctx.fpfs)} (FP/FS w kosztach)`);
    if (option.socialInCosts > 0) {
      parts.push(`${formatNumberPL(option.socialInCosts)} (składki społeczne w kosztach)`);
    }
    if (parts.length === 1) {
      return `${indent}Dochód z działalności: ${formatNumberPL(option.businessAfterCosts)}\n`;
    }
    return `${indent}Dochód z działalności po kosztach ZUS: ${parts.join(
      " − ",
    )} = ${formatNumberPL(option.businessAfterCosts)}\n`;
  }

  /* ---------- Skala (indywidualnie / wspólnie / IP BOX) ---------- */
  function getScaleVariantText(title, evaluation) {
    const { ctx, best } = evaluation;
    const hasIpBox = best.ipBoxCoeff > 0;
    let extra = "";
    if (hasIpBox) extra += `Współczynnik IP BOX: ${formatPercentPL(best.ipBoxCoeff)}\n`;
    if (best.joint) extra += `Dochód małżonka: ${formatNumberPL(best.spouseIncome)}\n`;
    let text = getVariantHeaderText(title, evaluation, extra);
    text += getHealthPitFormText(
      evaluation,
      TAX_CONSTANTS.HEALTH_RATE_SCALE,
      `skala${hasIpBox ? " z IP BOX" : ""}: 9% dochodu z całej działalności${
        hasIpBox ? ", także z IP BOX" : ""
      }, art. 79 ust. 1 i art. 81 ust. 2 u.ś.o.z.`,
    );

    text += `\nObliczenie podatku (${toSentenceCase(title)}${
      ctx.zusEnabled && ctx.social > 0
        ? `; składki społeczne: ${SOCIAL_DEDUCTION_SHORT_LABELS[best.method]}`
        : ""
    }):\n`;
    text += getBusinessAfterCostsLine(best, ctx, "  ");
    if (hasIpBox) text += getIpBoxSplitLines(best, "  ");
    const regularLabel = hasIpBox
      ? "Dochód z działalności opodatkowany skalą"
      : "Dochód z działalności";
    if (ctx.otherIncome > 0 || best.regularIncome < 0) {
      if (hasIpBox || best.regularIncome < 0) {
        text += `  ${regularLabel}${
          best.regularIncome < 0
            ? " (strata — nie pomniejsza innych dochodów)"
            : ""
        }: ${formatNumberPL(Math.max(best.regularIncome, 0))}\n`;
      }
      if (ctx.otherIncome > 0) {
        text += `  Inne dochody opodatkowane skalą: ${formatNumberPL(ctx.otherIncome)}\n`;
      }
      text += `  Łączny dochód opodatkowany skalą: ${formatNumberPL(best.scaleIncome)}\n`;
    }
    if (best.socialDeducted > 0) {
      text += `  Odliczenie składek społecznych od dochodu (art. 26 ust. 1 pkt 2): ${formatNumberPL(
        best.socialDeducted,
      )}\n`;
      const lost = taxMath.round2(ctx.social - best.socialDeducted);
      if (lost > 0 && best.method === "income") {
        text += `  (nieodliczona nadwyżka ${formatNumberPL(lost)} przepada)\n`;
      }
    }
    text += `  Podstawa opodatkowania: ${formatNumberPL(best.pitBase)}\n`;

    let pitLabel;
    if (best.joint) {
      const attribution = getJointPitAttributionBreakdown(
        best.pitBase,
        best.spouseIncome,
        "Łączny dochód (podstawa podatnika + dochód małżonka)",
      );
      text += attribution.text;
      pitLabel = "PIT przypisany podatnikowi";
    } else {
      text += getScalePitBracketLines(getScalePitDetails(best.pitBase), "  ");
      pitLabel = "Podatek wg skali";
    }
    text += `  ${pitLabel}: ${formatNumberPL(best.pit)}\n`;
    const levyDetails = getSolidarityLevyDetails(best.pitBase);
    if (levyDetails.levy > 0) {
      text += getLevyLine(
        levyDetails,
        "  ",
        `podstawa: dochód opodatkowany skalą po odliczeniach${
          best.joint ? ", liczona odrębnie dla każdego z małżonków" : ""
        }${hasIpBox ? ", bez dochodu z IP BOX" : ""}`,
      );
    }
    const taxParts = [];
    if (hasIpBox) taxParts.push(best.ipBoxTax);
    taxParts.push(best.pit);
    if (best.levy > 0) taxParts.push(best.levy);
    text += `  Suma podatków: ${
      taxParts.length > 1
        ? `${taxParts.map((part) => formatNumberPL(part)).join(" + ")} = `
        : ""
    }${formatNumberPL(best.taxes)}\n`;
    if (best.joint && getSolidarityLevyDetails(best.spouseIncome).levy > 0) {
      text += `  (danina małżonka nie jest wliczana — zapłaciłby ją także przy rozliczeniu indywidualnym)\n`;
    }
    text += getTotalSummaryText(evaluation);
    return text;
  }

  /* ---------- Liniowy (z IP BOX lub bez) ---------- */
  function getLinearVariantText(title, evaluation) {
    const { ctx, best } = evaluation;
    const hasIpBox = best.ipBoxCoeff > 0;
    const extra = hasIpBox
      ? `Współczynnik IP BOX: ${formatPercentPL(best.ipBoxCoeff)}\n`
      : "";
    let text = getVariantHeaderText(title, evaluation, extra);
    text += getHealthPitFormText(
      evaluation,
      TAX_CONSTANTS.HEALTH_RATE_LINEAR,
      `liniowy: 4,9% dochodu${hasIpBox ? " z całej działalności, także z IP BOX" : ""}, art. 79a u.ś.o.z.`,
    );
    text += `  Limit odliczenia (art. 30c ust. 2 pkt 2 ustawy o PIT, roczny): ${formatNumberPL(
      TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT,
    )}\n`;
    text += `  Składka do odliczenia: ${formatNumberPL(best.healthDeduction)}\n`;

    text += `\nObliczenie podatku (${toSentenceCase(title)}${
      ctx.zusEnabled && ctx.social > 0
        ? `; składki społeczne: ${SOCIAL_DEDUCTION_SHORT_LABELS[best.method]}`
        : ""
    }):\n`;
    text += getBusinessAfterCostsLine(best, ctx, "  ");
    if (hasIpBox) text += getIpBoxSplitLines(best, "  ");
    text += `  Odliczenie składki zdrowotnej od dochodu (art. 30c ust. 2 pkt 2): ${formatNumberPL(
      best.healthDeducted,
    )}\n`;
    if (best.socialFromLinear > 0) {
      text += `  Odliczenie składek społecznych (art. 30c ust. 2 pkt 1): ${formatNumberPL(
        best.socialFromLinear,
      )}\n`;
    }
    const socialUsed = taxMath.round2(
      best.socialInCosts + best.socialFromLinear + best.socialFromScale,
    );
    const socialLost = taxMath.round2(ctx.social - socialUsed);
    if (ctx.social > 0 && socialLost > 0 && best.method !== "costs") {
      text += `  (nieodliczona nadwyżka składek ${formatNumberPL(
        socialLost,
      )} przepada — bez dzielenia między źródła)\n`;
    }
    text += `  Podstawa opodatkowania (PIT liniowy): ${formatNumberPL(
      Math.max(best.regularIncome, 0),
    )} − ${formatNumberPL(best.healthDeducted)}${
      best.socialFromLinear > 0 ? ` − ${formatNumberPL(best.socialFromLinear)}` : ""
    } = ${formatNumberPL(best.linearBase)}\n`;
    text += `  Podatek liniowy ${formatPercentPL(
      TAX_CONSTANTS.LINEAR_PIT_RATE,
    )}: ${formatNumberPL(best.linearBase)} × ${formatPercentPL(
      TAX_CONSTANTS.LINEAR_PIT_RATE,
    )} = ${formatNumberPL(best.linearPit)}\n`;

    if (ctx.otherIncome > 0) {
      text += `\n  Inne dochody (skala, rozliczane osobno):\n`;
      text += `    Dochód: ${formatNumberPL(ctx.otherIncome)}${
        best.socialFromScale > 0
          ? ` − składki społeczne (art. 26 ust. 1 pkt 2) ${formatNumberPL(
              best.socialFromScale,
            )} = ${formatNumberPL(best.scaleBase)}`
          : ""
      }\n`;
      text += getScalePitBracketLines(getScalePitDetails(best.scaleBase), "    ");
      text += `    PIT wg skali: ${formatNumberPL(best.scalePit)}\n`;
    }

    const levyDetails = getSolidarityLevyDetails(best.levyBase);
    if (levyDetails.levy > 0) {
      text += getLevyLine(
        levyDetails,
        "  ",
        `odrębna deklaracja DSF-1; podstawa: dochód liniowy${
          ctx.otherIncome > 0 ? " + dochód ze skali" : ""
        } po odliczeniach${hasIpBox ? ", bez dochodu z IP BOX" : ""} = ${formatNumberPL(
          best.levyBase,
        )}`,
      );
    }
    const taxParts = [];
    if (hasIpBox) taxParts.push(best.ipBoxTax);
    taxParts.push(best.linearPit);
    if (ctx.otherIncome > 0) taxParts.push(best.scalePit);
    if (best.levy > 0) taxParts.push(best.levy);
    text += `  Suma podatków: ${
      taxParts.length > 1
        ? `${taxParts.map((part) => formatNumberPL(part)).join(" + ")} = `
        : ""
    }${formatNumberPL(best.taxes)}\n`;
    text += getTotalSummaryText(evaluation);
    return text;
  }

  /* ---------- Ryczałt ---------- */
  function getRyczaltThresholdDescription(revenue) {
    const low = TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW;
    const high = TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH;
    const mult = taxMath.getRyczaltHealthMultiplier(revenue);
    let range;
    if (revenue <= low) range = `nie przekracza ${formatNumberPL(low)}`;
    else if (revenue <= high) {
      range = `przekracza ${formatNumberPL(low)}, nie przekracza ${formatNumberPL(high)}`;
    } else range = `przekracza ${formatNumberPL(high)}`;
    return { range, mult };
  }

  function getRyczaltHealthText(evaluation) {
    const { ctx, best } = evaluation;
    const avgSalary = TAX_CONSTANTS.AVG_SALARY_Q4_PREV;
    const { range, mult } = getRyczaltThresholdDescription(best.thresholdRevenue);
    let text = `\nSkładka zdrowotna (ryczałt, art. 81 ust. 2e–2g u.ś.o.z.):\n`;
    if (best.socialNotFromScale > 0) {
      text += `  Przychód do ustalenia progu (art. 81 ust. 2g): ${formatNumberPL(
        best.revenueTotal,
      )} − ${formatNumberPL(best.socialNotFromScale)} (składki społeczne nieodliczone od dochodu ze skali) = ${formatNumberPL(
        best.thresholdRevenue,
      )}\n`;
    } else {
      text += `  Przychód do ustalenia progu: ${formatNumberPL(best.thresholdRevenue)}${
        ctx.social > 0
          ? " (składki społeczne odliczone od dochodu ze skali nie obniżają przychodu – art. 81 ust. 2g)"
          : ""
      }\n`;
    }
    text += `  Próg: przychód ${range} → podstawa ${formatPercentPL(
      mult,
    )} przeciętnego wynagrodzenia (${formatNumberPL(avgSalary)})\n`;
    text += `  Miesięcznie: ${formatNumberPL(avgSalary)} × ${formatPercentPL(
      mult,
    )} × ${formatPercentPL(TAX_CONSTANTS.HEALTH_RATE_RYCZALT)} = ${formatNumberPL(
      best.healthMonthly,
    )}\n`;
    text += `  Rocznie: ${formatNumberPL(best.healthMonthly)} × ${ctx.healthMonths} mies. = ${formatNumberPL(
      best.health,
    )}\n`;
    text += `  Odliczenie od przychodu (50%, art. 11 ust. 1a ustawy o ryczałcie): ${formatNumberPL(
      best.healthDeduction,
    )}\n`;
    return text;
  }

  function getRyczaltRateLines(rateId, rate, indent) {
    const label = RYCZALT_RATE_LABELS[rateId];
    const base = Math.max(taxMath.round2(rate.rateRevenue - rate.deduction), 0);
    if (rateId !== "ryczalt8_5_12_5") {
      return `${indent}Podstawa: ${formatNumberPL(rate.rateRevenue)} − ${formatNumberPL(
        rate.deduction,
      )} = ${formatNumberPL(base)}\n${indent}Ryczałt: ${formatNumberPL(
        base,
      )} × ${label} = ${formatNumberPL(rate.tax)}\n`;
    }
    const details = getRyczalt85125Details(rate.rateRevenue, rate.deduction);
    let text = `${indent}Próg dla stawki 8,5% (art. 12 ust. 1 pkt 4): ${formatNumberPL(
      details.threshold,
    )}\n`;
    if (rate.rateRevenue <= details.threshold) {
      text += `${indent}Cały przychód mieści się w progu 8,5%: (${formatNumberPL(
        rate.rateRevenue,
      )} − ${formatNumberPL(rate.deduction)}) × 8,5% = ${formatNumberPL(details.tax)}\n`;
      return text;
    }
    text += `${indent}Odliczenie dzielone proporcjonalnie do przychodu w każdej stawce (art. 11 ust. 3):\n`;
    text += `${indent}  - na część 8,5%: ${formatNumberPL(rate.deduction)} × ${formatNumberPL(
      details.revenue85,
    )} / ${formatNumberPL(rate.rateRevenue)} = ${formatNumberPL(details.deduction85)}\n`;
    text += `${indent}  - na część 12,5%: ${formatNumberPL(rate.deduction)} − ${formatNumberPL(
      details.deduction85,
    )} = ${formatNumberPL(details.deduction125)}\n`;
    text += `${indent}Część do ${formatNumberPL(details.threshold)} (8,5%): (${formatNumberPL(
      details.revenue85,
    )} − ${formatNumberPL(details.deduction85)}) × 8,5% = ${formatNumberPL(details.tax85)}\n`;
    text += `${indent}Część powyżej progu (12,5%): (${formatNumberPL(
      details.revenue125,
    )} − ${formatNumberPL(details.deduction125)}) × 12,5% = ${formatNumberPL(
      details.tax125,
    )}\n`;
    text += `${indent}Suma ryczałtu: ${formatNumberPL(details.tax85)} + ${formatNumberPL(
      details.tax125,
    )} = ${formatNumberPL(details.tax)}\n`;
    return text;
  }

  function getRyczaltDeductionLines(evaluation, indent) {
    const { ctx, best } = evaluation;
    let text = "";
    if (best.socialFromRevenue > 0) {
      text += `${indent}Odliczenie składek społecznych od przychodu (art. 11 ust. 1): ${formatNumberPL(
        best.socialFromRevenue,
      )}\n`;
    }
    text += `${indent}Odliczenie 50% składki zdrowotnej (art. 11 ust. 1a): ${formatNumberPL(
      best.healthDeduction,
    )}\n`;
    if (best.socialFromRevenue > 0) {
      text += `${indent}Odliczenia od przychodu razem: ${formatNumberPL(
        best.socialFromRevenue,
      )} + ${formatNumberPL(best.healthDeduction)} = ${formatNumberPL(
        best.totalDeduction,
      )}\n`;
    }
    const lost = taxMath.round2(
      ctx.social - best.socialFromRevenue - best.socialFromScale,
    );
    if (ctx.social > 0 && lost > 0) {
      text += `${indent}(nieodliczona nadwyżka składek ${formatNumberPL(lost)} przepada)\n`;
    }
    return text;
  }

  function getRyczaltOtherIncomeLines(evaluation, indent) {
    const { ctx, best } = evaluation;
    if (ctx.otherIncome <= 0) return "";
    let text = `\n${indent}Inne dochody (skala, rozliczane osobno):\n`;
    text += `${indent}  Dochód: ${formatNumberPL(ctx.otherIncome)}${
      best.socialFromScale > 0
        ? ` − składki społeczne (art. 26 ust. 1 pkt 2${
            best.method === "ryczalt" ? " i ust. 13a — nadwyżka ponad przychód" : ""
          }) ${formatNumberPL(best.socialFromScale)} = ${formatNumberPL(best.scaleBase)}`
        : ""
    }\n`;
    text += getScalePitBracketLines(getScalePitDetails(best.scaleBase), `${indent}  `);
    text += `${indent}  PIT wg skali: ${formatNumberPL(best.scalePit)}\n`;
    if (best.levy > 0) {
      text += getLevyLine(
        getSolidarityLevyDetails(best.scaleBase),
        `${indent}  `,
        "podstawa: dochód ze skali po odliczeniach; ryczałt poza podstawą",
      );
    }
    return text;
  }

  function getRyczaltTaxSumLine(evaluation, indent) {
    const { ctx, best } = evaluation;
    const parts = [best.ryczaltTax];
    if (ctx.otherIncome > 0) parts.push(best.scalePit);
    if (best.levy > 0) parts.push(best.levy);
    return `${indent}Suma podatków: ${
      parts.length > 1
        ? `${parts.map((part) => formatNumberPL(part)).join(" + ")} = `
        : ""
    }${formatNumberPL(best.taxes)}\n`;
  }

  function getRyczaltSingleVariantText(rateId, evaluation) {
    const { ctx, best } = evaluation;
    const label = RYCZALT_RATE_LABELS[rateId];
    const rate = best.rates[rateId];
    let text = `\n--- RYCZAŁT ${label.toUpperCase()} ---\n\n`;
    text += `Przychód: ${formatNumberPL(best.revenueTotal)}\n`;
    if (ctx.otherIncome > 0) {
      text += `Inne dochody opodatkowane skalą: ${formatNumberPL(ctx.otherIncome)}\n`;
    }
    text += getVariantZusLine(evaluation);
    text += getHolidayComparisonText(evaluation);
    text += getDeductionComparisonText(evaluation);
    text += getRyczaltHealthText(evaluation);
    text += `\nObliczenie ryczałtu (stawka ${label}${
      ctx.zusEnabled && ctx.social > 0
        ? `; składki społeczne: ${SOCIAL_DEDUCTION_SHORT_LABELS[best.method]}`
        : ""
    }):\n`;
    text += `  Przychód: ${formatNumberPL(rate.rateRevenue)}\n`;
    text += getRyczaltDeductionLines(evaluation, "  ");
    text += getRyczaltRateLines(rateId, rate, "  ");
    text += getRyczaltOtherIncomeLines(evaluation, "  ");
    text += getRyczaltTaxSumLine(evaluation, "  ");
    text += getTotalSummaryText(evaluation);
    return text;
  }

  function getRyczaltMultiVariantText(evaluation, visibleRateIds) {
    const { ctx, best } = evaluation;
    let text = `\n--- RYCZAŁT (WIELE STAWEK) ---\n\n`;
    text += `Przychód z działalności: ${formatNumberPL(best.revenueTotal)}\n`;
    text += `Suma przychodów przypisanych stawkom: ${formatNumberPL(
      best.allocatedTotal,
    )}\n`;
    if (!isAllocationComplete(ctx.revenue, best.allocatedTotal)) {
      text += `UWAGA: podział przychodu nie zgadza się z przychodem (${formatNumberPL(
        ctx.revenue,
      )}). Ryczałt liczony tylko od kwot przypisanych stawkom; próg składki zdrowotnej i proporcje odliczeń liczone od całego przychodu (art. 81 ust. 2e–2f u.ś.o.z., art. 11 ust. 3 ustawy o ryczałcie). Suma nie jest porównywana w rankingu.\n`;
    }
    if (ctx.otherIncome > 0) {
      text += `Inne dochody opodatkowane skalą: ${formatNumberPL(ctx.otherIncome)}\n`;
    }
    text += getVariantZusLine(evaluation);
    text += getHolidayComparisonText(evaluation);
    text += getDeductionComparisonText(evaluation);
    text += getRyczaltHealthText(evaluation);
    text += `\nObliczenie ryczałtu${
      ctx.zusEnabled && ctx.social > 0
        ? ` (składki społeczne: ${SOCIAL_DEDUCTION_SHORT_LABELS[best.method]})`
        : ""
    }:\n`;
    text += getRyczaltDeductionLines(evaluation, "  ");
    text += `  Odliczenia dzielone między stawki proporcjonalnie do przychodu (art. 11 ust. 3 ustawy o ryczałcie).\n`;
    visibleRateIds.forEach((rateId) => {
      const rate = best.rates[rateId];
      if (!rate) return;
      text += `\n  Stawka ${RYCZALT_RATE_LABELS[rateId]}: przychód ${formatNumberPL(
        rate.rateRevenue,
      )}\n`;
      if (best.revenueTotal > 0) {
        text += `    Część odliczeń: ${formatNumberPL(best.totalDeduction)} × ${formatNumberPL(
          rate.rateRevenue,
        )} / ${formatNumberPL(best.revenueTotal)} = ${formatNumberPL(
          rate.deduction,
        )} (grosze rozdzielane metodą największych reszt)\n`;
      }
      text += getRyczaltRateLines(rateId, rate, "    ");
    });
    text += `\n  Suma ryczałtu: ${formatNumberPL(best.ryczaltTax)}\n`;
    text += getRyczaltOtherIncomeLines(evaluation, "  ");
    text += getRyczaltTaxSumLine(evaluation, "  ");
    text += getTotalSummaryText(evaluation);
    return text;
  }

  const RYCZALT_RATE_LABELS = {
    ryczalt2: "2%",
    ryczalt3: "3%",
    ryczalt5_5: "5,5%",
    ryczalt8_5: "8,5%",
    ryczalt8_5_12_5: "8,5% i 12,5%",
    ryczalt10: "10%",
    ryczalt12: "12%",
    ryczalt14: "14%",
    ryczalt15: "15%",
    ryczalt17: "17%",
  };

  function getVariantSummaryLine(label, evaluation) {
    if (!evaluation) return "";
    const { ctx } = evaluation;
    const notes = [];
    if (ctx.zusEnabled && ctx.social > 0) {
      notes.push(`składki: ${SOCIAL_DEDUCTION_SHORT_LABELS[evaluation.method]}`);
    }
    if (evaluation.holidayMonth) {
      notes.push(`wakacje: ${ROMAN_MONTHS[evaluation.holidayMonth - 1]}`);
    }
    return `  ${label}: ${formatPLN(evaluation.total)}${
      notes.length ? `  [${notes.join("; ")}]` : ""
    }\n`;
  }

  function getFormattedValues() {
    const result = computeFromForm();
    const { inputs, ctx, variants } = result;
    const ipBoxOn = inputs.ipBoxEnabled;
    const isJoint = inputs.jointTaxation;
    const isMultipleRates = inputs.isMultipleRates;
    const visibleRateIds = RYCZALT_VARIANT_IDS.filter((rateId) => {
      const checkbox = document.querySelector(
        `input[type="checkbox"][data-target="${rateId}"]`,
      );
      return checkbox && checkbox.checked;
    });

    let text = `=== DANE PODSTAWOWE ===\n`;
    text += `Przychód: ${formatNumberPL(inputs.revenue)}\n`;
    text += `Koszty (bez składek ZUS): ${formatNumberPL(inputs.costs)}\n`;
    text += `Dochód: ${formatNumberPL(ctx.income)}\n`;
    if (ctx.otherIncome > 0) {
      text += `Inne dochody opodatkowane skalą: ${formatNumberPL(ctx.otherIncome)}\n`;
    }
    if (isJoint) {
      text += `Dochód małżonka: ${formatNumberPL(inputs.spouseIncome)}\n`;
    }
    if (ipBoxOn) {
      text += `Współczynnik IP BOX: ${formatPercentPL(inputs.ipBoxCoeff)}\n`;
    }

    text += `\nZakres obliczeń: kwoty obejmują PIT (skala / liniowy / ryczałt,\n`;
    text += `z daniną solidarnościową), składkę zdrowotną podatnika${
      ctx.zusEnabled ? `\noraz składki społeczne ZUS (z FP/FS) za 2026 r.` : `.\nSkładki społeczne ZUS nie są uwzględniane (przełącznik wyłączony).`
    }\n`;
    text += `Dla każdego wariantu kalkulator porównuje legalne sposoby odliczenia\n`;
    text += `składek społecznych i wybiera najtańszy (porównanie w szczegółach).\n`;
    if (ctx.otherIncome > 0) {
      text += `Przy innych dochodach ze skali wynik to obciążenie przypisane\n`;
      text += `działalności: od łącznych podatków odejmujemy podatek od samych\n`;
      text += `innych dochodów (${formatNumberPL(ctx.baseline.total)}).\n`;
    }
    if (isJoint) {
      text += `Przy wspólnym rozliczeniu PIT jest wspólny dla pary\n`;
      text += `("2 × PIT((suma dochodów) / 2)"). Aby wynik był porównywalny\n`;
      text += `z wariantami indywidualnymi, kalkulator odejmuje od PIT-u pary\n`;
      text += `PIT, który małżonek zapłaciłby sam wg skali (wynik może być\n`;
      text += `ujemny). Danina, składka zdrowotna i ZUS małżonka nie są wliczane.\n`;
    }

    text += getZusSectionText(result);

    text += `\n${SEPARATOR_LINE}\n`;
    text += `=== PODSUMOWANIE WYNIKÓW ===\n`;
    text += `${SEPARATOR_LINE}\n\n`;

    text += `SKALA PODATKOWA:\n`;
    text += getVariantSummaryLine(
      isJoint ? "Indywidualnie" : "Skala podatkowa",
      variants.taxScale,
    );
    if (ipBoxOn) {
      text += getVariantSummaryLine(
        isJoint ? "Indywidualnie (IP BOX)" : "Skala podatkowa (IP BOX)",
        variants.taxScaleIpBox,
      );
    }
    if (isJoint) {
      text += getVariantSummaryLine("Wspólnie z małżonkiem", variants.taxScaleJoint);
      if (ipBoxOn) {
        text += getVariantSummaryLine(
          "Wspólnie z małżonkiem (IP BOX)",
          variants.taxScaleIpBoxJoint,
        );
      }
    }

    text += `\nPODATEK LINIOWY:\n`;
    text += getVariantSummaryLine("Podatek liniowy", variants.taxLinear);
    if (ipBoxOn) {
      text += getVariantSummaryLine("Podatek liniowy (IP BOX)", variants.taxLinearIpBox);
    }

    if (visibleRateIds.length) {
      text += `\nRYCZAŁT:\n`;
      if (isMultipleRates) {
        visibleRateIds.forEach((rateId) => {
          const rate = variants.ratesTotal.best.rates[rateId];
          text += `  ${RYCZALT_RATE_LABELS[rateId]}: ${formatPLN(
            rate ? rate.tax : 0,
          )} (sam ryczałt)\n`;
        });
        text += `  ---\n`;
        text += getVariantSummaryLine(
          `SUMA (ryczałt + składka zdrowotna${ctx.zusEnabled ? " + składki społeczne ZUS" : ""})`,
          variants.ratesTotal,
        );
      } else {
        visibleRateIds.forEach((rateId) => {
          text += getVariantSummaryLine(RYCZALT_RATE_LABELS[rateId], variants[rateId]);
        });
      }
    }

    text += `\n${SEPARATOR_LINE}\n`;
    text += `=== SZCZEGÓŁY OBLICZEŃ ===\n`;
    text += `${SEPARATOR_LINE}\n`;

    text += getOtherIncomeSectionText(ctx);
    text += getScaleVariantText("SKALA PODATKOWA", variants.taxScale);
    if (ipBoxOn) {
      text += getScaleVariantText("SKALA PODATKOWA Z IP BOX", variants.taxScaleIpBox);
    }
    if (isJoint) {
      text += getScaleVariantText(
        "SKALA PODATKOWA WSPÓLNIE Z MAŁŻONKIEM",
        variants.taxScaleJoint,
      );
      if (ipBoxOn) {
        text += getScaleVariantText(
          "SKALA PODATKOWA Z IP BOX WSPÓLNIE Z MAŁŻONKIEM",
          variants.taxScaleIpBoxJoint,
        );
      }
    }
    text += getLinearVariantText("PODATEK LINIOWY", variants.taxLinear);
    if (ipBoxOn) {
      text += getLinearVariantText("PODATEK LINIOWY Z IP BOX", variants.taxLinearIpBox);
    }

    if (visibleRateIds.length) {
      if (isMultipleRates) {
        text += getRyczaltMultiVariantText(variants.ratesTotal, visibleRateIds);
      } else {
        visibleRateIds.forEach((rateId) => {
          text += getRyczaltSingleVariantText(rateId, variants[rateId]);
        });
      }
    }

    text += `\n${SEPARATOR_LINE}\n`;
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
      "Poniżej znajdziesz zakres wyniku, zasady i uproszczenia oraz wszystkie stałe podatkowe i składkowe, które kalkulator bierze pod uwagę dla roku 2026.";
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
      createInfoTextSection("Zakres wyniku", [
        "Każdy wariant pokazuje roczne obciążenie za 2026 r.: PIT (ryczałt, IP BOX) z daniną solidarnościową + składka zdrowotna z działalności + składki społeczne ZUS z Funduszem Pracy i Funduszem Solidarnościowym (gdy przełącznik „Uwzględnij składki społeczne” jest włączony).",
        "Przy innych dochodach opodatkowanych skalą wynik to obciążenie przypisane działalności: łączne podatki podatnika (z innymi dochodami) minus PIT i danina, które zapłaciłby od samych innych dochodów, rozliczając je indywidualnie wg skali. Składka zdrowotna od etatu jest poza zakresem (pobiera ją pracodawca).",
        "Kwoty liczone z dokładnością do grosza — bez zaokrąglania podstaw i podatku do pełnych złotych (art. 63 Ordynacji podatkowej); różnice rzędu 1 zł. Pełne obliczenia z podstawami prawnymi: „Pokaż szczegółowe obliczenia” i „Eksport”.",
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Rozliczenie wspólne z małżonkiem", [
        "PIT przy rozliczeniu wspólnym jest wspólny dla pary: 2 × PIT od połowy sumy dochodów (art. 6 ust. 2 ustawy o PIT). Pozostałe warianty (skala indywidualnie, liniowy, ryczałt) obejmują tylko podatnika.",
        "Aby kwoty były porównywalne, wariant „wspólnie z małżonkiem” pokazuje: PIT wspólny pary − PIT, który małżonek zapłaciłby sam wg skali = różnica przypisana podatnikowi. Do tego doliczana jest Twoja danina solidarnościowa, Twoja składka zdrowotna i Twoje składki ZUS. Dochód podatnika do wspólnej sumy to jego dochód ze skali (działalność i inne dochody) po odliczeniu składek, nie mniej niż zero — strata z działalności nie pomniejsza dochodu małżonka (art. 9 ust. 2–3).",
        "Danina solidarnościowa małżonka, jego składka zdrowotna i ZUS nie są wliczane — małżonek płaci je niezależnie od formy rozliczenia. Wynik może być ujemny, gdy wspólne rozliczenie obniża podatek małżonka bardziej, niż wynosi Twój podatek. Rozliczenie wspólne jest możliwe tylko przy skali (także z IP BOX); małżonek nie może być na liniowym ani ryczałcie od działalności (art. 6 ust. 8).",
      ]),
    );

    const fullMonth = taxMath.getSocialContributionsForBase(
      TAX_CONSTANTS.ZUS_FULL_BASE,
      { sickness: true, funds: true },
    );
    const prefMonth = taxMath.getSocialContributionsForBase(
      TAX_CONSTANTS.ZUS_PREF_BASE,
      { sickness: true, funds: false },
    );
    DOM.infoModalContent.appendChild(
      createInfoSection("Składki społeczne ZUS 2026 – parametry", [
        {
          label: "Prognozowane przeciętne wynagrodzenie 2026",
          code: "ZUS_FORECAST_AVG_SALARY",
          value: formatPLN(TAX_CONSTANTS.ZUS_FORECAST_AVG_SALARY),
        },
        {
          label: "Podstawa pełnego ZUS (60% prognozowanego wynagrodzenia)",
          code: "ZUS_FULL_BASE",
          value: formatPLN(TAX_CONSTANTS.ZUS_FULL_BASE),
        },
        {
          label: "Podstawa małego ZUS (30% minimalnego wynagrodzenia)",
          code: "ZUS_PREF_BASE",
          value: formatPLN(TAX_CONSTANTS.ZUS_PREF_BASE),
        },
        {
          label: "Składka emerytalna",
          code: "ZUS_RATE_PENSION",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_PENSION),
        },
        {
          label: "Składki rentowe",
          code: "ZUS_RATE_DISABILITY",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_DISABILITY),
        },
        {
          label: "Składka chorobowa (dobrowolna)",
          code: "ZUS_RATE_SICKNESS",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_SICKNESS),
        },
        {
          label: "Składka wypadkowa (płatnik do 9 ubezpieczonych)",
          code: "ZUS_RATE_ACCIDENT",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_ACCIDENT),
        },
        {
          label: "Fundusz Pracy",
          code: "ZUS_RATE_FP",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_FP),
        },
        {
          label: "Fundusz Solidarnościowy",
          code: "ZUS_RATE_FS",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_FS),
        },
        {
          label: "Ulga na start (miesiące)",
          code: "ZUS_ULGA_MONTHS",
          value: String(TAX_CONSTANTS.ZUS_ULGA_MONTHS),
        },
        {
          label: "Mały ZUS (miesiące kalendarzowe)",
          code: "ZUS_PREF_MONTHS",
          value: String(TAX_CONSTANTS.ZUS_PREF_MONTHS),
        },
        {
          label: "Zwolnienie z FP/FS – wiek kobiety / mężczyźni",
          code: "ZUS_FP_EXEMPT_AGE_WOMEN / _MEN",
          value: `${TAX_CONSTANTS.ZUS_FP_EXEMPT_AGE_WOMEN} / ${TAX_CONSTANTS.ZUS_FP_EXEMPT_AGE_MEN} lat`,
        },
        {
          label: "Pełny ZUS z chorobową i FP/FS (miesięcznie)",
          code: "taxMath.getSocialContributionsForBase()",
          value: formatPLN(fullMonth.total),
        },
        {
          label: "  w tym FP + FS",
          value: formatPLN(fullMonth.fpfs),
        },
        {
          label: "Mały ZUS z chorobową (miesięcznie, bez FP/FS)",
          code: "taxMath.getSocialContributionsForBase()",
          value: formatPLN(prefMonth.total),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Składki społeczne ZUS – zasady i założenia", [
        "Harmonogram liczony miesiąc po miesiącu dla 2026 r. Puste pole daty rozpoczęcia oznacza działalność prowadzoną przed 2026 r. i przez cały rok: pełny ZUS od stycznia i 12 miesięcy składki zdrowotnej. Data sprzed 2026 r. służy do ustalenia, ile ulgi na start lub małego ZUS przypada na 2026 r.",
        "Ulga na start (art. 18 Prawa przedsiębiorców): 6 miesięcy bez składek społecznych. Start 1. dnia miesiąca — ten miesiąc jest pierwszym z sześciu; start w trakcie miesiąca — niepełny miesiąc jest wolny od składek i do tego 6 pełnych miesięcy (stanowisko ZUS). Potem mały ZUS przez 24 pełne miesiące kalendarzowe (art. 18aa ust. 3 u.s.u.s.), potem pełny ZUS. Warunków skorzystania z ulgi i małego ZUS (pierwsza działalność albo 60 miesięcy przerwy, nie na rzecz byłego pracodawcy) kalkulator nie sprawdza.",
        "Mały ZUS bez ulgi (art. 18a u.s.u.s.): od dnia rozpoczęcia — niepełny pierwszy miesiąc i 24 pełne miesiące kalendarzowe (przy starcie 1. dnia miesiąca: 24 miesiące od miesiąca startu). „Mały ZUS” oznacza preferencyjne składki od 30% minimalnego wynagrodzenia, nie Mały ZUS Plus (art. 18c), który nie jest modelowany.",
        "Niepełny pierwszy miesiąc (pełny lub mały ZUS bez ulgi): podstawa × dni podlegania / liczba dni miesiąca (art. 18 ust. 9 u.s.u.s.). Każda składka jest zaokrąglana osobno do grosza, FP i FS łącznie (2,45%), jak w deklaracji ZUS DRA. Przyjmujemy najniższe podstawy, stopę wypadkowej 1,67% i brak innych tytułów do ubezpieczeń.",
        "Fundusz Pracy i Fundusz Solidarnościowy są należne tylko przy podstawie co najmniej równej minimalnemu wynagrodzeniu, czyli na pełnym ZUS — także za niepełny pierwszy miesiąc, od podstawy proporcjonalnej (poradnik ZUS: za każdy miesiąc podlegania, choćby przez jeden dzień). Zwolnienie ze względu na wiek (kobiety 55, mężczyźni 60 lat; art. 261 ustawy o rynku pracy) obowiązuje od miesiąca po miesiącu urodzin, a przy urodzinach 1. dnia miesiąca — od tego miesiąca. Bez daty urodzenia i płci FP i FS są należne.",
        "Umowa o pracę z wynagrodzeniem co najmniej minimalnym (4 806 zł) przez cały rok: z działalności nie ma obowiązkowych ubezpieczeń społecznych (art. 9 ust. 1 i 1a u.s.u.s.); dobrowolnych składek nie doliczamy, składka zdrowotna z działalności jest należna. Zbieg z umową zlecenia i etat poniżej minimalnego wynagrodzenia nie są modelowane — w takim przypadku nie zaznaczaj tej opcji.",
        "Wakacje składkowe (art. 17a–17b u.s.u.s.): jeden miesiąc w roku bez składek społecznych i FP/FS (budżet opłaca je od najniższej podstawy); składka zdrowotna jest płatna. Kalkulator sprawdza termin: wniosek RWS składa się w miesiącu poprzedzającym zwolnienie, a w miesiącu przed wnioskiem trzeba podlegać ubezpieczeniom — więc zwolnienie najwcześniej za 2. miesiąc po pierwszym miesiącu podlegania (także niepełnym); nie w uldze na start i nie przy umowie o pracę. Pozostałe warunki (do 10 ubezpieczonych, przychód do 2 mln euro, wolny limit de minimis, nie dla byłego pracodawcy) zakładamy jako spełnione. Miesiąc jest wybierany osobno dla każdego wariantu — ten, przy którym obciążenie jest najniższe (łącznie z rezygnacją, gdy wakacje się nie opłacają). Niezapłaconych składek nie odlicza się.",
        "Założenie kasowe: składki społeczne i zdrowotne należne za 2026 r. traktujemy jako zapłacone i odliczone w 2026 r. (w praktyce składkę za grudzień płaconą w styczniu odlicza się w roku zapłaty, a roczne rozliczenie zdrowotnej przypada na 2027 r.).",
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Odliczanie składek społecznych – wybór sposobu", [
        "W każdym wariancie kalkulator liczy obciążenie przy każdym legalnym sposobie odliczenia składek na ubezpieczenia emerytalne, rentowe, chorobowe i wypadkowe i wybiera najniższe (przy równym wyniku — pierwszy z listy). Wszystkie sposoby z kwotami widać w szczegółach obliczeń.",
        "Skala (także wspólnie i z IP BOX): od dochodu (art. 26 ust. 1 pkt 2 ustawy o PIT — od łącznego dochodu ze skali, również z etatu) albo w kosztach działalności. Strata z działalności nie pomniejsza innych dochodów w tym samym roku (jej rozliczenia w kolejnych latach kalkulator nie liczy). Przy rozliczeniu wspólnym składki pomniejszają tylko dochód podatnika.",
        "Liniowy: w kosztach, od dochodu z działalności (art. 30c ust. 2 pkt 1) albo od innych dochodów ze skali (art. 26 ust. 1 pkt 2 i ust. 13a).",
        "Ryczałt: od przychodu (art. 11 ust. 1 ustawy o ryczałcie; nadwyżka ponad przychód od dochodu ze skali — art. 26 ust. 13a) albo od innych dochodów ze skali. Przychód do progów składki zdrowotnej (60 000 / 300 000 zł) pomniejszamy o składki nieodliczone od dochodu na podstawie ustawy o PIT, czyli odliczone od przychodu albo nieodliczone nigdzie (art. 81 ust. 2g u.ś.o.z., wykładnia literalna). Dlatego przy przychodzie blisko progu sposób odliczenia może zmienić składkę zdrowotną.",
        "IP BOX: składki mogą być kosztem — wtedy, jak inne koszty, proporcjonalnie pomniejszają także dochód kwalifikowany — albo mogą być odliczane od dochodu opodatkowanego skalą lub liniowo; od dochodu opodatkowanego stawką 5% nic się nie odlicza (art. 30ca). FP i FS jako koszt dzielimy proporcjonalnie wg współczynnika IP BOX; współczynnik stosujemy do dochodu po tych kosztach.",
        "FP i FS nie są składkami na ubezpieczenia społeczne: na skali i liniowym są kosztem, na ryczałcie nie odlicza się ich wcale. Składek nie dzielimy między sposoby odliczenia (wyjątek: nadwyżka ponad przychód ryczałtowy); nieodliczona nadwyżka przepada.",
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Składka zdrowotna – zasady", [
        "Składka zdrowotna jest należna od miesiąca rozpoczęcia działalności, także w uldze na start, w pełnej kwocie za niepełny miesiąc (art. 79 ust. 2 u.ś.o.z.: składka miesięczna i niepodzielna). Data rozpoczęcia wpływa na liczbę miesięcy również przy wyłączonych składkach społecznych.",
        "Skala i liniowy: podstawa to dochód z działalności pomniejszony o FP/FS (koszt) i składki społeczne (art. 81 ust. 2) — niezależnie od tego, gdzie składki są odliczane; minimum: liczba miesięcy × 432,54 zł (art. 81 ust. 2b, art. 79a). Kwotę 432,54 zł stosujemy także za styczeń 2026 (formalnie ostatni miesiąc roku składkowego 2025/26 z minimum 314,96 zł).",
        "Liniowy: zapłaconą składkę odliczamy od dochodu z działalności do 14 100 zł rocznie; limit jest roczny i nie podlega proporcji przy niepełnym roku (art. 30c ust. 2 pkt 2: „nie może przekroczyć w roku podatkowym”). Zaliczenie zdrowotnej do kosztów nie obniża w kalkulatorze jej własnej podstawy (brak potwierdzenia ZUS/MF — podejście ostrożne).",
        "Ryczałt: kwota miesięczna wg progu rocznego przychodu × liczba miesięcy; progi 60 000 / 300 000 zł są kwotowe, bez proporcji przy niepełnym roku (art. 81 ust. 2e). 50% zapłaconej składki odliczamy od przychodu, przy kilku stawkach proporcjonalnie (art. 11 ust. 1a i ust. 3 ustawy o ryczałcie). W trybie „Wiele stawek” próg i proporcje liczymy od całego przychodu z działalności.",
        "IP BOX: podstawa obejmuje cały dochód z działalności (także kwalifikowany); stawka 9% przy skali, 4,9% przy liniowym.",
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Inne dochody opodatkowane skalą", [
        "Wpisz roczny dochód z innych źródeł opodatkowanych skalą (np. etat, zlecenie): przychód − koszty uzyskania − składki społeczne pobrane przez płatnika, przed podatkiem (jak w PIT-11). Przy uldze dla młodych wpisz tylko część opodatkowaną.",
        "Na skali dochody te sumują się z dochodem z działalności; przy liniowym, ryczałcie i IP BOX z liniowym są opodatkowane skalą osobno. Wchodzą też do podstawy daniny solidarnościowej (art. 30h ust. 2).",
        "Od łącznych podatków odejmujemy PIT i daninę, które zapłaciłbyś od samych innych dochodów (indywidualnie wg skali) — różnica to obciążenie przypisane działalności, porównywalne między wariantami.",
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
  const brandSub = document.querySelector(".brand-sub");
  if (brandSub) brandSub.textContent = `Stan prawny na ${LEGAL_STATUS_DATE}`;
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
