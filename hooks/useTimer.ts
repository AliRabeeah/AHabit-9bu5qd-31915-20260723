import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'countdown' | 'stopwatch' | 'pomodoro';
export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

const POMODORO_DURATIONS: Record<PomodoroPhase, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function useTimer() {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(25 * 60);
  const [countdownTotal, setCountdownTotal] = useState(25 * 60);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [pomodoroTime, setPomodoroTime] = useState(POMODORO_DURATIONS.work);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setElapsed(e => e + 1);
        } else if (mode === 'countdown') {
          setCountdown(c => {
            if (c <= 1) { setRunning(false); clearTimer(); return 0; }
            return c - 1;
          });
        } else if (mode === 'pomodoro') {
          setPomodoroTime(t => {
            if (t <= 1) {
              setRunning(false);
              clearTimer();
              return 0;
            }
            return t - 1;
          });
        }
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [running, mode]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    if (mode === 'stopwatch') setElapsed(0);
    else if (mode === 'countdown') setCountdown(countdownTotal);
    else if (mode === 'pomodoro') setPomodoroTime(POMODORO_DURATIONS[pomodoroPhase]);
  }, [mode, countdownTotal, pomodoroPhase]);

  const switchMode = useCallback((m: TimerMode) => {
    setRunning(false);
    setMode(m);
    setElapsed(0);
    if (m === 'countdown') setCountdown(countdownTotal);
    if (m === 'pomodoro') setPomodoroTime(POMODORO_DURATIONS[pomodoroPhase]);
  }, [countdownTotal, pomodoroPhase]);

  const switchPomodoroPhase = useCallback((phase: PomodoroPhase) => {
    setRunning(false);
    setPomodoroPhase(phase);
    setPomodoroTime(POMODORO_DURATIONS[phase]);
  }, []);

  const setCustomCountdown = useCallback((seconds: number) => {
    setCountdownTotal(seconds);
    setCountdown(seconds);
  }, []);

  const getCurrentTime = useCallback(() => {
    if (mode === 'stopwatch') return elapsed;
    if (mode === 'countdown') return countdown;
    return pomodoroTime;
  }, [mode, elapsed, countdown, pomodoroTime]);

  const getTotal = useCallback(() => {
    if (mode === 'stopwatch') return 0;
    if (mode === 'countdown') return countdownTotal;
    return POMODORO_DURATIONS[pomodoroPhase];
  }, [mode, countdownTotal, pomodoroPhase]);

  const formatTime = useCallback((secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const progress = useCallback(() => {
    if (mode === 'stopwatch') return 0;
    const total = getTotal();
    if (total === 0) return 1;
    const current = getCurrentTime();
    return 1 - current / total;
  }, [mode, getTotal, getCurrentTime]);

  return {
    mode,
    running,
    elapsed,
    countdown,
    countdownTotal,
    pomodoroPhase,
    pomodoroCount,
    pomodoroTime,
    start,
    pause,
    reset,
    switchMode,
    switchPomodoroPhase,
    setCustomCountdown,
    getCurrentTime,
    getTotal,
    formatTime,
    progress,
  };
}
