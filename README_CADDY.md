# Sandra Ultra Backend · Caddy (Auto-HTTPS)

**Qué incluye**
- Backend Node v2.0 (STT auto-idioma + token Realtime) en `./sandra-ultra-backend`
- Caddy reverse proxy con **Let's Encrypt** (HTTPS automático)
- `docker-compose.yml` listo para producción

## Pasos
1) **DNS**: apunta tu dominio (A/AAAA) a la IP del servidor.
2) Edita **Caddyfile**:
   - Sustituye `YOUR_DOMAIN_HERE` por tus dominios (puedes varios separados por coma).
   - Pon tu email en `tls you@dominio.com` (recomendado para renovación/avisos).
3) Backend:
```bash
cp sandra-ultra-backend/.env.example sandra-ultra-backend/.env
# edita .env con OPENAI_API_KEY y CORS_ORIGIN=https://tu-front.netlify.app
```
4) Levanta servicios:
```bash
docker compose up -d --build
```
5) Comprueba:
- Salud backend: `curl http://localhost:8787/health`
- Sitio HTTPS: `https://TU_DOMINIO` (Caddy levanta certificados automáticamente)

## Notas
- Si usas Cloudflare proxy (nube naranja), usa **DNS only** la primera vez para emitir el certificado y luego vuelve a proxy.
- Para varios dominios (.es y .com) puedes listarlos en la **misma** entrada del `Caddyfile`.
- Caddy maneja WebSockets automáticamente (`/ws/stt`).

Build: 2025-08-26T00:35:31.114903
