import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  TimerMode,
  Task,
  AppSettings,
  UserProfile,
  StreakData,
  PriorityLevel,
  SessionLog,
  NavTab,
  PokiState,
} from './types';
import { StorageService } from './utils/storage';
import { sound } from './utils/soundEngine';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TimerSection } from './components/TimerSection';
import { ActiveTaskBanner } from './components/ActiveTaskBanner';
import { AmbientSoundbar } from './components/AmbientSoundbar';
import { TaskManager } from './components/TaskManager';
import { AnalyticsView } from './components/AnalyticsView';
import { PokiView } from './components/PokiView';
import { SettingsView } from './components/SettingsView';
import { ZenMode } from './components/ZenMode';
import { TaskModal } from './components/TaskModal';
import { OnboardingFlow } from './components/OnboardingFlow';

export const App: React.FC = () => {
  // --- Navigation Tab State ---
  const [currentTab, setCurrentTab] = useState<NavTab>('timer');

  // --- Persistent States ---
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => StorageService.getActiveTaskId());
  const [streak, setStreak] = useState<StreakData>(() => StorageService.getStreak());
  const [poki, setPoki] = useState<PokiState>(() => StorageService.getPoki());

  // --- Onboarding Flow Control ---
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(() => {
    const p = StorageService.getProfile();
    return !p.hasCompletedOnboarding;
  });

  // --- Timer States ---
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(() => (StorageService.getSettings().focusTime || 25) * 60);
  const [totalDuration, setTotalDuration] = useState<number>(() => (StorageService.getSettings().focusTime || 25) * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(1);

  // --- Sound & Modal States ---
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [isZenOpen, setIsZenOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Ref to track accurate time intervals
  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Active task derived
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  // Sync document title with timer countdown
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeName = mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Break' : 'Long Break';
    document.title = `${formatted} • ${modeName} | PomoStudy`;
  }, [timeLeft, mode]);

  // Sync settings duration change when not running
  const updateTimerForMode = (targetMode: TimerMode, customSettings = settings) => {
    let durationMins = customSettings.focusTime;
    if (targetMode === 'shortBreak') durationMins = customSettings.shortBreakTime;
    if (targetMode === 'longBreak') durationMins = customSettings.longBreakTime;

    const seconds = durationMins * 60;
    setMode(targetMode);
    setTimeLeft(seconds);
    setTotalDuration(seconds);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Timer Tick Engine
  useEffect(() => {
    if (isRunning) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      timerRef.current = window.setInterval(() => {
        if (!endTimeRef.current) return;
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);

        // Optional clock tick sound
        if (settings.tickingSoundEnabled && mode === 'focus' && !soundMuted) {
          sound.playTick(settings.tickingVolume);
        }

        if (remaining <= 0) {
          handleSessionComplete();
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, mode, settings, soundMuted]);

  // Handle Session Completion
  const handleSessionComplete = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);

    const now = new Date();

    // Play Alert Sound
    if (!soundMuted && settings.soundAlertEnabled) {
      sound.playAlert(settings.soundAlertTone, settings.soundVolume);
    }

    // Trigger Desktop Notification
    if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      const title = mode === 'focus' ? '🎉 Focus Session Completed!' : '☕ Break Finished!';
      const body = mode === 'focus' ? 'Great focus work! Take a refreshing break.' : 'Ready to begin the next focus block?';
      new Notification(title, { body });
    }

    if (mode === 'focus') {
      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#18181b', '#52525b', '#71717a', '#a1a1aa'],
      });

      const sessionDurationMins = Math.round(totalDuration / 60) || settings.focusTime;

      // Log Focus Session
      const newLog: SessionLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'focus',
        durationMinutes: sessionDurationMins,
        completedAt: now.toISOString(),
        timestamp: now.getTime(),
        taskId: activeTask ? activeTask.id : null,
        taskTitle: activeTask ? activeTask.title : null,
        subject: activeTask ? activeTask.subject : (profile.primarySubject || 'General'),
        subjectColor: activeTask ? activeTask.subjectColor : '#18181b',
        hourOfDay: now.getHours(),
        dayOfWeek: now.getDay(),
        dateString: now.toISOString().split('T')[0],
      };

      StorageService.addSessionLog(newLog);
      const updatedStreak = StorageService.getStreak();
      setStreak(updatedStreak);

      // Award XP & Treats to Poki Companion!
      const updatedPoki = StorageService.addPokiXp(60, 15);
      setPoki(updatedPoki);

      // Increment active task pomodoro
      if (activeTaskId) {
        const updatedTasks = tasks.map((t) => {
          if (t.id === activeTaskId) {
            return {
              ...t,
              completedPomodoros: t.completedPomodoros + 1,
            };
          }
          return t;
        });
        setTasks(updatedTasks);
        StorageService.saveTasks(updatedTasks);
      }

      // Determine next break mode (Short or Long)
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);

      const isLongBreak = (cycleCount % settings.longBreakInterval) === 0;
      const nextMode: TimerMode = isLongBreak ? 'longBreak' : 'shortBreak';

      updateTimerForMode(nextMode);

      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1200);
      }
    } else {
      // Break completed -> switch to Focus
      updateTimerForMode('focus');
      if (settings.autoStartFocus) {
        setTimeout(() => setIsRunning(true), 1200);
      }
    }
  };

  // --- Timer Controls ---
  const handleToggleTimer = () => {
    if (!soundMuted) sound.playClick();
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    if (!soundMuted) sound.playClick();
    setIsRunning(false);
    updateTimerForMode(mode);
  };

  const handleSkipTimer = () => {
    if (!soundMuted) sound.playClick();
    if (mode === 'focus') {
      const isLong = (cycleCount % settings.longBreakInterval) === 0;
      updateTimerForMode(isLong ? 'longBreak' : 'shortBreak');
    } else {
      updateTimerForMode('focus');
    }
  };

  const handleAdjustTime = (deltaSeconds: number) => {
    setTimeLeft((prev) => {
      const next = Math.max(60, prev + deltaSeconds);
      setTotalDuration((td) => Math.max(60, td + deltaSeconds));
      return next;
    });
  };

  // --- Task Management Handlers ---
  const handleAddTask = (
    title: string,
    subject: string,
    estPomodoros: number,
    priority: PriorityLevel
  ) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      notes: '',
      subject,
      subjectColor: '#18181b',
      priority,
      estimatedPomodoros: estPomodoros,
      completedPomodoros: 0,
      isCompleted: false,
      isActive: tasks.length === 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      subtasks: [],
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    StorageService.saveTasks(updated);

    if (tasks.length === 0) {
      setActiveTaskId(newTask.id);
      StorageService.saveActiveTaskId(newTask.id);
    }
  };

  const handleSaveDetailedTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      const updated = tasks.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t));
      setTasks(updated);
      StorageService.saveTasks(updated);
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: taskData.title || 'Untitled Task',
        notes: taskData.notes || '',
        subject: taskData.subject || 'General',
        subjectColor: taskData.subjectColor || '#18181b',
        priority: taskData.priority || 'medium',
        estimatedPomodoros: taskData.estimatedPomodoros || 4,
        completedPomodoros: 0,
        isCompleted: false,
        isActive: tasks.length === 0,
        createdAt: new Date().toISOString(),
        completedAt: null,
        subtasks: taskData.subtasks || [],
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      StorageService.saveTasks(updated);

      if (tasks.length === 0) {
        setActiveTaskId(newTask.id);
        StorageService.saveActiveTaskId(newTask.id);
      }
    }
  };

  const handleToggleCompleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    const willBeCompleted = target ? !target.isCompleted : false;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : null,
        };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveTasks(updated);

    if (activeTaskId === taskId && updated.find((t) => t.id === taskId)?.isCompleted) {
      setActiveTaskId(null);
      StorageService.saveActiveTaskId(null);
    }

    if (willBeCompleted) {
      // Award XP to Poki
      const updatedPoki = StorageService.addPokiXp(25, 8);
      setPoki(updatedPoki);
    }
  };

  const handleSetActiveTask = (taskId: string) => {
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
      StorageService.saveActiveTaskId(null);
    } else {
      setActiveTaskId(taskId);
      StorageService.saveActiveTaskId(taskId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    StorageService.saveTasks(updated);
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
      StorageService.saveActiveTaskId(null);
    }
  };

  const handleIncrementPomodoro = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completedPomodoros: t.completedPomodoros + 1 };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextSubtasks = (t.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        return { ...t, subtasks: nextSubtasks };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleAddSubtask = (taskId: string, subtaskTitle: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const newSubtask = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
          title: subtaskTitle,
          isCompleted: false,
        };
        return {
          ...t,
          subtasks: [...(t.subtasks || []), newSubtask],
        };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  // --- Settings & Profile Save Handlers ---
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    if (!isRunning) {
      updateTimerForMode(mode, newSettings);
    }
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
  };

  const handleResetAllData = () => {
    StorageService.resetAllData();
    setTasks([]);
    setActiveTaskId(null);
    setStreak(StorageService.getStreak());
    const defaultP = StorageService.getProfile();
    setProfile(defaultP);
    setSettings(StorageService.getSettings());
    setPoki(StorageService.getPoki());
    updateTimerForMode('focus', StorageService.getSettings());
    setCurrentTab('timer');
    setIsOnboardingActive(true);
  };

  // Onboarding Complete Handler
  const handleCompleteOnboarding = (newProfile: UserProfile, newSettings: AppSettings) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    updateTimerForMode('focus', newSettings);
    setIsOnboardingActive(false);
  };

  // If user has not completed onboarding, render the full-screen onboarding experience
  if (isOnboardingActive) {
    return (
      <OnboardingFlow
        initialProfile={profile}
        initialSettings={settings}
        soundMuted={soundMuted}
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-950 selection:text-white relative">
      {/* Header with Liquid Glass & Tab Actions */}
      <Header
        profile={profile}
        streak={streak}
        poki={poki}
        soundMuted={soundMuted}
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onToggleMute={() => setSoundMuted(!soundMuted)}
        onOpenZen={() => setIsZenOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
        {/* 1. TIMER TAB */}
        {currentTab === 'timer' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Timer Section */}
            <TimerSection
              mode={mode}
              timeLeft={timeLeft}
              totalDuration={totalDuration}
              isRunning={isRunning}
              cycleCount={cycleCount}
              settings={settings}
              soundMuted={soundMuted}
              onSetMode={(m) => updateTimerForMode(m)}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onSkipTimer={handleSkipTimer}
              onAdjustTime={handleAdjustTime}
            />

            {/* Active Pinned Task Banner */}
            <ActiveTaskBanner
              activeTask={activeTask}
              soundMuted={soundMuted}
              onClearActiveTask={() => handleSetActiveTask(activeTaskId || '')}
              onToggleCompleteTask={handleToggleCompleteTask}
              onIncrementPomodoro={handleIncrementPomodoro}
            />

            {/* Ambient Web Audio Soundscape */}
            <AmbientSoundbar soundMuted={soundMuted} />
          </div>
        )}

        {/* 2. TASKS / TODO TAB */}
        {currentTab === 'tasks' && (
          <div className="animate-in fade-in duration-200">
            <TaskManager
              tasks={tasks}
              activeTaskId={activeTaskId}
              soundMuted={soundMuted}
              onAddTask={handleAddTask}
              onOpenDetailedModal={(task) => {
                setTaskToEdit(task || null);
                setIsTaskModalOpen(true);
              }}
              onToggleCompleteTask={handleToggleCompleteTask}
              onSetActiveTask={handleSetActiveTask}
              onDeleteTask={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtask={handleAddSubtask}
            />
          </div>
        )}

        {/* 3. ANALYTICS TAB */}
        {currentTab === 'analytics' && (
          <div className="animate-in fade-in duration-200">
            <AnalyticsView
              profile={profile}
              soundMuted={soundMuted}
              onRefreshData={() => {
                setTasks(StorageService.getTasks());
                setStreak(StorageService.getStreak());
              }}
            />
          </div>
        )}

        {/* 4. POKI COMPANION TAB */}
        {currentTab === 'poki' && (
          <div className="animate-in fade-in duration-200">
            <PokiView
              poki={poki}
              soundMuted={soundMuted}
              totalFocusMinutes={StorageService.computeAnalytics().totalFocusMinutes}
              streakDays={streak.currentStreak}
              onUpdatePoki={(updated) => {
                setPoki(updated);
                StorageService.savePoki(updated);
              }}
            />
          </div>
        )}

        {/* 5. SETTINGS TAB */}
        {currentTab === 'settings' && (
          <div className="animate-in fade-in duration-200">
            <SettingsView
              settings={settings}
              profile={profile}
              soundMuted={soundMuted}
              onSaveSettings={handleSaveSettings}
              onSaveProfile={handleSaveProfile}
              onResetAllData={handleResetAllData}
              onReopenOnboarding={() => setIsOnboardingActive(true)}
            />
          </div>
        )}
      </main>

      {/* Modern 5-Tab Bottom Navigation with Liquid Glass Aesthetic */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        soundMuted={soundMuted}
        taskBadgeCount={pendingTasksCount}
        pokiBadgeLevel={poki.level}
      />

      {/* MODALS */}
      {/* 1. Zen Fullscreen Mode */}
      <ZenMode
        isOpen={isZenOpen}
        mode={mode}
        timeLeft={timeLeft}
        totalDuration={totalDuration}
        isRunning={isRunning}
        cycleCount={cycleCount}
        activeTask={activeTask}
        soundMuted={soundMuted}
        onClose={() => setIsZenOpen(false)}
        onToggleTimer={handleToggleTimer}
        onSkipTimer={handleSkipTimer}
      />

      {/* 2. Detailed Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        taskToEdit={taskToEdit}
        soundMuted={soundMuted}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSaveTask={handleSaveDetailedTask}
      />
    </div>
  );
};

export default App;
