import { useEffect, useState } from 'react';

export default function InstallPWAButton() {
  const [supportsInstall, setSupportsInstall] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setSupportsInstall(true);
    };
    (window as any).deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onInstall = async () => {
    if (!deferred) return;
    setSupportsInstall(false);
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  if (!supportsInstall) return null;

  return (
    <button className="btn btn-primary" onClick={onInstall}>
      ⬇️ Instalar app
    </button>
  );
}
