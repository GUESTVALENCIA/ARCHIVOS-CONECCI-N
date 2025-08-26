# Despliegue Docker · Sandra Full Backend + Caddy (HTTPS)

## Estructura recomendada
```
/deploy
  ├─ docker-compose.yml
  ├─ Caddyfile
  ├─ Dockerfile           # opcional si docker build en raiz del backend
  └─ sandra-full-backend/ # carpeta con el backend (del ZIP anterior)
      ├─ package.json
      ├─ server.js
      ├─ src/
      └─ .env             # copia de .env.example con tus valores
```

## Pasos
1) Descarga y descomprime **sandra-full-backend.zip** y renómbralo a `sandra-full-backend/` junto a este `docker-compose.yml`.
2) Copia `.env.example` a `.env` dentro de `sandra-full-backend/` y **rellena**:
   - `OPENAI_API_KEY`
   - claves y endpoints de **avatar** (HEYGEN/GIGN/CARTESIA)
   - `CORS_ORIGINS=https://guestsvalencia.es,https://www.guestsvalencia.es`
3) Edita variables de dominio en **docker-compose.yml**: `CADDY_DOMAIN` y `CADDY_DOMAIN_ALT`.
4) Lanza:
   ```bash
   docker compose up -d --build
   ```
5) Comprueba:
   - `https://guestsvalencia.es/healthz` → `{"ok":true,"name":"sandra-full-backend"}`
   - `wss://guestsvalencia.es/ws/stt` (el widget lo usa solo)

## Notas de producción
- **WebSockets**: Caddy está configurado para proxy WS correctamente (`/ws/*`).  
- **TLS**: Caddy obtiene certificados **Let's Encrypt** automáticamente (expón 80/443 públicos).  
- **CORS**: en `.env` limita a tu dominio final.  
- **TURN opcional**: si tus clientes usan redes muy estrictas, despliega el servicio `turn` (comentado) y configura `ICE_JSON` en `.env` del backend con los servidores STUN/TURN.  
- **Logs**: puedes mapear volúmenes en `backend` para logs persistentes.  
- **Auto actualizaciones**: reconstruye backend con `docker compose build backend --no-cache && docker compose up -d`.  

## Netlify (frontend)
- Sube tu widget y web a Netlify o similar.  
- En el HTML global, apunta el atributo `data-backend` del widget a tu dominio HTTPS:
  ```html
  <script src="/sandra-widget.js"
          defer
          data-backend="https://guestsvalencia.es"
          data-model="gpt-4o-realtime-preview-2024-12-17"
          data-theme="auto"></script>
  ```
