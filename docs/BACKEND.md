# Backend: comptes, progrés i puzles del grup

S'usa [PocketBase](https://pocketbase.io): un sol binari (Go + SQLite) amb autenticació i API REST. El frontend hi parla amb `fetch`, sense SDK (`src/services/backend/pocketbase.ts`). Provat amb PocketBase **v0.40**.

Sense `VITE_POCKETBASE_URL`, el build de producció amaga els comptes i l'editor; en desenvolupament funcionen en mode local (simulat al navegador).

## 1. En local

```bash
# Descarregar el binari de https://github.com/pocketbase/pocketbase/releases a backend/
cd backend
./pocketbase superuser upsert admin@exemple.cat una-contrasenya-llarga
./pocketbase serve            # panell a http://127.0.0.1:8090/_/ (carrega pb_migrations/ i pb_hooks/)
```

A `.env` del frontend:

```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

**L'esquema es crea sol**: en arrencar, PocketBase aplica les migracions de `backend/pb_migrations/`. No cal crear res al panell.

Per comprovar-ho (només contra un servidor local i buit; cada script amb la base de dades neta):

- `node backend/comprova-regles.mjs`: regles de seguretat de comptes, progrés i editor.
- `node backend/comprova-social.mjs`: punts, amistats i lligues.

## Punts, amics i lligues

Els calcula **el servidor**, amb JavaScript de PocketBase a `backend/pb_hooks/`:

- `jocmot.js`: lògica pura (punts, ratxes, rangs, dates de Madrid). Té tests amb Vitest (`npm test`).
- `jocmot_db.js`: consultes a la base de dades.
- `jocmot.pb.js`: en acabar una partida (`progress` amb estat `won`/`lost`) desa la puntuació a `scores`, i exposa les rutes `/api/jocmot/*` (perfil, amics, lligues).

El navegador no pot escriure a `scores`, `friendships`, `leagues` ni `league_members`: només ho fan aquestes rutes. Les puntuacions es calculen una sola vegada per puzle, amb l'hora del servidor (així l'arxiu no es pot fer passar per puzle del dia). La data de llançament és a `jocmot.js` i ha de coincidir amb `.env.production` (un test ho comprova).

Si cal recalcular puntuacions que faltin (p. ex. partides d'abans d'activar els punts): `POST /api/jocmot/admin/recalcula` amb un token de superusuari.

## 2. Esquema

| Col·lecció | Per a què |
| --- | --- |
| `users` | Comptes. Camp `name` = nom d'usuari (únic, 2-24 caràcters). Camp `editor` (bool): pot dissenyar i revisar puzles. |
| `progress` | Progrés de cada usuari en cada puzle. Únic per (usuari, joc, puzle). |
| `puzzles` | Puzles del grup: `game`, `data` (JSON, mateixa forma que `src/games/<joc>/data`), `author`, `status` (`proposed`/`published`), `number`, `releaseAt`. |
| `reviews` | Aprovacions i comentaris dels editors. Única per (puzle, editor). |
| `scores` | Punts de cada usuari per puzle (els calcula el servidor). |
| `friendships` | Sol·licituds d'amistat (`pending`/`accepted`). |
| `leagues`, `league_members` | Lligues (amb codi de 6 caràcters) i qui hi és. |

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

Servidor propi a **Hetzner Cloud** (projecte `jocmot`, Ubuntu 26.04, IP `2.31.96.199`). La web continua a Cloudflare; el servidor només fa d'API a **https://api.jocmot.cat** (registre `A` a Cloudflare, en mode *DNS only*). El frontend hi apunta amb `VITE_POCKETBASE_URL` a `.env.production`.

| Peça | On |
| --- | --- |
| PocketBase | `/opt/pocketbase` (usuari `pocketbase`), servei `pocketbase.service`, escolta a `127.0.0.1:8090` |
| Migracions i hooks | `/opt/pocketbase/pb_migrations` i `/opt/pocketbase/pb_hooks` (còpies de `backend/`) |
| Dades | `/opt/pocketbase/pb_data` |
| HTTPS | Caddy (repositori oficial), `/etc/caddy/Caddyfile`; certificat automàtic de Let's Encrypt |
| Seguretat | `ufw` (només 22, 80, 443), SSH només amb clau, `fail2ban`, actualitzacions automàtiques (inclòs Caddy) |
| Còpies | PocketBase en fa una cada dia a les 4:00 i en guarda 14 (panell → *Settings → Backups*); a més, les còpies diàries de Hetzner si estan activades |

Entrar al servidor: `ssh jocmot` (clau `~/.ssh/jocmot`).

**Desplegar canvis del servidor** (migracions noves o hooks): fer una còpia des del panell, copiar-los i reiniciar:

```bash
scp backend/pb_migrations/*.js jocmot:/opt/pocketbase/pb_migrations/
scp backend/pb_hooks/jocmot*.js jocmot:/opt/pocketbase/pb_hooks/
ssh jocmot 'chown -R pocketbase: /opt/pocketbase/pb_migrations /opt/pocketbase/pb_hooks && systemctl restart pocketbase'
```

Primer el servidor i després el frontend: la web antiga continua funcionant amb el servidor nou.

**Actualitzar PocketBase:** des del panell no es pot; cal baixar el binari nou de GitHub, comprovar-ne el `checksums.txt`, substituir `/opt/pocketbase/pocketbase` i `systemctl restart pocketbase`. Fer abans una còpia des del panell.

Pendent:

- Configurar **SMTP** al panell (verificació de correu i recuperació de contrasenya).
- **RGPD**: política de privacitat i dret a esborrar el compte.

## Canviar de proveïdor

Implementar la interfície `Backend` de `src/services/backend/types.ts` (p. ex. `supabase.ts`) i triar-la a `src/services/backend/index.ts`. La resta de l'app no canvia.
