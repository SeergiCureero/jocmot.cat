"""
Genera el diccionari de jocmot (public/diccionari/) a partir del diccionari
obert de Softcatalà (llicència GPL-2.0+ / LGPL-2.1+):

  git clone --depth 1 https://github.com/Softcatala/catalan-dict-tools.git
  curl -LO https://huggingface.co/datasets/softcatala/catalan-dictionary/resolve/main/data.zip
  unzip data.zip   # -> diccionari.txt (forma lema etiqueta)

Ús:
  python scripts/build-dictionary.py <catalan-dict-tools> <diccionari.txt>

Només es queden els lemes que tenen el DIEC o el diccionari bàsic de
LanguageTool/Apertium com a font (no els termes mèdics, tècnics ni exclusivament valencians), sense noms
propis, sigles, interjeccions ni formes marcades com a antigues o incorrectes.

Les paraules es normalitzen com a src/lib/text.ts (majúscules, sense accents, la Ç
es conserva) i només se'n guarden les de 4 lletres o més, en un fitxer per
inicial, i a més totes les de 5 lletres juntes (per a Paraula). Cada línia és "<n><resta>": n és quantes lletres comparteix amb la paraula
anterior (en base 36) i resta, la part que hi afegeix.
"""
import os, re, sys, unicodedata

DICT_TOOLS, FORMS = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'diccionari', 'v1')
MIN_LEN = 4

def norm(w):
  w = w.upper().replace('Ç', '\0')
  w = ''.join(c for c in unicodedata.normalize('NFD', w) if not unicodedata.combining(c))
  return re.sub(r"[·.\-\s']", '', w.replace('\0', 'Ç'))

OK_FONTS = {'LT', 'DIEC', 'IEC', 'apertium'}
BAD = re.compile(r'obsolet|arcaisme|antic|inusual|\brar\b|no és en els diccionaris|incorrect|vulgar|pejoratiu')
good = {}
for f, cat in [('noms', 'N'), ('adjectius', 'A'), ('verbs', 'V')]:
  for line in open(f'{DICT_TOOLS}/diccionari-arrel/{f}-fdic.txt', encoding='utf8'):
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line: continue
    lemma, rest = line.split('=', 1)
    lemma = re.sub(r"_\d+$", "", lemma.split()[0])  # "amic amiga [sup. …]", "salut_1" -> lema
    m = re.search(r'fonts?:\s*([^;]*)', rest)
    fonts = set(x for x in re.split(r'[ ,]+', m.group(1)) if x) if m else OK_FONTS
    ok = bool(fonts & OK_FONTS) and not BAD.search(rest.lower())
    good[cat, lemma] = good.get((cat, lemma), False) or ok

excl_form, excl_lemma, section = set(), set(), None
for line in open(f'{DICT_TOOLS}/fdic-to-hunspell/dades/exclusions.txt', encoding='utf8'):
  s = line.strip()
  if s.startswith('#EXCLOU'): section = s; continue
  if not s or s.startswith('#') or section is None or 'valencia' in section: continue
  (excl_form if 'FORMA' in section else excl_lemma).add(s)

words = set()
for line in open(FORMS, encoding='utf8'):
  p = line.split()
  if len(p) != 3: continue
  form, lemma, tag = p
  if form in excl_form or lemma in excl_lemma: continue
  if re.search(r"['0-9 ]", form) or form != form.lower(): continue  # sense apòstrofs (d'anar)
  if tag[:2] in ('NP', 'Y', 'Fs', 'AO', 'I', 'Z'): continue
  if tag[:2] == 'NC': ok = good.get(('N', lemma))
  elif tag[:2] == 'AQ': ok = good.get(('A', lemma)) or good.get(('V', lemma))
  elif tag[:2] == 'VM': ok = good.get(('V', lemma))
  else: ok = True
  n = norm(form)
  if ok and len(n) >= MIN_LEN and re.fullmatch('[A-ZÇ]+', n): words.add(n)

def b36(n): return '0123456789abcdefghijklmnopqrstuvwxyz'[n]

def write(name, ws):
  lines, prev = [], ''
  for w in sorted(ws):
    k = 0
    while k < min(len(w), len(prev), 35) and w[k] == prev[k]: k += 1
    lines.append(b36(k) + w[k:])
    prev = w
  with open(os.path.join(OUT, name), 'w', encoding='utf8') as fh: fh.write('\n'.join(lines) + '\n')

os.makedirs(OUT, exist_ok=True)
by_initial = {}
for w in words: by_initial.setdefault(w[0], []).append(w)
for initial, ws in by_initial.items():
  write(('cc' if initial == 'Ç' else initial.lower()) + '.txt', ws)
# Paraula carrega de cop totes les de 5 lletres.
write('5-lletres.txt', [w for w in words if len(w) == 5])
print(f'{len(words)} paraules a {os.path.normpath(OUT)}')
