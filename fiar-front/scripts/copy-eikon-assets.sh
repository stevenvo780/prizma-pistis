#!/usr/bin/env bash
set -euo pipefail
# copy-eikon-assets.sh — Copia assets de Eikon a fiar-front/public/

EIKON="/workspace/Pinakotheke/eikon/output/prizma-iris"
REPO="/workspace/Prizma/apps/pistis/fiar-front"
PUBLIC="${REPO}/public"

echo "=== Copiando favicons ==="
cp -v "${EIKON}/logos/favicon/v1_32.png"  "${PUBLIC}/favicon-32.png"
cp -v "${EIKON}/logos/favicon/v2_180.png" "${PUBLIC}/favicon-180.png"
cp -v "${EIKON}/logos/favicon/v3_512.png" "${PUBLIC}/favicon-512.png"

echo "=== Generando favicon.ico multi-size ==="
if command -v convert &>/dev/null; then
  convert "${PUBLIC}/favicon-32.png" \
          "${PUBLIC}/favicon-180.png" \
          "${PUBLIC}/favicon-512.png" \
          "${PUBLIC}/favicon.ico"
  echo "  favicon.ico generado con ImageMagick"
elif command -v python3 &>/dev/null; then
  python3 -c "
from PIL import Image
sizes = [(32,32), (180,180), (512,512)]
icons = []
for s in sizes:
    fn = f'${PUBLIC}/favicon-{s[0]}.png'
    img = Image.open(fn).resize(s, Image.LANCZOS)
    icons.append(img)
icons[0].save('${PUBLIC}/favicon.ico', format='ICO', sizes=[(i.size[0],i.size[1]) for i in icons], append_images=icons[1:])
print('  favicon.ico generado con Pillow')
"
else
  echo "  ⚠️  Ni ImageMagick ni Pillow disponibles. Instala uno para generar favicon.ico"
  echo "  Mientras tanto, usa favicon-32.png como fallback en _document.js"
fi

echo "=== Copiando OG image ==="
cp -v "${EIKON}/og/og_general/v1_docs.png" "${PUBLIC}/og-image.png"

echo "=== Copiando logo lockup horizontal para navbar ==="
cp -v "${EIKON}/logos/lockup_horizontal/v1_color.png"  "${PUBLIC}/img/iris-lockup-color.png"
cp -v "${EIKON}/logos/lockup_horizontal/v3_inverse.png" "${PUBLIC}/img/iris-lockup-inverse.png"

echo "=== Verificación ==="
ls -lh "${PUBLIC}"/favicon* "${PUBLIC}"/og-image.png "${PUBLIC}"/img/iris-lockup-*.png

echo ""
echo "Assets Eikon copiados a fiar-front/public/"
