import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useAuth } from '../hooks/use-auth';
import { apiService, type LeaderboardUser } from '../services/api';

const bg = '#121212';
const card = '#1E1E1E';
const primary = '#d11f2f';
const textLight = '#FFFFFF';
const textMuted = '#A0A0A0';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiService.getLeaderboard();
      setLeaders(res);
    } catch (err: any) {
      console.error('Error loading leaderboard:', err);
      setError(err?.message || 'Không thể tải bảng xếp hạng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchLeaderboard();
    } catch (err) {
      console.error('Leaderboard refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchLeaderboard]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng xếp hạng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={primary} />
        }
      >
        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator color={primary} />
            <Text style={[styles.muted, { marginTop: 8 }]}>Đang tải bảng xếp hạng...</Text>
          </View>
        )}

        {error && !isLoading && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!isLoading &&
          !error &&
          leaders.map((u, index) => {
            const rank = index + 1;
            const isMe = user && u.id === user.id;
            const rankIcon =
              rank === 1 ? 'trophy' : rank === 2 ? 'medal' : rank === 3 ? 'ribbon' : undefined;

            return (
              <View
                key={u.id}
                style={[
                  styles.row,
                  isMe && { borderColor: primary, borderWidth: 1.2, backgroundColor: '#222' },
                ]}
              >
                <View style={styles.rankCol}>
                  <Text style={[styles.rankText, rank <= 3 && { color: primary }]}>#{rank}</Text>
                  {rankIcon && (
                    <Ionicons
                      name={rankIcon as any}
                      size={14}
                      color={rank === 1 ? '#FFD700' : '#FFB74D'}
                    />
                  )}
                </View>
                <Image
                  source={{
                    uri:
                      u.avatar ||
                      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.infoCol}>
                  <Text style={[styles.name, isMe && { color: primary }]} numberOfLines={1}>
                    {u.username}
                  </Text>
                  <Text style={styles.rankLabel} numberOfLines={1}>
                    {u.current_rank}
                  </Text>
                </View>
                <View style={styles.countCol}>
                  <Text style={styles.count}>{u.food_count}</Text>
                  <Text style={styles.countLabel}>món</Text>
                </View>
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
  },
  headerTitle: {
    color: textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 30,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: card,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  rankCol: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#333',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    color: textLight,
    fontWeight: '700',
    fontSize: 14,
  },
  rankLabel: {
    color: textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  countCol: {
    alignItems: 'flex-end',
  },
  count: {
    color: textLight,
    fontWeight: '700',
    fontSize: 16,
  },
  countLabel: {
    color: textMuted,
    fontSize: 11,
  },
  muted: {
    color: textMuted,
    fontSize: 12,
  },
});
