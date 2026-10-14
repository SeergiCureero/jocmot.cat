# Backend: comptes i progrés

S'usa [PocketBase](https://pocketbase.io): un sol binari (Go + SQLite) amb autenticació i API REST. Es pot allotjar en qualsevol VPS europeu (p. ex. Hetzner). El frontend hi parla amb `fetch`, sense SDK (`src/services/backend/pocketbase.ts`).

## 1. Posar-lo en marxa

```bash
./pocketbase serve            # panell a http://127.0.0.1:8090/_/
```

A `.env` del frontend:

```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

## 2. Col·leccions

### `users` (ve per defecte, tipus *auth*)
Es fa servir el camp `name` com a nom d'usuari. Activar l'autenticació per correu i contrasenya.

### `progress` (tipus *base*)

| Camp | Tipus | Notes |
| --- | --- | --- |
| `user` | Relation → users | obligatori, 1 registre |
| `game` | Text | `paraula`, `connexions`, `fils`, `mini` |
| `puzzle` | Number | número de puzle |
| `status` | Text | `playing`, `won`, `lost` |
| `state` | JSON | estat propi de cada joc |

Índex únic: `CREATE UNIQUE INDEX idx_progress_unique ON progress (user, game, puzzle)`

Regles d'API (cadascú només veu i modifica el seu progrés):

| Regla | Valor |
| --- | --- |
| List / View | `user = @request.auth.id` |
| Create | `@request.auth.id != "" && @request.body.user = @request.auth.id` |
| Update / Delete | `user = @request.auth.id` |

## 3. Producció

- Servir PocketBase darrere d'HTTPS (Caddy o nginx) a un subdomini, p. ex. `api.jocmot.cat`.
- Configurar SMTP al panell per a la verificació de correu i la recuperació de contrasenya.
- Còpies de seguretat de la carpeta `pb_data`.
- RGPD: política de privacitat i dret a esborrar el compte (des del panell o amb un endpoint).

## Canviar de proveïdor

Implementar la interfície `Backend` de `src/services/backend/types.ts` (p. ex. `supabase.ts`) i triar-la a `src/services/backend/index.ts`. La resta de l'app no canvia.
