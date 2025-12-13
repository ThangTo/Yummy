import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const bg = '#1b0f0f';
const card = '#261515';
const textLight = '#f8f2f2';
const primary = '#d11f2f';

export default function CultureCardScreen() {
  const router = useRouter();
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="close" size={22} color={textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thẻ bài mới</Text>
          <Ionicons name="ellipsis-horizontal" size={22} color={textLight} />
        </View>

        <View style={styles.cardContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.heroImage}
          />

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: '#b3b3b3' }]}>
              <Text style={styles.badgeTextDark}>MIỀN BẮC</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: primary }]}>
              <Text style={styles.badgeTextLight}>ĐẶC SẢN</Text>
            </View>
          </View>

          <Text style={styles.title}>Phở Bò{'\n'}Nam Định</Text>

          <TouchableOpacity style={styles.listenButton}>
            <Ionicons name="volume-high" size={18} color="#fff" />
            <Text style={styles.listenText}>Nghe giọng chuẩn</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>✨ CÂU CHUYỆN VĂN HÓA</Text>
          <Text style={styles.story}>
            Phở bò Nam Định có nguồn gốc từ làng Giao Cù, dòng họ Cồ nổi tiếng. Nước dùng đặc trưng
            bởi độ trong, vị ngọt đậm đà từ xương ống hầm kỹ và hương thơm nức mũi của gừng nướng,
            hoa hồi, thảo quả.{'\n\n'}
            Khác với phở Hà Nội thanh tao, phở Nam Định mang vị mặn mòi của nước mắm cốt biển, sợi
            bánh to bản mềm mượt và thịt bò được tái dòn, nhưng vẫn giữ vị ngọt tự nhiên.
          </Text>

          <TouchableOpacity style={styles.saveButton}>
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
});
