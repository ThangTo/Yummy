import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/use-auth';

const bg = '#1b0f0f';
const card = '#261515';
const textLight = '#f8f2f2';
const textMuted = '#c5b8b8';
const primary = '#d11f2f';

const achievements = [
  { title: 'Phở Master' },
  { title: 'Hải sản Vương' },
  { title: 'Healthy 7 ngày' },
];

const favorites = [
  { title: 'Bún Chả Hương Liên', rating: 4.8 },
  { title: 'Bánh Mì Dân Tổ', rating: 5.0 },
  { title: 'Phở Bát Đàn', rating: 4.5 },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="chevron-back" size={20} color={textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Ionicons name="notifications" size={20} color={textLight} />
            <Ionicons name="settings" size={20} color={textLight} />
          </View>
        </View>

        {!isLoggedIn ? (
          <View style={styles.loginCard}>
            <Ionicons name="lock-closed" size={32} color="#fff" />
            <Text style={styles.loginTitle}>Đăng nhập để xem hồ sơ</Text>
            <Text style={styles.loginDesc}>
              Bạn cần đăng nhập để xem thành tích, huy hiệu và các món yêu thích.
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Đi đến đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <>
            <View style={styles.profileCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
                }}
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={14} color="#fff" />
              </View>
              <Text style={styles.name}>Nguyễn Văn A</Text>
              <Text style={styles.meta}>Thành viên từ 2023</Text>
              <View style={styles.rankPill}>
                <Text style={styles.rankText}>THỔ ĐỊA HÀ THÀNH</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {[
                { label: 'Món đã thử', value: 42 },
                { label: 'Đánh giá', value: 15 },
                { label: 'Theo dõi', value: 128 },
              ].map((item) => (
                <View key={item.label} style={styles.statBox}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.progressCard}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text style={styles.progressTitle}>CẤP ĐỘ TIẾP THEO</Text>
                  <Text style={styles.progressName}>Thần Ăn 🔥</Text>
                </View>
                <Text style={styles.progressValue}>1250/1500 XP</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressHint}>Còn 250 XP để thăng hạng</Text>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Thành tựu nổi bật</Text>
              <Text style={styles.sectionLink}>Xem tất cả</Text>
            </View>
            <View style={styles.badgeRow}>
              {achievements.map((item) => (
                <View key={item.title} style={styles.badgeCircle}>
                  <Text style={styles.badgeLabel}>{item.title}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tabsRow}>
              <Text style={[styles.tab, styles.tabActive]}>Món yêu thích</Text>
              <Text style={styles.tab}>Lịch sử</Text>
              <Text style={styles.tab}>Bộ sưu tập</Text>
            </View>

            <View style={styles.favGrid}>
              {favorites.map((item) => (
                <View key={item.title} style={styles.favCard}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=400&q=80',
                    }}
                    style={styles.favImage}
                  />
                  <View style={styles.favInfo}>
                    <Text style={styles.favTitle}>{item.title}</Text>
                    <Text style={styles.favSub}>Hà Nội</Text>
                    <View style={styles.favRating}>
                      <Ionicons name="star" size={12} color="#ffc107" />
                      <Text style={styles.favRatingText}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              ))}
              <View style={[styles.favCard, styles.addCard]}>
                <Ionicons name="add" size={24} color={textLight} />
                <Text style={styles.addText}>Thêm món mới</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logout} onPress={logout}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 6, fontWeight: '700' }}>Đăng xuất</Text>
            </TouchableOpacity>
          </>
        )}
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
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileCard: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  editBadge: {
    position: 'absolute',
    bottom: 16,
    right: '38%',
    backgroundColor: primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 10 },
  meta: { color: textMuted, marginTop: 4 },
  rankPill: {
    marginTop: 10,
    backgroundColor: '#2f1c1c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rankText: { color: '#ffcc80', fontWeight: '800', letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: card,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: textMuted, marginTop: 4 },
  progressCard: {
    backgroundColor: card,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  progressTitle: { color: textMuted, fontSize: 12 },
  progressName: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 },
  progressValue: { color: '#fff', fontWeight: '800' },
  progressBar: {
    height: 10,
    backgroundColor: '#3a1f1f',
    borderRadius: 10,
    marginTop: 10,
  },
  progressFill: { width: '80%', backgroundColor: primary, height: '100%' },
  progressHint: { color: textMuted, marginTop: 6 },
  sectionRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionLink: { color: '#ff6969', fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  badgeCircle: {
    backgroundColor: card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  badgeLabel: { color: textLight, fontWeight: '700' },
  tabsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
  },
  tab: { color: textMuted, fontWeight: '700' },
  tabActive: { color: '#fff', borderBottomWidth: 2, borderBottomColor: primary, paddingBottom: 4 },
  favGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  favCard: {
    width: '47%',
    backgroundColor: card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d1b1b',
    overflow: 'hidden',
  },
  favImage: { width: '100%', height: 120 },
  favInfo: { padding: 10, gap: 4 },
  favTitle: { color: textLight, fontWeight: '800' },
  favSub: { color: textMuted, fontSize: 12 },
  favRating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  favRatingText: { color: textLight, fontWeight: '700', fontSize: 12 },
  addCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  addText: { color: textLight, fontWeight: '700', marginTop: 6 },
  loginCard: {
    backgroundColor: card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d1b1b',
    padding: 16,
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  loginTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  loginDesc: { color: textMuted, textAlign: 'center', lineHeight: 18 },
  loginButton: {
    backgroundColor: primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  loginButtonText: { color: '#fff', fontWeight: '800' },
  logout: {
    marginTop: 16,
    backgroundColor: '#2f1c1c',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a1f1f',
  },
});
