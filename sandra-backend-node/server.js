/**
 * Sandra Backend (Node.js + Express + WS)
 * - /token/realtime  -> crea token efímero para OpenAI Realtime (WebRTC)
 * - /ws/stt (WebSocket) -> recibe audio webm/opus y devuelve transcripción con Whisper
 * - /token/avatar    -> plantilla para token del proveedor de avatar
 *
 * Seguridad:
 * - Nunca expongas OPENAI_API_KEY en el cliente. Aquí se guarda en .env
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import FormData from 'form-data';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn('[WARN] Falta OPENAI_API_KEY en .env');
}

/**
 * Healthcheck
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'sandra-backend-node', timestamp: new Date().toISOString() });
});

/**
 * 1) Token efímero para OpenAI Realtime (WebRTC)
 * Docs: se crea una "session" efímera. Devuelve client_secret que el front usa para iniciar la PC.
 */
app.post('/token/realtime', async (req, res) => {
  try {
    const { model = 'gpt-4o-realtime-preview-2024-12-17', voice = 'verse' } = req.body || {};
    const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        voice,          // si el modelo soporta TTS embebido
        // Opcional: instrucciones de sistema por sesión
        // instructions: "Sandra es la recepcionista 7★ ProTech de GuestsValencia...",
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[Realtime] Error creando sesión:', text);
      return res.status(500).json({ error: 'OpenAI Realtime error', detail: text });
    }
    const data = await resp.json();
    // data incluye client_secret { value }, id, etc.
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', detail: String(err) });
  }
});

/**
 * 2) Token avatar (plantilla)
 * Aquí normalmente pedirías un token/credenciales al proveedor (HeyGen/GIGN/Cartesia)
 * y devolverías los datos que tu front necesita para su RTCPeerConnection.
 */
app.post('/token/avatar', async (_req, res) => {
  try {
    // TODO: integrar SDK/proveedor real
    res.json({
      ok: true,
      provider: 'YourAvatarProvider',
      token: 'REPLACE_ME_WITH_REAL_PROVIDER_TOKEN',
      rtcEndpoint: 'https://provider.example.com/rtc'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', detail: String(err) });
  }
});

/**
 * 3) WebSocket STT – recibe fragmentos binarios (audio/webm;codecs=opus)
 *    Estratégia simple: acumulamos N ms y enviamos a Whisper (whisper-1) como archivo WebM.
 *    Devolvemos transcripciones parciales/finales en JSON: { text: "..." }
 *
 *  Nota: Este enfoque es "near-realtime" por bloques. Para menos latencia, usar bloques pequeños (p.ej. 1–2s),
 *  o migrar a Realtime + input_audio.transcription en la misma sesión.
 */
const wss = new WebSocketServer({ noServer: true });
const CONN = new Map(); // id -> { buffers: [], timer }

function wsSend(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch {}
}

async function transcribeWebmBuffer(buf) {
  const form = new FormData();
  // Adjuntamos el blob como archivo "chunk.webm"
  form.append('file', buf, { filename: 'chunk.webm', contentType: 'audio/webm' });
  form.append('model', process.env.STT_MODEL || 'whisper-1'); // o gpt-4o-mini-transcribe si está disponible
  // Idioma opcional: form.append('language', 'es');

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: form
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Transcription error: ${txt}`);
  }
  const data = await resp.json();
  return data.text || '';
}

// Upgrade HTTP → WS para la ruta /ws/stt
const server = app.listen(PORT, () => {
  console.log(`[OK] Sandra backend escuchando en http://localhost:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  if (request.url.startsWith('/ws/stt')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws, req) => {
  const id = uuidv4();
  CONN.set(id, { buffers: [], timer: null });
  wsSend(ws, { ok: true, id, note: 'WS STT conectado' });

  const flushAndTranscribe = async () => {
    const entry = CONN.get(id);
    if (!entry) return;
    const current = Buffer.concat(entry.buffers);
    entry.buffers = []; // vaciar
    if (current.length === 0) return;

    try {
      const text = await transcribeWebmBuffer(current);
      if (text && text.trim().length) {
        wsSend(ws, { text });
      }
    } catch (err) {
      console.error('[STT] error transcribing:', err.message);
      wsSend(ws, { error: 'stt_error', detail: err.message });
    }
  };

  // Cada 1500ms intentamos transcribir lo acumulado
  const timer = setInterval(flushAndTranscribe, 1500);
  CONN.get(id).timer = timer;

  ws.on('message', (msg) => {
    // Esperamos ArrayBuffer / Buffer con fragmentos opus/webm
    if (Buffer.isBuffer(msg)) {
      const entry = CONN.get(id);
      if (entry) entry.buffers.push(msg);
    } else {
      // Si llega texto, lo ignoramos o lo tratamos como control
      // console.log('WS text:', msg.toString());
    }
  });

  ws.on('close', async () => {
    const entry = CONN.get(id);
    if (entry?.timer) clearInterval(entry.timer);
    await flushAndTranscribe(); // último intento
    CONN.delete(id);
  });

  ws.on('error', (err) => {
    console.error('[WS] error:', err);
  });
});
