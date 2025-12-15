import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/use-auth';
import { usePassport } from '../../hooks/use-passport';
import { apiService, type CommunityActivity, type FoodInfo } from '../../services/api';

// --- BẢNG MÀU TỐI GIẢN (CẬP NHẬT LẠI) ---
const bg = '#121212'; // Đen nhám (Màu bạn đã thích trước đó)
const card = '#1E1E1E'; // Xám đen (Để hợp với nền đen nhám)
const primary = '#d11f2f'; // Đỏ (Giữ nguyên làm điểm nhấn)
const textLight = '#FFFFFF';
const textMuted = '#A0A0A0';

export default function HomeScreen() {
  const { isLoggedIn, user } = useAuth();
  const { passport } = usePassport();
  const [foods, setFoods] = useState<FoodInfo[]>([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [foodsError, setFoodsError] = useState<string | null>(null);
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setIsLoadingFoods(true);
        setFoodsError(null);
        const res = await apiService.getFoodsByProvince();
        setFoods(res.slice(0, 10));
      } catch (error: any) {
        console.error('Error loading foods for home:', error);
        setFoodsError(error?.message || 'Không thể tải gợi ý món ăn');
      } finally {
        setIsLoadingFoods(false);
      }
    };

    const fetchActivities = async () => {
      try {
        setIsLoadingActivities(true);
        setActivitiesError(null);
        const res = await apiService.getRecentActivities();
        setActivities(res);
      } catch (error: any) {
        console.error('Error loading recent activities:', error);
        setActivitiesError(error?.message || 'Không thể tải hoạt động cộng đồng');
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchFoods();
    fetchActivities();
  }, []);

  const greetingName = isLoggedIn && user?.username ? user.username : 'bạn';

  const triedFoodIds = useMemo(() => {
    if (!isLoggedIn || !passport?.food_passport) return new Set<string>();
    return new Set<string>(passport.food_passport.map((f: any) => f.food_id));
  }, [isLoggedIn, passport?.food_passport]);

  const suggestionFoods = useMemo(() => {
    if (!foods.length) return [];
    if (!isLoggedIn || triedFoodIds.size === 0) {
      return foods.slice(0, 10);
    }
    const untried = foods.filter((f) => !triedFoodIds.has(f._id));
    return untried.slice(0, 10);
  }, [foods, isLoggedIn, triedFoodIds]);

  const progress = passport?.progress;
  const nextRank = progress?.next_rank || { name: 'Khách vãng lai', target: 1 };
  const currentCount = progress?.current ?? 0;
  const progressPercent =
    progress && nextRank.target > 0 ? Math.min((currentCount / nextRank.target) * 100, 100) : 0;
  const remaining = Math.max((nextRank.target || 0) - currentCount, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Xin chào, {greetingName}!</Text>
            <Text style={styles.question}>
              Hôm nay ăn gì nhỉ? <Text style={{ fontSize: 18 }}>😋</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.badge}>
            <Ionicons name="notifications" size={18} color={textLight} />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={textMuted} />
          <TextInput
            placeholder="Tìm món ăn, nhà hàng, địa điểm..."
            placeholderTextColor={textMuted}
            style={styles.searchInput}
          />
          <Ionicons name="options" size={18} color={textMuted} />
        </View>

        {/* PASSPORT CARD */}
        <View style={styles.passportCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.passportIcon}>
              <Ionicons name="medal" size={22} color={primary} />
            </View>
            <View>
              <Text style={styles.passportTitle}>Hộ chiếu Ẩm thực</Text>
              <Text style={styles.passportSub}>
                {isLoggedIn
                  ? `${
                      passport?.current_rank || user?.current_rank || 'Khách vãng lai'
                    } • ${currentCount} món`
                  : 'Đăng nhập để bắt đầu hành trình ẩm thực'}
              </Text>
            </View>
            {isLoggedIn && (
              <View style={styles.levelTag}>
                <Text style={styles.levelText}>{nextRank.name}</Text>
              </View>
            )}
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          {isLoggedIn ? (
            <>
              <Text style={styles.progressLabel}>
                Tiến độ thăng hạng {Math.round(progressPercent)}%
              </Text>
              <Text style={styles.passportFoot}>
                {remaining > 0
                  ? `Check-in thêm ${remaining} món để đạt “${nextRank.name}”`
                  : 'Bạn đã đạt danh hiệu cao nhất cho mốc này!'}
              </Text>
            </>
          ) : (
            <Text style={styles.passportFoot}>
              Đăng nhập và quét món để mở khóa bản đồ ẩm thực Việt Nam.
            </Text>
          )}
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActions}>
          {[
            { label: 'Gợi ý', icon: 'restaurant' },
            { label: 'Bản đồ', icon: 'map' },
            { label: 'BXH', icon: 'stats-chart' },
            { label: 'Yêu thích', icon: 'heart' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.quickItem}>
              <View style={styles.quickIcon}>
                <Ionicons name={item.icon as any} size={18} color={textLight} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GỢI Ý MÓN ĂN (Style Dọc Minimalist) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý hôm nay 🔥</Text>
          {suggestionFoods.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Xem thêm</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingLeft: 4 }}
        >
          {isLoadingFoods && (
            <View style={[styles.loadingCard]}>
              <ActivityIndicator color={primary} />
            </View>
          )}
          {foodsError && !isLoadingFoods && (
            <View style={[styles.loadingCard]}>
              <Text style={styles.suggestionSubtitle}>{foodsError}</Text>
            </View>
          )}

          {!isLoadingFoods &&
            !foodsError &&
            suggestionFoods.map((item) => (
              <TouchableOpacity key={item._id} style={styles.suggestionCard} activeOpacity={0.8}>
                <Image
                  source={{
                    uri:
                      (item as any).image ||
                      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80',
                  }}
                  style={styles.suggestionImage}
                />
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {item.name_vi}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons
                      name="location-sharp"
                      size={10}
                      color={textMuted}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                      {item.province_name}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>

        {/* CỘNG ĐỒNG KHÁM PHÁ (Style Card Tách Biệt - Không Footer) */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Cộng đồng khám phá</Text>
        </View>

        {isLoadingActivities && (
          <View style={styles.feedCardItem}>
            <ActivityIndicator color={primary} />
            <Text style={[styles.feedDesc, { marginTop: 8, textAlign: 'center' }]}>
              Đang tải hoạt động...
            </Text>
          </View>
        )}

        {activitiesError && !isLoadingActivities && (
          <View style={styles.feedCardItem}>
            <Text style={styles.feedDish}>Lỗi tải dữ liệu</Text>
            <Text style={styles.feedDesc}>{activitiesError}</Text>
          </View>
        )}

        {!isLoadingActivities && !activitiesError && activities.length === 0 && (
          <View style={styles.feedCardItem}>
            <Text style={styles.feedDesc}>
              Chưa có hoạt động nào. Hãy là người đầu tiên check-in!
            </Text>
          </View>
        )}

        {!isLoadingActivities &&
          !activitiesError &&
          activities.map((item, index) => (
            <View key={`${item.user_id}-${index}`} style={styles.feedCardItem}>
              {/* Header: Avatar + User + Time */}
              <View style={styles.feedHeader}>
                <Image
                  source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
                  style={styles.feedAvatar}
                />
                <View>
                  <Text style={styles.feedUser}>{item.username}</Text>
                  <Text style={styles.feedTime}>Vừa xong • {item.province_name}</Text>
                </View>
              </View>

              {/* Body: Text Content */}
              <View style={styles.feedBody}>
                <Text style={styles.feedText}>
                  Đã chinh phục món{' '}
                  <Text style={{ fontWeight: '700', color: primary }}>{item.food_name}</Text>. Hương
                  vị đậm đà khó quên! 😋
                </Text>
              </View>
            </View>
          ))}

        {/* CHECK-IN CARD */}
        <View style={styles.checkinCard}>
          <View style={styles.checkinContent}>
            <View style={styles.checkinHeaderRow}>
              <Text style={styles.checkinTitle}>Bạn chưa check-in hôm nay?</Text>
              <Link href="/ai-food-mode" asChild>
                <TouchableOpacity style={styles.checkinButton}>
                  <Ionicons name="camera" size={18} color={textLight} />
                  <Text style={styles.checkinButtonText}>Check-in</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <Text style={styles.checkinSubtitle}>
              Chụp ảnh món ăn để chia sẻ trải nghiệm và nhận huy hiệu mới!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Link href="/ai-food-mode" asChild>
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="scan" size={24} color={textLight} />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // TopBar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  greeting: {
    color: textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  question: {
    color: textLight,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: primary,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    // Bỏ border cho style tối giản sạch sẽ hơn
  },
  searchInput: {
    flex: 1,
    color: textLight,
    fontSize: 14,
  },
  // Passport
  passportCard: {
    backgroundColor: card, // Sử dụng màu card thống nhất
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    // Loại bỏ viền nâu đỏ để hợp với nền đen nhám
  },
  passportIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(209, 31, 47, 0.2)', // Tint đỏ nhẹ
    alignItems: 'center',
    justifyContent: 'center',
  },
  passportTitle: {
    color: textLight,
    fontWeight: '700',
    fontSize: 16,
  },
  passportSub: {
    color: textMuted,
    fontSize: 12,
  },
  levelTag: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  levelText: {
    color: textLight,
    fontWeight: '700',
  },
  progressBar: {
    marginTop: 14,
    height: 6, // Mỏng hơn cho tinh tế
    borderRadius: 8,
    backgroundColor: '#333',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    width: '85%',
    backgroundColor: primary, // Dùng màu primary đỏ
    borderRadius: 8,
  },
  progressLabel: {
    color: textLight,
    fontSize: 12,
    marginTop: 8,
  },
  passportFoot: {
    color: textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickIcon: {
    width: 50, // To hơn chút
    height: 50,
    borderRadius: 25, // Tròn hoàn toàn
    backgroundColor: card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    color: textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  // Sections
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionLink: {
    color: primary,
    fontWeight: '600',
  },

  // --- GỢI Ý MÓN ĂN (Style Dọc) ---
  suggestionCard: {
    width: 140,
    marginRight: 6,
  },
  suggestionImage: {
    width: 140,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  suggestionContent: {
    paddingHorizontal: 2,
  },
  suggestionTitle: {
    color: textLight,
    fontWeight: '700',
    fontSize: 14,
  },
  suggestionSubtitle: {
    color: textMuted,
    fontSize: 12,
  },
  loadingCard: {
    width: 140,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: card,
    borderRadius: 16,
  },
  // ----------------------------------------

  // --- CỘNG ĐỒNG KHÁM PHÁ (Style Card Tách Biệt) ---
  feedCardItem: {
    backgroundColor: card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Không viền
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#333',
  },
  feedUser: {
    color: textLight,
    fontSize: 15,
    fontWeight: '700',
  },
  feedTime: {
    color: textMuted,
    fontSize: 12,
  },
  feedBody: {
    // Không cần margin nhiều vì đã bỏ footer
  },
  feedText: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 22,
  },
  feedDish: {
    color: textLight,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 10,
  },
  feedDesc: {
    color: textMuted,
    fontSize: 13,
  },
  // ----------------------------------------------------

  // Checkin & FAB
  checkinCard: {
    marginTop: 18,
    backgroundColor: card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkinContent: {
    flex: 1,
  },
  checkinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  checkinTitle: {
    color: textLight,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  checkinSubtitle: {
    color: textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  checkinButton: {
    backgroundColor: primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkinButtonText: {
    color: textLight,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
