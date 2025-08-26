/**
 * Sandra Ultra Backend v2.0
 * - POST /token/realtime  -> token efímero (OpenAI Realtime)
 * - WS   /ws/stt?lang=es  -> STT con auto detección en primer bloque + sesgo de dominio
 * - POST /token/avatar    -> plantilla proveedor avatar
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import { parse } from 'url';
import FormData from 'form-data';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STT_MODEL = process.env.STT_MODEL || 'whisper-1';
const DOMAIN_PROMPT = process.env.STT_PROMPT || [
  'GuestsValencia','Montanejos','Fuente de los Baños','Altea Hills','Mirador de Altea',
  'El Cabanyal','Valencia','Poblados Marítimos','Calle Méndez Núñez','Bétera','duplex',
  'check-in autónomo','cerradura inteligente','caja de seguridad','Susana','Paloma'
].join(', ');

app.get('/health', (_req,res)=>res.json({ok:true, build:'2.0.0'}));

// 1) Token efímero Realtime
app.post('/token/realtime', async (req, res) => {
  try {
    const { model='gpt-4o-realtime-preview-2024-12-17', voice='verse' } = req.body || {};
    const r = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method:'POST',
      headers:{ Authorization:`Bearer ${OPENAI_API_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ model, voice /*, instructions: "Sandra ProTech..."*/ })
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error:'openai_error', detail:data });
    res.json(data);
  } catch(e){ res.status(500).json({ error:'server_error', detail:String(e) }); }
});

// 2) Token avatar (plantilla)
app.post('/token/avatar', (_req, res) => res.json({
  ok:true, provider:'YourAvatarProvider', token:'REPLACE_ME', rtcEndpoint:'https://provider.example.com/rtc'
}));

// 3) WS STT con auto detección de idioma
const wss = new WebSocketServer({ noServer: true });
const CONN = new Map();
function wsSend(ws,obj){ try{ ws.send(JSON.stringify(obj)); }catch{} }

async function transcribe(buf, lang){
  const form = new FormData();
  form.append('file', buf, { filename:'chunk.webm', contentType:'audio/webm' });
  form.append('model', STT_MODEL);
  if (lang) form.append('language', lang);
  form.append('prompt', DOMAIN_PROMPT);

  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method:'POST',
    headers:{ Authorization:`Bearer ${OPENAI_API_KEY}` },
    body: form
  });
  const data = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(data));
  return data; // puede traer text y language
}

const server = app.listen(PORT, ()=>console.log(`[OK] Backend en http://localhost:${PORT}`));

server.on('upgrade', (req, socket, head) => {
  const { pathname, query } = parse(req.url, true);
  if (pathname === '/ws/stt'){
    const lang = (query?.lang||'').toString().trim().toLowerCase();
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, { lang });
    });
  } else socket.destroy();
});

wss.on('connection', (ws, ctx) => {
  const id = uuidv4();
  let fixedLang = ['es','en','fr','it','de','pt'].includes(ctx.lang) ? ctx.lang : '';
  CONN.set(id, { buffers:[], timer:null, first:true });

  wsSend(ws, { ok:true, id, lang: fixedLang || 'auto' });

  const flush = async () => {
    const entry = CONN.get(id); if (!entry) return;
    const chunk = Buffer.concat(entry.buffers); entry.buffers = [];
    if (chunk.length===0) return;
    try {
      const data = await transcribe(chunk, fixedLang);
      if (data?.text) wsSend(ws, { text: data.text });
      if (entry.first){
        entry.first = false;
        const detected = data?.language;
        if (!fixedLang && detected){ fixedLang = detected; wsSend(ws, { langAuto: detected }); }
      }
    } catch(e){
      wsSend(ws, { error:'stt_error', detail:String(e) });
    }
  };

  const t = setInterval(flush, 1200);
  CONN.get(id).timer = t;

  ws.on('message', (msg)=>{ if (Buffer.isBuffer(msg)){ const e=CONN.get(id); if (e) e.buffers.push(msg); } });
  ws.on('close', async ()=>{ const e=CONN.get(id); if (e?.timer) clearInterval(e.timer); await flush(); CONN.delete(id); });
  ws.on('error', (err)=>console.error('[WS]', err));
});
