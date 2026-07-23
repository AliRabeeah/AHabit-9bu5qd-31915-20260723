import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Habit, HabitLog } from '../../services/habitService';
import { ProgressRing } from './ProgressRing';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onDone: () => void;
  onSkip: () => void;
  onPress: () => void;
  currentStreak?: number;
}

function getProgress(habit: Habit, log?: HabitLog): number {
  if (!log || log.status === 'pending') return 0;
  if (log.status === 'done') return 1;
  if (log.status === 'skipped') return 0.5;
  if (habit.type === 'numeric' && habit.goal && log.value !== undefined) {
    return Math.min(1, log.value / habit.goal);
  }
  return 0;
}

function getStatusLabel(log?: HabitLog): string | null {
  if (!log || log.status === 'pending') return null;
  if (log.status === 'done') return 'Done';
  if (log.status === 'skipped') return 'Skipped';
  return null;
}

export function HabitCard({ habit, log, onDone, onSkip, onPress, currentStreak = 0 }: HabitCardProps) {
  const scale = useSharedValue(1);
  const isDone = log?.status === 'done';
  const isSkipped = log?.status === 'skipped';
  const progress = getProgress(habit, log);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleDone = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1.02, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    onDone();
  };

  const ringColor = isDone ? Colors.success : isSkipped ? Colors.skipped : habit.color;

  return (
    <Animated.View style={[cardStyle]}>
      <Pressable
        style={[styles.card, isDone && styles.cardDone, isSkipped && styles.cardSkipped]}
        onPress={onPress}
        android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      >
        {/* Color accent line */}
        <View style={[styles.accentLine, { backgroundColor: habit.color }]} />

        <View style={styles.content}>
          {/* Left: icon + info */}
          <View style={styles.left}>
            <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
              <Text style={styles.icon}>{habit.icon}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, isDone && styles.nameDone]} numberOfLines={1}>
                {habit.name}
              </Text>
              <View style={styles.meta}>
                {currentStreak > 0 ? (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥 {currentStreak}</Text>
                  </View>
                ) : null}
                {getStatusLabel(log) ? (
                  <View style={[
                    styles.statusBadge,
                    isDone ? styles.statusDone : styles.statusSkipped
                  ]}>
                    <Text style={[styles.statusText, isDone ? styles.statusTextDone : styles.statusTextSkipped]}>
                      {getStatusLabel(log)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.typeLabel}>
                    {habit.type === 'numeric' ? `0/${habit.goal} ${habit.unit ?? ''}` :
                      habit.type === 'timer' ? `0/${habit.goalMinutes}min` :
                        habit.type === 'checklist' ? `0/${habit.checklistItems?.length ?? 0} tasks` :
                          'Tap to complete'}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Right: progress ring + actions */}
          <View style={styles.right}>
            <ProgressRing
              progress={progress}
              size={52}
              strokeWidth={4}
              color={ringColor}
              bgColor={Colors.surfaceHighlight}
            >
              <Text style={styles.progressEmoji}>
                {isDone ? '✓' : isSkipped ? '—' : habit.icon}
              </Text>
            </ProgressRing>

            <View style={styles.actions}>
              {!isDone ? (
                <Pressable
                  style={[styles.actionBtn, styles.doneBtn, { backgroundColor: habit.color }]}
                  onPress={handleDone}
                  hitSlop={8}
                >
                  <Text style={styles.actionBtnText}>✓</Text>
                </Pressable>
              ) : null}
              {!isSkipped && !isDone ? (
                <Pressable
                  style={[styles.actionBtn, styles.skipBtn]}
                  onPress={onSkip}
                  hitSlop={8}
                >
                  <Text style={styles.skipBtnText}>—</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardDone: {
    borderColor: Colors.success + '40',
    backgroundColor: Colors.successDim,
  },
  cardSkipped: {
    borderColor: Colors.skipped + '40',
    opacity: 0.7,
  },
  accentLine: {
    height: 2,
    width: '100%',
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  nameDone: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  streakBadge: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  streakText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusDone: {
    backgroundColor: Colors.successDim,
  },
  statusSkipped: {
    backgroundColor: Colors.skippedDim,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  statusTextDone: {
    color: Colors.success,
  },
  statusTextSkipped: {
    color: Colors.skipped,
  },
  typeLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  right: {
    alignItems: 'center',
    gap: 8,
  },
  progressEmoji: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtn: {},
  skipBtn: {
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: Typography.bold,
  },
  skipBtnText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: Typography.bold,
  },
});
