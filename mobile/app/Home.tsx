import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Home({ navigation }: any) {
  return (
    <View style={s.wrap}>
      <StatusBar style="light" />
      <Text style={s.title}>Sandra · Personal</Text>
      <Text style={s.subtitle}>Chat + Voz + Avatar (privado)</Text>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Chat')}>
        <Text style={s.btnText}>Entrar al chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={() => navigation.navigate('Settings')}>
        <Text style={s.btnTextGhost}>Ajustes</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: '#fff', opacity: .9, marginBottom: 24 },
  btn: { backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, width: 220, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#0ea5e9', fontWeight: '800' },
  btnGhost: { backgroundColor: 'rgba(255,255,255,.2)', borderWidth: 2, borderColor: '#fff' },
  btnTextGhost: { color: '#fff', fontWeight: '800' },
});
