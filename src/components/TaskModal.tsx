import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, BookOpen, CheckCircle2 } from 'lucide-react';
import { Task, PriorityLevel, Subtask } from '../types';
import { sound } from '../utils/soundEngine';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: Task | null;
  soundMuted: boolean;
  onClose: () => void;
  onSaveTask: (task: Partial<Task>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  taskToEdit,
  soundMuted,
  onClose,
  onSaveTask,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(4);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setNotes(taskToEdit.notes || '');
      setSubject(taskToEdit.subject || '');
      setPriority(taskToEdit.priority || 'medium');
      setEstimatedPomodoros(taskToEdit.estimatedPomodoros || 4);
      setSubtasks(taskToEdit.subtasks ? [...taskToEdit.subtasks] : []);
    } else {
      setTitle('');
      setNotes('');
      setSubject('');
      setPriority('medium');
      setEstimatedPomodoros(4);
      setSubtasks([]);
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    if (!soundMuted) sound.playClick();
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!soundMuted) sound.playClick();

    onSaveTask({
      id: taskToEdit?.id,
      title: title.trim(),
      notes: notes.trim(),
      subject: subject.trim() || 'General',
      priority,
      estimatedPomodoros,
      subtasks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-950 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-950 font-display">
              {taskToEdit ? 'Edit Study Task' : 'Create New Study Task'}
            </h2>
          </div>
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm bg-white">
          {/* Title */}
          <div>
            <label className="block text-zinc-700 text-xs mb-1 font-bold uppercase tracking-wider">
              Task Title <span className="text-zinc-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4 Thermodynamics Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-zinc-950 placeholder-zinc-400 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-zinc-700 text-xs mb-1 font-bold uppercase tracking-wider">
              Notes & Objective
            </label>
            <textarea
              rows={2}
              placeholder="Key formulas to memorize, practice problems 10-25..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-zinc-950 placeholder-zinc-400 outline-none resize-none"
            />
          </div>

          {/* Subject & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 text-xs mb-1 font-bold uppercase tracking-wider">
                Subject / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Physics, Math, CS"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-zinc-950 placeholder-zinc-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-700 text-xs mb-1 font-bold uppercase tracking-wider">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-zinc-950 outline-none cursor-pointer"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Estimated Pomodoros */}
          <div>
            <label className="block text-zinc-700 text-xs mb-1 font-bold uppercase tracking-wider">
              Est. Pomodoro Sessions (🍅)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={estimatedPomodoros}
              onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full max-w-[160px] bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-zinc-950 font-mono text-center font-bold outline-none"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="pt-2 border-t border-zinc-200 space-y-2">
            <label className="block text-zinc-800 text-xs font-bold uppercase tracking-wider">
              Checklist Steps
            </label>

            {subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs"
              >
                <span className={sub.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                  {sub.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(sub.id)}
                  className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask step..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold"
              >
                Add Step
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!soundMuted) sound.playClick();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-2xs"
            >
              {taskToEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
