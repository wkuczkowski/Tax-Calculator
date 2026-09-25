# Audyt prawny logiki kalkulatora JDG — stan na 24.09.2026

> **Data:** 2026-09-24  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu.  
> **Zakres:** audyt prawny logiki kalkulatora sprzed wprowadzenia składek ZUS (commit `07adef8`/`bfe7e43`): stałe 2026, PIT (skala, liniowy, ryczałt, IP BOX, małżonek, danina), składka zdrowotna. Ustalenia B1–B10 zostały później poprawione. Sposób poprawy opisują [rejestr decyzji](../decyzje/decyzje-implementacyjne.md) i [recenzja 04de063](../weryfikacja/recenzja-04de063.md).  
> **Pierwotna nazwa pliku:** `audit_logic.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).
>
> **Uwaga o `v2/`:** katalog `v2/` (redesign) został usunięty z repozytorium commitem `bfe7e43`. Odwołania do `v2/` i sekcja C mają wyłącznie znaczenie historyczne. Jedyną wersją kalkulatora jest `/2026`. Numery linii `2026/script.js:…` dotyczą ówczesnej wersji pliku.

Zakres: `2026/taxConstants.js`, `2026/script.js`, `2026/index.html` oraz `v2/` (redesign). **Uwaga:** w trakcie audytu katalog `v2/` został usunięty commitem `bfe7e43` („Remove v2 calculator; /2026 is the only version”). v2 audytowałem z wersji z commita `07adef8`. Logika w `2026/` nie zmieniła się w tym commicie.

Nie modyfikowałem żadnych plików w repo. Nie uruchamiałem testów.

## Źródła (tekst prawa w brzmieniu obowiązującym na 24.09.2026)

| Skrót | Akt / dokument | URL |
|---|---|---|
| **uPIT** | ustawa o PIT, t.j. Dz.U. 2026 poz. 592 (obwieszczenie z 17.04.2026) | https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20260000592 (PDF: https://api.sejm.gov.pl/eli/acts/DU/2026/592/text.pdf) |
| **uRycz** | ustawa o zryczałtowanym podatku dochodowym, t.j. Dz.U. 2025 poz. 843 | https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250000843 |
| **uŚwiadcz** | ustawa o świadczeniach opieki zdrowotnej, t.j. Dz.U. 2025 poz. 1461 | https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001461 |
| **ZUS 2026** | ZUS, „Informacja w sprawie podstawy wymiaru składki oraz kwoty składki na ubezpieczenie zdrowotne w 2026 r.” (2.02.2026) | https://www.zus.pl/-/informacja-w-sprawie-podstawy-wymiaru-sk%C5%82adki-oraz-kwoty-sk%C5%82adki-na-ubezpieczenie-zdrowotne-w-2026-r. |
| **MP 1274** | Obwieszczenie MFiG z 12.12.2025, M.P. 2025 poz. 1274 (limit 14 100 zł) | https://monitorpolski.gov.pl/MP/2025/1274 |
| **MP 117** | Obwieszczenie Prezesa GUS z 22.01.2026, M.P. 2026 poz. 117 (przeciętne wynagrodzenie w IV kw. 2025 r.) | https://monitorpolski.gov.pl/MP/2026/117 |
| **MinWage** | Rozporządzenie RM z 11.09.2025, Dz.U. 2025 poz. 1242 (4806 zł) | https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001242 |

**Zmiany w 2026 r.:** sprawdziłem listę aktów zmieniających w API ELI Sejmu (stan na 16.09.2026).

- uPIT zmieniały: Dz.U. 2026 poz. 203, 424, 779, 846, 1079, 1098 i 1123, a wcześniej (od 1.01.2026) Dz.U. 2025 poz. 1022, 1817, 1838 i 1858. Żaden z tych aktów nie zmienia art. 6, 27, 30c, 30ca ani 30h.
- uRycz zmieniały Dz.U. 2026 poz. 779 i 1098. Zmiany są proceduralne (JPK, OKI od 2027), bez wpływu na art. 11 i 12.
- uŚwiadcz zmieniały Dz.U. 2026 poz. 26, 203, 791, 972, 986 i 1007 oraz Dz.U. 2025 poz. 1083, 1537 i 1739. Żaden z tych aktów nie dotyczy art. 79, 79a ani 81.
- Ustawa obniżająca składkę zdrowotną od 2026 r. (zawetowana w 2025 r.) nie weszła w życie. Obniżka minimalnej podstawy do 75% minimalnego wynagrodzenia dotyczyła tylko roku składkowego 2025. ZUS 2026 potwierdza: od 1.02.2026 minimalna podstawa to 100% minimalnego wynagrodzenia.

**Wniosek:** stałe liczbowe są aktualne. Nie znalazłem zmian uchwalonych w 2026 r., które wpływałyby na wartości w kalkulatorze.

---

## A. Potwierdzone jako poprawne

| # | Element (plik:linia) | Wartość / logika w kodzie | Podstawa prawna / źródło |
|---|---|---|---|
| A1 | `taxConstants.js:20` MIN_WAGE | 4806 zł | MinWage (Dz.U. 2025 poz. 1242), ZUS 2026 |
| A2 | `taxConstants.js:23` AVG_SALARY_Q4_PREV | 9228,64 zł (z wypłatami z zysku) | MP 117, ZUS 2026 |
| A3 | `taxConstants.js:26` LINEAR_HEALTH_DEDUCTION_LIMIT | 14 100 zł | MP 1274 (na podstawie art. 30c ust. 2c uPIT; dotyczy art. 23 ust. 1 pkt 58 i art. 30c ust. 2 pkt 2) |
| A4 | `taxConstants.js:29-35`, `script.js:213-236` skala | 0% do 30 000, 12% do 120 000, 32% nadwyżki; odpowiada formule „12% − 3600” i „10 800 + 32%” | art. 27 ust. 1 uPIT |
| A5 | `script.js:238-250` danina | 4% nadwyżki ponad 1 000 000 zł | art. 30h ust. 1–2 uPIT |
| A6 | Zakres daniny: skala → dochód; liniowy → dochód minus odliczona składka zdrowotna (`script.js:297-308`); IP BOX wyłączony z podstawy (`script.js:310-370`); ryczałt bez daniny | zgodne | art. 30h ust. 2: suma dochodów z art. 27 ust. 1, 9 i 9a, 30b, 30c i 30f, pomniejszonych o składki społeczne (art. 26 ust. 1 pkt 2 i 2a) i **składki zdrowotne z art. 30c ust. 2 pkt 2**. Art. 30ca (IP BOX) i ryczałt nie są wymienione. Komentarze w breakdownie (`script.js:1632`, `1788`) mówią o „uproszczeniu”, ale dla liniowego to wprost przepis. Uproszczeniem jest jedynie pominięcie składek społecznych i innych źródeł dochodu. |
| A7 | Danina przy rozliczeniu wspólnym liczona osobno dla każdego małżonka (`script.js:274-281`, `351-370`) | zgodne | art. 30h ust. 1 („osoby fizyczne”) |
| A8 | `taxConstants.js:38` liniowy | 19% | art. 30c ust. 1 uPIT |
| A9 | `taxConstants.js:39` IP BOX | 5% kwalifikowanego dochodu; współczynnik podawany przez użytkownika jako udział dochodu kwalifikowanego (po nexusie) | art. 30ca ust. 1, 3–6 uPIT |
| A10 | Rozliczenie wspólne: `2 × podatek(½ sumy dochodów)` (`script.js:260-264`); IP BOX poza sumą (`351-370`) | zgodne | art. 6 ust. 2 uPIT. IP BOX nie wyklucza rozliczenia wspólnego (ust. 8 wymienia tylko art. 30c, ryczałt poza najmem prywatnym, podatek tonażowy). |
| A11 | Składka zdrowotna na skali: 9% dochodu, min. 12 × 432,54 = 5190,48 zł (`taxConstants.js:111-123`, `193-201`); przy stracie minimum | zgodne | art. 79 ust. 1, art. 81 ust. 2, 2b i 2d uŚwiadcz; ZUS 2026 |
| A12 | Liniowy: 4,9% dochodu, min. 9% minimalnego wynagrodzenia (`taxConstants.js:208-216`) | zgodne | art. 79a ust. 1 uŚwiadcz |
| A13 | IP BOX: przy liniowym 4,9% od całego dochodu (łącznie z IP BOX), przy skali 9% (`script.js:458-464` i funkcje IP BOX) | zgodne | art. 79a ust. 2 i art. 81 ust. 2 (obejmuje art. 30ca) uŚwiadcz |
| A14 | Brak odliczenia składki zdrowotnej na skali (także przy IP BOX) | zgodne | uPIT: od 2022 r. brak podstawy do odliczenia na skali; art. 30ca nie przewiduje odliczenia |
| A15 | Liniowy: odliczenie `min(składka, 14 100)` od podstawy (`script.js:466`, `297-308`); przy IP BOX tylko od dochodu liniowego (`310-329`) | zgodne (uproszczenie OK) | art. 30c ust. 2 pkt 2 lit. a: składki z działalności opodatkowanej wg art. 30c |
| A16 | Ryczałt: podstawa 60% / 100% / 180% przeciętnego wynagrodzenia; progi 60 000 i 300 000 z warunkiem „przekroczyły” (`>`) (`taxConstants.js:48-53`, `152-159`); 498,35 / 830,58 / 1495,04 zł miesięcznie (zaokrąglenie miesięczne, potem × 12) | zgodne | art. 81 ust. 2e i 2f uŚwiadcz; ZUS 2026 (kwoty identyczne) |
| A17 | Ryczałt: odliczenie 50% zapłaconej składki od przychodu (`taxConstants.js:55`) | zgodne (co do stawki) | art. 11 ust. 1a uRycz |
| A18 | Stawki ryczałtu 2 / 3 / 5,5 / 8,5 / 10 / 12 / 14 / 15 / 17% i 12,5% tylko w wariancie powyżej 100 tys. (`taxConstants.js:61-70`) | zgodne | art. 12 ust. 1 pkt 1–8 uRycz |
| A19 | **Próg 100 000 zł dla 8,5%/12,5%** jako osobny wariant obok „czystego” 8,5% | **zgodne co do zasady**: próg nie dotyczy wyłącznie najmu prywatnego. Art. 12 ust. 1 pkt 4 uRycz obejmuje: a) najem prywatny (art. 6 ust. 1a), **b) najem w ramach JDG (art. 14 ust. 2 pkt 11 uPIT)**, c) zakwaterowanie (PKWiU 55), d) wynajem i obsługę nieruchomości własnych (68.20.1), e) usługi B+R (dział 72), f) wynajem pojazdów, środków transportu i IP (77.11, 77.12, 77.34, 77.35, 77.39, 77.40), g) pomoc społeczną z zakwaterowaniem (dział 87). Pozostałe usługi (pkt 5) podlegają 8,5% **bez progu**. | art. 12 ust. 1 pkt 4 i 5 uRycz |
| A20 | Założenie „pełny rok według stawek od lutego 2026” (`taxConstants.js:15-16`) | Dla skali, liniowego i IP BOX to **dokładne** odwzorowanie rocznego rozliczenia dochodu za 2026 r. Rok składkowy 1.02.2026–31.01.2027 obejmuje składki od dochodów ze stycznia–grudnia 2026. Roczne minimum to 12 × 4806 × 9% (art. 81 ust. 2 i 2b). Styczeń 2026 (minimum 314,96 zł) należy do roku składkowego 2025/26 i dotyczy dochodu z grudnia 2025. Dla ryczałtu ZUS stosuje kwoty 2026 **od 1.01.2026** (rok kalendarzowy, art. 81 ust. 2e), więc 12 × kwota 2026 też jest dokładne. | art. 81 ust. 2, 2b, 2e uŚwiadcz; ZUS 2026 |

---

## B. Ustalenia (błędy, nieaktualności, uproszczenia)

### B1. Tryb „Wiele stawek”: pełne odliczenie 50% składki od każdej stawki osobno
- **Plik:linia:** `2026/script.js:469-484` (obliczenie `healthRyczaltDeduction`), `566-700` (każdy blok stawki odejmuje **całe** `healthRyczaltDeduction` od przychodu przypisanego tej stawce), breakdown `2111-2141` oraz `1820-1909`. W v2 to samo: `v2/script.js:465-485` (`calculateRyczaltPit`) i `621-647` (commit 07adef8).
- **Co robi kod:** przy N wybranych stawkach odliczenie jest odejmowane N razy, więc łączne odliczenie wynosi N × 50% składki.
- **Co mówi prawo:** art. 11 ust. 3 uRycz (w brzmieniu od 30.10.2024): *„Jeżeli podatnik uzyskuje przychody […] opodatkowane różnymi stawkami, i dokonuje odliczeń od tych przychodów, odliczeń tych dokonuje w takim stosunku, w jakim w roku podatkowym pozostają poszczególne przychody […] w ogólnej kwocie przychodów.”* Odliczenie jest jedno i dzieli się je proporcjonalnie do udziału przychodów w poszczególnych stawkach. Źródło: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250000843
- **Przykład:** 100 000 zł po 12% i 100 000 zł po 8,5%. Kod: 19 478,39 zł ryczałtu. Prawidłowo: 19 989,19 zł. Zaniżenie o 510,81 zł, rosnące z liczbą stawek.
- **Waga:** **błąd**
- **Poprawka:** policzyć `D = 0,5 × składka_roczna(suma_przydzielona)` i dla każdej stawki `i` przyjąć `podstawa_i = max(P_i − D × P_i / ΣP, 0)`. To samo w `getRyczaltBreakdown` i `getRyczalt85125Breakdown`: przekazać odliczenie przypadające na stawkę zamiast całego.

### B2. Wariant 8,5%/12,5%: całe odliczenie przypisane do nadwyżki ponad 100 000 zł
- **Plik:linia:** `2026/script.js:610-637`, `1853-1909`; w v2 `v2/script.js:466-479`.
- **Co robi kod:** gdy przychód przekracza 100 000 zł, liczy `8 500 + (P − D − 100 000) × 12,5%`. Całe odliczenie trafia do części po 12,5%. Jeśli `D` jest większe od nadwyżki, reszta odliczenia przepada (`Math.max(…,0)`).
- **Co mówi prawo:** 8,5% i 12,5% to różne stawki w rozumieniu art. 11 ust. 3 uRycz, więc odliczenie należy dzielić proporcjonalnie: `100 000/P` do części 8,5% i `(P−100 000)/P` do części 12,5% (art. 12 ust. 1 pkt 4 w zw. z art. 11 ust. 3 uRycz).
- **Przykłady:** przy P = 200 000 kod podaje 20 377,06 zł, a prawidłowo wychodzi 20 476,73 zł (zaniżenie o 99,67 zł). Przy P = 102 000 kod podaje 8 500,00 zł, a prawidłowo 8 322,50 zł (zawyżenie o 177,50 zł, bo część odliczenia przepada).
- **Waga:** **błąd** (skala niewielka). Uznałbym to za „wątpliwe” tylko przy interpretacji, że 8,5%/12,5% z pkt 4 to jedna „stawka” progresywna. Literalne brzmienie ust. 3 („opodatkowane różnymi stawkami”) przemawia za proporcją.
- **Poprawka:** `D85 = D × min(P,100 000)/P`, `D125 = D − D85`, `podatek = (min(P,100 000) − D85) × 8,5% + max(P − 100 000 − D125, 0) × 12,5%`.

### B3. Rozliczenie wspólne: wynik zawiera PIT małżonka, pozostałe warianty nie
- **Plik:linia:** `2026/script.js:274-281` (`calculateJointScaleTaxTotal`), `351-370` (IP BOX wspólnie), `1405-1491`, ranking `826-917`. W v2 identycznie: `v2/script.js:249-256`, `326-345`, `computeVariantTotals` `487-551`.
- **Co robi kod:** `taxScaleJoint = 2 × PIT(½(dochód + dochód małżonka)) + danina obojga + moja składka zdrowotna`. To podatek **obojga** małżonków. Warianty „skala”, „liniowy” i „ryczałt” obejmują tylko podatnika, a ranking porównuje je bezpośrednio. UI (`index.html:455`, tooltip „Dochód małżonka”) mówi, że kwoty „nie uwzględniają obciążeń po stronie małżonka”, co jest sprzeczne z obliczeniem.
- **Co mówi prawo:** art. 6 ust. 2 uPIT: podatek ustala się „na imię obojga małżonków”. Porównanie z formami indywidualnymi (liniowy lub ryczałt wykluczają rozliczenie wspólne, art. 6 ust. 8) wymaga odjęcia podatku, który małżonek zapłaciłby osobno według skali. Źródło: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20260000592
- **Przykład:** dochód 200 000 zł, małżonek 100 000 zł. Kalkulator pokazuje 58 800 zł (w tym 8 400 zł PIT małżonka). Wartość porównywalna to 50 400 zł. W wąskich przedziałach zmienia się też zwycięzca. Przykład: dochód 250 000, małżonek 32 000. Kod wskazuje liniowy (57 422,50 zł vs 57 540 zł). W rzeczywistości wspólne rozliczenie daje gospodarstwu 57 300 zł, czyli jest lepsze o 122,50 zł.
- **Waga:** **błąd** (metodologia porównania)
- **Poprawka:** `taxScaleJoint = 2·PIT(½(d_p + d_m)) − PIT_skala(d_m) + danina_p + składka_p`. Danina małżonka jest taka sama w obu scenariuszach, więc należy ją pominąć. Analogicznie dla IP BOX wspólnie. Alternatywa: dodać `PIT_skala(d_m)` do wszystkich wariantów indywidualnych i opisać wynik jako „gospodarstwo domowe”.

### B4. Składki społeczne ZUS a progi i podstawa ryczałtu
- **Plik:linia:** `2026/script.js:444-461` (ryczałt liczony od `revenue` brutto), `taxConstants.js:152-186`; `index.html:453-456` (informacja, że kalkulator nie uwzględnia składek ZUS).
- **Co robi kod:** próg 60 000 / 300 000 i podstawa ryczałtu to przychód brutto. Dla skali i liniowego użytkownik może wliczyć ZUS do pola „Koszty”, a ryczałt koszty ignoruje. Porównanie jest więc niespójne, gdy użytkownik wpisze ZUS w koszty.
- **Co mówi prawo:**
  - art. 81 ust. 2g uŚwiadcz: przychody z ust. 2e i 2f (progi 60 000 / 300 000) *„są pomniejszane o kwoty opłaconych składek na ubezpieczenia emerytalne, rentowe, chorobowe i wypadkowe”*;
  - art. 11 ust. 1 uRycz: składki społeczne (art. 26 ust. 1 pkt 2 uPIT) odlicza się od przychodu;
  - art. 30c ust. 2 pkt 1 i art. 30h ust. 2 pkt 1 uPIT: składki społeczne zmniejszają też podstawę daniny.
- **Skutek:** dla przychodu tuż powyżej 60 000 lub 300 000 zł kalkulator przypisuje wyższy próg składki zdrowotnej. Przy przychodzie 75 000 zł i składkach społecznych od 15 000 zł próg 60 000 zł nie jest przekroczony. Składka powinna wynosić 5 980,20 zł zamiast 9 966,96 zł (różnica 3 986,76 zł rocznie, minus 50% tej kwoty w odliczeniu).
- **Waga:** **wątpliwe** (uproszczenie z istotnym wpływem w pasmach przy progach; zadeklarowane w disclaimerze)
- **Poprawka:** dodać opcjonalne pole „Składki społeczne ZUS (rocznie)”. Należy je odjąć (a) od przychodu przy wyborze progu składki ryczałtowej i od podstawy ryczałtu, (b) od dochodu dla skali i liniowego (PIT, podstawa zdrowotnej, podstawa daniny). W polu „Koszty” warto dopisać podpowiedź „bez składek ZUS”, żeby uniknąć podwójnego odliczenia.

### B5. Etykieta i stała „Stan prawny od 1.02.2026”
- **Plik:linia:** `2026/index.html:62` („Stan prawny - 1.02.2026”), `taxConstants.js:2-4, 15-16`, `script.js:2175, 2385, 2645`.
- **Co robi kod:** komunikuje, że wszystkie wartości obowiązują od 1.02.2026, a pełny rok jest liczony według stawek lutowych jako uproszczenie.
- **Co mówi prawo:** kwoty ryczałtowe obowiązują od 1.01.2026 (ZUS 2026: „stanowi od 1 stycznia 2026 r. kwota 5.537,18 zł…”, art. 81 ust. 2e i 2f, rok kalendarzowy). Dla skali i liniowego rok składkowy to 1.02.2026–31.01.2027, a założenie jest dokładne (zob. A20). Stałe są aktualne na 24.09.2026, bo nie było zmian w trakcie roku.
- **Waga:** **nieaktualne** (kosmetyka i dokumentacja; wartości liczbowe poprawne)
- **Poprawka:** etykieta „Stan prawny: 24.09.2026 (rok podatkowy 2026)”. W komentarzu `taxConstants.js` wpisać, że ryczałt jest liczony według roku kalendarzowego od 01.2026, a skala, liniowy i IP BOX według roku składkowego 02.2026–01.2027. Zastąpić URL-e z „…” pełnymi linkami (ZUS 2026, MP 2026/117, MP 2025/1274, Dz.U. 2025 poz. 1242).

### B6. Odliczenia „zapłaconych w roku” składek (liniowy, ryczałt) liczone od składek za rok 2026
- **Plik:linia:** `script.js:466`, `469-484`.
- **Co robi kod:** odlicza składki należne za rok 2026.
- **Co mówi prawo:** art. 30c ust. 2 pkt 2 uPIT i art. 11 ust. 1a uRycz pozwalają odliczyć składki **zapłacone w roku podatkowym**. W 2026 r. obejmuje to składkę za grudzień 2025 (według zasad 2025), składki za styczeń–listopad 2026 oraz roczne wyrównanie za 2025 (dopłata lub zwrot w maju 2026).
- **Waga:** **uproszczenie OK** (warto dodać przypis w „Założeniach”)
- **Poprawka:** tylko opis. Ewentualnie opcja „składki zapłacone w 2026” do ręcznego wpisania.

### B7. Zaokrąglenia podstaw i podatku
- **Plik:linia:** wszystkie obliczenia używają `round2` (grosze).
- **Co mówi prawo:** art. 63 § 1 Ordynacji podatkowej: podstawy i kwoty podatku zaokrągla się do pełnych złotych.
- **Waga:** **uproszczenie OK** (różnice rzędu 1 zł)
- **Poprawka:** opcjonalnie `Math.round` do pełnych złotych dla podstaw i podatków (poza składkami).

### B8. Brak limitu uprawniającego do ryczałtu i danych z innych źródeł dochodu
- **Co robi kod:** ryczałt jest dostępny dla dowolnego przychodu. Danina i skala liczą tylko dochód z JDG.
- **Co mówi prawo:**
  - art. 6 ust. 4 pkt 1 uRycz: ryczałtu nie można stosować przy przychodzie w poprzednim roku powyżej 2 000 000 euro;
  - art. 30h ust. 2 uPIT: do podstawy daniny wchodzą także dochody z art. 30b i 30f oraz inne dochody opodatkowane skalą;
  - art. 6 ust. 8 uPIT: rozliczenie wspólne jest wyłączone, jeśli małżonek stosuje liniowy albo ryczałt (poza najmem prywatnym).
- **Waga:** **uproszczenie OK**
- **Poprawka:** ostrzeżenie w UI przy przychodzie powyżej ok. 8,5 mln zł, że ryczałt może być niedostępny. Przy „Dochodzie małżonka” dopisać, że chodzi o dochód opodatkowany skalą, a małżonek nie może być na liniowym ani ryczałcie od działalności.

### B9. Wariant 8,5%/12,5% zawsze dolicza składkę zdrowotną z działalności
- **Plik:linia:** `script.js:638-639`, `index.html` (etykieta „8,5% / 12,5% pow. 100k”).
- **Co robi kod:** traktuje przychód jako przychód z JDG, dolicza składkę zdrowotną ryczałtową i odliczenie 50%.
- **Co mówi prawo:** to prawidłowe dla pozycji z art. 12 ust. 1 pkt 4 lit. b–g (najem w JDG, usługi 55, 68.20.1, 72, 77.xx, 87). **Najem prywatny** (lit. a, art. 6 ust. 1a) nie jest działalnością: nie ma składki zdrowotnej ani odliczenia 50% (art. 11 ust. 1a dotyczy przychodów z art. 6 ust. 1).
- **Waga:** **uproszczenie OK / doprecyzować opis**
- **Poprawka:** tooltip: „dotyczy działalności z art. 12 ust. 1 pkt 4 uRycz (najem w ramach JDG, zakwaterowanie PKWiU 55, B+R dział 72, wynajem 77.xx itd.); nie dotyczy najmu prywatnego”.

### B10. Drobne niespójności w trybie „Wiele stawek”
- **Plik:linia:** `script.js:461` vs `474-479`; breakdown `2109` używa `healthRyczaltData` liczonego od **całego** przychodu, a wynik od **sumy przydzielonej**.
- **Co robi kod:** gdy suma przydziałów różni się od przychodu, składka i odliczenie w breakdownie mogą się różnić od użytych w wyniku.
- **Co mówi prawo:** próg składki liczy się od łącznego przychodu z działalności (art. 81 ust. 2e i 2f).
- **Waga:** **wątpliwe** (błąd prezentacji)
- **Poprawka:** używać jednej wartości (sumy przydziałów albo przychodu całkowitego) w obu miejscach i blokować liczenie, gdy przydziały się nie sumują.

---

## C. Różnice 2026/ vs v2/ (v2 z commita 07adef8; usunięte w HEAD bfe7e43)

1. **Stałe:** v2 nie ma własnych stałych. Ładuje `../2026/taxConstants.js` (`v2/index.html:658`), więc wartości są identyczne.
2. **Rdzeń obliczeń podatku** (`2026/script.js:213-372` vs `v2/script.js:188-347`): kod jest **identyczny co do znaku** (sprawdzone `diff`). Wszystkie ustalenia B1–B3 dotyczą obu wersji.
3. **Różnice funkcjonalne v2:**
   - przełącznik „miesięcznie/rocznie” (`getPeriodFactor`, `v2/script.js:430-439`) mnoży przez 12 przychód, koszty, dochód małżonka i przydziały stawek. Zgodne, bo próg ryczałtu i składki liczone są od kwoty rocznej;
   - `computeVariantTotals` (`v2/script.js:487-551`) jest wspólne dla wyników i wykresu „Przy innym przychodzie”. Wykres zakłada stały stosunek kosztów do przychodu i stały dochód małżonka, a w trybie wielu stawek pomija ryczałt. To uproszczenie OK, opisane w `chartMeta`;
   - w v2 odliczenie w trybie wielu stawek jest liczone od `getAllocatedRevenueTotal()` (`v2/script.js:572-575`). Błąd B1 (pełne odliczenie dla każdej stawki) pozostaje (`v2/script.js:639-647`).
4. **Disclaimer v2** (`v2/index.html:596`) zawiera to samo zastrzeżenie o małżonku, sprzeczne z obliczeniem (B3).

---

## D. Podsumowanie wag

| Waga | Ustalenia |
|---|---|
| błąd | B1 (wielokrotne odliczenie 50% w trybie wielu stawek), B2 (8,5%/12,5%: odliczenie tylko od części 12,5% zamiast proporcjonalnie), B3 (rozliczenie wspólne zawiera PIT małżonka) |
| wątpliwe | B4 (składki społeczne a progi i podstawa ryczałtu), B10 (niespójność breakdownu w trybie wielu stawek) |
| nieaktualne | B5 (etykieta i komentarz „od 1.02.2026”, URL-e z „…”) |
| uproszczenie OK | B6, B7, B8, B9 |

Wszystkie stałe liczbowe (4806; 9228,64; 432,54 / 5190,48; 498,35 / 830,58 / 1495,04; 14 100; 30 000 / 120 000 / 3 600; 12/32/19/5/4%; progi 60 000 / 300 000 i mnożniki 0,6 / 1,0 / 1,8; 50%; próg 100 000 i stawki ryczałtu) są **zgodne z prawem obowiązującym 24.09.2026**.
