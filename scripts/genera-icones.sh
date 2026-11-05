#!/usr/bin/env bash
# Genera les icones i imatges públiques (public/) a partir de la carpeta identitat/.
# Cal tornar-lo a executar si el dissenyador canvia algun fitxer d'identitat/.
#
# Ús: bash scripts/genera-icones.sh
# Necessita rsvg-convert (librsvg) i magick (ImageMagick).
set -euo pipefail
cd "$(dirname "$0")/.."

ID=identitat
OUT=public
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT/jocs" "$OUT/compartir" "$OUT/logos"

# Logos i icones dels jocs: es copien tal qual.
cp "$ID"/logos/jocmot-text.svg "$ID"/logos/jocmot-fitxes.svg "$OUT/logos/"
for joc in paraula connexions fils mini; do cp "$ID/jocs/$joc.svg" "$OUT/jocs/"; done

# Favicon: la versió petita (una sola fitxa groga), en SVG i en .ico per a navegadors antics.
cp "$ID/app/icona-app-petita.svg" "$OUT/favicon.svg"
rsvg-convert -w 16 "$ID/app/icona-app-petita.svg" -o "$TMP/f16.png"
rsvg-convert -w 32 "$ID/app/icona-app-petita.svg" -o "$TMP/f32.png"
rsvg-convert -w 48 "$ID/app/icona-app-petita.svg" -o "$TMP/f48.png"
magick "$TMP/f16.png" "$TMP/f32.png" "$TMP/f48.png" "$OUT/favicon.ico"

# Icona "any" (amb les cantonades arrodonides de l'original).
rsvg-convert -w 192 "$ID/app/icona-app.svg" -o "$OUT/icona-192.png"
rsvg-convert -w 512 "$ID/app/icona-app.svg" -o "$OUT/icona-512.png"

# Versió a sang (quadrat sencer): iOS i Android hi posen les seves cantonades.
sed -E 's/(<rect width="64" height="64") rx="[0-9.]+"/\1/' "$ID/app/icona-app.svg" >"$TMP/quadrat.svg"
rsvg-convert -w 180 -b '#0f766e' "$TMP/quadrat.svg" -o "$OUT/apple-touch-icon.png"

# Maskable: el dibuix es redueix al 80% central (zona segura) sobre el fons teal.
for mida in 192 512; do
  dins=$((mida * 80 / 100))
  rsvg-convert -w "$dins" "$TMP/quadrat.svg" -o "$TMP/dins.png"
  magick -size "${mida}x${mida}" 'xc:#0f766e' "$TMP/dins.png" -gravity center -composite \
    "$OUT/icona-maskable-$mida.png"
done

# Imatges per compartir (1200×630).
for nom in jocmot paraula connexions fils mini; do
  cp "$ID/compartir/$nom.png" "$OUT/compartir/$nom.png"
done

echo "Icones generades a $OUT/"
