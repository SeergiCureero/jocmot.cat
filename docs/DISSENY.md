# Disseny de jocmot.cat

Regles de disseny que s'han de seguir **sempre**, en qualsevol canvi de la interfície.

## Identitat

- Els fitxers d'identitat (logos, icones, imatges per compartir) són a la carpeta [`identitat/`](../identitat).
- Es mantenen el teal de marca (`#0f766e`), els grisos "stone" de Tailwind i la font Inter.
- Colors de cada joc. Fons fosc de la icona:

  | Joc        | Fons fosc de la icona | Variable                 |
  | ---------- | --------------------- | ------------------------ |
  | Paraula    | `#166534`             | `--color-joc-paraula`    |
  | Connexions | `#6b21a8`             | `--color-joc-connexions` |
  | Fils       | `#075985`             | `--color-joc-fils`       |
  | Mini       | `#92400e`             | `--color-joc-mini`       |

  Es mantenen els colors suaus actuals de `meta.ts` (`theme.bg`, `theme.soft`, `theme.text`) per a xips i fons.

- Fitxes del logo: `#0f766e`, `#15803d`, `#9333ea`, `#0284c7`, `#b45309` (variables `--color-fitxa-1` a `--color-fitxa-5`).
- El color va als jocs i al logo. Menús, botons i textos continuen sobris (blanc, stone i el teal de marca).
- Totes les icones i elements gràfics han de tenir un contrast mínim de **3:1** amb el fons, i els textos de **4.5:1**.

## Principis d'experiència d'ús

- Pensat primer per al mòbil.
- Zones on es toca de **44×44 px** com a mínim.
- Es pot jugar sense registrar-se, sempre.
- Mai es perd una partida: el progrés es desa sol i es recupera en tornar.
- Cada acció té resposta visible en menys de **100 ms**.
- Res es mou de lloc mentre carrega (es reserva l'espai).
- Tot es pot fer amb el teclat a l'ordinador.
- Les animacions es desactiven si el sistema demana menys moviment.
- Textos en català, curts i amables, sense tecnicismes.
