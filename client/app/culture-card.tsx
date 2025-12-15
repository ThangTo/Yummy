import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/use-auth';
import { usePassport } from '../hooks/use-passport';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');
const bg = '#1b0f0f';
const card = '#261515';
const textLight = '#f8f2f2';
const textMuted = '#c5b8b8'; // Thêm màu xám nhạt
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
  const { isLoggedIn, user, refreshUser } = useAuth();
  const { passport, refreshPassport } = usePassport();

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
    Alert.alert('Tính năng sắp có', 'Tính năng nghe phát âm sẽ sớm được cập nhật.');
  };

  const isCollected = useMemo(() => {
    if (!cultureData || !passport?.food_passport) return false;
    return passport.food_passport.some((f) => f.food_id === cultureData.food_id);
  }, [cultureData, passport?.food_passport]);

  const handleSave = async () => {
    if (!cultureData) return;
    if (!isLoggedIn || !user) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập để sưu tầm và mở khóa hộ chiếu.', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng nhập',
          onPress: () => router.push('/login'),
        },
      ]);
      return;
    }

    if (isCollected) {
      Alert.alert('Thông báo', 'Bạn đã có thẻ này trong bộ sưu tập.');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.checkIn(
        user.id,
        cultureData.food_id,
        cultureData.image,
        cultureData.province_name,
      );
      await Promise.all([refreshUser(), refreshPassport()]);
      Alert.alert('Đã sưu tầm', 'Món ăn đã được lưu vào hộ chiếu & mở khóa tỉnh tương ứng.');
    } catch (err: any) {
      console.error('Collect error:', err);
      Alert.alert('Lỗi', err?.message || 'Không thể sưu tầm, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

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

  // --- PHẦN THIẾT KẾ LẠI GIAO DIỆN LỖI / KHÔNG TÌM THẤY ---
  if (error || !cultureData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRowPadding}>
          <TouchableOpacity onPress={goBack} style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={20} color={textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.radarContainer}>
            <View style={[styles.radarCircle, { width: 200, height: 200, opacity: 0.1 }]} />
            <View style={[styles.radarCircle, { width: 150, height: 150, opacity: 0.2 }]} />
            <View style={[styles.radarCircle, { width: 100, height: 100, opacity: 0.3 }]} />

            <View style={styles.emptyIconCircle}>
              <Ionicons name="search" size={40} color={primary} />
            </View>
          </View>

          <Text style={styles.emptyTitle}>Lạc lối rồi?</Text>
          <Text style={styles.emptyDesc}>
            Chúng tôi không tìm thấy thẻ bài văn hóa nào.
            {'\n'}Có thể đường dẫn bị lỗi hoặc dữ liệu chưa được cập nhật.
          </Text>

          <TouchableOpacity style={styles.goHomeBtn} onPress={goBack}>
            <View style={[styles.goHomeGradient, { backgroundColor: primary }]}>
              <Text style={styles.goHomeText}>Quay về trang chủ</Text>
              <Ionicons name="home" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  // -----------------------------------------------------------

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

          {!isCollected && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.saveText}>Sưu tầm ngay</Text>
            </TouchableOpacity>
          )}
          {isCollected && (
            <View style={[styles.saveButton, { backgroundColor: '#2d2d2d' }]}>
              <Ionicons name="checkmark-done" size={18} color="#9be59b" />
              <Text style={[styles.saveText, { color: '#9be59b' }]}>Đã có thẻ</Text>
            </View>
          )}
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

  // --- STYLES CHO EMPTY STATE (MỚI) ---
  headerRowPadding: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -40, // Đẩy lên một chút để cân đối
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  radarCircle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: primary,
    backgroundColor: 'transparent',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(209, 31, 47, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: primary,
    shadowColor: primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDesc: {
    color: textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  goHomeBtn: {
    width: '100%',
    shadowColor: primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  goHomeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    gap: 10,
  },
  goHomeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
