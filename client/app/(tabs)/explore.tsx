import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VietnamMap from '../../components/VietnamMap';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const bg = '#1b0f0f';
const card = '#261515';
const textLight = '#f8f2f2';
const textMuted = '#c5b8b8';
const primary = '#d11f2f';

// Mock data - sau này sẽ lấy từ API
// Danh sách tên tỉnh đã mở khóa (có thể là "Hà Nội", "Tỉnh Hà Nội", "Thành phố Hồ Chí Minh", etc.)
// Danh sách tỉnh đã unlock - phải match với tên trong JSON
// Trong JSON có: "Thành phố Hà Nội" và "Thành phố Hồ Chí Minh"
const mockUnlockedProvinces = ['Thành phố Hà Nội', 'Thành phố Hồ Chí Minh'];
const mockCurrentRank = 'Thổ địa Hà Thành';
const mockProgress = { current: 12, target: 50 };
const mockRecentFoods = [
  {
    id: '1',
    name: 'Bánh Mì Phượng',
    location: 'Hội An',
    region: 'Trung_Bo',
    image:
      'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80',
    tag: 'Mới mở khóa',
  },
  {
    id: '2',
    name: 'Bún Bò Huế',
    location: 'Huế',
    region: 'Trung_Bo',
    image:
      'https://images.unsplash.com/photo-1604908177443-00ac5d1e5f7d?auto=format&fit=crop&w=600&q=80',
  },
];

export default function ExploreScreen() {
  const [unlockedProvinces] = useState<string[]>(mockUnlockedProvinces);

  const calculateNextRank = () => {
    if (mockProgress.current < 5) return { name: 'Khách vãng lai', target: 5 };
    if (mockProgress.current < 50) return { name: 'Vua Ẩm Thực Việt', target: 50 };
    return { name: 'Đã đạt cấp tối đa', target: mockProgress.current };
  };

  const nextRank = calculateNextRank();
  const progressPercent = (mockProgress.current / nextRank.target) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
            }}
            style={styles.avatar}
          />
          <Text style={styles.headerTitle}>Hộ chiếu Ẩm thực</Text>
          <TouchableOpacity>
            <Ionicons name="trophy" size={24} color={primary} />
          </TouchableOpacity>
        </View>

        {/* Rank Card */}
        <View style={styles.rankCard}>
          <View style={styles.rankLeft}>
            <Text style={styles.rankLabel}>DANH HIỆU HIỆN TẠI</Text>
            <Text style={styles.rankTitle}>{mockCurrentRank}</Text>
            <View style={styles.rankBadge}>
              <Ionicons name="information-circle" size={16} color={primary} />
            </View>
          </View>
          <View style={styles.rankRight}>
            <Text style={styles.rankProgressLabel}>Tiến độ cấp bậc tiếp theo</Text>
            <View style={styles.rankBar}>
              <View style={[styles.rankFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.rankCount}>
              {mockProgress.current}/{nextRank.target} món
            </Text>
            <Text style={styles.rankHint}>
              Mở khóa thêm {nextRank.target - mockProgress.current} món ăn để đạt danh hiệu &quot;
              {nextRank.name}&quot;
            </Text>
          </View>
        </View>

        {/* Vietnam Map - Full Screen */}
        <View style={styles.mapContainer}>
          <VietnamMap
            unlockedProvinces={unlockedProvinces}
            onProvincePress={(provinceName) => {
              console.log('Province pressed:', provinceName);
              // TODO: Navigate to province details
            }}
          />
        </View>

        {/* Recently Explored */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Khám phá gần đây</Text>
          <TouchableOpacity>
            <View style={styles.sectionLinkRow}>
              <Text style={styles.sectionLink}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={16} color={primary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.discoverRow}>
          {mockRecentFoods.map((item) => (
            <TouchableOpacity key={item.id} style={styles.discoverCard}>
              <Image source={{ uri: item.image }} style={styles.discoverImage} />
              <View style={styles.discoverInfo}>
                <View style={styles.discoverLocationRow}>
                  <Ionicons name="location" size={12} color={primary} />
                  <Text style={styles.discoverLocation}>{item.location}</Text>
                </View>
                <Text style={styles.discoverTitle}>{item.name}</Text>
                {item.tag && (
                  <View style={styles.discoverTagBadge}>
                    <Text style={styles.discoverTag}>{item.tag}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Scan Button */}
        <Link href="/ai-food-mode" asChild>
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons name="qr-code" size={28} color="#fff" />
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: primary,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
    marginLeft: 12,
  },
  rankCard: {
    backgroundColor: card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d1b1b',
    marginBottom: 18,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rankLabel: {
    color: textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  rankTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(209,31,47,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankRight: {
    marginTop: 8,
  },
  rankProgressLabel: {
    color: textLight,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  rankBar: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#3a1f1f',
    overflow: 'hidden',
    marginBottom: 8,
  },
  rankFill: {
    backgroundColor: primary,
    height: '100%',
    borderRadius: 8,
  },
  rankCount: {
    color: primary,
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
  },
  rankHint: {
    color: textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  mapContainer: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.75,
    marginBottom: 18,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: textLight,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionLink: {
    color: primary,
    fontWeight: '700',
    fontSize: 14,
  },
  discoverRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  discoverCard: {
    flex: 1,
    backgroundColor: card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d1b1b',
    overflow: 'hidden',
  },
  discoverImage: {
    width: '100%',
    height: 120,
  },
  discoverInfo: {
    padding: 12,
  },
  discoverLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  discoverLocation: {
    color: textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  discoverTitle: {
    color: textLight,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 6,
  },
  discoverTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(209,31,47,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discoverTag: {
    color: primary,
    fontWeight: '700',
    fontSize: 11,
  },
  scanButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: primary,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
