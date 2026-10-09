// Az oktatási oldal teljes tartalma. Az admin.html oldalon szerkeszthető;
// mentéskor ez a fájl cserélődik le.
window.TEMAK = {
 "szoveg": "Szövegek",
 "tomb": "Tömbök és keresés",
 "rendezes": "Rendezések"
};
window.ALAP_FELADATOK = [
 {
  "id": "tukorszo",
  "cim": "Tükörszó-felismerő",
  "evfolyam": 9,
  "sor": 1,
  "ido": 10,
  "tema": "szoveg",
  "nehezseg": 2,
  "tetel": "Szöveg bejárása két végről (két index)",
  "forras": "",
  "gyakorlas": [],
  "rovid": "Visszafelé olvasva is ugyanaz? Szavakon és egész mondatokon is kipróbáljuk.",
  "specifikacio": {
   "bemenet": "`szavak` – szövegek listája",
   "kimenet": "minden szövegről: tükörszó-e",
   "feltetel": "a kis- és nagybetű nem számít, a szóközöket figyelmen kívül hagyjuk"
  },
  "leiras": "A tükörszó (más néven palindrom) visszafelé olvasva is ugyanaz, mint előre: `kerek`, `görög`, `abba`. Mondatokkal is működik, ha nem törődünk a szóközökkel és a nagybetűkkel: *Géza kék az ég*.\n\nA program nézze végig ezt a listát, és mindegyikről írja ki, tükörszó-e:\n\n`szavak = [\"kerek\", \"alma\", \"görög\", \"Géza kék az ég\", \"Indul a görög aludni\"]`\n\nEgy kikötés: a `[::-1]` megfordítást most ne használd. Két indexszel dolgozz, az egyik a szó elejéről, a másik a végéről indul, és így hasonlítsd össze a betűket.",
  "bemenet": "",
  "kimenet": "kerek -> tükörszó\nalma -> nem tükörszó\ngörög -> tükörszó\nGéza kék az ég -> tükörszó\nIndul a görög aludni -> tükörszó",
  "tippek": [
   "Először tisztítsd meg a szöveget: a `szo.lower()` kisbetűssé alakítja, a `.replace(\" \", \"\")` kiszedi belőle a szóközöket.",
   "A betűket indexszel éred el, pont mint egy listában. `tiszta[0]` az első betű, `tiszta[len(tiszta) - 1]` az utolsó.",
   "Kell egy `bal` és egy `jobb` index. Amíg `bal < jobb`, hasonlítsd össze a két betűt, utána mindkettővel lépj egyet befelé."
  ],
  "lepesek": [
   {
    "cim": "A szöveg megtisztítása",
    "kod": "szo = \"Géza kék az ég\"\ntiszta = szo.lower().replace(\" \", \"\")\nprint(tiszta, len(tiszta))",
    "magyarazat": "Az első sorban a vizsgált szöveg áll. Egyelőre csak ezzel az egy mondattal próbálkozunk, a listát csak a végén vesszük elő.\n\nA második sorban két művelet jön egymás után. A `szo.lower()` kisbetűssé alakítja a szöveget (`géza kék az ég`), aztán ennek az eredményén a `.replace(\" \", \"\")` minden szóközt üres szövegre cserél, vagyis kitörli őket. Így lesz belőle `gézakékazég`.\n\nFontos: a `lower()` és a `replace()` nem az eredeti szöveget írja át, hanem egy újat ad vissza. A `szo` változatlan marad, ezért kell az eredményt eltenni a `tiszta` változóba.\n\nA `print` kiírja a megtisztított szöveget és a hosszát (11). Érdemes mindig kiíratni a részeredményt, így rögtön látszik, ha valami nem úgy működik, ahogy vártad."
   },
   {
    "cim": "Összehasonlítás a két végéről",
    "kod": "bal = 0\njobb = len(tiszta) - 1\ntukor = True\nwhile bal < jobb:\n    if tiszta[bal] != tiszta[jobb]:\n        tukor = False\n        break\n    bal += 1\n    jobb -= 1\nprint(tukor)",
    "magyarazat": "A `bal = 0` az első betű indexe, a `jobb = len(tiszta) - 1` az utolsóé. Azért kell a `- 1`, mert az indexelés 0-tól indul: egy 11 betűs szöveg utolsó betűje a 10-es indexen van.\n\nA `tukor` az elején `True`, vagyis abból indulunk ki, hogy tükörszó. Ez egy jelzőváltozó: csak akkor írjuk át, ha kiderül az ellenkezője.\n\nA `while bal < jobb` addig fut, amíg a két index nem találkozik. Minden körben összehasonlítjuk a `tiszta[bal]` és a `tiszta[jobb]` betűt. Ha eltérnek, a `tukor` `False` lesz, és a `break` azonnal kiléptet a ciklusból, mert a többi betűt már fölösleges megnézni.\n\nHa a két betű egyforma, a `bal += 1` eggyel jobbra, a `jobb -= 1` eggyel balra lépteti az indexet. Így mindkét oldalról haladunk befelé.\n\nMiért `<` és nem `<=`? Páratlan hosszú szónál a két index a középső betűn találkozik, azt nem kell önmagával összehasonlítani. Páros hosszú szónál pedig a két index átlép egymáson, és a ciklus magától leáll."
   },
   {
    "cim": "Az egész listára",
    "kod": "for szo in szavak:\n    # ide jön az előző két lépés\n    ...",
    "magyarazat": "Eddig egyetlen mondattal dolgoztunk, most jön a teljes lista. A `for szo in szavak:` sorban a `szo` változó minden körben a lista következő elemét veszi fel: először `kerek`, aztán `alma`, és így tovább.\n\nA ciklus belsejébe kerül az előző két lépés kódja, egy szinttel (4 szóközzel) beljebb húzva. A `szo = \"Géza kék az ég\"` sor már nem kell, hiszen a `szo` értékét most a `for` adja.\n\nA `tukor = True` sor is a cikluson belül legyen! Minden új szónál újra abból kell kiindulni, hogy tükörszó. Ha a `for` elé tennéd, az `alma` után `False` maradna, és minden további szóra azt írná ki, hogy nem tükörszó.\n\nA `while` után kiírjuk az eredményt: ha a `tukor` igaz, `-> tükörszó`, különben `-> nem tükörszó`. Ez az `if` a `for` belsejében van, de a `while`-on kívül, ezért ugyanannyira kell behúzni, mint a `while` sort. Ha a `while` belsejébe kerülne, minden betűpár után kiírna valamit. Ha a `for`-on kívülre, csak az utolsó szóról írna ki eredményt."
   }
  ],
  "nyomkovetes": {
   "fejlec": [
    "bal",
    "jobb",
    "tiszta[bal]",
    "tiszta[jobb]",
    "egyforma?"
   ],
   "sorok": [
    [
     "0",
     "4",
     "a",
     "a",
     "igen"
    ],
    [
     "1",
     "3",
     "l",
     "m",
     "NEM",
     "*"
    ]
   ],
   "megjegyzes": "Az `alma` szónál már a második párnál (l és m) kiderül, hogy nem tükörszó, és a program ott abba is hagyja. A `kerek` szónál a két index a középső `r`-nél találkozik, azt nem kell önmagával összehasonlítani."
  },
  "megoldas": "szavak = [\"kerek\", \"alma\", \"görög\", \"Géza kék az ég\", \"Indul a görög aludni\"]\n\nfor szo in szavak:\n    tiszta = szo.lower().replace(\" \", \"\")\n    bal = 0\n    jobb = len(tiszta) - 1\n    tukor = True\n    while bal < jobb:\n        if tiszta[bal] != tiszta[jobb]:\n            tukor = False\n            break\n        bal += 1\n        jobb -= 1\n\n    if tukor:\n        print(szo, \"-> tükörszó\")\n    else:\n        print(szo, \"-> nem tükörszó\")",
  "magyarazat": "Ez egy eldöntéses feladat: minden szóra igen vagy nem a válasz. Az ilyeneket általában így oldjuk meg: feltételezzük, hogy igaz, és keresünk egy ellenpéldát. Ha találunk, kész. Ha elfogyott a szó, és nem találtunk, akkor tényleg igaz.\n\nPythonban rövidebben is meg lehet írni: `tiszta == tiszta[::-1]`. Ez egyetlen sor, de mindig lemásolja és végignézi az egész szöveget, akkor is, ha már az első betű sem stimmel. Ezért kértük most a két indexes változatot.\n\n**Futási idő:** egy `n` betűs szónál legfeljebb `n / 2` összehasonlítás, mert két oldalról haladunk befelé. Ez O(n), vagyis a szó hosszával arányos.\n**Tárigény:** a megtisztított szövegen kívül csak két index kell (`bal`, `jobb`)."
 },
 {
  "id": "buborekrendezes",
  "cim": "Tornasor – buborékrendezés",
  "evfolyam": 9,
  "sor": 1,
  "ido": 10,
  "tema": "rendezes",
  "nehezseg": 2,
  "tetel": "Buborékrendezés (helyben rendezés)",
  "forras": "",
  "gyakorlas": [],
  "rovid": "Sorba állás magasság szerint, ahol csak a szomszédok cserélhetnek helyet.",
  "specifikacio": {
   "bemenet": "`magassagok` – egész számok listája (cm)",
   "kimenet": "a lista minden kör után, és a cserék száma",
   "feltetel": "a `sort()` és a `sorted()` most nem használható; csak szomszédos elemek cserélhetnek helyet"
  },
  "leiras": "Tornaórán magasság szerint kell sorba állni, de csak két szomszéd cserélhet helyet. A tanár végigmegy a soron, és ahol a bal oldali magasabb, mint a jobb oldali, ott helyet cseréltet. Ezt addig csinálja, amíg mindenki a helyére nem kerül.\n\n`magassagok = [152, 147, 160, 139, 155, 144]`\n\nÍrj programot, amely így rendezi a listát növekvő sorrendbe! Minden kör után írja ki, hogy áll a sor, a végén pedig azt, hány csere volt összesen.",
  "bemenet": "",
  "kimenet": "1. kör után: [147, 152, 139, 155, 144, 160]\n2. kör után: [147, 139, 152, 144, 155, 160]\n3. kör után: [139, 147, 144, 152, 155, 160]\n4. kör után: [139, 144, 147, 152, 155, 160]\n5. kör után: [139, 144, 147, 152, 155, 160]\nCserék száma: 9",
  "tippek": [
   "Pythonban két elemet egy sorban meg lehet cserélni: `magassagok[i], magassagok[i + 1] = magassagok[i + 1], magassagok[i]`.",
   "Egy kör: `for i in range(len(magassagok) - 1)`. Az utolsó elemnek nincs jobb szomszédja, ezért megyünk eggyel kevesebbet.",
   "Egy kör után a legmagasabb már biztosan hátul áll. Hat embernél így öt kör elég."
  ],
  "lepesek": [
   {
    "cim": "Egyetlen kör",
    "kod": "magassagok = [152, 147, 160, 139, 155, 144]\nfor i in range(len(magassagok) - 1):\n    if magassagok[i] > magassagok[i + 1]:\n        magassagok[i], magassagok[i + 1] = magassagok[i + 1], magassagok[i]\nprint(magassagok)",
    "magyarazat": "A `for i in range(len(magassagok) - 1)` a 0, 1, 2, 3, 4 indexeken megy végig. Azért csak eddig, mert minden `i`-nél a jobb szomszédot, az `i + 1`-edik elemet is megnézzük, az utolsó elemnek pedig nincs jobb szomszédja. A `- 1` nélkül az utolsó körben a `magassagok[6]` elemet keresnénk, és `IndexError` hibát kapnánk.\n\nAz `if` megnézi, hogy a bal oldali magasabb-e a jobb oldalinál. Ha igen, rossz a sorrendjük, ezért megcseréljük őket.\n\nA csere sora Python-specialitás: a jobb oldalon először elkészül a két érték fordított sorrendben, és csak utána kerülnek vissza a listába. Más nyelvekben ehhez segédváltozó kell: `seged = a`, `a = b`, `b = seged`.\n\nAz első kör után ez lesz: `[147, 152, 139, 155, 144, 160]`. A 160 kivándorolt a sor végére, mint egy buborék a víz tetejére. Innen kapta a nevét a módszer. A lista többi része viszont még nincs rendben, ezért kell több kör."
   },
   {
    "cim": "Több kör, és a cserék számolása",
    "kod": "n = len(magassagok)\ncserek = 0\nfor kor in range(n - 1):\n    for i in range(n - 1 - kor):\n        if magassagok[i] > magassagok[i + 1]:\n            magassagok[i], magassagok[i + 1] = magassagok[i + 1], magassagok[i]\n            cserek += 1\n    print(f\"{kor + 1}. kör után: {magassagok}\")\nprint(\"Cserék száma:\", cserek)",
    "magyarazat": "Az `n` a lista hossza (6), a `cserek` számláló pedig 0-ról indul.\n\nA külső ciklus (`for kor in range(n - 1)`) a köröket számolja: 0-tól 4-ig, vagyis 5 kört. Ennyi biztosan elég: minden kör a legnagyobb, még rossz helyen álló elemet a helyére viszi, és ha 5 ember már a helyén áll, a hatodik is csak jó helyen lehet.\n\nA belső ciklus ugyanaz, mint az előző lépésben, csak minden körben eggyel rövidebb: `range(n - 1 - kor)`. Az első körben 5 szomszédpárt nézünk, a másodikban 4-et, és így tovább. A sor végén állók már a helyükön vannak, őket fölösleges újra összehasonlítani.\n\nA `cserek += 1` ugyanabban az `if`-ben van, mint a csere, így csak akkor nő, ha tényleg cseréltünk.\n\nAz első `print` a belső ciklus után, de a külsőn belül áll, ezért minden kör végén egyszer írja ki a listát. A `kor + 1` azért kell, mert a `kor` 0-tól számol, mi viszont az 1. körtől szeretnénk számozni. Az utolsó `print` már a külső cikluson kívül van, ez csak egyszer, a legvégén fut le.\n\nFigyelj: ha az előző lépés kódja után futtatod, a lista már átesett egy körön. Az elvárt kimenethez írd elé újra a `magassagok = [152, 147, 160, 139, 155, 144]` sort."
   }
  ],
  "nyomkovetes": {
   "fejlec": [
    "i",
    "m[i]",
    "m[i + 1]",
    "csere?",
    "lista utána"
   ],
   "sorok": [
    [
     "0",
     "152",
     "147",
     "igen",
     "147 152 160 139 155 144",
     "*"
    ],
    [
     "1",
     "152",
     "160",
     "nem",
     "147 152 160 139 155 144"
    ],
    [
     "2",
     "160",
     "139",
     "igen",
     "147 152 139 160 155 144",
     "*"
    ],
    [
     "3",
     "160",
     "155",
     "igen",
     "147 152 139 155 160 144",
     "*"
    ],
    [
     "4",
     "160",
     "144",
     "igen",
     "147 152 139 155 144 160",
     "*"
    ]
   ],
   "megjegyzes": "Ez az első kör lépésenként. Jól látszik, hogy a 160 minden cserénél egy hellyel hátrébb kerül."
  },
  "megoldas": "magassagok = [152, 147, 160, 139, 155, 144]\nn = len(magassagok)\ncserek = 0\n\nfor kor in range(n - 1):\n    for i in range(n - 1 - kor):\n        if magassagok[i] > magassagok[i + 1]:\n            magassagok[i], magassagok[i + 1] = magassagok[i + 1], magassagok[i]\n            cserek += 1\n    print(f\"{kor + 1}. kör után: {magassagok}\")\n\nprint(\"Cserék száma:\", cserek)",
  "magyarazat": "A buborékrendezés talán a legegyszerűbb rendezés: mindig két szomszédot nézünk, és ha rossz a sorrendjük, megcseréljük őket.\n\nNem kell hozzá új lista, minden az eredeti listán belül történik. Ezt hívják helyben rendezésnek, és az az előnye, hogy szinte semmi plusz memória nem kell hozzá.\n\nA hátránya a sebesség, ezért nagy adatnál gyorsabb módszert használnak. A Python `sort()` is ilyet.\n\n**Futási idő:** hat elemnél 5 + 4 + 3 + 2 + 1 = 15 összehasonlítás, egy 30 fős osztálynál 435, ezer elemnél közel félmillió. Ez O(n²): kétszer annyi elemhez nagyjából négyszer annyi munka kell.\n**Tárigény:** helyben rendez, nem kell hozzá új lista."
 },
 {
  "id": "binaris-kereses",
  "cim": "Keresés a szótárban (bináris keresés)",
  "evfolyam": 9,
  "sor": 1,
  "ido": 10,
  "tema": "tomb",
  "nehezseg": 2,
  "tetel": "Logaritmikus (bináris) keresés",
  "forras": "",
  "gyakorlas": [],
  "rovid": "Hogyan keresel egy szót a szótárban? Nem az első oldaltól lapozol. Ezt írjuk most meg.",
  "specifikacio": {
   "bemenet": "`szotar` – ábécérendbe rendezett szavak listája; `keresett` – egy szó",
   "kimenet": "a keresett szó indexe (vagy -1, ha nincs benne) és a felhasznált lépések száma",
   "feltetel": "a lista ábécérendben van; a beépített `in` és `index()` nem használható"
  },
  "leiras": "Ha egy szót keresel a papírszótárban, nem az első oldalnál kezded. Kinyitod valahol középen, megnézed, milyen betűnél jársz, és onnan tudod, hogy előrébb vagy hátrébb kell lapozni. Minden lapozással kiesik a szótár egy nagy része.\n\nEz a bináris keresés. A mi szótárunk most rövid, 20 szó van benne ábécérendben:\n\n`szotar = [\"alma\", \"bab\", \"cica\", \"dinnye\", \"eper\", \"fagyi\", \"gomba\", \"hal\", \"ing\", \"kalap\", \"lufi\", \"macska\", \"nap\", \"olaj\", \"pad\", \"sas\", \"tigris\", \"uborka\", \"vonat\", \"zebra\"]`\n\nÍrj egy `binaris_kereses(lista, keresett)` függvényt, amely mindig a maradék rész közepét nézi meg! Adja vissza, hányadik indexen van a keresett szó (ha nincs benne, akkor `-1`-et), és azt is, hány lépés kellett hozzá. Próbáld ki a `macska`, a `kutya` és az `alma` szóval!",
  "bemenet": "",
  "kimenet": "A szótár hossza: 20\nmacska: index = 11, lépések: 3\nkutya: index = -1, lépések: 4\nalma: index = 0, lépések: 4\nLineáris kereséssel a legrosszabb eset: 20 lépés",
  "tippek": [
   "Pythonban a szavakat is össze lehet hasonlítani, ábécérend szerint: a `\"alma\" < \"bab\"` igaz, a `\"pad\" < \"kutya\"` hamis.",
   "Két határ kell: `bal = 0` és `jobb = len(lista) - 1`. Ha a szó benne van a listában, akkor valahol e kettő között.",
   "A közép: `kozep = (bal + jobb) // 2`. Ha `lista[kozep]` az ábécében előbb van, mint a keresett szó, a bal fele mehet: `bal = kozep + 1`. Ha később, a jobb fele: `jobb = kozep - 1`.",
   "Két értéket így adsz vissza: `return kozep, lepes`. Átvenni pedig így lehet: `hely, lepes = binaris_kereses(szotar, \"macska\")`."
  ],
  "lepesek": [
   {
    "cim": "Kinyitjuk középen",
    "kod": "szotar = [\"alma\", \"bab\", \"cica\", \"dinnye\", \"eper\", \"fagyi\", \"gomba\", \"hal\", \"ing\", \"kalap\",\n          \"lufi\", \"macska\", \"nap\", \"olaj\", \"pad\", \"sas\", \"tigris\", \"uborka\", \"vonat\", \"zebra\"]\nbal = 0\njobb = len(szotar) - 1\nkozep = (bal + jobb) // 2\nprint(kozep, szotar[kozep])",
    "magyarazat": "A `szotar` lista nem fért ki egy sorban, ezért két sorra törtük. Szögletes zárójelen belül ezt nyugodtan lehet, a Python tudja, hogy a lista még nem ért véget.\n\nA `bal` és a `jobb` az a két határ, amelyek között a keresett szó lehet. Az elején ez az egész lista: a 0-s indextől a 19-esig.\n\nA `kozep = (bal + jobb) // 2` a kettő közötti középső index. A `//` egészosztás, a tört részt levágja: (0 + 19) // 2 = 9. Sima `/` jellel 9.5 jönne ki, azzal pedig nem lehet indexelni.\n\nA `print` kiírja: `9 kalap`. Ha a `macska` szót keressük, az ábécében a `kalap` után jön, tehát a bal fele (az `alma`-tól a `kalap`-ig) már ki is esett. Egyetlen összehasonlítással 10 szót zártunk ki."
   },
   {
    "cim": "A függvény",
    "kod": "def binaris_kereses(lista, keresett):\n    bal = 0\n    jobb = len(lista) - 1\n    lepes = 0\n    while bal <= jobb:\n        lepes += 1\n        kozep = (bal + jobb) // 2\n        if lista[kozep] == keresett:\n            return kozep, lepes\n        elif lista[kozep] < keresett:\n            bal = kozep + 1\n        else:\n            jobb = kozep - 1\n    return -1, lepes",
    "magyarazat": "A függvény két dolgot kap: a `lista` a rendezett szólista, a `keresett` a szó, amit keresünk. A `lepes` számláló azt méri, hányszor néztünk bele a listába.\n\nA `while bal <= jobb` addig fut, amíg van még hely, ahol a szó lehet. Itt `<=` kell, nem `<`: ha `bal == jobb`, még egy szó maradt, és azt is meg kell nézni.\n\nA ciklus minden körében kiszámoljuk a közepet, és három eset lehet:\n– `lista[kozep] == keresett`: megtaláltuk. A `return` azonnal kilép a függvényből (így a ciklusból is), és visszaadja az indexet és a lépésszámot.\n– `lista[kozep] < keresett`: a középső szó az ábécében előrébb van, tehát a keresett szó tőle jobbra lehet. A bal határ a közép utánra kerül: `bal = kozep + 1`. A `+ 1` azért kell, mert a közepet már megnéztük.\n– különben a keresett szó balra van, ezért a jobb határ kerül a közép elé: `jobb = kozep - 1`.\n\nMinden lépéssel a maradék fele kiesik. Ha a `bal` átlépi a `jobb`-ot, nem maradt hely, ahol a szó lehetne, ezért a ciklus leáll. Ide csak akkor jut el a program, ha nem találtuk meg a szót, ezért az utolsó sor `-1`-et ad vissza. Ez jó jelzés, mert a lista indexei (0, 1, 2…) között biztosan nem fordul elő."
   }
  ],
  "nyomkovetes": {
   "fejlec": [
    "lépés",
    "bal",
    "jobb",
    "kozep",
    "lista[kozep]",
    "merre tovább?"
   ],
   "sorok": [
    [
     "1",
     "0",
     "19",
     "9",
     "kalap",
     "a kutya később jön → jobbra"
    ],
    [
     "2",
     "10",
     "19",
     "14",
     "pad",
     "a kutya előbb van → balra"
    ],
    [
     "3",
     "10",
     "13",
     "11",
     "macska",
     "a kutya előbb van → balra"
    ],
    [
     "4",
     "10",
     "10",
     "10",
     "lufi",
     "a kutya előbb van → balra"
    ],
    [
     "–",
     "10",
     "9",
     "",
     "",
     "bal > jobb, nincs benne",
     "*"
    ]
   ],
   "megjegyzes": "Így keresi a `kutya` szót, ami nincs a szótárban. A negyedik lépés után a `bal` nagyobb lesz, mint a `jobb`, vagyis nem maradt hely, ahol a szó lehetne. Ekkor a ciklus leáll, és a függvény `-1`-et ad vissza."
  },
  "megoldas": "def binaris_kereses(lista, keresett):\n    bal = 0\n    jobb = len(lista) - 1\n    lepes = 0\n    while bal <= jobb:\n        lepes += 1\n        kozep = (bal + jobb) // 2\n        if lista[kozep] == keresett:\n            return kozep, lepes\n        elif lista[kozep] < keresett:\n            bal = kozep + 1\n        else:\n            jobb = kozep - 1\n    return -1, lepes\n\n\nszotar = [\"alma\", \"bab\", \"cica\", \"dinnye\", \"eper\", \"fagyi\", \"gomba\", \"hal\", \"ing\", \"kalap\",\n          \"lufi\", \"macska\", \"nap\", \"olaj\", \"pad\", \"sas\", \"tigris\", \"uborka\", \"vonat\", \"zebra\"]\nprint(\"A szótár hossza:\", len(szotar))\n\nfor keresett in [\"macska\", \"kutya\", \"alma\"]:\n    hely, lepes = binaris_kereses(szotar, keresett)\n    print(f\"{keresett}: index = {hely}, lépések: {lepes}\")\n\nprint(\"Lineáris kereséssel a legrosszabb eset:\", len(szotar), \"lépés\")",
  "magyarazat": "A bináris keresés minden lépésben megfelezi azt a részt, ahol még lehet a szó: 20, aztán 10, 5, 2, 1. Ha az elejétől egyesével néznénk végig (ez a lineáris keresés), rossz esetben minden szót meg kellene nézni. Minél nagyobb a szótár, annál nagyobb a különbség.\n\nEgy feltétele van: a listának rendezettnek kell lennie. Egy összekevert szótárban nem tudnánk, merre kell lapozni.\n\nMég egy apróság: a Python a betűket a kódjuk szerint rendezi, és ebben az ékezetes betűk (á, é, ö…) a `z` után jönnek. Ezért nincs most ékezetes szó a listában.\n\n**Futási idő:** 20 szónál legfeljebb 5 lépés, egy igazi, 60 000 szavas szótárban legfeljebb 16. Ez O(log n). A lineáris keresésnek ugyanez rossz esetben 20, illetve 60 000 lépés, az O(n).\n**Tárigény:** csak három index kell (`bal`, `jobb`, `kozep`), a listát nem másoljuk le.\n**Feltétel:** a lista legyen rendezett."
 }
];
window.BEALLITASOK = {
 "oldalCim": "Algoritmusok lépésről lépésre",
 "logoJel": "",
 "lablec": "Algoritmusok Pythonban, 9. osztályosoknak.",
 "evfolyamok": "9",
 "nehezsegek": "könnyű, közepes, nehéz",
 "menu": {
  "kezdolap": "Kezdőlap",
  "feladatok": "Feladatok",
  "osztaly": "{n}. osztály"
 },
 "kezdolap": {
  "cimkek": "",
  "cim": "Algoritmusok Pythonban",
  "bevezeto": "Az órai feladatok 9. osztálynak, egyenként kb. 30 percre. Válaszd ki az osztályodat lent. Minden feladatnál van tipp, ha elakadsz, és a megoldás is megvan lépésenként, de azt csak a végén nézd meg.",
  "munkamenetCim": "",
  "munkamenet": [],
  "temakCim": "Témakörök",
  "temakBevezeto": "",
  "osztalyGomb": "Feladatok megnyitása"
 },
 "feladatokOldal": {
  "cim": "Algoritmusok Pythonban",
  "bevezeto": "Az órai feladatok, egy feladatsor kb. 30 perc. Minden feladatnál van tipp, ha elakadsz, és a megoldás is megvan lépésenként, de azt csak a végén nézd meg."
 },
 "feladatOldal": {
  "specCim": "Mit kér a feladat?",
  "leirasCim": "A feladat",
  "peldaCim": "Ezt kell kiírnia",
  "bemenetFelirat": "Amit beírunk",
  "kimenetFelirat": "Elvárt kimenet",
  "tippekCim": "Tippek",
  "tippekBevezeto": "Csak akkor nyisd ki, ha elakadtál, és egyszerre csak egyet.",
  "megoldasCim": "Megoldás lépésenként",
  "lepesekBevezeto": "Nem egyszerre írjuk meg az egészet. Minden lépés külön is lefut, érdemes tényleg kipróbálni őket.",
  "nyomkovetesCim": "Nyomkövetés",
  "teljesKodCim": "A teljes program",
  "teljesKodLabjegyzet": "Ha a tiéd máshogy néz ki, az nem baj, egy feladatot sokféleképpen meg lehet oldani. Az a fontos, hogy ugyanazt írja ki.",
  "magyarazatCim": "Miért működik?",
  "gyakorlasCim": "Ha ez már megy",
  "gyakorlasSzoveg": "Hasonló feladat versenyfeladatok között is van. Ott a gép sok teszttel ellenőrzi a megoldást, általában nagyobb adatokkal, és angolul."
 },
 "feladatsorok": [
  {
   "osztaly": "9",
   "sor": 1,
   "cim": "Keresés és rendezés"
  }
 ]
};
