# Sandra Ultra · Backend (Node)

Funciones:
- `POST /token/realtime` → token efímero para OpenAI Realtime (WebRTC).
- `WS /ws/stt?lang=es` → STT con detección automática: el primer bloque detecta idioma y fija para los siguientes.
- `POST /token/avatar` → placeholder para tu proveedor de avatar.

## Deploy rápido (Railway/Render/VPS)
```bash
npm install
cp .env.example .env
# edita OPENAI_API_KEY y CORS_ORIGIN con tu dominio Netlify
npm start
# => http://localhost:8787
```

## Seguridad
- No expongas tu API key en el front.
- Usa HTTPS/WSS en producción.
- Limita CORS a tu dominio de Netlify.
