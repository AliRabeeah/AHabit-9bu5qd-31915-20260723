import { StorageService } from './storageService';
import { STORAGE_KEYS, HabitType, HabitStatus } from '../constants/config';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: HabitType;
  goal?: number;
  unit?: string;
  goalMinutes?: number;
  checklistItems?: ChecklistItem[];
  repeatDays: number[]; // 0=Sun, 6=Sat
  reminderTime?: string; // "HH:MM"
  note?: string;
  createdAt: string;
  archived: boolean;
  order: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitStatus;
  value?: number; // for numeric
  elapsed?: number; // for timer (seconds)
  completedItems?: string[]; // for checklist (item ids)
  note?: string;
  createdAt: string;
}

const DEFAULT_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Morning Workout',
    icon: '💪',
    color: '#7C5CFC',
    type: 'timer',
    goalMinutes: 30,
    repeatDays: [1, 2, 3, 4, 5],
    createdAt: new Date().toISOString(),
    archived: false,
    order: 0,
  },
  {
    id: '2',
    name: 'Drink Water',
    icon: '💧',
    color: '#4FC3F7',
    type: 'numeric',
    goal: 8,
    unit: 'glasses',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    createdAt: new Date().toISOString(),
    archived: false,
    order: 1,
  },
  {
    id: '3',
    name: 'Read 20 Pages',
    icon: '📚',
    color: '#43E97B',
    type: 'yesno',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    createdAt: new Date().toISOString(),
    archived: false,
    order: 2,
  },
  {
    id: '4',
    name: 'Evening Routine',
    icon: '🌙',
    color: '#FC5C7D',
    type: 'checklist',
    checklistItems: [
      { id: 'c1', text: 'Journal writing', done: false },
      { id: 'c2', text: 'Brush teeth', done: false },
      { id: 'c3', text: 'No screens 1hr', done: false },
    ],
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    createdAt: new Date().toISOString(),
    archived: false,
    order: 3,
  },
];

export const HabitService = {
  async getAll(): Promise<Habit[]> {
    const habits = await StorageService.get<Habit[]>(STORAGE_KEYS.HABITS);
    if (!habits) {
      await StorageService.set(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    return habits.filter(h => !h.archived).sort((a, b) => a.order - b.order);
  },

  async getArchived(): Promise<Habit[]> {
    const habits = await StorageService.get<Habit[]>(STORAGE_KEYS.HABITS);
    if (!habits) return [];
    return habits.filter(h => h.archived);
  },

  async getById(id: string): Promise<Habit | null> {
    const habits = await StorageService.get<Habit[]>(STORAGE_KEYS.HABITS);
    return habits?.find(h => h.id === id) ?? null;
  },

  async create(habit: Omit<Habit, 'id' | 'createdAt' | 'order'>): Promise<Habit> {
    const habits = await StorageService.get<Habit[]>(STORAGE_KEYS.HABITS) ?? [];
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      order: habits.length,
    };
    await StorageService.set(STORAGE_KEYS.HABITS, [...habits, newHabit]);
    return newHabit;
  },

  async update(id: string, updates: Partial<Habit>): Promise<void> {
    const habits = await StorageService.get<Habit[]>(STORAGE_KEYS.HABITS) ?? [];
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h);
    await StorageService.set(STORAGE_KEYS.HABITS, updated);
  },

  async delete(id: string): Promise<void> {
    const habits = await StorageService.get<Habit[]>(STORAGE_KEYS.HABITS) ?? [];
    await StorageService.set(STORAGE_KEYS.HABITS, habits.filter(h => h.id !== id));
    const logs = await StorageService.get<HabitLog[]>(STORAGE_KEYS.LOGS) ?? [];
    await StorageService.set(STORAGE_KEYS.LOGS, logs.filter(l => l.habitId !== id));
  },

  async archive(id: string): Promise<void> {
    await HabitService.update(id, { archived: true });
  },

  async restore(id: string): Promise<void> {
    await HabitService.update(id, { archived: false });
  },

  // Logs
  async getLogs(habitId?: string): Promise<HabitLog[]> {
    const logs = await StorageService.get<HabitLog[]>(STORAGE_KEYS.LOGS) ?? [];
    if (habitId) return logs.filter(l => l.habitId === habitId);
    return logs;
  },

  async getLogForDate(habitId: string, date: string): Promise<HabitLog | null> {
    const logs = await StorageService.get<HabitLog[]>(STORAGE_KEYS.LOGS) ?? [];
    return logs.find(l => l.habitId === habitId && l.date === date) ?? null;
  },

  async getLogsForDate(date: string): Promise<HabitLog[]> {
    const logs = await StorageService.get<HabitLog[]>(STORAGE_KEYS.LOGS) ?? [];
    return logs.filter(l => l.date === date);
  },

  async setLog(log: Omit<HabitLog, 'id' | 'createdAt'>): Promise<HabitLog> {
    const logs = await StorageService.get<HabitLog[]>(STORAGE_KEYS.LOGS) ?? [];
    const existing = logs.findIndex(l => l.habitId === log.habitId && l.date === log.date);
    const newLog: HabitLog = { ...log, id: Date.now().toString(), createdAt: new Date().toISOString() };
    if (existing >= 0) {
      logs[existing] = newLog;
    } else {
      logs.push(newLog);
    }
    await StorageService.set(STORAGE_KEYS.LOGS, logs);
    return newLog;
  },

  async getStreak(habitId: string): Promise<{ current: number; longest: number }> {
    const logs = await HabitService.getLogs(habitId);
    const habit = await HabitService.getById(habitId);
    if (!habit) return { current: 0, longest: 0 };

    const doneLogs = new Set(logs.filter(l => l.status === 'done').map(l => l.date));
    const skippedLogs = new Set(logs.filter(l => l.status === 'skipped').map(l => l.date));

    let current = 0;
    let longest = 0;
    let streak = 0;

    const today = new Date();
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      if (habit.repeatDays.includes(dayOfWeek)) {
        if (doneLogs.has(dateStr) || skippedLogs.has(dateStr)) {
          streak++;
          if (streak > longest) longest = streak;
          if (i === 0 || current === i) current = streak;
        } else {
          if (i === 0) {
            // today not done yet, look back
          } else {
            streak = 0;
          }
        }
      }
      d.setDate(d.getDate() - 1);
    }

    return { current, longest };
  },

  async getStats(habitId: string): Promise<{
    totalDone: number;
    totalSkipped: number;
    completionRate: number;
    streak: { current: number; longest: number };
  }> {
    const logs = await HabitService.getLogs(habitId);
    const totalDone = logs.filter(l => l.status === 'done').length;
    const totalSkipped = logs.filter(l => l.status === 'skipped').length;
    const totalTracked = logs.length;
    const completionRate = totalTracked > 0 ? Math.round((totalDone / totalTracked) * 100) : 0;
    const streak = await HabitService.getStreak(habitId);
    return { totalDone, totalSkipped, completionRate, streak };
  },
};
