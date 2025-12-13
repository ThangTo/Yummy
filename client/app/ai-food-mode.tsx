import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView, type CameraViewRef } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const bg =
  'https://images.unsplash.com/photo-1604908177443-00ac5d1e5f7d?auto=format&fit=crop&w=900&q=80';

export default function AIFoodModeScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraViewRef | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

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

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const data = await cameraRef.current.takePicture({
        quality: 0.7,
        base64: true,
        skipProcessing: true,
      });
      console.log('Ảnh đã chụp:', data?.uri);
      // TODO: Gửi ảnh lên backend / điều hướng kết quả
      alert('Đã chụp xong! Ảnh tạm lưu ở: ' + data?.uri);
    } catch (err) {
      console.warn('Chụp ảnh lỗi', err);
    }
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
        <CameraView
          style={styles.camera}
          facing="back"
          ref={(ref) => {
            cameraRef.current = ref as CameraViewRef | null;
          }}
        />
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={goBack}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.modeTag}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.modeText}>AI FOOD MODE</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={goBack}>
            <Ionicons name="volume-mute" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

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
          <TouchableOpacity style={styles.circleButton}>
            <Ionicons name="images" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton}>
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
  captureButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#f13b3c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#1b0f0f',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#efefef',
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
