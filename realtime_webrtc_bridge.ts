import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import "dotenv/config";

/**
 * GuestsValencia — Realtime WebRTC Bridge (Seguro, solo huéspedes)
 * -----------------------------------------------------------------
 * • Autenticación JWT basada en reserva (rol: "guest")
 * • Emisión de token efímero Realtime SÓLO si el huésped está verificado y su estancia está activa
 * • CORS restringido por dominio
 * • Rate limiting anti-abuso
 * • Dos modos de handshake: Token efímero (/session) o Proxy SDP (/sdp)
 *
 * Dependencias:
 *   npm i express cors express-rate-limit jsonwebtoken dotenv
 *
 * .env requerido:
 *   OPENAI_API_KEY=sk-...
 *   JWT_SECRET=una_clave_larga_aleatoria
 *   ALLOWED_ORIGIN=https://guestsvalencia.es,https://www.guestsvalencia.es
 *   REALTIME_MODEL=gpt-4o-realtime-preview-2024-12-17
 *   REALTIME_VOICE=alloy
 */

// ——— App y Config ———
const app = express();
const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const REALTIME_MODEL = process.env.REALTIME_MODEL || "gpt-4o-realtime-preview-2024-12-17";
const REALTIME_VOICE = process.env.REALTIME_VOICE || "alloy";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

if (!OPENAI_API_KEY) throw new Error("Falta OPENAI_API_KEY");
if (!JWT_SECRET) throw new Error("Falta JWT_SECRET");

// ——— CORS ———
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // permitir herramientas locales
      const ok = ALLOWED_ORIGIN.split(",").some((o) => origin === o);
      return ok ? cb(null, true) : cb(new Error("Origen no permitido"));
    },
    credentials: true,
  })
);

// ——— Parsers ———
app.use(express.json({ limit: "2mb" }));
app.use("/api/realtime/sdp", express.text({ type: ["application/sdp", "text/plain", "*/*"], limit: "10mb" }));

// ——— Rate limits ———
const strictLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false });

// ——— Mock de reservas (sólo demo). Reemplazar por DB real. ———
//  bookingRef es un localizador alfanumérico único por reserva.
//  checkout define la fecha límite: el token se emite sólo hasta 24h después.
const reservations: Record<string, {
  email: string;
  propertyId: string;
  checkin: string;  // ISO
  checkout: string; // ISO
}> = {
  "ABC123": { email: "huesped@ejemplo.com", propertyId: "VAL-MN47", checkin: "2025-08-27T15:00:00Z", checkout: "2025-09-02T11:00:00Z" },
  // añade real data desde tu PMS/DB
};

function findActiveReservation(email: string, bookingRef: string) {
  const r = reservations[bookingRef];
  if (!r) return null;
  if (r.email.toLowerCase() !== email.toLowerCase()) return null;
  const now = Date.now();
  const start = new Date(r.checkin).getTime() - 24 * 60 * 60 * 1000; // habilita 24h antes del checkin
  const end = new Date(r.checkout).getTime() + 24 * 60 * 60 * 1000; // y 24h después del checkout
  if (now < start || now > end) return null;
  return r;
}

// ——— Helpers JWT ———
function issueGuestJWT(payload: { sub: string; email: string; propertyId: string; checkout: string }) {
  // caducidad: min( checkout+24h , ahora+7d )
  const expDate = Math.min(new Date(payload.checkout).getTime() + 24 * 60 * 60 * 1000, Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expSec = Math.floor(expDate / 1000);
  return jwt.sign({
    sub: payload.sub,
    role: "guest",
    email: payload.email,
    propertyId: payload.propertyId,
    exp: expSec,
  }, JWT_SECRET, { algorithm: "HS256" });
}

function verifyJWT(token?: string) {
  try {
    if (!token) return null;
    return jwt.verify(token.replace(/^Bearer\s+/i, ""), JWT_SECRET) as any;
  } catch { return null; }
}

// ————————————————————————————————————————
//  AUTH: login huésped -> devuelve JWT
//  Body: { email:string, bookingRef:string }
// ————————————————————————————————————————
app.post("/api/auth/login", authLimiter, (req, res) => {
  const { email, bookingRef } = req.body || {};
  if (!email || !bookingRef) return res.status(400).json({ error: "missing_params" });
  const r = findActiveReservation(email, bookingRef);
  if (!r) return res.status(403).json({ error: "not_authorized" });
  const token = issueGuestJWT({ sub: bookingRef, email, propertyId: r.propertyId, checkout: r.checkout });
  return res.json({ token, role: "guest", propertyId: r.propertyId });
});

// Quick check para el cliente (UI): ¿tiene voz habilitada?
app.get("/api/auth/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const claims = verifyJWT(auth);
  if (!claims) return res.status(401).json({ ok: false });
  return res.json({ ok: true, role: claims.role, propertyId: claims.propertyId, exp: claims.exp });
});

// ————————————————————————————————————————
//  REALTIME: Token efímero de sesión (sólo guest verificado)
//  Header: Authorization: Bearer <JWT de huésped>
// ————————————————————————————————————————
app.post("/api/realtime/session", strictLimiter, async (req, res) => {
  const claims = verifyJWT(req.headers.authorization as string);
  if (!claims || claims.role !== "guest") return res.status(401).json({ error: "unauthorized" });

  try {
    const body = {
      model: REALTIME_MODEL,
      modalities: ["audio", "text"],
      voice: REALTIME_VOICE,
      instructions: "Eres Sandra IA 7.0 de Guests Valencia. Sé cálida, profesional y breve. Usa emojis con finura cuando aporten cercanía.",
      // metadata opcional para auditoría
      metadata: { bookingRef: claims.sub, email: claims.email, propertyId: claims.propertyId },
    } as Record<string, any>;

    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errorText = await r.text();
      return res.status(500).json({ error: "openai_session_failed", detail: errorText });
    }

    const data = await r.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: "session_exception", detail: String(err?.message || err) });
  }
});

// ————————————————————————————————————————
//  REALTIME (Proxy SDP) — también exige JWT de huésped
// ————————————————————————————————————————
app.post("/api/realtime/sdp", strictLimiter, async (req, res) => {
  const claims = verifyJWT(req.headers.authorization as string);
  if (!claims || claims.role !== "guest") return res.status(401).send("unauthorized");

  try {
    const offerSDP = req.body;
    if (!offerSDP || typeof offerSDP !== "string") return res.status(400).send("Missing SDP offer body");

    const url = new URL("https://api.openai.com/v1/realtime");
    url.searchParams.set("model", REALTIME_MODEL);

    const rr = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/sdp",
        Accept: "application/sdp",
      },
      body: offerSDP,
    });

    if (!rr.ok) {
      const errorText = await rr.text();
      return res.status(500).send(errorText);
    }

    const answer = await rr.text();
    res.setHeader("Content-Type", "application/sdp");
    return res.status(200).send(answer);
  } catch (err: any) {
    return res.status(500).send(String(err?.message || err));
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🚀 Realtime bridge seguro en :${PORT}`);
  console.log(`   Modelo: ${REALTIME_MODEL} · Voz: ${REALTIME_VOICE}`);
});

/*
================================================================
 FRONT-END (gating de voz): sólo huéspedes verificados con JWT
================================================================
// 1) Login de huésped (bookingRef + email) → guardar JWT
const r = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, bookingRef }),
}).then(r => r.json());
localStorage.setItem("gv.jwt", r.token);

// 2) Mostrar mic sólo si /api/auth/me responde ok
const me = await fetch("/api/auth/me", {
  headers: { Authorization: `Bearer ${localStorage.getItem("gv.jwt")}` }
}).then(r => r.json());
const canUseVoice = !!me.ok && me.role === "guest";

// 3) Al pulsar 🎤: pedir token efímero y realizar handshake WebRTC
const sess = await fetch("/api/realtime/session", {
  method: "POST",
  headers: { Authorization: `Bearer ${localStorage.getItem("gv.jwt")}` },
}).then(r => r.json());
const EPHEMERAL = sess?.client_secret?.value;
// ... crear RTCPeerConnection y enviar offer a https://api.openai.com/v1/realtime?model=...
*/
