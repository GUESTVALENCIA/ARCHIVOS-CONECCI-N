// Sandra Ultra Front – GuestsValencia
// 3 rutas: STT WS (auto idioma), Realtime (texto+audio), Avatar (stub).
// Cambia YOUR_BACKEND por tu host. Para Netlify, usa HTTPS/WSS.

const els = {
  micSelect: document.getElementById('micSelect'),
  outRealtime: document.getElementById('outRealtime'),
  outAvatar: document.getElementById('outAvatar'),
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
  rtTranscript: document.getElementById('rtTranscript'),

  btnStartAV: document.getElementById('btnStartAV'),
  btnStopAV: document.getElementById('btnStopAV'),
  avStatus: document.getElementById('avStatus'),
  avVideo: document.getElementById('avVideo'),
  avAudio: document.getElementById('avAudio'),
};

document.getElementById('year').textContent = new Date().getFullYear();

const BACKEND = 'https://YOUR_BACKEND'; // TODO: cambia por tu dominio
const state = {
  baseStream: null, baseTrack: null,
  tDict: null, tReal: null, tAv: null,
  sttRecorder: null, sttWS: null,
  pcRT: null, dcRT: null,
  pcAV: null,
};

async function listDevices() {
  const devs = await navigator.mediaDevices.enumerateDevices();
  const ins = devs.filter(d=>d.kind==='audioinput');
  const outs= devs.filter(d=>d.kind==='audiooutput');
  els.micSelect.innerHTML = ins.map(d=>`<option value="${d.deviceId}">${d.label||'Mic'}</option>`).join('');
  els.outRealtime.innerHTML = outs.map(d=>`<option value="${d.deviceId}">${d.label||'Salida'}</option>`).join('');
  els.outAvatar.innerHTML = outs.map(d=>`<option value="${d.deviceId}">${d.label||'Salida'}</option>`).join('');
}

async function initAudio(){
  const micId = els.micSelect.value || undefined;
  const s = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: micId?{exact:micId}:undefined,
      channelCount:1, echoCancellation:true, noiseSuppression:true, autoGainControl:true
    }
  });
  state.baseStream = s;
  state.baseTrack = s.getAudioTracks()[0];
  state.tDict = state.baseTrack.clone();
  state.tReal = state.baseTrack.clone();
  state.tAv   = state.baseTrack.clone();
  els.initStatus.textContent='Audio inicializado';
  els.btnInit.disabled = true;
  els.btnStartSTT.disabled = false;
  els.btnStartRT.disabled  = false;
  els.btnStartAV.disabled  = false;
}

async function setSink(el, deviceId){
  if (!('setSinkId' in HTMLMediaElement.prototype)) return;
  try { await el.setSinkId(deviceId); } catch(e){ console.warn('setSinkId', e); }
}

// ---------- STT WS (auto idioma en 1er bloque) ----------
async function startSTT(){
  const lang = els.sttLang.value || '';
  const url = `${BACKEND.replace(/\/$/,'')}/ws/stt${lang?`?lang=${encodeURIComponent(lang)}`:''}`.replace('http','ws');
  const ws = new WebSocket(url);
  state.sttWS = ws;
  ws.binaryType='arraybuffer';

  const dictStream = new MediaStream([state.tDict]);
  const rec = new MediaRecorder(dictStream,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:32000});
  state.sttRecorder = rec;

  ws.onopen = ()=>{ els.sttStatus.textContent='STT conectado'; rec.start(250); };
  ws.onmessage = ev=>{
    try{ const d=JSON.parse(ev.data);
      if (d.text){ els.sttTranscript.value += d.text + "\n"; els.sttTranscript.scrollTop=els.sttTranscript.scrollHeight; }
      if (d.langAuto){ els.sttStatus.textContent='Idioma detectado: '+d.langAuto; }
    }catch{}
  };
  ws.onclose = ()=> els.sttStatus.textContent='STT desconectado';
  ws.onerror = ()=> els.sttStatus.textContent='Error STT';

  rec.ondataavailable = async e=>{
    if (ws.readyState===1 && e.data.size>0){
      const buf = await e.data.arrayBuffer(); ws.send(buf);
    }
  };

  els.btnStartSTT.disabled=true; els.btnStopSTT.disabled=false;
}
function stopSTT(){
  try{ state.sttRecorder?.stop(); }catch{}
  try{ state.sttWS?.close(); }catch{}
  state.sttRecorder=null; state.sttWS=null;
  els.sttStatus.textContent='STT detenido';
  els.btnStartSTT.disabled=false; els.btnStopSTT.disabled=true;
}

// ---------- Realtime (texto + audio en el mismo PC) ----------
async function startRT(){
  els.rtStatus.textContent='Conectando…';
  const pc = new RTCPeerConnection();
  state.pcRT = pc;

  // salida de audio
  const remote = new MediaStream();
  pc.ontrack = e=>{
    e.streams[0].getAudioTracks().forEach(t=>remote.addTrack(t));
    els.rtAudio.srcObject = remote;
  };
  await setSink(els.rtAudio, els.outRealtime.value);

  // datachannel para transcripciones y eventos
  const dc = pc.createDataChannel('events');
  state.dcRT = dc;
  dc.onopen = ()=> console.log('DC abierto');
  dc.onmessage = (ev)=>{
    // Esperamos eventos tipo {type:"transcript", text:"...", language:"es"}
    try{
      const msg = JSON.parse(ev.data);
      if (msg.type==='transcript' && msg.text){
        els.rtTranscript.value += msg.text + "\n";
        els.rtTranscript.scrollTop = els.rtTranscript.scrollHeight;
      }
    }catch{}
  };

  // añadimos nuestro micro
  pc.addTrack(state.tReal, new MediaStream([state.tReal]));
  const offer = await pc.createOffer(); await pc.setLocalDescription(offer);

  // obtener token efímero
  const model = els.rtModel.value || 'gpt-4o-realtime-preview-2024-12-17';
  const tokenRes = await fetch(`${BACKEND}/token/realtime`,{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ model, input_audio: { transcribe: true } }) // el backend puede ignorar campos extra
  });
  const session = await tokenRes.json();
  const clientSecret = session?.client_secret?.value || session?.client_secret || '';

  // enviar SDP a OpenAI Realtime
  const sdpRes = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`, {
    method:'POST',
    headers:{Authorization:'Bearer '+clientSecret,'Content-Type':'application/sdp'},
    body: offer.sdp
  });
  const answer = await sdpRes.text();
  await pc.setRemoteDescription({type:'answer', sdp:answer});

  els.rtStatus.textContent='Conversación conectada';
  els.btnStartRT.disabled=true; els.btnStopRT.disabled=false;
}
async function stopRT(){
  try{ state.dcRT?.close(); }catch{}
  try{ state.pcRT?.close(); }catch{}
  state.dcRT=null; state.pcRT=null;
  els.rtStatus.textContent='Conversación desconectada';
  els.btnStartRT.disabled=false; els.btnStopRT.disabled=true;
}

// ---------- Avatar (stub) ----------
async function startAV(){
  const stream = new MediaStream([state.tAv]);
  els.avVideo.muted = true;
  els.avVideo.srcObject = stream;
  els.avAudio.srcObject = stream;
  await setSink(els.avAudio, els.outAvatar.value);
  els.avStatus.textContent='Avatar (demo) activo';
  els.btnStartAV.disabled=true; els.btnStopAV.disabled=false;
}
function stopAV(){
  els.avVideo.srcObject=null; els.avAudio.srcObject=null;
  els.btnStartAV.disabled=false; els.btnStopAV.disabled=true;
  els.avStatus.textContent='Avatar desconectado';
}

// ---------- UI ----------
els.btnInit.addEventListener('click', initAudio);
els.btnStartSTT.addEventListener('click', startSTT);
els.btnStopSTT.addEventListener('click', stopSTT);
els.btnStartRT.addEventListener('click', startRT);
els.btnStopRT.addEventListener('click', stopRT);
els.btnStartAV.addEventListener('click', startAV);
els.btnStopAV.addEventListener('click', stopAV);

(async ()=>{
  await navigator.mediaDevices.getUserMedia({audio:true});
  await listDevices();
})();
