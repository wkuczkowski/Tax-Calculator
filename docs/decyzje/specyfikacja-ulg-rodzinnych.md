# SPEC: ulga na dzieci, samotny rodzic (kalkulator, rok 2026 + 2027)

> **Data:** 2026-09-25  
> **Status:** specyfikacja (wiążąca, kierunek zaakceptowany przez użytkownika). Sposób realizacji i odstępstwa: [rejestr decyzji](decyzje-implementacyjne.md), sekcja 12 „Ulgi rodzinne”.  
> **Zakres:** karta „Rodzina” kalkulatora (2026 i 2027): dane wejściowe, ulga na dzieci z limitami i zwrotem, samotny rodzic, małżonkowie, wynik przypisany działalności liczony dla gospodarstwa (z utratą ulg i preferencji), ulga dla rodzin 4+, przejrzystość.  
> **Pierwotna nazwa pliku:** `SPEC_CHILDREN.md`. W treści `research_children.md` = [research-ulgi-rodzinne.md](../prawo/research-ulgi-rodzinne.md). Odwołania do plików roboczych (`*.txt` z tekstami aktów, skryptów `*.mjs`/`*.cjs`, zrzutów ekranu, katalogów `scratchpad/…`) dotyczą katalogu roboczego sesji, w której powstał dokument. Tych plików nie przeniesiono do repozytorium. Teksty aktów są dostępne pod podanymi adresami ISAP/ELI. Utrzymywane narzędzie weryfikacyjne to [`tools/refmodel/`](../../tools/refmodel/).

Źródło prawne: `research_children.md` (§1–7). Decyzje poniżej są wiążące (orkiestrator; użytkownik zaakceptował kierunek).

## Wejścia (nowa karta „Rodzina”, zwijana; domyślnie brak dzieci)
- Status: „w związku małżeńskim cały rok” / „samotnie wychowuję dziecko” / „inny”.
- Lista dzieci: dla każdego – liczba miesięcy uprawniających w roku (1–12, domyślnie 12), checkbox „orzeczenie o niepełnosprawności”, checkbox „pełnoletnie uczące się (<25 lat) – spełnia warunki dochodowe” (użytkownik potwierdza warunki; nie liczymy dochodu dziecka).
- Udział podatnika w uldze (%) – dla małżonków domyślnie optymalny (cała ulga u tego, kto ją wykorzysta; opisać), dla „inny” pole %.
- Dla małżonków (także poza wariantem wspólnym): dochód małżonka ze skali (istniejące pole), czy małżonek jest na liniowym/ryczałcie (checkbox), składki społeczne+zdrowotne małżonka do limitu zwrotu (opcjonalne; domyślnie szacunek jak dla umowy o pracę od jego dochodu – opisać).
- Składki od „innych dochodów” (opcjonalne pole; domyślnie szacunek jak dla umowy o pracę – opisać wzór).

## Reguły
- Kwoty i limity wg research §1; limit dochodu tylko przy jednym dziecku (bez orzeczenia), wszystko-albo-nic; do limitu: dochody skali + art. 30b + liniowy (po składkach i odliczonej zdrowotnej liniowej); ryczałt NIE; IP BOX kwalifikowany NIE (literalnie – opisać w UI jako interpretację literalną, brak interpretacji KIS); strata – dochód 0 per źródło.
- Ulga odliczana tylko od podatku wg skali (art. 27), nie od liniowego/ryczałtu/5%/daniny. Przy liniowym/ryczałcie – od podatku skali od innych dochodów (i ew. małżonka – podział).
- Zwrot niewykorzystanej ulgi (art. 27f ust. 8–10): limit = składki społeczne odliczone na podstawie art. 26 (nie w kosztach, nie w PIT-36L/PIT-28) + zdrowotna zapłacona nieodliczona w PIT-36L/28/16A + składki od innych dochodów (+ małżonka przy małżeństwie). OSTROŻNIE: zdrowotna liniowa ponad limit 14 100 i nieodliczone 50% zdrowotnej ryczałtowej NIE wliczane (opisać).
- Optymalizator metody odliczenia składek MUSI uwzględniać wpływ na limit zwrotu (od dochodu vs w kosztach).
- Samotny rodzic (art. 6 ust. 4c–4f): 2× podatek od połowy dochodu ze skali (bez dochodu IP BOX kwalifikowanego); preferencja tracona w całości przy liniowym/ryczałcie rodzica → nowy wariant „Skala – samotny rodzic” (i „Skala + IP BOX – samotny rodzic”) zamiast/obok indywidualnego, gdy status = samotny rodzic.
- Samotny rodzic na liniowym – limit dla jednego dziecka: OSTROŻNIE 56 000 zł (stanowisko MF), z notką że literalnie ustawa wskazuje 112 000 zł.
- Miesiąc 25. urodzin liczy się (praktyka) – notka.
- Rozliczenie wspólne: ulga od podatku wspólnego; limit zwrotu = składki obojga.

## Wynik przypisany działalności
- Baseline gospodarstwa BEZ działalności liczony z ulgą, zwrotem i preferencjami (samotny rodzic / wspólne – najlepsze z możliwych dla małżonków), tak by wynik = obciążenie przypisane JDG było porównywalne. Ujemny wpływ (utrata preferencji/ulgi przy liniowym/ryczałcie) ma być widoczny w wierszu i wyliczeniu („utrata ulgi na dzieci: +X zł”, „utrata preferencji samotnego rodzica: +Y zł”).

## Rodziny 4+ (art. 21 ust. 1 pkt 153)
- MODELUJEMY wg research_children.md §8 (pseudokod §8.8): osobny checkbox „Spełniam warunki ulgi dla rodzin 4+” (nie wyliczany z listy dzieci – inne reguły; notka o warunkach) + pole „limit 85 528 zł wykorzystany już na innych przychodach” (domyślnie 0).
- Zwolnienie przychodu JDG we wszystkich formach (skala, liniowy, ryczałt, IP BOX); koszty w całości; dochód może być ujemny (bez przenoszenia straty – notka).
- Zdrowotna bez zmian (art. 81 ust. 2zd pkt 2 – podstawa i progi ryczałtu z przychodem przed zwolnieniem); danina – zwolniony przychód poza podstawą; składki społeczne w pełni odliczalne od pozostałego dochodu/przychodu.
- Wiele stawek ryczałtu i IP BOX: podział zwolnienia proporcjonalny (założenie, oznaczone w UI).
- Małżonek: własny limit – poza zakresem (dochód małżonka wpisywany już po jego zwolnieniu – notka).
- Limit 85 528 zł w stałych roku (2026 i 2027 – ta sama wartość, bez indeksacji).

## Przejrzystość
Każdy element (kwota ulgi per dziecko/miesiąc, limit, test limitu, wykorzystanie od podatku, zwrot i jego limit, utrata preferencji) rozpisany w wyliczeniu z podstawą prawną; założenia w modalu.
