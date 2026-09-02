import React from 'react';
import { Pin, CheckCircle2, X, Plus, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';
import { sound } from '../utils/soundEngine';

interface ActiveTaskBannerProps {
  activeTask: Task | null;
  soundMuted: boolean;
  onClearActiveTask: () => void;
  onToggleCompleteTask: (taskId: string) => void;
  onIncrementPomodoro: (taskId: string) => void;
}

export const ActiveTaskBanner: React.FC<ActiveTaskBannerProps> = ({
  activeTask,
  soundMuted,
  onClearActiveTask,
  onToggleCompleteTask,
  onIncrementPomodoro,
}) => {
  if (!activeTask) {
    return (
      <div className="w-full max-w-xl mx-auto my-3.5 px-4 py-3 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200/90 text-center select-none transition-all">
        <p className="text-xs text-zinc-500 font-rounded">
          <span className="text-zinc-800 font-bold">No active task pinned.</span> Click the pin icon on any task below to link your study focus directly.
        </p>
      </div>
    );
  }

  const handleComplete = () => {
    if (!soundMuted) sound.playTaskComplete();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#18181b', '#71717a', '#a1a1aa'],
    });
    onToggleCompleteTask(activeTask.id);
  };

  return (
    <div className="w-full max-w-xl mx-auto my-3.5 p-4 sm:p-4.5 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs relative group select-none transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-950 text-white text-[10px] font-bold font-rounded uppercase tracking-wider">
              <Pin className="w-3 h-3 fill-white/20" />
              Active Objective
            </span>
            {activeTask.subject && (
              <span className="text-[11px] font-bold font-rounded px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80">
                {activeTask.subject}
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-zinc-950 font-display truncate">
            {activeTask.title}
          </h3>

          {activeTask.notes && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-1 font-rounded">
              {activeTask.notes}
            </p>
          )}

          {/* Pomodoro Progress Counter */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <span className="text-xs text-zinc-500 font-mono font-medium mr-1">
              Progress:
            </span>
            {Array.from({ length: Math.max(activeTask.estimatedPomodoros, activeTask.completedPomodoros) }).map((_, i) => {
              const isFilled = i < activeTask.completedPomodoros;
              return (
                <span
                  key={i}
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-all ${
                    isFilled
                      ? 'bg-zinc-950 text-white shadow-2xs scale-105'
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                  }`}
                  title={`Pomodoro ${i + 1}`}
                >
                  🍅
                </span>
              );
            })}
            <span className="text-xs font-mono font-bold text-zinc-600 ml-1.5">
              ({activeTask.completedPomodoros}/{activeTask.estimatedPomodoros})
            </span>
            <button
              onClick={() => {
                if (!soundMuted) sound.playClick();
                onIncrementPomodoro(activeTask.id);
              }}
              className="p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] ml-1 transition-all active:scale-90"
              title="Add 1 completed Pomodoro"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleComplete}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold font-rounded transition-all active:scale-95 shadow-2xs"
            title="Mark Active Task as Complete"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete</span>
          </button>
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onClearActiveTask();
            }}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
            title="Unpin Task"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
