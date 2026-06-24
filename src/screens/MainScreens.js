// src/screens/MainScreens.js
// All main app screens in one file

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, TextInput, Alert, Modal, RefreshControl,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TopBar, GradButton, Card, Avatar, Badge, EmptyState, Loader, Input, StepBox } from '../components';
import { C, GRAD, MADARASA, D_COLORS, D_ICONS, PAY_NUMBERS } from '../theme';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ================================================================
// WANAFUNZI - CHAGUA DARASA
// ================================================================
export function WanafunziDarasaScreen({ navigation }) {
  const [madarasa, setMadarasa] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get('/api/wanafunzi/madarasa');
      setMadarasa(res.data.madarasa);
    } catch {}
    setLoading(false);
  }

  return (
    <View style={{flex:1, backgroundColor:C.bg}}>
      <TopBar title="👨‍🎓 Wanafunzi" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding:14}}>
        <Text style={S.pickTitle}>📚 Chagua Darasa</Text>
        {loading ? <Loader /> : (
          <View style={S.darasaGrid}>
            {MADARASA.map((d, i) => {
              const info = madarasa.find(m => m.jina === d) || { jumla:0 };
              return (
                <TouchableOpacity key={d} style={[S.darasaBox, {borderColor: D_COLORS[i]+'50'}]}
                  onPress={() => navigation.navigate('WanafunziList', { darasa: d, color: D_COLORS[i] })}>
                  <Text style={S.darasaIcon}>{D_ICONS[i]}</Text>
                  <Text style={[S.darasaName, {color: D_COLORS[i]}]}>{d}</Text>
                  <Text style={S.darasaCount}>{info.jumla} wanafunzi</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ================================================================
// WANAFUNZI - ORODHA YA DARASA
// ================================================================
export function WanafunziListScreen({ navigation, route }) {
  const { darasa, color } = route.params;
  const [wanafunzi, setWanafunzi] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jina, setJina] = useState('');
  const [namba, setNamba] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/api/wanafunzi?darasa_jina=${encodeURIComponent(darasa)}`);
      setWanafunzi(res.data.wanafunzi);
    } catch {}
    setLoading(false);
  }

  async function addStudent() {
    if (!jina || !namba) { Alert.alert('Hitilafu', 'Jaza jina na namba'); return; }
    setSaving(true);
    try {
      const dRes = await api.get('/api/wanafunzi/madarasa');
      const d = dRes.data.madarasa.find(m => m.jina === darasa);
      await api.post('/api/wanafunzi', { jina, namba_usajili: namba, darasa_id: d.id });
      Alert.alert('✅', 'Mwanafunzi ameongezwa!');
      setModal(false); setJina(''); setNamba('');
      load();
    } catch (e) {
      Alert.alert('Hitilafu', e.response?.data?.error || 'Imeshindwa');
    }
    setSaving(false);
  }

  const filtered = wanafunzi.filter(s =>
    s.jina.toLowerCase().includes(search.toLowerCase()) ||
    s.namba_usajili.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{flex:1, backgroundColor:C.bg}}>
      <TopBar title={darasa} onBack={() => navigation.goBack()} />
      <View style={[S.classHeader, {backgroundColor: color}]}>
        <Text style={{fontSize:28}}>🏫</Text>
        <View>
          <Text style={S.classHeaderName}>{darasa}</Text>
          <Text style={S.classHeaderCount}>{wanafunzi.length} wanafunzi</Text>
        </View>
      </View>
      <View style={S.searchRow}>
        <TextInput style={S.searchInput} placeholder="🔍 Tafuta mwanafunzi..."
          value={search} onChangeText={setSearch} />
        <TouchableOpacity style={S.addBtn} onPress={() => setModal(true)}>
          <Text style={{color:'#fff',fontSize:22,fontWeight:'bold'}}>+</Text>
        </TouchableOpacity>
      </View>
      {loading ? <Loader /> : (
        <FlatList
          data={filtered}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={{padding:14, paddingBottom:100}}
          ListEmptyComponent={<EmptyState text="Hakuna wanafunzi katika darasa hili" />}
          renderItem={({item:s}) => (
            <Card style={{flexDirection:'row', alignItems:'center', gap:12}}>
              <Avatar name={s.jina} />
              <View style={{flex:1}}>
                <Text style={S.sName}>{s.jina}</Text>
                <Text style={S.sSub}>{s.namba_usajili} • {s.darasa_jina}</Text>
              </View>
              {s.mzazi_simu && <Text style={{fontSize:11,color:C.subtext}}>📞 {s.mzazi_simu}</Text>}
            </Card>
          )}
        />
      )}

      {/* Add Student Modal */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={S.modalBg}>
          <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'}>
            <View style={S.modalCard}>
              <Text style={S.modalTitle}>➕ Ongeza Mwanafunzi</Text>
              <Text style={{fontSize:13,color:C.primary,fontWeight:'bold',marginBottom:12}}>📚 Darasa: {darasa}</Text>
              <Input label="Jina kamili" value={jina} onChangeText={setJina} placeholder="Jina la mwanafunzi" />
              <Input label="Namba ya usajili" value={namba} onChangeText={setNamba} placeholder="mfano: S001" />
              <View style={{flexDirection:'row', gap:9, marginTop:4}}>
                <TouchableOpacity style={[S.modalBtn, {backgroundColor:'#f0f0f0'}]} onPress={() => setModal(false)}>
                  <Text style={{color:'#555'}}>Funga</Text>
                </TouchableOpacity>
                <GradButton title="Hifadhi" onPress={addStudent} loading={saving} style={{flex:1}} />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

// ================================================================
// MAHUDHURIO - CHAGUA DARASA
// ================================================================
export function MahudhurioListScreen({ navigation }) {
  const [madarasa, setMadarasa] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get('/api/wanafunzi/madarasa');
      setMadarasa(res.data.madarasa);
    } catch {}
    setLoading(false);
  }

  return (
    <View style={{flex:1, backgroundColor:C.bg}}>
      <TopBar title="✅ Mahudhurio" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding:14}}>
        <Text style={S.pickTitle}>📚 Chagua Darasa</Text>
        {loading ? <Loader /> : (
          <View style={S.darasaGrid}>
            {MADARASA.map((d, i) => {
              const info = madarasa.find(m => m.jina === d) || {jumla:0,hapo_leo:0};
              return (
                <TouchableOpacity key={d} style={[S.darasaBox, {borderColor: D_COLORS[i]+'50'}]}
                  onPress={() => navigation.navigate('MahudhurioDetail', { darasa: d, color: D_COLORS[i] })}>
                  <Text style={S.darasaIcon}>{D_ICONS[i]}</Text>
                  <Text style={[S.darasaName, {color: D_COLORS[i]}]}>{d}</Text>
                  <Text style={S.darasaCount}>{info.hapo_leo||0}/{info.jumla} leo</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ================================================================
// MAHUDHURIO - REKODI
// ================================================================
export function MahudhurioDetailScreen({ navigation, route }) {
  const { darasa, color } = route.params;
  const [wanafunzi, setWanafunzi] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/api/mahudhurio?darasa_jina=${encodeURIComponent(darasa)}`);
      setWanafunzi(res.data.wanafunzi);
    } catch {}
    setLoading(false);
  }

  function toggle(i) {
    setWanafunzi(prev => prev.map((s, idx) =>
      idx === i ? { ...s, hali: s.hali === 'hapo' ? 'hayupo' : 'hapo' } : s
    ));
  }

  async function saveAll() {
    setSaving(true);
    try {
      const dRes = await api.get('/api/wanafunzi/madarasa');
      const d = dRes.data.madarasa.find(m => m.jina === darasa);
      await api.post('/api/mahudhurio/batch', {
        darasa_id: d.id,
        mahudhurio: wanafunzi.map(s => ({ mwanafunzi_id: s.mwanafunzi_id, hali: s.hali }))
      });
      Alert.alert('✅', 'Mahudhurio yamehifadhiwa!');
    } catch (e) {
      Alert.alert('Hitilafu', 'Imeshindwa kuhifadhi');
    }
    setSaving(false);
  }

  const hapo   = wanafunzi.filter(s => s.hali === 'hapo').length;
  const hayupo = wanafunzi.length - hapo;
  const pct    = wanafunzi.length ? Math.round(hapo/wanafunzi.length*100) : 0;

  return (
    <View style={{flex:1, backgroundColor:C.bg}}>
      <TopBar title={`✅ ${darasa}`} onBack={() => navigation.goBack()} />
      <View style={[S.classHeader, {backgroundColor: color}]}>
        <Text style={{fontSize:28}}>✅</Text>
        <View><Text style={S.classHeaderName}>{darasa}</Text><Text style={S.classHeaderCount}>{wanafunzi.length} wanafunzi</Text></View>
      </View>
      <View style={S.attSummary}>
        <View style={S.attBox}><Text style={[S.attNum, {color:C.green}]}>{hapo}</Text><Text style={S.attLbl}>Waliohudhuria</Text></View>
        <View style={S.attBox}><Text style={[S.attNum, {color:C.red}]}>{hayupo}</Text><Text style={S.attLbl}>Hawakuja</Text></View>
        <View style={S.attBox}><Text style={[S.attNum, {color:C.primary}]}>{pct}%</Text><Text style={S.attLbl}>Asilimia</Text></View>
      </View>
      <View style={{paddingHorizontal:14, marginBottom:8}}>
        <GradButton title={saving ? 'Inahifadhi...' : '💾 Hifadhi Yote'} onPress={saveAll} loading={saving} />
      </View>
      {loading ? <Loader /> : (
        <FlatList
          data={wanafunzi}
          keyExtractor={(_,i) => String(i)}
          contentContainerStyle={{padding:14, paddingBottom:100}}
          ListEmptyComponent={<EmptyState text="Hakuna wanafunzi" />}
          renderItem={({item:s, index:i}) => (
            <Card style={{flexDirection:'row', alignItems:'center', gap:12}}>
              <Avatar name={s.jina} />
              <View style={{flex:1}}>
                <Text style={S.sName}>{s.jina}</Text>
                <Text style={S.sSub}>{s.namba_usajili}</Text>
              </View>
              <TouchableOpacity style={[S.attBadge, s.hali==='hapo'?S.attHapo:S.attHayupo]} onPress={() => toggle(i)}>
                <Text style={{fontSize:11,fontWeight:'bold',color: s.hali==='hapo'?C.green:C.red}}>
                  {s.hali==='hapo'?'✅ Yupo':'❌ Hayupo'}
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
    </View>
  );
}

// ================================================================
// MASOMO
// ================================================================
export function MasomoScreen({ navigation }) {
  const [activeDarasa, setActiveDarasa] = useState('Form 1');
  const [masomo, setMasomo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [jina, setJina] = useState('');
  const [kifupi, setKifupi] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [activeDarasa]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/api/masomo?darasa_jina=${encodeURIComponent(activeDarasa)}`);
      setMasomo(res.data.masomo);
    } catch {}
    setLoading(false);
  }

  async function addSomo() {
    if (!jina || !kifupi) { Alert.alert('Hitilafu', 'Jaza sehemu zote'); return; }
    setSaving(true);
    try {
      const dRes = await api.get('/api/wanafunzi/madarasa');
      const d = dRes.data.madarasa.find(m => m.jina === activeDarasa);
      await api.post('/api/masomo', { jina, kifupi: kifupi.toUpperCase(), darasa_id: d.id });
      setModal(false); setJina(''); setKifupi('');
      load();
    } catch (e) {
      Alert.alert('Hitilafu', e.response?.data?.error || 'Imeshindwa');
    }
    setSaving(false);
  }

  async function deleteSomo(id) {
    Alert.alert('Futa', 'Una uhakika?', [
      { text: 'Hapana' },
      { text: 'Ndio', style: 'destructive', onPress: async () => {
        await api.delete(`/api/masomo/${id}`);
        load();
      }}
    ]);
  }

  return (
    <View style={{flex:1, backgroundColor:C.bg}}>
      <TopBar title="📚 Masomo" onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.dtabsRow}>
        {MADARASA.map(d => (
          <TouchableOpacity key={d} style={[S.dtab, d===activeDarasa && S.dtabActive]} onPress={() => setActiveDarasa(d)}>
            <Text style={[S.dtabTxt, d===activeDarasa && {color:'#fff'}]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{paddingHorizontal:14, marginBottom:8}}>
        <TouchableOpacity style={S.addRowBtn} onPress={() => setModal(true)}>
          <Text style={{color:C.primary, fontWeight:'bold'}}>+ Ongeza Somo</Text>
        </TouchableOpacity>
      </View>
      {loading ? <Loader /> : (
        <FlatList data={masomo} keyExtractor={i => String(i.id)}
          contentContainerStyle={{padding:14, paddingBottom:100}}
          ListEmptyComponent={<EmptyState text="Hakuna masomo. Ongeza." />}
          renderItem={({item:s}) => (
            <Card style={{flexDirection:'row', alignItems:'center'}}>
              <View style={{flex:1}}>
                <Text style={S.sName}>📖 {s.jina}</Text>
                <Text style={S.sSub}>{s.kifupi} • {s.darasa_jina}</Text>
              </View>
              <TouchableOpacity style={S.delBtn} onPress={() => deleteSomo(s.id)}>
                <Text style={{color:C.red}}>🗑️</Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
      <Modal visible={modal} transparent animationType="slide">
        <View style={S.modalBg}>
          <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'}>
            <View style={S.modalCard}>
              <Text style={S.modalTitle}>📚 Ongeza Somo</Text>
              <Text style={{fontSize:13,color:C.primary,fontWeight:'bold',marginBottom:12}}>Darasa: {activeDarasa}</Text>
              <Input label="Jina la somo" value={jina} onChangeText={setJina} placeholder="mfano: Hisabati" />
              <Input label="Kifupi" value={kifupi} onChangeText={setKifupi} placeholder="mfano: HISA" autoCapitalize="characters" />
              <View style={{flexDirection:'row', gap:9, marginTop:4}}>
                <TouchableOpacity style={[S.modalBtn, {backgroundColor:'#f0f0f0'}]} onPress={() => setModal(false)}>
                  <Text style={{color:'#555'}}>Funga</Text>
                </TouchableOpacity>
                <GradButton title="Hifadhi" onPress={addSomo} loading={saving} style={{flex:1}} />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

// ================================================================
// MATOKEO
// ================================================================
export function MatokeoScreen({ navigation }) {
  const [matokeo, setMatokeo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [wanafunziOpts, setWanafunziOpts] = useState([]);
  const [somoOpts, setSomoOpts] = useState([]);
  const [mwanafunziId, setMwanafunziId] = useState('');
  const [somoId, setSomoId] = useState('');
  const [alama, setAlama] = useState('');
  const [mtihani, setMtihani] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterDarasa, setFilterDarasa] = useState('');

  useEffect(() => { load(); loadOpts(); }, [filterDarasa]);

  function getGrade(a){if(a>=75)return{g:'A',color:C.green};if(a>=60)return{g:'B',color:C.blue};if(a>=45)return{g:'C',color:C.orange};if(a>=30)return{g:'D',color:C.red};return{g:'F',color:'#b71c1c'};}

  async function load() {
    setLoading(true);
    try {
      const url = filterDarasa ? `/api/matokeo?darasa_jina=${encodeURIComponent(filterDarasa)}` : '/api/matokeo';
      const res = await api.get(url);
      // Group by student
      const byStudent = {};
      res.data.matokeo.forEach(m => {
        if (!byStudent[m.mwanafunzi_id]) byStudent[m.mwanafunzi_id] = { jina:m.mwanafunzi_jina, darasa:m.darasa_jina, rows:[] };
        byStudent[m.mwanafunzi_id].rows.push(m);
      });
      setMatokeo(Object.values(byStudent));
    } catch {}
    setLoading(false);
  }

  async function loadOpts() {
    try {
      const [wRes, sRes] = await Promise.all([api.get('/api/wanafunzi'), api.get('/api/masomo')]);
      setWanafunziOpts(wRes.data.wanafunzi);
      setSomoOpts(sRes.data.masomo);
    } catch {}
  }

  async function addMatokeo() {
    if (!mwanafunziId||!somoId||!alama||!mtihani) { Alert.alert('Hitilafu','Jaza sehemu zote'); return; }
    if (parseInt(alama)<0||parseInt(alama)>100) { Alert.alert('Hitilafu','Alama 0-100'); return; }
    setSaving(true);
    try {
      await api.post('/api/matokeo', { mwanafunzi_id:mwanafunziId, somo_id:somoId, alama:parseInt(alama), mtihani });
      setModal(false); setAlama(''); setMtihani('');
      load();
    } catch (e) { Alert.alert('Hitilafu', e.response?.data?.error||'Imeshindwa'); }
    setSaving(false);
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <TopBar title="📝 Matokeo" onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.dtabsRow}>
        {[{jina:'',label:'Zote'}, ...MADARASA.map(d=>({jina:d,label:d}))].map(d => (
          <TouchableOpacity key={d.jina} style={[S.dtab, d.jina===filterDarasa && S.dtabActive]}
            onPress={() => setFilterDarasa(d.jina)}>
            <Text style={[S.dtabTxt, d.jina===filterDarasa && {color:'#fff'}]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{paddingHorizontal:14,marginBottom:8}}>
        <TouchableOpacity style={S.addRowBtn} onPress={() => setModal(true)}>
          <Text style={{color:C.primary,fontWeight:'bold'}}>+ Ingiza Matokeo</Text>
        </TouchableOpacity>
      </View>
      {loading ? <Loader /> : (
        <FlatList data={matokeo} keyExtractor={(_,i) => String(i)}
          contentContainerStyle={{padding:14,paddingBottom:100}}
          ListEmptyComponent={<EmptyState text="Hakuna matokeo bado" />}
          renderItem={({item:s}) => {
            const avg = Math.round(s.rows.reduce((a,r)=>a+parseFloat(r.alama),0)/s.rows.length);
            const {g, color} = getGrade(avg);
            return (
              <Card>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <View><Text style={S.sName}>{s.jina}</Text><Text style={S.sSub}>{s.darasa}</Text></View>
                  <View style={[S.avgBadge,{backgroundColor:C.primary}]}><Text style={{color:'#fff',fontSize:11,fontWeight:'bold'}}>{avg}% • {g}</Text></View>
                </View>
                {s.rows.map((r,i) => {
                  const {g:rg, color:rc} = getGrade(r.alama);
                  return (
                    <View key={i} style={S.resultRow}>
                      <Text style={{fontSize:12,color:C.text,flex:2}}>{r.somo_jina}</Text>
                      <Text style={{fontSize:12,color:C.subtext,flex:2}}>{r.mtihani}</Text>
                      <Text style={{fontSize:12,fontWeight:'bold',color:C.text,flex:1}}>{r.alama}/100</Text>
                      <Text style={{fontSize:12,fontWeight:'bold',color:rc,flex:1}}>{rg}</Text>
                    </View>
                  );
                })}
              </Card>
            );
          }}
        />
      )}
      <Modal visible={modal} transparent animationType="slide">
        <View style={S.modalBg}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={[S.modalCard,{marginTop:60}]}>
              <Text style={S.modalTitle}>📝 Ingiza Matokeo</Text>
              <Text style={S.inputLabel}>Chagua Mwanafunzi:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>
                {wanafunziOpts.map(w => (
                  <TouchableOpacity key={w.id} style={[S.optBtn, mwanafunziId===String(w.id) && S.optActive]}
                    onPress={() => setMwanafunziId(String(w.id))}>
                    <Text style={{fontSize:11,color: mwanafunziId===String(w.id)?'#fff':C.text}}>{w.jina}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={S.inputLabel}>Chagua Somo:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>
                {somoOpts.map(s => (
                  <TouchableOpacity key={s.id} style={[S.optBtn, somoId===String(s.id) && S.optActive]}
                    onPress={() => setSomoId(String(s.id))}>
                    <Text style={{fontSize:11,color: somoId===String(s.id)?'#fff':C.text}}>{s.jina}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Input label="Alama (0-100)" value={alama} onChangeText={setAlama} keyboardType="numeric" placeholder="mfano: 85" />
              <Input label="Mtihani" value={mtihani} onChangeText={setMtihani} placeholder="mfano: Muhula 1" />
              <View style={{flexDirection:'row', gap:9, marginTop:4}}>
                <TouchableOpacity style={[S.modalBtn,{backgroundColor:'#f0f0f0'}]} onPress={() => setModal(false)}>
                  <Text style={{color:'#555'}}>Funga</Text>
                </TouchableOpacity>
                <GradButton title="Hifadhi" onPress={addMatokeo} loading={saving} style={{flex:1}} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ================================================================
// UJUMBE
// ================================================================
export function UjumbeScreen({ navigation }) {
  const [ujumbe, setUjumbe]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [aina,    setAina]    = useState('');
  const [tumaKwa, setTumaKwa] = useState('');
  const [maudhui, setMaudhui] = useState('');
  const [sending, setSending] = useState(false);

  const AINA  = ['🤒 Mwanafunzi Mgonjwa','⚰️ Msiba Shuleni','🏫 Shule Imefungwa','📊 Matokeo Yamewekwa','⚠️ Taarifa ya Haraka'];
  const TUMIA = ['👨‍👩‍👧 Wazazi Wote','👨‍🏫 Walimu Wote','👥 Wote'];

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const res = await api.get('/api/ujumbe'); setUjumbe(res.data.ujumbe); }
    catch {} setLoading(false);
  }

  async function send() {
    if (!aina||!tumaKwa||!maudhui) { Alert.alert('Hitilafu','Jaza sehemu zote'); return; }
    setSending(true);
    try { await api.post('/api/ujumbe',{aina,tuma_kwa:tumaKwa,maudhui}); setMaudhui(''); load(); }
    catch {} setSending(false);
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <TopBar title="📢 Ujumbe" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding:14,paddingBottom:100}}>
        <Card>
          <Text style={[S.modalTitle,{marginBottom:12}]}>Tuma Ujumbe</Text>
          <Text style={S.inputLabel}>Aina ya Ujumbe:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>
            {AINA.map(a => (
              <TouchableOpacity key={a} style={[S.optBtn, aina===a && S.optActive]} onPress={() => setAina(a)}>
                <Text style={{fontSize:11,color: aina===a?'#fff':C.text}}>{a}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={S.inputLabel}>Tuma Kwa:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>
            {TUMIA.map(t => (
              <TouchableOpacity key={t} style={[S.optBtn, tumaKwa===t && S.optActive]} onPress={() => setTumaKwa(t)}>
                <Text style={{fontSize:11,color: tumaKwa===t?'#fff':C.text}}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={[S.searchInput,{height:80,textAlignVertical:'top',padding:10,marginBottom:10}]}
            multiline placeholder="Andika ujumbe..." value={maudhui} onChangeText={setMaudhui} />
          <GradButton title="📤 Tuma" onPress={send} loading={sending} />
        </Card>
        {loading ? <Loader /> : ujumbe.length
          ? ujumbe.map(m => (
            <View key={m.id} style={[S.msgCard]}>
              <Text style={{fontSize:13,fontWeight:'bold',color:C.dark,marginBottom:4}}>{m.aina}</Text>
              <Text style={{fontSize:12,color:'#666'}}>{m.maudhui}</Text>
              <Text style={{fontSize:10,color:C.subtext,marginTop:5}}>→ {m.tuma_kwa} • {m.ilitumwa_na_jina}</Text>
            </View>
          ))
          : <EmptyState text="Hakuna ujumbe bado" />
        }
      </ScrollView>
    </View>
  );
}

// ================================================================
// MALIPO (ADMIN)
// ================================================================
export function MalipoScreen({ navigation }) {
  const [malipo, setMalipo]   = useState([]);
  const [filter, setFilter]   = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const url = filter==='all' ? '/api/malipo' : `/api/malipo?hali=${filter}`;
      const res = await api.get(url);
      setMalipo(res.data.malipo);
    } catch {}
    setLoading(false);
  }

  async function confirm(id) {
    try { await api.put(`/api/malipo/${id}/thibitisha`); Alert.alert('✅','Yamethibitishwa!'); load(); }
    catch (e) { Alert.alert('Hitilafu', e.response?.data?.error||'Imeshindwa'); }
  }

  async function reject(id) {
    Alert.alert('Kataa','Una uhakika?',[{text:'Hapana'},{text:'Ndio',style:'destructive',onPress:async()=>{
      await api.put(`/api/malipo/${id}/kataa`); load();
    }}]);
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <TopBar title="💰 Malipo" onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.dtabsRow}>
        {[['pending','⏳ Yanasubiri'],['confirmed','✅ Yaliothibitishwa'],['all','📋 Yote']].map(([f,l]) => (
          <TouchableOpacity key={f} style={[S.dtab, f===filter && S.dtabActive]} onPress={() => setFilter(f)}>
            <Text style={[S.dtabTxt, f===filter && {color:'#fff'}]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? <Loader /> : (
        <FlatList data={malipo} keyExtractor={i => String(i.id)}
          contentContainerStyle={{padding:14,paddingBottom:100}}
          ListEmptyComponent={<EmptyState text="Hakuna malipo" />}
          renderItem={({item:m}) => (
            <View style={[S.malipoCard, m.hali==='pending'&&{borderLeftColor:C.orange}, m.hali==='confirmed'&&{borderLeftColor:C.green}]}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <View>
                  <Text style={S.sName}>{m.mtumiaji_jina||m.email}</Text>
                  <Text style={S.sSub}>{m.email}</Text>
                </View>
                <Badge label={m.hali==='pending'?'⏳ Inasubiri':m.hali==='confirmed'?'✅ Imethibitishwa':'❌ Imekataliwa'} type={m.hali} />
              </View>
              <Text style={S.sSub}>📱 {m.njia?.toUpperCase()} | 📞 {m.simu}</Text>
              <Text style={S.sSub}>🔖 {m.namba_muamala} | 💰 Tshs {Number(m.kiasi).toLocaleString()}</Text>
              <Text style={[S.sSub,{color:C.primary,fontWeight:'bold',marginBottom: m.hali==='pending'?8:0}]}>🔑 {m.code_mpango}</Text>
              {m.hali==='pending' && (
                <View style={{flexDirection:'row',gap:8}}>
                  <TouchableOpacity style={[S.attBadge,S.attHapo,{flex:1,justifyContent:'center',alignItems:'center'}]} onPress={() => confirm(m.id)}>
                    <Text style={{color:C.green,fontWeight:'bold',fontSize:12}}>✅ Thibitisha</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[S.attBadge,S.attHayupo,{padding:8}]} onPress={() => reject(m.id)}>
                    <Text style={{color:C.red,fontSize:12}}>❌ Kataa</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

// ================================================================
// TAARIFA
// ================================================================
export function TaarifaScreen({ navigation }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const res = await api.get('/api/taarifa'); setData(res.data); }
    catch {} setLoading(false);
  }

  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  const stats = [
    { num: (data?.asilimia_mahudhurio||0)+'%', label: 'Wastani wa Mahudhurio', color: C.primary },
    { num: data?.hapo_leo||0,   label: 'Walihudhuria Leo',   color: C.green  },
    { num: data?.hayupo_leo||0, label: 'Hawakuja Leo',       color: C.red    },
    { num: data?.jumla_masomo||0,label: 'Masomo Yaliyosajiliwa', color: C.blue },
    { num: data?.wastani_alama ? data.wastani_alama+'%' : '-', label: 'Wastani wa Alama', color: C.purple },
    { num: data?.malipo_yaliothibitishwa||0, label: 'Malipo Yaliothibitishwa', color: C.green },
  ];

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <TopBar title="📊 Taarifa" onBack={() => navigation.goBack()} />
      {loading ? <Loader /> : (
        <FlatList data={stats} keyExtractor={(_,i) => String(i)}
          contentContainerStyle={{padding:14,paddingBottom:100}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}
          renderItem={({item:s}) => (
            <Card style={{alignItems:'center', padding:20}}>
              <Text style={{fontSize:36,fontWeight:'bold',color:s.color}}>{s.num}</Text>
              <Text style={{color:C.subtext,fontSize:12,marginTop:5}}>{s.label}</Text>
            </Card>
          )}
        />
      )}
    </View>
  );
}

// ================================================================
// SUBSCRIPTION SCREEN
// ================================================================
export function SubscriptionScreen({ navigation }) {
  const { user, checkSubscription } = useAuth();
  const [selPay, setSelPay] = useState('');
  const [txn,    setTxn]    = useState('');
  const [simu,   setSimu]   = useState('');
  const [code,   setCode]   = useState('');
  const [tab,    setTab]    = useState('lipa');
  const [submitting, setSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  async function submitPayment() {
    if (!selPay||!txn||!simu) { Alert.alert('Hitilafu','Jaza sehemu zote'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/api/malipo', { njia:selPay, namba_muamala:txn.toUpperCase(), simu });
      setGeneratedCode(res.data.code_mpango);
      setShowCode(true);
    } catch (e) {
      Alert.alert('Hitilafu', e.response?.data?.error||'Imeshindwa kutuma ombi');
    }
    setSubmitting(false);
  }

  async function activateCode() {
    if (!code) { Alert.alert('Hitilafu','Ingiza code yako'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/malipo/angalia-code', { code: code.toUpperCase() });
      await checkSubscription(user);
      navigation.replace('Main');
    } catch (e) {
      Alert.alert('Hitilafu', e.response?.data?.error||'Code si sahihi');
    }
    setSubmitting(false);
  }

  return (
    <View style={{flex:1,backgroundColor:C.dark}}>
      <ScrollView contentContainerStyle={{flexGrow:1,alignItems:'center',justifyContent:'center',padding:20}}>
        <View style={[S.modalCard,{width:'100%'}]}>
          <View style={{alignItems:'center',marginBottom:18}}>
            <Text style={{fontSize:46}}>🔐</Text>
            <Text style={{fontSize:19,fontWeight:'bold',color:C.dark}}>EduConnect Premium</Text>
            <Text style={{fontSize:12,color:C.subtext,marginTop:3}}>Lipia ili uendelee kutumia app</Text>
          </View>
          <LinearGradient colors={GRAD} style={{borderRadius:15,padding:15,alignItems:'center',marginBottom:18}}>
            <Text style={{color:'#fff',fontSize:32,fontWeight:'bold'}}>Tshs 2,000</Text>
            <Text style={{color:'#fff',fontSize:13,opacity:.85}}>kwa mwezi mmoja</Text>
          </LinearGradient>

          {/* Tabs */}
          <View style={{flexDirection:'row',gap:8,marginBottom:14}}>
            {[['lipa','💳 Lipia'],['code','🔑 Nina Code']].map(([t,l]) => (
              <TouchableOpacity key={t} style={[S.subTab, t===tab && S.subTabActive]} onPress={() => setTab(t)}>
                <Text style={{fontWeight:'bold',fontSize:13,color: t===tab?'#fff':C.subtext}}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'lipa' ? (
            <View>
              <Text style={{fontSize:12,color:C.subtext,marginBottom:10}}>Chagua njia ya malipo:</Text>
              <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
                {[['mpesa','M-Pesa','#e53935'],['tigo','Tigo Pesa','#1565c0'],['airtel','Airtel','#e65100']].map(([k,l,c]) => (
                  <TouchableOpacity key={k} style={[S.payBtn, selPay===k && S.payBtnActive]} onPress={() => setSelPay(k)}>
                    <Text style={{fontSize:22,marginBottom:3}}>📱</Text>
                    <Text style={{fontSize:11,fontWeight:'bold',color:c}}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selPay && (
                <View>
                  <StepBox num="1" title="Tuma Tshs 2,000 kwenye:">
                    <View style={{backgroundColor:C.dark,borderRadius:8,padding:10,alignItems:'center'}}>
                      <Text style={{color:'#00ff88',fontSize:18,fontFamily:'monospace',letterSpacing:2,fontWeight:'bold'}}>
                        {PAY_NUMBERS[selPay]}
                      </Text>
                    </View>
                  </StepBox>
                  <StepBox num="2" title="Nambari ya muamala:">
                    <Input value={txn} onChangeText={t => setTxn(t.toUpperCase())} placeholder="mfano: QK12345678" autoCapitalize="characters" />
                  </StepBox>
                  <StepBox num="3" title="Nambari ya simu yako:">
                    <Input value={simu} onChangeText={setSimu} keyboardType="phone-pad" placeholder="07XX XXX XXX" />
                  </StepBox>
                  <GradButton title="📤 Tuma Ombi" onPress={submitPayment} loading={submitting} />
                </View>
              )}
              {showCode && (
                <View style={{backgroundColor:C.lightBlue,borderRadius:12,padding:16,alignItems:'center',marginTop:14}}>
                  <Text style={{fontSize:12,color:C.subtext,marginBottom:8}}>✅ Ombi limepokelewa! Code yako:</Text>
                  <LinearGradient colors={GRAD} style={{borderRadius:10,padding:14,width:'100%',alignItems:'center'}}>
                    <Text style={{color:'#fff',fontSize:22,fontWeight:'bold',letterSpacing:4,fontFamily:'monospace'}}>{generatedCode}</Text>
                    <Text style={{color:'#fff',fontSize:11,opacity:.8,marginTop:4}}>Hifadhi code hii vizuri</Text>
                  </LinearGradient>
                  <TouchableOpacity onPress={() => { setCode(generatedCode); setTab('code'); }} style={{marginTop:10}}>
                    <Text style={{color:C.primary,fontWeight:'bold'}}>Ingiza Code Sasa →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View>
              <StepBox num="1" title="Ingiza Code ya Mpango:">
                <TextInput style={[S.searchInput,{textAlign:'center',fontSize:18,letterSpacing:3,marginTop:8}]}
                  value={code} onChangeText={t => setCode(t.toUpperCase())}
                  placeholder="EDU-XXXX-XXXX" autoCapitalize="characters" />
              </StepBox>
              <GradButton title="🚀 Fungua App" onPress={activateCode} loading={submitting} />
              <TouchableOpacity onPress={() => setTab('lipa')} style={{alignItems:'center',marginTop:12}}>
                <Text style={{color:C.subtext,fontSize:12}}>Bado hujalipia? <Text style={{color:C.primary}}>Lipia Hapa</Text></Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ================================================================
// SHARED STYLES
// ================================================================
const S = StyleSheet.create({
  pickTitle:   { fontSize:15, color:C.dark, fontWeight:'bold', marginBottom:12 },
  darasaGrid:  { flexDirection:'row', flexWrap:'wrap', gap:10 },
  darasaBox:   { backgroundColor:'#fff', borderRadius:14, padding:16, alignItems:'center', width:'30%', borderWidth:2, elevation:2 },
  darasaIcon:  { fontSize:22, marginBottom:4 },
  darasaName:  { fontSize:13, fontWeight:'bold' },
  darasaCount: { fontSize:10, color:C.subtext, marginTop:2 },
  classHeader: { flexDirection:'row', alignItems:'center', gap:12, margin:14, borderRadius:14, padding:16 },
  classHeaderName:  { fontSize:16, fontWeight:'bold', color:'#fff' },
  classHeaderCount: { fontSize:12, color:'rgba(255,255,255,.8)', marginTop:2 },
  searchRow:   { flexDirection:'row', gap:9, marginHorizontal:14, marginBottom:12 },
  searchInput: { flex:1, borderWidth:2, borderColor:C.border, borderRadius:10, paddingHorizontal:13, paddingVertical:11, fontSize:14, backgroundColor:'#fff', color:C.text },
  addBtn:      { backgroundColor:C.primary, borderRadius:10, paddingHorizontal:16, paddingVertical:11, alignItems:'center', justifyContent:'center' },
  addRowBtn:   { borderWidth:2, borderColor:C.primary, borderRadius:9, padding:10, alignItems:'center' },
  sName:       { fontSize:14, color:C.dark, fontWeight:'bold' },
  sSub:        { fontSize:11, color:C.subtext, marginTop:1 },
  attSummary:  { flexDirection:'row', gap:8, paddingHorizontal:14, marginBottom:10 },
  attBox:      { flex:1, backgroundColor:'#fff', borderRadius:10, padding:10, alignItems:'center', elevation:2 },
  attNum:      { fontSize:20, fontWeight:'bold' },
  attLbl:      { fontSize:10, color:C.subtext, marginTop:1 },
  attBadge:    { paddingHorizontal:9, paddingVertical:5, borderRadius:18 },
  attHapo:     { backgroundColor:C.lightGreen },
  attHayupo:   { backgroundColor:C.lightRed },
  dtabsRow:    { paddingHorizontal:14, paddingVertical:10, maxHeight:55 },
  dtab:        { paddingHorizontal:13, paddingVertical:6, borderRadius:18, borderWidth:2, borderColor:C.primary, marginRight:8, backgroundColor:'#fff' },
  dtabActive:  { backgroundColor:C.primary },
  dtabTxt:     { fontSize:11, fontWeight:'bold', color:C.primary },
  delBtn:      { backgroundColor:C.lightRed, borderRadius:7, padding:8 },
  resultRow:   { flexDirection:'row', paddingVertical:5, borderBottomWidth:1, borderBottomColor:C.border },
  avgBadge:    { paddingHorizontal:9, paddingVertical:3, borderRadius:7 },
  msgCard:     { backgroundColor:'#fff', borderRadius:11, padding:13, marginBottom:9, elevation:2, borderLeftWidth:4, borderLeftColor:C.primary },
  malipoCard:  { backgroundColor:'#fff', borderRadius:12, padding:14, marginBottom:9, elevation:2, borderLeftWidth:4, borderLeftColor:C.primary },
  modalBg:     { flex:1, backgroundColor:'rgba(0,0,0,.55)', justifyContent:'center', padding:20 },
  modalCard:   { backgroundColor:'#fff', borderRadius:18, padding:22 },
  modalTitle:  { fontSize:16, fontWeight:'bold', color:C.dark },
  modalBtn:    { flex:1, padding:12, borderRadius:9, alignItems:'center', justifyContent:'center' },
  inputLabel:  { fontSize:12, color:C.subtext, fontWeight:'bold', marginBottom:4 },
  optBtn:      { borderWidth:1, borderColor:C.border, borderRadius:8, paddingHorizontal:10, paddingVertical:7, marginRight:8, backgroundColor:'#fff' },
  optActive:   { backgroundColor:C.primary, borderColor:C.primary },
  subTab:      { flex:1, padding:9, borderRadius:10, borderWidth:2, borderColor:C.border, backgroundColor:'#fff', alignItems:'center' },
  subTabActive:{ backgroundColor:C.primary, borderColor:C.primary },
  payBtn:      { flex:1, borderWidth:2, borderColor:C.border, borderRadius:12, padding:12, alignItems:'center', backgroundColor:'#fff' },
  payBtnActive:{ borderColor:C.primary, backgroundColor:C.lightBlue },
});
