import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/use-auth';

const { width, height } = Dimensions.get('window');

// Một ảnh nền món ăn Việt Nam (Phở/Bún bò) nhìn hấp dẫn hơn
const BG_IMAGE =
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1000&auto=format&fit=crop';

// THEME COLORS
const COLORS = {
  primary: '#E53935',
  primaryDark: '#B71C1C',
  textLight: '#FFFFFF',
  textGrey: '#B0B0B0',
  inputBg: 'rgba(255, 255, 255, 0.08)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  socialBg: 'rgba(255, 255, 255, 0.1)',
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();

  // Logic States (Giữ nguyên)
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleLogin = async () => {
    if (!emailOrUsername.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await login({
        emailOrUsername: emailOrUsername.trim(),
        password: password.trim(),
      });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await register({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });
    } catch (err: any) {
      console.error('Register error:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper render Input để code gọn hơn
  const renderInput = (
    icon: any,
    placeholder: string,
    value: string,
    setValue: (val: string) => void,
    isSecure = false,
    showPassState = false,
    setShowPassState = (val: boolean) => {},
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={COLORS.textGrey} />
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#666"
        style={styles.inputField}
        value={value}
        onChangeText={setValue}
        secureTextEntry={isSecure && !showPassState}
        autoCapitalize="none"
      />
      {isSecure && (
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassState(!showPassState)}>
          <Ionicons name={showPassState ? 'eye-off' : 'eye'} size={20} color={COLORS.textGrey} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. Full Screen Background */}
      <ImageBackground source={{ uri: BG_IMAGE }} style={styles.bgImage} resizeMode="cover">
        {/* Overlay gradient để làm tối nền, giúp text dễ đọc */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#0F0F0F']}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 2. Logo & Branding */}
            <View style={styles.brandSection}>
              <View style={styles.logoCircle}>
                <Ionicons name="restaurant" size={32} color="#FFF" />
              </View>
              <Text style={styles.appName}>Yummy</Text>
              <Text style={styles.tagline}>Hành trình vị giác Việt</Text>
            </View>

            {/* 3. Main Form Card */}
            <View style={styles.formCard}>
              {/* Toggle Switch */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabBtn, !isRegisterMode && styles.tabActive]}
                  onPress={() => setIsRegisterMode(false)}
                >
                  <Text style={[styles.tabText, !isRegisterMode && styles.tabTextActive]}>
                    Đăng nhập
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, isRegisterMode && styles.tabActive]}
                  onPress={() => setIsRegisterMode(true)}
                >
                  <Text style={[styles.tabText, isRegisterMode && styles.tabTextActive]}>
                    Đăng ký
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Form Fields */}
              <View style={styles.inputsSection}>
                {isRegisterMode ? (
                  <>
                    {renderInput('person-outline', 'Tên đăng nhập', username, setUsername)}
                    {renderInput('mail-outline', 'Email', email, setEmail)}
                    {renderInput(
                      'lock-closed-outline',
                      'Mật khẩu',
                      password,
                      setPassword,
                      true,
                      showPassword,
                      setShowPassword,
                    )}
                    {renderInput(
                      'shield-checkmark-outline',
                      'Xác nhận mật khẩu',
                      confirmPassword,
                      setConfirmPassword,
                      true,
                      showConfirmPassword,
                      setShowConfirmPassword,
                    )}
                  </>
                ) : (
                  <>
                    {renderInput(
                      'person-outline',
                      'Email hoặc Username',
                      emailOrUsername,
                      setEmailOrUsername,
                    )}
                    {renderInput(
                      'lock-closed-outline',
                      'Mật khẩu',
                      password,
                      setPassword,
                      true,
                      showPassword,
                      setShowPassword,
                    )}
                    <TouchableOpacity style={styles.forgotPassBtn}>
                      <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
                onPress={isRegisterMode ? handleRegister : handleLogin}
                disabled={isLoading}
              >
                <View style={[styles.gradientBtn, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.primaryBtnText}>
                    {isLoading ? 'Đang xử lý...' : isRegisterMode ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
                  </Text>
                  {!isLoading && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
                </View>
              </TouchableOpacity>

              {/* Social Login */}
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-google" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-facebook" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-apple" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Footer Spacing */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // Branding
  brandSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textGrey,
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  // Form Card
  formCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.85)', // Glass effect darken
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    color: COLORS.textGrey,
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.textLight,
    fontWeight: 'bold',
  },

  // Inputs
  inputsSection: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    height: 56,
  },
  iconBox: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 16,
    height: '100%',
  },
  eyeBtn: {
    paddingHorizontal: 16,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPassText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Buttons
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    flex: 1,
  },

  // Social
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: COLORS.textGrey,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.socialBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
