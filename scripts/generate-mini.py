"""
Cerca de mots encreuats per a Mini a partir de llistes de paraules (sense accents).

Ús:
  python scripts/generate-mini.py "<patró>" <llavor>

El patró són 5 files separades per "/", amb "." = casella blanca i "#" = negra.
Exemple:
  python scripts/generate-mini.py "##.../#..../...../....#/...##" 7

Amplia les llistes W3/W4/W5 per obtenir més combinacions. Les definicions
s'escriuen a mà a src/games/mini/data/puzzles.ts.
"""
import random, sys
W3="SOL MAR CEL MEL SAL GAT COS NAS ULL PEU BOU DIA RIU ROC SAC SEC SET SIS DOS MES MAS PAS PAL PAU PIS PIT POT SUC SUD TOT TOS UNA UNS ALL ARA ASE AVI BOC CAP COL COR CUA DIT DOL ERA FAR FIL FOC GEL GOS GRA MAL MIL MUR NET NEU NIT NOU NUS OCA OLI ONA PEL PES PIC PLA POC POU RAS REC REI RES ROM SEU SOU TAP TOC TRO VAS VEU VIA VOL ALA ARC ART CAL COP DAU DUR ELS NOM NOI RUC SOM TEU MEU MOT".split()
W4="CASA COSA ROSA GOTA POMA PERA MELO RAIM VACA PORC ANEC GOMA TELA SOPA ROBA SABO LLUM LLET LLIT LLOC LLOP LLAC LLAR MARE PARE AVIA NETA CAMA MANS DENT PELL BOCA SOLA MOLA COLA ROCA MOTO AUTO TREN VELA REMS PORT MOLI VENT DIES NITS MATI HORA ANYS ONES RIUS ILLA CALA PLAT GOTS OLLA TAPA NENA NENS NOIA NOIS GENT AMIC BOIG BOTA CARA CAMI RUTA PONT MURS PATI SALA FILS SEDA COTO PALA PICA POTA RATA GATA GATS CUCS ALES ALTA ALTS BAIX BONA BONS AGRE NOVA NOUS VELL JOVE LENT FRED ROIG ROJA VERD BLAU GRIS TOTS TOTA CADA MOLT POCA POCS AMOR VIDA MORT SORT ARTS OBRA NOTA MOTS LLEI REIS FLOR CAMP PRAT BOSC TURO COLL VALL CERA NATA SOPA ALLS SUCS AVUI DEMA RASA RACO TALL TALP TEMA TORN TRIA TRUC ULLS UNES URNA USOS VENA VERS VIES VINS VOLS ZERO ZONA ERES ARES ONZE SETS NOMS PEUS".split()
W5="AIGUA TERRA ARBRE FULLA PLUJA NUVOL LLUNA PLATA FERRO COURE ARENA COSTA PLANA SERRA HERBA FRUIT REINA PORTA TORRE BARCA TASSA MOSCA BLANC NEGRE TARDA TEMPS TECLA TASCA RIERA ONADA SOPAR DINAR TAULA PAPER PLOMA CAIXA PARET TEULA FORAT SORRA PEDRA NOBLE SABOR SALSA OLIVA CREMA SUCRE PRUNA PASTA ACTOR AUTOR ALTAR BANDA BARRA BROMA CARTA CAUSA CINTA CORDA DOLOR ESTIU FESTA FINAL FORMA FUSTA GALTA MANTA MASIA METGE MOTOR NEDAR NORMA ONCLE ORDRE PALAU PERLA PISTA POBLE POETA PROVA RITME SALUT TARTA TINTA TOMBA TROPA VAPOR VESPA VINYA VISTA VOLTA CAMES CASES COSES DONES FLORS ILLES MARES OBRES OLLES PLATS ROSES ROBES SALES TOTES VELES PARES NOTES CANTA SALTA PARLA CORRE ESTAT ALTRE ARMES CARES CLARA COLLA CIMES PUNTS PREUS TRENS RUTES VELLA SANTA RESTA TANCA".split()
P=sys.argv[1]
grid=[list(r) for r in P.split("/")]
N=len(grid)
# slots
slots=[]
for r in range(N):
  c=0
  while c<N:
    if grid[r][c]=='.':
      s=c
      while c<N and grid[r][c]=='.': c+=1
      if c-s>=3: slots.append([(r,x) for x in range(s,c)])
    else: c+=1
for c in range(N):
  r=0
  while r<N:
    if grid[r][c]=='.':
      s=r
      while r<N and grid[r][c]=='.': r+=1
      if r-s>=3: slots.append([(x,c) for x in range(s,r)])
    else: r+=1
words={3:W3,4:W4,5:W5}
sols=[]
def solve(fill,used,cnt):
  # pick most constrained slot
  best=None
  for i,s in enumerate(slots):
    if all(fill.get(p) for p in s):
      if "".join(fill[p] for p in s) not in words[len(s)]: return False
      continue
    cands=[w for w in words[len(s)] if w not in used and all(fill.get(p) in (None,w[k]) for k,p in enumerate(s))]
    if best is None or len(cands)<len(best[1]): best=(i,cands)
  if best is None:
    sols.append(dict(fill)); return len(sols)>=cnt
  random.shuffle(best[1])
  s=slots[best[0]]
  for w in best[1]:
    nf=dict(fill)
    for k,p in enumerate(s): nf[p]=w[k]
    if solve(nf,used|{w},cnt): return True
  return False
random.seed(int(sys.argv[2]))
solve({},set(),3)
for f in sols:
  for r in range(N): print("".join(f.get((r,c),'#') for c in range(N)))
  print()
