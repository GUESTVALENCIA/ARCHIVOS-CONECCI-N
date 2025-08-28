import { useEffect, useState } from 'react';

type Me = { ok: boolean; role?: string; propertyId?: string; exp?: number; tier?: 'standard' | 'premium' };

export function useVoiceEntitlement() {
  const [loading, setLoading] = useState(true);
  const [canUseVoice, setCanUseVoice] = useState(false);
  const [canShowAvatar, setCanShowAvatar] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('gv.jwt') : null;
        if (!token) {
          if (mounted) { setCanUseVoice(false); setCanShowAvatar(false); setLoading(false); }
          return;
        }
        const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const me: Me = await r.json();
        if (!me?.ok) {
          if (mounted) { setCanUseVoice(false); setCanShowAvatar(false); setLoading(false); }
          return;
        }
        const voice = me.role === 'guest';
        const avatar = voice && me.tier === 'premium';
        if (mounted) {
          setCanUseVoice(voice);
          setCanShowAvatar(avatar);
          setLoading(false);
        }
      } catch {
        if (mounted) { setCanUseVoice(false); setCanShowAvatar(false); setLoading(false); }
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { loading, canUseVoice, canShowAvatar } as const;
}
