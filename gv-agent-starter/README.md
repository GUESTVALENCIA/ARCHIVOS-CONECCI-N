# gv-agent-starter

Starter pack para la nueva web de GuestsValencia con **backend Express**, **frontend Next.js 14**, **proxy a Sandra (API externa)** y utilidades de despliegue por Docker + GitHub Actions.

## Estructura
```
/frontend         -> Next.js (App Router) + Tailwind
/backend          -> Node.js Express (API y webhooks)
/sandra           -> Prompt maestro + memoria inicial
/scripts          -> Deploy helpers
/docker           -> Dockerfiles multi-stage
```
## Requisitos
- Node 20+, Docker 24+
- Configurar `.env` (ver `.env.example`)
- Clave API de Sandra en `SANDRA_API_KEY`

## Desarrollo
```bash
# 1) Instalar
npm -w frontend i && npm -w backend i

# 2) Levantar todo
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

## Producción (Docker)
```bash
docker compose -f docker/compose.yml up -d --build
```

## Integración con Sandra
- El backend expone `POST /api/sandra/chat` que **reenvía** mensajes a Sandra.
- Añade autenticación por header `Authorization: Bearer <SANDRA_API_KEY>`.

## Webhooks WhatsApp
- Endpoint `POST /api/webhooks/whatsapp` para recibir mensajes entrantes y responder vía Sandra.

## Deploy CI/CD
- Incluye workflow `deploy.yml` para build + push + deploy con Docker.
```

