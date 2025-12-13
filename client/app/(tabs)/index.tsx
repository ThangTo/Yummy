import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const primary = '#d11f2f';
const bg = '#1b0f0f';
const card = '#261515';
const textLight = '#f8f2f2';
const textMuted = '#c5b8b8';

const suggestionData = [
  {
    title: 'Phở Bò Gia Truyền',
    subtitle: '49 Bát Đàn, Hoàn Kiếm • 1.2km',
    price: '50.000đ',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Bánh Mì Chảo',
    subtitle: 'Nghĩa Tân, Cầu Giấy',
    price: '35.000đ',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Bún Bò Huế',
    subtitle: 'Huế',
    price: '45.000đ',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1604908177443-00ac5d1e5f7d?auto=format&fit=crop&w=600&q=80',
  },
];

const communityFeed = [
  {
    user: 'Lan Chi',
    dish: 'Bún Riêu Cua Ốc',
    time: '5 phút trước',
    xp: '+15 XP',
    desc: 'Nước dùng chua thanh, ốc to giòn sần sật. Quán này nằm trong ngõ...',
  },
  {
    user: 'Tuấn',
    dish: 'Cơm Tấm Sài Gòn',
    time: '10 phút trước',
    xp: '+12 XP',
    desc: 'Sườn nướng thơm, bì chả đầy đủ, nước mắm pha vừa miệng.',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Xin chào, Minh Anh!</Text>
            <Text style={styles.question}>
              Hôm nay ăn gì nhỉ? <Text style={{ fontSize: 18 }}>😋</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.badge}>
            <Ionicons name="notifications" size={18} color={textLight} />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={textMuted} />
          <TextInput
            placeholder="Tìm món ăn, nhà hàng, địa điểm..."
            placeholderTextColor={textMuted}
            style={styles.searchInput}
          />
          <Ionicons name="options" size={18} color={textMuted} />
        </View>

        <View style={styles.passportCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.passportIcon}>
              <Ionicons name="medal" size={22} color={primary} />
            </View>
            <View>
              <Text style={styles.passportTitle}>Hộ chiếu Ẩm thực</Text>
              <Text style={styles.passportSub}>Thành viên Vàng • 1,240 Điểm</Text>
            </View>
            <View style={styles.levelTag}>
              <Text style={styles.levelText}>L5</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
            <View style={styles.progressSecondary} />
          </View>
          <Text style={styles.progressLabel}>Tiến độ thăng hạng 85%</Text>
          <Text style={styles.passportFoot}>Check-in thêm 2 món để lên Level 6!</Text>
        </View>

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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý hôm nay 🔥</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14 }}
        >
          {suggestionData.map((item) => (
            <View key={item.title} style={styles.suggestionCard}>
              <Image source={{ uri: item.image }} style={styles.suggestionImage} />
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>{item.title}</Text>
                <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
                <View style={styles.suggestionRow}>
                  <Text style={styles.suggestionPrice}>{item.price}</Text>
                  <View style={styles.ratingChip}>
                    <Ionicons name="star" size={12} color="#ffc107" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cộng đồng khám phá</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {communityFeed.map((item) => (
          <View key={item.dish} style={styles.feedCard}>
            <View style={styles.feedHeader}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.feedUser}>{item.user}</Text>
                <Text style={styles.feedTime}>vừa khám phá {item.time}</Text>
              </View>
              <Text style={styles.xpBadge}>{item.xp}</Text>
            </View>
            <Text style={styles.feedDish}>{item.dish}</Text>
            <Text style={styles.feedDesc}>{item.desc}</Text>
            <View style={styles.feedActions}>
              <View style={styles.feedActionItem}>
                <Ionicons name="heart-outline" size={16} color={textMuted} />
                <Text style={styles.feedActionText}>24</Text>
              </View>
              <View style={styles.feedActionItem}>
                <Ionicons name="chatbubble-outline" size={16} color={textMuted} />
                <Text style={styles.feedActionText}>5</Text>
              </View>
              <Ionicons name="share-social-outline" size={16} color={textMuted} />
            </View>
          </View>
        ))}

        <View style={styles.checkinCard}>
          <View>
            <Text style={styles.checkinTitle}>Bạn chưa check-in hôm nay?</Text>
            <Text style={styles.checkinSubtitle}>
              Chụp ảnh món ăn để nhận ngay 50 XP và huy hiệu mới!
            </Text>
          </View>
          <Link href="/ai-food-mode" asChild>
            <TouchableOpacity style={styles.checkinButton}>
              <Ionicons name="camera" size={18} color={textLight} />
              <Text style={styles.checkinButtonText}>Check-in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  searchInput: {
    flex: 1,
    color: textLight,
    fontSize: 14,
  },
  passportCard: {
    backgroundColor: '#2b1717',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3a1f1f',
  },
  passportIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fce2e3',
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
    backgroundColor: '#4b2c2c',
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
    height: 10,
    borderRadius: 8,
    backgroundColor: '#3a1f1f',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    width: '85%',
    backgroundColor: '#fbc02d',
    borderRadius: 8,
  },
  progressSecondary: {
    width: '8%',
    backgroundColor: '#f55f7a',
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
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  quickLabel: {
    color: textLight,
    fontSize: 12,
    fontWeight: '600',
  },
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
    color: '#ff6969',
    fontWeight: '600',
  },
  suggestionCard: {
    backgroundColor: card,
    width: 220,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  suggestionImage: {
    width: '100%',
    height: 140,
  },
  suggestionContent: {
    padding: 12,
    gap: 6,
  },
  suggestionTitle: {
    color: textLight,
    fontWeight: '700',
    fontSize: 16,
  },
  suggestionSubtitle: {
    color: textMuted,
    fontSize: 12,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionPrice: {
    color: '#ff6969',
    fontWeight: '700',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#332020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  feedCard: {
    backgroundColor: card,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3a2626',
  },
  feedUser: {
    color: textLight,
    fontWeight: '700',
  },
  feedTime: {
    color: textMuted,
    fontSize: 12,
  },
  xpBadge: {
    color: '#4ade80',
    fontWeight: '700',
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
    marginTop: 4,
    lineHeight: 18,
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  feedActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedActionText: {
    color: textMuted,
    fontSize: 12,
  },
  checkinCard: {
    marginTop: 18,
    backgroundColor: card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d1b1b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  checkinButtonText: {
    color: textLight,
    fontWeight: '700',
  },
  navRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#2f1c1c',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3a1f1f',
  },
  navButtonText: {
    color: '#fff',
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
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
