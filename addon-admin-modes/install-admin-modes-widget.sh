#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="${SITE_DIR:-/var/www/guestsvalencia}"
cd "$SITE_DIR"

echo "➡️ Instalando Admin Modes Widget en: $(pwd)"
mkdir -p admin addon-admin-modes

# Copiar archivo
cp -f addon-admin-modes/admin/modes.html admin/modes.html
cp -f addon-admin-modes/README.md addon-admin-modes/README.md 2>/dev/null || true

echo "✅ Widget instalado. Abre: /admin/modes.html"
