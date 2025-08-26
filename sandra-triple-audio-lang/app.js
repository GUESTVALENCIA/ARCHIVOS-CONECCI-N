// Sandra ProTech – Demo 3 rutas con selector de idioma STT (?lang=)
// NOTA: Cambia YOUR_BACKEND por tu dominio/host del backend

const els = {
  micSelect: document.getElementById('micSelect'),
  outSelectRealtime: document.getElementById('outSelectRealtime'),
  outSelectAvatar: document.getElementById('outSelectAvatar'),
  sttLang: document.getElementById('sttLang'),
  btnInit: document.getElementById('btnInit'),
  initStatus: document.getElementById('initStatus'),

  btnStartSTT: document.getElementById('btnStartSTT'),
  btnStopSTT: document.getElementById('btnStopSTT'),
  sttStatus: document.getElementById('sttStatus'),
  sttTranscript: document.getElementById('sttTranscript'),

  btnStartRT: document.getElementById('btnStartRT'),
  btnStopRT: document.getElementById('btnStopRT'),
  rtStatus: document.getElementById('rtStatus'),
  rtModel: document.getElementById('rtModel'),
  rtAudio: document.getElementById('rtAudio'),

  btnStartAV: document.getElementById('btnStartAV'),
  btnStopAV: document.getElementById('btnStopAV'),
  avStatus: document.getElementById('avStatus'),
  avVideo: document.getElementById('avVideo'),
  avAudio: document.getElementById('avAudio'),
};

document.getElementById('year').textContent = new Date().getFullYear();

const state = {
  baseStream: null, baseTrack: null,
  dictationTrack: null, realtimeTrack: null, avatarTrack: null,
  sttRecorder: null, sttWS: null,
  pcRealtime: null, pcAvatar: null,
  audioSession: 'IDLE',
};

async function listDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const inputs = devices.filter(d => d.kind === 'audioinput');
  const outputs = devices.filter(d => d.kind === 'audiooutput');
  els.micSelect.innerHTML = inputs.map(d=>`<option value="${d.deviceId}">${d.label || 'Mic'}</option>`).join('');
  els.outSelectRealtime.innerHTML = outputs.map(d=>`<option value="${d.deviceId}">${d.label || 'Salida'}</option>`).join('');
  els.outSelectAvatar.innerHTML = outputs.map(d=>`<option value="${d.deviceId}">${d.label || 'Salida'}</option>`).join('');
}

async function initAudio() {
  const micId = els.micSelect.value || undefined;
  state.baseStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: micId ? {exact: micId} : undefined,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      sampleSize: 16
    }
  });
  state.baseTrack = state.baseStream.getAudioTracks()[0];
  state.dictationTrack = state.baseTrack.clone();
  state.realtimeTrack  = state.baseTrack.clone();
  state.avatarTrack    = state.baseTrack.clone();
  els.initStatus.textContent = 'Audio inicializado';
  els.btnInit.disabled = true;
  els.btnStartSTT.disabled = false;
  els.btnStartRT.disabled = false;
  els.btnStartAV.disabled = false;
}

async function setSink(el, deviceId) {
  if (!('setSinkId' in HTMLMediaElement.prototype)) return;
  try { await el.setSinkId(deviceId); } catch(e){ console.warn('setSinkId error', e); }
}

function setSession(newSession) {
  state.audioSession = newSession;
  switch (newSession) {
    case 'REALTIME':
      if (state.sttRecorder) stopSTT();
      els.avAudio.volume = 0.2;
      break;
    case 'AVATAR':
      els.rtAudio.volume = 0.2;
      break;
    case 'STT':
      els.rtAudio.volume = 0.4;
      els.avAudio.volume = 0.4;
      break;
    default:
      els.rtAudio.volume = 1.0;
      els.avAudio.volume = 1.0;
  }
}

// --- STT con idioma forzado (?lang=XX) ---
async function startSTT() {
  if (!state.dictationTrack) return;
  setSession('STT');

  const dictationStream = new MediaStream([state.dictationTrack]);
  state.sttRecorder = new MediaRecorder(dictationStream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 32000 });

  const lang = els.sttLang.value || ''; // '' -> auto
  const wsURL = `wss://YOUR_BACKEND/ws/stt${lang ? ('?lang=' + encodeURIComponent(lang)) : ''}`;
  state.sttWS = new WebSocket(wsURL);
  state.sttWS.binaryType = 'arraybuffer';

  state.sttWS.onopen = () => {
    els.sttStatus.textContent = 'Conectado a STT (' + (lang || 'auto') + ')';
    state.sttRecorder.start(250);
  };
  state.sttWS.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      if (data.text) {
        els.sttTranscript.value += data.text + "\\n";
        els.sttTranscript.scrollTop = els.sttTranscript.scrollHeight;
      }
    } catch(e){ /* ignore */ }
  };
  state.sttWS.onclose = () => els.sttStatus.textContent = 'STT desconectado';
  state.sttWS.onerror = () => els.sttStatus.textContent = 'Error STT';

  state.sttRecorder.ondataavailable = async (e) => {
    if (state.sttWS?.readyState === 1 && e.data.size > 0) {
      const buf = await e.data.arrayBuffer();
      state.sttWS.send(buf);
    }
  };

  els.btnStartSTT.disabled = true;
  els.btnStopSTT.disabled = false;
}

function stopSTT() {
  try { state.sttRecorder?.stop(); } catch {}
  try { state.sttWS?.close(); } catch {}
  state.sttRecorder = null;
  state.sttWS = null;
  els.sttStatus.textContent = 'STT detenido';
  els.btnStartSTT.disabled = false;
  els.btnStopSTT.disabled = true;
  setSession('IDLE');
}

// --- Realtime OpenAI ---
async function startRealtime() {
  if (!state.realtimeTrack) return;
  setSession('REALTIME');

  els.rtStatus.textContent = 'Conectando…';
  const pc = new RTCPeerConnection();
  state.pcRealtime = pc;

  const remoteStream = new MediaStream();
  pc.ontrack = (e) => {
    e.streams[0].getAudioTracks().forEach(t => remoteStream.addTrack(t));
    els.rtAudio.srcObject = remoteStream;
  };

  pc.addTrack(state.realtimeTrack, new MediaStream([state.realtimeTrack]));

  const dc = pc.createDataChannel('events');
  dc.onopen = () => console.log('DC Realtime abierto');

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const model = els.rtModel.value || 'gpt-4o-realtime-preview-2024-12-17';
  const tokenRes = await fetch('https://YOUR_BACKEND/token/realtime', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ model })
  });
  const { client_secret } = await tokenRes.json();

  const sdpRes = await fetch('https://api.openai.com/v1/realtime?model=' + encodeURIComponent(model), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + client_secret.value, 'Content-Type': 'application/sdp' },
    body: offer.sdp
  });
  const answer = await sdpRes.text();
  await pc.setRemoteDescription({ type: 'answer', sdp: answer });

  await setSink(els.rtAudio, els.outSelectRealtime.value);
  els.rtStatus.textContent = 'Conversación conectada';
  els.btnStartRT.disabled = true;
  els.btnStopRT.disabled = false;
}

async function stopRealtime() {
  try { state.pcRealtime?.close(); } catch {}
  state.pcRealtime = null;
  els.rtStatus.textContent = 'Conversación desconectada';
  els.btnStartRT.disabled = false;
  els.btnStopRT.disabled = true;
  setSession('IDLE');
}

// --- Avatar (stub) ---
async function startAvatar() {
  if (!state.avatarTrack) return;
  setSession('AVATAR');
  els.avStatus.textContent = 'Conectando avatar…';

  const dummyStream = new MediaStream([state.avatarTrack]);
  els.avVideo.muted = true;
  els.avVideo.srcObject = dummyStream;
  els.avAudio.srcObject = dummyStream;
  await setSink(els.avAudio, els.outSelectAvatar.value);

  els.avStatus.textContent = 'Avatar (demo) activo';
  els.btnStartAV.disabled = false;
  els.btnStopAV.disabled = false;
}
function stopAvatar() {
  try { state.pcAvatar?.close(); } catch {}
  state.pcAvatar = null;
  els.avStatus.textContent = 'Avatar desconectado';
  els.btnStartAV.disabled = false;
  els.btnStopAV.disabled = true;
  setSession('IDLE');
}

// --- UI events ---
els.btnInit.addEventListener('click', initAudio);
els.btnStartSTT.addEventListener('click', startSTT);
els.btnStopSTT.addEventListener('click', stopSTT);
els.btnStartRT.addEventListener('click', startRealtime);
els.btnStopRT.addEventListener('click', stopRealtime);
els.btnStartAV.addEventListener('click', startAvatar);
els.btnStopAV.addEventListener('click', stopAvatar);

(async () => {
  await navigator.mediaDevices.getUserMedia({audio:true});
  await listDevices();
  els.btnStartSTT.disabled = true;
  els.btnStartRT.disabled = true;
  els.btnStartAV.disabled = true;
})();
