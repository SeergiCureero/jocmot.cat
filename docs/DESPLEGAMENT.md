# Desplegament

`npm run build` genera una web estàtica a `dist/`. Es pot servir des de qualsevol hosting estàtic o un nginx propi.

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
