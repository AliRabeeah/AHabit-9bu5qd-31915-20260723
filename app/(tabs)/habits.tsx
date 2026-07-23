import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useHabits } from '../../hooks/useHabits';
import { useAlert } from '@/template';
import { Habit } from '../../services/habitService';
import { DAYS_OF_WEEK } from '../../constants/config';

function HabitRow({ habit, onEdit, onArchive, onDelete }: {
  habit: Habit;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onEdit} android_ripple={{ color: 'rgba(255,255,255,0.04)' }}>
      <View style={[styles.rowAccent, { backgroundColor: habit.color }]} />
      <View style={[styles.rowIcon, { backgroundColor: habit.color + '20' }]}>
        <Text style={styles.rowIconText}>{habit.icon}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowName} numberOfLines={1}>{habit.name}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {habit.repeatDays.length === 7 ? 'Every day' :
            habit.repeatDays.map(d => DAYS_OF_WEEK[d]).join(', ')}
          {' · '}
          {habit.type === 'yesno' ? 'Yes/No' :
            habit.type === 'numeric' ? `${habit.goal} ${habit.unit}` :
              habit.type === 'timer' ? `${habit.goalMinutes} min` :
                `${habit.checklistItems?.length ?? 0} tasks`}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <Pressable style={styles.rowActionBtn} onPress={onArchive} hitSlop={8}>
          <MaterialIcons name="archive" size={18} color={Colors.textTertiary} />
        </Pressable>
        <Pressable style={styles.rowActionBtn} onPress={onDelete} hitSlop={8}>
          <MaterialIcons name="delete-outline" size={18} color={Colors.error + 'AA'} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, archiveHabit, deleteHabit } = useHabits();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState<'all' | 'yesno' | 'numeric' | 'timer' | 'checklist'>('all');

  const filtered = filter === 'all' ? habits : habits.filter(h => h.type === filter);

  const handleDelete = (habit: Habit) => {
    showAlert('Delete Habit', `Delete "${habit.name}"? This will also erase all logs.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id)
      },
    ]);
  };

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'yesno', label: 'Yes/No' },
    { id: 'numeric', label: 'Numeric' },
    { id: 'timer', label: 'Timer' },
    { id: 'checklist', label: 'Checklist' },
  ] as const;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.archiveBtn}
            onPress={() => router.push('/archive')}
            hitSlop={8}
          >
            <MaterialIcons name="archive" size={20} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/add-habit')}
          >
            <MaterialIcons name="add" size={22} color="#000" />
          </Pressable>
        </View>
      </View>

      {/* Stats row */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{habits.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{habits.filter(h => h.repeatDays.length === 7).length}</Text>
          <Text style={styles.statLabel}>Daily</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{habits.filter(h => h.type === 'timer').length}</Text>
          <Text style={styles.statLabel}>Timer</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{habits.filter(h => h.type === 'checklist').length}</Text>
          <Text style={styles.statLabel}>Checklist</Text>
        </View>
      </Animated.View>

      {/* Filter bar */}
      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={i => i.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
              onPress={() => setFilter(item.id as any)}
            >
              <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No habits yet</Text>
          <Text style={styles.emptySubtitle}>Tap + to create your first habit</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
              <HabitRow
                habit={item}
                onEdit={() => router.push({ pathname: '/edit-habit', params: { id: item.id } })}
                onArchive={() => archiveHabit(item.id)}
                onDelete={() => handleDelete(item)}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  archiveBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extrabold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  filterWrap: {
    height: 52,
    marginBottom: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  filterTextActive: {
    color: '#000',
    fontWeight: Typography.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    paddingVertical: Spacing.sm + 4,
    paddingRight: Spacing.sm,
  },
  rowAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: Spacing.sm,
    marginLeft: 2,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  rowIconText: {
    fontSize: 20,
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  rowMeta: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 4,
  },
  rowActionBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textTertiary,
  },
});
