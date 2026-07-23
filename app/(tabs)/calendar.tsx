import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useHabits } from '../../hooks/useHabits';
import { HabitService, HabitLog } from '../../services/habitService';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

type CellStatus = 'done' | 'skipped' | 'missed' | 'future' | 'empty';

function getDotColor(status: CellStatus): string {
  switch (status) {
    case 'done': return Colors.calendarDone;
    case 'skipped': return Colors.calendarSkipped;
    case 'missed': return Colors.calendarMissed;
    default: return Colors.calendarEmpty;
  }
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { habits } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedHabit = habits.find(h => h.id === selectedHabitId) ?? habits[0];

  useEffect(() => {
    if (selectedHabit) {
      HabitService.getLogs(selectedHabit.id).then(setLogs);
      setSelectedHabitId(selectedHabit.id);
    }
  }, [selectedHabit?.id]);

  const getStatus = useCallback((day: number): CellStatus => {
    const ds = dateStr(year, month, day);
    const todayDs = today.toISOString().split('T')[0];
    const log = logs.find(l => l.date === ds);
    const dayDate = new Date(year, month, day);
    const dayOfWeek = dayDate.getDay();

    if (ds > todayDs) return 'future';
    if (!selectedHabit?.repeatDays.includes(dayOfWeek)) return 'empty';
    if (!log || log.status === 'pending') return ds < todayDs ? 'missed' : 'empty';
    if (log.status === 'done') return 'done';
    if (log.status === 'skipped') return 'skipped';
    return 'missed';
  }, [logs, year, month, selectedHabit, today]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const doneDays = Array.from({ length: daysInMonth }, (_, i) => getStatus(i + 1)).filter(s => s === 'done').length;
  const missedDays = Array.from({ length: daysInMonth }, (_, i) => getStatus(i + 1)).filter(s => s === 'missed').length;
  const skippedDays = Array.from({ length: daysInMonth }, (_, i) => getStatus(i + 1)).filter(s => s === 'skipped').length;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      {/* Habit Selector */}
      <View style={styles.habitSelectorWrap}>
        <FlatList
          horizontal
          data={habits}
          keyExtractor={h => h.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.habitSelectorContent}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.habitChip,
                selectedHabit?.id === item.id && { backgroundColor: item.color, borderColor: item.color },
              ]}
              onPress={() => {
                setSelectedHabitId(item.id);
                HabitService.getLogs(item.id).then(setLogs);
              }}
            >
              <Text style={styles.habitChipIcon}>{item.icon}</Text>
              <Text style={[
                styles.habitChipText,
                selectedHabit?.id === item.id && { color: '#000', fontWeight: Typography.semibold },
              ]}>
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Month Navigator */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.monthNav}>
        <Pressable onPress={prevMonth} hitSlop={12} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        <Pressable onPress={nextMonth} hitSlop={12} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </Pressable>
      </Animated.View>

      {/* Day Headers */}
      <View style={styles.dayHeaders}>
        {DAYS_SHORT.map(d => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={`empty-${i}`} style={styles.cell} />;
          const status = getStatus(day);
          const ds = dateStr(year, month, day);
          const isToday = ds === today.toISOString().split('T')[0];
          const isSelected = ds === selectedDate;

          return (
            <Pressable
              key={ds}
              style={[
                styles.cell,
                status !== 'future' && status !== 'empty' && { backgroundColor: getDotColor(status) + '25' },
                isToday && styles.cellToday,
                isSelected && styles.cellSelected,
              ]}
              onPress={() => setSelectedDate(ds === selectedDate ? null : ds)}
            >
              <Text style={[
                styles.cellText,
                isToday && styles.cellTextToday,
                status === 'done' && styles.cellTextDone,
              ]}>
                {day}
              </Text>
              {status !== 'future' && status !== 'empty' ? (
                <View style={[styles.cellDot, { backgroundColor: getDotColor(status) }]} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.legend}>
        {[
          { color: Colors.calendarDone, label: 'Done' },
          { color: Colors.calendarSkipped, label: 'Skipped' },
          { color: Colors.calendarMissed, label: 'Missed' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Month Summary */}
      <Animated.View entering={FadeInDown.delay(250)} style={styles.monthSummary}>
        <Text style={styles.summaryTitle}>This Month</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.calendarDone }]}>{doneDays}</Text>
            <Text style={styles.summaryLabel}>Done</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.calendarSkipped }]}>{skippedDays}</Text>
            <Text style={styles.summaryLabel}>Skipped</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.error }]}>{missedDays}</Text>
            <Text style={styles.summaryLabel}>Missed</Text>
          </View>
        </View>
      </Animated.View>

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
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  habitSelectorWrap: {
    height: 52,
    marginBottom: Spacing.md,
  },
  habitSelectorContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  habitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  habitChipIcon: { fontSize: 15 },
  habitChipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: 28,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  monthTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  cell: {
    width: `${100 / 7 - 1}%`,
    aspectRatio: 1,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  cellSelected: {
    backgroundColor: Colors.primaryDim,
  },
  cellText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  cellTextToday: {
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
  cellTextDone: {
    color: Colors.textPrimary,
  },
  cellDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  monthSummary: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryNum: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extrabold,
  },
  summaryLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
});
