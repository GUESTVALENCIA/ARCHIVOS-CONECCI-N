import type { AppProps } from 'next/app'
import { useEffect } from 'react';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Register SW
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(console.warn);
      });
    }
  }, []);

  return <Component {...pageProps} />;
}
