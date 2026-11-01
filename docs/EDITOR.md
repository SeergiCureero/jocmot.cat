# Editor de puzles (guia per al grup)

A **jocmot.cat/editor** es dissenyen, es proven i es revisen puzles de **Connexions**, **Fils** i **Mini**.

- **Qualsevol persona amb compte** hi pot dissenyar i proposar puzles (✏️ _Crea_ a la capçalera). Veu només les seves propostes i els comentaris que hi fan els editors, i hi pot respondre. Pot tenir com a màxim 5 propostes pendents alhora.
- Els **editors** (rol que dona l'administrador: veure [BACKEND.md](BACKEND.md#3-fer-editor-algú)) veuen totes les propostes, hi juguen, les aproven i les programen, i tenen el calendari.

Si algú esborra el compte, les seves propostes s'esborren i els seus puzles publicats es queden, sense autor.

## Com funciona

1. **Dissenya.** Tria el joc a _Nou puzle_. L'editor diu en tot moment què hi falta. L'esborrany es desa sol, però **només en el teu navegador**.
2. **Prova'l.** Hi jugues amb el joc de veritat. No es desa res.
3. **Proposa'l.** Posa-hi un **nom** (per reconèixer-lo a les llistes) i, si vols, un **dia preferit**. Passa a _Pendents de revisió_ i la resta del grup el pot veure.
4. **Revisió.** Els altres editors hi juguen (sense veure la solució, si volen), comenten i l'**aproven**.
5. **Publicació automàtica.** Amb **1 aprovació** d'un altre editor, el puzle es programa sol al **dia preferit** si està lliure o, si no, al **primer dia lliure** a partir d'aquell (o de demà, si no n'hi ha). El públic no el pot veure fins aquell dia.
6. **Calendari.** A _Calendari_ (o a la pàgina del puzle, _Canvia el dia_) es veu quin puzle surt cada dia i es pot moure qualsevol puzle programat a un altre dia a partir de demà. Si aquell dia ja en té un, s'intercanvien. Els que ja han sortit no es poden moure.

Detalls:

- No pots aprovar els teus puzles.
- Qualsevol editor pot posar o canviar el nom d'un puzle (✏️), també dels programats. Canviar el nom o el dia preferit no obliga a tornar-lo a aprovar.
- Si l'autor canvia el puzle, les aprovacions anteriors deixen de comptar i s'han de repetir.
- Mentre està en revisió, l'autor el pot retirar. Un cop programat ja no se'n pot canviar el contingut, només el dia.
- Els dies sense cap puzle del grup, la web fa servir els puzles del repositori.

## Diccionari

Sota el formulari hi ha el quadre **📖 Diccionari**:

- Avisa de les paraules del puzle que no són al diccionari de jocmot (pot ser correcte si són noms propis o expressions). Toca'n una per consultar-la.
- Busca qualsevol paraula: diu si és al diccionari de jocmot, en mostra les definicions del Viccionari i té enllaços al **DIEC**, al Viccionari i als sinònims de Softcatalà.

El DIEC no té cap API pública, i per això només hi enllacem. Per decidir si una paraula és normativa, consulta sempre el DIEC.

## Consells per joc

**Connexions.** Quatre grups de quatre paraules, del més fàcil (🟨) al més difícil (🟪). Els millors puzles tenen paraules "trampa" que semblen encaixar en més d'un grup.

**Fils.** Escriu el tema, el _fil conductor_ (la paraula que el descriu i travessa la graella) i les paraules del tema. Entre totes han de sumar **48 lletres** (els accents s'eliminen). Llavors prem _Genera la graella_; si no t'agrada, _Genera'n una altra_. Les paraules molt llargues fan més difícil trobar una graella.

**Mini.** Escriu les lletres de la solució a la graella de 5×5. Per a les caselles negres, activa _Mode caselles negres_ o prem `#` o `.`. Les definicions apareixen soles a mesura que es formen les paraules. Totes les caselles blanques han de formar part d'alguna paraula.
