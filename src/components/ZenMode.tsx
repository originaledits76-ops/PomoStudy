import React, { useEffect, useState } from 'react';
import { Minimize2, Play, Pause, SkipForward, Wind, Waves, Activity, CloudRain, Pin } from 'lucide-react';
import { TimerMode, Task, AmbientSoundType } from '../types';
import { sound } from '../utils/soundEngine';

interface ZenModeProps {
  isOpen: boolean;
  mode: TimerMode;
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  cycleCount: number;
  activeTask: Task | null;
  soundMuted: boolean;
  onClose: () => void;
  onToggleTimer: () => void;
  onSkipTimer: () => void;
}

export const ZenMode: React.FC<ZenModeProps> = ({
  isOpen,
  mode,
  timeLeft,
  totalDuration,
  isRunning,
  cycleCount,
  activeTask,
  soundMuted,
  onClose,
  onToggleTimer,
  onSkipTimer,
}) => {
  const [activeAmbient, setActiveAmbient] = useState<AmbientSoundType | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.code === 'Space' && isOpen && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        onToggleTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onToggleTimer]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const modeLabels = {
    focus: 'Deep Focus Immersion',
    shortBreak: 'Mindful Short Break',
    longBreak: 'Extended Restoration',
  };

  const handleAmbient = (type: AmbientSoundType) => {
    if (activeAmbient === type) {
      sound.stopAmbient();
      setActiveAmbient(null);
    } else {
      sound.startAmbient(type, soundMuted ? 0 : 0.5);
      setActiveAmbient(type);
    }
  };

  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12 select-none font-rounded">
      {/* Top Controls */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 font-rounded">
            {modeLabels[mode]}
          </span>
        </div>

        <button
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onClose();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-bold transition-all active:scale-95 shadow-2xs"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Zen (Esc)</span>
        </button>
      </div>

      {/* Center Immersion Countdown */}
      <div className="w-full max-w-3xl mx-auto text-center my-auto flex flex-col items-center">
        {/* Active Task Badge */}
        {activeTask && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/90 text-zinc-900 text-xs sm:text-sm font-bold mb-6 shadow-2xs">
            <Pin className="w-3.5 h-3.5 text-zinc-700" />
            <span className="truncate max-w-xs sm:max-w-md">{activeTask.title}</span>
            <span className="text-zinc-500 font-mono">
              ({activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} 🍅)
            </span>
          </div>
        )}

        {/* Massive High-Contrast Time Display */}
        <div className="text-8xl sm:text-9xl md:text-[11rem] font-extrabold font-mono tracking-tighter text-zinc-950 leading-none">
          {formattedTime}
        </div>

        {/* Minimal Progress Line */}
        <div className="w-64 sm:w-80 h-2 bg-zinc-100 rounded-full mt-6 overflow-hidden border border-zinc-200/80">
          <div
            className="h-full bg-zinc-950 transition-all duration-700 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs font-bold text-zinc-500 mt-4 font-rounded">
          Session #{cycleCount} • Press <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 font-mono text-[10px]">Space</kbd> to {isRunning ? 'Pause' : 'Start'}
        </p>

        {/* Floating Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onToggleTimer();
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-white shadow-xl transition-transform active:scale-95"
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onSkipTimer();
            }}
            className="w-12 h-12 rounded-full bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
            title="Skip to next session"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Ambient Quick Switcher */}
      <div className="w-full max-w-md mx-auto bg-zinc-50/90 border border-zinc-200 rounded-full p-1.5 flex items-center justify-around text-xs shadow-2xs">
        <button
          onClick={() => handleAmbient('white')}
          className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-all active:scale-95 ${
            activeAmbient === 'white' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Wind className="w-3.5 h-3.5" /> White
        </button>
        <button
          onClick={() => handleAmbient('brown')}
          className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-all active:scale-95 ${
            activeAmbient === 'brown' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Waves className="w-3.5 h-3.5" /> Brown
        </button>
        <button
          onClick={() => handleAmbient('binaural')}
          className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-all active:scale-95 ${
            activeAmbient === 'binaural' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> 40Hz
        </button>
        <button
          onClick={() => handleAmbient('rain')}
          className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-all active:scale-95 ${
            activeAmbient === 'rain' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" /> Rain
        </button>
      </div>
    </div>
  );
};
