# Sandra Widget – Avatar Multi-Provider
Este widget añade soporte de **Avatar WebRTC** con selector de proveedor (HeyGen | GIGN | Cartesia).
Pide un token/endpoint a tu backend (`POST /token/avatar`) enviando `{ provider }` y negocia SDP.

## Incrustación
```html
<script src="/sandra-widget.js"
        defer
        data-backend="https://api.guestsvalencia.es"
        data-model="gpt-4o-realtime-preview-2024-12-17"
        data-theme="auto"></script>
```

## Backend esperado
`POST /token/avatar` → `{ ok:true, rtcEndpoint, token, iceServers? }`
- `rtcEndpoint`: URL WebRTC del proveedor (endpoint SDP).
- `token`: credencial/secret de acceso.
- `iceServers` (opcional): si el proveedor exige STUN/TURN propios.

## Flujo
1. Widget envía `provider` al backend.
2. Backend obtiene **token/endpoint** del proveedor y lo devuelve.
3. El widget crea `RTCPeerConnection`, sube **mic** y publica **offer**.
4. Proveedor responde la **answer** → el **vídeo/voz del avatar** aparecen en el panel.
