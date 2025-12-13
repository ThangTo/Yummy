import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  loadProvincesGeoJSON,
  normalizeProvinceName,
  ProvinceFeature,
} from '../utils/geojsonLoader';

const primary = '#d11f2f';
const bg = '#1b0f0f';

interface VietnamMapProps {
  unlockedProvinces: string[]; // Danh sách tên tỉnh đã unlock (ví dụ: ["Hà Nội", "Hồ Chí Minh"])
  onProvincePress?: (provinceName: string) => void;
}

export default function VietnamMap({ unlockedProvinces, onProvincePress }: VietnamMapProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);
  const [provinces, setProvinces] = useState<ProvinceFeature[]>([]);

  // Load GeoJSON data khi component mount
  useEffect(() => {
    loadProvincesGeoJSON()
      .then((data) => {
        setProvinces(data);
      })
      .catch((error) => {
        console.error('Failed to load provinces:', error);
      });
  }, []);

  // Lấy Google Maps API key từ config
  // API key được cấu hình trong app.json plugin config
  // Với Expo, API key sẽ được inject vào native code khi build
  // Ở đây chúng ta chỉ cần chọn provider phù hợp

  // Chọn provider:
  // QUAN TRỌNG: customMapStyle chỉ hoạt động với PROVIDER_GOOGLE (Google Maps)
  // Apple Maps (PROVIDER_DEFAULT) KHÔNG hỗ trợ customMapStyle
  // Vì vậy chúng ta phải dùng PROVIDER_GOOGLE để có thể tùy chỉnh màu sắc
  //
  // Lưu ý:
  // - Android: luôn dùng Google Maps (PROVIDER_GOOGLE) - cần API key trong app.json
  // - iOS: phải dùng PROVIDER_GOOGLE để customMapStyle hoạt động (cần API key)
  // - Nếu không có API key, map vẫn hiển thị nhưng có watermark và có thể không áp dụng style đầy đủ
  const mapProvider = PROVIDER_GOOGLE;

  useEffect(() => {
    if (unlockedProvinces.length > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15, // Giảm xuống 1.15 để đảm bảo không bị cắt
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [pulseAnim, unlockedProvinces]);

  // Kiểm tra tỉnh có unlock không
  const isProvinceUnlocked = (provinceName: string): boolean => {
    const normalized = normalizeProvinceName(provinceName);
    const isUnlocked = unlockedProvinces.some((unlocked) => {
      const unlockedNormalized = normalizeProvinceName(unlocked);
      const match = unlockedNormalized === normalized;
      if (match) {
        console.log(
          `✅ Match: "${provinceName}" (${normalized}) === "${unlocked}" (${unlockedNormalized})`,
        );
      }
      return match;
    });

    // Debug: Log tất cả tỉnh để kiểm tra
    if (provinceName.includes('Hà Nội') || provinceName.includes('Hồ Chí Minh')) {
      console.log(`🔍 Checking: "${provinceName}" -> normalized: "${normalized}"`);
      console.log(
        `   Unlocked list:`,
        unlockedProvinces.map((u) => `"${u}" (${normalizeProvinceName(u)})`),
      );
      console.log(`   Result: ${isUnlocked ? '✅ UNLOCKED' : '❌ LOCKED'}`);
    }

    return isUnlocked;
  };

  // Tọa độ trung tâm Việt Nam - zoom để hiển thị toàn bộ đất nước
  const vietnamCenter = {
    latitude: 16.0583,
    longitude: 108.2772,
    latitudeDelta: 12,
    longitudeDelta: 10,
  };

  // Custom map style: Dark theme + chỉ highlight Việt Nam, ẩn/làm tối các nước khác
  // Điều chỉnh để map sáng hơn một chút nhưng vẫn giữ dark theme
  const customMapStyle = [
    // Background chung - màu tối nhưng sáng hơn
    {
      elementType: 'geometry',
      stylers: [{ color: '#2a1f1f' }], // Sáng hơn từ #1b0f0f
    },
    // Labels text - màu xám nhạt
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#c5b8b8' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1b0f0f' }, { width: 0.5 }],
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    // Nước (biển) - màu tối
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#2a1a1a' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#4a3a3a' }],
    },
    // Đường xá - màu tối
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#2a1a1a' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#3a2a2a' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b5b5b' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#3a2a2a' }],
    },
    // Landscape (đất liền) - màu tối nhưng sáng hơn
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#2a1f1f' }], // Sáng hơn từ #1b0f0f
    },
    // Ẩn hoàn toàn labels của các nước
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'off' }],
    },
    // Làm mờ borders của các nước khác
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#2a1a1a' }, { weight: 0.5 }],
    },
    // Highlight các tỉnh/thành phố trong Việt Nam - màu sáng hơn
    {
      featureType: 'administrative.province',
      elementType: 'geometry',
      stylers: [{ color: '#2a1a1a' }],
    },
    {
      featureType: 'administrative.province',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#3a2a2a' }, { weight: 0.5 }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#c5b8b8' }],
    },
    // Ẩn POI (points of interest) không cần thiết
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#2a1a1a' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    // Transit (giao thông công cộng) - ẩn
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2a1a1a' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [{ color: '#2a1a1a' }],
    },
  ];

  // Hàm để giữ map trong phạm vi Việt Nam (tùy chọn - có thể bỏ qua để user tự do zoom)
  const handleRegionChangeComplete = (region: Region, details?: any) => {
    // Có thể thêm logic để tự động điều chỉnh nếu map bị kéo quá xa
    // Nhưng để user tự do hơn, chúng ta chỉ dùng minZoomLevel và maxZoomLevel
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={mapProvider}
        style={styles.map}
        initialRegion={vietnamCenter}
        mapType="standard" // Có thể thử "hybrid" hoặc "satellite" nếu customMapStyle không hoạt động
        customMapStyle={customMapStyle} // Chỉ hoạt động với PROVIDER_GOOGLE và cần API key đầy đủ
        scrollEnabled={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
        minZoomLevel={5.5} // Giới hạn zoom out - không cho zoom ra quá xa để thấy các nước khác
        maxZoomLevel={15} // Giới hạn zoom in
        pitchEnabled={false}
        rotateEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* Vẽ polygon cho từng tỉnh */}
        {provinces.map((province, index) => {
          const unlocked = isProvinceUnlocked(province.name);

          return province.coordinates.map((coords, polyIndex) => (
            <Polygon
              key={`${province.name}-${index}-${polyIndex}`}
              coordinates={coords}
              fillColor={
                unlocked
                  ? 'rgba(100, 70, 60, 0.25)' // Unlock: màu nâu sáng (làm sáng tỉnh)
                  : 'rgba(20, 15, 15, 0.5)'
              } // Lock: màu đen mờ (làm tối tỉnh)
              strokeColor={
                unlocked
                  ? 'rgba(209, 31, 47, 0.6)' // Border đỏ sáng cho tỉnh unlock
                  : 'rgba(50, 40, 40, 0.3)'
              } // Border mờ cho tỉnh lock
              strokeWidth={unlocked ? 2 : 1}
              tappable={true}
              onPress={() => onProvincePress?.(province.name)}
            />
          ));
        })}

        {/* Markers cho các tỉnh đã unlock */}
        {provinces
          .filter((province) => isProvinceUnlocked(province.name) && province.center)
          .map((province, index) => (
            <Marker
              key={`marker-${province.name}-${index}`}
              coordinate={province.center!}
              title={province.name}
              description="Đã mở khóa"
              anchor={{ x: 0.5, y: 0.5 }} // Anchor ở giữa marker
              onPress={() => onProvincePress?.(province.name)}
            >
              <View style={styles.markerContainer} collapsable={false}>
                <Animated.View
                  style={[
                    styles.pulseCircle,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                  collapsable={false}
                />
                <View style={styles.markerUnlocked} collapsable={false}>
                  <Ionicons name="restaurant" size={14} color={primary} />
                </View>
              </View>
            </Marker>
          ))}
      </MapView>

      {/* Overlay tối màu - giảm độ tối để map sáng hơn */}
      {/* Chỉ hiển thị overlay nếu customMapStyle chưa hoạt động đầy đủ */}
      {/* Tạm thời comment để map sáng hơn */}
      {/* <View style={styles.darkOverlay} pointerEvents="none" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: bg,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48, // Giảm thêm xuống 48
    height: 48, // Giảm thêm xuống 48
    overflow: 'visible', // Cho phép hiệu ứng vượt ra ngoài
  },
  pulseCircle: {
    position: 'absolute',
    width: 36, // Giảm xuống 36 (khi scale 1.15 = 41.4px, vẫn trong 48px)
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(209,31,47,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(209,31,47,0.5)',
  },
  markerUnlocked: {
    width: 28, // Giảm xuống 28
    height: 28, // Giảm xuống 28
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: primary,
    shadowColor: primary,
    shadowOpacity: 0.6,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 5,
  },
  markerLocked: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4a3a3a',
    opacity: 0.6,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 15, 15, 0.15)', // Giảm độ tối từ 0.3 xuống 0.15
    pointerEvents: 'none',
  },
});
