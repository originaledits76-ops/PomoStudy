import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Pin,
  Trash2,
  Edit3,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, PriorityLevel } from '../types';
import { sound } from '../utils/soundEngine';

interface TaskManagerProps {
  tasks: Task[];
  activeTaskId: string | null;
  soundMuted: boolean;
  onAddTask: (title: string, subject: string, estPomodoros: number, priority: PriorityLevel) => void;
  onOpenDetailedModal: (taskToEdit?: Task) => void;
  onToggleCompleteTask: (taskId: string) => void;
  onSetActiveTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  activeTaskId,
  soundMuted,
  onAddTask,
  onOpenDetailedModal,
  onToggleCompleteTask,
  onSetActiveTask,
  onDeleteTask,
  onToggleSubtask,
  onAddSubtask,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSubject, setQuickSubject] = useState('');
  const [quickEstPomo, setQuickEstPomo] = useState(3);
  const [quickPriority, setQuickPriority] = useState<PriorityLevel>('medium');

  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'pomo' | 'newest' | 'alphabetical'>('priority');
  const [expandedTasks, setExpandedTasks] = useState<{ [taskId: string]: boolean }>({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<{ [taskId: string]: string }>({});

  // Extract unique subjects
  const allSubjects = Array.from(
    new Set(tasks.map((t) => t.subject).filter((s) => Boolean(s?.trim())))
  );

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    if (!soundMuted) sound.playClick();
    onAddTask(
      quickTitle.trim(),
      quickSubject.trim() || 'General',
      quickEstPomo,
      quickPriority
    );
    setQuickTitle('');
    setQuickSubject('');
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleCompleteWithFX = (task: Task) => {
    if (!soundMuted) sound.playTaskComplete();
    if (!task.isCompleted) {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#18181b', '#71717a', '#a1a1aa'],
      });
    }
    onToggleCompleteTask(task.id);
  };

  const handleSubtaskSubmit = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = (newSubtaskInputs[taskId] || '').trim();
    if (!text) return;
    if (!soundMuted) sound.playClick();
    onAddSubtask(taskId, text);
    setNewSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  // Filter tasks
  let filtered = tasks.filter((t) => {
    if (filterTab === 'active' && t.isCompleted) return false;
    if (filterTab === 'completed' && !t.isCompleted) return false;
    if (selectedTag !== 'all' && t.subject !== selectedTag) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      const matchSub = t.subject?.toLowerCase().includes(q);
      return matchTitle || matchNotes || matchSub;
    }
    return true;
  });

  // Sort tasks
  filtered.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    if (sortBy === 'priority') {
      const pMap = { high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    }
    if (sortBy === 'pomo') {
      return b.estimatedPomodoros - a.estimatedPomodoros;
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const priorityBadges = {
    high: 'bg-zinc-950 text-white border-zinc-950 font-bold',
    medium: 'bg-zinc-100 text-zinc-800 border-zinc-300 font-semibold',
    low: 'bg-zinc-50 text-zinc-500 border-zinc-200 font-medium',
  };

  return (
    <section className="w-full max-w-4xl mx-auto space-y-6 select-none pb-24">
      {/* Top Header Card */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 font-display">
                  Study Planner & Checklists
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80 font-rounded">
                  Todo
                </span>
              </div>
              <p className="text-xs text-zinc-600 font-rounded font-medium">
                {tasks.filter((t) => !t.isCompleted).length} pending • {tasks.filter((t) => t.isCompleted).length} completed
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onOpenDetailedModal();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold font-rounded text-xs shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Detailed Task</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bar with liquid glass styling */}
      <form
        onSubmit={handleQuickSubmit}
        className="liquid-glass rounded-3xl p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center gap-2.5 shadow-2xs"
      >
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick add task (e.g. Read Chapter 4 & take Cornell notes)..."
          className="flex-1 min-w-[200px] bg-white/80 border border-zinc-200/90 rounded-full px-4 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 font-rounded focus:outline-none focus:border-zinc-950 focus:bg-white transition-all shadow-2xs"
        />

        <input
          type="text"
          value={quickSubject}
          onChange={(e) => setQuickSubject(e.target.value)}
          placeholder="Subject / Tag"
          className="w-28 sm:w-36 bg-white/80 border border-zinc-200/90 rounded-full px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 font-rounded focus:outline-none focus:border-zinc-950 focus:bg-white transition-all shadow-2xs"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value as PriorityLevel)}
            className="bg-white/80 border border-zinc-200/90 rounded-full px-3 py-2.5 text-xs font-bold font-rounded text-zinc-800 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="high">High Priority</option>
            <option value="medium">Med Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <div className="flex items-center gap-1 bg-white/80 border border-zinc-200/90 rounded-full px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs">🍅</span>
            <input
              type="number"
              min="1"
              max="20"
              value={quickEstPomo}
              onChange={(e) => setQuickEstPomo(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-8 bg-transparent text-xs text-zinc-900 text-center font-mono font-bold focus:outline-none"
              title="Estimated Pomodoros"
            />
          </div>

          <button
            type="submit"
            className="p-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center"
            title="Add Task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Filter Tabs, Search & Sorter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4.5">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 border border-zinc-200/90 rounded-full self-start shadow-2xs">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (!soundMuted) sound.playClick();
                setFilterTab(tab);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-rounded capitalize transition-all ${
                filterTab === tab
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Subject dropdown & Sort */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-white border border-zinc-200 rounded-full pl-8.5 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-rounded focus:outline-none focus:border-zinc-950 transition-all shadow-2xs"
            />
          </div>

          {/* Subject Filter */}
          {allSubjects.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-xs font-bold font-rounded text-zinc-800 focus:outline-none cursor-pointer max-w-[120px] truncate shadow-2xs"
              >
                <option value="all">All Subjects</option>
                {allSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-xs font-bold font-rounded text-zinc-800 focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="priority">Priority</option>
              <option value="pomo">Est. Pomodoros</option>
              <option value="newest">Newest</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards List (Zero Mock Data) */}
      <div className="space-y-3 min-h-[200px]">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-3xl bg-zinc-50 border border-dashed border-zinc-200/90 text-center flex flex-col items-center justify-center">
            <div className="w-11 h-11 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 mb-2.5">
              <Sparkles className="w-5 h-5 text-zinc-800" />
            </div>
            <h3 className="text-sm font-extrabold text-zinc-900 font-display mb-1">
              {tasks.length === 0 ? 'No study tasks added yet' : 'No tasks match your filters'}
            </h3>
            <p className="text-xs text-zinc-500 font-rounded max-w-sm">
              {tasks.length === 0
                ? 'Create your first study goal above to link sessions, track checklists, and log your progress.'
                : 'Try adjusting your search query or subject filters.'}
            </p>
          </div>
        ) : (
          filtered.map((task) => {
            const isPinned = activeTaskId === task.id;
            const isExpanded = Boolean(expandedTasks[task.id]);
            const subtasks = task.subtasks || [];
            const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-4.5 rounded-3xl border transition-all duration-200 ${
                  task.isCompleted
                    ? 'bg-zinc-50/70 border-zinc-200 opacity-60'
                    : isPinned
                    ? 'bg-white border-zinc-950 shadow-md ring-1 ring-zinc-950/10'
                    : 'bg-white hover:border-zinc-300 border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Complete Checkbox & Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleCompleteWithFX(task)}
                      className="mt-0.5 text-zinc-400 hover:text-zinc-950 transition-colors shrink-0"
                      title={task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-zinc-950 fill-zinc-950/10" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Tags & Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {task.subject && (
                          <span className="text-[10px] font-bold font-rounded px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {task.subject}
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase font-rounded tracking-wider px-2 py-0.5 rounded-full border ${
                            priorityBadges[task.priority] || priorityBadges.medium
                          }`}
                        >
                          {task.priority}
                        </span>
                        {isPinned && (
                          <span className="text-[10px] font-rounded px-2 py-0.5 rounded-full bg-zinc-950 text-white font-extrabold tracking-wider">
                            PINNED
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-sm sm:text-base font-extrabold font-display truncate ${
                          task.isCompleted ? 'line-through text-zinc-400' : 'text-zinc-950'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Notes preview */}
                      {task.notes && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 font-rounded">
                          {task.notes}
                        </p>
                      )}

                      {/* Pomodoros counter & Subtask progress summary */}
                      <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-500 font-mono">
                        <span className="flex items-center gap-1 font-bold">
                          <span>🍅 {task.completedPomodoros}/{task.estimatedPomodoros}</span>
                        </span>
                        {subtasks.length > 0 && (
                          <button
                            onClick={() => toggleTaskExpansion(task.id)}
                            className="text-[11px] text-zinc-800 hover:text-zinc-950 font-bold font-rounded underline flex items-center gap-1"
                          >
                            <span>Checklist ({completedSubtasksCount}/{subtasks.length})</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Icons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        if (!soundMuted) sound.playClick();
                        onSetActiveTask(task.id);
                      }}
                      className={`p-2 rounded-full border transition-all active:scale-95 ${
                        isPinned
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 border-transparent'
                      }`}
                      title={isPinned ? 'Unpin Task' : 'Pin to Active Focus Timer'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (!soundMuted) sound.playClick();
                        onOpenDetailedModal(task);
                      }}
                      className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors active:scale-95"
                      title="Edit Task Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (!soundMuted) sound.playClick();
                        onDeleteTask(task.id);
                      }}
                      className="p-2 rounded-full hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors active:scale-95"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expandable Subtasks Checklist Section */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-zinc-200 space-y-2">
                    <div className="space-y-1.5">
                      {subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-2.5 text-xs py-1.5 px-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 font-rounded"
                        >
                          <button
                            onClick={() => {
                              if (!soundMuted) sound.playClick();
                              onToggleSubtask(task.id, sub.id);
                            }}
                            className="text-zinc-400 hover:text-zinc-950 transition-colors"
                          >
                            {sub.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={`flex-1 font-medium ${
                              sub.completed ? 'line-through text-zinc-400' : 'text-zinc-800'
                            }`}
                          >
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add subtask inline */}
                    <form
                      onSubmit={(e) => handleSubtaskSubmit(task.id, e)}
                      className="flex items-center gap-2 mt-2"
                    >
                      <input
                        type="text"
                        value={newSubtaskInputs[task.id] || ''}
                        onChange={(e) =>
                          setNewSubtaskInputs({ ...newSubtaskInputs, [task.id]: e.target.value })
                        }
                        placeholder="Add a subtask step..."
                        className="flex-1 bg-white border border-zinc-200 rounded-full px-3.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-rounded focus:outline-none focus:border-zinc-950"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold font-rounded"
                      >
                        Add Step
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
