#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="${SITE_DIR:-/var/www/guestsvalencia}"
cd "$SITE_DIR"

echo "➡️ Instalando Admin Shortcuts en: $(pwd)"
mkdir -p admin addon-admin-shortcuts

# Copiar archivo
cp -f addon-admin-shortcuts/admin/shortcuts.js admin/shortcuts.js
cp -f addon-admin-shortcuts/README.md addon-admin-shortcuts/README.md 2>/dev/null || true

# Intento de auto-inyección en admin/index.html
if [ -f "admin/index.html" ]; then
  if ! grep -q "admin/shortcuts.js" admin/index.html; then
    echo "🔧 Inyectando <script src="/admin/shortcuts.js"> en admin/index.html"
    # Insertar antes de </body>
    sed -i 's#</body>#\n  <script src="/admin/shortcuts.js" defer></script>\n</body>#' admin/index.html || true
  else
    echo "ℹ️ admin/index.html ya tenía el script."
  fi
else
  echo "ℹ️ No se encontró admin/index.html; añade manualmente: <script src="/admin/shortcuts.js" defer></script>"
fi

# Parche opcional: abrir Prompt Maestro en la pública con #openPrompt
if [ -f "index.html" ]; then
  if ! grep -q "GV_OPEN_PROMPT_HASH" index.html; then
    echo "🔧 Añadiendo manejador #openPrompt a index.html"
    awk '1; /<\/body>/ && !done { print "  <script>\n  // GV_OPEN_PROMPT_HASH: abre el Drawer del Prompt si URL contiene #openPrompt\n  (function(){\n    try{ if (location.hash === "#openPrompt") {\n      var btn = document.getElementById("btnPrompt");\n      if (btn) btn.click(); else { var ev=new KeyboardEvent("keydown",{key:"m",ctrlKey:true}); window.dispatchEvent(ev); }\n    }}catch(e){}\n  })();\n  </script>"; done=1 }' index.html > index.html.tmp && mv index.html.tmp index.html
  else
    echo "ℹ️ index.html ya tenía manejador #openPrompt."
  fi
else
  echo "ℹ️ No se encontró index.html para añadir manejador #openPrompt (puedes pegar el snippet manualmente)."
fi

echo "✅ Admin Shortcuts instalado. Abre el panel y verás los 3 botones."
