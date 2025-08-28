\
/**
 * Add to your gv-bridge (secure+admin) the following endpoints:
 */
// ---- at top ----
const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// ---- helper for auth ----
function claimsOr401(req, res) {
  const c = verifyFromReq(req);
  if (!c) { res.status(401).json({ ok:false, error: 'unauthorized' }); return null; }
  return c;
}

// ---- STT (Whisper) ----
app.post('/api/stt/transcribe', upload.single('file'), async (req, res) => {
  const c = claimsOr401(req, res); if (!c) return;
  if (!req.file) return res.status(400).json({ ok:false, error:'missing_file' });
  try {
    const form = new FormData();
    form.append('file', new Blob([req.file.buffer]), 'audio.m4a');
    form.append('model', 'gpt-4o-transcribe'); // o 'whisper-1' según tu cuenta
    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: form
    });
    const j = await r.json();
    if (!r.ok) return res.status(500).json({ ok:false, error:'stt_failed', detail:j });
    res.json({ ok:true, text: j.text || j.result || '' });
  } catch (e) {
    res.status(500).json({ ok:false, error:'stt_exception', detail: String(e?.message||e) });
  }
});

// ---- Text chat (mock over Responses API) ----
app.post('/api/chat/text', async (req, res) => {
  const c = claimsOr401(req, res); if (!c) return;
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ ok:false, error:'missing_text' });
  try {
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          "Te llamas Sandra (🇪🇸). Responde claro, profesional, 1 emoji máx si encaja, sin lemas ni saludos largos.",
          `Usuario: ${text}`
        ].join('\n')
      })
    });
    const j = await r.json();
    if (!r.ok) return res.status(500).json({ ok:false, error:'chat_failed', detail:j });
    const reply = j.output_text || j.choices?.[0]?.message?.content || '...';
    res.json({ ok:true, reply });
  } catch (e) {
    res.status(500).json({ ok:false, error:'chat_exception', detail:String(e?.message||e) });
  }
});
