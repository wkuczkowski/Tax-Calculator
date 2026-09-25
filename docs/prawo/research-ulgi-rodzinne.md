# Ulga na dzieci, samotny rodzic, małżonkowie a forma opodatkowania JDG: research na rok podatkowy 2026

> **Data:** 2026-09-25 (stan prawny sprawdzony 25.09.2026)  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) (sekcja 12 „Ulgi rodzinne”) albo do nowego raportu.  
> **Zakres:** ulga na dzieci (art. 27f ustawy o PIT: kwoty, limit dochodu, podział, zwrot niewykorzystanej ulgi i jego limit), preferencja samotnego rodzica (art. 6 ust. 4c–4h, ust. 8), rozliczenie wspólne małżonków a ulga, wpływ formy opodatkowania JDG, dane wejściowe i pseudokod dla kalkulatora (§6), punkty niepewne (§7), ulga dla rodzin 4+ (art. 21 ust. 1 pkt 153, §8 z pseudokodem §8.8). Na tym raporcie oparto kartę „Rodzina” w `app/`.  
> **Pierwotna nazwa pliku:** `research_children.md`. Wzmianki o `IMPL_DECISIONS` oznaczają [rejestr decyzji](../decyzje/decyzje-implementacyjne.md). Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Stan prawny sprawdzony 2026-09-25.

**Źródło podstawowe:** ustawa o PIT, t.j. Dz.U. 2026 poz. 592 (`scratchpad/pit592.txt`; PDF z https://api.sejm.gov.pl/eli/acts/DU/2026/592/text.pdf). Pozostałe źródła są wymienione w §8.

**Nowelizacje po tekście jednolitym.** Żadna z nich nie zmienia art. 6, 26, 27, 27f, 30c ani 30ca:
- DU/2026/779 zmienia w PIT tylko art. 24a (księgi i JPK).
- DU/2026/846, art. 4, zmienia art. 25b, 30f i 31d.
- DU/2026/1079 zmienia art. 21 ust. 1 pkt 23c i ust. 35–35d (marynarze).

API ELI w „Nowelizacje po tekście jednolitym” wymienia tylko 779 i 1079. Mimo to ustawa 846 w art. 4 też nowelizuje PIT; sprawdziłem jej tekst (`scratchpad/a846.txt`, wiersze 1158–1170).

**Wniosek:** w 2026 r. zasady ulgi na dzieci, preferencji dla samotnego rodzica i łącznego opodatkowania małżonków są **takie same jak w 2023–2025**. Szczegóły w §5.

---

## 1. Ulga na dzieci (art. 27f)

### 1.1 Tekst, na którym się opieramy

Art. 27f ust. 1 (str. 136):
> „Od podatku dochodowego obliczonego zgodnie z art. 27 podatnik ma prawo odliczyć kwotę obliczoną zgodnie z ust. 2 na każde małoletnie dziecko, w stosunku do którego w roku podatkowym: 1) wykonywał władzę rodzicielską; 2) pełnił funkcję opiekuna prawnego, jeżeli dziecko z nim zamieszkiwało; 3) sprawował opiekę poprzez pełnienie funkcji rodziny zastępczej […]”

Ulgę odlicza się **wyłącznie od podatku wg skali** (art. 27). Nie odlicza się jej od podatku liniowego (art. 30c), od 5% IP BOX (art. 30ca), od ryczałtu ani od daniny.

Art. 27f ust. 2 (kwoty i limity):
> „Odliczeniu podlega za każdy miesiąc kalendarzowy roku podatkowego, w którym podatnik wykonywał władzę […] w stosunku do:
> 1) jednego małoletniego dziecka – kwota 92,67 zł, jeżeli dochody podatnika:
> a) pozostającego przez cały rok podatkowy w związku małżeńskim i jego małżonka, nie przekroczyły w roku podatkowym kwoty 112 000 zł,
> b) niepozostającego w związku małżeńskim, w tym również przez część roku podatkowego, nie przekroczyły w roku podatkowym kwoty 56 000 zł, za wyjątkiem podatnika samotnie wychowującego małoletnie dziecko wymienionego w art. 6 ust. 4c i 4g, do którego ma zastosowanie kwota dochodu określona w lit. a;
> 2) dwojga małoletnich dzieci – kwota 92,67 zł na każde dziecko;
> 3) trojga i więcej małoletnich dzieci – kwota: a) 92,67 zł odpowiednio na pierwsze i drugie dziecko, b) 166,67 zł na trzecie dziecko, c) 225 zł na czwarte i każde kolejne dziecko.”

### 1.2 Kwoty

| Dziecko (liczba dzieci w danym miesiącu) | Kwota za miesiąc | Kwota za 12 miesięcy |
|---|---|---|
| 1. | 92,67 zł | 1 112,04 zł |
| 2. | 92,67 zł | 1 112,04 zł |
| 3. | 166,67 zł | 2 000,04 zł |
| 4. i każde kolejne | 225,00 zł | 2 700,00 zł |

Maksymalne kwoty roczne według broszury MF do PIT/O za 2025 r.:
- 1 dziecko: 1 112,04 zł
- 2 dzieci: 2 224,08 zł
- 3 dzieci: 4 224,12 zł
- 4 dzieci: 6 924,12 zł
- 5 dzieci: 9 624,12 zł
- 6 dzieci: 12 324,12 zł
- każde kolejne dziecko: „wzrasta maksymalnie o 2 700 zł rocznie”.

**Kwoty liczy się miesiąc po miesiącu.** Stawka zależy od liczby dzieci uprawnionych w danym miesiącu. Przykład: trzecie dziecko rodzi się w maju. Wtedy styczeń–kwiecień to 2 × 92,67 zł, a maj–grudzień to 92,67 + 92,67 + 166,67 zł.

**Miesiąc liczy się w całości.** Ust. 2 mówi o „każdym miesiącu kalendarzowym, w którym” podatnik wykonywał władzę. Miesiąc urodzenia dziecka liczy się więc w całości. Proporcja 1/30 za każdy dzień (ust. 3) dotyczy tylko sytuacji, gdy w tym samym miesiącu pieczę sprawowały różne osoby, np. rodzic, a potem rodzina zastępcza:
> „W przypadku gdy w tym samym miesiącu kalendarzowym w stosunku do dziecka wykonywana jest władza, pełniona funkcja lub sprawowana opieka […], każdemu z podatników przysługuje odliczenie w kwocie stanowiącej 1/30 kwoty obliczonej zgodnie z ust. 2 za każdy dzień sprawowania pieczy nad dzieckiem.”

**Utrata ulgi w trakcie roku** (ust. 2c): ulga nie przysługuje „poczynając od miesiąca kalendarzowego, w którym dziecko: 1) na podstawie orzeczenia sądu zostało umieszczone w instytucji zapewniającej całodobowe utrzymanie […]; 2) wstąpiło w związek małżeński.”

**Miesiąc ukończenia 25 lat** (dziecko pełnoletnie uczące się). W praktyce doradców ulga przysługuje także za ten miesiąc. Taxe.pl (02.04.2024) pisze: „Do ulgi kwalifikuje się ponadto miesiąc, w którym dziecko ukończyło 25 lat”. Nie znalazłem tego w źródle MF, dlatego punkt jest na liście niepewnych (§7). Stara baza wiedzy KIS (CIRF, 2021) mówi też, że „studenta, który ukończył studia licencjackie i nie kontynuuje nauki ulga przysługuje do października włącznie”, a dla maturzysty ulga obejmuje miesiące wakacyjne.

### 1.3 Limit dochodu: dotyczy tylko sytuacji „jedno dziecko”

**Kiedy limit nie obowiązuje wcale.** Ust. 2b:
> „Odliczenie, o którym mowa w ust. 2 pkt 2 lub 3, przysługuje podatnikowi […], który co najmniej przez jeden dzień roku podatkowego wykonywał władzę […] w stosunku do więcej niż jednego dziecka.”

MF (broszura PIT/O za 2025, s. 21) potwierdza:
> „Warunek dotyczący wysokości Twoich dochodów. Ten warunek Ciebie nie dotyczy, gdy w roku podatkowym – w tym przez jego część – miałeś co najmniej dwoje dzieci (chodzi o dzieci, które uwzględnia się dla potrzeb ulgi na dzieci) lub miałeś wyłącznie jedno dziecko z potwierdzoną niepełnosprawnością.”

Wystarczy więc choć jeden dzień z dwojgiem uprawnionych dzieci, a limit nie obowiązuje za cały rok.

**Liczą się tylko dzieci uprawnione do ulgi.** Jeśli starsze dziecko przekroczyło limit dochodu (ust. 6 w zw. z art. 6 ust. 4e), to nie liczy się. Rodzic ma wtedy „jedno dziecko” i obowiązuje go limit. Tak rozstrzygnął KIS w interpretacji 0115-KDIT2.4011.129.2025.2.KC z 28.04.2025: córka przekroczyła limit, więc ulgi na syna nie było, bo dochody małżonków przekroczyły 112 000 zł.

**Dziecko z niepełnosprawnością.** Ust. 2e:
> „Limity dochodów określone w ust. 2 pkt 1 nie dotyczą podatnika i jego małżonka, którzy wykonywali władzę […] w stosunku do jednego dziecka, posiadającego orzeczenie albo decyzję, o których mowa w art. 26 ust. 7d.”

Chodzi o orzeczenie o stopniu niepełnosprawności, rentę z tytułu niezdolności do pracy, rentę szkoleniową albo socjalną, albo orzeczenie o niepełnosprawności dziecka poniżej 16 lat.

**Wysokość limitu:**

| Sytuacja podatnika (1 dziecko, bez niepełnosprawności) | Limit | Czyje dochody się liczą |
|---|---|---|
| Małżeństwo przez **cały** rok (niezależnie od tego, czy rozliczają się wspólnie czy osobno) | **112 000 zł** | **suma** dochodów podatnika i małżonka |
| Samotny rodzic w rozumieniu art. 6 ust. 4c/4g | 112 000 zł | własne dochody |
| Pozostali: osoba niebędąca w związku małżeńskim lub będąca w nim tylko przez część roku, nie samotny rodzic (np. konkubinat z drugim rodzicem, opieka wspólna) | **56 000 zł** | własne dochody |

**Kwoty 224 000 zł w przepisach nie ma.** Dla małżonków limit to 112 000 zł łącznie, a nie 112 000 zł na każdego. Wspólne rozliczenie małżonków niczego tu nie zmienia.

Kto nie jest traktowany jako małżonek dla celów limitu i zwrotu (ust. 2d): osoba w separacji oraz osoba, której małżonek został pozbawiony praw rodzicielskich lub odbywa karę pozbawienia wolności.

**Które dochody wchodzą do limitu.** Ust. 2a:
> „Za dochody, o których mowa w ust. 2 pkt 1, uważa się dochody uzyskane łącznie w danym roku podatkowym, do których mają zastosowanie zasady opodatkowania określone w art. 27, art. 30b i art. 30c, pomniejszone o kwotę składek, o których mowa w art. 26 ust. 1 pkt 2 i 2a oraz art. 30c ust. 2 pkt 2.”

Co z tego wynika:
- **Wlicza się:**
  - dochód opodatkowany skalą (JDG na skali, etat, zlecenia i inne),
  - dochód z kapitałów z art. 30b (akcje itp.),
  - **dochód z JDG na podatku liniowym (art. 30c)**.
- **Odejmuje się:**
  - składki społeczne (art. 26 ust. 1 pkt 2 i 2a), także te odliczane od dochodu liniowego (art. 30c ust. 2 pkt 1 odsyła do art. 26),
  - składkę zdrowotną liniowca odliczoną na podstawie art. 30c ust. 2 pkt 2.

  Składka zdrowotna przy skali (i przy skali z IP BOX) nie jest odliczana, więc limitu nie obniża. Koszty uzyskania przychodów, w tym składki ujęte w kosztach, obniżają dochód już na wcześniejszym etapie.
- **Nie wlicza się:**
  - **przychodów z ryczałtu.** Potwierdza to KIS 0112-KDSL1-1.4011.40.2023.1.MW z 27.03.2023: dochód małżonka z działalności na ryczałcie nie wchodzi do limitu 112 000 zł. Z tego samego powodu nie wchodzą ryczałtowe przychody samego podatnika;
  - **dochodu kwalifikowanego IP BOX (art. 30ca).** Art. 30ca nie jest wymieniony w ust. 2a. To wykładnia literalna; nie znalazłem interpretacji, która by ją potwierdzała. Niekwalifikowana część dochodu z działalności jest opodatkowana skalą albo liniowo, więc się wlicza;
  - innych zryczałtowanych dochodów, np. odsetek z art. 30a.

MF (broszura PIT/O, s. 22) opisuje to tak:
> „Przy ustalaniu kryterium dochodowego uwzględniasz tylko te dochody (rozumiane jako przychód pomniejszony o: koszty uzyskania przychodów oraz o składki na ubezpieczenia społeczne odliczane w zeznaniu PIT–36 albo PIT–37, oraz składki na ubezpieczenia zdrowotne odliczane w zeznaniu PIT–36L), które podlegają opodatkowaniu: według skali podatkowej, 19% stawki podatku dla niektórych przychodów z kapitałów pieniężnych, o której mowa w art. 30b ustawy PIT, oraz 19% jednolitej stawki podatku dla dochodów z pozarolniczej działalności gospodarczej […], o której mowa w art. 30c ustawy PIT.”

Ten sam limit z perspektywy statusu podatnika (broszura PIT/O, s. 22):
> „masz prawo rozliczyć podatek jako osoba samotnie wychowująca dzieci (niezależnie od tego, czy z tego prawa korzystasz), to Twoje roczne dochody nie mogą przekroczyć 112 000 zł, • nie spełniasz warunków […] i jednocześnie: • pozostawałeś w związku małżeńskim przez cały 2025 rok – suma rocznych dochodów Twoich oraz małżonka nie może przekroczyć 112 000 zł, • nie pozostawałeś w związku małżeńskim w 2025 roku lub pozostawałeś w nim jedynie przez część roku – Twoje roczne dochody nie mogą przekroczyć 56 000 zł.”

**Limit działa zero-jedynkowo.** Przekroczenie limitu o 1 zł odbiera całą ulgę na jedyne dziecko (1 112,04 zł za rok). Ulga nie maleje stopniowo.

**Istotne dla kalkulatora.** Dochód liniowy z JDG wchodzi do limitu, a przychód z ryczałtu nie. Przy jednym dziecku i dochodach bliskich 112 000 zł albo 56 000 zł forma opodatkowania decyduje więc o tym, czy ulga w ogóle przysługuje.

### 1.4 Kto może skorzystać: forma opodatkowania

**(a) Rodzic na liniowym, ryczałcie lub IP BOX.** Ulga jest odliczana tylko od podatku wg skali (ust. 1). Jeśli podatnik ma **wyłącznie** dochody liniowe lub ryczałtowe, nie ma od czego jej odliczyć. Zwrotu też nie dostanie, bo ulgę wykazuje się w PIT-36/PIT-37.

podatki.gov.pl, „Ulga na dziecko PIT” (aktualizacja 24.06.2026):
> „Z ulgi nie możesz skorzystać, jeżeli uzyskujesz **wyłącznie** dochody opodatkowane: podatkiem liniowym z tytułu prowadzonej działalności gospodarczej lub działów specjalnych produkcji rolnej, ryczałtem ewidencjonowanym, kartą podatkową.”
>
> „Uwaga! Jeżeli jednak poza ww. dochodami (przychodami) uzyskujesz także dochody opodatkowane według skali podatkowej (np. wynagrodzenie za pracę, zasiłek chorobowy), to w zeznaniu podatkowym, składanym w celu rozliczenia tych dochodów, masz prawo wykazać kwotę przysługującej Ci ulgi.”

**Odpowiedź:** tak. Liniowiec lub ryczałtowiec może odliczyć ulgę od podatku wg skali od innych dochodów, np. z etatu (PIT-37 albo PIT-36). Od podatku liniowego, ryczałtu ani 5% IP BOX odliczyć jej nie może.

**(b) Art. 27f ust. 7 („Przepis art. 6 ust. 8 stosuje się odpowiednio do dzieci”) dotyczy DZIECKA, a nie rodzica.** MF (broszura PIT/O, s. 21):
> „Warunek dotyczący niekorzystania z odmiennych form opodatkowania. Ten warunek spełniasz, jeśli dziecko, z tytułu którego korzystasz z ulgi: • nie stosuje: • przepisów ustawy PIT dotyczących opodatkowania […] 19% stawką podatku (art. 30c ustawy PIT), • przepisów ustawy o ryczałcie, z wyjątkiem regulacji dotyczących tzw. prywatnego najmu […]”

Dziecko, które choćby przez część roku stosuje liniowy lub ryczałt, wypada z ulgi **za cały rok**. Tak orzekł KIS w 0112-KDSL1-1.4011.101.2024.2.DS z 17.04.2024: „nie może Pani skorzystać z ulgi prorodzinnej na to dziecko za cały 2023 rok”.

**(c) IP BOX przy skali.** Ulgę odlicza się od podatku wg skali od dochodu niekwalifikowanego i innych dochodów. Nie odlicza się jej od 5% podatku, który w PIT-36 jest doliczany osobno, w części N (poz. 429–430). Odliczenia z PIT/O są ograniczone do poz. 301, czyli podatku wg skali (broszura PIT-36 za 2025, s. 33):
> „Odliczenie w poz. 302 nie może przekroczyć kwoty z poz. 301. W przypadku łącznego opodatkowania dochodów małżonków, suma odliczeń wykazanych w poz. 302 i 303 nie może przekroczyć kwoty z poz. 301.”

**(d) Małżonek na skali, gdy podatnik jest na liniowym lub ryczałcie.** Ust. 4 pozwala dzielić ulgę „w dowolnej proporcji”. Całą ulgę może więc odliczyć małżonek od swojego podatku wg skali. Liniowy podatnika nie odbiera małżonkowi ulgi. Odbiera natomiast możliwość **wspólnego** rozliczenia (§3).

### 1.5 Podział ulgi między rodzicami (ust. 4)

> „Odliczenie dotyczy łącznie obojga rodziców, opiekunów prawnych dziecka albo rodziców zastępczych pozostających w związku małżeńskim. Kwotę tę podatnicy mogą odliczyć od podatku w dowolnej proporcji przez nich ustalonej. W przypadku braku porozumienia między podatnikami, którzy zgodnie z rozstrzygnięciem sądu wspólnie wykonują władzę rodzicielską nad małoletnim dzieckiem po rozwodzie lub w trakcie separacji (piecza naprzemienna), lub gdy miejsce zamieszkania dziecka jest takie samo jak miejsce zamieszkania obojga rodziców […] – kwotę tę podatnicy odliczają w częściach równych. W pozostałych przypadkach odliczenie w wysokości 100 % stosuje podatnik, u którego dziecko ma miejsce zamieszkania […]”

Kwota ulgi jest jedna na dziecko, a rodzice ją między siebie dzielą; każdy z nich nie dostaje pełnej kwoty. MF: „Mogą to zrobić w dowolnej proporcji przez siebie ustalonej, np. po 50%, czy w stosunku 30% do 70%, 10% do 90%.”

Przykłady z interpretacji:
- KIS 0115-KDIT2.4011.105.2026.2.MD z 15.04.2026: 100% dla matki, u której dziecko mieszka, gdy rodzice nie doszli do porozumienia.
- KIS 0112-KDSL1-1.4011.365.2026.3.MW z 19.06.2026: 50% za miesiące wspólnego zamieszkania, 100% po wyprowadzce drugiego rodzica.

### 1.6 Dzieci pełnoletnie (ust. 6)

> „Przepisy ust. 1–5 stosuje się odpowiednio do podatników utrzymujących pełnoletnie dzieci, o których mowa w art. 6 ust. 4c pkt 2 i 3, z uwzględnieniem art. 6 ust. 4e i 8, w związku z wykonywaniem przez tych podatników ciążącego na nich obowiązku alimentacyjnego oraz w związku ze sprawowaniem funkcji rodziny zastępczej.”

Są dwie kategorie dzieci pełnoletnich:
- **Art. 6 ust. 4c pkt 2:** pełnoletnie dziecko, które otrzymuje zasiłek (dodatek) pielęgnacyjny lub rentę socjalną. Nie ma tu limitu wieku ani limitu dochodu dziecka.
- **Art. 6 ust. 4c pkt 3:** dziecko pełnoletnie „do ukończenia 25. roku życia, uczące się w szkołach, o których mowa w przepisach regulujących system oświatowy lub szkolnictwo wyższe”. Dotyczy go limit dochodu z **art. 6 ust. 4e**:
  > „Przepisu ust. 4c pkt 3 nie stosuje się, jeżeli dziecko […] uzyskało w roku podatkowym: 1) dochody, z wyjątkiem renty rodzinnej, podlegające opodatkowaniu na zasadach określonych w art. 27 lub art. 30b lub 2) przychody, o których mowa w art. 21 ust. 1 pkt 148 i 152 – w łącznej wysokości przekraczającej dwunastokrotność kwoty renty socjalnej […] w wysokości obowiązującej w grudniu roku podatkowego.”
  - Za 2025 r. limit wynosi **22 546,92 zł** (MF).
  - Za 2026 r. renta socjalna od 1.03.2026 wynosi 1 978,49 zł (ZUS). Jeśli w grudniu 2026 będzie taka sama, limit wyniesie **12 × 1 978,49 = 23 741,88 zł**. Kwotę trzeba potwierdzić po grudniu (§7).
  - Do limitu wlicza się dochody dziecka ze skali i z art. 30b oraz przychody objęte ulgą dla młodych i ulgą na powrót. Renty rodzinnej się nie wlicza.
- Dziecko pełnoletnie nie może stosować liniowego ani ryczałtu (art. 6 ust. 8 przez ust. 6 i 7).

Dla kalkulatora wystarczy, że użytkownik oświadczy, czy dziecko spełnia warunki. Kalkulator nie musi liczyć dochodu dziecka.

### 1.7 Zwrot niewykorzystanej ulgi (ust. 8–12)

Ust. 8:
> „Jeżeli kwota przysługującego odliczenia na podstawie ust. 2, 3 i 4 jest wyższa od kwoty odliczonej z tytułu, o którym mowa w ust. 1, w zeznaniu […], podatnikowi przysługuje kwota stanowiąca różnicę między kwotą przysługującego podatnikowi odliczenia a kwotą odliczoną w zeznaniu podatkowym.”

Ust. 9, czyli limit zwrotu:
> „Kwota stanowiąca różnicę, o której mowa w ust. 8, nie może przekroczyć sumy:
> 1) podlegających odliczeniu składek na ubezpieczenia społeczne, o których mowa w art. 26 ust. 1 pkt 2 i 2a, pomniejszonych o składki odliczone w zeznaniu, o którym mowa w art. 45 ust. 1a pkt 2 [= PIT-36L], lub na podstawie ustawy o zryczałtowanym podatku dochodowym;
> 2) składek na ubezpieczenie zdrowotne, o których mowa w ustawie […] o świadczeniach opieki zdrowotnej […], pomniejszonych o składki odliczone w zeznaniu, o którym mowa w art. 45 ust. 1a pkt 2, lub na podstawie ustawy o zryczałtowanym podatku dochodowym;
> 3) składek na ubezpieczenia społeczne, o których mowa w art. 26 ust. 1 pkt 2 i 2a, zapłaconych ze środków podatnika od przychodów zwolnionych od podatku na podstawie art. 21 ust. 1 pkt 148 i 152–154, z wyjątkiem przychodów z pozarolniczej działalności gospodarczej, do których mają zastosowanie zasady opodatkowania określone w art. 30c, art. 30ca albo ustawie o zryczałtowanym podatku dochodowym.”

Ust. 10:
> „W przypadku odliczenia […] przysługującego pozostającym przez cały rok podatkowy w związku małżeńskim obojgu: 1) rodzicom, 2) opiekunom prawnym dziecka, 3) rodzicom zastępczym – do ustalenia wysokości składek, o których mowa w ust. 9, przyjmuje się łączną kwotę ich składek.”

Broszura PIT-36 za 2025 r. (część M, s. 33–34) mówi precyzyjnie, co się liczy:
> „W poz. 414 i 415 podatnicy wykazują sumę składek na ubezpieczenia społeczne i zdrowotne, do wysokości której przysługuje dodatkowy zwrot z tytułu ulgi na dzieci, czyli łączną kwotę:
> 1) składek na ubezpieczenia społeczne podlegających odliczeniu od dochodu w zeznaniu PIT-37, a w przypadku małżonka, który składa odrębne zeznanie PIT-36, podlegających odliczeniu również w PIT-36;
> 2) składek na ubezpieczenia społeczne, jakie podatnik (odpowiednio małżonek) zapłacił z własnych środków od przychodów objętych ulgą dla młodych, ulgą na powrót, ulgą dla rodzin 4+ lub ulgą dla pracujących seniorów. W kwocie nie uwzględnia się składek na ubezpieczenia społeczne zapłaconych od przychodów z pozarolniczej działalności gospodarczej, do których mają zastosowanie zasady opodatkowania określone w art. 30c, art. 30ca ustawy albo w ustawie o ryczałcie;
> 3) składek na ubezpieczenie zdrowotne […], jakie podatnik (odpowiednio małżonek) zapłacił z własnych środków. W kwocie tej nie uwzględnia się składek odliczonych w zeznaniu PIT-36L, PIT-28 oraz wykazanych jako odliczone w PIT-16A.”
>
> „[…] W przypadku obojga rodziców […], którzy pozostają w związku małżeńskim przez cały rok podatkowy, składających odrębne zeznania PIT-36 albo PIT-37, suma kwot z poz. »Dodatkowy zwrot z tytułu ulgi na dzieci« PIT-37 i PIT-36, każdego z małżonków, nie może przekroczyć sumy kwot z poz. 414 i 415.”

podatki.gov.pl (24.06.2026): „Przy obliczaniu kwoty dodatkowego zwrotu ulgi nie uwzględniasz składek na ubezpieczenia społeczne i zdrowotne, które zostały odliczone w: PIT-28, PIT-36L, PIT-16A.”

**Składki ujęte w kosztach nie wchodzą do limitu zwrotu.** Art. 26 ust. 13a mówi, że wydatki z ust. 1 odlicza się, „jeżeli nie zostały zaliczone do kosztów uzyskania przychodów lub nie zostały odliczone od dochodów opodatkowanych na zasadach określonych w art. 30c lub nie zostały odliczone od przychodu na podstawie ustawy o zryczałtowanym podatku dochodowym”. Składki w kosztach nie są więc składkami „podlegającymi odliczeniu” z art. 26. Poradnik Przedsiębiorcy (16.02.2026): „Jeśli podatnik odliczał składki społeczne w kosztach uzyskania przychodu, wówczas nie będzie prawa do ich wykazania w części M. zeznania PIT-36.”

**Strata z działalności nie przeszkadza.** W przykładzie z tego samego artykułu podatnik miał stratę z JDG na skali. Opłacił składki społeczne 16 287,90 zł i zdrowotne 4 446 zł. Dostał pełny zwrot 1 112,04 zł. Składki „podlegające odliczeniu” liczą się więc w całości, nawet gdy nie było dochodu, od którego można by je odliczyć.

**Zdrowotna liczy się w pełnej wysokości (9%).** Nie tylko dawne 7,75%, bo od 2022 r. zdrowotnej przy skali nie odlicza się wcale.

**FP/FS nie są składkami na ubezpieczenia społeczne.** Nie wchodzą do limitu. To wniosek z definicji art. 26 ust. 1 pkt 2 (składki według ustawy o systemie ubezpieczeń społecznych), a nie z wyraźnego zapisu.

**Co wchodzi do limitu zwrotu przy każdej formie opodatkowania** (składki własne podatnika):

| Składka | Skala / skala wspólnie / samotny rodzic | Skala + IP BOX | Liniowy (±IP BOX) | Ryczałt |
|---|---|---|---|---|
| Społeczne JDG odliczane od dochodu (art. 26) | **TAK**, w całości (także przy stracie) | **TAK** | tylko przy metodzie `scale` (odliczane od dochodu ze skali, art. 26 ust. 13a) → TAK; metoda `linear` → NIE (odliczone w PIT-36L) | tylko część odliczona od dochodu ze skali (nadwyżka nad przychodem albo metoda `scale`) → TAK; część odliczona od przychodu ryczałtowego → NIE |
| Społeczne JDG ujęte w kosztach | NIE | NIE | NIE | nie dotyczy |
| Zdrowotna JDG | **TAK**, w całości | **TAK**, w całości | część odliczona w PIT-36L lub ujęta w kosztach (limit 14 100 zł) → NIE; nadwyżka nad limit → literalnie TAK (niepewne, §7) | 50% odliczone od przychodu → NIE; pozostałe 50% → literalnie TAK (niepewne, §7) |
| Społeczne i zdrowotna od innych dochodów (etat: PIT-11) | TAK | TAK | TAK | TAK |
| Składki małżonka (małżeństwo przez cały rok, wspólne dziecko) | TAK: limit łączny (ust. 10), niezależnie od wspólnego rozliczenia | TAK | TAK | TAK |

Zwrot przysługuje tylko w zeznaniu PIT-36 albo PIT-37. Kto ma wyłącznie dochód liniowy lub ryczałtowy, nie dostaje zwrotu. To podatki.gov.pl: „Z ulgi nie możesz skorzystać, jeżeli uzyskujesz wyłącznie…”.

**Istotne dla kalkulatora.** Przy skali wybór metody odliczania składek społecznych („od dochodu” albo „w kosztach”) zmienia limit zwrotu. Jeśli zwrot jest ograniczony limitem, metoda „od dochodu” może być korzystniejsza. Optymalizator z IMPL_DECISIONS §4 musi więc liczyć zwrot przy każdej metodzie.

Kiedy limit zwrotu faktycznie ogranicza zwrot:
- JDG na skali z pełnym ZUS (≈ 20 tys. zł składek społecznych i ≥ 5 190 zł zdrowotnej): limit praktycznie nigdy nie ogranicza zwrotu.
- Ulga na start (społeczne 0, zdrowotna ≥ 12 × 432,54 = 5 190,48 zł): limit ogranicza zwrot dopiero od czworga dzieci.
- Liniowiec lub ryczałtowiec z małym etatem: limit ogranicza zwrot często.

---

## 2. Samotny rodzic (art. 6 ust. 4c–4h i ust. 8)

### 2.1 Tekst

**Art. 6 ust. 4 i 4a–4b są uchylone.** Obecna regulacja to ust. 4c–4h, obowiązujące od Polskiego Ładu z mocą od 2022 r.

Ust. 4c:
> „Od dochodów jednego rodzica lub opiekuna prawnego, podlegającego obowiązkowi podatkowemu, o którym mowa w art. 3 ust. 1, będącego panną, kawalerem, wdową, wdowcem, rozwódką, rozwodnikiem, osobą, w stosunku do której orzeczono separację […], lub osobą, której małżonek został pozbawiony praw rodzicielskich lub odbywa karę pozbawienia wolności, jeżeli ten rodzic lub opiekun w roku podatkowym samotnie wychowuje dzieci: 1) małoletnie, 2) pełnoletnie, które zgodnie z odrębnymi przepisami otrzymywały zasiłek (dodatek) pielęgnacyjny lub rentę socjalną, 3) pełnoletnie do ukończenia 25. roku życia, uczące się w szkołach […] – podatek może być określony zgodnie z ust. 4d na wniosek wyrażony w rocznym zeznaniu podatkowym.”

Ust. 4d:
> „W przypadku, o którym mowa w ust. 4c, podatek jest określany w podwójnej wysokości podatku obliczonego od połowy dochodów osoby samotnie wychowującej dzieci, z uwzględnieniem art. 7, przy czym do sumy tych dochodów nie wlicza się dochodów (przychodów) opodatkowanych w sposób zryczałtowany na zasadach określonych w niniejszej ustawie.”

Ust. 4e ustala limit dochodu dziecka uczącego się (cytat w §1.6).

Ust. 4f:
> „Sposób opodatkowania, o którym mowa w ust. 4d, nie ma zastosowania do osoby, która wychowuje wspólnie z drugim rodzicem albo opiekunem prawnym co najmniej jedno dziecko, w tym również gdy dziecko jest pod opieką naprzemienną, w związku z którą obydwojgu rodzicom zostało ustalone świadczenie wychowawcze zgodnie z art. 5 ust. 2a ustawy […] o pomocy państwa w wychowywaniu dzieci […].”

Ust. 8:
> „Sposób opodatkowania, o którym mowa w ust. 2 i 4d, nie ma zastosowania, w przypadku gdy chociażby jeden z małżonków, osoba samotnie wychowująca dziecko lub jej dziecko: 1) stosuje przepisy: a) art. 30c lub b) ustawy o zryczałtowanym podatku dochodowym, z wyjątkiem art. 6 ust. 1a tej ustawy – w zakresie osiągniętych w roku podatkowym przychodów, poniesionych kosztów uzyskania przychodów, zobowiązania lub uprawnienia do zwiększania lub pomniejszenia podstawy opodatkowania albo przychodów, zobowiązania lub uprawnienia do dokonywania innych doliczeń lub odliczeń; 2) podlega opodatkowaniu na zasadach wynikających z ustawy […] o podatku tonażowym lub ustawy […] o aktywizacji przemysłu okrętowego […].”

### 2.2 Wnioski

**Obliczenie podatku.** Podatek = 2 × podatek wg skali od połowy dochodów opodatkowanych skalą. W efekcie próg 120 000 zł i kwota zmniejszająca 3 600 zł działają podwójnie: 240 000 zł i 7 200 zł.

MF (podatki.gov.pl, „Osoba samotnie wychowująca dziecko”, 24.06.2026): „Dzielisz uzyskane przez Ciebie dochody przez 2, od tak ustalonej kwoty obliczasz podatek według skali podatkowej, tak obliczony podatek mnożysz przez 2.”

W PIT-36 podstawą jest połowa poz. 292, zaokrąglona do pełnych złotych, a podatek się podwaja.

**Preferencja obejmuje tylko dochody ze skali.** Do połowy dochodów nie wlicza się:
- dochodów zryczałtowanych,
- **dochodu kwalifikowanego IP BOX**. Broszura PIT-36 za 2025, s. 3–4: „ani kwalifikowanych dochodów z kwalifikowanych praw własności intelektualnej opodatkowanych według 5% stawki podatku oraz nie dolicza się dochodów uzyskanych przez pełnoletnie dziecko”.

**Wykluczenie przy liniowym i ryczałcie (art. 6 ust. 8).** Jeśli samotny rodzic stosuje liniowy albo ryczałt (poza najmem prywatnym), **traci preferencję w całości**, także dla dochodów ze skali, np. z etatu. To samo dotyczy sytuacji, gdy liniowy lub ryczałt stosuje jego dziecko.

Wykluczenie obejmuje każde stosowanie tych form w danym roku („w zakresie osiągniętych w roku podatkowym przychodów…”). KIS stosuje analogiczną regułę do dziecka na liniowym za cały rok (0112-KDSL1-1.4011.101.2024.2.DS).

MF, broszura PIT-36, s. 3:
> „pod warunkiem, że podatnik (oraz jego dziecko): a) nie stosuje art. 30c ustawy […] lub przepisów ustawy o ryczałcie (z wyjątkiem art. 6 ust. 1a ustawy o ryczałcie, czyli tzw. najmu prywatnego) […]”

**IP BOX (art. 30ca) nie wyklucza preferencji.** Nie jest wymieniony w ust. 8. Samotny rodzic na skali z IP BOX może więc liczyć podatek od dochodu niekwalifikowanego i innych dochodów ze skali jako 2 × podatek od połowy. Liniowy z IP BOX wyklucza preferencję, bo podatnik stosuje art. 30c.

**Dziecko musi spełniać warunki.** Dziecko małoletnie nie ma limitu dochodu. Dziecko pełnoletnie uczące się musi mieścić się w limicie z ust. 4e. Dziecko z zasiłkiem pielęgnacyjnym lub rentą socjalną nie ma limitu. W każdym przypadku dziecko nie może stosować liniowego ani ryczałtu.

**Brak pieczy wspólnej z drugim rodzicem** (ust. 4f). Wyklucza ją też piecza naprzemienna, w której oboje rodzice dostają po połowie 800+.

**Relacja z ulgą na dzieci.** Obie preferencje można łączyć. Najpierw liczy się podatek metodą 2 × połowa, potem odlicza od niego ulgę na dzieci i ewentualnie wypłaca zwrot. Dla jednego dziecka samotny rodzic ma limit 112 000 zł (art. 27f ust. 2 pkt 1 lit. b).

---

## 3. Małżonkowie: wspólne rozliczenie a ulga na dzieci

**Wspólne rozliczenie (art. 6 ust. 2) jest możliwe tylko wtedy, gdy żaden z małżonków nie stosuje liniowego ani ryczałtu** (art. 6 ust. 8). MF, broszura PIT-36: „pod warunkiem, że żaden z małżonków: a) nie stosuje art. 30c ustawy […] lub przepisów ustawy o ryczałcie […]”.

Konsekwencje dla wariantów kalkulatora:
- Wariant „skala wspólnie” i „skala + IP BOX wspólnie” zakłada, że **małżonek też nie jest na liniowym ani ryczałcie**. Trzeba to napisać w założeniach lub zapytać o to w formularzu.
- IP BOX na skali nie wyklucza wspólnego rozliczenia. Dochodu kwalifikowanego nie wlicza się do sumy dochodów (broszura PIT-36, s. 2).
- Wybór liniowego albo ryczałtu dla JDG odbiera parze wspólne rozliczenie także dla etatów obojga.

**Ulga na dzieci przy wspólnym rozliczeniu:**
- Odlicza się ją od **wspólnego** podatku (poz. 301). Suma odliczeń podatnika i małżonka nie może przekroczyć tej pozycji.
- Limit dla jednego dziecka to **112 000 zł łącznie** i nie zależy od sposobu rozliczenia. Kwoty 224 000 zł nie ma w przepisach. Podwaja się tylko próg skali (240 000 zł) i kwota zmniejszająca (7 200 zł), bo tak działa mechanizm 2 × połowa.
- Limit zwrotu to suma składek obojga małżonków (ust. 10). Przy odrębnych zeznaniach suma zwrotów obojga też nie może przekroczyć tej łącznej kwoty (broszura PIT-36, s. 34).

**Małżonkowie rozliczający się osobno:**
- Ulgę dzielą dowolnie.
- Limit dla jednego dziecka nadal liczy się od sumy dochodów obojga.
- Limit zwrotu jest łączny, gdy oboje są rodzicami dziecka i pozostają w związku przez cały rok.

---

## 4. Czego kalkulator musi się dowiedzieć (dane wejściowe) i jak to wpływa na warianty

### 4.1 Minimalny zestaw pól (sekcja „Rodzina i dzieci”)

1. **Dzieci uprawnione w 2026.** Lista dzieci albo prostsza wersja: liczba dzieci plus liczba miesięcy dla każdego. Dla każdego dziecka:
   - `rodzaj`: małoletnie / pełnoletnie uczące się do 25 lat, spełniające limit dochodu 23 741,88 zł / pełnoletnie z zasiłkiem pielęgnacyjnym lub rentą socjalną. Rodzaj wpływa tylko na opis i walidację, nie na kwotę;
   - `miesiące w 2026`: od–do, 1–12, domyślnie 12. Obejmuje urodzenie, ukończenie 25 lat (miesiąc ukończenia wlicza się), zakończenie nauki, ślub dziecka i umieszczenie w instytucji;
   - `orzeczenie o niepełnosprawności` (art. 26 ust. 7d): zwalnia z limitu dochodu, gdy dziecko jest jedyne.

   Informacja dla użytkownika: dziecko, które samo stosuje liniowy lub ryczałt, nie jest dzieckiem uprawnionym.
2. **Status**, jedna z trzech opcji:
   - (a) w związku małżeńskim przez cały 2026 r. (bez separacji);
   - (b) samotny rodzic w rozumieniu art. 6 ust. 4c–4f;
   - (c) inny: bez ślubu, ślub w trakcie roku, konkubinat, wspólna piecza.
3. **Przy (a): dane małżonka.** Są potrzebne zawsze, nie tylko do wariantu wspólnego:
   - dochód małżonka opodatkowany skalą (po kosztach i składkach społecznych), do obliczenia jego podatku i przydziału ulgi;
   - dochód małżonka liniowy lub z art. 30b, jeśli jest. Wlicza się do limitu 112 000 zł;
   - informacja „małżonek jest na liniowym albo ryczałcie”. Jeśli tak, wariant wspólny jest niedostępny;
   - składki społeczne (art. 26) i zdrowotne małżonka, do łącznego limitu zwrotu. Można je oszacować z dochodu małżonka jak dla etatu albo pominąć, ze świadomym uproszczeniem.
4. **Przy (c) i (b): udział podatnika w uldze** w procentach. Domyślnie 100% (dziecko mieszka z podatnikiem). Przy (c) z dzieckiem mieszkającym z obojgiem i bez porozumienia: 50%.
5. **Składki od „Innych dochodów”** (etat, PIT-11): społeczne i zdrowotne, potrzebne do limitu zwrotu. Pole jest opcjonalne. Proponowane oszacowanie dla etatu, gdy pole jest puste:
   - brutto G = (D + 3 000) / (1 − 0,1371), gdzie D to „Inne dochody” według O1;
   - społeczne = 13,71% · G;
   - zdrowotna = 9% · (G − społeczne).

   Alternatywa: przyjąć 0 i opisać to jako założenie ostrożne.

### 4.2 Wpływ na warianty

| Wariant | Ulga na dzieci | Samotny rodzic (4d) | Wspólnie z małżonkiem | Limit 1 dziecka: co wchodzi | Limit zwrotu (składki podatnika) |
|---|---|---|---|---|---|
| Skala indywidualnie | od podatku wg skali (JDG + inne) | TAK, jeśli spełnia warunki (wtedy jest to osobny wariant albo automatyczne „najlepsze z”) | nie dotyczy | dochód JDG po składkach społecznych + inne (+ małżonek) | społeczne z art. 26 (nie w kosztach) + zdrowotna JDG w całości + składki od innych dochodów |
| Skala wspólnie | od podatku wspólnego | nie | TAK, jeśli małżonek nie jest na liniowym ani ryczałcie | jak wyżej (zawsze suma dochodów małżonków) | suma obojga |
| Skala + IP BOX (indyw./wspólnie/samotny rodzic) | od podatku wg skali (dochód niekwalifikowany + inne), **nie od 5%** | TAK (dochód kwalifikowany IP poza połową) | TAK | dochód niekwalifikowany + inne (+ małżonek); dochód kwalifikowany 30ca literalnie poza limitem | jak przy skali |
| Liniowy (±IP BOX) | tylko od podatku wg skali od innych dochodów; brak innych dochodów oznacza brak ulgi u podatnika (może ją w całości odliczyć małżonek) | **NIE** (art. 6 ust. 8), także dla innych dochodów | **NIE** | inne dochody + **dochód liniowy** po składkach społecznych i zdrowotnej odliczonej (+ małżonek) | składki od innych dochodów + społeczne JDG tylko przy metodzie `scale` + zdrowotna JDG ponad limit odliczenia (niepewne) |
| Ryczałt (każda stawka) | tylko od podatku wg skali od innych dochodów | **NIE** | **NIE** | tylko inne dochody (+ małżonek), **bez przychodu ryczałtowego** | składki od innych dochodów + społeczne JDG odliczone od dochodu ze skali + 50% zdrowotnej nieodliczone od przychodu (niepewne) |

**Przykład** pokazujący, dlaczego trzeba to modelować. Samotna matka, 1 dziecko, etat D = 60 000 zł, JDG z dochodem 100 000 zł po składkach. Liczę tylko PIT.
- **Bez JDG** (baseline):
  - podatek = 2 × max(0; 12% · 30 000 − 3 600) = 0 zł;
  - ulga 1 112,04 zł jest w całości wypłacana jako zwrot, bo składki z etatu są większe;
  - saldo = **−1 112,04 zł**.
- **JDG na liniowym:**
  - podatek liniowy 19 000 zł;
  - etat bez preferencji samotnego rodzica: 12% · 60 000 − 3 600 = 3 600 zł;
  - limit: 60 000 + 100 000 > 112 000 zł, więc ulgi nie ma;
  - PIT razem 22 600 zł;
  - obciążenie przypisane JDG = 22 600 − (−1 112,04) = **23 712,04 zł**. Obecny model bez dzieci podałby 19 000 zł.
- **JDG na skali, samotny rodzic:**
  - 2 × (12% · 80 000 − 3 600) = 12 000 zł;
  - ulgi nie ma, bo limit jest przekroczony;
  - obciążenie przypisane JDG = **13 112,04 zł**.

Dla porównania obecny model, który pomija status i ulgę:
- skala indywidualnie: 10 800 + 32% · 40 000 − 3 600 = **20 000 zł**;
- liniowy: **19 000 zł**.

Obecny model wskazuje więc liniowy jako lepszy o 1 000 zł. Po uwzględnieniu statusu i ulgi lepsza jest skala, o **10 600 zł**. Wynik odwraca się przez utratę metody 2 × połowa i utratę ulgi, obie spowodowane przez JDG. Do tego dochodzą różnice w składce zdrowotnej, których ten przykład nie liczy.

---

## 5. Zmiany w 2026 r.

- **Brak zmian w art. 6 ust. 4c–4h, art. 6 ust. 8 i art. 27f** w t.j. Dz.U. 2026 poz. 592 i w nowelizacjach 779, 846 i 1079 (sprawdzone w tekstach). Kwoty 92,67 / 166,67 / 225 zł i limity 112 000 / 56 000 zł są takie same od lat.
- **Limit dochodu dziecka pełnoletniego** jest powiązany z rentą socjalną. Od 1.03.2026 renta wynosi 1 978,49 zł (waloryzacja 105,3%). Limit za 2026 r. wyniesie prawdopodobnie 23 741,88 zł (za 2025 r.: 22 546,92 zł).
- **Projekty, które nie weszły w życie:**
  - prezydencki „PIT Zero. Rodzina na plus”, druk 1898: zwolnienie z PIT do 140 tys. zł dochodu dla rodziców co najmniej dwojga dzieci. Według API Sejmu jest na etapie „skierowano do I czytania”, 4.11.2025;
  - poselski projekt, druk 824: m.in. podwyższenie limitu dla jednego dziecka i ulgi 4+ do 120 tys. zł. Stanowisko rządu 18.04.2025, projekt nieuchwalony.

  Żaden z nich nie jest prawem na 2026 r.
- **Powiązana ulga, której kalkulator nie obejmuje (do rozważenia).** Ulga dla rodzin 4+, art. 21 ust. 1 pkt 153:
  > „przychody podatnika do wysokości nieprzekraczającej w roku podatkowym kwoty 85 528 zł, osiągnięte: […] c) z pozarolniczej działalności gospodarczej, do których mają zastosowanie zasady opodatkowania określone w art. 27, art. 30c albo art. 30ca albo ustawie o zryczałtowanym podatku dochodowym w zakresie ryczałtu od przychodów ewidencjonowanych […] – który w roku podatkowym w stosunku do co najmniej czworga dzieci, o których mowa w art. 6 ust. 4c […] wykonywał władzę rodzicielską […]”

  Przy czworgu lub więcej dzieciach ta ulga zmienia porównanie form bardziej niż sama ulga na dzieci. Zwalnia przychód, także ryczałtowy. Mechanika i propozycja modelu są w §8.

---

## 6. Proponowany algorytm (pseudokod)

```text
STAŁE_2026:
  RATE = [92.67, 92.67, 166.67, 225.00]      // 1., 2., 3., 4.+ dziecko w miesiącu
  LIMIT_MARRIED = 112000; LIMIT_SINGLE_PARENT = 112000; LIMIT_OTHER = 56000
  // Brak kwoty 224 000.

WEJŚCIE:
  children[]: {months: Set<1..12>, disabled: bool}
  status ∈ {MARRIED_FULL_YEAR, SINGLE_PARENT, OTHER}
  userShare ∈ [0,1]                  // dla SINGLE_PARENT/OTHER (domyślnie 1); przy MARRIED liczone optymalnie
  spouse?: {scaleIncome, linearIncome, contribCap, onLinearOrRyczalt: bool}
  other: {income D (po kosztach i składkach), contribSocial, contribHealth}

// 1. Kwota ulgi dla gospodarstwa (przed limitem)
function childReliefTotal():
  U = 0
  for m in 1..12:
    n = count(c in children where m ∈ c.months)
    for k in 1..n: U += RATE[min(k,4)-1]
  return round2(U)

// 2. Test limitu (tylko gdy przez cały rok było jedno uprawnione dziecko)
function limitApplies():
  maxKids = max over days (≈ months) of count(eligible)   // ust. 2b: ≥2 choć 1 dzień → brak limitu
  if maxKids >= 2: return false
  if the only child is disabled: return false             // ust. 2e
  return true

function limitIncome(variant, withBusiness):
  // art. 27f ust. 2a: dochody z art. 27, 30b, 30c po składkach społecznych i zdrowotnej liniowej
  inc = max(0, other.D)
  if withBusiness:
    if variant ∈ {SKALA*, }:          inc += max(0, businessScaleIncome_afterSocial)   // bez dochodu kwalifikowanego IP BOX
    if variant ∈ {SKALA_IPBOX*}:      inc += max(0, nonQualifiedIncome_afterSocial)
    if variant ∈ {LINIOWY*}:          inc += max(0, linearIncome - social - healthDeductedLinear)
    if variant ∈ {RYCZALT*}:          inc += 0                                     // KIS 0112-KDSL1-1.4011.40.2023.1.MW
    // składki społeczne odliczane od innych dochodów (metoda `scale`) też obniżają sumę
  if status == MARRIED_FULL_YEAR: inc += spouse.scaleIncome + spouse.linearIncome
  return inc

function reliefAfterLimit(variant, withBusiness):
  U = childReliefTotal()
  if limitApplies():
    L = (status == OTHER) ? LIMIT_OTHER : 112000
    if limitIncome(variant, withBusiness) > L: return 0   // zero-jedynkowo
  return U

// 3. Podatek wg skali podatnika (tylko część z art. 27)
function scaleTaxUser(variant, withBusiness, mode):   // mode ∈ {INDIV, JOINT, SINGLE_PARENT}
  S = other.D + (withBusiness && variant ∈ SKALA* ? scaleBusinessIncome : 0)
      − socialDeductedFromScaleIncome(variant)        // art. 26, zgodnie z wybraną metodą
  S = max(0, S)                                       // strata JDG nie obniża innych dochodów
  if mode == SINGLE_PARENT: return 2 * T(S/2)          // art. 6 ust. 4d; IP BOX-kwalif. poza S
  if mode == JOINT:         return 2 * T((S + spouse.scaleIncome)/2)
  return T(S)

function allowedModes(variant, withBusiness):
  modes = {INDIV}
  linOrRycz = withBusiness && variant ∈ {LINIOWY*, RYCZALT*}
  if status == SINGLE_PARENT && !linOrRycz: modes += SINGLE_PARENT     // art. 6 ust. 8
  if status == MARRIED_FULL_YEAR && !linOrRycz && !spouse.onLinearOrRyczalt: modes += JOINT
  return modes

// 4. Limit zwrotu (ust. 9–10), składki podatnika
function refundCapUser(variant, withBusiness, deductionMethod):
  cap = other.contribSocial + other.contribHealth
  if withBusiness:
    switch variant:
      SKALA*, SKALA_IPBOX*:
        cap += (deductionMethod == 'income') ? socialPaid : 0         // w kosztach → 0
        cap += healthPaid                                           // w całości
      LINIOWY*:
        cap += (deductionMethod == 'scale') ? socialDeductedOnScale : 0
        cap += max(0, healthPaid − healthDeductedOrKUP)              // NIEPEWNE: wariant ostrożny = 0
      RYCZALT*:
        cap += socialDeductedOnScale                                 // nadwyżka z art. 26 ust. 13a lub metoda 'scale'
        cap += healthPaid − healthDeductedFromRevenue                // NIEPEWNE: ostrożnie = 0
  return cap
  // FP/FS nigdy nie wchodzą.

// 5. Saldo gospodarstwa w danym wariancie
function household(variant, withBusiness):
  best = +∞
  for mode in allowedModes(variant, withBusiness):
    for method in deductionMethods(variant):                 // IMPL_DECISIONS §4, rozszerzone o zwrot
      U  = reliefAfterLimit(variant, withBusiness)
      Tu = scaleTaxUser(variant, withBusiness, mode)
      if status == MARRIED_FULL_YEAR:
        if mode == JOINT:
          used = min(U, Tu)                                  // Tu = podatek wspólny
          taxScale = Tu − used
          capAll = refundCapUser(...) + spouse.contribCap    // ust. 10
        else:
          Ts = T(spouse.scaleIncome)
          used = min(U, Tu + Ts)                             // dowolny podział ust. 4 → optymalnie
          taxScale = Tu + Ts − used
          capAll = refundCapUser(...) + spouse.contribCap
      else:
        Uu = U * userShare
        used = min(Uu, Tu); taxScale = Tu − used
        capAll = refundCapUser(...)
        U = Uu
      // warunek formalny: zwrot tylko gdy podatnik (lub małżonek) składa PIT-36/37 z dochodem ze skali
      hasScaleReturn = (S_user > 0 || variant ∈ SKALA*) || (married && spouse.scaleIncome > 0)
      refund = hasScaleReturn ? min(U − used, capAll) : 0
      total = taxScale + linearTax + ipBox5Tax + ryczaltTax + danina − refund
              + (withBusiness ? healthJDG + socialJDG : 0)
      best = min(best, total)
  return best

// 6. Wynik wariantu = obciążenie przypisane JDG
H0 = household(ANY, withBusiness=false)      // baseline: najlepszy legalny tryb bez JDG
                                             // (samotny rodzic dostępny, wspólnie wg decyzji §7 pkt 1)
result(variant) = household(variant, true) − H0
// H0 jest stałe dla wszystkich wariantów, więc nie wpływa na ranking, tylko na pokazane kwoty.
```

Uwagi do implementacji:
- `T(x)` to wzór z R3: `max(round2(12%·x) − 3600, 0)` do 120 000 zł, powyżej `10 800 + round2(32%·(x − 120 000))`.
- Ulgę i zwrot liczymy w groszach. W zeznaniu podatek należny zaokrągla się do złotych, ale kalkulator tego nie robi (IMPL R2 i §7).
- Kolejność w PIT-36:
  1. podatek wg skali (poz. 296),
  2. odliczenia z PIT/O, w tym ulga na dzieci (≤ poz. 301),
  3. podatek należny (poz. 306),
  4. doliczenie 5% IP BOX (poz. 429),
  5. na końcu osobno zwrot ulgi (poz. 418).
- Danina (art. 30h) nie zależy od ulgi.
- W szczegółach wyniku trzeba pokazać:
  - kwotę ulgi przysługującej (przed limitem i po nim) oraz wynik testu limitu, z liczbą z porównania;
  - kwotę odliczoną od podatku, zwrot i limit zwrotu;
  - utratę preferencji samotnego rodzica albo wspólnego rozliczenia, gdy wynika z formy opodatkowania.

---

## 7. Punkty niepewne i decyzje do podjęcia

1. **Baseline dla małżonków (decyzja).** Obecne O2/B3: baseline = PIT od „innych dochodów” liczony indywidualnie + PIT małżonka liczony samodzielnie. Z dziećmi trzeba do baseline dodać optymalny przydział ulgi i zwrot. Otwarte pytanie: czy baseline ma być „najlepsze z: osobno / wspólnie”? Baseline jest stały dla wszystkich wariantów, więc zmienia tylko pokazane kwoty, nie ranking. Rekomendacja: osobno plus optymalny podział ulgi, dla spójności z B3. Wspólne rozliczenie w baseline można opisać w założeniach.
2. **Limit dla jednego dziecka u samotnego rodzica, który jest na liniowym lub ryczałcie:** 112 000 zł czy 56 000 zł? Ustawa (ust. 2 pkt 1 lit. b) mówi o podatniku „samotnie wychowującym […] wymienionym w art. 6 ust. 4c i 4g”, czyli odwołuje się do statusu, a nie do prawa do metody 4d. MF w broszurze PIT/O pisze jednak „masz prawo rozliczyć podatek jako osoba samotnie wychowująca dzieci”, a liniowiec tego prawa nie ma (art. 6 ust. 8). Interpretacji na ten temat nie znalazłem. Wariant ostrożny: 56 000 zł. Wariant literalny: 112 000 zł.
3. **Zdrowotna liniowca przy limicie zwrotu.** Część ujęta w kosztach (a nie „odliczona w zeznaniu PIT-36L”) oraz nadwyżka ponad limit 14 100 zł: literalnie wchodzą do limitu (ust. 9 pkt 2 odejmuje tylko składki „odliczone w zeznaniu”). Brak potwierdzenia MF. Wariant ostrożny: cała zdrowotna liniowca poza limitem zwrotu.
4. **50% zdrowotnej ryczałtowca, której nie odlicza się od przychodu.** Literalnie oraz według MF („nie uwzględniasz składek … które zostały odliczone w PIT-28”) wchodzi do limitu zwrotu w PIT-37. Brak interpretacji. Wariant ostrożny: 0.
5. **Dochód IP BOX (30ca) poza limitem 112 000 / 56 000 zł.** Wynika literalnie z ust. 2a. Brak interpretacji.
6. **Strata z JDG a limit dochodu.** Założenie: suma dochodów ze źródeł, strata nie pomniejsza innych dochodów (art. 9 ust. 2), dochód JDG = max(0, …). Nie potwierdzono interpretacją.
7. **Miesiąc ukończenia 25 lat** wliczany do ulgi: praktyka doradców (taxe.pl), bez cytatu MF.
8. **Limit dochodu dziecka za 2026 = 23 741,88 zł.** Zakłada, że renta socjalna w grudniu 2026 będzie taka sama jak od marca (1 978,49 zł). Kalkulator może tylko pokazać tę informację; dochodu dziecka nie liczy.
9. **Limit zwrotu przy odrębnych zeznaniach małżonków.** Suma zwrotów obojga ≤ suma składek obojga (broszura PIT-36). Przy optymalnym przydziale wystarczy liczyć na poziomie gospodarstwa. Przy przydziale ręcznym kalkulator musiałby dzielić limit.
10. **Szacowanie składek od „Innych dochodów”**, gdy użytkownik ich nie poda. Formuła dla etatu z KUP 250 zł/mies. jest przybliżeniem i przy zleceniach nie działa. Proponuję pole opcjonalne z domyślną wartością szacowaną, oznaczoną w założeniach.
11. **Formularze za 2026 r.** (PIT-36/37/O w wersji na 2026) nie są jeszcze opublikowane. Cytowane broszury dotyczą 2025 r. Przepisy się nie zmieniły, ale numery pozycji mogą być inne.
12. **Ulga dla rodzin 4+** (art. 21 ust. 1 pkt 153): osobne punkty niepewne są w §8.9.
13. **Pojęcie „samotnie wychowuje”** (np. konkubinat z partnerem, który nie jest rodzicem dziecka) jest kwestią faktów. Kalkulator przyjmuje oświadczenie użytkownika.

---

## 8. Ulga dla rodzin 4+ (art. 21 ust. 1 pkt 153): mechanika dla kalkulatora JDG

Stan prawny: t.j. Dz.U. 2026 poz. 592.
- Nowelizacje 779, 846 i 1079 nie zmieniają art. 21 ust. 1 pkt 153, ust. 39, 44–48, art. 22 ust. 3a ani art. 23 ust. 10.
- Ustawa 1079 zmienia w art. 21 tylko ust. 1 pkt 23c i ust. 35–35d.
- W art. 22 przypis 29 (ustawa 2025/1838, od 1.01.2026) dotyczy nowego ust. 1v (umorzenie akcji przez BFG), a nie ust. 3a.

### 8.1 Przepis i przychody objęte zwolnieniem

Art. 21 ust. 1 pkt 153 (s. 52–53):
> „przychody podatnika do wysokości nieprzekraczającej w roku podatkowym kwoty 85 528 zł, osiągnięte:
> a) ze stosunku służbowego, stosunku pracy, pracy nakładczej i spółdzielczego stosunku pracy,
> b) z umów zlecenia, o których mowa w art. 13 pkt 8,
> c) z pozarolniczej działalności gospodarczej, do których mają zastosowanie zasady opodatkowania określone w art. 27, art. 30c albo art. 30ca albo ustawie o zryczałtowanym podatku dochodowym w zakresie ryczałtu od przychodów ewidencjonowanych,
> d) z zasiłku macierzyńskiego […]
> – który w roku podatkowym w stosunku do co najmniej czworga dzieci, o których mowa w art. 6 ust. 4c, z uwzględnieniem art. 6 ust. 4e i 8, wykonywał władzę rodzicielską, pełnił funkcję opiekuna prawnego, jeżeli dziecko z nim zamieszkiwało, lub sprawował funkcję rodziny zastępczej […], a w przypadku pełnoletnich uczących się dzieci – wykonywał ciążący na nim obowiązek alimentacyjny albo sprawował funkcję rodziny zastępczej, z zastrzeżeniem ust. 39 i 44–48”

**Co jest objęte:**
- przychód z JDG przy każdej formie opodatkowania: **skala, liniowy, IP BOX (30ca), ryczałt od przychodów ewidencjonowanych**;
- etat;
- zlecenie z art. 13 pkt 8 (zawarte z firmą);
- zasiłek macierzyński.

**Co nie jest objęte:**
- karta podatkowa;
- najem prywatny na ryczałcie (to nie jest działalność gospodarcza);
- umowy o dzieło;
- kapitały.

MF, przewodnik „PIT-0. Ulga dla rodzin 4+” (stan na 31.12.2024):
> „Ulga obejmuje przychody: […] z działalności gospodarczej, opodatkowane według skali podatkowej, 19% podatkiem liniowym, stawką 5% (tzw. ulga IP Box) oraz ryczałtem od przychodów ewidencjonowanych.”

Ten sam przewodnik, pytanie o liniowy:
> „Wychowuję czworo małoletnich dzieci i prowadzę działalność gospodarczą opodatkowaną podatkiem liniowym. Czy mogę skorzystać z ulgi dla rodzin 4+? Tak, ulga dla rodzin 4+ obejmuje także przychody z działalności gospodarczej opodatkowanej podatkiem liniowym.”

**Zwalniany jest PRZYCHÓD, nie dochód.** Forma opodatkowania rodzica nie ma znaczenia; wykluczenie z art. 6 ust. 8 dotyczy tylko dzieci. Inaczej niż przy uldze na dzieci i samotnym rodzicu, **liniowiec i ryczałtowiec korzystają z tej ulgi w pełni**.

### 8.2 Limit 85 528 zł

Art. 21 ust. 44:
> „Suma przychodów zwolnionych od podatku na podstawie ust. 1 pkt 148 i 152–154 nie może w roku podatkowym przekroczyć kwoty 85 528 zł.”

- **Jeden roczny limit na podatnika.** Wszystkie źródła z pkt 153 (etat, zlecenie, JDG, macierzyński) dzielą go między siebie. Limit jest też wspólny z ulgą dla młodych (pkt 148), ulgą na powrót (pkt 152) i ulgą dla pracujących seniorów (pkt 154).
- MF: „Kwota 85 528 zł jest wspólnym limitem w ramach ulg: dla rodzin 4+, dla młodych, na powrót i dla pracujących seniorów.”
- Broszura PIT-36 za 2025, s. 10: „Limit ten przysługuje odrębnie podatnikowi oraz małżonkowi i dotyczy również przychodów z pozarolniczej działalności gospodarczej objętych tymi ulgami.”
- **Kwota jest wpisana na stałe w ustawie.** Nie ma mechanizmu waloryzacji. Wynosi tyle samo od 2019 r. (ulga dla młodych) i od 2022 r. (4+).
  - **2026: 85 528 zł.**
  - **2027: 85 528 zł**, chyba że ustawa zostanie zmieniona. Poselski druk 824 proponował dla 4+ kwotę 120 000 zł, ale nie został uchwalony (§5).
- **Ulga nie jest proporcjonalna do miesięcy.** Limit jest roczny, a zwolnienie obejmuje przychód z całego roku. KIS 0115-KDIT2.4011.544.2023.1.AB z 17.05.2023 (cytowane za Infor, 29.12.2025): podatnik **może wybrać źródło**, które będzie zwolnione. W ramach źródła „zwolnienie stosuje się od początku roku podatkowego do momentu wyczerpania limitu 85 528 zł”.
- **Ryczałt z kilkoma stawkami.** O tym, który przychód jest zwolniony, decyduje **data jego uzyskania**, czyli kolejność chronologiczna. Źródło: odpowiedź MF z 18.04.2023, znana tylko z drugiej ręki (Gofin, „Przegląd Podatku Dochodowego”; tekstu nie udało się pobrać, bo zwraca 403). Stawki ryczałtu stosuje się do przychodu opodatkowanego, więc różne stawki nie wpływają na samo prawo do zwolnienia.

### 8.3 Koszty przy częściowym zwolnieniu

**Koszty odlicza się w całości, bez proporcji.**

Art. 22 ust. 3a wyłącza zasadę proporcji (ust. 3) dla przychodów z JDG zwolnionych z pkt 153:
> „Zasadę, o której mowa w ust. 3, stosuje się również w przypadku, gdy część dochodów z tego samego źródła przychodów podlega opodatkowaniu, a część jest wolna od opodatkowania, z wyłączeniem źródeł przychodów określonych w art. 10 ust. 1 pkt 1 i 2 oraz przychodów, o których mowa w art. 21 ust. 1 pkt 152 lit. c, pkt 153 lit. c i pkt 154 w zakresie przychodów z pozarolniczej działalności gospodarczej.”

Art. 23 ust. 10:
> „Przepisu ust. 1 pkt 31 nie stosuje się do kosztów uzyskania przychodów poniesionych w celu uzyskania przychodów zwolnionych na podstawie art. 21 ust. 1 pkt 152–154.”

Potwierdza to KIS 0114-KDIP2-2.4011.243.2022.1.IN z 12.05.2022: wszystkie koszty działalności są kosztami podatkowymi, także te związane z przychodem zwolnionym.

**Strata jest możliwa**, gdy koszty przekraczają przychód opodatkowany. Taką stratę można przenieść na kolejne lata. Art. 9 ust. 3a pkt 4 lit. b wyłącza zakaz rozliczania strat ze źródeł zwolnionych dla „strat […] związanych z przychodami, o których mowa w art. 21 ust. 1 pkt 152 lit. c, pkt 153 lit. c i pkt 154 w zakresie przychodów z pozarolniczej działalności gospodarczej”.

Efekt: przy skali i liniowym dochód do opodatkowania = przychód − zwolnienie − **wszystkie** koszty. Zwolnienie przychodu działa więc jak dodatkowy koszt 85 528 zł.

**Etat to inny mechanizm.** Koszty kwotowe mogą wynieść najwyżej tyle, ile opodatkowany przychód ze stosunku pracy (art. 22 ust. 3b). Składki od zwolnionej części pensji nie podlegają odliczeniu (art. 26 ust. 1 pkt 2 in fine). Nie dotyczy to JDG, bo tam podstawą składek jest zadeklarowana kwota, a nie przychód.

### 8.4 Składka zdrowotna, progi ryczałtu, składki społeczne

**Składka zdrowotna: ulga jej nie obniża** (przy skali, liniowym, IP BOX i ryczałcie). Ustawa o świadczeniach, art. 81 ust. 2zd:
> „Ilekroć w ust. 2, 2b–2c, 2d–2f, 2g i 2h–2zc jest mowa o przychodach lub kosztach ich uzyskania […], nie uwzględnia się w tych przychodach i kosztach ich uzyskania: […] 2) przychodów niepodlegających opodatkowaniu podatkiem dochodowym innych niż określone w art. 21 ust. 1 pkt 63a, 63b i 152–154 ustawy […] o podatku dochodowym od osób fizycznych”

(Dz.U. 2025 poz. 1461, `scratchpad/uzdr.txt` w. 5715–5723.)

Przychody zwolnione z pkt 153 **są więc uwzględniane**:
- przy skali, liniowym i IP BOX podstawą zdrowotnej jest pełny dochód: przychód z częścią zwolnioną − koszty − składki społeczne;
- przy ryczałcie próg 60 000 / 300 000 zł liczy się od pełnego przychodu, zmniejszonego tylko o składki społeczne według art. 81 ust. 2g.

Poradnik Przedsiębiorcy (13.03.2025): „Ulga dla rodzin 4+ nie ma wpływu na wysokość składki zdrowotnej”. W praktyce podatnik może mieć PIT = 0 i nadal płacić pełną składkę zdrowotną.

**Składki społeczne JDG** (art. 26 ust. 1 pkt 2 lit. a albo art. 11 ustawy o ryczałcie):
- **odlicza się je w pełnej wysokości.** Wykluczenie w art. 26 ust. 1 pkt 2 in fine („składek, których podstawę wymiaru stanowi dochód (przychód) zwolniony”) nie ma zastosowania, bo podstawą składek JDG jest zadeklarowana kwota. Tak piszą Poradnik Przedsiębiorcy (27.02.2023) i praktyka; nie znalazłem interpretacji z sygnaturą;
- odlicza się je od **opodatkowanej** części dochodu lub przychodu, więc po zwolnieniu miejsca na odliczenie jest mniej;
- nadwyżkę przy ryczałcie przenosi się do skali (art. 26 ust. 13a), jak w R1;
- przy skali to, czy nadwyżka przepada, zależy od metody odliczenia (optymalizator §4 już to uwzględnia).

**Składka zdrowotna odliczana przez liniowca** (limit 14 100 zł) i **50% zdrowotnej ryczałtowca**: odlicza się je jak dotąd. Przy liniowym faktycznie ogranicza je wysokość opodatkowanego dochodu. Przy ryczałcie ogranicza je opodatkowany przychód; tu nadwyżka przepada (F4).

**Danina (art. 30h):** przychód zwolniony nie jest w dochodzie opodatkowanym, więc nie wchodzi do podstawy daniny.

### 8.5 Warunki

**Czworo dzieci „w roku podatkowym”, wystarczy jeden dzień.** Zwolnienie obejmuje wtedy przychody z **całego** roku. MF, przewodnik:
> „warunek posiadania czworga dzieci nie musi być spełniony przez cały rok podatkowy. Jeżeli np. czwarte dziecko urodziło się w grudniu danego roku, to podatnik, składając zeznanie podatkowe za ten rok […], może skorzystać z tej ulgi.”

**Które dzieci się liczą:**
- dzieci z art. 6 ust. 4c: małoletnie; pełnoletnie z zasiłkiem pielęgnacyjnym lub rentą socjalną; pełnoletnie uczące się do 25 lat;
- **dziecko pełnoletnie uczące się, które przekroczy limit dochodu** (12 × renta socjalna z grudnia; za 2026 r. prawdopodobnie 23 741,88 zł, §1.6), **wypada na cały rok**. MF: „tracisz prawo do ulgi dla rodzin 4+ za cały rok podatkowy”;
- dziecko, które stosuje liniowy lub ryczałt, **wypada na cały rok** (art. 6 ust. 8);
- **dziecko umieszczone w instytucji na podstawie orzeczenia sądu** wypada na **cały rok**, a nie od miesiąca umieszczenia. Art. 21 ust. 45: „nie uwzględnia się dziecka, które w roku podatkowym, na podstawie orzeczenia sądu, zostało umieszczone w instytucji zapewniającej całodobowe utrzymanie”. To surowsza reguła niż w art. 27f ust. 2c.

**Władza rodzicielska:**
- Trzeba mieć władzę rodzicielską **i faktycznie ją wykonywać**, a nie tylko formalnie ją posiadać.
- KIS 0112-KDIL2-1.4011.106.2026.2.MKA z 06.03.2026: ojciec z władzą rodzicielską, ograniczonymi kontaktami, płacący alimenty i uczestniczący w decyzjach **zachował** prawo do ulgi.
- Rodzic **pozbawiony** władzy rodzicielskiej nie wykonuje jej, więc to dziecko się nie liczy.
- Pozbawienie władzy w trakcie roku: przepis mówi „w roku podatkowym […] wykonywał”, więc literalnie wystarczy okres przed pozbawieniem (analogia do reguły „choćby jeden dzień”). Nie znalazłem interpretacji na ten temat, dlatego punkt jest niepewny.

**Macocha lub ojczym bez przysposobienia nie ma prawa do ulgi.** MF: „będzie mógł skorzystać wyłącznie mąż, który wykonuje wobec swoich dzieci władzę rodzicielską”. Każde z rodziców musi mieć co najmniej czworo „swoich” dzieci. W rodzinie patchworkowej 2 + 2 ulga nie przysługuje nikomu.

**Formalności:**
- JDG wykazuje dzieci w zeznaniu (PIT-36, PIT-36L, PIT-28), zgodnie z art. 21 ust. 46 pkt 2;
- w PIT-36 zaznacza się poz. 63 i dołącza PIT/O z częścią E, w której są co najmniej 4 dzieci.

### 8.6 Relacja z ulgą na dzieci (art. 27f)

- **Ulgi się nie wykluczają.** MF: „Korzystanie z ulgi dla rodzin 4+ nie wyklucza możliwości skorzystania z ulgi na dzieci.”
- **Limit 112 000 / 56 000 zł z art. 27f nie ma zastosowania**, bo przy czworgu lub więcej dzieciach jest więcej niż jedno dziecko (ust. 2b). Przychód zwolniony i tak nie jest dochodem „do którego mają zastosowanie zasady opodatkowania określone w art. 27, 30b, 30c” (ust. 2a).
- **Po zwolnieniu podatek wg skali jest niski.** Ulga na dzieci wynosi co najmniej 6 924,12 zł rocznie przy czworgu dzieciach przez 12 miesięcy, więc często **przechodzi w zwrot** (§1.7). Limit zwrotu zaczyna wtedy realnie ograniczać kwotę.
  - Art. 27f ust. 9 pkt 3 dodaje do limitu składki społeczne od przychodów zwolnionych, ale z wyłączeniem JDG na liniowym, IP BOX i ryczałcie.
  - Przy JDG na skali składki społeczne są w limicie i tak, przez pkt 1, jako składki z art. 26. Nie liczy się ich podwójnie.
  - MF: „Co do zasady przychody objęte ulgą dla rodzin 4+ podlegają ubezpieczeniom społecznym i zdrowotnym. Składki te mogą być uwzględniane w limicie składek dla potrzeb zwrotu niewykorzystanej ulgi na dzieci.”
- **Ulga na dzieci nadal odlicza się tylko od podatku wg skali.** Liniowiec lub ryczałtowiec z 4+ korzysta ze zwolnienia przychodu JDG, ale ulgi na dzieci od podatku liniowego ani ryczałtu nie odliczy (§1.4).
- **Zbiór dzieci różni się między ulgami.** Dziecko umieszczone w instytucji w trakcie roku liczy się do ulgi na dzieci za miesiące przed umieszczeniem, ale do 4+ nie liczy się wcale. Kalkulator potrzebuje więc osobnej flagi 4+, a nie tylko liczby dzieci.

### 8.7 Małżonek

- **Każdy rodzic ma własny limit 85 528 zł**, niezależnie od stanu cywilnego. Ulga nie wymaga małżeństwa ani wspólnego rozliczenia.
- MF: „Zwolnieniu podlega kwota przychodu nieprzekraczająca 85 528 zł w roku podatkowym u każdego z rodziców lub opiekunów prawnych.”
- Przykład MF: żona na etacie (65 000 zł, w całości zwolnione) i mąż na ryczałcie (115 000 zł, zwolnione do 85 528 zł). Każde z nich korzysta z ulgi.
- **Wspólne rozliczenie** (tylko skala lub IP BOX): każdy małżonek najpierw zwalnia swoje przychody, potem sumuje się dochody opodatkowane (broszura PIT-36: odrębne pozycje dla podatnika i małżonka, poz. 67–76).
- **Samotny rodzic (4d):** ulga 4+ jest z nim zgodna.

### 8.8 Werdykt: czy da się to jednoznacznie zamodelować?

**TAK dla przypadku podstawowego:**
- przychód z JDG na skali, liniowym albo ryczałcie z **jedną** stawką;
- „Inne dochody” już po ich własnym zwolnieniu (jak w O1);
- użytkownik podaje, jaka część limitu została zużyta na inne przychody (np. przez pracodawcę albo przez ulgę dla młodych).

Wybór źródła należy do podatnika (KIS 0115-KDIT2.4011.544.2023.1.AB). Model „reszta limitu na JDG” jest więc legalny, choć nie zawsze optymalny. Przykład: przy ryczałcie 3% i etacie w progu 32% bardziej opłaca się zwolnić etat.

**NIEJEDNOZNACZNE:**
- **Ryczałt z kilkoma stawkami:** o tym, który przychód jest zwolniony, decyduje chronologia (MF 18.04.2023, z drugiej ręki), a kalkulator nie zna dat przychodów.
- **IP BOX:** podział zwolnienia między przychód kwalifikowany i niekwalifikowany. Ta sama zasada chronologiczna, brak interpretacji.
- **Optymalny wybór między etatem a JDG:** wymaga przychodu brutto z etatu, jego kosztów i składek, a tych pól kalkulator nie ma.
- **Strata JDG po zwolnieniu:** przechodzi na kolejne lata; kalkulator jej nie modeluje (IMPL §7).

```text
FOUR_PLUS_LIMIT = 85528                         // 2026; 2027 bez zmian, jeśli ustawa nie zostanie zmieniona
input fourPlus: bool                            // ≥4 dzieci (art. 6 ust. 4c, 4e, 8; bez dzieci z ust. 45) choć 1 dzień w 2026
input limitUsedElsewhere ∈ [0, 85528]           // przychody już zwolnione z pkt 148/152–154 (etat, zlecenie, macierzyński…)
input spouseFourPlusExempt                      // przy wspólnym: przychód małżonka zwolniony (jego osobny limit)

L = fourPlus ? max(0, FOUR_PLUS_LIMIT − limitUsedElsewhere) : 0

function applyFourPlus(variant):
  R = businessRevenue
  E = min(L, R)                                  // zwolniony przychód JDG (cały rok, bez proporcji miesięcznej)
  switch variant:
    SKALA*, LINIOWY*:
      taxableIncome = R − E − allCosts           // koszty w całości: art. 22 ust. 3a, art. 23 ust. 10; może być < 0
      healthBase    = R − allCosts − socialNotInCosts   // BEZ odjęcia E: art. 81 ust. 2zd pkt 2 (ta sama, co bez ulgi)
      // składki społeczne: pełna kwota; odliczenie od opodatkowanego dochodu jak dotąd (§4 IMPL)
      // liniowy: zdrowotna do 14 100 zł, od taxableIncome (nadwyżka przepada)
    SKALA_IPBOX*, LINIOWY_IPBOX*:
      // ZAŁOŻENIE (niepewne): E dzielone proporcjonalnie do udziału przychodu kwalifikowanego
      qualShare = ipQualifiedRevenueShare
      taxableIncome jak wyżej; potem podział na kwalifikowany i niekwalifikowany dotychczasową metodą
    RYCZALT (jedna stawka):
      taxableRevenue = R − E
      base = max(0, taxableRevenue − 0.5·H_paid − socialDeductedFromRevenue)   // nadwyżka składek → skala (13a)
      healthThresholdRevenue = R − socialNotDeductedOnScale                  // BEZ odjęcia E (art. 81 ust. 2zd, 2g)
    RYCZALT (wiele stawek):
      // ZAŁOŻENIE (niepewne): E rozdzielane proporcjonalnie do przychodów poszczególnych stawek
      // (prawidłowo: chronologicznie; alternatywa: pokazać zakres min–max: E najpierw na najniższą albo najwyższą stawkę)
  danina: podstawa bez E
  ulga na dzieci (§6): bez limitu dochodu (≥2 dzieci); odliczana od podatku wg skali; zwrot według §1.7
  joint: taxableScaleIncome_user (po E) + taxableScaleIncome_spouse (po jego zwolnieniu) → 2·T(½·suma)

baseline H0: „Inne dochody” są już po ich zwolnieniu (limitUsedElsewhere), więc baseline się nie zmienia;
             ulga na dzieci w baseline liczona jak w §6
```

### 8.9 Punkty niepewne (4+)

1. **Ryczałt z kilkoma stawkami:** zasada chronologiczna jest znana tylko z drugiej ręki (odpowiedź MF z 18.04.2023 według Gofin). Kalkulator potrzebuje założenia (proporcja) albo pokazania przedziału wyników.
2. **Podział zwolnienia w IP BOX** między przychód kwalifikowany i niekwalifikowany. Brak źródła; założenie: proporcja.
3. **Pozbawienie władzy rodzicielskiej w trakcie roku.** Literalnie wystarcza okres wykonywania władzy przed pozbawieniem („w roku podatkowym”). Brak interpretacji.
4. **Pełne odliczenie składek społecznych JDG mimo zwolnienia.** Opiera się na praktyce i komentarzach (Poradnik Przedsiębiorcy 27.02.2023), bez interpretacji z sygnaturą. Wniosek jest jednak spójny z brzmieniem art. 26 ust. 1 pkt 2 in fine, bo podstawą składek JDG nie jest przychód.
5. **Optymalny wybór źródła** (etat albo JDG) nie jest modelowany. Kalkulator przyjmuje, że limit najpierw zużywają „inne przychody” w kwocie podanej przez użytkownika, a reszta idzie na JDG.
6. **Limit na 2027 r.:** 85 528 zł wynika wyłącznie z braku waloryzacji w ustawie. Druk 824 (120 000 zł) nie został uchwalony, ale procedura formalnie trwa.
7. **Strata po zwolnieniu** (przy skali i liniowym): można ją przenieść na kolejne lata (art. 9 ust. 3a pkt 4 lit. b). Kalkulator jej nie przenosi, co jest spójne z IMPL §7.

---

## 9. Źródła

**Akty prawne i proces legislacyjny**
- Ustawa o PIT, t.j. Dz.U. 2026 poz. 592: https://api.sejm.gov.pl/eli/acts/DU/2026/592/text.pdf (art. 6 s. 13–14; art. 21 ust. 1 pkt 153 s. 52–53; art. 26; art. 27f s. 136–137; art. 30c s. 146; art. 45 ust. 1a).
- Nowelizacje: https://api.sejm.gov.pl/eli/acts/DU/2026/779/text.pdf, https://api.sejm.gov.pl/eli/acts/DU/2026/846/text.pdf (art. 4), https://api.sejm.gov.pl/eli/acts/DU/2026/1079/text.pdf. Lista referencji: https://api.sejm.gov.pl/eli/acts/DU/2026/592/references.
- Proces legislacyjny: https://api.sejm.gov.pl/sejm/term10/processes/1898 (PIT Zero) i https://api.sejm.gov.pl/sejm/term10/processes/824.

**Materiały MF**
- Broszura informacyjna do PIT/O za 2025: https://www.podatki.gov.pl/media/z5abnlba/pit-o-broszura-za-2025-r.pdf (pkt 13, s. 21–23).
- Broszura informacyjna do PIT-36 za 2025: https://www.podatki.gov.pl/media/i11o5dtk/broszura-do-pit-36-za-2025-r.pdf (s. 2–4, 30–34).
- podatki.gov.pl, „Ulga na dziecko PIT” (aktualizacja 24.06.2026): https://www.podatki.gov.pl/ulgi-i-odliczenia/ulga-na-dziecko-pit
- podatki.gov.pl, „Osoba samotnie wychowująca dziecko” (24.06.2026): https://www.podatki.gov.pl/poradniki-i-informatory/osoba-samotnie-wychowujaca-dziecko

**Interpretacje KIS**
- 0112-KDSL1-1.4011.40.2023.1.MW, 27.03.2023: ryczałt małżonka poza limitem 112 000 zł. https://www.interpretacje.pl/pit/8781799,ulga-prorodzinna-limit-dochodow-interpretacja-0112kdsl114011.html
- 0112-KDSL1-1.4011.101.2024.2.DS, 17.04.2024: dziecko na liniowym, brak ulgi za cały rok (inforlex.pl).
- 0115-KDIT2.4011.129.2025.2.KC, 28.04.2025: dziecko wykluczone, więc jedno dziecko i limit (inforlex.pl).
- 0115-KDIT2.4011.105.2026.2.MD, 15.04.2026: 100% ulgi dla rodzica, u którego dziecko mieszka (inforlex.pl).
- 0112-KDSL1-1.4011.365.2026.3.MW, 19.06.2026: 50% przy wspólnym zamieszkaniu bez porozumienia (inforlex.pl).

**Inne**
- ZUS, waloryzacja od 1.03.2026 (renta socjalna 1 978,49 zł): https://www.zus.pl/en/-/od-marca-emerytury-i-renty-w-g%C3%B3r%C4%99
- Poradnik Przedsiębiorcy, „Zwrot z tytułu ulgi na dzieci – część M PIT-36” (16.02.2026): https://poradnikprzedsiebiorcy.pl/-zwrot-z-tytulu-ulgi-na-dzieci-a-skladki-w-czesci-m-w-pit-36
- Baza wiedzy KIS/CIRF (2021, archiwalna): https://archiwum.cirf.gov.pl/documents/6112779/6942344/Za%C5%82%C4%85cznik+nr+5+-+Baza_wiedzy_z_zakresu_ulgi_prorodzinnej.pdf

**Lokalne kopie w `scratchpad/`**
- `pit592.txt`, `a846.txt`, `pito.txt` (broszura PIT/O), `b36.txt` (broszura PIT-36), `cirf.txt`.

**Źródła do §8 (ulga dla rodzin 4+)**
- PIT t.j. 2026/592: art. 9 ust. 3a pkt 4 lit. b, art. 21 ust. 1 pkt 148–154, ust. 39, 44–48, art. 22 ust. 3–3b, art. 23 ust. 10, art. 26 ust. 1 pkt 2, art. 27f ust. 9 pkt 3.
- Ustawa o świadczeniach opieki zdrowotnej (t.j. Dz.U. 2025 poz. 1461): art. 81 ust. 2zd pkt 2 (`scratchpad/uzdr.txt`).
- MF, przewodnik „PIT-0. Ulga dla rodzin 4+” (stan na 31.12.2024): https://podatki-arch.mf.gov.pl/media/10570/2025_pit-0_ulga_dla_rodzin_4-_v1.pdf (`scratchpad/u4.txt`).
- podatki.gov.pl, „Ulga dla rodzin 4+ PIT” (aktualizacja 24.06.2026): https://www.podatki.gov.pl/ulgi-i-odliczenia/ulga-dla-rodzin-4plus-pit
- Broszura PIT-36 za 2025, s. 10 (`scratchpad/b36.txt` w. 358–410).
- KIS 0114-KDIP2-2.4011.243.2022.1.IN z 12.05.2022 (koszty w całości): za https://poradnikprzedsiebiorcy.pl/-ulga-dla-rodzin-a-koszty-przedsiebiorcy
- KIS 0115-KDIT2.4011.544.2023.1.AB z 17.05.2023 (wybór źródła, od początku roku): za https://ksiegowosc.infor.pl/podatki/pit/pit/ulgi-odliczenia/7488523,ulga-dla-rodzin-4-pit0-nawet-171-tys-zl-przychodow-rodzicow-wolnych-od-podatku-jak-przedsiebiorcy-i-rodzice-rozliczaja-zwolnienie-podatkowe.html
- KIS 0112-KDIL2-1.4011.106.2026.2.MKA z 06.03.2026 (faktyczne wykonywanie władzy rodzicielskiej): za https://www.prawo.pl/podatki/brak-kontaktow-z-dziecmi-a-ulga-4,1543661.html
- Odpowiedź MF z 18.04.2023 (ryczałt z kilkoma stawkami, chronologia), znana tylko z drugiej ręki: https://czasopismaksiegowych.gofin.pl/przeglad-podatku-dochodowego/archiwum-dodatkow/296334/stosowanie-ulgi-dla-rodzin-4-u-ryczaltowca-osiagajacego-przychody-opodatkowane-roznymi-stawkami-ryczaltu (strona zwraca 403, tekst niepobrany).
- Poradnik Przedsiębiorcy: https://poradnikprzedsiebiorcy.pl/-ulga-dla-rodzin-4-a-odliczenie-skladek-spolecznych (27.02.2023), https://poradnikprzedsiebiorcy.pl/-ulga-dla-rodzin-4-a-skladka-zdrowotna-czy-obniza-podstawe-wymiaru (13.03.2025), https://poradnikprzedsiebiorcy.pl/-ulga-dla-rodzin-4-a-dzialalnosc-gospodarcza (25.03.2026).
