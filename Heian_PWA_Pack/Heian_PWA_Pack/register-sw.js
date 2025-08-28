// Register SW (place in your app bootstrap)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(err => console.log('SW registration failed', err));
  });
}

// PWA install prompt (optional)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.querySelector('[data-install-pwa]');
  if (btn) btn.style.display = 'inline-flex';
  btn?.addEventListener('click', async () => {
    btn.style.display = 'none';
    await deferredPrompt.prompt();
    const outcome = await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
});
