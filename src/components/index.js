// src/components/index.js
import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, TextInput, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, GRAD } from '../theme';

const W = Dimensions.get('window').width;

// ── GradButton ────────────────────────────────────────
export function GradButton({ title, onPress, loading, style, small }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={[styles.gradBtn, small && styles.gradBtnSm, style]}>
      <LinearGradient colors={GRAD} style={styles.gradInner} start={{x:0,y:0}} end={{x:1,y:1}}>
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={[styles.gradTxt, small && {fontSize:13}]}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── TopBar ────────────────────────────────────────────
export function TopBar({ title, onBack, right }) {
  return (
    <LinearGradient colors={GRAD} style={styles.topbar} start={{x:0,y:0}} end={{x:1,y:0}}>
      {onBack
        ? <TouchableOpacity onPress={onBack} style={styles.topBack}><Text style={styles.topBackTxt}>←</Text></TouchableOpacity>
        : <Text style={{width:40}}>🎓</Text>}
      <Text style={styles.topTitle}>{title}</Text>
      <View style={{width:40}}>{right || <Text>🔔</Text>}</View>
    </LinearGradient>
  );
}

// ── Input ─────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <View style={styles.inputWrap}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputErr]}
        placeholderTextColor="#bbb"
        {...props}
      />
      {error && <Text style={styles.errTxt}>{error}</Text>}
    </View>
  );
}

// ── Card ──────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── StatCard ──────────────────────────────────────────
export function StatCard({ num, label, color }) {
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statNum, { color: color || C.primary }]}>{num}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </Card>
  );
}

// ── Avatar ────────────────────────────────────────────
export function Avatar({ name, size = 42 }) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  return (
    <LinearGradient colors={GRAD} style={[styles.avatar, {width:size,height:size,borderRadius:size/2}]} start={{x:0,y:0}} end={{x:1,y:1}}>
      <Text style={[styles.avatarTxt, {fontSize: size*0.35}]}>{initials}</Text>
    </LinearGradient>
  );
}

// ── Badge ─────────────────────────────────────────────
export function Badge({ label, type = 'hapo' }) {
  const styles2 = {
    hapo:      { bg: C.lightGreen, color: C.green },
    hayupo:    { bg: C.lightRed,   color: C.red   },
    pending:   { bg: '#fff3e0',    color: C.orange },
    confirmed: { bg: C.lightGreen, color: C.green  },
    rejected:  { bg: C.lightRed,   color: C.red    },
  };
  const s = styles2[type] || styles2.hapo;
  return (
    <View style={[styles.badge, {backgroundColor: s.bg}]}>
      <Text style={[styles.badgeTxt, {color: s.color}]}>{label}</Text>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────
export function EmptyState({ text }) {
  return <Text style={styles.empty}>{text}</Text>;
}

// ── Loader ────────────────────────────────────────────
export function Loader() {
  return (
    <View style={styles.loaderWrap}>
      <ActivityIndicator size="large" color={C.primary} />
    </View>
  );
}

// ── StepBox ───────────────────────────────────────────
export function StepBox({ num, title, children }) {
  return (
    <View style={styles.stepBox}>
      <View style={styles.stepRow}>
        <View style={styles.stepNum}><Text style={styles.stepNumTxt}>{num}</Text></View>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  gradBtn:    { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  gradBtnSm:  { borderRadius: 9 },
  gradInner:  { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  gradTxt:    { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  topbar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50 },
  topBack:    { width: 40 },
  topBackTxt: { color: '#fff', fontSize: 22 },
  topTitle:   { color: '#fff', fontSize: 17, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  inputWrap:  { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: C.subtext, marginBottom: 4, fontWeight: 'bold' },
  input:      { borderWidth: 2, borderColor: C.border, borderRadius: 10, padding: 12, fontSize: 14, color: C.text, backgroundColor: '#fff' },
  inputErr:   { borderColor: C.red },
  errTxt:     { color: C.red, fontSize: 11, marginTop: 3 },
  card:       { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:6, elevation:3 },
  statCard:   { flex: 1, minWidth: 90, alignItems: 'center', marginHorizontal: 4 },
  statNum:    { fontSize: 22, fontWeight: 'bold' },
  statLbl:    { fontSize: 10, color: C.subtext, marginTop: 2, textAlign: 'center' },
  avatar:     { alignItems: 'center', justifyContent: 'center' },
  avatarTxt:  { color: '#fff', fontWeight: 'bold' },
  badge:      { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 18 },
  badgeTxt:   { fontSize: 10, fontWeight: 'bold' },
  empty:      { textAlign: 'center', color: C.subtext, padding: 30, fontSize: 13 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  stepBox:    { backgroundColor: C.lightBlue, borderRadius: 12, padding: 13, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: C.primary },
  stepRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepNum:    { backgroundColor: C.primary, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  stepNumTxt: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  stepTitle:  { fontSize: 13, fontWeight: 'bold', color: C.text, flex: 1 },
});
