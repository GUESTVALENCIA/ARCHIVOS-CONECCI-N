# Sandra Conversational – Snippet Minificado (.es)

Este paquete contiene el **script minificado** para integrar el **botón flotante de Sandra** con pulso de disponibilidad **(online)** y el **micrófono conversacional** (WS ASR + POST a Sandra) en tu sitio.

## Contenido
- `sandra-chat-integrated.min.js` → Script listo para producción (minificado).

## Cómo integrarlo
1. Copia `sandra-chat-integrated.min.js` a tu repo, por ejemplo en `public/`.
2. En tu `index.html`, añade antes del cierre de `</body>`:
   ```html
   <script src="/sandra-chat-integrated.min.js" type="module"></script>
   ```

## ¿Qué hace?
- Mueve `#sandra-chat-button.sandra-floating-btn` del footer al `<body>` y lo fija en **bottom-right**.
- Activa un **pulso suave** solo cuando la API/WS están **online**.
- Añade un **micrófono (🎤)** que:
  - Pide permiso solo al **clic**.
  - Envía audio (Opus) por **WebSocket** a `wss://api.guestsvalencia.es/asr/ws`.
  - Recibe la **transcripción** y la manda por `POST` a `https://api.guestsvalencia.es/sandra/chat`.
  - Pinta la respuesta usando `window.renderAssistantBubble?.(texto)` si tu chat lo expone (si no, verás logs en consola).
- **Reintento**: si el WS cae justo tras hablar, guarda la **última frase** y la reenvía en cuanto vuelve el **online**.

## Requisitos
- El botón de Sandra existente tiene selector `#sandra-chat-button.sandra-floating-btn`.
- Backend activo en `api.guestsvalencia.es` con endpoints:
  - `GET /health` → `{ ok: true }`
  - `WS /asr/ws`
  - `POST /sandra/chat` → `{ reply: "..." }`
- Nginx con soporte **WebSocket** (`Upgrade/Connection`) y TLS válido (necesario para `wss://`).

## Notas
- El snippet solo usa APIs nativas del navegador (no depende de frameworks).
- Si tu chat no define `window.renderUserBubble` / `window.renderAssistantBubble`, el sistema sigue funcionando (verás logs en la consola).
- En móvil, el mic aparece junto al botón y se desactiva si el sistema se cae (evita que el usuario hable “al vacío”).

## QA rápido
- Botón flotante visible en bottom-right.
- Pulso activo cuando `GET /health` y WS responden OK.
- Al hacer clic en 🎤, solicita permiso y **graba**; al soltar, aparece tu transcripción y la respuesta de Sandra.
- Si se cae la conexión, 🎤 se desactiva y **guarda** la última frase para reenvío cuando vuelva el online.
