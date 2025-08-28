import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const { apiBase, setApiBase, token, setToken } = useAuth();
  return (
    <View style={s.wrap}>
      <Text style={s.title}>Ajustes</Text>
      <Text style={s.label}>API Base</Text>
      <TextInput value={apiBase} onChangeText={setApiBase} style={s.input} placeholder="https://api.guestsvalencia.es" />
      <Text style={s.label}>Token (Bearer) o dejar vacío para cookie</Text>
      <TextInput value={token||''} onChangeText={setToken} style={s.input} placeholder="(opcional)" />
      <Text style={s.help}>Consejo: si ya tienes cookie HttpOnly de admin/guest, puedes dejar el token vacío.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex:1, padding: 16, backgroundColor:'#fff' },
  title: { fontSize:22, fontWeight:'900', marginBottom:10 },
  label: { fontWeight:'700', marginTop:10, marginBottom:6 },
  input: { backgroundColor:'#eef2f7', borderRadius:12, padding:12 },
  help: { marginTop:10, opacity:.6 }
});
