# Sandra Ultra · Front (Netlify-ready)

**Características**
- 3 rutas sin conflictos (clonado de mic):
  - WS STT con detección automática de idioma en el primer bloque.
  - Realtime (OpenAI) con audio + transcripción en la misma sesión.
  - Avatar (stub para integrar tu proveedor).
- Selector manual de idioma STT (opcional), pero por defecto **Auto**.

**Pasos**
1) Edita `app.js` y pon tu backend en:
```js
const BACKEND = 'https://TU_BACKEND_DOMINIO';
```
2) Sube esta carpeta a **Netlify** (Deploy Site → carpeta raíz).  
3) Asegúrate de que tu backend corre en HTTPS y permite CORS desde tu dominio Netlify.

**Notas**
- Chrome soporta `setSinkId` para escoger dispositivo de salida por cada `<audio>/<video>`.
- Usa cascos cuando pruebes para evitar eco.
