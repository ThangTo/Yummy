import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const bg =
  'https://images.unsplash.com/photo-1604908177443-00ac5d1e5f7d?auto=format&fit=crop&w=900&q=80';

export default function AIFoodModeScreen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [flashAnimation] = useState(new Animated.Value(0));
  const [captureScale] = useState(new Animated.Value(1));

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    // TODO: Implement actual mute functionality if needed
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) {
      console.warn('Camera ref không sẵn sàng hoặc đang chụp');
      return;
    }

    setIsCapturing(true);

    // Animation: Scale down button
    Animated.sequence([
      Animated.timing(captureScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(captureScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Flash effect
    Animated.sequence([
      Animated.timing(flashAnimation, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Kiểm tra xem ref có method chụp ảnh không
      if (!cameraRef.current) {
        throw new Error('Camera ref không tồn tại');
      }

      // Với CameraView trong expo-camera 17, thử dùng method takePictureAsync
      // Nếu không có, có thể cần dùng cách khác
      if (!cameraRef.current) {
        throw new Error('Camera ref không tồn tại');
      }

      // Thử gọi takePictureAsync trực tiếp
      const photo = await (cameraRef.current as any).takePictureAsync({
        quality: 1.0, // Chất lượng cao nhất để AI dự đoán chính xác
        base64: false,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Không thể chụp ảnh - không có URI');
      }

      console.log('Ảnh đã chụp:', photo.uri);

      // Navigate ngay đến màn hình Hội đồng AI (scan sẽ được thực hiện ở đó)
      console.log('📸 Navigating to ai-council immediately...');
      router.push({
        pathname: '/ai-council',
        params: {
          imageUri: photo.uri,
        },
      });
    } catch (err: any) {
      console.error('Lỗi khi chụp/scan ảnh:', err);

      // Hiển thị thông báo lỗi cho user
      Alert.alert(
        'Lỗi',
        err.message || 'Không thể chụp ảnh hoặc phân tích món ăn. Vui lòng thử lại.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const openGallery = async () => {
    console.log('📸 openGallery called');

    if (isPickingImage || isCapturing) {
      console.log('⚠️ Already picking or capturing, ignoring');
      return;
    }

    try {
      console.log('📸 Setting isPickingImage to true');
      setIsPickingImage(true);

      // Request permission để truy cập thư viện ảnh
      console.log('📸 Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📸 Permission status:', status);

      if (status !== 'granted') {
        console.log('❌ Permission denied');
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.', [
          { text: 'OK' },
        ]);
        setIsPickingImage(false);
        return;
      }

      // Mở image picker
      console.log('📸 Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Tắt editing để đơn giản hóa
        quality: 1.0, // Chất lượng cao nhất để AI dự đoán chính xác
      });

      console.log('📸 Image picker result:', {
        canceled: result.canceled,
        assetsCount: result.assets?.length || 0,
      });

      if (result.canceled) {
        console.log('📸 User cancelled image picker');
        setIsPickingImage(false);
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('Không có ảnh được chọn');
      }

      const selectedImage = result.assets[0];
      console.log('✅ Ảnh đã chọn:', selectedImage.uri);
      console.log('📸 Image info:', {
        uri: selectedImage.uri,
        width: selectedImage.width,
        height: selectedImage.height,
        type: selectedImage.type,
      });

      // Convert HEIC/HEIF sang JPEG nếu cần
      let finalImageUri = selectedImage.uri;
      const uriLower = selectedImage.uri.toLowerCase();
      const isHeic =
        uriLower.endsWith('.heic') ||
        uriLower.endsWith('.heif') ||
        uriLower.includes('heic') ||
        uriLower.includes('heif');

      if (isHeic) {
        console.log('🔄 Converting HEIC to JPEG...');
        try {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            selectedImage.uri,
            [], // Không resize, chỉ convert format
            {
              compress: 1.0, // Chất lượng cao nhất để AI dự đoán chính xác
              format: ImageManipulator.SaveFormat.JPEG,
            },
          );
          finalImageUri = manipulatedImage.uri;
          console.log('✅ Converted to JPEG:', finalImageUri);
        } catch (convertError: any) {
          console.error('❌ Error converting HEIC:', convertError);
          Alert.alert(
            'Lỗi',
            'Không thể chuyển đổi ảnh HEIC. Vui lòng chọn ảnh khác (JPEG hoặc PNG).',
            [{ text: 'OK' }],
          );
          setIsPickingImage(false);
          return;
        }
      }

      // Navigate ngay đến màn hình Hội đồng AI (scan sẽ được thực hiện ở đó)
      console.log('📸 Navigating to ai-council immediately...');
      router.push({
        pathname: '/ai-council',
        params: {
          imageUri: finalImageUri, // Dùng URI đã convert
        },
      });
    } catch (err: any) {
      console.error('❌ Lỗi khi chọn/scan ảnh:', err);
      console.error('❌ Error stack:', err.stack);

      Alert.alert(
        'Lỗi',
        err.message || 'Không thể chọn ảnh hoặc phân tích món ăn. Vui lòng thử lại.',
        [{ text: 'OK' }],
      );
    } finally {
      console.log('📸 Setting isPickingImage to false');
      setIsPickingImage(false);
    }
  };

  const viewAchievements = () => {
    // TODO: Navigate to achievements screen
    console.log('View achievements');
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={{ color: '#fff' }}>Đang yêu cầu quyền camera...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={{ color: '#fff', marginBottom: 8 }}>Không có quyền camera.</Text>
        <TouchableOpacity style={styles.navBack} onPress={goBack}>
          <Ionicons name="arrow-back" size={16} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 6 }}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={{ uri: bg }} style={styles.bg} imageStyle={{ opacity: 0.35 }}>
        <CameraView style={styles.camera} facing="back" ref={cameraRef} />
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={goBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.modeTag}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.modeText}>AI FOOD MODE</Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleMute}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Flash overlay */}
        <Animated.View
          style={[
            styles.flashOverlay,
            {
              opacity: flashAnimation,
            },
          ]}
          pointerEvents="none"
        />

        <View style={styles.frame}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerRight]} />
          <View style={[styles.corner, styles.cornerBottom]} />
          <View style={[styles.corner, styles.cornerBottom, styles.cornerRight]} />
          <View style={styles.centerLine} />
          <View style={styles.plus}>
            <Text style={styles.plusText}>+</Text>
          </View>
        </View>

        <View style={styles.tipContainer}>
          <View style={styles.bulb}>
            <Ionicons name="bulb" size={18} color="#f6c453" />
          </View>
          <Text style={styles.tipText}>Mẹo: Cạnh góc 45 độ để món ngon nhất!</Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={openGallery}
            activeOpacity={0.7}
            disabled={isPickingImage || isCapturing}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPickingImage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="images" size={22} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButtonContainer}
            onPress={takePicture}
            activeOpacity={0.9}
            disabled={isCapturing}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Animated.View
              style={[
                styles.captureButton,
                {
                  transform: [{ scale: captureScale }],
                },
              ]}
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color="#f13b3c" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={viewAchievements}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trophy" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.nav}>
          <Text style={styles.navMuted}>VIDEO</Text>
          <Text style={styles.navActive}>PHOTO</Text>
          <Text style={styles.navMuted}>SCAN</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, justifyContent: 'space-between' },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 24,
  },
  modeText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  frame: {
    marginTop: 60,
    marginHorizontal: 40,
    height: 320,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#f13b3c',
    top: 0,
    left: 0,
    borderTopLeftRadius: 12,
  },
  cornerRight: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 0,
  },
  cornerBottom: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 12,
  },
  centerLine: {
    position: 'absolute',
    width: '80%',
    height: 3,
    backgroundColor: '#f13b3c',
  },
  plus: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  tipContainer: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(246,196,83,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    color: '#fff',
    fontWeight: '700',
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
    marginTop: 24,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  captureButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#f13b3c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#1b0f0f',
    shadowColor: '#f13b3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#efefef',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  nav: {
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  navMuted: {
    color: '#e2d5d5',
    opacity: 0.55,
    letterSpacing: 1.2,
  },
  navActive: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
