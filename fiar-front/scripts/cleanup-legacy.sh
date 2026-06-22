#!/usr/bin/env bash
set -euo pipefail
# cleanup-legacy.sh — Purga assets legacy + reemplaza colores hardcodeados en fiar-front

REPO="/workspace/Prizma/apps/pistis/fiar-front"
PUBLIC="${REPO}/public/img"
cd "$REPO"

echo "=== FASE 1: Borrar imágenes legacy de /public/img/ ==="
rm -fv \
  "${PUBLIC}/FondoContacto.png" \
  "${PUBLIC}/fondo.png" \
  "${PUBLIC}/Logo.png" \
  "${PUBLIC}/logo_general.png" \
  "${PUBLIC}/favicon.svg" \
  "${PUBLIC}/icon.png" \
  "${PUBLIC}/og-pistis.png"

echo "=== FASE 2: Purgar 'cauceCorriente' del SVG de marca ==="
if grep -q 'cauceCorriente' "${PUBLIC}/prizma-symbol.svg"; then
  sed -i 's/cauceCorriente/gradientCorriente/g' "${PUBLIC}/prizma-symbol.svg"
  echo "  Reemplazado cauceCorriente → gradientCorriente en prizma-symbol.svg"
else
  echo "  No se encontró cauceCorriente en prizma-symbol.svg"
fi

echo "=== FASE 3: Purgar 'EMW' del código fuente ==="
grep -rn 'EMW' src/ && echo "  Quedan referencias EMW — corregir manualmente" || echo "  0 referencias EMW"

echo "=== FASE 4: Verificar que #0a827f ya no existe en src/ ==="
grep -rn '#0a827f' src/ && echo "  ⚠️  Quedan referencias #0a827f — revisar" || echo "  0 referencias #0a827f"

echo "=== FASE 5: Verificar que #FFC313 ya no existe en src/ ==="
grep -rn '#FFC313' src/ && echo "  ⚠️  Quedan referencias #FFC313 — revisar" || echo "  0 referencias #FFC313"

echo "=== FASE 6: Verificar que #095169 ya no existe en src/ ==="
grep -rn '#095169' src/ && echo "  ⚠️  Quedan referencias #095169 — revisar" || echo "  0 referencias #095169"

echo ""
echo "=== Cleanup completado. Ejecuta: npm run build para verificar ==="
