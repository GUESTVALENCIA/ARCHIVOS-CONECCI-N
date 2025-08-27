const SANDRA_API_URL=window.SANDRA_API_URL||'https://api.sandra.local';
const SANDRA_API_KEY=window.SANDRA_API_KEY||'REPLACE_ME';
const AVATAR_IFRAME_URL=window.AVATAR_IFRAME_URL||'about:blank';

const SandraUI={
  show(tab){
    document.getElementById('panel-text').style.display  = (tab === 'text') ? 'block' : 'none';
    document.getElementById('panel-voice').style.display = (tab === 'voice') ? 'block' : 'none';
    document.getElementById('panel-avatar').style.display= (tab === 'avatar')? 'block' : 'none';
  },
  log(role, text){
    const el=document.getElementById('chat-log');
    const line=document.createElement('div');
    line.style.marginBottom='6px';
    line.innerHTML=`<strong>${role}:</strong> ${text}`;
    el.appendChild(line); el.scrollTop=el.scrollHeight;
  },
  setVoiceStatus(text){ document.getElementById('voice-status').textContent = text || ''; }
};

const SandraAPI={
  async sendText(){
    const input=document.getElementById('chat-input'); const msg=input.value.trim();
    if(!msg) return; SandraUI.log('Tú', msg); input.value='';
    try{
      const res=await fetch(`${SANDRA_API_URL}/chat`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${SANDRA_API_KEY}`},
        body: JSON.stringify({message: msg})
      });
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data=await res.json();
      const reply=data.reply || '(respuesta)';
      SandraUI.log('Sandra', reply);
      this.playTTS(reply);
    }catch(e){
      const demo='Hola 👋 Soy Sandra en modo demo. Configura SANDRA_API_URL y API Key para conexión real.';
      SandraUI.log('Sandra', demo);
      this.playTTS(demo);
    }
  },
  _media:{rec:null,chunks:[]},
  async startVoice(){
    SandraUI.setVoiceStatus('Preparando micrófono...');
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const rec=new MediaRecorder(stream); this._media.rec=rec; this._media.chunks=[];
      rec.ondataavailable=e=>this._media.chunks.push(e.data);
      rec.onstop=async()=>{
        const blob=new Blob(this._media.chunks,{type:'audio/webm'});
        SandraUI.setVoiceStatus('Enviando audio...');
        try{
          const form=new FormData(); form.append('audio', blob, 'input.webm');
          const res=await fetch(`${SANDRA_API_URL}/speech`, {method:'POST', headers:{'Authorization':`Bearer ${SANDRA_API_KEY}`}, body: form});
          if(!res.ok) throw new Error('HTTP '+res.status);
          const data=await res.json(); const text=data.text||'(texto)'; const reply=data.reply||'(respuesta voz)';
          SandraUI.log('Tú (voz→texto)', text); SandraUI.log('Sandra', reply); this.playTTS(reply); SandraUI.setVoiceStatus('Listo.');
        }catch(e){
          SandraUI.setVoiceStatus('Demo voz. Conecta backend para respuesta real.');
          this.playTTS('Modo demo de voz activado.');
        }
      };
      rec.start(); SandraUI.setVoiceStatus('Grabando... suelta para enviar.');
    }catch(e){ SandraUI.setVoiceStatus('Permiso de micrófono denegado o error.'); }
  },
  stopVoice(){ const rec=this._media.rec; if(rec && rec.state!=='inactive'){ rec.stop(); SandraUI.setVoiceStatus('Procesando audio...'); } },
  playTTS(text){ try{ if(!('speechSynthesis' in window)) return; const u=new SpeechSynthesisUtterance(text); u.lang='es-ES'; speechSynthesis.cancel(); speechSynthesis.speak(u);}catch{} },
  loadAvatar(){ const iframe=document.getElementById('avatar-frame'); iframe.src=AVATAR_IFRAME_URL; },
  sendAvatarCommand(cmd){ const iframe=document.getElementById('avatar-frame'); if(!iframe.contentWindow)return; iframe.contentWindow.postMessage({type:'sandra-command',command:cmd},'*'); }
};
window.SandraAPI=SandraAPI; window.SandraUI=SandraUI;
