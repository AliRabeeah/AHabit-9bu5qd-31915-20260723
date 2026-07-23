import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useSettings } from '../hooks/useSettings';
import { useAlert } from '@/template';
import { StorageService } from '../services/storageService';

const ACCENT_COLORS = [
  { color: '#7C5CFC', label: 'Purple' },
  { color: '#FC5C7D', label: 'Pink' },
  { color: '#43E97B', label: 'Green' },
  { color: '#38F9D7', label: 'Teal' },
  { color: '#FA8231', label: 'Orange' },
  { color: '#F7B731', label: 'Yellow' },
  { color: '#4FC3F7', label: 'Blue' },
  { color: '#CE93D8', label: 'Lavender' },
];

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeInDown} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </Animated.View>
  );
}

function SettingsRow({
  icon, label, value, onPress, rightElement, danger,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.rowIconWrap, danger && { backgroundColor: Colors.errorDim }]}>
        <MaterialIcons name={icon as any} size={18} color={danger ? Colors.error : Colors.textSecondary} />
      </View>
      <Text style={[styles.rowLabel, danger && { color: Colors.error }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {rightElement ? rightElement : null}
      {onPress && !rightElement ? (
        <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { showAlert } = useAlert();

  const handleExport = async () => {
    const data = await StorageService.exportAll();
    const json = JSON.stringify(data, null, 2);
    showAlert('Export Data', `Data ready to export (${Object.keys(data).length} keys). In production, this would save to a file.`);
  };

  const handleReset = () => {
    showAlert('Reset All Data', 'This will permanently delete all habits, logs, and notes. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset Everything', style: 'destructive',
        onPress: async () => {
          await resetSettings();
          showAlert('Done', 'All settings have been reset.');
        }
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Appearance */}
      <SettingsSection title="Appearance">
        <View style={styles.settingsRow}>
          <View style={styles.rowIconWrap}>
            <MaterialIcons name="palette" size={18} color={Colors.textSecondary} />
          </View>
          <Text style={styles.rowLabel}>Accent Color</Text>
        </View>
        <View style={styles.colorGrid}>
          {ACCENT_COLORS.map(({ color, label }) => (
            <Pressable
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                settings.accentColor === color && styles.colorOptionSelected,
              ]}
              onPress={() => updateSetting('accentColor', color)}
            >
              {settings.accentColor === color ? (
                <MaterialIcons name="check" size={16} color="#000" />
              ) : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.divider} />

        <SettingsRow
          icon="wb-sunny"
          label="Light Theme"
          rightElement={
            <Switch
              value={settings.theme === 'light'}
              onValueChange={v => updateSetting('theme', v ? 'light' : 'amoled')}
              trackColor={{ false: Colors.surfaceHighlight, true: settings.accentColor }}
              thumbColor="#fff"
            />
          }
        />
      </SettingsSection>

      {/* Display */}
      <SettingsSection title="Display">
        <SettingsRow
          icon="local-fire-department"
          label="Show Streak"
          rightElement={
            <Switch
              value={settings.showStreak}
              onValueChange={v => updateSetting('showStreak', v)}
              trackColor={{ false: Colors.surfaceHighlight, true: settings.accentColor }}
              thumbColor="#fff"
            />
          }
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="percent"
          label="Show Completion %"
          rightElement={
            <Switch
              value={settings.showCompletionPercent}
              onValueChange={v => updateSetting('showCompletionPercent', v)}
              trackColor={{ false: Colors.surfaceHighlight, true: settings.accentColor }}
              thumbColor="#fff"
            />
          }
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="date-range"
          label="Week starts on"
          value={settings.startOfWeek === 0 ? 'Sunday' : 'Monday'}
          onPress={() => updateSetting('startOfWeek', settings.startOfWeek === 0 ? 1 : 0)}
        />
      </SettingsSection>

      {/* Data */}
      <SettingsSection title="Data & Backup">
        <SettingsRow
          icon="file-download"
          label="Export Data (JSON)"
          onPress={handleExport}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="archive"
          label="View Archive"
          onPress={() => router.push('/archive')}
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <SettingsRow icon="info-outline" label="Version" value="1.0.0" />
        <View style={styles.divider} />
        <SettingsRow icon="star-outline" label="Rate AHabit" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="share" label="Share App" onPress={() => {}} />
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone">
        <SettingsRow
          icon="delete-forever"
          label="Reset All Settings"
          onPress={handleReset}
          danger
        />
      </SettingsSection>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>AHabit · Premium Habit Tracker</Text>
        <Text style={styles.footerSub}>Made with ❤️ for productivity</Text>
      </View>

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
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  rowIconWrap: {
    width: 32, height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  rowValue: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    marginRight: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 32 + Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: 4,
  },
  footerText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
  },
  footerSub: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
});
