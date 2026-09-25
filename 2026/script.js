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
    breakdownToc: document.getElementById("breakdownToc"),
    zusMoreToggle: document.getElementById("zusMoreToggle"),
    zusMore: document.getElementById("zusMore"),
    zusMoreSummary: document.getElementById("zusMoreSummary"),
    ryczaltPrompt: document.getElementById("ryczaltPrompt"),
    ryczaltPromptBtn: document.getElementById("ryczaltPromptBtn"),
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
    ratesTotal: "Ryczałt (wiele stawek) łącznie",
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
  function selectInputValue(e) {
    e.target.select();
  }

  /* ==================================================
     Validation Functions
     Jeden parser kwot (taxMath.parseAmount) dla wszystkich pól kwotowych.
     Nieprawidłowe dane nigdy nie są zamieniane na 0 – blokują wyniki.
  ================================================== */
  const MONEY_MAX = 999999999;

  const FIELD_LABELS = {
    revenue: "Przychód roczny",
    costs: "Koszty roczne",
    otherIncome: "Inne dochody opodatkowane skalą",
    spouseIncome: "Dochód małżonka",
    ipBoxCoeff: "Udział dochodu kwalifikowanego IP BOX",
    zusStartDate: "Data rozpoczęcia działalności",
    zusBirthDate: "Data urodzenia",
  };

  /* Kwota z pola: { ok, value, message }. Pusta = 0. Ujemne i zbyt duże
     kwoty są błędem (wszystkie pola kwotowe kalkulatora są nieujemne). */
  function checkAmount(raw) {
    const parsed = taxMath.parseAmount(raw);
    if (!parsed.ok) {
      return {
        ok: false,
        value: null,
        message: "Nieprawidłowy format kwoty — wpisz np. 12 345,67.",
      };
    }
    if (parsed.value < 0) {
      return {
        ok: false,
        value: parsed.value,
        message: "Kwota nie może być ujemna — wpisz ją bez znaku minus.",
      };
    }
    if (parsed.value > MONEY_MAX) {
      return { ok: false, value: parsed.value, message: "Kwota jest zbyt duża." };
    }
    return { ok: true, value: parsed.value, empty: parsed.empty, message: "" };
  }

  /* Wartość liczbowa pola kwotowego (0 dla pustego lub błędnego – błędne
     i tak blokują obliczenia w calculate()). */
  function amountOf(raw) {
    const checked = checkAmount(raw);
    return checked.ok ? checked.value : 0;
  }

  function setFieldError(input, errorElement, message) {
    if (input) {
      input.classList.toggle("error", !!message);
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
    if (errorElement) {
      if (errorElement.textContent !== message) {
        errorElement.textContent = message;
      }
      errorElement.classList.toggle("visible", !!message);
    }
  }

  function clearFieldError(fieldName) {
    setFieldError(
      document.getElementById(fieldName),
      document.getElementById(`${fieldName}-error`),
      "",
    );
  }

  function validateInput(value, fieldName) {
    const checked = checkAmount(value);
    setFieldError(
      document.getElementById(fieldName),
      document.getElementById(`${fieldName}-error`),
      checked.message,
    );
    return checked.ok;
  }

  /* Pole przychodu dla stawki (tryb „Wiele stawek”) – błąd zaznaczamy
     na samym polu, a nie na polu wyniku o tym samym identyfikatorze. */
  function validateRateInput(input) {
    const checked = checkAmount(input.value);
    input.classList.toggle("error", !checked.ok);
    if (checked.ok) {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("title");
    } else {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("title", checked.message);
    }
    return checked.ok;
  }

  function validateIpBoxCoeff(value) {
    const errorElement = document.getElementById("ipBoxCoeff-error");
    const input = DOM.ipBoxCoeffInput;
    const raw = String(value === undefined ? input.value : value).trim();
    const badInput = !!(input.validity && input.validity.badInput);
    const numValue = Number(raw.replace(",", "."));
    let message = "";
    if (badInput || raw === "" || !Number.isFinite(numValue)) {
      message = "Wpisz liczbę 0–100.";
    } else if (numValue < 0 || numValue > 100) {
      message = "Wartość musi być w zakresie 0–100.";
    }
    setFieldError(input, errorElement, message);
    return !message;
  }

  function getIpBoxCoeffValue() {
    const numValue = Number(
      String(DOM.ipBoxCoeffInput.value).trim().replace(",", "."),
    );
    return Number.isFinite(numValue) ? numValue / 100 : 0;
  }

  /* Pola dat (RRRR-MM-DD z <input type="date">). Puste pole jest poprawne
     (oba pola są opcjonalne). Data musi mieścić się w latach 1900–2026.
     Niepełna data (np. bez roku) ma pustą wartość i validity.badInput –
     to błąd, a nie „brak daty”. */
  const DATE_MIN = "1900-01-01";
  const DATE_MAX = `${TAX_CONSTANTS.ZUS_YEAR}-12-31`;

  function getDateFieldMessage(input, maxErrorText) {
    if (!input) return "";
    if (input.validity && input.validity.badInput) {
      return "Uzupełnij pełną datę (dd.mm.rrrr).";
    }
    const raw = (input.value || "").trim();
    if (raw === "") return "";
    const parsed = taxMath.parseISODate(raw);
    if (!parsed || raw < DATE_MIN) return "Wprowadź prawidłową datę.";
    if (raw > DATE_MAX) return maxErrorText;
    return "";
  }

  function validateStartDate() {
    const message = getDateFieldMessage(
      DOM.zusStartDate,
      "Data rozpoczęcia nie może być późniejsza niż 31.12.2026.",
    );
    setFieldError(
      DOM.zusStartDate,
      document.getElementById("zusStartDate-error"),
      message,
    );
    return !message;
  }

  function validateBirthDate() {
    let message = getDateFieldMessage(
      DOM.zusBirthDate,
      "Data urodzenia nie może być późniejsza niż 31.12.2026.",
    );
    const birth = (DOM.zusBirthDate.value || "").trim();
    const start = getValidDateValue(DOM.zusStartDate);
    if (!message && birth && start && birth >= start) {
      message =
        "Data urodzenia musi być wcześniejsza niż data rozpoczęcia działalności.";
    }
    setFieldError(
      DOM.zusBirthDate,
      document.getElementById("zusBirthDate-error"),
      message,
    );
    return !message;
  }

  /* Wartość pola daty, jeśli jest poprawna; w przeciwnym razie null. */
  function getValidDateValue(input) {
    if (!input) return null;
    if (input.validity && input.validity.badInput) return null;
    const raw = (input.value || "").trim();
    if (!raw || raw < DATE_MIN || raw > DATE_MAX) return null;
    return taxMath.parseISODate(raw) ? raw : null;
  }

  /* Walidacja wszystkich pól wpływających na wynik. Wywoływana przy każdym
     przeliczeniu (niezależnie od tego, która kontrolka je wywołała). */
  /* Pole jest „aktywne”, gdy użytkownik je widzi i może je edytować:
     nie leży w zwiniętej (inert/hidden) sekcji. Nieaktywne pole nigdy nie
     blokuje wyników (np. data urodzenia przy wyłączonych składkach). */
  function isFieldActive(element) {
    if (!element) return false;
    // tło otwartego okna modalnego (data-modal-inert) nie liczy się jako
    // zwinięta sekcja – pola pod oknem nadal podlegają walidacji
    if (element.closest("[inert]:not([data-modal-inert]), [hidden]")) {
      return false;
    }
    if (element.disabled) return false;
    return true;
  }

  /* Czy wpis w polu, które ma fokus, jest jeszcze niedokończony (np.
     „150 0”, „1234,” w trakcie pisania albo data z rokiem „0202”)? Taki
     wpis nie przełącza wyników w stan błędu – zostają ostatnie poprawne
     wyniki, a pełna walidacja rusza przy opuszczeniu pola / zmianie. */
  function isPendingInput(element) {
    if (!element) return false;
    if (element === DOM.zusStartDate) {
      return !!getDateFieldMessage(element, "x");
    }
    if (element === DOM.zusBirthDate) {
      if (getDateFieldMessage(element, "x")) return true;
      const start = getValidDateValue(DOM.zusStartDate);
      return !!(start && element.value && element.value >= start);
    }
    if (element === DOM.ipBoxCoeffInput) {
      const raw = String(element.value).trim();
      return (
        !!(element.validity && element.validity.badInput) ||
        raw === "" ||
        !Number.isFinite(Number(raw.replace(",", ".")))
      );
    }
    // pola kwotowe: tylko błąd formatu (ujemna / zbyt duża kwota to błąd od razu)
    return !taxMath.parseAmount(element.value).ok;
  }

  /* Walidacja wszystkich pól wpływających na wynik. Wywoływana przy każdym
     przeliczeniu (niezależnie od tego, która kontrolka je wywołała).
     deferField – pole z fokusem, w którym właśnie pisze użytkownik: gdy
     jego wpis jest niedokończony, pole jest pomijane (bez komunikatu),
     a wynik ma deferred = true. */
  function validateAllInputs(deferField = null) {
    const invalid = [];
    const deferred =
      deferField && isFieldActive(deferField) && isPendingInput(deferField)
        ? deferField
        : null;
    const note = (fieldName, ok, label) => {
      if (!ok) {
        invalid.push({
          id: fieldName,
          element: document.getElementById(fieldName),
          label: label || FIELD_LABELS[fieldName] || fieldName,
          message:
            (document.getElementById(`${fieldName}-error`) || {}).textContent ||
            "",
        });
      }
    };
    const check = (fieldName, active, validate) => {
      const element = document.getElementById(fieldName);
      if (element && element === deferred) return;
      if (active && isFieldActive(element)) note(fieldName, validate());
      else clearFieldError(fieldName);
    };
    ["revenue", "costs", "otherIncome"].forEach((fieldName) => {
      check(fieldName, true, () =>
        validateInput(document.getElementById(fieldName).value, fieldName),
      );
    });
    check("spouseIncome", isJointTaxationEnabled(), () =>
      validateInput(DOM.spouseIncomeInput.value, "spouseIncome"),
    );
    check("ipBoxCoeff", isIpBoxEnabled(), () => validateIpBoxCoeff());
    const rateErrors = [];
    DOM.rateInputs.forEach((input) => {
      if (input === deferred) return;
      if (
        DOM.multipleRatesToggle.checked &&
        input.classList.contains("show") &&
        isFieldActive(input)
      ) {
        if (!validateRateInput(input)) {
          rateErrors.push(input);
          invalid.push({
            id: null,
            element: input,
            label: `Przychód dla stawki ${
              RYCZALT_RATE_LABELS[input.dataset.for] || ""
            }`,
            message: input.getAttribute("title") || "",
          });
        }
      } else {
        input.classList.remove("error");
        input.removeAttribute("aria-invalid");
        input.removeAttribute("title");
      }
    });
    const ratesError = document.getElementById("rateInputs-error");
    if (ratesError && !(deferred && deferred.classList.contains("rate-input"))) {
      const message = rateErrors.length
        ? "Popraw kwotę przychodu przy zaznaczonej stawce (np. 12 345,67)."
        : "";
      if (ratesError.textContent !== message) ratesError.textContent = message;
      ratesError.classList.toggle("visible", !!message);
    }
    check("zusStartDate", true, validateStartDate);
    // data urodzenia służy tylko do zwolnienia z FP/FS – przy wyłączonych
    // składkach społecznych (sekcja zwinięta) nie może blokować wyników
    check("zusBirthDate", DOM.zusEnabled.checked, validateBirthDate);
    return { valid: invalid.length === 0, invalid, deferred: !!deferred };
  }

  /* ==================================================
     Tax Calculation Functions
  ================================================== */
  /* Skala podatkowa wg wzoru z art. 27 ust. 1 ustawy o PIT:
       podstawa ≤ 120 000 zł: 12% × podstawa − 3 600 zł (kwota zmniejszająca
       podatek; wynik nie mniejszy niż 0),
       podstawa > 120 000 zł: 10 800 zł + 32% × nadwyżka ponad 120 000 zł.
     (Liczbowo to samo co 12% od nadwyżki ponad 30 000 zł.) */
  function getScalePitDetails(income) {
    const C = TAX_CONSTANTS;
    const taxableIncome = Math.max(taxMath.round2(income), 0);
    const threshold12 = C.TAX_THRESHOLD_12;
    const decreasingAmount = C.TAX_DECREASING_AMOUNT;
    // 12% × 120 000 − 3 600 = 10 800 zł
    const taxAtThreshold = taxMath.round2(
      threshold12 * C.PIT_RATE_12 - decreasingAmount,
    );
    let tax12Gross = 0;
    let excess = 0;
    let tax32 = 0;
    let totalPit;
    if (taxableIncome <= threshold12) {
      tax12Gross = taxMath.round2(taxableIncome * C.PIT_RATE_12);
      totalPit = Math.max(taxMath.round2(tax12Gross - decreasingAmount), 0);
    } else {
      excess = taxMath.round2(taxableIncome - threshold12);
      tax32 = taxMath.round2(excess * C.PIT_RATE_32);
      totalPit = taxMath.round2(taxAtThreshold + tax32);
    }

    return {
      taxableIncome,
      upToThreshold: taxableIncome <= threshold12,
      threshold12,
      decreasingAmount,
      taxAtThreshold,
      tax12Gross,
      excess,
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
    const amountCents = Math.round(taxMath.round2(amount) * 100);
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
        "od przychodu po odliczeniu 50% zdrowotnej (art. 11 ust. 1 i 1a ustawy o ryczałcie), nadwyżka od innych dochodów ze skali (art. 26 ust. 13a)",
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

  /* Krótki opis tego, jak składki społeczne faktycznie odliczono w danym
     wariancie (dla ryczałtu – wg kwot, nie tylko nazwy metody). */
  function getSocialMethodLabel(evaluation) {
    const { best, method } = evaluation;
    if (best && best.form === "ryczalt" && method !== "none") {
      const fromRevenue = best.socialFromRevenue > 0;
      const fromScale = best.socialFromScale > 0;
      if (fromRevenue && fromScale) {
        return "od przychodu i (nadwyżka) od dochodu ze skali";
      }
      if (fromRevenue) return "od przychodu";
      if (fromScale && method === "ryczalt") {
        return "od dochodu ze skali (przychód w całości pokryty odliczeniem 50% zdrowotnej)";
      }
      if (fromScale) return "od dochodu ze skali";
      return "nieodliczone (brak przychodu po odliczeniu 50% zdrowotnej i brak dochodu ze skali)";
    }
    return SOCIAL_DEDUCTION_SHORT_LABELS[method];
  }

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
    const income = taxMath.round2(inputs.revenue - inputs.costs);
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
    /* Podział składek społecznych dla danej (zakładanej) składki zdrowotnej.
       Metoda "ryczalt": najpierw 50% zdrowotnej (art. 11 ust. 1a – tego
       odliczenia nie można przenieść na skalę), potem składki społeczne do
       wysokości pozostałego przychodu; reszta od dochodu ze skali
       (art. 26 ust. 13a). Odliczenie składek w całości od przychodu
       marnowałoby odliczenie zdrowotnej, gdy przychód jest mały. */
    const splitSocial = (healthDeductionGuess) => {
      if (method === "scale") {
        return {
          socialFromRevenue: 0,
          socialFromScale: Math.min(ctx.social, ctx.otherIncome),
        };
      }
      const revenueRoom = Math.max(
        taxMath.round2(revenueTotal - healthDeductionGuess),
        0,
      );
      const fromRevenue = Math.min(ctx.social, revenueRoom);
      return {
        socialFromRevenue: fromRevenue,
        socialFromScale: Math.min(
          taxMath.round2(ctx.social - fromRevenue),
          ctx.otherIncome,
        ),
      };
    };
    /* Próg zdrowotnej zależy od podziału składek (art. 81 ust. 2g), a podział
       od kwoty zdrowotnej – szukamy punktu stałego, zaczynając od najniższego
       progu (odwzorowanie jest monotoniczne: wyższa zdrowotna → mniej
       składek od przychodu → wyższy przychód do progu). */
    const evaluateTier = (healthMonthlyGuess) => {
      const guessHealth = taxMath.round2(healthMonthlyGuess * ctx.healthMonths);
      const guessDeduction = taxMath.round2(
        guessHealth * TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR,
      );
      const split = splitSocial(guessDeduction);
      const notFromScale = taxMath.round2(ctx.social - split.socialFromScale);
      const threshold = taxMath.round2(revenueTotal - notFromScale);
      return {
        ...split,
        socialNotFromScale: notFromScale,
        thresholdRevenue: threshold,
        healthMonthly: taxMath.getRyczaltHealthMonthlyForRevenue(threshold),
      };
    };
    let tier = evaluateTier(taxMath.getRyczaltHealthMonthlyForRevenue(0));
    for (let step = 0; step < 3; step++) {
      const next = evaluateTier(tier.healthMonthly);
      const stable = next.healthMonthly === tier.healthMonthly;
      tier = next;
      if (stable) break;
    }
    const {
      socialFromRevenue,
      socialFromScale,
      socialNotFromScale,
      thresholdRevenue,
      healthMonthly,
    } = tier;
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
    // przy rozliczeniu wspólnym wiersze indywidualne dostają etykietę tekstową
    document.querySelectorAll("[data-joint-only]").forEach((badge) => {
      badge.hidden = !jointOn;
    });
  }

  /* Przychody przypisane stawkom w trybie „Wiele stawek" (tylko widoczne
     pola) oraz ich suma — jedno źródło dla wyniku, sumy i szczegółów. */
  function getAllocatedRevenues() {
    const revenues = {};
    let total = 0;
    document.querySelectorAll(".rate-input.show").forEach((input) => {
      const value = amountOf(input.value);
      revenues[input.dataset.for] = value;
      total += value;
    });
    return { revenues, total };
  }

  function isAllocationComplete(totalRevenue, usedRevenue) {
    return Math.abs(taxMath.round2(usedRevenue - totalRevenue)) < 0.005;
  }

  /* Stan podziału przychodu w trybie „Wiele stawek” (jedno źródło dla
     komunikatu pod stawkami, karty najlepszego wariantu i eksportu). */
  function getAllocationStatus(totalRevenue) {
    const usedRevenue = getAllocatedRevenues().total;
    const difference = taxMath.round2(usedRevenue - totalRevenue);
    let state = "complete";
    if (usedRevenue <= 0) state = "empty";
    else if (difference > 0.004) state = "over";
    else if (difference < -0.004) state = "under";
    return {
      state,
      used: taxMath.round2(usedRevenue),
      total: totalRevenue,
      unallocated: taxMath.round2(Math.max(-difference, 0)),
      over: taxMath.round2(Math.max(difference, 0)),
    };
  }

  /* RC2: przy niepełnym podziale próg zdrowotnej i proporcje odliczeń
     liczone są od CAŁEGO przychodu, a ryczałt tylko od kwot przypisanych –
     wynik jest niepełny i nie trafia do rankingu. */
  function getAllocationWarningText(status) {
    if (status.state === "over") {
      return `Przypisano o ${formatPLN(
        status.over,
      )} więcej niż przychód roczny — popraw podział. Suma ryczałtu jest pominięta w rankingu.`;
    }
    if (status.state === "under") {
      return `Nieprzypisane ${formatPLN(
        status.unallocated,
      )} przychodu: ryczałt liczony tylko od kwot przypisanych stawkom, a próg składki zdrowotnej i proporcje odliczeń — od całego przychodu (${formatPLN(
        status.total,
      )}). Wynik jest niepełny i pominięty w rankingu.`;
    }
    return "";
  }

  function updateRemainingRevenue() {
    if (!DOM.revenueInfoText) return;
    // niedokończony wpis przychodu (fokus) – zostaw poprzedni komunikat
    if (
      document.activeElement === DOM.revenueInput &&
      isPendingInput(DOM.revenueInput)
    ) {
      return;
    }
    const status = getAllocationStatus(amountOf(DOM.revenueInput.value));
    const container = DOM.revenueInfoText.parentElement;
    const warning = status.state === "over" || status.state === "under";
    if (container) container.classList.toggle("is-warning", warning);
    const text = warning
      ? getAllocationWarningText(status)
      : `Przychód do rozdysponowania: ${formatPLN(
          taxMath.round2(status.total - status.used),
        )}`;
    if (DOM.revenueInfoText.textContent !== text) {
      DOM.revenueInfoText.textContent = text;
    }
  }

  /* ==================================================
     Main Calculation Function
  ================================================== */
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
    return {
      revenue: amountOf(DOM.revenueInput.value),
      costs: amountOf(DOM.costsInput.value),
      otherIncome: amountOf(DOM.otherIncomeInput.value),
      ipBoxEnabled,
      ipBoxCoeff: ipBoxEnabled ? getIpBoxCoeffValue() : 0,
      jointTaxation,
      spouseIncome: jointTaxation ? amountOf(DOM.spouseIncomeInput.value) : 0,
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

  function setText(element, text) {
    if (element && element.textContent !== text) element.textContent = text;
  }

  /* field – kontrolka, która wywołała przeliczenie w trakcie pisania
     (zdarzenie input/change pola z fokusem); jej niedokończony wpis nie
     powoduje błędu – zostają ostatnie poprawne wyniki. */
  function calculate(field = null) {
    const typingField =
      field && field.nodeType === 1 && document.activeElement === field
        ? field
        : null;
    const validation = validateAllInputs(typingField);
    updateZusPathAvailability();
    updateZusMoreSummary();
    if (!validation.valid) {
      renderInvalidState(validation);
      return;
    }
    if (validation.deferred) return;
    if (DOM.resultsSection) delete DOM.resultsSection.dataset.state;

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
    renderRowDetails(result);
    renderRowExtras(result);
    rankAndSummarize(result);
    updateRyczaltPrompt(true);
    refreshBreakdownIfOpen();
  }

  /* Błędne dane: żadnych wyników ani rankingu – jasny komunikat w panelu
     wyników z listą pól do poprawienia. */
  function renderInvalidState(validation) {
    if (DOM.resultsSection) DOM.resultsSection.dataset.state = "invalid";
    document.getElementById("income").value = "—";
    COMPARISON_VARIANT_IDS.forEach((id) =>
      clearVariantOutput(document.getElementById(id)),
    );
    const ratesTotalValue = document.getElementById("ratesTotalValue");
    if (ratesTotalValue) {
      ratesTotalValue.textContent = "";
      VARIANT_DATA_KEYS.forEach((key) => delete ratesTotalValue.dataset[key]);
    }
    document.getElementById("ratesTotal").classList.add("hidden");
    if (DOM.zusSummary) DOM.zusSummary.classList.add("hidden");
    document
      .querySelectorAll(".results-row, #ratesTotal")
      .forEach((row) => row.classList.remove("is-best"));
    document
      .querySelectorAll(".results-row [data-bar]")
      .forEach((bar) => (bar.style.width = "0%"));
    document
      .querySelectorAll(".results-row [data-detail]")
      .forEach((detail) => (detail.textContent = ""));

    if (validation.invalid.some((item) => item.id === "zusStartDate")) {
      setText(DOM.zusStartHint, "");
    }
    if (validation.invalid.some((item) => item.id === "zusBirthDate")) {
      setText(DOM.zusBirthHint, "");
    }
    DOM.bestCard.dataset.state = "invalid";
    DOM.bestCardTitle.textContent = "Popraw dane";
    DOM.bestCardAmount.textContent = "—";
    DOM.bestCardSavings.textContent =
      "Popraw zaznaczone pola, aby zobaczyć wyniki.";
    const list = document.createElement("ul");
    list.className = "best-card-errors";
    validation.invalid.forEach((item) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "best-card-error-link";
      button.textContent = item.message
        ? `${item.label}: ${item.message}`
        : item.label;
      const target =
        item.element || (item.id && document.getElementById(item.id));
      button.addEventListener("click", () => {
        if (!target || !target.focus) return;
        if (target.scrollIntoView) {
          target.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        target.focus({ preventScroll: true });
      });
      li.appendChild(button);
      list.appendChild(li);
    });
    DOM.bestCardSavings.appendChild(list);
    clearRowExtras();
    updateRyczaltPrompt(false);
    if (DOM.breakdownDetails && DOM.breakdownDetails.open && DOM.breakdownPre) {
      renderBreakdown(INVALID_EXPORT_TEXT);
    }
    announceResult("Wyniki ukryte: popraw zaznaczone pola.");
    updateMobileJump(null);
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
      return "Umowa o pracę ≥ minimalnego: bez obowiązkowych składek społecznych z JDG przez cały rok — ulga na start i mały ZUS nie są stosowane (zdrowotna nadal należna).";
    }
    if (!schedule.startDate) {
      const selected = getCheckedValue(DOM.zusPathRadios, "full");
      return selected === "full"
        ? "Ulga na start i mały ZUS wymagają daty rozpoczęcia działalności. Bez daty przyjmujemy działalność sprzed 2026 r. — pełny ZUS przez cały rok."
        : "Wybrana ścieżka nie jest stosowana: ulga na start i mały ZUS wymagają daty rozpoczęcia działalności. Bez daty liczymy pełny ZUS przez cały 2026 r. — wpisz datę powyżej.";
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

  /* Ulga na start i mały ZUS mają sens tylko z datą rozpoczęcia – bez niej
     opcje są wyłączone i wyszarzone z notką „wymaga daty rozpoczęcia”
     (aria-disabled + aria-describedby); zaznaczona wcześniej opcja zostaje,
     ale nie jest stosowana – wyjaśnia to podpowiedź pod polem. */
  function updateZusPathAvailability() {
    const hasStart = !!getValidDateValue(DOM.zusStartDate);
    DOM.zusPathRadios.forEach((radio) => {
      if (radio.value === "full") return;
      radio.disabled = !hasStart;
      const noteId = `zusPathNote-${radio.value}`;
      const note = document.getElementById(noteId);
      if (note) note.hidden = hasStart;
      if (hasStart) {
        radio.removeAttribute("aria-disabled");
        radio.setAttribute("aria-describedby", "zusPathHint");
      } else {
        radio.setAttribute("aria-disabled", "true");
        radio.setAttribute("aria-describedby", `${noteId} zusPathHint`);
      }
      const option = radio.closest(".seg-opt");
      if (option) option.classList.toggle("is-disabled", !hasStart);
    });
    if (DOM.zusPathHint) {
      const selected = getCheckedValue(DOM.zusPathRadios, "full");
      DOM.zusPathHint.dataset.state =
        !hasStart && selected !== "full" ? "warn" : "";
    }
  }

  /* „Więcej opcji ZUS” (chorobowa, etat, wakacje, data urodzenia):
     zwinięte domyślnie na wąskich ekranach, rozwinięte na szerokich.
     Zwinięta sekcja ma [hidden], więc jej pola nie blokują wyników
     (isFieldActive); wybrane opcje nadal działają, a ich skrót widać
     w nagłówku sekcji. */
  function isZusMoreExpanded() {
    return (
      !DOM.zusMoreToggle ||
      DOM.zusMoreToggle.getAttribute("aria-expanded") === "true"
    );
  }

  function setZusMoreExpanded(expanded) {
    if (!DOM.zusMoreToggle || !DOM.zusMore) return;
    DOM.zusMoreToggle.setAttribute("aria-expanded", String(expanded));
    DOM.zusMore.hidden = !expanded;
    updateZusMoreSummary();
  }

  function updateZusMoreSummary() {
    if (!DOM.zusMoreSummary) return;
    const items = [];
    if (DOM.zusSickness && !DOM.zusSickness.checked) items.push("bez chorobowej");
    if (DOM.zusEmployment && DOM.zusEmployment.checked) {
      items.push("umowa o pracę");
    }
    if (DOM.zusHoliday && DOM.zusHoliday.checked) items.push("wakacje składkowe");
    const birth = getValidDateValue(DOM.zusBirthDate);
    const sex = getCheckedValue(DOM.zusSexRadios, "");
    const birthTyped = !!(
      (DOM.zusBirthDate.value || "").trim() ||
      (DOM.zusBirthDate.validity && DOM.zusBirthDate.validity.badInput)
    );
    const start = getValidDateValue(DOM.zusStartDate);
    if (birth) {
      items.push(
        `ur. ${formatDatePL(taxMath.parseISODate(birth))}${sex ? `, ${sex}` : ""}${
          start && birth >= start ? " (do sprawdzenia)" : ""
        }`,
      );
    } else if (birthTyped) {
      items.push("data urodzenia pominięta (błędna)");
    }
    setText(
      DOM.zusMoreSummary,
      items.length
        ? items.join(" · ")
        : "z chorobową, bez etatu i wakacji",
    );
    DOM.zusMoreSummary.dataset.custom = items.length ? "true" : "";
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
    if (!schedule.startDate) {
      return "Puste = działalność przez cały 2026 r. (12 mies. składki zdrowotnej, pełny ZUS).";
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

  const MONTH_NAMES = [
    "styczeń",
    "luty",
    "marzec",
    "kwiecień",
    "maj",
    "czerwiec",
    "lipiec",
    "sierpień",
    "wrzesień",
    "październik",
    "listopad",
    "grudzień",
  ];

  /* Kwota do chipu miesiąca: pełne złote (dokładne kwoty – w etykiecie
     dostępnej, w tabeli w szczegółach i w eksporcie). */
  function formatChipAmount(value) {
    return new Intl.NumberFormat("pl-PL", {
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  }

  function renderZusStatus(result) {
    const { schedule, ctx, inputs } = result;

    setText(DOM.zusStartHint, getZusStartHintText(schedule));
    setText(DOM.zusPathHint, getZusPathHintText(schedule));
    if (DOM.zusHolidayStatus) {
      setText(DOM.zusHolidayStatus, getZusHolidayStatusText(schedule));
      DOM.zusHolidayStatus.dataset.state = schedule.holiday.applied
        ? "applied"
        : schedule.holiday.reason || "";
    }
    setText(DOM.zusBirthHint, getZusBirthHintText(schedule, inputs.zus));
    setText(
      DOM.comparePitMeta,
      schedule.enabled ? "PIT + zdrowotna + ZUS, zł" : "PIT + zdrowotna, zł",
    );

    if (!DOM.zusSummary) return;
    DOM.zusSummary.classList.toggle("hidden", !schedule.enabled);
    DOM.zusSocialTotal.textContent = formatPLN(schedule.totals.total);
    DOM.zusSocialTotal.dataset.total = String(schedule.totals.total);
    DOM.zusSocialTotal.dataset.social = String(schedule.totals.social);
    DOM.zusSocialTotal.dataset.fpfs = String(schedule.totals.fpfs);
    DOM.zusFpTotal.textContent = formatPLN(schedule.totals.fpfs);
    DOM.zusHealthMonths.textContent = String(ctx.healthMonths);
    setText(DOM.zusSummaryMeta, "wliczone w każdy wariant");
    if (DOM.zusScheduleSummary) {
      DOM.zusScheduleSummary.textContent = getScheduleRanges(schedule).join(
        " · ",
      );
    }
    if (DOM.zusMonths) {
      DOM.zusMonths.textContent = "";
      const regimesUsed = [];
      let anyPartial = false;
      schedule.months.forEach((entry) => {
        const item = document.createElement("li");
        const key = getMonthRegimeKey(entry);
        if (!regimesUsed.includes(key)) regimesUsed.push(key);
        item.dataset.regime = key;
        if (entry.partial) {
          item.dataset.partial = "true";
          anyPartial = true;
        }
        const amount = entry.total;
        const label = document.createElement("span");
        label.className = "zus-month-label";
        label.setAttribute("aria-hidden", "true");
        label.textContent = `${ROMAN_MONTHS[entry.month - 1]}${
          entry.partial ? "*" : ""
        }`;
        const value = document.createElement("span");
        value.className = "zus-month-amount";
        value.setAttribute("aria-hidden", "true");
        value.textContent = formatChipAmount(amount);
        const srText = document.createElement("span");
        srText.className = "sr-only";
        srText.textContent = `${MONTH_NAMES[entry.month - 1]}: ${
          ZUS_REGIME_LABELS[key]
        }${entry.partial ? " (niepełny miesiąc)" : ""}, ${formatPLN(amount)}${
          entry.holiday
            ? ` (zwolnione ${formatPLN(entry.waived.total)})`
            : ""
        }`;
        item.title = srText.textContent;
        item.append(label, value, srText);
        DOM.zusMonths.appendChild(item);
      });
      renderZusLegend(regimesUsed, anyPartial);
    }
  }

  function renderZusLegend(regimesUsed, anyPartial) {
    const legend = document.getElementById("zusLegend");
    if (!legend) return;
    legend.textContent = "";
    regimesUsed.forEach((key) => {
      const item = document.createElement("li");
      item.dataset.regime = key;
      const swatch = document.createElement("span");
      swatch.className = "zus-legend-swatch";
      swatch.setAttribute("aria-hidden", "true");
      item.append(swatch, document.createTextNode(ZUS_REGIME_LABELS[key]));
      legend.appendChild(item);
    });
    if (anyPartial) {
      const item = document.createElement("li");
      item.className = "zus-legend-partial";
      item.textContent = "* niepełny miesiąc (podstawa proporcjonalna)";
      legend.appendChild(item);
    }
    const unit = document.createElement("li");
    unit.className = "zus-legend-unit";
    unit.textContent = "kwoty: składki społeczne + FP/FS w miesiącu, zł";
    legend.appendChild(unit);
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
        tagEl.textContent = `część ryczałtu${
          allocated ? ` · od ${formatPLN(allocated)} przychodu` : ""
        }`;
      } else {
        tagEl.textContent = revenue ? `od ${formatPLN(revenue)} przychodu` : "";
      }
    });
  }

  /* ==================================================
     Linia składników pod każdym wynikiem
     Składniki sumują się do wyniku wiersza (ta sama terminologia co
     w szczegółowych obliczeniach): podatek formy + PIT od innych dochodów
     (zmiana względem PIT od samych tych dochodów) + danina + zdrowotna + ZUS.
  ================================================== */
  const NBSP = "\u00a0";
  const RYCZALT_TIER_LABELS = [
    `próg I: do 60${NBSP}tys.${NBSP}zł`,
    `próg II: 60–300${NBSP}tys.${NBSP}zł`,
    `próg III: ponad 300${NBSP}tys.${NBSP}zł`,
  ];

  function getRyczaltTierLabel(thresholdRevenue) {
    if (thresholdRevenue > TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH) {
      return RYCZALT_TIER_LABELS[2];
    }
    if (thresholdRevenue > TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW) {
      return RYCZALT_TIER_LABELS[1];
    }
    return RYCZALT_TIER_LABELS[0];
  }

  /* Kwota ze znakiem (+ / − ) – zmiany względem stanu bez działalności. */
  function formatSignedAmountPL(value) {
    const rounded = taxMath.round2(value);
    return `${rounded < 0 ? "−" : "+"}${formatAmountPL(Math.abs(rounded))}`;
  }

  /* Czy zastosowano minimalną składkę zdrowotną (skala / liniowy)? */
  function isMinimumHealth(evaluation, rate) {
    const { ctx, best } = evaluation;
    const calculated = taxMath.round2(Math.max(ctx.healthBaseIncome, 0) * rate);
    return best.health > calculated + 0.004;
  }

  function getVariantDetailText(evaluation) {
    const { best, ctx } = evaluation;
    const baseline = ctx.baseline;
    const hasOther = ctx.otherIncome > 0;
    const parts = [];
    if (best.form === "ryczalt") {
      parts.push(`ryczałt ${formatAmountPL(best.ryczaltTax)}`);
    } else if (best.form === "linear") {
      parts.push(`PIT liniowy ${formatAmountPL(best.linearPit)}`);
    } else {
      const pit = taxMath.round2(best.pit - baseline.pit);
      let label = "PIT";
      if (best.joint) label = "PIT przypisany (PIT pary − PIT małżonka)";
      else if (hasOther) label = "PIT przypisany działalności";
      parts.push(`${label} ${formatAmountPL(pit)}`);
    }
    if (best.ipBoxCoeff > 0) {
      parts.push(`IP BOX 5% ${formatAmountPL(best.ipBoxTax)}`);
    }
    if (hasOther && best.form !== "scale") {
      const change = taxMath.round2(best.scalePit - baseline.pit);
      let reason = "bez zmian";
      if (change !== 0) {
        reason =
          best.socialFromScale > 0
            ? "składki odliczone od skali"
            : "zmiana podstawy";
      }
      parts.push(
        `PIT od innych dochodów: ${formatSignedAmountPL(change)} (${reason})`,
      );
    }
    const levyChange = taxMath.round2(best.levy - baseline.levy);
    if (levyChange !== 0) {
      parts.push(
        `danina ${
          levyChange < 0
            ? formatSignedAmountPL(levyChange)
            : formatAmountPL(levyChange)
        }`,
      );
    }
    if (best.form === "ryczalt") {
      parts.push(
        `zdrowotna ${formatAmountPL(best.health)} (${getRyczaltTierLabel(
          best.thresholdRevenue,
        )}; ${formatAmountPL(best.healthMonthly)}/mies.)`,
      );
    } else {
      const rate =
        best.form === "linear"
          ? TAX_CONSTANTS.HEALTH_RATE_LINEAR
          : TAX_CONSTANTS.HEALTH_RATE_SCALE;
      parts.push(
        `zdrowotna ${formatAmountPL(best.health)} (${
          isMinimumHealth(evaluation, rate) ? "minimalna" : formatPercentPL(rate)
        })`,
      );
    }
    if (ctx.zusEnabled) {
      parts.push(`ZUS ${formatAmountPL(ctx.socialTotal)}`);
      if (ctx.social > 0) {
        parts.push(`składki społeczne: ${getSocialMethodLabel(evaluation)}`);
      }
      if (evaluation.holidayMonth) {
        parts.push(
          `wakacje składkowe: ${formatMonthYear({
            y: evaluation.schedule.year,
            m: evaluation.holidayMonth,
          })}`,
        );
      }
    }
    return parts.join(" · ");
  }

  function ensureRowDetail(row) {
    let detail = row.querySelector("[data-detail]");
    if (!detail) {
      detail = document.createElement("span");
      detail.className = "results-row-detail";
      detail.dataset.detail = "";
      row.appendChild(detail);
    }
    return detail;
  }

  function renderRowDetails(result) {
    const { inputs, variants } = result;
    COMPARISON_VARIANT_IDS.forEach((id) => {
      const row = document.querySelector(`.results-row[data-variant="${id}"]`);
      if (!row) return;
      const detail = ensureRowDetail(row);
      const isRatePart =
        inputs.isMultipleRates && RYCZALT_VARIANT_IDS.includes(id);
      row.classList.toggle("is-rate-part", isRatePart);
      let text = "";
      if (isRatePart) {
        text =
          "Sam ryczałt od tej stawki — bez składki zdrowotnej, ZUS i PIT od innych dochodów; pełne obciążenie w wierszu „Łącznie” poniżej.";
      } else if (variants[id]) {
        text = getVariantDetailText(variants[id]);
      }
      setText(detail, text);
    });
    const ratesDetail = document.getElementById("ratesTotalDetail");
    if (ratesDetail) {
      setText(
        ratesDetail,
        variants.ratesTotal ? getVariantDetailText(variants.ratesTotal) : "",
      );
    }
  }

  /* ==================================================
     Uwagi do wyniku („i” przy wierszu): uproszczenia i interpretacje,
     od których zależy kwota danego wariantu. Każda uwaga ma link do
     tematu w oknie „Założenia”.
  ================================================== */
  /* Składki społeczne, których w wariancie nie udało się odliczyć. */
  function getSocialLost(evaluation) {
    const { best, ctx } = evaluation;
    if (!ctx.zusEnabled || ctx.social <= 0) return 0;
    let used;
    if (best.form === "scale") {
      used = best.method === "costs" ? ctx.social : best.socialDeducted;
    } else if (best.form === "linear") {
      used =
        best.method === "costs"
          ? ctx.social
          : best.socialFromLinear + best.socialFromScale;
    } else {
      used = best.socialFromRevenue + best.socialFromScale;
    }
    return Math.max(taxMath.round2(ctx.social - used), 0);
  }

  function getAllocationNoteText(status) {
    if (status.state === "empty") {
      return "Nie przypisano przychodu do stawek — suma pominięta w rankingu.";
    }
    if (status.state === "over") {
      return `Przypisano o ${formatPLN(
        status.over,
      )} więcej niż przychód — suma pominięta w rankingu.`;
    }
    return `Nieprzypisane ${formatPLN(
      status.unallocated,
    )} przychodu: ryczałt tylko od kwot przypisanych, próg zdrowotnej od całego przychodu — suma pominięta w rankingu.`;
  }

  function getVariantNotes(id, evaluation, result) {
    const notes = [];
    if (!evaluation) return notes;
    const { best, ctx, schedule, options } = evaluation;
    const add = (text, topic) => notes.push({ text, topic });

    if (id === "ratesTotal") {
      const status = getAllocationStatus(result.inputs.revenue);
      if (status.state !== "complete") {
        add(getAllocationNoteText(status), "info-health-ryczalt");
      }
    }

    if (JOINT_VARIANT_IDS.includes(id) && evaluation.total < 0) {
      add(
        "Wynik ujemny: wspólne rozliczenie obniża PIT małżonka bardziej, niż wynosi Twoje obciążenie (oszczędność gospodarstwa domowego).",
        "info-joint",
      );
    }

    if (ctx.zusEnabled && ctx.social > 0) {
      const lost = getSocialLost(evaluation);
      const alternatives = (options || [])
        .filter((option) => option !== best)
        .map((option) => taxMath.round2(option.total - best.total))
        .filter((diff) => diff > 0.004);
      if (lost > 0 || alternatives.length) {
        let text = `Składki społeczne: ${getSocialMethodLabel(evaluation)} — wybrany najtańszy sposób${
          best.form === "ryczalt" ? "" : ", bez dzielenia składek między sposoby"
        }`;
        if (alternatives.length) {
          text += `; inny sposób: +${formatAmountPL(Math.min(...alternatives))}${NBSP}zł`;
        }
        if (lost > 0) {
          text += `; nieodliczone ${formatAmountPL(lost)}${NBSP}zł przepada`;
        }
        add(`${text}.`, "info-deduction-choice");
      }
    }

    const holiday = schedule.holiday;
    if (
      ctx.zusEnabled &&
      holiday.requested &&
      holiday.eligibleMonths &&
      holiday.eligibleMonths.length
    ) {
      add(
        evaluation.holidayMonth
          ? `Wakacje składkowe przyjęte za ${formatMonthYear({
              y: schedule.year,
              m: evaluation.holidayMonth,
            })} — miesiąc dobrany automatycznie; sprawdź, czy termin wniosku RWS nie minął.`
          : "Wakacje składkowe pominięte — w tym wariancie się nie opłacają.",
        "info-zus-holiday",
      );
    }

    const start = schedule.startDate;
    if (
      start &&
      start.d !== 1 &&
      !schedule.startsBeforeYear &&
      !schedule.startsAfterYear
    ) {
      const partialSocial =
        ctx.zusEnabled && schedule.months.some((entry) => entry.partial);
      add(
        `Start w trakcie miesiąca (${formatDatePL(start)}): ${
          partialSocial
            ? "składki społeczne za ten miesiąc od podstawy proporcjonalnej, "
            : ""
        }składka zdrowotna w pełnej kwocie.`,
        "info-zus-partial",
      );
    }

    if (best.form === "linear") {
      if (best.ipBoxCoeff > 0) {
        add(
          "Składkę zdrowotną odliczamy tylko od dochodu opodatkowanego liniowo, nie od dochodu kwalifikowanego IP BOX (przyjęte założenie).",
          "info-ipbox",
        );
      }
      if (
        ctx.healthMonths < 12 &&
        best.healthDeduction >= TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT
      ) {
        add(
          `Limit odliczenia zdrowotnej (${formatPLN(
            TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT,
          )}) przyjęty w pełnej wysokości mimo niepełnego roku.`,
          "info-health-linear",
        );
      }
    }

    if (best.form === "ryczalt") {
      if (
        getRyczaltTierLabel(best.thresholdRevenue) !==
        getRyczaltTierLabel(best.revenueTotal)
      ) {
        add(
          "Próg składki zdrowotnej ustalony od przychodu pomniejszonego o składki społeczne (art. 81 ust. 2g, wykładnia literalna) — od samego przychodu byłby wyższy.",
          "info-deduction-ryczalt",
        );
      }
      const unusedHealth = taxMath.round2(
        Math.max(best.healthDeduction - Math.max(best.revenueTotal, 0), 0),
      );
      if (unusedHealth > 0) {
        add(
          `Przychód nie pokrywa całego odliczenia 50% zdrowotnej — nieodliczone ${formatPLN(
            unusedHealth,
          )} przepada.`,
          "info-deduction-ryczalt",
        );
      }
    }
    return notes;
  }

  /* Wspólny przycisk „i” z dymkiem (uwagi) dla wiersza wyniku. */
  function ensureRowNote(container, id) {
    let tip = container.querySelector(".row-note");
    if (tip) return tip;
    tip = document.createElement("span");
    tip.className = "tip row-note";
    tip.dataset.tip = "";
    tip.hidden = true;
    const popId = `rowNote-${id}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "row-note-btn";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", popId);
    button.setAttribute("aria-describedby", popId);
    button.setAttribute(
      "aria-label",
      `Założenia i uproszczenia: ${VARIANT_LABELS[id] || id}`,
    );
    button.textContent = "i";
    const pop = document.createElement("span");
    pop.className = "row-note-pop";
    pop.id = popId;
    pop.setAttribute("role", "tooltip");
    tip.append(button, pop);
    container.appendChild(tip);
    return tip;
  }

  function renderRowNote(container, id, notes) {
    if (!container) return;
    const tip = ensureRowNote(container, id);
    const pop = tip.querySelector(".row-note-pop");
    const signature = JSON.stringify(notes);
    if (tip.dataset.signature === signature) return;
    tip.dataset.signature = signature;
    if (!notes.length && tipState.open === tip) closeTip(tip);
    tip.hidden = !notes.length;
    pop.textContent = "";
    if (!notes.length) return;
    const title = document.createElement("span");
    title.className = "row-note-title";
    title.textContent = "Ten wynik zakłada:";
    const list = document.createElement("span");
    list.className = "row-note-list";
    notes.forEach((note) => {
      const item = document.createElement("span");
      item.className = "row-note-item";
      item.append(document.createTextNode(`${note.text} `));
      const link = document.createElement("a");
      link.className = "tip-more";
      link.href = `#${note.topic}`;
      link.dataset.infoTopic = note.topic;
      link.textContent = `Więcej${NBSP}→`;
      item.appendChild(link);
      list.appendChild(item);
    });
    pop.append(title, list);
  }

  /* ==================================================
     „Pokaż wyliczenie” – obliczenia jednego wariantu w wierszu
     (te same generatory tekstu co w pełnym eksporcie).
  ================================================== */
  const VARIANT_BREAKDOWN_TITLES = {
    taxScale: "SKALA PODATKOWA",
    taxScaleIpBox: "SKALA PODATKOWA Z IP BOX",
    taxScaleJoint: "SKALA PODATKOWA WSPÓLNIE Z MAŁŻONKIEM",
    taxScaleIpBoxJoint: "SKALA PODATKOWA Z IP BOX WSPÓLNIE Z MAŁŻONKIEM",
    taxLinear: "PODATEK LINIOWY",
    taxLinearIpBox: "PODATEK LINIOWY Z IP BOX",
  };

  function getVariantBreakdownText(id, result) {
    const evaluation = result && result.variants[id];
    if (!evaluation) return "";
    let text;
    if (id === "ratesTotal") {
      text = getRyczaltMultiVariantText(evaluation, getCheckedRateIds());
    } else if (id.startsWith("taxScale")) {
      text = getScaleVariantText(VARIANT_BREAKDOWN_TITLES[id], evaluation);
    } else if (id.startsWith("taxLinear")) {
      text = getLinearVariantText(VARIANT_BREAKDOWN_TITLES[id], evaluation);
    } else {
      text = getRyczaltSingleVariantText(id, evaluation);
    }
    text += getOtherIncomeSectionText(result.ctx);
    return text.replace(/^\n+/, "");
  }

  let lastResult = null;

  function ensureRowBreakdown(container, id) {
    let button = Array.from(container.children).find((child) =>
      child.classList.contains("row-breakdown-toggle"),
    );
    if (button) return button;
    const preId = `rowBreakdown-${id}`;
    button = document.createElement("button");
    button.type = "button";
    button.className = "row-breakdown-toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", preId);
    button.dataset.variantId = id;
    button.textContent = "Pokaż wyliczenie";
    const pre = document.createElement("pre");
    pre.className = "row-breakdown";
    pre.id = preId;
    pre.hidden = true;
    pre.tabIndex = 0;
    pre.setAttribute(
      "aria-label",
      `Wyliczenie: ${VARIANT_LABELS[id] || id}`,
    );
    container.append(button, pre);
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      setRowBreakdownOpen(button, open);
    });
    return button;
  }

  function setRowBreakdownOpen(button, open) {
    const pre = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Ukryj wyliczenie" : "Pokaż wyliczenie";
    if (!pre) return;
    pre.hidden = !open;
    pre.textContent = open
      ? getVariantBreakdownText(button.dataset.variantId, lastResult)
      : "";
  }

  function getRowContainer(id) {
    return id === "ratesTotal"
      ? document.getElementById("ratesTotal")
      : document.querySelector(`.results-row[data-variant="${id}"]`);
  }

  /* Uwagi i wyliczenia przy wierszach po każdym poprawnym przeliczeniu. */
  function renderRowExtras(result) {
    lastResult = result;
    const { inputs, variants } = result;
    const meaningful = inputs.revenue > 0 || result.ctx.income !== 0;
    [...COMPARISON_VARIANT_IDS, "ratesTotal"].forEach((id) => {
      const container = getRowContainer(id);
      if (!container) return;
      const isRatePart =
        inputs.isMultipleRates && RYCZALT_VARIANT_IDS.includes(id);
      const evaluation = isRatePart ? null : variants[id];
      const labelHost =
        id === "ratesTotal"
          ? container.querySelector(".rates-total-sum > span:first-child")
          : container.querySelector(".results-row-label");
      // przed wpisaniem danych (zerowy przychód i dochód) bez uwag
      renderRowNote(
        labelHost,
        id,
        meaningful ? getVariantNotes(id, evaluation, result) : [],
      );
      const button = ensureRowBreakdown(container, id);
      button.hidden = !evaluation;
      if (!evaluation && button.getAttribute("aria-expanded") === "true") {
        setRowBreakdownOpen(button, false);
      } else if (button.getAttribute("aria-expanded") === "true") {
        setRowBreakdownOpen(button, true);
      }
    });
  }

  /* Błędne dane: zamknij wyliczenia i ukryj uwagi (brak wyniku). */
  function clearRowExtras() {
    lastResult = null;
    document.querySelectorAll(".row-breakdown-toggle").forEach((button) => {
      if (button.getAttribute("aria-expanded") === "true") {
        setRowBreakdownOpen(button, false);
      }
      button.hidden = true;
    });
    document.querySelectorAll(".row-note").forEach((tip) => {
      if (tipState.open === tip) closeTip(tip);
      tip.hidden = true;
      delete tip.dataset.signature;
    });
  }

  /* ==================================================
     Monit o stawkę ryczałtu (pierwsze wejście – żadna stawka nie jest
     zaznaczona; nie zaznaczamy stawki automatycznie).
  ================================================== */
  let ryczaltTouched = false;

  function updateRyczaltPrompt(valid) {
    if (!DOM.ryczaltPrompt) return;
    DOM.ryczaltPrompt.hidden = !(
      valid &&
      !ryczaltTouched &&
      getCheckedRateIds().length === 0
    );
  }

  /* ==================================================
     Ranking (z wyniku obliczeń – jedno źródło dla karty, kolejności
     wierszy i eksportu)
  ================================================== */
  function getCheckedRateIds() {
    return RYCZALT_VARIANT_IDS.filter((rateId) => {
      const checkbox = document.querySelector(
        `input[type="checkbox"][data-target="${rateId}"]`,
      );
      return checkbox && checkbox.checked;
    });
  }

  function buildRanking(result) {
    const { inputs, variants, ctx } = result;
    const entries = [];
    const excluded = [];
    const add = (id, index) => {
      const evaluation = variants[id];
      if (!evaluation) return;
      const total = evaluation.total;
      // tylko warianty wspólne mogą być ujemne (zob.
      // calculateJointScalePitAttributed); inne ≤ 0 nie są realną opcją
      if (total === 0) return;
      if (total < 0 && !JOINT_VARIANT_IDS.includes(id)) return;
      entries.push({ id, index, total, label: VARIANT_LABELS[id] || id });
    };
    PIT_VARIANT_IDS.forEach((id, index) => add(id, index));
    const rateIds = getCheckedRateIds();
    let allocation = null;
    if (inputs.isMultipleRates) {
      if (rateIds.length && variants.ratesTotal) {
        allocation = getAllocationStatus(inputs.revenue);
        if (allocation.state === "complete") {
          if (variants.ratesTotal.total > 0) {
            add("ratesTotal", COMPARISON_VARIANT_IDS.length);
          }
        } else {
          excluded.push({
            id: "ratesTotal",
            reason:
              allocation.state === "empty"
                ? "Ryczałt (wiele stawek) pominięty — nie przypisano przychodu do stawek."
                : allocation.state === "under"
                  ? `Ryczałt (wiele stawek) pominięty — nieprzypisane ${formatPLN(
                      allocation.unallocated,
                    )} przychodu.`
                  : `Ryczałt (wiele stawek) pominięty — przypisano o ${formatPLN(
                      allocation.over,
                    )} więcej niż przychód.`,
          });
        }
      }
    } else {
      rateIds.forEach((id) => add(id, COMPARISON_VARIANT_IDS.indexOf(id)));
    }
    entries.sort((a, b) => a.total - b.total || a.index - b.index);
    return {
      entries,
      excluded,
      allocation,
      meaningful: inputs.revenue > 0 || ctx.income !== 0,
    };
  }

  /* Kolejność wierszy: od najniższego wyniku. W trybie „Wiele stawek”
     wiersze części ryczałtu stoją razem, bezpośrednio przed sumą „Łącznie”,
     a cała grupa jest ustawiana wg sumy (pominięta w rankingu – na końcu). */
  function sortComparisonRows(result, ranking) {
    const container = document.getElementById("comparePit");
    if (!container) return;
    const { inputs, variants } = result;
    const units = [];
    PIT_VARIANT_IDS.forEach((id, index) => {
      if (!variants[id]) return;
      const row = container.querySelector(`.results-row[data-variant="${id}"]`);
      if (row) units.push({ rows: [row], value: variants[id].total, index });
    });
    const rateIds = getCheckedRateIds();
    if (inputs.isMultipleRates) {
      const ranked = ranking.entries.some((entry) => entry.id === "ratesTotal");
      const rows = rateIds
        .map((id) => container.querySelector(`.results-row[data-variant="${id}"]`))
        .filter(Boolean);
      const totalBlock = document.getElementById("ratesTotal");
      if (totalBlock) rows.push(totalBlock);
      units.push({
        rows,
        value:
          ranked && variants.ratesTotal ? variants.ratesTotal.total : Infinity,
        index: COMPARISON_VARIANT_IDS.length,
      });
    } else {
      rateIds.forEach((id) => {
        const row = container.querySelector(`.results-row[data-variant="${id}"]`);
        if (row && variants[id]) {
          units.push({
            rows: [row],
            value: variants[id].total,
            index: COMPARISON_VARIANT_IDS.indexOf(id),
          });
        }
      });
      const totalBlock = document.getElementById("ratesTotal");
      if (totalBlock) container.appendChild(totalBlock);
    }
    units
      .sort((a, b) => a.value - b.value || a.index - b.index)
      .forEach((unit) => unit.rows.forEach((row) => container.appendChild(row)));
  }

  function getRowForVariant(id) {
    if (id === "ratesTotal") return document.getElementById("ratesTotal");
    return document.querySelector(`.results-row[data-variant="${id}"]`);
  }

  /* ==================================================
     Rank visible variants & populate the best card
  ================================================== */
  function rankAndSummarize(result) {
    const ranking = buildRanking(result);
    const variants = ranking.entries;

    document
      .querySelectorAll(".results-row, #ratesTotal")
      .forEach((r) => r.classList.remove("is-best"));
    document
      .querySelectorAll(".results-row [data-bar]")
      .forEach((b) => (b.style.width = "0%"));

    sortComparisonRows(result, ranking);

    if (!variants.length || !ranking.meaningful) {
      DOM.bestCard.dataset.state = "empty";
      DOM.bestCardTitle.textContent = "—";
      DOM.bestCardAmount.textContent = "—";
      DOM.bestCardSavings.textContent =
        "Wprowadź dane, aby zobaczyć najkorzystniejszy wariant.";
      appendExcludedNotes(ranking);
      announceResult("");
      updateMobileJump(null);
      return;
    }

    const best = variants[0];
    const worst = variants[variants.length - 1];
    const second = variants[1];

    const bestRow = getRowForVariant(best.id);
    if (bestRow) bestRow.classList.add("is-best");

    const maxVal = Math.max(...variants.map((v) => v.total), 1);
    variants.forEach((v) => {
      const row = getRowForVariant(v.id);
      const bar = row && row.querySelector("[data-bar]");
      if (!bar) return;
      const pct = maxVal > 0 ? Math.max(v.total / maxVal, 0) * 100 : 0;
      bar.style.width = pct.toFixed(1) + "%";
    });

    DOM.bestCard.dataset.state = "ranked";
    DOM.bestCardTitle.textContent = best.label;
    DOM.bestCardAmount.textContent = formatPLN(best.total);

    if (second && second.total > best.total) {
      const delta = taxMath.round2(second.total - best.total);
      DOM.bestCardSavings.innerHTML =
        `<strong>−${formatPLN(delta)}</strong>` +
        ` vs. drugi najlepszy wariant (${second.label})`;
    } else if (second && worst.total > best.total) {
      const tied = variants
        .filter((v) => Math.abs(v.total - best.total) < 0.005)
        .map((v) => v.label);
      const delta = taxMath.round2(worst.total - best.total);
      DOM.bestCardSavings.innerHTML = `<strong>−${formatPLN(
        delta,
      )}</strong> vs. najwyższy wariant`;
      const note = document.createElement("span");
      note.className = "best-card-note";
      note.textContent = `Ex aequo: ${tied.join(" / ")}.`;
      DOM.bestCardSavings.appendChild(note);
    } else if (variants.length > 1) {
      DOM.bestCardSavings.textContent =
        "Wszystkie porównywane warianty dają tę samą kwotę.";
    } else {
      DOM.bestCardSavings.textContent =
        "Tylko jeden porównywany wariant — wybierz więcej, aby porównać.";
    }

    if (best.total < 0) {
      const note = document.createElement("span");
      note.className = "best-card-note";
      note.textContent =
        "Kwota ujemna: wspólne rozliczenie obniża PIT małżonka bardziej, niż wynosi Twoje obciążenie (oszczędność gospodarstwa domowego).";
      DOM.bestCardSavings.appendChild(note);
    }
    if (/^ryczalt|^ratesTotal$/.test(best.id)) {
      const note = document.createElement("span");
      note.className = "best-card-note";
      note.textContent =
        "Stawka ryczałtu zależy od rodzaju działalności (art. 12 ustawy o ryczałcie) — zweryfikuj ją dla klienta.";
      DOM.bestCardSavings.appendChild(note);
    }
    appendExcludedNotes(ranking);
    announceResult(
      `Najniższe obciążenie: ${best.label}, ${formatPLN(best.total)}.`,
    );
    updateMobileJump(best);
  }

  function appendExcludedNotes(ranking) {
    ranking.excluded.forEach((item) => {
      const note = document.createElement("span");
      note.className = "best-card-note best-card-note--warn";
      note.textContent = item.reason;
      DOM.bestCardSavings.appendChild(note);
    });
  }

  /* Krótki komunikat dla czytników ekranu (zamiast ogłaszania całej sekcji
     wyników przy każdym naciśnięciu klawisza) – z opóźnieniem. */
  let announceTimeout = null;
  function announceResult(text) {
    const live = document.getElementById("resultsLive");
    if (!live) return;
    if (announceTimeout) clearTimeout(announceTimeout);
    announceTimeout = setTimeout(() => {
      setText(live, text);
      announceTimeout = null;
    }, 700);
  }

  /* Pasek „Przejdź do wyników” (tylko na wąskich ekranach, CSS). */
  function updateMobileJump(best) {
    const summary = document.getElementById("mobileJumpSummary");
    if (!summary) return;
    setText(
      summary,
      best
        ? `${best.label} · ${formatPLN(best.total)}`
        : DOM.bestCard.dataset.state === "invalid"
          ? "Popraw zaznaczone pola"
          : "Wprowadź dane",
    );
  }

  /* ==================================================
     Inline breakdown auto-update when <details> is open
  ================================================== */
  function refreshBreakdownIfOpen() {
    if (!DOM.breakdownDetails || !DOM.breakdownPre) return;
    if (DOM.breakdownDetails.open) {
      renderBreakdown(getFormattedValues());
    }
  }

  /* Pełne obliczenia z kotwicami przy nagłówkach sekcji („=== … ===”,
     „--- … ---”) i spisem treści. Tekst w <pre> jest identyczny
     z eksportem (kotwice to tylko elementy <span> wokół nagłówków). */
  const BREAKDOWN_HEADING = /^(===|---) (.+?) \1$/;

  function toBreakdownTocLabel(title) {
    const lower = title.toLowerCase();
    return (lower.charAt(0).toUpperCase() + lower.slice(1))
      .replace(/\bzus\b/g, "ZUS")
      .replace(/ip box/g, "IP BOX")
      .replace(/\bpit\b/g, "PIT");
  }

  function renderBreakdown(text) {
    const pre = DOM.breakdownPre;
    if (!pre) return;
    const toc = DOM.breakdownToc;
    pre.textContent = "";
    const entries = [];
    let buffer = "";
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      const suffix = index < lines.length - 1 ? "\n" : "";
      const match = line.match(BREAKDOWN_HEADING);
      if (!match) {
        buffer += line + suffix;
        return;
      }
      if (buffer) pre.appendChild(document.createTextNode(buffer));
      buffer = suffix;
      const anchor = document.createElement("span");
      anchor.className = "breakdown-anchor";
      anchor.id = `bd-${entries.length + 1}`;
      anchor.tabIndex = -1;
      anchor.textContent = line;
      pre.appendChild(anchor);
      entries.push({
        id: anchor.id,
        label: toBreakdownTocLabel(match[2]),
        sub: match[1] === "---",
      });
    });
    if (buffer) pre.appendChild(document.createTextNode(buffer));
    if (!toc) return;
    toc.textContent = "";
    toc.hidden = entries.length < 2;
    if (toc.hidden) return;
    const heading = document.createElement("span");
    heading.className = "breakdown-toc-title";
    heading.textContent = "Spis treści:";
    const list = document.createElement("ol");
    list.className = "breakdown-toc-list";
    entries.forEach((entry) => {
      const item = document.createElement("li");
      if (entry.sub) item.className = "is-sub";
      const link = document.createElement("a");
      link.href = `#${entry.id}`;
      link.textContent = entry.label;
      item.appendChild(link);
      list.appendChild(item);
    });
    toc.append(heading, list);
  }

  /* ==================================================
     Event Handlers
  ================================================== */
  /* Zwinięte sekcje (IP BOX, dochód małżonka, składki społeczne) nie
     mogą przyjmować fokusu ani być czytane – inert + aria-hidden. */
  function setRevealed(element, revealed) {
    if (!element) return;
    element.classList.toggle("is-revealed", revealed);
    if (revealed) {
      element.removeAttribute("inert");
      element.removeAttribute("aria-hidden");
    } else {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    }
  }

  function syncRyczaltRowVisibility() {
    DOM.ryczaltCheckboxes.forEach((checkbox) => {
      const targetInput = document.getElementById(checkbox.dataset.target);
      const targetGroup = targetInput && targetInput.closest(".input-group");
      if (targetGroup) {
        targetGroup.style.display = checkbox.checked ? "grid" : "none";
      }
    });
  }

  /* Formatuje pole kwotowe („12 345,67 zł”) tylko, gdy wartość jest
     poprawna – błędnej nie zmieniamy, żeby użytkownik widział, co wpisał. */
  function formatAmountField(input, { formatEmpty = false } = {}) {
    if (!input) return;
    if (input.value.trim() === "" && !formatEmpty) return;
    const checked = checkAmount(input.value);
    // bez „zł” tam, gdzie jednostka stoi obok pola (.input-suffix);
    // pola przychodu stawek (chipy) nie mają przyrostka
    const hasSuffix = !!(
      input.parentElement && input.parentElement.querySelector(".input-suffix")
    );
    if (checked.ok) {
      input.value = hasSuffix
        ? formatAmountPL(checked.value)
        : formatPLN(checked.value);
    }
  }

  function handleCalculate() {
    syncRyczaltRowVisibility();
    if (!isJointTaxationEnabled()) {
      setRevealed(DOM.spouseIncomeCard, false);
      DOM.spouseIncomeInput.setAttribute("readonly", "");
      DOM.spouseIncomeInput.value = formatAmountPL(0);
    }
    calculate();
    if (DOM.bestCard.dataset.state !== "invalid") {
      formatAmountField(DOM.revenueInput, { formatEmpty: true });
      formatAmountField(DOM.costsInput, { formatEmpty: true });
      formatAmountField(DOM.otherIncomeInput);
    }
  }

  /* ==================================================
     Reset
  ================================================== */
  function resetAll() {
    if (
      typeof window.confirm === "function" &&
      !window.confirm("Wyzerować wszystkie dane? Tej operacji nie można cofnąć.")
    ) {
      return;
    }
    DOM.revenueInput.value = "";
    DOM.costsInput.value = "";
    DOM.otherIncomeInput.value = "";

    DOM.zusEnabled.checked = true;
    setRevealed(DOM.zusReveal, true);
    DOM.zusStartDate.value = "";
    DOM.zusBirthDate.value = "";
    DOM.zusPathRadios.forEach((radio) => {
      radio.checked = radio.value === "full";
    });
    DOM.zusSexRadios.forEach((radio) => {
      radio.checked = radio.value === "";
    });
    DOM.zusSickness.checked = true;
    DOM.zusEmployment.checked = false;
    DOM.zusHoliday.checked = false;
    ryczaltTouched = false;

    DOM.ipBoxCoeffInput.value = "25";
    syncIpBoxRange();
    document.querySelector('input[name="ipBoxEnabled"][value="no"]').checked =
      true;
    setRevealed(DOM.ipBoxReveal, false);
    clearIpBoxResultFields();

    document.querySelector('input[name="jointTaxation"][value="no"]').checked =
      true;
    setRevealed(DOM.spouseIncomeCard, false);
    DOM.spouseIncomeInput.setAttribute("readonly", "");
    DOM.spouseIncomeInput.value = formatAmountPL(0);
    updateConditionalRowsVisibility();

    DOM.multipleRatesToggle.checked = false;
    document.querySelector(".multiple-rates-revenue-info").style.display =
      "none";
    document.querySelector(".multiple-rates-wrapper").style.justifyContent =
      "flex-end";
    DOM.ryczaltCheckboxes.forEach((cb) => {
      cb.checked = false;
      const targetInput = document.getElementById(cb.dataset.target);
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
    syncRyczaltRowVisibility();
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

  /* Kwoty: przeliczenie przy każdej zmianie (calculate() sprawdza wszystkie
     pola); po opuszczeniu pola poprawna kwota jest formatowana. */
  [DOM.revenueInput, DOM.costsInput, DOM.otherIncomeInput].forEach((input) => {
    input.addEventListener("input", () => {
      calculate(input);
      if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
    });
    input.addEventListener("blur", () => {
      formatAmountField(input);
      calculate();
      if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
    });
  });

  /* Składki ZUS: przełącznik sekcji, daty, ścieżka i opcje */
  DOM.zusEnabled.addEventListener("change", () => {
    setRevealed(DOM.zusReveal, DOM.zusEnabled.checked);
    calculate();
  });
  [DOM.zusStartDate, DOM.zusBirthDate].forEach((input) => {
    // w trakcie wpisywania (fokus) niepełna data nie „miga” błędem;
    // pełna walidacja przy opuszczeniu pola
    ["input", "change"].forEach((type) => {
      input.addEventListener(type, () => calculate(input));
    });
    input.addEventListener("blur", () => calculate());
  });
  [...DOM.zusPathRadios, ...DOM.zusSexRadios].forEach((radio) => {
    radio.addEventListener("change", calculate);
  });
  [DOM.zusSickness, DOM.zusEmployment, DOM.zusHoliday].forEach((checkbox) => {
    checkbox.addEventListener("change", calculate);
  });
  if (DOM.zusMoreToggle) {
    DOM.zusMoreToggle.addEventListener("click", () => {
      setZusMoreExpanded(!isZusMoreExpanded());
      // zwinięcie/rozwinięcie zmienia zbiór aktywnych pól (walidacja)
      calculate();
    });
  }
  if (DOM.ryczaltPromptBtn) {
    DOM.ryczaltPromptBtn.addEventListener("click", () => {
      const first = DOM.ryczaltCheckboxes[0];
      if (!first) return;
      const card = first.closest(".card");
      if (card && card.scrollIntoView) {
        card.scrollIntoView({
          block: "start",
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }
      first.focus({ preventScroll: true });
    });
  }

  /* IP BOX: number input + range slider stay in sync */
  DOM.ipBoxCoeffInput.addEventListener("input", (e) => {
    if (!isPendingInput(e.target) && validateIpBoxCoeff(e.target.value)) {
      syncIpBoxRange();
    }
    calculate(e.target);
  });
  DOM.ipBoxCoeffInput.addEventListener("blur", () => calculate());
  if (DOM.ipBoxRange) {
    DOM.ipBoxRange.addEventListener("input", (e) => {
      DOM.ipBoxCoeffInput.value = e.target.value;
      syncIpBoxRange();
      calculate();
    });
  }

  /* IP BOX: Tak/Nie toggle reveals the slider and the IP BOX result rows */
  DOM.ipBoxEnabledRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "yes") {
        setRevealed(DOM.ipBoxReveal, true);
        syncIpBoxRange();
      } else {
        setRevealed(DOM.ipBoxReveal, false);
        clearFieldError("ipBoxCoeff");
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
        setRevealed(DOM.spouseIncomeCard, true);
        DOM.spouseIncomeInput.removeAttribute("readonly");
        DOM.spouseIncomeInput.value = "";
        DOM.spouseIncomeInput.placeholder = "0,00";
        DOM.spouseIncomeCard.classList.add("shake");
        setTimeout(() => {
          DOM.spouseIncomeCard.classList.remove("shake");
        }, 500);
        DOM.spouseIncomeInput.focus();
      } else {
        setRevealed(DOM.spouseIncomeCard, false);
        DOM.spouseIncomeInput.setAttribute("readonly", "");
        DOM.spouseIncomeInput.value = formatAmountPL(0);
        DOM.spouseIncomeInput.placeholder = "";
      }
      updateConditionalRowsVisibility();
      calculate();
    });
  });

  DOM.spouseIncomeInput.addEventListener("input", () => {
    if (isJointTaxationEnabled()) calculate(DOM.spouseIncomeInput);
  });
  DOM.spouseIncomeInput.addEventListener("blur", () => {
    if (isJointTaxationEnabled()) {
      formatAmountField(DOM.spouseIncomeInput);
      calculate();
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
      ryczaltTouched = true;
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
      calculate(e.target);
      if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
    });
    input.addEventListener("blur", (e) => {
      formatAmountField(e.target);
      resizeRateInput(e.target);
      calculate();
      if (DOM.multipleRatesToggle.checked) updateRemainingRevenue();
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
        renderBreakdown(getFormattedValues());
      }
    });
  }
  if (DOM.breakdownToc) {
    DOM.breakdownToc.addEventListener("click", (e) => {
      const link = e.target instanceof Element && e.target.closest("a[href^='#bd-']");
      if (!link) return;
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      target.focus({ preventScroll: true });
    });
  }

  /* ==================================================
     Dymki z wyjaśnieniami (pola formularza i „i” przy wynikach)
     Wzorzec „toggletip”: najechanie / fokus pokazuje dymek, kliknięcie
     (dotyk) go przypina, drugie kliknięcie, Esc albo klik poza zamyka.
     Pozycja liczona w JS (position: fixed): nad przyciskiem, a gdy brak
     miejsca – pod całym polem, więc dymek nigdy nie zasłania opisywanej
     kontrolki i zawsze mieści się w oknie (także na telefonie).
  ================================================== */
  function matchesMedia(query) {
    return !!(window.matchMedia && window.matchMedia(query).matches);
  }

  function prefersReducedMotion() {
    return matchesMedia("(prefers-reduced-motion: reduce)");
  }

  function isNarrowScreen() {
    return matchesMedia("(max-width: 600px)");
  }

  const TIP_MARGIN = 8;
  const TIP_GAP = 8;
  const TIP_MAX_WIDTH = 320;
  const tipState = {
    open: null,
    pinned: false,
    closeTimer: null,
    // przycisk, na który wraca fokus po Esc – bez ponownego otwierania
    suppressFocus: null,
  };

  function getTipParts(tip) {
    return {
      button: tip.querySelector(".field-tooltip, .row-note-btn"),
      bubble: tip.querySelector(".field-tooltip-bubble, .row-note-pop"),
    };
  }

  function positionTip(tip) {
    const { button, bubble } = getTipParts(tip);
    if (!button || !bubble) return;
    const viewportWidth =
      document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(TIP_MAX_WIDTH, viewportWidth - TIP_MARGIN * 2);
    bubble.style.width = `${width}px`;
    const anchor = button.getBoundingClientRect();
    const height = bubble.offsetHeight;
    const topbar = document.querySelector(".topbar");
    const topLimit =
      Math.max(topbar ? topbar.getBoundingClientRect().bottom : 0, 0) +
      TIP_MARGIN;
    const left = Math.min(
      Math.max(anchor.left - 14, TIP_MARGIN),
      viewportWidth - width - TIP_MARGIN,
    );
    let top = anchor.top - TIP_GAP - height;
    let placement = "top";
    if (top < topLimit) {
      // pod polem formularza (nie na nim); w wierszu wyniku – pod przyciskiem
      const field = tip.closest(".field");
      const below = field
        ? Math.max(field.getBoundingClientRect().bottom, anchor.bottom)
        : anchor.bottom;
      top = below + TIP_GAP;
      placement = "bottom";
      if (top + height > viewportHeight - TIP_MARGIN) {
        top = Math.max(topLimit, viewportHeight - TIP_MARGIN - height);
      }
    }
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(top)}px`;
    bubble.dataset.placement = placement;
  }

  function openTip(tip, pin = false) {
    if (!tip || tip.hidden) return;
    clearTimeout(tipState.closeTimer);
    if (tipState.open && tipState.open !== tip) closeTip(tipState.open);
    const wasOpen = tipState.open === tip;
    tipState.open = tip;
    tipState.pinned = pin || (wasOpen && tipState.pinned);
    if (wasOpen) return;
    const { button, bubble } = getTipParts(tip);
    if (!bubble) return;
    bubble.classList.add("is-open");
    if (button) button.setAttribute("aria-expanded", "true");
    positionTip(tip);
  }

  function closeTip(tip = tipState.open) {
    if (!tip) return;
    const { button, bubble } = getTipParts(tip);
    if (bubble) bubble.classList.remove("is-open");
    if (button) button.setAttribute("aria-expanded", "false");
    if (tipState.open === tip) {
      tipState.open = null;
      tipState.pinned = false;
    }
  }

  function scheduleTipClose(tip) {
    clearTimeout(tipState.closeTimer);
    tipState.closeTimer = setTimeout(() => {
      if (tipState.open === tip && !tipState.pinned) closeTip(tip);
    }, 180);
  }

  const canHover = matchesMedia("(hover: hover) and (pointer: fine)");

  document.addEventListener("mouseover", (e) => {
    if (!canHover || !(e.target instanceof Element)) return;
    const tip = e.target.closest("[data-tip]");
    if (tip) openTip(tip);
  });
  document.addEventListener("mouseout", (e) => {
    if (!(e.target instanceof Element)) return;
    const tip = e.target.closest("[data-tip]");
    if (!tip || tip !== tipState.open || tipState.pinned) return;
    if (e.relatedTarget instanceof Node && tip.contains(e.relatedTarget)) return;
    scheduleTipClose(tip);
  });
  document.addEventListener("focusin", (e) => {
    if (!(e.target instanceof Element)) return;
    const tip = e.target.closest("[data-tip]");
    if (tipState.suppressFocus === e.target) {
      tipState.suppressFocus = null;
      return;
    }
    if (tip) openTip(tip);
    else if (tipState.open) closeTip();
  });
  document.addEventListener("focusout", (e) => {
    const tip = tipState.open;
    if (!tip || !(e.target instanceof Node) || !tip.contains(e.target)) return;
    if (e.relatedTarget instanceof Node && tip.contains(e.relatedTarget)) return;
    // kliknięcie myszą w przypięty dymek nie przenosi fokusu na element
    if (tipState.pinned && !e.relatedTarget) return;
    closeTip(tip);
  });
  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    const infoLink = e.target.closest("a[data-info-topic]");
    if (infoLink) {
      e.preventDefault();
      const tip = infoLink.closest("[data-tip]");
      const returnFocus = tip ? getTipParts(tip).button : infoLink;
      if (tip) closeTip(tip);
      openInfoModal(infoLink.dataset.infoTopic, returnFocus);
      return;
    }
    const trigger = e.target.closest(".field-tooltip, .row-note-btn");
    if (trigger) {
      const tip = trigger.closest("[data-tip]");
      if (tipState.open === tip && tipState.pinned) closeTip(tip);
      else openTip(tip, true);
      return;
    }
    if (tipState.open && !tipState.open.contains(e.target)) closeTip();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !tipState.open) return;
    const tip = tipState.open;
    const { button } = getTipParts(tip);
    const focusInside = tip.contains(document.activeElement);
    closeTip(tip);
    if (focusInside && button) {
      tipState.suppressFocus = button;
      button.focus({ preventScroll: true });
      tipState.suppressFocus = null;
    }
  });
  const repositionOpenTip = () => {
    if (tipState.open) positionTip(tipState.open);
  };
  window.addEventListener("scroll", repositionOpenTip, {
    passive: true,
    capture: true,
  });
  window.addEventListener("resize", repositionOpenTip);

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

  /* PIT wg skali rozpisany wzorem z art. 27 ust. 1 ustawy o PIT. */
  function getScalePitBracketLines(pitDetails, indent) {
    const rate12 = TAX_CONSTANTS.PIT_RATE_12;
    const rate32 = TAX_CONSTANTS.PIT_RATE_32;
    const d = pitDetails;
    let text;
    if (d.upToThreshold) {
      text = `${indent}Art. 27 ust. 1 (podstawa do ${formatNumberPL(
        d.threshold12,
      )}): ${formatPercentPL(rate12)} × podstawa − ${formatNumberPL(
        d.decreasingAmount,
      )} (kwota zmniejszająca podatek)\n`;
      text += `${indent}  ${formatNumberPL(d.taxableIncome)} × ${formatPercentPL(
        rate12,
      )} = ${formatNumberPL(d.tax12Gross)}\n`;
      if (d.tax12Gross > d.decreasingAmount) {
        text += `${indent}  ${formatNumberPL(d.tax12Gross)} − ${formatNumberPL(
          d.decreasingAmount,
        )} = ${formatNumberPL(d.totalPit)}\n`;
      } else {
        text += `${indent}  ${formatNumberPL(d.tax12Gross)} nie przekracza kwoty zmniejszającej ${formatNumberPL(
          d.decreasingAmount,
        )} → podatek 0,00 zł\n`;
      }
      return text;
    }
    text = `${indent}Art. 27 ust. 1 (podstawa ponad ${formatNumberPL(
      d.threshold12,
    )}): ${formatNumberPL(d.taxAtThreshold)} + ${formatPercentPL(
      rate32,
    )} × nadwyżka ponad ${formatNumberPL(d.threshold12)}\n`;
    text += `${indent}  Nadwyżka: ${formatNumberPL(d.taxableIncome)} − ${formatNumberPL(
      d.threshold12,
    )} = ${formatNumberPL(d.excess)}\n`;
    text += `${indent}  ${formatNumberPL(d.excess)} × ${formatPercentPL(
      rate32,
    )} = ${formatNumberPL(d.tax32)}\n`;
    text += `${indent}  ${formatNumberPL(d.taxAtThreshold)} + ${formatNumberPL(
      d.tax32,
    )} = ${formatNumberPL(d.totalPit)}\n`;
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

  // Sposób liczenia 6 miesięcy ulgi na start (pełne miesiące kalendarzowe)
  const ZUS_ULGA_GUIDANCE_URL =
    "https://www.zus.pl/-/ulga-na-start-preferencyjna-podstawa-dzialalnosc-nieewidencjonowana-jakie-sa-warunki-uprawnienia-i-skutk-1";

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
      // w miesiącu wakacji składki są zwolnione: składniki = 0 (zgodnie z Σ);
      // zwolniona kwota podana w przypisie pod tabelą
      const shown = entry;
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
      schedule.employment
        ? "nie dotyczy — umowa o pracę ≥ minimalnego wynagrodzenia: brak obowiązkowych składek społecznych z działalności, ulga na start i mały ZUS nie są wykorzystywane"
        : schedule.startDate
          ? ZUS_PATH_LABELS[schedule.path]
          : "pełny ZUS przez cały rok (bez daty rozpoczęcia ulga na start i mały ZUS nie są stosowane)"
    }\n`;
    if (schedule.ulgaEnd) {
      text += `  Ulga na start (art. 18 Prawa przedsiębiorców, 6 pełnych miesięcy kalendarzowych${
        schedule.startDate.d !== 1
          ? " od miesiąca następującego po niepełnym miesiącu rozpoczęcia"
          : ", licząc miesiąc rozpoczęcia"
      }): do ${formatMonthYear(schedule.ulgaEnd)}\n`;
      text += `    (sposób liczenia wg ZUS: ${ZUS_ULGA_GUIDANCE_URL})\n`;
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
    const holidayEntry = schedule.months.find((entry) => entry.holiday);
    if (holidayEntry) {
      text += `wakac. = wakacje składkowe za ${formatMonthYear({
        y: schedule.year,
        m: holidayEntry.month,
      })}: składki zwolnione (0 zł w tabeli i w Σ); zwolniono ${formatNumberPL(
        holidayEntry.waived.total,
      )} (emerytalna ${formatAmountPL(holidayEntry.waived.pension)}, rentowe ${formatAmountPL(
        holidayEntry.waived.disability,
      )}, chorobowa ${formatAmountPL(holidayEntry.waived.sickness)}, wypadkowa ${formatAmountPL(
        holidayEntry.waived.accident,
      )}, FP+FS ${formatAmountPL(holidayEntry.waived.fpfs)}).\n`;
    }
    text += `Tryb: pełny = pełny ZUS, mały = mały ZUS (preferencyjny), ulga = ulga na start (brak ubezpieczeń społecznych), wakac. = wakacje składkowe, etat = umowa o pracę (bez składek społecznych z JDG), — = poza działalnością / składki wyłączone.\n\n`;

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
    let text = `${indent}Podział dochodu (udział dochodu kwalifikowanego IP BOX ${formatPercentPL(
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
    if (hasIpBox) extra += `Udział dochodu kwalifikowanego IP BOX: ${formatPercentPL(best.ipBoxCoeff)}\n`;
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
      ? `Udział dochodu kwalifikowanego IP BOX: ${formatPercentPL(best.ipBoxCoeff)}\n`
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
      const baseLine =
        rate.deduction > rate.rateRevenue
          ? `${indent}Podstawa: ${formatNumberPL(rate.rateRevenue)} − ${formatNumberPL(
              rate.deduction,
            )} < 0 → ${formatNumberPL(base)}\n`
          : `${indent}Podstawa: ${formatNumberPL(rate.rateRevenue)} − ${formatNumberPL(
              rate.deduction,
            )} = ${formatNumberPL(base)}\n`;
      return `${baseLine}${indent}Ryczałt: ${formatNumberPL(
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
    let text = `${indent}Odliczenie 50% składki zdrowotnej (art. 11 ust. 1a): ${formatNumberPL(
      best.healthDeduction,
    )}\n`;
    // 50% zdrowotnej ponad przychód nie da się odliczyć gdzie indziej
    // (art. 11 ust. 1a dotyczy tylko przychodu ryczałtowego; brak
    // odpowiednika w art. 26 ustawy o PIT)
    const unusedHealth = taxMath.round2(
      Math.max(best.healthDeduction - Math.max(best.revenueTotal, 0), 0),
    );
    if (unusedHealth > 0) {
      text += `${indent}  (przychód ${formatNumberPL(
        best.revenueTotal,
      )} pokrywa tylko część tego odliczenia; nieodliczone ${formatNumberPL(
        unusedHealth,
      )} przepada — art. 11 ust. 1a pozwala pomniejszyć wyłącznie przychód ryczałtowy, nie można tego przenieść na dochód ze skali)\n`;
    }
    if (best.socialFromRevenue > 0) {
      const capped =
        best.method === "ryczalt" &&
        best.socialFromRevenue < ctx.social &&
        best.socialFromScale > 0;
      text += `${indent}Odliczenie składek społecznych od przychodu (art. 11 ust. 1): ${formatNumberPL(
        best.socialFromRevenue,
      )}${
        capped
          ? ` (do wysokości przychodu pomniejszonego o 50% zdrowotnej: ${formatNumberPL(
              best.revenueTotal,
            )} − ${formatNumberPL(best.healthDeduction)})`
          : ""
      }\n`;
      text += `${indent}Odliczenia od przychodu razem: ${formatNumberPL(
        best.healthDeduction,
      )} + ${formatNumberPL(best.socialFromRevenue)} = ${formatNumberPL(
        best.totalDeduction,
      )}\n`;
    } else if (ctx.social > 0 && best.method === "ryczalt") {
      text += `${indent}Odliczenie składek społecznych od przychodu: 0,00 zł (przychód w całości pokryty odliczeniem 50% zdrowotnej)\n`;
    }
    const lost = taxMath.round2(
      ctx.social - best.socialFromRevenue - best.socialFromScale,
    );
    if (ctx.social > 0 && lost > 0) {
      text += `${indent}(nieodliczona nadwyżka składek ${formatNumberPL(lost)} przepada)\n`;
    }
    text += getPit28NoteText(evaluation, indent);
    return text;
  }

  /* Praktyczna wskazówka do zeznań: ile składek społecznych wpisać w PIT-28,
     a ile odliczyć w PIT-36/PIT-37 (art. 26 ust. 13a ustawy o PIT). */
  function getPit28NoteText(evaluation, indent) {
    const { ctx, best } = evaluation;
    if (!ctx.zusEnabled || ctx.social <= 0 || best.socialFromScale <= 0) {
      return "";
    }
    return `${indent}W zeznaniach: w PIT-28 (część E.1, „Składki na ubezpieczenia społeczne”) wpisz ${formatNumberPL(
      best.socialFromRevenue,
    )}${
      best.socialFromRevenue < ctx.social ? " — mniej niż zapłacone składki" : ""
    }; pozostałe ${formatNumberPL(
      best.socialFromScale,
    )} odlicz od dochodu ze skali w PIT-36/PIT-37 (art. 26 ust. 1 pkt 2 i ust. 13a ustawy o PIT: składki nieodliczone od przychodu ryczałtowego).\n`;
  }

  function getRyczaltOtherIncomeLines(evaluation, indent) {
    const { ctx, best } = evaluation;
    if (ctx.otherIncome <= 0) return "";
    let text = `\n${indent}Inne dochody (skala, rozliczane osobno):\n`;
    text += `${indent}  Dochód: ${formatNumberPL(ctx.otherIncome)}${
      best.socialFromScale > 0
        ? ` − składki społeczne (art. 26 ust. 1 pkt 2${
            best.method === "ryczalt"
              ? " i ust. 13a — nadwyżka ponad przychód pomniejszony o 50% zdrowotnej"
              : ""
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
        ? `; składki społeczne: ${getSocialMethodLabel(evaluation)}`
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
        ? ` (składki społeczne: ${getSocialMethodLabel(evaluation)})`
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
      notes.push(`składki: ${getSocialMethodLabel(evaluation)}`);
    }
    if (evaluation.holidayMonth) {
      notes.push(`wakacje: ${ROMAN_MONTHS[evaluation.holidayMonth - 1]}`);
    }
    return `  ${label}: ${formatPLN(evaluation.total)}${
      notes.length ? `  [${notes.join("; ")}]` : ""
    }\n`;
  }

  function formatDateTimePL(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}, ${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  }

  const INVALID_EXPORT_TEXT =
    "Wyniki nie są dostępne: popraw zaznaczone pola formularza (błędne kwoty lub daty), aby zobaczyć obliczenia.";

  /* Wszystkie dane wejściowe w jednym bloku (eksport dla doradcy). */
  function getInputsSectionText(result) {
    const { inputs, ctx, schedule } = result;
    const zus = inputs.zus;
    const yesNo = (value) => (value ? "tak" : "nie");
    let text = `=== DANE WEJŚCIOWE ===\n`;
    text += `Przychód roczny: ${formatNumberPL(inputs.revenue)}\n`;
    text += `Koszty roczne (bez składek ZUS): ${formatNumberPL(inputs.costs)}\n`;
    text += `Dochód z działalności (przed składkami ZUS): ${formatNumberPL(ctx.income)}\n`;
    text += `Inne dochody opodatkowane skalą: ${formatNumberPL(ctx.otherIncome)}\n`;
    text += `Wspólne rozliczenie z małżonkiem: ${
      inputs.jointTaxation
        ? `tak (dochód małżonka ${formatNumberPL(inputs.spouseIncome)})`
        : "nie"
    }\n`;
    text += `IP BOX: ${
      inputs.ipBoxEnabled
        ? `tak — udział dochodu kwalifikowanego ${formatPercentPL(inputs.ipBoxCoeff)}`
        : "nie"
    }\n`;
    const rateIds = getCheckedRateIds();
    if (!rateIds.length) {
      text += `Ryczałt: nie wybrano stawek\n`;
    } else if (inputs.isMultipleRates) {
      text += `Ryczałt (tryb „Wiele stawek”): ${rateIds
        .map(
          (id) =>
            `${RYCZALT_RATE_LABELS[id]} — ${formatNumberPL(
              inputs.allocatedRevenues[id] || 0,
            )}`,
        )
        .join("; ")}\n`;
    } else {
      text += `Ryczałt — porównywane stawki: ${rateIds
        .map((id) => RYCZALT_RATE_LABELS[id])
        .join(", ")}\n`;
    }
    text += `Składki społeczne ZUS: ${
      zus.enabled ? "uwzględniane" : "nieuwzględniane"
    }\n`;
    text += `Data rozpoczęcia działalności: ${
      schedule.startDate
        ? formatDatePL(schedule.startDate)
        : "brak (działalność przed 2026 r.)"
    }\n`;
    if (zus.enabled) {
      const pathLabels = {
        full: "pełny ZUS",
        ulga: "ulga na start → mały ZUS",
        pref: "mały ZUS (bez ulgi)",
      };
      text += `Ścieżka składek (wybrana): ${pathLabels[zus.path] || zus.path}${
        !schedule.startDate && zus.path !== "full"
          ? " — nie stosowana bez daty rozpoczęcia (pełny ZUS)"
          : schedule.employment && zus.path !== "full"
            ? " — nie stosowana przy umowie o pracę"
            : ""
      }\n`;
      text += `Składka chorobowa: ${yesNo(zus.sickness)}; umowa o pracę ≥ minimalnego: ${yesNo(
        zus.employment,
      )}; wakacje składkowe: ${yesNo(zus.holiday)}\n`;
      text += `Data urodzenia / płeć: ${
        zus.birthDate ? formatDatePL(taxMath.parseISODate(zus.birthDate)) : "brak"
      } / ${zus.sex === "K" ? "kobieta" : zus.sex === "M" ? "mężczyzna" : "brak"}\n`;
    }
    return text;
  }

  /* Ranking – ta sama lista co w karcie „Najniższe obciążenie”. */
  function getRankingSectionText(result) {
    const ranking = buildRanking(result);
    let text = `\n${SEPARATOR_LINE}\n=== RANKING (od najniższego obciążenia) ===\n${SEPARATOR_LINE}\n\n`;
    if (!ranking.entries.length || !ranking.meaningful) {
      text += `Brak wariantów do porównania (wprowadź przychód).\n`;
    } else {
      const best = ranking.entries[0];
      ranking.entries.forEach((entry, index) => {
        const diff = taxMath.round2(entry.total - best.total);
        text += `${String(index + 1).padStart(2)}. ${entry.label}: ${formatPLN(
          entry.total,
        )}${
          index === 0
            ? "  ← najniższe"
            : diff > 0
              ? `  (+${formatPLN(diff)})`
              : "  (ex aequo)"
        }\n`;
        const evaluation = result.variants[entry.id];
        if (evaluation) text += `    ${getVariantDetailText(evaluation)}\n`;
      });
    }
    ranking.excluded.forEach((item) => {
      text += `Uwaga: ${item.reason}\n`;
      if (ranking.allocation) {
        const warning = getAllocationWarningText(ranking.allocation);
        if (warning) text += `  ${warning}\n`;
      }
    });
    text += `(kwoty w zł: PIT/ryczałt z daniną + składka zdrowotna${
      result.ctx.zusEnabled ? " + składki społeczne ZUS z FP/FS" : ""
    }; obciążenie przypisane działalności)\n`;
    return text;
  }

  function getFormattedValues() {
    if (!validateAllInputs().valid) return INVALID_EXPORT_TEXT;
    const result = computeFromForm();
    const { inputs, ctx, variants } = result;
    const ipBoxOn = inputs.ipBoxEnabled;
    const isJoint = inputs.jointTaxation;
    const isMultipleRates = inputs.isMultipleRates;
    const visibleRateIds = getCheckedRateIds();

    let text = `KALKULATOR PODATKOWY 2026 — obliczenia dla JDG\n`;
    text += `Data sporządzenia: ${formatDateTimePL(new Date())}\n`;
    text += `Stan prawny na ${LEGAL_STATUS_DATE} (rok podatkowy 2026)\n\n`;
    text += getInputsSectionText(result);
    text += getRankingSectionText(result);

    text += `\n${SEPARATOR_LINE}\n=== ZAKRES I ZAŁOŻENIA ===\n${SEPARATOR_LINE}\n\n`;
    text += `Kwoty obejmują PIT (skala / liniowy / ryczałt, z daniną\n`;
    text += `solidarnościową), składkę zdrowotną podatnika${
      ctx.zusEnabled ? `\noraz składki społeczne ZUS (z FP/FS) za 2026 r.` : `.\nSkładki społeczne ZUS nie są uwzględniane (przełącznik wyłączony).`
    }\n`;
    text += `Dla każdego wariantu kalkulator porównuje legalne sposoby odliczenia\n`;
    text += `składek społecznych i wybiera najtańszy (porównanie w szczegółach).\n`;
    text += `Kwoty liczone z dokładnością do grosza — podstawy i podatek nie są\n`;
    text += `zaokrąglane do pełnych złotych (art. 63 § 1 Ordynacji podatkowej);\n`;
    text += `różnice względem zeznania rzędu 1 zł (uproszczenie).\n`;
    if (ipBoxOn) {
      text += `IP BOX: dochód kwalifikowany (5%, art. 30ca) nie wchodzi do podstawy\n`;
      text += `daniny (art. 30h ust. 2 – zamknięty katalog; art. 30c ust. 6).\n`;
    }
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
          )} (część ryczałtu — sam podatek od tej stawki)\n`;
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
    lastFocusedBeforeModal = document.activeElement;
    DOM.copyModal.hidden = false;
    DOM.copyModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
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
    setBackgroundInert(false);
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

  /* Pułapka fokusu w otwartym oknie: Tab / Shift+Tab krążą po jego
     elementach (tło jest dodatkowo inert). */
  function getOpenModal() {
    return [DOM.copyModal, DOM.infoModal].find(
      (modal) => modal && !modal.hidden && modal.classList.contains("open"),
    );
  }

  function trapFocus(e) {
    const modal = getOpenModal();
    if (!modal || e.key !== "Tab") return;
    const focusables = Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!modal.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* Tło okna modalnego wyłączone z nawigacji (inert) na czas otwarcia. */
  const MODAL_BACKGROUND = [
    document.querySelector(".skip-link"),
    document.querySelector(".topbar"),
    document.getElementById("main"),
    document.getElementById("mobileJump"),
  ].filter(Boolean);

  function setBackgroundInert(inert) {
    MODAL_BACKGROUND.forEach((element) => {
      if (inert) {
        element.setAttribute("inert", "");
        element.setAttribute("data-modal-inert", "");
      } else {
        element.removeAttribute("inert");
        element.removeAttribute("data-modal-inert");
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    trapFocus(e);
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

  /* Typografia polska w tekstach okna: twarda spacja w grupach cyfr,
     przed jednostkami (zł, tys., lat…) i po jednoliterowych spójnikach. */
  function typographyPL(text) {
    return String(text)
      .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NBSP}`)
      .replace(/(\d) (?=(zł|tys\.|mln|lat|mies\.|dni|%)(?![\p{L}]))/gu, `$1${NBSP}`)
      .replace(/(^|[\s(„])([aiouwzAIOUWZ]) /g, `$1$2${NBSP}`);
  }

  function createInfoSection(title, items, id) {
    const section = document.createElement("section");
    section.className = "info-section";
    if (id) section.id = id;

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
      if (item.source) {
        const source = document.createElement("span");
        source.className = "info-list-source";
        source.textContent = `Źródło: ${item.source}`;
        dt.appendChild(source);
      }

      const dd = document.createElement("dd");
      dd.textContent = typographyPL(item.value);

      list.appendChild(dt);
      list.appendChild(dd);
    });

    section.appendChild(list);
    return section;
  }

  /* paragraphs: tekst albo { id, text } – id to kotwica tematu, do której
     prowadzą linki „Więcej →” z dymków i uwag przy wynikach. */
  function createInfoTextSection(title, paragraphs, id) {
    const section = document.createElement("section");
    section.className = "info-section";
    if (id) section.id = id;

    const heading = document.createElement("h4");
    heading.textContent = title;
    section.appendChild(heading);

    paragraphs.forEach((entry) => {
      const p = document.createElement("p");
      p.className = "info-section-text";
      if (entry && typeof entry === "object") p.id = entry.id;
      const paragraph = typographyPL(
        entry && typeof entry === "object" ? entry.text : entry,
      );
      // adresy URL jako klikalne odnośniki (reszta jako zwykły tekst)
      paragraph.split(/(https:\/\/\S+?)(?=[\s)]|$)/).forEach((part) => {
        if (/^https:\/\//.test(part)) {
          const link = document.createElement("a");
          link.href = part;
          link.textContent = part;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          p.appendChild(link);
        } else if (part) {
          p.appendChild(document.createTextNode(part));
        }
      });
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
          label: "Rok podatkowy",
          value: "2026 (1.01–31.12.2026)",
        },
        {
          label:
            "Stawki składki zdrowotnej (skala, liniowy, IP BOX) — rok składkowy od 1.02.2026, stosowany do całego 2026 r.; ryczałt — rok kalendarzowy",
          source: "art. 81 ust. 1a i 2e u.ś.o.z.",
          value: formatDatePL(taxMath.parseISODate(TAX_CONSTANTS.EFFECTIVE_FROM)),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Zakres wyniku", [
        "Każdy wariant pokazuje roczne obciążenie za 2026 r.: PIT (ryczałt, IP BOX) z daniną solidarnościową + składka zdrowotna z działalności + składki społeczne ZUS z Funduszem Pracy i Funduszem Solidarnościowym (gdy przełącznik „Uwzględnij składki społeczne” jest włączony).",
        { id: "info-scope-other", text: "Przy innych dochodach opodatkowanych skalą wynik to obciążenie przypisane działalności: łączne podatki podatnika (z innymi dochodami) minus PIT i danina, które zapłaciłby od samych innych dochodów, rozliczając je indywidualnie wg skali. Składka zdrowotna od etatu jest poza zakresem (pobiera ją pracodawca). Przy rozliczeniu wspólnym odejmujemy też PIT, który małżonek zapłaciłby sam wg skali (zob. „Rozliczenie wspólne z małżonkiem”)." },
        { id: "info-rounding", text: "Uproszczenie: kwoty liczone z dokładnością do grosza — podstawy opodatkowania i podatek nie są zaokrąglane do pełnych złotych, jak wymaga art. 63 § 1 Ordynacji podatkowej; różnice względem zeznania rzędu 1 zł. Zaokrąglenie do grosza „połówka w górę”. Pełne obliczenia z podstawami prawnymi: „Pokaż szczegółowe obliczenia” i „Eksport”." },
        { id: "info-scale-formula", text: "PIT wg skali liczony wzorem z art. 27 ust. 1 ustawy o PIT: do 120 000 zł — 12% podstawy minus kwota zmniejszająca podatek 3 600 zł; powyżej — 10 800 zł + 32% nadwyżki ponad 120 000 zł." },
      ],
      "info-scope"),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Rozliczenie wspólne z małżonkiem", [
        "PIT przy rozliczeniu wspólnym jest wspólny dla pary: 2 × PIT od połowy sumy dochodów (art. 6 ust. 2 ustawy o PIT). Pozostałe warianty (skala indywidualnie, liniowy, ryczałt) obejmują tylko podatnika.",
        "Aby kwoty były porównywalne, wariant „wspólnie z małżonkiem” pokazuje: PIT wspólny pary − PIT, który małżonek zapłaciłby sam wg skali = różnica przypisana podatnikowi. Do tego doliczana jest Twoja danina solidarnościowa, Twoja składka zdrowotna i Twoje składki ZUS. Dochód podatnika do wspólnej sumy to jego dochód ze skali (działalność i inne dochody) po odliczeniu składek, nie mniej niż zero — strata z działalności nie pomniejsza dochodu małżonka (art. 9 ust. 2–3).",
        "Danina solidarnościowa małżonka, jego składka zdrowotna i ZUS nie są wliczane — małżonek płaci je niezależnie od formy rozliczenia. Wynik może być ujemny, gdy wspólne rozliczenie obniża podatek małżonka bardziej, niż wynosi Twój podatek. Rozliczenie wspólne jest możliwe tylko przy skali (także z IP BOX); małżonek nie może być na liniowym ani ryczałcie od działalności (art. 6 ust. 8).",
      ],
      "info-joint"),
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
          source: "M.P. 2025 poz. 1206; ustawa budżetowa na 2026 r. (Dz.U. 2026 poz. 62), art. 24",
          value: formatPLN(TAX_CONSTANTS.ZUS_FORECAST_AVG_SALARY),
        },
        {
          label: "Podstawa pełnego ZUS (60% prognozowanego wynagrodzenia)",
          source: "art. 18 ust. 8 u.s.u.s. (Dz.U. 2026 poz. 199)",
          value: formatPLN(TAX_CONSTANTS.ZUS_FULL_BASE),
        },
        {
          label: "Podstawa małego ZUS (30% minimalnego wynagrodzenia)",
          source: "art. 18a ust. 1 u.s.u.s.",
          value: formatPLN(TAX_CONSTANTS.ZUS_PREF_BASE),
        },
        {
          label: "Składka emerytalna",
          source: "art. 22 ust. 1 pkt 1 u.s.u.s.",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_PENSION),
        },
        {
          label: "Składki rentowe",
          source: "art. 22 ust. 1 pkt 2 u.s.u.s.",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_DISABILITY),
        },
        {
          label: "Składka chorobowa (dobrowolna)",
          source: "art. 22 ust. 1 pkt 3 u.s.u.s.; art. 11 ust. 2 (dobrowolna)",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_SICKNESS),
        },
        {
          label: "Składka wypadkowa (płatnik do 9 ubezpieczonych)",
          source: "art. 28 ust. 1 ustawy o ubezpieczeniu społecznym z tytułu wypadków przy pracy",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_ACCIDENT),
        },
        {
          label: "Fundusz Pracy",
          source: "art. 259–261 ustawy o rynku pracy (Dz.U. 2025 poz. 620); Dz.U. 2026 poz. 62, art. 25",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_FP),
        },
        {
          label: "Fundusz Solidarnościowy",
          source: "ustawa budżetowa na 2026 r. (Dz.U. 2026 poz. 62), art. 26",
          value: formatPercentPL(TAX_CONSTANTS.ZUS_RATE_FS),
        },
        {
          label: "Ulga na start (miesiące)",
          source: "art. 18 ust. 1 Prawa przedsiębiorców (Dz.U. 2025 poz. 1480)",
          value: String(TAX_CONSTANTS.ZUS_ULGA_MONTHS),
        },
        {
          label: "Mały ZUS (miesiące kalendarzowe)",
          source: "art. 18a ust. 1 i art. 18aa ust. 3 u.s.u.s.",
          value: String(TAX_CONSTANTS.ZUS_PREF_MONTHS),
        },
        {
          label: "Zwolnienie z FP/FS – wiek kobiety / mężczyźni",
          source: "art. 261 ustawy o rynku pracy",
          value: `${TAX_CONSTANTS.ZUS_FP_EXEMPT_AGE_WOMEN} / ${TAX_CONSTANTS.ZUS_FP_EXEMPT_AGE_MEN} lat`,
        },
        {
          label: "Pełny ZUS z chorobową i FP/FS (miesięcznie)",
          source: "wyliczenie: podstawa × stopy, każda składka zaokrąglona do grosza",
          value: formatPLN(fullMonth.total),
        },
        {
          label: "  w tym FP + FS",
          value: formatPLN(fullMonth.fpfs),
        },
        {
          label: "Mały ZUS z chorobową (miesięcznie, bez FP/FS)",
          source: "wyliczenie: podstawa × stopy, każda składka zaokrąglona do grosza",
          value: formatPLN(prefMonth.total),
        },
      ],
      "info-zus-params"),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Składki społeczne ZUS – zasady i założenia", [
        { id: "info-zus-schedule", text: "Harmonogram liczony miesiąc po miesiącu dla 2026 r. Puste pole daty rozpoczęcia oznacza działalność prowadzoną przed 2026 r. i przez cały rok: pełny ZUS od stycznia i 12 miesięcy składki zdrowotnej. Data sprzed 2026 r. służy do ustalenia, ile ulgi na start lub małego ZUS przypada na 2026 r." },
        { id: "info-zus-ulga", text: "Ulga na start (art. 18 Prawa przedsiębiorców): 6 miesięcy bez składek społecznych, liczonych jak ZUS — w pełnych miesiącach kalendarzowych. Start 1. dnia miesiąca — ten miesiąc jest pierwszym z sześciu; start w trakcie miesiąca — niepełny miesiąc jest wolny od składek i do tego 6 pełnych miesięcy (np. start 7.05 → ulga do 30.11). Źródło: https://www.zus.pl/-/ulga-na-start-preferencyjna-podstawa-dzialalnosc-nieewidencjonowana-jakie-sa-warunki-uprawnienia-i-skutk-1 (sekcja „Jak liczyć okres 6 miesięcy?”). Potem mały ZUS przez 24 pełne miesiące kalendarzowe (art. 18aa ust. 3 u.s.u.s.), potem pełny ZUS. Warunków skorzystania z ulgi i małego ZUS (pierwsza działalność albo 60 miesięcy przerwy, nie na rzecz byłego pracodawcy) kalkulator nie sprawdza." },
        { id: "info-zus-pref", text: "Mały ZUS bez ulgi (art. 18a u.s.u.s.): od dnia rozpoczęcia — niepełny pierwszy miesiąc i 24 pełne miesiące kalendarzowe (przy starcie 1. dnia miesiąca: 24 miesiące od miesiąca startu). „Mały ZUS” oznacza preferencyjne składki od 30% minimalnego wynagrodzenia, nie Mały ZUS Plus (art. 18c), który nie jest modelowany." },
        { id: "info-zus-partial", text: "Niepełny pierwszy miesiąc (pełny lub mały ZUS bez ulgi): podstawa × dni podlegania / liczba dni miesiąca (art. 18 ust. 9 u.s.u.s.). Każda składka jest zaokrąglana osobno do grosza, FP i FS łącznie (2,45%), jak w deklaracji ZUS DRA. Przyjmujemy najniższe podstawy, stopę wypadkowej 1,67% i brak innych tytułów do ubezpieczeń." },
        { id: "info-zus-fp", text: "Fundusz Pracy i Fundusz Solidarnościowy są należne tylko przy podstawie co najmniej równej minimalnemu wynagrodzeniu, czyli na pełnym ZUS — także za niepełny pierwszy miesiąc, od podstawy proporcjonalnej (poradnik ZUS: za każdy miesiąc podlegania, choćby przez jeden dzień). Zwolnienie ze względu na wiek (kobiety 55, mężczyźni 60 lat; art. 261 ustawy o rynku pracy) obowiązuje od miesiąca po miesiącu urodzin, a przy urodzinach 1. dnia miesiąca — od tego miesiąca. Bez daty urodzenia i płci FP i FS są należne." },
        {
          id: "info-zus-sickness",
          text: "Składka chorobowa jest dla przedsiębiorcy dobrowolna (art. 11 ust. 2 u.s.u.s.): 2,45% podstawy (art. 22 ust. 1 pkt 3). Zasiłek chorobowy przysługuje po 90 dniach nieprzerwanego ubezpieczenia. W uldze na start nie ma ubezpieczeń społecznych, więc nie ma też chorobowej; przełącznik dotyczy miesięcy na małym i pełnym ZUS.",
        },
        { id: "info-zus-employment", text: "Umowa o pracę z wynagrodzeniem co najmniej minimalnym (4 806 zł) przez cały rok: z działalności nie ma obowiązkowych ubezpieczeń społecznych (art. 9 ust. 1 i 1a u.s.u.s.); dobrowolnych składek nie doliczamy, składka zdrowotna z działalności jest należna. Zbieg z umową zlecenia i etat poniżej minimalnego wynagrodzenia nie są modelowane — w takim przypadku nie zaznaczaj tej opcji." },
        { id: "info-zus-holiday", text: "Wakacje składkowe (art. 17a–17b u.s.u.s.): jeden miesiąc w roku bez składek społecznych i FP/FS (budżet opłaca je od najniższej podstawy); składka zdrowotna jest płatna. Kalkulator sprawdza termin: wniosek RWS składa się w miesiącu poprzedzającym zwolnienie, a w miesiącu przed wnioskiem trzeba podlegać ubezpieczeniom — więc zwolnienie najwcześniej za 2. miesiąc po pierwszym miesiącu podlegania (także niepełnym); nie w uldze na start i nie przy umowie o pracę. Pozostałe warunki (do 10 ubezpieczonych, przychód do 2 mln euro, wolny limit de minimis, nie dla byłego pracodawcy) zakładamy jako spełnione. Miesiąc jest wybierany osobno dla każdego wariantu — ten, przy którym obciążenie jest najniższe (łącznie z rezygnacją, gdy wakacje się nie opłacają). Niezapłaconych składek nie odlicza się." },
        { id: "info-zus-cash", text: "Założenie kasowe: składki społeczne i zdrowotne należne za 2026 r. traktujemy jako zapłacone i odliczone w 2026 r. (w praktyce składkę za grudzień płaconą w styczniu odlicza się w roku zapłaty, a roczne rozliczenie zdrowotnej przypada na 2027 r.)." },
      ],
      "info-zus-rules"),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Odliczanie składek społecznych – wybór sposobu", [
        { id: "info-deduction-choice", text: "W każdym wariancie kalkulator liczy obciążenie przy każdym legalnym sposobie odliczenia składek na ubezpieczenia emerytalne, rentowe, chorobowe i wypadkowe i wybiera najniższe (przy równym wyniku — pierwszy z listy). Wszystkie sposoby z kwotami widać w szczegółach obliczeń." },
        "Skala (także wspólnie i z IP BOX): od dochodu (art. 26 ust. 1 pkt 2 ustawy o PIT — od łącznego dochodu ze skali, również z etatu) albo w kosztach działalności. Strata z działalności nie pomniejsza innych dochodów w tym samym roku (jej rozliczenia w kolejnych latach kalkulator nie liczy). Przy rozliczeniu wspólnym składki pomniejszają tylko dochód podatnika.",
        "Liniowy: w kosztach, od dochodu z działalności (art. 30c ust. 2 pkt 1) albo od innych dochodów ze skali (art. 26 ust. 1 pkt 2 i ust. 13a).",
        { id: "info-deduction-ryczalt", text: "Ryczałt: od przychodu (art. 11 ust. 1 ustawy o ryczałcie) albo od innych dochodów ze skali. Przy odliczeniu od przychodu najpierw odliczamy 50% składki zdrowotnej (art. 11 ust. 1a — tego odliczenia nie można przenieść na skalę), a składki społeczne tylko do wysokości pozostałego przychodu; nadwyżkę składek odliczamy od dochodu ze skali (art. 26 ust. 13a). Przychód do progów składki zdrowotnej (60 000 / 300 000 zł) pomniejszamy o składki nieodliczone od dochodu na podstawie ustawy o PIT, czyli odliczone od przychodu albo nieodliczone nigdzie (art. 81 ust. 2g u.ś.o.z., wykładnia literalna). Dlatego przy przychodzie blisko progu sposób odliczenia może zmienić składkę zdrowotną." },
        { id: "info-ipbox", text: "IP BOX: składki społeczne mogą być kosztem — wtedy, jak inne koszty, proporcjonalnie pomniejszają także dochód kwalifikowany — albo mogą być odliczane od dochodu opodatkowanego skalą lub liniowo; od dochodu opodatkowanego stawką 5% nic się nie odlicza (art. 30ca). FP i FS jako koszt dzielimy proporcjonalnie wg udziału dochodu kwalifikowanego; udział stosujemy do dochodu po tych kosztach. Składkę zdrowotną przy liniowym z IP BOX odliczamy (do limitu) wyłącznie od dochodu opodatkowanego liniowo, nie od dochodu kwalifikowanego — to przyjęte założenie." },
        "„Udział dochodu kwalifikowanego IP BOX” to część dochodu z działalności opodatkowana stawką 5% (po zastosowaniu wskaźnika nexus) — kalkulator nie liczy samego wskaźnika nexus.",
        "FP i FS nie są składkami na ubezpieczenia społeczne: na skali i liniowym są kosztem, na ryczałcie nie odlicza się ich wcale. Składek nie dzielimy między sposoby odliczenia (wyjątek: nadwyżka ponad przychód ryczałtowy); nieodliczona nadwyżka przepada.",
      ],
      "info-deduction"),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Składka zdrowotna – zasady", [
        "Składka zdrowotna jest należna od miesiąca rozpoczęcia działalności, także w uldze na start, w pełnej kwocie za niepełny miesiąc (art. 79 ust. 2 u.ś.o.z.: składka miesięczna i niepodzielna). Data rozpoczęcia wpływa na liczbę miesięcy również przy wyłączonych składkach społecznych.",
        "Skala i liniowy: podstawa to dochód z działalności pomniejszony o FP/FS (koszt) i składki społeczne (art. 81 ust. 2) — niezależnie od tego, gdzie składki są odliczane; minimum: liczba miesięcy × 432,54 zł (art. 81 ust. 2b, art. 79a). Kwotę 432,54 zł stosujemy także za styczeń 2026 (formalnie ostatni miesiąc roku składkowego 2025/26 z minimum 314,96 zł).",
        { id: "info-health-linear", text: "Liniowy: zapłaconą składkę odliczamy od dochodu z działalności do 14 100 zł rocznie; limit jest roczny i nie podlega proporcji przy niepełnym roku (art. 30c ust. 2 pkt 2: „nie może przekroczyć w roku podatkowym”). Zaliczenie zdrowotnej do kosztów nie obniża w kalkulatorze jej własnej podstawy (brak potwierdzenia ZUS/MF — podejście ostrożne)." },
        { id: "info-health-ryczalt", text: "Ryczałt: kwota miesięczna wg progu rocznego przychodu × liczba miesięcy; progi 60 000 / 300 000 zł są kwotowe, bez proporcji przy niepełnym roku (art. 81 ust. 2e). 50% zapłaconej składki odliczamy od przychodu, przy kilku stawkach proporcjonalnie (art. 11 ust. 1a i ust. 3 ustawy o ryczałcie). W trybie „Wiele stawek” próg i proporcje liczymy od całego przychodu z działalności." },
        "IP BOX: podstawa obejmuje cały dochód z działalności (także kwalifikowany); stawka 9% przy skali, 4,9% przy liniowym.",
      ],
      "info-health"),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Danina solidarnościowa", [
        "4% nadwyżki ponad 1 000 000 zł sumy dochodów opodatkowanych wg skali (art. 27) i liniowo (art. 30c), po odliczeniu składek społecznych (art. 26 ust. 1 pkt 2) i składki zdrowotnej odliczonej przy liniowym (art. 30c ust. 2 pkt 2) — art. 30h ust. 1–2 ustawy o PIT. Przy rozliczeniu wspólnym liczona odrębnie dla każdego z małżonków.",
        "Dochód kwalifikowany IP BOX (5%, art. 30ca) nie wchodzi do podstawy daniny: art. 30h ust. 2 zawiera zamknięty katalog dochodów (art. 27, 30b, 30c, 30f), a art. 30c ust. 6 nie łączy dochodów z art. 30ca z innymi. Tak też interpretacja indywidualna KIS 0112-KDIL2-1.4011.110.2019.1.AMN z 14.02.2020. Przychody z ryczałtu również są poza podstawą.",
      ],
      "info-levy"),
    );

    DOM.infoModalContent.appendChild(
      createInfoTextSection("Inne dochody opodatkowane skalą", [
        "Wpisz roczny dochód z innych źródeł opodatkowanych skalą (np. etat, zlecenie): przychód − koszty uzyskania − składki społeczne pobrane przez płatnika, przed podatkiem (jak w PIT-11). Przy uldze dla młodych wpisz tylko część opodatkowaną.",
        "Na skali dochody te sumują się z dochodem z działalności; przy liniowym, ryczałcie i IP BOX z liniowym są opodatkowane skalą osobno. Wchodzą też do podstawy daniny solidarnościowej (art. 30h ust. 2).",
        "Od łącznych podatków odejmujemy PIT i daninę, które zapłaciłbyś od samych innych dochodów (indywidualnie wg skali) — różnica to obciążenie przypisane działalności, porównywalne między wariantami.",
      ],
      "info-other-income"),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Wartości bazowe", [
        {
          label: "Minimalne wynagrodzenie (miesięcznie)",
          source: "rozporządzenie RM, Dz.U. 2025 poz. 1242",
          value: formatPLN(TAX_CONSTANTS.MIN_WAGE),
        },
        {
          label:
            "Przeciętne wynagrodzenie w IV kw. roku poprzedniego (miesięcznie)",
          source: "komunikat Prezesa GUS, M.P. 2026 poz. 117",
          value: formatPLN(TAX_CONSTANTS.AVG_SALARY_Q4_PREV),
        },
        {
          label: "Limit odliczenia składki zdrowotnej (liniowy, rocznie)",
          source: "art. 30c ust. 2 pkt 2 ustawy o PIT; M.P. 2025 poz. 1274",
          value: formatPLN(TAX_CONSTANTS.LINEAR_HEALTH_DEDUCTION_LIMIT),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Skala podatkowa", [
        {
          label: "Kwota wolna od podatku",
          source: "art. 27 ust. 1 ustawy o PIT (Dz.U. 2026 poz. 592)",
          value: formatPLN(TAX_CONSTANTS.TAX_FREE_AMOUNT),
        },
        {
          label: "Próg I progu podatkowego",
          source: "art. 27 ust. 1 ustawy o PIT",
          value: formatPLN(TAX_CONSTANTS.TAX_THRESHOLD_12),
        },
        {
          label: "Próg daniny solidarnościowej",
          source: "art. 30h ust. 2 ustawy o PIT",
          value: formatPLN(TAX_CONSTANTS.SOLIDARITY_THRESHOLD),
        },
        {
          label: "Stawka PIT I progu",
          source: "art. 27 ust. 1 ustawy o PIT",
          value: formatPercentPL(TAX_CONSTANTS.PIT_RATE_12),
        },
        {
          label: "Stawka PIT II progu",
          source: "art. 27 ust. 1 ustawy o PIT",
          value: formatPercentPL(TAX_CONSTANTS.PIT_RATE_32),
        },
        {
          label: "Danina solidarnościowa",
          source: "art. 30h ust. 1 ustawy o PIT",
          value: formatPercentPL(TAX_CONSTANTS.SOLIDARITY_RATE),
        },
        {
          label: "Kwota zmniejszająca podatek",
          source: "art. 27 ust. 1 ustawy o PIT",
          value: formatPLN(TAX_CONSTANTS.TAX_DECREASING_AMOUNT),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Podatek liniowy i IP BOX", [
        {
          label: "Stawka podatku liniowego",
          source: "art. 30c ust. 1 ustawy o PIT",
          value: formatPercentPL(TAX_CONSTANTS.LINEAR_PIT_RATE),
        },
        {
          label: "Stawka IP BOX",
          source: "art. 30ca ust. 1 ustawy o PIT",
          value: formatPercentPL(TAX_CONSTANTS.IP_BOX_RATE),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Składka zdrowotna – stawki", [
        {
          label: "Skala podatkowa",
          source: "art. 79 ust. 1 u.ś.o.z. (Dz.U. 2025 poz. 1461)",
          value: formatPercentPL(TAX_CONSTANTS.HEALTH_RATE_SCALE),
        },
        {
          label: "Podatek liniowy",
          source: "art. 79a u.ś.o.z.",
          value: formatPercentPL(TAX_CONSTANTS.HEALTH_RATE_LINEAR),
        },
        {
          label: "Ryczałt",
          source: "art. 79 ust. 1 i art. 81 ust. 2e u.ś.o.z.",
          value: formatPercentPL(TAX_CONSTANTS.HEALTH_RATE_RYCZALT),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Ryczałt – progi i mnożniki", [
        {
          label: "Próg niski przychodu",
          source: "art. 81 ust. 2e pkt 1 u.ś.o.z.",
          value: formatPLN(TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_LOW),
        },
        {
          label: "Próg wysoki przychodu",
          source: "art. 81 ust. 2e pkt 2–3 u.ś.o.z.",
          value: formatPLN(TAX_CONSTANTS.RYCZALT_REVENUE_THRESHOLD_HIGH),
        },
        {
          label: "Mnożnik podstawy (przychód ≤ próg niski)",
          source: "art. 81 ust. 2e pkt 1 u.ś.o.z.",
          value: formatMultiplierPL(TAX_CONSTANTS.RYCZALT_BASE_MULT_LOW),
        },
        {
          label: "Mnożnik podstawy (próg niski < przychód ≤ próg wysoki)",
          source: "art. 81 ust. 2e pkt 2 u.ś.o.z.",
          value: formatMultiplierPL(TAX_CONSTANTS.RYCZALT_BASE_MULT_MID),
        },
        {
          label: "Mnożnik podstawy (przychód > próg wysoki)",
          source: "art. 81 ust. 2e pkt 3 u.ś.o.z.",
          value: formatMultiplierPL(TAX_CONSTANTS.RYCZALT_BASE_MULT_HIGH),
        },
        {
          label: "Odliczenie składki zdrowotnej od przychodu",
          source: "art. 11 ust. 1a ustawy o ryczałcie (Dz.U. 2025 poz. 843)",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_HEALTH_DEDUCTION_FACTOR),
        },
        {
          label: "Próg stawki 8,5% / 12,5%",
          source: "art. 12 ust. 1 pkt 4 lit. a ustawy o ryczałcie",
          value: formatPLN(TAX_CONSTANTS.RYCZALT_8_5_THRESHOLD),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Stawki ryczałtu", [
        {
          label: "Ryczałt 2%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_2),
        },
        {
          label: "Ryczałt 3%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_3),
        },
        {
          label: "Ryczałt 5,5%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_5_5),
        },
        {
          label: "Ryczałt 8,5%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_8_5),
        },
        {
          label: "Ryczałt 10%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_10),
        },
        {
          label: "Ryczałt 12%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_12),
        },
        {
          label: "Ryczałt 12,5%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_12_5),
        },
        {
          label: "Ryczałt 14%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_14),
        },
        {
          label: "Ryczałt 15%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_15),
        },
        {
          label: "Ryczałt 17%",
          source: "art. 12 ust. 1 ustawy o ryczałcie",
          value: formatPercentPL(TAX_CONSTANTS.RYCZALT_RATE_17),
        },
      ]),
    );

    DOM.infoModalContent.appendChild(
      createInfoSection("Minimalna składka zdrowotna", [
        {
          label: "Minimalna składka zdrowotna (miesięcznie)",
          source: "9% × minimalne wynagrodzenie (art. 81 ust. 2b, art. 79a u.ś.o.z.)",
          value: formatPLN(taxMath.getMinHealthMonthly()),
        },
        {
          label: "Minimalna składka zdrowotna (rocznie, 12 mies.)",
          source: "liczba miesięcy × kwota miesięczna (art. 81 ust. 2b u.ś.o.z.)",
          value: formatPLN(taxMath.getMinHealthAnnual()),
        },
      ]),
    );

    const footnote = document.createElement("p");
    footnote.className = "info-modal-footnote";
    footnote.textContent = `Stan prawny na ${LEGAL_STATUS_DATE}. Akty: ustawa o PIT (Dz.U. 2026 poz. 592), ustawa o ryczałcie (Dz.U. 2025 poz. 843), u.ś.o.z. (Dz.U. 2025 poz. 1461), u.s.u.s. (Dz.U. 2026 poz. 199), Prawo przedsiębiorców (Dz.U. 2025 poz. 1480), ustawa o rynku pracy (Dz.U. 2025 poz. 620).`;
    DOM.infoModalContent.appendChild(footnote);

    infoModalBuilt = true;
  }

  /* topicId – kotwica tematu (np. „info-zus-holiday”): okno otwiera się
     przewinięte do niego, a temat jest na chwilę wyróżniony.
     returnFocus – element, na który wraca fokus po zamknięciu. */
  let infoTargetTimeout = null;

  function openInfoModal(topicId, returnFocus) {
    if (!DOM.infoModal || !DOM.infoModalContent) return;
    if (!infoModalBuilt) {
      buildInfoModalContent();
    }
    if (infoModalCloseTimeout) {
      clearTimeout(infoModalCloseTimeout);
      infoModalCloseTimeout = null;
    }
    lastFocusedBeforeInfoModal =
      returnFocus && returnFocus.focus ? returnFocus : document.activeElement;
    DOM.infoModal.hidden = false;
    DOM.infoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
    const closeBtn = DOM.infoModal.querySelector(".copy-modal-close");
    const body = DOM.infoModal.querySelector(".info-modal-body");
    const target =
      typeof topicId === "string" && topicId
        ? DOM.infoModalContent.querySelector(`[id="${topicId}"]`)
        : null;
    DOM.infoModalContent
      .querySelectorAll(".is-target")
      .forEach((el) => el.classList.remove("is-target"));
    if (body) body.scrollTop = 0;
    requestAnimationFrame(() => {
      DOM.infoModal.classList.add("open");
      if (target && body) {
        // karta okna jest w trakcie animacji (scale < 1) – odległość
        // przeliczamy na piksele układu
        const bodyRect = body.getBoundingClientRect();
        const scale = body.offsetHeight
          ? bodyRect.height / body.offsetHeight
          : 1;
        body.scrollTop +=
          (target.getBoundingClientRect().top - bodyRect.top) / (scale || 1) -
          12;
        target.classList.add("is-target");
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        if (infoTargetTimeout) clearTimeout(infoTargetTimeout);
        infoTargetTimeout = setTimeout(
          () => target.classList.remove("is-target"),
          2400,
        );
      } else if (closeBtn) {
        closeBtn.focus();
      }
    });
  }

  function closeInfoModal() {
    if (!DOM.infoModal || DOM.infoModal.hidden) return;
    DOM.infoModal.classList.remove("open");
    DOM.infoModal.setAttribute("aria-hidden", "true");
    if (!DOM.copyModal || DOM.copyModal.hidden) {
      document.body.style.overflow = "";
      setBackgroundInert(false);
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
    DOM.infoFab.addEventListener("click", () => openInfoModal());
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
  setRevealed(DOM.ipBoxReveal, isIpBoxEnabled());
  setRevealed(DOM.spouseIncomeCard, isJointTaxationEnabled());
  setRevealed(DOM.zusReveal, DOM.zusEnabled.checked);
  setZusMoreExpanded(!isNarrowScreen());
  document.querySelectorAll(".results-row").forEach(ensureRowDetail);

  /* Pasek „Przejdź do wyników” chowamy, gdy wyniki są na ekranie. */
  const mobileJump = document.getElementById("mobileJump");
  if (mobileJump && DOM.resultsSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        mobileJump.classList.toggle("is-hidden", entry.isIntersecting);
      });
    });
    observer.observe(DOM.resultsSection);
  }

  // run an initial calculation so the income field shows 0,00 and rank state is stable
  calculate();
})();
