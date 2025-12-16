import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeColors } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/use-auth';
import { usePassport } from '../../hooks/use-passport';
import { useTheme } from '../../hooks/use-theme';
import { apiService, type CommunityActivity, type FoodInfo } from '../../services/api';

export default function HomeScreen() {
  const { isLoggedIn, user } = useAuth();
  const { passport, refreshPassport } = usePassport();
  const router = useRouter();
  const { colors, mode } = useTheme();
  const styles = useMemo(() => createStyles(colors, mode), [colors, mode]);
  const [foods, setFoods] = useState<FoodInfo[]>([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [foodsError, setFoodsError] = useState<string | null>(null);
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFoods = useCallback(async () => {
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
  }, []);

  const fetchActivities = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchFoods();
    fetchActivities();
  }, [fetchFoods, fetchActivities]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchFoods(), fetchActivities(), refreshPassport()]);
    } catch (error) {
      console.error('Home refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFoods, fetchActivities, refreshPassport]);

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
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          // Kéo xuống để reload dữ liệu giống profile.tsx
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Xin chào, {greetingName}!</Text>
            <Text style={styles.question}>
              Hôm nay ăn gì nhỉ? <Text style={{ fontSize: 18 }}>😋</Text>
            </Text>
          </View>
        </View>

        {/* PASSPORT CARD */}
        <View style={styles.passportCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.passportIcon}>
              <Ionicons name="medal" size={22} color={colors.primary} />
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

        {/* --- QUICK ACTIONS (ĐÃ SỬA LẠI: 2 NÚT LỚN) --- */}
        <View style={styles.quickActions}>
          {/* Nút Bản Đồ */}
          <TouchableOpacity
            style={styles.quickItemLarge}
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconLarge, { backgroundColor: 'rgba(84, 160, 255, 0.1)' }]}>
              <Ionicons name="map" size={28} color={colors.text} />
            </View>
            <View>
              <Text style={styles.quickLabelLarge}>Bản đồ</Text>
              {/* <Text style={styles.quickSubLabel}>Khám phá 63 tỉnh</Text> */}
            </View>
          </TouchableOpacity>

          {/* Nút BXH */}
          <TouchableOpacity
            style={styles.quickItemLarge}
            onPress={() => router.push('/leaderboard')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconLarge, { backgroundColor: 'rgba(254, 202, 87, 0.1)' }]}>
              <Ionicons name="stats-chart" size={28} color={colors.text} />
            </View>
            <View>
              <Text style={styles.quickLabelLarge}>Xếp hạng</Text>
              {/* <Text style={styles.quickSubLabel}>Top cao thủ</Text> */}
            </View>
          </TouchableOpacity>
        </View>
        {/* ------------------------------------------- */}

        {/* GỢI Ý MÓN ĂN (Style Dọc Minimalist) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý hôm nay 🔥</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingLeft: 4 }}
        >
          {isLoadingFoods && (
            <View style={[styles.loadingCard]}>
              <ActivityIndicator color={colors.primary} />
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
                      color={colors.textMuted}
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

        {/* CỘNG ĐỒNG KHÁM PHÁ */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Cộng đồng khám phá</Text>
        </View>

        {isLoadingActivities && (
          <View style={styles.feedCardItem}>
            <ActivityIndicator color={colors.primary} />
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
              <View style={styles.feedBody}>
                <Text style={styles.feedText}>
                  Đã chinh phục món{' '}
                  <Text style={{ fontWeight: '700', color: colors.primary }}>{item.food_name}</Text>
                  . Hương vị đậm đà khó quên! 😋
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
                  <Ionicons name="camera" size={18} color="#FFF" />
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
          <Ionicons name="scan" size={24} color="#FFF" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors, mode: 'light' | 'dark') =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.bg,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 12,
    },
    greeting: {
      color: c.text,
      fontSize: 14,
      fontWeight: '600',
    },
    question: {
      color: c.text,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 2,
    },
    passportCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
    },
    passportIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: mode === 'light' ? 'rgba(209,31,47,0.12)' : 'rgba(209, 31, 47, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    passportTitle: {
      color: c.text,
      fontWeight: '700',
      fontSize: 16,
    },
    passportSub: {
      color: c.textMuted,
      fontSize: 12,
    },
    levelTag: {
      marginLeft: 'auto',
      backgroundColor: mode === 'light' ? '#f1f1f1' : 'rgba(255,255,255,0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    levelText: {
      color: c.text,
      fontWeight: '700',
    },
    progressBar: {
      marginTop: 14,
      height: 6,
      borderRadius: 8,
      backgroundColor: mode === 'light' ? '#e5e5e5' : '#333',
      overflow: 'hidden',
      flexDirection: 'row',
    },
    progressFill: {
      width: '85%',
      backgroundColor: c.primary,
      borderRadius: 8,
    },
    progressLabel: {
      color: c.text,
      fontSize: 12,
      marginTop: 8,
    },
    passportFoot: {
      color: c.textMuted,
      fontSize: 12,
      marginTop: 4,
    },

    // --- QUICK ACTIONS MỚI (2 NÚT LỚN) ---
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20, // Tăng khoảng cách chút
      gap: 12, // Khoảng cách giữa 2 nút
    },
    quickItemLarge: {
      flex: 1, // Chia đều 50-50
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 6,
      flexDirection: 'row', // Icon bên trái, text bên phải hoặc stack dọc tuỳ ý (ở đây mình để icon trái cho lạ mắt)
      alignItems: 'center',
      gap: 12,
      // Hiệu ứng nổi nhẹ
      borderWidth: 1,
      borderColor: mode === 'dark' ? '#2A2A2A' : '#EEE',
    },
    quickIconLarge: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickLabelLarge: {
      color: c.text,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 2,
    },
    quickSubLabel: {
      color: c.textMuted,
      fontSize: 11,
    },
    // -------------------------------------

    sectionHeader: {
      marginTop: 24, // Tăng khoảng cách
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      color: c.text,
      fontSize: 18,
      fontWeight: '700',
    },
    sectionLink: {
      color: c.primary,
      fontWeight: '600',
    },
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
      color: c.text,
      fontWeight: '700',
      fontSize: 14,
    },
    suggestionSubtitle: {
      color: c.textMuted,
      fontSize: 12,
    },
    loadingCard: {
      width: 140,
      height: 180,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      borderRadius: 16,
    },
    feedCardItem: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
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
      color: c.text,
      fontSize: 15,
      fontWeight: '700',
    },
    feedTime: {
      color: c.textMuted,
      fontSize: 12,
    },
    feedBody: {},
    feedText: {
      color: c.text,
      fontSize: 14,
      lineHeight: 22,
    },
    feedDish: {
      color: c.text,
      fontWeight: '700',
      fontSize: 16,
      marginTop: 10,
    },
    feedDesc: {
      color: c.textMuted,
      fontSize: 13,
    },
    checkinCard: {
      marginTop: 18,
      backgroundColor: c.card,
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
      color: c.text,
      fontWeight: '700',
      fontSize: 15,
      marginBottom: 4,
    },
    checkinSubtitle: {
      color: c.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
    checkinButton: {
      backgroundColor: c.primary,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    checkinButtonText: {
      color: '#FFF',
      fontWeight: '700',
    },
    fab: {
      position: 'absolute',
      bottom: 28,
      alignSelf: 'center',
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.primary,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
  });
