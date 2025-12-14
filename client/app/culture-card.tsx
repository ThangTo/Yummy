import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';

const bg = '#1b0f0f';
const card = '#261515';
const textLight = '#f8f2f2';
const primary = '#d11f2f';

interface CultureCardData {
  name_vi: string;
  province_name: string;
  story: string;
  how_to_eat?: string;
  food_id: string;
  name_key: string;
  image?: string;
}

export default function CultureCardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ foodId?: string }>();
  const [cultureData, setCultureData] = useState<CultureCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCultureCard = async () => {
      if (!params.foodId) {
        setError('Không có ID món ăn');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getCultureCard(params.foodId);
        console.log('📸 Culture Card - Received data:', data);
        console.log('📸 Culture Card - Image URL:', data.image);
        setCultureData(data);
      } catch (err: any) {
        console.error('Error fetching culture card:', err);
        setError(err.message || 'Không thể tải thông tin văn hóa');
        Alert.alert('Lỗi', 'Không thể tải thông tin văn hóa. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCultureCard();
  }, [params.foodId]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleListen = () => {
    // TODO: Implement text-to-speech
    Alert.alert('Tính năng sắp có', 'Tính năng nghe phát âm sẽ sớm được cập nhật.');
  };

  const handleSave = () => {
    // TODO: Implement save to collection
    Alert.alert('Tính năng sắp có', 'Tính năng sưu tầm sẽ sớm được cập nhật.');
  };

  // Helper function để xác định vùng miền từ tên tỉnh
  const getRegionFromProvince = (provinceName: string): string => {
    const northProvinces = [
      'Hà Nội',
      'Hải Phòng',
      'Nam Định',
      'Thái Bình',
      'Hải Dương',
      'Hưng Yên',
      'Bắc Ninh',
      'Vĩnh Phúc',
      'Quảng Ninh',
      'Lào Cai',
      'Yên Bái',
      'Tuyên Quang',
      'Lạng Sơn',
      'Cao Bằng',
      'Bắc Kạn',
      'Thái Nguyên',
      'Phú Thọ',
      'Bắc Giang',
      'Hà Giang',
      'Điện Biên',
      'Lai Châu',
      'Sơn La',
      'Hòa Bình',
    ];
    const centralProvinces = [
      'Thanh Hóa',
      'Nghệ An',
      'Hà Tĩnh',
      'Quảng Bình',
      'Quảng Trị',
      'Thừa Thiên Huế',
      'Đà Nẵng',
      'Quảng Nam',
      'Quảng Ngãi',
      'Bình Định',
      'Phú Yên',
      'Khánh Hòa',
      'Ninh Thuận',
      'Bình Thuận',
    ];
    const southProvinces = [
      'TP. Hồ Chí Minh',
      'Cần Thơ',
      'An Giang',
      'Bà Rịa - Vũng Tàu',
      'Bạc Liêu',
      'Bến Tre',
      'Bình Dương',
      'Bình Phước',
      'Cà Mau',
      'Đồng Nai',
      'Đồng Tháp',
      'Hậu Giang',
      'Kiên Giang',
      'Long An',
      'Sóc Trăng',
      'Tây Ninh',
      'Tiền Giang',
      'Trà Vinh',
      'Vĩnh Long',
    ];

    if (northProvinces.includes(provinceName)) return 'MIỀN BẮC';
    if (centralProvinces.includes(provinceName)) return 'MIỀN TRUNG';
    if (southProvinces.includes(provinceName)) return 'MIỀN NAM';
    return 'VIỆT NAM';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={styles.loadingText}>Đang tải thông tin văn hóa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !cultureData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="close" size={22} color={textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thẻ bài văn hóa</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={textLight} />
          <Text style={styles.errorText}>{error || 'Không tìm thấy thông tin'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={goBack}>
            <Text style={styles.retryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="close" size={22} color={textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thẻ bài văn hóa</Text>
          <Ionicons name="ellipsis-horizontal" size={22} color={textLight} />
        </View>

        <View style={styles.cardContainer}>
          {cultureData.image && cultureData.image.trim() !== '' ? (
            <Image
              source={{ uri: cultureData.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={64} color="#666" />
              <Text style={styles.placeholderText}>Chưa có ảnh</Text>
            </View>
          )}

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: '#b3b3b3' }]}>
              <Text style={styles.badgeTextDark}>
                {getRegionFromProvince(cultureData.province_name)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: primary }]}>
              <Text style={styles.badgeTextLight}>ĐẶC SẢN</Text>
            </View>
          </View>

          <Text style={styles.title}>
            {cultureData.name_vi}
            {'\n'}
            {cultureData.province_name}
          </Text>

          <Text style={styles.sectionLabel}>✨ CÂU CHUYỆN VĂN HÓA</Text>
          <Text style={styles.story}>{cultureData.story}</Text>

          {cultureData.how_to_eat && (
            <>
              <Text style={styles.sectionLabel}>🍽️ CÁCH THƯỞNG THỨC</Text>
              <Text style={styles.story}>{cultureData.how_to_eat}</Text>
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.saveText}>Sưu tầm ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cardContainer: {
    backgroundColor: card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: 18,
  },
  placeholderImage: {
    backgroundColor: '#2d1b1b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d2b2b',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  badge: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeTextDark: {
    color: '#111',
    fontWeight: '800',
  },
  badgeTextLight: {
    color: '#fff',
    fontWeight: '800',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 10,
    lineHeight: 32,
  },
  listenButton: {
    marginTop: 10,
    backgroundColor: primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  listenText: { color: '#fff', fontWeight: '800' },
  sectionLabel: {
    marginTop: 18,
    color: '#ff6b6b',
    fontWeight: '900',
  },
  story: {
    color: textLight,
    marginTop: 8,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: textLight,
    marginTop: 16,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    color: textLight,
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
