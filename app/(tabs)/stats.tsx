import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useHabits } from '../../hooks/useHabits';
import { HabitService } from '../../services/habitService';
import { ProgressRing } from '../../components/ui/ProgressRing';

interface HabitStat {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalDone: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { habits } = useHabits();
  const [stats, setStats] = useState<HabitStat[]>([]);
  const [totalDone, setTotalDone] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [avgCompletion, setAvgCompletion] = useState(0);

  useEffect(() => {
    const load = async () => {
      const results: HabitStat[] = [];
      let totalDoneAll = 0;
      let bestStreakAll = 0;
      let totalRateAll = 0;

      for (const habit of habits) {
        const s = await HabitService.getStats(habit.id);
        results.push({
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          totalDone: s.totalDone,
          completionRate: s.completionRate,
          currentStreak: s.streak.current,
          longestStreak: s.streak.longest,
        });
        totalDoneAll += s.totalDone;
        if (s.streak.longest > bestStreakAll) bestStreakAll = s.streak.longest;
        totalRateAll += s.completionRate;
      }

      results.sort((a, b) => b.completionRate - a.completionRate);
      setStats(results);
      setTotalDone(totalDoneAll);
      setBestStreak(bestStreakAll);
      setAvgCompletion(habits.length > 0 ? Math.round(totalRateAll / habits.length) : 0);
    };
    load();
  }, [habits]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()],
      date: d.toISOString().split('T')[0],
      isToday: i === 6,
    };
  });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Track your progress</Text>
      </View>

      {/* Overview Cards */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.overviewRow}>
        <View style={styles.overviewCard}>
          <ProgressRing progress={avgCompletion / 100} size={64} strokeWidth={5} color={Colors.primary}>
            <Text style={styles.overviewRingText}>{avgCompletion}%</Text>
          </ProgressRing>
          <Text style={styles.overviewLabel}>Avg Rate</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewBigNum}>{totalDone}</Text>
          <Text style={styles.overviewLabel}>Total Done</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewBigNum}>🔥{bestStreak}</Text>
          <Text style={styles.overviewLabel}>Best Streak</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewBigNum}>{habits.length}</Text>
          <Text style={styles.overviewLabel}>Habits</Text>
        </View>
      </Animated.View>

      {/* Leaderboard */}
      <Animated.View entering={FadeInDown.delay(100)}>
        <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
        {stats.map((stat, i) => (
          <Animated.View
            key={stat.id}
            entering={FadeInRight.delay(i * 60)}
            style={styles.leaderRow}
          >
            <View style={styles.leaderRank}>
              <Text style={styles.leaderRankText}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </Text>
            </View>
            <View style={[styles.leaderIcon, { backgroundColor: stat.color + '20' }]}>
              <Text style={styles.leaderIconText}>{stat.icon}</Text>
            </View>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName} numberOfLines={1}>{stat.name}</Text>
              <View style={styles.leaderBarBg}>
                <View style={[styles.leaderBarFill, {
                  width: `${stat.completionRate}%` as any,
                  backgroundColor: stat.color,
                }]} />
              </View>
            </View>
            <View style={styles.leaderRight}>
              <Text style={[styles.leaderRate, { color: stat.color }]}>{stat.completionRate}%</Text>
              <Text style={styles.leaderStreak}>🔥{stat.currentStreak}</Text>
            </View>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Individual Stats */}
      {stats.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>📊 Detailed Stats</Text>
          {stats.map(stat => (
            <View key={stat.id} style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailIcon, { backgroundColor: stat.color + '20' }]}>
                  <Text>{stat.icon}</Text>
                </View>
                <View style={styles.detailTitleWrap}>
                  <Text style={styles.detailName}>{stat.name}</Text>
                </View>
                <ProgressRing
                  progress={stat.completionRate / 100}
                  size={44}
                  strokeWidth={4}
                  color={stat.color}
                >
                  <Text style={[styles.detailPct, { color: stat.color }]}>{stat.completionRate}%</Text>
                </ProgressRing>
              </View>
              <View style={styles.detailMetrics}>
                <View style={styles.detailMetric}>
                  <Text style={styles.detailMetricNum}>{stat.totalDone}</Text>
                  <Text style={styles.detailMetricLabel}>Done</Text>
                </View>
                <View style={styles.detailMetric}>
                  <Text style={[styles.detailMetricNum, { color: Colors.warning }]}>{stat.currentStreak}</Text>
                  <Text style={styles.detailMetricLabel}>Streak</Text>
                </View>
                <View style={styles.detailMetric}>
                  <Text style={[styles.detailMetricNum, { color: Colors.primary }]}>{stat.longestStreak}</Text>
                  <Text style={styles.detailMetricLabel}>Best</Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      ) : null}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  overviewRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewRingText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  overviewBigNum: {
    fontSize: Typography.xl,
    fontWeight: Typography.extrabold,
    color: Colors.textPrimary,
  },
  overviewLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderRank: {
    width: 32,
    alignItems: 'center',
  },
  leaderRankText: {
    fontSize: Typography.base,
  },
  leaderIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderIconText: {
    fontSize: 18,
  },
  leaderInfo: {
    flex: 1,
    gap: 4,
  },
  leaderName: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  leaderBarBg: {
    height: 4,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  leaderBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  leaderRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  leaderRate: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  leaderStreak: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  detailCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTitleWrap: {
    flex: 1,
  },
  detailName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  detailPct: {
    fontSize: 10,
    fontWeight: Typography.bold,
  },
  detailMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  detailMetric: {
    alignItems: 'center',
    gap: 2,
  },
  detailMetricNum: {
    fontSize: Typography.xl,
    fontWeight: Typography.extrabold,
    color: Colors.textPrimary,
  },
  detailMetricLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
});
