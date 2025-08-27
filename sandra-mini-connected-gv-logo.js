/* Sandra Widget · Mini — GV Skin + SVG Logo Support */
(function () {
  const script = document.currentScript || document.querySelector('script[src*="sandra-mini-connected-gv-logo.js"]') || document.querySelector('script[data-sandra-mini]');
  if (!script) { console.warn("[SandraMini GV+Logo] Script tag not found."); return; }
  const cfg = {
    backend: script.dataset.backend || location.origin,
    theme: (script.dataset.theme || "auto").toLowerCase(),
    pills: (script.dataset.pills || "on").toLowerCase() === "on",
    model: script.dataset.model || "gpt-4o-realtime-preview-2024-12-17",
    accent: script.dataset.accent || "#007BFF",
    icon: script.dataset.icon || "💙",                // text/emoji fallback
    iconSrc: script.dataset.iconSrc || "",           // URL to SVG
    position: (script.dataset.position || "right").toLowerCase(), // right | left
    radius: script.dataset.radius || "18px",
    shadow: script.dataset.shadow || "0 18px 35px rgba(0,0,0,.25)",
    logoSize: script.dataset.logoSize || "22",       // px (square)
    badge: (script.dataset.badge || "mini"),         // "mini", "", or custom
  };

  const css = `
  .sandra-mini-btn{position:fixed;${cfg.position==="left"?"left:16px;":"right:16px;"}bottom:16px;width:60px;height:60px;border-radius:999px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;box-shadow:${cfg.shadow};z-index:2147483000;background:${cfg.accent};color:#fff;font-weight:800;font-family:ui-sans-serif,system-ui;transition:transform .18s ease, box-shadow .18s ease;letter-spacing:.2px}
  .sandra-mini-btn:hover{transform:translateY(-1px)}
  .sandra-mini-btn:focus-visible{outline:3px solid rgba(255,255,255,.6);outline-offset:2px}
  .sandra-mini-btn svg{display:block;width:${cfg.logoSize}px;height:${cfg.logoSize}px}
  .sandra-mini-btn .sandra-mini-emoji{font-size:${cfg.logoSize}px;line-height:1}
  .sandra-mini-pop{position:fixed;${cfg.position==="left"?"left:16px;":"right:16px;"}bottom:84px;width:340px;max-width:92vw;background:var(--sandra-bg,#fff);color:var(--sandra-fg,#111);border-radius:${cfg.radius};box-shadow:${cfg.shadow};padding:12px;z-index:2147483000;font:14px/1.45 ui-sans-serif,system-ui;border:1px solid rgba(0,0,0,.06);backdrop-filter:saturate(140%) blur(6px)}
  .sandra-mini-row{display:flex;gap:8px;align-items:center;justify-content:space-between}
  .sandra-mini-title{display:flex;align-items:center;gap:8px;font-weight:800;font-size:14px}
  .sandra-mini-badge{font-size:10px;padding:2px 6px;border-radius:999px;background:rgba(0,0,0,.06)}
  .sandra-mini-pills{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
  .sandra-mini-pill{border:1px solid rgba(0,0,0,.1);padding:6px 8px;border-radius:999px;cursor:pointer;background:transparent}
  .sandra-mini-area{width:100%;min-height:58px;max-height:160px;resize:vertical;padding:10px;border:1px solid rgba(0,0,0,.12);border-radius:12px;background:transparent;color:inherit}
  .sandra-mini-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
  .sandra-mini-ghost{border:1px solid rgba(0,0,0,.12);background:transparent;border-radius:12px;padding:8px 10px;cursor:pointer}
  .sandra-mini-solid{border:none;background:${cfg.accent};color:#fff;border-radius:12px;padding:8px 12px;cursor:pointer;font-weight:700}
  .sandra-mini-small{font-size:11px;opacity:.8}
  .sandra-mini-hide{display:none !important}
  `;
  const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

  // Theme
  const root = document.documentElement;
  function applyTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = cfg.theme === "dark" || (cfg.theme === "auto" && prefersDark);
    root.style.setProperty("--sandra-bg", dark ? "#0b0b0c" : "#ffffff");
    root.style.setProperty("--sandra-fg", dark ? "#f5f6f7" : "#0b0b0c");
  }
  applyTheme();
  if (cfg.theme === "auto" && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  }

  // Elements
  const btn = document.createElement("button");
  btn.className = "sandra-mini-btn"; btn.title = "Hablar con Sandra"; btn.setAttribute("aria-label", "Abrir Sandra");

  // Load SVG logo if provided
  async function loadLogo() {
    if (cfg.iconSrc) {
      try {
        const r = await fetch(cfg.iconSrc, { credentials: "omit", mode: "cors" });
        if (r.ok) {
          const svg = await r.text();
          btn.innerHTML = svg;
          return;
        }
      } catch (_) {}
    }
    btn.innerHTML = `<span class="sandra-mini-emoji">${cfg.icon}</span>`;
  }
  loadLogo();
  document.body.appendChild(btn);

  const pop = document.createElement("div");
  pop.className = "sandra-mini-pop sandra-mini-hide";
  pop.innerHTML = `
    <div class="sandra-mini-row">
      <div class="sandra-mini-title">
        <span id="sandra-mini-title-icon">${cfg.icon}</span> Sandra ${cfg.badge ? `<span class="sandra-mini-badge">${cfg.badge}</span>` : ""}
      </div>
      <div class="sandra-mini-small" id="sandra-mini-status">idle</div>
    </div>
    ${cfg.pills ? (`<div class="sandra-mini-pills">
      <button class="sandra-mini-pill" id="sandra-pill-stt">🎙️ Dictado</button>
      <button class="sandra-mini-pill" id="sandra-pill-voice">🗣️ Voz</button>
      <button class="sandra-mini-pill" id="sandra-pill-avatar">🎬 Avatar</button>
    </div>`) : ""}
    <textarea class="sandra-mini-area" id="sandra-mini-input" placeholder="Escribe o usa Dictado…"></textarea>
    <div class="sandra-mini-actions">
      <button class="sandra-mini-ghost" id="sandra-mini-copy">Copiar</button>
      <button class="sandra-mini-solid" id="sandra-mini-send">Enviar</button>
    </div>
    <div class="sandra-mini-small">Backend: ${cfg.backend}</div>
  `;
  document.body.appendChild(pop);

  // State
  let sttActive = false, sttWS = null, voicePC = null, voiceStream = null, avatarPC = null, outAudio = null;
  function setStatus(text){ const el = document.getElementById("sandra-mini-status"); if (el) el.textContent = text; }

  // Helpers
  const http = { async get(path){ const url = path.startsWith("http") ? path : cfg.backend.replace(/\/$/, "") + path; const r = await fetch(url, { credentials: "include" }); if (!r.ok) throw new Error("HTTP "+r.status); return r.json(); } };
  function wsURL(path){ if (path.startsWith("ws")) return path; const b = new URL(cfg.backend); const proto = b.protocol === "https:" ? "wss:" : "ws:"; const host = b.host; const p = path.startsWith("/") ? path : ("/" + path); return `${proto}//${host}${p}`; }

  // Handlers
  btn.addEventListener("click", () => { pop.classList.toggle("sandra-mini-hide"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.classList.contains("sandra-mini-hide")) pop.classList.add("sandra-mini-hide"); });

  document.getElementById("sandra-mini-copy").addEventListener("click", () => {
    const ta = document.getElementById("sandra-mini-input"); ta.select(); document.execCommand("copy"); setStatus("copiado"); setTimeout(() => setStatus("idle"), 900);
  });
  document.getElementById("sandra-mini-send").addEventListener("click", async () => {
    const ta = document.getElementById("sandra-mini-input"); const text = (ta.value || "").trim();
    if (!text) { setStatus("vacío"); setTimeout(() => setStatus("idle"), 800); return; }
    setStatus("enviando…");
    try {
      await fetch(cfg.backend.replace(/\/$/, "") + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      setStatus("enviado");
    } catch (e) { console.warn("[SandraMini GV+Logo] send error", e); setStatus("error"); } finally { setTimeout(() => setStatus("idle"), 1000); }
  });

  // STT
  async function startDictation(){
    if (sttActive) return; sttActive = true; setStatus("stt…");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recog = new SR(); recog.lang = "es-ES"; recog.interimResults = true; recog.continuous = false;
      recog.onresult = (ev) => { const ta = document.getElementById("sandra-mini-input"); const txt = Array.from(ev.results).map(r=>r[0].transcript).join(" "); ta.value = txt; };
      recog.onend = () => { sttActive = false; setStatus("idle"); };
      recog.onerror = () => { sttActive = false; setStatus("error"); };
      recog.start(); return;
    }
    try {
      sttWS = new WebSocket(wsURL("/ws/stt"));
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(media, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data.size && sttWS && sttWS.readyState === 1) sttWS.send(e.data); };
      sttWS.onmessage = (e) => { try { const data = JSON.parse(e.data); if (data.text) document.getElementById("sandra-mini-input").value = data.text; } catch(_) {} };
      sttWS.onopen = () => mr.start(250);
      sttWS.onclose = () => { try { mr.stop(); } catch(_){} sttActive = false; setStatus("idle"); };
      sttWS.onerror = () => { try { mr.stop(); } catch(_){} sttActive = false; setStatus("error"); };
    } catch (e) { console.warn("[SandraMini GV+Logo] STT error", e); sttActive = false; setStatus("error"); }
  }
  function stopDictation(){ sttActive = false; if (sttWS && sttWS.readyState === 1) sttWS.close(); }

  // Voice
  async function startVoice(){
    setStatus("voz…");
    try {
      const tokenRes = await http.get(`/token/realtime?model=${encodeURIComponent(cfg.model)}`);
      const ephem = tokenRes.client_secret || tokenRes.token;
      if (!ephem) throw new Error("No ephemeral token from /token/realtime");
      const pc = new RTCPeerConnection(); voicePC = pc;
      if (!outAudio) { outAudio = document.createElement("audio"); outAudio.autoplay = true; outAudio.playsInline = true; document.body.appendChild(outAudio); }
      pc.ontrack = (ev) => { outAudio.srcObject = ev.streams[0]; };
      voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceStream.getTracks().forEach(t => pc.addTrack(t, voiceStream));
      const dc = pc.createDataChannel("oai-events"); dc.onmessage = (ev) => console.debug("[SandraMini GV+Logo] Realtime", ev.data);
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false }); await pc.setLocalDescription(offer);
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=" + encodeURIComponent(cfg.model), { method: "POST", headers: { Authorization: "Bearer " + ephem, "Content-Type": "application/sdp" }, body: offer.sdp });
      if (!sdpResponse.ok) throw new Error("Realtime SDP failed " + sdpResponse.status);
      const answerSDP = await sdpResponse.text(); await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });
      setStatus("hablando");
    } catch (e) { console.warn("[SandraMini GV+Logo] Voice error", e); setStatus("error"); }
  }
  async function stopVoice(){ try { if (voicePC) { voicePC.close(); voicePC = null; } if (voiceStream) { voiceStream.getTracks().forEach(t=>t.stop()); voiceStream = null; } } catch(_){} setStatus("idle"); }

  // Avatar
  async function startAvatar(){
    setStatus("avatar…");
    try {
      const { rtcEndpoint, token } = await http.get("/token/avatar");
      if (!rtcEndpoint || !token) throw new Error("Missing rtcEndpoint/token");
      const pc = new RTCPeerConnection(); avatarPC = pc;
      const vid = document.createElement("video"); vid.autoplay = true; vid.playsInline = true; vid.style.width = "100%"; vid.style.borderRadius = "12px";
      pop.appendChild(vid);
      pc.ontrack = (ev) => { vid.srcObject = ev.streams[0]; };
      const offer = await pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true }); await pc.setLocalDescription(offer);
      const r = await fetch(rtcEndpoint, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/sdp" }, body: offer.sdp });
      if (!r.ok) throw new Error("Avatar SDP failed " + r.status);
      const answer = await r.text(); await pc.setRemoteDescription({ type: "answer", sdp: answer });
      setStatus("avatar listo");
    } catch (e) { console.warn("[SandraMini GV+Logo] Avatar error", e); setStatus("error"); }
  }
  async function stopAvatar(){ try { if (avatarPC) { avatarPC.close(); avatarPC = null; } } catch(_){} setStatus("idle"); }

  // Bind pills
  if (cfg.pills) {
    const bind = () => {
      const a = document.getElementById("sandra-pill-stt");
      const b = document.getElementById("sandra-pill-voice");
      const c = document.getElementById("sandra-pill-avatar");
      if (a && !a._bound) { a._bound = true; a.addEventListener("click", () => { if (!sttActive) startDictation(); else stopDictation(); }); }
      if (b && !b._bound) { b._bound = true; b.addEventListener("click", () => { if (!voicePC) startVoice(); else stopVoice(); }); }
      if (c && !c._bound) { c._bound = true; c.addEventListener("click", () => { if (!avatarPC) startAvatar(); else stopAvatar(); }); }
    };
    bind(); setTimeout(bind, 0);
  }

  // Autoplay hint
  window.addEventListener("click", () => { if (outAudio) { outAudio.muted = false; try { outAudio.play(); } catch(_){} } }, { once: true });
})();