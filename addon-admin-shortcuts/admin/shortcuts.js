// Admin Shortcuts (inserta 3 botones en el header del admin)
(function(){
  function pickNav(){
    return document.querySelector('nav, .nav, header .actions, header .row') || document.querySelector('header') || document.body;
  }
  function mkBtn(id, href, label){
    if (document.getElementById(id)) return null;
    const a = document.createElement('a');
    a.id = id; a.href = href; a.textContent = label;
    a.className = 'btn btn-admin';
    a.style.cssText = 'display:inline-flex;align-items:center;gap:.5rem;padding:.6rem .9rem;border:1px solid #2a2a2f;border-radius:12px;background:#0e0e10;color:#eaeaea;text-decoration:none;margin-left:.5rem';
    return a;
  }
  function addCSS(){
    const s = document.createElement('style');
    s.textContent = '.btn-admin:hover{border-color:#3a3a40}';
    document.head.appendChild(s);
  }
  function init(){
    const nav = pickNav(); if (!nav) return;
    addCSS();
    const btn1 = mkBtn('btnPresidente','/admin/modes.html','👑 Presidente (Modos & Memoria)');
    const btn2 = mkBtn('btnLimpieza','/admin/cleaning.html','🧽 Limpieza');
    const btn3 = mkBtn('btnPromptMaestro','#openPrompt','✨ Prompt Maestro');
    if (btn1) nav.appendChild(btn1);
    if (btn2) nav.appendChild(btn2);
    if (btn3){
      btn3.addEventListener('click', function(e){
        e.preventDefault();
        const pub = (location.origin + '/'); // home pública
        window.open(pub + '#openPrompt', '_blank', 'noopener');
      });
      nav.appendChild(btn3);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
