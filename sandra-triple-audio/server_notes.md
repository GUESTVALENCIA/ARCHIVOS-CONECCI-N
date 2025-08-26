# Servidor – Endpoints necesarios (resumen)

> Nunca expongas tu OPENAI_API_KEY en el front. Usa tokens efímeros desde el backend.

## 1) Token efímero Realtime
POST /token/realtime
Body: { "model": "gpt-4o-realtime-preview-2024-12-17" }
Resp: { "client_secret": { "value": "EPHEMERAL_TOKEN" } }

## 2) WebSocket STT
wss://YOUR_BACKEND/ws/stt
- Recibe audio/webm;codecs=opus (MediaRecorder) en fragmentos binarios.
- Transcodifica a PCM 16k mono.
- Llama a Whisper/Transcripción streaming.
- Devuelve JSON al cliente: { "text": "parcial o final" }.

## 3) Token Avatar
POST /token/avatar
- Devuelve token/credenciales y endpoint RTC del proveedor (HeyGen/GIGN/Cartesia).
- El front envía SDP offer y recibe answer para RTCPeerConnection del avatar.

### Recomendaciones
- HTTPS/WSS obligatorio, tokens con caducidad corta (60–120 s).
- Rate limiting, CORS controlado.
- Logs por sesión para depurar audio/RTC.
