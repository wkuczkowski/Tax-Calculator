import { describe, it, expect } from "vitest";
import { loadCalculator } from "./helpers/loadCalculator.js";

function withCalc(options, fn) {
  const calc = loadCalculator(options);
  try {
    return fn(calc);
  } finally {
    calc.close();
  }
}

describe("Przełączniki: kliknięcie w samą grafikę (.slider) przełącza pole", () => {
  /* Błąd: span.toggle-switch nie był etykietą, a pole ma 0 × 0 px –
     kliknięcie w grafikę nie działało (działał tylko tekst etykiety).
     Teraz samodzielne przełączniki to <label class="toggle-switch">. */
  it("każdy przełącznik: klik w .slider zmienia checked i wywołuje przeliczenie", () => {
    withCalc({ year: 2027 }, (calc) => {
      calc.setRevenue(100000);
      calc.calculate();
      const results = {};
      calc.document.querySelectorAll(".toggle-switch").forEach((toggle) => {
        const input = toggle.querySelector("input");
        const before = input.checked;
        const changes = [];
        input.addEventListener("change", () => changes.push(input.checked));
        toggle.querySelector(".slider").click();
        results[input.id] = [before !== input.checked, changes.length];
      });
      expect(results).toEqual({
        reformToggle: [true, 1],
        zusEnabled: [true, 1],
        zusSickness: [true, 1],
        zusEmployment: [true, 1],
        zusHoliday: [true, 1],
        spouseIsParent: [true, 1],
        spouseLinRycz: [true, 1],
        fourPlus: [true, 1],
        multipleRatesToggle: [true, 1],
      });
    });
  });

  it("klik w grafikę „Uwzględnij składki społeczne” zmienia wynik", () => {
    withCalc({}, (calc) => {
      calc.setRevenue(100000);
      calc.calculate();
      const withZus = calc.readVariantData("taxScale").total;
      calc.document.querySelector("#zusEnabled + .slider").click();
      const withoutZus = calc.readVariantData("taxScale").total;
      expect(withZus > withoutZus).toBe(true);
      expect(calc.document.getElementById("zusEnabled").checked).toBe(false);
    });
  });
});
