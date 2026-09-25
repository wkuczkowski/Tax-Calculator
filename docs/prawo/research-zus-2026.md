# Składki ZUS JDG w 2026 r.: raport do kalkulatora

> **Data:** 2026-09-24 (stan prawny na 24.09.2026)  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu.  
> **Zakres:** składki ZUS przedsiębiorcy (JDG) w 2026 r.: podstawy i stawki, ulga na start, preferencyjny ZUS, FP/FS i zwolnienie wiekowe, wakacje składkowe, składka zdrowotna, odliczanie składek. Zawiera źródła i listę kwestii niepewnych. Na tym raporcie oparto specyfikację i model referencyjny.  
> **Pierwotna nazwa pliku:** `research_zus.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Stan prawny na 24.09.2026. Źródła pierwotne czytałem bezpośrednio: teksty jednolite z API Sejmu (ISAP/ELI) oraz komunikaty zus.pl. Portale branżowe traktowałem pomocniczo. Na końcu są źródła i lista rzeczy niepewnych.

Stosowane akty (teksty jednolite aktualne na dziś):
- ustawa o systemie ubezpieczeń społecznych (u.s.u.s.), **Dz.U. 2026 poz. 199** (t.j. z 9.02.2026),
- ustawa o PIT, **Dz.U. 2026 poz. 592** (t.j. z 17.04.2026),
- ustawa o zryczałtowanym podatku dochodowym, Dz.U. 2025 poz. 843,
- ustawa o świadczeniach opieki zdrowotnej (u.ś.o.z.), Dz.U. 2025 poz. 1461 z późn. zm. Nowelizacje z 2025–2026 (poz. 1537, 1739 z 2025; poz. 203, 791, 972, 986, 1007 z 2026) **nie zmieniają art. 79–81**, czyli zasad składki zdrowotnej przedsiębiorców,
- Prawo przedsiębiorców, Dz.U. 2025 poz. 1480 (art. 18, ulga na start),
- ustawa o rynku pracy i służbach zatrudnienia z 20.03.2025, Dz.U. 2025 poz. 620, obowiązuje od 1.06.2025. Zasady FP są teraz w art. 259–265, a nie w starej ustawie o promocji zatrudnienia,
- ustawa budżetowa na 2026, Dz.U. 2026 poz. 62 (art. 24–27).

---

## 1. Podstawy i stawki składek społecznych w 2026

### 1.1. Parametry

| Parametr | Wartość 2026 | Podstawa prawna / źródło |
|---|---|---|
| Minimalne wynagrodzenie (cały 2026) | **4 806,00 zł** | Rozp. RM z 11.09.2025, Dz.U. 2025 poz. 1242 |
| Prognozowane przeciętne wynagrodzenie | **9 420,00 zł** | M.P. 2025 poz. 1206; ustawa budżetowa art. 24 |
| Podstawa **pełna** („duży ZUS”) = 60% × 9 420 | **5 652,00 zł** (minimum, można zadeklarować więcej) | art. 18 ust. 8 u.s.u.s. |
| Podstawa **preferencyjna** = 30% × 4 806 | **1 441,80 zł** (minimum) | art. 18a u.s.u.s. |
| Roczny limit podstawy emerytalnej i rentowej (30-krotność) | 282 600 zł (przy minimalnych podstawach bez znaczenia) | M.P. 2025 poz. 1206 |

### 1.2. Stawki (zweryfikowane)

| Składka | Stawka | Status dla JDG | Źródło |
|---|---|---|---|
| Emerytalna | **19,52%** | obowiązkowa, całość płaci przedsiębiorca | art. 22 ust. 1 pkt 1 u.s.u.s. |
| Rentowe | **8,00%** | obowiązkowe | art. 22 ust. 1 pkt 2 |
| Chorobowa | **2,45%** | **dobrowolna** (art. 11 ust. 2). Zasiłek przysługuje po 90 dniach ubezpieczenia | art. 22 ust. 1 pkt 3 |
| Wypadkowa | **1,67%** | obowiązkowa. Dotyczy płatników zgłaszających do 9 ubezpieczonych, czyli typowej JDG: stopa = 50% najwyższej stopy dla grup działalności. Tak samo w roku składkowym 1.04.2025–31.03.2026 i **1.04.2026–31.03.2027**, więc w całym 2026 r. jest 1,67% | art. 28 ust. 1 ustawy wypadkowej; zus.pl |
| Fundusz Pracy | **1,00%** | obowiązkowy tylko przy podstawie ≥ minimalnego wynagrodzenia i poniżej wieku 55 (K) / 60 (M) | ustawa budżetowa 2026 art. 25; art. 259, 261 ustawy o rynku pracy |
| Fundusz Solidarnościowy | **1,45%** | pobierany od tej samej podstawy i na tych samych zasadach co FP | ustawa budżetowa 2026 art. 26 |
| **FP + FS razem** | **2,45%** | ZUS wykazuje je łącznie | |
| FGŚP (0,10%) | nie dotyczy | przedsiębiorca nie płaci FGŚP za siebie, tylko za pracowników | |
| FEP | nie dotyczy | | |

### 1.3. Kwoty miesięczne 2026 (pełny miesiąc)

Każdą składkę zaokrągla się osobno do grosza. Kwoty zgadzają się z komunikatem ZUS z 30.12.2025.

| Składka | Pełny ZUS (5 652,00) | Preferencyjny (1 441,80) |
|---|---|---|
| Emerytalna 19,52% | 1 103,27 | 281,44 |
| Rentowe 8% | 452,16 | 115,34 |
| Chorobowa 2,45% (dobrowolna) | 138,47 | 35,32 |
| Wypadkowa 1,67% | 94,39 | 24,08 |
| FP 1,00% + FS 1,45% = 2,45% | 138,47 (56,52 + 81,95) | **0**, bo podstawa jest niższa od minimalnego wynagrodzenia |

| Wariant (miesięcznie) | Społeczne bez FP (do odliczenia z art. 26 / 30c / 11) | FP+FS (tylko jako koszt) | **Razem do ZUS** | Razem × 12 |
|---|---|---|---|---|
| Pełny ZUS **z** chorobową | 1 788,29 | 138,47 | **1 926,76** | 23 121,12 |
| Pełny ZUS **bez** chorobowej | 1 649,82 | 138,47 | **1 788,29** | 21 459,48 |
| Pełny ZUS z chorobową, osoba zwolniona z FP (K 55+, M 60+) | 1 788,29 | 0 | **1 788,29** | 21 459,48 |
| Pełny ZUS bez chorobowej, zwolniona z FP | 1 649,82 | 0 | **1 649,82** | 19 797,84 |
| Preferencyjny **z** chorobową | 456,18 | 0 | **456,18** | 5 474,16 |
| Preferencyjny **bez** chorobowej | 420,86 | 0 | **420,86** | 5 050,32 |
| Ulga na start | 0 | 0 | **0** (płaci się tylko zdrowotną) | 0 |

### 1.4. Składka zdrowotna: minimalne kwoty 2026 (tabela zbiorcza, szczegóły w pkt 6)

| Forma | Okres | Minimalna podstawa | Składka miesięczna |
|---|---|---|---|
| Skala / liniowy / IP BOX | styczeń 2026 (ostatni miesiąc roku składkowego 2025/26) | 3 499,50 | **314,96** |
| Skala / liniowy / IP BOX | luty 2026 – styczeń 2027 | 4 806,00 | **432,54** |
| Ryczałt, przychód ≤ 60 000 | styczeń – grudzień 2026 | 5 537,18 (60% z 9 228,64) | **498,35** (rocznie 5 980,20) |
| Ryczałt, 60 000 – 300 000 | styczeń – grudzień 2026 | 9 228,64 | **830,58** (rocznie 9 966,96) |
| Ryczałt, > 300 000 | styczeń – grudzień 2026 | 16 611,55 | **1 495,04** (rocznie 17 940,48) |
| Karta podatkowa | 2026 | 4 806,00 | 432,54 |

Przeciętne wynagrodzenie w sektorze przedsiębiorstw w IV kw. 2025 wyniosło 9 228,64 zł (M.P. 2026 poz. 117). Komunikat ZUS z 2.02.2026.

---

## 2. Ulga na start

**Podstawa prawna:** art. 18 Prawa przedsiębiorców (bez zmian w 2025–2026) oraz art. 18aa u.s.u.s.

### 2.1. Kto może skorzystać (warunki łączne)
1. Podejmuje działalność **po raz pierwszy** albo ponownie po **co najmniej 60 miesiącach** od ostatniego zawieszenia lub zakończenia.
2. **Nie wykonuje jej na rzecz byłego pracodawcy**, u którego w bieżącym lub poprzednim roku kalendarzowym wykonywał na etacie czynności wchodzące w zakres działalności.
3. Nie spełnia warunków do ubezpieczenia w KRUS (art. 5a ustawy o u.s.r.), co w praktyce jest marginesem.
- Z ulgi **nie** korzystają osoby współpracujące.
- Ulga jest **dobrowolna**: można z niej zrezygnować w każdej chwili, zgłaszając się do ubezpieczeń. Po rezygnacji nie da się do niej wrócić.

### 2.2. Co obejmuje
- **Tylko ubezpieczenia społeczne**: emerytalne, rentowe, wypadkowe, a pośrednio także FP/FS i dobrowolne chorobowe, bo nie ma tytułu do ubezpieczenia. Przez ten czas przedsiębiorca **w ogóle nie podlega** ubezpieczeniom społecznym, więc nie ma prawa do zasiłków, a okres nie liczy się do emerytury.
- **Składka zdrowotna jest należna w pełnej wysokości od pierwszego dnia** (ZUS: „Ulga na start nie obejmuje ubezpieczenia zdrowotnego… opłacać na nie pełną składkę”).

### 2.3. Jak liczyć 6 miesięcy (oficjalne stanowisko ZUS)
ZUS pisze: „Z ulgi na start możesz korzystać maksymalnie przez 6 miesięcy kalendarzowych od podjęcia działalności gospodarczej. **Jeśli rozpoczniesz działalność pierwszego dnia miesiąca, to uwzględniasz ten miesiąc jako pierwszy** z 6 miesięcy. **Jeśli natomiast rozpoczniesz działalność w trakcie miesiąca, to okres ulgi liczysz od kolejnego miesiąca kalendarzowego.**”
- Przykład ZUS: start 7.05.2022, ulga do **30.11.2022**. Niepełny maj plus 6 pełnych miesięcy od czerwca do listopada.
- Zawieszenie działalności nie wydłuża ulgi, bo miesiące zawieszenia się wliczają.

**Wniosek:** ulga zawsze kończy się ostatniego dnia miesiąca. Niepełny pierwszy miesiąc jest w całości wolny od składek społecznych, a potem następuje 6 pełnych miesięcy.

### 2.4. Po uldze: preferencyjne składki przez 24 miesiące
- art. 18aa ust. 3 u.s.u.s. i ZUS: „Jeśli upłynie okres ulgi na start… **24 miesiące kalendarzowe liczysz od dnia następnego po upływie 6 miesięcy** kalendarzowych korzystania z ulgi.” Przykład: start 1.05.2022, ulga do 31.10.2022, preferencyjne od 1.11.2022 do 31.10.2024.
- Przy ścieżce ulga na start → preferencyjne okres preferencyjny zawsze zaczyna się **1. dnia miesiąca**. W ścieżce „ulga + mały ZUS” **nigdy więc nie występuje proporcjonalnie pomniejszony miesiąc** składek społecznych.
- Łącznie ulga i preferencja dają do 30 miesięcy (plus ewentualny niepełny pierwszy miesiąc).

### 2.5. Rekomendacja modelowania bez dnia rozpoczęcia
**Przyjąć, że działalność rusza 1. dnia wybranego miesiąca M.** Wtedy:
- ulga na start obejmuje miesiące M…M+5, a preferencyjne składki zaczynają się od M+6 (pełne miesiące),
- przy starcie w trakcie miesiąca w rzeczywistości ulga obejmuje M…M+6, a preferencja zaczyna się od M+7. Konwencja „1. dzień” jest więc **konserwatywna**: zawyża koszt o najwyżej jeden miesiąc preferencyjnych składek (456,18 lub 420,86 zł),
- opcjonalnie można dodać przełącznik „Start 1. dnia miesiąca: tak / nie”. Przy „nie” ulga trwa o miesiąc dłużej i nie trzeba znać dokładnego dnia, bo pierwszy niepełny miesiąc i tak jest wolny.

Miesiące 2026 dla ścieżki **ulga na start → preferencyjny** przy konwencji startu 1. dnia:

| Start (M) | Ulga (0 zł społ.) | Preferencyjne w 2026 | Liczba mies. pref. w 2026 | Mies. zdrowotnej w 2026 |
|---|---|---|---|---|
| I | I–VI | VII–XII | 6 | 12 |
| II | II–VII | VIII–XII | 5 | 11 |
| III | III–VIII | IX–XII | 4 | 10 |
| IV | IV–IX | X–XII | 3 | 9 |
| V | V–X | XI–XII | 2 | 8 |
| VI | VI–XI | XII | 1 | 7 |
| VII–XII | M–XII | – | 0 | 13−M |

Wzór: `ulgaMonths2026 = min(6, 13−M)`, `prefMonths2026 = max(0, 13−M−6)`, `healthMonths2026 = 13−M`.

### 2.6. Niepełny pierwszy miesiąc bez ulgi na start (ścieżka preferencyjna od razu lub pełny ZUS)
- **art. 18 ust. 9 u.s.u.s.** (dotyczy też art. 18a): za miesiąc objęcia ubezpieczeniem, jeżeli trwało ono tylko przez część miesiąca, najniższą podstawę **dzieli się przez liczbę dni kalendarzowych tego miesiąca i mnoży przez liczbę dni podlegania**. Dzielnikiem jest faktyczna liczba dni miesiąca, nie 30. Każdą składkę liczy się od pomniejszonej podstawy.
  - Przykład: start 16.03.2026 (16 dni z 31), preferencyjny ZUS: podstawa 1 441,80 × 16/31 = 744,15 zł.
- Preferencja bez ulgi: 24 **pełne** miesiące kalendarzowe od dnia objęcia ubezpieczeniem, plus niepełny pierwszy miesiąc na preferencyjnej podstawie. Przykład ZUS: objęcie od 20.10.2022, preferencja do 31.10.2024.
- **Przy założeniu 1. dnia** nie ma proporcji. Rekomenduję tak liczyć, bo to górna granica kosztu. Gdyby kiedyś pojawiło się pole dnia, wzór to `base × dni_podlegania / dni_w_miesiącu`.
- **Zdrowotna nie podlega proporcji:** „Składkę na ubezpieczenie zdrowotne musisz zawsze opłacić w pełnej wysokości za cały miesiąc, nawet jeśli wykonywałeś działalność przez część miesiąca” (ZUS; art. 79 ust. 2 u.ś.o.z.: składka jest „miesięczna i niepodzielna”).

---

## 3. „Mały ZUS” (preferencyjny) a „Mały ZUS Plus”

| | **Preferencyjne składki („mały ZUS”)** | **Mały ZUS Plus** |
|---|---|---|
| Podstawa prawna | art. 18a u.s.u.s. | art. 18c u.s.u.s. (zmieniony od 1.01.2026 ustawą deregulacyjną, Dz.U. 2025 poz. 769) |
| Dla kogo | nowi przedsiębiorcy (≥ 60 mies. bez działalności, nie dla byłego pracodawcy) | przedsiębiorcy z przychodem w poprzednim roku ≤ 120 000 zł (proporcjonalnie przy niepełnym roku), działający w poprzednim roku ≥ 60 dni |
| Podstawa | zadeklarowana, min. **30% minimalnego wynagrodzenia = 1 441,80 zł** | **0,5 × przeciętny miesięczny dochód z poprzedniego roku** (dochód / liczba dni działalności × 30), w przedziale **1 441,80 – 5 652,00 zł**. Dla ryczałtu „dochód” = przychód × 0,5. Składki zaliczone do KUP dolicza się z powrotem do dochodu |
| Czas | **24 miesiące kalendarzowe** (po uldze na start albo od startu) | od 2026 r.: **maks. 36 miesięcy w każdym okresie 60 miesięcy** prowadzenia działalności. Każdy miesiąc z choćby 1 dniem liczy się jako pełny. Limit „zresetowany” od 1.01.2026 dla wszystkich |
| FP | nie (podstawa < minimalnego wynagrodzenia) | tylko jeśli podstawa ≥ 4 806 zł |
| Wyłączenia | działalność w ostatnich 60 mies.; praca dla byłego pracodawcy (ten sam lub poprzedni rok, te same czynności) | m.in.: osoby **uprawnione do preferencji z art. 18a**; działalność < 60 dni w poprzednim roku; karta podatkowa ze zwolnieniem z VAT w poprzednim roku; praca dla byłego pracodawcy; inne tytuły z art. 8 ust. 6 pkt 2–5 w poprzednim roku |

**Znaczenie potoczne:** „mały ZUS” niemal zawsze oznacza **preferencyjne składki od 30% minimalnego wynagrodzenia przez 24 miesiące**, w opozycji do „dużego ZUS”. „Mały ZUS Plus” to osobna ulga zależna od dochodu. W 2019 r. istniał jeszcze „mały ZUS” przychodowy, zastąpiony w 2020 r. przez MZP.

**Dla kalkulatora 2026:** osoba, która **zaczyna działalność w 2026 r.**, **nie może** korzystać z MZP w 2026 r., bo nie działała w 2025 r. przez ≥ 60 dni, a do tego jest uprawniona do art. 18a. MZP można pominąć. Istotne są ścieżki: (a) ulga na start → preferencyjny, (b) preferencyjny od startu, (c) ulga na start → pełny, (d) pełny od startu.

---

## 4. Fundusz Pracy, wiek i data urodzenia

### 4.1. FP/FS (art. 259–261 ustawy o rynku pracy, obowiązującej od 1.06.2025)
- JDG płaci FP/FS od podstawy emerytalnej i rentowej **tylko jeśli ta podstawa wynosi co najmniej minimalne wynagrodzenie** (art. 259 ust. 1 pkt 4). Przy pełnej podstawie 5 652 zł FP jest należny. Przy preferencyjnej podstawie 1 441,80 zł **nie**.
  - Wyjątek (art. 259 ust. 2): jeśli osoba ma kilka tytułów do obowiązkowego ubezpieczenia emerytalnego i rentowego (np. JDG preferencyjna i etat albo zlecenie) i **suma podstaw ≥ 4 806 zł**, FP jest należny także od podstawy z JDG (ZUS to potwierdza). Dotyczy to np. etatu na część etatu poniżej minimalnego wynagrodzenia z obowiązkowym ZUS z JDG.
- **Wiek (art. 261):** FP opłaca się tylko za osoby, które **nie osiągnęły 55 lat (kobiety) / 60 lat (mężczyźni)**. Według poradnika ZUS „Zasady opłacania składek na FP…” zwolnienie działa **od miesiąca następującego po miesiącu urodzin**, a jeśli urodziny przypadają 1. dnia miesiąca, już od tego miesiąca.
- **Wakacje składkowe:** za miesiąc zwolnienia z art. 17a u.s.u.s. FP też nie jest należny (art. 259 ust. 1 pkt 4 lit. o).
- Art. 262 (zwolnienie z FP przez 12 miesięcy za zatrudnionych bezrobotnych 50+, lub < 30 lat skierowanych z PUP) i art. 263 (36 miesięcy po urlopie macierzyńskim lub wychowawczym) dotyczą **pracodawców i ich pracowników**, **nie** przedsiębiorcy płacącego za siebie.
- FP/FS **nie** są składką „na ubezpieczenia społeczne” w rozumieniu art. 26 ust. 1 pkt 2 PIT. Nie odlicza się ich od dochodu. Na skali i liniowym są **kosztem uzyskania przychodu**. Na ryczałcie **nie da się ich nigdzie odliczyć**.

### 4.2. Czy potrzebna jest data urodzenia (i płeć)?
Tak, jeśli kalkulator ma liczyć pełny ZUS dokładnie:
1. **Zwolnienie z FP/FS:** kobieta ≥ 55, mężczyzna ≥ 60 lat. Potrzebna **data urodzenia i płeć**, a przy precyzji miesięcznej także miesiąc urodzin: zwolnienie od miesiąca po miesiącu urodzin, chyba że urodziny są 1. dnia. Przy preferencyjnym ZUS i uldze na start wiek nie ma znaczenia, bo FP i tak jest równy 0. Maksymalna różnica to 138,47 zł/mies. (1 661,64 zł/rok).
2. Wiek **nie** wpływa na obowiązek płacenia składki emerytalnej, rentowej ani wypadkowej przez JDG. Osiągnięcie wieku emerytalnego ani pobieranie emerytury nie zwalnia z tych składek. Poza FP w części ZUS nie ma progów wiekowych.
3. **Ulga dla młodych (art. 21 ust. 1 pkt 148 PIT, < 26 lat, limit 85 528 zł)** obejmuje wyłącznie przychody z etatu, pracy nakładczej, spółdzielczego stosunku pracy, **zlecenia** (art. 13 pkt 8), praktyk absolwenckich, stażu uczniowskiego i zasiłku macierzyńskiego. **Nie obejmuje działalności gospodarczej.** Dla pola „inne dochody opodatkowane skalą” zalecam, żeby użytkownik podawał **dochód już opodatkowany** (po zwolnieniu). Wtedy data urodzenia nie jest potrzebna. Uwaga na skutek uboczny: jeśli cały dochód z etatu jest zwolniony, nie ma od czego odliczyć składek z JDG w art. 26, a do tego art. 26 ust. 1 pkt 2 wyłącza odliczenie składek, których podstawę stanowi dochód zwolniony. Chodzi tu o składki pracownicze, nie o składki z JDG.
4. Do rozważenia, ale poza zakresem: **ulga dla pracujących seniorów (art. 21 ust. 1 pkt 154)**. Obejmuje także **działalność gospodarczą** (skala, liniowy, IP BOX, ryczałt) po 60 (K) / 65 (M) roku życia, do 85 528 zł, pod warunkiem **podlegania ubezpieczeniom społecznym z tego tytułu** i niepobierania emerytury. Nie działa więc w okresie ulgi na start. Wymaga daty urodzenia. Sygnalizuję tylko.

### 4.3. Zbieg tytułów: bardzo ważne przy „innych dochodach opodatkowanych skalą”
- **art. 9 ust. 1 i 1a u.s.u.s.:** osoba zatrudniona **na umowę o pracę**, której podstawa wymiaru (wynagrodzenie brutto) wynosi w przeliczeniu na miesiąc **co najmniej minimalne wynagrodzenie (4 806 zł)**, podlega ubezpieczeniom emerytalnemu i rentowemu **tylko z etatu**. Składki społeczne z JDG są wtedy **dobrowolne**. **Składka zdrowotna z JDG jest nadal obowiązkowa.** Jeśli etat daje mniej niż minimalne wynagrodzenie, ZUS z JDG jest obowiązkowy.
- **Umowa zlecenia (art. 9 ust. 2a):** JDG na pełnej podstawie jest zwolniona z ZUS społecznego, jeśli podstawa ze zlecenia ≥ 5 652 zł. JDG na podstawie **preferencyjnej (art. 18a) lub MZP** podlega obowiązkowo z **obu** tytułów (z zastrzeżeniem ust. 2c).
- **Rekomendacja:** dodać pole lub checkbox „Umowa o pracę z wynagrodzeniem ≥ minimalnego przez cały okres”. Wtedy składki społeczne z JDG = 0 (opcja dobrowolnego opłacania), ulga na start i preferencje nie mają znaczenia, zostaje tylko zdrowotna. Bez tego kalkulator zawyży koszty etatowcom.

---

## 5. Odliczanie składek społecznych w PIT

### 5.1. Dostępne sposoby

| Forma | Gdzie można odliczyć składki społeczne (emerytalna, rentowa, chorobowa, wypadkowa) | FP/FS |
|---|---|---|
| **Skala** | (a) **od dochodu** z art. 26 ust. 1 pkt 2 lit. a, czyli od łącznego dochodu ze skali (JDG i np. etat), albo (b) jako **KUP** w JDG (art. 22 ust. 1, praktyka i stanowisko MF) | tylko KUP |
| **Liniowy** | (a) KUP, albo (b) **od dochodu liniowego** (art. 30c ust. 2 pkt 1), albo (c) **od dochodu opodatkowanego skalą** z art. 26 (np. od etatu). Art. 30c ust. 3 pkt 2 i art. 26 ust. 13a wprost przewidują tę alternatywę („jeżeli nie zostały … odliczone od dochodów opodatkowanych na zasadach art. 27” oraz odwrotnie) | tylko KUP |
| **Ryczałt** | (a) **od przychodu** ryczałtowego (art. 11 ust. 1 ustawy o ryczałcie: „jeżeli nie zostały odliczone od dochodu… na podstawie ustawy o PIT”), przy kilku stawkach proporcjonalnie do udziału przychodów (art. 11 ust. 3), albo (b) **od dochodu ze skali** z art. 26 (art. 26 ust. 13a: „…lub nie zostały odliczone od przychodu na podstawie ustawy o zryczałtowanym podatku”) | nieodliczalne |
| **IP BOX** | art. 30ca nie przewiduje odliczeń od kwalifikowanego dochodu (5%). Składki odlicza się od dochodu ze skali (art. 26) albo liniowego (30c ust. 2), czyli od „zwykłej” części dochodu lub od innych dochodów ze skali | KUP |

Zasady wspólne:
- Odlicza się składki **zapłacone w roku podatkowym** (kasowo). Składka za grudzień 2026 płacona do 20.01.2027 jest odliczalna w 2027 r., chyba że zostanie zapłacona w grudniu. W praktyce można ją opłacić wcześniej. **Rekomendacja:** przyjąć, że odliczalne w 2026 r. są składki za miesiące 2026, co zakłada zapłatę grudniowej w grudniu, i opisać to jako założenie.
- Tej samej składki nie można odliczyć dwa razy. Nadwyżka ponad dochód (przychód) z art. 26 lub art. 11 **przepada**: nie ma przeniesienia na kolejne lata ani na małżonka. KUP może natomiast powiększyć stratę, którą rozlicza się w kolejnych 5 latach z tego samego źródła.
- Składki niezapłacone, np. objęte wakacjami składkowymi, nie są odliczalne.

### 5.2. Optymalny sposób odliczenia przy innych dochodach ze skali

**Skala (w tym wspólnie z małżonkiem):**
- Odliczenie od dochodu (art. 26) i KUP dają ten sam efekt, gdy dochód z JDG ≥ składki. **Art. 26 jest lepszy**, gdy JDG ma niski lub ujemny dochód, a są inne dochody ze skali. Składki pomniejszą wtedy np. dochód z etatu w tym samym roku, a jako KUP tylko zwiększyłyby stratę JDG, której nie łączy się z etatem.
- Kalkulator: `pitBase = max(0, dochódJDG + inneSkala − społeczne)`.
- **Wspólne opodatkowanie (art. 6 ust. 2):** łączy się dochody małżonków „po uprzednim odliczeniu, odrębnie przez każdego z małżonków, kwot pomniejszających dochód”. Składki przedsiębiorcy odlicza się **tylko od jego własnego dochodu** (JDG i jego inne dochody ze skali), maksymalnie do zera. Nadwyżka nie przechodzi na małżonka.

**Liniowy:**
- Wartość odliczenia zależy od krańcowej stawki: 32% (skala powyżej 120 tys.) > 19% (liniowy) > 12% (skala w I progu) > 0% (skala w kwocie wolnej) > 0% (liniowy z dochodem ≤ 0).
- **Reguła optymalna:** jeśli inne dochody ze skali przekraczają 120 000 zł, odliczyć składki od dochodu ze skali (oszczędność 32%). W przeciwnym razie odliczyć od dochodu liniowego (19%). Jeśli dochód liniowy jest za mały, resztę odliczyć od skali (12%).
- ⚠️ Czy wolno **dzielić** składki między oba odliczenia? Przepisy mówią o składkach, które „nie zostały odliczone”, więc podział według poszczególnych wpłat (np. część miesięcy w liniowym, część w skali) wydaje się dopuszczalny. Nie znalazłem jednak jednoznacznej interpretacji o dzieleniu jednej wpłaty. **Bezpiecznie:** policzyć warianty „wszystko od liniowego” i „wszystko od skali” i wybrać lepszy. Wersja zaawansowana: podział po pełnych miesięcznych składkach.
- Wybór miejsca odliczenia składek społecznych **nie zmienia** podstawy zdrowotnej, bo art. 81 ust. 2 u.ś.o.z. pomniejsza dochód o składki społeczne niezaliczone do KUP niezależnie od miejsca odliczenia.
- **Liniowy nie może rozliczać się wspólnie z małżonkiem** (art. 6 ust. 8 pkt 1 lit. a). Wyklucza to także wspólne rozliczenie etatu małżonków.

**Ryczałt:**
- Porównanie stawki ryczałtu z krańcową stawką skali. Jeśli krańcowa stawka skali jest wyższa od stawki ryczałtu (np. 12% lub 32% wobec 8,5%), opłaca się odliczyć od skali. **Pułapka:** art. 81 ust. 2g u.ś.o.z. mówi, że przychód do progów zdrowotnych 60 tys. / 300 tys. pomniejsza się o składki społeczne tylko wtedy, gdy **nie** zostały zaliczone do KUP **lub odliczone od dochodu na podstawie ustawy o PIT**. Odliczenie od skali **nie** obniża więc przychodu do progów zdrowotnych, a odliczenie od przychodu ryczałtowego obniża. Przy przychodzie blisko 60 000 zł (skok 3 986,76 zł/rok) lub 300 000 zł (skok 7 973,52 zł/rok) trzeba sprawdzić oba warianty.
- Jeżeli przychód ryczałtowy jest mniejszy od składek, **nieodliczoną część można odliczyć od dochodu ze skali** (art. 26 ust. 13a). Nie ma przeniesienia na kolejny rok.
- **Ryczałt z JDG wyklucza wspólne rozliczenie z małżonkiem** (art. 6 ust. 8 pkt 1 lit. b, wyjątek dotyczy tylko najmu prywatnego z art. 6 ust. 1a ustawy o ryczałcie).
- Zdrowotna: 50% zapłaconej składki odlicza się od przychodu ryczałtowego (art. 11 ust. 1a), przy wielu stawkach proporcjonalnie (art. 11 ust. 3).

**IP BOX:**
- Nigdy nie opłaca się pomniejszać kwalifikowanego dochodu (5%). Składki społeczne należy odliczyć od dochodu opodatkowanego skalą (art. 26) albo liniowo (art. 30c ust. 2), a nie ujmować w KUP przypisanych do IP.
- **Skala + IP BOX może rozliczać się wspólnie z małżonkiem**, bo art. 6 ust. 8 nie wymienia art. 30ca. Dochód z IP BOX nie wchodzi do wspólnej podstawy.

---

## 6. Składka zdrowotna 2026

### 6.1. Brak reformy w 2026
- Ustawa z 4.04.2025, która od 2026 r. obniżała minimalną podstawę do 75% minimalnego wynagrodzenia i zmieniała zasady dla liniowego i ryczałtu, została **zawetowana przez Prezydenta 6.05.2025**. Nie weszła w życie.
- Jednoroczne obniżenie minimalnej podstawy do 75% dotyczyło tylko **roku składkowego 2025 (luty 2025 – styczeń 2026)**. Stąd styczeń 2026 = 314,96 zł.
- **Od lutego 2026 wraca 100% minimalnego wynagrodzenia**: 4 806 zł, składka 432,54 zł. Potwierdzone w komunikacie ZUS z 2.02.2026 i w tekście art. 79a i 81 u.ś.o.z. Na dziś nie ma uchwalonych zmian zasad dla przedsiębiorców na 2026 r.

### 6.2. Skala podatkowa (art. 79 ust. 1, art. 81 ust. 2–2d u.ś.o.z.)
- **9%** podstawy. Roczna podstawa to **dochód z działalności za rok kalendarzowy** (przychód − KUP) **pomniejszony o składki emerytalną, rentową, chorobową i wypadkową zapłacone w tym roku, jeżeli nie zostały zaliczone do KUP** (art. 81 ust. 2). Odpowiedź na pytanie: **tak, składki społeczne obniżają podstawę zdrowotnej**. Przy KUP robią to pośrednio (przez niższy dochód), przy odliczeniu wprost. FP/FS jako KUP też obniża dochód.
- **Minimum roczne** (art. 81 ust. 2b): liczba miesięcy podlegania ubezpieczeniu zdrowotnemu w roku kalendarzowym × minimalne wynagrodzenie z pierwszego dnia roku składkowego, czyli **n × 4 806 zł**, co daje **n × 432,54 zł** składki.
- Do podstawy liczy się **wyłącznie dochód z JDG**, nie z etatu (etat ma własną zdrowotną potrącaną przez pracodawcę).
- Składka nie jest odliczalna od podatku ani od dochodu.
- **Formuła:** `zdrow_skala = 0,09 × max(dochódJDG − społeczneNieKUP, 4806 × n)`.

### 6.3. Liniowy (art. 79a u.ś.o.z.)
- **4,9%** podstawy, ale nie mniej niż **9% × 4 806 zł = 432,54 zł/mies.**, rocznie 9% × n × 4 806. Podstawa jak dla skali: dochód − społeczne niezaliczone do KUP.
- Zdrowotną **zapłaconą w roku** można zaliczyć do KUP (art. 23 ust. 1 pkt 58) **albo** odliczyć od dochodu liniowego (art. 30c ust. 2 pkt 2), łącznie do **14 100 zł w 2026 r.** (Obwieszczenie MFiG z 12.12.2025, **M.P. 2025 poz. 1274**; w 2025 r. było 12 900 zł).
- **Optymalizacja:** zaliczenie zdrowotnej do **KUP** obniża też dochód do podstawy zdrowotnej, bo art. 81 nie wyłącza tej składki z KUP. Efekt ok. 4,9% od zaliczonej kwoty, maksymalnie ok. 691 zł/rok. Odliczenie od dochodu tego efektu nie daje. W stanie ustalonym: `H = 0,049 × (D − S − min(H,14100))`, czyli przy H < 14 100: `H = 0,049 × (D − S) / 1,049`, dalej z minimum. ⚠️ Kasowość i przesunięcie o miesiąc (składka za miesiąc M liczona od dochodu z M−1) sprawiają, że w praktyce efekt jest nieco mniejszy. To optymalizacja drugiego rzędu, którą można pominąć albo oznaczyć jako przybliżenie.
- Liniowy z dochodem rocznym poniżej ok. 105 928 zł (dla 12 miesięcy) płaci minimum.

### 6.4. IP BOX (art. 79a ust. 2, art. 81 ust. 2)
- Podstawa to cały dochód z działalności, **łącznie z dochodem z IP BOX**.
- Stawka **4,9%**, jeśli podatnik w tym samym roku stosuje też liniowy (30c). Jeśli zwykła część dochodu jest na skali, stawka wynosi **9%**. Minimum jak wyżej.
- Odliczenie zdrowotnej przy IP BOX + liniowy: do limitu 14 100 zł, jako KUP lub od dochodu liniowego. ⚠️ Przepis mówi o składkach „z tytułu działalności opodatkowanej zgodnie z [30c]”, więc praktyka przypisuje odliczenie do części liniowej. Przy IP BOX + skala **brak odliczenia**.

### 6.5. Ryczałt (art. 81 ust. 2e–2h u.ś.o.z.)
- Rok **kalendarzowy** (styczeń–grudzień 2026, kwoty obowiązują od stycznia 2026). Stała kwota zależna od **przychodu narastająco od początku roku**: ≤ 60 000 → 498,35 zł; 60 000–300 000 → 830,58 zł; > 300 000 → 1 495,04 zł miesięcznie.
- Rozliczenie roczne: `n × (kwota progu właściwego dla przychodu rocznego)` (art. 81 ust. 2e), z dopłatą lub zwrotem w rozliczeniu kwietniowym. **Progi są kwotowe i nieproporcjonalne**: 60 tys. / 300 tys. obowiązują także przy działalności przez część roku.
- Przychód do progów **pomniejsza się o składki społeczne**, ale tylko te niezaliczone do KUP ani nieodliczone od dochodu w PIT (art. 81 ust. 2g). FP nie wchodzi.
- Odliczenie: **50% zapłaconej zdrowotnej od przychodu ryczałtowego** (art. 11 ust. 1a ustawy o ryczałcie). Brak limitu kwotowego poza zasadą 50%.

### 6.6. Ulga na start i niepełny miesiąc
- **Zdrowotna jest należna w czasie ulgi na start** (art. 81 ust. 2 i 2e wprost wymieniają osoby z art. 18 ust. 1 Prawa przedsiębiorców).
- **Nie ma proporcji** w pierwszym niepełnym miesiącu: składka jest „miesięczna i niepodzielna”, a ZUS wymaga pełnej kwoty. Niepełny miesiąc liczy się w `n` (liczbie miesięcy podlegania).

### 6.7. Rok składkowy luty 2026 – styczeń 2027: konsekwencje
- Składka za miesiąc M (skala, liniowy, IP BOX) liczona jest od dochodu z miesiąca M−1 i płacona do 20. dnia miesiąca M+1. Rozliczenie roczne za rok składkowy 2026/27 opiera się na **dochodzie za rok kalendarzowy 2026**. Dopłata lub zwrot następuje w dokumencie za kwiecień 2027 (art. 81 ust. 2i–2l).
- Ekonomicznie „zdrowotna od dochodu 2026” = `stawka × max(dochód2026 − społeczne, n2026 × 4 806)`, gdzie `n2026` to liczba miesięcy podlegania w 2026 r. **Rekomenduję tę formułę.** Jest zgodna z obecnym założeniem kalkulatora: pełny rok liczony od lutego i 432,54 × 12 = 5 190,48 zł.
- ⚠️ Styczeń 2026 (minimum 314,96 zł) formalnie należy do roku składkowego 2025/26 rozliczanego na dochodzie 2025. Dla osoby, która **zaczyna w styczniu 2026**, nie wiadomo, jak ZUS potraktuje tę składkę w rozliczeniu 2025/26 (dochód 2025 = 0, 0 miesięcy w 2025). Różnica to najwyżej ok. 118–315 zł. Proponuję ją pominąć i liczyć wszystkie miesiące 2026 po 432,54 zł.
- ⚠️ Kasowo (dla odliczeń: liniowy do 14 100 zł, ryczałt 50%) w 2026 r. zapłacone są tylko składki za miesiące od startu do listopada. Składka za grudzień i ewentualna dopłata roczna przypadają na 2027 r. Najprościej przyjąć, że **odliczalna zdrowotna w 2026 = zdrowotna należna za 2026**, i opisać to jako uproszczenie typowe dla kalkulatorów.

---

## 7. Inne sprawy 2026

### 7.1. Wakacje składkowe (art. 17a–17b, 36d u.s.u.s., obowiązują od 1.11.2024)
- **Raz w roku kalendarzowym** zwolnienie z opłacenia **składki emerytalnej, rentowej i wypadkowej**, a także **chorobowej**, jeśli przedsiębiorca podlegał jej dobrowolnie w miesiącu złożenia wniosku i w miesiącu poprzednim. Zwolnienie obejmuje też **FP/FS** (art. 259 ust. 1 pkt 4 lit. o ustawy o rynku pracy). Składki za ten miesiąc finansuje budżet od **najniższej** podstawy (art. 18d). **Zdrowotna nie jest objęta.**
- Warunki: ≤ 10 zgłoszonych ubezpieczonych w miesiącu poprzedzającym wniosek; przychód ≤ 2 mln EUR w jednym z 2 poprzednich lat albo brak przychodu (nowa firma spełnia); nie praca dla byłego pracodawcy; **w miesiącu poprzedzającym miesiąc złożenia wniosku podleganie ubezpieczeniom emerytalnemu, rentowym i wypadkowemu z JDG**; wolny limit pomocy de minimis.
- Wniosek (RWS, przez PUE/eZUS) składa się **w miesiącu poprzedzającym** miesiąc zwolnienia. Najwcześniejszy możliwy miesiąc zwolnienia to więc **F+2**, gdzie F to pierwszy miesiąc podlegania ubezpieczeniom społecznym. **W czasie ulgi na start nie można skorzystać.** Na preferencyjnych składkach można.
- Przykłady dla 2026 (start 1. dnia, ulga → preferencyjny): start I → F = VII → zwolnienie najwcześniej IX; start IV → F = X → XII; start V i później → w 2026 niemożliwe. Pełny lub preferencyjny ZUS od startu w miesiącu M: najwcześniej M+2, czyli możliwe tylko dla M ≤ X.
- Oszczędność: 1 926,76 zł (pełny z chorobową), 1 788,29 zł (pełny bez chorobowej), 456,18 / 420,86 zł (preferencyjny). Niezapłaconych składek **nie odlicza się** w PIT i nie pomniejszają podstawy zdrowotnej, więc oszczędność netto jest mniejsza o utracone odliczenie.
- **Rekomendacja:** modelować jako **opcjonalny checkbox** (domyślnie wyłączony, bo wymaga wniosku), z automatyczną kontrolą wykonalności w 2026: `F ≤ 10`.

### 7.2. Zasiłek chorobowy
- Chorobowa dla JDG pozostaje **dobrowolna**. Zasiłek przysługuje po **90 dniach** nieprzerwanego ubezpieczenia, a podstawą jest zadeklarowana podstawa składek. Nie znalazłem zmian ustawowych w 2026 r. wpływających na kalkulację składek. W kalkulatorze wystarczy przełącznik „chorobowe tak/nie”. Przy uldze na start chorobowej brak, bo nie ma ubezpieczeń społecznych.

### 7.3. Mały ZUS Plus: reset limitu od 2026
Nie dotyczy osób zaczynających w 2026 r. (pkt 3). Warto wspomnieć w UI, że po zakończeniu 24 miesięcy preferencji można przejść na MZP (36 z 60 miesięcy), jeśli przychód ≤ 120 000 zł.

---

## 8. Proponowany algorytm dla kalkulatora (streszczenie)

Wejście: `M` (miesiąc startu 2026, 1–12), `ścieżka ∈ {ulga+pref, pref, ulga+pełny, pełny}`, `chorobowe: bool`, `płeć + data urodzenia` (tylko dla FP), `etat ≥ minimalnego: bool`, `inneSkala`, `wakacje: bool`.

```
n = 13 − M                               // miesiące zdrowotnej w 2026 (pełne, bez proporcji)
if etatMinWage: social = 0 (opcjonalnie dobrowolne), FP = 0
else:
  ulga = (ścieżka zawiera ulgę) ? min(6, n) : 0
  pref = (ścieżka ma pref) ? min(24, n − ulga) : 0     // zawsze pełne miesiące przy założeniu startu 1. dnia
  full = n − ulga − pref
  społ_mies_pełny = 1103.27 + 452.16 + 94.39 + (chor ? 138.47 : 0)
  społ_mies_pref  = 281.44 + 115.34 + 24.08 + (chor ? 35.32 : 0)
  FP_mies_pełny   = zwolnionyZWieku(miesiąc) ? 0 : 138.47   // K≥55 / M≥60, od miesiąca po urodzinach
  FP_pref = 0
  wakacje: jeśli włączone i F = M+ulga ≤ 10 → odjąć jeden miesiąc składek (społ. + FP) wg wariantu w miesiącu ≥ F+2
S  = suma społecznych (bez FP)            // odliczalne: art.26 / 30c / art.11 ryczałtu
FP = suma FP/FS                           // tylko KUP (skala/liniowy), ryczałt: nieodliczalne

Zdrowotna:
  skala:   0.09  × max(D − FP − S, 4806·n)                 (D = przychód − koszty, przed składkami)
  liniowy: max(0.049 × (D − FP − S [− Hkup]), 0.09·4806·n); odliczenie min(H, 14100)
  IP BOX:  jak liniowy (4,9%) przy liniowym, jak skala (9%) przy skali; podstawa = cały dochód
  ryczałt: n × {498.35 | 830.58 | 1495.04} wg progu (P − S_odliczone_od_przychodu) ≤60k / ≤300k / >300k; odliczenie 50%
```

Wybór miejsca odliczenia S (zob. 5.2): skala = łącznie z innymi dochodami; liniowy/ryczałt = porównać wariant „od przychodu/dochodu formy” z wariantem „od skali” i wziąć tańszy (łącznie z efektem progu zdrowotnego ryczałtu). Wspólne rozliczenie tylko dla skali (i skali + IP BOX).

---

## 9. Rzeczy niepewne i założenia (⚠️)
1. **Konwencja startu 1. dnia miesiąca**: przy starcie w trakcie miesiąca ulga trwa o jeden miesiąc dłużej, a przy braku ulgi pierwszy miesiąc byłby proporcjonalny (dni podlegania / dni miesiąca). Konwencja jest konserwatywna.
2. **Styczeń 2026 dla startujących w styczniu** (rok składkowy 2025/26, 314,96 zł): brak jasnej praktyki ZUS co do rozliczenia rocznego 2025/26 przy zerowym dochodzie 2025. Proponuję liczyć 432,54 zł za wszystkie miesiące.
3. **Kasowość odliczeń**: składki za grudzień i dopłata roczna zdrowotnej przypadają na 2027 r. Przyjmuję „należne za 2026 = odliczalne w 2026” przy założeniu zapłaty grudniowych składek w grudniu.
4. **Podział składek społecznych** między odliczenie liniowe (lub ryczałtowe) i skalę: bezpiecznie wszystko w jednym miejscu, porównując warianty. Dzielenie według wpłat jest prawdopodobnie dopuszczalne, ale nie znalazłem wiążącej interpretacji.
5. **Zdrowotna liniowego w KUP** obniża podstawę zdrowotnej (efekt kaskadowy). Opieram się na brzmieniu art. 81 ust. 2 i praktyce (ifirma, inFakt). ZUS nie wyklucza tego wprost, ale nie znalazłem też oficjalnego potwierdzenia ZUS.
6. **IP BOX a odliczenie zdrowotnej** (przy liniowym): przepis odnosi się do działalności opodatkowanej z art. 30c. Praktyka dopuszcza odliczenie od części liniowej, ale interpretacje nie są jednolite.
7. **Zbieg tytułów** (etat ≥ minimalnego → ZUS z JDG dobrowolny): pewne dla umowy o pracę. Dla zlecenia i kombinacji z preferencyjnym ZUS zasady są bardziej złożone (art. 9 ust. 2a, 2c). Kalkulator powinien pytać wprost.
8. **Wypadkowa 1,67%** dotyczy JDG zgłaszającej do 9 ubezpieczonych i niezawiadomionej przez ZUS o innej stopie, czyli typowego przypadku.
9. Nie weryfikowałem, czy od 1.01.2026 istnieją ustawowe zmiany w ubezpieczeniu chorobowym przedsiębiorców (np. okres wyczekiwania). Na kwotę składek i tak nie wpływają.

---

## Źródła
**Pierwotne (akty prawne, tekst przez API Sejmu / ELI):**
- u.s.u.s. t.j. Dz.U. 2026 poz. 199: https://api.sejm.gov.pl/eli/acts/DU/2026/199/text.pdf (art. 9, 11, 12, 17a–17b, 18 ust. 8–9, 18a, 18aa, 18c, 18d, 22, 36d)
- PIT t.j. Dz.U. 2026 poz. 592: https://api.sejm.gov.pl/eli/acts/DU/2026/592/text.pdf (art. 6 ust. 2 i 8, art. 21 ust. 1 pkt 148 i 154, art. 23 ust. 1 pkt 58, art. 26 ust. 1 pkt 2 i ust. 13a, art. 30c, art. 30ca)
- Ustawa o ryczałcie t.j. Dz.U. 2025 poz. 843: https://api.sejm.gov.pl/eli/acts/DU/2025/843/text.pdf (art. 11)
- u.ś.o.z. t.j. Dz.U. 2025 poz. 1461: https://api.sejm.gov.pl/eli/acts/DU/2025/1461/text.pdf (art. 79, 79a, 81 ust. 2–2zf)
- Prawo przedsiębiorców t.j. Dz.U. 2025 poz. 1480, art. 18: https://api.sejm.gov.pl/eli/acts/DU/2025/1480/text.pdf
- Ustawa o rynku pracy i służbach zatrudnienia, Dz.U. 2025 poz. 620, art. 259–265: https://api.sejm.gov.pl/eli/acts/DU/2025/620/text.pdf
- Ustawa budżetowa na 2026, Dz.U. 2026 poz. 62, art. 24–27: https://api.sejm.gov.pl/eli/acts/DU/2026/62/text.pdf
- M.P. 2025 poz. 1274 (limit 14 100 zł): https://api.sejm.gov.pl/eli/acts/MP/2025/1274/text.pdf
- M.P. 2025 poz. 1206 (prognozowane wynagrodzenie 9 420 zł; 30-krotność 282 600 zł)
- M.P. 2026 poz. 117 (przeciętne wynagrodzenie IV kw. 2025: 9 228,64 zł)
- Dz.U. 2025 poz. 1242 (minimalne wynagrodzenie 4 806 zł)

**ZUS:**
- Nowe wysokości składek na ubezpieczenia społeczne w 2026 r. (30.12.2025): https://www.zus.pl/-/nowe-wysoko%C5%9Bci-sk%C5%82adek-na-ubezpieczenia-spo%C5%82eczne-w-2026-r.
- Informacja w sprawie podstawy wymiaru i kwoty składki zdrowotnej w 2026 r. (2.02.2026): https://www.zus.pl/-/informacja-w-sprawie-podstawy-wymiaru-sk%C5%82adki-oraz-kwoty-sk%C5%82adki-na-ubezpieczenie-zdrowotne-w-2026-r.
- „Mały ZUS plus” – nowe zasady od 2026 r. (22.12.2025): https://www.zus.pl/-/%E2%80%9Ema%C5%82y-zus-plus-nowe-zasady-od-2026-r.
- Ulga na start, preferencyjna podstawa… (wyjaśnienia komórek merytorycznych): https://www.zus.pl/-/ulga-na-start-preferencyjna-podstawa-dzialalnosc-nieewidencjonowana-jakie-sa-warunki-uprawnienia-i-skutk-1
- Składki dla osób rozpoczynających działalność: https://www.zus.pl/firmy/rozliczenia-z-zus/skladki-preferencyjne
- Poradnik „Zasady opłacania składek na FP, FGŚP oraz FEP” (wiek 55/60, od którego miesiąca): https://www.zus.pl/documents/10182/167567/Zasady+op%C5%82acania+sk%C5%82adek+na+Fundusz+Pracy,+Fundusz+Gwarantowanych+%C5%9Awiadcze%C5%84+Pracowniczych+oraz+Fundusz+Emerytur+Pomostowych/92a5c5b1-cf05-4869-8845-538a48fd5129

**Pomocnicze:**
- Weto ustawy o składce zdrowotnej (6.05.2025): https://www.gofin.pl/17,2,7,252702,weto-prezydenta-do-zmian-w-skladce-zdrowotnej-przedsiebiorcow.html ; https://www.portalfk.pl/skladki/nie-bedzie-obnizki-skladki-zdrowotnej-dla-przedsiebiorcow-od-2026-roku-mf-potwierdza-50440.html
- Wypadkowa 1,67% od 1.04.2026: https://www.inforlex.pl/dok/tresc,FOB0000000000007551958,Skladka-wypadkowa-od-1-kwietnia-2026-r-Jak-prawidlowo-ustalic-stope-procentowa.html
- Limit 14 100 zł: https://www.bdo.pl/pl-pl/publikacje/bdo-w-mediach/2026/limit-odliczenia-skladki-zdrowotnej-w-2026-roku-wynosi-14-100-zl
- Zdrowotna liniowego w KUP a podstawa zdrowotnej: https://pomoc.ifirma.pl/pomoc-artykul/skladka-zdrowotna-koszt-lub-odliczenie-od-dochodu-podatek-liniowy/
- FP a wiek przedsiębiorcy: https://pomoc.ifirma.pl/pomoc-artykul/fundusz-pracy-po-55-lub-60-roku-zycia/
