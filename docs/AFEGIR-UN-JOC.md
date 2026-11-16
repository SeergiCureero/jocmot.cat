# Afegir puzles o un joc nou

## Afegir puzles

Afegir-los **al final** de `src/games/<joc>/data/…` (la posició = número de puzle). Després, `npm test`: els tests validen que els puzles són coherents.

| Joc | Fitxer | Ajuda |
| --- | --- | --- |
| Paraula | `data/answers.ts` | Paraules de 5 lletres (amb accents si cal). |
| Connexions | `data/puzzles.ts` | 4 grups × 4 paraules, un grup per nivell (0–3). |
| Fils | `data/puzzles.ts` | `python scripts/generate-fils.py` genera graella i recorreguts. |
| Mini | `data/puzzles.ts` | `python scripts/generate-mini.py` cerca graelles; les definicions, a mà. |

**Calendari sense repeticions.** Els puzles #1-#21 (ja jugats) no es toquen. Després, cada joc té una llista de puzles nous que surten un per dia, sense repetir-se mai (`markLegacy` a `src/games/puzzles.ts`), i un diccionari `THEMED` de **puzles temàtics** que surten exactament el seu dia (Advent, Santa Llúcia, Nadal, Sant Esteve, Cap d'Any…), a `data/puzzles.ts` (a Paraula, `THEMED_ANSWERS`). La vista `/editor/proxims` mostra què surt cada dia i fins quan hi ha puzles diferents; `src/games/calendar.test.ts` falla si algun joc es queda sense contingut abans del 31 de desembre de 2026. Quan s'acabin, torna a començar pels nous: cal afegir-ne.

Fondària no té llista de puzles: les preguntes del dia es generen a partir del número (`src/games/fondaria/logic.ts`).

## Afegir un joc nou

1. Crear `src/games/<joc>/` amb la mateixa estructura que els altres (`meta.ts`, `logic.ts`, `<Joc>Game.tsx`, `data/`, `components/`).
2. Afegir l'id a `GameId` a `src/games/types.ts`.
3. Registrar-lo a `src/games/registry.ts`.
4. Instruccions: `src/games/<joc>/help.tsx` (3 passos com a màxim, amb exemple visual) i afegir-les a `src/games/help.ts`.
5. Resum per a la portada i la finestra de resultat (`summarize` i `headline` a `src/games/summary.ts`).
6. Icona i imatge per compartir a `identitat/jocs/<joc>.svg` i `identitat/compartir/<joc>.png`; després `bash scripts/genera-icones.sh` i afegir el joc a `SHARE_PAGES` de `vite.config.ts`.
7. Colors a `meta.ts` (`theme`) i a `src/index.css` (`--color-joc-<joc>`), seguint [DISSENY.md](DISSENY.md).

La ruta, l'enllaç de la portada, el menú i les estadístiques del perfil es generen automàticament.
