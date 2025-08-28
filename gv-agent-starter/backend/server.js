import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
const SANDRA_API_BASE = process.env.SANDRA_API_BASE;
const SANDRA_API_KEY = process.env.SANDRA_API_KEY;

// Health
app.get("/api/health", (_, res) => res.json({ ok: true, ts: Date.now() }));

// Proxy chat -> Sandra
app.post("/api/sandra/chat", async (req, res) => {
  try {
    const { messages, mode = "guest" } = req.body || {};
    const r = await axios.post(`${SANDRA_API_BASE}/chat`, { messages, mode }, {
      headers: { Authorization: `Bearer ${SANDRA_API_KEY}` }
    });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ error: true, detail: err?.response?.data || err.message });
  }
});

// WhatsApp webhook (ejemplo)
app.post("/api/webhooks/whatsapp", async (req, res) => {
  // Normaliza payload, consulta a Sandra y responde
  res.json({ received: true });
});

app.listen(PORT, () => console.log(`Backend listening on :${PORT}`));
