import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/use-auth';

const bg =
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80';
const primary = '#d11f2f';
const textLight = '#f8f2f2';
const textMuted = '#c5b8b8';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleLogin = () => {
    // TODO: replace with real auth; for now toggle logged-in state
    login();
    router.replace('/(tabs)/profile');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <ImageBackground
          source={{ uri: bg }}
          style={StyleSheet.absoluteFill}
          imageStyle={{ resizeMode: 'cover' }}
          blurRadius={6}
        />
        <View style={styles.overlayTop} />
        <LinearGradient
          colors={['rgba(16,7,7,0.0)', 'rgba(16,7,7,0.35)', 'rgba(16,7,7)']}
          locations={[0, 0.45, 1]}
          style={styles.overlayBottom}
        />
        <View style={styles.heroContent}>
          <TouchableOpacity style={styles.lang} onPress={goBack}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.lang}>
            <Ionicons name="globe" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="restaurant" size={26} color="#fff" />
            </View>
            <View>
              <Text style={styles.logo}>Yummy</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>AI Powered</Text>
              </View>
            </View>
          </View>
          <Text style={styles.subtitle}>Khám phá và thưởng thức ẩm thực Việt</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.switchRow}>
          <TouchableOpacity style={[styles.switchBtn, styles.switchActive]}>
            <Text style={styles.switchActiveText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.switchBtn}>
            <Text style={styles.switchText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Email hoặc tên đăng nhập</Text>
          <View style={styles.input}>
            <Ionicons name="mail" size={18} color={textMuted} />
            <TextInput
              placeholder="hello@yummy.vn"
              placeholderTextColor={textMuted}
              style={styles.inputField}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.input}>
            <Ionicons name="lock-closed" size={18} color={textMuted} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={textMuted}
              secureTextEntry
              style={styles.inputField}
              value={password}
              onChangeText={setPassword}
            />
            <Ionicons name="eye-off" size={18} color={textMuted} />
          </View>
        </View>
        <Text style={styles.forgot}>Quên mật khẩu?</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
          <Text style={styles.primaryText}>Đăng nhập</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>HOẶC TIẾP TỤC VỚI</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialBtn, styles.socialGoogle]}>
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={styles.socialGoogleText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, styles.socialFacebook]}>
            <Ionicons name="logo-facebook" size={18} color="#fff" />
            <Text style={styles.socialFacebookText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.register}>
          Bạn chưa có tài khoản?{' '}
          <Text style={{ color: '#ff6969', fontWeight: '800' }}>Đăng ký ngay</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  hero: { height: 200, backgroundColor: '#000', position: 'relative' },
  overlayTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  overlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  heroContent: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    gap: 12,
  },
  content: {
    flex: 1,
    padding: 22,
    backgroundColor: '#100707',
    paddingTop: 12,
  },
  lang: {
    alignSelf: 'flex-end',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d11f2f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d11f2f',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  tag: {
    backgroundColor: 'rgba(209,31,47,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  tagText: { color: '#fbc02d', fontWeight: '800' },
  subtitle: {
    color: textLight,
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  switchBtn: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: '#2f1c1c',
    borderWidth: 1,
    borderColor: '#3a1f1f',
  },
  switchText: { color: textMuted, fontWeight: '700' },
  switchActiveText: { color: '#fff', fontWeight: '800' },
  fieldBlock: { marginTop: 20, gap: 6 },
  label: { color: '#dcdcdc', fontSize: 13, fontWeight: '800', marginLeft: 2 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#3a1f1f',
  },
  inputField: { flex: 1, color: textLight },
  forgot: {
    color: '#ff6969',
    alignSelf: 'flex-end',
    marginTop: 10,
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
    gap: 8,
  },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  dividerText: { color: textMuted, fontSize: 12, letterSpacing: 1 },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  socialBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialGoogle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  socialGoogleText: { color: '#202124', fontWeight: '800' },
  socialFacebook: {
    backgroundColor: '#1877F2',
  },
  socialFacebookText: { color: '#fff', fontWeight: '800' },
  googleIcon: { width: 18, height: 18 },
  register: {
    color: textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
