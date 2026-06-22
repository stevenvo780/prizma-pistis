#!/usr/bin/env python3
"""Genera favicon.ico multi-size a partir de los 3 PNGs Eikon."""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow no instalado. Ejecuta: pip install Pillow")
    sys.exit(1)

PUBLIC = Path("/workspace/Prizma/apps/pistis/fiar-front/public")

favicon_sizes = [
    (PUBLIC / "favicon-32.png",  32),
    (PUBLIC / "favicon-180.png", 180),
    (PUBLIC / "favicon-512.png", 512),
]

icons = []
for path, size in favicon_sizes:
    if not path.exists():
        print(f"ERROR: {path} no existe. Ejecuta copy-eikon-assets.sh primero.")
        sys.exit(1)
    img = Image.open(path).resize((size, size), Image.LANCZOS)
    icons.append(img)

output = PUBLIC / "favicon.ico"
icons[0].save(
    output,
    format="ICO",
    sizes=[(i.width, i.height) for i in icons],
    append_images=icons[1:],
)
print(f"favicon.ico generado: {output} ({output.stat().st_size} bytes)")
