export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type SoundEffectType = 'crystal' | 'bowl' | 'digital' | 'marimba' | 'softChime';
export type AmbientSoundType = 'white' | 'brown' | 'binaural' | 'rain';
export type NavTab = 'timer' | 'tasks' | 'analytics' | 'poki' | 'settings';

export type PokiSpecies = 'plant' | 'bird' | 'butterfly';
export type PokiMood = 'happy' | 'focused' | 'sleepy' | 'ecstatic' | 'chill';
export type PokiEvolutionStage = 1 | 2 | 3 | 4 | 5;

export interface PokiItem {
  id: string;
  name: string;
  type: 'hat' | 'glasses' | 'badge' | 'aura';
  description: string;
  costTreats: number;
  unlocked: boolean;
}

export interface PokiState {
  name: string;
  species: PokiSpecies;
  xp: number;
  level: number;
  evolution: PokiEvolutionStage;
  treats: number; // Earned by completing pomodoros & tasks
  totalFocusSessionsPokiWitnessed: number;
  happiness: number; // 0 - 100
  equippedHat: string | null;
  equippedGlasses: string | null;
  equippedAura: string | null;
  unlockedItems: string[];
  lastFedTimestamp: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  subject: string;
  subjectColor: string;
  priority: PriorityLevel;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string; // ISO string
  completedAt: string | null;
  subtasks: Subtask[];
}

export interface SessionLog {
  id: string;
  type: TimerMode;
  durationMinutes: number;
  completedAt: string; // ISO string
  timestamp: number; // Unix timestamp ms
  taskId?: string | null;
  taskTitle?: string | null;
  subject?: string | null;
  subjectColor?: string | null;
  hourOfDay: number; // 0 - 23
  dayOfWeek: number; // 0 - 6 (Sun - Sat)
  dateString: string; // YYYY-MM-DD
}

export interface UserProfile {
  username: string;
  dailyGoalPomodoros: number;
  dailyGoalMinutes: number;
  dailyGoalHours: number;
  primarySubject: string;
  focusRhythm: string;
  bio: string;
  joinedAt: string;
  hasCompletedOnboarding: boolean;
}

export interface AppSettings {
  focusTime: number; // minutes
  shortBreakTime: number; // minutes
  longBreakTime: number; // minutes
  longBreakInterval: number; // sessions before long break
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundAlertEnabled: boolean;
  soundVolume: number; // 0.0 - 1.0
  soundAlertTone: SoundEffectType;
  tickingSoundEnabled: boolean;
  tickingVolume: number;
  desktopNotifications: boolean;
  showMilliseconds: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  historyDates: string[]; // List of unique YYYY-MM-DD with at least 1 completed focus session
}

export interface DetailedAnalytics {
  totalFocusMinutes: number;
  totalSessions: number;
  todayFocusMinutes: number;
  todaySessions: number;
  weekFocusMinutes: number;
  monthFocusMinutes: number;
  averageSessionDuration: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  tasksPending: number;
  taskCompletionRate: number;
  subjectDistribution: {
    subject: string;
    color: string;
    minutes: number;
    sessions: number;
    percentage: number;
  }[];
  hourlyProductivity: {
    hour: number;
    minutes: number;
    count: number;
  }[];
  dailyTrends: {
    date: string;
    dayLabel: string;
    minutes: number;
    sessions: number;
  }[];
  peakProductiveHour: string;
}
