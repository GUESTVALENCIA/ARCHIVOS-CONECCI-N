# SandraMobile · Native Starter (iOS + Android)

**Qué es**: Proyecto **React Native (Expo)** con chat, grabación de voz (push-to-talk), TTS de respuesta y endpoints para archivos. Pensado para **TestFlight** (iOS) y **APK** (Android).

## Importante sobre iPhone (instalar desde Safari)
En iOS **no puedes instalar un .ipa directamente desde Safari**. Las opciones oficiales son:
- **TestFlight** con tu cuenta de desarrollador (recomendado).
- **Build & Run** con Xcode conectando tu iPhone por cable.
- **Ad Hoc** (firmado con UDID del dispositivo).

Para Android, sí puedes generar un **APK** e instalarlo directamente.

## Cómo probar rápido (sin publicar aún)
1. `npm i -g expo-cli` (si no lo tienes) y `npm i` en `mobile/`.
2. `npm run prebuild` para generar iOS/Android nativos (primera vez).
3. iOS: abre `ios/Sandra.xcworkspace` en **Xcode** → pulsa **Run** con tu iPhone conectado (esto instala la app en tu móvil).
4. Android: `npm run android` o usa Android Studio → genera un `app-release.apk` para sideload.
5. Configura en la app (pantalla **Ajustes**) la **API Base**: tu dominio con el bridge (ej. `https://guestsvalencia.es`).

## Backend (bridge) – Patch incluído
Añade a tu bridge los endpoints de **STT** y **chat texto** (archivo `backend/bridge_stt_and_chat_patch.js`). Dependen de tu `OPENAI_API_KEY` y respetan la cookie/token admin/huésped.

## Funcionalidades V1
- **Chat texto** con respuesta instantánea.
- **Push-to-talk**: graba audio → STT → responde y **lee en voz** (ElevenLabs TTS stream).
- **Ajustes**: API base y token opcional (si no usas cookie HttpOnly).
- **Sin mensajes predeterminados**: diseño directo y conciso para Sandra.

## Próximos pasos
- **WebRTC nativo** (con `react-native-webrtc`) para igualar 100% ChatGPT Voz en tiempo real (necesita permisos + señalización en el bridge).
- **Uploads**: imágenes, vídeos y PDFs (endpoint `/api/files/upload` en bridge y UI en app).
- **Avatar**: lip‑sync canvas o 3D (p. ej. d-id SDK/Viseme).

Con cariño 💙 — preparado para que sólo tú y tu familia lo uséis en TestFlight y APK privado.
