#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────
# Sandra · OTA Deploy Script (Ad Hoc iOS by Safari)
# - Crea estructura /var/www/sandra
# - Copia IPA y assets
# - Genera manifest.plist
# - Parchea index.html con la URL del manifest
# - Recarga Nginx
# Uso:
#   sudo ./deploy_ota.sh \
#     --domain download.guestsvalencia.es \
#     --ipa /path/to/Sandra.ipa \
#     --bundle es.guestsvalencia.sandra \
#     --version 1.0.0 \
#     --title "Sandra" \
#     --basic-auth-user admin \
#     --basic-auth-pass "********" \
#     [--icons /path/to/icons/] \
#     [--allow-ip 203.0.113.15 --allow-ip 198.51.100.27]
# ──────────────────────────────────────────────────────────────

DOMAIN=""
IPA_PATH=""
BUNDLE_ID=""
BUNDLE_VERSION="1.0.0"
TITLE="Sandra"
ICONS_DIR=""
ALLOW_IPS=()
BASIC_USER=""
BASIC_PASS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2;;
    --ipa) IPA_PATH="$2"; shift 2;;
    --bundle) BUNDLE_ID="$2"; shift 2;;
    --version) BUNDLE_VERSION="$2"; shift 2;;
    --title) TITLE="$2"; shift 2;;
    --icons) ICONS_DIR="$2"; shift 2;;
    --allow-ip) ALLOW_IPS+=("$2"); shift 2;;
    --basic-auth-user) BASIC_USER="$2"; shift 2;;
    --basic-auth-pass) BASIC_PASS="$2"; shift 2;;
    *) echo "Arg desconocido: $1"; exit 1;;
  esac
done

if [[ -z "$DOMAIN" || -z "$IPA_PATH" || -z "$BUNDLE_ID" ]]; then
  echo "Uso: --domain --ipa --bundle [--version] [--title] [--icons] [--allow-ip ...] --basic-auth-user --basic-auth-pass"
  exit 1
fi

if [[ ! -f "$IPA_PATH" ]]; then
  echo "❌ No existe IPA: $IPA_PATH"; exit 1
fi

# Paths
WEBROOT="/var/www/sandra"
CONF_AVAIL="/etc/nginx/sites-available/${DOMAIN}.conf"
CONF_ENABL="/etc/nginx/sites-enabled/${DOMAIN}.conf"
HTPASS="/etc/nginx/.htpasswd-sandra"

# Prep Basic Auth
if [[ -n "$BASIC_USER" && -n "$BASIC_PASS" ]]; then
  if ! command -v htpasswd >/dev/null 2>&1; then
    apt-get update && apt-get install -y apache2-utils >/dev/null
  fi
  if [[ ! -f "$HTPASS" ]]; then
    htpasswd -bc "$HTPASS" "$BASIC_USER" "$BASIC_PASS"
  else
    htpasswd -b "$HTPASS" "$BASIC_USER" "$BASIC_PASS"
  fi
  echo "✅ Basic Auth actualizado en $HTPASS"
fi

# Create webroot
mkdir -p "$WEBROOT/assets"
cp -f "$IPA_PATH" "$WEBROOT/Sandra.ipa"

# Icons
ICON57_URL=""
ICON512_URL=""
if [[ -n "$ICONS_DIR" ]]; then
  [[ -f "$ICONS_DIR/icon57.png" ]] && cp -f "$ICONS_DIR/icon57.png" "$WEBROOT/assets/icon57.png" && ICON57_URL="https://${DOMAIN}/assets/icon57.png"
  [[ -f "$ICONS_DIR/icon512.png" ]] && cp -f "$ICONS_DIR/icon512.png" "$WEBROOT/assets/icon512.png" && ICON512_URL="https://${DOMAIN}/assets/icon512.png"
fi

# Templates
TPL_DIR="$(cd "$(dirname "$0")" && pwd)/../templates"

# manifest.plist
MANIFEST_URL="https://${DOMAIN}/manifest.plist"
sed -e "s|__IPA_URL__|https://${DOMAIN}/Sandra.ipa|g" \
    -e "s|__BUNDLE_ID__|${BUNDLE_ID}|g" \
    -e "s|__BUNDLE_VERSION__|${BUNDLE_VERSION}|g" \
    -e "s|__TITLE__|${TITLE}|g" \
    -e "s|__ICON57_URL__|${ICON57_URL}|g" \
    -e "s|__ICON512_URL__|${ICON512_URL}|g" \
    "$TPL_DIR/manifest.plist" > "$WEBROOT/manifest.plist"

# index.html (patch manifest URL)
sed -e "s|__MANIFEST_URL__|${MANIFEST_URL}|g" \
    "$TPL_DIR/index.html" > "$WEBROOT/index.html"

# Nginx conf
ALLOW_BLOCK=""
if [[ ${#ALLOW_IPS[@]} -gt 0 ]]; then
  for ip in "${ALLOW_IPS[@]}"; do
    ALLOW_BLOCK+="\n    allow ${ip};"
  done
  ALLOW_BLOCK+="\n    deny all;"
fi

mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sed -e "s|__SERVER_NAME__|${DOMAIN}|g" \
    -e "s|__WEBROOT__|${WEBROOT}|g" \
    -e "s|__ALLOW_BLOCK__|${ALLOW_BLOCK}|g" \
    "$TPL_DIR/nginx.conf.tpl" > "$CONF_AVAIL"

# Enable site
ln -sf "$CONF_AVAIL" "$CONF_ENABL"

# Permissions
chown -R www-data:www-data "$WEBROOT"
chmod -R 750 "$WEBROOT"

# Test & reload
nginx -t && systemctl reload nginx
echo "✅ OTA desplegado en https://${DOMAIN}/ (protegido)."
