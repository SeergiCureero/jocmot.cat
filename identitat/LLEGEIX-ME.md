# Identitat visual de jocmot.cat

Fitxers originals de la identitat (de `guia-identitat.html`, la guia del dissenyador). Les regles d'ús són a [docs/DISSENY.md](../docs/DISSENY.md).

| Carpeta | Fitxer | Què és |
| --- | --- | --- |
| `logos/` | `jocmot-fitxes.svg` | Logo de fitxes amb «.cat» (portada, imatges per compartir) |
| | `jocmot-fitxes-sense-cat.svg` | Logo de fitxes sense «.cat» |
| | `jocmot-text.svg` | Logo de text (capçalera de la web) |
| | `jocmot-icona-text.svg` | Icona de l'app + logo de text |
| `app/` | `icona-app.svg` | Icona de l'app (punt de la «j» amb quatre fitxes) |
| | `icona-app-petita.svg` | Icona per a mides petites (una sola fitxa groga): favicon |
| `jocs/` | `paraula.svg`, `connexions.svg`, `fils.svg`, `mini.svg` | Icones dels jocs |
| `compartir/` | `jocmot.png`, `paraula.png`, `connexions.png`, `fils.png`, `mini.png` | Imatges per compartir (1200×630) |

## Si canvia algun fitxer

Substituïu-lo aquí amb el mateix nom i executeu:

```bash
bash scripts/genera-icones.sh
```

Genera a `public/` el favicon (SVG i .ico), les icones de l'app (180, 192, 512 i les "maskable"), les icones dels jocs, els logos i les imatges per compartir.
