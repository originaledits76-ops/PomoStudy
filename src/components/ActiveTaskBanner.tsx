import React from 'react';
import { Pin, CheckCircle2, X, Plus, Target, ArrowRight, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, NavTab } from '../types';
import { sound } from '../utils/soundEngine';

interface ActiveTaskBannerProps {
  activeTask: Task | null;
  soundMuted: boolean;
  onClearActiveTask: () => void;
  onToggleCompleteTask: (taskId: string) => void;
  onIncrementPomodoro: (taskId: string) => void;
  onOpenTasks?: () => void;
}

export const ActiveTaskBanner: React.FC<ActiveTaskBannerProps> = ({
  activeTask,
  soundMuted,
  onClearActiveTask,
  onToggleCompleteTask,
  onIncrementPomodoro,
  onOpenTasks,
}) => {
  if (!activeTask) {
    return (
      <div className="w-full max-w-lg mx-auto my-2 px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-zinc-200/80 flex items-center justify-between gap-2 select-none transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs">
            📌
          </span>
          <p className="text-xs text-zinc-600 font-rounded truncate">
            <span className="text-zinc-900 font-bold">No active task pinned.</span> Link an assignment to focus.
          </p>
        </div>
        {onOpenTasks && (
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onOpenTasks();
            }}
            className="px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold font-rounded flex items-center gap-1 shrink-0 transition-all active:scale-95 shadow-2xs"
          >
            <span>Pin Task</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  const handleComplete = () => {
    if (!soundMuted) sound.playTaskComplete();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#18181b', '#52525b', '#a1a1aa'],
    });
    onToggleCompleteTask(activeTask.id);
  };

  return (
    <div className="w-full max-w-lg mx-auto my-2.5 p-3.5 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-zinc-200/90 shadow-2xs relative group select-none transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.2 rounded-full bg-zinc-950 text-white text-[10px] font-bold font-rounded uppercase tracking-wider shadow-2xs">
              <Pin className="w-2.5 h-2.5 fill-white/30" />
              Active Task
            </span>
            {activeTask.subject && (
              <span className="text-[10px] font-bold font-rounded px-2 py-0.2 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200/80">
                {activeTask.subject}
              </span>
            )}
          </div>

          <h3 className="text-xs sm:text-sm font-extrabold text-zinc-950 font-display truncate">
            {activeTask.title}
          </h3>

          {activeTask.notes && (
            <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1 font-rounded">
              {activeTask.notes}
            </p>
          )}

          {/* Pomodoro Progress Counter */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[11px] text-zinc-500 font-mono font-medium">
              Tomatoes:
            </span>
            {Array.from({ length: Math.min(8, Math.max(activeTask.estimatedPomodoros, activeTask.completedPomodoros)) }).map((_, i) => {
              const isFilled = i < activeTask.completedPomodoros;
              return (
                <span
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] transition-all ${
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
            <span className="text-[11px] font-mono font-bold text-zinc-700 ml-1">
              ({activeTask.completedPomodoros}/{activeTask.estimatedPomodoros})
            </span>
            <button
              onClick={() => {
                if (!soundMuted) sound.playClick();
                onIncrementPomodoro(activeTask.id);
              }}
              className="p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] ml-1 transition-all active:scale-90 border border-zinc-200/80"
              title="Add 1 completed tomato"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleComplete}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold font-rounded transition-all active:scale-95 shadow-2xs"
            title="Mark Active Task as Complete"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onClearActiveTask();
            }}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
            title="Unpin Task"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
