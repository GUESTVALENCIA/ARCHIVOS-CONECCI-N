/**
 * GuestsValencia Realtime Bridge (Express JS)
 * - JWT guest gating (role, tier, propertyId, exp)
 * - Ephemeral session for OpenAI Realtime
 * - ElevenLabs TTS proxy (stream)
 * - CORS restricted to ALLOWED_ORIGIN
 */
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 8787;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME';
const ALLOWED = (process.env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const REALTIME_MODEL = process.env.REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';
const REALTIME_VOICE = process.env.REALTIME_VOICE || 'alloy';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2';

// ---- CORS ----
app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // allow curl/postman
    const ok = ALLOWED.some(allowed => origin === allowed);
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  }
}));

// ---- Rate limits ----
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
const realtimeLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);
app.use('/api/realtime/session', realtimeLimiter);

// ---- Utils ----
function issueGuestJWT(payload) {
  const expDateMs = Math.min(new Date(payload.checkout).getTime() + 24*60*60*1000, Date.now() + 7*24*60*60*1000);
  const expSec = Math.floor(expDateMs / 1000);
  return jwt.sign({
    sub: payload.sub,
    role: 'guest',
    email: payload.email,
    propertyId: payload.propertyId,
    tier: payload.tier || 'standard',
    exp: expSec,
  }, JWT_SECRET, { algorithm: 'HS256' });
}

function verifyJWT(authHeader) {
  try {
    if (!authHeader) return null;
    const token = authHeader.replace(/^Bearer\s+/i, '');
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

function computeTier(r) {
  // Ejemplo: propiedades premium empiezan por VAL-PR o importe >= 200 €/noche
  if ((r.propertyId || '').startsWith('VAL-PR') || (r.amountPerNight || 0) >= 200) return 'premium';
  return 'standard';
}

function mockFindBooking(email, bookingRef) {
  // TODO: sustituir por PMS/CRM real
  if (!email || !bookingRef) return null;
  // simple mock: cualquier referencia que empiece por GV- es válida 48h
  const now = Date.now();
  const checkout = new Date(now + 48*60*60*1000).toISOString();
  return {
    bookingRef,
    email,
    propertyId: bookingRef.includes('PR') ? 'VAL-PR88' : 'VAL-ST21',
    checkout,
    amountPerNight: bookingRef.includes('PR') ? 250 : 120,
  };
}

// ---- Routes ----
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Login mock → emite JWT
app.post('/api/auth/login', (req, res) => {
  const { email, bookingRef } = req.body || {};
  const r = mockFindBooking(email, bookingRef);
  if (!r) return res.status(401).json({ ok: false, error: 'invalid_credentials' });
  const tier = computeTier(r);
  const token = issueGuestJWT({ sub: r.bookingRef, email: r.email, propertyId: r.propertyId, checkout: r.checkout, tier });
  res.json({ ok: true, token, tier, propertyId: r.propertyId, checkout: r.checkout });
});

// Who am I (JWT claims)
app.get('/api/auth/me', (req, res) => {
  const claims = verifyJWT(req.headers.authorization || '');
  if (!claims) return res.status(401).json({ ok: false });
  res.json({ ok: true, role: claims.role, propertyId: claims.propertyId, exp: claims.exp, tier: claims.tier });
});

// Realtime ephemeral session
app.post('/api/realtime/session', async (req, res) => {
  const claims = verifyJWT(req.headers.authorization || '');
  if (!claims || claims.role !== 'guest') return res.status(401).json({ error: 'unauthorized' });
  // simple date check
  if (claims.exp && claims.exp < Math.floor(Date.now()/1000)) return res.status(401).json({ error: 'expired' });

  try {
    const r = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: REALTIME_MODEL,
        voice: REALTIME_VOICE,
        // optional settings (you can tweak modalities, turn detection, etc)
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'openai_error', detail: data });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'session_exception', detail: String(e && e.message || e) });
  }
});

// ElevenLabs TTS proxy
app.post('/api/tts/stream', async (req, res) => {
  const claims = verifyJWT(req.headers.authorization || '');
  if (!claims || claims.role !== 'guest') return res.status(401).json({ error: 'unauthorized' });

  const { text, voice_id = 'Rachel', format = 'audio/mpeg' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'missing_text' });

  try {
    const elUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice_id)}/stream`;
    const upstream = await fetch(elUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': format,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    });
    if (!upstream.ok) {
      const txt = await upstream.text();
      return res.status(502).json({ error: 'tts_failed', detail: txt });
    }
    res.setHeader('Content-Type', format);
    res.setHeader('Cache-Control', 'no-store');
    upstream.body.pipe(res);
  } catch (e) {
    res.status(500).json({ error: 'tts_exception', detail: String(e && e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`GV Realtime Bridge listening on :${PORT}`);
});
