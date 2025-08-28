# Nginx Privacy Pack — Sandra OTA

1) Copia `nginx/download.guestsvalencia.es.conf` a `/etc/nginx/sites-available/` y habilítalo con un symlink a `sites-enabled/`.
2) Crea el archivo de contraseñas siguiendo `scripts/HTPASSWD.md`.
3) Asegúrate de tener certificados en `/etc/letsencrypt/live/download.guestsvalencia.es/` (o ajusta rutas).
4) Coloca el kit Ad Hoc en `/var/www/sandra` (ver `INDEX_HINT.txt`).
5) `nginx -t && systemctl reload nginx`.

Incluye: Basic Auth + (opcional) allowlist IP + headers anti-indexado + rate limiting.
