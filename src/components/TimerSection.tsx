import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, Minus, Coffee, Brain, Sparkles } from 'lucide-react';
import { TimerMode, AppSettings } from '../types';
import { sound } from '../utils/soundEngine';

interface TimerSectionProps {
  mode: TimerMode;
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
  cycleCount: number;
  settings: AppSettings;
  soundMuted: boolean;
  onSetMode: (mode: TimerMode) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
}

export const TimerSection: React.FC<TimerSectionProps> = ({
  mode,
  timeLeft,
  totalDuration,
  isRunning,
  cycleCount,
  settings,
  soundMuted,
  onSetMode,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onAdjustTime,
}) => {
  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Keyboard shortcut listener for spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        onToggleTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleTimer]);

  // Calculate Progress Ring (circumference = 2 * PI * r)
  const radius = 138;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Minimalist mode configuration
  const modeConfig = {
    focus: {
      label: 'Deep Focus',
      shortLabel: 'Focus',
      icon: <Brain className="w-4 h-4" />,
      tag: 'FOCUS',
    },
    shortBreak: {
      label: 'Short Break',
      shortLabel: 'Short Break',
      icon: <Coffee className="w-4 h-4" />,
      tag: 'REST',
    },
    longBreak: {
      label: 'Long Rest',
      shortLabel: 'Long Rest',
      icon: <Sparkles className="w-4 h-4" />,
      tag: 'RECHARGE',
    },
  };

  const currentConfig = modeConfig[mode];
  const currentIntervalIndex = ((cycleCount - 1) % settings.longBreakInterval) + 1;

  return (
    <section className="w-full max-w-xl mx-auto flex flex-col items-center select-none pt-4 sm:pt-6 pb-2">
      {/* Mode Switcher Tabs with Rounded Pills */}
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-zinc-100 border border-zinc-200/90 mb-5 sm:mb-6 shadow-2xs">
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => {
          const isActive = mode === m;
          const conf = modeConfig[m];
          return (
            <button
              key={m}
              onClick={() => {
                if (!soundMuted) sound.playClick();
                onSetMode(m);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold font-rounded transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                {conf.icon}
              </span>
              <span>{conf.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Circular Progress Ring & Timer Display */}
      <div className="relative flex items-center justify-center my-1">
        <svg className="w-72 h-72 sm:w-84 sm:h-84 -rotate-90 transform drop-shadow-xs" viewBox="0 0 320 320">
          {/* Background Track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="#f4f4f5"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Dynamic Progress Fill - Crisp Monochrome Stroke */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="#18181b"
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="timer-progress-ring"
          />
        </svg>

        {/* Center Digital Clock & Session Metadata */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[11px] font-bold font-rounded uppercase tracking-widest text-zinc-500 mb-1 px-2.5 py-0.5 rounded-full bg-zinc-100/90 border border-zinc-200/60">
            {currentConfig.label}
          </span>

          <div className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tighter text-zinc-950 my-1">
            {formattedTime}
          </div>

          {/* Session Progress Dots */}
          <div className="mt-2 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: settings.longBreakInterval }).map((_, idx) => {
                const isCompleted = idx < currentIntervalIndex;
                const isCurrent = idx === currentIntervalIndex - 1;
                return (
                  <span
                    key={idx}
                    className={`transition-all duration-300 rounded-full ${
                      isCurrent && isRunning
                        ? 'w-4 h-2 bg-zinc-950 animate-pulse'
                        : isCompleted
                        ? 'w-2 h-2 bg-zinc-900'
                        : 'w-2 h-2 bg-zinc-200'
                    }`}
                    title={`Interval ${idx + 1} of ${settings.longBreakInterval}`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-semibold text-zinc-500 font-rounded">
              Session {currentIntervalIndex} of {settings.longBreakInterval} • Total #{cycleCount}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Minute Nudge Pill Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 my-4">
        <button
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onAdjustTime(-300);
          }}
          className="px-3 py-1 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 text-xs font-mono font-bold transition-all active:scale-95 shadow-2xs flex items-center gap-0.5"
          title="Subtract 5 Minutes"
        >
          <Minus className="w-3 h-3" />5m
        </button>
        <button
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onAdjustTime(-60);
          }}
          className="px-3 py-1 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 text-xs font-mono font-bold transition-all active:scale-95 shadow-2xs flex items-center gap-0.5"
          title="Subtract 1 Minute"
        >
          <Minus className="w-3 h-3" />1m
        </button>
        <button
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onAdjustTime(60);
          }}
          className="px-3 py-1 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 text-xs font-mono font-bold transition-all active:scale-95 shadow-2xs flex items-center gap-0.5"
          title="Add 1 Minute"
        >
          <Plus className="w-3 h-3" />1m
        </button>
        <button
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onAdjustTime(300);
          }}
          className="px-3 py-1 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 text-xs font-mono font-bold transition-all active:scale-95 shadow-2xs flex items-center gap-0.5"
          title="Add 5 Minutes"
        >
          <Plus className="w-3 h-3" />5m
        </button>
      </div>

      {/* Main Play / Pause / Reset Controls with tactile rounded styling */}
      <div className="flex items-center gap-3.5 mt-1">
        <button
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onResetTimer();
          }}
          className="p-3.5 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all active:scale-90 shadow-2xs"
          title="Reset Current Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onToggleTimer();
          }}
          className="px-8 sm:px-10 py-4 rounded-full font-extrabold font-rounded text-base flex items-center gap-2.5 bg-zinc-950 hover:bg-zinc-800 text-white shadow-md transition-all duration-200 active:scale-95"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white ml-0.5" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onSkipTimer();
          }}
          className="p-3.5 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all active:scale-90 shadow-2xs"
          title="Skip to Next Session"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-3">
        <span className="text-[10px] text-zinc-600 font-medium font-rounded">
          Press <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 font-mono text-[10px]">Space</kbd> to toggle timer
        </span>
      </div>
    </section>
  );
};
