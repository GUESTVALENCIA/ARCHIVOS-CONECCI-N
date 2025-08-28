import { useRef, useState } from 'react';
import { useVoiceEntitlement } from '../hooks/useVoiceEntitlement';
import { startRealtimeViaEphemeral } from '../lib/realtime';

export default function ChatWidget() {
  const { loading, canUseVoice, canShowAvatar } = useVoiceEntitlement();
  const [online, setOnline] = useState(true);
  const [recording, setRecording] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const toggleVoice = async () => {
    if (recording) {
      setRecording(false);
      pcRef.current?.getSenders().forEach(s => s.track?.stop());
      pcRef.current?.close();
      pcRef.current = null;
      return;
    }
    try {
      setRecording(true);
      pcRef.current = await startRealtimeViaEphemeral();
    } catch (e) {
      console.warn(e);
      setRecording(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="header">
        <div className="row">
          <span style={{ fontWeight: 800 }}>Sandra IA · Heian</span>
          <span className={`badge ${online ? 'badge-green' : 'badge-red'}`}>{online ? '🟢 En línea' : '🔴 Sin conexión'}</span>
        </div>
        <div className="row">
          {!loading && canUseVoice && (
            <button className="btn btn-primary" onClick={toggleVoice}>
              {recording ? '🎙️ Grabando' : '🎤 Hablar'}
            </button>
          )}
        </div>
      </div>

      <div className="row" style={{ alignItems: 'flex-start' }}>
        {canShowAvatar && (
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#0EA5E9,#2563EB)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20 }}>🪷</div>
        )}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 12, background:'#f1f5f9' }}>
            <div style={{ fontSize: 14, opacity:.7, marginBottom: 6 }}>Sandra</div>
            <div>Bienvenido a Heian. Escribe o pulsa {canUseVoice ? '🎤 para hablar' : 'en el cuadro de texto'}.</div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <input placeholder="Escribe tu mensaje..." style={{ flex:1, padding:12, borderRadius:12, border:'1px solid #e2e8f0' }} />
            <button className="btn" style={{ background:'#e2e8f0' }}>Enviar</button>
          </div>
        </div>
      </div>

      <audio id="heian-audio" autoPlay />
    </div>
  );
}
