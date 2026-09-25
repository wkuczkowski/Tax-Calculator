# Projekty UD458 i UD116 (oraz UD461): weryfikacja treści na 2027

> **Data:** 2026-09-25 (stan prac legislacyjnych na 25.09.2026)  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu. Tekst projektów z RCL był niedostępny — elementy oznaczone jako „niepotwierdzone” (N1–N8) wymagają sprawdzenia w druku sejmowym.  
> **Zakres:** weryfikacja treści projektów UD458 (skala 12/24/32%, danina 5%, ryczałt: limit 250 tys. EUR i 17% ponad 300 tys. EUR), UD116 (danina od dochodu IP BOX) i UD461; lista elementów potwierdzonych (P1–P13) i niepotwierdzonych (N1–N8); wzory do scenariusza „Projekt zmian 2027” kalkulatora. Uzupełnia [research-2027.md](research-2027.md).  
> **Pierwotna nazwa pliku:** `research_2027_reforms.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Stan na **25.09.2026**. Uzupełnia `research_2027.md`. Repozytorium nie było modyfikowane.

## 0. Dostęp do źródeł (ważne zastrzeżenie)

- **RCL (legislacja.gov.pl / legislacja.rcl.gov.pl) nadal niedostępne.** Z tego środowiska curl kończy się
  `Recv failure: Connection reset by peer` (proxy: `ws_closed_mid_exchange` dla legislacja.gov.pl:443),
  a przez http dostajemy 503. WebFetch zwraca 503. Zewnętrzny czytnik (r.jina.ai) też dostaje timeout, więc
  wygląda to na awarię albo blokadę po stronie RCL, a nie tylko tego środowiska. Wayback Machine
  **nie ma kopii** strony projektu 12413754 (CDX pusty, `available` zwraca `{}`).
  **Nie udało się więc pobrać PDF/DOCX projektu ani uzasadnienia.**
- **Poprawny numer projektu UD458 w RCL to `12413754`**: https://legislacja.rcl.gov.pl/projekt/12413754
  (link w artykułach Infor 7642538 i PIT.pl). Numer `12402157` z wcześniejszego researchu jest **błędny**:
  Wayback ma snapshot tej strony z 20.09.2025, czyli to inny, starszy projekt.
- Zamiast tego użyłem kolejno:
  1. **oficjalnego wpisu w wykazie prac RM (gov.pl, KPRM)** dla UD458, UD461 i UD116 (pełne pola „Cele”
     i „Istota rozwiązań”, zbieżne z uzasadnieniem);
  2. **komunikatu KPRM z 22.09.2026** o przyjęciu UD116;
  3. **porządku obrad Stałego Komitetu RM** (gov.pl);
  4. **dosłownych cytatów przepisów projektu** w Infor.pl (tabela art. 27 ust. 1, art. 32 ust. 2 i 3) oraz
     **cytatów z uzasadnienia** (Infor 7644640, inFakt);
  5. **aktualnych tekstów jednolitych** z ISAP: ustawa o ryczałcie Dz.U. 2025 poz. 843 i ustawa o PIT
     Dz.U. 2026 poz. 592, żeby ustalić, co projekt zmienia;
  6. **API Sejmu** (druki).

---

## 1. Lista: potwierdzone / niepotwierdzone / różni się od wcześniejszego researchu

### POTWIERDZONE (źródło oficjalne albo dosłowny cytat przepisu projektu)

| # | Element | Dowód |
|---|---|---|
| P1 | Skala 2027: 12% do 130 000; 24% ponad 130 000 do 150 000; 32% ponad 150 000 | Wykaz RM UD458 + dosłowna tabela art. 27 ust. 1 z projektu (Infor, §2.1) |
| P2 | Kwoty w skali: „12 000 zł + 24 % nadwyżki ponad 130 000 zł”, „16 800 zł + 32 % nadwyżki ponad 150 000 zł” | Infor, cytat projektu |
| P3 | Kwota zmniejszająca **3 600 zł, stała** (tylko w I przedziale, jak dziś). Kwota wolna 30 000 bez zmian | Tabela projektu: „12 % minus kwota zmniejszająca podatek 3 600 zł”. Wykaz: „Kwota wolna od podatku pozostanie na obecnym poziomie 30 tys. zł” |
| P4 | Zaliczki płatnika (art. 32 ust. 2) i wspólne rozliczenie u płatnika (art. 32 ust. 3) z nowymi progami | Infor, cytat projektu (§2.2) |
| P5 | Danina solidarnościowa **5%** (było 4%), próg 1 mln bez zmian; 5% pierwszy raz dla daniny płatnej do **2.05.2028** (dochody za 2027) | Wykaz RM UD458 (§3) |
| P6 | Ryczałt: limit prawa do ryczałtu **250 000 EUR** przychodu z roku poprzedniego (było 2 mln EUR). **W 2027 decyduje przychód z 2026**, bez okresu przejściowego | Wykaz RM UD458: „w 2027 r. ryczałt będzie mógł wybrać podatnik, jeżeli jego przychody osiągnięte w 2026 r. nie przekroczyły 250 tys. euro” |
| P7 | Ryczałt: **17% od nadwyżki przychodów osiągniętych w trakcie roku ponad 300 000 EUR**, od 2027 r. i w kolejnych latach; technicznie zmiana art. 12 ust. 1 pkt 1 i nowy ust. 15 ustawy o ryczałcie (art. 3 pkt 2 projektu) | Wykaz RM + uzasadnienie (cytat Infor 7644640) |
| P8 | Przeliczenie EUR→PLN: **średni kurs NBP z pierwszego dnia roboczego października roku poprzedzającego rok podatkowy** (dla 2027: **1.10.2026**, czwartek), **bez zaokrąglenia** | Obowiązujący **art. 4 ust. 2** ustawy o ryczałcie (Dz.U. 2025 poz. 843). Przepis jest ogólny („Kwoty wyrażone w euro…”), więc obejmuje też nowe kwoty 250 tys. i 300 tys. EUR (projekt, według dostępnych opisów, go nie zmienia) |
| P9 | Wejście w życie UD458: **1.01.2027**, dla dochodów (przychodów) uzyskanych od tego dnia | Wykaz RM UD458; Infor („Ustawa wejdzie w życie z dniem 1 stycznia 2027 r.”) |
| P10 | Limit 50% kosztów autorskich 120 000 → 130 000 zł (art. 22 ust. 9a) w UD458 | GazetaPrawna 11318178 (nie dotyczy JDG) |
| P11 | UD116 **przyjęty przez RM 22.09.2026**. Obejmuje daninę na dochody z IP Box i pozwala uwzględnić straty z lat ubiegłych. Wejście w życie „zasadniczo 1 stycznia 2027 r.” | Komunikat KPRM 22.09.2026; wykaz UD116 („Rada Ministrów przyjęła 22 września 2026 r.”) |
| P12 | UD458 był w porządku obrad **Stałego Komitetu RM 23.09.2026 (poz. 1)**; RM go **nie przyjęła**; **brak druku sejmowego** (UD458 i UD116) | gov.pl porządki obrad SKRM; wykaz UD458 („Planowany termin przyjęcia projektu przez RM: III/IV kwartał 2026 r.”, bez adnotacji o realizacji); API Sejmu: najwyższy druk 3133 z 24.09.2026, oba to uchwały Senatu w innych sprawach |
| P13 | Projekty nie zmieniają ustawy o świadczeniach opieki zdrowotnej (u.ś.o.z.): tytuły UD458 i UD116 wymieniają tylko ustawy o PIT, CIT i ryczałcie. Progi zdrowotne ryczałtu 60 000 / 300 000 zł i mnożniki 0,6/1,0/1,8 bez zmian | Tytuły projektów; wykaz UD458 wprost opisuje „górny limit” składki (180% przy przychodzie > 300 tys. zł) tylko jako uzasadnienie zmian w ryczałcie, bez zmiany u.ś.o.z. |

### NIEPOTWIERDZONE (brak tekstu projektu; tylko omówienia albo wnioskowanie)

| # | Element | Stan wiedzy |
|---|---|---|
| N1 | **Dokładne brzmienie** nowego art. 12 ust. 1 pkt 1 i ust. 15 ustawy o ryczałcie (np. jak rozumieć „nadwyżkę”, czy liczą się przychody z najmu prywatnego art. 6 ust. 1a, jak traktować małżonków i spółki) | Znane tylko: numery przepisów i fraza przytaczana przez inFakt: stawkę 17% stosuje się „zgodnie z kolejnością przychodów uzyskanych w trakcie roku podatkowego”. Jedno omówienie mówi o sumowaniu przychodów z „większości rodzajów działalności”, więc możliwe wyłączenia |
| N2 | Czy **odliczenia od przychodu** (składki ZUS społeczne, 50% zapłaconej składki zdrowotnej z art. 11 ust. 1c, ulgi) można przypisać do przychodu opodatkowanego 17%, czy tylko proporcjonalnie | Brak informacji |
| N3 | Jak 17% łączy się z najmem (8,5% do 100 tys. zł i 12,5%/15% ponad) i ze stawką 10% z art. 12 ust. 10 | Brak informacji. Omówienia mówią tylko, że 17% zastępuje „stawkę właściwą dla danego rodzaju działalności” |
| N4 | Zmiany w art. 6 ust. 4 pkt 1 lit. a/b i ust. 6 (2 000 000 → 250 000 EUR) | Wynika z opisu, ale brzmienia nie widziałem |
| N5 | Dokładne brzmienie zmiany art. 30h ust. 2 (UD116): dodanie IP Box i strat | prawo.pl: „poszerzenie podstawy obliczenia daniny solidarnościowej o kwalifikowane dochody, o których mowa w art. 30ca ust. 3 ustawy o PIT”. Zakres strat: tylko „z tego samego źródła przychodów” (wykaz). Przepisu przejściowego nie znam, ale przy wejściu 1.01.2027 zapewne dotyczy dochodów za 2027 (danina płatna w 2028) |
| N6 | Wymóg zatrudnienia ≥ 3 osób w IP Box usunięty z UD116 | Według KPMG (prawo.pl 23.09.2026) i naszapolska.pl: **usunięty**. Wykaz UD116 (stan z 17.08.2026) nadal go opisuje (pkt 12). Komunikat RM o IP Box nic nie mówi („warunek zatrudnienia” w komunikacie dotyczy estońskiego CIT). Traktować jako prawie pewne, ale do sprawdzenia w druku sejmowym |
| N7 | Zmiany UD458 po konsultacjach | Nie znalazłem żadnej informacji o zmianie parametrów (130/150 tys., 24%, 5%, 250/300 tys. EUR). Uwagi zgłosili Rzecznik MŚP (wyższy próg, niższa stawka, dłuższe vacatio legis) i Lewiatan (opinia z 11.09.2026, co najmniej 6 mies. vacatio legis). Wersja po SKRM nie jest znana |
| N8 | Skutki dla wspólnego rozliczenia z art. 6 ust. 2 i 4c | Projekt nie musi zmieniać art. 6: mechanizm „podwójnej wysokości podatku obliczonego od połowy łącznych dochodów” (art. 6 ust. 2, t.j. 2026) automatycznie przejmuje nową skalę. Stąd efektywne progi 260 000 / 300 000 i kwota zmniejszająca 7 200. To wniosek z obecnego przepisu, nie cytat projektu |

### RÓŻNI SIĘ OD WCZEŚNIEJSZEGO RESEARCHU (`research_2027.md`)

1. **Link RCL do UD458:** jest `https://legislacja.rcl.gov.pl/projekt/12413754`, a nie `…/12402157`.
2. **Przepis o przeliczeniu EUR:** chodzi o **art. 4 ust. 2** ustawy o ryczałcie, a nie „art. 6 ust. 1a”, i **nie ma
   zaokrąglenia do 1000 zł** (art. 6 ust. 1a to przychody z najmu prywatnego). Kwota w PLN = 250 000 × kurs (albo
   300 000 × kurs), bez zaokrąglania (di.com.pl: przy 4,2586 wychodzi 1 064 650 zł i 1 277 580 zł).
3. **UD116 i straty:** projekt nie wprowadza „odliczenia straty w IP BOX”. Pozwala **pomniejszyć podstawę daniny
   solidarnościowej o straty z lat ubiegłych z tego samego źródła** (zasada ogólna) i wyraźnie wyklucza inne
   odliczenia i pomniejszenia (wykaz pkt 4).
4. **UD116, ryczałt 17%:** nie chodzi o „17% za najem podmiotowi powiązanemu” w ogóle. Według prawo.pl i
   naszapolska.pl: **17%** dotyczy najmu i dzierżawy (w szczególności praw własności intelektualnej, np. znaku
   towarowego) zawartych z podmiotem powiązanym (art. 23m ust. 1 pkt 4 PIT), z wyłączeniem prac chronionych
   prawem autorskim. Najem nieruchomości podmiotowi powiązanemu: 8,5% do 100 tys. zł, a nadwyżka **15%**
   (zamiast 12,5%). Kalkulatora to nie dotyczy.
5. **Nowy projekt, którego nie było wcześniej: UD461** (wykaz 27.08.2026, na SKRM 23.09.2026, poz. 7): **likwidacja
   ulgi internetowej w PIT i w ryczałcie** (z rocznymi prawami nabytymi dla osób, które pierwszy raz skorzystały
   z ulgi za rok poprzedzający wejście w życie), wyższa ulga dla krwiodawców, przedłużenie ulgi na robotyzację
   o 10 lat, uchylenie ulgi na ekspansję. Jeśli kalkulator obsługuje ulgę internetową (760 zł), trzeba to oznaczyć
   jako „projekt”.
6. **Etap UD458:** doprecyzowanie: projekt **przeszedł już do Stałego Komitetu RM (23.09.2026)**. We wcześniejszym
   researchu był opisany tylko jako „w konsultacjach”.
7. W UD458 jest też podwyższenie limitu 50% kosztów autorskich do 130 000 zł. Nie ma to znaczenia dla JDG.

---

## 2. UD458: szczegóły z cytatami

**Tytuł:** Projekt ustawy o zmianie ustawy o podatku dochodowym od osób fizycznych, ustawy o podatku dochodowym
od osób prawnych oraz ustawy o zryczałtowanym podatku dochodowym od niektórych przychodów osiąganych przez osoby
fizyczne (UD458). Wnioskodawca: MFiG. Odpowiada: Jarosław Neneman.
- Wykaz RM (wpis z 20.08.2026 17:27): https://www.gov.pl/web/premier/projekt-ustawy-o-zmianie-ustawy-o-podatku-dochodowym-od-osob-fizycznych-ustawy-o-podatku-dochodowym-od-osob-prawnych-oraz-ustawy-o-zryczaltowanym-podatku-dochodowym-od-niektorych-przychodow-osiaganych-przez-osoby-fizyczne5
- RCL (21.08.2026, niedostępne): https://legislacja.rcl.gov.pl/projekt/12413754

### 2.1 Art. 27 ust. 1: skala (cytat projektu za Infor 7642538)
> „Na podstawie omawianego projektu w art. 27 w ust. 1 ustawy o PIT skala podatkowa otrzyma następujące brzmienie:”
>
> | Podstawa obliczenia podatku w złotych: ponad | do | Podatek wynosi |
> |---|---|---|
> | | 130 000 | 12 % minus kwota zmniejszająca podatek 3 600 zł |
> | 130 000 | 150 000 | 12 000 zł + 24 % nadwyżki ponad 130 000 zł |
> | 150 000 | | 16 800 zł + 32 % nadwyżki ponad 150 000 zł |

Źródło: https://ksiegowosc.infor.pl/wiadomosci/7642538,od-2027-r-130-tys-zl-ii-prog-podatkowy-w-pit-i-nowa-stawka-24-z-nowym-progiem-150-tys-zl-nizszy-limit-dla-ryczaltu-i-22-cit-dla-najwiekszych-firm-rzadowy-projekt-nowelizacji-ustaw-podatkowych.html

Sprawdzenie: 12% × 130 000 − 3 600 = 12 000; 12 000 + 24% × 20 000 = 16 800. Kwota zmniejszająca jest
**stała** (3 600 zł) i wchodzi w kwoty bazowe wyższych przedziałów. Nie ma degresji. Maksymalna korzyść
w porównaniu z 2026 wynosi **3 600 zł** dla podstawy ≥ 150 000 (2026: 10 800 + 32% × 30 000 = 20 400; 2027: 16 800).

Wykaz RM: „Skala podatkowa będzie miała trzy przedziały dochodowe. Pierwszy do 130 tys. zł ze stawką 12%, drugi
będzie obejmował dochody w przedziale ponad 130 tys. zł do 150 tys. zł ze stawką 24% i trzeci będzie obejmował dochody
przekraczające 150 tys. zł ze stawką 32%. […] Kwota wolna od podatku pozostanie na obecnym poziomie 30 tys. zł.”
oraz: „Proponuje się, aby zmiany te weszły w życie z dniem 1 stycznia 2027 r. i miały zastosowanie do dochodów
(przychodów) uzyskanych od tego dnia. […] Zmiana ta będzie odczuwalna już w trakcie roku przy poborze zaliczek
na podatek, a definitywnie zastosowana w rozliczeniu podatku za 2027 r.”

### 2.2 Zaliczki płatnika i wspólne rozliczenie (cytat projektu za Infor)
Art. 32 ust. 2: „1) za miesiące, w których dochód podatnika uzyskany od początku roku od danego płatnika nie przekroczył
kwoty 130 000 zł – 12 % dochodu uzyskanego w danym miesiącu; 2) za miesiące następujące po miesiącu, w którym dochód
[…] przekroczył kwotę 130 000 zł oraz nie przekroczył kwoty 150 000 zł – 24 % […]; 3) […] przekroczył kwotę 150 000 zł
– 32 % […]; 4) za miesiąc, w którym dochód […] przekroczył kwotę 130 000 zł lub 150 000 zł, odpowiednio: a) 12 % […],
b) 24 % […], c) 32 % dochodu od nadwyżki ponad kwotę 150 000 zł.”
Art. 32 ust. 3 (oświadczenie o wspólnym rozliczeniu z małżonkiem lub dzieckiem): w pkt 1 „120 000 zł” → „130 000 zł”;
pkt 2: „dochody podatnika przekroczą kwotę 130 000 zł, ale nie przekroczą kwoty 150 000 zł, oraz dochody małżonka lub
dziecka […] nie przekraczają kwoty 130 000 zł – zaliczki za wszystkie miesiące roku podatkowego wynoszą 12 %”; nowy
pkt 3 dla dochodów > 150 000 zł (12% do 150 000, 24% ponad).
**W rocznym rozliczeniu wspólnym** stosuje się dalej obecny art. 6 ust. 2 (t.j. Dz.U. 2026 poz. 592): „podatek
określa się na imię obojga małżonków w podwójnej wysokości podatku obliczonego od połowy łącznych dochodów
małżonków”. To samo dotyczy osoby samotnie wychowującej dziecko (art. 6 ust. 4c). Nowa skala przenosi się więc
automatycznie (N8).

### 2.3 Danina solidarnościowa (art. 30h ust. 1)
Wykaz RM: „podwyższenie stawki daniny solidarnościowej o 1 pp z 4% do 5% podstawy obliczenia tej daniny. […]
Proponuje się, aby zmiana stawki daniny solidarnościowej weszła w życie z dniem 1 stycznia 2027 r. i miała
zastosowanie do tej daniny, której termin zapłaty upływa z dniem 2 maja 2028 r. Do jej obliczenia brane będą pod
uwagę dochody wykazywane w zeznaniach PIT składanych od 1 maja 2027 r. do 2 maja 2028 r. Oznacza to, że do 30 kwietnia
2027 r. osoby fizyczne obowiązane do zapłaty daniny solidarnościowej zastosują obecną stawkę, czyli 4% od nadwyżki
ponad 1 mln zł dochodu.”
Infor: „stawka tzw. daniny solidarnościowej określonej w art. 30h w ust. 1 wzrośnie z 4% do 5%”.
UD458 **nie zmienia podstawy** daniny (nie obejmuje nią ryczałtu). Uzasadnienie tylko wskazuje, że przychody
z ryczałtu „nie są uwzględniane przy obliczaniu daniny solidarnościowej”.

Obecny art. 30h ust. 2 (t.j. 2026): „Podstawę obliczenia daniny solidarnościowej stanowi nadwyżka ponad 1 000 000 zł
sumy dochodów podlegających opodatkowaniu na zasadach określonych w art. 27 ust. 1, 9 i 9a, art. 30b, art. 30c
oraz art. 30f po ich pomniejszeniu o: 1) kwoty składek, o których mowa w art. 26 ust. 1 pkt 2 i 2a, oraz składek,
o których mowa w art. 30c ust. 2 pkt 2, 2) kwoty, o których mowa w art. 30f ust. 5 – odliczone od tych dochodów.”
(Art. 30c ust. 2 pkt 2 to składka zdrowotna liniowca w granicach limitu.)

### 2.4 Ryczałt: limit 250 tys. EUR i 17% ponad 300 tys. EUR
Wykaz RM, pkt 4 „Istota rozwiązań”:
> „dostosowanie zakresu stosowania ryczałtu od przychodów ewidencjonowanych do jego pierwotnych założeń poprzez:
> - obniżenie limitu przychodów warunkującego możliwość wyboru opodatkowania ryczałtem od przychodów ewidencjonowanych
>   z 2 mln euro do 250 tys. euro;
> - stosowanie wyższej 17% stawki ryczałtu do nadwyżki przychodów osiągniętych w trakcie roku ponad 300 tys. euro.
> Proponuje się, aby zmiany te weszły w życie z dniem 1 stycznia 2027 r. i miały zastosowanie do przychodów uzyskanych
> od tego dnia. Oznacza to, że w 2027 r. ryczałt będzie mógł wybrać podatnik, jeżeli jego przychody osiągnięte w 2026 r.
> nie przekroczyły 250 tys. euro. Natomiast wyższa stawka ryczałtu (17%) będzie miała zastosowanie do przychodów ponad
> 300 tys. euro osiągniętych w trakcie 2027 r. i w trakcie kolejnych lat. […]
> Podkreślić należy, że nowa, wyższa 17% stawka dotyczyć ma nadwyżki przychodów ponad 300 tys. euro, chociaż nowy limit
> warunkujący wybór ryczałtu zostanie obniżony do 250 tys. euro. Zatem różnica pomiędzy limitem warunkującym stosowanie
> ryczałtu a obowiązkiem opłacania wyższej 17% stawki ryczałtu wynosi 50 tys. euro.”

Uzasadnienie (cytat Infor 7644640, https://ksiegowosc.infor.pl/wiadomosci/7644640,ryczalt-po-nowemu-limit-tylko-250-tys-euro-i-dodatkowa-stawka-dla-czesci-przedsiebiorcow-od-2027-roku.html):
> „Proponowane rozwiązania zakładają zatem zmianę przepisów ustawy o zryczałtowanym podatku dochodowym od niektórych
> przychodów osiąganych przez osoby fizyczne polegającą na stosowaniu wyższej 17 % stawki ryczałtu do nadwyżki
> przychodów osiągniętych w trakcie roku ponad 300 tys. euro (art. 3 pkt 2 projektu ustawy – zmiana art. 12 ust. 1
> pkt 1 i ust. 15 ustawy o ryczałcie)”
> „Pomimo zmniejszania limitu warunkującego stosowanie ryczałtu od przychodów ewidencjonowanych z 2 mln euro do 250 tys.
> euro, proponuje się, żeby nowa, wyższa 17 % stawka ryczałtu dla przychodów osiąganych w trakcie roku dotyczyła
> wyższego limitu niż 250 tys. euro, tj. limitu 300 tys. euro.”

inFakt (25.08.2026, M. Szafran), https://www.infakt.pl/blog/ryczalt-2027-spadek-limitu-o-90-i-karna-stawka-17/:
„Projekt wskazuje, że stawkę 17% stosuje się „zgodnie z kolejnością przychodów uzyskanych w trakcie roku podatkowego”.”
TVN24 (doradca inFakt): „Po przekroczeniu łącznego progu 300 tys. euro nadwyżka przychodów byłaby do końca roku
opodatkowana stawką 17 proc., zamiast stawką właściwą dla danego rodzaju działalności.”

Obowiązujące przepisy, które projekt zmienia (t.j. Dz.U. 2025 poz. 843, https://api.sejm.gov.pl/eli/acts/DU/2025/843/text.pdf):
- art. 4 ust. 2: „Kwoty wyrażone w euro przelicza się na walutę polską według średniego kursu euro ogłaszanego przez
  Narodowy Bank Polski na pierwszy dzień roboczy października roku poprzedzającego rok podatkowy.”
- art. 6 ust. 4 pkt 1: „w roku poprzedzającym rok podatkowy: a) uzyskali przychody z tej działalności, prowadzonej
  wyłącznie samodzielnie, w wysokości nieprzekraczającej 2 000 000 euro, lub b) […] suma przychodów wspólników spółki
  z tej działalności nie przekroczyła kwoty 2 000 000 euro”; pkt 2: podatnicy rozpoczynający działalność w roku
  podatkowym: „bez względu na wysokość przychodów”.
- art. 12 ust. 1 pkt 1: „17 % przychodów osiąganych w zakresie wolnych zawodów”. Obecnie art. 12 kończy się na ust. 14,
  więc ust. 15 będzie nowy.

### 2.5 Składka zdrowotna
Projekt jej nie zmienia (P13). Uzasadnienie tylko opisuje stan obecny (wykaz RM): „Ryczałt od przychodów
ewidencjonowanych jest formą opodatkowania, która umożliwia opłacanie składki zdrowotnej z górnym limitem. Mianowicie,
powyżej 300 tys. zł przychodu podstawa obliczenia składki to 180% przeciętnego wynagrodzenia.”
Skutki według OSR (PIT.pl, 24.08.2026): +2,6 mld zł w 2027 r., z czego ok. 2,2 mld zł dla NFZ. Wynika to z przejścia
ryczałtowców na skalę albo liniowy, a nie ze zmiany stawek.

### 2.6 Vacatio legis, przepisy przejściowe, etap
- Wejście w życie: 1.01.2027. Brak okresu przejściowego dla limitu ryczałtu (liczy się przychód z 2026). Danina 5%
  od rozliczenia płatnego 2.05.2028.
- Rzecznik MŚP (https://rzecznikmsp.gov.pl/rzecznik-msp-apeluje-o-ponowna-analize-zmian-w-ryczalcie-dla-najmniejszych-firm/):
  „zaproponowano rozważenie przesunięcia terminu wejścia zmian w życie” oraz „rozważenie podwyższenia progu oraz
  obniżenia stawki”.
- Lewiatan (opinia z 11.09.2026, https://lewiatan.org/lewiatan-sprzeciwia-sie-podwyzce-cit-i-ograniczeniu-ryczaltu/):
  „absolutnym minimum powinno być sześć miesięcy od dnia ogłoszenia ustawy”.
- **Etap na 25.09.2026:** konsultacje i opiniowanie za nami; **Stały Komitet RM 23.09.2026, godz. 8.30, poz. 1**
  (https://www.gov.pl/web/premier/porzadki-obrad-stalego-komitetu-rady-ministrow); **RM go nie przyjęła**
  (prawo.pl i naszapolska.pl 23.09: „na etapie Stałego Komitetu Rady Ministrów”); **brak druku sejmowego**.
  Najbliższe posiedzenie RM to prawdopodobnie wtorek 29.09.2026. PAP/Bankier: „ustawa musi zostać uchwalona
  i opublikowana przed końcem listopada br.”
- Brak informacji o wycofaniu albo zmianie parametrów po konsultacjach (N7).

---

## 3. UD116 (przyjęty przez RM 22.09.2026)

- Komunikat KPRM: https://www.gov.pl/web/premier/projekt-ustawy-o-zmianie-ustawy-o-podatku-dochodowym-od-osob-fizycznych-ustawy-o-podatku-dochodowym-od-osob-prawnych-oraz-ustawy-o-zryczaltowanym-podatku-dochodowym-od-niektorych-przychodow-osiaganych-przez-osoby-fizyczne7
  > „Doprecyzowane zostają zasady obliczania daniny solidarnościowej, w tym możliwość uwzględnienia strat z lat ubiegłych
  > oraz objęcie daniną dochodów opodatkowanych w ramach IP Box (czyli dochodów z kwalifikowanych praw własności
  > intelektualnej).” … „Nowe przepisy wejdą w życie zasadniczo 1 stycznia 2027 r”
- Wykaz UD116: https://www.gov.pl/web/premier/projekt-ustawy-o-zmianie-ustawy-o-podatku-dochodowym-od-osob-fizycznych-ustawy-o-podatku-dochodowym-od-osob-prawnych-oraz-niektorych-innych-ustaw6
  pkt 4: „proponuje się jednoznaczne wskazanie, iż podatnik może dochody stanowiące podstawę obliczenia daniny
  solidarnościowej pomniejszyć o straty z lat ubiegłych. Straty te będą mogły pomniejszyć dochody uzyskane z tego samego
  źródła przychodów […]. Rozstrzygnięcie wprost, iż podatnik dochodów tych nie może pomniejszyć o inne przysługujące
  osobom fizycznym, przy opodatkowaniu podatkiem dochodowym, odliczenia lub pomniejszenia. Poszerzenie podstawy obliczenia
  daniny solidarnościowej o dochody z IP Box.”
  Status: „III kwartał 2026 r. - ZREALIZOWANY Rada Ministrów przyjęła 22 września 2026 r.”
- prawo.pl (23.09.2026): „poszerzenie podstawy obliczenia daniny solidarnościowej o kwalifikowane dochody, o których
  mowa w art. 30ca ust. 3 ustawy o PIT (tzw. IP Box)” oraz Grochowina (KPMG): „zrezygnowano m.in. z warunku zatrudniania
  pracowników przez osoby rozliczające się IP Box i stawką ryczałtu 8,5 proc.”
  https://www.prawo.pl/podatki/pit-2027-zmiany-dla-programistow-i-wspolnikow-spolek,1553299.html
- Art. 30ca ust. 3 (t.j. 2026): „Podstawę opodatkowania stanowi suma kwalifikowanych dochodów z kwalifikowanych praw
  własności intelektualnej osiągniętych w roku podatkowym.”
- **Składka zdrowotna IP Box:** UD116 jej nie zmienia (tytuł nie obejmuje u.ś.o.z.).
- **Etap:** przyjęty przez RM; druk sejmowy jeszcze się nie ukazał (API Sejmu, 24.09.2026).

## 4. UD461 (nowy, na SKRM 23.09.2026)
Wykaz: https://www.gov.pl/web/premier/projekt-ustawy-o-zmianie-ustawy-o-podatku-dochodowym-od-osob-fizycznych-ustawy-o-podatku-dochodowym-od-osob-prawnych-oraz-ustawy-o-zryczaltowanym-podatku-dochodowym-od-niektorych-przychodow-osiaganych-przez-osoby-fizyczne6
„3. likwidacja ulgi na Internet w ustawie PIT i ustawie o ryczałcie z zachowaniem rocznych praw nabytych dla osób, które
po raz pierwszy skorzystały z tego odliczenia w rozliczeniu podatku PIT za rok poprzedzający rok wejście w życie
projektowanej ustawy; 4. zwiększenie limitu odliczenia ulgi podatkowej z tytułu krwiodawstwa w ustawie PIT i ustawie
o ryczałcie; 5. uchylenie przepisów […] ulgę na ekspansję.” Planowane przyjęcie przez RM: III/IV kw. 2026.

---

## 5. Wzory dla kalkulatora (wariant „z reformą 2027”)

Oznaczenia: B to podstawa obliczenia podatku (dochód po odliczeniach), r to kurs średni NBP EUR z **1.10.2026**
(tabela A; na dziś nieznany).

**Skala PIT (indywidualnie):**
```
T(B) = B <= 130000 ? max(0, 0.12*B - 3600)
     : B <= 150000 ? 12000 + 0.24*(B - 130000)
     :               16800 + 0.32*(B - 150000)
// równoważnie: max(0, 0.12*min(B,130000) + 0.24*clamp(B-130000,0,20000) + 0.32*max(0,B-150000) - 3600)
```
Stałe: `TAX_THRESHOLD_12 = 130000`, `TAX_THRESHOLD_24 = 150000`, `PIT_RATE_24 = 0.24`, `TAX_DECREASING_AMOUNT = 3600`
(stała), `TAX_BAND_12 = 100000` (130 000 − 30 000), `TAX_BAND_24 = 20000`.

**Wspólnie z małżonkiem / samotny rodzic:** `T_joint(B1+B2) = 2 * T((B1+B2)/2)`, czyli progi 260 000 / 300 000
i kwota zmniejszająca 7 200.

**Danina (od dochodów 2027, płatna do 2.05.2028):**
```
base = scaleIncome(art.27, po odl. ZUS społ.) + linearIncome(art.30c, po odl. ZUS społ. i zdrowotnej w limicie)
     + capital(30b) + CFC(30f) + ipBoxQualifiedIncome(30ca ust.3)   // IP Box: UD116
     - pastLossesSameSource                                         // UD116; inne odliczenia nie pomniejszają
danina = 0.05 * max(0, base - 1000000)                              // 5%: UD458
```
Ryczałt nadal **nie** wchodzi do podstawy daniny.

**Ryczałt, prawo wyboru na 2027:**
```
eligible2027 = startsBusinessIn2027 || revenue2026 <= 250000 * r    // art. 4 ust. 2: bez zaokrąglenia
```
**Ryczałt, stawka 17% ponad 300 tys. EUR (roczny przychód R, jedna stawka branżowa s):**
```
T17 = 300000 * r
tax = s * min(R, T17) + 0.17 * max(0, R - T17)     // przed odliczeniami; alokacja odliczeń: niepotwierdzona (N2)
```
Przy kilku stawkach nadwyżkę przypisuje się **chronologicznie** („zgodnie z kolejnością przychodów”). Dla
comiesięcznych zaliczek: 17% od części przychodu miesiąca, w którym narastający przychód przekracza T17, i od
każdego kolejnego przychodu do końca roku. Przekroczenie 250 tys. EUR w 2027 oznacza utratę ryczałtu od 2028.
Ilustracja (kurs z 1.10.2025 = 4,2586): 250 tys. EUR = 1 064 650 zł, 300 tys. EUR = 1 277 580 zł.

**Składka zdrowotna:** bez zmian (skala 9%, liniowy 4,9% i limit odliczenia, ryczałt progi 60 000 / 300 000 zł
z mnożnikami 0,6/1,0/1,8, IP Box jak dotąd). Wartości 2027 według `research_2027.md`.

**Wariant „bez reformy”** (gdyby ustawa nie weszła, np. przez weto): 120 000 / 32% / 3 600, danina 4% bez IP Box,
ryczałt z limitem 2 mln EUR i bez 17%.

---

## 6. Źródła
- Wykaz RM UD458 (gov.pl): link w §2
- Wykaz RM UD461 (gov.pl): link w §4
- Wykaz RM UD116 i komunikat RM 22.09.2026: linki w §3
- Porządki obrad SKRM: https://www.gov.pl/web/premier/porzadki-obrad-stalego-komitetu-rady-ministrow
- RCL UD458 (niedostępne 25.09.2026): https://legislacja.rcl.gov.pl/projekt/12413754
- Infor 7642538 (tabela skali, art. 32): link w §2.1
- Infor 7644640 (uzasadnienie ryczałtu): link w §2.4
- Infor 7652652 (9.09.2026): https://ksiegowosc.infor.pl/podatki/ryczalt/dzialalnosc-gospodarcza/7652652,ryczalt-w-2027-r-tylko-do-250-tys-euro-przychodu-i-inne-projektowane-przez-rzad-zmiany-w-podatkach-na-przyszly-rok.html
- inFakt: https://www.infakt.pl/blog/ryczalt-2027-spadek-limitu-o-90-i-karna-stawka-17/
- TVN24: https://tvn24.pl/biznes/dlafirm/zmiany-w-ryczalcie-w-2027-roku-nowa-stawka-sankcyjna-17-procent-powyzej-300-tysiecy-euro-nowe-zasady-rozliczen-st9205689
- Bankier/PAP: https://www.bankier.pl/wiadomosc/Rzad-dokreca-srube-ryczaltowcom-Wyzsza-stawka-od-300-tys-euro-przychodu-9185179.html
- PIT.pl (OSR): https://www.pit.pl/aktualnosci/zapowiedz-rewolucji-w-podatkach-rzad-opublikowal-szczegoly-projektu-ile-panstwo-chce-zyskac-na-zmianach
- GazetaPrawna (SKRM 23.09, koszty autorskie): https://www.gazetaprawna.pl/podatki/pit/artykuly/11318178,nowe-progi-podatkowe-pit-od-2027-roku.html
- prawo.pl (UD116, 23.09.2026): link w §3
- naszapolska.pl (23.09.2026): https://naszapolska.pl/zmiany-pit-cit/
- di.com.pl (kwoty PLN): https://di.com.pl/limit-ryczaltu-2027-250-tys-euro-3600-zl-z-nowego-pit
- Rzecznik MŚP, Lewiatan: linki w §2.6
- ISAP: ustawa o ryczałcie t.j. https://api.sejm.gov.pl/eli/acts/DU/2025/843/text.pdf; ustawa o PIT t.j. https://api.sejm.gov.pl/eli/acts/DU/2026/592/text.pdf
- API Sejmu, druki: https://api.sejm.gov.pl/sejm/term10/prints?sort_by=-number
