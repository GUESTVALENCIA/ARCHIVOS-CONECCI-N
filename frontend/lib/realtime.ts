export async function startRealtimeViaEphemeral() {
  const sess = await fetch('/api/realtime/session', { method: 'POST', headers: authHeader() }).then(r => r.json());
  const EPHEMERAL = sess?.client_secret?.value;
  if (!EPHEMERAL) throw new Error('No client_secret in session response');

  const pc = new RTCPeerConnection();
  const audioEl = document.getElementById('heian-audio') as HTMLAudioElement | null;
  pc.ontrack = (e) => { if (audioEl) audioEl.srcObject = e.streams[0]; };

  const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
  mic.getTracks().forEach(t => pc.addTrack(t, mic));
  const offer = await pc.createOffer({ offerToReceiveAudio: true });
  await pc.setLocalDescription(offer);

  const MODEL = 'gpt-4o-realtime-preview-2024-12-17';
  const resp = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(MODEL)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${EPHEMERAL}`,
      'Content-Type': 'application/sdp',
      Accept: 'application/sdp',
    },
    body: offer.sdp || ''
  });
  const answer = await resp.text();
  await pc.setRemoteDescription({ type: 'answer', sdp: answer });
  return pc;
}

function authHeader() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('gv.jwt') : null;
  return t ? { 'Authorization': `Bearer ${t}` } : {};
}
