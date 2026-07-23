import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { HabitService, Habit, HabitLog } from '../services/habitService';

interface HabitContextType {
  habits: Habit[];
  archivedHabits: Habit[];
  todayLogs: HabitLog[];
  loading: boolean;
  refreshHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'order'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  restoreHabit: (id: string) => Promise<void>;
  markDone: (habitId: string, extra?: Partial<HabitLog>) => Promise<void>;
  markSkipped: (habitId: string) => Promise<void>;
  markPending: (habitId: string) => Promise<void>;
  getTodayLog: (habitId: string) => HabitLog | undefined;
  getLogs: (habitId: string) => Promise<HabitLog[]>;
  todayStr: string;
}

export const HabitContext = createContext<HabitContextType | undefined>(undefined);

const getTodayString = () => new Date().toISOString().split('T')[0];

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = getTodayString();

  const refreshHabits = useCallback(async () => {
    setLoading(true);
    const [active, archived, logs] = await Promise.all([
      HabitService.getAll(),
      HabitService.getArchived(),
      HabitService.getLogsForDate(todayStr),
    ]);
    setHabits(active);
    setArchivedHabits(archived);
    setTodayLogs(logs);
    setLoading(false);
  }, [todayStr]);

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    await HabitService.create(habit);
    await refreshHabits();
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    await HabitService.update(id, updates);
    await refreshHabits();
  };

  const deleteHabit = async (id: string) => {
    await HabitService.delete(id);
    await refreshHabits();
  };

  const archiveHabit = async (id: string) => {
    await HabitService.archive(id);
    await refreshHabits();
  };

  const restoreHabit = async (id: string) => {
    await HabitService.restore(id);
    await refreshHabits();
  };

  const markDone = async (habitId: string, extra?: Partial<HabitLog>) => {
    await HabitService.setLog({ habitId, date: todayStr, status: 'done', ...extra });
    const logs = await HabitService.getLogsForDate(todayStr);
    setTodayLogs(logs);
  };

  const markSkipped = async (habitId: string) => {
    await HabitService.setLog({ habitId, date: todayStr, status: 'skipped' });
    const logs = await HabitService.getLogsForDate(todayStr);
    setTodayLogs(logs);
  };

  const markPending = async (habitId: string) => {
    await HabitService.setLog({ habitId, date: todayStr, status: 'pending' });
    const logs = await HabitService.getLogsForDate(todayStr);
    setTodayLogs(logs);
  };

  const getTodayLog = (habitId: string) => todayLogs.find(l => l.habitId === habitId);

  const getLogs = async (habitId: string) => HabitService.getLogs(habitId);

  return (
    <HabitContext.Provider value={{
      habits,
      archivedHabits,
      todayLogs,
      loading,
      refreshHabits,
      addHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      restoreHabit,
      markDone,
      markSkipped,
      markPending,
      getTodayLog,
      getLogs,
      todayStr,
    }}>
      {children}
    </HabitContext.Provider>
  );
}
