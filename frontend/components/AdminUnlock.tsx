import { useState } from 'react';

export default function AdminUnlock() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
      setMsg('✅ Desbloqueado. Recarga…');
      setTimeout(() => window.location.reload(), 600);
    } catch (e:any) {
      setMsg('❌ ' + (e?.message || 'Error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display:'grid', gap:8, maxWidth:360 }}>
      <input placeholder="Tu email admin" value={email} onChange={e=>setEmail(e.target.value)}
             style={{ padding:12, borderRadius:12, border:'1px solid #e2e8f0' }} />
      <input placeholder="Código secreto" value={code} onChange={e=>setCode(e.target.value)}
             style={{ padding:12, borderRadius:12, border:'1px solid #e2e8f0' }} />
      <button className="btn btn-primary" disabled={busy} type="submit">
        {busy ? '⏳ Desbloqueando…' : '🔓 Desbloquear voz + avatar'}
      </button>
      {msg && <div style={{ fontSize:12, opacity:.7 }}>{msg}</div>}
    </form>
  );
}
