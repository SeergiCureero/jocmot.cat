# Afegir puzles o un joc nou

## Afegir puzles

Afegir-los **al final** de `src/games/<joc>/data/…` (la posició = número de puzle). Després, `npm test`: els tests validen que els puzles són coherents.

| Joc | Fitxer | Ajuda |
| --- | --- | --- |
| Paraula | `data/answers.ts` | Paraules de 5 lletres (amb accents si cal). |
| Connexions | `data/puzzles.ts` | 4 grups × 4 paraules, un grup per nivell (0–3). |
| Fils | `data/puzzles.ts` | `python scripts/generate-fils.py` genera graella i recorreguts. |
| Mini | `data/puzzles.ts` | `python scripts/generate-mini.py` cerca graelles; les definicions, a mà. |

Mentre hi hagi menys puzles que dies, la llista es recicla.

## Afegir un joc nou

1. Crear `src/games/<joc>/` amb la mateixa estructura que els altres (`meta.ts`, `logic.ts`, `<Joc>Game.tsx`, `data/`, `components/`).
2. Afegir l'id a `GameId` a `src/games/types.ts`.
3. Registrar-lo a `src/games/registry.ts`.

La ruta, l'enllaç de la portada, el menú i les estadístiques del perfil es generen automàticament.
