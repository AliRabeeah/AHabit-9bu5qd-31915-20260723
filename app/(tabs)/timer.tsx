import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useTimer, TimerMode, PomodoroPhase } from '../../hooks/useTimer';
import { ProgressRing } from '../../components/ui/ProgressRing';

const POMODORO_PHASES: { id: PomodoroPhase; label: string; color: string }[] = [
  { id: 'work', label: 'Focus', color: Colors.primary },
  { id: 'shortBreak', label: 'Short Break', color: Colors.success },
  { id: 'longBreak', label: 'Long Break', color: '#4FC3F7' },
];

const MODE_TABS: { id: TimerMode; label: string; icon: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro', icon: '🍅' },
  { id: 'countdown', label: 'Countdown', icon: '⏱️' },
  { id: 'stopwatch', label: 'Stopwatch', icon: '⏲️' },
];

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const {
    mode, running, pomodoroPhase, start, pause, reset,
    switchMode, switchPomodoroPhase, getCurrentTime,
    getTotal, formatTime, progress,
  } = useTimer();

  const scale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePlayPause = () => {
    scale.value = withSpring(0.92, { damping: 8 }, () => {
      scale.value = withSpring(1);
    });
    running ? pause() : start();
  };

  const currentTime = getCurrentTime();
  const ringProgress = mode === 'stopwatch' ? 0 : progress();
  const totalSecs = getTotal();

  const activePhaseColor =
    mode === 'pomodoro'
      ? POMODORO_PHASES.find(p => p.id === pomodoroPhase)?.color ?? Colors.primary
      : Colors.primary;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Timer</Text>
      </View>

      {/* Mode Tabs */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.modeTabs}>
        {MODE_TABS.map(tab => (
          <Pressable
            key={tab.id}
            style={[styles.modeTab, mode === tab.id && { backgroundColor: Colors.primary }]}
            onPress={() => switchMode(tab.id)}
          >
            <Text style={styles.modeTabIcon}>{tab.icon}</Text>
            <Text style={[styles.modeTabText, mode === tab.id && { color: '#000', fontWeight: Typography.semibold }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Pomodoro Phase Selector */}
      {mode === 'pomodoro' ? (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.phaseRow}>
          {POMODORO_PHASES.map(phase => (
            <Pressable
              key={phase.id}
              style={[
                styles.phaseBtn,
                pomodoroPhase === phase.id && { backgroundColor: phase.color + '25', borderColor: phase.color },
              ]}
              onPress={() => switchPomodoroPhase(phase.id)}
            >
              <Text style={[
                styles.phaseBtnText,
                pomodoroPhase === phase.id && { color: phase.color, fontWeight: Typography.semibold },
              ]}>
                {phase.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      ) : null}

      {/* Ring + Time Display */}
      <Animated.View entering={FadeInDown.delay(150)} style={styles.ringContainer}>
        <ProgressRing
          progress={mode === 'stopwatch' ? 0 : ringProgress}
          size={240}
          strokeWidth={10}
          color={activePhaseColor}
          bgColor={Colors.surfaceElevated}
        >
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            {mode !== 'stopwatch' && totalSecs > 0 ? (
              <Text style={styles.totalText}>/ {formatTime(totalSecs)}</Text>
            ) : null}
            {mode === 'pomodoro' ? (
              <Text style={[styles.phaseLabel, { color: activePhaseColor }]}>
                {POMODORO_PHASES.find(p => p.id === pomodoroPhase)?.label}
              </Text>
            ) : null}
          </View>
        </ProgressRing>
      </Animated.View>

      {/* Controls */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.controls}>
        <Pressable style={styles.resetBtn} onPress={reset} hitSlop={8}>
          <Text style={styles.resetBtnText}>↺</Text>
        </Pressable>

        <Animated.View style={btnStyle}>
          <Pressable
            style={[styles.playBtn, { backgroundColor: activePhaseColor }]}
            onPress={handlePlayPause}
          >
            <Text style={styles.playBtnText}>{running ? '⏸' : '▶'}</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.resetBtn} />
      </Animated.View>

      {/* Pomodoro Session Count */}
      {mode === 'pomodoro' ? (
        <Animated.View entering={FadeInDown.delay(250)} style={styles.pomodoroInfo}>
          <View style={styles.pomodoroInfoCard}>
            <Text style={styles.pomodoroInfoEmoji}>🍅</Text>
            <View>
              <Text style={styles.pomodoroInfoTitle}>25 min Focus Sessions</Text>
              <Text style={styles.pomodoroInfoSub}>5 min short · 15 min long break</Text>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {/* Stopwatch Laps placeholder */}
      {mode === 'stopwatch' ? (
        <Animated.View entering={FadeInDown.delay(250)} style={styles.stopwatchTip}>
          <Text style={styles.stopwatchTipText}>Tap ▶ to start · Running time displayed</Text>
        </Animated.View>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  modeTabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeTabIcon: {
    fontSize: 14,
  },
  modeTabText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  phaseRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  phaseBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  phaseBtnText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  ringContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  timeDisplay: {
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 48,
    fontWeight: Typography.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  totalText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  phaseLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  resetBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetBtnText: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  playBtnText: {
    fontSize: 28,
    color: '#000',
  },
  pomodoroInfo: {
    marginHorizontal: Spacing.md,
  },
  pomodoroInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pomodoroInfoEmoji: {
    fontSize: 32,
  },
  pomodoroInfoTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  pomodoroInfoSub: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  stopwatchTip: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  stopwatchTipText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
});
