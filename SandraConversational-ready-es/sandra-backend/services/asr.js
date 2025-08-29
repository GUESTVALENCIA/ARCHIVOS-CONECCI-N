import { EventEmitter } from 'events';

// Stub de ASR: concatena audio y devuelve un texto de ejemplo.
// Reemplaza createAsrSession() para integrar Whisper/API real.
export function createAsrSession() {
  const ee = new EventEmitter();
  const buffers = [];

  return {
    async push(chunk) {
      buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    },
    getPartial() { return null; },
    onFinal(cb) { ee.on('final', cb); },
    close() {
      const audio = Buffer.concat(buffers);
      // TODO: enviar `audio` a tu ASR y obtener transcripción real
      const text = '(transcripción de ejemplo)';
      setTimeout(() => ee.emit('final', text), 120);
    }
  };
}
