# Sandra Backend (Node.js) – v1.1 con idioma STT forzado

## Novedades
- `WS /ws/stt?lang=es` → fuerza idioma de transcripción (`es|en|fr|it|de|pt`; vacío=auto).
- Sesgo de dominio con `STT_PROMPT` (mejores resultados para términos de GuestsValencia).

## Rutas
- `POST /token/realtime`
- `WS /ws/stt?lang=es`
- `POST /token/avatar`

## Config
- `.env`: `OPENAI_API_KEY`, `PORT`, `STT_MODEL`, `STT_PROMPT`.

## Uso rápido
```bash
npm install
cp .env.example .env  # añade tu OPENAI_API_KEY
npm start
```
