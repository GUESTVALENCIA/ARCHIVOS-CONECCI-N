const WS_ASR_URL = import.meta.env.VITE_ASR_WS_URL;
const CHAT_API_URL = import.meta.env.VITE_CHAT_HTTP_URL;

export function initVoiceChat(micButtonSelector, ui) {
  const micBtn = document.querySelector(micButtonSelector);
  if (!micBtn) return;

  let mediaStream, mediaRecorder, ws;

  async function start() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      ui?.onError?.('Permiso de micrófono denegado');
      return;
    }

    ws = new WebSocket(WS_ASR_URL);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 24000 });
      mediaRecorder.ondataavailable = (e) => { if (e.data?.size) ws.send(e.data); };
      mediaRecorder.start(250);
      micBtn.classList.add('recording');
      ui?.onRecordingStart?.();
    };

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      if (data.partial) ui?.onPartial?.(data.partial);
      if (data.text) {
        stop();
        ui?.onTranscript?.(data.text);
        try {
          const r = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.text })
          });
          const out = await r.json();
          ui?.onReply?.(out.reply);
        } catch (e) {
          ui?.onError?.('Error al contactar con Sandra');
        }
      }
    };

    ws.onerror = () => { stop(); ui?.onError?.('Error de ASR'); };
    ws.onclose  = () => { stop(); };
  }

  function stop() {
    try { mediaRecorder && mediaRecorder.state !== 'inactive' && mediaRecorder.stop(); } catch {}
    try { mediaStream && mediaStream.getTracks().forEach(t => t.stop()); } catch {}
    try { ws && ws.readyState === 1 && ws.close(); } catch {}
    micBtn.classList.remove('recording');
    ui?.onRecordingStop?.();
  }

  micBtn.addEventListener('click', () => {
    if (!micBtn.classList.contains('recording')) start();
    else stop();
  });
}
