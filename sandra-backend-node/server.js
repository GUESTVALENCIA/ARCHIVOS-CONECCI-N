/**
 * Sandra Backend (Node.js + Express + WS) – v1.1
 * - /token/realtime  -> token efímero para OpenAI Realtime (WebRTC)
 * - /ws/stt?lang=es  -> WebSocket STT con idioma forzado (Whisper)
 * - /token/avatar    -> plantilla token avatar
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import FormData from 'form-data';
import { parse } from 'url';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STT_MODEL = process.env.STT_MODEL || 'whisper-1';

const DOMAIN_PROMPT = process.env.STT_PROMPT || [
  'GuestsValencia', 'Montanejos', 'Fuente de los Baños', 'Altea Hills',
  'Mirador de Altea', 'El Cabanyal', 'Valencia', 'Poblados Marítimos',
  'Calle Méndez Núñez', 'Bétera', 'duplex', 'check-in autónomo',
  'cerradura inteligente', 'caja de seguridad', 'Susana', 'Paloma'
].join(', ');

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/token/realtime', async (req, res) => {
  try {
    const { model = 'gpt-4o-realtime-preview-2024-12-17', voice = 'verse' } = req.body || {};
    const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, voice })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: 'openai_error', detail: data });
    res.json(data);
  } catch (e) { res.status(500).json({ error: 'server_error', detail: String(e) }); }
});

app.post('/token/avatar', async (_req, res) => res.json({
  ok: true, provider: 'YourAvatarProvider',
  token: 'REPLACE_ME_WITH_REAL_PROVIDER_TOKEN',
  rtcEndpoint: 'https://provider.example.com/rtc'
}));

// WS STT con ?lang=es|en|fr|it|de|pt (vacío -> auto)
const wss = new WebSocketServer({ noServer: true });
const CONN = new Map();
function wsSend(ws, obj){ try{ ws.send(JSON.stringify(obj)); }catch{} }

async function transcribeWebmBuffer(buf, lang) {
  const form = new FormData();
  form.append('file', buf, { filename: 'chunk.webm', contentType: 'audio/webm' });
  form.append('model', STT_MODEL);
  if (lang) form.append('language', lang);
  // prompt de dominio para mejorar NER y términos propios
  form.append('prompt', DOMAIN_PROMPT);

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(data));
  return data.text || '';
}

const server = app.listen(PORT, () => console.log(`[OK] Backend en http://localhost:${PORT}`));

server.on('upgrade', (request, socket, head) => {
  const { pathname, query } = parse(request.url, true);
  if (pathname === '/ws/stt') {
    const lang = (query?.lang || '').toString().trim().toLowerCase();
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, { lang });
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws, ctx) => {
  const id = uuidv4();
  const lang = ['es','en','fr','it','de','pt'].includes(ctx.lang) ? ctx.lang : '';
  CONN.set(id, { buffers: [], timer: null, lang });
  wsSend(ws, { ok: true, id, lang: lang || 'auto' });

  const flushAndTranscribe = async () => {
    const entry = CONN.get(id);
    if (!entry) return;
    const current = Buffer.concat(entry.buffers);
    entry.buffers = [];
    if (current.length === 0) return;
    try {
      const text = await transcribeWebmBuffer(current, entry.lang);
      if (text?.trim()) wsSend(ws, { text });
    } catch(e) {
      wsSend(ws, { error: 'stt_error', detail: e.message });
    }
  };

  const timer = setInterval(flushAndTranscribe, 1500);
  CONN.get(id).timer = timer;

  ws.on('message', (msg) => {
    if (Buffer.isBuffer(msg)) {
      const entry = CONN.get(id);
      if (entry) entry.buffers.push(msg);
    }
  });
  ws.on('close', async () => {
    const entry = CONN.get(id);
    if (entry?.timer) clearInterval(entry.timer);
    await flushAndTranscribe();
    CONN.delete(id);
  });
  ws.on('error', (err) => console.error('[WS]', err));
});
