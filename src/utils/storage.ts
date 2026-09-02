import { AppSettings, Task, SessionLog, UserProfile, StreakData, DetailedAnalytics, PokiState, PokiEvolutionStage } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'pomostudy_settings_v2',
  TASKS: 'pomostudy_tasks_v2',
  HISTORY: 'pomostudy_history_v2',
  PROFILE: 'pomostudy_profile_v2',
  STREAK: 'pomostudy_streak_v2',
  ACTIVE_TASK_ID: 'pomostudy_active_task_v2',
  POKI: 'pomostudy_poki_v2',
  TOUR_SEEN: 'pomostudy_tour_seen_v1',
};

export const DEFAULT_POKI: PokiState = {
  name: 'Poki',
  species: 'plant',
  xp: 0,
  level: 1,
  evolution: 1,
  treats: 3,
  totalFocusSessionsPokiWitnessed: 0,
  happiness: 85,
  equippedHat: 'hat_sprout',
  equippedGlasses: null,
  equippedAura: null,
  unlockedItems: ['hat_sprout'],
  lastFedTimestamp: Date.now(),
};

export const DEFAULT_SETTINGS: AppSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundAlertEnabled: true,
  soundVolume: 0.8,
  soundAlertTone: 'crystal',
  tickingSoundEnabled: false,
  tickingVolume: 0.15,
  desktopNotifications: false,
  showMilliseconds: false,
};

export const DEFAULT_PROFILE: UserProfile = {
  username: '',
  dailyGoalHours: 3,
  dailyGoalPomodoros: 6,
  dailyGoalMinutes: 180,
  primarySubject: 'General Studies',
  focusRhythm: 'classic',
  bio: 'Deep Work & Continuous Growth',
  joinedAt: new Date().toISOString(),
  hasCompletedOnboarding: false,
};

export const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  historyDates: [],
};

// ==========================================
// IndexedDB Engine for Robust Local Analytics
// ==========================================
const DB_NAME = 'PomoStudyDB_v2';
const DB_VERSION = 1;
const STORE_LOGS = 'session_logs';
const STORE_TASKS = 'tasks';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        const store = db.createObjectStore(STORE_LOGS, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('dateString', 'dateString', { unique: false });
        store.createIndex('subject', 'subject', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_TASKS)) {
        db.createObjectStore(STORE_TASKS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageService = {
  // --- Profile ---
  getProfile(): UserProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  // --- Settings ---
  getSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  // --- Tasks (NO MOCK DATA: starts empty `[]`) ---
  getTasks(): Task[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      // Async sync to IndexedDB
      openDatabase().then((db) => {
        const tx = db.transaction(STORE_TASKS, 'readwrite');
        const store = tx.objectStore(STORE_TASKS);
        store.clear();
        tasks.forEach((t) => store.put(t));
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  },

  // --- Active Task ID ---
  getActiveTaskId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_TASK_ID);
    } catch {
      return null;
    }
  },

  saveActiveTaskId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TASK_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK_ID);
      }
    } catch {
      // fallback
    }
  },

  // --- Session History / Logs (NO MOCK DATA) ---
  getHistory(): SessionLog[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  },

  addSessionLog(log: SessionLog): void {
    try {
      const current = this.getHistory();
      const updated = [log, ...current];
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));

      // Update Streak
      this.updateStreakForSession(log);

      // Async save to IndexedDB
      openDatabase().then((db) => {
        const tx = db.transaction(STORE_LOGS, 'readwrite');
        tx.objectStore(STORE_LOGS).put(log);
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to add session log', e);
    }
  },

  deleteSessionLog(logId: string): void {
    try {
      const current = this.getHistory().filter((l) => l.id !== logId);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to delete session log', e);
    }
  },

  // --- Streaks ---
  getStreak(): StreakData {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (saved) return { ...DEFAULT_STREAK, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_STREAK;
  },

  updateStreakForSession(log: SessionLog): StreakData {
    if (log.type !== 'focus') return this.getStreak();

    const streak = this.getStreak();
    const today = new Date(log.timestamp).toISOString().split('T')[0];
    const uniqueDates = new Set<string>(streak.historyDates || []);
    uniqueDates.add(today);
    const sortedDates: string[] = Array.from(uniqueDates).sort();

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = streak.longestStreak || 0;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Check consecutive days backwards
    let checkDate = new Date(todayDate);
    const todayIso = checkDate.toISOString().split('T')[0];

    // If active today or yesterday, continue streak calculation
    if (uniqueDates.has(todayIso)) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (uniqueDates.has(checkDate.toISOString().split('T')[0])) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      // Check if active yesterday
      const yesterday = new Date(todayDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayIso = yesterday.toISOString().split('T')[0];
      if (uniqueDates.has(yesterdayIso)) {
        currentStreak = 1;
        checkDate = new Date(yesterday);
        checkDate.setDate(checkDate.getDate() - 1);
        while (uniqueDates.has(checkDate.toISOString().split('T')[0])) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      } else {
        currentStreak = 0;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    const updatedStreak: StreakData = {
      currentStreak,
      longestStreak,
      lastCompletedDate: today,
      historyDates: sortedDates,
    };

    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updatedStreak));
    return updatedStreak;
  },

  // --- Detailed Analytics Engine ---
  computeAnalytics(timeframe: 'today' | '7days' | '30days' | 'all' = 'all'): DetailedAnalytics {
    const history = this.getHistory();
    const tasks = this.getTasks();
    const streak = this.getStreak();

    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];

    // Filter logs based on timeframe
    let filteredLogs = history.filter((l) => l.type === 'focus');
    if (timeframe === 'today') {
      filteredLogs = filteredLogs.filter((l) => l.dateString === todayIso);
    } else if (timeframe === '7days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffMs = cutoff.getTime();
      filteredLogs = filteredLogs.filter((l) => l.timestamp >= cutoffMs);
    } else if (timeframe === '30days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffMs = cutoff.getTime();
      filteredLogs = filteredLogs.filter((l) => l.timestamp >= cutoffMs);
    }

    // Totals
    const totalFocusMinutes = filteredLogs.reduce((sum, l) => sum + (l.durationMinutes || 25), 0);
    const totalSessions = filteredLogs.length;

    // Today specific stats
    const todayLogs = history.filter((l) => l.type === 'focus' && l.dateString === todayIso);
    const todayFocusMinutes = todayLogs.reduce((sum, l) => sum + (l.durationMinutes || 25), 0);
    const todaySessions = todayLogs.length;

    // 7-day total for quick reference
    const sevenDayCutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const weekFocusMinutes = history
      .filter((l) => l.type === 'focus' && l.timestamp >= sevenDayCutoff)
      .reduce((sum, l) => sum + (l.durationMinutes || 25), 0);

    // 30-day total
    const thirtyDayCutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const monthFocusMinutes = history
      .filter((l) => l.type === 'focus' && l.timestamp >= thirtyDayCutoff)
      .reduce((sum, l) => sum + (l.durationMinutes || 25), 0);

    const averageSessionDuration = totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;

    // Tasks metrics
    const tasksCompleted = tasks.filter((t) => t.isCompleted).length;
    const tasksPending = tasks.filter((t) => !t.isCompleted).length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;

    // Subject breakdown
    const subjectMap: { [key: string]: { color: string; minutes: number; sessions: number } } = {};
    filteredLogs.forEach((log) => {
      const sub = log.subject || 'General Study';
      const col = log.subjectColor || '#10b981';
      if (!subjectMap[sub]) {
        subjectMap[sub] = { color: col, minutes: 0, sessions: 0 };
      }
      subjectMap[sub].minutes += log.durationMinutes || 25;
      subjectMap[sub].sessions += 1;
    });

    const subjectDistribution = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      color: data.color,
      minutes: data.minutes,
      sessions: data.sessions,
      percentage: totalFocusMinutes > 0 ? Math.round((data.minutes / totalFocusMinutes) * 100) : 0,
    })).sort((a, b) => b.minutes - a.minutes);

    // Hourly Productivity Map (0 - 23)
    const hourlyMap: { [hour: number]: { minutes: number; count: number } } = {};
    for (let h = 0; h < 24; h++) {
      hourlyMap[h] = { minutes: 0, count: 0 };
    }
    filteredLogs.forEach((log) => {
      const h = typeof log.hourOfDay === 'number' ? log.hourOfDay : new Date(log.timestamp).getHours();
      if (hourlyMap[h]) {
        hourlyMap[h].minutes += log.durationMinutes || 25;
        hourlyMap[h].count += 1;
      }
    });

    const hourlyProductivity = Object.entries(hourlyMap).map(([h, data]) => ({
      hour: parseInt(h, 10),
      minutes: data.minutes,
      count: data.count,
    }));

    // Find peak hour
    let peakHourNum = 10;
    let maxHourMins = -1;
    hourlyProductivity.forEach((item) => {
      if (item.minutes > maxHourMins) {
        maxHourMins = item.minutes;
        peakHourNum = item.hour;
      }
    });
    const peakHourFormatted = maxHourMins > 0
      ? `${peakHourNum % 12 || 12}:00 ${peakHourNum >= 12 ? 'PM' : 'AM'}`
      : 'No peak yet';

    // Daily Trends (Last 7 or 14 days)
    const daysCount = timeframe === '30days' ? 14 : 7;
    const dailyTrends: { date: string; dayLabel: string; minutes: number; sessions: number }[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      const dayLogs = history.filter((l) => l.type === 'focus' && l.dateString === iso);
      const mins = dayLogs.reduce((sum, l) => sum + (l.durationMinutes || 25), 0);
      dailyTrends.push({
        date: iso,
        dayLabel,
        minutes: mins,
        sessions: dayLogs.length,
      });
    }

    return {
      totalFocusMinutes,
      totalSessions,
      todayFocusMinutes,
      todaySessions,
      weekFocusMinutes,
      monthFocusMinutes,
      averageSessionDuration,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      tasksCompleted,
      tasksPending,
      taskCompletionRate,
      subjectDistribution,
      hourlyProductivity,
      dailyTrends,
      peakProductiveHour: peakHourFormatted,
    };
  },

  // --- Poki Virtual Focus Companion ---
  getPoki(): PokiState {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POKI);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validSpecies: ('plant' | 'bird' | 'butterfly')[] = ['plant', 'bird', 'butterfly'];
        const species = validSpecies.includes(parsed.species) ? parsed.species : 'plant';
        return { ...DEFAULT_POKI, ...parsed, species };
      }
    } catch {
      // fallback
    }
    return DEFAULT_POKI;
  },

  savePoki(poki: PokiState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.POKI, JSON.stringify(poki));
    } catch (e) {
      console.error('Failed to save Poki', e);
    }
  },

  awardPokiProgress(xpGain: number, treatsGain: number = 0, focusSessionsIncrement: number = 0): PokiState {
    const poki = this.getPoki();
    const newXp = poki.xp + xpGain;
    const newTreats = poki.treats + treatsGain;
    const newSessions = poki.totalFocusSessionsPokiWitnessed + focusSessionsIncrement;

    // Calculate level (every 50 XP = 1 level)
    const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);

    // Evolution Stage:
    // 1: Egg (Lv 1)
    // 2: Baby Sprout (Lv 2-4)
    // 3: Apprentice Poki (Lv 5-9)
    // 4: Scholar Poki (Lv 10-19)
    // 5: Astral Sage Poki (Lv 20+)
    let newEvolution: PokiEvolutionStage = 1;
    if (newLevel >= 20) newEvolution = 5;
    else if (newLevel >= 10) newEvolution = 4;
    else if (newLevel >= 5) newEvolution = 3;
    else if (newLevel >= 2) newEvolution = 2;

    const newHappiness = Math.min(100, poki.happiness + Math.min(15, xpGain / 2));

    const updated: PokiState = {
      ...poki,
      xp: newXp,
      level: newLevel,
      evolution: newEvolution,
      treats: newTreats,
      totalFocusSessionsPokiWitnessed: newSessions,
      happiness: newHappiness,
    };

    this.savePoki(updated);
    return updated;
  },

  addPokiXp(xpGain: number, treatsGain: number = 0, focusSessionsIncrement: number = 0): PokiState {
    return this.awardPokiProgress(xpGain, treatsGain, focusSessionsIncrement);
  },

  feedPoki(): { success: boolean; poki: PokiState; message: string } {
    const poki = this.getPoki();
    if (poki.treats <= 0) {
      return { success: false, poki, message: 'No focus treats left! Complete study sessions to earn treats.' };
    }

    const updated: PokiState = {
      ...poki,
      treats: poki.treats - 1,
      happiness: Math.min(100, poki.happiness + 20),
      xp: poki.xp + 15,
      lastFedTimestamp: Date.now(),
    };
    // Recalculate level
    updated.level = Math.max(1, Math.floor(updated.xp / 50) + 1);
    if (updated.level >= 20) updated.evolution = 5;
    else if (updated.level >= 10) updated.evolution = 4;
    else if (updated.level >= 5) updated.evolution = 3;
    else if (updated.level >= 2) updated.evolution = 2;

    this.savePoki(updated);
    return { success: true, poki: updated, message: 'Poki munched the focus treat happily! (+15 XP, +20 Happiness)' };
  },

  // --- Reset All Data ---
  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK_ID);
    localStorage.removeItem(STORAGE_KEYS.POKI);

    openDatabase().then((db) => {
      const tx = db.transaction([STORE_LOGS, STORE_TASKS], 'readwrite');
      tx.objectStore(STORE_LOGS).clear();
      tx.objectStore(STORE_TASKS).clear();
    }).catch(() => {});
  },

  // --- Export JSON ---
  exportBackup(): string {
    const data = {
      app: 'PomoStudy Pro',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      settings: this.getSettings(),
      tasks: this.getTasks(),
      history: this.getHistory(),
      streak: this.getStreak(),
      activeTaskId: this.getActiveTaskId(),
      poki: this.getPoki(),
    };
    return JSON.stringify(data, null, 2);
  },

  // --- Import JSON ---
  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.profile) this.saveProfile(parsed.profile);
      if (Array.isArray(parsed.tasks)) this.saveTasks(parsed.tasks);
      if (Array.isArray(parsed.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
      }
      if (parsed.streak) {
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(parsed.streak));
      }
      if (parsed.activeTaskId !== undefined) {
        this.saveActiveTaskId(parsed.activeTaskId);
      }
      if (parsed.poki) {
        this.savePoki(parsed.poki);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  // --- Tour Guide Status ---
  hasSeenTour(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOUR_SEEN) === 'true';
    } catch {
      return false;
    }
  },

  setSeenTour(seen: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOUR_SEEN, seen ? 'true' : 'false');
    } catch {
      // ignore
    }
  },
};
