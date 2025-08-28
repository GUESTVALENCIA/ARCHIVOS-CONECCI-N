#!/usr/bin/env bash
set -euo pipefail
ENV_FILE="/opt/gv-realtime/.env"
BACKUP="/opt/gv-realtime/.env.bak.$(date +%Y%m%d%H%M%S)"
cp "$ENV_FILE" "$BACKUP"

NEW=$(head -c 64 /dev/urandom | base64 | tr -d '
=+/')
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=${NEW}/" "$ENV_FILE"
echo "JWT_SECRET rotated. Restarting service..."
systemctl restart gv-realtime-bridge || true
