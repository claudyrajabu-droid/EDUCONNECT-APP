// src/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { TopBar, StatCard, Card, Loader } from '../components';
import { C, GRAD } from '../theme';
import api from '../services/api';

const MENU = [
  { icon:'👨‍🎓', label:'Wanafunzi',  screen:'WanafunziDarasa' },
  { icon:'✅',   label:'Mahudhurio', screen:'MahudhurioList' },
  { icon:'📚',   label:'Masomo',     screen:'Masomo' },
  { icon:'📝',   label:'Matokeo',    screen:'Matokeo' },
  { icon:'📢',   label:'Ujumbe',     screen:'Ujumbe' },
  { icon:'📊',   label:'Taarifa',    screen:'Taarifa' },
];

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const res = await api.get('/api/taarifa');
      setStats(res.data);
    } catch {}
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }

  return (
    <View style={{flex:1, backgroundColor: C.bg}}>
      <TopBar title="EduConnect" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>
        {/* User bar */}
        <View style={S.userBar}>
          <LinearGradient colors={GRAD} style={S.uAvatar} start={{x:0,y:0}} end={{x:1,y:1}}>
            <Text style={S.uAvatarTxt}>{(user?.jina||'?')[0].toUpperCase()}</Text>
          </LinearGradient>
          <View style={{flex:1}}>
            <Text style={S.uName}>{user?.jina}</Text>
            <Text style={S.uRole}>{{admin:'Msimamizi wa Shule',mwalimu:'Mwalimu',mzazi:'Mzazi / Mlezi'}[user?.jukumu]}</Text>
          </View>
          <TouchableOpacity style={S.logoutBtn} onPress={() => { logout(); navigation.replace('Auth'); }}>
            <Text style={S.logoutTxt}>Toka</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingHorizontal:14,paddingVertical:8}}>
          <View style={{flexDirection:'row', gap:8}}>
            <StatCard num={stats?.jumla_wanafunzi ?? '-'} label="Wanafunzi" />
            <StatCard num={stats?.hapo_leo ?? '-'} label="Waliohudhuria" color={C.green} />
            <StatCard num={stats?.hayupo_leo ?? '-'} label="Hawakuja" color={C.red} />
            {user?.jukumu==='admin' && <StatCard num={stats?.malipo_yanasubiri ?? '-'} label="Malipo Mapya" color={C.orange} />}
          </View>
        </ScrollView>

        {/* Menu Grid */}
        <View style={S.grid}>
          {MENU.map(m => (
            (!m.adminOnly || user?.jukumu==='admin') &&
            <TouchableOpacity key={m.screen} style={S.menuItem} onPress={() => navigation.navigate(m.screen)}>
              <Text style={S.menuIcon}>{m.icon}</Text>
              <Text style={S.menuLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
          {user?.jukumu==='admin' && (
            <TouchableOpacity style={S.menuItem} onPress={() => navigation.navigate('Malipo')}>
              <Text style={S.menuIcon}>💰</Text>
              <Text style={S.menuLabel}>Malipo</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  userBar:    { backgroundColor:'#f8f7ff', margin:12, borderRadius:11, padding:12, flexDirection:'row', alignItems:'center', gap:11, elevation:2 },
  uAvatar:    { width:38, height:38, borderRadius:19, alignItems:'center', justifyContent:'center' },
  uAvatarTxt: { color:'#fff', fontWeight:'bold', fontSize:15 },
  uName:      { fontSize:13, color:C.dark, fontWeight:'bold' },
  uRole:      { fontSize:11, color:C.subtext },
  logoutBtn:  { backgroundColor:C.lightRed, borderRadius:7, paddingHorizontal:11, paddingVertical:5 },
  logoutTxt:  { color:C.red, fontSize:11, fontWeight:'bold' },
  grid:       { flexDirection:'row', flexWrap:'wrap', padding:10, gap:10 },
  menuItem:   { backgroundColor:'#fff', borderRadius:14, padding:18, alignItems:'center', width:'47%', elevation:2 },
  menuIcon:   { fontSize:28, marginBottom:6 },
  menuLabel:  { fontSize:12, color:C.text, fontWeight:'bold' },
});
