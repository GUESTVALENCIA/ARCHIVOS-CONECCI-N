#!/usr/bin/env bash
set -euo pipefail
nginx -t && systemctl reload nginx
echo "Nginx reloaded successfully."
