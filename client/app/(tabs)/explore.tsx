import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Thư viện gradient
import { Link, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
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

// Giả định các component và hooks của bạn vẫn giữ nguyên
import VietnamMap from '../../components/VietnamMap';
import type { ThemeColors } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/use-auth';
import { usePassport } from '../../hooks/use-passport';
import { useTheme } from '../../hooks/use-theme';
import { computeAchievements } from '../../utils/achievements';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ExploreScreen() {
  const { isLoggedIn, user } = useAuth();
  const { passport, isLoadingPassport, refreshPassport } = usePassport();
  const router = useRouter();
  const { colors, mode } = useTheme();
  const styles = useMemo(() => createStyles(colors, mode), [colors, mode]);
  const [refreshing, setRefreshing] = useState(false);

  // Logic giữ nguyên 100%
  const unlockedProvinces = useMemo(
    () => passport?.unlocked_provinces || [],
    [passport?.unlocked_provinces],
  );

  const progress = passport?.progress;
  const nextRank = progress?.next_rank || { name: 'Khách vãng lai', target: 1 };
  const progressPercent =
    progress && nextRank.target > 0 ? Math.min((progress.current / nextRank.target) * 100, 100) : 0;

  const achievements = useMemo(() => computeAchievements(unlockedProvinces), [unlockedProvinces]);

  const recentFoods = passport?.recent_foods || [];

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshPassport();
    } catch (error) {
      console.error('Explore refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshPassport]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header cố định */}
      <View style={styles.headerContainer}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.headerTitle}>{user?.username}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={refreshPassport} activeOpacity={0.7}>
          <Ionicons name="refresh" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {isLoggedIn && isLoadingPassport && (
          <Text style={styles.loadingText}>Đang đồng bộ dữ liệu...</Text>
        )}

        {/* 1. RANK CARD  */}
        <View style={[styles.rankCard, { backgroundColor: colors.card }]}>
          <View style={styles.rankHeader}>
            <View>
              <Text style={styles.rankLabel}>DANH HIỆU HIỆN TẠI</Text>
              <Text style={styles.rankTitle}>
                {isLoggedIn ? passport?.current_rank || 'Loading...' : 'Chưa đăng nhập'}
              </Text>
            </View>
            <View style={styles.rankIconContainer}>
              <Ionicons name="medal" size={24} color={colors.accent} />
            </View>
          </View>

          <View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>Tiến trình thăng hạng</Text>
              <Text style={styles.progressValue}>
                {isLoggedIn ? `${progress?.current || 0}/${nextRank.target}` : '0/—'}
              </Text>
            </View>

            {/* Custom Progress Bar */}
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={[colors.primary, '#FF6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
              />
            </View>

            <Text style={styles.nextRankHint}>
              {isLoggedIn
                ? `Cần thêm ${Math.max(
                    (nextRank.target || 0) - (progress?.current || 0),
                    0,
                  )} món để đạt "${nextRank.name}"`
                : 'Đăng nhập để lưu hành trình'}
            </Text>
          </View>
        </View>

        {/* 2. MAP SECTION - Giữ nguyên logic map, bọc container đẹp hơn */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bản đồ Ẩm thực</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unlockedProvinces.length} Tỉnh</Text>
          </View>
        </View>

        <View style={styles.mapContainer}>
          <VietnamMap
            unlockedProvinces={unlockedProvinces}
            onProvincePress={(provinceName) => console.log(provinceName)}
          />
          {/* Overlay gradient nhẹ ở đáy map để blend màu */}
          {/* <LinearGradient colors={['transparent', colors.bg]} style={styles.mapOverlay} /> */}
        </View>

        {/* 3. RECENT DISCOVERIES - Chuyển sang Horizontal Scroll */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Khám phá gần đây</Text>
          {!isLoggedIn && <Text style={styles.linkText}>Đăng nhập ngay</Text>}
        </View>

        {isLoggedIn ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {recentFoods.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyText}>Chưa có món ăn nào</Text>
              </View>
            ) : (
              recentFoods.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.foodCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/culture-card?foodId=${item.id}`)}
                >
                  <Image source={{ uri: item.image }} style={styles.foodImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.foodInfoOverlay}
                  >
                    <Text style={styles.foodName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-sharp" size={10} color={colors.primary} />
                      <Text style={styles.foodLocation} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </LinearGradient>
                  {item.tag && (
                    <View style={styles.tagContainer}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <View style={styles.loginPromptCard}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.textMuted} />
            <Text style={styles.loginPromptText}>Đăng nhập để xem bộ sưu tập của bạn</Text>
          </View>
        )}

        {/* 4. ACHIEVEMENTS - Grid Layout 2 cột */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Thành tựu</Text>
        </View>

        <View style={styles.gridContainer}>
          {achievements.map((a) => (
            <View
              key={a.id}
              style={[
                styles.achievementItem,
                a.earned ? styles.achievementEarned : styles.achievementLocked,
              ]}
            >
              <View style={styles.achievementHeader}>
                <Ionicons
                  name={a.earned ? 'trophy' : 'lock-closed'}
                  size={18}
                  color={a.earned ? colors.accent : colors.textMuted}
                />
                {a.earned && <Ionicons name="checkmark-circle" size={14} color={colors.success} />}
              </View>
              <Text style={[styles.achievementTitle, !a.earned && { color: colors.textMuted }]}>
                {a.title}
              </Text>
              <Text style={styles.achievementDesc} numberOfLines={2}>
                {a.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Spacer for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 5. FLOATING ACTION BUTTON (SCAN) */}
      <Link href="/ai-food-mode" asChild>
        <TouchableOpacity style={styles.fabContainer} activeOpacity={0.8}>
          <View style={[styles.fabGradient, { backgroundColor: colors.primary }]}>
            <Ionicons name="scan-outline" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors, mode: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scrollContent: {
      padding: 20,
      paddingTop: 10,
    },
    // Header Styles
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginBottom: 10,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: c.primary,
    },
    greeting: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    headerTitle: {
      color: c.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    refreshBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: mode === 'light' ? '#ededed' : '#2A2A2A',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: c.primary,
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 10,
    },

    // Rank Card Styles
    rankCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    rankHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    rankLabel: {
      color: mode === 'light' ? '#666' : 'rgba(255,255,255,0.6)',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 4,
    },
    rankTitle: {
      color: c.text,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    rankIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: mode === 'light' ? '#f7f7f7' : 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,215,0,0.3)',
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressText: {
      color: c.textMuted,
      fontSize: 12,
    },
    progressValue: {
      color: c.accent,
      fontWeight: 'bold',
      fontSize: 12,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: mode === 'light' ? '#e5e5e5' : 'rgba(0,0,0,0.4)',
      borderRadius: 3,
      marginBottom: 8,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    nextRankHint: {
      color: mode === 'light' ? '#666' : 'rgba(255,255,255,0.5)',
      fontSize: 11,
      fontStyle: 'italic',
    },

    // Map Section
    mapContainer: {
      height: SCREEN_HEIGHT * 0.6,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: mode === 'light' ? '#e5e5e5' : '#333',
      backgroundColor: mode === 'light' ? '#f9f9f9' : '#151515',
      marginBottom: 24,
      position: 'relative',
    },
    mapOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },

    // Common Section Header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      color: c.text,
      fontSize: 18,
      fontWeight: '700',
    },
    badge: {
      backgroundColor: mode === 'light' ? '#f0f0f0' : '#333',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: c.primary,
      fontSize: 12,
      fontWeight: 'bold',
    },
    linkText: {
      color: c.primary,
      fontSize: 14,
      fontWeight: '600',
    },

    // Horizontal Food List
    horizontalList: {
      paddingRight: 20,
      gap: 16,
    },
    foodCard: {
      width: 160,
      height: 200,
      borderRadius: 16,
      backgroundColor: c.card,
      overflow: 'hidden',
      position: 'relative',
    },
    foodImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    foodInfoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
      paddingTop: 40,
    },
    foodName: {
      color: c.text,
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    foodLocation: {
      color: c.textMuted,
      fontSize: 10,
      flex: 1,
    },
    tagContainer: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    tagText: {
      color: c.primary,
      fontSize: 10,
      fontWeight: 'bold',
    },
    emptyCard: {
      width: 200,
      height: 120,
      backgroundColor: c.card,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: mode === 'light' ? '#e1e1e1' : '#444',
    },
    emptyText: {
      color: c.textMuted,
      marginTop: 8,
      fontSize: 12,
    },
    loginPromptCard: {
      padding: 20,
      backgroundColor: c.card,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    loginPromptText: {
      color: c.textMuted,
      marginTop: 8,
    },

    // Achievements Grid
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    achievementItem: {
      width: (SCREEN_WIDTH - 40 - 12) / 2,
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: mode === 'light' ? '#e5e5e5' : '#2A2A2A',
    },
    achievementEarned: {
      backgroundColor: mode === 'light' ? '#f5e8e8' : '#251A1A',
      borderColor: 'rgba(229, 57, 53, 0.3)',
    },
    achievementLocked: {
      opacity: 0.6,
    },
    achievementHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    achievementTitle: {
      color: c.text,
      fontWeight: '700',
      fontSize: 13,
      marginBottom: 4,
    },
    achievementDesc: {
      color: c.textMuted,
      fontSize: 11,
      lineHeight: 15,
    },

    // FAB (Floating Button)
    fabContainer: {
      position: 'absolute',
      bottom: 30,
      alignSelf: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
    fabGradient: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
