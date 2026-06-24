// src/screens/AuthScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Input, GradButton } from '../components';
import { C, GRAD } from '../theme';

const ROLES = [
  { key: 'admin',   label: 'Msimamizi wa Shule', icon: '👨‍💼' },
  { key: 'mwalimu', label: 'Mwalimu',             icon: '👨‍🏫' },
  { key: 'mzazi',   label: 'Mzazi / Mlezi',       icon: '👨‍👩‍👧' },
];

export default function AuthScreen({ navigation }) {
  const { login, register } = useAuth();
  const [tab,  setTab]   = useState('login');
  const [role, setRole]  = useState(null);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [email,  setEmail]  = useState('');
  const [nywila, setNywila] = useState('');

  // Register fields
  const [jina,    setJina]    = useState('');
  const [rEmail,  setREmail]  = useState('');
  const [simu,    setSimu]    = useState('');
  const [rNywila, setRNywila] = useState('');
  const [confirm, setConfirm] = useState('');

  async function doLogin() {
    if (!email || !nywila) { Alert.alert('Hitilafu', 'Jaza barua pepe na nywila'); return; }
    setLoading(true);
    try {
      const data = await login(email.trim(), nywila);
      if (data.subscribed || data.mtumiaji?.jukumu === 'admin') {
        navigation.replace('Main');
      } else {
        navigation.replace('Subscription');
      }
    } catch (e) {
      Alert.alert('Hitilafu', e.response?.data?.error || 'Imeshindwa kuingia');
    }
    setLoading(false);
  }

  async function doRegister() {
    if (!jina||!rEmail||!rNywila||!confirm) { Alert.alert('Hitilafu', 'Jaza sehemu zote'); return; }
    if (rNywila !== confirm) { Alert.alert('Hitilafu', 'Nywila hazilingani!'); return; }
    if (rNywila.length < 6)  { Alert.alert('Hitilafu', 'Nywila lazima iwe herufi 6+'); return; }
    setLoading(true);
    try {
      await register({ jina, email: rEmail.trim(), nywila: rNywila, jukumu: role, simu });
      Alert.alert('✅ Umesajiliwa!', 'Sasa ingia.', [{ text: 'OK', onPress: () => { setTab('login'); setRole(null); } }]);
    } catch (e) {
      Alert.alert('Hitilafu', e.response?.data?.error || 'Imeshindwa kusajili');
    }
    setLoading(false);
  }

  return (
    <LinearGradient colors={[C.dark, C.dark2]} style={S.bg}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled">
          <View style={S.card}>
            <LinearGradient colors={GRAD} style={S.logo} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={{fontSize:30}}>🎓</Text>
            </LinearGradient>
            <Text style={S.appName}>EduConnect</Text>
            <Text style={S.appSub}>Mfumo wa Elimu Tanzania</Text>

            {/* Tabs */}
            <View style={S.tabs}>
              {['login','register'].map(t => (
                <TouchableOpacity key={t} style={[S.tab, tab===t && S.tabActive]}
                  onPress={() => { setTab(t); setRole(null); }}>
                  <Text style={[S.tabTxt, tab===t && S.tabTxtActive]}>
                    {t==='login' ? '🔑 Ingia' : '✏️ Sajili'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Role selection */}
            {!role ? (
              <View>
                {ROLES.map(r => (
                  <TouchableOpacity key={r.key} style={S.roleBtn} onPress={() => setRole(r.key)}>
                    <Text style={S.roleTxt}>{r.icon}  {r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : tab === 'login' ? (
              <View>
                <TouchableOpacity onPress={() => setRole(null)} style={S.backBtn}>
                  <Text style={S.backTxt}>← Rudi</Text>
                </TouchableOpacity>
                <Text style={S.formTitle}>
                  Ingia kama {ROLES.find(r=>r.key===role)?.label}
                </Text>
                <Input label="📧 Barua Pepe" value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" placeholder="mfano@gmail.com" />
                <Input label="🔒 Nywila" value={nywila} onChangeText={setNywila}
                  secureTextEntry placeholder="••••••••" />
                <GradButton title="Ingia →" onPress={doLogin} loading={loading} />
              </View>
            ) : (
              <View>
                <TouchableOpacity onPress={() => setRole(null)} style={S.backBtn}>
                  <Text style={S.backTxt}>← Rudi</Text>
                </TouchableOpacity>
                <Text style={S.formTitle}>
                  Sajili kama {ROLES.find(r=>r.key===role)?.label}
                </Text>
                <Input label="👤 Jina Kamili" value={jina} onChangeText={setJina} placeholder="Jina lako kamili" />
                <Input label="📧 Barua Pepe" value={rEmail} onChangeText={setREmail}
                  keyboardType="email-address" autoCapitalize="none" placeholder="mfano@gmail.com" />
                <Input label="📞 Simu (hiari)" value={simu} onChangeText={setSimu}
                  keyboardType="phone-pad" placeholder="07XX XXX XXX" />
                <Input label="🔒 Nywila" value={rNywila} onChangeText={setRNywila}
                  secureTextEntry placeholder="Angalau herufi 6" />
                <Input label="🔒 Thibitisha Nywila" value={confirm} onChangeText={setConfirm}
                  secureTextEntry placeholder="Rudia nywila yako" />
                <GradButton title="✅ Sajili Sasa" onPress={doRegister} loading={loading} />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  bg:         { flex: 1 },
  scroll:     { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card:       { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '100%', maxWidth: 400 },
  logo:       { width: 70, height: 70, borderRadius: 18, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  appName:    { fontSize: 22, fontWeight: 'bold', color: C.dark, textAlign: 'center', marginBottom: 3 },
  appSub:     { fontSize: 12, color: C.subtext, textAlign: 'center', marginBottom: 16 },
  tabs:       { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: C.border, marginBottom: 18 },
  tab:        { flex: 1, padding: 10, backgroundColor: '#f8f8f8', alignItems: 'center' },
  tabActive:  { backgroundColor: C.primary },
  tabTxt:     { fontSize: 13, fontWeight: 'bold', color: '#888' },
  tabTxtActive:{ color: '#fff' },
  roleBtn:    { borderWidth: 2, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 8 },
  roleTxt:    { fontSize: 15, color: C.dark },
  backBtn:    { marginBottom: 10 },
  backTxt:    { color: C.primary, fontSize: 13 },
  formTitle:  { fontSize: 15, fontWeight: 'bold', color: C.dark, marginBottom: 14 },
});
