import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Audio } from 'expo-av';

type Msg = { id: string; role: 'user'|'assistant'; text: string };

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    // empieza sin mensajes predefinidos
  ]);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<Audio.Recording | null>(null);
  const [recording, setRecording] = useState(false);

  const { token } = useAuth();

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(m => [...m, { id: String(Date.now()), role: 'user', text }]);
    setInput('');
    setBusy(true);
    try {
      const r = await api.chatText(text, token);
      setMessages(m => [...m, { id: String(Date.now()+1), role: 'assistant', text: r.reply }]);

      // Voz: TTS stream
      api.playTTS(r.reply, token);
    } finally {
      setBusy(false);
    }
  }

  async function toggleRecord() {
    if (!recording) {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recRef.current = rec;
      setRecording(true);
    } else {
      const rec = recRef.current;
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setRecording(false);
      recRef.current = null;
      if (!uri) return;
      setBusy(true);
      try {
        const text = await api.transcribe(uri, token);
        setMessages(m => [...m, { id: String(Date.now()), role: 'user', text }]);
        const r = await api.chatText(text, token);
        setMessages(m => [...m, { id: String(Date.now()+1), role: 'assistant', text: r.reply }]);
        api.playTTS(r.reply, token);
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <View style={s.wrap}>
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({item}) => (
          <View style={[s.bubble, item.role==='user'? s.user : s.assistant]}>
            <Text style={item.role==='user'? s.userText : s.assistantText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
      <View style={s.row}>
        <TouchableOpacity onPress={toggleRecord} style={[s.mic, recording && s.micRec]}>
          <Text style={{color:'#fff', fontWeight:'900'}}>{recording ? '● REC' : '🎤'}</Text>
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribe aquí…"
          placeholderTextColor="#94a3b8"
          style={s.input}
          editable={!busy}
        />
        <TouchableOpacity onPress={send} style={s.send} disabled={busy || !input.trim()}>
          <Text style={{color:'#fff', fontWeight:'900'}}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex:1, backgroundColor:'#f8fafc' },
  row: { flexDirection:'row', alignItems:'center', padding: 10, backgroundColor:'#fff', gap:8 },
  input: { flex:1, backgroundColor:'#eef2f7', borderRadius:14, paddingHorizontal:14, paddingVertical:12, color:'#0f172a' },
  send: { backgroundColor:'#0ea5e9', paddingHorizontal:16, paddingVertical:12, borderRadius:12 },
  mic: { backgroundColor:'#0ea5e9', borderRadius:12, paddingHorizontal:12, paddingVertical:12 },
  micRec: { backgroundColor:'#ef4444' },
  bubble: { alignSelf:'flex-start', backgroundColor:'#e2e8f0', marginVertical:6, padding:12, borderRadius:14, maxWidth:'85%' },
  user: { alignSelf:'flex-end', backgroundColor:'#0ea5e9' },
  assistant: {},
  userText: { color:'#fff' },
  assistantText: { color:'#0f172a' }
});
