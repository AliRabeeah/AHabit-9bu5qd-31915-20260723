export const HABIT_ICONS = [
  '💪', '🏃', '📚', '💧', '🧘', '🍎', '😴', '🎯',
  '✍️', '🎵', '🌿', '🧠', '💊', '🚴', '🏋️', '🌅',
  '🧹', '💻', '🎨', '🍵', '🙏', '❤️', '🌟', '⚡',
  '🔥', '🌙', '☀️', '🏊', '🎭', '📝', '🦷', '🥗',
];

export const HABIT_TYPES = [
  { id: 'yesno', label: 'Yes / No', icon: '✅', description: 'Simple done or not done' },
  { id: 'numeric', label: 'Numeric', icon: '🔢', description: 'Track a quantity (glasses, km, etc.)' },
  { id: 'timer', label: 'Timer', icon: '⏱️', description: 'Track time spent (minutes/hours)' },
  { id: 'checklist', label: 'Checklist', icon: '📋', description: 'Multiple subtasks to complete' },
] as const;

export type HabitType = 'yesno' | 'numeric' | 'timer' | 'checklist';
export type HabitStatus = 'pending' | 'done' | 'skipped' | 'missed';

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const STORAGE_KEYS = {
  HABITS: 'ahabit_habits',
  LOGS: 'ahabit_logs',
  NOTES: 'ahabit_notes',
  SETTINGS: 'ahabit_settings',
  ARCHIVE: 'ahabit_archive',
};

export const POMODORO_PRESETS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};
