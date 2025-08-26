# Notas para el backend (STT con idioma forzado)
- El front abre `wss://YOUR_BACKEND/ws/stt?lang=es` (o en, fr, it, de, pt). Si `lang` no viene, se usa auto.
- El backend debe leer `lang` del querystring y pasarlo a la API de Whisper en `FormData.append('language', lang)`.
- Recomendable añadir también `prompt` para sesgo de dominio (GuestsValencia, Montanejos, Altea Hills, El Cabanyal...).