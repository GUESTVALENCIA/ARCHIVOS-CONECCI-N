import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export function useAuth() {
  const [apiBase, setApiBaseState] = useState('https://guestsvalencia.es');
  const [token, setTokenState] = useState<string|undefined>(undefined);

  useEffect(() => {
    (async () => {
      const ab = await SecureStore.getItemAsync('apiBase');
      const tk = await SecureStore.getItemAsync('token');
      if (ab) setApiBaseState(ab);
      if (tk) setTokenState(tk);
    })();
  }, []);

  const setApiBase = async (v: string) => {
    setApiBaseState(v);
    await SecureStore.setItemAsync('apiBase', v);
  };
  const setToken = async (v: string) => {
    setTokenState(v);
    if (v) await SecureStore.setItemAsync('token', v);
    else await SecureStore.deleteItemAsync('token');
  };

  return { apiBase, setApiBase, token, setToken } as const;
}
