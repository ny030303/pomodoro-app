import create from 'zustand';

export const useTimerStore = create((set) => ({
  timerMode: 'focus',
  pomodoroCount: 0,
  completedSessions: 8,
  setTimerMode: (mode) => set({ timerMode: mode }),
  incrementPomodoro: () => set((state) => ({ pomodoroCount: state.pomodoroCount + 1 })),
  incrementSessions: () => set((state) => ({ completedSessions: state.completedSessions + 1 })),
}));