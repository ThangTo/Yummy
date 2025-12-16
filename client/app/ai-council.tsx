import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeColors } from '../context/ThemeContext';
import { useTheme } from '../hooks/use-theme';
// Đảm bảo đường dẫn import này đúng với cấu trúc dự án của bạn
import { apiService, type ScanResponse } from '../services/api';

const stateColor = {
  ok: '#d11f2f',
  warn: '#f3a73b',
  error: '#d11f2f',
};

export default function AICouncilScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scanResult?: string; imageUri?: string }>();
  const { colors, mode } = useTheme();
  const styles = useMemo(() => createStyles(colors, mode), [colors, mode]);

  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const hasScannedRef = useRef(false);

  const performScan = async (uri: string) => {
    try {
      if (hasScannedRef.current) {
        setIsScanning(true);
        setIsLoading(true);
      }

      console.log('📸 Starting scan API for:', uri);

      const scanResult = await apiService.scanFood(uri);

      console.log('✅ Scan success');
      setScanData(scanResult);
    } catch (error: any) {
      console.error('❌ Error scanning:', error);
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const uri = params.imageUri;

    // Logic: Nếu có ảnh VÀ chưa từng scan lần nào (check theo Ref)
    if (uri && !hasScannedRef.current) {
      console.log('🚀 Triggering scan logic for URI:', uri);

      // 1. Đóng chốt ngay lập tức để chặn các lần render thừa thãi sau đó
      hasScannedRef.current = true;

      // 2. Dùng setTimeout để đẩy việc xử lý ra khỏi luồng render hiện tại
      // Kỹ thuật này giúp React hoàn tất việc render UI trước khi bắt đầu update state mới
      // => Khắc phục triệt để lỗi "Maximum update depth exceeded"
      setTimeout(() => {
        performScan(uri);
      }, 100);
    }
  }, [params.imageUri]); // Dependency: Chỉ chạy lại khi params.imageUri thay đổi thực sự

  const handleRefresh = useCallback(async () => {
    const uri = params.imageUri;
    if (!uri) {
      return;
    }
    try {
      setRefreshing(true);
      // Cho phép scan lại khi kéo refresh
      await performScan(uri);
    } catch (err) {
      console.error('AI Council refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [params.imageUri]);

  // Hiệu ứng Animation khi đang scan
  useEffect(() => {
    if (isScanning) {
      // Scan line chạy lên xuống
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Glow effect nhấp nháy
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scanLineAnim.stopAnimation();
      glowAnim.stopAnimation();
    }
  }, [isScanning]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleRetake = () => {
    // Reset lại trạng thái để nếu quay lại thì scan được tiếp (tùy logic)
    hasScannedRef.current = false;
    router.back();
  };

  const handleViewRecipe = () => {
    if (scanData?.food?._id) {
      router.push({
        pathname: '/culture-card',
        params: { foodId: scanData.food._id },
      });
    }
  };

  // Convert AI Council response thành format cho UI
  const councilMembers = scanData ? apiService.convertAICouncilToUI(scanData.ai_council) : [];

  // Tính số model đồng thuận
  const consensusCount = scanData
    ? councilMembers.filter((member) => member.result === scanData.ai_council.best_match).length
    : 0;

  const totalModels = councilMembers.length;
  const hasImage = !!params.imageUri;
  const hasData = !!scanData;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hội đồng AI</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Hero Image Section */}
        <View style={styles.hero}>
          {hasImage ? (
            <>
              <Image source={{ uri: params.imageUri! }} style={styles.heroImage} />

              {/* Glow effect overlay */}
              {isScanning && (
                <Animated.View
                  style={[
                    styles.glowOverlay,
                    {
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.6],
                      }),
                    },
                  ]}
                />
              )}

              {/* Animated scan line */}
              {isScanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-85, 85], // Di chuyển trong phạm vi ảnh
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}
            </>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="image-outline" size={48} color={colors.textMuted} />
              <Text style={styles.placeholderText}>Chưa có ảnh</Text>
            </View>
          )}
        </View>

        {/* Loading State */}
        {(isLoading || isScanning) && (
          <>
            <View style={styles.debateTag}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.debateText}>ĐANG QUÉT ẢNH</Text>
            </View>
            <Text style={styles.headline}>Đang quét và phân tích món ăn...</Text>
            <Text style={styles.subHeadline}>
              Nhiều mô hình AI đang phân tích hình ảnh của bạn để tìm ra kết quả chính xác nhất.
            </Text>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Vui lòng đợi...</Text>
            </View>
          </>
        )}

        {/* Success State */}
        {!isLoading && hasData && (
          <>
            <View style={styles.debateTag}>
              <View style={styles.dot} />
              <Text style={styles.debateText}>HOÀN THÀNH</Text>
            </View>
            <Text style={styles.headline}>Đã phân tích: {scanData?.food.name_vi}</Text>
            <Text style={styles.subHeadline}>
              Kết quả từ {totalModels} mô hình AI với độ tin cậy{' '}
              {Math.round((scanData?.ai_council.confidence || 0) * 100)}%
            </Text>
          </>
        )}

        {/* Error / Empty State */}
        {!isLoading && !hasData && !isScanning && (
          <>
            <View style={styles.debateTag}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.textMuted} />
              <Text style={styles.debateText}>CHƯA CÓ DỮ LIỆU</Text>
            </View>
            <Text style={styles.headline}>Chưa có kết quả phân tích</Text>
            <Text style={styles.subHeadline}>
              {hasImage
                ? 'Không thể phân tích ảnh. Vui lòng thử lại với ảnh khác.'
                : 'Vui lòng chụp ảnh hoặc chọn ảnh từ thư viện để bắt đầu phân tích.'}
            </Text>
          </>
        )}

        {/* Result Details */}
        {!isLoading && scanData && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Chi tiết đánh giá</Text>
              <Text style={styles.sectionLabel}>
                {consensusCount}/{totalModels} Đồng thuận
              </Text>
            </View>

            {/* List Council Members */}
            {councilMembers.map((item) => (
              <View key={item.name} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                    <Ionicons name="aperture" size={18} color={colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardQuote}>&quot;{item.quote}&quot;</Text>
                  </View>
                  <Text
                    style={[
                      styles.score,
                      { color: stateColor[item.state as keyof typeof stateColor] || stateColor.ok },
                    ]}
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

            {/* Final Result Card */}
            <View style={styles.finalCard}>
              <View style={styles.finalLeft}>
                <View style={styles.finalCheck}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <View>
                  <Text style={styles.finalLabel}>KẾT QUẢ THỐNG NHẤT</Text>
                  <Text style={styles.finalTitle}>{scanData.food.name_vi}</Text>
                  <Text style={styles.finalConf}>
                    Độ tin cậy: {Math.round(scanData.ai_council.confidence * 100)}%
                  </Text>
                  {scanData.food.province_name && (
                    <Text style={styles.finalConf}>Tỉnh: {scanData.food.province_name}</Text>
                  )}
                </View>
              </View>
              <View style={styles.finalActions}>
                <TouchableOpacity
                  style={[styles.retake, { backgroundColor: '#cccccc' }]}
                  onPress={handleRetake}
                >
                  <Text style={[styles.retakeText, { color: '#000' }]}>Thử lại</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recipe} onPress={handleViewRecipe}>
                  <Text style={styles.recipeText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Empty State UI */}
        {!isLoading && !hasData && !isScanning && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="image-outline" size={64} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {hasImage ? 'Không thể phân tích ảnh' : 'Chưa có ảnh được cung cấp'}
            </Text>
            <Text style={styles.emptyDescription}>
              {hasImage
                ? 'Ảnh có thể bị lỗi hoặc không phù hợp. Vui lòng thử lại với ảnh khác.'
                : 'Hãy chụp ảnh hoặc chọn ảnh từ thư viện để AI có thể phân tích món ăn.'}
            </Text>
            <TouchableOpacity style={styles.retake} onPress={handleRetake}>
              <Ionicons
                name="camera-outline"
                size={18}
                color="#f8f2f2"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.retakeText, { color: '#f8f2f2' }]}>
                {hasImage ? 'Thử lại' : 'Chụp ảnh'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors, mode: 'light' | 'dark') =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    container: { flex: 1, paddingHorizontal: 18 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    headerTitle: { color: c.text, fontSize: 18, fontWeight: '800' },
    hero: {
      alignSelf: 'center',
      width: 200,
      height: 200,
      borderRadius: 110,
      backgroundColor: mode === 'light' ? '#f5e6e6' : '#120909',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
      position: 'relative',
    },
    heroImage: { width: 170, height: 170, borderRadius: 85 },
    scanLine: {
      position: 'absolute',
      width: '80%',
      height: 4,
      backgroundColor: c.primary,
      top: '50%',
      shadowColor: c.primary,
      shadowOpacity: 0.8,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 },
      elevation: 8,
    },
    glowOverlay: {
      position: 'absolute',
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: c.primary,
      opacity: 0.3,
    },
    debateTag: {
      marginTop: 16,
      alignSelf: 'center',
      backgroundColor: mode === 'light' ? '#f7e9e9' : '#2b1717',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary },
    debateText: { color: c.text, fontWeight: '700' },
    headline: {
      color: c.text,
      fontSize: 20,
      fontWeight: '800',
      marginTop: 12,
      textAlign: 'center',
    },
    subHeadline: {
      color: c.textMuted,
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
    sectionTitle: { color: c.text, fontSize: 16, fontWeight: '800' },
    sectionLabel: { color: c.textMuted, fontWeight: '600' },
    card: {
      marginTop: 12,
      backgroundColor: c.card,
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
    cardTitle: { color: c.text, fontWeight: '800' },
    cardQuote: { color: c.textMuted, fontSize: 12, marginTop: 2 },
    score: { fontWeight: '800', fontSize: 16 },
    resultRow: { flexDirection: 'row', marginTop: 10, gap: 8, alignItems: 'center' },
    resultLabel: { color: c.textMuted, fontWeight: '600' },
    resultText: { color: c.text, fontWeight: '800' },
    finalCard: {
      marginTop: 16,
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: mode === 'light' ? '#f1dede' : '#2d1b1b',
    },
    finalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    finalCheck: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    finalLabel: { color: c.textMuted, fontSize: 12 },
    finalTitle: { color: c.text, fontSize: 20, fontWeight: '800' },
    finalConf: { color: c.textMuted, marginTop: 4 },
    finalActions: {
      flexDirection: 'row',
      marginTop: 14,
      gap: 12,
    },
    retake: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    retakeText: { color: c.text, fontWeight: '700' },
    recipe: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: 'center',
    },
    recipeText: { color: '#fff', fontWeight: '800' },
    heroPlaceholder: {
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: mode === 'light' ? '#f5e6e6' : '#1a0f0f',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#2d1b1b',
      borderStyle: 'dashed',
    },
    placeholderText: {
      color: c.textMuted,
      fontSize: 12,
      marginTop: 8,
      fontWeight: '600',
    },
    loadingContainer: {
      marginTop: 32,
      alignItems: 'center',
      padding: 32,
    },
    loadingText: {
      color: c.textMuted,
      marginTop: 16,
      fontSize: 14,
    },
    emptyContainer: {
      marginTop: 32,
      alignItems: 'center',
      padding: 24,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: mode === 'light' ? '#f5e6e6' : '#1a0f0f',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderWidth: 2,
      borderColor: '#2d1b1b',
    },
    emptyTitle: {
      color: c.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyDescription: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
      paddingHorizontal: 20,
    },
  });
