# Backend: comptes, progrés i puzles del grup

S'usa [PocketBase](https://pocketbase.io): un sol binari (Go + SQLite) amb autenticació i API REST. El frontend hi parla amb `fetch`, sense SDK (`src/services/backend/pocketbase.ts`). Provat amb PocketBase **v0.40**.

Sense `VITE_POCKETBASE_URL`, el build de producció amaga els comptes i l'editor; en desenvolupament funcionen en mode local (simulat al navegador).

## 1. En local

```bash
# Descarregar el binari de https://github.com/pocketbase/pocketbase/releases a backend/
cd backend
./pocketbase superuser upsert admin@exemple.cat una-contrasenya-llarga
./pocketbase serve            # panell a http://127.0.0.1:8090/_/
```

A `.env` del frontend:

```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

**L'esquema es crea sol**: en arrencar, PocketBase aplica les migracions de `backend/pb_migrations/`. No cal crear res al panell.

Per comprovar les regles de seguretat (només contra un servidor local i buit): `node backend/comprova-regles.mjs`.

## 2. Esquema

| Col·lecció | Per a què |
| --- | --- |
| `users` | Comptes. Camp `name` = nom d'usuari. Camp `editor` (bool): pot dissenyar i revisar puzles. |
| `progress` | Progrés de cada usuari en cada puzle. Únic per (usuari, joc, puzle). |
| `puzzles` | Puzles del grup: `game`, `data` (JSON, mateixa forma que `src/games/<joc>/data`), `author`, `status` (`proposed`/`published`), `number`, `releaseAt`. |
| `reviews` | Aprovacions i comentaris dels editors. Única per (puzle, editor). |

Regles principals (detall a la migració):

- Ningú es pot fer **editor** a si mateix: només un superusuari, des del panell.
- El públic només veu un puzle **publicat** quan arriba el seu `releaseAt` (sense espòilers). Els editors ho veuen tot.
- No es pot aprovar el propi puzle. Un puzle publicat ja no es pot modificar.
- Índex únic (`game`, `number`): dos puzles no poden caure el mateix dia.

## 3. Fer editor algú

1. La persona es registra a la web.
2. Al panell (`/_/`) → **users** → el seu registre → activar **editor** → desar.
3. La persona torna a carregar la web: li apareixerà **✏️ Editor**.

## 4. Producció

Opcions:

- **[PocketHost](https://pockethost.io)** (gestionat, el més senzill): crear una instància, pujar el contingut de `backend/pb_migrations/` a la carpeta `pb_migrations` de la instància (per FTP, segons la seva documentació) i reiniciar-la.
- **VPS propi** (p. ex. Hetzner): PocketBase darrere d'HTTPS (Caddy o nginx) a `api.jocmot.cat`, amb `--migrationsDir` apuntant a `backend/pb_migrations`.

Després, al build del frontend: `VITE_POCKETBASE_URL=https://…` (a `.env.production` o a les variables de build de Cloudflare) i tornar a desplegar.

Cal també:

- Configurar **SMTP** al panell (verificació de correu i recuperació de contrasenya).
- **Còpies de seguretat** de `pb_data` (PocketHost i el panell en permeten).
- **RGPD**: política de privacitat i dret a esborrar el compte.

## Canviar de proveïdor

Implementar la interfície `Backend` de `src/services/backend/types.ts` (p. ex. `supabase.ts`) i triar-la a `src/services/backend/index.ts`. La resta de l'app no canvia.
