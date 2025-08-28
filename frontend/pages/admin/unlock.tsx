import dynamic from 'next/dynamic';
const AdminUnlock = dynamic(() => import('../../components/AdminUnlock'), { ssr: false });

export default function UnlockPage() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin:'0 auto' }}>
      <h1 style={{ fontWeight:900, fontSize:24, marginBottom:12 }}>Heian · Admin Unlock</h1>
      <p style={{ opacity:.6, marginBottom:16, fontSize:14 }}>Introduce tu email (whitelist) y el código secreto para habilitar 🎤 y avatar en este dispositivo.</p>
      <AdminUnlock />
      <p style={{ opacity:.5, marginTop:16, fontSize:12 }}>Tip: guarda esta página fuera del menú, por ejemplo en <code>/admin/unlock</code> y no la enlaces públicamente.</p>
    </main>
  );
}
