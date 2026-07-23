import React from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useHabits } from '../hooks/useHabits';
import { useAlert } from '@/template';
import { Habit } from '../services/habitService';
import { DAYS_OF_WEEK } from '../constants/config';

export default function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { archivedHabits, restoreHabit, deleteHabit } = useHabits();
  const { showAlert } = useAlert();

  const handleRestore = (habit: Habit) => {
    showAlert('Restore Habit', `Restore "${habit.name}" to your active habits?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: () => restoreHabit(habit.id) },
    ]);
  };

  const handleDelete = (habit: Habit) => {
    showAlert('Delete Permanently', `Permanently delete "${habit.name}" and all its data?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      {archivedHabits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🗄️</Text>
          <Text style={styles.emptyTitle}>Archive is empty</Text>
          <Text style={styles.emptySubtitle}>Archived habits will appear here</Text>
        </View>
      ) : (
        <>
          <Text style={styles.countText}>{archivedHabits.length} archived habit{archivedHabits.length !== 1 ? 's' : ''}</Text>
          <FlatList
            data={archivedHabits}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 50)}>
                <View style={styles.row}>
                  <View style={[styles.rowAccent, { backgroundColor: item.color }]} />
                  <View style={[styles.rowIcon, { backgroundColor: item.color + '20' }]}>
                    <Text style={styles.rowIconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.rowMeta}>
                      {item.repeatDays.length === 7 ? 'Every day' :
                        item.repeatDays.map(d => DAYS_OF_WEEK[d]).join(', ')}
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable
                      style={styles.restoreBtn}
                      onPress={() => handleRestore(item)}
                    >
                      <MaterialIcons name="restore" size={16} color={Colors.success} />
                      <Text style={styles.restoreBtnText}>Restore</Text>
                    </Pressable>
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item)}
                      hitSlop={8}
                    >
                      <MaterialIcons name="delete-forever" size={18} color={Colors.error + 'AA'} />
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  countText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
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
    opacity: 0.8,
  },
  rowAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: Spacing.sm,
    marginLeft: 2,
  },
  rowIcon: {
    width: 42, height: 42,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  rowIconText: { fontSize: 20 },
  rowContent: { flex: 1, gap: 3 },
  rowName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  rowMeta: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.successDim,
  },
  restoreBtnText: {
    fontSize: Typography.xs,
    color: Colors.success,
    fontWeight: Typography.medium,
  },
  deleteBtn: {
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textTertiary,
  },
  listContent: { paddingBottom: 30 },
});
