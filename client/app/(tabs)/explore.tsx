import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const bg = '#1b0f0f';
const card = '#261515';
const textLight = '#f8f2f2';
const textMuted = '#c5b8b8';
const primary = '#d11f2f';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Ionicons name="chevron-back" size={20} color={textLight} />
        <Text style={styles.headerTitle}>Hộ chiếu Ẩm thực</Text>
        <Ionicons name="trophy" size={20} color={textLight} />
      </View>

      <View style={styles.rankCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rankLabel}>DANH HIỆU HIỆN TẠI</Text>
          <Text style={styles.rankTitle}>Thổ địa Hà Thành</Text>
          <Text style={styles.rankProgress}>Tiến độ cấp bậc tiếp theo</Text>
          <View style={styles.rankBar}>
            <View style={styles.rankFill} />
          </View>
          <Text style={styles.rankCount}>12/50 món</Text>
          <Text style={styles.rankHint}>
            Mở khóa thêm 38 món ăn để đạt danh hiệu &quot;Vua Ẩm Thực Việt&quot;
          </Text>
        </View>
        <View style={styles.badgeCircle}>
          <Ionicons name="medal-outline" size={26} color={textLight} />
        </View>
      </View>

      <View style={styles.mapCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.mapImage}
          resizeMode="cover"
          blurRadius={12}
        />
        <View style={styles.mapOverlay} />
        <View style={styles.mapPinWrapper}>
          <View style={styles.mapPulse} />
          <View style={styles.mapPin}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.mapPinImage}
            />
          </View>
          <Text style={styles.mapPinLabel}>Hà Nội</Text>
        </View>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={14} color={textMuted} />
          <Text style={styles.lockText}>Đà Nẵng</Text>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Khám phá gần đây</Text>
        <Text style={styles.sectionLink}>Xem tất cả →</Text>
      </View>

      <View style={styles.discoverRow}>
        {[
          {
            title: 'Bánh Mì Phượng',
            location: 'Hội An',
            tag: 'Mới mở khóa',
            image:
              'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80',
          },
          {
            title: 'Bún Bò Huế',
            location: 'Huế',
            tag: 'Đang mở',
            image:
              'https://images.unsplash.com/photo-1604908177443-00ac5d1e5f7d?auto=format&fit=crop&w=600&q=80',
          },
        ].map((item) => (
          <View key={item.title} style={styles.discoverCard}>
            <Image source={{ uri: item.image }} style={styles.discoverImage} />
            <View style={styles.discoverInfo}>
              <Text style={styles.discoverTitle}>{item.title}</Text>
              <Text style={styles.discoverLocation}>• {item.location}</Text>
              <Text style={styles.discoverTag}>{item.tag}</Text>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: bg,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  rankCard: {
    backgroundColor: card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d1b1b',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  rankLabel: {
    color: textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  rankTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  rankProgress: {
    color: textLight,
    marginTop: 8,
    fontWeight: '600',
  },
  rankBar: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#3a1f1f',
    marginTop: 8,
    overflow: 'hidden',
  },
  rankFill: {
    width: '25%',
    backgroundColor: primary,
    height: '100%',
  },
  rankCount: {
    color: textLight,
    marginTop: 6,
    fontWeight: '600',
  },
  rankHint: {
    color: textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  badgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2f1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCard: {
    marginTop: 18,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d1b1b',
    height: 320,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  mapPinWrapper: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    transform: [{ translateX: -24 }],
    alignItems: 'center',
    gap: 10,
  },
  mapPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(209,31,47,0.22)',
    position: 'absolute',
    top: -20,
    left: -20,
  },
  mapPin: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: primary,
    overflow: 'hidden',
  },
  mapPinImage: {
    width: '100%',
    height: '100%',
  },
  mapPinLabel: {
    color: textLight,
    fontWeight: '700',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#2d1b1b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockText: {
    color: textMuted,
    fontWeight: '600',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    color: textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#ff6969',
    fontWeight: '700',
  },
  discoverRow: {
    flexDirection: 'row',
    gap: 12,
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
    height: 110,
  },
  discoverInfo: {
    padding: 12,
    gap: 4,
  },
  discoverTitle: {
    color: textLight,
    fontWeight: '700',
    fontSize: 15,
  },
  discoverLocation: {
    color: textMuted,
    fontSize: 12,
  },
  discoverTag: {
    color: '#ff6969',
    fontWeight: '700',
    fontSize: 12,
  },
});
