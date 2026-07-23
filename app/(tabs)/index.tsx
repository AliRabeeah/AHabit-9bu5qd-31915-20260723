import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  RefreshControl, ActivityIndicator, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, FadeInDown,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useHabits } from '../../hooks/useHabits';
import { HabitCard } from '../../components/ui/HabitCard';
import { HabitService } from '../../services/habitService';
import { DAYS_FULL } from '../../constants/config';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date): string {
  const day = DAYS_FULL[date.getDay()];
  const month = date.toLocaleString('default', { month: 'long' });
  return `${day}, ${month} ${date.getDate()}`;
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, loading, refreshHabits, getTodayLog, markDone, markSkipped } = useHabits();
  const [refreshing, setRefreshing] = useState(false);
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  const today = new Date();
  const todayDay = today.getDay();
  const todayHabits = habits.filter(h => h.repeatDays.includes(todayDay));
  const doneLogs = todayHabits.filter(h => getTodayLog(h.id)?.status === 'done');
  const completionPct = todayHabits.length > 0
    ? Math.round((doneLogs.length / todayHabits.length) * 100) : 0;
  const allDone = todayHabits.length > 0 && doneLogs.length === todayHabits.length;

  useEffect(() => {
    const loadStreaks = async () => {
      const s: Record<string, number> = {};
      for (const habit of todayHabits) {
        const streak = await HabitService.getStreak(habit.id);
        s[habit.id] = streak.current;
      }
      setStreaks(s);
    };
    if (todayHabits.length > 0) loadStreaks();
  }, [habits]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshHabits();
    setRefreshing(false);
  }, [refreshHabits]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.dateText}>{formatDate(today)}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.push('/notes')}
            hitSlop={8}
          >
            <MaterialIcons name="sticky-note-2" size={22} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.push('/settings')}
            hitSlop={8}
          >
            <MaterialIcons name="settings" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Progress Summary */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryTitle}>
            {allDone ? '🎉 All Done!' : `${doneLogs.length} of ${todayHabits.length} done`}
          </Text>
          <Text style={styles.summarySubtitle}>
            {allDone
              ? 'Amazing! You completed all habits today.'
              : `${todayHabits.length - doneLogs.length} habits remaining`}
          </Text>
          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${completionPct}%` as any },
              ]}
            />
          </View>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.pctText}>{completionPct}%</Text>
        </View>
      </Animated.View>

      {/* Habits List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : todayHabits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>No habits today</Text>
          <Text style={styles.emptySubtitle}>Create your first habit to get started</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push('/add-habit')}>
            <Text style={styles.emptyBtnText}>+ Add Habit</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={todayHabits}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
              <HabitCard
                habit={item}
                log={getTodayLog(item.id)}
                onDone={() => markDone(item.id)}
                onSkip={() => markSkipped(item.id)}
                onPress={() => router.push({ pathname: '/edit-habit', params: { id: item.id } })}
                currentStreak={streaks[item.id] ?? 0}
              />
            </Animated.View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => router.push('/add-habit')}
      >
        <MaterialIcons name="add" size={28} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  greeting: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: Typography.md,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryLeft: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  summarySubtitle: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  summaryRight: {
    marginLeft: Spacing.md,
  },
  pctText: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extrabold,
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    marginTop: Spacing.sm,
  },
  emptyBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: '#000',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
