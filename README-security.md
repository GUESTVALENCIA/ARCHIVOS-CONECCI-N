# GV Security Addon Pack

## Qué incluye
- `backend/realtime-webrtc-bridge.secure.js` → versión endurecida (Helmet + Cookie HttpOnly).
- `backend/package.json.patch.json` → añade `helmet` y `cookie-parser` a dependencias.
- `nginx/csp.conf` → Content Security Policy (ajustable).
- `nginx/permissions-policy.conf` → limita micrófono/cámara/…
- `nginx/tls-strong.conf` → TLS moderno + OCSP stapling.
- `fail2ban/` → jail y filtro para bloquear abusos de 4xx/429.
- `scripts/rotate-jwt-secret.sh` → rotación de secreto JWT.
- `scripts/reload-nginx.sh` → prueba y recarga de Nginx.

## Aplicación rápida (producción)
1) **Backend seguro**  
   - Instala deps: `npm i helmet cookie-parser` en `/opt/gv-realtime`.  
   - Sustituye `realtime-webrtc-bridge.js` por `realtime-webrtc-bridge.secure.js` (o ajusta tu entrypoint).  
   - En `.env`, opcional: `ISSUE_JWT_IN_BODY=false` para evitar exponer el token al front (usaremos cookie HttpOnly).  
   - Reinicia servicio.

2) **Nginx**  
   - Copia `nginx/*.conf` a `/etc/nginx/conf.d/`.  
   - Incluye estos ficheros en tu server 443 o con `include /etc/nginx/conf.d/*.conf;` en el `server {}`.  
   - Ejecuta `./scripts/reload-nginx.sh`.

3) **Fail2ban**  
   - Copia `fail2ban/jail.d.nginx-gv.conf` a `/etc/fail2ban/jail.d/nginx-gv.conf`.  
   - Copia `fail2ban/filter.d.nginx-4xx-abuse.conf` a `/etc/fail2ban/filter.d/nginx-4xx-abuse.conf`.  
   - `systemctl restart fail2ban`.

4) **Rotar JWT**  
   - `sudo scripts/rotate-jwt-secret.sh` (usa systemd service `gv-realtime-bridge`).

## Recomendaciones extra
- **No guardes el JWT en localStorage**: con esta versión usamos cookie HttpOnly Strict (mitiga XSS/CSRF).  
- **Sube gradualmente CSP**: empieza con la que te doy y endurece (quita `'unsafe-eval'` en prod si tu build lo permite).  
- **Logs**: vigila 401/403/429; si hay ruido, ajusta `maxretry` en fail2ban.  
- **Copias de seguridad** de `.env` y **rotación trimestral** de `JWT_SECRET`.  
- **Escaneo**: `nmap`, `sslyze`, `securityheaders.com` tras el despliegue.
