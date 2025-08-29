# OTA Deploy Script Pack

Script automatizado para subir tu IPA, generar el manifest, parchear index.html y desplegar Nginx ultra-privado.

## Uso
```bash
sudo ./scripts/deploy_ota.sh   --domain download.guestsvalencia.es   --ipa /ruta/Sandra.ipa   --bundle es.guestsvalencia.sandra   --version 1.0.0   --title "Sandra"   --basic-auth-user admin   --basic-auth-pass "contraseña-super-segura"   --icons /ruta/a/icons   --allow-ip 203.0.113.15   --allow-ip 198.51.100.27
```

El script:
- Crea `/var/www/sandra` (si no existe).
- Copia `Sandra.ipa` y (opcional) iconos.
- Genera `manifest.plist` desde plantilla.
- Parchea `index.html` con la URL del manifest.
- Crea/habilita el vhost Nginx con Basic Auth y allowlist (opcional).
- Recarga Nginx.

> Requiere: Nginx + Certbot (TLS) + `apache2-utils` para htpasswd.
