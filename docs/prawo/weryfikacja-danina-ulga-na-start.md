# Legal check: danina solidarnościowa (art. 30h PIT) and ulga na start (art. 18 Prawo przedsiębiorców)

> **Data:** 2026-09-24  
> **Status:** raport historyczny: zapis stanu na dzień sporządzenia. Treści nie aktualizuje się; nowe ustalenia trafiają do [rejestru decyzji](../decyzje/decyzje-implementacyjne.md) albo do nowego raportu.  
> **Zakres:** weryfikacja dwóch kwestii na tekstach jednolitych: (1) dochód z IP BOX (art. 30ca) nie wchodzi do podstawy daniny solidarnościowej (art. 30h PIT); (2) zasady ulgi na start (art. 18 Prawa przedsiębiorców). Podstawa decyzji R11 w [rejestrze decyzji](../decyzje/decyzje-implementacyjne.md).  
> **Pierwotna nazwa pliku:** `legal_check_danina_ulga.md`. Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Sources checked on 2026-09-24:
- PIT t.j. Dz.U. 2026 poz. 592 (PDF from https://api.sejm.gov.pl/eli/acts/DU/2026/592/text.pdf, D20260592L, legal status as of 2026-04-01). Amendments made after the t.j. (DU/2026/779, DU/2026/1079) were checked, and neither changes art. 30h, 30c or 26.
- Prawo przedsiębiorców t.j. Dz.U. 2025 poz. 1480 (https://api.sejm.gov.pl/eli/acts/DU/2025/1480/text.pdf). Amendments made after the t.j. (DU/2025/1826, DU/2025/1795) do not touch art. 18.

## 1. Is IP BOX (art. 30ca) income in the danina base? NO.

Art. 30h ust. 1–2 (Dz.U. 2026 poz. 592, p. 160–161):
> "Art. 30h. 1. Osoby fizyczne są obowiązane do zapłaty daniny solidarnościowej w wysokości 4 % podstawy obliczenia tej daniny.
> 2. Podstawę obliczenia daniny solidarnościowej stanowi nadwyżka ponad 1 000 000 zł sumy dochodów podlegających opodatkowaniu na zasadach określonych w art. 27 ust. 1, 9 i 9a, art. 30b, art. 30c oraz art. 30f po ich pomniejszeniu o:
> 1) kwoty składek, o których mowa w art. 26 ust. 1 pkt 2 i 2a, oraz składek, o których mowa w art. 30c ust. 2 pkt 2,
> 2) kwoty, o których mowa w art. 30f ust. 5
> – odliczone od tych dochodów."

- The list is closed: art. 27 ust. 1, 9, 9a (skala), art. 30b (capital gains), art. 30c (liniowy 19%) and art. 30f (CFC). **Art. 30ca is not on it.**
- Art. 30c ust. 6 also treats 30ca income as a separate category: "Dochodów ... opodatkowanych w sposób określony w ust. 1, nie łączy się z dochodami opodatkowanymi na zasadach określonych w art. 27, art. 30b, art. 30ca, art. 30da, art. 30e i art. 30f."
- The tax authority takes the same view in individual rulings, e.g. KIS 0112-KDIL2-1.4011.110.2019.1.AMN of 14.02.2020 (reported at https://pragmatiq.pl/ulgidlainnowacji/korzystajacy-z-ip-box-nie-placi-daniny-solidarnosciowej/).
- Caveat: only the *qualified* income under art. 30ca ust. 4 is excluded. The rest of the business income (non-qualified income, or income without the nexus coefficient) is taxed under art. 27 or 30c, so it stays in the base.

## 2. Deductions that reduce the base

Under art. 30h ust. 2, quoted above, the base is reduced only by amounts actually "odliczone od tych dochodów":
- **Social contributions under art. 26 ust. 1 pkt 2 and 2a** (Polish ZUS social contributions, and EU/EEA/CH social contributions);
- **Health contributions under art. 30c ust. 2 pkt 2** (liniowy only): "składki na ubezpieczenie zdrowotne zapłacone w roku podatkowym ... z tytułu pozarolniczej działalności gospodarczej opodatkowanej zgodnie z ust. 1 ... [łącznie z KUP] nie może przekroczyć w roku podatkowym 8700 zł" (the limit is indexed and announced in MP under art. 30c ust. 2b–2c);
- **Art. 30f ust. 5 amounts** (CFC).
- **Art. 26 ust. 1 pkt 2aa is "(uchylony)"**, so a skala taxpayer has no health-contribution deduction that could reduce the base.
- Other deductions are **not** in the list: IKZE (art. 26 ust. 1 pkt 2b / 30c ust. 2 pkt 3), donations, internet, rehabilitation, the ulga B+R and so on.
- Liniowy health contributions booked as KUP under art. 23 ust. 1 pkt 58 lower the art. 30c income itself, so they reduce the base indirectly. The joint 8700 zł (indexed) cap covers both routes.

## 3. Joint taxation: danina is computed separately for each spouse

- Art. 30h ust. 1 places the obligation on "Osoby fizyczne", meaning each individual. Joint taxation under art. 6 ust. 2 ("opodatkowani łącznie od sumy swoich dochodów ... podatek określa się ... w podwójnej wysokości podatku obliczonego od połowy łącznych dochodów") applies to the PIT on art. 27 income. Art. 30h does not refer to it.
- The MF position (DSF-1 explanations on podatki.gov.pl, as widely quoted): "Każdy z małżonków, niezależnie od sposobu opodatkowania podatkiem dochodowym od osób fizycznych w PIT-36 albo w PIT-37, przy ustalaniu podstawy obliczenia daniny solidarnościowej uwzględnia wyłącznie swoje dochody (nie łączy ich z dochodami małżonka, ani nie dzieli na pół)." I could not fetch the podatki.gov.pl page directly (Incapsula block / 404). The quote comes via secondary sources, e.g. https://poradnikprzedsiebiorcy.pl/-danina-solidarnosciowa-przy-rozliczeniu-z-malzonkiem-a-zaplata-podatku and https://msdslegal.pl/danina-solidarnosciowa-a-rozliczenia-malzonkow/.
- In practice: each spouse's own income above 1 000 000 zł, less that spouse's own deductions under ust. 2, times 4%. Joint filing does not halve it.

## 4. Ulga na start: art. 18 ust. 1 Prawo przedsiębiorców and ZUS counting

Art. 18 ust. 1 (t.j. Dz.U. 2025 poz. 1480):
> "Przedsiębiorca będący osobą fizyczną, który podejmuje działalność gospodarczą po raz pierwszy albo podejmuje ją ponownie po upływie co najmniej 60 miesięcy od dnia jej ostatniego zawieszenia lub zakończenia i nie wykonuje jej na rzecz byłego pracodawcy, na rzecz którego przed dniem rozpoczęcia działalności gospodarczej w bieżącym lub w poprzednim roku kalendarzowym wykonywał w ramach stosunku pracy lub spółdzielczego stosunku pracy czynności wchodzące w zakres wykonywanej działalności gospodarczej, nie podlega obowiązkowym ubezpieczeniom społecznym przez okres 6 miesięcy od dnia podjęcia działalności gospodarczej."

ZUS guidance: https://www.zus.pl/-/ulga-na-start-preferencyjna-podstawa-dzialalnosc-nieewidencjonowana-jakie-sa-warunki-uprawnienia-i-skutk-1 (live, verified 2026-09-24). Section "Jak liczyć okres 6 miesięcy?":
> "Z ulgi na start możesz korzystać maksymalnie przez 6 miesięcy kalendarzowych od podjęcia działalności gospodarczej. Jeśli rozpoczniesz działalność pierwszego dnia miesiąca, to uwzględniasz ten miesiąc jako pierwszy z 6 miesięcy korzystania z ulgi. Jeśli natomiast rozpoczniesz działalność w trakcie miesiąca, to okres ulgi liczysz od kolejnego miesiąca kalendarzowego."
>
> "Przykład: Pan Adam rozpoczął działalność gospodarczą od 7 maja 2022 r. Spełnił on warunki do skorzystania z ulgi na start. Sześć miesięcy, za które nie będzie opłacał składek na ubezpieczenia społeczne, upłynie 30 listopada 2022 r."

On the same page, the preferential period starts after that:
> "Jeśli upłynie okres ulgi na start, a Ty spełniasz warunki do skorzystania z preferencyjnej podstawy wymiaru składek, to 24 miesiące kalendarzowe liczysz od dnia następnego po upływie 6 miesięcy kalendarzowych korzystania z ulgi."
> "Pani Lidia rozpoczęła działalność gospodarczą 1 maja 2022 r. ... Okres 24 miesięcy ... rozpocznie się od 1 listopada 2022 r. i będzie trwał do 31 października 2024 r."

**Answer:** ZUS counts 6 full calendar months and does not count 6 months to the day. After a mid-month start, the ulga covers the rest of the start month plus the next 6 full calendar months. It ends on the last day of the 6th full month: a start on 7 May gives an end on 30 November, not 6 November. A start on the 1st of a month includes that month (1 May gives an end on 31 October). Preferential ZUS then begins the following day (the 1st of the next month) and runs for 24 calendar months.
