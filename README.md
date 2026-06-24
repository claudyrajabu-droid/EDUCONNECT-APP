# EduConnect Tanzania — React Native Android App 📱
## Muongozo Kamili wa Kujenga APK

---

## 📋 Mahitaji Kabla Ya Kuanza

1. **Node.js** — [Download](https://nodejs.org) (LTS version)
2. **Expo CLI** — Inakutolewa kwa npm
3. **EAS CLI** — Kujenga APK kwenye cloud
4. **Simu Android** au **Android Emulator** (kwa testing)

---

## 🚀 Hatua 1: Sanidi Projekti

```bash
# 1. Ingia folder
cd educonnect-rn

# 2. Install dependencies
npm install

# 3. Sanidi API_URL
# Badilisha hii kwenye src/services/api.js:
# const API_URL = 'https://your-render-app.onrender.com';
```

---

## 🔧 Hatua 2: Tengeneza Accounts

### A. Expo Account (Bure)
```bash
npx expo-cli signup
# au ingia: npx expo-cli login
```

### B. EAS Account (Bure kwa EAS Build)
```bash
npx eas login
# au tengeneza hapa: https://expo.dev
```

---

## 🏗️ Hatua 3: Jenga APK

### Option 1: EAS Build (Rahisi - Inakutolewa Kwenye Cloud)
```bash
# Configure EAS
npx eas build:configure

# Jenga APK kwa Android
npx eas build --platform android --type apk

# After ~10 minutes, utapata link ya kudownload APK
```

### Option 2: Local Build (Unahitaji Android SDK)
```bash
# Ikiwa umeweka Android Studio + SDK:
npx expo prebuild --clean
npx expo run:android --release
```

---

## 📱 Hatua 4: Install kwenye Simu

### Kutoka EAS Build:
1. Download APK link iliyotolewa
2. Tuma kwenye simu yako (WhatsApp, email, etc.)
3. Bonyeza APK kuinstall

### Kutoka Local:
```bash
# Connected USB simu:
adb install -r path/to/app-release.apk
```

---

## 🧪 Hatua 5: Test Kabla Ya Build

```bash
# Anza dev server
npx expo start

# Bonyeza 'a' kunyumbuka Android emulator
# Au scan QR code kwa Expo app kwenye simu yako
```

---

## 🔑 Configuration Files

### app.json
- **name**: "EduConnect Tanzania"
- **slug**: "educonnect-tanzania"
- **package**: "tz.educonnect.app"

### eas.json
- Weka `projectId` yako kutoka Expo dashboard

### src/services/api.js
- **API_URL**: Badilisha kuwa URL yako ya Render.com

---

## 📊 APK Ukubwa & Performance

- **App Size**: ~80-120 MB (uncompressed)
- **Offline Support**: ✅ Service Worker kwa caching
- **Permissions**: Internet, Network Access (kwa API calls)

---

## 🚢 Kuweka Play Store (Optional)

Ukitaka kuweka Google Play:

```bash
# 1. Tengeneza keystore (hii inafanya kazi mara moja)
keytool -genkey -v -keystore ~/educonnect-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias educonnect

# 2. Hifadhi password kwa usalama
# 3. Hariri eas.json kuonyesha keystore path
# 4. Jenga AAB (Android App Bundle):
npx eas build --platform android --type aab

# 5. Upload AAB kwenye Google Play Console
```

---

## 🐛 Kutatua Matatizo

### "API inakataa ujumbe wa CORS"
- Thibitisha FRONTEND_URL kwenye .env ya backend
- Pia thibitisha app.json `package` name

### "APK kubwa sana"
- Hii ni kawaida kwa React Native
- Expo anajibu hii kwa otomatiki

### "EAS Build inafeli"
- Thibitisha npm install inafanya kazi: `npm install`
- Thibitisha app.json ina syntaks sahihi

### "App inashindwa kuunganisha API"
- Thibitisha URL `API_URL = 'https://...'` (si `http://`)
- Thibitisha firewall/VPN haziingiza API

---

## 📞 Ingia Kwa Admin Demo

**Email**: admin@demo.com  
**Password**: admin123  
**Role**: Msimamizi wa Shule

---

## ✅ Checklist Kabla Ya Release

- [ ] `API_URL` imebadilishwa kuwa URL ya backend
- [ ] `projectId` kwenye eas.json
- [ ] `package` kwenye app.json (`tz.educonnect.app`)
- [ ] Offline mode inakamatia (service worker inakazi)
- [ ] All screens zinakazi without errors
- [ ] Payment flow inakazi (M-Pesa/Tigo/Airtel numbers)
- [ ] Login/Register screen inafanya kazi
- [ ] Subscription wall inaonyeshwa kwa non-admin users

---

## 🎯 Mifano ya Matumizi

### Kujenga dev APK (testing)
```bash
npx eas build --platform android --type apk
# Toa link → download → install kwenye simu
```

### Kujenga production APK (Play Store)
```bash
npx eas build --platform android --type aab
# Download AAB → upload Google Play Console
```

### Testing Offline Mode
1. Download app
2. Pindua "Airplane Mode" kwenye simu
3. Weka data iliyocached (wanafunzi, mahudhurio) inaonyeshwa

---

## 📚 Nyenzo za Kusoma

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Guide](https://docs.expo.dev/eas-update/getting-started/)
- [React Native Docs](https://reactnative.dev)
- [EAS CLI Reference](https://docs.expo.dev/build/building-on-eas/)

---

## 🎓 EduConnect Tanzania - Kamilika! ✅

**Mradi wako wa Android app umekamilika!**

Sasa unaweza:
- ✅ Kujenga APK
- ✅ Kuinstall kwenye simu
- ✅ Kutuma kwa Play Store
- ✅ Kuweka kwenye Render.com backend

**Jina la App**: EduConnect Tanzania  
**Package**: tz.educonnect.app  
**Version**: 1.0.0

Karibu sana kutumia app hii! 🚀
