# Stan prawny na rok podatkowy 2027: JDG (PIT, ryczałt, IP BOX, ZUS, składka zdrowotna)

> **Data:** 2026-09-25 (stan prawny i stan prac legislacyjnych na 25.09.2026)  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu. Część ustaleń skorygował późniejszy raport [research-2027-reformy.md](research-2027-reformy.md) (m.in. numer projektu UD458 w RCL i przepis o przeliczeniu EUR).  
> **Zakres:** stałe na rok podatkowy 2027 (minimalne wynagrodzenie, podstawy i stopy ZUS, składka zdrowotna, limity) ze statusem final / draft / forecast, źródłem i terminem, w którym wartość stanie się ostateczna; przegląd projektów UD458 i UD116 oraz innych projektów; terminy na 2027 r.; rekomendacja dla trybu 2027 kalkulatora. Na tym raporcie oparto stałe roku 2027 w `app/taxConstants.js`.  
> **Pierwotna nazwa pliku:** `research_2027.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Stan wiedzy na **25.09.2026**. Punkt wyjścia: `2026/taxConstants.js` (LEGAL_STATUS_DATE 24.09.2026).
Statusy: **final** (akt ogłoszony w Dz.U./M.P.), **draft** (projekt rządowy, jeszcze nie ustawa),
**forecast** (nasze wyliczenie albo prognoza, bo nie ma jeszcze aktu), **bez zmian** (obecny przepis,
nie znaleziono projektu zmiany).

Uwaga o źródłach: serwis legislacja.gov.pl (RCL) był z tego środowiska niedostępny (połączenie
zrywane / HTTP 503). Treść projektu UD458 ustaliłem na podstawie komunikatów KPRM i MF
(gov.pl) oraz zgodnych omówień (Infor, PIT.pl, Bankier, Wektor Wiedzy, rp.pl). Tych portali użyłem
tylko do wskazania treści. Przed wdrożeniem trzeba sprawdzić tekst projektu na RCL
(https://legislacja.gov.pl/projekt/12402157) albo druk sejmowy.

---

## 1. Tabela stałych

| Stała (`TAX_CONSTANTS`) | 2026 | 2027 | Status | Źródło | Kiedy ostateczne |
|---|---|---|---|---|---|
| `MIN_WAGE` | 4806 | **4950** | **final** | Rozp. RM z 14.09.2026, **Dz.U. 2026 poz. 1213** (ogł. 15.09.2026, wchodzi 1.01.2027): https://api.sejm.gov.pl/eli/acts/DU/2026/1213/text.pdf | już ostateczne |
| `ZUS_PREF_BASE` (30% × min. wyn.) | 1441,80 | **1485,00** | **final** (wynika wprost z MIN_WAGE) | art. 18a ust. 1 u.s.u.s. + Dz.U. 2026 poz. 1213 | już ostateczne |
| `ZUS_FORECAST_AVG_SALARY` | 9420 | **10 033** | **draft** (w praktyce pewne) | Projekt ustawy budżetowej na 2027 (RM 28.08.2026, projekt z 27.08.2026), **art. 24**: „Prognozowane przeciętne miesięczne wynagrodzenie brutto w gospodarce narodowej wynosi 10 033 zł”. MF: https://www.gov.pl/web/finanse/projekt-przekazany-do-rds27 | Obwieszczenie MRPiPS o kwocie ograniczenia rocznej podstawy (30-krotność) i przyjętym prognozowanym wynagrodzeniu (art. 19 ust. 10 u.s.u.s.), **ok. XI 2026** (za 2026: M.P. 2025 poz. 1206 z 19.11.2025, wydane na podstawie projektu budżetu). Potem komunikat ZUS (koniec XII 2026). Ustawa budżetowa zwykle I–II 2027 |
| `ZUS_FULL_BASE` (60% prognozy) | 5652,00 | **6019,80** | **draft** → final po obwieszczeniu MRPiPS | art. 18 ust. 8 u.s.u.s. × 10 033 | ok. XI 2026 |
| `ZUS_RATE_PENSION` | 19,52% | 19,52% | bez zmian (final) | art. 22 ust. 1 u.s.u.s. (t.j. Dz.U. 2026 poz. 199); brak projektu zmiany | n/d |
| `ZUS_RATE_DISABILITY` | 8% | 8% | bez zmian (final) | j.w. | n/d |
| `ZUS_RATE_SICKNESS` | 2,45% | 2,45% | bez zmian (final) | j.w. | n/d |
| `ZUS_RATE_ACCIDENT` (płatnik ≤ 9 ubezp.) | 1,67% | **1,67% do 31.03.2027**, od 04.2027 **prawdopodobnie 1,67%** | final do 03.2027; **forecast** od 04.2027 | art. 28 ust. 1 ustawy wypadkowej (50% najwyższej stopy dla grup działalności). Obecne stopy grup obowiązują od 1.04.2024; rok 04.2026–03.2027 jest opisywany jako ostatni rok tego cyklu, a rozporządzenie MRPiPS jest też dostosowywane do PKD 2025. Nie znalazłem projektu, który zmieniałby najwyższą stopę | ewentualne rozporządzenie MRPiPS przed 1.04.2027 (śledzić gov.pl/web/rodzina i RCL) |
| `ZUS_RATE_FP` | 1,0% | **1,0%** | **draft** | Projekt UB 2027, **art. 25** | uchwalenie i ogłoszenie ustawy budżetowej (zwykle I–II 2027) |
| `ZUS_RATE_FS` | 1,45% | **1,45%** | **draft** | Projekt UB 2027, **art. 26** | j.w. |
| `ZUS_ULGA_MONTHS` | 6 | 6 | bez zmian | art. 18 Prawa przedsiębiorców; nie znalazłem projektu wydłużenia | n/d |
| `ZUS_PREF_MONTHS` | 24 | 24 | bez zmian | art. 18a u.s.u.s. | n/d |
| `ZUS_FP_EXEMPT_AGE_*` | 55/60 | 55/60 | bez zmian | art. 261 ustawy o rynku pracy | n/d |
| `ZUS_HOLIDAY_MIN_OFFSET` | 2 | 2 | bez zmian | art. 17a–17b u.s.u.s. | n/d |
| `ZUS_YEAR` | 2026 | 2027 | – | – | – |
| `EFFECTIVE_FROM` | 2026-02-01 | **2027-02-01** (rok składkowy 02.2027–01.2028) | final (reguła ustawowa) | art. 81 u.ś.o.z. | n/d |
| Min. składka zdrowotna skala/liniowy/IP BOX (9% × min. wyn.) | 432,54/mies. (5190,48/rok) | **445,50/mies. (5346,00/rok)** od 02.2027 (styczeń 2027 = jeszcze 432,54) | **final** | art. 81 ust. 2 / 2b u.ś.o.z. (min. wynagrodzenie z 1. dnia roku składkowego = 4950) | już ostateczne |
| Próg dochodu dla minimalnej składki, liniowy (roczny) | 105 928,16 | **109 102,04** | final (pochodna) | 5346 / 4,9% | – |
| `AVG_SALARY_Q4_PREV` (IV kw. roku poprzedniego z wypłatami z zysku) | 9228,64 (IV kw. 2025, M.P. 2026 poz. 117) | **nieznane** (IV kw. 2026). Szacunek: **ok. 9 720** (widełki 9 650–9 800) | **forecast** | Metoda: IV kw. 2025 × dynamika r/r z II kw. 2026 (9396,33 / 8919,94 = 1,0534; M.P. 2026 poz. 720 i M.P. 2025 poz. 688) | **Obwieszczenie Prezesa GUS ok. 20–22.01.2027** (za 2025: obwieszczenie z 22.01.2026, M.P. 26.01.2026). Wtedy też komunikat ZUS. Obowiązuje od składki za 01.2027 (termin 20.02.2027 wypada w sobotę, więc 22.02) |
| Składka zdrowotna ryczałt (0,6 / 1,0 / 1,8 × IV kw. × 9%) | 498,35 / 830,58 / 1495,04 | szacunkowo **~524,96 / ~874,94 / ~1574,89** (przy 9 721,52) | **forecast** | j.w. | j.w. (I 2027) |
| `LINEAR_HEALTH_DEDUCTION_LIMIT` | 14 100 (M.P. 2025 poz. 1274) | **forecast 15 100** | **forecast** (wyliczenie) | art. 30c ust. 2b PIT: waloryzacja wskaźnikiem zmiany rocznej kwoty ograniczenia podstawy emerytalno-rentowej (30 × prognozowane wynagrodzenie), zaokrąglenie **w górę do 100 zł**. 14 100 × (30×10 033)/(30×9 420) = 14 100 × 300 990/282 600 = 15 017,5, czyli **15 100**. Ta metoda odtwarza limity 2025→2026 (12 900 → 14 100) i 2024→2025 | Obwieszczenie MF (art. 30c ust. 2c) **do 31.12.2026**. Za 2026 wydane 12.12.2025 (M.P. 17.12.2025) |
| `HEALTH_RATE_SCALE` / `_LINEAR` / `_RYCZALT` | 9% / 4,9% / 9% | 9% / 4,9% / 9% | bez zmian | u.ś.o.z. Nie ma rządowego projektu zmiany składki zdrowotnej przedsiębiorców na 2027 (reformę z 2025 zawetował Prezydent 6.05.2025; projekty poselskie druk 324 odrzucony, druk 526 utknął w 2024) | n/d |
| `RYCZALT_REVENUE_THRESHOLD_LOW/HIGH` (60k/300k PLN, progi zdrowotne) | 60 000 / 300 000 | 60 000 / 300 000 | bez zmian | art. 81 ust. 2e u.ś.o.z. | n/d |
| `RYCZALT_BASE_MULT_*` | 0,6 / 1,0 / 1,8 | 0,6 / 1,0 / 1,8 | bez zmian | u.ś.o.z. | n/d |
| `RYCZALT_HEALTH_DEDUCTION_FACTOR` | 0,5 | 0,5 | bez zmian | art. 11 ust. 1c ustawy o ryczałcie | n/d |
| `TAX_FREE_AMOUNT` | 30 000 | 30 000 | **draft** (UD458 jej nie zmienia) | UD458. Poselskie projekty 60 tys. (druk 773 i in.) utknęły po I czytaniu (II 2025) | uchwalenie UD458 |
| `TAX_DECREASING_AMOUNT` | 3 600 | 3 600 | draft (bez zmian w UD458) | UD458 | j.w. |
| `TAX_THRESHOLD_12` | 120 000 | **130 000** | **draft** | UD458 (RCL 21.08.2026). Komunikat KPRM z 28.08.2026 o projekcie budżetu (https://www.gov.pl/web/premier/projekt-ustawy-budzetowej-na-rok-20225) i MF/KAS | ustawa ogłoszona w Dz.U. (pożądane do ok. 30.11.2026) |
| **NOWE:** `PIT_RATE_24` | – | **24%** (dochód 130 000–150 000) | **draft** | UD458: podatek = 12 000 zł + 24% nadwyżki ponad 130 000 | j.w. |
| **NOWE:** `TAX_THRESHOLD_24` (początek stawki 32%) | – | **150 000** | **draft** | UD458: podatek = 16 800 zł + 32% nadwyżki ponad 150 000 | j.w. |
| `PIT_RATE_12` / `PIT_RATE_32` | 12% / 32% | 12% / 32% | draft (bez zmian) | UD458 | j.w. |
| `SOLIDARITY_THRESHOLD` | 1 000 000 | 1 000 000 | draft (bez zmian) | UD458 | j.w. |
| `SOLIDARITY_RATE` | 4% | **5%** | **draft** | UD458 (pierwsza zapłata za 2027 do 2.05.2028). Dodatkowo UD116 (przyjęty przez RM 22.09.2026) **obejmuje daniną dochody z IP BOX** i pozwala odliczyć straty z lat ubiegłych z tego samego źródła | ustawy ogłoszone w Dz.U. |
| `LINEAR_PIT_RATE` | 19% | 19% | bez zmian | brak projektu | n/d |
| `IP_BOX_RATE` | 5% | 5% | bez zmian co do stawki | UD116: RM **zrezygnowała** z wymogu zatrudniania ≥ 3 osób (prawo.pl, 23.09.2026). Zostało objęcie daniną | uchwalenie UD116 |
| Stawki ryczałtu 2–17% | 2 / 3 / 5,5 / 8,5 / 10 / 12 / 12,5 / 14 / 15 / 17 | bez zmian nominalnie, ale: **17% od przychodu ponad 300 tys. EUR w roku** (UD458) oraz 17% (i 15% zamiast 12,5% dla najmu ponad 100 tys. zł) dla najmu/dzierżawy z podmiotem powiązanym (UD116) | **draft** | UD458, UD116 | j.w. |
| `RYCZALT_8_5_THRESHOLD` | 100 000 | 100 000 | bez zmian | – | n/d |
| **NOWE:** limit prawa do ryczałtu | 2 mln EUR (przychód z roku poprzedniego) | **250 000 EUR** przychodu w 2026 (ok. 1,06 mln zł przy kursie ~4,25) | **draft** | UD458. Przeliczenie wg obecnego art. 6 ust. 1a ustawy o ryczałcie: kurs średni NBP z 1. dnia roboczego października roku poprzedniego (**1.10.2026**), zaokrąglenie do 1000 zł. Trzeba to potwierdzić w tekście projektu | kurs znany 1.10.2026; limit po uchwaleniu UD458 |
| **NOWE:** próg 17% w ryczałcie | – | **300 000 EUR** przychodu w 2027 (stawka 17% od nadwyżki) | **draft** | UD458 (Bankier, PIT.pl) | j.w. |

### Wartości ZUS 2027 do podglądu (przy założeniu 10 033 i 4950; zaokrąglenie każdej składki osobno)

- **Pełny ZUS, podstawa 6019,80:** emerytalna 1175,06; rentowe 481,58; chorobowa 147,49; wypadkowa (1,67%)
  100,53; razem społeczne **1904,66**; FP+FS (2,45%) 147,49; **łącznie 2052,15 zł/mies.**
  Bez chorobowej: 1904,66.
- **Preferencyjny ZUS, podstawa 1485,00:** emerytalna 289,87; rentowe 118,80; chorobowa 36,38; wypadkowa 24,80;
  razem **469,85 zł/mies.** (bez FP, bo podstawa jest niższa od minimalnego wynagrodzenia).
- Roczna kwota ograniczenia podstawy emerytalno-rentowej (nieużywana w kalkulatorze): 30 × 10 033 = **300 990 zł**.

---

## 2. Legislacja na 2027 (stan 25.09.2026)

### A. UD458: nowelizacja PIT, CIT i ustawy o ryczałcie („reforma dla klasy średniej”)
- **Etap:** projekt MFiG opublikowany na RCL **21.08.2026** i skierowany do konsultacji (ogłoszony przez
  Premiera 19–20.08.2026). Skutki ujęte już w projekcie budżetu na 2027 (RM 28.08.2026).
  **Rada Ministrów jeszcze go nie przyjęła. Nie ma go w Sejmie** (brak druku, lista druków do 17.09.2026).
- **Treść istotna dla kalkulatora:**
  - skala: 12% do 130 000 (kwota zmniejszająca 3600, kwota wolna 30 000 bez zmian); **24%** od 130 000 do 150 000;
    32% ponad 150 000;
  - **danina solidarnościowa 5%** (było 4%), próg 1 mln zł;
  - **ryczałt:** limit prawa do ryczałtu **250 tys. EUR** przychodu z roku poprzedniego (było 2 mln EUR).
    W 2027 decyduje przychód z 2026. Przychód ponad **300 tys. EUR w trakcie 2027** jest opodatkowany stawką **17%**;
  - CIT 22% dla dużych firm (nieistotne dla JDG); stawki liniowego 19% i IP BOX 5% bez zmian.
- **Skutki wg OSR (rp.pl/PAP):** +2,6 mld zł w 2027, z czego ok. 2,2 mld zł dla NFZ. To efekt przejścia
  części ryczałtowców na skalę albo liniowy; **nie ma zmiany zasad składki zdrowotnej**.
- **Wejście w życie:** zasadniczo **1.01.2027**. Harmonogram: przyjęcie przez RM (prawdopodobnie X 2026),
  potem Sejm, Senat i Prezydent. Ustawa o PIT powinna być ogłoszona najpóźniej ok. miesiąca przed
  rokiem podatkowym (standard TK), czyli **do ok. 30.11.2026**.
  **Ryzyko:** weto Prezydenta (Karol Nawrocki). Odrzucenie weta wymaga 3/5 głosów.
  Kalkulator musi obsługiwać wariant „bez reformy” (2026 + nowe kwoty) i wariant „z reformą”.

### B. UD116: „uszczelnienie” PIT, CIT i ryczałtu
- **Etap:** **przyjęty przez Radę Ministrów 22.09.2026** (komunikat KPRM:
  https://www.gov.pl/web/premier/projekt-ustawy-o-zmianie-ustawy-o-podatku-dochodowym-od-osob-fizycznych-ustawy-o-podatku-dochodowym-od-osob-prawnych-oraz-ustawy-o-zryczaltowanym-podatku-dochodowym-od-niektorych-przychodow-osiaganych-przez-osoby-fizyczne7);
  druk sejmowy się jeszcze nie ukazał. Wejście w życie **zasadniczo 1.01.2027**.
- **Istotne dla kalkulatora:** **danina obejmie dochody z IP BOX** (obecnie jej nie podlegają), a do
  jej podstawy będzie można odliczyć straty z lat ubiegłych z tego samego źródła. Z wymogu
  zatrudniania ≥ 3 osób w IP BOX **zrezygnowano** (wg prawo.pl 23.09.2026; wpis w wykazie UD116 zawierał go
  wcześniej). W ryczałcie dochodzi stawka 17% (i 15%) dla najmu/dzierżawy z podmiotem powiązanym, co
  jest poza zakresem kalkulatora.

### C. Składka zdrowotna
- **Brak rządowego projektu zmiany wysokości** składki przedsiębiorców na 2027. Ustawę obniżającą
  składkę (Sejm 4.04.2025) **zawetował Prezydent 6.05.2025**. Projekty poselskie: druk 324 odrzucony
  21.11.2024, druk 526 (ryczałtowe kwoty) bez I czytania od 2024.
- RM 22.09.2026 przyjęła projekt nowelizacji u.ś.o.z. (Min. Zdrowia): choroby rzadkie, leczenie
  transgraniczne, podleganie ubezpieczeniu emerytów pracujących za granicą. Według rp.pl (29.07/25.09.2026)
  projekt zmienia też **zwrot nadpłat z rocznego rozliczenia składki**: kwoty do 160 zł zalicza się na
  przyszłe składki. Nie wpływa to na wysokość składki w kalkulatorze.
- Wartości 2027 wynikają więc z obecnych przepisów: minimum 445,50 (od 02.2027), ryczałt zależny od IV kw. 2026 (GUS I 2027),
  limit odliczenia dla liniowego (MF do XII 2026).

### D. ZUS
- Nie znalazłem projektów rządowych zmieniających stopy składek, ulgę na start, preferencję 24 mies. ani wakacje
  składkowe na 2027.
- **Mały ZUS Plus:** poselski projekt podniesienia limitu przychodu z 120 000 do 200 000 zł (**druk 1940**)
  leży w komisjach od 17.11.2025 bez postępu. Limit 120 000 zł (przychód 2026) dla 2027 obowiązuje dalej.
- Poselskie projekty dobrowolnego ZUS (druki 154, 559, 660) bez postępu.
- Stopa wypadkowa: patrz tabela (ewentualne nowe rozporządzenie od 04.2027).

### E. Inne projekty PIT (bez wpływu na wartości bazowe, do monitorowania)
- **Druk 3122** (poselski): próg 120 000 → 140 000. Skierowany do I czytania 17.09.2026. Konkurencyjny wobec UD458.
- **Druk 1898** (prezydencki): ulga PIT dla rodziców co najmniej dwojga dzieci i inne zmiany. Skierowany do I czytania 04.11.2025, bez postępu.
- Kwota wolna 60 000 zł (druki 773/322): po I czytaniu (02.2025), utknęły.

### F. Projekt budżetu 2027
- RM przyjęła wstępnie 28.08.2026 i przekazała do RDS. Musi trafić do Sejmu **do 30.09.2026**.
  Zawiera: prognozowane przeciętne wynagrodzenie **10 033 zł** (art. 24), FP **1,0%** (art. 25),
  FS **1,45%** (art. 26), inflację 102,8%. Uchwalenie zwykle XII 2026 – I 2027, ogłoszenie I–II 2027.

---

## 3. Terminy na 2027

| Czynność | Termin | Uwagi |
|---|---|---|
| Zmiana formy opodatkowania (skala, liniowy, ryczałt) na 2027, działalność kontynuowana | do 20. dnia miesiąca po miesiącu pierwszego przychodu w 2027. Przy przychodzie w styczniu: **20.02.2027 (sobota), więc 22.02.2027** (art. 12 § 5 Ordynacji podatkowej) | przez CEIDG albo oświadczenie do US. Przy przychodzie dopiero w grudniu: do końca roku |
| Nowa działalność w 2027 | wniosek CEIDG albo do 20. dnia miesiąca po miesiącu pierwszego przychodu | – |
| Utrata prawa do ryczałtu przy przychodzie 2026 > 250 tys. EUR (UD458) | od 1.01.2027 | jeśli nie złoży oświadczenia o liniowym, domyślnie skala |
| Kurs EUR do limitów ryczałtu 2027 | kurs średni NBP z **1.10.2026** | przeliczenie: art. 6 ust. 1a ustawy o ryczałcie (do potwierdzenia w UD458) |
| Mały ZUS Plus na 2027 | zgłoszenie do **31.01.2027** (niedziela, więc sprawdzić w komunikacie ZUS przesunięcie na 1.02.2027) | przychód 2026 ≤ 120 000 zł |
| Pierwsza składka ryczałtowców wg nowej kwoty (IV kw. 2026) | za 01.2027, płatna do **22.02.2027** (20.02 to sobota) | GUS ok. 20–22.01.2027 |
| Nowa minimalna składka zdrowotna 445,50 | od składki za **02.2027** | styczeń 2027 = 432,54 |
| Roczne rozliczenie składki zdrowotnej za 2026 | w DRA za 04.2027, do **20.05.2027** | – |
| Zeznanie PIT za 2027, wybór wspólnego rozliczenia, IP BOX, DSF-1 (danina) | **30.04.2028 (niedziela, 1.05 święto), więc 2.05.2028** | – |
| Roczne rozliczenie składki zdrowotnej za 2027 | DRA za 04.2028, **20.05.2028 (sobota), więc 22.05.2028** | – |

---

## 4. Rekomendacja

**Tryb 2027 da się zbudować już teraz**, jeśli jasno oznaczymy wartości prognozowane i projektowane oraz
dodamy przełącznik scenariusza podatkowego.

1. **Pewne już teraz (final):** MIN_WAGE 4950, ZUS_PREF_BASE 1485, minimalna składka zdrowotna 445,50 (od 02.2027),
   stopy emerytalna, rentowe, chorobowa, stawki zdrowotne 9%/4,9%/9%, progi i mnożniki ryczałtu dla składki zdrowotnej, 19% i 5%.
2. **Oznaczyć jako „prognoza” do ok. XI 2026:** ZUS_FORECAST_AVG_SALARY 10 033 i ZUS_FULL_BASE 6019,80
   (obwieszczenie MRPiPS w M.P.). FP 1,0% i FS 1,45% formalnie są pewne dopiero po ustawie budżetowej
   (I–II 2027), ale w praktyce nie są zagrożone.
3. **Oznaczyć jako „prognoza” do 31.12.2026:** LINEAR_HEALTH_DEDUCTION_LIMIT = 15 100 (obwieszczenie MF).
4. **Oznaczyć jako „prognoza” do ok. 22.01.2027:** AVG_SALARY_Q4_PREV (szacunek ok. 9 720) i wszystkie kwoty
   zdrowotne ryczałtu. Porównanie ryczałtu z innymi formami przed końcem stycznia jest orientacyjne.
5. **Oznaczyć jako „projekt”, dopóki ustawa nie zostanie ogłoszona (cel: do ok. 30.11.2026, ryzyko weta):**
   próg 130 000, nowy przedział 24% do 150 000, danina 5%, danina od IP BOX (UD116), limit ryczałtu 250 tys. EUR
   i 17% powyżej 300 tys. EUR. Zalecam flagę `TAX_REFORM_2027` (domyślnie włączoną, z banerem „projekt”),
   żeby można było porównać z wariantem obecnych przepisów (120 000 / 32% / 4%).
6. **Wypadkowa 1,67%:** przyjąć na cały 2027 z przypisem, że stopa od 04.2027 zależy od ewentualnego nowego
   rozporządzenia MRPiPS.
7. **Zmiany w kodzie wymuszone przez UD458 (nie tylko stałe):** trzeci próg skali (24%) w `calculateTax`,
   w rozliczeniu wspólnym (progi ×2: 260 000/300 000) i w stałych pochodnych (`TAX_BAND_12` = 100 000, nowy
   `TAX_BAND_24` = 20 000, `TAX_BAND_32` = 850 000, `PIT_RATE_SOLIDARITY` = 0,37,
   `EFFECTIVE_LINEAR_RATE_SOLIDARITY` = 0,289). Dalej: danina również od dochodu IP BOX; sprawdzenie prawa do
   ryczałtu (przychód z 2026 ≤ 250 tys. EUR) i 17% od nadwyżki ponad 300 tys. EUR (kwoty w PLN po kursie z 1.10.2026).
   Dotyczą też testów `sanityCheck` (oczekiwane 432,54 → 445,50 itd.).

**Najbliższe punkty kontrolne:** 30.09.2026 (budżet w Sejmie), 1.10.2026 (kurs EUR), przyjęcie UD458 przez RM
i druki sejmowe UD458 i UD116 (X 2026), obwieszczenie MRPiPS (XI 2026), podpis lub weto Prezydenta (XI–XII 2026),
obwieszczenie MF o limicie dla liniowego (do 31.12.2026), GUS IV kw. 2026 (ok. 20–22.01.2027),
rozporządzenie wypadkowe (do 04.2027).

---

## Źródła (główne)
- Dz.U. 2026 poz. 1213 (minimalne wynagrodzenie 2027): https://api.sejm.gov.pl/eli/acts/DU/2026/1213
- Projekt ustawy budżetowej na 2027 (MF, 28.08.2026), art. 24–26: https://www.gov.pl/web/finanse/projekt-przekazany-do-rds27
- KPRM, projekt budżetu 2027 (zmiany PIT, danina, ryczałt): https://www.gov.pl/web/premier/projekt-ustawy-budzetowej-na-rok-20225
- MF/KAS, priorytety budżetu 2027: https://www.gov.pl/web/kas/bezpieczenstwo-zdrowie-inwestycje---priorytety-ustawy-budzetowej-na-2027-rok
- KPRM, RM 22.09.2026, UD116: link w sekcji 2B. Wykaz UD116: https://www.gov.pl/web/premier/projekt-ustawy-o-zmianie-ustawy-o-podatku-dochodowym-od-osob-fizycznych-ustawy-o-podatku-dochodowym-od-osob-prawnych-oraz-niektorych-innych-ustaw6
- UD458 na RCL (niedostępne z tego środowiska): https://legislacja.gov.pl/projekt/12402157. Omówienia: Infor (ksiegowosc.infor.pl/wiadomosci/7642538), Bankier (9185179), PIT.pl, Wektor Wiedzy, rp.pl (art45038711)
- prawo.pl 23.09.2026 (IP BOX bez wymogu zatrudnienia): https://www.prawo.pl/podatki/pit-2027-zmiany-dla-programistow-i-wspolnikow-spolek,1553299.html
- M.P. 2025 poz. 1274 (limit liniowy 2026): https://monitorpolski.gov.pl/MP/2025/1274
- M.P. 2025 poz. 1206 (prognoza 2026, MRPiPS 19.11.2025): https://api.sejm.gov.pl/eli/acts/MP/2025/1206
- M.P. 2026 poz. 117 (IV kw. 2025, GUS 22.01.2026), M.P. 2026 poz. 720 (II kw. 2026: 9396,33), M.P. 2025 poz. 688 (II kw. 2025: 8919,94)
- Sejm API, procesy legislacyjne (druki 1940, 3122, 1898, 324, 526, 773): https://api.sejm.gov.pl/sejm/term10/processes/{nr}
- Weto 2025 (składka zdrowotna): prawo.pl/kadry/zmiany-w-skladce-zdrowotnej-od-przedsiebiorcow-co-zdecydowal-prezydent,532341.html
- Składka wypadkowa 04.2026–03.2027 = 1,67%: ZUS poradnik; Grant Thornton „Składka wypadkowa – wyzwania na 2026 r.”
