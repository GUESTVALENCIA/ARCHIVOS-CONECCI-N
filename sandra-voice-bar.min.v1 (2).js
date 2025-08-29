(function(){
  const DEFAULTS={
    endpoints:{asrWs:"wss://api.guestsvalencia.es/asr/ws", chatHttp:"https://api.guestsvalencia.es/sandra/chat", ttsWs:null},
    headers:{"Content-Type":"application/json"},
    placeholder:"",
    voiceMode:false,
    autoSendOnTranscription:true,
    onSend:null,
    onTranscription:null,
    onFile:null
  };
  const $=(s,r=document)=>r.querySelector(s);
  const el=(t,o={})=>{const n=document.createElement(t); Object.assign(n,o); return n;};
  class SandraVoiceBar{
    constructor(config={}){
      this.cfg=Object.assign({},DEFAULTS,config||{});
      this.state={recording:false, ws:null, media:null, chunks:[], voiceMode:!!this.cfg.voiceMode, sendMode:false};
      this.root=document.getElementById('sandra-voice-bar-root')||el('div',{id:'sandra-voice-bar-root',className:'sandra-bar-wrap'});
      if(!this.root.parentNode) document.body.appendChild(this.root);
      this.injectStyles();
      this.render(); this.bind(); this.updateVoiceBtn();
    }
    injectStyles(){
      if(document.getElementById('sandra-voice-bar-styles')) return;
      const css=`:root{--sb-bg:#fff;--sb-elev:#fff;--sb-text:#111319;--sb-muted:#8c94a3;--sb-brand:#2B6FFF;--sb-accent:var(--sb-brand);--sb-border:#dce1e8;--radius:999px;--shadow:0 6px 24px rgba(17,19,25,.06)}body{margin:0;background:#fff}.sandra-bar-wrap{position:fixed;left:50%;bottom:20vh;transform:translateX(-50%);z-index:2147483646;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji"}.sandra-bar{display:flex;align-items:center;gap:8px;background:var(--sb-bg);border:1px solid var(--sb-border);border-radius:var(--radius);box-shadow:var(--shadow);padding:6px;width:720px;max-width:92vw}.sandra-iconbtn{height:40px;width:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--sb-bg);border:1px solid var(--sb-border);color:var(--sb-text);cursor:pointer;transition:transform .08s ease,background .2s ease,opacity .2s ease;user-select:none}.sandra-iconbtn:hover{transform:translateY(-1px)}.sandra-iconbtn:active{transform:translateY(0)}.sandra-iconbtn[disabled],.sandra-iconbtn.s-disabled{opacity:.5;cursor:not-allowed}.sandra-iconbtn.s-primary{background:var(--sb-accent);border-color:var(--sb-accent);color:#fff}.sandra-iconbtn.s-primary:hover{filter:brightness(1.05)}.sandra-input{flex:1;min-width:0;height:40px;padding:0 14px;background:var(--sb-bg);border:1px solid var(--sb-border);color:var(--sb-text);outline:none;border-radius:999px;font-size:16px}.s-mic-recording{box-shadow:0 0 0 0 rgba(43,111,255,.7);animation:pulse 1.2s infinite;border-color:rgba(43,111,255,.6)}@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(43,111,255,.65)}70%{box-shadow:0 0 0 12px rgba(43,111,255,0)}100%{box-shadow:0 0 0 0 rgba(43,111,255,0)}}@media (max-width:520px){.sandra-bar-wrap{bottom:12vh}.sandra-bar{width:92vw}}`;
      const style=el('style',{id:'sandra-voice-bar-styles'}); style.textContent=css; document.head.appendChild(style);
    }
    render(){
      this.root.innerHTML='<div class="sandra-bar" role="form" aria-label="Barra de entrada a Sandra">\
<button class="sandra-iconbtn" id="sandra-plus" aria-label="Adjuntar">'+this.svgPlus()+'</button>\
<input class="sandra-input" id="sandra-input" type="text" placeholder="'+(this.cfg.placeholder||'')+'" aria-label="Mensaje"/>\
<button class="sandra-iconbtn" id="sandra-mic" aria-label="Hablar">'+this.svgMic()+'</button>\
<button class="sandra-iconbtn" id="sandra-voice" aria-pressed="'+this.state.voiceMode+'">'+this.svgEq()+'</button>\
</div>';
      this.fileInput=this.fileInput||el('input',{type:'file',accept:'audio/*,image/*,video/*,application/pdf,.doc,.docx,.txt',style:'display:none'});
      this.root.appendChild(this.fileInput);
    }
    bind(){
      this.ui={plus:$('#sandra-plus',this.root),input:$('#sandra-input',this.root),mic:$('#sandra-mic',this.root),voice:$('#sandra-voice',this.root)};
      this.ui.plus.addEventListener('click',()=>this.fileInput.click());
      this.fileInput.addEventListener('change',(e)=>{const f=e.target.files&&e.target.files[0]; if(!f)return; if(typeof this.cfg.onFile==='function') this.cfg.onFile(f);});
      this.ui.input.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); this.sendText();}});
      this.ui.input.addEventListener('input',()=>this.updateVoiceBtn());
      this.ui.mic.addEventListener('click',()=>this.toggleMic());
      this.ui.voice.addEventListener('click',()=>{ if(this.state.sendMode){ this.sendText(); return; } this.state.voiceMode=!this.state.voiceMode; this.ui.voice.setAttribute('aria-pressed',String(this.state.voiceMode)); this.ui.voice.classList.toggle('s-primary',this.state.voiceMode); });
    }
    async toggleMic(){
      if(this.state.recording){ this.stopRecording(); return; }
      try{ this.state.media=await navigator.mediaDevices.getUserMedia({audio:true}); }catch(_){ return; }
      this.startRecording();
    }
    startRecording(){
      if(this.state.recording) return;
      const stream=this.state.media;
      const mime=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
      const rec=new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:48000});
      this.rec=rec; this.state.chunks=[]; this.state.recording=true; this.ui.mic.classList.add('s-mic-recording'); this.ui.mic.setAttribute('aria-label','Grabando… pulsa para enviar');
      let ws; try{ ws=new WebSocket(this.cfg.endpoints.asrWs);}catch(_){ } this.state.ws=ws;
      rec.ondataavailable=(ev)=>{ if(ev.data&&ev.data.size>0){ this.state.chunks.push(ev.data); if(ws&&ws.readyState===1){ ws.send(ev.data); } } };
      rec.onstop=()=>{ this.ui.mic.classList.remove('s-mic-recording'); if(ws&&ws.readyState===1){ try{ ws.send(JSON.stringify({event:'end'})); }catch(_){} } };
      if(ws){ ws.onmessage=(ev)=>{ try{ const msg=JSON.parse(ev.data); if(msg&&msg.text){ if(typeof this.cfg.onTranscription==='function') this.cfg.onTranscription(msg.text); if(this.cfg.autoSendOnTranscription){ this.ui.input.value=msg.text; this.updateVoiceBtn(); this.sendText(); } } }catch(_){ } }; }
      rec.start(250); this.updateVoiceBtn();
    }
    stopRecording(){
      if(!this.state.recording) return; this.state.recording=false;
      try{ this.rec&&this.rec.state!=='inactive'&&this.rec.stop(); }catch(_){}
      try{ this.state.media&&this.state.media.getTracks().forEach(t=>t.stop()); }catch(_){}
      try{ this.state.ws&&this.state.ws.readyState===1&&this.state.ws.close(); }catch(_){}
      this.ui.mic.setAttribute('aria-label','Hablar');
    }
    async sendText(){
      const text=(this.ui.input.value||'').trim(); if(!text) return;
      this.ui.input.value=''; this.updateVoiceBtn();
      const payload={message:text, meta:{source:'voice-bar', ts:Date.now()}};
      if(typeof this.cfg.onSend==='function'){ try{ await this.cfg.onSend(payload);}catch(_){ } return;}
      try{
        const res=await fetch(this.cfg.endpoints.chatHttp,{method:'POST',headers:this.cfg.headers,body:JSON.stringify(payload)});
        if(!res.ok) throw new Error('HTTP '+res.status);
        const data=await res.json().catch(()=>({}));
        if(this.state.voiceMode){ const audioUrl=data&&(data.audioUrl||(data.result&&data.result.audioUrl)); if(audioUrl){ try{ new Audio(audioUrl).play(); }catch(_){} } }
      }catch(_){ }
    }
    updateVoiceBtn(){
      const hasText=(this.ui?.input?.value||'').trim().length>0; this.state.sendMode=hasText; if(!this.ui?.voice) return;
      if(hasText){ this.ui.voice.innerHTML=this.svgSend(); this.ui.voice.setAttribute('aria-label','Enviar'); this.ui.voice.classList.add('s-primary'); }
      else { this.ui.voice.innerHTML=this.svgEq(); this.ui.voice.setAttribute('aria-label','Usar modo de voz'); this.ui.voice.classList.toggle('s-primary',this.state.voiceMode); }
    }
    svgPlus(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="var(--sb-accent)" stroke-width="2" stroke-linecap="round"/></svg>'; }
    svgMic(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" stroke="var(--sb-accent)" stroke-width="2"/><path d="M19 11a7 7 0 0 1-14 0" stroke="var(--sb-accent)" stroke-width="2" stroke-linecap="round"/><path d="M12 18v3" stroke="var(--sb-accent)" stroke-width="2" stroke-linecap="round"/></svg>'; }
    svgEq(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 4v16M12 8v8M18 2v20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
    svgSend(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 2L15 22l-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="2" fill="none"/></svg>'; }
  }
  window.SandraVoiceBar=SandraVoiceBar;
  window.addEventListener('DOMContentLoaded',()=>{ window.sandraVoiceBar=new SandraVoiceBar(); });
})();