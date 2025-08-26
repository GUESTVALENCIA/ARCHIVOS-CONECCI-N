# Sandra Ultra Backend · Docker

## Opciones
- **Solo backend** (puerto 8787), o
- **Con Nginx** como reverse proxy HTTP (puerto 80). Para HTTPS, usa Caddy/Traefik o un LB con TLS.

## Pasos
```bash
unzip sandra-ultra-backend-docker.zip
cd sandra-ultra-backend-docker
cp sandra-ultra-backend/.env.example sandra-ultra-backend/.env
# edita OPENAI_API_KEY y CORS_ORIGIN

docker compose up -d --build
# API => http://localhost:80 (si usas nginx) o http://localhost:8787 (directo)
```
- Comprobación health: `curl http://localhost:8787/health`

## Notas
- Para **HTTPS** rápido: usa Caddy o Traefik con Let's Encrypt, o un proxy de Cloudflare/Tunnel.
- En producción, limita `CORS_ORIGIN` a tu dominio Netlify.
- El contenedor Node usa `node:18-alpine`. Cambia versión si lo necesitas.
- Build time: 2025-08-26T00:31:38.600084
