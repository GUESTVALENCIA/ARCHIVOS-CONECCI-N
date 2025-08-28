/**
 * GV Realtime Bridge (SECURE) — Express + Helmet + Cookie Auth
 * - JWT en cookie HttpOnly SameSite=Strict (compatible con Authorization Bearer)
 * - Helmet headers (CSP via Nginx)
 * - Rate limit ya presente; CORS estricto
 */
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,        // CSP desde Nginx
  crossOriginEmbedderPolicy: false,    // compat PWA/Next
}));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 8787;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME';
const ALLOWED = (process.env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const REALTIME_MODEL = process.env.REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';
const REALTIME_VOICE = process.env.REALTIME_VOICE || 'alloy';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2';
const ISSUE_JWT_IN_BODY = process.env.ISSUE_JWT_IN_BODY === 'true';

// ---- CORS ----
app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // allow curl/postman
    const ok = ALLOWED.some(allowed => origin === allowed);
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
}));

// ---- Rate limits ----
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
const realtimeLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);
app.use('/api/realtime/session', realtimeLimiter);

// ---- Utils ----
function signGuestJWT(payload) {
  const nowSec = Math.floor(Date.now()/1000);
  const expSec = Math.min(Math.floor(new Date(payload.checkout).getTime()/1000) + 24*60*60, nowSec + 7*24*60*60);
  return jwt.sign({
    sub: payload.sub,
    role: 'guest',
    email: payload.email,
    propertyId: payload.propertyId,
    tier: payload.tier || 'standard',
    iat: nowSec,
    exp: expSec,
  }, JWT_SECRET, { algorithm: 'HS256' });
}

function tokenFromReq(req) {
  const h = req.headers.authorization || '';
  if (h && /^Bearer\s+/i.test(h)) return h.replace(/^Bearer\s+/i, '');
  if (req.cookies && req.cookies.gv_session) return req.cookies.gv_session;
  return null;
}

function verifyFromReq(req) {
  try {
    const tok = tokenFromReq(req);
    if (!tok) return null;
    return jwt.verify(tok, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

// ---- Routes ----
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Mock login: emite cookie HttpOnly (y opcionalmente token en body)
app.post('/api/auth/login', (req, res) => {
  const { email, bookingRef } = req.body || {};
  if (!email || !bookingRef) return res.status(400).json({ ok: false, error: 'missing_fields' });
  const isPremium = /PR/i.test(bookingRef);
  const checkoutISO = new Date(Date.now() + 48*60*60*1000).toISOString();
  const token = signGuestJWT({
    sub: bookingRef,
    email,
    propertyId: isPremium ? 'VAL-PR88' : 'VAL-ST21',
    checkout: checkoutISO,
    tier: isPremium ? 'premium' : 'standard',
  });

  // Cookie segura sólo en HTTPS
  const nowMs = Date.now();
  const expMs = Math.min(new Date(checkoutISO).getTime() + 24*60*60*1000, nowMs + 7*24*60*1000);
  res.cookie('gv_session', token, {
    httpOnly: true, secure: true, sameSite: 'strict', path: '/',
    maxAge: Math.max(60*60*1000, expMs - nowMs),
  });

  const body = { ok: true, tier: isPremium ? 'premium' : 'standard', propertyId: isPremium ? 'VAL-PR88' : 'VAL-ST21', checkout: checkoutISO };
  if (ISSUE_JWT_IN_BODY) body.token = token; // compat si aún lo necesitáis en el front
  res.json(body);
});

app.get('/api/auth/me', (req, res) => {
  const claims = verifyFromReq(req);
  if (!claims) return res.status(401).json({ ok: false });
  res.json({ ok: true, role: claims.role, propertyId: claims.propertyId, exp: claims.exp, tier: claims.tier });
});

app.post('/api/realtime/session', async (req, res) => {
  const claims = verifyFromReq(req);
  if (!claims || claims.role !== 'guest') return res.status(401).json({ error: 'unauthorized' });
  if (claims.exp && claims.exp < Math.floor(Date.now()/1000)) return res.status(401).json({ error: 'expired' });

  try {
    const r = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: REALTIME_MODEL, voice: REALTIME_VOICE }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'openai_error', detail: data });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'session_exception', detail: String(e && e.message || e) });
  }
});

app.post('/api/tts/stream', async (req, res) => {
  const claims = verifyFromReq(req);
  if (!claims || claims.role !== 'guest') return res.status(401).json({ error: 'unauthorized' });

  const { text, voice_id = 'Rachel', format = 'audio/mpeg' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'missing_text' });

  try {
    const elUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice_id)}/stream`;
    const upstream = await fetch(elUrl, {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json', 'Accept': format },
      body: JSON.stringify({ text, model_id: ELEVENLABS_MODEL_ID, voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
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

app.listen(PORT, () => console.log(`GV Bridge (secure) on :${PORT}`));
