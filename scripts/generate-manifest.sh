#!/usr/bin/env bash
set -euo pipefail

: "${IPA_URL:?Define IPA_URL}"
: "${BUNDLE_ID:?Define BUNDLE_ID}"
: "${BUNDLE_VERSION:?Define BUNDLE_VERSION}"
: "${TITLE:?Define TITLE}"

ICON57_URL="${ICON57_URL:-}"
ICON512_URL="${ICON512_URL:-}"

TPL="$(dirname "$0")/../manifest.plist"
OUT="${OUT:-/dev/stdout}"

sed \
  -e "s|__IPA_URL__|${IPA_URL}|g" \
  -e "s|__BUNDLE_ID__|${BUNDLE_ID}|g" \
  -e "s|__BUNDLE_VERSION__|${BUNDLE_VERSION}|g" \
  -e "s|__TITLE__|${TITLE}|g" \
  -e "s|__ICON57_URL__|${ICON57_URL}|g" \
  -e "s|__ICON512_URL__|${ICON512_URL}|g" \
  "$TPL" > "$OUT"

echo "✅ manifest.plist generado en $OUT"
