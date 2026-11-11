# TriLingua

React + Vite alapú német–magyar szótanuló alkalmazás 5 000 szópárral, példamondatokkal, gyakorlással, teszttel és szókártyákkal.

## Követelmények
- Node.js LTS
- npm

## Futtatás
```bash
npm ci
npm run dev
```

Ezután nyisd meg a terminálban megjelenő címet (általában http://localhost:5173).

## Build és előnézet
```bash
npm run build
npm run preview
```

## Adatforrások és licencek
- A német címszavak és magyar fordítások a [német Wiktionary](https://de.wiktionary.org/) adataiból származnak. A Wiktionary tartalmára a [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/) és a [GFDL](https://www.gnu.org/licenses/fdl-1.3.html) feltételei vonatkoznak. A szócikkek forráslinkjei az alkalmazásban is elérhetők.
- A német–magyar példamondatok a [Tatoeba](https://tatoeba.org/) közösségi mondatai. Az export licencelése [CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/); a mondatok egyedi forráslinkjei az alkalmazásban találhatók.
- A négy szint a forrásadatok gyakorisági sorrendjéből képzett, egyenként 1 250 szavas csoport. Nem hivatalos CEFR-szintbesorolás.

A tanulási irány rögzített: német → magyar. A megjelölt szavak száma a böngésző helyi tárhelyén tárolódik.
