import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router'; // Thêm Stack để ẩn header
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Dùng hook này thay vì Component SafeAreaView

const { width } = Dimensions.get('window');

// THEME COLORS
const COLORS = {
  primary: '#E53935',
  white: '#FFFFFF',
  shutterBorder: 'rgba(255, 255, 255, 0.6)',
  shutterInner: '#FFFFFF',
};

export default function AIFoodModeScreen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const insets = useSafeAreaInsets(); // Lấy thông số vùng an toàn (tai thỏ, home bar)

  // Permissions & States
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');

  // Animation
  const captureScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const toggleFlash = () => {
    setFlashMode((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);

    // Animation nút chụp
    Animated.sequence([
      Animated.timing(captureScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(captureScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        router.push({
          pathname: '/ai-council',
          params: { imageUri: photo.uri },
        });
      }
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    } finally {
      setIsCapturing(false);
    }
  };

  const openGallery = async () => {
    if (isPickingImage || isCapturing) return;
    try {
      setIsPickingImage(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1.0,
      });

      if (!result.canceled && result.assets?.[0]) {
        let finalUri = result.assets[0].uri;
        // Xử lý HEIC nếu cần (giữ logic cũ)
        if (finalUri.toLowerCase().includes('heic')) {
          const manipulated = await ImageManipulator.manipulateAsync(finalUri, [], {
            format: ImageManipulator.SaveFormat.JPEG,
            compress: 1,
          });
          finalUri = manipulated.uri;
        }
        router.push({ pathname: '/ai-council', params: { imageUri: finalUri } });
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    } finally {
      setIsPickingImage(false);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" />
        <Text style={{ color: '#fff', marginBottom: 20 }}>Cần quyền truy cập Camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permBtnText}>Cấp quyền ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ẩn Header mặc định của Router và làm trong suốt Status Bar */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Camera tràn viền */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef} flash={flashMode}>
        <View style={styles.overlayContainer}>
          {/* 1. TOP GRADIENT & CONTROLS */}
          {/* Gradient nằm ở lớp dưới cùng của vùng Top */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={[styles.topGradient, { paddingTop: insets.top + 10 }]} // +10 padding cho thoáng
          >
            <View style={styles.topBarContent}>
              <TouchableOpacity onPress={goBack} style={styles.iconButton}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>

              <View style={styles.pillContainer}>
                <Ionicons name="sparkles" size={14} color="#FFD700" />
                <Text style={styles.pillText}>AI Food Lens</Text>
              </View>

              <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                <Ionicons
                  name={flashMode === 'on' ? 'flash' : 'flash-off'}
                  size={24}
                  color={flashMode === 'on' ? '#FFD700' : '#FFF'}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* 2. CENTER FRAME (Giữ nguyên khung ngắm tinh tế) */}
          <View style={styles.centerFocusArea}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>

          {/* 3. BOTTOM GRADIENT & CONTROLS */}
          {/* Gradient tràn xuống tận đáy màn hình */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={[styles.bottomGradient, { paddingBottom: insets.bottom + 20 }]}
          >
            <View style={styles.bottomControls}>
              {/* Gallery */}
              <TouchableOpacity
                onPress={openGallery}
                disabled={isPickingImage}
                style={styles.sideButton}
              >
                {isPickingImage ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Ionicons name="images" size={28} color="#FFF" />
                )}
              </TouchableOpacity>

              {/* Shutter Button */}
              <TouchableOpacity onPress={takePicture} disabled={isCapturing} activeOpacity={0.8}>
                <Animated.View
                  style={[styles.shutterOuter, { transform: [{ scale: captureScale }] }]}
                >
                  <View style={styles.shutterInner}>
                    {isCapturing && <ActivityIndicator color={COLORS.primary} />}
                  </View>
                </Animated.View>
              </TouchableOpacity>

              {/* Tip Button */}
              <TouchableOpacity style={styles.sideButton}>
                <Ionicons name="bulb-outline" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionText}>Chạm để chụp và phân tích</Text>
          </LinearGradient>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Top Bar
  topGradient: {
    paddingBottom: 20, // Độ lan của gradient xuống dưới
    width: '100%',
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pillText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Focus Frame
  centerFocusArea: {
    flex: 1,
    marginHorizontal: 40,
    // Căn giữa tương đối để không bị dính vào Top/Bottom bar
    marginTop: 80,
    marginBottom: 80,
    justifyContent: 'space-between',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: 'rgba(255,255,255,0.7)',
    borderWidth: 2,
    borderRadius: 4,
  },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  // Bottom Controls
  bottomGradient: {
    paddingTop: 60, // Độ lan của gradient lên trên
    width: '100%',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  sideButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shutterOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: COLORS.shutterBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: COLORS.shutterInner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },

  // Permissions UI
  permBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
