import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { createAsrSession } from './services/asr.js';
import { askSandraNatural } from './services/sandra.js';

const app = express();
app.use(cors({
  origin: [
    'https://guestsvalencia.es',
    'https://www.guestsvalencia.es'
  ]
}));
app.use(express.json({ limit: '5mb' }));

// Texto -> Sandra (respuesta en texto)
app.post('/sandra/chat', async (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (!text) return res.status(400).json({ error: 'text required' });
    const reply = await askSandraNatural(text);
    return res.json({ reply });
  } catch (e) {
    console.error('chat error', e);
    return res.status(500).json({ error: 'chat error' });
  }
});

// (opcional) salud
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

const server = http.createServer(app);

// WS: audio streaming -> ASR -> texto
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  const session = createAsrSession();

  ws.on('message', async (chunk) => {
    try {
      await session.push(chunk);
      const partial = session.getPartial?.();
      if (partial) ws.send(JSON.stringify({ partial }));
    } catch (e) {
      console.error('ASR push error', e);
    }
  });

  session.onFinal?.((text) => {
    ws.send(JSON.stringify({ text }));
    try { ws.close(); } catch {}
  });

  ws.on('close', () => session.close?.());
});

server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/asr/ws')) {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  } else {
    socket.destroy();
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Sandra backend listening on ${PORT}`));
