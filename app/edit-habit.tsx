import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useHabits } from '../hooks/useHabits';
import { useAlert } from '@/template';
import { HABIT_ICONS, HABIT_TYPES, HabitType, DAYS_OF_WEEK } from '../constants/config';
import { HabitService } from '../services/habitService';

const ACCENT_COLORS = [
  '#7C5CFC', '#FC5C7D', '#43E97B', '#38F9D7',
  '#FA8231', '#F7B731', '#4FC3F7', '#CE93D8',
];

export default function EditHabitScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateHabit, deleteHabit } = useHabits();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState(Colors.primary);
  const [type, setType] = useState<HabitType>('yesno');
  const [goal, setGoal] = useState('1');
  const [unit, setUnit] = useState('times');
  const [goalMinutes, setGoalMinutes] = useState('30');
  const [repeatDays, setRepeatDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      HabitService.getById(id).then(habit => {
        if (habit) {
          setName(habit.name);
          setIcon(habit.icon);
          setColor(habit.color);
          setType(habit.type);
          setGoal(String(habit.goal ?? 1));
          setUnit(habit.unit ?? 'times');
          setGoalMinutes(String(habit.goalMinutes ?? 30));
          setRepeatDays(habit.repeatDays);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const toggleDay = (day: number) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !id) return;
    setSaving(true);
    await updateHabit(id, {
      name: name.trim(),
      icon,
      color,
      type,
      goal: type === 'numeric' ? parseInt(goal) || 1 : undefined,
      unit: type === 'numeric' ? unit : undefined,
      goalMinutes: type === 'timer' ? parseInt(goalMinutes) || 30 : undefined,
      repeatDays,
    });
    setSaving(false);
    router.back();
  };

  const handleDelete = () => {
    showAlert('Delete Habit', 'This will permanently delete this habit and all its logs.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (id) {
            await deleteHabit(id);
            router.back();
          }
        }
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Habit</Text>
        <Pressable
          style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveBtnText, !name.trim() && styles.saveBtnTextDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Habit Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Habit name"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Icon</Text>
          <View style={styles.iconGrid}>
            {HABIT_ICONS.map(ic => (
              <Pressable
                key={ic}
                style={[styles.iconOption, icon === ic && { backgroundColor: color + '30', borderColor: color }]}
                onPress={() => setIcon(ic)}
              >
                <Text style={styles.iconOptionText}>{ic}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Accent Color</Text>
          <View style={styles.colorRow}>
            {ACCENT_COLORS.map(c => (
              <Pressable
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tracking Type</Text>
          <View style={styles.typeRow}>
            {HABIT_TYPES.map(t => (
              <Pressable
                key={t.id}
                style={[styles.typeChip, type === t.id && { backgroundColor: color, borderColor: color }]}
                onPress={() => setType(t.id)}
              >
                <Text style={styles.typeChipText}>{t.icon} {t.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {type === 'numeric' ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Goal</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="8"
                placeholderTextColor={Colors.textTertiary}
                value={goal}
                onChangeText={setGoal}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="glasses"
                placeholderTextColor={Colors.textTertiary}
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>
        ) : null}

        {type === 'timer' ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Goal Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              placeholderTextColor={Colors.textTertiary}
              value={goalMinutes}
              onChangeText={setGoalMinutes}
              keyboardType="numeric"
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Repeat</Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day, i) => (
              <Pressable
                key={day}
                style={[styles.dayBtn, repeatDays.includes(i) && { backgroundColor: color, borderColor: color }]}
                onPress={() => toggleDay(i)}
              >
                <Text style={[styles.dayBtnText, repeatDays.includes(i) && styles.dayBtnTextActive]}>
                  {day[0]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <MaterialIcons name="delete-forever" size={18} color={Colors.error} />
            <Text style={styles.deleteBtnText}>Delete Habit</Text>
          </Pressable>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.xl,
  },
  saveBtnDisabled: { backgroundColor: Colors.surface },
  saveBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: '#000',
  },
  saveBtnTextDisabled: { color: Colors.textTertiary },
  content: { padding: Spacing.md },
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconOption: {
    width: 44, height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconOptionText: { fontSize: 22 },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 36, height: 36,
    borderRadius: 18,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
  },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dayBtn: {
    flex: 1, height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
  },
  dayBtnTextActive: { color: '#000' },
  dangerZone: {
    borderWidth: 1,
    borderColor: Colors.error + '40',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  dangerTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.error,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  deleteBtnText: {
    fontSize: Typography.base,
    color: Colors.error,
    fontWeight: Typography.medium,
  },
});
