
(function(){
  window.GV = window.GV || {};
  const C = window.GV_CONFIG || {};
  GV.wa = function(number, text){
    const n = (number||C.WHATSAPP_MAIN||'').replace(/\D/g,'');
    return 'https://wa.me/' + n + (text ? ('?text=' + encodeURIComponent(text)) : '');
  };
  GV.loadListings = async function(){
    try{
      const r = await fetch('/data/listings.json', {cache:'no-store'});
      return await r.json();
    }catch(e){ console.warn('No listings', e); return []; }
  };
  GV.card = function(x){
    return `<a class="card" href="/checkout.html?lid=${encodeURIComponent(x.id)}">
      <img src="${x.cover}" alt="${x.title}"/>
      <div class="pad">
        <div class="pill">${x.area} · ${x.summary}</div>
        <strong>${x.title}</strong>
        <span class="ghost">${(x.amenities||[]).join(' · ')}</span>
      </div>
    </a>`;
  };
})();
