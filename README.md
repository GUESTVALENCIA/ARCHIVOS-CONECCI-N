# GV MONO Deploy Pack — (PWA + Bridge + Nginx + Docker + systemd)

Fecha: 2025-08-28

## Contenido
- **frontend/** → Next.js PWA (Heian) listo con gating (🎤/avatar según JWT/tier).
- **backend/** → Express bridge: JWT + OpenAI Realtime + ElevenLabs TTS proxy + CORS + rate limit.
- **nginx/** → `http-snippet.conf` (zonas de limit) + `guestsvalencia.conf` (reverse proxy TLS).
- **server/** → `gv-realtime-bridge.service` (systemd), `firewall.sh`, `99-gv.conf` (sysctl).
- **docker-compose.yml** → levantar bridge con Docker.

## Pasos de despliegue (rápido)
1) **Backend** (server):
```bash
sudo mkdir -p /opt/gv-realtime && sudo chown $USER:$USER /opt/gv-realtime
rsync -av backend/ /opt/gv-realtime/
cp backend/.env.example /opt/gv-realtime/.env
# Rellena OPENAI_API_KEY, ELEVENLABS_API_KEY, JWT_SECRET y ALLOWED_ORIGIN
cd /opt/gv-realtime && npm i --omit=dev && npm start
# (o con Docker): en la raíz del pack -> docker compose up -d --build
```

2) **Nginx + TLS**:
```bash
sudo cp nginx/http-snippet.conf /etc/nginx/conf.d/http-snippet.conf
sudo cp nginx/guestsvalencia.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/guestsvalencia.conf /etc/nginx/sites-enabled/guestsvalencia.conf
sudo nginx -t && sudo systemctl reload nginx
# Certbot (si aún no tienes certs):
# sudo certbot certonly --nginx -d guestsvalencia.es -d www.guestsvalencia.es
```

3) **Firewall + Kernel** (opcional pero recomendado):
```bash
sudo bash server/firewall.sh
sudo cp server/99-gv.conf /etc/sysctl.d/ && sudo sysctl --system
```

4) **Systemd (alternativa a Docker)**:
```bash
sudo cp -r backend/* /opt/gv-realtime/
sudo cp server/gv-realtime-bridge.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now gv-realtime-bridge
sudo systemctl status gv-realtime-bridge
```

5) **Frontend (Next.js)**:
- Copia **frontend/** a tu repo web (o integra archivos en tu estructura).
- Asegúrate de que `public/` contenga: `manifest.webmanifest`, `service-worker.js`, `register-sw.js` y `/assets/*`.
- En el login de huésped, guarda el token:
```js
localStorage.setItem('gv.jwt', token);
```
- Despliega la web en `:3000` (o ajusta `nginx/guestsvalencia.conf`).

## Flujo de acceso
- Visitante: solo chat de texto (sin 🎤 ni avatar).
- Huésped (JWT válido): 🎤 habilitado → `/api/realtime/session` crea token efímero y hace handshake WebRTC.
- Premium (`tier=premium`): además del 🎤, se muestra el avatar Heian en el UI.

## Endpoints clave
- `POST /api/auth/login` → `{ email, bookingRef }` → JWT (mock). Sustituye por PMS real.
- `GET /api/auth/me` → devuelve claims `{ role, tier, propertyId, exp }`.
- `POST /api/realtime/session` → crea **client_secret** efímero para Realtime (OpenAI).
- `POST /api/tts/stream` → proxy ElevenLabs TTS (stream de audio).

## Seguridad
- **CORS**: restringido a `ALLOWED_ORIGIN` (tu dominio).
- **Rate-limit**: global `/api/*` y reforzado en `/api/realtime/session`.
- **UFW**: solo 80/443/22; puerto 8787 cerrado al público, accesible vía Nginx.
- **Headers**: seguridad y HSTS en Nginx.

¡Listo! Con esto tienes **todo directo a tu web**, con control absoluto y experiencia premium para tus huéspedes.
