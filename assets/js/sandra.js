// Sandra UI lightweight – compatible con window.SANDRA_CONFIG
const SANDRA_API_URL=(window.SANDRA_CONFIG&&window.SANDRA_CONFIG.API_URL)||'';
const SANDRA_API_KEY=(window.SANDRA_CONFIG&&window.SANDRA_CONFIG.API_KEY)||'';
const AVATAR_IFRAME_URL=(window.SANDRA_CONFIG&&window.SANDRA_CONFIG.AVATAR_IFRAME_URL)||'about:blank';

const SandraUI={
  show(tab){
    document.getElementById('panel-text').style.display  = (tab === 'text') ? 'block' : 'none';
    document.getElementById('panel-voice').style.display = (tab === 'voice') ? 'block' : 'none';
    document.getElementById('panel-avatar').style.display= (tab === 'avatar')? 'block' : 'none';
  },
  log(role,text){
    const el=document.getElementById('chat-log');
    if(!el) return;
    const line=document.createElement('div');
    line.style.marginBottom='6px';
    line.innerHTML=`<strong>${role}:</strong> ${text}`;
    el.appendChild(line); el.scrollTop=el.scrollHeight;
  },
  setVoice(text){ const s=document.getElementById('voice-status'); if(s) s.textContent=text||''; }
};

const SandraAPI={
  async sendText(){
    const input=document.getElementById('chat-input'); if(!input) return;
    const msg=(input.value||'').trim(); if(!msg) return; input.value='';
    SandraUI.log('Tú', msg);
    try{
      const r=await fetch(`${SANDRA_API_URL}/chat`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${SANDRA_API_KEY}`},
        body: JSON.stringify({message: msg})
      });
      if(!r.ok) throw new Error('HTTP '+r.status);
      const data=await r.json(); const reply=data.reply||'(respuesta)';
      SandraUI.log('Sandra', reply); this.playTTS(reply);
    }catch(e){
      const demo='Hola 👋 Soy Sandra en modo demo. El backend no respondió o la API key no es válida.';
      SandraUI.log('Sandra', demo); this.playTTS(demo);
    }
  },
  _m:{rec:null,chunks:[]},
  async startVoice(){
    SandraUI.setVoice('Preparando micrófono...');
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const rec=new MediaRecorder(stream); this._m.rec=rec; this._m.chunks=[];
      rec.ondataavailable=e=>this._m.chunks.push(e.data);
      rec.onstop=async()=>{
        const blob=new Blob(this._m.chunks,{type:'audio/webm'});
        SandraUI.setVoice('Enviando audio...');
        try{
          const form=new FormData(); form.append('audio', blob, 'input.webm');
          const r=await fetch(`${SANDRA_API_URL}/speech`,{method:'POST',headers:{'Authorization':`Bearer ${SANDRA_API_KEY}`},body:form});
          if(!r.ok) throw new Error('HTTP '+r.status);
          const data=await r.json(); const txt=data.text||'(texto)'; const reply=data.reply||'(respuesta voz)';
          SandraUI.log('Tú (voz→texto)', txt); SandraUI.log('Sandra', reply); this.playTTS(reply); SandraUI.setVoice('Listo.');
        }catch(e){ SandraUI.setVoice('Modo demo: sin backend de voz.'); this.playTTS('Modo demo de voz.'); }
      };
      rec.start(); SandraUI.setVoice('Grabando... suelta para enviar.');
    }catch(e){ SandraUI.setVoice('Permiso de micrófono denegado o error.'); }
  },
  stopVoice(){ const r=this._m.rec; if(r&&r.state!=='inactive'){ r.stop(); SandraUI.setVoice('Procesando audio...'); } },
  playTTS(text){ try{ if(!('speechSynthesis' in window)) return; const u=new SpeechSynthesisUtterance(text); u.lang='es-ES'; speechSynthesis.cancel(); speechSynthesis.speak(u);}catch{} },
  loadAvatar(){ const iframe=document.getElementById('avatar-frame'); if(iframe) iframe.src=AVATAR_IFRAME_URL; },
  sendAvatarCommand(cmd){ const iframe=document.getElementById('avatar-frame'); if(iframe&&iframe.contentWindow){ iframe.contentWindow.postMessage({type:'sandra-command',command:cmd},'*'); } }
};
window.SandraAPI=SandraAPI; window.SandraUI=SandraUI;
