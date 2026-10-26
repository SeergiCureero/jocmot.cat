# Desplegament

`npm run build` genera una web estàtica a `dist/`. Es pot servir des de qualsevol hosting estàtic o un nginx propi.

## Cloudflare Pages (recomanat)

Gratuït, amb HTTPS, i publica automàticament a cada push a `main`.

1. A Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** i triar aquest repositori.
2. Configuració del build:

   | Camp | Valor |
   | --- | --- |
   | Framework preset | `Vite` (o cap) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

3. Variables d'entorn (**Settings → Variables and secrets**, entorn *Production*):

   | Variable | Valor |
   | --- | --- |
   | `NODE_VERSION` | `22` |
   | `VITE_POCKETBASE_URL` | Opcional. Sense aquesta variable, els comptes s'amaguen. |

4. Domini. Perquè funcioni el domini arrel (`jocmot.cat`, sense `www`), Cloudflare n'ha de gestionar el DNS:
   1. A Cloudflare: **Add a domain** → `jocmot.cat` → pla **Free**. Cloudflare dona dos *nameservers* (p. ex. `xxx.ns.cloudflare.com`).
   2. Al tauler del registrador (p. ex. CDmon), al domini → **Servidors DNS / Nameservers**: substituir els que hi ha pels dos de Cloudflare.
   3. Esperar que Cloudflare marqui el domini com a **Active** (de minuts a unes hores).
   4. Al projecte de Pages: **Custom domains → Set up a domain → `jocmot.cat`**. Cloudflare crea el registre DNS sol. Repetir amb `www.jocmot.cat` si es vol.

   Un CNAME al registrador només serveix per a subdominis (`www.jocmot.cat`), no per al domini arrel.

No cal cap configuració per a les rutes (`/paraula`, etc.): si `dist/` no té `404.html`, Cloudflare Pages ja serveix `index.html` per a qualsevol ruta.

Cada pull request també genera una URL de previsualització.

La data de llançament (`VITE_LAUNCH_DATE`) és a `.env.production`, al repositori, perquè funcioni igual sigui quin sigui el tipus de projecte de Cloudflare. Si el projecte s'ha creat com a **Worker** amb fitxers estàtics (no Pages), les variables de build es posen a **Settings → Build → Variables and secrets**, no a les variables del Worker.

## Llançar sense comptes

Si no hi ha `VITE_POCKETBASE_URL`, el build de producció amaga el botó **Entra** i les rutes `/compte` (`FEATURES.accounts` a `src/config/site.ts`). Es pot jugar igualment i el progrés es guarda al navegador de cada jugador. En desenvolupament (`npm run dev`) els comptes simulats continuen disponibles.

Per activar comptes: desplegar PocketBase (veure [BACKEND.md](BACKEND.md)), afegir `VITE_POCKETBASE_URL` i tornar a desplegar.

## Altres servidors

Com que és una SPA, el servidor ha de retornar `index.html` per a qualsevol ruta:

```nginx
server {
  server_name jocmot.cat;
  root /var/www/jocmot/dist;

  location / {
    try_files $uri /index.html;
  }

  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

Variables d'entorn (`VITE_*`) s'han de definir **en el moment del build**.

## CI

`.github/workflows/ci.yml` executa tipus, tests i build a cada push i pull request. Cal pujar `package-lock.json` al repositori (es genera amb el primer `npm install`).
