import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const state = { apiBase: 'https://guestsvalencia.es', token: undefined as string|undefined };
export function configure(apiBase: string, token?: string) { state.apiBase = apiBase; state.token = token; }
function headers(extra: Record<string,string> = {}) {
  return { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}), ...extra };
}

export const api = {
  async chatText(text: string, token?: string) {
    // Trivial: reutiliza Realtime vía text endpoint; backend debe tener /api/chat/text (mock).
    const r = await fetch(`${state.apiBase}/api/chat/text`, {
      method: 'POST',
      headers: headers(),
      credentials: 'include',
      body: JSON.stringify({ text })
    });
    const j = await r.json();
    if (!j?.ok) throw new Error('Chat error');
    return j;
  },

  async transcribe(fileUri: string, token?: string) {
    const form = new FormData();
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    const filename = fileUri.split('/').pop() || 'audio.m4a';
    //@ts-ignore
    form.append('file', { uri: fileUri, name: filename, type: 'audio/m4a' });
    const r = await fetch(`${state.apiBase}/api/stt/transcribe`, {
      method: 'POST',
      headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
      credentials: 'include',
      body: form
    });
    const j = await r.json();
    if (!j?.ok) throw new Error('STT error');
    return j.text as string;
  },

  async playTTS(text: string, token?: string) {
    const r = await fetch(`${state.apiBase}/api/tts/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ text, voice_id: 'Rachel', format: 'audio/mpeg' })
    });
    // stream to file then play
    const tmp = `${FileSystem.cacheDirectory}tts-${Date.now()}.mp3`;
    const b = await r.blob();
    // @ts-ignore
    const reader = new FileReader();
    const toPlay = await new Promise<string>((resolve) => {
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await FileSystem.writeAsStringAsync(tmp, base64, { encoding: FileSystem.EncodingType.Base64 });
        resolve(tmp);
      };
      reader.readAsDataURL(b);
    });
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri: toPlay });
    await sound.playAsync();
  }
};
