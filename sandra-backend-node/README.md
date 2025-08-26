# Sandra Backend (Node.js)

Backend puente seguro para **Sandra ProTech (GuestsValencia)**:
- 🔐 Genera **tokens efímeros** para OpenAI Realtime (WebRTC).
- 🎙️ WebSocket **STT** (recibe audio webm/opus y devuelve transcripción con Whisper).
- 🧑‍🎤 Endpoint plantilla de **avatar** (para HeyGen/GIGN/Cartesia).

## Requisitos
- Node.js 18+
- Cuenta OpenAI (varios endpoints usados)
- (Opcional) SDK del proveedor de avatar

## Instalación
```bash
npm install
cp .env.example .env
# edita .env con tu OPENAI_API_KEY
```

## Ejecutar
```bash
npm start
# o con recarga
npm run dev
```
Servidor en: `http://localhost:${PORT || 8787}`

## Endpoints

### 1) POST /token/realtime
Crea una sesión efímera para OpenAI Realtime (WebRTC).
Body:
```json
{ "model": "gpt-4o-realtime-preview-2024-12-17", "voice": "verse" }
```
Respuesta incluye `client_secret.value` que el front usa para iniciar la conexión.

### 2) WS /ws/stt
WebSocket que recibe fragmentos binarios `audio/webm;codecs=opus` y devuelve JSON con `{ text }`.
- El backend agrupa ~1.5s y llama a `audio/transcriptions` (Whisper) con cada bloque.
- Respuesta parcial y final se envía al cliente.

### 3) POST /token/avatar
Plantilla para devolver token y endpoint RTC de tu proveedor de avatar.

## Notas de producción
- Usa HTTPS y WSS.
- Expira tokens efímeros rápido (60–120 s).
- Rate limiting y CORS.
- Logs por sesión.
- Para latencias ultra-bajas, considera usar **OpenAI Realtime** también para STT en la misma sesión.
