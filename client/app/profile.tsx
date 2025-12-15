import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
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
import { computeAchievements } from '../utils/achievements';

const { width } = Dimensions.get('window');

// THEME CONSTANTS - Giữ đồng bộ với ExploreScreen
const COLORS = {
  bg: '#0F0F0F',
  cardBg: '#1A1A1A',
  cardBorder: '#333',
  primary: '#E53935',
  accent: '#FFD700', // Gold
  textLight: '#FFFFFF',
  textGrey: '#A0A0A0',
  success: '#4CAF50',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { isLoggedIn, user, refreshUser, logout } = useAuth();
  const { passport, refreshPassport } = usePassport();
  const [refreshing, setRefreshing] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  const stats = useMemo(
    () => ({
      unlocked: passport?.unlocked_provinces?.length ?? 0,
      foodPassport: passport?.food_passport?.length ?? 0,
    }),
    [passport],
  );

  const rankLabel = passport?.current_rank || user?.current_rank || 'Khách vãng lai';
  const achievements = useMemo(
    () => computeAchievements(passport?.unlocked_provinces || []),
    [passport?.unlocked_provinces],
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([refreshUser(), refreshPassport()]);
    } catch (error) {
      console.error('Refresh profile error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, refreshPassport]);

  useEffect(() => {
    if (isLoggedIn && !user) {
      refreshUser().catch((err) => console.error('Init profile fetch error:', err));
    }
  }, [isLoggedIn, user, refreshUser]);

  useEffect(() => {
    // Sync avatar with user data if backend provides it in future
    if (user && (user as any).avatar) {
      setAvatarUri((user as any).avatar);
    }
  }, [user]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  // -------------------------

  const renderLoginRequest = () => (
    <View style={styles.loginContainer}>
      <LinearGradient colors={['#2c1515', '#000']} style={styles.loginCard}>
        <View style={styles.loginIconCircle}>
          <Ionicons name="lock-closed" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.loginTitle}>Đăng nhập để lưu hành trình</Text>
        <Text style={styles.loginDesc}>
          Hộ chiếu ẩm thực của bạn đang trống. Hãy đăng nhập để bắt đầu sưu tầm món ăn và mở khóa
          các vùng đất mới.
        </Text>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Đăng nhập / Đăng ký</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </Link>
      </LinearGradient>
    </View>
  );

  const handlePickAvatar = useCallback(async () => {
    if (!isLoggedIn || !user) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để đổi avatar.');
      return;
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để đổi avatar.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        setAvatarUri(uri);
        // Lưu avatar URL lên server (đang lưu direct URI; cần upload lên storage nếu muốn share cross-device)
        await apiService.updateAvatar(user.id, uri);
        await refreshUser();
      }
    } catch (error) {
      console.error('Pick avatar error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  }, [isLoggedIn, refreshUser, user]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={goBack} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.navBtn}>
              <Ionicons name="settings-outline" size={22} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {!isLoggedIn ? (
            renderLoginRequest()
          ) : (
            <>
              <View style={styles.profileSection}>
                <LinearGradient colors={['#2A2A2A', '#151515']} style={styles.profileCard}>
                  <View style={styles.avatarContainer}>
                    <TouchableOpacity activeOpacity={0.85} onPress={handlePickAvatar}>
                      <Image
                        source={{
                          uri:
                            avatarUri ||
                            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
                        }}
                        style={styles.avatar}
                      />
                      <View style={styles.editBadge}>
                        <Ionicons name="camera" size={14} color="#FFF" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.username}>{user?.username || 'Nhà thám hiểm'}</Text>
                    <Text style={styles.email}>{user?.email || 'Chưa có email'}</Text>

                    <View style={styles.rankBadge}>
                      <Ionicons name="ribbon" size={14} color={COLORS.accent} />
                      <Text style={styles.rankText}>{rankLabel.toUpperCase()}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* 2. STATS BAR - Gộp thông tin lại cho gọn */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.unlocked}</Text>
                  <Text style={styles.statLabel}>Tỉnh</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.foodPassport}</Text>
                  <Text style={styles.statLabel}>Món ăn</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>Top 10%</Text>
                  {/* Giả lập data ranking */}
                  <Text style={styles.statLabel}>Xếp hạng</Text>
                </View>
              </View>

              {/* 3. ACHIEVEMENTS - Horizontal Scroll */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Bộ sưu tập Huy hiệu</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.badgeList}
                >
                  {achievements.map((item) => (
                    <View
                      key={item.id}
                      style={[styles.badgeCard, !item.earned && styles.badgeLocked]}
                    >
                      <View
                        style={[
                          styles.badgeIconBg,
                          item.earned && {
                            backgroundColor: 'rgba(255, 215, 0, 0.15)',
                            borderColor: COLORS.accent,
                          },
                        ]}
                      >
                        <Ionicons
                          name={item.earned ? 'trophy' : 'lock-closed'}
                          size={20}
                          color={item.earned ? COLORS.accent : COLORS.textGrey}
                        />
                      </View>
                      <Text
                        style={[styles.badgeTitle, !item.earned && { color: COLORS.textGrey }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* 4. RECENT FOODS - Grid Layout */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Hộ chiếu gần đây</Text>
                <View style={styles.gridContainer}>
                  {/* Nút Scan Food luôn hiện đầu tiên */}
                  <Link href="/ai-food-mode" asChild>
                    <TouchableOpacity style={styles.addFoodCard}>
                      <Ionicons name="scan-outline" size={32} color={COLORS.primary} />
                      <Text style={styles.addFoodText}>Quét món mới</Text>
                    </TouchableOpacity>
                  </Link>

                  {(passport?.recent_foods || []).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.foodCard}
                      onPress={() => router.push(`/culture-card?foodId=${item.id}`)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: item.image }} style={styles.foodImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={styles.foodOverlay}
                      >
                        <Text style={styles.foodName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.foodLocation} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 5. ACTION BUTTONS */}
              <View style={styles.actionSection}>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                  <Ionicons name="log-out-outline" size={20} color={COLORS.textGrey} />
                  <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
                <Text style={styles.versionText}>Vietnam Flavor Odyssey v1.0.2</Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header Nav
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  headerRight: {
    width: 40,
  },

  // Login Request
  loginContainer: {
    padding: 20,
    marginTop: 40,
  },
  loginCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  loginIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginTitle: {
    color: COLORS.textLight,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  loginDesc: {
    color: COLORS.textGrey,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Profile Section (UPDATED FOR VERTICAL LAYOUT)
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'column', // Changed from 'row' to 'column'
    alignItems: 'center', // Center content horizontally
    padding: 20, // Increased padding
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16, // Changed from marginRight to marginBottom
  },
  avatar: {
    width: 100, // Slightly larger avatar
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    width: 30, // Slightly larger badge
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  profileInfo: {
    // Removed flex: 1
    alignItems: 'center', // Center text
    width: '100%',
  },
  username: {
    color: COLORS.textLight,
    fontSize: 22, // Slightly larger text
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    color: COLORS.textGrey,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignSelf: 'center', // Center the badge
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    gap: 6,
  },
  rankText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },

  // Stats Bar
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textGrey,
    fontSize: 12,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#333',
    height: '60%',
    alignSelf: 'center',
  },

  // Common Section
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingLeft: -20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.textLight,
    fontSize: 18,
    paddingHorizontal: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Achievements List
  badgeList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  badgeCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 4,
  },
  badgeIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeTitle: {
    color: COLORS.textLight,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Grid Food
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  addFoodCard: {
    width: (width - 40 - 12) / 2, // Tính toán width: (Màn hình - padding 2 bên - gap) chia 2
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addFoodText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  foodCard: {
    width: (width - 40 - 12) / 2,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBg,
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  foodOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 30,
  },
  foodName: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: 'bold',
  },
  foodLocation: {
    color: '#CCC',
    fontSize: 10,
  },

  // Actions
  actionSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  logoutText: {
    color: COLORS.textGrey,
    fontWeight: '600',
  },
  versionText: {
    color: '#444',
    fontSize: 10,
    marginTop: 20,
  },
});
