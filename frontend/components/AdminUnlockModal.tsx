import { useEffect, useState } from 'react';

type Props = { open: boolean; onClose: () => void };

export default function AdminUnlockModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/auth/admin-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || 'error');
      setMsg('✅ Desbloqueado. Recargando…');
      setTimeout(() => window.location.reload(), 500);
    } catch (e:any) {
      setMsg('❌ ' + (e?.message || 'Error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose} aria-modal="true" role="dialog">
      <div style={styles.modal} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0,fontWeight:800}}>Heian · Admin Unlock</h3>
          <button onClick={onClose} style={styles.iconBtn} aria-label="Cerrar">✖</button>
        </div>
        <p style={{opacity:.6,marginTop:8, marginBottom:12,fontSize:14}}>Introduce tu email (whitelist) y el código secreto para habilitar 🎤 y avatar en este dispositivo.</p>
        <form onSubmit={submit} style={{ display:'grid', gap:10 }}>
          <input placeholder="Tu email admin"
                 value={email}
                 onChange={e=>setEmail(e.target.value)}
                 style={styles.input} />
          <input placeholder="Código secreto"
                 value={code}
                 onChange={e=>setCode(e.target.value)}
                 style={styles.input} />
          <button className="btn btn-primary" disabled={busy} type="submit">
            {busy ? '⏳ Desbloqueando…' : '🔓 Desbloquear voz + avatar'}
          </button>
        </form>
        {msg && <div style={{ fontSize:12, opacity:.8, marginTop:10 }}>{msg}</div>}
        <p style={{opacity:.45,marginTop:12,fontSize:12}}>Atajo: <code>Ctrl</code>+<code>Shift</code>+<code>U</code> abre/cierra este modal en cualquier página.</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: { position:'fixed', inset:0, background:'rgba(2,6,23,.6)', display:'grid', placeItems:'center', zIndex:9999 },
  modal: { width:'min(92vw,480px)', background:'#fff', borderRadius:16, padding:16, boxShadow:'0 20px 60px rgba(2,6,23,.25)' },
  input: { padding:12, borderRadius:12, border:'1px solid #e2e8f0' },
  iconBtn:{ background:'#e2e8f0', border:0, borderRadius:10, padding:'6px 10px', cursor:'pointer' },
};
