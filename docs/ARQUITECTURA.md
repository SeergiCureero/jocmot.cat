# Arquitectura

## Capes

```
pages / games  →  features  →  services  →  lib
      ↘ components ↗
```

- **lib/**: funcions pures sense React. Fàcils de testejar.
- **services/backend/**: l'única capa que parla amb el servidor. Tot passa per la interfície `Backend` (`types.ts`). Canviar de proveïdor = escriure una implementació nova i triar-la a `index.ts`.
- **features/**: lògica d'aplicació amb React (sessió, progrés).
- **components/**: UI reutilitzable sense coneixement de cap joc concret.
- **games/**: cada joc en una carpeta autònoma.

## Anatomia d'un joc

1. `logic.ts` — estat + regles com a funcions pures: `initialState`, `getStatus`, accions (`submitGuess`, `submitSelection`…) i `buildShareText`. Sense React.
2. `<Joc>Game.tsx` — connecta la lògica amb la UI:
   ```tsx
   const { state, update, status } = useGameProgress({ gameId, puzzleId, initialState, getStatus });
   update((s) => submitX(s, ...));
   ```
3. `GameShell` — capçalera, ajuda, panell de resultat i botó de compartir. Tots els jocs l'usen perquè l'experiència sigui coherent.

L'estat de cada joc ha de ser **serialitzable a JSON** (es desa tal qual al navegador i al servidor).

## Flux de progrés

```
update() ─► localStorage (immediat)
        └─► backend.saveProgress (debounce 1,5 s, i en tancar la pàgina)

En muntar amb sessió:  backend.getProgress ─► si és més nou que el local, el substitueix
```

## Convencions

- Textos d'interfície en català. Codi i noms de fitxer en anglès; noms de jocs en català.
- Imports amb àlies `@/` (configurat a `vite.config.ts` i `tsconfig.app.json`).
- Components: `PascalCase.tsx`, un per fitxer, `export default`.
- Lògica: `camelCase.ts`, exports amb nom.
- Les dades de puzles s'afegeixen **sempre al final** de la llista (la posició determina el número).
