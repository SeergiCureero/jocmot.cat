"""
Generador de graelles per a Fils (6 columnes x 8 files).

Ús:
  python scripts/generate-fils.py <llavor> <SPANGRAM> <PARAULA1,PARAULA2,...>

La suma de lletres ha de ser 48. Sense accents, en majúscules.
Exemple:
  python scripts/generate-fils.py 1 FRUITES POMA,PERA,PRESSEC,TARONJA,MADUIXA,CIRERA,PLATAN

Imprimeix la graella i els recorreguts en JSON per enganxar a
src/games/fils/data/puzzles.ts (els tests en validen la coherència).
"""
import random, sys, json
R,C=8,6
def nb(p):
  r,c=p
  for dr in(-1,0,1):
    for dc in(-1,0,1):
      if (dr or dc) and 0<=r+dr<R and 0<=c+dc<C: yield (r+dr,c+dc)
def segs_cross(a,b,used_diag):
  # diagonal crossing check: moving a->b diagonally crosses diag between (a.r,b.c)-(b.r,a.c)
  if a[0]!=b[0] and a[1]!=b[1]:
    k=frozenset([(a[0],b[1]),(b[0],a[1])])
    return k in used_diag
  return False
def path_for(word,start,free,used_diag,spangram=False):
  out=[]
  def dfs(path,diags):
    if len(path)==len(word):
      if spangram:
        cs={p[1] for p in path}; rs={p[0] for p in path}
        if not ({0,C-1}<=cs or {0,R-1}<=rs): return None
      return list(path),diags
    nbs=list(nb(path[-1])); random.shuffle(nbs)
    for q in nbs:
      if q in free and q not in path and not segs_cross(path[-1],q,diags):
        nd=set(diags)
        if path[-1][0]!=q[0] and path[-1][1]!=q[1]: nd.add(frozenset([path[-1],q]))
        r=dfs(path+[q],nd)
        if r: return r
    return None
  return dfs([start],set(used_diag))
def ok_components(free,remaining):
  # every connected component of free cells must be fillable by subset sums of remaining word lengths (approx: size >=4)
  seen=set()
  for p in free:
    if p in seen: continue
    comp=[];st=[p];seen.add(p)
    while st:
      x=st.pop();comp.append(x)
      for q in nb(x):
        if q in free and q not in seen: seen.add(q);st.append(q)
    lens=[len(w) for w in remaining]
    sums={0}
    for l in lens: sums|={s+l for s in sums}
    if len(comp) not in sums: return False
  return True
def solve(words,spangram):
  allcells={(r,c) for r in range(R) for c in range(C)}
  for _ in range(20000):
    free=set(allcells); placed={}; diags=set()
    starts=[p for p in allcells]; random.shuffle(starts)
    sp=None
    for s in starts:
      res=path_for(spangram,s,free,diags,True)
      if res: sp=res;break
    if not sp: continue
    placed[spangram]=sp[0]; free-=set(sp[0]); diags=sp[1]
    rem=list(words); random.shuffle(rem)
    if not ok_components(free,rem): continue
    fail=False
    while rem:
      # cell with fewest free neighbours
      cell=min(free,key=lambda p:(sum(1 for q in nb(p) if q in free),random.random()))
      done=False
      order=list(rem); random.shuffle(order)
      for w in order:
        res=path_for(w,cell,free,diags)
        if not res: continue
        # also try reversed placement via starting at cell meaning cell is first letter
        nf=free-set(res[0]); nr=[x for x in rem if x!=w]
        if ok_components(nf,nr):
          placed[w]=res[0]; free=nf; diags=res[1]; rem=nr; done=True;break
      if not done: fail=True;break
    if not fail and not free: return placed
  return None
random.seed(int(sys.argv[1]))
spangram=sys.argv[2]; words=sys.argv[3].split(",")
assert len(spangram)+sum(map(len,words))==R*C, len(spangram)+sum(map(len,words))
pl=solve(words,spangram)
g=[['?']*C for _ in range(R)]
for w,p in pl.items():
  for ch,(r,c) in zip(w,p): g[r][c]=ch
print("\n".join("".join(r) for r in g))
print(json.dumps({w:[[r,c] for r,c in p] for w,p in pl.items()}))
