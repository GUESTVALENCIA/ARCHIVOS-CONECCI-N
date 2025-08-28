import dynamic from 'next/dynamic';
import InstallPWAButton from '../../components/InstallPWAButton';

const ChatWidget = dynamic(() => import('../../components/ChatWidget'), { ssr: false });

export default function HeianPage() {
  return (
    <main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <header className="header" style={{ marginTop: 12 }}>
        <h1 style={{ fontWeight: 900, fontSize: 28 }}>Heian · Zen & Mindfulness</h1>
        <InstallPWAButton />
      </header>
      <ChatWidget />
      <p style={{ marginTop: 16, opacity: .6, fontSize: 12 }}>
        Nota: El acceso a voz/avatares depende de tu reserva. Visitantes ven solo texto.
      </p>
    </main>
  );
}
