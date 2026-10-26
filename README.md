# jocmot.cat

Jocs de paraules diaris en català: **Paraula**, **Connexions**, **Fils** i **Mini**.

| Joc | Ruta | Inspirat en | Carpeta |
| --- | --- | --- | --- |
| 🟩 Paraula | `/paraula` | Wordle | `src/games/paraula` |
| 🟪 Connexions | `/connexions` | Connections | `src/games/connexions` |
| 🧵 Fils | `/fils` | Strands | `src/games/fils` |
| ✏️ Mini | `/mini` | The Mini Crossword | `src/games/mini` |

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 7 · Vitest · PocketBase (opcional, per a comptes).

## Començar

```bash
npm install
cp .env.example .env      # opcional
npm run dev               # http://localhost:5173
```

Sense `VITE_POCKETBASE_URL`, l'app funciona en **mode local**: els comptes i el progrés es guarden al navegador. Serveix per desenvolupar; en un build de producció sense backend els comptes s'amaguen i només es pot jugar. Per tenir comptes cal el backend (veure [docs/BACKEND.md](docs/BACKEND.md)).

| Script | Què fa |
| --- | --- |
| `npm run dev` | Servidor de desenvolupament |
| `npm run build` | Comprovació de tipus + build a `dist/` |
| `npm run typecheck` | Només tipus |
| `npm test` | Tests (lògica de joc + validació de puzles) |
| `npm run format` | Prettier |

## Estructura

```
src/
├── App.tsx                  # Rutes (generades des del registre de jocs)
├── main.tsx                 # Punt d'entrada i providers
├── index.css                # Tailwind + tema (colors, animacions)
├── config/
│   ├── site.ts              # Nom, data de llançament, flags (arxiu)
│   └── ads.ts               # Anuncis (desactivats)
├── lib/                     # Utilitats pures: dates, text, random, storage, share
├── services/backend/        # Contracte Backend + implementacions (local, PocketBase)
├── features/
│   ├── auth/                # Context de sessió, entrar, registre, perfil
│   └── progress/            # useGameProgress (desar/sincronitzar) + estadístiques
├── components/
│   ├── layout/              # Header, Footer, Layout
│   ├── ui/                  # Button, Modal, Toast, Spinner
│   ├── ads/                 # AdSlot
│   └── game/                # GameShell (marc comú), Keyboard (teclat català)
├── pages/                   # Inici, 404
└── games/
    ├── registry.ts          # ← llista única de jocs
    ├── GameRoute.tsx        # Resol el puzle (avui / arxiu)
    ├── puzzles.ts           # Número de puzle per data
    ├── types.ts
    └── <joc>/
        ├── meta.ts          # Nom, ruta, icona, colors
        ├── <Joc>Game.tsx    # Component principal (càrrega diferida)
        ├── logic.ts         # Regles del joc (funcions pures)
        ├── logic.test.ts
        ├── types.ts
        ├── components/      # Components propis del joc
        └── data/puzzles.ts  # Puzles
```

**Regla d'or:** cada joc és independent. Un joc només importa de `@/components`, `@/lib`, `@/features` i `@/config`, **mai** d'un altre joc. Es carrega per separat (code splitting).

## Com funciona

- **Puzle del dia:** tots els jocs comparteixen numeració. El #1 és `VITE_LAUNCH_DATE` (hora de Madrid).
- **Progrés:** `useGameProgress` el desa sempre al navegador; si hi ha sessió, també al servidor (guanya la còpia més recent).
- **Compartir:** cada joc genera el seu text amb emojis (`buildShareText`). En mòbil s'obre el menú de compartir; en escriptori es copia.
- **Arxiu (futur):** les rutes `/joc/:puzzleId` ja existeixen. S'activen amb `FEATURES.archive = true` a `src/config/site.ts`.
- **Anuncis (futur):** espais `<AdSlot>` ja col·locats. Veure [docs/ANUNCIS.md](docs/ANUNCIS.md).

## Documentació

- [Arquitectura](docs/ARQUITECTURA.md)
- [Backend i comptes (PocketBase)](docs/BACKEND.md)
- [Afegir puzles o un joc nou](docs/AFEGIR-UN-JOC.md)
- [Anuncis](docs/ANUNCIS.md)
- [Desplegament](docs/DESPLEGAMENT.md)
