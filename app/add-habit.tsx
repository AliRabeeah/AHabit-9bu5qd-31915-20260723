import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useHabits } from '../hooks/useHabits';
import { HABIT_ICONS, HABIT_TYPES, HabitType, DAYS_OF_WEEK } from '../constants/config';

const ACCENT_COLORS = [
  '#7C5CFC', '#FC5C7D', '#43E97B', '#38F9D7',
  '#FA8231', '#F7B731', '#4FC3F7', '#CE93D8',
];

export default function AddHabitScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addHabit } = useHabits();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState(Colors.primary);
  const [type, setType] = useState<HabitType>('yesno');
  const [goal, setGoal] = useState('1');
  const [unit, setUnit] = useState('times');
  const [goalMinutes, setGoalMinutes] = useState('30');
  const [repeatDays, setRepeatDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const toggleDay = (day: number) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    if (!name.trim()) { setNameError('Please enter a habit name'); return; }
    if (repeatDays.length === 0) return;
    setSaving(true);
    await addHabit({
      name: name.trim(),
      icon,
      color,
      type,
      goal: type === 'numeric' ? parseInt(goal) || 1 : undefined,
      unit: type === 'numeric' ? unit : undefined,
      goalMinutes: type === 'timer' ? parseInt(goalMinutes) || 30 : undefined,
      checklistItems: type === 'checklist' ? [
        { id: '1', text: 'Task 1', done: false },
        { id: '2', text: 'Task 2', done: false },
      ] : undefined,
      repeatDays,
      archived: false,
    });
    setSaving(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Habit</Text>
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

        {/* Preview Card */}
        <Animated.View entering={FadeInDown.delay(50)} style={[styles.preview, { borderColor: color + '60' }]}>
          <View style={[styles.previewIcon, { backgroundColor: color + '20' }]}>
            <Text style={styles.previewIconText}>{icon}</Text>
          </View>
          <View style={styles.previewInfo}>
            <Text style={[styles.previewName, { color: name ? Colors.textPrimary : Colors.textTertiary }]}>
              {name || 'Habit name...'}
            </Text>
            <Text style={styles.previewMeta}>
              {HABIT_TYPES.find(t => t.id === type)?.label} ·{' '}
              {repeatDays.length === 7 ? 'Every day' : `${repeatDays.length} days/week`}
            </Text>
          </View>
          <View style={[styles.previewDot, { backgroundColor: color }]} />
        </Animated.View>

        {/* Name */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionLabel}>Habit Name *</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="e.g. Morning Run"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={t => { setName(t); setNameError(''); }}
            maxLength={50}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </Animated.View>

        {/* Icon Picker */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
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
        </Animated.View>

        {/* Color Picker */}
        <Animated.View entering={FadeInDown.delay(180)} style={styles.section}>
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
        </Animated.View>

        {/* Habit Type */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionLabel}>Tracking Type</Text>
          <View style={styles.typeGrid}>
            {HABIT_TYPES.map(t => (
              <Pressable
                key={t.id}
                style={[styles.typeCard, type === t.id && { borderColor: color, backgroundColor: color + '15' }]}
                onPress={() => setType(t.id)}
              >
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text style={[styles.typeLabel, type === t.id && { color: color }]}>{t.label}</Text>
                <Text style={styles.typeDesc} numberOfLines={2}>{t.description}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Type-specific fields */}
        {type === 'numeric' ? (
          <Animated.View entering={FadeInDown} style={styles.section}>
            <Text style={styles.sectionLabel}>Goal</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="8"
                placeholderTextColor={Colors.textTertiary}
                value={goal}
                onChangeText={setGoal}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 2, marginLeft: Spacing.sm }]}
                placeholder="glasses"
                placeholderTextColor={Colors.textTertiary}
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </Animated.View>
        ) : null}

        {type === 'timer' ? (
          <Animated.View entering={FadeInDown} style={styles.section}>
            <Text style={styles.sectionLabel}>Goal Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              placeholderTextColor={Colors.textTertiary}
              value={goalMinutes}
              onChangeText={setGoalMinutes}
              keyboardType="numeric"
            />
          </Animated.View>
        ) : null}

        {/* Repeat Days */}
        <Animated.View entering={FadeInDown.delay(230)} style={styles.section}>
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
          <View style={styles.quickDays}>
            <Pressable onPress={() => setRepeatDays([0, 1, 2, 3, 4, 5, 6])} style={styles.quickDayBtn}>
              <Text style={styles.quickDayText}>Every day</Text>
            </Pressable>
            <Pressable onPress={() => setRepeatDays([1, 2, 3, 4, 5])} style={styles.quickDayBtn}>
              <Text style={styles.quickDayText}>Weekdays</Text>
            </Pressable>
            <Pressable onPress={() => setRepeatDays([0, 6])} style={styles.quickDayBtn}>
              <Text style={styles.quickDayText}>Weekends</Text>
            </Pressable>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  saveBtnDisabled: {
    backgroundColor: Colors.surface,
  },
  saveBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: '#000',
  },
  saveBtnTextDisabled: {
    color: Colors.textTertiary,
  },
  content: {
    padding: Spacing.md,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIconText: { fontSize: 24 },
  previewInfo: { flex: 1 },
  previewName: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  previewMeta: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  previewDot: {
    width: 10, height: 10,
    borderRadius: 5,
  },
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.sm,
    color: Colors.error,
    marginTop: 4,
  },
  row: { flexDirection: 'row' },
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  typeIcon: { fontSize: 22 },
  typeLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  typeDesc: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dayBtn: {
    flex: 1,
    height: 40,
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
  dayBtnTextActive: {
    color: '#000',
  },
  quickDays: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickDayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radius.full,
  },
  quickDayText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
});
