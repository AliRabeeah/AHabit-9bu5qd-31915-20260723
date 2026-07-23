import { useContext } from 'react';
import { HabitContext } from '../contexts/HabitContext';

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within HabitProvider');
  return context;
}
