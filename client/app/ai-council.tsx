import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const bg = '#1b0f0f';
const card = '#261515';
const textLight = '#f8f2f2';
const textMuted = '#c5b8b8';
const primary = '#d11f2f';

const council = [
  {
    name: 'ResNet-50',
    quote: 'Kết cấu sợi phở và lát thịt bò rất rõ ràng.',
    score: '95%',
    result: 'Phở Bò',
    state: 'ok',
  },
  {
    name: 'EfficientNet V2',
    quote: 'Phát hiện hành tây, nước dùng trong.',
    score: '92%',
    result: 'Phở Bò',
    state: 'ok',
  },
  {
    name: 'Inception V3',
    quote: 'Màu nước dùng hơi đỏ, có thể là Bún Bò?',
    score: '45%',
    result: 'Bún Bò Huế',
    state: 'warn',
  },
  {
    name: 'Yummy Vision AI',
    quote: 'Đặc trưng thảo mộc và bánh phở tươi. Chắc chắn 100%.',
    score: '99%',
    result: 'Phở Bò Tái',
    state: 'error',
  },
  {
    name: 'Color Histogram',
    quote: 'Phở màu tương đồng với dữ liệu Phở.',
    score: '88%',
    result: 'Phở Bò',
    state: 'ok',
  },
];

const stateColor = {
  ok: '#d11f2f',
  warn: '#f3a73b',
  error: '#d11f2f',
};

export default function AICouncilScreen() {
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
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="chevron-back" size={22} color={textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hội đồng AI</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.hero}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=500&q=80',
            }}
            style={styles.heroImage}
          />
          <View style={styles.scanLine} />
        </View>
        <View style={styles.debateTag}>
          <View style={styles.dot} />
          <Text style={styles.debateText}>ĐANG TRANH LUẬN</Text>
        </View>
        <Text style={styles.headline}>Đang phân tích món ăn...</Text>
        <Text style={styles.subHeadline}>
          5 mô hình AI đang phân tích hình ảnh của bạn để tìm ra kết quả chính xác nhất.
        </Text>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Chi tiết đánh giá</Text>
          <Text style={styles.sectionLabel}>4/5 Đồng thuận</Text>
        </View>

        {council.map((item) => (
          <View key={item.name} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                <Ionicons name="aperture" size={18} color={textLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardQuote}>"{item.quote}"</Text>
              </View>
              <Text
                style={[styles.score, { color: stateColor[item.state as keyof typeof stateColor] }]}
              >
                {item.score}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Dự đoán:</Text>
              <Text style={styles.resultText}>{item.result}</Text>
            </View>
          </View>
        ))}

        <View style={styles.finalCard}>
          <View style={styles.finalLeft}>
            <View style={styles.finalCheck}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            <View>
              <Text style={styles.finalLabel}>KẾT QUẢ THỐNG NHẤT</Text>
              <Text style={styles.finalTitle}>Phở Bò</Text>
              <Text style={styles.finalConf}>Độ tin cậy trung bình: 96%</Text>
            </View>
          </View>
          <View style={styles.finalActions}>
            <TouchableOpacity style={styles.retake}>
              <Text style={styles.retakeText}>Thử lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recipe}>
              <Text style={styles.recipeText}>Xem công thức</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: bg },
  container: { flex: 1, paddingHorizontal: 18 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  hero: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 110,
    backgroundColor: '#120909',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    position: 'relative',
  },
  heroImage: { width: 170, height: 170, borderRadius: 85 },
  scanLine: {
    position: 'absolute',
    width: '80%',
    height: 6,
    backgroundColor: primary,
    top: '48%',
    shadowColor: primary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  debateTag: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#2b1717',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: primary },
  debateText: { color: textLight, fontWeight: '700' },
  headline: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  subHeadline: {
    color: textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  sectionRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionLabel: { color: textMuted, fontWeight: '600' },
  card: {
    marginTop: 12,
    backgroundColor: card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  cardHeader: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: textLight, fontWeight: '800' },
  cardQuote: { color: textMuted, fontSize: 12, marginTop: 2 },
  score: { fontWeight: '800', fontSize: 16 },
  resultRow: { flexDirection: 'row', marginTop: 10, gap: 8, alignItems: 'center' },
  resultLabel: { color: textMuted, fontWeight: '600' },
  resultText: { color: textLight, fontWeight: '800' },
  finalCard: {
    marginTop: 16,
    backgroundColor: card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d1b1b',
  },
  finalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  finalCheck: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalLabel: { color: textMuted, fontSize: 12 },
  finalTitle: { color: textLight, fontSize: 20, fontWeight: '800' },
  finalConf: { color: textMuted, marginTop: 4 },
  finalActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 12,
  },
  retake: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#332020',
    alignItems: 'center',
  },
  retakeText: { color: textLight, fontWeight: '700' },
  recipe: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: primary,
    alignItems: 'center',
  },
  recipeText: { color: '#fff', fontWeight: '800' },
});
