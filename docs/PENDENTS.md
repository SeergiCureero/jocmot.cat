# Pendents i idees (per reprendre)

Última actualització: 15-11-2026.

## Fondària (joc tipus Krillion) — AMAGAT

Només s'hi entra escrivint `/fondaria` amb un compte d'editor; no surt a cap llista (`editorsOnly` a `src/games/fondaria/meta.ts`). **No es publica fins que ho decideixi el Sergi.**

Fet: 17 categories de tot (`data/categories.json`, compartit web/servidor), escena d'oceà amb submarí, punts per raresa (posició a la llista + comunitat), el servidor valida i puntua, respostes noves a revisar a `/editor/fondaria`.

Per publicar-lo:
1. Que algú revisi les llistes de categories (ordre de raresa, faltes, respostes que s'haurien d'acceptar).
2. Imatge per compartir (`identitat/compartir/fondaria.png`) i entrada a `SHARE_PAGES` de `vite.config.ts`.
3. Més categories i un ajust fi de dificultat; decidir si compta per a l'avís diari i la votació.
4. Treure `editorsOnly` i copiar `categories.json` a `backend/pb_hooks/fondaria_categories.json` (hi ha un test de paritat).

## Puzles: varietat i dificultat (el més urgent)

Estat: pocs puzles únics i es repeteixen. Únics ara: Connexions 14 + 11 de reserva, Fils 11 + 5, Mini 9, Paraula 80 + 113. Els nous de reserva (Connexions, Fils, Paraula) surten a partir del #22; Mini no n'ha rebut cap. Fins llavors els dies recicla els antics (`markLegacy` a `src/games/puzzles.ts`).

Els de reserva els vaig escriure jo (Connexions amb categories i prefixos, Fils generats amb `scripts/generate-fils.py`); no han passat per l'editor ni les dues aprovacions, i no són especialment difícils.

Per millorar de debò:
- Que l'equip creï puzles a l'editor (és el camí previst: 2 aprovacions) i que els de reserva només omplin forats.
- Connexions: més grups de joc de paraules/trampes (paraules amb doble sentit, homònims, mots amagats) i nivells de dificultat repartits.
- Fils: temes menys previsibles (spangram que sorprengui) i mides de graella diferents.
- Mini: generador amb una llista de paraules molt més gran i definicions amb gràcia; ara només treu graelles que ja existeixen.
- Paraula: més paraules habituals i alguna setmana temàtica.
- Un dia especial a la setmana més difícil.
- Fer servir `/editor/valoracions` per veure quins puzles agraden i quins no.

## Correu de tornada

Funciona (un sol correu als 5 dies, màx. 1 cada 30, 100/dia). Pendent: validar amb el gestor la part legal (LSSI/RGPD); revisar a la safata/brossa que arriba bé (SPF/DKIM a Brevo); comprovar el primer enviament real.

## Trànsit

`/editor/transit` només compta gent amb compte. Per veure les visites anònimes: Cloudflare Web Analytics (sense galetes; cal actualitzar la privadesa) o el tauler de Cloudflare de la zona.

## Altres

- Bonus Empenta de bentornats / Embranzida de remuntada: revisar-ne els números quan hi hagi dades reals.
- Lliga mundial: mirar si el top 50 i l'opt-in funcionen bé amb gent real.
- Git: el remot és HTTPS (la clau de desplegament SSH és de només lectura).
